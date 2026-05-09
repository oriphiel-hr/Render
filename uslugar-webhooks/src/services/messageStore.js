const { prisma } = require('../lib/prisma');

/**
 * @param {import('@prisma/client').Prisma.ChannelMessageCreateManyInput[]} rows
 * @param {{ prisma?: import('@prisma/client').PrismaClient }} [options] — inače zadani `DATABASE_URL`
 */
async function storeMessages(rows, options = {}) {
  if (!rows.length) return { count: 0 };
  const db = options.prisma || prisma;
  const result = await db.channelMessage.createMany({
    data: rows,
    skipDuplicates: true
  });
  return result;
}

module.exports = { storeMessages };
