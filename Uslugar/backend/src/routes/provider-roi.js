// Provider ROI Dashboard - USLUGAR EXCLUSIVE
import { Router } from 'express';
import { auth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import {
  generateMonthlyReport,
  generateYearlyReport,
  generatePDFReport,
  generateCSVReport
} from '../services/report-generator.js';
import { sendMonthlyReport } from '../services/monthly-report-service.js';
import { getProviderPosition, calculateBenchmarks } from '../services/benchmark-service.js';
import { forecastProviderPerformance } from '../services/forecast-service.js';

const r = Router();

// Dohvati ROI statistiku za providera
r.get('/dashboard', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const providerId = req.user.id;
    
    // Dohvati ROI podatke
    const roi = await prisma.providerROI.findUnique({
      where: { providerId }
    });
    
    // Dohvati subscription podatke
    const subscription = await prisma.subscription.findUnique({
      where: { userId: providerId },
      select: {
        plan: true,
        creditsBalance: true,
        lifetimeCreditsUsed: true,
        lifetimeLeadsConverted: true
      }
    });
    
    // Dohvati nedavne leadove
    const recentLeads = await prisma.leadPurchase.findMany({
      where: { providerId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            title: true,
            budgetMax: true,
            category: { select: { name: true } }
          }
        }
      }
    });
    
    // Statistika po statusu
    const statusCounts = await prisma.leadPurchase.groupBy({
      by: ['status'],
      where: { providerId },
      _count: { status: true }
    });
    
    const dashboard = {
      roi: roi || {
        totalLeadsPurchased: 0,
        totalLeadsContacted: 0,
        totalLeadsConverted: 0,
        totalCreditsSpent: 0,
        totalRevenue: 0,
        conversionRate: 0,
        roi: 0,
        avgLeadValue: 0
      },
      subscription: subscription || {
        plan: 'NONE',
        creditsBalance: 0,
        lifetimeCreditsUsed: 0,
        lifetimeLeadsConverted: 0
      },
      recentLeads,
      statusBreakdown: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      insights: generateInsights(roi, subscription)
    };
    
    res.json(dashboard);
  } catch (e) {
    next(e);
  }
});

// Mjesečna statistika (prošireno)
r.get('/monthly-stats', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const { year, month, format } = req.query; // format: 'json' (default), 'pdf', 'csv'
    
    const reportYear = parseInt(year) || new Date().getFullYear();
    const reportMonth = parseInt(month) || new Date().getMonth() + 1;
    
    const reportData = await generateMonthlyReport(providerId, reportYear, reportMonth);
    
    // Ako je zahtijevan PDF
    if (format === 'pdf') {
      const pdfBuffer = await generatePDFReport(reportData, 'monthly');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="izvjestaj-${reportYear}-${String(reportMonth).padStart(2, '0')}.pdf"`);
      return res.send(pdfBuffer);
    }
    
    // Ako je zahtijevan CSV
    if (format === 'csv') {
      const csvContent = generateCSVReport(reportData, 'monthly');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="izvjestaj-${reportYear}-${String(reportMonth).padStart(2, '0')}.csv"`);
      return res.send(csvContent);
    }
    
    // Default: JSON
    res.json(reportData);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/roi/yearly-report
 * Godišnji izvještaj
 * Query params: year, format (json|pdf|csv)
 */
r.get('/yearly-report', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const { year, format } = req.query;
    
    const reportYear = parseInt(year) || new Date().getFullYear();
    
    const reportData = await generateYearlyReport(providerId, reportYear);
    
    // Ako je zahtijevan PDF
    if (format === 'pdf') {
      const pdfBuffer = await generatePDFReport(reportData, 'yearly');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="godisnji-izvjestaj-${reportYear}.pdf"`);
      return res.send(pdfBuffer);
    }
    
    // Ako je zahtijevan CSV
    if (format === 'csv') {
      const csvContent = generateCSVReport(reportData, 'yearly');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="godisnji-izvjestaj-${reportYear}.csv"`);
      return res.send(csvContent);
    }
    
    // Default: JSON
    res.json(reportData);
  } catch (e) {
    next(e);
  }
});

// Najbolji leadovi (najviše profita)
r.get('/top-leads', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const { limit } = req.query;
    
    const topLeads = await prisma.leadPurchase.findMany({
      where: {
        providerId,
        status: 'CONVERTED'
      },
      take: limit ? parseInt(limit) : 10,
      orderBy: { convertedAt: 'desc' },
      include: {
        job: {
          select: {
            title: true,
            budgetMax: true,
            category: { select: { name: true } },
            city: true
          }
        }
      }
    });
    
    res.json({
      total: topLeads.length,
      leads: topLeads
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/roi/benchmark
 * Usporedba s drugim providerima - benchmark statistike
 */
r.get('/benchmark', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const providerId = req.user.id;
    
    const position = await getProviderPosition(providerId);
    
    res.json(position);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/roi/benchmark/stats
 * Samo benchmark statistike (bez pozicije providera)
 */
r.get('/benchmark/stats', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const benchmarks = await calculateBenchmarks();
    res.json(benchmarks);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/roi/forecast
 * Predviđanje budućih performansi
 * Query params: months (default: 3)
 */
r.get('/forecast', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const forecastMonths = parseInt(req.query.months) || 3;
    
    const forecast = await forecastProviderPerformance(providerId, forecastMonths);
    
    res.json(forecast);
  } catch (e) {
    next(e);
  }
});

// Generiraj personalizirane insights
function generateInsights(roi, subscription) {
  const insights = [];
  
  if (!roi) {
    insights.push({
      type: 'info',
      message: 'Dobrodošli! Kupite svoj prvi lead i počnite zarađivati.'
    });
    return insights;
  }
  
  // Conversion rate
  if (roi.conversionRate < 20) {
    insights.push({
      type: 'warning',
      message: `Stopa konverzije je ${roi.conversionRate.toFixed(1)}%. Pokušajte brže kontaktirati klijente.`
    });
  } else if (roi.conversionRate > 50) {
    insights.push({
      type: 'success',
      message: `Odlično! Vaša stopa konverzije je ${roi.conversionRate.toFixed(1)}% - iznad prosjeka!`
    });
  }
  
  // ROI
  if (roi.roi > 200) {
    insights.push({
      type: 'success',
      message: `Fantastičan ROI od ${roi.roi.toFixed(0)}%! Nastavite tako!`
    });
  } else if (roi.roi < 50 && roi.totalLeadsPurchased > 5) {
    insights.push({
      type: 'warning',
      message: `ROI od ${roi.roi.toFixed(0)}% je ispod očekivanog. Fokusirajte se na kvalitetnije leadove.`
    });
  }
  
  // Neaktivni leadovi
  const activeRate = roi.totalLeadsPurchased > 0 
    ? (roi.totalLeadsContacted / roi.totalLeadsPurchased) * 100 
    : 0;
    
  if (activeRate < 80 && roi.totalLeadsPurchased > 3) {
    insights.push({
      type: 'warning',
      message: `Kontaktirali ste samo ${activeRate.toFixed(0)}% kupljenih leadova. Brže reagirajte!`
    });
  }
  
  // Credits low
  if (subscription && subscription.creditsBalance < 5) {
    insights.push({
      type: 'alert',
      message: `Imate samo ${subscription.creditsBalance} kredita. Nadopunite ih da ne propustite leadove!`
    });
  }
  
  return insights;
}

/**
 * POST /api/roi/send-monthly-report
 * Ručno pošalji mjesečni izvještaj emailom
 * Body: { year?, month? } (opcionalno - default: prošli mjesec)
 */
r.post('/send-monthly-report', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const { year, month } = req.body;
    
    // Ako nije specificirano, koristi prošli mjesec
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const reportYear = year || lastMonth.getFullYear();
    const reportMonth = month || (lastMonth.getMonth() + 1);
    
    const result = await sendMonthlyReport(providerId, reportYear, reportMonth);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Mjesečni izvještaj poslan na ${result.email}`,
        period: result.period
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send monthly report'
      });
    }
  } catch (e) {
    next(e);
  }
});

export default r;

