import { useI18n } from '../lib/i18n/index.jsx';
import { SUPPORTED_LOCALES, LOCALE_LABELS } from '../lib/i18n/locale-meta.js';

export default function LanguageSwitcher({ className = '' }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className={`lang-switcher ${className}`.trim()}>
      <span className="sr-only">{t('auth.language')}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        aria-label={t('auth.language')}
        className="lang-switcher-select"
      >
        {SUPPORTED_LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
