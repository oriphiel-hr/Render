const { prisma } = require('../lib/prisma');

/**
 * Provjera da li eventSource (ChannelMessage.source) pada pod isključenje.
 * Stavit ćeš npr. "facebook.graph.call" ili prefiks "facebook.graph.feed.*"
 */
function isEventSourceExcluded(eventSource, excludeSources) {
  if (!eventSource || !Array.isArray(excludeSources) || !excludeSources.length) return false;
  const es = String(eventSource).trim();
  for (const pat of excludeSources) {
    const p = String(pat || '').trim();
    if (!p) continue;
    if (p.endsWith('*')) {
      const prefix = p.slice(0, -1);
      if (es === prefix || es.startsWith(`${prefix}.`)) return true;
    } else if (es === p) {
      return true;
    }
  }
  return false;
}

/**
 * Aktivan prompt za slug + opcijski kanal + opcijski izvor događaja.
 * @param {string | null} [forChannel] npr. MESSENGER
 * @param {string | null} [eventSource] npr. facebook.graph.call — ako je u excludeSources, vraća skipped
 */
async function resolveActivePrompt(slug, forChannel = null, eventSource = null) {
  const list = await prisma.promptTemplate.findMany({
    where: { slug, isActive: true },
    select: {
      body: true,
      version: true,
      channel: true,
      excludeSources: true
    }
  });

  if (!list.length) {
    return { ok: false, reason: 'none' };
  }

  const pickNewest = (rows) => rows.sort((a, b) => b.version - a.version)[0] || null;

  let picked = null;
  if (forChannel) {
    const channelRows = list.filter((p) => p.channel === forChannel);
    picked = pickNewest(channelRows);
    if (!picked) picked = pickNewest(list.filter((p) => p.channel === null));
  } else {
    picked = pickNewest(list.filter((p) => p.channel === null));
  }

  if (!picked) {
    return { ok: false, reason: 'none' };
  }

  const excluded =
    eventSource && isEventSourceExcluded(eventSource, picked.excludeSources || []);
  if (excluded) {
    return {
      ok: false,
      reason: 'excluded',
      eventSource: String(eventSource),
      excludeSources: picked.excludeSources || []
    };
  }

  return {
    ok: true,
    body: picked.body,
    version: picked.version,
    channel: picked.channel
  };
}

/**
 * Samo tijelo teksta ili null (bez razlike između "nema prompta" i "isključen izvor").
 * Za automatiku koristi resolveActivePrompt ili ingest GET s eventSource.
 */
async function getActivePromptBody(slug, forChannel = null, eventSource = null) {
  const r = await resolveActivePrompt(slug, forChannel, eventSource);
  return r.ok ? r.body : null;
}

module.exports = {
  getActivePromptBody,
  resolveActivePrompt,
  isEventSourceExcluded
};
