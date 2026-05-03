import { isProviderBusinessVerified } from './trust.js';

/**
 * Naslov i podnaslov za javnu karticu / listu (web + mobile).
 * @param {object} provider
 * @returns {{ primary: string, secondary: string|null, avatarLetter: string }}
 */
export function getProviderPublicHeadline(provider) {
  const p = provider || {};
  const mode = p.publicListingMode || 'STANDARD';
  const name = p.user?.fullName || '';
  const company = (p.companyName || '').trim();
  const businessOk = isProviderBusinessVerified(p);

  if (mode === 'COMPANY_FIRST' && businessOk && company) {
    return {
      primary: company,
      secondary: name || null,
      avatarLetter: (company.charAt(0) || name.charAt(0) || '?').toUpperCase()
    };
  }
  return {
    primary: name || 'Pružatelj',
    secondary: company || null,
    avatarLetter: (name.charAt(0) || '?').toUpperCase()
  };
}

export function isPublicListingMinimal(provider) {
  return (provider?.publicListingMode || 'STANDARD') === 'MINIMAL_DISCOVERY';
}
