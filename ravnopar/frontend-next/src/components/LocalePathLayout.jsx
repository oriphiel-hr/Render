import { useEffect } from 'react';
import { Navigate, Outlet, useParams, useSearchParams } from '../lib/next-router-compat.js';
import { useI18n } from '../lib/i18n/index.jsx';
import { SUPPORTED_LOCALES } from '../lib/i18n/locale-meta.js';

/** Postavlja jezik iz URL prefiksa /hr/pomoc i renderira ugniježđene rute. */
export default function LocalePathLayout() {
  const { locale } = useParams();
  const { setLocale } = useI18n();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (SUPPORTED_LOCALES.includes(locale)) {
      setLocale(locale);
    }
  }, [locale, setLocale]);

  if (!SUPPORTED_LOCALES.includes(locale)) {
    return <Navigate to="/" replace />;
  }

  // Legacy ?lang= na istoj putanji — LocaleRedirect u SeoLocaleSync to rješava
  void searchParams;

  return <Outlet />;
}
