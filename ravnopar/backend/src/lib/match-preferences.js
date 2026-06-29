import { haversineKm } from './geo.js';

export const MIN_AGE = 18;
export const MAX_AGE = 99;
export const DEFAULT_AGE_SPAN = 7;

export function defaultSeekingAgeRange(age) {
  const years = Number(age);
  if (!Number.isFinite(years)) {
    return { seekingAgeMin: MIN_AGE, seekingAgeMax: MAX_AGE };
  }
  return {
    seekingAgeMin: Math.max(MIN_AGE, years - DEFAULT_AGE_SPAN),
    seekingAgeMax: Math.min(MAX_AGE, years + DEFAULT_AGE_SPAN)
  };
}

export function normalizeSeekingAgeRange(min, max, fallbackAge) {
  const defaults = defaultSeekingAgeRange(fallbackAge);
  let seekingAgeMin = Number.isFinite(Number(min)) ? Number(min) : defaults.seekingAgeMin;
  let seekingAgeMax = Number.isFinite(Number(max)) ? Number(max) : defaults.seekingAgeMax;
  seekingAgeMin = Math.max(MIN_AGE, Math.min(MAX_AGE, Math.round(seekingAgeMin)));
  seekingAgeMax = Math.max(MIN_AGE, Math.min(MAX_AGE, Math.round(seekingAgeMax)));
  if (seekingAgeMin > seekingAgeMax) {
    [seekingAgeMin, seekingAgeMax] = [seekingAgeMax, seekingAgeMin];
  }
  return { seekingAgeMin, seekingAgeMax };
}

export function validateSeekingAgeRange(min, max) {
  const seekingAgeMin = Math.round(Number(min));
  const seekingAgeMax = Math.round(Number(max));
  if (!Number.isFinite(seekingAgeMin) || !Number.isFinite(seekingAgeMax)) {
    return { ok: false, code: 'INVALID' };
  }
  if (seekingAgeMin < MIN_AGE || seekingAgeMax < MIN_AGE) {
    return { ok: false, code: 'UNDER_MIN' };
  }
  if (seekingAgeMin > MAX_AGE || seekingAgeMax > MAX_AGE) {
    return { ok: false, code: 'OVER_MAX' };
  }
  if (seekingAgeMin > seekingAgeMax) {
    return { ok: false, code: 'INVERTED' };
  }
  return { ok: true, seekingAgeMin, seekingAgeMax };
}

export function normalizeMaxDistanceKm(value) {
  if (value === null || value === undefined || value === '' || value === 0) return null;
  const km = Math.round(Number(value));
  if (!Number.isFinite(km) || km < 1) return null;
  return Math.min(500, km);
}

export function ageInRange(age, min, max) {
  const years = Number(age);
  if (!Number.isFinite(years)) return false;
  const low = Number(min ?? MIN_AGE);
  const high = Number(max ?? MAX_AGE);
  return years >= low && years <= high;
}

export function isAgeCompatible(me, candidate) {
  return (
    ageInRange(candidate.age, me.seekingAgeMin, me.seekingAgeMax) &&
    ageInRange(me.age, candidate.seekingAgeMin, candidate.seekingAgeMax)
  );
}

export function isCountryCompatible(me, candidate) {
  if (me.sameCountryOnly && me.country && candidate.country && me.country !== candidate.country) {
    return false;
  }
  if (candidate.sameCountryOnly && me.country && candidate.country && candidate.country !== me.country) {
    return false;
  }
  return true;
}

function withinDistance(viewer, target) {
  const maxKm = normalizeMaxDistanceKm(viewer.maxDistanceKm);
  if (maxKm == null) return true;
  if (
    !viewer.shareLocation ||
    typeof viewer.latitude !== 'number' ||
    typeof viewer.longitude !== 'number'
  ) {
    return true;
  }
  if (
    !target.shareLocation ||
    typeof target.latitude !== 'number' ||
    typeof target.longitude !== 'number'
  ) {
    return true;
  }
  return haversineKm(viewer.latitude, viewer.longitude, target.latitude, target.longitude) <= maxKm;
}

export function isDistanceCompatible(me, candidate) {
  return withinDistance(me, candidate) && withinDistance(candidate, me);
}

export function preferenceFieldsFromProfile(profile) {
  const { seekingAgeMin, seekingAgeMax } = normalizeSeekingAgeRange(
    profile.seekingAgeMin,
    profile.seekingAgeMax,
    profile.age
  );
  return {
    seekingAgeMin,
    seekingAgeMax,
    maxDistanceKm: normalizeMaxDistanceKm(profile.maxDistanceKm),
    sameCountryOnly: profile.sameCountryOnly === true
  };
}
