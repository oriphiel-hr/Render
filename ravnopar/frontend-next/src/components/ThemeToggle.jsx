'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '../lib/i18n/index.jsx';

const STORAGE_KEY = 'ravnopar-theme';

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem(STORAGE_KEY) || 'light';
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export default function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggle() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  return (
    <button type="button" className="button button-ghost theme-toggle" onClick={toggle} aria-label={t('theme.toggle')}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
