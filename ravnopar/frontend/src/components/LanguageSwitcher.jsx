import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../lib/i18n/index.jsx';
import { LOCALE_LABELS, SUPPORTED_LOCALES } from '../lib/i18n/locale-meta.js';

function LanguageGrid({ locale, setLocale, onSelect, className = '' }) {
  return (
    <div className={`lang-picker-list ${className}`.trim()} role="group">
      {SUPPORTED_LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-picker-btn ${locale === code ? 'active' : ''}`}
          onClick={() => {
            setLocale(code);
            onSelect?.(code);
          }}
          aria-label={LOCALE_LABELS[code]}
          aria-pressed={locale === code}
        >
          <span className="lang-picker-code">{code.toUpperCase()}</span>
          <span className="lang-picker-name">{LOCALE_LABELS[code]}</span>
        </button>
      ))}
    </div>
  );
}

export default function LanguageSwitcher({ className = '', variant = 'full' }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (variant === 'popover') {
    return (
      <div className={`lang-popover ${className}`.trim()} ref={rootRef}>
        <button
          type="button"
          className="lang-popover-trigger"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="lang-popover-globe" aria-hidden="true">
            🌐
          </span>
          <span className="lang-popover-code">{locale.toUpperCase()}</span>
        </button>
        {open && (
          <div className="lang-popover-panel" role="dialog" aria-label={t('langPicker.label')}>
            <p className="lang-popover-title">{t('langPicker.hint')}</p>
            <LanguageGrid
              locale={locale}
              setLocale={setLocale}
              className="lang-picker-panel-grid"
              onSelect={() => setOpen(false)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`lang-picker lang-picker-full ${className}`.trim()} role="group" aria-label={t('langPicker.label')}>
      <span className="lang-picker-globe" aria-hidden="true">
        🌐
      </span>
      <LanguageGrid locale={locale} setLocale={setLocale} className="lang-picker-full-grid" />
    </div>
  );
}
