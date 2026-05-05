const { prisma } = require('../lib/prisma');

/**
 * Aktivan prompt za slug.
 * - Bez kanala: samo zapisi s channel = null (global), najnovija verzija.
 * - S kanalom: prvo točan kanal (najnovija verzija), inače global.
 * @param {string} slug
 * @param {string | null} [forChannel] npr. MESSENGER
 */
async function getActivePromptBody(slug, forChannel = null) {
  const list = await prisma.promptTemplate.findMany({
    where: { slug, isActive: true }
  });

  if (!list.length) return null;

  const pickNewest = (rows) => rows.sort((a, b) => b.version - a.version)[0] || null;

  if (forChannel) {
    const channelRows = list.filter((p) => p.channel === forChannel);
    const ch = pickNewest(channelRows);
    if (ch) return ch.body;
    const globalRows = list.filter((p) => p.channel === null);
    const g = pickNewest(globalRows);
    return g ? g.body : null;
  }

  const globalRows = list.filter((p) => p.channel === null);
  const g = pickNewest(globalRows);
  return g ? g.body : null;
}

module.exports = { getActivePromptBody };
