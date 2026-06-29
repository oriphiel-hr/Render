export function evaluatePreferencePolicy(preferences) {
  const warnings = [];

  if (
    preferences.ageMin != null &&
    preferences.ageMax != null &&
    preferences.ageMax - preferences.ageMin < 4
  ) {
    warnings.push({ code: 'NARROW_AGE_RANGE' });
  }

  if (preferences.sameCountryOnly) {
    warnings.push({ code: 'SAME_COUNTRY_ONLY' });
  }

  if (preferences.distanceKm != null && Number(preferences.distanceKm) < 50) {
    warnings.push({ code: 'SMALL_DISTANCE', vars: { km: preferences.distanceKm } });
  }

  if (preferences.distanceKm != null && !preferences.hasLocation) {
    warnings.push({ code: 'DISTANCE_WITHOUT_LOCATION' });
  }

  const isVeryNarrow =
    warnings.length >= 2 ||
    (preferences.ageMin != null &&
      preferences.ageMax != null &&
      preferences.ageMax - preferences.ageMin < 3);

  return {
    ok: true,
    isVeryNarrow,
    warnings
  };
}

export function evaluateContactLimiter(outgoingPendingLast24h) {
  if (outgoingPendingLast24h >= 30) {
    return {
      allow: false,
      reason: 'Previsok broj zahtjeva u 24h. Pricekaj i fokusiraj se na postojece razgovore.'
    };
  }
  if (outgoingPendingLast24h >= 15) {
    return {
      allow: true,
      warning: 'Blizu si anti-spam limita. Fokusiraj se na kvalitetu poruka.'
    };
  }
  return { allow: true };
}
