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
    msg.includes('econnreset') ||
    msg.includes('cannot reach database') ||
    msg.includes('can not reach database')
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
 * Ponovi operaciju nakon prekida veze (createMany tijekom dugog importa).
 * @param {(db: PrismaClient) => Promise<T>} operation
 * @param {{ maxRetries?: number, retryDelayMs?: number }} [opts]
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
  withPrismaRetry,
  isPrismaConnectionError,
  getBatchSize
};
