export { CONTACT_EMAIL } from './env.js';

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
