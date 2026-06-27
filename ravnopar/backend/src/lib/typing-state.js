const typingByPair = new Map();
const TTL_MS = 4000;

function key(pairId, profileId) {
  return `${pairId}:${profileId}`;
}

export function setTyping(pairId, profileId) {
  typingByPair.set(key(pairId, profileId), Date.now() + TTL_MS);
}

export function getTypingInPair(pairId, excludeProfileId) {
  const now = Date.now();
  const active = [];
  for (const [compound, expiresAt] of typingByPair.entries()) {
    if (expiresAt < now) {
      typingByPair.delete(compound);
      continue;
    }
    const [pid, profileId] = compound.split(':');
    if (pid === pairId && profileId !== excludeProfileId) {
      active.push(profileId);
    }
  }
  return active;
}
