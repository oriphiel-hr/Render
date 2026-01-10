import { Router } from 'express';
import { auth } from '../lib/auth.js';
import {
  savePushSubscription,
  removePushSubscription,
  getUserPushSubscriptions,
  getVapidPublicKey
} from '../services/push-notification-service.js';

const r = Router();

// Get VAPID public key (no auth required - public key is safe to expose)
r.get('/vapid-public-key', (req, res) => {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return res.status(503).json({ 
      error: 'Push notifications not configured',
      message: 'VAPID keys not set in server configuration'
    });
  }
  res.json({ publicKey });
});

// Subscribe to push notifications
r.post('/subscribe', auth(true), async (req, res, next) => {
  try {
    const { subscription } = req.body;
    const userAgent = req.get('user-agent');

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    const saved = await savePushSubscription(req.user.id, subscription, userAgent);
    res.json({ success: true, subscription: saved });
  } catch (e) {
    next(e);
  }
});

// Unsubscribe from push notifications
r.post('/unsubscribe', auth(true), async (req, res, next) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    await removePushSubscription(req.user.id, endpoint);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

// Get user's push subscriptions
r.get('/subscriptions', auth(true), async (req, res, next) => {
  try {
    const subscriptions = await getUserPushSubscriptions(req.user.id);
    res.json({ subscriptions });
  } catch (e) {
    next(e);
  }
});

export default r;

