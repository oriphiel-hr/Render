import Stripe from 'stripe';
import { prisma } from './prisma.js';

/**
 * Pokušaj otkazati Stripe pretplate ve uzane za korisnika prije brisanja iz baze.
 */
export async function cancelStripeSubscriptionsForUser (userId) {
  const key = process.env.TEST_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) return;
  let stripe;
  try {
    stripe = new Stripe(key);
  } catch (e) {
    console.warn('[USER-DELETE] Stripe init failed:', e?.message);
    return;
  }
  const addons = await prisma.addonSubscription.findMany({ where: { userId } });
  for (const a of addons) {
    if (a.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(a.stripeSubscriptionId);
        console.log(`[USER-DELETE] Cancelled addon Stripe sub ${a.stripeSubscriptionId}`);
      } catch (e) {
        console.error('[USER-DELETE] Addon Stripe cancel:', e?.message);
      }
    }
  }
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const stripeSubId = sub && typeof sub === 'object' && 'stripeSubscriptionId' in sub ? sub.stripeSubscriptionId : null;
  if (stripeSubId) {
    try {
      await stripe.subscriptions.cancel(stripeSubId);
      console.log(`[USER-DELETE] Cancelled main Stripe sub ${stripeSubId}`);
    } catch (e) {
      console.error('[USER-DELETE] Main Stripe cancel:', e?.message);
    }
  }
}
