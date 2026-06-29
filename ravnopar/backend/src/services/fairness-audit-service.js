import { prisma } from '../lib/prisma.js';

export async function buildExtendedFairnessAudit() {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalProfiles,
    availableProfiles,
    focusedProfiles,
    pendingRequests7d,
    acceptedRequests7d,
    newProfiles7d,
    newProfiles30d
  ] = await Promise.all([
    prisma.userProfile.count(),
    prisma.userProfile.count({ where: { availability: 'AVAILABLE' } }),
    prisma.userProfile.count({ where: { availability: 'FOCUSED_CONTACT' } }),
    prisma.matchContact.count({ where: { status: 'PENDING', createdAt: { gt: since7d } } }),
    prisma.matchContact.count({ where: { status: 'ACCEPTED', createdAt: { gt: since7d } } }),
    prisma.userProfile.count({ where: { createdAt: { gt: since7d } } }),
    prisma.userProfile.count({ where: { createdAt: { gt: since30d } } })
  ]);

  const incomingTargets7d = await prisma.matchContact.findMany({
    where: { createdAt: { gt: since7d } },
    select: { targetId: true },
    distinct: ['targetId']
  });
  const usersWithoutIncoming7d = await prisma.userProfile.count({
    where: {
      availability: 'AVAILABLE',
      id: { notIn: incomingTargets7d.map((r) => r.targetId) }
    }
  });

  const [byCity, byIdentity, newWithoutIncoming] = await Promise.all([
    prisma.userProfile.groupBy({
      by: ['city'],
      where: { availability: 'AVAILABLE' },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 8
    }),
    prisma.userProfile.groupBy({
      by: ['identity'],
      where: { availability: 'AVAILABLE' },
      _count: { identity: true },
      orderBy: { _count: { identity: 'desc' } }
    }),
    prisma.userProfile.count({
      where: {
        availability: 'AVAILABLE',
        createdAt: { gt: since7d },
        id: { notIn: incomingTargets7d.map((r) => r.targetId) }
      }
    })
  ]);

  const recommendations = [];
  if (usersWithoutIncoming7d > 20) {
    recommendations.push('Povećaj vidljivost korisnicima bez kontakta kroz fer boost u feedu.');
  } else {
    recommendations.push('Balans vidljivosti je stabilan.');
  }
  if (pendingRequests7d > acceptedRequests7d * 3) {
    recommendations.push('Puno otvorenih zahtjeva; pojačaj edukaciju za kvalitetne poruke.');
  } else {
    recommendations.push('Omjer pending/accepted je u zdravom rasponu.');
  }
  if (newWithoutIncoming > Math.max(3, newProfiles7d * 0.5)) {
    recommendations.push('Novi korisnici (7d) često nemaju dolazne zahtjeve — provjeri onboarding i fer rang.');
  }
  const topCity = byCity[0];
  if (topCity && totalProfiles > 10 && topCity._count.city > totalProfiles * 0.6) {
    recommendations.push(`Koncentracija u gradu ${topCity.city} — razmisli o promociji drugih gradova.`);
  }

  return {
    principles: {
      noReachThrottling: true,
      fairnessRankingOnly: true,
      engagedPairsTemporarilyHidden: true,
      planTierDoesNotAffectRank: true
    },
    metrics: {
      totalProfiles,
      availableProfiles,
      focusedProfiles,
      usersWithoutIncoming7d,
      pendingRequests7d,
      acceptedRequests7d,
      newProfiles7d,
      newProfiles30d,
      newUsersWithoutIncoming7d: newWithoutIncoming
    },
    trends: {
      byCity: byCity.map((row) => ({ city: row.city, available: row._count.city })),
      byIdentity: byIdentity.map((row) => ({ identity: row.identity, available: row._count.identity })),
      newUsers: { last7d: newProfiles7d, last30d: newProfiles30d, withoutIncoming7d: newWithoutIncoming }
    },
    recommendations
  };
}
