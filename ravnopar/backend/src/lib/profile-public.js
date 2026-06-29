import {
  activityStatusFor,
  normalizePrivateTags,
  normalizePublicTags,
  tagsOverlap
} from './profile-tags.js';
import { lifestyleFieldsFromProfile } from './profile-lifestyle.js';

export function normalizePhotos(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && item.trim().length > 0).slice(0, 3);
}

export function normalizeIcebreakers(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item.question === 'string' && typeof item.answer === 'string')
    .map((item) => ({
      question: item.question.trim().slice(0, 120),
      answer: item.answer.trim().slice(0, 200)
    }))
    .filter((item) => item.question && item.answer)
    .slice(0, 3);
}

export { normalizePublicTags, normalizePrivateTags, activityStatusFor, tagsOverlap };

export function toPublicProfile(profile, extras = {}) {
  if (!profile) return null;
  const photos = normalizePhotos(profile.photos);
  const lifestyle = lifestyleFieldsFromProfile(profile);
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
    photos,
    photoCount: photos.length,
    icebreakers: normalizeIcebreakers(profile.icebreakers),
    publicTags: normalizePublicTags(profile.publicTags),
    activityStatus: activityStatusFor(profile.lastActiveAt),
    ...lifestyle,
    videoUrl: profile.videoUrl || null,
    planTier: profile.planTier || 'free',
    photoVerified: profile.photoVerified === true,
    onboardingDone: profile.onboardingDone === true,
    createdAt: profile.createdAt,
    ...extras
  };
}
