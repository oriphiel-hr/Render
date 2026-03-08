/**
 * Sinkronizacija ROI iz LeadPurchase kada je ProviderROI prazan ili zastario
 * Koristi se u provider-roi, benchmark-service i leadQueueManager
 */
import { prisma } from '../lib/prisma.js';

/** Sinkroniziraj ProviderROI iz LeadPurchase (pozovi nakon kupovine leada) */
export async function syncProviderROIFromPurchases(providerId) {
  const computed = await computeRoiFromLeadPurchases(providerId);
  if (!computed) return null;
  try {
    await prisma.providerROI.upsert({
      where: { providerId },
      create: {
        providerId,
        totalLeadsPurchased: computed.totalLeadsPurchased,
        totalLeadsContacted: computed.totalLeadsContacted,
        totalLeadsConverted: computed.totalLeadsConverted,
        totalCreditsSpent: computed.totalCreditsSpent,
        totalRevenue: Math.round(computed.totalRevenue),
        conversionRate: computed.conversionRate,
        roi: computed.roi,
        avgLeadValue: computed.avgLeadValue
      },
      update: {
        totalLeadsPurchased: computed.totalLeadsPurchased,
        totalLeadsContacted: computed.totalLeadsContacted,
        totalLeadsConverted: computed.totalLeadsConverted,
        totalCreditsSpent: computed.totalCreditsSpent,
        totalRevenue: Math.round(computed.totalRevenue),
        conversionRate: computed.conversionRate,
        roi: computed.roi,
        avgLeadValue: computed.avgLeadValue,
        lastUpdated: new Date()
      }
    });
  } catch (e) {
    console.warn('[ROI] Sync ProviderROI failed:', e.message);
  }
  return computed;
}

export async function computeRoiFromLeadPurchases(providerId) {
  const purchases = await prisma.leadPurchase.findMany({
    where: { providerId },
    include: { job: { select: { budgetMax: true } } }
  });
  if (purchases.length === 0) return null;

  const totalLeadsPurchased = purchases.length;
  const totalLeadsContacted = purchases.filter(p => ['CONTACTED', 'CONVERTED'].includes(p.status)).length;
  const totalLeadsConverted = purchases.filter(p => p.status === 'CONVERTED').length;
  const totalCreditsSpent = purchases.reduce((s, p) => s + (p.creditsSpent || 0), 0);
  const totalRevenue = Math.round(purchases
    .filter(p => p.status === 'CONVERTED')
    .reduce((s, p) => s + (p.job?.budgetMax || 0), 0));

  const conversionRate = totalLeadsPurchased > 0 ? (totalLeadsConverted / totalLeadsPurchased) * 100 : 0;
  const avgCreditPrice = 10;
  const totalInvested = totalCreditsSpent * avgCreditPrice;
  const roi = totalInvested > 0 ? ((totalRevenue - totalInvested) / totalInvested) * 100 : 0;
  const avgLeadValue = totalLeadsConverted > 0 ? totalRevenue / totalLeadsConverted : 0;

  return {
    totalLeadsPurchased,
    totalLeadsContacted,
    totalLeadsConverted,
    totalCreditsSpent,
    totalRevenue,
    conversionRate,
    roi,
    avgLeadValue
  };
}
