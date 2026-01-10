// Forecast Service - Predviđanje budućih performansi
import { prisma } from '../lib/prisma.js';

/**
 * Izračunaj linear regression za trend analizu
 * @param {Array} dataPoints - Array of {x: number, y: number}
 * @returns {Object} {slope: number, intercept: number, rSquared: number}
 */
function linearRegression(dataPoints) {
  const n = dataPoints.length;
  if (n < 2) {
    return { slope: 0, intercept: 0, rSquared: 0 };
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  for (const point of dataPoints) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Izračunaj R-squared (koeficijent determinacije)
  let meanY = sumY / n;
  let ssRes = 0; // Sum of squares of residuals
  let ssTot = 0; // Total sum of squares
  
  for (const point of dataPoints) {
    const predicted = slope * point.x + intercept;
    ssRes += Math.pow(point.y - predicted, 2);
    ssTot += Math.pow(point.y - meanY, 2);
  }

  const rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);

  return { slope, intercept, rSquared };
}

/**
 * Izračunaj eksponencijalno izglađivanje (exponential smoothing)
 * @param {Array} values - Array of historical values
 * @param {number} alpha - Smoothing factor (0-1)
 * @returns {number} Predicted next value
 */
function exponentialSmoothing(values, alpha = 0.3) {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  let forecast = values[0];
  for (let i = 1; i < values.length; i++) {
    forecast = alpha * values[i] + (1 - alpha) * forecast;
  }

  return forecast;
}

/**
 * Izračunaj prosječnu stopu rasta
 * @param {Array} values - Array of historical values
 * @returns {number} Average growth rate (0-1)
 */
function calculateGrowthRate(values) {
  if (values.length < 2) return 0;

  const growthRates = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] > 0) {
      const rate = (values[i] - values[i - 1]) / values[i - 1];
      growthRates.push(rate);
    }
  }

  if (growthRates.length === 0) return 0;
  return growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
}

/**
 * Generiraj povijesne mjesečne podatke za providera
 * @param {string} providerId - ID providera
 * @param {number} monthsBack - Broj mjeseci unazad (default: 12)
 * @returns {Promise<Array>} Array of monthly data
 */
async function getHistoricalMonthlyData(providerId, monthsBack = 12) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  
  // Dohvati sve lead purchase-ove u periodu
  const purchases = await prisma.leadPurchase.findMany({
    where: {
      providerId,
      createdAt: {
        gte: startDate
      }
    },
    include: {
      job: {
        select: {
          budgetMax: true,
          qualityScore: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Grupiraj po mjesecima
  const monthlyData = new Map();
  
  for (const purchase of purchases) {
    const purchaseDate = new Date(purchase.createdAt);
    const monthKey = `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        month: purchaseDate.getMonth() + 1,
        year: purchaseDate.getFullYear(),
        monthKey,
        purchased: 0,
        contacted: 0,
        converted: 0,
        creditsSpent: 0,
        revenue: 0
      });
    }

    const monthData = monthlyData.get(monthKey);
    monthData.purchased++;
    monthData.creditsSpent += purchase.creditsSpent;
    
    if (purchase.status === 'CONTACTED' || purchase.status === 'CONVERTED') {
      monthData.contacted++;
    }
    
    if (purchase.status === 'CONVERTED') {
      monthData.converted++;
      monthData.revenue += purchase.job.budgetMax || 0;
    }
  }

  // Izračunaj statistike za svaki mjesec
  const result = [];
  for (let i = 0; i < monthsBack; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const data = monthlyData.get(monthKey) || {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      monthKey,
      purchased: 0,
      contacted: 0,
      converted: 0,
      creditsSpent: 0,
      revenue: 0
    };

    const conversionRate = data.purchased > 0 ? (data.converted / data.purchased) * 100 : 0;
    const avgLeadValue = data.converted > 0 ? data.revenue / data.converted : 0;
    const costEUR = data.creditsSpent * 1; // 1 kredit = 1 EUR
    const roi = costEUR > 0 ? ((data.revenue - costEUR) / costEUR) * 100 : 0;

    result.unshift({
      ...data,
      conversionRate,
      avgLeadValue,
      costEUR,
      roi,
      periodIndex: i // 0 = najnoviji, veći = stariji
    });
  }

  return result;
}

/**
 * Predvidi buduće performanse za providera
 * @param {string} providerId - ID providera
 * @param {number} forecastMonths - Broj mjeseci za predviđanje (default: 3)
 * @returns {Promise<object>} Forecast data
 */
export async function forecastProviderPerformance(providerId, forecastMonths = 3) {
  try {
    const historicalData = await getHistoricalMonthlyData(providerId, 12);
    
    if (historicalData.length < 2) {
      return {
        hasEnoughData: false,
        message: 'Potrebno je barem 2 mjeseca povijesnih podataka za predviđanje',
        historicalData: historicalData.length
      };
    }

    // Pripremi podatke za trend analizu
    const prepareDataPoints = (field) => {
      return historicalData.map((data, index) => ({
        x: index,
        y: data[field]
      }));
    };

    // Linear regression za različite metrike
    const purchasedRegression = linearRegression(prepareDataPoints('purchased'));
    const revenueRegression = linearRegression(prepareDataPoints('revenue'));
    const conversionRegression = linearRegression(prepareDataPoints('conversionRate'));
    const roiRegression = linearRegression(prepareDataPoints('roi'));

    // Eksponencijalno izglađivanje
    const purchasedValues = historicalData.map(d => d.purchased);
    const revenueValues = historicalData.map(d => d.revenue);
    const conversionValues = historicalData.map(d => d.conversionRate);
    const roiValues = historicalData.map(d => d.roi);

    const purchasedSmoothing = exponentialSmoothing(purchasedValues);
    const revenueSmoothing = exponentialSmoothing(revenueValues);
    const conversionSmoothing = exponentialSmoothing(conversionValues);
    const roiSmoothing = exponentialSmoothing(roiValues);

    // Stopa rasta
    const purchasedGrowth = calculateGrowthRate(purchasedValues);
    const revenueGrowth = calculateGrowthRate(revenueValues);

    // Projiciraj buduće mjesece
    const forecasts = [];
    const lastIndex = historicalData.length - 1;
    const lastData = historicalData[lastIndex];

    for (let i = 1; i <= forecastMonths; i++) {
      const futureIndex = lastIndex + i;

      // Linearna projekcija
      const purchasedLinear = Math.max(0, purchasedRegression.slope * futureIndex + purchasedRegression.intercept);
      const revenueLinear = Math.max(0, revenueRegression.slope * futureIndex + revenueRegression.intercept);
      const conversionLinear = Math.max(0, Math.min(100, conversionRegression.slope * futureIndex + conversionRegression.intercept));
      const roiLinear = roiRegression.slope * futureIndex + roiRegression.intercept;

      // Eksponencijalna projekcija (smoothing + growth)
      const purchasedExp = purchasedSmoothing * Math.pow(1 + purchasedGrowth, i);
      const revenueExp = revenueSmoothing * Math.pow(1 + revenueGrowth, i);
      const conversionExp = conversionSmoothing; // Conversion rate se ne mijenja eksponencijalno
      const roiExp = roiSmoothing; // ROI se ne mijenja eksponencijalno

      // Kombinirana projekcija (weighted average: 60% linear, 40% exponential)
      const purchased = Math.max(0, Math.round(purchasedLinear * 0.6 + purchasedExp * 0.4));
      const revenue = Math.max(0, Math.round(revenueLinear * 0.6 + revenueExp * 0.4));
      const conversionRate = Math.max(0, Math.min(100, conversionLinear * 0.6 + conversionExp * 0.4));
      
      // ROI projekcija (koristi prosječnu vrijednost leada iz prošlosti)
      const avgLeadValue = historicalData.reduce((sum, d) => sum + d.avgLeadValue, 0) / historicalData.length;
      const estimatedConverted = Math.round(purchased * (conversionRate / 100));
      const estimatedRevenue = estimatedConverted * avgLeadValue;
      const estimatedCost = purchased * 10; // 10 EUR po leadu
      const roi = estimatedCost > 0 ? ((estimatedRevenue - estimatedCost) / estimatedCost) * 100 : 0;

      const futureDate = new Date(lastData.year, lastData.month + i - 1, 1);
      
      forecasts.push({
        month: futureDate.getMonth() + 1,
        year: futureDate.getFullYear(),
        monthName: futureDate.toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' }),
        purchased,
        converted: estimatedConverted,
        revenue: Math.round(estimatedRevenue),
        conversionRate,
        roi,
        avgLeadValue,
        costEUR: estimatedCost,
        confidence: {
          purchased: Math.min(1, purchasedRegression.rSquared),
          revenue: Math.min(1, revenueRegression.rSquared),
          conversionRate: Math.min(1, conversionRegression.rSquared),
          roi: Math.min(1, roiRegression.rSquared)
        }
      });
    }

    // Izračunaj ukupne projekcije
    const totalForecast = forecasts.reduce((acc, f) => ({
      purchased: acc.purchased + f.purchased,
      converted: acc.converted + f.converted,
      revenue: acc.revenue + f.revenue,
      costEUR: acc.costEUR + f.costEUR
    }), { purchased: 0, converted: 0, revenue: 0, costEUR: 0 });

    const avgForecastConversion = totalForecast.purchased > 0 
      ? (totalForecast.converted / totalForecast.purchased) * 100 
      : 0;

    const avgForecastROI = totalForecast.costEUR > 0
      ? ((totalForecast.revenue - totalForecast.costEUR) / totalForecast.costEUR) * 100
      : 0;

    return {
      hasEnoughData: true,
      historicalMonths: historicalData.length,
      forecasts,
      totals: {
        ...totalForecast,
        conversionRate: avgForecastConversion,
        roi: avgForecastROI
      },
      trends: {
        purchased: {
          regression: purchasedRegression,
          smoothing: purchasedSmoothing,
          growthRate: purchasedGrowth,
          direction: purchasedRegression.slope > 0 ? 'up' : purchasedRegression.slope < 0 ? 'down' : 'stable'
        },
        revenue: {
          regression: revenueRegression,
          smoothing: revenueSmoothing,
          growthRate: revenueGrowth,
          direction: revenueRegression.slope > 0 ? 'up' : revenueRegression.slope < 0 ? 'down' : 'stable'
        },
        conversionRate: {
          regression: conversionRegression,
          smoothing: conversionSmoothing,
          direction: conversionRegression.slope > 0 ? 'up' : conversionRegression.slope < 0 ? 'down' : 'stable'
        },
        roi: {
          regression: roiRegression,
          smoothing: roiSmoothing,
          direction: roiRegression.slope > 0 ? 'up' : roiRegression.slope < 0 ? 'down' : 'stable'
        }
      },
      historicalData: historicalData.slice(-6) // Zadnjih 6 mjeseci za prikaz
    };
  } catch (error) {
    console.error('[Forecast Service] Error forecasting performance:', error);
    throw error;
  }
}

