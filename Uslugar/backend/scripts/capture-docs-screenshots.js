/**
 * Snimanje screenshotova za vodič dokumentacije (pokretanje iz backend konteksta).
 * Koristi paket "playwright" iz backend/ (isti kao tests/scripts verzija).
 * OUT_DIR i BASE_URL moraju biti postavljeni u env (postavlja admin endpoint).
 */
import playwright from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BASE_URL = process.env.BASE_URL || 'https://www.uslugar.eu';
const OUT_DIR = process.env.OUT_DIR || path.resolve(process.cwd(), 'public', 'docs');
const SCREENSHOT_STAMP = process.env.SCREENSHOT_STAMP || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

const SCREENSHOTS = [
  { file: 'guide-korisnik-1.png', hash: '#login', role: null },
  { file: 'guide-korisnik-2.png', hash: '#user', role: 'korisnik' },
  { file: 'moji-poslovi-mock.png', hash: '#my-jobs', role: 'korisnik' },
  { file: 'guide-korisnik-4.png', hash: '#chat', role: 'korisnik' },
  { file: 'guide-korisnik-5.png', hash: '#my-jobs', role: 'korisnik' },
  { file: 'guide-korisnik-6.png', hash: '#user', role: 'korisnik' },
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
  { file: 'guide-tim-1.png', hash: '#my-leads', role: 'tim_clan' },
  { file: 'moji-leadovi-team-member-mock.png', hash: '#my-leads', role: 'tim_clan' },
  { file: 'guide-tim-3.png', hash: '#chat', role: 'tim_clan' },
  { file: 'guide-tim-4.png', hash: '#chat', role: 'tim_clan' },
  { file: 'director-dashboard-lead-queue-mock.png', hash: '#director', role: 'direktor' },
];

const CREDENTIALS = {
  korisnik: { email: process.env.TEST_EMAIL_KORISNIK, password: process.env.TEST_PASSWORD_KORISNIK },
  pružatelj: { email: process.env.TEST_EMAIL_PRUVATELJ, password: process.env.TEST_PASSWORD_PRUVATELJ },
  tim_clan: { email: process.env.TEST_EMAIL_TIM_CLAN, password: process.env.TEST_PASSWORD_TIM_CLAN },
  direktor: { email: process.env.TEST_EMAIL_DIREKTOR, password: process.env.TEST_PASSWORD_DIREKTOR },
};

function isTeamGuideFile(file) {
  return /^guide-tim-(1|3|4)\.png$/i.test(file) || /^moji-leadovi-team-member-mock\.png$/i.test(file);
}

async function waitForTeamGuideContent(page, file) {
  if (!isTeamGuideFile(file)) return;
  const timeoutMs = 12000;
  try {
    await page.waitForFunction((fileName) => {
      const txt = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
      if (!txt) return false;
      if (fileName === 'guide-tim-1.png' || fileName === 'moji-leadovi-team-member-mock.png') {
        // Čekaj da nestane prazan state ili da se pojavi konkretan content.
        const hasEmptyAssigned = txt.includes('Trenutno nemate dodijeljenih leadova');
        const hasEmptyLeads = txt.includes('Nema leadova');
        const hasAssignedHeader = txt.includes('Leadovi dodijeljeni meni');
        const hasLeadSignals = txt.includes('ACTIVE') || txt.includes('Dodijeljeno') || txt.includes('Klijent:');
        return hasAssignedHeader && (!hasEmptyAssigned || !hasEmptyLeads || hasLeadSignals);
      }
      // guide-tim-3 / guide-tim-4 (chat)
      const hasChatHeader = txt.includes('Nove poruke');
      const hasEmptyChat = txt.includes('Nemate aktivnih razgovora');
      const hasConversationSignals = txt.includes('Čeka vaš odgovor') || txt.includes('Prije') || txt.includes('Ana Horvat') || txt.includes('Chat:');
      return hasChatHeader && (!hasEmptyChat || hasConversationSignals);
    }, file, { timeout: timeoutMs });
  } catch (_) {
    // Ako timeout istekne, fallback ionako ubacuje demo sadržaj.
  }
}

async function applyTeamGuideVisualFallback(page, file) {
  if (!/^guide-tim-(1|3|4)\.png$/i.test(file) && !/^moji-leadovi-team-member-mock\.png$/i.test(file)) return;

  await page.evaluate((fileName) => {
    const textIncludes = (el, txt) => !!el && (el.textContent || '').includes(txt);
    const all = Array.from(document.querySelectorAll('*'));

    // MyLeads empty states (guide-tim-1 + team-member mock)
    if (fileName === 'guide-tim-1.png' || fileName === 'moji-leadovi-team-member-mock.png') {
      const assignedEmpty = all.find((el) => textIncludes(el, 'Trenutno nemate dodijeljenih leadova'));
      if (assignedEmpty) {
        assignedEmpty.innerHTML = `
          <div style="padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;background:#f8fafc;">
            <div style="font-weight:700;color:#111827;margin-bottom:4px;">Sanacija krovišta nakon nevremena</div>
            <div style="font-size:12px;color:#4b5563;">📍 Zagreb · 🏷️ Krovopokrivački radovi · Klijent: Ana Horvat</div>
            <div style="margin-top:8px;display:inline-block;font-size:12px;padding:4px 8px;border-radius:999px;background:#fef3c7;color:#92400e;font-weight:600;">Dodijeljeno</div>
          </div>
        `;
      }

      const leadsEmpty = all.find((el) => textIncludes(el, 'Nema leadova'));
      if (leadsEmpty) {
        const wrapper = leadsEmpty.closest('div');
        if (wrapper) {
          wrapper.innerHTML = `
            <div style="padding:14px;border:1px solid #d1d5db;border-radius:12px;background:white;">
              <div style="display:flex;justify-content:space-between;gap:10px;">
                <div>
                  <div style="font-size:20px;font-weight:700;color:#111827;">Procjena štete i popravak dimnjaka</div>
                  <div style="color:#374151;margin-top:6px;">Hitna procjena i sanacija dimnjaka nakon oluje.</div>
                  <div style="margin-top:8px;color:#6b7280;font-size:12px;">📍 Zagreb · 💰 1200-2800 EUR · 📅 ${new Date().toLocaleDateString('hr-HR')}</div>
                </div>
                <div style="height:fit-content;padding:6px 10px;border-radius:999px;background:#dbeafe;color:#1e40af;font-size:12px;font-weight:700;">ACTIVE</div>
              </div>
            </div>
          `;
        }
      }
    }

    // Chat empty state (guide-tim-3 + guide-tim-4)
    if (fileName === 'guide-tim-3.png' || fileName === 'guide-tim-4.png') {
      const chatEmpty = all.find((el) => textIncludes(el, 'Nemate aktivnih razgovora'));
      if (chatEmpty) {
        const listContainer = chatEmpty.closest('.flex-1.overflow-y-auto') || chatEmpty.closest('div');
        if (listContainer) {
          listContainer.innerHTML = `
            <div style="padding:12px 16px;border-bottom:1px solid #f3f4f6;display:flex;gap:12px;align-items:flex-start;background:#f8fafc;">
              <div style="width:42px;height:42px;border-radius:9999px;background:#2563eb;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;">A</div>
              <div style="min-width:0;flex:1;">
                <div style="display:flex;justify-content:space-between;gap:8px;">
                  <div style="font-weight:700;color:#111827;">Ana Horvat</div>
                  <div style="font-size:12px;color:#6b7280;">Prije 18 min</div>
                </div>
                <div style="font-size:12px;color:#6b7280;margin-top:2px;">Procjena štete i popravak dimnjaka</div>
                <div style="font-size:14px;color:#374151;margin-top:2px;">Pozdrav, možemo li dogovoriti izlazak na teren sutra u 10h?</div>
              </div>
            </div>
          `;
        }
      }
    }

    // Hard fallback: čak i ako selektori gore ne pogode, dodaj vidljiv demo panel
    // kako bi screenshot tim vodiča uvijek imao konkretan sadržaj.
    if (!document.getElementById('docs-team-hard-fallback')) {
      const panel = document.createElement('div');
      panel.id = 'docs-team-hard-fallback';
      panel.style.position = 'fixed';
      panel.style.right = '16px';
      panel.style.bottom = '16px';
      panel.style.zIndex = '99999';
      panel.style.maxWidth = '420px';
      panel.style.padding = '12px 14px';
      panel.style.borderRadius = '12px';
      panel.style.background = 'rgba(15, 23, 42, 0.92)';
      panel.style.color = '#fff';
      panel.style.boxShadow = '0 12px 30px rgba(0,0,0,0.35)';
      panel.style.fontFamily = 'Arial, sans-serif';
      panel.style.lineHeight = '1.35';
      panel.style.border = '1px solid rgba(255,255,255,0.15)';
      panel.innerHTML = fileName === 'guide-tim-1.png' || fileName === 'moji-leadovi-team-member-mock.png'
        ? `
          <div style="font-size:12px;font-weight:700;opacity:0.9;">DEMO PODACI (TIM)</div>
          <div style="margin-top:6px;font-size:14px;font-weight:700;">Dodijeljeni lead: Sanacija krovišta</div>
          <div style="font-size:12px;opacity:0.95;margin-top:2px;">Klijent: Ana Horvat · Zagreb · Status: ASSIGNED</div>
          <div style="margin-top:8px;font-size:13px;">Ekskluzivni lead: Procjena štete i popravak dimnjaka</div>
        `
        : `
          <div style="font-size:12px;font-weight:700;opacity:0.9;">DEMO CHAT (TIM)</div>
          <div style="margin-top:6px;font-size:14px;font-weight:700;">Ana Horvat</div>
          <div style="font-size:13px;opacity:0.98;">"Možemo li dogovoriti izlazak na teren sutra u 10h?"</div>
        `;
      document.body.appendChild(panel);
    }
  }, file);
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

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('OUT_DIR:', OUT_DIR);
  console.log('BASE_URL:', BASE_URL);
  console.log('SCREENSHOT_STAMP:', SCREENSHOT_STAMP);

  const browser = await playwright.chromium.launch({ headless: true });
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
          if (isTeamGuideFile(file)) {
            console.warn(`[FALLBACK] ${file} bez login kredencijala (${role}) - koristim screenshotMode=docs + visual fallback.`);
            lastRole = null;
          } else {
            console.log(`[SKIP] ${file} (nema kredencijala za ${role})`);
            await page.close();
            continue;
          }
        }
        if (ok) lastRole = role;
      } else if (!role) {
        lastRole = null;
      }

      // Dodaj screenshotMode=docs query param za frontend (prikaz demo leadova u vodiču, bez utjecaja na regularan promet)
      const baseWithoutHash = BASE_URL.split('#')[0];
      const hashPart = hash.startsWith('#') ? hash : '#' + hash;
      const url = `${baseWithoutHash}?screenshotMode=docs&screenshotStamp=${encodeURIComponent(SCREENSHOT_STAMP)}${hashPart}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);
      await waitForTeamGuideContent(page, file);
      await applyTeamGuideVisualFallback(page, file);
      await page.waitForTimeout(200);

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
