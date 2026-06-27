const EARTH_RADIUS_KM = 6371;

export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceLabel(km, sameCity = false) {
  if (sameCity && km < 3) return 'Isti grad';
  if (km < 5) return 'Manje od 5 km';
  if (km < 15) return '5–15 km';
  if (km < 50) return '15–50 km';
  return '50+ km';
}

export function distanceLabelForProfiles(viewer, target) {
  if (!viewer?.shareLocation || !target?.shareLocation) return null;
  if (
    typeof viewer.latitude !== 'number' ||
    typeof viewer.longitude !== 'number' ||
    typeof target.latitude !== 'number' ||
    typeof target.longitude !== 'number'
  ) {
    return null;
  }
  const km = haversineKm(viewer.latitude, viewer.longitude, target.latitude, target.longitude);
  const sameCity =
    viewer.city &&
    target.city &&
    viewer.city.trim().toLowerCase() === target.city.trim().toLowerCase();
  return formatDistanceLabel(km, sameCity);
}
