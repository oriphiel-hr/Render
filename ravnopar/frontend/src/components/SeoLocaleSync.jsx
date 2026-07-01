import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../lib/i18n/index.jsx';
import { SUPPORTED_LOCALES } from '../lib/i18n/locale-meta.js';
import { isPublicPath, stripLocaleFromPath, syncLangInUrl } from '../lib/seo.js';

/** Drži jezični prefiks u URL-u i preusmjerava legacy ?lang= na /{lang}/... */
export default function SeoLocaleSync() {
  const { locale, setLocale } = useI18n();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(`${window.location.origin}${pathname}${search}`);
    const queryLang = url.searchParams.get('lang');
    const { path, locale: pathLocale } = stripLocaleFromPath(pathname);

    if (queryLang && SUPPORTED_LOCALES.includes(queryLang) && isPublicPath(pathname)) {
      const target = path === '/' ? `/${queryLang}` : `/${queryLang}${path}`;
      url.searchParams.delete('lang');
      navigate(`${target}${url.search}`, { replace: true });
      if (queryLang !== locale) setLocale(queryLang);
      return;
    }

    if (isPublicPath(pathname) && !pathLocale) {
      syncLangInUrl(locale);
    }
  }, [locale, pathname, search, navigate, setLocale]);

  return null;
}
