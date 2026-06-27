const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generateReferralCode(displayName = '') {
  const base = String(displayName)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 4);
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${base || 'rp'}${suffix}`.slice(0, 12);
}

export async function ensureReferralCode(prismaClient, profileId, displayName) {
  const existing = await prismaClient.userProfile.findUnique({
    where: { id: profileId },
    select: { referralCode: true }
  });
  if (existing?.referralCode) return existing.referralCode;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateReferralCode(displayName);
    try {
      const updated = await prismaClient.userProfile.update({
        where: { id: profileId },
        data: { referralCode: code }
      });
      return updated.referralCode;
    } catch (_error) {
      /* collision — retry */
    }
  }
  return null;
}
