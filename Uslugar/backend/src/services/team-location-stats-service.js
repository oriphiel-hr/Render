// Ažurira statistiku leadova po tim lokacijama (ProviderTeamLocation)
import { prisma } from '../lib/prisma.js';
import { findClosestTeamLocation } from '../lib/geo-utils.js';

function resolveLocationId(teamLocations, job) {
  const closest = findClosestTeamLocation(teamLocations, job);
  return closest?.id ?? teamLocations.find(t => t.isPrimary)?.id ?? teamLocations[0]?.id;
}

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
    select: { id: true, companyId: true },
    include: {
      teamLocations: {
        where: { isActive: true },
        select: { id: true, latitude: true, longitude: true, radiusKm: true, city: true, isPrimary: true }
      }
    }
  });

  if (!profile) return;

  let teamLocations = profile.teamLocations ?? [];
  // Član tima nema vlastite lokacije – koristi direktorove (Tim A, Tim B…)
  if (teamLocations.length === 0 && profile.companyId) {
    const company = await prisma.providerProfile.findUnique({
      where: { id: profile.companyId },
      include: {
        teamLocations: {
          where: { isActive: true },
          select: { id: true, latitude: true, longitude: true, radiusKm: true, city: true, isPrimary: true }
        }
      }
    });
    teamLocations = company?.teamLocations ?? [];
  }

  if (!teamLocations.length) return;

  const closest = findClosestTeamLocation(teamLocations, job);
  const locationId = closest?.id ?? teamLocations.find(t => t.isPrimary)?.id ?? teamLocations[0]?.id;
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

/**
 * Ponovno izračunaj statistiku leadova za sve tim lokacije providera (backfill postojećih podataka)
 * @param {string} providerUserId - ID korisnika (User.id) koji je provider
 */
export async function recalculateTeamLocationStats(providerUserId) {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: providerUserId },
    select: { id: true, companyId: true, userId: true },
    include: {
      teamLocations: {
        where: { isActive: true },
        select: { id: true, latitude: true, longitude: true, radiusKm: true, city: true, isPrimary: true }
      }
    }
  });
  if (!profile) return;

  let teamLocations = profile.teamLocations ?? [];
  if (teamLocations.length === 0 && profile.companyId) {
    const company = await prisma.providerProfile.findUnique({
      where: { id: profile.companyId },
      include: {
        teamLocations: {
          where: { isActive: true },
          select: { id: true, latitude: true, longitude: true, radiusKm: true, city: true, isPrimary: true }
        }
      }
    });
    teamLocations = company?.teamLocations ?? [];
  }
  if (!teamLocations.length) return;

  const providerUserIds = [profile.userId];
  if (profile.companyId) {
    const company = await prisma.providerProfile.findUnique({
      where: { id: profile.companyId },
      include: { teamMembers: { select: { userId: true } } }
    });
    if (company) {
      providerUserIds.push(company.userId);
      company.teamMembers.forEach(m => providerUserIds.push(m.userId));
    }
  } else {
    const director = await prisma.providerProfile.findUnique({
      where: { id: profile.id },
      include: { teamMembers: { select: { userId: true } } }
    });
    if (director) {
      director.teamMembers.forEach(m => providerUserIds.push(m.userId));
    }
  }
  const uniqueUserIds = [...new Set(providerUserIds)];

  // primljeno: LeadPurchase + CompanyLeadQueue (leadovi u queueu tvrtke)
  const directorProfileId = profile.companyId || profile.id;
  const [purchases, queueEntries] = await Promise.all([
    prisma.leadPurchase.findMany({
      where: { providerId: { in: uniqueUserIds }, status: { not: 'REFUNDED' } },
      include: { job: true }
    }),
    prisma.companyLeadQueue.findMany({
      where: { directorId: directorProfileId },
      include: { job: true }
    })
  ]);

  const counts = {};
  for (const loc of teamLocations) counts[loc.id] = { leadsReceived: 0, leadsAccepted: 0, leadsConverted: 0 };

  const seenJobIds = new Set();
  for (const p of purchases) {
    const lid = resolveLocationId(teamLocations, p.job);
    if (!lid) continue;
    if (!seenJobIds.has(p.jobId)) {
      seenJobIds.add(p.jobId);
      counts[lid].leadsReceived++;
    }
    if (p.status === 'CONVERTED') counts[lid].leadsConverted++;
  }
  for (const qe of queueEntries) {
    if (seenJobIds.has(qe.jobId)) continue;
    const lid = resolveLocationId(teamLocations, qe.job);
    if (lid) {
      seenJobIds.add(qe.jobId);
      counts[lid].leadsReceived++;
    }
  }

  const jobsWithAcceptedOffer = await prisma.job.findMany({
    where: {
      acceptedOfferId: { not: null },
      leadPurchases: {
        some: { providerId: { in: uniqueUserIds } }
      }
    },
    include: { leadPurchases: { where: { providerId: { in: uniqueUserIds } } } }
  });
  for (const j of jobsWithAcceptedOffer) {
    const p = j.leadPurchases?.[0];
    if (!p) continue;
    const lid = resolveLocationId(teamLocations, j);
    if (lid) counts[lid].leadsAccepted++;
  }

  for (const loc of teamLocations) {
    await prisma.providerTeamLocation.update({
      where: { id: loc.id },
      data: {
        leadsReceived: counts[loc.id].leadsReceived,
        leadsAccepted: counts[loc.id].leadsAccepted,
        leadsConverted: counts[loc.id].leadsConverted
      }
    });
  }
}
