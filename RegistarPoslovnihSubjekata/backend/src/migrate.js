/**
 * Čeka PostgreSQL (recovery nakon restarta), zatim prisma migrate deploy.
 * Oporavak: failed migracija 20260520120000 (pogrešan dataset_key) → resolve rolled-back + retry.
 */
const { execSync } = require('child_process');
const path = require('path');
const { waitForDatabase, isDatabaseConfigured, disconnectPrisma } = require('./lib/prisma');

const BACKEND_ROOT = path.join(__dirname, '..');
const FAILED_MIGRATION = '20260520120000_maticni_change_log';

function runPrisma(args, opts = {}) {
  return execSync(`npx prisma ${args}`, {
    cwd: BACKEND_ROOT,
    encoding: 'utf8',
    env: process.env,
    stdio: opts.inherit ? 'inherit' : ['pipe', 'pipe', 'pipe']
  });
}

function combinedOutput(err) {
  const parts = [];
  if (err.stdout) parts.push(String(err.stdout));
  if (err.stderr) parts.push(String(err.stderr));
  if (err.message) parts.push(String(err.message));
  return parts.join('\n');
}

function isFailedMigrationBlocked(output) {
  return output.includes('P3009') && output.includes(FAILED_MIGRATION);
}

function tryResolveRolledBackFailedMigration() {
  console.warn(
    `[registar-rps] Migracija ${FAILED_MIGRATION} označena kao failed — resolve --rolled-back i ponovni deploy…`
  );
  try {
    runPrisma(`migrate resolve --rolled-back "${FAILED_MIGRATION}"`);
    return true;
  } catch (e) {
    console.warn('[registar-rps] migrate resolve nije uspio:', combinedOutput(e));
    return false;
  }
}

async function runMigrateDeploy() {
  const maxAttempts = Number(process.env.MIGRATE_MAX_ATTEMPTS) || 3;
  let resolvedFailed = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      runPrisma('migrate deploy', { inherit: true });
      return;
    } catch (e) {
      const out = combinedOutput(e);

      if (!resolvedFailed && isFailedMigrationBlocked(out)) {
        if (tryResolveRolledBackFailedMigration()) {
          resolvedFailed = true;
          try {
            runPrisma('migrate deploy', { inherit: true });
            return;
          } catch (retryErr) {
            if (attempt >= maxAttempts) throw retryErr;
          }
        }
      }

      if (attempt >= maxAttempts) {
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
