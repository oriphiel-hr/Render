/**
 * Snimanje social videa (TikTok/Reels/Shorts) pomoću Playwrighta.
 *
 * - Generira MP4/WebM (ovisno o Playwright build-u) kroz recordVideo
 * - Radi "češće screenshotove" u posebni folder (npr. svake 2s + na koracima)
 *
 * Env:
 *   BASE_URL, OUT_DIR (default: backend/public/docs/social)
 *   TEST_EMAIL_*, TEST_PASSWORD_* kao i za capture-docs-screenshots
 *   VIDEO_FORMAT = tiktok | youtube | facebook | square | all  (default: all)
 *   SCREENSHOT_INTERVAL_MS = 2000 (default)
 *   STEP_WAIT_MS = 2500 (default)
 */
import playwright from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'https://www.uslugar.eu';
const OUT_DIR = process.env.OUT_DIR || path.resolve(process.cwd(), 'public', 'docs', 'social');
const VIDEO_FORMAT = (process.env.VIDEO_FORMAT || 'all').toLowerCase();
const SCREENSHOT_INTERVAL_MS = parseInt(process.env.SCREENSHOT_INTERVAL_MS || '2000', 10);
const STEP_WAIT_MS = parseInt(process.env.STEP_WAIT_MS || '2500', 10);
const INCLUDE_EMAIL_DEMO = String(process.env.INCLUDE_EMAIL_DEMO || '').toLowerCase() === '1' ||
  String(process.env.INCLUDE_EMAIL_DEMO || '').toLowerCase() === 'true';

// Mailpit (test inbox) – ako nije set, email demo se preskače
const MAILPIT_API_URL = process.env.MAILPIT_API_URL || (process.env.MAILPIT_SMTP_HOST ? `http://${process.env.MAILPIT_SMTP_HOST}:10000/api/v1` : 'http://localhost:8025/api/v1');
const MAILPIT_WEB_URL = process.env.MAILPIT_WEB_URL || (process.env.MAILPIT_SMTP_HOST ? `http://${process.env.MAILPIT_SMTP_HOST}:10000` : 'http://localhost:8025');

const CREDENTIALS = {
  korisnik: { email: process.env.TEST_EMAIL_KORISNIK, password: process.env.TEST_PASSWORD_KORISNIK },
  pružatelj: { email: process.env.TEST_EMAIL_PRUVATELJ, password: process.env.TEST_PASSWORD_PRUVATELJ },
  tim_clan: { email: process.env.TEST_EMAIL_TIM_CLAN, password: process.env.TEST_PASSWORD_TIM_CLAN },
  direktor: { email: process.env.TEST_EMAIL_DIREKTOR, password: process.env.TEST_PASSWORD_DIREKTOR },
};

const FORMATS = {
  // TikTok / Reels / Shorts
  tiktok: { width: 1080, height: 1920, label: 'tiktok-9x16' },
  // YouTube (standard)
  youtube: { width: 1920, height: 1080, label: 'youtube-16x9' },
  // Facebook feed-ish (works ok)
  facebook: { width: 1280, height: 720, label: 'facebook-16x9' },
  // Square
  square: { width: 1080, height: 1080, label: 'square-1x1' },
};

const STEPS = [
  { name: 'landing-login', hash: '#login', role: null },
  { name: 'user-dashboard', hash: '#user', role: 'korisnik' },
  { name: 'user-my-jobs', hash: '#my-jobs', role: 'korisnik' },
  { name: 'provider-leads', hash: '#leads', role: 'pružatelj' },
  { name: 'provider-roi', hash: '#roi', role: 'pružatelj' },
  { name: 'director', hash: '#director', role: 'direktor' },
  { name: 'team-my-leads', hash: '#my-leads', role: 'tim_clan' },
  { name: 'chat', hash: '#chat', role: 'korisnik' },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function buildUrl(hash) {
  const baseWithoutHash = BASE_URL.split('#')[0];
  const hashPart = hash.startsWith('#') ? hash : '#' + hash;
  return `${baseWithoutHash}?screenshotMode=docs${hashPart}`;
}

async function waitForMailpitEmail({ recipientEmail, subjectKeywords = [], timeoutMs = 25000 }) {
  const start = Date.now();
  const wanted = (subjectKeywords || []).map((s) => String(s).toLowerCase());
  while (Date.now() - start < timeoutMs) {
    try {
      const { data } = await axios.get(`${MAILPIT_API_URL}/messages`, { timeout: 8000 });
      const messages = data.messages || data || [];
      const match = messages.find((m) => {
        const to = m.To || [];
        const toArr = Array.isArray(to) ? to : [to];
        const toStr = toArr
          .map((t) => (typeof t === 'string' ? t : t.Address || t.email || ''))
          .join(' ')
          .toLowerCase();
        const subj = String(m.Subject || '').toLowerCase();
        const okTo = recipientEmail ? toStr.includes(String(recipientEmail).toLowerCase()) : true;
        const okSubj = wanted.length === 0 ? true : wanted.some((k) => subj.includes(k));
        return okTo && okSubj;
      });
      if (match) return match;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 1200));
  }
  return null;
}

async function recordEmailClickSegment(page, takeShot) {
  // Segment: pokaži email u Mailpit web view i klikni verify link
  try {
    const { prisma } = await import('../src/lib/prisma.js');
    const { sendVerificationEmail } = await import('../src/lib/email.js');

    const ts = Date.now();
    const demoEmail = `video-demo+${ts}@example.test`;
    const token = `video_${ts}_${Math.random().toString(36).slice(2)}`;

    // Kreiraj/azuriraj korisnika s verificationToken (da klik ima smisla)
    await prisma.user.upsert({
      where: { email_role: { email: demoEmail, role: 'USER' } },
      update: { verificationToken: token, tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60), isVerified: false, fullName: 'Video Demo Korisnik' },
      create: {
        email: demoEmail,
        role: 'USER',
        fullName: 'Video Demo Korisnik',
        passwordHash: '$2a$10$2k4mY5pQhF/2u8g3kq7g1eZB3xJ6xZtK1zQZp9pWm2p2bQb0QeY8G', // dummy; login nije potreban
        isVerified: false,
        verificationToken: token,
        tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    // Pošalji verification email (mora ići u Mailpit)
    await sendVerificationEmail(demoEmail, 'Video Demo Korisnik', token);

    await takeShot('email-sent');

    const msg = await waitForMailpitEmail({
      recipientEmail: demoEmail,
      subjectKeywords: ['potvrdite', 'verify', 'verifik'],
      timeoutMs: 30000,
    });
    if (!msg?.ID && !msg?.Id && !msg?.id) {
      console.warn('[EMAIL DEMO] Nije pronađen mail u Mailpit-u. Preskačem segment.');
      return;
    }
    const messageId = msg.ID || msg.Id || msg.id;

    // Otvori HTML preview maila (Mailpit web)
    const emailHtmlUrl = `${MAILPIT_WEB_URL}/view/${messageId}.html`;
    await page.goto(emailHtmlUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    await takeShot('email-inbox');

    // Klikni prvi link u mailu (verify/reset) ako postoji
    const link = await page.$('a[href]');
    if (link) {
      const href = await link.getAttribute('href');
      await link.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(2500);
      await takeShot('email-click-result');
      console.log('[EMAIL DEMO] Clicked:', href);
    } else {
      console.warn('[EMAIL DEMO] Nema linkova u HTML preview-u.');
    }
  } catch (e) {
    console.warn('[EMAIL DEMO] Segment failed:', e.message);
  }
}

async function login(page, role) {
  const cred = CREDENTIALS[role];
  if (!cred?.email || !cred?.password) {
    console.warn(`[SKIP] Nema kredencijala za ${role}.`);
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

async function runForFormat(fmtKey) {
  const fmt = FORMATS[fmtKey];
  const label = fmt.label;

  const outBase = path.join(OUT_DIR, label);
  const outShots = path.join(outBase, 'shots');
  const outVideoDir = path.join(outBase, 'videos');
  ensureDir(outShots);
  ensureDir(outVideoDir);

  console.log('FORMAT:', label, `${fmt.width}x${fmt.height}`);
  console.log('OUT:', outBase);

  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: fmt.width, height: fmt.height },
    deviceScaleFactor: 1,
    recordVideo: { dir: outVideoDir, size: { width: fmt.width, height: fmt.height } },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });

  const page = await context.newPage();
  let lastRole = null;
  let shotIdx = 0;
  let timer = null;

  const takeShot = async (tag) => {
    const file = `${String(++shotIdx).padStart(3, '0')}-${tag}.png`;
    const p = path.join(outShots, file);
    await page.screenshot({ path: p, fullPage: false });
  };

  try {
    timer = setInterval(() => {
      // best-effort periodic screenshots
      takeShot('interval').catch(() => {});
    }, SCREENSHOT_INTERVAL_MS);

    if (INCLUDE_EMAIL_DEMO) {
      console.log('[EMAIL DEMO] enabled. MAILPIT_API_URL=', MAILPIT_API_URL, 'MAILPIT_WEB_URL=', MAILPIT_WEB_URL);
      await recordEmailClickSegment(page, takeShot);
    }

    for (const step of STEPS) {
      if (step.role && step.role !== lastRole) {
        const ok = await login(page, step.role);
        if (!ok) {
          console.log(`[SKIP] step=${step.name} (nema kredencijala)`);
          lastRole = step.role;
          continue;
        }
        lastRole = step.role;
      } else if (!step.role) {
        lastRole = null;
      }

      const url = buildUrl(step.hash);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(STEP_WAIT_MS);
      await takeShot(step.name);
      console.log('OK step:', step.name);
    }
  } finally {
    if (timer) clearInterval(timer);
    await page.close();
    await context.close();
    await browser.close();
  }

  // Playwright sprema video per page u recordVideo dir; naziv je random.
  // Sačuvaj "manifest" za admin pregled.
  const videos = fs.readdirSync(outVideoDir).filter((f) => f.endsWith('.webm') || f.endsWith('.mp4'));
  const shots = fs.readdirSync(outShots).filter((f) => f.endsWith('.png'));
  fs.writeFileSync(
    path.join(outBase, 'manifest.json'),
    JSON.stringify({ format: fmtKey, label, baseUrl: BASE_URL, videos, shots, ts: new Date().toISOString() }, null, 2)
  );

  console.log('DONE:', label, 'videos=', videos.length, 'shots=', shots.length);
}

async function main() {
  ensureDir(OUT_DIR);
  const selected = VIDEO_FORMAT === 'all' ? Object.keys(FORMATS) : [VIDEO_FORMAT];
  for (const fmtKey of selected) {
    if (!FORMATS[fmtKey]) {
      console.warn('Unknown VIDEO_FORMAT:', fmtKey);
      continue;
    }
    await runForFormat(fmtKey);
  }
  console.log('Gotovo. Social videi u:', OUT_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

