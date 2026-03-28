/**
 * Jedinstvena definicija „poslovno verificiranog“ pružatelja (backend).
 * Koriste: admin users-overview, javni provider API, filtri / značke, javne statistike.
 */

function businessBlockFromProfile(providerProfile) {
  let badgeData = providerProfile?.badgeData;
  if (typeof badgeData === 'string') {
    try {
      badgeData = JSON.parse(badgeData);
    } catch {
      badgeData = null;
    }
  }
  if (!badgeData || typeof badgeData !== 'object') return null;
  return badgeData.BUSINESS;
}

export function isProviderProfileBusinessVerified(providerProfile) {
  if (!providerProfile) return false;
  const b = businessBlockFromProfile(providerProfile);
  return Boolean(
    providerProfile.kycVerified ||
      (b && b.verified) ||
      (b && b.status === 'VERIFIED') ||
      providerProfile.approvalStatus === 'APPROVED'
  );
}

/**
 * Stupac „verifikacija“ u admin pregledu: ClientVerification (lead/trust)
 * ili ista poslovna pravila na ProviderProfile-u za PROVIDER ulogu.
 */
export function isCompanyVerifiedForAdminOverview(user, providerProfile, clientVerification) {
  if (clientVerification?.companyVerified) return true;
  if (user.role === 'PROVIDER' && isProviderProfileBusinessVerified(providerProfile)) return true;
  return false;
}
