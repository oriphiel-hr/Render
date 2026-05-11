const express = require('express');
const { prisma } = require('../lib/prisma');
const { storeMessages } = require('../services/messageStore');
const { resolveActivePrompt } = require('../services/promptService');
const { sendMessengerAndStore } = require('../services/messengerSend');
const {
  outboundApprovalRequired,
  createPendingSend
} = require('../services/pendingMessengerSend');

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

  /**
   * Je li automatika pauzirana za nit (pageId + PSID)? Za provjeru prije LLM-a.
   * GET /api/v1/automation/paused?pageId=&userId=
   */
  router.get('/automation/paused', requireApiKey, async (req, res) => {
    try {
      const pageId = String(req.query.pageId || '').trim();
      const userId = String(req.query.userId || '').trim();
      if (!pageId || !userId) {
        return res.status(400).json({ error: 'Query parametri pageId i userId (PSID) su obavezni' });
      }
      const c = await prisma.crmContact.findUnique({
        where: { pageId_userId: { pageId, userId } },
        select: { pauseAutomation: true }
      });
      return res.json({ paused: Boolean(c?.pauseAutomation) });
    } catch (e) {
      console.error('[ingest automation paused]', e);
      return res.status(500).json({ error: e.message });
    }
  });

  /**
   * Šalje Messenger tekst (npr. nakon što LLM generira odgovor uz prompt iz GET /prompts/active).
   * Blokira ako je u CRM-u uključen pauseAutomation (admin → Korisnici). Admin PUT slanje ne koristi ovaj route.
   * Ako je red odobrenja uključen (admin postavka u bazi ili MESSENGER_OUTBOUND_REQUIRE_APPROVAL), ne šalje odmah: sprema zahtjev i vraća pendingApproval (token nije obavezan u tom koraku).
   * Zaobilazak reda: body.forceDirect=true (i dalje treba accessToken).
   * POST /api/v1/messenger/send
   * body: { pageId, recipientId, text, accessToken?, apiVersion?, forceDirect? }
   */
  router.post('/messenger/send', requireApiKey, async (req, res) => {
    try {
      const { pageId, recipientId, text, accessToken, apiVersion, forceDirect } = req.body || {};
      if (!pageId || !recipientId || !text) {
        return res.status(400).json({
          error: 'pageId, recipientId (PSID) i text su obavezni'
        });
      }
      const safePage = String(pageId).trim();
      const safePsid = String(recipientId).trim();
      const gate = await prisma.crmContact.findUnique({
        where: { pageId_userId: { pageId: safePage, userId: safePsid } },
        select: { pauseAutomation: true }
      });
      if (gate?.pauseAutomation) {
        return res.status(409).json({
          error:
            'Automatika je pauzirana za ovu nit (pauseAutomation). Isključi u adminu kod Korisnika ili pošalji ručno iz admina.'
        });
      }

      const needQueue = (await outboundApprovalRequired()) && !Boolean(forceDirect);
      if (needQueue) {
        const pending = await createPendingSend({
          pageId: safePage,
          recipientId: safePsid,
          text: String(text),
          meta: { via: 'api.ingest.send', apiVersion: apiVersion || null }
        });
        return res.status(200).json({
          pendingApproval: true,
          id: pending.id,
          pageId: pending.pageId,
          recipientId: pending.recipientId,
          text: pending.text,
          expiresAt: pending.expiresAt,
          hint: 'Odobri u admin panelu (Zahtjevi za slanje) ili POST /admin/api/messenger/pending/:id/approve s tokenom.'
        });
      }

      if (!accessToken) {
        return res.status(400).json({
          error: 'accessToken je obavezan osim u načinu s redom odobrenja (pending).'
        });
      }

      const result = await sendMessengerAndStore({
        pageId: safePage,
        recipientPsid: safePsid,
        text: String(text),
        pageAccessToken: String(accessToken),
        apiVersion: apiVersion || undefined,
        source: 'api.ingest.send',
        prisma
      });
      return res.json({
        ok: true,
        messageId: result.messageId,
        recipientId: result.recipientId
      });
    } catch (e) {
      console.error('[ingest messenger send]', e);
      return res.status(500).json({ error: e.message });
    }
  });

  /**
   * GET /api/v1/prompts/active/:slug?channel=MESSENGER&eventSource=facebook.graph.call
   * Ako je eventSource na excludeSources predloška, vraća skipped (automatika ne treba LLM).
   */
  router.get('/prompts/active/:slug', requireApiKey, async (req, res) => {
    try {
      const { slug } = req.params;
      const ch = req.query.channel ? String(req.query.channel).toUpperCase() : null;
      const channelEnum = ch && CHANNEL_KEYS.has(ch) ? ch : null;
      const eventSource = req.query.eventSource ? String(req.query.eventSource).trim() : null;

      const result = await resolveActivePrompt(slug, channelEnum, eventSource);
      if (!result.ok && result.reason === 'excluded') {
        return res.status(200).json({
          skipped: true,
          reason: 'excludeSources',
          slug,
          channel: channelEnum,
          eventSource: result.eventSource,
          excludeSources: result.excludeSources
        });
      }
      if (!result.ok) {
        return res.status(404).json({ error: 'No active prompt for slug' });
      }
      return res.json({
        slug,
        channel: channelEnum,
        body: result.body,
        version: result.version
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  return router;
}

module.exports = { createIngestRouter };
