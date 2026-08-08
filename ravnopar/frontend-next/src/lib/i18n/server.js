import hr from './locales/hr.js';
import en from './locales/en.js';
import de from './locales/de.js';
import sl from './locales/sl.js';
import bs from './locales/bs.js';
import sr from './locales/sr.js';
import it from './locales/it.js';
import hu from './locales/hu.js';
import pl from './locales/pl.js';
import cs from './locales/cs.js';
import fr from './locales/fr.js';
import es from './locales/es.js';
import sk from './locales/sk.js';
import { SUPPORTED_LOCALES } from './locale-meta.js';
import { withSeoBlocks } from './seo-locale-blocks.js';

const MESSAGES = { hr, en, de, sl, bs, sr, it, hu, pl, cs, fr, es, sk };

function getNested(obj, path) {
  if (!obj) return undefined;
  return path.split('.').reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    if (Array.isArray(acc) && /^\d+$/.test(key)) return acc[Number(key)];
    return acc[key];
  }, obj);
}

export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

export function getCatalog(locale) {
  const code = isSupportedLocale(locale) ? locale : 'hr';
  const base = MESSAGES[code] ?? MESSAGES.en ?? MESSAGES.hr;
  return withSeoBlocks(code, base);
}

export function createTranslator(locale) {
  const code = isSupportedLocale(locale) ? locale : 'hr';
  return function t(key, vars = {}) {
    let text =
      getNested(getCatalog(code), key) ??
      getNested(getCatalog('en'), key) ??
      getNested(MESSAGES.hr, key);
    if (text === undefined || text === null) return key;
    if (typeof text === 'string') {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replaceAll(`{${k}}`, String(v));
      });
    }
    return text;
  };
}

export function buildPageMetadata(locale, titleKey, descriptionKey) {
  const t = createTranslator(locale);
  const siteName = t('meta.defaultTitle');
  const resolvedTitle = titleKey ? t(`meta.titles.${titleKey}`) : null;
  const resolvedDescription = descriptionKey
    ? t(`meta.descriptions.${descriptionKey}`)
    : t('meta.defaultDescription');
  const fullTitle = resolvedTitle
    ? titleKey === 'home'
      ? `${siteName} — ${resolvedTitle}`
      : `${resolvedTitle} — ${siteName}`
    : siteName;
  return {
    title: fullTitle,
    description: resolvedDescription || t('meta.defaultDescription'),
    siteName
  };
}
