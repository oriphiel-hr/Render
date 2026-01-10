import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';

// Legacy route - deprecated, use /api/payments/create-checkout instead

const r = Router();

/**
 * Provjerava je li korisnik novi (nema plaćene pretplate u povijesti)
 * Korisnik je "novi" ako:
 * 1. Nema Subscription gdje je plan != 'TRIAL' i status != 'EXPIRED' (osim ako je samo TRIAL)
 * 2. Nema Invoice gdje je amount > 0 (plaćene fakture)
 * 3. Nema CreditTransaction tipa SUBSCRIPTION gdje description ne sadrži 'TRIAL'
 * @param {String} userId - ID korisnika
 * @returns {Promise<Boolean>} - true ako je korisnik novi, false ako je već imao plaćenu pretplatu
 */
async function isNewUser(userId) {
  try {
    // Provjeri da li korisnik ima bilo kakve plaćene pretplate (ne TRIAL)
    // 1. Provjeri Subscription tablicu - ako ima plan koji nije TRIAL i nije samo expired TRIAL
    const subscription = await prisma.subscription.findUnique({
      where: { userId: userId }
    });

    if (subscription) {
      // Ako ima subscription i plan nije TRIAL, korisnik nije novi
      if (subscription.plan && subscription.plan !== 'TRIAL') {
        return false;
      }
      
      // Ako ima subscription i plan je TRIAL, provjeri da li je ikad imao nešto drugo
      // Provjeri povijest preko CreditTransaction
    }

    // 2. Provjeri CreditTransaction - da li ima plaćene pretplate (ne TRIAL)
    const paidSubscriptions = await prisma.creditTransaction.findFirst({
      where: {
        userId: userId,
        type: 'SUBSCRIPTION',
        description: {
          not: {
            contains: 'TRIAL'
          }
        }
      }
    });

    // 3. Provjeri Invoice - da li ima plaćene fakture
    let paidInvoices = null;
    try {
      paidInvoices = await prisma.invoice.findFirst({
        where: {
          userId: userId,
          amount: {
            gt: 0
          },
          status: {
            in: ['PAID', 'SENT'] // SENT znači da je faktura poslana (plaćena)
          }
        }
      });
    } catch (invoiceError) {
      // Ako Invoice model ne postoji ili dođe do greške, ignoriraj
      console.warn(`[IS_NEW_USER] Error checking invoices for user ${userId}:`, invoiceError.message);
    }

    // Ako nema plaćenih pretplata, faktura ili subscription-a koji nije TRIAL, korisnik je novi
    return !paidSubscriptions && !paidInvoices;
  } catch (error) {
    console.error(`[IS_NEW_USER] Error checking if user ${userId} is new:`, error);
    // Ako dođe do greške, pretpostavljamo da korisnik nije novi (sigurnija opcija)
    return false;
  }
}

/**
 * Izračunava smanjenu cijenu za nove korisnike
 * Popust: 20% za nove korisnike
 * @param {Number} originalPrice - Originalna cijena
 * @returns {Object} - Objekt s originalnom cijenom, smanjenom cijenom i popustom
 */
function calculateNewUserDiscount(originalPrice) {
  const discountPercent = 20; // 20% popust za nove korisnike
  const discountAmount = (originalPrice * discountPercent) / 100;
  const discountedPrice = originalPrice - discountAmount;
  
  return {
    originalPrice,
    discountedPrice: Math.round(discountedPrice * 100) / 100, // Zaokruži na 2 decimale
    discountPercent,
    discountAmount: Math.round(discountAmount * 100) / 100
  };
}

/**
 * Izračunava smanjenu cijenu za upgrade iz TRIAL-a
 * Popust: 20% za TRIAL korisnike koji upgrade-uju
 * @param {Number} originalPrice - Originalna cijena
 * @returns {Object} - Objekt s originalnom cijenom, smanjenom cijenom i popustom
 */
function calculateTrialUpgradeDiscount(originalPrice) {
  const discountPercent = 20; // 20% popust za upgrade iz TRIAL-a
  const discountAmount = (originalPrice * discountPercent) / 100;
  const discountedPrice = originalPrice - discountAmount;
  
  return {
    originalPrice,
    discountedPrice: Math.round(discountedPrice * 100) / 100, // Zaokruži na 2 decimale
    discountPercent,
    discountAmount: Math.round(discountAmount * 100) / 100
  };
}

/**
 * Provjerava da li je korisnik trenutno na TRIAL planu
 * @param {String} userId - ID korisnika
 * @returns {Promise<Boolean>} - true ako je korisnik na TRIAL planu
 */
async function isTrialUser(userId) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: userId },
      select: {
        plan: true,
        status: true,
        expiresAt: true
      }
    });

    if (!subscription) {
      return false;
    }

    // Korisnik je na TRIAL-u ako je plan TRIAL i status je ACTIVE
    // (ne provjeravamo expiresAt jer korisnik može upgrade-ovati i prije isteka)
    return subscription.plan === 'TRIAL' && subscription.status === 'ACTIVE';
  } catch (error) {
    console.error(`[IS_TRIAL_USER] Error checking if user ${userId} is on TRIAL:`, error);
    return false;
  }
}

// Helper function to get plans from database
// Podržava segmentaciju po regiji i kategoriji
async function getPlansFromDB(filters = {}, userId = null) {
  const { categoryId, region } = filters;
  
  // Build where clause for segmentation
  const where = { isActive: true };
  
  // Ako je specificirana kategorija ili regija, filtriraj pakete
  // null vrijednosti znače "sve kategorije/regije"
  if (categoryId !== undefined) {
    where.categoryId = categoryId || null;
  }
  if (region !== undefined) {
    where.region = region || null;
  }
  
  const dbPlans = await prisma.subscriptionPlan.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { displayOrder: 'asc' }
  });
  
  // Provjeri je li korisnik novi (za smanjene cijene)
  let isUserNew = false;
  let isUserTrial = false;
  if (userId) {
    isUserNew = await isNewUser(userId);
    isUserTrial = await isTrialUser(userId);
  }

  // Transform to legacy format for backward compatibility
  // Za segmentirane pakete, koristimo kombinaciju name + category + region kao ključ
  const plansObj = {};
  dbPlans.forEach(plan => {
    const key = plan.categoryId || plan.region 
      ? `${plan.name}_${plan.categoryId || ''}_${plan.region || ''}` 
      : plan.name;
    
    // Izračunaj smanjenu cijenu za nove korisnike ili TRIAL upgrade (samo za plaćene planove, ne TRIAL)
    let price = plan.price;
    let originalPrice = null;
    let discount = null;
    let trialUpgradeDiscount = null;
    
    // Prioritet: TRIAL upgrade popust ima prednost nad new user popustom
    if (isUserTrial && plan.name !== 'TRIAL' && plan.price > 0) {
      const discountInfo = calculateTrialUpgradeDiscount(plan.price);
      price = discountInfo.discountedPrice;
      originalPrice = discountInfo.originalPrice;
      trialUpgradeDiscount = {
        percent: discountInfo.discountPercent,
        amount: discountInfo.discountAmount,
        originalPrice: discountInfo.originalPrice,
        discountedPrice: discountInfo.discountedPrice
      };
    } else if (isUserNew && plan.name !== 'TRIAL' && plan.price > 0) {
      const discountInfo = calculateNewUserDiscount(plan.price);
      price = discountInfo.discountedPrice;
      originalPrice = discountInfo.originalPrice;
      discount = {
        percent: discountInfo.discountPercent,
        amount: discountInfo.discountAmount,
        originalPrice: discountInfo.originalPrice,
        discountedPrice: discountInfo.discountedPrice
      };
    }
    
    plansObj[key] = {
      id: plan.id,
      name: plan.displayName,
      planName: plan.name,
      price: price,
      originalPrice: originalPrice || plan.price, // Originalna cijena (za prikaz)
      credits: plan.credits,
      creditsPerLead: 1,
      avgLeadPrice: price / plan.credits,
      features: plan.features,
      savings: plan.savings,
      popular: plan.isPopular,
      categoryId: plan.categoryId,
      category: plan.category ? { id: plan.category.id, name: plan.category.name } : null,
      region: plan.region,
      description: plan.description,
      newUserDiscount: discount // Informacije o popustu za nove korisnike
    };
  });
  
  return { dbPlans, plansObj, isUserNew };
}

/**
 * Automatski vraća korisnika na BASIC plan nakon isteka pretplate
 * Zadržava postojeće kredite i povijest leadova, ali deaktivira premium značajke
 * @param {String} userId - ID korisnika
 * @param {String} previousPlan - Prethodni plan (PREMIUM, PRO, itd.)
 * @returns {Promise<Object>} - Ažurirana pretplata
 */
export async function downgradeToBasic(userId, previousPlan = null) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Ako je već BASIC, ne treba downgrade
    if (subscription.plan === 'BASIC') {
      return subscription;
    }

    // Ako je TRIAL i još nije istekao, ne treba downgrade
    if (subscription.plan === 'TRIAL' && subscription.expiresAt && new Date() < subscription.expiresAt) {
      return subscription;
    }

    // Ako je već EXPIRED ili CANCELLED, možda je već downgrade-ano
    // Ali ipak ćemo postaviti na BASIC ako nije već
    
    // Store previous values for history
    const previousPlanValue = previousPlan || subscription.plan;
    const previousStatus = subscription.status;
    const creditsBefore = subscription.creditsBalance || 0;
    const previousExpiresAt = subscription.expiresAt;
    if (subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED') {
      if (subscription.plan !== 'BASIC') {
        // Ako je TRIAL, postavi BASIC kredite (10 kredita za BASIC plan)
        const isTrialDowngrade = subscription.plan === 'TRIAL';
        const basicCredits = 10; // BASIC plan ima 10 kredita mjesečno
        
        // Postavi expiresAt na 1 mjesec od sada za BASIC plan
        const basicExpiresAt = new Date();
        basicExpiresAt.setMonth(basicExpiresAt.getMonth() + 1);
        
        // Ažuriraj na BASIC plan
        const updatedSubscription = await prisma.subscription.update({
          where: { userId },
          data: {
            plan: 'BASIC',
            status: 'ACTIVE', // Aktiviraj BASIC plan
            creditsBalance: isTrialDowngrade ? basicCredits : subscription.creditsBalance, // TRIAL dobiva 10 kredita, ostali zadržavaju postojeće
            expiresAt: basicExpiresAt, // BASIC plan traje 1 mjesec
            // Premium značajke će se automatski deaktivirati jer je plan BASIC
          }
        });

        // Kreiraj notifikaciju
        const notificationMessage = isTrialDowngrade
          ? `Vaš besplatni TRIAL period je istekao. Automatski ste prebačeni na BASIC plan s ${basicCredits} kredita mjesečno. Nastavite koristiti Uslugar EXCLUSIVE s osnovnim funkcionalnostima!`
          : `Vaša pretplata (${previousPlan || subscription.plan}) je istekla. Automatski ste vraćeni na BASIC plan s osnovnim funkcionalnostima. Vaši postojeći krediti i povijest leadova su zadržani.`;
        
        await prisma.notification.create({
          data: {
            title: isTrialDowngrade ? 'TRIAL je istekao - Prebačeni ste na BASIC plan' : 'Pretplata vraćena na BASIC plan',
            message: notificationMessage,
            type: 'SYSTEM',
            userId: userId
          }
        });

        console.log(`[SUBSCRIPTION] User ${userId} downgraded from ${subscription.plan} to BASIC plan${isTrialDowngrade ? ' (TRIAL expired)' : ''}`);

        // Log to subscription history
        try {
          const { logSubscriptionChange } = await import('../services/subscription-history-service.js');
          await logSubscriptionChange({
            subscriptionId: subscription.id,
            userId: userId,
            action: subscription.status === 'EXPIRED' ? 'EXPIRED' : 'DOWNGRADED',
            previousPlan: previousPlanValue,
            newPlan: 'BASIC',
            previousStatus: previousStatus,
            newStatus: 'ACTIVE',
            options: {
              creditsBefore: creditsBefore,
              creditsAfter: updatedSubscription.creditsBalance || 0,
              validFrom: new Date(),
              validUntil: basicExpiresAt,
              previousExpiresAt: previousExpiresAt,
              reason: isTrialDowngrade ? 'TRIAL expired - automatic downgrade to BASIC' : 'Subscription expired - automatic downgrade to BASIC',
              notes: isTrialDowngrade ? 'TRIAL period ended' : 'Subscription period ended'
            }
          });
        } catch (historyError) {
          console.error('[DOWNGRADE] Error logging to history:', historyError);
        }

        return updatedSubscription;
      }
      return subscription;
    }

    // Ako je aktivan, ali je istekao, downgrade na BASIC
    // Ako je TRIAL, postavi BASIC kredite (10 kredita za BASIC plan)
    const isTrialDowngrade = subscription.plan === 'TRIAL';
    const basicCredits = 10; // BASIC plan ima 10 kredita mjesečno
    
    // Postavi expiresAt na 1 mjesec od sada za BASIC plan
    const basicExpiresAt = new Date();
    basicExpiresAt.setMonth(basicExpiresAt.getMonth() + 1);
    
    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        plan: 'BASIC',
        status: 'ACTIVE', // Aktiviraj BASIC plan
        creditsBalance: isTrialDowngrade ? basicCredits : subscription.creditsBalance, // TRIAL dobiva 10 kredita, ostali zadržavaju postojeće
        expiresAt: basicExpiresAt, // BASIC plan traje 1 mjesec
        // Premium značajke će se automatski deaktivirati jer je plan BASIC
      }
    });

    // Kreiraj notifikaciju
    const notificationMessage = isTrialDowngrade
      ? `Vaš besplatni TRIAL period je istekao. Automatski ste prebačeni na BASIC plan s ${basicCredits} kredita mjesečno. Nastavite koristiti Uslugar EXCLUSIVE s osnovnim funkcionalnostima!`
      : `Vaša pretplata (${previousPlan || subscription.plan}) je istekla. Automatski ste vraćeni na BASIC plan s osnovnim funkcionalnostima. Vaši postojeći krediti i povijest leadova su zadržani.`;
    
    await prisma.notification.create({
      data: {
        title: isTrialDowngrade ? 'TRIAL je istekao - Prebačeni ste na BASIC plan' : 'Pretplata vraćena na BASIC plan',
        message: notificationMessage,
        type: 'SYSTEM',
        userId: userId
      }
    });

    console.log(`[SUBSCRIPTION] User ${userId} downgraded from ${subscription.plan} to BASIC plan${isTrialDowngrade ? ' (TRIAL expired)' : ''}`);

    // Log to subscription history
    try {
      const { logSubscriptionChange } = await import('../services/subscription-history-service.js');
      await logSubscriptionChange({
        subscriptionId: subscription.id,
        userId: userId,
        action: 'DOWNGRADED',
        previousPlan: previousPlanValue,
        newPlan: 'BASIC',
        previousStatus: previousStatus,
        newStatus: 'ACTIVE',
        options: {
          creditsBefore: creditsBefore,
          creditsAfter: updatedSubscription.creditsBalance || 0,
          validFrom: new Date(),
          validUntil: basicExpiresAt,
          previousExpiresAt: previousExpiresAt,
          reason: isTrialDowngrade ? 'TRIAL expired - automatic downgrade to BASIC' : 'Subscription expired - automatic downgrade to BASIC',
          notes: isTrialDowngrade ? 'TRIAL period ended' : 'Subscription period ended'
        }
      });
    } catch (historyError) {
      console.error('[DOWNGRADE] Error logging to history:', historyError);
    }

    return updatedSubscription;
  } catch (error) {
    console.error(`[SUBSCRIPTION] Error downgrading user ${userId} to BASIC:`, error);
    throw error;
  }
}

/**
 * GET /api/subscriptions/trial/engagement
 * Dohvati engagement podatke za TRIAL korisnika
 */
r.get('/trial/engagement', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { getTrialEngagement } = await import('../services/trial-engagement-service.js');
    const engagement = await getTrialEngagement(req.user.id);
    
    if (!engagement) {
      return res.json({
        isTrial: false,
        message: 'Niste na TRIAL planu'
      });
    }
    
    res.json({
      isTrial: true,
      engagement: {
        leadsPurchased: engagement.leadsPurchased,
        leadsConverted: engagement.leadsConverted,
        offersSent: engagement.offersSent,
        chatMessagesSent: engagement.chatMessagesSent,
        loginsCount: engagement.loginsCount,
        lastLoginAt: engagement.lastLoginAt,
        totalTimeSpentMinutes: engagement.totalTimeSpentMinutes,
        lastActivityAt: engagement.lastActivityAt,
        subscription: {
          expiresAt: engagement.subscription.expiresAt,
          creditsBalance: engagement.subscription.creditsBalance
        }
      }
    });
  } catch (e) {
    next(e);
  }
});

// Get current subscription
// Dozvoljeno za PROVIDER, ADMIN i USER-e koji su tvrtke/obrti (imaju legalStatusId)
r.get('/me', auth(true, ['PROVIDER', 'ADMIN', 'USER']), async (req, res, next) => {
  try {
    // Provjeri da li USER ima legalStatusId (tvrtka/obrt)
    if (req.user.role === 'USER') {
      const userCheck = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { legalStatusId: true }
      });
      
      if (!userCheck || !userCheck.legalStatusId) {
        return res.status(403).json({ 
          error: 'Nemate pristup',
          message: 'Ovaj endpoint je dostupan samo za tvrtke/obrte ili pružatelje usluga.'
        });
      }
    }
    
    let subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    // Create default subscription if doesn't exist (FREE TRIAL)
    if (!subscription) {
      // TRIAL = maksimalni paket funkcionalnosti: 14 dana, 7-8 leadova, sve Premium features
      const trialExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 dana trial
      const trialCredits = 8; // 7-8 leadova (srednja vrijednost)
      
      subscription = await prisma.subscription.create({
        data: {
          userId: req.user.id,
          plan: 'TRIAL',
          status: 'ACTIVE',
          credits: 0,
          creditsBalance: trialCredits,
          expiresAt: trialExpiresAt
        }
      });
      
      // Automatski kreiraj add-on subscriptions za 2 kategorije i 1 regiju
      try {
        // Dohvati prve 2 aktivne kategorije
        const categories = await prisma.category.findMany({
          where: { isActive: true },
          take: 2,
          orderBy: { name: 'asc' }
        });
        
        // Dohvati prvu regiju (npr. Zagreb)
        const regions = ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar'];
        const trialRegion = regions[0]; // Prva regija
        
        // Kreiraj add-on za svaku kategoriju
        for (const category of categories) {
          const graceUntil = new Date(trialExpiresAt);
          graceUntil.setDate(graceUntil.getDate() + 7);
          
          const categoryAddon = await prisma.addonSubscription.create({
            data: {
              userId: req.user.id,
              type: 'CATEGORY',
              scope: category.id,
              displayName: `TRIAL: ${category.name}`,
              categoryId: category.id,
              price: 0, // Besplatno u trial-u
              validUntil: trialExpiresAt,
              graceUntil: graceUntil,
              autoRenew: false,
              status: 'ACTIVE'
            }
          });
          
          // Kreiraj usage zapis
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
          
          // Kreiraj event log
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
        }
        
        // Kreiraj add-on za regiju
        const graceUntil = new Date(trialExpiresAt);
        graceUntil.setDate(graceUntil.getDate() + 7);
        
        const regionAddon = await prisma.addonSubscription.create({
          data: {
            userId: req.user.id,
            type: 'REGION',
            scope: trialRegion,
            displayName: `TRIAL: ${trialRegion}`,
            price: 0, // Besplatno u trial-u
            validUntil: trialExpiresAt,
            graceUntil: graceUntil,
            autoRenew: false,
            status: 'ACTIVE'
          }
        });
        
        // Kreiraj usage zapis za regiju
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
        
        // Kreiraj event log za regiju
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
        
        console.log(`[TRIAL] Created add-ons for user ${req.user.id}: ${categories.length} categories, 1 region`);
      } catch (error) {
        console.error(`[TRIAL] Error creating add-ons for user ${req.user.id}:`, error);
        // Ne prekidaj kreiranje subscription-a ako add-on kreiranje ne uspije
      }
      
      // Kreiraj TrialEngagement zapis za tracking
      try {
        await prisma.trialEngagement.create({
          data: {
            userId: req.user.id,
            subscriptionId: subscription.id,
            leadsPurchased: 0,
            leadsConverted: 0,
            offersSent: 0,
            chatMessagesSent: 0,
            loginsCount: 0,
            totalTimeSpentMinutes: 0
          }
        });
        console.log(`[TRIAL] Created engagement tracking for user ${req.user.id}`);
      } catch (engagementError) {
        console.error(`[TRIAL] Error creating engagement tracking:`, engagementError);
        // Ne prekidaj kreiranje subscription-a ako engagement kreiranje ne uspije
      }
      
      // Notify o trial-u
      await prisma.notification.create({
        data: {
          title: 'Dobrodošli u Uslugar EXCLUSIVE!',
          message: `Dobili ste ${trialCredits} besplatnih leadova i sve Premium funkcionalnosti na 14 dana da probate našu platformu.`,
          type: 'SYSTEM',
          userId: req.user.id
        }
      });
    }

    // Check if subscription expired - automatski vraćanje na BASIC plan
    if (subscription.expiresAt && new Date() > subscription.expiresAt) {
      const previousPlan = subscription.plan;
      
      // Za sve planove (uključujući TRIAL), automatski vraćanje na BASIC
      // Premium značajke će se automatski deaktivirati jer je plan BASIC
      if (subscription.status === 'ACTIVE' || subscription.status === 'EXPIRED') {
        subscription = await downgradeToBasic(req.user.id, previousPlan);
      }
    }

    const { plansObj } = await getPlansFromDB();
    res.json({
      subscription,
      planDetails: plansObj[subscription.plan] || null
    });
  } catch (e) {
    next(e);
  }
});

// Get all available plans (from database)
// Podržava filtriranje po regiji i kategoriji za segmentni model paketa
// Query params: ?categoryId=xxx&region=Zagreb
// Ako je korisnik autentificiran, vraća smanjene cijene za nove korisnike
// Auth je opcionalan - ne-autentificirani korisnici vide normalne cijene
r.get('/plans', auth(false), async (req, res, next) => {
  try {
    const { categoryId, region } = req.query;
    
    const filters = {};
    if (categoryId !== undefined) {
      filters.categoryId = categoryId === 'null' || categoryId === '' ? null : categoryId;
    }
    if (region !== undefined) {
      filters.region = region === 'null' || region === '' ? null : region;
    }
    
    // Provjeri je li korisnik autentificiran (za smanjene cijene)
    let userId = null;
    if (req.user && req.user.id) {
      userId = req.user.id;
      console.log(`[PLANS] User authenticated: ${userId}`);
    } else {
      console.log(`[PLANS] User not authenticated`);
    }
    
    const { plansObj, dbPlans, isUserNew } = await getPlansFromDB(filters, userId);
    
    console.log(`[PLANS] isUserNew: ${isUserNew}, plans count: ${dbPlans.length}`);
    
    // Transformuj dbPlans da uključe smanjene cijene
    const plansWithDiscounts = dbPlans.map(plan => {
      const key = plan.categoryId || plan.region 
        ? `${plan.name}_${plan.categoryId || ''}_${plan.region || ''}` 
        : plan.name;
      
      const planInfo = plansObj[key];
      
      const result = {
        ...plan,
        price: planInfo.price, // Može biti smanjena cijena
        originalPrice: planInfo.originalPrice, // Originalna cijena
        newUserDiscount: planInfo.newUserDiscount // Informacije o popustu
      };
      
      if (planInfo.newUserDiscount) {
        console.log(`[PLANS] Plan ${plan.name} has discount: ${planInfo.originalPrice}€ -> ${planInfo.price}€`);
      }
      
      return result;
    });
    
    // Return database format with category info and discounts
    res.json(plansWithDiscounts);
  } catch (e) {
    next(e);
  }
});

// Subscribe to a plan (USLUGAR EXCLUSIVE)
r.post('/subscribe', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { plan, paymentIntentId } = req.body;

    const { plansObj } = await getPlansFromDB();
    
    if (!plansObj[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const planDetails = plansObj[plan];
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 mjesec

    // TODO: Integrate payment gateway here (Stripe/CorvusPay)
    // Za sada simuliramo uspješnu uplatu

    // Dohvati postojeću pretplatu
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    const subscription = await prisma.subscription.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        plan,
        status: 'ACTIVE',
        credits: planDetails.credits, // Legacy
        creditsBalance: planDetails.credits, // EXCLUSIVE - novi krediti
        expiresAt
      },
      update: {
        plan,
        status: 'ACTIVE',
        creditsBalance: existingSubscription 
          ? existingSubscription.creditsBalance + planDetails.credits 
          : planDetails.credits, // Dodaj kredite na postojeće
        expiresAt
      }
    });

    // Kreiraj credit transaction
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId: req.user.id,
        type: 'SUBSCRIPTION',
        amount: planDetails.credits,
        balance: subscription.creditsBalance,
        description: `${planDetails.name} subscription - ${planDetails.credits} credits`
      }
    });

    // Create notification (subscription activation)
    await prisma.notification.create({
      data: {
        title: 'Pretplata aktivirana!',
        message: `Uspješno ste se pretplatili na ${planDetails.name} plan! Dodano ${planDetails.credits} kredita.`,
        type: 'SYSTEM',
        userId: req.user.id
      }
    });
    
    // Also send transaction-specific notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'SYSTEM',
        title: 'Krediti iz pretplate',
        message: `Dodano vam je ${planDetails.credits} kredita iz pretplate ${planKey}. Novo stanje: ${subscription.creditsBalance} kredita.`,
      }
    });

    console.log(`[SUBSCRIPTION] User ${req.user.id} subscribed to ${plan}. Credits: ${subscription.creditsBalance}`);

    res.json({
      success: true,
      subscription,
      planDetails,
      message: `Welcome to ${planDetails.name}! You have ${subscription.creditsBalance} credits.`
    });
  } catch (e) {
    next(e);
  }
});

// Cancel subscription
r.post('/cancel', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    // Get current subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!existingSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // If it's a paid subscription (not TRIAL), we should cancel the Stripe subscription too
    // TODO: Integrate Stripe subscription cancellation
    // For now, just mark as cancelled locally
    
    const previousPlan = existingSubscription.plan;
    
    // Ako nije TRIAL, automatski vraćanje na BASIC plan
    if (existingSubscription.plan !== 'TRIAL') {
      const subscription = await downgradeToBasic(req.user.id, previousPlan);
      
      // Ažuriraj cancelledAt
      await prisma.subscription.update({
        where: { userId: req.user.id },
        data: {
          cancelledAt: new Date()
        }
      });

      // Log to subscription history (downgradeToBasic already logs DOWNGRADED, but we also need CANCELLED)
      try {
        const { logSubscriptionChange } = await import('../services/subscription-history-service.js');
        await logSubscriptionChange({
          subscriptionId: existingSubscription.id,
          userId: req.user.id,
          action: 'CANCELLED',
          previousPlan: previousPlan,
          newPlan: 'BASIC',
          previousStatus: existingSubscription.status,
          newStatus: 'ACTIVE', // BASIC plan je aktiviran
          options: {
            creditsBefore: existingSubscription.creditsBalance || 0,
            creditsAfter: subscription.creditsBalance || 0,
            reason: 'User requested cancellation - downgraded to BASIC',
            changedBy: req.user.id,
            ipAddress: req.ip || req.connection?.remoteAddress || null
          }
        });
      } catch (historyError) {
        console.error('[CANCEL SUBSCRIPTION] Error logging to history:', historyError);
      }

      console.log(`[SUBSCRIPTION] User ${req.user.id} cancelled ${previousPlan} subscription, downgraded to BASIC`);

      return res.json({ 
        success: true,
        subscription,
        message: 'Pretplata je uspješno otkazana. Automatski ste vraćeni na BASIC plan s osnovnim funkcionalnostima.' 
      });
    } else {
      // Za TRIAL, samo označi kao CANCELLED
      const subscription = await prisma.subscription.update({
        where: { userId: req.user.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });

      // Log to subscription history
      try {
        const { logSubscriptionChange } = await import('../services/subscription-history-service.js');
        await logSubscriptionChange({
          subscriptionId: existingSubscription.id,
          userId: req.user.id,
          action: 'CANCELLED',
          previousPlan: existingSubscription.plan,
          newPlan: existingSubscription.plan, // Plan ostaje isti, samo se status mijenja
          previousStatus: existingSubscription.status,
          newStatus: 'CANCELLED',
          options: {
            creditsBefore: existingSubscription.creditsBalance || 0,
            creditsAfter: subscription.creditsBalance || 0,
            reason: 'User requested cancellation (TRIAL)',
            changedBy: req.user.id,
            ipAddress: req.ip || req.connection?.remoteAddress || null
          }
        });
      } catch (historyError) {
        console.error('[CANCEL SUBSCRIPTION] Error logging to history:', historyError);
      }

      // Create notification
      await prisma.notification.create({
        data: {
          title: 'Pretplata otkazana',
          message: 'Vaša pretplata je otkazana. Zadržavate postojeće kredite do kraja periode.',
          type: 'SYSTEM',
          userId: req.user.id
        }
      });

      console.log(`[SUBSCRIPTION] User ${req.user.id} cancelled TRIAL subscription`);

      return res.json({ 
        success: true,
        subscription,
        message: 'Pretplata je uspješno otkazana.' 
      });
    }
  } catch (e) {
    next(e);
  }
});

// Check if user can send offer (has credits)
r.get('/can-send-offer', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      return res.json({ canSend: true, credits: PLANS.BASIC.credits });
    }

    // Check if expired
    if (subscription.expiresAt && new Date() > subscription.expiresAt) {
      await prisma.subscription.update({
        where: { userId: req.user.id },
        data: {
          status: 'EXPIRED',
          plan: 'BASIC',
          credits: PLANS.BASIC.credits
        }
      });
      return res.json({ canSend: PLANS.BASIC.credits > 0, credits: PLANS.BASIC.credits });
    }

    // PRO plan has unlimited credits (-1)
    if (subscription.credits === -1) {
      return res.json({ canSend: true, credits: -1, unlimited: true });
    }

    res.json({
      canSend: subscription.credits > 0,
      credits: subscription.credits
    });
  } catch (e) {
    next(e);
  }
});

// Deduct credit (called when offer is sent)
export const deductCredit = async (userId) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  });

  if (!subscription || subscription.credits === -1) {
    return; // No subscription or unlimited credits
  }

  if (subscription.credits > 0) {
    await prisma.subscription.update({
      where: { userId },
      data: {
        credits: subscription.credits - 1
      }
    });
  }
};

/**
 * Provjerava istekle pretplate i automatski vraća na BASIC plan
 * Ova funkcija se može pozivati periodično (npr. svaki sat) kroz cron job ili scheduled task
 * @returns {Promise<Object>} - Statistika obrade
 */
export async function checkAndDowngradeExpiredSubscriptions() {
  try {
    const now = new Date();
    
    // Prvo provjeri i pošalji email-ove za istekle TRIAL pretplate (prije downgrade-a)
    try {
      const { checkExpiredTrials } = await import('../lib/subscription-reminder.js');
      await checkExpiredTrials();
    } catch (trialEmailError) {
      console.error('[SUBSCRIPTION] Error checking expired TRIAL emails:', trialEmailError);
      // Ne baci grešku - email ne smije blokirati downgrade
    }
    
    // Pronađi sve pretplate koje su istekle, ali još nisu downgrade-ane na BASIC
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        expiresAt: {
          lt: now // Istečeno prije sada
        },
        status: {
          in: ['ACTIVE', 'EXPIRED'] // Aktivan ili već označen kao EXPIRED
        },
        plan: {
          not: 'BASIC' // Nije već BASIC
        }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    let downgradedCount = 0;
    let skippedCount = 0;

    for (const subscription of expiredSubscriptions) {
      try {
        // Downgrade na BASIC (uključujući TRIAL)
        await downgradeToBasic(subscription.userId, subscription.plan);
        downgradedCount++;
        
        console.log(`[SUBSCRIPTION] Auto-downgraded user ${subscription.userId} from ${subscription.plan} to BASIC`);
      } catch (error) {
        console.error(`[SUBSCRIPTION] Error downgrading user ${subscription.userId}:`, error);
        skippedCount++;
      }
    }

    console.log(`[SUBSCRIPTION] Checked expired subscriptions: ${downgradedCount} downgraded, ${skippedCount} skipped (errors)`);

    return {
      checked: expiredSubscriptions.length,
      downgraded: downgradedCount,
      skipped: skippedCount
    };
  } catch (error) {
    console.error('[SUBSCRIPTION] Error checking expired subscriptions:', error);
    throw error;
  }
}

/**
 * Get subscription history for current user
 * GET /api/subscriptions/history
 */
r.get('/history', auth(true, ['PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const userId = req.user.role === 'ADMIN' && req.query.userId ? req.query.userId : req.user.id;
    
    const {
      limit = 50,
      offset = 0,
      action = null,
      plan = null,
      startDate = null,
      endDate = null
    } = req.query;

    const { getSubscriptionHistory } = await import('../services/subscription-history-service.js');
    
    const history = await getSubscriptionHistory(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      action: action || null,
      plan: plan || null,
      startDate: startDate || null,
      endDate: endDate || null
    });

    res.json({
      success: true,
      history,
      total: history.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('[SUBSCRIPTION HISTORY] Error fetching history:', error);
    next(error);
  }
});

export default r;

