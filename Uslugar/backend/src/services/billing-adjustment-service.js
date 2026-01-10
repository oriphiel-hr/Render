/**
 * Billing Adjustment Service - Dinamički billing po volumenu leadova
 *
 * Uspoređuje očekivani (BillingPlan.expectedLeads) i stvarno isporučeni
 * volumen leadova (LeadPurchase) po korisniku/kategoriji/regiji i periodu
 * te generira BillingAdjustment zapise.
 */

import { prisma } from '../lib/prisma.js';

/**
 * Izračunaj broj isporučenih leadova za određeni billing plan i period.
 *
 * @param {Object} plan - BillingPlan zapis
 * @param {Date} periodStart - Početak obračunskog perioda
 * @param {Date} periodEnd - Kraj obračunskog perioda (exclusivno)
 * @returns {Promise<number>} - Broj leadova
 */
async function calculateDeliveredLeadsForPlan(plan, periodStart, periodEnd) {
  const where = {
    providerId: plan.userId,
    createdAt: {
      gte: periodStart,
      lt: periodEnd
    },
    ...(plan.categoryId || plan.region
      ? {
          job: {
            ...(plan.categoryId ? { categoryId: plan.categoryId } : {}),
            ...(plan.region
              ? { city: { contains: plan.region, mode: 'insensitive' } }
              : {})
          }
        }
      : {})
  };

  const count = await prisma.leadPurchase.count({ where });
  return count;
}

/**
 * Generira ili ažurira BillingAdjustment za jedan BillingPlan i period.
 *
 * @param {Object} plan - BillingPlan zapis
 * @param {Date} periodStart
 * @param {Date} periodEnd
 * @returns {Promise<Object|null>} - Kreirani ili ažurirani BillingAdjustment ili null ako nema korekcije
 */
export async function calculateAdjustmentForPlan(plan, periodStart, periodEnd) {
  const deliveredLeads = await calculateDeliveredLeadsForPlan(plan, periodStart, periodEnd);
  const baseExpectedLeads = plan.expectedLeads || 0;

  // Carryover neiskorištenih leadova: efektivni očekivani volumen = baza + carryover
  const carryoverInLeads =
    plan.carryoverEnabled && typeof plan.carryoverLeads === 'number'
      ? plan.carryoverLeads
      : 0;
  const expectedLeads = baseExpectedLeads + carryoverInLeads;

  // Ako je uključen guarantee, minimalni prag je guaranteedMinLeads (ako je postavljen),
  // inače koristimo baseExpectedLeads kao garantirani minimum (bez carryover-a).
  const guaranteedMinLeads =
    plan.guaranteeEnabled && typeof plan.guaranteedMinLeads === 'number'
      ? plan.guaranteedMinLeads
      : baseExpectedLeads;

  // Ako nema očekivanja, nema ni obračuna
  if (expectedLeads <= 0) {
    return null;
  }

  const diff = deliveredLeads - expectedLeads;
  const guaranteeDiff = deliveredLeads - guaranteedMinLeads;

  // REAL_VALUE faktor: koliko je stvarno isporučeno u odnosu na očekivano
  const realValueFactor = expectedLeads > 0 ? deliveredLeads / expectedLeads : 0;

  let adjustmentType = 'NONE';
  let adjustmentCredits = 0;
  let notes = '';

  // Poseban slučaj: nema nijednog leada u periodu → agresivnija kompenzacija / snižavanje cijene
  if (deliveredLeads === 0) {
    adjustmentType = 'CREDIT';
    adjustmentCredits = expectedLeads; // puni credit za cijelu kvotu
    notes = `Automatsko snižavanje cijene i credit refund: u ovom obračunskom periodu tržište je mirno (0/${expectedLeads} leadova). Klijentu se odobrava ${adjustmentCredits} kredita (pun povrat kvote).`;
  } else if (diff === 0 && (!plan.guaranteeEnabled || guaranteeDiff === 0)) {
    adjustmentType = 'NONE';
    notes = 'Isporučen volumen odgovara očekivanom / garantiranim kvotama.';
  } else if (diff < 0 || (plan.guaranteeEnabled && guaranteeDiff < 0)) {
    // Isporuka manja od očekivanog ili garantirane kvote → CREDIT
    const baseMissing = Math.max(0, expectedLeads - deliveredLeads);
    const guaranteeMissing = Math.max(0, guaranteedMinLeads - deliveredLeads);
    adjustmentType = 'CREDIT';
    adjustmentCredits = Math.max(baseMissing, guaranteeMissing); // npr. 1 lead = 1 kredit

    if (plan.guaranteeEnabled) {
      notes = `Garancija minimalnog broja leadova aktivna. Isporučeno ${deliveredLeads}, garantirano minimalno ${guaranteedMinLeads}, očekivano ${expectedLeads}. Klijentu se odobrava ${adjustmentCredits} kredita.`;
    } else {
      notes = `Isporučeno ${deliveredLeads} od očekivanih ${expectedLeads} leadova. Klijentu se odobrava ${adjustmentCredits} kredita.`;
    }
  } else if (diff > 0) {
    // Isporuka veća od očekivane → SURCHARGE (ili preporuka za viši paket)
    adjustmentType = 'SURCHARGE';
    adjustmentCredits = diff;
    notes = `Isporučeno ${deliveredLeads} leadova, očekivano ${expectedLeads}. Moguća dodatna naplata za ${adjustmentCredits} leadova ili prijedlog za viši paket.`;
  }

  // Izračunaj carryover za sljedeći period (samo ako je planom omogućeno)
  const nextCarryoverLeads = plan.carryoverEnabled
    ? Math.max(0, expectedLeads - deliveredLeads)
    : 0;

  // Ako je NONE, možemo i dalje spremiti zapis radi transparentnosti
  const existing = await prisma.billingAdjustment.findFirst({
    where: {
      billingPlanId: plan.id,
      periodStart,
      periodEnd
    }
  });

  if (existing) {
    const updated = await prisma.billingAdjustment.update({
      where: { id: existing.id },
      data: {
        expectedLeads,
        deliveredLeads,
        realValueFactor,
        adjustmentType,
        adjustmentCredits,
        notes
      }
    });

    // Ažuriraj carryover na planu (idempotentno za isti period)
    if (plan.carryoverEnabled) {
      await prisma.billingPlan.update({
        where: { id: plan.id },
        data: { carryoverLeads: nextCarryoverLeads }
      });
    }

    return updated;
  }

  const created = await prisma.billingAdjustment.create({
    data: {
      billingPlanId: plan.id,
      userId: plan.userId,
      periodStart,
      periodEnd,
      expectedLeads,
      deliveredLeads,
      realValueFactor,
      adjustmentType,
      adjustmentCredits,
      notes
    }
  });

  if (plan.carryoverEnabled) {
    await prisma.billingPlan.update({
      where: { id: plan.id },
      data: { carryoverLeads: nextCarryoverLeads }
    });
  }

  return created;
}

/**
 * Izračunaj korekcije za sve aktivne billing planove u danom periodu.
 *
 * @param {Date} periodStart
 * @param {Date} periodEnd
 * @returns {Promise<Array>} - Lista BillingAdjustment zapisa
 */
export async function calculateBillingAdjustmentsForPeriod(periodStart, periodEnd) {
  const plans = await prisma.billingPlan.findMany({
    where: {
      isActive: true,
      isPaused: false // Pauzirani planovi se ne obračunavaju (nema naplate dok je pauzirano)
    }
  });

  const adjustments = [];

  for (const plan of plans) {
    const adj = await calculateAdjustmentForPlan(plan, periodStart, periodEnd);
    if (adj) {
      adjustments.push(adj);
    }
  }

  console.log(`[BILLING] Izračunate korekcije za period ${periodStart.toISOString()} - ${periodEnd.toISOString()}: ${adjustments.length} zapisa.`);

  return adjustments;
}

/**
 * Primijeni credit refund na temelju obračunatih BillingAdjustment zapisa za "mirno" tržište.
 *
 * - Za svaki CREDIT adjustment gdje je deliveredLeads = 0 kreira REFUND credit transaction
 *   i vraća odgovarajući broj kredita korisniku (subscription.creditsBalance).
 */
export async function applyQuietMarketCreditRefunds(periodStart, periodEnd) {
  const adjustments = await prisma.billingAdjustment.findMany({
    where: {
      periodStart,
      periodEnd,
      adjustmentType: 'CREDIT',
      deliveredLeads: 0,
      status: 'PENDING'
    }
  });

  const results = [];

  for (const adj of adjustments) {
    const { userId, adjustmentCredits, id: adjustmentId } = adj;

    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      console.warn(`[QUIET-MARKET-REFUND] User ${userId} nema subscription, preskačem refund.`);
      continue;
    }

    const newBalance = subscription.creditsBalance + adjustmentCredits;

    await prisma.$transaction(async tx => {
      // 1) Ažuriraj subscription balance
      await tx.subscription.update({
        where: { userId },
        data: {
          creditsBalance: newBalance
        }
      });

      // 2) Kreiraj credit transaction (REFUND)
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          type: 'REFUND',
          amount: adjustmentCredits,
          balance: newBalance,
          description: `Credit refund jer je tržište mirno (0 leadova u obračunskom periodu). BillingAdjustment: ${adjustmentId}`
        }
      });

      // 3) Označi adjustment kao APPLIED
      await tx.billingAdjustment.update({
        where: { id: adjustmentId },
        data: {
          status: 'APPLIED',
          appliedAt: new Date()
        }
      });

      // 4) Notifikacija korisniku
      await tx.notification.create({
        data: {
          userId,
          type: 'SYSTEM',
          title: 'Credit refund jer je tržište mirno',
          message: `U ovom obračunskom periodu nije bilo leadova. Vraćeno vam je ${transaction.amount} kredita. Novo stanje: ${transaction.balance} kredita.`
        }
      });
    });

    results.push({ adjustmentId, userId, creditsRefunded: adjustmentCredits, newBalance });
  }

  console.log(`[QUIET-MARKET-REFUND] Primijenjeno refundova: ${results.length}`);

  return results;
}

/**
 * Helper za mjesečni obračun: uzima prethodni mjesec kao obračunski period.
 */
export async function calculateMonthlyAdjustments() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  // Prethodni mjesec
  const periodEnd = new Date(year, month, 1); // prvi dan tekućeg mjeseca
  const periodStart = new Date(periodEnd);
  periodStart.setMonth(periodStart.getMonth() - 1); // prvi dan prethodnog mjeseca

  return await calculateBillingAdjustmentsForPeriod(periodStart, periodEnd);
}

/**
 * Dohvati sažetak volumena za jedan BillingPlan i period.
 */
export async function getPlanVolumeSummary(planId, periodStart, periodEnd) {
  const plan = await prisma.billingPlan.findUnique({
    where: { id: planId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!plan) {
    throw new Error('BillingPlan not found');
  }

  const deliveredLeads = await calculateDeliveredLeadsForPlan(plan, periodStart, periodEnd);

  return {
    plan: {
      id: plan.id,
      name: plan.name,
      userId: plan.userId,
      userName: plan.user?.fullName || null,
      category: plan.category ? { id: plan.category.id, name: plan.category.name } : null,
      region: plan.region,
      expectedLeads: plan.expectedLeads,
      period: plan.period
    },
    period: {
      start: periodStart,
      end: periodEnd
    },
    deliveredLeads,
    expectedLeads: plan.expectedLeads,
    diff: deliveredLeads - plan.expectedLeads
  };
}

/**
 * Dohvati sažetak billing korekcija za direktora (provider) - za direktor dashboard.
 *
 * @param {String} userId - ID direktora (User)
 */
export async function getDirectorBillingSummary(userId) {
  const plans = await prisma.billingPlan.findMany({
    where: {
      userId,
      isActive: true
    },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  const adjustments = await prisma.billingAdjustment.findMany({
    where: {
      userId
    },
    orderBy: {
      periodStart: 'desc'
    },
    take: 50
  });

  return {
    plans: plans.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category ? { id: p.category.id, name: p.category.name } : null,
      region: p.region,
      expectedLeads: p.expectedLeads,
      period: p.period,
      createdAt: p.createdAt,
      isActive: p.isActive
    })),
    adjustments
  };
}


