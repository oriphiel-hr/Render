function baseUrl() {
  return (process.env.UMAMI_BASE_URL || '').trim().replace(/\/$/, '');
}

function websiteId() {
  return process.env.UMAMI_WEBSITE_ID?.trim() || '';
}

function unwrapEnv(value) {
  const raw = (value || '').trim();
  if (!raw) return '';
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

function staticToken() {
  return unwrapEnv(process.env.UMAMI_API_TOKEN);
}

function loginCredentials() {
  const username = unwrapEnv(process.env.UMAMI_USERNAME);
  const password = unwrapEnv(process.env.UMAMI_PASSWORD);
  if (!username || !password) return null;
  return { username, password };
}

function shareUrl() {
  return process.env.UMAMI_SHARE_URL?.trim() || '';
}

function siteLabel() {
  return process.env.UMAMI_SITE_LABEL?.trim() || 'ravnopar.com';
}

/** @type {{ token: string, expiresAt: number } | null} */
let cachedLogin = null;

function num(value) {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return num(value.value);
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function rangeMs(days) {
  const end = Date.now();
  const start = startOfDay(new Date(end - (days - 1) * 24 * 60 * 60 * 1000)).getTime();
  return { startAt: start, endAt: end };
}

function todayMs() {
  return { startAt: startOfDay().getTime(), endAt: Date.now() };
}

async function loginToUmami() {
  const root = baseUrl();
  const creds = loginCredentials();
  if (!root || !creds) return null;

  const res = await fetch(`${root}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(creds)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Umami login ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  if (!data?.token) {
    throw new Error('Umami login: nema tokena u odgovoru');
  }

  cachedLogin = {
    token: data.token,
    expiresAt: Date.now() + 55 * 60 * 1000
  };
  return cachedLogin.token;
}

async function resolveToken(forceRefresh = false) {
  const tokenFromEnv = staticToken();
  const creds = loginCredentials();

  if (creds) {
    if (
      !forceRefresh &&
      cachedLogin?.token &&
      cachedLogin.expiresAt > Date.now()
    ) {
      return cachedLogin.token;
    }
    return loginToUmami();
  }

  return tokenFromEnv || null;
}

async function umamiGet(path, query = {}, tokenOverride = null) {
  const root = baseUrl();
  let token = tokenOverride || (await resolveToken());
  if (!root || !token) return null;

  const url = new URL(`${root}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value != null) url.searchParams.set(key, String(value));
  }

  let res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });

  if (res.status === 401 && loginCredentials() && !tokenOverride) {
    token = await resolveToken(true);
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
  }

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Umami API ${res.status}: ${text.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

async function umamiMetrics(id, range, dimension, limit) {
  try {
    return await umamiGet(`/api/websites/${id}/metrics/expanded`, {
      ...range,
      type: dimension,
      limit
    });
  } catch (err) {
    if (dimension === 'path' && err.status === 400) {
      return umamiGet(`/api/websites/${id}/metrics/expanded`, {
        ...range,
        type: 'url',
        limit
      });
    }
    throw err;
  }
}

function bounceRate(stats) {
  const visits = num(stats?.visits);
  const bounces = num(stats?.bounces);
  if (visits == null || visits <= 0 || bounces == null) return null;
  return (bounces / visits) * 100;
}

function avgDuration(stats) {
  const visits = num(stats?.visits);
  const total = num(stats?.totaltime);
  if (visits == null || visits <= 0 || total == null) return null;
  return total / visits;
}

function mapBreakdownRows(rows, limit = 10) {
  const list = Array.isArray(rows) ? rows : [];
  return list.slice(0, limit).map((row) => {
    const raw = row.name ?? row.x ?? '';
    const name = raw || '(direct)';
    const visitors = num(row.visitors) ?? num(row.z) ?? num(row.y) ?? 0;
    const pageviews = num(row.pageviews) ?? visitors;
    return { name, visitors, pageviews };
  });
}

const CONVERSION_EVENTS = ['signup_started', 'signup_completed', 'donate_click', 'plan_view'];

function sortConversionEvents(rows) {
  const list = mapBreakdownRows(rows, 20);
  return [...list].sort((a, b) => {
    const ai = CONVERSION_EVENTS.indexOf(a.name);
    const bi = CONVERSION_EVENTS.indexOf(b.name);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return b.visitors - a.visitors;
  });
}

async function umamiActive(id) {
  try {
    const data = await umamiGet(`/api/websites/${id}/active`);
    return num(data?.visitors);
  } catch {
    return null;
  }
}

export async function getUmamiAdminSummary() {
  const root = baseUrl();
  const id = websiteId();
  const share = shareUrl();
  const label = siteLabel();
  const externalUrl = share || (root ? `${root}/websites/${id}` : null);
  const hasAuth = Boolean(staticToken() || loginCredentials());

  if (!root || !id || (!hasAuth && !share)) {
    return {
      configured: false,
      siteId: label,
      summary: null,
      shareUrl: null,
      externalUrl: root || null
    };
  }

  let summary = null;
  let error = null;

  if (hasAuth && id) {
    try {
      const today = todayMs();
      const last7d = rangeMs(7);
      const last30d = rangeMs(30);

      const [
        statsToday,
        stats7d,
        stats30d,
        activeNow,
        topPages,
        topSources,
        topCountries,
        topCities,
        topDevices,
        topLanguages,
        topEvents
      ] = await Promise.all([
        umamiGet(`/api/websites/${id}/stats`, today),
        umamiGet(`/api/websites/${id}/stats`, last7d),
        umamiGet(`/api/websites/${id}/stats`, last30d),
        umamiActive(id),
        umamiMetrics(id, last7d, 'path', 10),
        umamiMetrics(id, last7d, 'referrer', 8),
        umamiMetrics(id, last7d, 'country', 10),
        umamiMetrics(id, last7d, 'city', 10),
        umamiMetrics(id, last7d, 'device', 6),
        umamiMetrics(id, last7d, 'language', 8),
        umamiMetrics(id, last7d, 'event', 20)
      ]);

      summary = {
        activeNow,
        visitorsToday: num(statsToday?.visitors),
        pageviewsToday: num(statsToday?.pageviews),
        visitsToday: num(statsToday?.visits),
        visitors7d: num(stats7d?.visitors),
        pageviews7d: num(stats7d?.pageviews),
        visits7d: num(stats7d?.visits),
        bounceRate7d: bounceRate(stats7d),
        visitDuration7d: avgDuration(stats7d),
        visitors30d: num(stats30d?.visitors),
        pageviews30d: num(stats30d?.pageviews),
        visits30d: num(stats30d?.visits),
        topPages: mapBreakdownRows(topPages, 10),
        topSources: mapBreakdownRows(topSources, 8),
        topCountries: mapBreakdownRows(topCountries, 10),
        topCities: mapBreakdownRows(topCities, 10),
        topDevices: mapBreakdownRows(topDevices, 6),
        topLanguages: mapBreakdownRows(topLanguages, 8),
        topEvents: sortConversionEvents(topEvents)
      };
    } catch (err) {
      error = err.message || 'Umami API error';
    }
  }

  return {
    configured: true,
    siteId: label,
    summary,
    error,
    shareUrl: share || null,
    externalUrl
  };
}

/** @deprecated use getUmamiAdminSummary */
export async function getPlausibleAdminSummary() {
  return getUmamiAdminSummary();
}
