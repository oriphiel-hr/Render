#!/usr/bin/env node
/**
 * SSR prerender javnih stranica u dist/{lang}/.../index.html
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPublicPage, listPrerenderJobs } from '../dist-ssr/prerender.js';
import { withSeoBlocks } from '../src/lib/i18n/seo-locale-blocks.js';
import hr from '../src/lib/i18n/messages/hr.js';
import en from '../src/lib/i18n/messages/en.js';
import de from '../src/lib/i18n/messages/de.js';
import sl from '../src/lib/i18n/messages/sl.js';
import bs from '../src/lib/i18n/messages/bs.js';
import sr from '../src/lib/i18n/messages/sr.js';
import it from '../src/lib/i18n/messages/it.js';
import hu from '../src/lib/i18n/messages/hu.js';
import pl from '../src/lib/i18n/messages/pl.js';
import cs from '../src/lib/i18n/messages/cs.js';
import fr from '../src/lib/i18n/messages/fr.js';
import es from '../src/lib/i18n/messages/es.js';
import sk from '../src/lib/i18n/messages/sk.js';

const SITE_URL = (process.env.VITE_SITE_URL || 'https://ravnopar.oriph.io').replace(/\/$/, '');

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const template = readFileSync(join(distDir, 'index.html'), 'utf8');

const MESSAGES = { hr, en, de, sl, bs, sr, it, hu, pl, cs, fr, es, sk };

const PAGE_META_KEYS = {
  '/': 'home',
  '/planovi': 'plans',
  '/kako-radi-feed': 'fairFeed',
  '/fer-izvjestaj': 'fairnessReport',
  '/doniraj': 'donatePublic',
  '/pomoc': 'faq',
  '/pravila': 'guidelines',
  '/privatnost': 'privacy',
  '/uvjeti': 'terms',
  '/kontakt': 'contact'
};

function pageHead(locale, path) {
  const key = PAGE_META_KEYS[path];
  const catalog = withSeoBlocks(locale, MESSAGES[locale] || MESSAGES.en);
  const title = catalog.meta?.titles?.[key] || catalog.meta?.defaultTitle;
  const description = catalog.meta?.descriptions?.[key] || catalog.meta?.defaultDescription;
  const siteName = catalog.meta?.defaultTitle || 'Ravnopar';
  const fullTitle =
    key === 'home' ? `${siteName} — ${title}` : `${title} — ${siteName}`;
  const canonical =
    path === '/' ? `${SITE_URL}/${locale}` : `${SITE_URL}/${locale}${path}`;
  return { fullTitle, description, canonical, lang: locale, siteName };
}

function injectHead(html, { fullTitle, description, canonical, lang, siteName = 'Ravnopar' }) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return html
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/,
      `<meta name="description" content="${esc(description)}" />`
    )
    .replace(
      /<link rel="canonical" href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${canonical}" />`
    )
    .replace(
      /<meta property="og:url" content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${canonical}" />`
    )
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${esc(fullTitle)}" />`
    )
    .replace(
      /<meta property="og:site_name" content="[^"]*"\s*\/>/,
      `<meta property="og:site_name" content="${esc(siteName)}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/>/,
      `<meta property="og:description" content="${esc(description)}" />`
    );
}

let count = 0;
for (const { locale, path } of listPrerenderJobs()) {
  const rendered = renderPublicPage(locale, path);
  if (!rendered) continue;
  const { body, outFile } = rendered;
  const head = pageHead(locale, path);
  const html = injectHead(
    template.replace('<div id="root"></div>', `<div id="root">${body}</div>`),
    head
  );
  const outPath = join(distDir, outFile);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, 'utf8');
  count += 1;
}

// Zadani SPA shell (hr) na root — primarno tržište + hrvatski Google
const hrHome = renderPublicPage('hr', '/');
if (hrHome) {
  const head = pageHead('hr', '/');
  const html = injectHead(
    template.replace('<div id="root"></div>', `<div id="root">${hrHome.body}</div>`),
    { ...head, canonical: `${SITE_URL}/hr` }
  );
  writeFileSync(join(distDir, 'index.html'), html, 'utf8');
}

console.log(`prerender → ${count} lokaliziranih stranica`);
