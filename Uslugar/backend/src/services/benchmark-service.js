// Benchmark Service - Usporedba s drugim providerima
import { prisma } from '../lib/prisma.js';

/**
 * Izračunaj benchmark statistike (prosjek, median, percentili) za sve providere
 * @returns {Promise<object>} Benchmark statistike
 */
export async function calculateBenchmarks() {
  try {
    // Dohvati sve providere koji imaju ROI podatke (minimalno 1 kupljen lead)
    const allROIs = await prisma.providerROI.findMany({
      where: {
        totalLeadsPurchased: { gte: 1 } // Minimum 1 lead za relevantnost
      },
      select: {
        totalLeadsPurchased: true,
        totalLeadsContacted: true,
        totalLeadsConverted: true,
        totalCreditsSpent: true,
        totalRevenue: true,
        conversionRate: true,
        roi: true,
        avgLeadValue: true
      },
      orderBy: {
        totalLeadsPurchased: 'desc'
      }
    });

    if (allROIs.length === 0) {
      return {
        totalProviders: 0,
        message: 'Nema dovoljno podataka za usporedbu'
      };
    }

    // Sortiraj po svakoj metrici
    const sortedByConversion = [...allROIs].sort((a, b) => b.conversionRate - a.conversionRate);
    const sortedByROI = [...allROIs].sort((a, b) => b.roi - a.roi);
    const sortedByRevenue = [...allROIs].sort((a, b) => b.totalRevenue - a.totalRevenue);
    const sortedByAvgLeadValue = [...allROIs].sort((a, b) => b.avgLeadValue - a.avgLeadValue);
    const sortedByLeadsPurchased = [...allROIs].sort((a, b) => b.totalLeadsPurchased - a.totalLeadsPurchased);

    // Izračunaj prosjek
    const averages = {
      totalLeadsPurchased: allROIs.reduce((sum, r) => sum + r.totalLeadsPurchased, 0) / allROIs.length,
      totalLeadsContacted: allROIs.reduce((sum, r) => sum + r.totalLeadsContacted, 0) / allROIs.length,
      totalLeadsConverted: allROIs.reduce((sum, r) => sum + r.totalLeadsConverted, 0) / allROIs.length,
      totalCreditsSpent: allROIs.reduce((sum, r) => sum + r.totalCreditsSpent, 0) / allROIs.length,
      totalRevenue: allROIs.reduce((sum, r) => sum + r.totalRevenue, 0) / allROIs.length,
      conversionRate: allROIs.reduce((sum, r) => sum + r.conversionRate, 0) / allROIs.length,
      roi: allROIs.reduce((sum, r) => sum + r.roi, 0) / allROIs.length,
      avgLeadValue: allROIs.reduce((sum, r) => sum + r.avgLeadValue, 0) / allROIs.length
    };

    // Izračunaj median
    const getMedian = (sorted, field) => {
      const mid = Math.floor(sorted.length / 2);
      if (sorted.length % 2 === 0) {
        return (sorted[mid - 1][field] + sorted[mid][field]) / 2;
      }
      return sorted[mid][field];
    };

    const medians = {
      totalLeadsPurchased: getMedian(sortedByLeadsPurchased, 'totalLeadsPurchased'),
      conversionRate: getMedian(sortedByConversion, 'conversionRate'),
      roi: getMedian(sortedByROI, 'roi'),
      totalRevenue: getMedian(sortedByRevenue, 'totalRevenue'),
      avgLeadValue: getMedian(sortedByAvgLeadValue, 'avgLeadValue')
    };

    // Izračunaj percentili (25th, 50th, 75th, 90th, 95th, 99th)
    const getPercentile = (sorted, field, percentile) => {
      const index = Math.floor(sorted.length * percentile / 100);
      return sorted[Math.min(index, sorted.length - 1)][field];
    };

    const percentiles = {
      conversionRate: {
        p25: getPercentile(sortedByConversion, 'conversionRate', 25),
        p50: medians.conversionRate,
        p75: getPercentile(sortedByConversion, 'conversionRate', 75),
        p90: getPercentile(sortedByConversion, 'conversionRate', 90),
        p95: getPercentile(sortedByConversion, 'conversionRate', 95),
        p99: getPercentile(sortedByConversion, 'conversionRate', 99)
      },
      roi: {
        p25: getPercentile(sortedByROI, 'roi', 25),
        p50: medians.roi,
        p75: getPercentile(sortedByROI, 'roi', 75),
        p90: getPercentile(sortedByROI, 'roi', 90),
        p95: getPercentile(sortedByROI, 'roi', 95),
        p99: getPercentile(sortedByROI, 'roi', 99)
      },
      totalRevenue: {
        p25: getPercentile(sortedByRevenue, 'totalRevenue', 25),
        p50: medians.totalRevenue,
        p75: getPercentile(sortedByRevenue, 'totalRevenue', 75),
        p90: getPercentile(sortedByRevenue, 'totalRevenue', 90),
        p95: getPercentile(sortedByRevenue, 'totalRevenue', 95),
        p99: getPercentile(sortedByRevenue, 'totalRevenue', 99)
      },
      avgLeadValue: {
        p25: getPercentile(sortedByAvgLeadValue, 'avgLeadValue', 25),
        p50: medians.avgLeadValue,
        p75: getPercentile(sortedByAvgLeadValue, 'avgLeadValue', 75),
        p90: getPercentile(sortedByAvgLeadValue, 'avgLeadValue', 90),
        p95: getPercentile(sortedByAvgLeadValue, 'avgLeadValue', 95),
        p99: getPercentile(sortedByAvgLeadValue, 'avgLeadValue', 99)
      }
    };

    // Top performers (top 10%)
    const top10PercentCount = Math.max(1, Math.floor(allROIs.length * 0.1));
    const topPerformers = {
      conversionRate: sortedByConversion.slice(0, top10PercentCount).map(r => r.conversionRate),
      roi: sortedByROI.slice(0, top10PercentCount).map(r => r.roi),
      totalRevenue: sortedByRevenue.slice(0, top10PercentCount).map(r => r.totalRevenue),
      avgLeadValue: sortedByAvgLeadValue.slice(0, top10PercentCount).map(r => r.avgLeadValue)
    };

    return {
      totalProviders: allROIs.length,
      averages,
      medians,
      percentiles,
      topPerformers: {
        conversionRate: {
          min: Math.min(...topPerformers.conversionRate),
          max: Math.max(...topPerformers.conversionRate),
          avg: topPerformers.conversionRate.reduce((a, b) => a + b, 0) / topPerformers.conversionRate.length
        },
        roi: {
          min: Math.min(...topPerformers.roi),
          max: Math.max(...topPerformers.roi),
          avg: topPerformers.roi.reduce((a, b) => a + b, 0) / topPerformers.roi.length
        },
        totalRevenue: {
          min: Math.min(...topPerformers.totalRevenue),
          max: Math.max(...topPerformers.totalRevenue),
          avg: topPerformers.totalRevenue.reduce((a, b) => a + b, 0) / topPerformers.totalRevenue.length
        },
        avgLeadValue: {
          min: Math.min(...topPerformers.avgLeadValue),
          max: Math.max(...topPerformers.avgLeadValue),
          avg: topPerformers.avgLeadValue.reduce((a, b) => a + b, 0) / topPerformers.avgLeadValue.length
        }
      }
    };
  } catch (error) {
    console.error('[Benchmark Service] Error calculating benchmarks:', error);
    throw error;
  }
}

/**
 * Izračunaj poziciju providera u odnosu na druge (percentil rank)
 * @param {string} providerId - ID providera
 * @returns {Promise<object>} Pozicija i usporedba
 */
export async function getProviderPosition(providerId) {
  try {
    const providerROI = await prisma.providerROI.findUnique({
      where: { providerId },
      select: {
        totalLeadsPurchased: true,
        totalLeadsContacted: true,
        totalLeadsConverted: true,
        totalCreditsSpent: true,
        totalRevenue: true,
        conversionRate: true,
        roi: true,
        avgLeadValue: true
      }
    });

    if (!providerROI || providerROI.totalLeadsPurchased === 0) {
      return {
        hasData: false,
        message: 'Nedostaju podaci za usporedbu. Kupite barem jedan lead da biste vidjeli svoju poziciju.'
      };
    }

    const benchmarks = await calculateBenchmarks();

    if (benchmarks.totalProviders === 0) {
      return {
        hasData: false,
        message: 'Nema dovoljno podataka za usporedbu na platformi'
      };
    }

    // Dohvati sve ROI podatke za izračun percentila
    const allROIs = await prisma.providerROI.findMany({
      where: {
        totalLeadsPurchased: { gte: 1 }
      },
      select: {
        conversionRate: true,
        roi: true,
        totalRevenue: true,
        avgLeadValue: true,
        totalLeadsPurchased: true
      }
    });

    // Izračunaj percentil rank za svaku metriku
    const calculatePercentileRank = (value, sorted, field) => {
      const countBelow = sorted.filter(r => r[field] < value).length;
      return (countBelow / sorted.length) * 100;
    };

    const sortedByConversion = [...allROIs].sort((a, b) => a.conversionRate - b.conversionRate);
    const sortedByROI = [...allROIs].sort((a, b) => a.roi - b.roi);
    const sortedByRevenue = [...allROIs].sort((a, b) => a.totalRevenue - b.totalRevenue);
    const sortedByAvgLeadValue = [...allROIs].sort((a, b) => a.avgLeadValue - b.avgLeadValue);

    const percentileRanks = {
      conversionRate: calculatePercentileRank(providerROI.conversionRate, sortedByConversion, 'conversionRate'),
      roi: calculatePercentileRank(providerROI.roi, sortedByROI, 'roi'),
      totalRevenue: calculatePercentileRank(providerROI.totalRevenue, sortedByRevenue, 'totalRevenue'),
      avgLeadValue: calculatePercentileRank(providerROI.avgLeadValue, sortedByAvgLeadValue, 'avgLeadValue')
    };

    // Odredi tier (Top 1%, Top 10%, Top 25%, Average, Below Average)
    const getTier = (percentileRank) => {
      if (percentileRank >= 99) return 'TOP_1';
      if (percentileRank >= 90) return 'TOP_10';
      if (percentileRank >= 75) return 'TOP_25';
      if (percentileRank >= 50) return 'AVERAGE';
      return 'BELOW_AVERAGE';
    };

    const tiers = {
      conversionRate: getTier(percentileRanks.conversionRate),
      roi: getTier(percentileRanks.roi),
      totalRevenue: getTier(percentileRanks.totalRevenue),
      avgLeadValue: getTier(percentileRanks.avgLeadValue)
    };

    // Izračunaj ukupni score (prosjek percentila)
    const overallPercentile = (
      percentileRanks.conversionRate +
      percentileRanks.roi +
      percentileRanks.totalRevenue +
      percentileRanks.avgLeadValue
    ) / 4;

    const overallTier = getTier(overallPercentile);

    return {
      hasData: true,
      providerStats: providerROI,
      benchmarks,
      percentileRanks,
      tiers,
      overallPercentile,
      overallTier,
      comparison: {
        conversionRate: {
          yourValue: providerROI.conversionRate,
          average: benchmarks.averages.conversionRate,
          median: benchmarks.medians.conversionRate,
          top10Avg: benchmarks.topPerformers.conversionRate.avg,
          percentile: percentileRanks.conversionRate,
          tier: tiers.conversionRate
        },
        roi: {
          yourValue: providerROI.roi,
          average: benchmarks.averages.roi,
          median: benchmarks.medians.roi,
          top10Avg: benchmarks.topPerformers.roi.avg,
          percentile: percentileRanks.roi,
          tier: tiers.roi
        },
        totalRevenue: {
          yourValue: providerROI.totalRevenue,
          average: benchmarks.averages.totalRevenue,
          median: benchmarks.medians.totalRevenue,
          top10Avg: benchmarks.topPerformers.totalRevenue.avg,
          percentile: percentileRanks.totalRevenue,
          tier: tiers.totalRevenue
        },
        avgLeadValue: {
          yourValue: providerROI.avgLeadValue,
          average: benchmarks.averages.avgLeadValue,
          median: benchmarks.medians.avgLeadValue,
          top10Avg: benchmarks.topPerformers.avgLeadValue.avg,
          percentile: percentileRanks.avgLeadValue,
          tier: tiers.avgLeadValue
        }
      }
    };
  } catch (error) {
    console.error('[Benchmark Service] Error getting provider position:', error);
    throw error;
  }
}

