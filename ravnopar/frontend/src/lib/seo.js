import { SUPPORTED_LOCALES } from './i18n/locale-meta.js';

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL?.trim() || 'https://ravnopar.onrender.com'
).replace(/\/$/, '');

/** Javne stranice koje indeksiramo. */
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

export function isPublicPath(pathname) {
  if (!pathname) return false;
  return PUBLIC_PATHS.includes(pathname);
}

export function shouldNoindex(pathname) {
  if (!pathname) return true;
  return NOINDEX_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function buildPageUrl(pathname, locale, { includeLang = true } = {}) {
  const path = pathname === '/' ? '' : pathname;
  const url = new URL(`${SITE_URL}${path}`);
  if (includeLang && locale) {
    url.searchParams.set('lang', locale);
  }
  return url.toString();
}

export function syncLangInUrl(locale) {
  if (typeof window === 'undefined' || !locale) return;
  const url = new URL(window.location.href);
  if (url.searchParams.get('lang') === locale) return;
  url.searchParams.set('lang', locale);
  window.history.replaceState(null, '', url.toString());
}

export function readLangFromUrl() {
  if (typeof window === 'undefined') return null;
  const lang = new URL(window.location.href).searchParams.get('lang');
  return SUPPORTED_LOCALES.includes(lang) ? lang : null;
}

export function getOgImageUrl() {
  return `${SITE_URL}/og-image.svg`;
}
