/**
 * Jedna definicija povjerenja (trust) — web + mobile.
 * Odgovarajuća je backend logici isProviderProfileBusinessVerified osim
 * opcijskog kratkog polja `businessVerified` s API-ja.
 */

function parseBadgeData(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return typeof raw === 'object' ? raw : null;
}

/**
 * @param {object|null|undefined} profile
 * @returns {boolean}
 */
export function isProviderBusinessVerified(profile) {
  if (!profile || typeof profile !== 'object') return false;
  if (typeof profile.businessVerified === 'boolean') return profile.businessVerified;
  const bd = parseBadgeData(profile.badgeData);
  const b = bd?.BUSINESS;
  return Boolean(
    profile.kycVerified ||
      b?.verified ||
      b?.status === 'VERIFIED' ||
      profile.approvalStatus === 'APPROVED'
  );
}

function hasVerifiedLicense(profile) {
  const list = profile?.licenses;
  if (!Array.isArray(list) || !list.length) return false;
  return list.some((L) => L && (L.isVerified === true || L.verifiedAt));
}

/**
 * Pojedine provjere koje korisniku prikazujemo kao točno/ne.
 * @param {object} profile
 * @param {object} [user]
 * @returns {{ level: 'strong'|'partial'|'none', headline: string, subline: string, items: { id: string, label: string, ok: boolean, hint?: string }[] }}
 */
export function getProviderTrustLayer(profile, user) {
  const p = profile && typeof profile === 'object' ? profile : {};
  const u = user && typeof user === 'object' ? user : p.user;
  const business = isProviderBusinessVerified(p);
  const identity = Boolean(
    p.identityEmailVerified || p.identityPhoneVerified || p.identityDnsVerified
  );
  const kyc = Boolean(p.kycOcrVerified || p.kycVerified);
  const legal = p.legalStatus;
  const oibDoo =
    kyc && legal && (legal.code === 'DOO' || legal.code === 'JDOO' || legal.code === 'J.D.O.O.');
  const adminApproved = p.approvalStatus === 'APPROVED';
  const licenseOk = hasVerifiedLicense(p);
  const safety = Boolean(p.safetyInsuranceUrl);
  const phoneOk = Boolean(u && u.phoneVerified);

  const items = [
    {
      id: 'business',
      label: 'Poslovni status (registri, odobrenje, KYC)',
      ok: business,
      hint: 'Sinkronizirano s administratorskim / KYC tokom'
    },
    {
      id: 'identity',
      label: 'Digitalni identitet (email, telefon ili DNS domena)',
      ok: identity
    },
    { id: 'kycOib', label: 'KYC / OIB (gdje se primjenjuje)', ok: oibDoo || kyc },
    {
      id: 'licenses',
      label: 'Strukovne licence (barem jedna provjerena od strane platforme)',
      ok: licenseOk
    },
    { id: 'safety', label: 'Odgovornost (unaprijed prijavljena polica / sigurnosni podaci)', ok: safety },
    { id: 'adminApproval', label: 'Eksplicitno admin odobrenje profila', ok: adminApproved },
    { id: 'phone', label: 'Broj telefona potvrđen SMS-om (korisnički račun)', ok: phoneOk }
  ];

  const okCount = items.filter((i) => i.ok).length;
  let level = 'none';
  if (okCount >= 4) level = 'strong';
  else if (okCount >= 1) level = 'partial';

  let headline = 'Ograničene javne provjere';
  let subline =
    'Neki elementi (pr. licence ili KYC) možda još nisu u potpunosti sakupljeni. To nije nužno znak problema — često se radi o novom profilu.';

  if (level === 'strong') {
    headline = 'Jaki signal povjerenja';
    subline =
      'Vidljivo je nekoliko nezavisnih provjera. Provjerite u popisu ispod što je točno uključeno.';
  } else if (level === 'partial') {
    headline = 'Djelomično provjeren profil';
    subline = 'Dio informacija provjeren je kroz Uslugar; u tablici ispod vidi jasno što jest, što nije.';
  }

  return { level, headline, subline, items, verifiedCount: okCount, totalChecks: items.length };
}

/** Broj provjernih signala u tablici povjerenja (MVP). */
export const TRUST_CHECK_TOTAL = 7;

/**
 * Isto što backend primjenjuje na GET /providers?verified=true
 * (provider-business KYC/odobrenje/badges ILI identitet).
 */
export function passesPublicVerifiedFilter(p) {
  if (!p || typeof p !== 'object') return false;
  return (
    isProviderBusinessVerified(p) ||
    Boolean(p.identityEmailVerified) ||
    Boolean(p.identityPhoneVerified) ||
    Boolean(p.identityDnsVerified)
  );
}

/**
 * Isto kao ?hasLicenses=true — lista s API-ja uključuje samo isVerified licence.
 */
export function passesHasVerifiedLicensesFilter(p) {
  return hasVerifiedLicense(p);
}

/**
 * Kratki bedževi za karticu: tvrtka, identitet, broj licenci, SMS.
 */
export function getProviderVisualBadges(profile, user) {
  const p = profile && typeof profile === 'object' ? profile : {};
  const u = user && typeof user === 'object' ? user : p.user;
  const licCount = Array.isArray(p.licenses)
    ? p.licenses.filter((L) => L && (L.isVerified || L.verifiedAt)).length
    : 0;
  return [
    {
      id: 'company',
      short: 'Tvrtka',
      ok: Boolean(
        p.companyName && (isProviderBusinessVerified(p) || p.kycVerified || p.approvalStatus === 'APPROVED')
      )
    },
    {
      id: 'identity',
      short: 'ID',
      ok: Boolean(p.identityEmailVerified || p.identityPhoneVerified || p.identityDnsVerified)
    },
    { id: 'license', short: 'Licenca', ok: licCount > 0, count: licCount },
    { id: 'sms', short: 'SMS', ok: Boolean(u && u.phoneVerified) }
  ];
}

/** Faze spora / garancije (prikaz korisniku – operativu radi tim). */
export const DISPUTE_WORKFLOW_PHASES = [
  { key: 'OPEN', label: 'Zaprimljeno', hint: 'Uslugar zapisuje predmet i rok za prvi odgovor tima.' },
  { key: 'IN_REVIEW', label: 'U analizi', hint: 'Provjera posla, komunikacija, eventualni dokazi.' },
  { key: 'RESOLVED', label: 'Riješeno', hint: 'Ishod (npr. isplata u okviru Guarantee) — službeno u sustavu.' },
  { key: 'REJECTED', label: 'Odbijeno / izvan opsega', hint: 'Obrazloženje; korisnik može dopunu ili vanjski postupak.' }
];

export function describeTrustSlaSort() {
  return 'Kombinacija prosječne ocjene, procijenjenog vremena prve ponude (ETA) i prosječnog vremena odgovora pružatelja (SLA).';
}
