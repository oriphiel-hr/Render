import { useI18n } from '../lib/i18n/index.jsx';
import { LOCALE_LABELS, SUPPORTED_LOCALES } from '../lib/i18n/locale-meta.js';

export default function LanguageSwitcher({ className = '', compact = false }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={`lang-picker ${compact ? 'lang-picker-compact' : ''} ${className}`.trim()}
      role="group"
      aria-label={t('langPicker.label')}
    >
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
            title={LOCALE_LABELS[code]}
            aria-label={LOCALE_LABELS[code]}
            aria-pressed={locale === code}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
