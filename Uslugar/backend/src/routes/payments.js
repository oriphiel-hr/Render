// Stripe Payment Integration - HR Market
// Updated: 2025-10-26 - Deployed to production
import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';
import { determineDelta } from '../services/feature-ownership-service.js';
import { sendPaymentConfirmationEmail } from '../lib/email.js';

const r = Router();

// Initialize Stripe with error handling
let stripe;
try {
  const stripeKey = process.env.TEST_STRIPE_SECRET_KEY || '';
  if (stripeKey && stripeKey !== '') {
    stripe = new Stripe(stripeKey);
    console.log('[PAYMENTS] Stripe initialized successfully');
  } else {
    console.warn('[PAYMENTS] TEST_STRIPE_SECRET_KEY is empty or not set');
    stripe = null;
  }
} catch (error) {
  console.error('[PAYMENTS] Stripe initialization failed:', error.message);
  stripe = null;
}

// Get publishable key for frontend
r.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.TEST_STRIPE_PUBLISHABLE_KEY || '',
    enabled: !!process.env.TEST_STRIPE_SECRET_KEY
  });
});

/**
 * Create Stripe Checkout Session
 * POST /api/payments/create-checkout
 */
r.post('/create-checkout', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    console.log('[CREATE-CHECKOUT] Endpoint called');
    console.log('[CREATE-CHECKOUT] req.user:', JSON.stringify(req.user));
    console.log('[CREATE-CHECKOUT] req.user exists:', req.user ? 'YES' : 'NO');
    
    // Check if Stripe is configured
    if (!stripe || !process.env.TEST_STRIPE_SECRET_KEY) {
      console.error('[PAYMENTS] Stripe not configured - TEST_STRIPE_SECRET_KEY missing');
      return res.status(503).json({ 
        error: 'Payment system not configured',
        message: 'Stripe API keys are missing. Please contact support.'
      });
    }

    const { plan } = req.body;
    
    if (!plan) {
      return res.status(400).json({ error: 'Plan is required' });
    }

    // Get plan details from database
    const planDetails = await prisma.subscriptionPlan.findUnique({
      where: { name: plan }
    });

    if (!planDetails) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Provjeri je li korisnik novi ili na TRIAL-u (za popust)
    // Također provjeri da li ima aktivnu plaćenu pretplatu za prorated billing
    let adjustedPrice = planDetails.price;
    let isUserNew = false;
    let isUserTrial = false;
    let discountApplied = false;
    let discountType = null; // 'new_user', 'trial_upgrade', ili 'prorated'
    let proratedInfo = null; // Informacije o prorated billing-u
    
    try {
      // Provjeri da li korisnik ima bilo kakve plaćene pretplate (ne TRIAL)
      const paidSubscriptions = await prisma.creditTransaction.findFirst({
        where: {
          userId: req.user.id,
          type: 'SUBSCRIPTION',
          description: {
            not: {
              contains: 'TRIAL'
            }
          }
        }
      });
      
      isUserNew = !paidSubscriptions;
      
      // Provjeri trenutnu pretplatu
      const subscription = await prisma.subscription.findUnique({
        where: { userId: req.user.id },
        select: {
          plan: true,
          status: true,
          expiresAt: true
        }
      });
      
      // Korisnik je na TRIAL-u ako je plan TRIAL i (ACTIVE ili EXPIRED u zadnja 7 dana)
      const isTrialPlan = subscription?.plan === 'TRIAL';
      const isTrialActive = subscription?.status === 'ACTIVE';
      const isTrialRecentlyExpired = subscription?.status === 'EXPIRED' && 
        subscription?.expiresAt && 
        new Date(subscription.expiresAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Istečeno u zadnja 7 dana
      
      isUserTrial = isTrialPlan && (isTrialActive || isTrialRecentlyExpired);
      
      // Provjeri da li korisnik ima aktivnu plaćenu pretplatu (za prorated billing)
      const hasActivePaidSubscription = subscription && 
        subscription.plan !== 'TRIAL' && 
        subscription.plan !== 'BASIC' && 
        subscription.status === 'ACTIVE' &&
        subscription.expiresAt &&
        new Date(subscription.expiresAt) > new Date();
      
      if (hasActivePaidSubscription && subscription.plan !== plan) {
        // Izračunaj prorated billing
        const currentPlanDetails = await prisma.subscriptionPlan.findUnique({
          where: { name: subscription.plan }
        });
        
        if (currentPlanDetails) {
          const now = new Date();
          const expiresAt = new Date(subscription.expiresAt);
          const daysRemaining = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))); // Preostali dani
          const totalDaysInPeriod = 30; // Mjesečna pretplata = 30 dana
          
          // Dnevna cijena trenutnog i novog plana
          const currentDailyPrice = currentPlanDetails.price / totalDaysInPeriod;
          const newDailyPrice = planDetails.price / totalDaysInPeriod;
          
          // Razlika u cijeni
          const priceDifference = newDailyPrice - currentDailyPrice;
          
          // Prorated cijena (samo za upgrade - ako je downgrade, cijena je 0 ili credit)
          if (priceDifference > 0) {
            // Upgrade - naplati razliku proporcionalno preostalim danima
            const proratedAmount = priceDifference * daysRemaining;
            adjustedPrice = Math.max(0, Math.round(proratedAmount * 100) / 100); // Zaokruži na 2 decimale, minimum 0
            
            proratedInfo = {
              currentPlan: subscription.plan,
              newPlan: plan,
              currentPlanPrice: currentPlanDetails.price,
              newPlanPrice: planDetails.price,
              daysRemaining,
              totalDaysInPeriod,
              proratedAmount: adjustedPrice,
              isUpgrade: true
            };
            
            discountApplied = true;
            discountType = 'prorated';
            
            console.log(`[CHECKOUT] Prorated billing applied: ${subscription.plan} -> ${plan}`);
            console.log(`[CHECKOUT] Days remaining: ${daysRemaining}, Prorated amount: ${adjustedPrice}€`);
          } else if (priceDifference < 0) {
            // Downgrade - ne naplaćujemo, ali možemo dati credit za preostale dane
            adjustedPrice = 0;
            
            proratedInfo = {
              currentPlan: subscription.plan,
              newPlan: plan,
              currentPlanPrice: currentPlanDetails.price,
              newPlanPrice: planDetails.price,
              daysRemaining,
              totalDaysInPeriod,
              proratedAmount: 0,
              isUpgrade: false,
              creditAmount: Math.abs(priceDifference * daysRemaining) // Credit za preostale dane
            };
            
            discountApplied = true;
            discountType = 'prorated_downgrade';
            
            console.log(`[CHECKOUT] Downgrade detected: ${subscription.plan} -> ${plan}`);
            console.log(`[CHECKOUT] No charge, credit available: ${proratedInfo.creditAmount}€`);
          }
        }
      } else {
        // Nema aktivne plaćene pretplate - provjeri popuste
        // Prioritet: TRIAL upgrade popust ima prednost nad new user popustom
        if (isUserTrial && plan !== 'TRIAL' && planDetails.price > 0) {
          const discountPercent = 20; // 20% popust za upgrade iz TRIAL-a
          const discountAmount = (planDetails.price * discountPercent) / 100;
          adjustedPrice = planDetails.price - discountAmount;
          adjustedPrice = Math.round(adjustedPrice * 100) / 100; // Zaokruži na 2 decimale
          discountApplied = true;
          discountType = 'trial_upgrade';
          
          console.log(`[CHECKOUT] TRIAL upgrade discount applied: ${planDetails.price}€ -> ${adjustedPrice}€ (${discountPercent}% off)`);
        } else if (isUserNew && plan !== 'TRIAL' && planDetails.price > 0) {
          const discountPercent = 20; // 20% popust za nove korisnike
          const discountAmount = (planDetails.price * discountPercent) / 100;
          adjustedPrice = planDetails.price - discountAmount;
          adjustedPrice = Math.round(adjustedPrice * 100) / 100; // Zaokruži na 2 decimale
          discountApplied = true;
          discountType = 'new_user';
          
          console.log(`[CHECKOUT] New user discount applied: ${planDetails.price}€ -> ${adjustedPrice}€ (${discountPercent}% off)`);
        }
      }
    } catch (error) {
      console.warn('[CHECKOUT] Error checking if user is new/trial or calculating prorated billing, using regular price:', error.message);
      // Nastavi s normalnom cijenom ako dođe do greške
    }

    // Automatska provjera postojećih funkcionalnosti (samo za direktore)
    let ownedFeatures = [];
    let missingFeatures = [];
    
    try {
      // Provjeri da li je korisnik direktor
      const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId: req.user.id },
        select: { isDirector: true }
      });

      if (providerProfile?.isDirector) {
        // Dohvati feature-e iz plana (ako postoje)
        const planFeatures = planDetails.features || [];
        
        if (planFeatures.length > 0) {
          // Provjeri vlasništvo funkcionalnosti
          const delta = await determineDelta(req.user.id, planFeatures, {});
          ownedFeatures = delta.owned;
          missingFeatures = delta.missing;
          
          // Ako korisnik već posjeduje sve funkcionalnosti, možemo prilagoditi cijenu
          // (za sada samo logiramo, kasnije se može implementirati prilagodba cijene)
          if (ownedFeatures.length > 0) {
            console.log(`[CHECKOUT] Korisnik ${req.user.id} već posjeduje ${ownedFeatures.length} funkcionalnosti iz plana ${plan}`);
            console.log(`[CHECKOUT] Owned features:`, ownedFeatures);
            console.log(`[CHECKOUT] Missing features:`, missingFeatures);
          }
        }
      }
    } catch (error) {
      // Ako provjera ne uspije, nastavi s normalnim checkout procesom
      console.warn('[CHECKOUT] Greška pri provjeri vlasništva funkcionalnosti:', error.message);
    }

    // Log user info for debugging
    console.log('[CREATE-CHECKOUT] req.user:', JSON.stringify(req.user, null, 2));
    console.log('[CREATE-CHECKOUT] req.user.id:', req.user.id, 'type:', typeof req.user.id);
    console.log('[CREATE-CHECKOUT] req.user.email:', req.user.email);
    
    if (!req.user || !req.user.id) {
      console.error('[CREATE-CHECKOUT] req.user is missing or req.user.id is missing');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Create metadata
    const metadata = {
      userId: req.user.id.toString(),
      plan: plan,
      credits: planDetails.credits.toString(),
      originalPrice: planDetails.price.toString(),
      discountedPrice: adjustedPrice.toString(),
      discountApplied: discountApplied.toString(),
      discountType: discountType || '',
      proratedInfo: proratedInfo ? JSON.stringify(proratedInfo) : ''
    };
    
    console.log('[CREATE-CHECKOUT] Creating session with metadata:', metadata);

    // Create Stripe Checkout Session
    // Ako je prorated billing i cijena je 0 (downgrade), koristimo payment mode umjesto subscription
    const isProratedDowngrade = discountType === 'prorated_downgrade' && adjustedPrice === 0;
    const mode = isProratedDowngrade ? 'payment' : 'subscription';
    
    const productName = proratedInfo 
      ? `${planDetails.displayName} Plan (Upgrade iz ${proratedInfo.currentPlan})`
      : `${planDetails.displayName} Plan${discountApplied ? (discountType === 'trial_upgrade' ? ' (TRIAL upgrade - 20% popust!)' : discountType === 'new_user' ? ' (Novi korisnik - 20% popust!)' : '') : ''}`;
    
    const productDescription = proratedInfo
      ? `Proporcionalna naplata za ${proratedInfo.daysRemaining} preostalih dana. Originalna cijena: ${planDetails.price}€, Naplaćeno: ${adjustedPrice}€`
      : `${planDetails.credits} ekskluzivnih leadova mjesečno${discountApplied && discountType !== 'prorated' ? ` - Originalna cijena: ${planDetails.price}€` : ''}`;
    
    const sessionConfig = {
      payment_method_types: ['card'], // Kartice (Visa, Mastercard, Diners)
      mode: mode,
      customer_email: req.user.email,
      line_items: [{
        price_data: {
          currency: planDetails.currency.toLowerCase() || 'eur',
          product_data: {
            name: productName,
            description: productDescription,
          },
          unit_amount: Math.round(adjustedPrice * 100), // Stripe koristi cents
          ...(mode === 'subscription' ? {
            recurring: {
              interval: 'month' // Mjesečna pretplata
            }
          } : {})
        },
        quantity: 1
      }],
      success_url: `${process.env.CLIENT_URL || 'https://uslugar.oriph.io'}#subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'https://uslugar.oriph.io'}#pricing`,
      metadata: metadata
    };
    
    // Ako je prorated downgrade s 0 cijenom, možemo preskočiti Stripe checkout i direktno aktivirati
    if (isProratedDowngrade) {
      // Za downgrade s 0 cijenom, možemo direktno aktivirati pretplatu bez Stripe checkout-a
      // Ili možemo koristiti payment mode s 0 cijenom (Stripe će automatski uspjeti)
      // Za sada koristimo payment mode - Stripe će automatski uspjeti za 0€
      console.log(`[CHECKOUT] Prorated downgrade detected - using payment mode with 0€`);
    }
    
    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    next(error);
  }
});

/**
 * Handle Stripe Webhook
 * POST /api/payments/webhook
 */
r.post('/webhook', async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.TEST_STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;
      const credits = parseInt(session.metadata.credits);
      const paymentIntentId = session.payment_intent; // Stripe Payment Intent ID

      console.log(`[PAYMENT] Subscription activated for user ${userId}, plan: ${plan}`);

      // Activate subscription (sada će automatski kreirati fakturu unutar activateSubscription)
      await activateSubscription(userId, plan, credits, paymentIntentId);

      return res.json({ received: true });
    }

    // Handle recurring payment success
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      
      console.log(`[PAYMENT] Recurring payment succeeded for customer ${customerId}`);
      
      // TODO: Renew subscription credits
      // await renewSubscription(customerId);
      
      return res.json({ received: true });
    }

    // Handle payment failure
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      
      console.log(`[PAYMENT] Payment failed for customer ${customerId}`);
      
      // TODO: Notify user about failed payment
      // await notifyPaymentFailed(customerId);
      
      return res.json({ received: true });
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    next(error);
  }
});

/**
 * Refund subscription payment
 * POST /api/payments/refund-subscription
 */
r.post('/refund-subscription', auth(true, ['PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const { reason, refundCredits } = req.body;
    const userId = req.user.role === 'ADMIN' ? req.body.userId || req.user.id : req.user.id;

    // Admin može refundirati bilo kojem korisniku
    if (req.user.role === 'ADMIN' && req.body.userId && req.body.userId !== req.user.id) {
      // Provjeri da je admin
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only admins can refund other users' });
      }
    }

    const { refundSubscription } = await import('../services/subscription-refund-service.js');
    
    const result = await refundSubscription(
      userId,
      reason || 'Requested by customer',
      refundCredits !== false // Default: true
    );

    res.json({
      success: true,
      ...result,
      message: 'Povrat novca za pretplatu je uspješno obrađen.'
    });

  } catch (error) {
    console.error('Refund subscription error:', error);
    next(error);
  }
});

/**
 * Cancel Stripe subscription
 * POST /api/payments/cancel-subscription
 */
r.post('/cancel-subscription', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    // Get user's subscription from DB
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel Stripe subscription if exists
    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        console.log(`[PAYMENT] Stripe subscription ${subscription.stripeSubscriptionId} cancelled`);
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError);
        // Continue anyway - mark as cancelled locally
      }
    }

    // Update subscription in DB
    const updatedSubscription = await prisma.subscription.update({
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
        subscriptionId: subscription.id,
        userId: req.user.id,
        action: 'CANCELLED',
        previousPlan: subscription.plan,
        newPlan: subscription.plan, // Plan ostaje isti, samo se status mijenja
        previousStatus: subscription.status,
        newStatus: 'CANCELLED',
        options: {
          creditsBefore: subscription.creditsBalance || 0,
          creditsAfter: updatedSubscription.creditsBalance || 0,
          reason: 'User requested cancellation',
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

    res.json({ 
      success: true,
      subscription: updatedSubscription,
      message: 'Pretplata je uspješno otkazana.' 
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    next(error);
  }
});

/**
 * Auto-activate PRO subscription for user (manual activation)
 * POST /api/payments/activate-latest-subscription
 * 
 * NOTE: No auth required - payment verification is enough
 */
r.post('/activate-latest-subscription', async (req, res, next) => {
  try {
    const { payment_intent_id, user_id } = req.body;
    
    if (!payment_intent_id) {
      return res.status(400).json({ error: 'Payment intent ID required' });
    }
    
    console.log(`[PAYMENT AUTO-ACTIVATION] Verifying payment: ${payment_intent_id}`);
    
    // Verify payment exists and succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    console.log(`[PAYMENT AUTO-ACTIVATION] Payment status: ${paymentIntent.status}`);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: 'Payment not completed', 
        status: paymentIntent.status 
      });
    }
    
    // Get customer email to find user
    const customerId = paymentIntent.customer;
    let customer;
    
    if (customerId && typeof customerId === 'string') {
      customer = await stripe.customers.retrieve(customerId);
    } else {
      return res.status(400).json({ error: 'No customer found for this payment' });
    }
    
    console.log(`[PAYMENT AUTO-ACTIVATION] Customer email: ${customer.email}`);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`[PAYMENT AUTO-ACTIVATION] Activating PRO subscription for user ${user.id}`);
    
    // Activate PRO subscription with 50 credits
    const plan = 'PRO';
    const credits = 50;
    
    // Activate subscription
    await activateSubscription(user.id, plan, credits);
    
    res.json({
      success: true,
      message: 'PRO subscription activated!',
      plan: plan,
      credits: credits,
      userId: user.id
    });

  } catch (error) {
    console.error('Auto-activation error:', error);
    next(error);
  }
});

/**
 * Activate PRO subscription by email (for manual activation)
 * POST /api/payments/activate-by-email
 */
r.post('/activate-by-email', async (req, res, next) => {
  try {
    const { email, plan = 'PRO', credits = 50 } = req.body;
    
    console.log(`[PAYMENT ACTIVATE-BY-EMAIL] Request body:`, req.body);
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    console.log(`[PAYMENT ACTIVATE-BY-EMAIL] Activating ${plan} subscription for: ${email}`);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (!user) {
      console.log(`[PAYMENT ACTIVATE-BY-EMAIL] User not found for email: ${email}`);
      return res.status(404).json({ error: 'User not found with this email' });
    }
    
    console.log(`[PAYMENT ACTIVATE-BY-EMAIL] Found user: ${user.id} (type: ${typeof user.id})`);
    
    // Activate subscription without email (fast path)
    console.log(`[PAYMENT ACTIVATE-BY-EMAIL] Calling activateSubscription with userId=${user.id}, plan=${plan}, credits=${credits}`);
    
    // Manual subscription activation without email
    const userIdNum = typeof user.id === 'string' ? parseInt(user.id) : user.id;
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: userIdNum }
    });
    
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    
    const subscription = await prisma.subscription.upsert({
      where: { userId: userIdNum },
      create: {
        userId: userIdNum,
        plan,
        status: 'ACTIVE',
        creditsBalance: credits,
        credits: credits,
        expiresAt
      },
      update: {
        plan,
        status: 'ACTIVE',
        creditsBalance: existingSubscription 
          ? existingSubscription.creditsBalance + credits 
          : credits,
        expiresAt
      }
    });
    
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId: userIdNum,
        type: 'SUBSCRIPTION',
        amount: credits,
        balance: subscription.creditsBalance,
        description: `${plan} subscription - ${credits} credits`
      }
    });
    
    // Notification will be sent by credit-service notifyTransaction function
    // But we'll also keep the existing subscription notification for consistency
    await prisma.notification.create({
      data: {
        title: 'Pretplata aktivirana!',
        message: `Uspješno ste se pretplatili na ${plan} plan! Dodano ${credits} kredita.`,
        type: 'SYSTEM',
        userId: userIdNum
      }
    });
    
    // Also send transaction-specific notification
    await prisma.notification.create({
      data: {
        title: 'Krediti iz pretplate',
        message: `Dodano vam je ${credits} kredita iz pretplate ${plan}. Novo stanje: ${subscription.creditsBalance} kredita.`,
        type: 'SYSTEM',
        userId: userIdNum
      }
    });
    
    console.log(`[PAYMENT ACTIVATE-BY-EMAIL] Subscription activated successfully:`, subscription);
    
    res.json({
      success: true,
      message: `${plan} subscription activated!`,
      plan: plan,
      credits: credits,
      userId: user.id
    });

  } catch (error) {
    console.error('[PAYMENT ACTIVATE-BY-EMAIL] Error:', error);
    console.error('[PAYMENT ACTIVATE-BY-EMAIL] Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to activate subscription', 
      message: error.message,
      details: error
    });
  }
});

/**
 * Manual activation for paid sessions (for fixing old payments)
 * POST /api/payments/activate-subscription
 */
r.post('/activate-subscription', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      // Activate subscription directly
      const userId = session.metadata?.userId || req.user.id;
      const plan = session.metadata?.plan;
      const credits = parseInt(session.metadata?.credits || '0');
      
      console.log(`[PAYMENT MANUAL ACTIVATION] Activating subscription for user ${userId}, plan: ${plan}`);
      
      await activateSubscription(userId, plan, credits);
      
      res.json({
        success: true,
        message: 'Subscription activated!',
        sessionId: session_id
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }

  } catch (error) {
    console.error('Manual activation error:', error);
    next(error);
  }
});

/**
 * Confirm subscription after successful payment
 * GET /api/payments/success
 */
r.get('/success', async (req, res, next) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.redirect('/subscription/plans?error=no_session');
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      // Log full session object to debug
      console.log(`[PAYMENT SUCCESS] Full session object:`, JSON.stringify(session, null, 2));
      console.log(`[PAYMENT SUCCESS] Session metadata:`, session.metadata);
      
      // Activate subscription if not already activated
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      const credits = parseInt(session.metadata?.credits || '0');
      
      console.log(`[PAYMENT SUCCESS] Parsed values - userId: ${userId}, plan: ${plan}, credits: ${credits}`);
      
      // Check if userId is valid (CUID is always a string, not a number)
      if (!userId || typeof userId !== 'string' || userId.length < 5) {
        console.error('[PAYMENT SUCCESS] No valid userId found in session metadata');
        console.error('[PAYMENT SUCCESS] Available metadata keys:', Object.keys(session.metadata || {}));
        // Payment was successful, but metadata is missing
        return res.json({
          success: true,
          message: 'Plaćanje uspješno završeno. Kontaktirajte podršku za aktivaciju pretplate.',
          sessionId: session_id,
          requiresManualActivation: true
        });
      }
      
      console.log('[PAYMENT SUCCESS] Metadata userId:', userId, 'type:', typeof userId);
      
      try {
        // userId should be a string (cuid)
        const userIdStr = String(userId);
        console.log('[PAYMENT SUCCESS] Using userId as string:', userIdStr);
        
        // Activate subscription directly
        await activateSubscription(userIdStr, plan, credits);
        
        res.json({
          success: true,
          message: 'Pretplata uspješno aktivirana!',
          sessionId: session_id
        });
      } catch (activateError) {
        console.error('[PAYMENT SUCCESS] Error activating subscription:', activateError);
        console.error('[PAYMENT SUCCESS] Error message:', activateError.message);
        console.error('[PAYMENT SUCCESS] Error stack:', activateError.stack);
        // Return error details for debugging
        res.status(200).json({
          success: false,
          message: 'Plaćanje uspješno završeno.',
          error: activateError.message,
          sessionId: session_id,
          metadata: session.metadata
        });
      }
    } else {
      res.redirect('/subscription/plans?error=payment_pending');
    }

  } catch (error) {
    console.error('Payment success handler error:', error);
    next(error);
  }
});

/**
 * Helper: Activate subscription after payment
 */
async function activateSubscription(userId, plan, credits, stripePaymentIntentId = null) {
  try {
    // Ensure userId is a string (database expects string, not number)
    const userIdStr = typeof userId === 'string' ? userId : userId.toString();
    
    console.log(`[ACTIVATE SUBSCRIPTION] userId: ${userId}, type: ${typeof userId}, converted: ${userIdStr}`);
    console.log(`[ACTIVATE SUBSCRIPTION] plan: ${plan}, credits: ${credits}`);
    
    if (!plan) {
      throw new Error('Plan is required');
    }
    
    if (!credits || credits === 0) {
      throw new Error('Credits is required and must be > 0');
    }
    
    console.log(`[ACTIVATE SUBSCRIPTION] Checking if user exists...`);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userIdStr }
    });
    
    if (!user) {
      throw new Error(`User with id ${userIdStr} does not exist`);
    }
    
    console.log(`[ACTIVATE SUBSCRIPTION] User found:`, user.email);
    
    console.log(`[ACTIVATE SUBSCRIPTION] Checking for existing subscription...`);
    
    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: userIdStr }
    });
    
    console.log(`[ACTIVATE SUBSCRIPTION] Existing subscription:`, existingSubscription);

    // Ako korisnik već ima aktivnu plaćenu pretplatu, zadrži postojeći expiresAt (prorated billing)
    // Inače, postavi novi expiresAt (1 mjesec od sada)
    let expiresAt;
    if (existingSubscription && 
        existingSubscription.expiresAt && 
        existingSubscription.status === 'ACTIVE' && 
        existingSubscription.plan !== 'TRIAL' && 
        existingSubscription.plan !== 'BASIC') {
      // Zadrži postojeći expiresAt za prorated billing
      expiresAt = new Date(existingSubscription.expiresAt);
      console.log(`[ACTIVATE SUBSCRIPTION] Keeping existing expiresAt for prorated billing: ${expiresAt}`);
    } else {
      // Nova pretplata ili upgrade iz TRIAL/BASIC - 1 mjesec od sada
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      console.log(`[ACTIVATE SUBSCRIPTION] New subscription or upgrade from TRIAL/BASIC, expiresAt: ${expiresAt}`);
    }
    
    console.log(`[ACTIVATE SUBSCRIPTION] Updating subscription, expiresAt: ${expiresAt}`);

    // Determine action type and previous values
    let action = 'CREATED';
    let previousPlan = null;
    let previousStatus = null;
    let creditsBefore = 0;
    let previousExpiresAt = null;
    
    if (existingSubscription) {
      // Upgrade or renewal
      if (existingSubscription.plan !== plan) {
        // Determine if upgrade or downgrade
        const planHierarchy = { 'TRIAL': 0, 'BASIC': 1, 'PREMIUM': 2, 'PRO': 3 };
        const oldTier = planHierarchy[existingSubscription.plan] || 0;
        const newTier = planHierarchy[plan] || 0;
        
        if (newTier > oldTier) {
          action = 'UPGRADED';
        } else if (newTier < oldTier) {
          action = 'DOWNGRADED';
        } else {
          action = 'RENEWED';
        }
      } else {
        action = 'RENEWED';
      }
      
      previousPlan = existingSubscription.plan;
      previousStatus = existingSubscription.status;
      creditsBefore = existingSubscription.creditsBalance || 0;
      previousExpiresAt = existingSubscription.expiresAt;
    }
    
    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: userIdStr },
      create: {
        userId: userIdStr,
        plan,
        status: 'ACTIVE',
        creditsBalance: credits,
        credits: credits, // Legacy
        expiresAt
      },
      update: {
        plan,
        status: 'ACTIVE',
        creditsBalance: existingSubscription 
          ? existingSubscription.creditsBalance + credits 
          : credits,
        expiresAt // Zadrži postojeći expiresAt za prorated billing ili postavi novi
      }
    });
    
    console.log(`[ACTIVATE SUBSCRIPTION] Subscription upserted successfully:`, subscription);
    
    // Log to subscription history
    try {
      const { logSubscriptionChange } = await import('../services/subscription-history-service.js');
      const planDetails = await prisma.subscriptionPlan.findUnique({
        where: { name: plan }
      });
      const planPrice = planDetails?.price || 0;
      
      await logSubscriptionChange({
        subscriptionId: subscription.id,
        userId: userIdStr,
        action,
        previousPlan,
        newPlan: plan,
        previousStatus,
        newStatus: 'ACTIVE',
        options: {
          price: planPrice,
          proratedAmount: null, // Prorated info se može proslijediti kroz metadata ako je potrebno
          discountAmount: null, // Discount info se može proslijediti kroz metadata ako je potrebno
          discountType: null,
          creditsAdded: credits,
          creditsBefore,
          creditsAfter: subscription.creditsBalance,
          validFrom: new Date(),
          validUntil: expiresAt,
          previousExpiresAt,
          reason: action === 'CREATED' ? 'New subscription created' : 
                  action === 'UPGRADED' ? 'Subscription upgraded' :
                  action === 'DOWNGRADED' ? 'Subscription downgraded' :
                  'Subscription renewed',
          metadata: {
            stripePaymentIntentId: stripePaymentIntentId || null
          },
          changedBy: null, // Automatska aktivacija, nema korisnika
          ipAddress: null
        }
      });
    } catch (historyError) {
      console.error('[ACTIVATE SUBSCRIPTION] Error logging to history:', historyError);
      // Ne baci grešku - history logging ne smije blokirati subscription aktivaciju
    }

    // Create credit transaction
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId: userIdStr,
        type: 'SUBSCRIPTION',
        amount: credits,
        balance: subscription.creditsBalance,
        description: `${plan} subscription - ${credits} credits`
      }
    });

    // Create notification (subscription activation)
    await prisma.notification.create({
      data: {
        title: 'Pretplata aktivirana!',
        message: `Uspješno ste se pretplatili na ${plan} plan! Dodano ${credits} kredita.`,
        type: 'SYSTEM',
        userId: userIdStr
      }
    });
    
    // Also send transaction-specific notification
    await prisma.notification.create({
      data: {
        title: 'Krediti iz pretplate',
        message: `Dodano vam je ${credits} kredita iz pretplate ${plan}. Novo stanje: ${subscription.creditsBalance} kredita.`,
        type: 'SYSTEM',
        userId: userIdStr
      }
    });

    console.log(`[SUBSCRIPTION] Activated: User ${userIdStr}, Plan ${plan}, Credits ${credits}`);

    // Get actual plan price from database
    const planDetails = await prisma.subscriptionPlan.findUnique({
      where: { name: plan }
    });
    const planPrice = planDetails?.price || 0;

    // Kreiraj fakturu ako je plaćanje preko Stripe (ima cijenu)
    if (planPrice > 0) {
      try {
        const { createInvoice, generateAndSendInvoice } = await import('../services/invoice-service.js');
        
        // Pronađi Stripe session ID iz metadata (ako postoji)
        // TODO: Proslijediti stripePaymentIntentId ili stripeInvoiceId iz webhook-a
        
        const invoice = await createInvoice({
          userId: userIdStr,
          type: 'SUBSCRIPTION',
          amount: Math.round(planPrice * 100), // U centima
          currency: 'EUR',
          subscriptionId: subscription.id,
          stripePaymentIntentId: stripePaymentIntent || null
        });

        console.log(`[INVOICE] Created invoice ${invoice.invoiceNumber} for subscription`);

        // Automatski generiraj i pošalji fakturu
        try {
          await generateAndSendInvoice(invoice.id);
          console.log(`[INVOICE] Invoice ${invoice.invoiceNumber} generated and sent via email`);
        } catch (invoiceError) {
          console.error('[INVOICE] Error generating/sending invoice:', invoiceError);
          // Ne baci grešku - faktura je kreirana, može se poslati kasnije
        }
      } catch (invoiceError) {
        console.error('[INVOICE] Error creating invoice:', invoiceError);
        // Ne baci grešku - subscription je aktiviran
      }
    }

    // Send confirmation email
    try {
      const user = await prisma.user.findUnique({ where: { id: userIdStr } });
      if (user && user.email) {
        await sendPaymentConfirmationEmail(
          user.email,
          user.fullName || user.email,
          plan,
          planPrice,
          credits
        );
        console.log(`[EMAIL] Payment confirmation sent to: ${user.email}`);
      }
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
      // Don't throw - email failure shouldn't block subscription activation
    }

    return subscription;

  } catch (error) {
    console.error('Activate subscription error:', error);
    throw error;
  }
}

/**
 * GET /api/payments/admin/test
 * Test endpoint to verify routing works
 */
r.get('/admin/test', (req, res) => {
  res.json({ success: true, message: 'Payments admin route is working' });
});

/**
 * GET /api/payments/admin/sessions
 * Admin endpoint - Get all Stripe checkout sessions
 */
r.get('/admin/sessions', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    console.log('[ADMIN PAYMENTS] Endpoint called');
    console.log('[ADMIN PAYMENTS] User:', req.user?.id, req.user?.role);
    
    // Check if Stripe is configured - try to initialize if not already done
    let stripeInstance = stripe;
    const stripeKey = process.env.TEST_STRIPE_SECRET_KEY || '';
    
    console.log('[ADMIN PAYMENTS] Stripe instance exists:', !!stripeInstance);
    console.log('[ADMIN PAYMENTS] TEST_STRIPE_SECRET_KEY exists:', !!stripeKey, 'length:', stripeKey.length);
    
    if (!stripeInstance && stripeKey && stripeKey !== '') {
      try {
        stripeInstance = new Stripe(stripeKey);
        console.log('[ADMIN PAYMENTS] Stripe initialized from environment');
      } catch (initError) {
        console.error('[ADMIN PAYMENTS] Failed to initialize Stripe:', initError.message);
      }
    }
    
    if (!stripeInstance || !stripeKey || stripeKey === '') {
      console.warn('[ADMIN PAYMENTS] Stripe not configured - TEST_STRIPE_SECRET_KEY missing');
      return res.json({ 
        success: true,
        sessions: [],
        hasMore: false,
        message: 'Stripe is not configured. Payment sessions are not available. Please configure TEST_STRIPE_SECRET_KEY in AWS Secrets Manager.'
      });
    }

    const { limit = 100, starting_after } = req.query;

    console.log('[ADMIN PAYMENTS] Fetching Stripe invoices and checkout sessions...');
    
    // Get invoices directly from Stripe (these are what user sees in Stripe dashboard)
    // Also get checkout sessions for additional context
    const [invoices, sessions] = await Promise.all([
      stripeInstance.invoices.list({
        limit: parseInt(limit),
        expand: ['data.customer', 'data.payment_intent', 'data.subscription']
      }).catch(err => {
        console.error('[ADMIN PAYMENTS] Failed to fetch invoices:', err.message);
        throw err;
      }),
      stripeInstance.checkout.sessions.list({
        limit: parseInt(limit),
        starting_after: starting_after || undefined,
        expand: ['data.customer']
      }).catch(err => {
        console.warn('[ADMIN PAYMENTS] Failed to fetch checkout sessions:', err.message);
        return { data: [] };
      })
    ]);
    
    console.log(`[ADMIN PAYMENTS] Found ${invoices.data.length} invoices and ${sessions.data.length} sessions from Stripe`);
    
    // Create a map of sessions by customer email for easier lookup
    const sessionMap = new Map();
    sessions.data.forEach(session => {
      if (session.customer_email) {
        if (!sessionMap.has(session.customer_email)) {
          sessionMap.set(session.customer_email, []);
        }
        sessionMap.get(session.customer_email).push(session);
      }
    });

    // Enrich invoices with user data from database and session info
    const enrichedSessions = await Promise.all(
      invoices.data.map(async (invoice) => {
        let user = null;
        let userId = null;

        // Try to get user from customer_email
        if (invoice.customer_email) {
          user = await prisma.user.findFirst({
            where: { email: invoice.customer_email },
            select: {
              id: true,
              fullName: true,
              email: true
            }
          });
          if (user) userId = user.id;
        }

        // Also check customer object if available
        if (invoice.customer && typeof invoice.customer === 'object' && invoice.customer.email) {
          if (!user) {
            user = await prisma.user.findFirst({
              where: { email: invoice.customer.email },
              select: {
                id: true,
                fullName: true,
                email: true
              }
            });
            if (user) userId = user.id;
          }
        }
        
        // Try to find matching checkout session
        let matchingSession = null;
        if (invoice.customer_email && sessionMap.has(invoice.customer_email)) {
          // Find session with similar amount and date
          matchingSession = sessionMap.get(invoice.customer_email).find(s => 
            Math.abs(s.amount_total - invoice.amount_paid) < 100 && 
            Math.abs(s.created - invoice.created) < 3600 // Within 1 hour
          );
        }

        // Get subscription info if available
        let subscription = null;
        if (userId) {
          subscription = await prisma.subscription.findUnique({
            where: { userId },
            select: {
              plan: true,
              creditsBalance: true
            }
          });
        }
        
        // Extract plan from invoice description or subscription
        let plan = null;
        if (invoice.description) {
          const planMatch = invoice.description.match(/(PRO|PREMIUM|BASIC|TRIAL)/i);
          if (planMatch) plan = planMatch[1].toUpperCase();
        }
        if (!plan && invoice.subscription && typeof invoice.subscription === 'object') {
          // Try to get plan from subscription metadata
          plan = invoice.subscription.metadata?.plan || null;
        }
        if (!plan && subscription) {
          plan = subscription.plan;
        }

        // Calculate amount - use amount_paid for paid invoices, amount_due for unpaid
        let amountTotal = 0;
        if (invoice.status === 'paid' && invoice.amount_paid) {
          amountTotal = invoice.amount_paid;
        } else if (invoice.amount_due) {
          amountTotal = invoice.amount_due;
        } else if (invoice.total) {
          amountTotal = invoice.total;
        } else if (invoice.subtotal) {
          amountTotal = invoice.subtotal;
        }

        return {
          id: invoice.id,
          invoiceNumber: invoice.number,
          userId: userId,
          user: user,
          customerEmail: invoice.customer_email || (invoice.customer && typeof invoice.customer === 'object' ? invoice.customer.email : null),
          plan: plan || matchingSession?.metadata?.plan || null,
          credits: subscription?.creditsBalance || null,
          paymentStatus: invoice.status === 'paid' ? 'paid' : (invoice.status === 'open' ? 'unpaid' : invoice.status),
          status: invoice.status,
          amountTotal: amountTotal, // Amount in cents
          currency: invoice.currency || 'eur',
          createdAt: invoice.created,
          dueDate: invoice.due_date,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
          paymentIntent: invoice.payment_intent,
          subscription: invoice.subscription,
          description: invoice.description,
          // Include session info if available
          sessionId: matchingSession?.id || null
        };
      })
    );

    console.log(`[ADMIN PAYMENTS] Returning ${enrichedSessions.length} sessions`);
    console.log(`[ADMIN PAYMENTS] Sample session:`, enrichedSessions[0] ? {
      id: enrichedSessions[0].id,
      amountTotal: enrichedSessions[0].amountTotal,
      currency: enrichedSessions[0].currency,
      paymentStatus: enrichedSessions[0].paymentStatus
    } : 'No sessions');

    res.json({
      success: true,
      sessions: enrichedSessions,
      hasMore: invoices.has_more
    });
  } catch (error) {
    console.error('[ADMIN PAYMENTS] Error loading sessions:', error);
    next(error);
  }
});

export default r;

