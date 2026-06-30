import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../lib/i18n/index.jsx';
import { isPublicPath, syncLangInUrl } from '../lib/seo.js';

/** Drži ?lang= u URL-u na javnim stranicama radi hreflang / SEO. */
export default function SeoLocaleSync() {
  const { locale } = useI18n();
  const { pathname } = useLocation();

  useEffect(() => {
    if (isPublicPath(pathname)) {
      syncLangInUrl(locale);
    }
  }, [locale, pathname]);

  return null;
}
