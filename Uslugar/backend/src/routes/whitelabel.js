// White-Label Routes - PRO users only
import { Router } from 'express';
import { auth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { getWhiteLabelConfig, updateWhiteLabelConfig, toggleWhiteLabel, deleteWhiteLabelConfig } from '../services/whitelabel-service.js';
import { requirePlan } from '../lib/subscription-auth.js';

const r = Router();

/**
 * Get current user's white-label configuration
 */
r.get('/', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    // Check if user has PRO plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription || subscription.plan !== 'PRO') {
      return res.status(403).json({ 
        error: 'White-label is only available for PRO subscribers',
        message: 'Nadogradite na PRO plan za pristup white-label opciji'
      });
    }

    const config = await getWhiteLabelConfig(req.user.id);
    res.json(config);
  } catch (error) {
    next(error);
  }
});

/**
 * Update white-label configuration
 */
r.put('/', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    // Check if user has PRO plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription || subscription.plan !== 'PRO') {
      return res.status(403).json({ 
        error: 'White-label is only available for PRO subscribers',
        message: 'Nadogradite na PRO plan za pristup white-label opciji'
      });
    }

    const config = await updateWhiteLabelConfig(req.user.id, req.body);
    res.json(config);
  } catch (error) {
    next(error);
  }
});

/**
 * Toggle white-label on/off
 */
r.post('/toggle', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    // Check if user has PRO plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription || subscription.plan !== 'PRO') {
      return res.status(403).json({ 
        error: 'White-label is only available for PRO subscribers',
        message: 'Nadogradite na PRO plan za pristup white-label opciji'
      });
    }

    const { isActive } = req.body;
    const config = await toggleWhiteLabel(req.user.id, isActive);
    res.json(config);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete white-label configuration
 */
r.delete('/', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    // Check if user has PRO plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription || subscription.plan !== 'PRO') {
      return res.status(403).json({ 
        error: 'White-label is only available for PRO subscribers',
        message: 'Nadogradite na PRO plan za pristup white-label opciji'
      });
    }

    const result = await deleteWhiteLabelConfig(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default r;

