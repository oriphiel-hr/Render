import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';

const r = Router();

/**
 * GET /api/admin/billing/plans/:id/volume
 * Statistika volumena leadova za BillingPlan u zadanom periodu
 * Query parametri: from, to (ISO string); ako nisu zadani, koristi prethodni mjesec
 */
r.get('/plans/:id/volume', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    let periodStart;
    let periodEnd;

    if (from && to) {
      periodStart = new Date(from);
      periodEnd = new Date(to);
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      periodEnd = new Date(year, month, 1);
      periodStart = new Date(periodEnd);
      periodStart.setMonth(periodStart.getMonth() - 1);
    }

    const { getPlanVolumeSummary } = await import('../services/billing-adjustment-service.js');
    const summary = await getPlanVolumeSummary(id, periodStart, periodEnd);

    res.json(summary);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/admin/billing/plans/:id/recalculate
 * Ručna recalculacija korekcija za BillingPlan u zadanom periodu
 * Query parametri: from, to (ISO string); ako nisu zadani, koristi prethodni mjesec
 */
r.post('/plans/:id/recalculate', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    let periodStart;
    let periodEnd;

    if (from && to) {
      periodStart = new Date(from);
      periodEnd = new Date(to);
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      periodEnd = new Date(year, month, 1);
      periodStart = new Date(periodEnd);
      periodStart.setMonth(periodStart.getMonth() - 1);
    }

    const plan = await prisma.billingPlan.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({ error: 'BillingPlan not found' });
    }

    const { calculateAdjustmentForPlan } = await import('../services/billing-adjustment-service.js');
    const adjustment = await calculateAdjustmentForPlan(plan, periodStart, periodEnd);

    res.json({
      success: true,
      adjustment
    });
  } catch (e) {
    next(e);
  }
});

export default r;


