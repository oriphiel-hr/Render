export const IDENTITY_LABELS = {
  MALE: 'Muško',
  FEMALE: 'Žensko',
  NON_BINARY: 'Nebinarno',
  OTHER: 'Drugo'
};

export const PROFILE_TYPE_LABELS = {
  INDIVIDUAL: 'Osoba',
  COUPLE: 'Par'
};

export const INTENT_LABELS = {
  CHAT: 'Razgovor',
  CASUAL: 'Ležerno druženje',
  RELATIONSHIP: 'Veza',
  MARRIAGE: 'Brak',
  ADVENTURE: 'Avantura'
};

export const AVAILABILITY_LABELS = {
  AVAILABLE: 'Dostupan/na',
  FOCUSED_CONTACT: 'U razgovoru',
  PAUSED: 'Pauzirano'
};

export const ROLE_LABELS = {
  USER: 'Korisnik',
  ADMIN: 'Administrator'
};

export function labelRole(value) {
  return ROLE_LABELS[value] || value;
}

export const PLAN_TIER_LABELS = {
  free: 'Besplatno',
  plus: 'Plus',
  supporter: 'Supporter'
};

export const ADMIN_PLAN_TIERS = ['free', 'plus', 'supporter'];

export function labelPlanTier(value) {
  return PLAN_TIER_LABELS[value] || value;
}

const AUDIT_CATEGORY_LABELS = {
  ADMIN_ACTION: 'Admin',
  MODERATION: 'Moderacija',
  SECURITY: 'Sigurnost',
  FEED_RANKING: 'Feed rang',
  COMPLIANCE: 'Compliance'
};

const AUDIT_ACTION_LABELS = {
  SUSPEND: 'Suspend',
  UNSUSPEND: 'Unsuspend',
  DELETE_USER: 'Brisanje',
  PLAN_CHANGE: 'Paket',
  ROLE_CHANGE: 'Uloga',
  VERIFY_PHOTO: 'Verifikacija',
  UNVERIFY_PHOTO: 'Ukloni verifikaciju',
  VERIFY_REJECT: 'Odbij selfie',
  AVAILABILITY_CHANGE: 'Status',
  ONBOARDING_CHANGE: 'Onboarding',
  REPORT_RESOLVED: 'Prijava riješena',
  BLOCK: 'Blok',
  REPORT: 'Prijava',
  FEED_SNAPSHOT: 'Feed snapshot',
  DATA_EXPORT: 'Export podataka',
  ACCOUNT_DELETE_SELF: 'Brisanje računa',
  ACCOUNT_DELETE: 'Brisanje računa',
  ADMIN_USER_SEARCH: 'Admin pretraga'
};

const MODERATION_ACTION_LABELS = {
  NONE: 'Bez akcije',
  WARN: 'Upozorenje',
  SUSPEND: 'Suspend',
  DELETE: 'Brisanje'
};

export function labelAuditCategory(value) {
  return AUDIT_CATEGORY_LABELS[value] || value;
}

export function labelAuditAction(value) {
  return AUDIT_ACTION_LABELS[value] || value;
}

export function labelModerationAction(value) {
  return MODERATION_ACTION_LABELS[value] || value;
}

export function labelIdentity(value) {
  return IDENTITY_LABELS[value] || value;
}

export function labelProfileType(value) {
  return PROFILE_TYPE_LABELS[value] || value;
}

export function labelIntent(value) {
  return INTENT_LABELS[value] || value;
}

export function labelAvailability(value) {
  return AVAILABILITY_LABELS[value] || value;
}

export const REPORT_STATUS_LABELS = {
  OPEN: 'Otvoreno',
  IN_REVIEW: 'U pregledu',
  RESOLVED: 'Riješeno',
  DISMISSED: 'Odbijeno'
};

export function labelReportStatus(value) {
  return REPORT_STATUS_LABELS[value] || value;
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';
}
