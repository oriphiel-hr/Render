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
 *   „all” = tiktok + youtube + facebook (bez square – brže; square eksplicitno)
 *   SCREENSHOT_INTERVAL_MS, STEP_WAIT_MS – kraći = brže generiranje, manji video
 *   MAX_EXTRA_SHOTS_PER_STEP – max dodatnih PNG-ova po koraku nakon početnog (default 1)
 *   VIDEO_PACE_* – ms pauze (login, klik u mailu, prije screenshot-a); niže = življi video
 */
import playwright from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'https://www.uslugar.eu';
const OUT_DIR = process.env.OUT_DIR || path.resolve(process.cwd(), 'public', 'docs', 'social');
const VIDEO_FORMAT = (process.env.VIDEO_FORMAT || 'all').toLowerCase();
const SCREENSHOT_INTERVAL_MS = parseInt(process.env.SCREENSHOT_INTERVAL_MS || '900', 10);
const STEP_WAIT_MS = parseInt(process.env.STEP_WAIT_MS || '900', 10);
const MAX_EXTRA_SHOTS_PER_STEP = Math.max(0, parseInt(process.env.MAX_EXTRA_SHOTS_PER_STEP || '1', 10));

/** Pauze u snimci – kraće = klik i prijelazi djeluju „življe”, ne kao usporena snimka */
const VIDEO_PACE_MS = {
  loginPageAfterGoto: Math.max(0, parseInt(process.env.VIDEO_PACE_LOGIN_PAGE_MS || '450', 10)),
  loginAfterSubmit: Math.max(0, parseInt(process.env.VIDEO_PACE_AFTER_LOGIN_SUBMIT_MS || '900', 10)),
  loginRetryBackoff: Math.max(0, parseInt(process.env.VIDEO_PACE_LOGIN_RETRY_MS || '500', 10)),
  beforeScreenshot: Math.max(0, parseInt(process.env.VIDEO_PACE_BEFORE_SHOT_MS || '100', 10)),
  screenshotRetry: Math.max(0, parseInt(process.env.VIDEO_PACE_SHOT_RETRY_MS || '350', 10)),
  emailAfterMailView: Math.max(0, parseInt(process.env.VIDEO_PACE_EMAIL_MAILVIEW_MS || '500', 10)),
  emailAfterVerifyClick: Math.max(0, parseInt(process.env.VIDEO_PACE_EMAIL_AFTER_CLICK_MS || '700', 10)),
};
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

// Isti omjeri kao ciljni exporti (1080x1920, 1920x1080, 1080x1350) da sadržaj ne "curi" iz kadra pri uskom prikazu
const FORMATS = {
  tiktok: { width: 1080, height: 1920, label: 'tiktok-9x16' },
  youtube: { width: 1920, height: 1080, label: 'youtube-16x9' },
  facebook: { width: 1080, height: 1350, label: 'facebook-4-5' },
  square: { width: 1080, height: 1080, label: 'square-1x1' },
};

/** Za „all” samo tri formata (bez square) – ušteda ~25% vremena; square: VIDEO_FORMAT=square */
const FORMAT_KEYS_ALL = ['tiktok', 'youtube', 'facebook'];

const STEPS = [
  { name: 'landing-login', hash: '#login', role: null },
  { name: 'user-dashboard', hash: '#user', role: 'korisnik' },
  { name: 'user-my-jobs', hash: '#my-jobs', role: 'korisnik' },
  { name: 'provider-leads', hash: '#leads', role: 'pružatelj' },
  { name: 'provider-pricing', hash: '#pricing', role: null },
  { name: 'provider-subscription', hash: '#subscription', role: 'pružatelj', waitMs: 1200 },
  { name: 'provider-my-leads-refund', hash: '#my-leads', role: 'pružatelj', waitMs: 1200 },
  { name: 'provider-roi', hash: '#roi', role: 'pružatelj' },
  { name: 'director-invoices', hash: '#invoices', role: 'direktor', waitMs: 1200 },
  { name: 'director-my-leads-refund', hash: '#my-leads', role: 'direktor', waitMs: 1200 },
  { name: 'director', hash: '#director', role: 'direktor' },
  { name: 'team-my-leads', hash: '#my-leads', role: 'tim_clan' },
  { name: 'team-chat', hash: '#chat', role: 'tim_clan', waitMs: 3200 },
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
      update: { verificationToken: token, tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60), isVerified: false, fullName: 'Milan Babić' },
      create: {
        email: demoEmail,
        role: 'USER',
        fullName: 'Milan Babić',
        passwordHash: '$2a$10$2k4mY5pQhF/2u8g3kq7g1eZB3xJ6xZtK1zQZp9pWm2p2bQb0QeY8G', // dummy; login nije potreban
        isVerified: false,
        verificationToken: token,
        tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    // Pošalji verification email (mora ići u Mailpit)
    await sendVerificationEmail(demoEmail, 'Milan Babić', token);

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
    await page.waitForTimeout(VIDEO_PACE_MS.emailAfterMailView);
    await takeShot('email-inbox');

    // Klikni prvi link u mailu (verify/reset) ako postoji
    const link = await page.$('a[href]');
    if (link) {
      const href = await link.getAttribute('href');
      await link.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(VIDEO_PACE_MS.emailAfterVerifyClick);
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
  const emailSelector = 'input[name="email"], input[type="email"]';
  const passSelector = 'input[name="password"], input[type="password"]';
  const submitSelector = 'form[aria-label="Prijava forma"] button[type="submit"], button[type="submit"]';
  const loginUrl = buildUrl('#login');

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(VIDEO_PACE_MS.loginPageAfterGoto);

      // Ako forma nije odmah dostupna (spor SPA mount), probaj reset auth state i ponovno učitaj.
      const hasEmailInput = await page.locator(emailSelector).first().isVisible({ timeout: 5000 }).catch(() => false);
      if (!hasEmailInput) {
        await page.context().clearCookies().catch(() => {});
        await page.evaluate(() => {
          try { localStorage.clear(); } catch (_) {}
          try { sessionStorage.clear(); } catch (_) {}
        }).catch(() => {});
        await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector(emailSelector, { timeout: 10000 });
      }

      await page.fill(emailSelector, cred.email);
      await page.fill(passSelector, cred.password);
      await page.click(submitSelector);
      await page.waitForTimeout(VIDEO_PACE_MS.loginAfterSubmit);
      return true;
    } catch (e) {
      console.warn(`[LOGIN] Pokušaj ${attempt}/3 nije uspio za role=${role}: ${e.message}`);
      if (attempt === 3) {
        console.warn(`[SKIP] Login preskočen za ${role} nakon 3 pokušaja.`);
        return false;
      }
      await page.waitForTimeout(VIDEO_PACE_MS.loginRetryBackoff);
    }
  }

  return false;
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
  const screenshotTimeoutMs = parseInt(process.env.SCREENSHOT_TIMEOUT_MS || '60000', 10);
  const screenshotMaxRetries = parseInt(process.env.SCREENSHOT_MAX_RETRIES || '2', 10);

  const takeShot = async (tag, attempt = 1) => {
    const file = `${String(++shotIdx).padStart(3, '0')}-${tag}.png`;
    const p = path.join(outShots, file);
    try {
      // Moguć je spor odgovor nakon navigacije; mali delay smanjuje flaky screenshotove.
      await page.waitForTimeout(VIDEO_PACE_MS.beforeScreenshot);
      await page.screenshot({ path: p, fullPage: false, timeout: screenshotTimeoutMs, animations: 'disabled' });
    } catch (e) {
      if (attempt <= screenshotMaxRetries) {
        console.warn(`[SHOT] Timeout (${attempt}/${screenshotMaxRetries}). retry tag=${tag} file=${file}`);
        await page.waitForTimeout(VIDEO_PACE_MS.screenshotRetry);
        return takeShot(tag, attempt + 1);
      }
      throw e;
    }
  };

  try {
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
      // Snimaj "češće screenshotove" ali sekvencijalno (bez setInterval) da ne dođe do paralelnog screenshotiranja.
      const stepWaitMs = Number(step.waitMs || STEP_WAIT_MS);
      const start = Date.now();
      await takeShot(`${step.name}-0`);
      let k = 1;
      let extraTaken = 0;
      while (Date.now() - start < stepWaitMs && extraTaken < MAX_EXTRA_SHOTS_PER_STEP) {
        const remaining = stepWaitMs - (Date.now() - start);
        const wait = Math.min(SCREENSHOT_INTERVAL_MS, remaining);
        if (wait < 200) break;
        await page.waitForTimeout(wait);
        if (Date.now() - start >= stepWaitMs) break;
        await takeShot(`${step.name}-${k}`);
        k++;
        extraTaken++;
      }
      console.log('OK step:', step.name, 'shots:', k);
    }
  } finally {
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
  const selected =
    VIDEO_FORMAT === 'all' ? FORMAT_KEYS_ALL : [VIDEO_FORMAT];
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

