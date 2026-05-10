const { prisma } = require('../lib/prisma');

function splitThreadId(externalThreadId) {
  const t = String(externalThreadId || '');
  const i = t.indexOf('_');
  if (i <= 0) return { pageId: null, userId: null };
  return { pageId: t.slice(0, i), userId: t.slice(i + 1) || null };
}

/**
 * @param {{ channel?: string, pageIdPrefix?: string, userId?: string, limit?: number, offset?: number }} q
 */
async function listMessages(q = {}) {
  const limit = Math.min(Math.max(Number(q.limit) || 50, 1), 200);
  const offset = Math.max(Number(q.offset) || 0, 0);
  const channel = q.channel ? String(q.channel).toUpperCase() : undefined;
  const pageIdPrefix = q.pageIdPrefix ? String(q.pageIdPrefix).trim() : '';
  const userId = q.userId ? String(q.userId).trim() : '';

  /** @type {import('@prisma/client').Prisma.ChannelMessageWhereInput} */
  const where = {};
  const and = [];
  if (channel) where.channel = channel;
  if (pageIdPrefix) {
    and.push({ externalThreadId: { startsWith: `${pageIdPrefix}_` } });
  }
  if (userId) {
    and.push({ externalThreadId: { endsWith: `_${userId}` } });
  }
  if (and.length) {
    where.AND = and;
  }

  const [rows, total] = await Promise.all([
    prisma.channelMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.channelMessage.count({ where })
  ]);

  return { rows, total, limit, offset };
}

/**
 * Threadovi (distinct externalThreadId) — zadnji activity po threadu.
 * @param {{ channel?: string, limit?: number }} q
 */
async function listThreads(q = {}) {
  const limit = Math.min(Math.max(Number(q.limit) || 100, 1), 500);
  const channel = q.channel ? String(q.channel).toUpperCase() : 'MESSENGER';

  const rows = await prisma.channelMessage.findMany({
    where: {
      channel,
      externalThreadId: { not: null }
    },
    select: { externalThreadId: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 5000
  });

  const seen = new Set();
  const threads = [];
  for (const r of rows) {
    const t = r.externalThreadId;
    if (!t || seen.has(t)) continue;
    seen.add(t);
    threads.push({ externalThreadId: t, lastAt: r.createdAt });
    if (threads.length >= limit) break;
  }

  return threads;
}

/**
 * CRM-lite: korisnici (PSID) iz MESSENGER niti.
 * @param {{ pageIdPrefix?: string, q?: string, limit?: number, offset?: number }} q
 */
async function listUsers(q = {}) {
  const limit = Math.min(Math.max(Number(q.limit) || 50, 1), 200);
  const offset = Math.max(Number(q.offset) || 0, 0);
  const pageIdPrefix = q.pageIdPrefix ? String(q.pageIdPrefix).trim() : '';
  const term = q.q ? String(q.q).trim().toLowerCase() : '';

  const rows = await prisma.channelMessage.findMany({
    where: {
      channel: 'MESSENGER',
      externalThreadId: { not: null }
    },
    select: {
      externalThreadId: true,
      createdAt: true,
      bodyText: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5000
  });

  const byUser = new Map();
  for (const r of rows) {
    const t = r.externalThreadId;
    if (!t) continue;
    const { pageId, userId } = splitThreadId(t);
    if (!pageId || !userId) continue;
    if (pageIdPrefix && pageId !== pageIdPrefix) continue;
    if (term && !(userId.toLowerCase().includes(term) || String(pageId).toLowerCase().includes(term))) {
      continue;
    }
    let agg = byUser.get(userId);
    if (!agg) {
      agg = {
        userId,
        pageIds: new Set(),
        messageCount: 0,
        lastAt: r.createdAt,
        lastText: r.bodyText || null
      };
      byUser.set(userId, agg);
    }
    agg.pageIds.add(pageId);
    agg.messageCount += 1;
    if (new Date(r.createdAt) > new Date(agg.lastAt)) {
      agg.lastAt = r.createdAt;
      agg.lastText = r.bodyText || null;
    }
  }

  const list = [...byUser.values()]
    .map((u) => ({
      userId: u.userId,
      pageIds: [...u.pageIds].sort(),
      messageCount: u.messageCount,
      lastAt: u.lastAt,
      lastText: u.lastText
    }))
    .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

  const total = list.length;
  const slice = list.slice(offset, offset + limit);
  return { rows: slice, total, limit, offset };
}

/**
 * Jedinstveni Page ID prefiksi iz thread ID-a (format pageId_psid).
 */
async function listPageIdPrefixes() {
  const threads = await listThreads({ channel: 'MESSENGER', limit: 500 });
  const prefixes = new Set();
  for (const row of threads) {
    const t = row.externalThreadId;
    if (!t) continue;
    const i = t.indexOf('_');
    if (i > 0) prefixes.add(t.slice(0, i));
  }
  return [...prefixes].sort();
}

module.exports = { listMessages, listThreads, listPageIdPrefixes, listUsers, splitThreadId };
