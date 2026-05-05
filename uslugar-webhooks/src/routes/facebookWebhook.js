const crypto = require('crypto');
const express = require('express');
const { parseFacebookWebhook } = require('../ingest/facebook');
const { storeMessages } = require('../services/messageStore');

function rawBodySaver(req, res, buf) {
  if (buf?.length) req.rawBody = buf;
}

function verifySignature(req, appSecret) {
  if (!appSecret) return true;
  const sig = req.get('x-hub-signature-256');
  if (!sig || !req.rawBody) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(req.rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

function createFacebookWebhookRouter({ verifyToken, appSecret }) {
  const router = express.Router();

  router.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('[webhook] WEBHOOK_VERIFIED');
        return res.status(200).send(challenge);
      }
      console.warn('[webhook] Verify failed');
      return res.sendStatus(403);
    }
    return res.sendStatus(400);
  });

  router.post('/webhook', express.json({ verify: rawBodySaver }), (req, res) => {
    if (!verifySignature(req, appSecret)) {
      console.warn('[webhook] Invalid X-Hub-Signature-256');
      return res.sendStatus(403);
    }

    res.status(200).send('EVENT_RECEIVED');

    setImmediate(async () => {
      try {
        const rows = parseFacebookWebhook(req.body);
        const result = await storeMessages(rows);
        if (rows.length) {
          console.log(`[webhook] stored ${result.count}/${rows.length} message row(s) (duplicates skipped)`);
        }
      } catch (e) {
        console.error('[webhook] persist error', e.message);
      }
    });
  });

  return router;
}

module.exports = { createFacebookWebhookRouter, rawBodySaver };
