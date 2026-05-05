const { prisma } = require('../lib/prisma');

/**
 * @param {import('@prisma/client').Prisma.ChannelMessageCreateManyInput[]} rows
 */
async function storeMessages(rows) {
  if (!rows.length) return { count: 0 };
  const result = await prisma.channelMessage.createMany({
    data: rows,
    skipDuplicates: true
  });
  return result;
}

module.exports = { storeMessages };
