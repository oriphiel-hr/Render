/**
 * Lokalno generiraj testne korisnike za screenshotove + demo podatke
 * (Tržnica, ROI, Moji leadovi, Chat).
 *
 * Pokretanje (iz mape backend):
 *   node scripts/seed-screenshot-users.js
 *
 * Ili iz roota repozitorija:
 *   node backend/scripts/seed-screenshot-users.js
 */
import 'dotenv/config';
import { ensureScreenshotTestUsers } from '../src/services/screenshot-test-users-service.js';
import { ensureScreenshotDemoData } from '../src/services/screenshot-demo-data-service.js';

async function main() {
  console.log('Generiranje testnih korisnika i demo podataka...\n');

  const { users, password } = await ensureScreenshotTestUsers();
  console.log('Korisnici:', users.map((u) => `${u.fullName} (${u.role}) – ${u.email}`).join(', '));
  console.log('Lozinka:', password, '\n');

  const demo = await ensureScreenshotDemoData();
  if (demo.ok) {
    console.log('Demo podaci dodani:', demo.jobsCreated, 'poslova,', demo.leadsPurchased, 'kupljenih leadova.');
    console.log('Prijavi se kao pružatelj da vidiš Tržnicu, ROI, Moji leadovi i Chat.');
  } else {
    console.log('Demo podaci nisu dodani:', demo.reason || '');
  }

  console.log('\nGotovo.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
