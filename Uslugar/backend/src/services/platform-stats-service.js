// Platform Statistics Service - Statistike platforme
import { prisma } from '../lib/prisma.js';

/**
 * Generiraj sve platforme statistike
 * @returns {Promise<object>} Platform statistics
 */
export async function getPlatformStatistics() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Osnovne statistike korisnika
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    const totalProviders = await prisma.user.count({ where: { role: 'PROVIDER' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const activeProviders = await prisma.providerProfile.count({
      where: { isAvailable: true }
    });
    
    // Statistike poslova
    const totalJobs = await prisma.job.count();
    const openJobs = await prisma.job.count({ where: { status: 'OPEN' } });
    const inProgressJobs = await prisma.job.count({ where: { status: 'IN_PROGRESS' } });
    const completedJobs = await prisma.job.count({ where: { status: 'COMPLETED' } });
    const exclusiveJobs = await prisma.job.count({ where: { isExclusive: true } });
    
    // Statistike leadova
    const totalLeadPurchases = await prisma.leadPurchase.count();
    const convertedLeads = await prisma.leadPurchase.count({ where: { status: 'CONVERTED' } });
    const activeLeads = await prisma.leadPurchase.count({ where: { status: 'ACTIVE' } });
    const refundedLeads = await prisma.leadPurchase.count({ where: { status: 'REFUNDED' } });
    
    // Statistike pretplata
    const totalSubscriptions = await prisma.subscription.count();
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        plan: { not: 'NONE' },
        expiresAt: { gte: now }
      }
    });
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ['plan'],
      _count: { plan: true },
      where: {
        plan: { not: 'NONE' }
      }
    });
    
    // Statistike kredita
    const totalCreditsAllocated = await prisma.creditTransaction.aggregate({
      where: { type: 'PURCHASE' },
      _sum: { amount: true }
    });
    const totalCreditsSpent = await prisma.creditTransaction.aggregate({
      where: { type: 'LEAD_PURCHASE' },
      _sum: { amount: true }
    });
    const totalCreditsBalance = await prisma.subscription.aggregate({
      _sum: { creditsBalance: true }
    });
    
    // Statistike prihoda (iz ROI podataka)
    const totalRevenueStats = await prisma.providerROI.aggregate({
      _sum: { totalRevenue: true },
      _avg: { totalRevenue: true }
    });
    
    const totalCreditsSpentStats = await prisma.providerROI.aggregate({
      _sum: { totalCreditsSpent: true }
    });
    
    // Mjesečne statistike (trenutni mjesec)
    const monthlyLeadPurchases = await prisma.leadPurchase.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    });
    
    const monthlyRevenue = await prisma.providerROI.aggregate({
      _sum: { totalRevenue: true }
    });
    
    // Provjerimo novi prihod ovog mjeseca (aproksimacija)
    // Ne možemo direktno sumirati budgetMax preko aggregate, koristimo findMany umjesto toga
    const monthlyConvertedPurchases = await prisma.leadPurchase.findMany({
      where: {
        status: 'CONVERTED',
        convertedAt: { gte: startOfMonth }
      },
      include: {
        job: {
          select: { budgetMax: true }
        }
      }
    });
    
    const monthlyNewRevenue = {
      _sum: {
        creditsSpent: monthlyConvertedPurchases.reduce((sum, p) => sum + (p.creditsSpent || 0), 0),
        leadPrice: monthlyConvertedPurchases.reduce((sum, p) => sum + (p.leadPrice || 0), 0)
      }
    };
    
    // Godišnje statistike
    const yearlyLeadPurchases = await prisma.leadPurchase.count({
      where: {
        createdAt: { gte: startOfYear }
      }
    });
    
    // Statistike po kategorijama
    const jobsByCategory = await prisma.job.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true },
      orderBy: { _count: { categoryId: 'desc' } },
      take: 10
    });
    
    const categoriesWithNames = await Promise.all(
      jobsByCategory.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true, icon: true }
        });
        return {
          categoryId: item.categoryId,
          categoryName: category?.name || 'Unknown',
          icon: category?.icon || '📁',
          count: item._count.categoryId
        };
      })
    );
    
    // Statistike recenzija
    const totalReviews = await prisma.review.count();
    const avgRating = await prisma.review.aggregate({
      _avg: { rating: true }
    });
    
    // Statistike faktura
    const totalInvoices = await prisma.invoice.count();
    const paidInvoices = await prisma.invoice.count({ where: { status: 'PAID' } });
    const invoiceRevenue = await prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    });
    
    // Statistike verifikacije
    const verifiedProviders = await prisma.providerProfile.count({
      where: { kycVerified: true }
    });
    const verifiedClients = await prisma.clientVerification.count({
      where: {
        OR: [
          { emailVerified: true },
          { phoneVerified: true },
          { idVerified: true },
          { companyVerified: true }
        ]
      }
    });
    
    // Statistike chatova
    const totalChatRooms = await prisma.chatRoom.count();
    const totalChatMessages = await prisma.chatMessage.count();
    
    // Trend analiza - novi korisnici ovaj mjesec
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: { gte: startOfMonth },
        role: 'USER'
      }
    });
    
    const newProvidersThisMonth = await prisma.user.count({
      where: {
        createdAt: { gte: startOfMonth },
        role: 'PROVIDER'
      }
    });
    
    // Novi poslovi ovaj mjesec
    const newJobsThisMonth = await prisma.job.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    });
    
    // Prosječna konverzija
    const avgConversionRate = await prisma.providerROI.aggregate({
      _avg: { conversionRate: true },
      where: {
        totalLeadsPurchased: { gt: 0 }
      }
    });
    
    // Prosječni ROI
    const avgROI = await prisma.providerROI.aggregate({
      _avg: { roi: true },
      where: {
        totalLeadsPurchased: { gt: 0 }
      }
    });
    
    // Ukupna vrijednost leadova (suma budgetMax svih konvertiranih leadova)
    const totalLeadValue = await prisma.leadPurchase.findMany({
      where: { status: 'CONVERTED' },
      include: {
        job: {
          select: { budgetMax: true }
        }
      }
    });
    
    const totalEstimatedRevenue = totalLeadValue.reduce((sum, purchase) => {
      return sum + (purchase.job.budgetMax || 0);
    }, 0);
    
    return {
      users: {
        total: totalUsers,
        providers: totalProviders,
        admins: totalAdmins,
        activeProviders,
        newThisMonth: {
          users: newUsersThisMonth,
          providers: newProvidersThisMonth
        }
      },
      jobs: {
        total: totalJobs,
        open: openJobs,
        inProgress: inProgressJobs,
        completed: completedJobs,
        exclusive: exclusiveJobs,
        newThisMonth: newJobsThisMonth,
        byCategory: categoriesWithNames
      },
      leads: {
        totalPurchased: totalLeadPurchases,
        converted: convertedLeads,
        active: activeLeads,
        refunded: refundedLeads,
        conversionRate: totalLeadPurchases > 0 
          ? ((convertedLeads / totalLeadPurchases) * 100).toFixed(2)
          : 0,
        monthlyPurchased: monthlyLeadPurchases,
        yearlyPurchased: yearlyLeadPurchases,
        estimatedTotalRevenue: totalEstimatedRevenue
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        byPlan: subscriptionsByPlan.reduce((acc, item) => {
          acc[item.plan] = item._count.plan;
          return acc;
        }, {})
      },
      credits: {
        totalAllocated: totalCreditsAllocated._sum.amount || 0,
        totalSpent: Math.abs(totalCreditsSpent._sum.amount || 0),
        totalBalance: totalCreditsBalance._sum.creditsBalance || 0
      },
      revenue: {
        total: totalRevenueStats._sum.totalRevenue || 0,
        average: totalRevenueStats._avg.totalRevenue || 0,
        monthly: 0, // Aproksimacija - treba bolji izračun
        fromInvoices: invoiceRevenue._sum.amount ? invoiceRevenue._sum.amount / 100 : 0 // U centima, konvertiraj u EUR
      },
      roi: {
        averageConversionRate: avgConversionRate._avg.conversionRate || 0,
        averageROI: avgROI._avg.roi || 0
      },
      reviews: {
        total: totalReviews,
        averageRating: avgRating._avg.rating || 0
      },
      invoices: {
        total: totalInvoices,
        paid: paidInvoices,
        revenue: invoiceRevenue._sum.amount ? invoiceRevenue._sum.amount / 100 : 0
      },
      verification: {
        verifiedProviders,
        verifiedClients,
        providerVerificationRate: totalProviders > 0
          ? ((verifiedProviders / totalProviders) * 100).toFixed(2)
          : 0
      },
      engagement: {
        totalChatRooms: totalChatRooms,
        totalChatMessages: totalChatMessages,
        avgMessagesPerRoom: totalChatRooms > 0
          ? (totalChatMessages / totalChatRooms).toFixed(1)
          : 0
      },
      period: {
        currentMonth: startOfMonth.toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' }),
        currentYear: now.getFullYear()
      }
    };
  } catch (error) {
    console.error('[Platform Stats Service] Error calculating statistics:', error);
    throw error;
  }
}

/**
 * Generiraj mjesečne trendove za platformu
 * @param {number} monthsBack - Broj mjeseci unazad (default: 12)
 * @returns {Promise<Array>} Monthly trends
 */
export async function getMonthlyTrends(monthsBack = 12) {
  try {
    const now = new Date();
    const trends = [];
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
      
      const newUsers = await prisma.user.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
          role: 'USER'
        }
      });
      
      const newProviders = await prisma.user.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
          role: 'PROVIDER'
        }
      });
      
      const newJobs = await prisma.job.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      });
      
      const leadPurchases = await prisma.leadPurchase.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      });
      
      const convertedLeads = await prisma.leadPurchase.count({
        where: {
          status: 'CONVERTED',
          convertedAt: { gte: monthStart, lte: monthEnd }
        }
      });
      
      // Aproksimacija prihoda za mjesec
      const monthlyPurchases = await prisma.leadPurchase.findMany({
        where: {
          status: 'CONVERTED',
          convertedAt: { gte: monthStart, lte: monthEnd }
        },
        include: {
          job: {
            select: { budgetMax: true }
          }
        }
      });
      
      const monthlyRevenue = monthlyPurchases.reduce((sum, p) => sum + (p.job.budgetMax || 0), 0);
      
      trends.push({
        month: monthStart.getMonth() + 1,
        year: monthStart.getFullYear(),
        monthName: monthStart.toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' }),
        monthKey,
        newUsers,
        newProviders,
        newJobs,
        leadPurchases,
        convertedLeads,
        revenue: monthlyRevenue,
        conversionRate: leadPurchases > 0 ? ((convertedLeads / leadPurchases) * 100) : 0
      });
    }
    
    return trends;
  } catch (error) {
    console.error('[Platform Stats Service] Error calculating monthly trends:', error);
    throw error;
  }
}

