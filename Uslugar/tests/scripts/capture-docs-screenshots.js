/**
 * Snimanje screenshotova za vodič dokumentacije (sve uloge).
 * Koristi Playwright; pokreće se iz roota projekta:
 *
 *   cd tests && node scripts/capture-docs-screenshots.js
 *
 * Env varijable (opcionalno):
 *   BASE_URL          = https://www.uslugar.eu  (ili http://localhost:5173 za lokalno)
 *   OUT_DIR           = putanja do frontend/public/docs (default: ../../frontend/public/docs)
 *
 * Za BASE_URL=localhost prvo u drugom terminalu pokreni: cd frontend && npm run dev
 *   TEST_EMAIL_KORISNIK, TEST_PASSWORD_KORISNIK   = za ulogu korisnik
 *   TEST_EMAIL_PRUVATELJ, TEST_PASSWORD_PRUVATELJ = za ulogu pružatelj
 *   TEST_EMAIL_TIM_CLAN, TEST_PASSWORD_TIM_CLAN   = za ulogu član tima
 *   TEST_EMAIL_DIREKTOR, TEST_PASSWORD_DIREKTOR   = za ulogu direktor
 *
 * Ako nemaš testnih računa, možeš pokrenuti samo javne stranice (bez login*).
 * Za kredencijale u mapi tests pokreni: . .\scripts\set-screenshot-env.ps1
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'https://www.uslugar.eu';
const OUT_DIR = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR)
  : path.resolve(__dirname, '..', '..', 'frontend', 'public', 'docs');
const SCREENSHOT_STAMP = process.env.SCREENSHOT_STAMP || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

/** Ako je BASE_URL localhost, provjeri je li server pokrenut; ako ne, ispiši upute i izađi. */
function checkBaseUrlReachable() {
  const isLocal = /localhost|127\.0\.0\.1/i.test(BASE_URL);
  if (!isLocal) return Promise.resolve();
  const url = new URL(BASE_URL);
  const client = url.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.get(BASE_URL, (res) => {
      res.resume();
      resolve();
    });
    req.on('error', (err) => reject(err));
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('timeout')); });
  }).catch(() => {
    console.error('\nFrontend nije dostupan na', BASE_URL);
    console.error('U drugom terminalu pokreni: cd frontend && npm run dev');
    console.error('Zatim ponovno: cd tests && npm run screenshots:docs\n');
    process.exit(1);
  });
}

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
  // guide-pruzatelj-1: stranica registracije (Postani pružatelj / register-user). NE smije biti "Objavite svoj posao" – to je za korisnika.
  { file: 'guide-pruzatelj-1.png', hash: '#register-provider', role: null },
  { file: 'guide-pruzatelj-2.png', hash: '#leads', role: 'pružatelj' },
  { file: 'guide-pruzatelj-3.png', hash: '#leads', role: 'pružatelj' },
  { file: 'moji-leadovi-direktor-mock.png', hash: '#my-leads', role: 'direktor' },
  { file: 'guide-pruzatelj-5.png', hash: '#pricing', role: null },
  { file: 'guide-pruzatelj-6.png', hash: '#roi', role: 'pružatelj' },
  // --- Financije / paketi / refund (prosireni demo)
  { file: 'guide-finance-pricing-packages.png', hash: '#pricing', role: null },
  { file: 'guide-finance-subscription-packages.png', hash: '#subscription', role: 'pružatelj' },
  { file: 'guide-finance-invoices-list.png', hash: '#invoices', role: 'direktor' },
  { file: 'guide-refund-provider-my-leads.png', hash: '#my-leads', role: 'pružatelj' },
  { file: 'guide-refund-director-my-leads.png', hash: '#my-leads', role: 'direktor' },
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
  await checkBaseUrlReachable();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('OUT_DIR:', OUT_DIR);
  console.log('BASE_URL:', BASE_URL);
  console.log('SCREENSHOT_STAMP:', SCREENSHOT_STAMP);

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

      // Dodaj screenshotMode=docs query param za frontend (prikaz demo leadova u vodiču, bez utjecaja na produkciju)
      const baseWithoutHash = BASE_URL.split('#')[0];
      const hashPart = hash.startsWith('#') ? hash : '#' + hash;
      const url = `${baseWithoutHash}?screenshotMode=docs&screenshotStamp=${encodeURIComponent(SCREENSHOT_STAMP)}${hashPart}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);

      const outPath = path.resolve(OUT_DIR, file);
      await page.screenshot({ path: outPath, fullPage: false });
      const exists = fs.existsSync(outPath);
      console.log(exists ? `OK: ${file} -> ${outPath}` : `WARN: ${file} nije na disku: ${outPath}`);
    } catch (err) {
      console.error('ERR:', file, err.message);
    }
    await page.close();
  }

  await browser.close();
  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.png'));
  console.log('Gotovo. Screenshotovi u:', OUT_DIR);
  console.log('Broj .png datoteka na disku:', files.length);
  if (files.length > 0) {
    files.forEach((f) => console.log('  -', f));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
