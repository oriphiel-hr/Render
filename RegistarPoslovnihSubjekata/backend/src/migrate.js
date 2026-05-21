/**
 * Čeka PostgreSQL, zatim prisma migrate deploy.
 * Prije deploya i nakon P3009: resolve failed migracije 20260520120000 (pogrešan dataset_key u SQL-u).
 */
const { execSync } = require('child_process');
const path = require('path');
const { waitForDatabase, isDatabaseConfigured, disconnectPrisma } = require('./lib/prisma');

const BACKEND_ROOT = path.join(__dirname, '..');
const FAILED_MIGRATION = '20260520120000_maticni_change_log';

function runPrisma(args) {
  return execSync(`npx prisma ${args}`, {
    cwd: BACKEND_ROOT,
    encoding: 'utf8',
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 20 * 1024 * 1024
  });
}

function teeOutput(text, isErr) {
  if (!text) return;
  (isErr ? process.stderr : process.stdout).write(text);
}

function combinedOutput(err) {
  const parts = [];
  if (err.stdout) parts.push(String(err.stdout));
  if (err.stderr) parts.push(String(err.stderr));
  if (err.message) parts.push(String(err.message));
  return parts.join('\n');
}

function outputIndicatesFailedMigration(text) {
  const t = String(text || '');
  return (
    t.includes(FAILED_MIGRATION) &&
    (t.includes('P3009') ||
      t.includes('failed migrations') ||
      t.includes('have failed') ||
      t.includes('following migration') ||
      /failed/i.test(t))
  );
}

function tryResolveRolledBackFailedMigration() {
  console.warn(
    `[registar-rps] resolve --rolled-back "${FAILED_MIGRATION}" (ponovna primjena ispravljene migracije)…`
  );
  try {
    const out = runPrisma(`migrate resolve --rolled-back "${FAILED_MIGRATION}"`);
    teeOutput(out, false);
    return true;
  } catch (e) {
    const text = combinedOutput(e);
    teeOutput(text, true);
    console.warn('[registar-rps] migrate resolve:', text.slice(0, 500));
    return false;
  }
}

function recoverFailedMigrationsBeforeDeploy() {
  try {
    const status = runPrisma('migrate status');
    teeOutput(status, false);
    if (outputIndicatesFailedMigration(status)) {
      return tryResolveRolledBackFailedMigration();
    }
  } catch (e) {
    const text = combinedOutput(e);
    teeOutput(text, true);
    if (outputIndicatesFailedMigration(text)) {
      return tryResolveRolledBackFailedMigration();
    }
  }
  return false;
}

function migrateDeployOnce() {
  try {
    const out = runPrisma('migrate deploy');
    teeOutput(out, false);
    return true;
  } catch (e) {
    const text = combinedOutput(e);
    teeOutput(text, true);
    const err = new Error(text || e.message || 'migrate deploy failed');
    err.migrateOutput = text;
    throw err;
  }
}

async function runMigrateDeploy() {
  const maxAttempts = Number(process.env.MIGRATE_MAX_ATTEMPTS) || 3;
  recoverFailedMigrationsBeforeDeploy();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      migrateDeployOnce();
      return;
    } catch (e) {
      const text = e.migrateOutput || combinedOutput(e);

      if (outputIndicatesFailedMigration(text) && tryResolveRolledBackFailedMigration()) {
        try {
          migrateDeployOnce();
          return;
        } catch (retryErr) {
          if (attempt >= maxAttempts) throw retryErr;
        }
      } else if (attempt >= maxAttempts) {
        throw e;
      }

      console.warn(
        `[registar-rps] migrate deploy pokušaj ${attempt}/${maxAttempts} nije uspio — čekam bazu…`
      );
      await disconnectPrisma();
      await waitForDatabase({ label: 'migrate-retry', maxWaitMs: 120000 });
    }
  }
}

async function main() {
  if (!isDatabaseConfigured()) {
    console.log('[registar-rps] DATABASE_URL nije postavljen — preskačem migracije.');
    return;
  }

  console.log('[registar-rps] Čekam PostgreSQL prije migracija…');
  await waitForDatabase({ label: 'migrate', maxWaitMs: Number(process.env.DB_READY_MAX_WAIT_MS) || 300000 });
  await runMigrateDeploy();
  await disconnectPrisma();
  console.log('[registar-rps] Prisma migracije primijenjene.');
}

main().catch((e) => {
  console.error('[registar-rps] Prisma migrate deploy nije uspio:', e.message || e);
  process.exit(1);
});
