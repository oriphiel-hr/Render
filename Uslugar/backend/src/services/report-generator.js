// Report Generator Service - Mjesečni i godišnji izvještaji
import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma.js';
import { getPlanVolumeSummary } from './billing-adjustment-service.js';

/**
 * Generiraj mjesečni izvještaj
 * @param {string} providerId - ID providera
 * @param {number} year - Godina
 * @param {number} month - Mjesec (1-12)
 * @returns {Promise<object>} Mjesečni izvještaj
 */
export async function generateMonthlyReport(providerId, year, month) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // Zadnji dan mjeseca
    
    const user = await prisma.user.findUnique({
      where: { id: providerId },
      select: {
        fullName: true,
        email: true,
        companyName: true
      }
    });
    
    // Dohvati sve lead purchase-ove za mjesec
    const purchases = await prisma.leadPurchase.findMany({
      where: {
        providerId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        job: {
          include: {
            category: {
              select: {
                name: true,
                icon: true
              }
            }
          },
          select: {
            id: true,
            title: true,
            budgetMin: true,
            budgetMax: true,
            city: true,
            qualityScore: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Dohvati credit transactions za mjesec
    const creditTransactions = await prisma.creditTransaction.findMany({
      where: {
        userId: providerId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Izračunaj statistike
    const stats = calculateMonthlyStats(purchases, creditTransactions, startDate, endDate);
    
    // Statistika po kategorijama
    const categoryStats = calculateCategoryStats(purchases);
    
    // Trend analiza (usporedba s prošlim mjesecom)
    const previousMonthStart = new Date(year, month - 2, 1);
    const previousMonthEnd = new Date(year, month - 1, 0, 23, 59, 59);
    
    const previousMonthPurchases = await prisma.leadPurchase.findMany({
      where: {
        providerId,
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd
        }
      }
    });
    
    const previousStats = calculateMonthlyStats(previousMonthPurchases, [], previousMonthStart, previousMonthEnd);
    const trends = calculateTrends(stats, previousStats);
    
    // Dohvati billing informacije (BillingPlan i BillingAdjustment)
    const billingInfo = await getBillingInfoForPeriod(providerId, startDate, endDate);
    
    return {
      period: {
        type: 'monthly',
        year,
        month,
        monthName: startDate.toLocaleDateString('hr-HR', { month: 'long' }),
        startDate,
        endDate
      },
      user: {
        name: user?.fullName || 'N/A',
        email: user?.email || 'N/A',
        companyName: user?.companyName || null
      },
      stats,
      categoryStats,
      trends,
      billing: billingInfo, // Billing informacije (očekivani vs isporučeni leadovi, korekcije)
      purchases: purchases.map(p => ({
        id: p.id,
        jobTitle: p.job.title,
        category: p.job.category.name,
        status: p.status,
        creditsSpent: p.creditsSpent,
        budgetMax: p.job.budgetMax,
        qualityScore: p.job.qualityScore,
        city: p.job.city,
        createdAt: p.createdAt,
        contactedAt: p.contactedAt,
        convertedAt: p.convertedAt
      })),
      creditTransactions: creditTransactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        balance: t.balance,
        description: t.description,
        createdAt: t.createdAt
      }))
    };
  } catch (error) {
    console.error('[Report Generator] Error generating monthly report:', error);
    throw error;
  }
}

/**
 * Generiraj godišnji izvještaj
 * @param {string} providerId - ID providera
 * @param {number} year - Godina
 * @returns {Promise<object>} Godišnji izvještaj
 */
export async function generateYearlyReport(providerId, year) {
  try {
    const startDate = new Date(year, 0, 1); // 1. siječnja
    const endDate = new Date(year, 11, 31, 23, 59, 59); // 31. prosinca
    
    const user = await prisma.user.findUnique({
      where: { id: providerId },
      select: {
        fullName: true,
        email: true,
        companyName: true
      }
    });
    
    // Dohvati sve lead purchase-ove za godinu
    const purchases = await prisma.leadPurchase.findMany({
      where: {
        providerId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        job: {
          include: {
            category: {
              select: {
                name: true,
                icon: true
              }
            }
          },
          select: {
            id: true,
            title: true,
            budgetMin: true,
            budgetMax: true,
            city: true,
            qualityScore: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Dohvati credit transactions za godinu
    const creditTransactions = await prisma.creditTransaction.findMany({
      where: {
        userId: providerId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Izračunaj ukupne statistike za godinu
    const stats = calculateMonthlyStats(purchases, creditTransactions, startDate, endDate);
    
    // Statistika po mjesecima
    const monthlyBreakdown = [];
    for (let month = 1; month <= 12; month++) {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);
      
      const monthPurchases = purchases.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate >= monthStart && pDate <= monthEnd;
      });
      
      const monthTransactions = creditTransactions.filter(t => {
        const tDate = new Date(t.createdAt);
        return tDate >= monthStart && tDate <= monthEnd;
      });
      
      const monthStats = calculateMonthlyStats(monthPurchases, monthTransactions, monthStart, monthEnd);
      
      monthlyBreakdown.push({
        month,
        monthName: monthStart.toLocaleDateString('hr-HR', { month: 'long' }),
        stats: monthStats
      });
    }
    
    // Statistika po kategorijama
    const categoryStats = calculateCategoryStats(purchases);
    
    // Trend analiza (usporedba s prošlom godinom)
    const previousYearStart = new Date(year - 1, 0, 1);
    const previousYearEnd = new Date(year - 1, 11, 31, 23, 59, 59);
    
    const previousYearPurchases = await prisma.leadPurchase.findMany({
      where: {
        providerId,
        createdAt: {
          gte: previousYearStart,
          lte: previousYearEnd
        }
      }
    });
    
    const previousStats = calculateMonthlyStats(previousYearPurchases, [], previousYearStart, previousYearEnd);
    const trends = calculateTrends(stats, previousStats);
    
    return {
      period: {
        type: 'yearly',
        year,
        startDate,
        endDate
      },
      user: {
        name: user?.fullName || 'N/A',
        email: user?.email || 'N/A',
        companyName: user?.companyName || null
      },
      stats,
      monthlyBreakdown,
      categoryStats,
      trends,
      topLeads: purchases
        .filter(p => p.status === 'CONVERTED')
        .sort((a, b) => (b.job.budgetMax || 0) - (a.job.budgetMax || 0))
        .slice(0, 10)
        .map(p => ({
          id: p.id,
          jobTitle: p.job.title,
          category: p.job.category.name,
          budgetMax: p.job.budgetMax,
          qualityScore: p.job.qualityScore,
          city: p.job.city,
          convertedAt: p.convertedAt
        }))
    };
  } catch (error) {
    console.error('[Report Generator] Error generating yearly report:', error);
    throw error;
  }
}

/**
 * Izračunaj mjesečne statistike
 */
function calculateMonthlyStats(purchases, creditTransactions, startDate, endDate) {
  const totalPurchased = purchases.length;
  const totalContacted = purchases.filter(p => p.status === 'CONTACTED' || p.status === 'CONVERTED').length;
  const totalConverted = purchases.filter(p => p.status === 'CONVERTED').length;
  const totalRefunded = purchases.filter(p => p.status === 'REFUNDED').length;
  
  const totalCreditsSpent = purchases.reduce((sum, p) => sum + p.creditsSpent, 0);
  const totalCreditsPurchased = creditTransactions
    .filter(t => t.type === 'PURCHASE' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalCreditsRefunded = creditTransactions
    .filter(t => t.type === 'REFUND' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const estimatedRevenue = purchases
    .filter(p => p.status === 'CONVERTED')
    .reduce((sum, p) => sum + (p.job.budgetMax || 0), 0);
  
  const avgLeadValue = totalConverted > 0 
    ? estimatedRevenue / totalConverted 
    : 0;
  
  const conversionRate = totalPurchased > 0 
    ? (totalConverted / totalPurchased) * 100 
    : 0;
  
  const contactRate = totalPurchased > 0 
    ? (totalContacted / totalPurchased) * 100 
    : 0;
  
  const refundRate = totalPurchased > 0 
    ? (totalRefunded / totalPurchased) * 100 
    : 0;
  
  // ROI = ((Revenue - Cost) / Cost) * 100
  // Cost = creditsSpent * cijena_po_kreditu (pretpostavimo 1 EUR po kreditu)
  const costEUR = totalCreditsSpent * 1; // 1 EUR po kreditu
  const roi = costEUR > 0 
    ? ((estimatedRevenue - costEUR) / costEUR) * 100 
    : 0;
  
  // Prosječna kvaliteta leadova
  const avgQualityScore = purchases.length > 0
    ? purchases.reduce((sum, p) => sum + (p.job.qualityScore || 0), 0) / purchases.length
    : 0;
  
  // Prosječan budget
  const avgBudget = purchases.length > 0
    ? purchases.reduce((sum, p) => sum + (p.job.budgetMax || p.job.budgetMin || 0), 0) / purchases.length
    : 0;
  
  return {
    totalPurchased,
    totalContacted,
    totalConverted,
    totalRefunded,
    totalCreditsSpent,
    totalCreditsPurchased,
    totalCreditsRefunded,
    estimatedRevenue,
    avgLeadValue,
    conversionRate,
    contactRate,
    refundRate,
    roi,
    avgQualityScore,
    avgBudget,
    costEUR
  };
}

/**
 * Izračunaj statistike po kategorijama
 */
function calculateCategoryStats(purchases) {
  const categoryMap = new Map();
  
  for (const purchase of purchases) {
    const categoryName = purchase.job.category.name;
    
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        category: categoryName,
        icon: purchase.job.category.icon || '📁',
        totalPurchased: 0,
        totalConverted: 0,
        totalRevenue: 0,
        totalCreditsSpent: 0,
        conversionRate: 0
      });
    }
    
    const stats = categoryMap.get(categoryName);
    stats.totalPurchased++;
    stats.totalCreditsSpent += purchase.creditsSpent;
    
    if (purchase.status === 'CONVERTED') {
      stats.totalConverted++;
      stats.totalRevenue += purchase.job.budgetMax || 0;
    }
  }
  
  // Izračunaj conversion rate za svaku kategoriju
  for (const stats of categoryMap.values()) {
    stats.conversionRate = stats.totalPurchased > 0
      ? (stats.totalConverted / stats.totalPurchased) * 100
      : 0;
  }
  
  return Array.from(categoryMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Izračunaj trendove (usporedba s prethodnim periodom)
 */
function calculateTrends(currentStats, previousStats) {
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  return {
    totalPurchased: {
      current: currentStats.totalPurchased,
      previous: previousStats.totalPurchased,
      change: calculateChange(currentStats.totalPurchased, previousStats.totalPurchased)
    },
    totalConverted: {
      current: currentStats.totalConverted,
      previous: previousStats.totalConverted,
      change: calculateChange(currentStats.totalConverted, previousStats.totalConverted)
    },
    conversionRate: {
      current: currentStats.conversionRate,
      previous: previousStats.conversionRate,
      change: currentStats.conversionRate - previousStats.conversionRate
    },
    estimatedRevenue: {
      current: currentStats.estimatedRevenue,
      previous: previousStats.estimatedRevenue,
      change: calculateChange(currentStats.estimatedRevenue, previousStats.estimatedRevenue)
    },
    roi: {
      current: currentStats.roi,
      previous: previousStats.roi,
      change: currentStats.roi - previousStats.roi
    }
  };
}

/**
 * Generiraj PDF izvještaj
 */
export async function generatePDFReport(reportData, periodType = 'monthly') {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Header
      doc.fontSize(20).text('USLUGAR EXCLUSIVE', 50, 50, { align: 'center' });
      doc.fontSize(16).text(`${periodType === 'monthly' ? 'Mjesečni' : 'Godišnji'} Izvještaj`, 50, 80, { align: 'center' });
      
      // Period
      if (periodType === 'monthly') {
        doc.fontSize(12).text(
          `${reportData.period.monthName} ${reportData.period.year}`,
          50,
          110,
          { align: 'center' }
        );
      } else {
        doc.fontSize(12).text(
          `Godina ${reportData.period.year}`,
          50,
          110,
          { align: 'center' }
        );
      }
      
      let yPos = 150;
      
      // Korisnički podaci
      doc.fontSize(14).text('Podaci korisnika:', 50, yPos);
      yPos += 25;
      doc.fontSize(11).text(`Ime: ${reportData.user.name}`, 50, yPos);
      yPos += 20;
      doc.fontSize(11).text(`Email: ${reportData.user.email}`, 50, yPos);
      if (reportData.user.companyName) {
        yPos += 20;
        doc.fontSize(11).text(`Firma: ${reportData.user.companyName}`, 50, yPos);
      }
      yPos += 30;
      
      // Statistike
      doc.fontSize(14).text('Ključne Statistike:', 50, yPos);
      yPos += 25;
      
      const statsLines = [
        `Ukupno kupljenih leadova: ${reportData.stats.totalPurchased}`,
        `Ukupno kontaktiranih: ${reportData.stats.totalContacted}`,
        `Ukupno konvertiranih: ${reportData.stats.totalConverted}`,
        `Ukupno refundiranih: ${reportData.stats.totalRefunded}`,
        `Ukupno potrošeno kredita: ${reportData.stats.totalCreditsSpent}`,
        `Procijenjen prihod: ${reportData.stats.estimatedRevenue.toFixed(2)} EUR`,
        `Prosječna vrijednost leada: ${reportData.stats.avgLeadValue.toFixed(2)} EUR`,
        `Stopa konverzije: ${reportData.stats.conversionRate.toFixed(2)}%`,
        `Stopa kontakta: ${reportData.stats.contactRate.toFixed(2)}%`,
        `Stopa refunda: ${reportData.stats.refundRate.toFixed(2)}%`,
        `ROI: ${reportData.stats.roi.toFixed(2)}%`,
        `Prosječna kvaliteta leadova: ${reportData.stats.avgQualityScore.toFixed(1)}/100`
      ];
      
      for (const line of statsLines) {
        doc.fontSize(10).text(line, 50, yPos);
        yPos += 18;
        
        // Provjeri da li treba novu stranicu
        if (yPos > 750) {
          doc.addPage();
          yPos = 50;
        }
      }
      
      yPos += 20;
      
      // Trendovi (ako postoje)
      if (reportData.trends) {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }
        
        doc.fontSize(14).text('Trend Analiza:', 50, yPos);
        yPos += 25;
        
        const trendLines = [];
        for (const [key, trend] of Object.entries(reportData.trends)) {
          const change = trend.change || 0;
          const changeStr = change >= 0 ? `+${change.toFixed(2)}` : `${change.toFixed(2)}`;
          const changeLabel = key === 'conversionRate' || key === 'roi' ? '%' : '';
          trendLines.push(`${key}: ${trend.current} (${changeStr}${changeLabel} vs prethodni period)`);
        }
        
        for (const line of trendLines) {
          doc.fontSize(10).text(line, 50, yPos);
          yPos += 18;
          
          if (yPos > 750) {
            doc.addPage();
            yPos = 50;
          }
        }
        
        yPos += 20;
      }
      
      // Statistike po kategorijama (ako postoje)
      if (reportData.categoryStats && reportData.categoryStats.length > 0) {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }
        
        doc.fontSize(14).text('Statistika po Kategorijama:', 50, yPos);
        yPos += 25;
        
        for (const catStat of reportData.categoryStats.slice(0, 10)) { // Top 10 kategorija
          doc.fontSize(11).text(`${catStat.icon} ${catStat.category}`, 50, yPos);
          yPos += 18;
          doc.fontSize(9).text(
            `  Kupljeno: ${catStat.totalPurchased} | Konvertirano: ${catStat.totalConverted} | Prihod: ${catStat.totalRevenue.toFixed(2)} EUR | Konverzija: ${catStat.conversionRate.toFixed(2)}%`,
            50,
            yPos
          );
          yPos += 20;
          
          if (yPos > 750) {
            doc.addPage();
            yPos = 50;
          }
        }
      }
      
      // Mjesečna razgradnja za godišnji izvještaj
      if (periodType === 'yearly' && reportData.monthlyBreakdown) {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }
        
        doc.fontSize(14).text('Razgradnja po Mjesecima:', 50, yPos);
        yPos += 25;
        
        for (const month of reportData.monthlyBreakdown) {
          doc.fontSize(11).text(`${month.monthName}:`, 50, yPos);
          yPos += 18;
          doc.fontSize(9).text(
            `  Leadovi: ${month.stats.totalPurchased} | Konverzija: ${month.stats.totalConverted} | Prihod: ${month.stats.estimatedRevenue.toFixed(2)} EUR`,
            50,
            yPos
          );
          yPos += 20;
          
          if (yPos > 750) {
            doc.addPage();
            yPos = 50;
          }
        }
      }
      
      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
          .text(
            `Generirano: ${new Date().toLocaleDateString('hr-HR')} ${new Date().toLocaleTimeString('hr-HR')} | Stranica ${i + 1} od ${pageCount}`,
            50,
            800,
            { align: 'center' }
          );
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generiraj CSV izvještaj
 */
export function generateCSVReport(reportData, periodType = 'monthly') {
  const lines = [];
  
  // Header
  lines.push('USLUGAR EXCLUSIVE - ' + (periodType === 'monthly' ? 'Mjesečni' : 'Godišnji') + ' Izvještaj');
  if (periodType === 'monthly') {
    lines.push(`${reportData.period.monthName} ${reportData.period.year}`);
  } else {
    lines.push(`Godina ${reportData.period.year}`);
  }
  lines.push('');
  
  // Korisnički podaci
  lines.push('Podaci korisnika:');
  lines.push(`Ime,${reportData.user.name}`);
  lines.push(`Email,${reportData.user.email}`);
  if (reportData.user.companyName) {
    lines.push(`Firma,${reportData.user.companyName}`);
  }
  lines.push('');
  
  // Statistike
  lines.push('Ključne Statistike:');
  lines.push(`Ukupno kupljenih leadova,${reportData.stats.totalPurchased}`);
  lines.push(`Ukupno kontaktiranih,${reportData.stats.totalContacted}`);
  lines.push(`Ukupno konvertiranih,${reportData.stats.totalConverted}`);
  lines.push(`Ukupno refundiranih,${reportData.stats.totalRefunded}`);
  lines.push(`Ukupno potrošeno kredita,${reportData.stats.totalCreditsSpent}`);
  lines.push(`Procijenjen prihod (EUR),${reportData.stats.estimatedRevenue.toFixed(2)}`);
  lines.push(`Prosječna vrijednost leada (EUR),${reportData.stats.avgLeadValue.toFixed(2)}`);
  lines.push(`Stopa konverzije (%),${reportData.stats.conversionRate.toFixed(2)}`);
  lines.push(`Stopa kontakta (%),${reportData.stats.contactRate.toFixed(2)}`);
  lines.push(`Stopa refunda (%),${reportData.stats.refundRate.toFixed(2)}`);
  lines.push(`ROI (%),${reportData.stats.roi.toFixed(2)}`);
  lines.push(`Prosječna kvaliteta leadova,${reportData.stats.avgQualityScore.toFixed(1)}`);
  lines.push('');
  
  // Trendovi
  if (reportData.trends) {
    lines.push('Trend Analiza:');
    for (const [key, trend] of Object.entries(reportData.trends)) {
      const change = trend.change || 0;
      lines.push(`${key},${trend.current},${trend.previous},${change.toFixed(2)}`);
    }
    lines.push('');
  }
  
  // Statistike po kategorijama
  if (reportData.categoryStats && reportData.categoryStats.length > 0) {
    lines.push('Statistika po Kategorijama:');
    lines.push('Kategorija,Kupljeno,Konvertirano,Prihod (EUR),Konverzija (%)');
    for (const catStat of reportData.categoryStats) {
      lines.push(`${catStat.category},${catStat.totalPurchased},${catStat.totalConverted},${catStat.totalRevenue.toFixed(2)},${catStat.conversionRate.toFixed(2)}`);
    }
    lines.push('');
  }
  
  // Mjesečna razgradnja za godišnji izvještaj
  if (periodType === 'yearly' && reportData.monthlyBreakdown) {
    lines.push('Razgradnja po Mjesecima:');
    lines.push('Mjesec,Kupljeno,Konvertirano,Prihod (EUR),Konverzija (%)');
    for (const month of reportData.monthlyBreakdown) {
      lines.push(`${month.monthName},${month.stats.totalPurchased},${month.stats.totalConverted},${month.stats.estimatedRevenue.toFixed(2)},${month.stats.conversionRate.toFixed(2)}`);
    }
    lines.push('');
  }
  
  // Detalji leadova
  if (reportData.purchases && reportData.purchases.length > 0) {
    lines.push('Detalji Leadova:');
    lines.push('ID,Naslov,Kategorija,Status,Krediti,Budget,Građ,Quality Score,Datum kreiranja');
    for (const purchase of reportData.purchases) {
      lines.push([
        purchase.id,
        `"${purchase.jobTitle}"`,
        purchase.category,
        purchase.status,
        purchase.creditsSpent,
        purchase.budgetMax || 0,
        purchase.city || '',
        purchase.qualityScore || 0,
        purchase.createdAt.toISOString()
      ].join(','));
    }
  }
  
  // BOM za UTF-8 (Excel kompatibilnost)
  return '\uFEFF' + lines.join('\n');
}

/**
 * Dohvati billing informacije za određeni period
 * @param {string} providerId - ID providera
 * @param {Date} periodStart - Početak perioda
 * @param {Date} periodEnd - Kraj perioda
 * @returns {Promise<object>} Billing informacije
 */
async function getBillingInfoForPeriod(providerId, periodStart, periodEnd) {
  try {
    // Dohvati aktivne billing planove korisnika
    const billingPlans = await prisma.billingPlan.findMany({
      where: {
        userId: providerId,
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

    // Dohvati billing adjustments za period
    const adjustments = await prisma.billingAdjustment.findMany({
      where: {
        userId: providerId,
        periodStart: {
          gte: periodStart,
          lte: periodEnd
        }
      },
      include: {
        billingPlan: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        periodStart: 'desc'
      }
    });

    // Izračunaj ukupne statistike
    const plansSummary = await Promise.all(
      billingPlans.map(async (plan) => {
        try {
          const summary = await getPlanVolumeSummary(plan.id, periodStart, periodEnd);
          return {
            planId: plan.id,
            planName: plan.name,
            category: plan.category ? plan.category.name : null,
            region: plan.region,
            expectedLeads: plan.expectedLeads,
            deliveredLeads: summary.deliveredLeads,
            diff: summary.diff,
            period: plan.period
          };
        } catch (error) {
          console.error(`[Report Generator] Error getting volume summary for plan ${plan.id}:`, error);
          return {
            planId: plan.id,
            planName: plan.name,
            category: plan.category ? plan.category.name : null,
            region: plan.region,
            expectedLeads: plan.expectedLeads,
            deliveredLeads: 0,
            diff: -plan.expectedLeads,
            period: plan.period
          };
        }
      })
    );

    // Ukupni očekivani i isporučeni leadovi
    const totalExpected = plansSummary.reduce((sum, p) => sum + (p.expectedLeads || 0), 0);
    const totalDelivered = plansSummary.reduce((sum, p) => sum + (p.deliveredLeads || 0), 0);
    const totalDiff = totalDelivered - totalExpected;

    // Ukupni krediti iz adjustments
    const totalCredits = adjustments
      .filter(a => a.adjustmentType === 'CREDIT')
      .reduce((sum, a) => sum + (a.adjustmentCredits || 0), 0);

    return {
      plans: plansSummary,
      adjustments: adjustments.map(a => ({
        id: a.id,
        planName: a.billingPlan.name,
        category: a.billingPlan.category ? a.billingPlan.category.name : null,
        periodStart: a.periodStart,
        periodEnd: a.periodEnd,
        expectedLeads: a.expectedLeads,
        deliveredLeads: a.deliveredLeads,
        adjustmentType: a.adjustmentType,
        adjustmentCredits: a.adjustmentCredits,
        status: a.status,
        notes: a.notes
      })),
      totals: {
        expectedLeads: totalExpected,
        deliveredLeads: totalDelivered,
        diff: totalDiff,
        creditsFromAdjustments: totalCredits
      }
    };
  } catch (error) {
    console.error('[Report Generator] Error getting billing info:', error);
    return {
      plans: [],
      adjustments: [],
      totals: {
        expectedLeads: 0,
        deliveredLeads: 0,
        diff: 0,
        creditsFromAdjustments: 0
      }
    };
  }
}

