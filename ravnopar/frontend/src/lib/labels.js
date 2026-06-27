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

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';
}
