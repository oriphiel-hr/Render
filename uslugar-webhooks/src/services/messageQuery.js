const { Prisma } = require('@prisma/client');
const { prisma } = require('../lib/prisma');
const { extractAttachmentsFromRaw } = require('./attachmentBackfill');

/**
 * Outbound koji resetira „čeka admina“: ručno iz ovog panela, sink s Meta (Inbox), webhook echo, Send API.
 * Ne uključuje api.ingest.* (automatika / vanjski bot).
 */
const ADMIN_QUEUE_CLEAR_SOURCES = [
  'admin.send',
  'facebook.graph.sync',
  'facebook.graph',
  'facebook.graph.send'
];

/** Zadnji inbound noviji od ovoga → „Novo“ (hitno) ako je unutar prozora. */
const ADMIN_QUEUE_URGENT_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Po (channel, externalThreadId): zadnji inbound vs. zadnji „stranica se javila“ outbound (vidi ADMIN_QUEUE_CLEAR_SOURCES).
 * @param {import('@prisma/client').PrismaClient} db
 * @param {{ channel: string, externalThreadId: string }[]} pairs
 */
async function loadThreadAdminQueueFlags(db, pairs) {
  const out = new Map();
  const uniq = new Map();
  for (const p of pairs) {
    const tid = String(p.externalThreadId || '').trim();
    const ch = String(p.channel || '').trim();
    if (!tid || !ch) continue;
    const k = `${ch}|${tid}`;
    if (!uniq.has(k)) uniq.set(k, { channel: ch, externalThreadId: tid });
  }
  const list = [...uniq.values()];
  if (!list.length) return out;

  const capped = list.slice(0, 250);
  const orParts = capped.map(
    (p) => Prisma.sql`(m.channel::text = ${p.channel} AND m."externalThreadId" = ${p.externalThreadId})`
  );
  const whereJoined = Prisma.join(orParts, ' OR ');
  const clearSourceSql = Prisma.join(
    ADMIN_QUEUE_CLEAR_SOURCES.map((s) => Prisma.sql`${s}`),
    ', '
  );

  /** @type {{ ch: string, tid: string, lastInboundAt: Date | null, lastAdminSendAt: Date | null }[]} */
  const rows = await db.$queryRaw`
    SELECT m.channel::text AS ch,
           m."externalThreadId" AS tid,
           MAX(CASE WHEN LOWER(m.direction) = 'inbound' THEN m."createdAt" END) AS "lastInboundAt",
           MAX(CASE WHEN LOWER(m.direction) = 'outbound' AND m.source IN (${clearSourceSql})
               THEN m."createdAt" END) AS "lastAdminSendAt"
    FROM "ChannelMessage" m
    WHERE ${whereJoined}
    GROUP BY m.channel, m."externalThreadId"
  `;

  const now = Date.now();
  for (const r of rows) {
    const k = `${r.ch}|${r.tid}`;
    const lastIn = r.lastInboundAt ? new Date(r.lastInboundAt) : null;
    const lastAd = r.lastAdminSendAt ? new Date(r.lastAdminSendAt) : null;
    const needsAdminReply = Boolean(lastIn && (!lastAd || lastIn.getTime() > lastAd.getTime()));
    const needsAdminUrgent = Boolean(
      needsAdminReply && lastIn && now - lastIn.getTime() <= ADMIN_QUEUE_URGENT_MS
    );
    out.set(k, {
      threadNeedsAdminReply: needsAdminReply,
      threadNeedsAdminUrgent: needsAdminUrgent,
      lastInboundAt: lastIn ? lastIn.toISOString() : null
    });
  }
  return out;
}

/**
 * Spoji zapise iz baze s ekstrakcijom iz rawPayload-a (Graph/webhook često ima URL samo u jednom od njih).
 */
function mergeAttachmentsForMessage(dbAttachments, rawPayload) {
  const fromDb = Array.isArray(dbAttachments) ? dbAttachments : [];
  const fromRaw = extractAttachmentsFromRaw(rawPayload);
  const n = Math.max(fromDb.length, fromRaw.length);
  if (!n) return [];
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const d = fromDb[i];
    const x = fromRaw[i];
    const kind = (d && d.kind) || (x && x.kind) || null;
    const url = ((d && d.url) || (x && x.url) || '').trim() || null;
    const name = (d && d.name) || (x && x.name) || null;
    out.push({ type: kind || null, url: url || null, name: name || null });
  }
  return out;
}

function splitThreadId(externalThreadId) {
  const t = String(externalThreadId || '');
  const i = t.indexOf('_');
  if (i <= 0) return { pageId: null, userId: null };
  return { pageId: t.slice(0, i), userId: t.slice(i + 1) || null };
}

function parseDateStart(value) {
  const v = String(value || '').trim();
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return new Date(`${v}T00:00:00.000Z`);
  }
  const dt = new Date(v);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function parseDateEnd(value) {
  const v = String(value || '').trim();
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return new Date(`${v}T23:59:59.999Z`);
  }
  const dt = new Date(v);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/**
 * @param {{ channel?: string, pageIdPrefix?: string, userId?: string, q?: string, from?: string, to?: string, hasAttachment?: string|boolean, attachmentType?: string, limit?: number, offset?: number }} q
 */
async function listMessages(q = {}) {
  const limit = Math.min(Math.max(Number(q.limit) || 50, 1), 200);
  const offset = Math.max(Number(q.offset) || 0, 0);
  const channel = q.channel ? String(q.channel).toUpperCase() : undefined;
  const pageIdPrefix = q.pageIdPrefix ? String(q.pageIdPrefix).trim() : '';
  const searchTermRaw = q.q ? String(q.q).trim() : (q.userId ? String(q.userId).trim() : '');
  const searchTerm = searchTermRaw.toLowerCase();
  const hasSearch = Boolean(searchTerm);
  const hasAttachmentFilterRaw = q.hasAttachment;
  const attachmentType = String(q.attachmentType || '').trim().toLowerCase();
  const hasAttachmentFilter =
    hasAttachmentFilterRaw === true ||
    String(hasAttachmentFilterRaw || '').toLowerCase() === '1' ||
    String(hasAttachmentFilterRaw || '').toLowerCase() === 'true' ||
    String(hasAttachmentFilterRaw || '').toLowerCase() === 'with'
      ? 'with'
      : (
        hasAttachmentFilterRaw === false ||
        String(hasAttachmentFilterRaw || '').toLowerCase() === '0' ||
        String(hasAttachmentFilterRaw || '').toLowerCase() === 'false' ||
        String(hasAttachmentFilterRaw || '').toLowerCase() === 'without'
          ? 'without'
          : ''
      );
  const fromDate = parseDateStart(q.from);
  const toDate = parseDateEnd(q.to);

  /** @type {import('@prisma/client').Prisma.ChannelMessageWhereInput} */
  const where = {};
  const and = [];
  if (channel) where.channel = channel;
  if (pageIdPrefix) {
    and.push({ externalThreadId: { startsWith: `${pageIdPrefix}_` } });
  }
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = fromDate;
    if (toDate) where.createdAt.lte = toDate;
  }
  if (hasAttachmentFilter === 'with') {
    where.attachments = { some: {} };
  } else if (hasAttachmentFilter === 'without') {
    where.attachments = { none: {} };
  }
  if (attachmentType) {
    where.attachments = {
      some: {
        kind: { contains: attachmentType, mode: 'insensitive' }
      }
    };
  }
  if (and.length) {
    where.AND = and;
  }

  const rawRows = await prisma.channelMessage.findMany({
    where,
    include: {
      attachments: {
        orderBy: { ordinal: 'asc' },
        select: { kind: true, url: true, name: true, ordinal: true }
      }
    },
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
      attachments: mergeAttachmentsForMessage(r.attachments, r.rawPayload),
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
      const inAttachments = (r.attachments || []).some((a) =>
        [a.type, a.url, a.name].some((x) => String(x || '').toLowerCase().includes(searchTerm))
      );
      if (!(inUserId || inFirstName || inLastName || inFullName || inPageId || inPageName || inBodyText || inThread || inAttachments)) {
        return false;
      }
    }
    return true;
  });

  const rows = hasSearch ? filteredRows.slice(offset, offset + limit) : filteredRows;

  const threadPairs = rows
    .filter((r) => r.externalThreadId)
    .map((r) => ({ channel: String(r.channel), externalThreadId: String(r.externalThreadId) }));
  const queueMap = await loadThreadAdminQueueFlags(prisma, threadPairs);
  for (const r of rows) {
    const k = r.externalThreadId ? `${r.channel}|${r.externalThreadId}` : '';
    const q = k ? queueMap.get(k) : null;
    r.threadNeedsAdminReply = Boolean(q?.threadNeedsAdminReply);
    r.threadNeedsAdminUrgent = Boolean(q?.threadNeedsAdminUrgent);
    r.threadLastInboundAt = q?.lastInboundAt || null;
    r.adminQueueSort = r.threadNeedsAdminUrgent ? 2 : r.threadNeedsAdminReply ? 1 : 0;
  }

  const total = hasSearch ? filteredRows.length : dbTotal;
  const pageMap = new Map();
  filteredRows.forEach((r) => {
    const id = String(r.pageId || '').trim();
    if (!id) return;
    if (!pageMap.has(id)) {
      pageMap.set(id, { pageId: id, pageName: r.pageName || null, count: 0 });
    }
    const item = pageMap.get(id);
    item.count += 1;
    if (!item.pageName && r.pageName) item.pageName = r.pageName;
  });
  const pageStats = [...pageMap.values()].sort((a, b) => b.count - a.count);

  return { rows, total, limit, offset, pageStats };
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
      direction: true,
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
        inboundCount: 0,
        outboundCount: 0,
        attachmentCount: 0,
        firstAt: r.createdAt,
        lastAt: r.createdAt,
        lastDirection: r.direction || null,
        lastText: r.bodyText || null
      };
      byUser.set(key, agg);
    }
    if (!agg.userName && rowUserName) agg.userName = rowUserName;
    if (!agg.pageName && rowPageName) agg.pageName = rowPageName;
    agg.messageCount += 1;
    if (String(r.direction || '').toLowerCase() === 'outbound') agg.outboundCount += 1;
    else agg.inboundCount += 1;
    agg.attachmentCount += extractAttachmentsFromRaw(r.rawPayload).length;
    if (new Date(r.createdAt) < new Date(agg.firstAt)) {
      agg.firstAt = r.createdAt;
    }
    if (new Date(r.createdAt) > new Date(agg.lastAt)) {
      agg.lastAt = r.createdAt;
      agg.lastDirection = r.direction || null;
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
      inboundCount: u.inboundCount || 0,
      outboundCount: u.outboundCount || 0,
      attachmentCount: u.attachmentCount || 0,
      firstAt: u.firstAt,
      lastAt: u.lastAt,
      lastDirection: u.lastDirection || null,
      lastText: u.lastText,
      isLead: false,
      pauseAutomation: false,
      notes: null
    }))
    .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

  if (list.length) {
    const contacts = await prisma.crmContact.findMany({
      where: {
        OR: list.map((u) => ({ pageId: String(u.pageId), userId: String(u.userId) }))
      },
      select: { pageId: true, userId: true, isLead: true, pauseAutomation: true, notes: true }
    });
    const byKey = new Map(contacts.map((c) => [`${c.pageId}_${c.userId}`, c]));
    list.forEach((u) => {
      const c = byKey.get(`${u.pageId}_${u.userId}`);
      if (!c) return;
      u.isLead = Boolean(c.isLead);
      u.pauseAutomation = Boolean(c.pauseAutomation);
      u.notes = c.notes || null;
    });
  }

  const total = list.length;
  const slice = list.slice(offset, offset + limit);
  if (slice.length) {
    const pq = slice.map((u) => ({
      channel: 'MESSENGER',
      externalThreadId: `${u.pageId}_${u.userId}`
    }));
    const qmap = await loadThreadAdminQueueFlags(prisma, pq);
    for (const u of slice) {
      const k = `MESSENGER|${u.pageId}_${u.userId}`;
      const q = qmap.get(k);
      u.threadNeedsAdminReply = Boolean(q?.threadNeedsAdminReply);
      u.threadNeedsAdminUrgent = Boolean(q?.threadNeedsAdminUrgent);
      u.threadLastInboundAt = q?.lastInboundAt || null;
      u.adminQueueSort = u.threadNeedsAdminUrgent ? 2 : u.threadNeedsAdminReply ? 1 : 0;
    }
  }

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
