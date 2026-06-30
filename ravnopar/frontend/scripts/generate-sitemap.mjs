#!/usr/bin/env node
/**
 * Generira sitemap.xml u dist/ nakon Vite builda.
 * Pokriva sve javne rute × 13 jezika (?lang=).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const siteUrl = (process.env.VITE_SITE_URL || 'https://ravnopar.onrender.com').replace(/\/$/, '');

const locales = ['hr', 'en', 'de', 'sl', 'bs', 'sr', 'it', 'hu', 'pl', 'cs', 'fr', 'es', 'sk'];
const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/planovi', priority: '0.9', changefreq: 'monthly' },
  { path: '/pomoc', priority: '0.9', changefreq: 'weekly' },
  { path: '/kako-radi-feed', priority: '0.85', changefreq: 'monthly' },
  { path: '/fer-izvjestaj', priority: '0.8', changefreq: 'weekly' },
  { path: '/doniraj', priority: '0.7', changefreq: 'monthly' },
  { path: '/kontakt', priority: '0.7', changefreq: 'yearly' },
  { path: '/pravila', priority: '0.6', changefreq: 'yearly' },
  { path: '/privatnost', priority: '0.5', changefreq: 'yearly' },
  { path: '/uvjeti', priority: '0.5', changefreq: 'yearly' }
];

function locFor(routePath, locale) {
  const base = routePath === '/' ? siteUrl : `${siteUrl}${routePath}`;
  const url = new URL(base);
  url.searchParams.set('lang', locale);
  return url.toString();
}

const urls = [];
for (const route of routes) {
  for (const locale of locales) {
    urls.push({ ...route, loc: locFor(route.path, locale) });
  }
}

const lastmod = new Date().toISOString().slice(0, 10);

const body = urls
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, 'sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml → ${urls.length} URL-ova`);
