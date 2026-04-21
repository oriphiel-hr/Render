import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';
import { notifyNewOffer, notifyAcceptedOffer } from '../lib/notifications.js';
import { deductCredit } from './subscriptions.js';
import Stripe from 'stripe';

const r = Router();

let stripe = null;
try {
  const stripeKey = process.env.TEST_STRIPE_SECRET_KEY || '';
  if (stripeKey) stripe = new Stripe(stripeKey);
} catch (err) {
  console.warn('[OFFERS] Stripe init failed:', err?.message);
}

// create offer
r.post('/', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { jobId, amount, message, isNegotiable = true, estimatedDays } = req.body;
    if (!jobId || !amount) return res.status(400).json({ error: 'Missing fields' });
    const job = await prisma.job.findUnique({ 
      where: { id: jobId },
      include: { user: true }
    });
    if (!job || job.status !== 'OPEN') return res.status(400).json({ error: 'Job is not open' });
    
    // PREVENT SELF-ASSIGNMENT: Provider cannot create offer on their own job
    if (job.userId === req.user.id) {
      return res.status(403).json({ 
        error: 'Ne možete poslati ponudu na vlastiti posao',
        message: 'Ista tvrtka/obrt ne može sebi dodjeljivati posao.'
      });
    }
    
    // Additional check: same company by taxId or email
    const providerUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { taxId: true, email: true }
    });
    
    if (providerUser && job.user) {
      // Same taxId - same company
      if (job.user.taxId && providerUser.taxId && job.user.taxId === providerUser.taxId) {
        return res.status(403).json({ 
          error: 'Ne možete poslati ponudu na posao iste tvrtke',
          message: 'Isti OIB ne može sebi dodjeljivati posao.'
        });
      }
      
      // Same email - same user account (even with different role)
      if (job.user.email && providerUser.email && job.user.email === providerUser.email) {
        return res.status(403).json({ 
          error: 'Ne možete poslati ponudu na vlastiti posao',
          message: 'Ista tvrtka/obrt ne može sebi dodjeljivati posao.'
        });
      }
    }
    
    // Check subscription and credits (use creditsBalance; TRIAL has creditsBalance=8, credits=0)
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });
    
    const unlimited = subscription && (subscription.credits === -1 || subscription.creditsBalance === -1);
    const balance = subscription ? (subscription.creditsBalance ?? subscription.credits ?? 0) : 0;
    if (!subscription || (!unlimited && balance <= 0)) {
      return res.status(403).json({ 
        error: 'Insufficient credits', 
        message: 'Nemate dovoljno kredita za slanje ponude. Nadogradite svoju pretplatu.' 
      });
    }

    // COMPETITIVE mode: enforce max number of offers per job
    if (job.leadMode === 'COMPETITIVE' && job.maxOffers && job.maxOffers > 0) {
      const totalOffers = await prisma.offer.count({ where: { jobId } });
      if (totalOffers >= job.maxOffers) {
        return res.status(409).json({
          error: 'Offer limit reached',
          message: `Ovaj posao je primio maksimalan broj ponuda (${job.maxOffers}).`
        });
      }
    }
    
    const offer = await prisma.offer.create({ 
      data: { 
        jobId, 
        amount: parseInt(amount), 
        message: message || '', 
        userId: req.user.id,
        isNegotiable,
        estimatedDays: estimatedDays ? parseInt(estimatedDays) : null
      } 
    });
    
    // Deduct credit
    await deductCredit(req.user.id);

    // Ekskluzivan lead: slanje ponude (1 kredit) = kupnja leada za tog pružatelja → lead nestane s tržnice, pojavi se u Moji leadovi
    if (job.leadMode !== 'COMPETITIVE' && job.isExclusive && job.leadStatus === 'AVAILABLE' && !job.assignedProviderId) {
      try {
        const existing = await prisma.leadPurchase.findFirst({
          where: { jobId, providerId: req.user.id, status: { not: 'REFUNDED' } }
        });
        if (!existing) {
          const leadPrice = job.leadPrice ?? 10;
          await prisma.leadPurchase.create({
            data: {
              jobId,
              providerId: req.user.id,
              creditsSpent: 1,
              leadPrice,
              status: 'ACTIVE',
              contactUnlocked: false
            }
          });
          await prisma.job.update({
            where: { id: jobId },
            data: { assignedProviderId: req.user.id, leadStatus: 'ASSIGNED' }
          });
          try {
            const { createPublicChatRoom } = await import('../services/public-chat-service.js');
            await createPublicChatRoom(jobId, req.user.id);
          } catch (chatErr) {
            console.error('[OFFER] Public chat for exclusive lead:', chatErr);
          }
        }
      } catch (leadErr) {
        console.error('[OFFER] Link exclusive lead to offer failed:', leadErr);
      }
    }

    // Track TRIAL engagement - offer sent
    try {
      const { trackOfferSent } = await import('../services/trial-engagement-service.js');
      await trackOfferSent(req.user.id, jobId);
    } catch (engagementError) {
      console.error('[OFFER] Error tracking TRIAL engagement:', engagementError);
      // Ne baci grešku - engagement tracking ne smije blokirati slanje ponude
    }
    
    // Chat-bot trigger - SEND_OFFER
    try {
      const { advanceChatbotStep } = await import('../services/chatbot-service.js');
      await advanceChatbotStep(req.user.id, 'SEND_OFFER');
    } catch (chatbotError) {
      console.error('[OFFER] Error advancing chatbot:', chatbotError);
    }
    
    // Pošalji notifikaciju vlasniku posla
    await notifyNewOffer(offer, job);
    
    res.status(201).json(offer);
  } catch (e) { next(e); }
});

// Get my offers (for provider - all offers they've made)
r.get('/my-offers', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const offers = await prisma.offer.findMany({ 
      where: { userId: req.user.id },
      include: { 
        job: {
          include: {
            category: true,
            user: {
              select: { id: true, fullName: true, email: true, phone: true, city: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(offers);
  } catch (e) { next(e); }
});

function calculateOfferQualityScore(offer) {
  const profile = offer?.user?.providerProfile;
  if (!profile) return 0;

  const ratingAvg = Number(profile.ratingAvg || 0);
  const ratingCount = Number(profile.ratingCount || 0);
  const responseMinutes = Number(profile.avgResponseTimeMinutes || 0);
  const conversionRate = Number(profile.conversionRate || 0);
  const kycBoost = profile.kycVerified ? 5 : 0;

  const ratingPart = Math.min(35, (ratingAvg / 5) * 35);
  const ratingCountPart = Math.min(10, Math.log10(ratingCount + 1) * 10);
  const conversionPart = Math.min(35, (conversionRate / 100) * 35);
  const responsePart = responseMinutes > 0 ? Math.max(0, 15 - Math.min(15, responseMinutes / 30)) : 8;

  return Math.round(ratingPart + ratingCountPart + conversionPart + responsePart + kycBoost);
}

// list offers for a job (owner or provider self)
r.get('/job/:jobId', auth(true), async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { leadMode: true, offerWindowEndsAt: true, competitiveOfferWindowHours: true }
    });
    const offers = await prisma.offer.findMany({
      where: { jobId },
      include: {
        user: {
          include: {
            providerProfile: {
              select: {
                ratingAvg: true,
                ratingCount: true,
                avgResponseTimeMinutes: true,
                conversionRate: true,
                kycVerified: true
              }
            }
          }
        }
      }
    });

    const rankedOffers = offers
      .map((offer) => ({
        ...offer,
        qualityScore: calculateOfferQualityScore(offer)
      }))
      .sort((a, b) => {
        if ((job?.leadMode || 'EXCLUSIVE') === 'COMPETITIVE') {
          if (b.qualityScore !== a.qualityScore) return b.qualityScore - a.qualityScore;
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

    res.json({
      offers: rankedOffers,
      leadMode: job?.leadMode || 'EXCLUSIVE',
      offerWindowEndsAt: job?.offerWindowEndsAt || null,
      competitiveOfferWindowHours: job?.competitiveOfferWindowHours || null
    });
  } catch (e) { next(e); }
});

// Accept an offer
r.patch('/:offerId/accept', auth(true), async (req, res, next) => {
  try {
    const { offerId } = req.params;
    
    // Get offer and job
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        job: true,
        user: true
      }
    });
    
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    // Check if user owns the job
    if (offer.job.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (
      offer.job.leadMode === 'COMPETITIVE' &&
      offer.job.offerWindowEndsAt &&
      new Date(offer.job.offerWindowEndsAt).getTime() > Date.now()
    ) {
      return res.status(409).json({
        error: 'Offer window still active',
        message: `Prikupljanje ponuda je aktivno do ${new Date(offer.job.offerWindowEndsAt).toLocaleString('hr-HR')}.`
      });
    }
    
    // PREVENT SELF-ASSIGNMENT: Check if job creator and offer provider are same company (by OIB/email)
    const jobUser = await prisma.user.findUnique({
      where: { id: offer.job.userId },
      select: { id: true, taxId: true, email: true }
    });
    
    const offerProvider = await prisma.user.findUnique({
      where: { id: offer.userId },
      select: { id: true, taxId: true, email: true }
    });
    
    if (jobUser && offerProvider) {
      // Same userId - cannot self-assign
      if (jobUser.id === offerProvider.id) {
        return res.status(403).json({ 
          error: 'Ne možete prihvatiti ponudu od samog sebe',
          message: 'Ista tvrtka/obrt ne može sebi dodjeljivati posao.'
        });
      }
      
      // Same taxId - same company cannot assign to itself
      if (jobUser.taxId && offerProvider.taxId && jobUser.taxId === offerProvider.taxId) {
        return res.status(403).json({ 
          error: 'Ne možete prihvatiti ponudu od iste tvrtke',
          message: `Isti OIB (${jobUser.taxId}) ne može sebi dodjeljivati posao.`
        });
      }
      
      // Same email - same user account (even with different role) cannot self-assign
      if (jobUser.email && offerProvider.email && jobUser.email === offerProvider.email) {
        return res.status(403).json({ 
          error: 'Ne možete prihvatiti ponudu od samog sebe',
          message: 'Ista tvrtka/obrt ne može sebi dodjeljivati posao.'
        });
      }
    }
    
    // Check if job is still open
    if (offer.job.status !== 'OPEN') {
      return res.status(400).json({ error: 'Job is not open' });
    }
    
    // Check if offer is still pending
    if (offer.status !== 'PENDING') {
      return res.status(400).json({ error: 'Offer already processed' });
    }
    
    // Use transaction to update offer and job status
    const result = await prisma.$transaction(async (tx) => {
      // Update offer to ACCEPTED
      const updatedOffer = await tx.offer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED' }
      });
      
      // Reject all other offers for this job
      await tx.offer.updateMany({
        where: {
          jobId: offer.jobId,
          id: { not: offerId },
          status: 'PENDING'
        },
        data: { status: 'REJECTED' }
      });
      
      // Update job status to IN_PROGRESS
      const updatedJob = await tx.job.update({
        where: { id: offer.jobId },
        data: { status: 'IN_PROGRESS' }
      });
      
      return { updatedOffer, updatedJob };
    });
    
    // Send notification to provider
    await notifyAcceptedOffer(offer, offer.job);
    
    // Kontakti su sada automatski otključani jer je ponuda prihvaćena
    // (maskUserContacts funkcija će automatski prikazati kontakte za providera s prihvaćenom ponudom)
    
    res.json({
      success: true,
      offer: result.updatedOffer,
      job: result.updatedJob,
      message: 'Ponuda prihvaćena! Kontakt informacije su sada dostupne.'
    });
  } catch (e) { next(e); }
});

// Create payment checkout for accepted offer
r.post('/:offerId/create-payment-checkout', auth(true), async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment system not configured' });
    }

    const { offerId } = req.params;
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { job: true, user: true }
    });

    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    if (offer.job.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (offer.status !== 'ACCEPTED') {
      return res.status(400).json({ error: 'Only accepted offers can be paid' });
    }

    const amountCents = Math.round(Number(offer.amount || 0) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return res.status(400).json({ error: 'Invalid offer amount for payment' });
    }

    const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://www.uslugar.eu';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Plaćanje ponude: ${offer.job.title}`,
            description: `Pružatelj: ${offer.user.fullName || offer.user.email || offer.userId}`
          },
          unit_amount: amountCents
        },
        quantity: 1
      }],
      success_url: `${frontendUrl}#my-jobs?offerPayment=success&offerId=${offer.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}#my-jobs?offerPayment=cancel&offerId=${offer.id}`,
      metadata: {
        type: 'offer_payment',
        offerId: offer.id,
        jobId: offer.jobId,
        clientUserId: req.user.id,
        providerUserId: offer.userId
      }
    });

    res.json({
      sessionId: session.id,
      checkoutUrl: session.url
    });
  } catch (e) { next(e); }
});

// Reject an offer
r.patch('/:offerId/reject', auth(true), async (req, res, next) => {
  try {
    const { offerId } = req.params;
    
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { job: true }
    });
    
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    if (offer.job.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    if (offer.status !== 'PENDING') {
      return res.status(400).json({ error: 'Offer already processed' });
    }
    
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'REJECTED' }
    });
    
    res.json({ success: true, offer: updatedOffer });
  } catch (e) { next(e); }
});

export default r;