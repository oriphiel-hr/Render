const { prisma } = require('../lib/prisma');

function splitThreadId(externalThreadId) {
  const t = String(externalThreadId || '');
  const i = t.indexOf('_');
  if (i <= 0) return { pageId: null, userId: null };
  return { pageId: t.slice(0, i), userId: t.slice(i + 1) || null };
}

/**
 * @param {{ channel?: string, pageIdPrefix?: string, userId?: string, q?: string, limit?: number, offset?: number }} q
 */
async function listMessages(q = {}) {
  const limit = Math.min(Math.max(Number(q.limit) || 50, 1), 200);
  const offset = Math.max(Number(q.offset) || 0, 0);
  const channel = q.channel ? String(q.channel).toUpperCase() : undefined;
  const pageIdPrefix = q.pageIdPrefix ? String(q.pageIdPrefix).trim() : '';
  const searchTermRaw = q.q ? String(q.q).trim() : (q.userId ? String(q.userId).trim() : '');
  const searchTerm = searchTermRaw.toLowerCase();
  const hasSearch = Boolean(searchTerm);

  /** @type {import('@prisma/client').Prisma.ChannelMessageWhereInput} */
  const where = {};
  const and = [];
  if (channel) where.channel = channel;
  if (pageIdPrefix) {
    and.push({ externalThreadId: { startsWith: `${pageIdPrefix}_` } });
  }
  if (and.length) {
    where.AND = and;
  }

  const rawRows = await prisma.channelMessage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: hasSearch ? 5000 : limit,
    skip: hasSearch ? 0 : offset
  });
  const dbTotal = hasSearch ? rawRows.length : await prisma.channelMessage.count({ where });

  const pageNameById = new Map();
  const userNameByKey = new Map();
  for (const r of rawRows) {
    const { pageId: parsedPageId, userId: parsedUserId } = splitThreadId(r.externalThreadId);
    if (!parsedPageId || !parsedUserId) continue;

    if (!pageNameById.has(parsedPageId)) {
      const pageName = inferPageNameFromRaw(parsedPageId, r.rawPayload);
      if (pageName) pageNameById.set(parsedPageId, pageName);
    }

    const userKey = `${parsedPageId}_${parsedUserId}`;
    if (!userNameByKey.has(userKey)) {
      const userName = inferUserNameFromRaw(parsedPageId, parsedUserId, r.rawPayload);
      if (userName) userNameByKey.set(userKey, userName);
    }
  }

  const enrichedRows = rawRows.map((r) => {
    const { pageId: parsedPageId, userId: parsedUserId } = splitThreadId(r.externalThreadId);
    const userKey = parsedPageId && parsedUserId ? `${parsedPageId}_${parsedUserId}` : null;
    const userName = userKey ? userNameByKey.get(userKey) || null : null;
    const pageName = parsedPageId ? pageNameById.get(parsedPageId) || inferPageNameFromRaw(parsedPageId, r.rawPayload) : null;
    const { firstName, lastName } = splitFullName(userName);
    return {
      ...r,
      pageId: parsedPageId || null,
      pageName,
      userId: parsedUserId || null,
      userName: userName || null,
      userFirstName: firstName,
      userLastName: lastName
    };
  });

  const filteredRows = enrichedRows.filter((r) => {
    if (searchTerm) {
      const inUserId = String(r.userId || '').toLowerCase().includes(searchTerm);
      const inFirstName = String(r.userFirstName || '').toLowerCase().includes(searchTerm);
      const inLastName = String(r.userLastName || '').toLowerCase().includes(searchTerm);
      const inFullName = String(r.userName || '').toLowerCase().includes(searchTerm);
      const inPageId = String(r.pageId || '').toLowerCase().includes(searchTerm);
      const inPageName = String(r.pageName || '').toLowerCase().includes(searchTerm);
      const inBodyText = String(r.bodyText || '').toLowerCase().includes(searchTerm);
      const inThread = String(r.externalThreadId || '').toLowerCase().includes(searchTerm);
      if (!(inUserId || inFirstName || inLastName || inFullName || inPageId || inPageName || inBodyText || inThread)) {
        return false;
      }
    }
    return true;
  });

  const rows = hasSearch ? filteredRows.slice(offset, offset + limit) : filteredRows;
  const total = hasSearch ? filteredRows.length : dbTotal;

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
    select: {
      externalThreadId: true,
      createdAt: true,
      direction: true,
      bodyText: true,
      rawPayload: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5000
  });

  const seen = new Set();
  const threads = [];
  for (const r of rows) {
    const t = r.externalThreadId;
    if (!t || seen.has(t)) continue;
    seen.add(t);
    const { pageId, userId } = splitThreadId(t);
    threads.push({
      externalThreadId: t,
      lastAt: r.createdAt,
      lastDirection: r.direction || null,
      lastText: r.bodyText || null,
      pageId,
      userId,
      pageName: pageId ? inferPageNameFromRaw(pageId, r.rawPayload) : null,
      userName: pageId && userId ? inferUserNameFromRaw(pageId, userId, r.rawPayload) : null
    });
    if (threads.length >= limit) break;
  }

  return threads;
}

/**
 * CRM-lite: korisnici po kombinaciji (pageId + PSID) iz MESSENGER niti.
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
      bodyText: true,
      rawPayload: true
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
    const rowUserName = inferUserNameFromRaw(pageId, userId, r.rawPayload);
    const rowPageName = inferPageNameFromRaw(pageId, r.rawPayload);
    if (
      term &&
      !(
        userId.toLowerCase().includes(term) ||
        String(pageId).toLowerCase().includes(term) ||
        String(rowUserName || '').toLowerCase().includes(term) ||
        String(rowPageName || '').toLowerCase().includes(term)
      )
    ) {
      continue;
    }
    const key = `${pageId}_${userId}`;
    let agg = byUser.get(key);
    if (!agg) {
      agg = {
        pageId,
        pageName: rowPageName || null,
        userId,
        userName: rowUserName || null,
        messageCount: 0,
        lastAt: r.createdAt,
        lastText: r.bodyText || null
      };
      byUser.set(key, agg);
    }
    if (!agg.userName && rowUserName) agg.userName = rowUserName;
    if (!agg.pageName && rowPageName) agg.pageName = rowPageName;
    agg.messageCount += 1;
    if (new Date(r.createdAt) > new Date(agg.lastAt)) {
      agg.lastAt = r.createdAt;
      agg.lastText = r.bodyText || null;
    }
  }

  const list = [...byUser.values()]
    .map((u) => ({
      pageId: u.pageId,
      pageName: u.pageName || null,
      userId: u.userId,
      userName: u.userName || null,
      ...splitFullName(u.userName),
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
  const pages = await listPageIdsWithNames();
  return pages.map((p) => p.id);
}

function inferPageNameFromRaw(pageId, rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object') return null;

  const from = rawPayload.from;
  if (from && String(from.id || '') === String(pageId) && from.name) {
    return String(from.name).trim() || null;
  }

  const toData = rawPayload.to && Array.isArray(rawPayload.to.data) ? rawPayload.to.data : [];
  for (const p of toData) {
    if (String(p?.id || '') === String(pageId) && p?.name) {
      return String(p.name).trim() || null;
    }
  }

  const participants = rawPayload.participants && Array.isArray(rawPayload.participants.data)
    ? rawPayload.participants.data
    : [];
  for (const p of participants) {
    if (String(p?.id || '') === String(pageId) && p?.name) {
      return String(p.name).trim() || null;
    }
  }

  return null;
}

function inferUserNameFromRaw(pageId, userId, rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object' || !userId) return null;

  const normalizedPageId = String(pageId || '');
  const normalizedUserId = String(userId);
  const candidates = [];

  if (rawPayload.from && typeof rawPayload.from === 'object') {
    candidates.push(rawPayload.from);
  }

  const toData = rawPayload.to && Array.isArray(rawPayload.to.data) ? rawPayload.to.data : [];
  candidates.push(...toData);

  const participants = rawPayload.participants && Array.isArray(rawPayload.participants.data)
    ? rawPayload.participants.data
    : [];
  candidates.push(...participants);

  for (const c of candidates) {
    if (!c || typeof c !== 'object') continue;
    const id = String(c.id || '');
    const name = String(c.name || '').trim();
    if (!name) continue;
    if (id === normalizedUserId && id !== normalizedPageId) {
      return name;
    }
  }
  return null;
}

function splitFullName(fullName) {
  const cleaned = String(fullName || '').trim();
  if (!cleaned) {
    return { firstName: null, lastName: null, fullName: null };
  }
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null, fullName: cleaned };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
    fullName: cleaned
  };
}

/**
 * Jedinstveni Page ID prefiksi + inferirani naziv stranice iz raw payload-a (ako postoji).
 */
async function listPageIdsWithNames() {
  const rows = await prisma.channelMessage.findMany({
    where: {
      channel: 'MESSENGER',
      externalThreadId: { not: null }
    },
    select: {
      externalThreadId: true,
      rawPayload: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5000
  });

  const byPage = new Map();
  for (const r of rows) {
    const t = r.externalThreadId;
    if (!t) continue;
    const i = t.indexOf('_');
    if (i <= 0) continue;
    const pageId = t.slice(0, i);
    const existing = byPage.get(pageId);
    const inferred = inferPageNameFromRaw(pageId, r.rawPayload);
    if (!existing) {
      byPage.set(pageId, { id: pageId, name: inferred || null });
      continue;
    }
    if (!existing.name && inferred) {
      existing.name = inferred;
    }
  }

  return [...byPage.values()].sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

module.exports = { listMessages, listThreads, listPageIdPrefixes, listPageIdsWithNames, listUsers, splitThreadId };
