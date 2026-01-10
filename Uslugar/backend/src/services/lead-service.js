// Lead Management Service - USLUGAR EXCLUSIVE
import { prisma } from '../lib/prisma.js';
import { deductCredits, refundCredits } from './credit-service.js';
import { notifyProvider, notifyClient } from '../lib/notifications.js';
import { isWithinRadius, findClosestTeamLocation, sortJobsByDistance } from '../lib/geo-utils.js';
import Stripe from 'stripe';

// Stripe initialization for refund processing
let stripe;
try {
  const stripeKey = process.env.TEST_STRIPE_SECRET_KEY || '';
  if (stripeKey && stripeKey !== '') {
    stripe = new Stripe(stripeKey);
    console.log('[LEAD-SERVICE] Stripe initialized for refund processing');
  } else {
    console.warn('[LEAD-SERVICE] TEST_STRIPE_SECRET_KEY not set - Stripe refunds will be skipped');
    stripe = null;
  }
} catch (error) {
  console.error('[LEAD-SERVICE] Stripe initialization failed:', error.message);
  stripe = null;
}

/**
 * Kupi ekskluzivan lead
 * @param {String} jobId - ID leada koji se kupuje
 * @param {String} providerId - ID providera koji kupuje
 * @param {Object} options - Opcije za kupovinu
 * @param {String} options.paymentIntentId - Stripe Payment Intent ID (opcionalno, ako se koristi Stripe plaćanje umjesto internih kredita)
 * @returns {Object} Rezultat kupovine
 */
export async function purchaseLead(jobId, providerId, options = {}) {
  const { paymentIntentId } = options;
  // 1. Provjeri postoji li job i je li dostupan
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      user: true,
      category: true
    }
  });

  if (!job) {
    throw new Error('Job not found');
  }

  // PREVENT SELF-ASSIGNMENT: Provider cannot purchase lead from same user/company
  if (job.userId === providerId) {
    throw new Error('Ne možete kupiti lead od samog sebe. Ista tvrtka/obrt ne može sebi dodjeljivati posao.');
  }

  // Additional check: if job creator and provider are same company (by taxId or companyName)
  const jobUser = await prisma.user.findUnique({
    where: { id: job.userId },
    select: { taxId: true, companyName: true, email: true }
  });

  const providerUser = await prisma.user.findUnique({
    where: { id: providerId },
    select: { taxId: true, companyName: true, email: true }
  });

  if (jobUser && providerUser) {
    // Same taxId (same company)
    if (jobUser.taxId && providerUser.taxId && jobUser.taxId === providerUser.taxId) {
      throw new Error('Ne možete kupiti lead od iste tvrtke/obrta. Isti OIB ne može sebi dodjeljivati posao.');
    }
    // Same email (same user account with different role is allowed, but not self-assignment)
    if (jobUser.email === providerUser.email) {
      throw new Error('Ne možete kupiti lead od samog sebe. Ista tvrtka/obrt ne može sebi dodjeljivati posao.');
    }
  }

  if (!job.isExclusive) {
    throw new Error('This job is not exclusive');
  }

  if (job.leadStatus !== 'AVAILABLE') {
    throw new Error(`Lead is not available. Status: ${job.leadStatus}`);
  }

  if (job.assignedProviderId) {
    throw new Error('Lead already assigned to another provider');
  }

  // 3. Provjeri je li provider već kupio ovaj lead
  const existingPurchase = await prisma.leadPurchase.findFirst({
    where: {
      jobId,
      providerId,
      status: { not: 'REFUNDED' }
    }
  });

  if (existingPurchase) {
    throw new Error('You already purchased this lead');
  }

  const leadPrice = job.leadPrice || 10;
  const creditPriceInEUR = 10; // 1 kredit = 10 EUR
  const leadPriceInCents = leadPrice * creditPriceInEUR * 100; // Cijena u centima za Stripe

  let stripePaymentIntent = null;
  let usedCredits = false;
  let creditBalance = null;

  // 4. Provjeri i validiraj Stripe Payment Intent ako je proslijeđen
  if (paymentIntentId && stripe) {
    try {
      // Dohvati Payment Intent iz Stripe-a
      stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Provjeri da je plaćanje uspješno
      if (stripePaymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not completed. Status: ${stripePaymentIntent.status}`);
      }

      // Provjeri da je iznos točan
      if (stripePaymentIntent.amount !== leadPriceInCents) {
        throw new Error(`Payment amount mismatch. Expected: ${leadPriceInCents} cents, Got: ${stripePaymentIntent.amount} cents`);
      }

      // Provjeri da je Payment Intent za ovog providera
      if (stripePaymentIntent.metadata?.providerId !== providerId) {
        throw new Error('Payment Intent does not belong to this provider');
      }

      console.log(`[LEAD] Using Stripe Payment Intent ${paymentIntentId} for lead purchase`);
    } catch (stripeError) {
      console.error('[LEAD] Stripe Payment Intent validation failed:', stripeError.message);
      throw new Error(`Invalid payment: ${stripeError.message}`);
    }
  } else {
    // 5. Ako nema Payment Intent, koristi interne kredite
    try {
      const { balance, transaction } = await deductCredits(
        providerId,
        leadPrice,
        `Lead purchase: ${job.title}`,
        jobId
      );
      usedCredits = true;
      creditBalance = balance;
      console.log(`[LEAD] Using internal credits for lead purchase. Remaining: ${balance}`);
    } catch (creditError) {
      throw creditError; // Insufficient credits ili druga greška
    }
  }

  try {
    // 6. Kreiraj LeadPurchase zapis (BEZ otključavanja kontakta - pay-per-contact)
    const purchase = await prisma.leadPurchase.create({
    data: {
      jobId,
      providerId,
      creditsSpent: leadPrice,
      leadPrice,
      status: 'ACTIVE',
      contactUnlocked: false, // Kontakt nije otključan - provider mora plaćati dodatno
      stripePaymentIntentId: stripePaymentIntent?.id || null // ✅ Sačuvaj Stripe Payment Intent ID ako postoji
    }
  });

    // 7. Ažuriraj Job - dodijeli provideru
    await prisma.job.update({
      where: { id: jobId },
      data: {
        assignedProviderId: providerId,
        leadStatus: 'ASSIGNED'
      }
    });

    // 8. Notify klijenta da je lead kupljen
    await notifyClient(job.userId, {
      title: 'Pružatelj zainteresiran!',
      message: `Pružatelj usluga je zainteresiran za vaš posao: ${job.title}`,
      type: 'NEW_OFFER',
      jobId
    });

    // 9. Automatski kreiraj PUBLIC chat room između klijenta i tvrtke
    try {
      const { createPublicChatRoom } = await import('./public-chat-service.js');
      await createPublicChatRoom(jobId, providerId);
      console.log(`[LEAD] Public chat room automatski kreiran za job ${jobId}`);
    } catch (chatError) {
      console.error('[LEAD] Greška pri kreiranju PUBLIC chat rooma:', chatError);
      // Ne baci grešku - lead je kupljen, chat se može kreirati kasnije
    }

    // 9. Ažuriraj ROI statistiku
    await updateProviderROI(providerId, {
      leadsPurchased: 1,
      creditsSpent: usedCredits ? leadPrice : 0 // Ako se koristi Stripe, ne trošimo interne kredite
    });

    // 10. Ažuriraj add-on usage ako se koriste krediti
    if (usedCredits && leadPrice > 0) {
      try {
        const { trackCreditsConsumption } = await import('./addon-service.js');
        await trackCreditsConsumption(providerId, leadPrice);
      } catch (addonError) {
        console.error('[LEAD] Error tracking add-on usage:', addonError);
        // Ne baci grešku - add-on tracking ne smije blokirati kupovinu leada
      }
    }

    // 11. Ažuriraj add-on usage za REGION/CATEGORY add-one
    try {
      const { trackLeadReceived } = await import('./addon-service.js');
      await trackLeadReceived(providerId, job.city, job.categoryId);
    } catch (addonError) {
      console.error('[LEAD] Error tracking add-on lead received:', addonError);
      // Ne baci grešku - add-on tracking ne smije blokirati kupovinu leada
    }

    // 12. Kreiraj fakturu ako je plaćanje preko Stripe
    if (stripePaymentIntent) {
      try {
        const { createInvoice, generateAndSendInvoice } = await import('./invoice-service.js');
        
        // Izračunaj cijenu u centima (1 kredit = 10 EUR = 1000 cents)
        const creditPriceInEUR = 10;
        const amountInCents = leadPrice * creditPriceInEUR * 100;
        
        const invoice = await createInvoice({
          userId: providerId,
          type: 'LEAD_PURCHASE',
          amount: amountInCents,
          currency: 'EUR',
          leadPurchaseId: purchase.id,
          stripePaymentIntentId: stripePaymentIntent.id
        });

        console.log(`[INVOICE] Created invoice ${invoice.invoiceNumber} for lead purchase`);

        // Automatski generiraj i pošalji fakturu
        try {
          await generateAndSendInvoice(invoice.id);
          console.log(`[INVOICE] Invoice ${invoice.invoiceNumber} generated and sent via email`);
        } catch (invoiceError) {
          console.error('[INVOICE] Error generating/sending invoice:', invoiceError);
          // Ne baci grešku - faktura je kreirana, može se poslati kasnije
        }
      } catch (invoiceError) {
        console.error('[INVOICE] Error creating invoice for lead purchase:', invoiceError);
        // Ne baci grešku - lead je kupljen
      }
    }

    // Track TRIAL engagement - lead purchase
    try {
      const { trackLeadPurchase } = await import('./trial-engagement-service.js');
      await trackLeadPurchase(providerId, jobId);
    } catch (engagementError) {
      console.error('[LEAD] Error tracking TRIAL engagement:', engagementError);
      // Ne baci grešku - engagement tracking ne smije blokirati kupovinu leada
    }
    
    // Pokreni chat-bot za prvi lead
    try {
      const { createFirstLeadChatbot } = await import('./chatbot-service.js');
      await createFirstLeadChatbot(providerId, jobId);
      console.log('[LEAD] Chat-bot started for first lead');
    } catch (chatbotError) {
      console.error('[LEAD] Error starting chat-bot:', chatbotError);
      // Ne baci grešku - chat-bot ne smije blokirati kupovinu leada
    }

    const paymentMethod = stripePaymentIntent ? 'Stripe Payment' : 'Internal Credits';
    console.log(`[LEAD] Provider ${providerId} purchased lead ${jobId} for ${leadPrice} credits (${paymentMethod})`);

    return {
      success: true,
      purchase,
      job: {
        ...job,
        user: {
          ...job.user,
          // Skrij kontakt informacije - pay-per-contact model
          email: undefined,
          phone: undefined
        }
      },
      paymentMethod,
      stripePaymentIntentId: stripePaymentIntent?.id || null,
      creditsRemaining: creditBalance, // Samo ako se koriste kredite (null ako se koristi Stripe)
      message: 'Lead successfully purchased! Unlock contact to see client details.'
    };

  } catch (error) {
    console.error('[LEAD] Purchase failed:', error);
    throw error;
  }
}

/**
 * Označi lead kao kontaktiran
 */
export async function markLeadContacted(purchaseId, providerId) {
  const purchase = await prisma.leadPurchase.findUnique({
    where: { id: purchaseId }
  });

  if (!purchase) {
    throw new Error('Purchase not found');
  }

  if (purchase.providerId !== providerId) {
    throw new Error('Unauthorized');
  }

  if (purchase.status === 'CONTACTED' || purchase.status === 'CONVERTED') {
    return purchase; // Already marked
  }
  
  // Chat-bot trigger - CONTACT_CLIENT
  try {
    const { advanceChatbotStep } = await import('./chatbot-service.js');
    await advanceChatbotStep(providerId, 'CONTACT_CLIENT');
  } catch (chatbotError) {
    console.error('[LEAD] Error advancing chatbot:', chatbotError);
  }

  const now = new Date();
  const updated = await prisma.leadPurchase.update({
    where: { id: purchaseId },
    data: {
      status: 'CONTACTED',
      contactedAt: now
    }
  });

  // REPUTATION: Izračunaj response time
  // Response time = vrijeme između unlock-a kontakta (ili kupovine ako nije unlock-ano) i kontakta
  const referenceTime = updated.contactUnlockedAt || purchase.createdAt;
  const responseTimeMinutes = Math.round((now.getTime() - referenceTime.getTime()) / (1000 * 60)); // u minutama

  // Ažuriraj ProviderProfile - avgResponseTimeMinutes
  if (responseTimeMinutes > 0 && responseTimeMinutes < 10080) { // Valid range: 0-7 dana (sprječava outlier-e)
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: providerId },
      select: { avgResponseTimeMinutes: true, totalResponseTimeTracked: true }
    });

    if (profile) {
      // Rolling average: (stari_prosjek * broj_uzoraka + novi_response) / (broj_uzoraka + 1)
      const newCount = profile.totalResponseTimeTracked + 1;
      const newAvg = ((profile.avgResponseTimeMinutes * profile.totalResponseTimeTracked) + responseTimeMinutes) / newCount;

      await prisma.providerProfile.update({
        where: { userId: providerId },
        data: {
          avgResponseTimeMinutes: newAvg,
          totalResponseTimeTracked: newCount
        }
      });

      console.log(`[REPUTATION] Provider ${providerId} response time: ${responseTimeMinutes}min (avg: ${newAvg.toFixed(1)}min)`);
    }
  }

  // Ažuriraj Job status
  await prisma.job.update({
    where: { id: purchase.jobId },
    data: { leadStatus: 'CONTACTED' }
  });

  // Ažuriraj ROI statistiku
  await updateProviderROI(providerId, {
    leadsContacted: 1
  });

  return updated;
}

/**
 * Označi lead kao konvertiran (uspješno realiziran)
 */
export async function markLeadConverted(purchaseId, providerId, revenue = 0) {
  const purchase = await prisma.leadPurchase.findUnique({
    where: { id: purchaseId }
  });

  if (!purchase) {
    throw new Error('Purchase not found');
  }

  if (purchase.providerId !== providerId) {
    throw new Error('Unauthorized');
  }

  const updated = await prisma.leadPurchase.update({
    where: { id: purchaseId },
    data: {
      status: 'CONVERTED',
      convertedAt: new Date()
    }
  });

  // Ažuriraj Job status
  await prisma.job.update({
    where: { id: purchase.jobId },
    data: {
      leadStatus: 'CONVERTED',
      status: 'IN_PROGRESS'
    }
  });

  // Ažuriraj Subscription - povećaj broj konverzija
  await prisma.subscription.update({
    where: { userId: providerId },
    data: {
      lifetimeLeadsConverted: { increment: 1 }
    }
  });

  // Track TRIAL engagement - lead conversion
  try {
    const { trackLeadConversion } = await import('./trial-engagement-service.js');
    await trackLeadConversion(providerId, purchase.jobId);
  } catch (engagementError) {
    console.error('[LEAD] Error tracking TRIAL engagement conversion:', engagementError);
    // Ne baci grešku - engagement tracking ne smije blokirati konverziju
  }

  // Ažuriraj ROI statistiku
  await updateProviderROI(providerId, {
    leadsConverted: 1,
    revenue
  });

  return updated;
}

/**
 * Zatraži povrat za lead (klijent nije odgovorio)
 * 
 * PRAVNO: Platforma ne provodi povrate sredstava samostalno.
 * Povrati se provode isključivo putem ovlaštene platne institucije
 * (Stripe Payments Europe Ltd.) u skladu s PSD2 pravilima.
 * 
 * Ova funkcija priprema zahtjev za povrat i vraća interne kredite.
 * Ako lead kupnja koristi Stripe Payment Intent, refund se prosljeđuje Stripe-u.
 */
/**
 * Zatraži refund za lead (kreira zahtjev koji čeka admin odobrenje)
 */
export async function requestLeadRefund(purchaseId, providerId, reason = 'Client unresponsive') {
  const purchase = await prisma.leadPurchase.findUnique({
    where: { id: purchaseId },
    include: { job: true }
  });

  if (!purchase) {
    throw new Error('Purchase not found');
  }

  if (purchase.providerId !== providerId) {
    throw new Error('Unauthorized');
  }

  if (purchase.status === 'REFUNDED') {
    throw new Error('Zahtjev za povrat već je obrađen');
  }

  if (purchase.status === 'CONVERTED') {
    throw new Error('Ne može se zatražiti povrat za uspješno konvertirani lead');
  }

  if (purchase.refundRequestStatus === 'PENDING') {
    throw new Error('Zahtjev za povrat već je podnesen i čeka odobrenje');
  }

  if (purchase.refundRequestStatus === 'APPROVED') {
    throw new Error('Refund je već odobren');
  }

  // Kreiraj refund zahtjev (čeka admin odobrenje)
  const updated = await prisma.leadPurchase.update({
    where: { id: purchaseId },
    data: {
      refundRequestStatus: 'PENDING',
      refundRequestedAt: new Date(),
      refundReason: reason
    }
  });

  // Kreiraj notifikaciju za admina
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true }
  });

  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'SYSTEM',
        title: 'Novi zahtjev za refund',
        message: `Provider ${purchase.providerId} je zatražio refund za lead "${purchase.job.title}". Razlog: ${reason}`,
        jobId: purchase.jobId
      }
    });
  }

  console.log(`[REFUND-REQUEST] Refund zahtjev kreiran za purchase ${purchaseId}, čeka admin odobrenje`);

  return updated;
}

/**
 * Procesira refund za lead (poziva admin nakon odobrenja)
 * @param {String} purchaseId - ID purchase-a
 * @param {String} adminId - ID admina koji odobrava
 * @param {Boolean} approved - Da li je odobreno ili odbijeno
 * @param {String} adminNotes - Bilješke admina (opcionalno)
 */
export async function processLeadRefund(purchaseId, adminId, approved = true, adminNotes = null) {
  const purchase = await prisma.leadPurchase.findUnique({
    where: { id: purchaseId },
    include: { job: true, provider: true }
  });

  if (!purchase) {
    throw new Error('Purchase not found');
  }

  if (purchase.refundRequestStatus !== 'PENDING') {
    throw new Error(`Refund zahtjev nije u statusu PENDING (trenutni status: ${purchase.refundRequestStatus || 'N/A'})`);
  }

  if (!approved) {
    // Odbij refund zahtjev
    const updated = await prisma.leadPurchase.update({
      where: { id: purchaseId },
      data: {
        refundRequestStatus: 'REJECTED',
        refundRejectedReason: adminNotes || 'Odbijen od strane admina',
        refundApprovedBy: adminId,
        refundApprovedAt: new Date()
      }
    });

    // Obavijesti providera
    await prisma.notification.create({
      data: {
        userId: purchase.providerId,
        type: 'SYSTEM',
        title: 'Refund zahtjev odbijen',
        message: `Vaš zahtjev za refund za lead "${purchase.job.title}" je odbijen. Razlog: ${adminNotes || 'Nije naveden'}`,
        jobId: purchase.jobId
      }
    });

    console.log(`[REFUND-REJECT] Refund zahtjev odbijen za purchase ${purchaseId}`);
    return updated;
  }

  // Odobri i procesira refund
  // Ovo je stara refundLead logika, ali sada se poziva samo nakon admin odobrenja
  if (purchase.status === 'CONVERTED') {
    throw new Error('Ne može se zatražiti povrat za uspješno konvertirani lead');
  }

  /**
   * STRIPE REFUND API - Pravno: Platforma ne provodi povrate sredstava samostalno.
   * Povrati se provode isključivo putem ovlaštene platne institucije
   * (Stripe Payments Europe Ltd.) u skladu s PSD2 pravilima.
   * 
   * Ova funkcija poziva Stripe Refund API koji provodi refund kroz Stripe infrastrukturu.
   * Platforma samo inicira refund zahtjev, a Stripe provodi stvarni povrat sredstava korisniku.
   */
  let stripeRefund = null;
  if (purchase.stripePaymentIntentId && stripe) {
    try {
      // Pretpostavka: 1 kredit = 10 EUR = 1000 cents
      const creditPriceInEUR = 10;
      const refundAmountInCents = purchase.creditsSpent * creditPriceInEUR * 100;
      
      // Stripe refund API - platforma ne provodi refund, Stripe ga provodi
      stripeRefund = await stripe.refunds.create({
        payment_intent: purchase.stripePaymentIntentId,
        amount: refundAmountInCents,
        reason: 'requested_by_customer',
        metadata: {
          leadId: purchase.jobId,
          purchaseId: purchase.id,
          reason: reason,
          refundedBy: providerId,
          creditsRefunded: purchase.creditsSpent.toString()
        }
      });
      
      console.log(`[STRIPE-REFUND] Refund created: ${stripeRefund.id} for payment intent ${purchase.stripePaymentIntentId}`);
      console.log(`[STRIPE-REFUND] Amount refunded: ${refundAmountInCents} cents (${purchase.creditsSpent} credits)`);
    } catch (stripeError) {
      console.error('[STRIPE-REFUND] Stripe refund failed:', stripeError.message);
      console.warn('[STRIPE-REFUND] Falling back to internal credits refund');
      // Ako Stripe refund ne uspije, nastavi s internim kreditima kao fallback
    }
  } else if (!purchase.stripePaymentIntentId) {
    console.log('[STRIPE-REFUND] No Stripe Payment Intent ID - using internal credits refund only');
  } else if (!stripe) {
    console.warn('[STRIPE-REFUND] Stripe not initialized - using internal credits refund only');
  }

  // Vrati interne kredite (za UX i slučajeve gdje Stripe refund ne uspije ili nije potreban)
  // Ovaj korak se zadržava za kompatibilnost s postojećim sistemom i fallback
  await refundCredits(
    providerId,
    purchase.creditsSpent,
    `Zahtjev za povrat: ${purchase.job.title} - ${reason}`,
    purchase.id
  );

  // Ažuriraj purchase status
  const updated = await prisma.leadPurchase.update({
    where: { id: purchaseId },
    data: {
      status: 'REFUNDED',
      refundedAt: new Date(),
      refundReason: reason,
      stripeRefundId: stripeRefund?.id || null // ✅ Sačuvaj Stripe refund ID (ako je refund kroz Stripe)
    }
  });

  // Ažuriraj Job - oslobodi lead za druge providere
  await prisma.job.update({
    where: { id: purchase.jobId },
    data: {
      assignedProviderId: null,
      leadStatus: 'AVAILABLE'
    }
  });

  if (stripeRefund) {
    console.log(`[LEAD] Zahtjev za povrat obrađen: ${purchase.creditsSpent} kredita vraćeno provideru ${providerId} za lead ${purchase.jobId}`);
    console.log(`[STRIPE-REFUND] Stripe refund ID: ${stripeRefund.id}, Status: ${stripeRefund.status}`);
  } else {
    console.log(`[LEAD] Zahtjev za povrat obrađen (interni krediti): ${purchase.creditsSpent} kredita vraćeno provideru ${providerId} za lead ${purchase.jobId}`);
  }

  return updated;
}

/**
 * Provjerava lead purchase-ove koji su neaktivni 48h i automatski procesira refund
 * Poziva se iz cron joba/scheduler-a
 */
export async function checkInactiveLeadPurchases() {
  console.log('⏰ Provjeravam lead purchase-ove za automatski refund nakon 48h neaktivnosti...');
  
  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48h prije sada
  
  // Pronađi sve purchase-ove koji:
  // 1. Su aktivni ili kontaktirani (ali ne konvertirani)
  // 2. Nisu već refundirani
  // 3. Nemaju već PENDING refund zahtjev (možda je korisnik već zatražio)
  // 4. Su stariji od 48h
  // Filtriranje po kontaktu će biti u memoriji (Prisma ne može lako izračunati createdAt + 48h)
  const allActivePurchases = await prisma.leadPurchase.findMany({
    where: {
      status: {
        in: ['ACTIVE', 'CONTACTED']
      },
      refundRequestStatus: null,
      createdAt: {
        lt: fortyEightHoursAgo
      }
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          category: {
            select: {
              name: true
            }
          }
        }
      },
      provider: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  // Filtriraj u memoriji - purchase je neaktivan ako:
  // - Prošlo je 48h od kupnje (createdAt)
  // - I nije kontaktiran unutar 48h od kupnje (contactedAt je null ILI contactedAt - createdAt > 48h)
  const trulyInactive = allActivePurchases.filter(purchase => {
    const purchaseAge = now.getTime() - purchase.createdAt.getTime();
    const hoursSincePurchase = purchaseAge / (1000 * 60 * 60);
    
    // Mora biti stariji od 48h
    if (hoursSincePurchase < 48) {
      return false;
    }

    // Ako nikad nije kontaktiran, sigurno je neaktivan
    if (!purchase.contactedAt) {
      return true;
    }

    // Ako je kontaktiran, provjeri je li kontakt bio unutar 48h od kupnje
    const contactDelay = purchase.contactedAt.getTime() - purchase.createdAt.getTime();
    const hoursBeforeContact = contactDelay / (1000 * 60 * 60);
    
    // Ako je kontaktiran nakon 48h od kupnje, smatra se neaktivnim (nije kontaktirao unutar 48h)
    // Ako je kontaktiran unutar 48h, ne smatra se neaktivnim
    return hoursBeforeContact >= 48;
  });

  console.log(`   Pronađeno ${trulyInactive.length} neaktivnih purchase-ova (stariji od 48h bez kontakta)`);

  let refundedCount = 0;
  let errorCount = 0;

  for (const purchase of trulyInactive) {
    try {
      console.log(`   🔄 Automatski refund za purchase ${purchase.id} (lead: ${purchase.job.title})`);
      
      // Kreiraj refund zahtjev prvo (da ima isti workflow)
      await prisma.leadPurchase.update({
        where: { id: purchase.id },
        data: {
          refundRequestStatus: 'PENDING',
          refundRequestedAt: new Date(),
          refundReason: 'Automatski refund - 48h neaktivnosti (provider nije kontaktirao klijenta unutar 48h)'
        }
      });

      // Procesiraj refund (odobri i izvrši) - koristimo funkciju iz istog modula
      await processLeadRefund(
        purchase.id,
        'SYSTEM_AUTO_REFUND', // Poseban admin ID za automatske refundove
        true, // Odobri
        'Automatski refund - 48h neaktivnosti'
      );

      // Kreiraj notifikaciju za providera
      await prisma.notification.create({
        data: {
          userId: purchase.providerId,
          type: 'SYSTEM',
          title: 'Automatski refund - 48h neaktivnosti',
          message: `Lead "${purchase.job.title}" je automatski refundiran jer niste kontaktirali klijenta unutar 48h od kupnje. ${purchase.creditsSpent} kredita je vraćeno na vaš račun.`,
          jobId: purchase.jobId
        }
      });

      refundedCount++;
      console.log(`   ✅ Refund procesiran za purchase ${purchase.id}`);
    } catch (error) {
      errorCount++;
      console.error(`   ❌ Greška pri refund-u purchase ${purchase.id}:`, error.message);
      // Nastavi s drugim purchase-ovima
    }
  }

  console.log(`✅ Provjera neaktivnih purchase-ova završena: ${refundedCount} refund-ova procesirano, ${errorCount} grešaka`);
  
  return {
    checked: trulyInactive.length,
    refunded: refundedCount,
    errors: errorCount
  };
}

/**
 * Ažuriraj ROI statistiku providera
 */
async function updateProviderROI(providerId, updates) {
  const roi = await prisma.providerROI.upsert({
    where: { providerId },
    create: {
      providerId,
      totalLeadsPurchased: updates.leadsPurchased || 0,
      totalLeadsContacted: updates.leadsContacted || 0,
      totalLeadsConverted: updates.leadsConverted || 0,
      totalCreditsSpent: updates.creditsSpent || 0,
      totalRevenue: updates.revenue || 0
    },
    update: {
      totalLeadsPurchased: updates.leadsPurchased ? { increment: updates.leadsPurchased } : undefined,
      totalLeadsContacted: updates.leadsContacted ? { increment: updates.leadsContacted } : undefined,
      totalLeadsConverted: updates.leadsConverted ? { increment: updates.leadsConverted } : undefined,
      totalCreditsSpent: updates.creditsSpent ? { increment: updates.creditsSpent } : undefined,
      totalRevenue: updates.revenue ? { increment: updates.revenue } : undefined,
      lastUpdated: new Date()
    }
  });

  // Re-fetch da dobijemo ažurirane vrijednosti
  const updatedRoi = await prisma.providerROI.findUnique({
    where: { providerId }
  });

  // Izračunaj conversion rate i ROI
  let conversionRate = 0;
  if (updatedRoi && updatedRoi.totalLeadsPurchased > 0) {
    conversionRate = (updatedRoi.totalLeadsConverted / updatedRoi.totalLeadsPurchased) * 100;
    const avgCreditPrice = 10; // 10 EUR po kreditu (konfiguriše se)
    const totalInvested = updatedRoi.totalCreditsSpent * avgCreditPrice;
    const roiPercent = totalInvested > 0 ? ((updatedRoi.totalRevenue - totalInvested) / totalInvested) * 100 : 0;
    const avgLeadValue = updatedRoi.totalLeadsConverted > 0 ? updatedRoi.totalRevenue / updatedRoi.totalLeadsConverted : 0;

    await prisma.providerROI.update({
      where: { providerId },
      data: {
        conversionRate,
        roi: roiPercent,
        avgLeadValue
      }
    });

    // REPUTATION: Cache conversionRate u ProviderProfile za brzi pristup
    await prisma.providerProfile.update({
      where: { userId: providerId },
      data: { conversionRate }
    }).catch(() => {
      // Ignoriraj ako profile ne postoji (ne bi trebalo, ali za sigurnost)
      console.warn(`[REPUTATION] ProviderProfile not found for ${providerId}`);
    });
  }

  return updatedRoi || roi;
}

/**
 * Dohvati dostupne leadove za kategoriju providera (GEO-INTELIGENTNO)
 * Filtrira po aktivnim tim lokacijama i radijusu pokrivanja
 */
export async function getAvailableLeads(providerId, filters = {}) {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: providerId },
    include: { 
      categories: true,
      teamLocations: {
        where: { isActive: true } // Samo aktivne lokacije
      }
    }
  });

  if (!provider) {
    throw new Error('Provider profile not found');
  }

  const categoryIds = provider.categories.map(c => c.id);

  if (categoryIds.length === 0) {
    return []; // Nema kategorija = nema leadova
  }

  // Osnovni filter
  const where = {
    isExclusive: true,
    leadStatus: 'AVAILABLE',
    assignedProviderId: null,
    categoryId: { in: categoryIds },
    userId: { not: providerId }, // Ne prikazuj vlastite poslove
    ...filters
  };

  // Dohvati sve leadove koji odgovaraju kategoriji
  let leads = await prisma.job.findMany({
    where,
    include: {
      user: {
        select: {
          fullName: true,
          city: true,
          clientVerification: true,
          email: true, // Treba nam za provjeru unlock statusa
          phone: true // Treba nam za provjeru unlock statusa
        }
      },
      category: true,
      leadPurchases: {
        where: {
          providerId,
          status: { not: 'REFUNDED' }
        },
        select: {
          contactUnlocked: true,
          id: true
        }
      }
    }
  });

  // Ako provider ima aktivne tim lokacije, filtriraj po geo-udaljenosti
  if (provider.teamLocations && provider.teamLocations.length > 0) {
    leads = leads.filter(job => {
      // Provjeri je li job u radijusu bilo koje aktivne lokacije
      return provider.teamLocations.some(location => {
        const result = isWithinRadius(location, job);
        return result.isWithinRadius;
      });
    });

    // Sortiraj po udaljenosti do najbliže lokacije
    leads = sortJobsByDistance(leads, provider.teamLocations);
  } else {
    // Fallback: ako nema tim lokacije, sortiraj po quality score
    leads = leads.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
  }

  // Pay-per-contact: Skrij kontakt informacije (kontakt se otključava nakon kupovine + unlock)
  leads = leads.map(lead => {
    const purchase = lead.leadPurchases?.[0];
    // Kontakt je vidljiv samo ako:
    // - Lead je već kupljen I kontakt je otključan
    // Inače je skriven (prije kupovine ili nakon kupovine bez unlock-a)
    const isContactUnlocked = purchase?.contactUnlocked === true;
    
    return {
      ...lead,
      user: {
        ...lead.user,
        email: isContactUnlocked ? lead.user.email : undefined,
        phone: isContactUnlocked ? lead.user.phone : undefined,
        // Dodaj flag da frontend zna je li kontakt otključan
        contactUnlocked: isContactUnlocked,
        purchaseId: purchase?.id || null
      },
      leadPurchases: undefined // Ne vraćamo leadPurchases u response
    };
  });

  return leads;
}

/**
 * Otključaj kontakt za lead (Pay-per-contact model)
 * Naplaćuje 1 kredit za otključavanje kontakta
 */
export async function unlockContact(jobId, providerId) {
  // 1. Provjeri postoji li job
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          city: true,
          clientVerification: true
        }
      },
      category: true
    }
  });

  if (!job) {
    throw new Error('Job not found');
  }

  // 2. Provjeri postoji li LeadPurchase (provider mora prvo kupiti lead)
  let purchase = await prisma.leadPurchase.findFirst({
    where: {
      jobId,
      providerId,
      status: { not: 'REFUNDED' }
    }
  });

  if (!purchase) {
    throw new Error('You must purchase this lead first before unlocking contact');
  }

  // 3. Provjeri je li kontakt već otključan
  if (purchase.contactUnlocked) {
    // Vrati puni lead s kontaktom
    return {
      success: true,
      purchase,
      job,
      message: 'Contact already unlocked'
    };
  }

  // 4. Naplati 1 kredit za otključavanje kontakta
  const unlockCost = 1; // 1 kredit za otključavanje kontakta
  
  try {
    const { balance, transaction } = await deductCredits(
      providerId,
      unlockCost,
      `Unlock contact: ${job.title}`,
      jobId,
      purchase.id
    );

    // 5. Ažuriraj LeadPurchase - označi kontakt kao otključan
    purchase = await prisma.leadPurchase.update({
      where: { id: purchase.id },
      data: {
        contactUnlocked: true,
        contactUnlockedAt: new Date(),
        creditsSpent: purchase.creditsSpent + unlockCost // Dodaj unlock cost na ukupan iznos
      }
    });

    // 6. Log audit - contact revealed
    try {
      const { logContactRevealed } = await import('./audit-log-service.js');
      await logContactRevealed(
        jobId,
        providerId,
        null, // roomId - može se dodati ako je dostupan
        {
          method: 'PAY_PER_CONTACT',
          unlockCost,
          purchaseId: purchase.id
        },
        null, // IP address - treba se proslijediti iz route handlera
        null  // User agent - treba se proslijediti iz route handlera
      );
    } catch (auditError) {
      console.error('Error logging contact reveal audit:', auditError);
      // Ne bacamo grešku - audit log ne smije blokirati glavnu funkcionalnost
    }

    // 7. Ažuriraj ROI statistiku
    await updateProviderROI(providerId, {
      creditsSpent: unlockCost
    });

    console.log(`[LEAD] Provider ${providerId} unlocked contact for lead ${jobId} (cost: ${unlockCost} credits)`);

    return {
      success: true,
      purchase,
      job,
      creditsRemaining: balance,
      message: 'Contact unlocked successfully! You can now contact the client.'
    };

  } catch (error) {
    console.error('[LEAD] Unlock contact failed:', error);
    throw error;
  }
}

/**
 * Dohvati kupljene leadove providera
 */
export async function getMyLeads(providerId, status = null) {
  const where = {
    providerId,
    ...(status && { status })
  };

  const purchases = await prisma.leadPurchase.findMany({
    where,
    include: {
      job: {
        include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          city: true,
          clientVerification: true
        }
      },
          category: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Pay-per-contact: Skrij kontakt informacije ako nisu otključane
  return purchases.map(purchase => ({
    ...purchase,
    job: {
      ...purchase.job,
      user: {
        ...purchase.job.user,
        email: purchase.contactUnlocked ? purchase.job.user.email : undefined,
        phone: purchase.contactUnlocked ? purchase.job.user.phone : undefined
      }
    }
  }));
}

