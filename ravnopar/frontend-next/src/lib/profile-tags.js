export const MAX_TAGS = 5;
export const PUBLIC_TAG_KEYS = [
  'READING',
  'HIKING',
  'ANIMALS',
  'COFFEE',
  'MUSIC',
  'TRAVEL',
  'SPORTS',
  'COOKING',
  'GAMING',
  'ART',
  'NATURE',
  'MOVIES',
  'DANCING',
  'PHOTOGRAPHY'
];
export const PRIVATE_TAG_KEYS = [
  'CASUAL_SEX',
  'NO_RUSH_INTIMACY',
  'CUDDLES',
  'OPEN_MINDED',
  'MONOGAMOUS',
  'EXPLORING',
  'FRIENDSHIP_FIRST',
  'LONG_TERM_FOCUS'
];

export function isCatalogTag(tag) {
  return typeof tag === 'string' && tag === tag.toUpperCase();
}

export function formatTagLabel(t, tag, scope = 'public') {
  if (isCatalogTag(tag)) {
    const key = `tags.${scope}.${tag}`;
    const label = t(key);
    return label === key ? tag : label;
  }
  return tag;
}

export function formatActivityStatus(t, status) {
  if (!status) return null;
  if (status === 'online') return t('activity.online');
  if (status === 'today') return t('activity.today');
  if (status === 'week') return t('activity.week');
  if (status?.kind === 'days') return t('activity.daysAgo', { days: status.days });
  return null;
}

export function normalizeCustomTagInput(value) {
  const trimmed = String(value).trim().replace(/\s+/g, ' ');
  if (trimmed.length < 2 || trimmed.length > 32) return null;
  return trimmed;
}
