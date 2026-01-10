// Haversine formula za računanje udaljenosti između dvije točke
// Vraća udaljenost u kilometrima
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius Zemlje u km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (value) => {
  return value * Math.PI / 180;
};

// Filter poslove po udaljenosti
export const filterByDistance = (jobs, userLat, userLon, maxDistance) => {
  return jobs.filter(job => {
    if (!job.latitude || !job.longitude) return false;
    const distance = calculateDistance(userLat, userLon, job.latitude, job.longitude);
    return distance <= maxDistance;
  }).map(job => ({
    ...job,
    distance: calculateDistance(userLat, userLon, job.latitude, job.longitude)
  })).sort((a, b) => a.distance - b.distance);
};

// Geocoding helper (za conversion adrese u koordinate)
// U produkciji koristite API kao Google Maps, Mapbox, ili OpenStreetMap Nominatim
export const geocodeAddress = async (address) => {
  // Placeholder - implementirati s pravim geocoding API-jem
  // Primjer: Google Maps Geocoding API, Mapbox Geocoding API
  console.log('Geocoding address:', address);
  
  // Za sada vraćamo null - implementirajte s vašim izabranim API-jem
  return {
    latitude: null,
    longitude: null
  };
};

export default {
  calculateDistance,
  filterByDistance,
  geocodeAddress
};

