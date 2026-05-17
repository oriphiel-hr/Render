/**
 * Pokreće prisma migrate deploy ako je DATABASE_URL postavljen.
 */
const { execSync } = require('child_process');
const path = require('path');

if (!String(process.env.DATABASE_URL || '').trim()) {
  console.log('[registar-rps] DATABASE_URL nije postavljen — preskačem migracije.');
  process.exit(0);
}

const backendRoot = path.join(__dirname, '..');
try {
  execSync('npx prisma migrate deploy', {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env
  });
  console.log('[registar-rps] Prisma migracije primijenjene.');
} catch (e) {
  console.error('[registar-rps] Prisma migrate deploy nije uspio:', e.message || e);
  process.exit(1);
}
