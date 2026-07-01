import { SUPPORTED_LOCALES } from './i18n/locale-meta.js';

export const SITE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL?.trim()) ||
  'https://ravnopar.onrender.com'
).replace(/\/$/, '');

/** Javne stranice koje indeksiramo (bez jezičnog prefiksa). */
export const PUBLIC_PATHS = [
  '/',
  '/planovi',
  '/kako-radi-feed',
  '/fer-izvjestaj',
  '/doniraj',
  '/pomoc',
  '/pravila',
  '/privatnost',
  '/uvjeti',
  '/kontakt'
];

const NOINDEX_PREFIXES = ['/app', '/admin', '/auth'];

export const LOCALE_HREFLANG = {
  hr: 'hr',
  en: 'en',
  de: 'de',
  sl: 'sl',
  bs: 'bs',
  sr: 'sr',
  it: 'it',
  hu: 'hu',
  pl: 'pl',
  cs: 'cs',
  fr: 'fr',
  es: 'es',
  sk: 'sk'
};

export const OG_LOCALE = {
  hr: 'hr_HR',
  en: 'en_GB',
  de: 'de_DE',
  sl: 'sl_SI',
  bs: 'bs_BA',
  sr: 'sr_RS',
  it: 'it_IT',
  hu: 'hu_HU',
  pl: 'pl_PL',
  cs: 'cs_CZ',
  fr: 'fr_FR',
  es: 'es_ES',
  sk: 'sk_SK'
};

/** Razdvoji /de/pomoc → { locale: 'de', path: '/pomoc' }. */
export function stripLocaleFromPath(pathname) {
  if (!pathname) return { locale: null, path: '/' };
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (!match || !SUPPORTED_LOCALES.includes(match[1])) {
    return { locale: null, path: pathname || '/' };
  }
  const rest = match[2] || '/';
  return { locale: match[1], path: rest === '' ? '/' : rest };
}

export function isPublicPath(pathname) {
  const { path } = stripLocaleFromPath(pathname);
  return PUBLIC_PATHS.includes(path);
}

export function shouldNoindex(pathname) {
  if (!pathname) return true;
  const { path } = stripLocaleFromPath(pathname);
  if (NOINDEX_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return true;
  }
  return NOINDEX_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function buildPageUrl(pathname, locale) {
  const { path } = stripLocaleFromPath(pathname);
  const logical = PUBLIC_PATHS.includes(path) ? path : pathname;
  const locPath = logical === '/' ? `/${locale}` : `/${locale}${logical}`;
  return `${SITE_URL}${locPath}`;
}

export function buildPrerenderFilePath(locale, path) {
  if (path === '/') return `${locale}/index.html`;
  const slug = path.replace(/^\//, '');
  return `${locale}/${slug}/index.html`;
}

export function syncLangInUrl(locale) {
  if (typeof window === 'undefined' || !locale) return;
  const url = new URL(window.location.href);
  const { path } = stripLocaleFromPath(url.pathname);
  if (!PUBLIC_PATHS.includes(path)) return;
  const nextPath = path === '/' ? `/${locale}` : `/${locale}${path}`;
  if (url.pathname === nextPath && !url.searchParams.has('lang')) return;
  url.pathname = nextPath;
  url.searchParams.delete('lang');
  window.history.replaceState(null, '', url.toString());
}

export function readLangFromUrl() {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  const fromPath = stripLocaleFromPath(url.pathname).locale;
  if (fromPath) return fromPath;
  const lang = url.searchParams.get('lang');
  return SUPPORTED_LOCALES.includes(lang) ? lang : null;
}

export function getOgImageUrl() {
  return `${SITE_URL}/og-image.svg`;
}
