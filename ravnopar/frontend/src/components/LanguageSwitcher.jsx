import { useI18n } from '../lib/i18n/index.jsx';
import { LOCALE_LABELS, SUPPORTED_LOCALES } from '../lib/i18n/locale-meta.js';

export default function LanguageSwitcher({ className = '' }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={`lang-picker ${className}`.trim()} role="group" aria-label={t('langPicker.label')}>
      <span className="lang-picker-globe" aria-hidden="true">
        🌐
      </span>
      <div className="lang-picker-list">
        {SUPPORTED_LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            className={`lang-picker-btn ${locale === code ? 'active' : ''}`}
            onClick={() => setLocale(code)}
            aria-label={LOCALE_LABELS[code]}
            aria-pressed={locale === code}
          >
            <span className="lang-picker-code">{code.toUpperCase()}</span>
            <span className="lang-picker-name">{LOCALE_LABELS[code]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
