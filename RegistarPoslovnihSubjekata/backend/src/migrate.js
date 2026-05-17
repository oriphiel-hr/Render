/**
 * Čeka PostgreSQL (recovery nakon restarta), zatim prisma migrate deploy.
 */
const { execSync } = require('child_process');
const path = require('path');
const { waitForDatabase, isDatabaseConfigured, disconnectPrisma } = require('./lib/prisma');

async function runMigrateDeploy() {
  const backendRoot = path.join(__dirname, '..');
  const maxAttempts = Number(process.env.MIGRATE_MAX_ATTEMPTS) || 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync('npx prisma migrate deploy', {
        cwd: backendRoot,
        stdio: 'inherit',
        env: process.env
      });
      return;
    } catch (e) {
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
  await waitForDatabase({ label: 'migrate' });
  await runMigrateDeploy();
  await disconnectPrisma();
  console.log('[registar-rps] Prisma migracije primijenjene.');
}

main().catch((e) => {
  console.error('[registar-rps] Prisma migrate deploy nije uspio:', e.message || e);
  process.exit(1);
});
