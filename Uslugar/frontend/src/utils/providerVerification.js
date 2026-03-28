/**
 * Poslovna verifikacija pružatelja.
 * Ako API šalje `businessVerified` (izračunato na backendu), koristi se to — inače fallback
 * (stari klijenti / ugniježđeni objekti bez polja).
 */
export function isProviderBusinessVerified(profile) {
  if (!profile || typeof profile !== 'object') return false;
  if (typeof profile.businessVerified === 'boolean') return profile.businessVerified;
  const b = profile.badgeData?.BUSINESS;
  return Boolean(
    profile.kycVerified ||
      b?.verified ||
      b?.status === 'VERIFIED' ||
      profile.approvalStatus === 'APPROVED'
  );
}
