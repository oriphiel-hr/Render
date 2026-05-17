const { PrismaClient } = require('@prisma/client');

/** @type {PrismaClient | null} */
let prisma = null;

/** @type {Promise<boolean> | null} */
let dbReadyPromise = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isDatabaseConfigured() {
  return Boolean(String(process.env.DATABASE_URL || '').trim());
}

function getDefaultMaxWaitMs() {
  const n = Number(process.env.DB_READY_MAX_WAIT_MS);
  return Number.isFinite(n) && n > 0 ? n : 300000;
}

function getBatchSize() {
  const n = Number(process.env.PRISMA_BATCH_SIZE);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 200;
}

function isPrismaConnectionError(err) {
  const msg = String(err?.message || err).toLowerCase();
  const code = String(err?.code || '');
  return (
    code === 'P1017' ||
    code === 'P1001' ||
    code === 'P1008' ||
    code === 'P2024' ||
    msg.includes('server has closed the connection') ||
    msg.includes('connection terminated') ||
    msg.includes('connection closed') ||
    msg.includes('connection refused') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('cannot reach database') ||
    msg.includes('can not reach database') ||
    msg.includes("can't reach database") ||
    msg.includes('database system is starting up') ||
    msg.includes('not yet accepting connections') ||
    msg.includes('consistent recovery state')
  );
}

function markDatabaseUnavailable() {
  dbReadyPromise = null;
}

/**
 * Jednom čeka bazu; paralelni pozivi dijele isti promise.
 */
function ensureDatabaseReady(opts = {}) {
  if (!isDatabaseConfigured()) {
    return Promise.resolve(false);
  }
  if (dbReadyPromise) {
    return dbReadyPromise;
  }
  dbReadyPromise = waitForDatabase(opts).catch((err) => {
    dbReadyPromise = null;
    throw err;
  });
  return dbReadyPromise;
}

function getPrisma() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL nije postavljen — baza nije dostupna.');
  }
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.PRISMA_LOG === '1' ? ['error', 'warn'] : []
    });
  }
  return prisma;
}

async function disconnectPrisma() {
  if (prisma) {
    try {
      await prisma.$disconnect();
    } catch (_) {
      /* već odspojeno */
    }
    prisma = null;
  }
}

/** Nova veza nakon Render/Postgres timeouta. */
async function refreshPrismaConnection() {
  await disconnectPrisma();
  const db = getPrisma();
  await db.$queryRaw`SELECT 1`;
  return db;
}

/**
 * Čeka dok PostgreSQL ne prihvati vezu (npr. Render recovery ~30–90 s nakon restarta).
 */
async function waitForDatabase(opts = {}) {
  if (!isDatabaseConfigured()) {
    return false;
  }
  const maxWaitMs = opts.maxWaitMs != null ? opts.maxWaitMs : getDefaultMaxWaitMs();
  const baseInterval = opts.intervalMs != null ? opts.intervalMs : 2000;
  const label = opts.label || 'db';
  const t0 = Date.now();
  let attempt = 0;

  while (Date.now() - t0 < maxWaitMs) {
    attempt += 1;
    try {
      await disconnectPrisma();
      const db = getPrisma();
      await db.$queryRaw`SELECT 1`;
      const sec = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`[registar-rps] PostgreSQL spreman (${label}, ${sec}s, pokušaj ${attempt}).`);
      return true;
    } catch (err) {
      if (!isPrismaConnectionError(err)) {
        throw err;
      }
      const sec = Math.round((Date.now() - t0) / 1000);
      const delay = Math.min(30000, baseInterval * Math.pow(2, Math.min(attempt - 1, 4)));
      console.warn(
        `[registar-rps] PostgreSQL još nije spreman (${label}, ${sec}s, sljedeći pokušaj za ${Math.round(delay / 1000)}s): ${
          err instanceof Error ? err.message.split('\n')[0] : String(err)
        }`
      );
      await sleep(delay);
    }
  }

  throw new Error(
    `PostgreSQL nije dostupan nakon ${Math.round(maxWaitMs / 1000)}s (${label}). ` +
      'Render Postgres često treba 30–90 s recovery nakon restarta — pričekaj pa ponovi.'
  );
}

/**
 * Ponovi operaciju nakon prekida veze; pri prvom i svakom prekidu čeka oporavak baze.
 */
async function withPrismaRetry(operation, opts = {}) {
  const maxRetries = opts.maxRetries != null ? opts.maxRetries : 10;
  const waitMs = opts.waitMs != null ? opts.waitMs : 120000;
  let lastErr;

  await ensureDatabaseReady({ label: 'prisma', maxWaitMs: waitMs });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation(getPrisma());
    } catch (err) {
      lastErr = err;
      if (!isPrismaConnectionError(err) || attempt >= maxRetries) {
        throw err;
      }
      markDatabaseUnavailable();
      await disconnectPrisma();
      console.warn(
        `[registar-rps] Baza nedostupna (${attempt}/${maxRetries}), čekam oporavak…`
      );
      await waitForDatabase({ label: `retry-${attempt}`, maxWaitMs: waitMs });
      dbReadyPromise = Promise.resolve(true);
    }
  }
  throw lastErr;
}

module.exports = {
  getPrisma,
  isDatabaseConfigured,
  disconnectPrisma,
  refreshPrismaConnection,
  waitForDatabase,
  ensureDatabaseReady,
  markDatabaseUnavailable,
  withPrismaRetry,
  isPrismaConnectionError,
  getBatchSize,
  getDefaultMaxWaitMs
};
