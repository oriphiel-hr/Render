const { PrismaClient } = require('@prisma/client');

/** @type {PrismaClient | null} */
let prisma = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isDatabaseConfigured() {
  return Boolean(String(process.env.DATABASE_URL || '').trim());
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
    msg.includes('database system is starting up') ||
    msg.includes('not yet accepting connections') ||
    msg.includes('consistent recovery state')
  );
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
 * Čeka dok PostgreSQL ne prihvati vezu (npr. Render recovery nakon restarta).
 * @param {{ maxWaitMs?: number, intervalMs?: number, label?: string }} [opts]
 */
async function waitForDatabase(opts = {}) {
  if (!isDatabaseConfigured()) {
    return false;
  }
  const maxWaitMs =
    opts.maxWaitMs != null
      ? opts.maxWaitMs
      : Number(process.env.DB_READY_MAX_WAIT_MS) || 180000;
  const intervalMs = opts.intervalMs != null ? opts.intervalMs : 2000;
  const label = opts.label || 'db';
  const t0 = Date.now();
  let attempt = 0;

  while (Date.now() - t0 < maxWaitMs) {
    attempt += 1;
    try {
      const db = getPrisma();
      await db.$queryRaw`SELECT 1`;
      const sec = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`[registar-rps] PostgreSQL spreman (${label}, ${sec}s, pokušaj ${attempt}).`);
      return true;
    } catch (err) {
      if (!isPrismaConnectionError(err)) {
        throw err;
      }
      await disconnectPrisma();
      const sec = Math.round((Date.now() - t0) / 1000);
      console.warn(
        `[registar-rps] PostgreSQL još nije spreman (${label}, ${sec}s, pokušaj ${attempt}): ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      await sleep(intervalMs);
    }
  }

  throw new Error(
    `PostgreSQL nije dostupan nakon ${Math.round(maxWaitMs / 1000)}s (${label}). ` +
      'Često uzrok: recovery nakon restarta instance — pokušaj ponovo za minutu.'
  );
}

/**
 * Ponovi operaciju nakon prekida veze (createMany tijekom dugog importa).
 */
async function withPrismaRetry(operation, opts = {}) {
  const maxRetries = opts.maxRetries != null ? opts.maxRetries : 5;
  const baseDelay = opts.retryDelayMs != null ? opts.retryDelayMs : 1500;
  let lastErr;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation(getPrisma());
    } catch (err) {
      lastErr = err;
      if (!isPrismaConnectionError(err) || attempt >= maxRetries) {
        throw err;
      }
      await disconnectPrisma();
      await sleep(baseDelay * attempt);
      await refreshPrismaConnection();
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
  withPrismaRetry,
  isPrismaConnectionError,
  getBatchSize
};
