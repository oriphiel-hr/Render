function isFilled(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function calculateProfileCompleteness(profile) {
  const checks = [
    isFilled(profile.displayName),
    isFilled(profile.city),
    isFilled(profile.bio),
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
