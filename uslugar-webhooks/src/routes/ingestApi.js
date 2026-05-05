const express = require('express');
const { storeMessages } = require('../services/messageStore');
const { getActivePromptBody } = require('../services/promptService');

const CHANNEL_KEYS = new Set(['MESSENGER', 'INSTAGRAM', 'WHATSAPP', 'FACEBOOK_PAGE_FEED', 'GENERIC']);

function createIngestRouter() {
  const router = express.Router();
  const apiKey = process.env.INGEST_API_KEY || '';

  function requireApiKey(req, res, next) {
    if (!apiKey) {
      console.warn('[ingest] INGEST_API_KEY not set — API ingest disabled');
      return res.status(503).json({ error: 'INGEST_API_KEY not configured' });
    }
    const key = req.get('x-ingest-key') || (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (key !== apiKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  }

  /**
   * Univerzalni unos poruka (ostali kanali, interni sustavi, test).
   * POST /api/v1/messages
   * body: { channel, source?, externalThreadId?, externalMessageId?, direction?, text?, raw? }
   */
  router.post('/messages', requireApiKey, async (req, res) => {
    try {
      const {
        channel: channelIn,
        source = 'api.ingest',
        externalThreadId = null,
        externalMessageId = null,
        direction = 'inbound',
        text = null,
        raw = null
      } = req.body || {};

      if (!channelIn || !CHANNEL_KEYS.has(String(channelIn).toUpperCase())) {
        return res.status(400).json({
          error: 'Invalid or missing channel',
          allowed: [...CHANNEL_KEYS]
        });
      }

      const channel = String(channelIn).toUpperCase();
      const extMsgId =
        externalMessageId ||
        `ing_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      const row = {
        channel,
        source,
        externalThreadId: externalThreadId || null,
        externalMessageId: extMsgId,
        direction: ['inbound', 'outbound', 'system'].includes(direction) ? direction : 'inbound',
        bodyText: text != null ? String(text) : null,
        rawPayload: raw != null ? raw : req.body
      };

      const result = await storeMessages([row]);
      return res.status(201).json({ stored: result.count, externalMessageId: extMsgId });
    } catch (e) {
      console.error('[ingest]', e);
      return res.status(500).json({ error: e.message });
    }
  });

  /** GET /api/v1/prompts/active/:slug?channel=MESSENGER */
  router.get('/prompts/active/:slug', requireApiKey, async (req, res) => {
    try {
      const { slug } = req.params;
      const ch = req.query.channel ? String(req.query.channel).toUpperCase() : null;
      const channelEnum = ch && CHANNEL_KEYS.has(ch) ? ch : null;
      const body = await getActivePromptBody(slug, channelEnum);
      if (!body) return res.status(404).json({ error: 'No active prompt for slug' });
      return res.json({ slug, channel: channelEnum, body });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  return router;
}

module.exports = { createIngestRouter };
