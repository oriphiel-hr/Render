import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultSeekingAgeRange,
  isAgeCompatible,
  isCountryCompatible,
  isDistanceCompatible,
  normalizeSeekingAgeRange,
  validateSeekingAgeRange
} from '../src/lib/match-preferences.js';

test('default seeking age range spans seven years', () => {
  assert.deepEqual(defaultSeekingAgeRange(30), { seekingAgeMin: 23, seekingAgeMax: 37 });
  assert.deepEqual(defaultSeekingAgeRange(20), { seekingAgeMin: 18, seekingAgeMax: 27 });
});

test('normalize seeking age range clamps and swaps', () => {
  assert.deepEqual(normalizeSeekingAgeRange(40, 25, 30), { seekingAgeMin: 25, seekingAgeMax: 40 });
});

test('validate seeking age range rejects under 18', () => {
  assert.deepEqual(validateSeekingAgeRange(17, 30), { ok: false, code: 'UNDER_MIN' });
  assert.deepEqual(validateSeekingAgeRange(25, 16), { ok: false, code: 'UNDER_MIN' });
  assert.deepEqual(validateSeekingAgeRange(25, 35), {
    ok: true,
    seekingAgeMin: 25,
    seekingAgeMax: 35
  });
});

test('age compatibility is mutual', () => {
  const me = { age: 30, seekingAgeMin: 25, seekingAgeMax: 35 };
  const ok = { age: 28, seekingAgeMin: 26, seekingAgeMax: 40 };
  const young = { age: 22, seekingAgeMin: 18, seekingAgeMax: 30 };
  assert.equal(isAgeCompatible(me, ok), true);
  assert.equal(isAgeCompatible(me, young), false);
});

test('country filter is mutual', () => {
  const me = { country: 'HR', sameCountryOnly: true };
  const hr = { country: 'HR', sameCountryOnly: false };
  const de = { country: 'DE', sameCountryOnly: false };
  assert.equal(isCountryCompatible(me, hr), true);
  assert.equal(isCountryCompatible(me, de), false);
});

test('distance filter applies when both share coordinates', () => {
  const me = {
    maxDistanceKm: 10,
    shareLocation: true,
    latitude: 45.8,
    longitude: 15.9
  };
  const near = {
    maxDistanceKm: null,
    shareLocation: true,
    latitude: 45.81,
    longitude: 15.91
  };
  const far = {
    maxDistanceKm: null,
    shareLocation: true,
    latitude: 46.3,
    longitude: 16.3
  };
  assert.equal(isDistanceCompatible(me, near), true);
  assert.equal(isDistanceCompatible(me, far), false);
});
