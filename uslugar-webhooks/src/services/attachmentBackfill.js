const { prisma } = require('../lib/prisma');

function extractAttachmentsFromRaw(rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object') return [];
  const out = [];
  const pushFromCollection = (collection) => {
    if (Array.isArray(collection)) {
      collection.forEach(add);
      return;
    }
    if (collection && Array.isArray(collection.data)) {
      collection.data.forEach(add);
    }
  };

  function pickFirstHttpUrl(obj, depth) {
    if (depth <= 0 || !obj || typeof obj !== 'object') return null;
    const keys = ['url', 'src', 'file_url', 'preview_url', 'reusable_url'];
    for (const k of keys) {
      if (typeof obj[k] === 'string' && /^https?:\/\//i.test(obj[k].trim())) {
        return obj[k].trim();
      }
    }
    if (obj.image_data && typeof obj.image_data === 'object') {
      const u = pickFirstHttpUrl(obj.image_data, depth - 1);
      if (u) return u;
    }
    if (obj.video_data && typeof obj.video_data === 'object') {
      const u = pickFirstHttpUrl(obj.video_data, depth - 1);
      if (u) return u;
    }
    return null;
  }

  const add = (a) => {
    if (!a || typeof a !== 'object') return;
    const payload = a.payload && typeof a.payload === 'object' ? a.payload : {};
    const kind =
      String(a.type || a.mime_type || payload.mime_type || payload.sticker_type || '').trim() || null;
    let url =
      String(
        payload.url ||
          a.url ||
          a.file_url ||
          payload.src ||
          payload.file_url ||
          payload.preview_url ||
          payload.reusable_url ||
          ''
      ).trim() || null;
    if (!url && payload.image_data && typeof payload.image_data === 'object') {
      url = pickFirstHttpUrl(payload.image_data, 4);
    }
    if (!url && payload.video_data && typeof payload.video_data === 'object') {
      url = pickFirstHttpUrl(payload.video_data, 4);
    }
    if (!url && a.image_data && typeof a.image_data === 'object') {
      url = pickFirstHttpUrl(a.image_data, 4);
    }
    if (!url && a.video_data && typeof a.video_data === 'object') {
      url = pickFirstHttpUrl(a.video_data, 4);
    }
    if (!url) {
      url = pickFirstHttpUrl(payload, 3) || pickFirstHttpUrl(a, 3);
    }
    const name = String(a.name || payload.title || payload.filename || '').trim() || null;
    if (!kind && !url && !name) return;
    out.push({ kind, url, name });
  };

  pushFromCollection(rawPayload.attachments);

  if (rawPayload.message) {
    pushFromCollection(rawPayload.message.attachments);
  }

  const entry = Array.isArray(rawPayload.entry) ? rawPayload.entry : [];
  entry.forEach((e) => {
    const messaging = Array.isArray(e?.messaging) ? e.messaging : [];
    messaging.forEach((m) => {
      pushFromCollection(m?.message?.attachments);
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
  let messagesWithAttachments = 0;
  let messagesWithoutAttachments = 0;

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
      if (attachments.length) messagesWithAttachments += 1;
      else messagesWithoutAttachments += 1;
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
    if (onProgress) onProgress({ scanned, updated, inserted, messagesWithAttachments, messagesWithoutAttachments });
  }

  return { scanned, updated, inserted, messagesWithAttachments, messagesWithoutAttachments, force, dryRun };
}

module.exports = { backfillMessageAttachments, extractAttachmentsFromRaw };
