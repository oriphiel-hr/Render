// Ažurira statistiku leadova po tim lokacijama (ProviderTeamLocation)
import { prisma } from '../lib/prisma.js';
import { findClosestTeamLocation } from '../lib/geo-utils.js';

/**
 * Povećaj statistiku leadova na tim lokaciji koja pokriva posao
 * @param {string} providerUserId - ID korisnika (User.id) koji je provider
 * @param {Object} job - Posao s city, latitude, longitude
 * @param {{ leadsReceived?: number, leadsAccepted?: number, leadsConverted?: number }} stats - Polja za inkrement
 */
export async function incrementTeamLocationLeadStats(providerUserId, job, stats = {}) {
  if (!job || (!stats.leadsReceived && !stats.leadsAccepted && !stats.leadsConverted)) return;

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: providerUserId },
    select: { id: true },
    include: {
      teamLocations: {
        where: { isActive: true },
        select: { id: true, latitude: true, longitude: true, radiusKm: true, city: true, isPrimary: true }
      }
    }
  });

  if (!profile || !profile.teamLocations?.length) return;

  const closest = findClosestTeamLocation(profile.teamLocations, job);
  const locationId = closest?.id ?? profile.teamLocations.find(t => t.isPrimary)?.id ?? profile.teamLocations[0]?.id;
  if (!locationId) return;

  const data = {};
  if (stats.leadsReceived && stats.leadsReceived > 0) data.leadsReceived = { increment: stats.leadsReceived };
  if (stats.leadsAccepted && stats.leadsAccepted > 0) data.leadsAccepted = { increment: stats.leadsAccepted };
  if (stats.leadsConverted && stats.leadsConverted > 0) data.leadsConverted = { increment: stats.leadsConverted };

  if (Object.keys(data).length > 0) {
    await prisma.providerTeamLocation.update({
      where: { id: locationId },
      data
    });
  }
}
