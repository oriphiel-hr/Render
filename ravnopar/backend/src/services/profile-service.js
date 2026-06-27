function isFilled(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function hasPhoto(profile) {
  if (!Array.isArray(profile.photos)) return false;
  return profile.photos.some((item) => typeof item === 'string' && item.trim().length > 0);
}

export function calculateProfileCompleteness(profile) {
  const checks = [
    isFilled(profile.displayName),
    isFilled(profile.city),
    isFilled(profile.bio),
    hasPhoto(profile),
    isFilled(profile.identity),
    isFilled(profile.profileType),
    isFilled(profile.seekingIdentities),
    isFilled(profile.seekingProfileTypes),
    isFilled(profile.intents),
    profile.age >= 18
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function hasProfilePhoto(profile) {
  return hasPhoto(profile);
}

export function hasMinimumBio(profile, minLength = 10) {
  return typeof profile?.bio === 'string' && profile.bio.trim().length >= minLength;
}

export function isFeedReady(profile) {
  return hasProfilePhoto(profile) && hasMinimumBio(profile);
}
