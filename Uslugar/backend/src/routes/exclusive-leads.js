// USLUGAR EXCLUSIVE - Rute za ekskluzivne leadove
import { Router } from 'express';
import { auth } from '../lib/auth.js';
import { requirePlan } from '../lib/subscription-auth.js';
import { prisma } from '../lib/prisma.js';
import Stripe from 'stripe';
import {
  purchaseLead,
  markLeadContacted,
  markLeadConverted,
  requestLeadRefund,
  getAvailableLeads,
  getMyLeads,
  unlockContact
} from '../services/lead-service.js';
import {
  getCreditsBalance,
  getCreditHistory,
  addCredits
} from '../services/credit-service.js';

const r = Router();

// Initialize Stripe for Payment Intent creation
let stripe;
try {
  const stripeKey = process.env.TEST_STRIPE_SECRET_KEY || '';
  if (stripeKey && stripeKey !== '') {
    stripe = new Stripe(stripeKey);
    console.log('[EXCLUSIVE-LEADS] Stripe initialized for Payment Intent creation');
  } else {
    console.warn('[EXCLUSIVE-LEADS] TEST_STRIPE_SECRET_KEY not set - Payment Intent creation disabled');
    stripe = null;
  }
} catch (error) {
  console.error('[EXCLUSIVE-LEADS] Stripe initialization failed:', error.message);
  stripe = null;
}

// ============================================================
// LEADOVI - Pregled i kupovina
// ============================================================

// Kreiraj Stripe Payment Intent za kupovinu leada
// POST /api/exclusive/leads/:jobId/create-payment-intent
r.post('/:jobId/create-payment-intent', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    if (!stripe || !process.env.TEST_STRIPE_SECRET_KEY) {
      return res.status(503).json({ 
        error: 'Payment system not configured',
        message: 'Stripe API keys are missing. Please contact support.'
      });
    }

    const { jobId } = req.params;
    const providerId = req.user.id;

    // Dohvati job da dobijemo cijenu leada
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        leadPrice: true,
        leadStatus: true,
        assignedProviderId: true
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.leadStatus !== 'AVAILABLE' || job.assignedProviderId) {
      return res.status(410).json({ error: 'Lead is not available' });
    }

    // Izračunaj cijenu u centima (1 kredit = 10 EUR = 1000 cents)
    const leadPrice = job.leadPrice || 10;
    const creditPriceInEUR = 10;
    const amountInCents = leadPrice * creditPriceInEUR * 100;

    // Kreiraj Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      metadata: {
        jobId: job.id,
        providerId: providerId,
        leadPrice: leadPrice.toString(),
        type: 'lead_purchase'
      },
      description: `Lead purchase: ${job.title}`,
      automatic_payment_methods: {
        enabled: true
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      currency: 'eur',
      leadPrice: leadPrice,
      message: 'Payment Intent created. Use clientSecret to complete payment on frontend.'
    });

  } catch (e) {
    next(e);
  }
});

// Dohvati dostupne ekskluzivne leadove za providera
r.get('/available', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { city, categoryId, minBudget, maxBudget } = req.query;
    
    const filters = {};
    if (city) filters.city = city;
    if (categoryId) filters.categoryId = categoryId;
    if (minBudget) filters.budgetMin = { gte: parseInt(minBudget) };
    if (maxBudget) filters.budgetMax = { lte: parseInt(maxBudget) };
    
    const leads = await getAvailableLeads(req.user.id, filters);
    
    res.json({
      total: leads.length,
      leads
    });
  } catch (e) {
    next(e);
  }
});

// Kupi ekskluzivan lead (pay-per-contact: NE otključava kontakt)
// Podržava i interne kredite i Stripe Payment Intent
r.post('/:jobId/purchase', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const providerId = req.user.id;
    const { paymentIntentId } = req.body; // Opcionalno: Stripe Payment Intent ID
    
    const result = await purchaseLead(jobId, providerId, { paymentIntentId });
    
    res.status(201).json(result);
  } catch (e) {
    const status = e.message.includes('Insufficient credits') ? 402 :
                   e.message.includes('not available') ? 410 :
                   e.message.includes('already') ? 409 :
                   e.message.includes('Payment') || e.message.includes('payment') ? 402 : 400;
    res.status(status).json({ error: e.message });
  }
});

// Otključaj kontakt za kupljeni lead (Pay-per-contact: naplaćuje 1 kredit)
r.post('/:jobId/unlock-contact', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const providerId = req.user.id;
    
    const result = await unlockContact(jobId, providerId);
    
    // Log audit - contact revealed (s IP i user agent)
    try {
      const { logContactRevealed } = await import('../services/audit-log-service.js');
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      await logContactRevealed(
        jobId,
        providerId,
        null, // roomId
        {
          method: 'PAY_PER_CONTACT',
          purchaseId: result.purchase?.id
        },
        ipAddress,
        userAgent
      );
    } catch (auditError) {
      console.error('Error logging contact reveal audit:', auditError);
    }
    
    res.json(result);
  } catch (e) {
    const status = e.message.includes('Insufficient credits') ? 402 :
                   e.message.includes('must purchase') ? 400 :
                   e.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: e.message });
  }
});

// Dohvati moje kupljene leadove
r.get('/my-leads', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { status } = req.query;
    const leads = await getMyLeads(req.user.id, status || null);
    
    res.json({
      total: leads.length,
      leads
    });
  } catch (e) {
    next(e);
  }
});

// Označi lead kao kontaktiran
r.post('/purchases/:purchaseId/contacted', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { purchaseId } = req.params;
    const updated = await markLeadContacted(purchaseId, req.user.id);
    
    res.json({
      success: true,
      purchase: updated,
      message: 'Lead marked as contacted'
    });
  } catch (e) {
    next(e);
  }
});

// Označi lead kao konvertiran
r.post('/purchases/:purchaseId/converted', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { purchaseId } = req.params;
    const { revenue } = req.body; // Prihod od posla (opcionalno)
    
    const updated = await markLeadConverted(purchaseId, req.user.id, revenue || 0);
    
    res.json({
      success: true,
      purchase: updated,
      message: 'Congratulations! Lead converted to job.'
    });
  } catch (e) {
    next(e);
  }
});

// Zatraži povrat za lead (Request Refund - kreira zahtjev koji čeka admin odobrenje)
// PRAVNO: Platforma ne provodi povrate sredstava samostalno.
// Povrati se provode putem ovlaštene platne institucije u skladu s PSD2 pravilima.
r.post('/purchases/:purchaseId/refund', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { purchaseId } = req.params;
    const { reason } = req.body;
    
    const updated = await requestLeadRefund(purchaseId, req.user.id, reason || 'Client unresponsive');
    
    res.json({
      success: true,
      purchase: updated,
      message: 'Zahtjev za povrat je poslan. Povrati se provode putem ovlaštene platne institucije (Stripe Payments Europe Ltd.) u skladu s PSD2 pravilima. Krediti će biti vraćeni u skladu s pravilima pružatelja usluga plaćanja.'
    });
  } catch (e) {
    next(e);
  }
});

// ============================================================
// KREDITI - Upravljanje kreditima
// ============================================================

// Dohvati trenutni balans kredita
// Dozvoljeno za PROVIDER, ADMIN i USER-e koji su tvrtke/obrti (imaju legalStatusId)
r.get('/credits/balance', auth(true, ['PROVIDER', 'ADMIN', 'USER']), async (req, res, next) => {
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
    
    const balance = await getCreditsBalance(req.user.id);
    res.json(balance);
  } catch (e) {
    next(e);
  }
});

// Dohvati povijest transakcija
r.get('/credits/history', auth(true, ['PROVIDER', 'ADMIN', 'USER']), async (req, res, next) => {
  try {
    const { limit, type } = req.query;
    const history = await getCreditHistory(req.user.id, limit ? parseInt(limit) : 50, type || null);
    
    res.json({
      total: history.length,
      transactions: history
    });
  } catch (e) {
    next(e);
  }
});

// Kupi kredite (pay-per-credit) - ADMIN ili PAYMENT GATEWAY
r.post('/credits/purchase', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { amount, paymentIntentId } = req.body;
    
    if (!amount || amount < 1 || amount > 100) {
      return res.status(400).json({ error: 'Invalid amount. Must be between 1 and 100 credits.' });
    }
    
    // TODO: Integracija sa Stripe/CorvusPay payment gateway
    // Za sada simuliram uspješnu uplatu
    
    const result = await addCredits(
      req.user.id,
      amount,
      'PURCHASE',
      `Purchased ${amount} credits`,
      null
    );
    
    res.json({
      success: true,
      creditsAdded: amount,
      newBalance: result.balance,
      message: `Successfully purchased ${amount} credits`
    });
  } catch (e) {
    next(e);
  }
});

// ============================================================
// EXPORT - CSV Export za leadove
// ============================================================

// Export mojih leadova u CSV (PREMIUM/PRO feature)
r.get('/export/my-leads', auth(true, ['PROVIDER']), requirePlan('PREMIUM'), async (req, res, next) => {
  try {
    const leads = await getMyLeads(req.user.id, null);
    
    // Generiraj CSV
    const csvHeader = 'ID,Naziv,Kategorija,Grad,Budžet,Status,Kontaktirano,Konvertirano,Refundirano,Cijena,Potrošeno kredita,Created At\n';
    const csvRows = leads.map(p => {
      const job = p.job || {};
      const user = (job.user || {});
      return [
        p.id,
        `"${job.title || ''}"`,
        `"${(job.category || {}).name || ''}"`,
        `"${job.city || ''}"`,
        `${job.budgetMin || 0}-${job.budgetMax || 0} EUR`,
        p.status,
        p.contactedAt ? new Date(p.contactedAt).toISOString() : '',
        p.convertedAt ? new Date(p.convertedAt).toISOString() : '',
        p.refundedAt ? new Date(p.refundedAt).toISOString() : '',
        `${p.leadPrice} credits`,
        p.creditsSpent,
        new Date(p.createdAt).toISOString()
      ].join(',');
    }).join('\n');
    
    const csv = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="my-leads.csv"');
    res.send(csv);
  } catch (e) {
    next(e);
  }
});

// Export kreditnih transakcija u CSV (PREMIUM/PRO feature)
r.get('/export/credits-history', auth(true, ['PROVIDER', 'ADMIN', 'USER']), async (req, res, next) => {
  try {
    const { type, limit } = req.query;
    const history = await getCreditHistory(req.user.id, limit ? parseInt(limit) : 1000, type || null);
    
    // CSV Header
    const csvHeader = 'ID,Tip Transakcije,Iznos,Stanje Nakon,Opis,Povezani Posao,Povezana Kupovina,Datum\n';
    
    // Map transactions to CSV rows with Croatian labels
    const typeLabels = {
      'PURCHASE': 'Kupovina kredita',
      'LEAD_PURCHASE': 'Kupovina leada',
      'REFUND': 'Refund',
      'BONUS': 'Bonus',
      'SUBSCRIPTION': 'Pretplata',
      'ADMIN_ADJUST': 'Admin prilagodba'
    };
    
    const csvRows = history.map(t => [
      t.id,
      typeLabels[t.type] || t.type,
      t.amount,
      t.balance,
      `"${(t.description || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
      t.relatedJob?.title || '',
      t.relatedPurchaseId || '',
      new Date(t.createdAt).toLocaleString('hr-HR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    ].join(',')).join('\n');
    
    const csv = csvHeader + csvRows;
    
    // Generate filename with filter info if applicable
    const filterSuffix = type ? `-${type}` : '';
    const filename = `credit-history${filterSuffix}-${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
    res.send('\ufeff' + csv); // Add BOM for Excel UTF-8 compatibility
  } catch (e) {
    next(e);
  }
});

export default r;

