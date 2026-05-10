const { prisma } = require('../lib/prisma');
const { extractAttachmentsFromRaw } = require('./attachmentBackfill');

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
