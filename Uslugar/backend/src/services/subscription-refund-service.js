/**
 * Subscription Refund Service - Povrat novca za pretplate
 * 
 * PRAVNO: Platforma ne provodi povrate sredstava samostalno.
 * Povrati se provode isključivo putem ovlaštene platne institucije
 * (Stripe Payments Europe Ltd.) u skladu s PSD2 pravilima.
 */

import { prisma } from '../lib/prisma.js';
import { sendSubscriptionRefundEmail } from '../lib/email.js';
import Stripe from 'stripe';

// Stripe initialization
let stripe;
try {
  const stripeKey = process.env.TEST_STRIPE_SECRET_KEY || '';
  if (stripeKey && stripeKey !== '') {
    stripe = new Stripe(stripeKey);
    console.log('[SUBSCRIPTION-REFUND] Stripe initialized for refund processing');
  } else {
    console.warn('[SUBSCRIPTION-REFUND] TEST_STRIPE_SECRET_KEY not set - Stripe refunds will be skipped');
    stripe = null;
  }
} catch (error) {
  console.error('[SUBSCRIPTION-REFUND] Stripe initialization failed:', error.message);
  stripe = null;
}

/**
 * Refund subscription payment
 * 
 * @param {String} userId - ID korisnika čija se pretplata refundira
 * @param {String} reason - Razlog refunda (opcionalno)
 * @param {Boolean} refundCredits - Da li se vraćaju krediti (default: true)
 * @returns {Object} Rezultat refunda
 */
export async function refundSubscription(userId, reason = 'Requested by customer', refundCredits = true) {
  // 1. Pronađi subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true
        }
      },
      invoices: {
        where: {
          type: 'SUBSCRIPTION',
          status: { in: ['PAID', 'SENT'] } // Samo plaćene ili poslane fakture
        },
        orderBy: {
          issueDate: 'desc' // Najnovija faktura
        },
        take: 1 // Uzmi samo najnoviju
      }
    }
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  if (subscription.status === 'CANCELLED' || subscription.status === 'EXPIRED') {
    throw new Error('Subscription is already cancelled or expired');
  }

  // 2. Pronađi invoice s Stripe Payment Intent ID
  const invoice = subscription.invoices?.[0];
  let stripePaymentIntentId = null;
  let refundAmount = 0;

  if (invoice && invoice.stripePaymentIntentId) {
    stripePaymentIntentId = invoice.stripePaymentIntentId;
    refundAmount = invoice.totalAmount; // Ukupan iznos fakture u centima
  } else {
    // Ako nema invoice, pokušaj pronaći plan price
    const planDetails = await prisma.subscriptionPlan.findUnique({
      where: { name: subscription.plan }
    });
    
    if (planDetails && planDetails.price > 0) {
      refundAmount = Math.round(planDetails.price * 100); // U centima
      console.warn('[SUBSCRIPTION-REFUND] No invoice found, using plan price for refund amount');
    } else {
      throw new Error('No payment found for this subscription. Cannot refund free trial or unpaid subscription.');
    }
  }

  /**
   * STRIPE REFUND API - Pravno: Platforma ne provodi povrate sredstava samostalno.
   * Povrati se provode isključivo putem ovlaštene platne institucije
   * (Stripe Payments Europe Ltd.) u skladu s PSD2 pravilima.
   */
  let stripeRefund = null;
  if (stripePaymentIntentId && stripe) {
    try {
      // Stripe refund API - platforma ne provodi refund, Stripe ga provodi
      stripeRefund = await stripe.refunds.create({
        payment_intent: stripePaymentIntentId,
        amount: refundAmount,
        reason: 'requested_by_customer',
        metadata: {
          subscriptionId: subscription.id,
          userId: userId,
          plan: subscription.plan,
          reason: reason,
          invoiceId: invoice?.id || null,
          invoiceNumber: invoice?.invoiceNumber || null
        }
      });

      console.log(`[STRIPE-REFUND] Refund created: ${stripeRefund.id} for payment intent ${stripePaymentIntentId}`);
      console.log(`[STRIPE-REFUND] Amount refunded: ${refundAmount} cents (${(refundAmount / 100).toFixed(2)} EUR)`);
    } catch (stripeError) {
      console.error('[STRIPE-REFUND] Stripe refund failed:', stripeError.message);
      throw new Error(`Stripe refund failed: ${stripeError.message}`);
    }
  } else if (!stripePaymentIntentId) {
    throw new Error('No Stripe payment found for this subscription. Cannot process refund.');
  } else if (!stripe) {
    throw new Error('Stripe not configured. Cannot process refund.');
  }

  // 3. Ažuriraj subscription - označi kao CANCELLED
  const updatedSubscription = await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date()
    }
  });

  // 4. Storniraj fakturu ako postoji (kreira storno fakturu)
  if (invoice) {
    try {
      const { stornoInvoice } = await import('../services/invoice-service.js');
      const stornoResult = await stornoInvoice(invoice.id, `Otkazivanje pretplate - refund: ${reason}`);
      console.log(`[SUBSCRIPTION-REFUND] Invoice ${invoice.invoiceNumber} stornirana zbog otkazivanja pretplate. Storno faktura: ${stornoResult.stornoInvoice.invoiceNumber}`);
    } catch (stornoError) {
      // Ako storniranje ne uspije, samo označi kao CANCELLED
      console.error('[SUBSCRIPTION-REFUND] Error storniranja fakture:', stornoError);
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'CANCELLED',
          notes: `Refunded: ${reason}. Stripe Refund ID: ${stripeRefund?.id || 'N/A'}. Storno neuspjelo: ${stornoError.message}`
        }
      });
    }
  }

  // 5. Oduzmi kredite ako je traženo (proportionalno ili sve)
  if (refundCredits) {
    // Oduzmi sve kredite jer se pretplata refundira
    // Alternativno, mogu se izračunati proporcionalno (npr. ako je prošlo 10 dana od 30, vraća se 20/30)
    await prisma.subscription.update({
      where: { userId },
      data: {
        creditsBalance: 0 // Oduzmi sve kredite
      }
    });

    // Kreiraj credit transaction za refund
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId,
        type: 'REFUND',
        amount: -subscription.creditsBalance, // Negativno jer oduzimamo
        balance: 0,
        description: `Refund subscription payment - ${reason}`
      }
    });
    
    // Kreiraj notifikaciju o transakciji
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: 'Refund kredita',
        message: `Vraćeno vam je ${Math.abs(transaction.amount)} kredita. ${transaction.description || ''} Novo stanje: 0 kredita.`,
      }
    });
  }

  // 6. Kreiraj notifikaciju
  await prisma.notification.create({
    data: {
      title: 'Povrat novca za pretplatu',
      message: `Vaša pretplata ${subscription.plan} je refundirana. Povrat sredstava će biti procesiran kroz Stripe.`,
      type: 'SYSTEM',
      userId
    }
  });

  // 7. Pošalji email notifikaciju
  try {
    await sendSubscriptionRefundEmail(
      subscription.user.email,
      subscription.user.fullName || subscription.user.email,
      subscription.plan,
      refundAmount / 100, // U EUR
      stripeRefund?.id || null,
      reason
    );
    console.log(`[EMAIL] Refund notification sent to: ${subscription.user.email}`);
  } catch (emailError) {
    console.error('[EMAIL] Error sending refund notification:', emailError);
    // Ne baci grešku - refund je procesiran
  }

  console.log(`[SUBSCRIPTION-REFUND] Subscription ${subscription.id} refunded successfully. Amount: ${(refundAmount / 100).toFixed(2)} EUR`);

  return {
    success: true,
    subscription: updatedSubscription,
    refund: {
      stripeRefundId: stripeRefund?.id || null,
      amount: refundAmount / 100, // U EUR
      currency: 'EUR',
      status: stripeRefund?.status || 'pending',
      reason
    },
    creditsRefunded: refundCredits,
    creditsRemaining: refundCredits ? 0 : subscription.creditsBalance
  };
}

