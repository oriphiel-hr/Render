import { prisma } from '../lib/prisma.js';

const DEFAULT_MONTHLY_COST_CENTS = Number(process.env.MONTHLY_OPERATING_COST_CENTS || 2500);

export async function getPublicImpactStats() {
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since90d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [
    memberCount,
    activeCount,
    contactCount,
    cityGroups,
    supporterCount,
    donationAgg,
    matches30d,
    configChanges
  ] = await Promise.all([
    prisma.userProfile.count(),
    prisma.userProfile.count({ where: { availability: { not: 'PAUSED' } } }),
    prisma.matchContact.count({ where: { status: 'ACCEPTED', createdAt: { gt: since30d } } }),
    prisma.userProfile.groupBy({
      by: ['city'],
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 5
    }),
    prisma.userProfile.count({ where: { lifetimeDonatedCents: { gt: 0 } } }),
    prisma.paymentOrder.aggregate({
      where: { orderType: 'DONATION', status: 'PAID', createdAt: { gt: since30d } },
      _sum: { amountCents: true },
      _count: { id: true }
    }),
    prisma.engagedPair.count({ where: { startedAt: { gt: since30d } } }),
    prisma.fairnessConfigChange.findMany({
      where: { createdAt: { gt: since90d } },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ]);

  const donatedCents30d = donationAgg._sum.amountCents || 0;
  const monthlyCostCents = DEFAULT_MONTHLY_COST_CENTS;
  const coveragePercent =
    monthlyCostCents > 0 ? Math.min(100, Math.round((donatedCents30d / monthlyCostCents) * 100)) : 0;

  return {
    memberCount,
    activeCount,
    contactsLast30Days: contactCount,
    matchesLast30Days: matches30d,
    topCities: cityGroups.map((row) => ({ city: row.city, count: row._count.city })),
    supporterCount,
    donationsCount30d: donationAgg._count.id,
    donatedEur30d: Math.round(donatedCents30d) / 100,
    monthlyOperatingEur: monthlyCostCents / 100,
    donationCoveragePercent: coveragePercent,
    fairnessChanges90d: configChanges.map((row) => ({
      at: row.createdAt,
      oldDailyLimit: row.oldDailyLimit,
      newDailyLimit: row.newDailyLimit,
      reason: row.reason
    }))
  };
}
