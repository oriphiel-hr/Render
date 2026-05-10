const { prisma } = require('../lib/prisma');

function extractAttachmentsFromRaw(rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object') return [];
  const out = [];

  const add = (a) => {
    if (!a || typeof a !== 'object') return;
    const kind = String(a.type || a.mime_type || '').trim() || null;
    const payload = a.payload && typeof a.payload === 'object' ? a.payload : {};
    const url = String(payload.url || a.url || payload.src || '').trim() || null;
    const name = String(a.name || payload.title || payload.filename || '').trim() || null;
    if (!kind && !url && !name) return;
    out.push({ kind, url, name });
  };

  const attachments = Array.isArray(rawPayload.attachments) ? rawPayload.attachments : [];
  attachments.forEach(add);

  const messageAttachments = rawPayload.message && Array.isArray(rawPayload.message.attachments)
    ? rawPayload.message.attachments
    : [];
  messageAttachments.forEach(add);

  const entry = Array.isArray(rawPayload.entry) ? rawPayload.entry : [];
  entry.forEach((e) => {
    const messaging = Array.isArray(e?.messaging) ? e.messaging : [];
    messaging.forEach((m) => {
      const nested = Array.isArray(m?.message?.attachments) ? m.message.attachments : [];
      nested.forEach(add);
    });
  });

  return out.slice(0, 20);
}

async function backfillMessageAttachments(opts = {}) {
  const force = Boolean(opts.force);
  const dryRun = Boolean(opts.dryRun);
  const pageSize = Math.min(Math.max(Number(opts.pageSize) || 200, 50), 1000);
  const db = opts.prisma || prisma;
  const onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;

  let cursorId = null;
  let scanned = 0;
  let updated = 0;
  let inserted = 0;

  while (true) {
    const rows = await db.channelMessage.findMany({
      where: force ? {} : { attachments: { none: {} } },
      select: { id: true, rawPayload: true },
      orderBy: { id: 'asc' },
      take: pageSize,
      ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {})
    });
    if (!rows.length) break;
    cursorId = rows[rows.length - 1].id;
    scanned += rows.length;

    for (const r of rows) {
      const attachments = extractAttachmentsFromRaw(r.rawPayload);
      if (!attachments.length && !force) continue;
      if (!dryRun) {
        await db.$transaction(async (tx) => {
          await tx.channelMessageAttachment.deleteMany({
            where: { channelMessageId: r.id }
          });
          if (attachments.length) {
            await tx.channelMessageAttachment.createMany({
              data: attachments.map((a, idx) => ({
                channelMessageId: r.id,
                kind: a.kind,
                url: a.url,
                name: a.name,
                ordinal: idx
              }))
            });
          }
        });
      }
      updated += 1;
      inserted += attachments.length;
    }
    if (onProgress) onProgress({ scanned, updated, inserted });
  }

  return { scanned, updated, inserted, force, dryRun };
}

module.exports = { backfillMessageAttachments, extractAttachmentsFromRaw };
