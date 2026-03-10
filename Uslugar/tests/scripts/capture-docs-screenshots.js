/**
 * Snimanje screenshotova za vodič dokumentacije (sve uloge).
 * Koristi Playwright; pokreće se iz roota projekta:
 *
 *   cd tests && node scripts/capture-docs-screenshots.js
 *
 * Env varijable (opcionalno):
 *   BASE_URL          = https://www.uslugar.eu  (ili http://localhost:5173 za lokalno)
 *   OUT_DIR           = putanja do frontend/public/docs (default: ../../frontend/public/docs)
 *   TEST_EMAIL_KORISNIK, TEST_PASSWORD_KORISNIK   = za ulogu korisnik
 *   TEST_EMAIL_PRUVATELJ, TEST_PASSWORD_PRUVATELJ = za ulogu pružatelj
 *   TEST_EMAIL_TIM_CLAN, TEST_PASSWORD_TIM_CLAN   = za ulogu član tima
 *   TEST_EMAIL_DIREKTOR, TEST_PASSWORD_DIREKTOR   = za ulogu direktor
 *
 * Ako nemaš testnih računa, možeš pokrenuti samo javne stranice (bez login*).
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'https://www.uslugar.eu';
const OUT_DIR = process.env.OUT_DIR || path.resolve(__dirname, '../../frontend/public/docs');

/** Lista screenshotova: filename, hash, role za login (null = javna stranica) */
const SCREENSHOTS = [
  // --- Korisnik usluge
  { file: 'guide-korisnik-1.png', hash: '#login', role: null },
  { file: 'guide-korisnik-2.png', hash: '#user', role: 'korisnik' },
  { file: 'moji-poslovi-mock.png', hash: '#my-jobs', role: 'korisnik' },
  { file: 'guide-korisnik-4.png', hash: '#chat', role: 'korisnik' },
  { file: 'guide-korisnik-5.png', hash: '#my-jobs', role: 'korisnik' },
  { file: 'guide-korisnik-6.png', hash: '#user', role: 'korisnik' },
  // --- Pružatelj
  { file: 'guide-pruzatelj-1.png', hash: '#register-provider', role: null },
  { file: 'guide-pruzatelj-2.png', hash: '#leads', role: 'pružatelj' },
  { file: 'guide-pruzatelj-3.png', hash: '#leads', role: 'pružatelj' },
  { file: 'moji-leadovi-direktor-mock.png', hash: '#my-leads', role: 'direktor' },
  { file: 'guide-pruzatelj-5.png', hash: '#pricing', role: null },
  { file: 'guide-pruzatelj-6.png', hash: '#roi', role: 'pružatelj' },
  // --- Član tima
  { file: 'guide-tim-1.png', hash: '#my-leads', role: 'tim_clan' },
  { file: 'moji-leadovi-team-member-mock.png', hash: '#my-leads', role: 'tim_clan' },
  { file: 'guide-tim-3.png', hash: '#chat', role: 'tim_clan' },
  { file: 'guide-tim-4.png', hash: '#chat', role: 'tim_clan' },
  { file: 'director-dashboard-lead-queue-mock.png', hash: '#director', role: 'direktor' },
];

const CREDENTIALS = {
  korisnik: {
    email: process.env.TEST_EMAIL_KORISNIK,
    password: process.env.TEST_PASSWORD_KORISNIK,
  },
  pružatelj: {
    email: process.env.TEST_EMAIL_PRUVATELJ,
    password: process.env.TEST_PASSWORD_PRUVATELJ,
  },
  tim_clan: {
    email: process.env.TEST_EMAIL_TIM_CLAN,
    password: process.env.TEST_PASSWORD_TIM_CLAN,
  },
  direktor: {
    email: process.env.TEST_EMAIL_DIREKTOR,
    password: process.env.TEST_PASSWORD_DIREKTOR,
  },
};

async function login(page, role) {
  const cred = CREDENTIALS[role];
  if (!cred?.email || !cred?.password) {
    console.warn(`[SKIP] Nema TEST_EMAIL_${role.toUpperCase()} / TEST_PASSWORD_${role.toUpperCase()} – preskačem login.`);
    return false;
  }
  await page.goto(`${BASE_URL}#login`, { waitUntil: 'networkidle' });
  await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 10000 });
  await page.fill('input[name="email"], input[type="email"]', cred.email);
  await page.fill('input[name="password"], input[type="password"]', cred.password);
  await page.click('form[aria-label="Prijava forma"] button[type="submit"], button[type="submit"]');
  await page.waitForTimeout(3000);
  return true;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('OUT_DIR:', OUT_DIR);
  console.log('BASE_URL:', BASE_URL);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });

  let lastRole = null;

  for (const { file, hash, role } of SCREENSHOTS) {
    const page = await context.newPage();
    try {
      if (role && role !== lastRole) {
        const ok = await login(page, role);
        if (!ok) {
          console.log(`[SKIP] ${file} (nema kredencijala za ${role})`);
          await page.close();
          continue;
        }
        lastRole = role;
      } else if (!role) {
        lastRole = null;
      }

      const url = `${BASE_URL}${hash.startsWith('#') ? hash : '#' + hash}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);

      const outPath = path.join(OUT_DIR, file);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log('OK:', file);
    } catch (err) {
      console.error('ERR:', file, err.message);
    }
    await page.close();
  }

  await browser.close();
  console.log('Gotovo. Screenshotovi u:', OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
