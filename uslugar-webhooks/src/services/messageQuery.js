const { prisma } = require('../lib/prisma');

/**
 * @param {{ channel?: string, pageIdPrefix?: string, limit?: number, offset?: number }} q
 */
async function listMessages(q = {}) {
  const limit = Math.min(Math.max(Number(q.limit) || 50, 1), 200);
  const offset = Math.max(Number(q.offset) || 0, 0);
  const channel = q.channel ? String(q.channel).toUpperCase() : undefined;
  const pageIdPrefix = q.pageIdPrefix ? String(q.pageIdPrefix).trim() : '';

  /** @type {import('@prisma/client').Prisma.ChannelMessageWhereInput} */
  const where = {};
  if (channel) where.channel = channel;
  if (pageIdPrefix) {
    where.externalThreadId = { startsWith: `${pageIdPrefix}_` };
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

module.exports = { listMessages, listThreads, listPageIdPrefixes };
