import { useEffect, useState } from 'react';

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
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggle() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return (
    <button type="button" className="button button-ghost theme-toggle" onClick={toggle} aria-label="Promijeni temu">
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
