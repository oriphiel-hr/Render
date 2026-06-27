import { Router } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { requireAuth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

export const paymentsRouter = Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

paymentsRouter.get('/donate/status', (_req, res) => {
  return res.json({
    success: true,
    stripeEnabled: Boolean(stripe),
    amountsEur: [3, 5, 10, 20]
  });
});

paymentsRouter.post('/donate/stripe', async (req, res) => {
  const schema = z.object({
    amountCents: z.number().int().min(100).max(200000)
  });
  const allowed = new Set([300, 500, 1000, 2000]);
  try {
    const payload = schema.parse(req.body);
    if (!allowed.has(payload.amountCents)) {
      return res.status(400).json({ success: false, error: 'Unsupported donation amount' });
    }
    if (!stripe) {
      return res.status(503).json({ success: false, error: 'Stripe not configured' });
    }

    const amountEur = (payload.amountCents / 100).toFixed(2);
    const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: payload.amountCents,
            product_data: {
              name: 'Dobrovoljna donacija — Ravnopar',
              description: `Podrška održavanju platforme (${amountEur} EUR)`
            }
          }
        }
      ],
      success_url: `${frontendBase}/?donate=thanks`,
      cancel_url: `${frontendBase}/?donate=cancel`
    });

    return res.json({ success: true, checkoutUrl: session.url });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid donation request' });
  }
});

paymentsRouter.post('/checkout/stripe', requireAuth, async (req, res) => {
  const schema = z.object({
    amountCents: z.number().int().min(100).max(200000),
    description: z.string().min(3).max(200)
  });
  try {
    const payload = schema.parse(req.body);
    if (!stripe) {
      return res.status(503).json({ success: false, error: 'Stripe not configured' });
    }

    const order = await prisma.paymentOrder.create({
      data: {
        userProfileId: req.auth.profileId,
        provider: 'STRIPE',
        status: 'PENDING',
        amountCents: payload.amountCents,
        description: payload.description
      }
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: payload.amountCents,
            product_data: { name: payload.description }
          }
        }
      ],
      success_url: `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/app?payment=success`,
      cancel_url: `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/app?payment=cancel`
    });

    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id }
    });

    return res.json({ success: true, checkoutUrl: session.url, orderId: order.id });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payment request' });
  }
});

paymentsRouter.post('/checkout/bank-transfer', requireAuth, async (req, res) => {
  const schema = z.object({
    amountCents: z.number().int().min(100).max(200000),
    description: z.string().min(3).max(200)
  });
  try {
    const payload = schema.parse(req.body);
    const bankTransferReference = `RP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order = await prisma.paymentOrder.create({
      data: {
        userProfileId: req.auth.profileId,
        provider: 'BANK_TRANSFER',
        status: 'PENDING',
        amountCents: payload.amountCents,
        description: payload.description,
        bankTransferReference
      }
    });

    return res.status(201).json({
      success: true,
      orderId: order.id,
      bankTransferReference,
      instructions: 'Uplati na IBAN iz support stranice i navedi referencu.'
    });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payment request' });
  }
});

const PLAN_CATALOG = {
  plus: { amountCents: 499, label: 'Ravnopar Plus' },
  supporter: { amountCents: 299, label: 'Ravnopar Supporter' }
};

paymentsRouter.get('/plans/status', (_req, res) => {
  return res.json({
    success: true,
    plansEnabled: process.env.PLANS_ENABLED === 'true',
    stripeEnabled: Boolean(stripe),
    plans: Object.entries(PLAN_CATALOG).map(([id, plan]) => ({ id, ...plan }))
  });
});

paymentsRouter.post('/checkout/plan', requireAuth, async (req, res) => {
  const schema = z.object({ planId: z.enum(['plus', 'supporter']) });
  try {
    if (process.env.PLANS_ENABLED !== 'true') {
      return res.status(503).json({ success: false, error: 'Premium paketi još nisu dostupni.' });
    }
    if (!stripe) {
      return res.status(503).json({ success: false, error: 'Stripe not configured' });
    }

    const { planId } = schema.parse(req.body);
    const plan = PLAN_CATALOG[planId];
    const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

    const order = await prisma.paymentOrder.create({
      data: {
        userProfileId: req.auth.profileId,
        provider: 'STRIPE',
        status: 'PENDING',
        amountCents: plan.amountCents,
        description: plan.label
      }
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: plan.amountCents,
            product_data: { name: plan.label, description: 'Mjesečna pretplata (priprema — aktivacija ručno nakon uplate)' }
          }
        }
      ],
      success_url: `${frontendBase}/app/postavke?plan=success`,
      cancel_url: `${frontendBase}/planovi?plan=cancel`,
      metadata: { planId, profileId: req.auth.profileId, orderId: order.id }
    });

    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id }
    });

    return res.json({ success: true, checkoutUrl: session.url, orderId: order.id });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid plan checkout request' });
  }
});

paymentsRouter.get('/my-orders', requireAuth, async (req, res) => {
  const items = await prisma.paymentOrder.findMany({
    where: { userProfileId: req.auth.profileId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  return res.json({ success: true, items });
});
