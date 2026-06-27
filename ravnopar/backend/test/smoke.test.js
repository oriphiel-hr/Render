import test from 'node:test';
import assert from 'node:assert/strict';

test('profile completeness requires photo and bio', async () => {
  const { calculateProfileCompleteness } = await import('../src/services/profile-service.js');
  const base = {
    displayName: 'Ana',
    city: 'Zagreb',
    bio: 'Bok!',
    photos: ['data:image/jpeg;base64,abc'],
    identity: 'FEMALE',
    profileType: 'INDIVIDUAL',
    seekingIdentities: ['MALE'],
    seekingProfileTypes: ['INDIVIDUAL'],
    intents: ['RELATIONSHIP'],
    age: 25
  };
  assert.equal(calculateProfileCompleteness(base), 100);
  assert.ok(calculateProfileCompleteness({ ...base, bio: '' }) < 100);
});

test('public profile strips email', async () => {
  const { toPublicProfile } = await import('../src/lib/profile-public.js');
  const profile = toPublicProfile({
    id: '1',
    email: 'secret@example.com',
    displayName: 'Test',
    age: 25,
    city: 'Split',
    bio: null,
    identity: 'OTHER',
    profileType: 'INDIVIDUAL',
    seekingIdentities: [],
    seekingProfileTypes: [],
    intents: [],
    availability: 'AVAILABLE',
    photos: [],
    planTier: 'free',
    photoVerified: false,
    onboardingDone: false,
    createdAt: new Date()
  });
  assert.equal(profile.email, undefined);
  assert.equal(profile.displayName, 'Test');
});
