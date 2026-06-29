import { useI18n } from '../lib/i18n/index.jsx';
import { LOCALE_LABELS, SUPPORTED_LOCALES } from '../lib/i18n/locale-meta.js';

export default function LanguageSwitcher({ className = '', variant = 'grid' }) {
  const { locale, setLocale, t } = useI18n();

  if (variant === 'select') {
    return (
      <label className={`lang-picker lang-picker-select ${className}`.trim()}>
        <span className="lang-picker-globe" aria-hidden="true">
          🌐
        </span>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          aria-label={t('langPicker.label')}
          className="lang-picker-select-control"
        >
          {SUPPORTED_LOCALES.map((code) => (
            <option key={code} value={code}>
              {code.toUpperCase()} — {LOCALE_LABELS[code]}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div
      className={`lang-picker lang-picker-grid ${className}`.trim()}
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
