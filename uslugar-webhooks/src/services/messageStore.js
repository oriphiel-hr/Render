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

/**
 * @param {import('@prisma/client').Prisma.ChannelMessageCreateManyInput[]} rows
 * @param {{ prisma?: import('@prisma/client').PrismaClient }} [options] — inače zadani `DATABASE_URL`
 */
async function storeMessages(rows, options = {}) {
  if (!rows.length) return { count: 0 };
  const db = options.prisma || prisma;
  const result = await db.$transaction(async (tx) => {
    const insertResult = await tx.channelMessage.createMany({
      data: rows,
      skipDuplicates: true
    });

    const keyRows = rows.filter((r) => r.channel && r.externalMessageId);
    if (!keyRows.length) return insertResult;

    const or = keyRows.map((r) => ({
      channel: r.channel,
      externalMessageId: r.externalMessageId
    }));

    const storedMessages = await tx.channelMessage.findMany({
      where: { OR: or },
      select: { id: true, channel: true, externalMessageId: true, rawPayload: true }
    });

    if (!storedMessages.length) return insertResult;

    const attachmentData = [];
    for (const msg of storedMessages) {
      const attachments = extractAttachmentsFromRaw(msg.rawPayload);
      attachments.forEach((a, idx) => {
        attachmentData.push({
          channelMessageId: msg.id,
          kind: a.kind,
          url: a.url,
          name: a.name,
          ordinal: idx
        });
      });
    }

    await tx.channelMessageAttachment.deleteMany({
      where: {
        channelMessageId: { in: storedMessages.map((m) => m.id) }
      }
    });

    if (attachmentData.length) {
      await tx.channelMessageAttachment.createMany({
        data: attachmentData
      });
    }

    return insertResult;
  });
  return result;
}

module.exports = { storeMessages };
