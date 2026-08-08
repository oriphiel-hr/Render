import { useState } from 'react';
import { useI18n } from '../lib/i18n/index.jsx';
import { formatTagLabel, isCatalogTag, MAX_TAGS, normalizeCustomTagInput } from '../lib/profile-tags.js';

export default function TagPicker({ tags = [], catalogKeys = [], scope = 'public', onChange, disabled }) {
  const { t } = useI18n();
  const [custom, setCustom] = useState('');
  const selected = Array.isArray(tags) ? tags : [];

  function toggle(key) {
    if (disabled) return;
    const exists = selected.includes(key);
    if (exists) {
      onChange?.(selected.filter((tag) => tag !== key));
      return;
    }
    if (selected.length >= MAX_TAGS) return;
    onChange?.([...selected, key]);
  }

  function remove(tag) {
    if (disabled) return;
    onChange?.(selected.filter((item) => item !== tag));
  }

  function addCustom() {
    if (disabled || selected.length >= MAX_TAGS) return;
    const normalized = normalizeCustomTagInput(custom);
    if (!normalized) return;
    const catalogKey = normalized.toUpperCase().replace(/\s+/g, '_');
    if (catalogKeys.includes(catalogKey)) {
      toggle(catalogKey);
      setCustom('');
      return;
    }
    const exists = selected.some(
      (tag) => (!isCatalogTag(tag) && tag.toLowerCase() === normalized.toLowerCase()) || tag === catalogKey
    );
    if (exists) {
      setCustom('');
      return;
    }
    onChange?.([...selected, normalized]);
    setCustom('');
  }

  return (
    <div className="tag-picker">
      <div className="choice-row tag-picker-catalog">
        {catalogKeys.map((key) => {
          const active = selected.includes(key);
          const full = !active && selected.length >= MAX_TAGS;
          return (
            <button
              key={key}
              type="button"
              className={`choice-chip tag-chip ${active ? 'active' : ''}`}
              disabled={disabled || full}
              onClick={() => toggle(key)}
            >
              {formatTagLabel(t, key, scope)}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="tag-picker-selected">
          {selected.map((tag) => (
            <span key={tag} className={`chip chip-tag chip-tag-${scope}`}>
              {formatTagLabel(t, tag, scope)}
              {!disabled && (
                <button type="button" className="tag-remove" onClick={() => remove(tag)} aria-label={t('tags.remove')}>
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="tag-picker-custom">
        <input
          className="input"
          value={custom}
          disabled={disabled || selected.length >= MAX_TAGS}
          placeholder={t('tags.customPlaceholder')}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button
          type="button"
          className="button button-secondary button-sm"
          disabled={disabled || selected.length >= MAX_TAGS || !custom.trim()}
          onClick={addCustom}
        >
          {t('tags.addCustom')}
        </button>
      </div>
      <p className="muted tag-picker-count">{t('tags.count', { current: selected.length, max: MAX_TAGS })}</p>
    </div>
  );
}
