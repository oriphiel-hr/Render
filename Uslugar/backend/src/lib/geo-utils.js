// Geo-utils: Distance calculations and geo-matching for dynamic team locations

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 Latitude of first point
 * @param {number} lon1 Longitude of first point
 * @param {number} lat2 Latitude of second point
 * @param {number} lon2 Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Check if job is within radius of team location
 * @param {Object} teamLocation - Team location with latitude, longitude, radiusKm
 * @param {Object} job - Job with latitude, longitude (or city for fallback)
 * @returns {Object} { isWithinRadius: boolean, distanceKm: number }
 */
export function isWithinRadius(teamLocation, job) {
  if (!teamLocation.latitude || !teamLocation.longitude) {
    // Fallback: city match if GPS not available
    return {
      isWithinRadius: teamLocation.city === job.city,
      distanceKm: teamLocation.city === job.city ? 0 : Infinity
    };
  }

  if (!job.latitude || !job.longitude) {
    // Fallback: city match
    return {
      isWithinRadius: teamLocation.city === job.city,
      distanceKm: teamLocation.city === job.city ? 0 : Infinity
    };
  }

  const distanceKm = calculateDistance(
    teamLocation.latitude,
    teamLocation.longitude,
    job.latitude,
    job.longitude
  );

  return {
    isWithinRadius: distanceKm <= teamLocation.radiusKm,
    distanceKm
  };
}

/**
 * Find closest active team location for a job
 * @param {Array} teamLocations - Array of active team locations
 * @param {Object} job - Job with latitude, longitude
 * @returns {Object|null} Closest team location with distance, or null
 */
export function findClosestTeamLocation(teamLocations, job) {
  const activeLocations = teamLocations.filter(tl => tl.isActive);
  
  if (activeLocations.length === 0) return null;

  let closest = null;
  let minDistance = Infinity;

  for (const location of activeLocations) {
    const { distanceKm, isWithinRadius } = isWithinRadius(location, job);
    
    if (isWithinRadius && distanceKm < minDistance) {
      minDistance = distanceKm;
      closest = { ...location, distanceKm };
    }
  }

  return closest;
}

/**
 * Sort jobs by distance to nearest active team location
 * @param {Array} jobs - Array of jobs
 * @param {Array} teamLocations - Array of active team locations
 * @returns {Array} Sorted jobs with distance metadata
 */
export function sortJobsByDistance(jobs, teamLocations) {
  return jobs.map(job => {
    const closest = findClosestTeamLocation(teamLocations, job);
    return {
      ...job,
      distanceKm: closest?.distanceKm ?? Infinity,
      nearestTeamLocation: closest?.name ?? null
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

