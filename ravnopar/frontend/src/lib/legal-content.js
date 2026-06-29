export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL?.trim() || 'podrska@ravnopar.app';

export function getLegalDisclaimer(catalog) {
  return catalog?.legal?.disclaimer ?? '';
}

export function getPrivacySections(catalog) {
  return catalog?.legal?.privacy?.sections ?? [];
}

export function getTermsSections(catalog) {
  return catalog?.legal?.terms?.sections ?? [];
}

export function getGuidelinesSections(catalog) {
  return catalog?.legal?.guidelines?.sections ?? [];
}
