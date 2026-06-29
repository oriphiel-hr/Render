import { useEffect, useRef } from 'react';
import { updateProfile } from '../api/index.js';
import { useI18n } from '../lib/i18n/index.jsx';

/** Sprema UI jezik u profil (pozadina) kad korisnik promijeni dropdown. */
export default function LocaleProfileSync({ token, profile, onProfileLocaleSaved }) {
  const { locale } = useI18n();
  const inFlight = useRef(null);

  useEffect(() => {
    if (!token || !profile?.id) return;
    if (locale === profile.locale) return;
    if (inFlight.current === locale) return;

    const targetLocale = locale;
    inFlight.current = targetLocale;

    updateProfile(token, { locale: targetLocale })
      .then((data) => {
        if (data?.success && data.profile?.locale === targetLocale) {
          onProfileLocaleSaved?.(targetLocale);
        }
      })
      .finally(() => {
        if (inFlight.current === targetLocale) inFlight.current = null;
      });
  }, [locale, token, profile?.id, profile?.locale, onProfileLocaleSaved]);

  return null;
}
