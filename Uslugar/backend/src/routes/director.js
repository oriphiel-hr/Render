import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';
import {
  addLeadToCompanyQueue,
  assignLeadToTeamMember,
  autoAssignLead,
  getCompanyLeadQueue,
  declineCompanyLead
} from '../services/company-lead-distribution.js';
import { getDirectorBillingSummary } from '../services/billing-adjustment-service.js';
import {
  getOwnedFeatures,
  checkOwnership,
  determineDelta,
  getAvailableFeatures
} from '../services/feature-ownership-service.js';
import {
  purchaseAddon,
  getAddons,
  getAddon,
  renewAddon,
  cancelAddon,
  getAvailableAddons,
  checkAddonStatus,
  updateAddonUsage
} from '../services/addon-service.js';

const r = Router();

/**
 * Helper funkcija za provjeru da li je korisnik direktor
 */
async function isDirector(userId) {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { isDirector: true }
  });
  return providerProfile?.isDirector || false;
}

/**
 * Helper funkcija za dohvat direktora i njegovih tim članova
 */
async function getDirectorWithTeam(userId) {
  const director = await prisma.providerProfile.findFirst({
    where: {
      userId,
      isDirector: true
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true
        }
      },
      teamMembers: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          }
        }
      }
    }
  });
  return director;
}

/**
 * GET /api/director/team
 * Dohvati sve članove tima (samo za direktora)
 */
r.get('/team', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti ovom endpointu.'
      });
    }

    res.json({
      director: {
        id: director.id,
        userId: director.userId,
        fullName: director.user.fullName,
        email: director.user.email,
        companyName: director.companyName
      },
      teamMembers: director.teamMembers.map(member => ({
        id: member.id,
        userId: member.userId,
        fullName: member.user.fullName,
        email: member.user.email,
        phone: member.user.phone,
        isAvailable: member.isAvailable,
        categories: member.categories.map(c => c.name)
      }))
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/director/team/add
 * Dodaj novog člana tima (samo za direktora)
 */
r.post('/team/add', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može dodavati članove tima.'
      });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'userId je obavezan'
      });
    }

    // Provjeri da li korisnik postoji i ima PROVIDER profil
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        providerProfile: true
      }
    });

    if (!user || user.role !== 'PROVIDER') {
      return res.status(400).json({
        error: 'Korisnik mora biti PROVIDER'
      });
    }

    if (!user.providerProfile) {
      return res.status(400).json({
        error: 'Korisnik mora imati ProviderProfile'
      });
    }

    // Provjeri da li već postoji u timu
    if (user.providerProfile.companyId === director.id) {
      return res.status(400).json({
        error: 'Korisnik je već član tima'
      });
    }

    // Dodaj u tim
    await prisma.providerProfile.update({
      where: { id: user.providerProfile.id },
      data: {
        companyId: director.id
      }
    });

    res.json({
      success: true,
      message: 'Član tima uspješno dodan'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/director/team/:memberId
 * Ukloni člana iz tima (samo za direktora)
 */
r.delete('/team/:memberId', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može uklanjati članove tima.'
      });
    }

    const { memberId } = req.params;

    const member = await prisma.providerProfile.findUnique({
      where: { id: memberId }
    });

    if (!member || member.companyId !== director.id) {
      return res.status(404).json({
        error: 'Član tima nije pronađen'
      });
    }

    // Ukloni iz tima
    await prisma.providerProfile.update({
      where: { id: memberId },
      data: {
        companyId: null
      }
    });

    res.json({
      success: true,
      message: 'Član tima uspješno uklonjen'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/director/finances
 * Dohvati financijske podatke tvrtke (samo za direktora)
 */
r.get('/finances', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti financijskim podacima.'
      });
    }

    // Dohvati subscription direktora
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    // Dohvati fakture direktora i tim članova
    const directorInvoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const teamMemberIds = director.teamMembers.map(m => m.userId);
    const teamInvoices = teamMemberIds.length > 0
      ? await prisma.invoice.findMany({
          where: { userId: { in: teamMemberIds } },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      : [];

    // Dohvati lead purchases direktora i tim članova
    const directorLeads = await prisma.leadPurchase.findMany({
      where: { providerId: req.user.id },
      include: {
        job: {
          select: {
            title: true,
            budgetMax: true,
            category: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const teamLeads = teamMemberIds.length > 0
      ? await prisma.leadPurchase.findMany({
          where: { providerId: { in: teamMemberIds } },
          include: {
            job: {
              select: {
                title: true,
                budgetMax: true,
                category: { select: { name: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      : [];

    // Izračunaj ukupne troškove
    const totalInvoices = [...directorInvoices, ...teamInvoices]
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Izračunaj ukupne leadove
    const totalLeads = directorLeads.length + teamLeads.length;

    res.json({
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        creditsBalance: subscription.creditsBalance,
        lifetimeCreditsUsed: subscription.lifetimeCreditsUsed,
        expiresAt: subscription.expiresAt
      } : null,
      invoices: {
        director: directorInvoices,
        team: teamInvoices,
        total: totalInvoices / 100 // Pretvori iz centi u EUR
      },
      leads: {
        director: directorLeads,
        team: teamLeads,
        total: totalLeads
      },
      summary: {
        totalSpent: totalInvoices / 100,
        totalLeads: totalLeads,
        teamSize: director.teamMembers.length
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/director/billing/summary
 * Dinamički billing sažetak za direktora (billing planovi + korekcije)
 */
r.get('/billing/summary', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);

    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti billing sažetku.'
      });
    }

    const summary = await getDirectorBillingSummary(req.user.id);

    res.json(summary);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/director/decisions
 * Dohvati ključne odluke koje čekaju na odobrenje (samo za direktora)
 */
r.get('/decisions', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti odlukama.'
      });
    }

    const teamMemberIds = director.teamMembers.map(m => m.userId);

    // Dohvati ponude koje čekaju na odobrenje (od tim članova)
    const pendingOffers = teamMemberIds.length > 0
      ? await prisma.offer.findMany({
          where: {
            userId: { in: teamMemberIds },
            status: 'PENDING'
          },
          include: {
            job: {
              select: {
                title: true,
                budgetMax: true,
                category: { select: { name: true } }
              }
            },
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      : [];

    // Dohvati leadove koje tim članovi trebaju odobriti
    const pendingLeads = teamMemberIds.length > 0
      ? await prisma.leadPurchase.findMany({
          where: {
            providerId: { in: teamMemberIds },
            status: 'ACTIVE'
          },
          include: {
            job: {
              select: {
                title: true,
                budgetMax: true,
                category: { select: { name: true } }
              }
            },
            provider: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      : [];

    res.json({
      pendingOffers,
      pendingLeads,
      summary: {
        pendingOffersCount: pendingOffers.length,
        pendingLeadsCount: pendingLeads.length
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/director/become-director
 * Postani direktor (samo za PROVIDER-e s companyName)
 */
r.post('/become-director', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!providerProfile) {
      return res.status(404).json({
        error: 'ProviderProfile nije pronađen'
      });
    }

    if (!providerProfile.companyName) {
      return res.status(400).json({
        error: 'Morate imati companyName da biste postali direktor'
      });
    }

    // Postavi kao direktora
    await prisma.providerProfile.update({
      where: { id: providerProfile.id },
      data: {
        isDirector: true
      }
    });

    res.json({
      success: true,
      message: 'Sada ste direktor tvrtke'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/director/lead-queue
 * Dohvati sve leadove u internom queueu tvrtke (samo za direktora)
 */
r.get('/lead-queue', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti internom queueu.'
      });
    }

    const queue = await getCompanyLeadQueue(director.id);

    res.json({
      queue,
      stats: {
        pending: queue.filter(q => q.status === 'PENDING').length,
        assigned: queue.filter(q => q.status === 'ASSIGNED').length,
        inProgress: queue.filter(q => q.status === 'IN_PROGRESS').length,
        completed: queue.filter(q => q.status === 'COMPLETED').length
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/director/lead-queue/:queueId/assign
 * Ručna dodjela leada tim članu (samo za direktora)
 */
r.post('/lead-queue/:queueId/assign', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može dodijeliti lead.'
      });
    }

    const { queueId } = req.params;
    const { teamMemberId } = req.body;

    if (!teamMemberId) {
      return res.status(400).json({
        error: 'teamMemberId je obavezan'
      });
    }

    const result = await assignLeadToTeamMember(queueId, teamMemberId, director.id);

    res.json({
      success: true,
      message: 'Lead uspješno dodijeljen tim članu',
      queueEntry: result
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/director/lead-queue/:queueId/auto-assign
 * Automatska dodjela leada najboljem tim članu (samo za direktora)
 */
r.post('/lead-queue/:queueId/auto-assign', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može koristiti auto-assign.'
      });
    }

    const { queueId } = req.params;

    const result = await autoAssignLead(queueId, director.id);

    res.json({
      success: true,
      message: 'Lead automatski dodijeljen najboljem tim članu',
      queueEntry: result
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/director/lead-queue/:queueId/decline
 * Odbij lead (samo za direktora)
 */
r.post('/lead-queue/:queueId/decline', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može odbiti lead.'
      });
    }

    const { queueId } = req.params;
    const { reason } = req.body;

    const result = await declineCompanyLead(queueId, director.id, reason);

    res.json({
      success: true,
      message: 'Lead odbijen',
      queueEntry: result
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/director/lead-queue/add
 * Dodaj lead u interni queue tvrtke (samo za direktora)
 */
r.post('/lead-queue/add', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može dodati lead u interni queue.'
      });
    }

    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        error: 'jobId je obavezan'
      });
    }

    const result = await addLeadToCompanyQueue(jobId, director.id);

    res.json({
      success: true,
      message: 'Lead dodan u interni queue',
      queueEntry: result
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/director/features/owned
 * Vraća listu svih funkcionalnosti u vlasništvu tvrtke
 */
r.get('/features/owned', auth(true), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti ovom endpointu.'
      });
    }

    const features = await getOwnedFeatures(director.user.id);
    res.json({ success: true, features });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/director/features/check
 * Provjerava vlasništvo određenih funkcionalnosti
 */
r.post('/features/check', auth(true), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti ovom endpointu.'
      });
    }

    const { featureKeys } = req.body;
    if (!featureKeys || !Array.isArray(featureKeys)) {
      return res.status(400).json({
        error: 'featureKeys je obavezan i mora biti array'
      });
    }

    const result = await checkOwnership(director.user.id, featureKeys);
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/director/features/available
 * Vraća katalog svih dostupnih funkcionalnosti s owned statusom
 */
r.get('/features/available', auth(true), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti ovom endpointu.'
      });
    }

    const features = await getAvailableFeatures(director.user.id);
    res.json({ success: true, features });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/director/plans/quote
 * Izračunava doplatu za novi paket uzimajući u obzir već otkupljene funkcionalnosti
 */
r.post('/plans/quote', auth(true), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti ovom endpointu.'
      });
    }

    const { planCode, requestedFeatures, featurePrices } = req.body;

    if (!planCode && !requestedFeatures) {
      return res.status(400).json({
        error: 'planCode ili requestedFeatures je obavezan'
      });
    }

    // Ako je planCode, dohvati feature-e iz plana
    let featuresToCheck = requestedFeatures;
    if (planCode && !requestedFeatures) {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { name: planCode }
      });
      if (!plan) {
        return res.status(400).json({
          error: 'Plan ne postoji'
        });
      }
      // Pretpostavljamo da plan ima features array ili možemo koristiti planCode kao feature key
      featuresToCheck = plan.features || [`PLAN_${planCode}`];
    }

    const delta = await determineDelta(director.user.id, featuresToCheck, featurePrices || {});

    res.json({
      success: true,
      planCode: planCode || null,
      requestedFeatures: featuresToCheck,
      ...delta
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/director/addons/quote
 * Izračunava doplatu za novi add-on uzimajući u obzir već otkupljene funkcionalnosti
 */
r.post('/addons/quote', auth(true), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti ovom endpointu.'
      });
    }

    const { addonType, addonScope, requestedFeatures, featurePrices } = req.body;

    if (!requestedFeatures || !Array.isArray(requestedFeatures)) {
      return res.status(400).json({
        error: 'requestedFeatures je obavezan i mora biti array'
      });
    }

    const delta = await determineDelta(director.user.id, requestedFeatures, featurePrices || {});

    res.json({
      success: true,
      addonType,
      addonScope,
      requestedFeatures,
      ...delta
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/director/addons
 * Dohvati sve add-one korisnika
 */
r.get('/addons', auth(true), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti ovom endpointu.'
      });
    }

    const { status, type } = req.query;
    const addons = await getAddons(director.user.id, { status, type });

    res.json({
      success: true,
      addons
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/director/addons/available
 * Dohvati dostupne add-one (cjenik)
 */
r.get('/addons/available', auth(true), async (req, res, next) => {
  try {
    const available = await getAvailableAddons();
    res.json({
      success: true,
      addons: available
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/director/addons/:id
 * Dohvati detalje određenog add-ona
 */
r.get('/addons/:id', auth(true), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti ovom endpointu.'
      });
    }

    const addon = await getAddon(req.params.id, director.user.id);
    res.json({
      success: true,
      addon
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/director/addons/purchase
 * Kupi novi add-on paket
 */
r.post('/addons/purchase', auth(true), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti ovom endpointu.'
      });
    }

    const { type, scope, displayName, categoryId, creditsAmount, price, validUntil, autoRenew } = req.body;

    if (!type || !scope || !displayName || !price || !validUntil) {
      return res.status(400).json({
        error: 'Missing required fields: type, scope, displayName, price, validUntil'
      });
    }

    const addon = await purchaseAddon(director.user.id, {
      type,
      scope,
      displayName,
      categoryId,
      creditsAmount,
      price,
      validUntil: new Date(validUntil),
      autoRenew
    });

    res.status(201).json({
      success: true,
      addon,
      message: 'Add-on paket uspješno kupljen'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/director/addons/:id/renew
 * Obnovi add-on paket
 */
r.post('/addons/:id/renew', auth(true), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti ovom endpointu.'
      });
    }

    const { validUntil, autoRenew } = req.body;

    if (!validUntil) {
      return res.status(400).json({
        error: 'validUntil is required'
      });
    }

    const addon = await renewAddon(req.params.id, director.user.id, {
      validUntil: new Date(validUntil),
      autoRenew
    });

    res.json({
      success: true,
      addon,
      message: 'Add-on paket uspješno obnovljen'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/director/addons/:id/cancel
 * Otkaži add-on paket
 */
r.post('/addons/:id/cancel', auth(true), async (req, res, next) => {
  try {
    const director = await getDirectorWithTeam(req.user.id);
    if (!director) {
      return res.status(403).json({
        error: 'Nemate pristup',
        message: 'Samo direktor može pristupiti ovom endpointu.'
      });
    }

    const { reason } = req.body;

    const addon = await cancelAddon(req.params.id, director.user.id, reason || 'User cancelled');

    res.json({
      success: true,
      addon,
      message: 'Add-on paket uspješno otkazan'
    });
  } catch (e) {
    next(e);
  }
});

export default r;

