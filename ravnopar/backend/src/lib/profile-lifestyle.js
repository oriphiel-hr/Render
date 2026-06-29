export const CHILDREN_KEYS = ['NONE', 'HAS', 'WANTS_SOMEDAY', 'NOT_IMPORTANT'];
export const SMOKING_KEYS = ['NO', 'SOMETIMES', 'YES'];
export const RELATIONSHIP_KEYS = ['SINGLE', 'OPEN', 'COMPLICATED'];

const CHILDREN_SET = new Set(CHILDREN_KEYS);
const SMOKING_SET = new Set(SMOKING_KEYS);
const RELATIONSHIP_SET = new Set(RELATIONSHIP_KEYS);

export function normalizeChildrenPref(value) {
  if (value === null || value === undefined || value === '') return null;
  const key = String(value).toUpperCase();
  return CHILDREN_SET.has(key) ? key : null;
}

export function normalizeSmoking(value) {
  if (value === null || value === undefined || value === '') return null;
  const key = String(value).toUpperCase();
  return SMOKING_SET.has(key) ? key : null;
}

export function normalizeRelationshipStatus(value) {
  if (value === null || value === undefined || value === '') return null;
  const key = String(value).toUpperCase();
  return RELATIONSHIP_SET.has(key) ? key : null;
}

export function lifestyleFieldsFromProfile(profile) {
  return {
    childrenPref: normalizeChildrenPref(profile?.childrenPref),
    smoking: normalizeSmoking(profile?.smoking),
    relationshipStatus: normalizeRelationshipStatus(profile?.relationshipStatus)
  };
}

export function scoreLifestyleOverlap(me, candidate) {
  const pairs = [
    ['childrenPref', me.childrenPref, candidate.childrenPref],
    ['smoking', me.smoking, candidate.smoking],
    ['relationshipStatus', me.relationshipStatus, candidate.relationshipStatus]
  ];
  const matches = [];
  let points = 0;
  for (const [field, left, right] of pairs) {
    if (left && right && left === right) {
      matches.push(field);
      points += 2;
    }
  }
  return { points, matches };
}

export function shouldShowAwaitingContact({ incoming7d = 0, waitingDays = 0 }) {
  return incoming7d === 0 && waitingDays >= 2;
}
