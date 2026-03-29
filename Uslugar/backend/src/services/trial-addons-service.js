// Trial add-on seeding: 2 aktivne kategorije + 1 regija, idempotentno po korisniku.
import { prisma } from '../lib/prisma.js';

/**
 * Ako korisnik već ima kompletan trial paket (TRIAL: add-onovi), ne radi ništa.
 * @param {string} userId
 * @param {{ id: string, expiresAt: Date | null, creditsBalance?: number | null }} subscription
 */
export async function ensureTrialAddonsForUser(userId, subscription) {
  const trialExpiresAt =
    subscription.expiresAt ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const existingTrialAddons = await prisma.addonSubscription.count({
    where: {
      userId,
      status: 'ACTIVE',
      displayName: { startsWith: 'TRIAL:' }
    }
  });

  if (existingTrialAddons >= 3) {
    return { created: false };
  }

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      take: 2,
      orderBy: { name: 'asc' }
    });

    const regions = ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar'];
    const trialRegion = regions[0];

    for (const category of categories) {
      try {
        const graceUntil = new Date(trialExpiresAt);
        graceUntil.setDate(graceUntil.getDate() + 7);

        const categoryAddon = await prisma.addonSubscription.create({
          data: {
            userId,
            type: 'CATEGORY',
            scope: category.id,
            displayName: `TRIAL: ${category.name}`,
            categoryId: category.id,
            price: 0,
            validUntil: trialExpiresAt,
            graceUntil,
            autoRenew: false,
            status: 'ACTIVE'
          }
        });

        await prisma.addonUsage.create({
          data: {
            addonId: categoryAddon.id,
            consumed: 0,
            remaining: 0,
            percentageUsed: 0.0,
            leadsReceived: 0,
            leadsConverted: 0
          }
        });

        await prisma.addonEventLog.create({
          data: {
            addonId: categoryAddon.id,
            eventType: 'PURCHASED',
            newStatus: 'ACTIVE',
            metadata: {
              type: 'CATEGORY',
              scope: category.id,
              price: 0,
              trial: true
            }
          }
        });
      } catch (e) {
        if (e?.code !== 'P2002') throw e;
      }
    }

    try {
      const graceUntilRegion = new Date(trialExpiresAt);
      graceUntilRegion.setDate(graceUntilRegion.getDate() + 7);

      const regionAddon = await prisma.addonSubscription.create({
        data: {
          userId,
          type: 'REGION',
          scope: trialRegion,
          displayName: `TRIAL: ${trialRegion}`,
          price: 0,
          validUntil: trialExpiresAt,
          graceUntil: graceUntilRegion,
          autoRenew: false,
          status: 'ACTIVE'
        }
      });

      await prisma.addonUsage.create({
        data: {
          addonId: regionAddon.id,
          consumed: 0,
          remaining: 0,
          percentageUsed: 0.0,
          leadsReceived: 0,
          leadsConverted: 0
        }
      });

      await prisma.addonEventLog.create({
        data: {
          addonId: regionAddon.id,
          eventType: 'PURCHASED',
          newStatus: 'ACTIVE',
          metadata: {
            type: 'REGION',
            scope: trialRegion,
            price: 0,
            trial: true
          }
        }
      });
    } catch (e) {
      if (e?.code !== 'P2002') throw e;
    }

    console.log(
      `[TRIAL] Created add-ons for user ${userId}: ${categories.length} categories, 1 region`
    );
    return { created: true };
  } catch (error) {
    if (error?.code === 'P2002') {
      console.warn(`[TRIAL] Add-on seed skipped (race/duplicate) for user ${userId}`);
      return { created: false };
    }
    console.error(`[TRIAL] Error creating add-ons for user ${userId}:`, error);
    return { created: false };
  }
}

/**
 * Jedan TrialEngagement zapis po korisniku (schema: userId unique).
 */
export async function ensureTrialEngagementIfMissing(userId, subscriptionId) {
  const existing = await prisma.trialEngagement.findUnique({
    where: { userId }
  });
  if (existing) return;

  try {
    await prisma.trialEngagement.create({
      data: {
        userId,
        subscriptionId,
        leadsPurchased: 0,
        leadsConverted: 0,
        offersSent: 0,
        chatMessagesSent: 0,
        loginsCount: 0,
        totalTimeSpentMinutes: 0
      }
    });
    console.log(`[TRIAL] Created engagement tracking for user ${userId}`);
  } catch (e) {
    if (e?.code === 'P2002') return;
    console.error(`[TRIAL] Error creating engagement tracking:`, e);
  }
}

/**
 * Za sve aktivne TRIAL pretplate: dopuni trial add-onove i engagement ako nedostaju.
 * Idempotentno (ensureTrialAddonsForUser preskače ako već ima ≥3 TRIAL: add-aona).
 */
export async function backfillTrialAddonsForAllActiveTrials() {
  const subs = await prisma.subscription.findMany({
    where: { plan: 'TRIAL', status: 'ACTIVE' },
    select: { id: true, userId: true, expiresAt: true }
  });

  let seeded = 0;
  let unchanged = 0;
  const errors = [];

  for (const sub of subs) {
    try {
      const before = await prisma.addonSubscription.count({
        where: {
          userId: sub.userId,
          status: 'ACTIVE',
          displayName: { startsWith: 'TRIAL:' }
        }
      });
      const { created } = await ensureTrialAddonsForUser(sub.userId, sub);
      await ensureTrialEngagementIfMissing(sub.userId, sub.id);
      const after = await prisma.addonSubscription.count({
        where: {
          userId: sub.userId,
          status: 'ACTIVE',
          displayName: { startsWith: 'TRIAL:' }
        }
      });
      if (created || after > before) seeded += 1;
      else unchanged += 1;
    } catch (e) {
      errors.push({ userId: sub.userId, message: e?.message || String(e) });
    }
  }

  return {
    checked: subs.length,
    seededUsers: seeded,
    unchangedUsers: unchanged,
    errors
  };
}

/**
 * Backfill trial add-ona za jednog korisnika (mora imati aktivnu TRIAL pretplatu).
 */
export async function backfillTrialAddonsForSingleUser(userId) {
  const id = typeof userId === 'string' ? userId.trim() : '';
  if (!id) {
    return { ok: false, reason: 'MISSING_USER_ID' };
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: id },
    select: { id: true, userId: true, expiresAt: true, plan: true, status: true }
  });

  if (!sub) {
    return { ok: false, userId: id, reason: 'NO_SUBSCRIPTION' };
  }

  if (sub.plan !== 'TRIAL' || sub.status !== 'ACTIVE') {
    return {
      ok: false,
      userId: id,
      reason: 'NOT_ACTIVE_TRIAL',
      plan: sub.plan,
      status: sub.status
    };
  }

  const before = await prisma.addonSubscription.count({
    where: {
      userId: id,
      status: 'ACTIVE',
      displayName: { startsWith: 'TRIAL:' }
    }
  });

  const { created } = await ensureTrialAddonsForUser(id, sub);
  await ensureTrialEngagementIfMissing(id, sub.id);

  const after = await prisma.addonSubscription.count({
    where: {
      userId: id,
      status: 'ACTIVE',
      displayName: { startsWith: 'TRIAL:' }
    }
  });

  const seeded = created || after > before;

  return {
    ok: true,
    userId: id,
    trialAddonsBefore: before,
    trialAddonsAfter: after,
    seeded
  };
}
