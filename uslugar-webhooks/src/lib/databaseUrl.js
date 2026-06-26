/**
 * Render PostgreSQL internal host (npr. dpg-xxx-a) radi samo unutar Render mreže.
 * Vanjski host (dpg-xxx-a.<region>-postgres.render.com) treba lokalno i izvan Rendera.
 * Na samom Renderu ostavi internal URL — external odatle može zatvoriti vezu (P1017).
 */

const RENDER_INTERNAL_PG_HOST = /^dpg-[a-z0-9]+-a$/i;

function isOnRender() {
  return process.env.RENDER === 'true' || process.env.RENDER === '1';
}

function defaultPgRegion() {
  return (
    process.env.RENDER_PG_REGION ||
    process.env.RENDER_REGION ||
    'frankfurt'
  );
}

/**
 * @param {string | undefined} rawUrl
 * @returns {string | undefined}
 */
function normalizeRenderDatabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  if (isOnRender()) return rawUrl;

  const trimmed = rawUrl.trim();
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return rawUrl;
  }

  if (parsed.protocol !== 'postgresql:' && parsed.protocol !== 'postgres:') {
    return rawUrl;
  }

  const host = parsed.hostname;
  if (!RENDER_INTERNAL_PG_HOST.test(host)) return rawUrl;

  const region = defaultPgRegion();
  parsed.hostname = `${host}.${region}-postgres.render.com`;
  if (!parsed.searchParams.has('sslmode')) {
    parsed.searchParams.set('sslmode', 'require');
  }

  return parsed.toString();
}

/**
 * Sigurni sažetak connection stringa za log (bez lozinke).
 * @param {string | undefined} rawUrl
 * @returns {{ host: string, database: string } | null}
 */
function describeDatabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  try {
    const parsed = new URL(rawUrl.trim());
    const database = parsed.pathname.replace(/^\//, '') || '(unknown)';
    return { host: parsed.hostname, database };
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 */
function patchDatabaseEnvVar(key) {
  const current = process.env[key];
  if (!current) return;

  const normalized = normalizeRenderDatabaseUrl(current);
  if (normalized === current) return;

  process.env[key] = normalized;
  console.log(
    `[databaseUrl] ${key}: internal Render host → external (${defaultPgRegion()}-postgres.render.com)`
  );
}

function ensureDatabaseEnv() {
  patchDatabaseEnvVar('DATABASE_URL');
  for (const key of Object.keys(process.env)) {
    if (key.endsWith('_DATABASE_URL') && key !== 'DATABASE_URL') {
      patchDatabaseEnvVar(key);
    }
  }
}

module.exports = {
  defaultPgRegion,
  isOnRender,
  normalizeRenderDatabaseUrl,
  describeDatabaseUrl,
  ensureDatabaseEnv
};
