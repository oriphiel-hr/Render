/**
 * Graph User Profile za Messenger PSID (Page access token).
 * @see https://developers.facebook.com/docs/messenger-platform/identity/user-profile
 *
 * Tokeni (Render / .env):
 * - MESSENGER_PAGE_TOKENS_JSON — {"PAGE_ID":"page_access_token", ...}
 * - ili MESSENGER_PAGE_ACCESS_TOKEN + opcionalno MESSENGER_PAGE_ID (jedna stranica)
 */

const DEFAULT_VERSION = process.env.MESSENGER_GRAPH_VERSION || 'v21.0';

function clip(s, n) {
  const t = String(s || '');
  return t.length <= n ? t : `${t.slice(0, n)}…`;
}

function splitThreadKey(externalThreadId) {
  const t = String(externalThreadId || '');
  const i = t.indexOf('_');
  if (i <= 0) return { pageId: null, userId: null };
  return { pageId: t.slice(0, i), userId: t.slice(i + 1) || null };
}

/**
 * Page access token za Graph pozive (User Profile) po pageId.
 */
function resolvePageAccessToken(pageId) {
  const rawJson = String(process.env.MESSENGER_PAGE_TOKENS_JSON || '').trim();
  if (rawJson) {
    try {
      const obj = JSON.parse(rawJson);
      if (obj && typeof obj === 'object') {
        const t = obj[String(pageId)];
        if (t && String(t).trim()) return String(t).trim();
      }
    } catch (_) {
      /* ignore invalid JSON */
    }
  }
  const single = String(process.env.MESSENGER_PAGE_ACCESS_TOKEN || '').trim();
  if (!single) return null;
  const singlePageId = String(process.env.MESSENGER_PAGE_ID || '').trim();
  if (singlePageId && String(pageId) !== singlePageId) return null;
  return single;
}

function isMessengerPageTokenConfigured() {
  if (String(process.env.MESSENGER_PAGE_TOKENS_JSON || '').trim()) return true;
  return Boolean(String(process.env.MESSENGER_PAGE_ACCESS_TOKEN || '').trim());
}

/**
 * @param {{ psid: string, pageAccessToken: string, apiVersion?: string }} opts
 */
async function fetchMessengerUserProfileFromGraph(opts) {
  const psid = String(opts.psid || '').trim();
  const pageAccessToken = String(opts.pageAccessToken || '').trim();
  const ver = String(opts.apiVersion || DEFAULT_VERSION).trim();
  if (!psid || !pageAccessToken) {
    throw new Error('psid i pageAccessToken su obavezni');
  }
  const url =
    `https://graph.facebook.com/${encodeURIComponent(ver)}/` +
    `${encodeURIComponent(psid)}?fields=name,first_name,last_name` +
    `&access_token=${encodeURIComponent(pageAccessToken)}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const msg = data.error?.message || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  const full =
    (data.name && String(data.name).trim()) ||
    [data.first_name, data.last_name]
      .filter((x) => x != null && String(x).trim())
      .map((x) => String(x).trim())
      .join(' ')
      .trim() ||
    null;
  return { name: full, raw: data };
}

/**
 * @param {import('@prisma/client').PrismaClient} db
 * @param {string[]} keys — format `pageId_userId`
 */
async function getMessengerProfileNameMap(db, keys) {
  const m = new Map();
  if (!keys.length || !db) return m;

  const pairs = [];
  for (const k of keys) {
    const { pageId, userId } = splitThreadKey(k);
    if (pageId && userId) pairs.push({ pageId, userId });
  }
  if (!pairs.length) return m;

  const chunk = 250;
  for (let i = 0; i < pairs.length; i += chunk) {
    const slice = pairs.slice(i, i + chunk);
    const rows = await db.messengerUserProfile.findMany({
      where: { OR: slice },
      select: { pageId: true, userId: true, displayName: true }
    });
    for (const r of rows) {
      const n = r.displayName != null ? String(r.displayName).trim() : '';
      if (n) m.set(`${r.pageId}_${r.userId}`, n);
    }
  }
  return m;
}

/**
 * Nakon webhooka / sinka: dohvat profila za niti u batchu (ograničeno radi rate limita).
 * @param {import('@prisma/client').PrismaClient} db
 * @param {object[]} rows — ChannelMessage redovi (channel, externalThreadId)
 * @param {{ maxFetches?: number, ttlMs?: number, ignoreTtl?: boolean }} [opts]
 */
async function refreshMessengerProfilesForWebhookRows(db, rows, opts = {}) {
  const maxFetches = Math.min(Math.max(Number(opts.maxFetches) || 12, 1), 80);
  const ttlMs = opts.ignoreTtl ? 0 : Math.max(Number(opts.ttlMs) || 7 * 24 * 60 * 60 * 1000, 60_000);
  const now = Date.now();

  const keysDedup = new Map();
  for (const row of rows) {
    if (String(row.channel || '').toUpperCase() !== 'MESSENGER' || !row.externalThreadId) continue;
    const { pageId, userId } = splitThreadKey(row.externalThreadId);
    if (!pageId || !userId || userId === pageId) continue;
    const token = resolvePageAccessToken(pageId);
    if (!token) continue;
    const key = `${pageId}_${userId}`;
    if (!keysDedup.has(key)) keysDedup.set(key, { pageId, userId, token });
  }

  let fetches = 0;
  for (const { pageId, userId, token } of keysDedup.values()) {
    if (fetches >= maxFetches) break;

    const existing = await db.messengerUserProfile.findUnique({
      where: { pageId_userId: { pageId, userId } },
      select: { displayName: true, fetchedAt: true }
    });
    if (
      !opts.ignoreTtl &&
      existing?.displayName &&
      existing.fetchedAt &&
      now - new Date(existing.fetchedAt).getTime() < ttlMs
    ) {
      continue;
    }

    try {
      const { name } = await fetchMessengerUserProfileFromGraph({ psid: userId, pageAccessToken: token });
      fetches += 1;
      await db.messengerUserProfile.upsert({
        where: { pageId_userId: { pageId, userId } },
        create: {
          pageId,
          userId,
          displayName: name,
          fetchedAt: new Date(),
          fetchError: null
        },
        update: {
          displayName: name != null ? name : undefined,
          fetchedAt: new Date(),
          fetchError: null
        }
      });
    } catch (e) {
      fetches += 1;
      const errText = clip(e instanceof Error ? e.message : String(e), 500);
      await db.messengerUserProfile.upsert({
        where: { pageId_userId: { pageId, userId } },
        create: {
          pageId,
          userId,
          displayName: null,
          fetchedAt: new Date(),
          fetchError: errText
        },
        update: {
          fetchedAt: new Date(),
          fetchError: errText
        }
      });
    }
  }
}

/**
 * Admin: dohvat profila za distinct threadove stranice (token iz tijela, ne iz env).
 * @param {import('@prisma/client').PrismaClient} db
 * @param {{ pageId: string, pageAccessToken: string, maxUsers?: number, apiVersion?: string }} p
 */
async function backfillMessengerUserProfilesForPage(db, p) {
  const pageId = String(p.pageId || '').trim();
  const pageAccessToken = String(p.pageAccessToken || '').trim();
  const maxUsers = Math.min(Math.max(Number(p.maxUsers) || 150, 1), 500);
  if (!pageId || !pageAccessToken) {
    throw new Error('pageId i pageAccessToken su obavezni');
  }

  const rows = await db.channelMessage.findMany({
    where: {
      channel: 'MESSENGER',
      externalThreadId: { startsWith: `${pageId}_` }
    },
    distinct: ['externalThreadId'],
    select: { externalThreadId: true },
    orderBy: { externalThreadId: 'desc' },
    take: maxUsers
  });

  const pairs = [];
  for (const r of rows) {
    const tid = r.externalThreadId;
    if (!tid) continue;
    const { pageId: p0, userId } = splitThreadKey(tid);
    if (!p0 || !userId || p0 !== pageId || userId === pageId) continue;
    pairs.push({ pageId: p0, userId });
  }

  let ok = 0;
  let failed = 0;
  const errors = [];
  for (const { pageId: pid, userId } of pairs) {
    try {
      const { name } = await fetchMessengerUserProfileFromGraph({
        psid: userId,
        pageAccessToken,
        apiVersion: p.apiVersion
      });
      await db.messengerUserProfile.upsert({
        where: { pageId_userId: { pageId: pid, userId } },
        create: {
          pageId: pid,
          userId,
          displayName: name,
          fetchedAt: new Date(),
          fetchError: null
        },
        update: {
          displayName: name != null ? name : undefined,
          fetchedAt: new Date(),
          fetchError: null
        }
      });
      ok += 1;
    } catch (e) {
      failed += 1;
      const msg = e instanceof Error ? e.message : String(e);
      errors.push({ userId, error: clip(msg, 200) });
      try {
        await db.messengerUserProfile.upsert({
          where: { pageId_userId: { pageId: pid, userId } },
          create: {
            pageId: pid,
            userId,
            displayName: null,
            fetchedAt: new Date(),
            fetchError: clip(msg, 500)
          },
          update: { fetchedAt: new Date(), fetchError: clip(msg, 500) }
        });
      } catch (_) {
        /* ignore */
      }
    }
  }

  return { threadsConsidered: pairs.length, profilesOk: ok, profilesFailed: failed, errors };
}

module.exports = {
  resolvePageAccessToken,
  isMessengerPageTokenConfigured,
  fetchMessengerUserProfileFromGraph,
  getMessengerProfileNameMap,
  refreshMessengerProfilesForWebhookRows,
  backfillMessengerUserProfilesForPage,
  splitThreadKey
};
