/**
 * Launch TRIAL – provjera potražnje po kategorijama/regiji
 *
 * Pravila:
 * - Pružatelj ima "Launch TRIAL" (besplatno) dok u njegovim kategorijama/regiji nema dovoljno klijenata.
 * - Konkretno: u zadnjih 90 dana barem 20 objavljenih poslova I min. 3–5 leadova mjesečno po pružatelju u segmentu.
 * - Kad je potražnja dovoljna, od sljedećeg obračunskog razdoblja prelazi na redovnu cijenu (uz obavijest).
 */

import { prisma } from '../lib/prisma.js';

const MIN_JOBS_LAST_90_DAYS = 20;
const MIN_LEADS_PER_PROVIDER = 3;
const DAYS_90 = 90;

/**
 * Dohvati segment pružatelja: kategorije i regija (grad/serviceArea)
 * @param {string} userId
 * @returns {Promise<{ categoryIds: string[], city: string | null } | null>}
 */
export async function getProviderSegment(userId) {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    include: {
      categories: { select: { id: true } },
      teamLocations: { take: 1, orderBy: { createdAt: 'asc' }, select: { city: true } }
    }
  });
  if (!profile) return null;
  const categoryIds = profile.categories?.map((c) => c.id) ?? [];
  if (categoryIds.length === 0) return null;
  const city =
    profile.serviceArea ||
    profile.teamLocations?.[0]?.city ||
    null;
  return { categoryIds, city };
}

/**
 * Broj poslova u zadnjih 90 dana u danim kategorijama (i opcionalno gradu)
 */
export async function countJobsLast90Days({ categoryIds, city }) {
  if (!categoryIds?.length) return 0;
  const since = new Date();
  since.setDate(since.getDate() - DAYS_90);
  const where = {
    categoryId: { in: categoryIds },
    createdAt: { gte: since }
  };
  if (city && String(city).trim()) {
    where.city = { equals: String(city).trim(), mode: 'insensitive' };
  }
  return prisma.job.count({ where });
}

/**
 * Broj pružatelja koji imaju barem jednu od danih kategorija (i opcionalno regiju)
 */
export async function countProvidersInSegment({ categoryIds, city }) {
  if (!categoryIds?.length) return 0;
  const where = {
    categories: { some: { id: { in: categoryIds } } }
  };
  if (city && String(city).trim()) {
    const cityLower = String(city).trim().toLowerCase();
    where.OR = [
      { serviceArea: { contains: cityLower, mode: 'insensitive' } },
      { teamLocations: { some: { city: { contains: cityLower, mode: 'insensitive' } } } }
    ];
  }
  return prisma.providerProfile.count({ where });
}

/**
 * Provjeri ima li pružatelj pravo na Launch TRIAL (besplatno jer je potražnja niska).
 */
export async function isEligibleForLaunchTrial(userId) {
  const segment = await getProviderSegment(userId);
  if (!segment) {
    return {
      eligible: false,
      jobsCount: 0,
      providersCount: 0,
      leadsPerProvider: 0,
      reason: 'Nema odabranih kategorija'
    };
  }

  const [jobsCount, providersCount] = await Promise.all([
    countJobsLast90Days(segment),
    countProvidersInSegment(segment)
  ]);

  const leadsPerProvider = providersCount > 0 ? jobsCount / providersCount : 0;
  const enoughJobs = jobsCount >= MIN_JOBS_LAST_90_DAYS;
  const enoughLeadsPerProvider = leadsPerProvider >= MIN_LEADS_PER_PROVIDER;
  const demandHigh = enoughJobs && enoughLeadsPerProvider;

  return {
    eligible: !demandHigh,
    jobsCount,
    providersCount,
    leadsPerProvider: Math.round(leadsPerProvider * 10) / 10,
    reason: demandHigh
      ? `Potražnja dovoljna (${jobsCount} poslova, ~${leadsPerProvider.toFixed(1)} leadova po pružatelju)`
      : `Potražnja niska (${jobsCount} poslova u 90 dana)`
  };
}

/**
 * Ažuriraj pretplatu: ako je TRIAL i potražnja postala dovoljna,
 * isključi Launch TRIAL, postavi kraj besplatnog razdoblja, pošalji obavijest.
 */
export async function checkAndUpdateLaunchTrial(userId) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  });
  if (!subscription || subscription.plan !== 'TRIAL' || !subscription.isLaunchTrial) {
    return { updated: false };
  }

  const { eligible } = await isEligibleForLaunchTrial(userId);
  if (eligible) return { updated: false };

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  await prisma.subscription.update({
    where: { userId },
    data: {
      isLaunchTrial: false,
      launchTrialDemandCheckedAt: now,
      launchTrialEndsAt: endOfMonth
    }
  });

  await prisma.notification.create({
    data: {
      userId,
      type: 'SYSTEM',
      title: 'Launch TRIAL završava – od sljedećeg mjeseca redovna naplata',
      message: `U vašim kategorijama sada postoji dovoljna potražnja. Besplatno razdoblje traje do ${endOfMonth.toLocaleDateString('hr-HR')}. Od sljedećeg obračunskog razdoblja naplaćujemo odabrani plan prema cjeniku.`
    }
  });

  return { updated: true, notificationSent: true };
}

/**
 * Lista pretplata s isLaunchTrial = true (za cron).
 */
export async function getLaunchTrialSubscriptions() {
  const list = await prisma.subscription.findMany({
    where: { plan: 'TRIAL', status: 'ACTIVE', isLaunchTrial: true },
    select: { userId: true }
  });
  return list;
}
