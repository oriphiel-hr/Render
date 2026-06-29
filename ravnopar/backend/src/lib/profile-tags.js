export const MAX_TAGS = 5;
export const CUSTOM_TAG_MAX_LEN = 32;

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

const PUBLIC_SET = new Set(PUBLIC_TAG_KEYS);
const PRIVATE_SET = new Set(PRIVATE_TAG_KEYS);

const ONLINE_MS = 15 * 60 * 1000;
const TODAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const HIDE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

function normalizeCustomTag(value) {
  const trimmed = String(value).trim().replace(/\s+/g, ' ');
  if (trimmed.length < 2 || trimmed.length > CUSTOM_TAG_MAX_LEN) return null;
  if (!/^[\p{L}\p{N}][\p{L}\p{N} .,'-]*[\p{L}\p{N}]$/u.test(trimmed)) return null;
  return trimmed;
}

export function normalizeTagList(raw, { catalog, max = MAX_TAGS, rejectCatalogKeys = null }) {
  const allowed = catalog instanceof Set ? catalog : new Set(catalog);
  const rejected =
    rejectCatalogKeys instanceof Set ? rejectCatalogKeys : new Set(rejectCatalogKeys || []);
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    if (out.length >= max) break;
    const text = String(item ?? '').trim();
    if (!text) continue;
    const catalogKey = text.toUpperCase().replace(/\s+/g, '_');
    let tag;
    if (allowed.has(catalogKey)) {
      tag = catalogKey;
    } else if (rejected.has(catalogKey)) {
      continue;
    } else {
      const custom = normalizeCustomTag(text);
      if (!custom) continue;
      tag = custom;
    }
    const dedupeKey = typeof tag === 'string' && tag === tag.toUpperCase() ? tag : tag.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push(tag);
  }
  return out;
}

export function normalizePublicTags(raw) {
  return normalizeTagList(raw, { catalog: PUBLIC_SET });
}

export function normalizePrivateTags(raw) {
  return normalizeTagList(raw, { catalog: PRIVATE_SET, rejectCatalogKeys: PUBLIC_SET });
}

export function tagsOverlap(a, b) {
  const left = normalizePublicTags(a);
  const right = normalizePublicTags(b);
  const rightKeys = new Set(right.map((tag) => tagKey(tag)));
  return left.filter((tag) => rightKeys.has(tagKey(tag)));
}

function tagKey(tag) {
  return typeof tag === 'string' && tag === tag.toUpperCase() ? tag : tag.toLowerCase();
}

export function scorePublicTagOverlap(me, candidate) {
  const overlap = tagsOverlap(me.publicTags, candidate.publicTags);
  const points = overlap.length * 3;
  return { points, overlap };
}

export function activityStatusFor(lastActiveAt) {
  if (!lastActiveAt) return null;
  const ts = new Date(lastActiveAt).getTime();
  if (Number.isNaN(ts)) return null;
  const ageMs = Date.now() - ts;
  if (ageMs < 0) return null;
  if (ageMs > HIDE_AFTER_MS) return null;
  if (ageMs <= ONLINE_MS) return 'online';
  if (ageMs <= TODAY_MS) return 'today';
  if (ageMs <= WEEK_MS) return 'week';
  const days = Math.max(1, Math.floor(ageMs / (24 * 60 * 60 * 1000)));
  return { kind: 'days', days };
}

export function tagCatalogPayload() {
  return {
    public: PUBLIC_TAG_KEYS,
    private: PRIVATE_TAG_KEYS,
    max: MAX_TAGS
  };
}
