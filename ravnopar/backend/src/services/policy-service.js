export function evaluatePreferencePolicy(preferences) {
  const warnings = [];

  if (preferences.ageMin && preferences.ageMax && preferences.ageMax - preferences.ageMin < 4) {
    warnings.push('Dobni raspon je vrlo uzak; razmisli o sirem rasponu za vise prilika.');
  }

  if (Array.isArray(preferences.cities) && preferences.cities.length === 1) {
    warnings.push('Samo jedan grad moze znacajno smanjiti broj potencijalnih kontakata.');
  }

  if (preferences.distanceKm !== undefined && Number(preferences.distanceKm) < 10) {
    warnings.push('Mala udaljenost moze drasticno ograniciti vidljivost profila.');
  }

  const isVeryNarrow =
    warnings.length >= 2 ||
    (preferences.ageMin && preferences.ageMax && preferences.ageMax - preferences.ageMin < 3);

  return {
    ok: true,
    isVeryNarrow,
    warnings
  };
}

export function evaluateContactLimiter(outgoingPendingLast24h) {
  if (outgoingPendingLast24h >= 30) {
    return { allow: false, reason: 'Previsok broj zahtjeva u 24h. Pricekaj i fokusiraj se na postojece razgovore.' };
  }
  if (outgoingPendingLast24h >= 15) {
    return { allow: true, warning: 'Blizu si anti-spam limita. Fokusiraj se na kvalitetu poruka.' };
  }
  return { allow: true };
}
