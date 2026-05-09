/**
 * Profil u META_WEBHOOK_PROFILES (npr. instant-game) → META_INSTANT_GAME_* env varijable
 */
function metaEnvPrefix(profile) {
  return 'META_' + String(profile).trim().replace(/-/g, '_').toUpperCase();
}

function parseWebhookProfiles() {
  const raw = process.env.META_WEBHOOK_PROFILES || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

module.exports = { metaEnvPrefix, parseWebhookProfiles };
