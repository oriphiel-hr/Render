/** Jezici koje Ravnopar podržava — native nazivi u izborniku. */
export const SUPPORTED_LOCALES = ['hr', 'en', 'de', 'sl', 'bs', 'sr', 'it', 'hu', 'pl', 'cs', 'fr', 'es', 'sk'];

export const LOCALE_LABELS = {
  hr: 'Hrvatski',
  en: 'English',
  de: 'Deutsch',
  sl: 'Slovenščina',
  bs: 'Bosanski',
  sr: 'Srpski',
  it: 'Italiano',
  hu: 'Magyar',
  pl: 'Polski',
  cs: 'Čeština',
  fr: 'Français',
  es: 'Español',
  sk: 'Slovenčina'
};

/** Prvi posjet: uskladi s jezikom preglednika ako ga podržavamo. */
export function detectBrowserLocale() {
  if (typeof navigator === 'undefined') return null;
  const candidates = navigator.languages?.length
    ? Array.from(navigator.languages)
    : navigator.language
      ? [navigator.language]
      : [];
  for (const raw of candidates) {
    const base = String(raw).split('-')[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(base)) return base;
  }
  return null;
}
