export function normalizePhotos(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && item.trim().length > 0).slice(0, 3);
}

export function toPublicProfile(profile, extras = {}) {
  if (!profile) return null;
  return {
    id: profile.id,
    displayName: profile.displayName,
    age: profile.age,
    city: profile.city,
    bio: profile.bio,
    identity: profile.identity,
    profileType: profile.profileType,
    seekingIdentities: profile.seekingIdentities,
    seekingProfileTypes: profile.seekingProfileTypes,
    intents: profile.intents,
    availability: profile.availability,
    photos: normalizePhotos(profile.photos),
    planTier: profile.planTier || 'free',
    createdAt: profile.createdAt,
    ...extras
  };
}
