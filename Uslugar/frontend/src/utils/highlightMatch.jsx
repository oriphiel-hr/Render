import React from 'react';

/**
 * Označi (highlight) sve pojavnice upita u tekstu (case-insensitive).
 * @param {string} text - Cijeli tekst
 * @param {string} query - Traženi niz (može biti prazan)
 * @returns {React.ReactNode} - Tekst s <mark> oko podudaranja
 */
export function highlightMatch(text, query) {
  if (!text) return '';
  if (!query || typeof query !== 'string') return text;
  const q = query.trim();
  if (!q) return text;
  try {
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = String(text).split(re);
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-600/50 rounded px-0.5 font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  } catch {
    return text;
  }
}

export default highlightMatch;
