function baseUrl() {
  return (process.env.UMAMI_BASE_URL || '').trim().replace(/\/$/, '');
}

function websiteId() {
  return process.env.UMAMI_WEBSITE_ID?.trim() || '';
}

function apiToken() {
  return process.env.UMAMI_API_TOKEN?.trim() || '';
}

function shareUrl() {
  return process.env.UMAMI_SHARE_URL?.trim() || '';
}

function siteLabel() {
  return process.env.UMAMI_SITE_LABEL?.trim() || 'ravnopar.com';
}

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

async function umamiGet(path, query = {}) {
  const root = baseUrl();
  const token = apiToken();
  if (!root || !token) return null;

  const url = new URL(`${root}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value != null) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Umami API ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
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

function mapMetricRows(rows, { pageKey = false } = {}) {
  const list = Array.isArray(rows) ? rows : [];
  return list.slice(0, 10).map((row) => {
    const label = row.x ?? row.name ?? '—';
    const views = num(row.y) ?? 0;
    const visitors = num(row.z) ?? views;
    if (pageKey) {
      return { page: label, visitors, pageviews: views };
    }
    return { source: label || '(direct)', visitors };
  });
}

export async function getUmamiAdminSummary() {
  const root = baseUrl();
  const id = websiteId();
  const token = apiToken();
  const share = shareUrl();
  const label = siteLabel();
  const externalUrl = share || (root ? `${root}/websites/${id}` : null);

  if (!root || !id || (!token && !share)) {
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

  if (token && id) {
    try {
      const today = todayMs();
      const last7d = rangeMs(7);
      const last30d = rangeMs(30);

      const [statsToday, stats7d, stats30d, topPages, topSources] = await Promise.all([
        umamiGet(`/api/websites/${id}/stats`, today),
        umamiGet(`/api/websites/${id}/stats`, last7d),
        umamiGet(`/api/websites/${id}/stats`, last30d),
        umamiGet(`/api/websites/${id}/metrics`, { ...last7d, type: 'url', limit: 10 }),
        umamiGet(`/api/websites/${id}/metrics`, { ...last7d, type: 'referrer', limit: 8 })
      ]);

      summary = {
        visitorsToday: num(statsToday?.visitors),
        pageviewsToday: num(statsToday?.pageviews),
        visitors7d: num(stats7d?.visitors),
        pageviews7d: num(stats7d?.pageviews),
        bounceRate7d: bounceRate(stats7d),
        visitDuration7d: avgDuration(stats7d),
        visitors30d: num(stats30d?.visitors),
        pageviews30d: num(stats30d?.pageviews),
        topPages: mapMetricRows(topPages, { pageKey: true }),
        topSources: mapMetricRows(topSources)
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
