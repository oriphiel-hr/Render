import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
import { COUNTRY_CODES } from './countries.js';
import { SUPPORTED_LOCALES } from './locale-meta.js';

const MESSAGES = { hr, en, de, sl, bs, sr, it, hu, pl, cs, fr, es, sk };
export { SUPPORTED_LOCALES };

const STORAGE_KEY = 'ravnoparLocale';

/** UI jezik — mijenja se u dropdownu; sprema se u localStorage i sinkronizira u profil (za emailove). */

const I18nContext = createContext(null);

function getNested(obj, path) {
  if (!obj) return undefined;
  return path.split('.').reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    if (Array.isArray(acc) && /^\d+$/.test(key)) return acc[Number(key)];
    return acc[key];
  }, obj);
}

function resolveMessage(locale, key) {
  return (
    getNested(MESSAGES[locale], key) ??
    getNested(MESSAGES.en, key) ??
    getNested(MESSAGES.hr, key)
  );
}

export function getStoredLocale() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return SUPPORTED_LOCALES.includes(stored) ? stored : 'hr';
}

export function translateApiError(data, locale = getStoredLocale()) {
  if (!data) return resolveMessage(locale, 'errors.generic');
  if (data.errorCode) {
    const fromCatalog = resolveMessage(locale, `api.${data.errorCode}`);
    if (fromCatalog) return fromCatalog;
  }
  return data.error || resolveMessage(locale, 'errors.generic');
}

export function makeLabels(t, locale = 'hr') {
  const pick = (prefix) => (value) => {
    const text = t(`${prefix}.${value}`);
    return text === `${prefix}.${value}` ? value : text;
  };
  return {
    labelIdentity: pick('identity'),
    labelProfileType: pick('profileType'),
    labelIntent: pick('intent'),
    labelChildren: pick('children'),
    labelSmoking: pick('smoking'),
    labelRelationship: pick('relationship'),
    labelAvailability: pick('availability'),
    labelRole: pick('role'),
    labelPlanTier: pick('planTier'),
    labelReportStatus: pick('reportStatus'),
    labelAuditCategory: pick('auditCategory'),
    labelAuditAction: pick('auditAction'),
    labelModerationAction: pick('moderationAction'),
    formatDateTime: (value) => {
      if (!value) return '—';
      const tag = locale === 'hr' ? 'hr-HR' : locale === 'en' ? 'en-GB' : `${locale}-${locale.toUpperCase()}`;
      try {
        return new Date(value).toLocaleString(tag, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return new Date(value).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  };
}

export function I18nProvider({ children, initialLocale }) {
  const [locale, setLocaleState] = useState(() => initialLocale || getStoredLocale());

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next) => {
    if (!SUPPORTED_LOCALES.includes(next)) return;
    localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const catalog = useMemo(() => MESSAGES[locale] ?? MESSAGES.en ?? MESSAGES.hr, [locale]);

  const t = useCallback(
    (key, vars = {}) => {
      let text = resolveMessage(locale, key);
      if (text === undefined || text === null) return key;
      if (typeof text === 'string') {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replaceAll(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [locale]
  );

  const countryName = useCallback(
    (code) => catalog?.countries?.[code] || MESSAGES.hr.countries?.[code] || code,
    [catalog]
  );

  const labels = useMemo(() => makeLabels(t, locale), [t, locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t, catalog, countryName, countryCodes: COUNTRY_CODES, labels }),
    [locale, setLocale, t, catalog, countryName, labels]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
