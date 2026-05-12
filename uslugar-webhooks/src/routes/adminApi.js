const express = require('express');
const path = require('path');
const { prisma } = require('../lib/prisma');
const { metaEnvPrefix, parseWebhookProfiles } = require('../lib/metaEnv');
const { listMessages, listThreads, listPageIdPrefixes, listPageIdsWithNames, listUsers } = require('../services/messageQuery');
const { syncMessengerHistory, backfillGraphSyncBodyText } = require('../services/facebookHistorySync');
const { backfillMessageAttachments } = require('../services/attachmentBackfill');
const { storeMessages } = require('../services/messageStore');
const { sendMessengerAndStore } = require('../services/messengerSend');
const {
  isMessengerPageTokenConfigured,
  refreshMessengerProfilesForWebhookRows,
  backfillMessengerUserProfilesForPage
} = require('../services/messengerUserProfile');
const {
  listPendingForAdmin,
  approvePendingSend,
  rejectPendingSend,
  getMessengerOutboundApprovalState,
  setMessengerOutboundApprovalInDb,
  clearMessengerOutboundApprovalInDb
} = require('../services/pendingMessengerSend');
const { requireAdminToken, adminCors } = require('../middleware/adminAuth');

const jsonBody = express.json({ limit: '24kb' });

function maskSecret(s) {
  if (!s || s.length < 8) return '(set)';
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

function createAdminRouter() {
  const router = express.Router();
  router.use(adminCors);

  /** POST s ADMIN_PANEL_TOKEN — ako se vidi u Render logu, POST do servisa radi (bez Mete). */
  router.post('/api/debug/post-echo', jsonBody, requireAdminToken, (req, res) => {
    const n = req.body != null ? JSON.stringify(req.body).length : 0;
    console.log(`[admin-debug] POST echo ok bodyBytes~=${n}`);
    res.json({ ok: true, receivedBodyBytesApprox: n });
  });

  router.get('/api/bootstrap', requireAdminToken, async (_req, res) => {
    let databaseReady = false;
    let databaseHint = null;
    try {
      await prisma.$queryRaw`SELECT 1 FROM "ChannelMessage" LIMIT 1`;
      databaseReady = true;
    } catch (e) {
      databaseHint =
        'Tablice ne postoje ili DATABASE_URL je kriv. Na Renderu pokreni build s ' +
        '`npx prisma migrate deploy` ili u Shellu: `cd uslugar-webhooks && npx prisma migrate deploy`.';
    }

    const profiles = parseWebhookProfiles();
    const mounted = profiles.map((p) => {
      const prefix = metaEnvPrefix(p);
      const hasVerify = Boolean(process.env[`${prefix}_VERIFY_TOKEN`]);
      const hasSecret = Boolean(process.env[`${prefix}_APP_SECRET`]);
      const hasOwnDb = Boolean(process.env[`${prefix}_DATABASE_URL`]);
      return {
        profile: p,
        webhookPath: `/webhook/${p}`,
        envPrefix: prefix,
        hasVerifyToken: hasVerify,
        hasAppSecret: hasSecret,
        usesOwnDatabase: hasOwnDb
      };
    });

    let approvalState = { effective: false, fromDb: null, envVal: false };
    if (databaseReady) {
      try {
        approvalState = await getMessengerOutboundApprovalState();
      } catch (_) {
        /* ignore */
      }
    }

    res.json({
      service: 'uslugar-webhooks',
      databaseReady,
      databaseHint,
      metaWebhookProfilesRaw: process.env.META_WEBHOOK_PROFILES || '',
      profiles: mounted,
      defaultWebhookPath: '/webhook',
      messengerOutboundRequireApproval: approvalState.effective,
      messengerOutboundApprovalFromDatabase: approvalState.fromDb !== null,
      /** null ako nema valjanog retka u AppSetting; inače spremljena boolean vrijednost */
      messengerOutboundApprovalDbValue: approvalState.fromDb,
      messengerOutboundApprovalEnvValue: approvalState.envVal,
      messengerPageTokenConfigured: isMessengerPageTokenConfigured(),
      messengerProfileHint:
        'Za prikaz imena korisnika (PSID) u adminu bez parsiranja teksta poruke: postavi MESSENGER_PAGE_ACCESS_TOKEN (+ MESSENGER_PAGE_ID) ili MESSENGER_PAGE_TOKENS_JSON; nakon toga webhook sink automatski puni MessengerUserProfile. Za starije niti: POST /admin/api/messenger/refresh-user-profiles.',
      hint:
        'Meta Callback URL = https://<host>/webhook/<profile> — profile mora biti u META_WEBHOOK_PROFILES.'
    });
  });

  /**
   * POST /admin/api/settings/messenger-outbound-approval
   * body: { requireApproval: boolean } — sprema u bazu; ingest koristi ovu vrijednost umjesto env dok postoji redak.
   */
  router.post(
    '/api/settings/messenger-outbound-approval',
    jsonBody,
    requireAdminToken,
    async (req, res) => {
      try {
        const { requireApproval } = req.body || {};
        if (typeof requireApproval !== 'boolean') {
          return res.status(400).json({ error: 'Tijelo mora sadržavati requireApproval (boolean)' });
        }
        await setMessengerOutboundApprovalInDb(requireApproval);
        const state = await getMessengerOutboundApprovalState();
        res.json({
          ok: true,
          messengerOutboundRequireApproval: state.effective,
          messengerOutboundApprovalFromDatabase: state.fromDb !== null,
          messengerOutboundApprovalDbValue: state.fromDb,
          messengerOutboundApprovalEnvValue: state.envVal
        });
      } catch (e) {
        console.error('[admin settings messenger-outbound-approval]', e);
        res.status(500).json({ error: e.message });
      }
    }
  );

  /** POST /admin/api/settings/messenger-outbound-approval/reset — briše admin postavku; ponovno vrijedi env. */
  router.post('/api/settings/messenger-outbound-approval/reset', requireAdminToken, async (_req, res) => {
    try {
      await clearMessengerOutboundApprovalInDb();
      const state = await getMessengerOutboundApprovalState();
      res.json({
        ok: true,
        messengerOutboundRequireApproval: state.effective,
        messengerOutboundApprovalFromDatabase: false,
        messengerOutboundApprovalDbValue: null,
        messengerOutboundApprovalEnvValue: state.envVal
      });
    } catch (e) {
      console.error('[admin settings messenger-outbound-approval reset]', e);
      res.status(500).json({ error: e.message });
    }
  });

  /** GET /admin/api/messenger/pending — zahtjevi za slanje (čekaju odobrenje) */
  router.get('/api/messenger/pending', requireAdminToken, async (_req, res) => {
    try {
      const items = await listPendingForAdmin();
      res.json({ items });
    } catch (e) {
      console.error('[admin messenger pending list]', e);
      res.status(500).json({ error: e.message });
    }
  });

  /** POST /admin/api/messenger/pending/:id/approve body: { accessToken, apiVersion? } */
  router.post('/api/messenger/pending/:id/approve', jsonBody, requireAdminToken, async (req, res) => {
    try {
      const { accessToken, apiVersion } = req.body || {};
      const result = await approvePendingSend(req.params.id, { accessToken, apiVersion });
      res.json({ ok: true, messageId: result.messageId, recipientId: result.recipientId });
    } catch (e) {
      console.error('[admin messenger pending approve]', e);
      res.status(400).json({ error: e.message });
    }
  });

  /** POST /admin/api/messenger/pending/:id/reject */
  router.post('/api/messenger/pending/:id/reject', requireAdminToken, async (req, res) => {
    try {
      await rejectPendingSend(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      console.error('[admin messenger pending reject]', e);
      res.status(400).json({ error: e.message });
    }
  });

  /**
   * Retroaktivno učitavanje Messenger poruka (Graph API, Page access token).
   * POST /admin/api/sync/messenger
   * body: { pageId, accessToken, maxConversations?, maxMessages?, apiVersion? }
   */
  router.post('/api/sync/messenger', jsonBody, requireAdminToken, async (req, res) => {
    try {
      const { pageId, accessToken, maxConversations, maxMessages, apiVersion } = req.body || {};
      if (!pageId || !accessToken) {
        return res.status(400).json({ error: 'pageId i accessToken su obavezni u JSON tijelu' });
      }
      const rows = await syncMessengerHistory({
        pageId,
        accessToken,
        maxConversations,
        maxMessages,
        apiVersion
      });
      if (!rows.length) {
        return res.json({ fetched: 0, stored: 0, message: 'Nema poruka ili nema pristupa konverzacijama' });
      }
      const result = await storeMessages(rows, { prisma });
      refreshMessengerProfilesForWebhookRows(prisma, rows, { maxFetches: 40 }).catch((e) =>
        console.warn('[admin sync] messenger profile refresh:', e.message)
      );
      return res.json({
        fetched: rows.length,
        stored: result.count,
        skippedDuplicates: rows.length - result.count
      });
    } catch (e) {
      console.error('[admin sync]', e.message);
      return res.status(500).json({ error: e.message });
    }
  });

  /**
   * Graph User Profile za PSID-eve stranice (ime kao u Meta Inboxu).
   * POST /admin/api/messenger/refresh-user-profiles
   * body: { pageId, accessToken, maxUsers?: number, apiVersion? }
   */
  router.post('/api/messenger/refresh-user-profiles', jsonBody, requireAdminToken, async (req, res) => {
    try {
      const { pageId, accessToken, maxUsers, apiVersion } = req.body || {};
      if (!pageId || !accessToken) {
        return res.status(400).json({ error: 'pageId i accessToken su obavezni u JSON tijelu' });
      }
      const result = await backfillMessengerUserProfilesForPage(prisma, {
        pageId: String(pageId).trim(),
        pageAccessToken: String(accessToken).trim(),
        maxUsers: maxUsers != null ? Number(maxUsers) : undefined,
        apiVersion: apiVersion || undefined
      });
      return res.json({ ok: true, ...result });
    } catch (e) {
      console.error('[admin messenger refresh-user-profiles]', e);
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * Retroaktivno popunjavanje attachment tablice iz rawPayload.
   * POST /admin/api/backfill/attachments
   * body: { force?: boolean, dryRun?: boolean }
   */
  /**
   * Ručno ili iz automatike (nakon što drugi servis složi tekst iz prompta): pošalji Messenger tekst.
   * POST /admin/api/send/messenger
   * body: { pageId, recipientId, text, accessToken, apiVersion? }
   */
  router.post('/api/send/messenger', jsonBody, requireAdminToken, async (req, res) => {
    try {
      const { pageId, recipientId, text, accessToken, apiVersion } = req.body || {};
      if (!pageId || !recipientId || !text || !accessToken) {
        return res.status(400).json({
          error: 'pageId, recipientId (PSID), text i accessToken su obavezni u JSON tijelu'
        });
      }
      const result = await sendMessengerAndStore({
        pageId: String(pageId).trim(),
        recipientPsid: String(recipientId).trim(),
        text: String(text),
        pageAccessToken: String(accessToken),
        apiVersion: apiVersion || undefined,
        source: 'admin.send',
        prisma
      });
      return res.json({
        ok: true,
        messageId: result.messageId,
        recipientId: result.recipientId
      });
    } catch (e) {
      console.error('[admin send messenger]', e);
      return res.status(500).json({ error: e.message });
    }
  });

  router.post('/api/backfill/attachments', jsonBody, requireAdminToken, async (req, res) => {
    try {
      const { force = false, dryRun = false } = req.body || {};
      const result = await backfillMessageAttachments({
        prisma,
        force: Boolean(force),
        dryRun: Boolean(dryRun)
      });
      return res.json(result);
    } catch (e) {
      console.error('[admin backfill attachments]', e);
      return res.status(500).json({ error: e.message });
    }
  });

  /**
   * Ponovno izračuna `bodyText` za `facebook.graph.sync` redove s praznim tekstom (npr. lajk iz Graph povijesti).
   * POST /admin/api/backfill/graph-sync-body
   * body: { batchSize?: number }
   */
  router.post('/api/backfill/graph-sync-body', jsonBody, requireAdminToken, async (req, res) => {
    try {
      const { batchSize } = req.body || {};
      const result = await backfillGraphSyncBodyText(prisma, { batchSize });
      return res.json({ ok: true, ...result });
    } catch (e) {
      console.error('[admin backfill graph-sync-body]', e);
      return res.status(500).json({ error: e.message });
    }
  });

  /** Briše sve redove u ChannelMessage (privitci kaskadno). body: { confirm: "DELETE_ALL_CHANNEL_MESSAGES" } */
  router.post('/api/messages/delete-all', jsonBody, requireAdminToken, async (req, res) => {
    const expected = 'DELETE_ALL_CHANNEL_MESSAGES';
    try {
      const confirm = String(req.body?.confirm || '').trim();
      if (confirm !== expected) {
        return res.status(400).json({
          error: `Potrebna je točna potvrda. U tijelo JSON pošalji: { "confirm": "${expected}" }`
        });
      }
      const result = await prisma.channelMessage.deleteMany({});
      console.warn(`[admin] delete-all ChannelMessage count=${result.count}`);
      res.json({ ok: true, deleted: result.count });
    } catch (e) {
      console.error('[admin messages delete-all]', e);
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * Briše sve aplikacijske tablice: ChannelMessage (+ privitci), PendingMessengerSend, CrmContact,
   * PromptTemplate, AppSetting. body: { confirm: "DELETE_ALL_APP_DATA" }
   */
  router.post('/api/database/delete-all', jsonBody, requireAdminToken, async (req, res) => {
    const expected = 'DELETE_ALL_APP_DATA';
    try {
      const confirm = String(req.body?.confirm || '').trim();
      if (confirm !== expected) {
        return res.status(400).json({
          error: `Potrebna je točna potvrda. U tijelo JSON pošalji: { "confirm": "${expected}" }`
        });
      }
      const deleted = await prisma.$transaction(async (tx) => {
        const channelMessage = await tx.channelMessage.deleteMany({});
        const pendingMessengerSend = await tx.pendingMessengerSend.deleteMany({});
        const crmContact = await tx.crmContact.deleteMany({});
        const promptTemplate = await tx.promptTemplate.deleteMany({});
        const appSetting = await tx.appSetting.deleteMany({});
        return {
          channelMessage: channelMessage.count,
          pendingMessengerSend: pendingMessengerSend.count,
          crmContact: crmContact.count,
          promptTemplate: promptTemplate.count,
          appSetting: appSetting.count
        };
      });
      console.warn('[admin] delete-all app data', deleted);
      res.json({ ok: true, deleted });
    } catch (e) {
      console.error('[admin database delete-all]', e);
      res.status(500).json({ error: e.message });
    }
  });

  router.get('/api/messages', requireAdminToken, async (req, res) => {
    try {
      const { channel, pageId, userId, q, source, from, to, hasAttachment, attachmentType, limit, offset } = req.query;
      const result = await listMessages({
        channel: channel || undefined,
        pageIdPrefix: pageId || undefined,
        userId: userId || undefined,
        q: q || undefined,
        source: source || undefined,
        from: from || undefined,
        to: to || undefined,
        hasAttachment: hasAttachment || undefined,
        attachmentType: attachmentType || undefined,
        limit,
        offset
      });
      res.json(result);
    } catch (e) {
      console.error('[admin]', e);
      res.status(500).json({ error: e.message });
    }
  });

  router.get('/api/users', requireAdminToken, async (req, res) => {
    try {
      const { pageId, q, limit, offset } = req.query;
      const result = await listUsers({
        pageIdPrefix: pageId || undefined,
        q: q || undefined,
        limit,
        offset
      });
      res.json(result);
    } catch (e) {
      console.error('[admin users]', e);
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/api/users/contact', jsonBody, requireAdminToken, async (req, res) => {
    try {
      const { pageId, userId, isLead, pauseAutomation, notes } = req.body || {};
      const safePageId = String(pageId || '').trim();
      const safeUserId = String(userId || '').trim();
      if (!safePageId || !safeUserId) {
        return res.status(400).json({ error: 'pageId i userId su obavezni' });
      }

      const createData = {
        pageId: safePageId,
        userId: safeUserId,
        isLead: typeof isLead === 'boolean' ? isLead : false,
        pauseAutomation: typeof pauseAutomation === 'boolean' ? pauseAutomation : false,
        notes: notes == null ? null : String(notes).trim() || null
      };
      const updateData = {};
      if (typeof isLead === 'boolean') updateData.isLead = isLead;
      if (typeof pauseAutomation === 'boolean') updateData.pauseAutomation = pauseAutomation;
      if (notes !== undefined) updateData.notes = notes == null ? null : String(notes).trim() || null;

      const contact = await prisma.crmContact.upsert({
        where: { pageId_userId: { pageId: safePageId, userId: safeUserId } },
        create: createData,
        update: updateData
      });
      res.json({ contact });
    } catch (e) {
      console.error('[admin users contact]', e);
      res.status(500).json({ error: e.message });
    }
  });

  router.get('/api/threads', requireAdminToken, async (req, res) => {
    try {
      const { channel, limit } = req.query;
      const threads = await listThreads({ channel: channel || 'MESSENGER', limit });
      res.json({ threads });
    } catch (e) {
      console.error('[admin]', e);
      res.status(500).json({ error: e.message });
    }
  });

  router.get('/api/page-ids', requireAdminToken, async (_req, res) => {
    try {
      const pageIds = await listPageIdPrefixes();
      const pages = await listPageIdsWithNames();
      res.json({ pageIds, pages });
    } catch (e) {
      console.error('[admin]', e);
      res.status(500).json({ error: e.message });
    }
  });

  router.get('/api/prompts', requireAdminToken, async (_req, res) => {
    try {
      const templates = await prisma.promptTemplate.findMany({
        orderBy: [{ slug: 'asc' }, { version: 'desc' }]
      });
      res.json({ prompts: templates });
    } catch (e) {
      console.error('[admin]', e);
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * Uvoz prompt predložaka (JSON niz ili { prompts: [...] }).
   * Svaki objekt: slug, name, body, version (obavezno); isActive, channel, description, excludeSources (opcionalno).
   * Jedinstveni ključ (slug + version) — postojeći redovi se ažuriraju.
   */
  router.post('/api/prompts/import', jsonBody, requireAdminToken, async (req, res) => {
    const CHANNELS = new Set(['MESSENGER', 'INSTAGRAM', 'WHATSAPP', 'FACEBOOK_PAGE_FEED', 'GENERIC']);

    function parseChannel(val) {
      if (val == null || val === '') return null;
      const s = String(val).trim();
      if (!CHANNELS.has(s)) {
        throw new Error(`Nepoznat kanal "${s}". Dozvoljeno: ${[...CHANNELS].join(', ')} ili prazno.`);
      }
      return s;
    }

    function parseExcludeSources(row) {
      if (row.excludeSources === undefined) return undefined;
      if (Array.isArray(row.excludeSources)) {
        return row.excludeSources.map((x) => String(x).trim()).filter(Boolean);
      }
      if (typeof row.excludeSources === 'string') {
        return row.excludeSources
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    }

    try {
      const raw = req.body;
      let items = [];
      if (Array.isArray(raw)) items = raw;
      else if (raw && Array.isArray(raw.prompts)) items = raw.prompts;
      else if (raw && Array.isArray(raw.templates)) items = raw.templates;
      else {
        return res.status(400).json({
          error: 'Očekujem JSON niz promptova ili objekt { "prompts": [ ... ] }.'
        });
      }

      let imported = 0;
      for (const row of items) {
        const slug = String(row.slug || '').trim();
        const name = String(row.name || '').trim();
        const body = row.body == null ? '' : String(row.body);
        const version = Number.parseInt(String(row.version), 10);
        if (!slug || !name || !Number.isFinite(version)) {
          return res.status(400).json({
            error: 'Svaki redak mora imati slug, name i version (broj).'
          });
        }

        const channel = parseChannel(row.channel);
        const description = row.description != null ? String(row.description) : null;
        const createActive = row.isActive !== undefined ? Boolean(row.isActive) : false;
        const excludeParsed = parseExcludeSources(row);
        const updateData = { name, body, channel, description };
        if (row.isActive !== undefined) updateData.isActive = Boolean(row.isActive);
        if (excludeParsed !== undefined) updateData.excludeSources = excludeParsed;

        await prisma.promptTemplate.upsert({
          where: { slug_version: { slug, version } },
          create: {
            slug,
            name,
            body,
            version,
            isActive: createActive,
            channel,
            excludeSources: excludeParsed !== undefined ? excludeParsed : [],
            description
          },
          update: updateData
        });
        imported += 1;
      }

      res.json({ imported, message: `Uvezeno / ažurirano: ${imported} predložaka.` });
    } catch (e) {
      console.error('[admin prompts import]', e);
      const status = e.message && e.message.includes('Nepoznat kanal') ? 400 : 500;
      res.status(status).json({ error: e.message });
    }
  });

  router.get('/api/health-summary', requireAdminToken, (_req, res) => {
    res.json({
      databaseUrlSet: Boolean(process.env.DATABASE_URL),
      ingestKeySet: Boolean(process.env.INGEST_API_KEY),
      adminOrigin: process.env.ADMIN_PANEL_ORIGIN || null,
      facebookAppSecretDefault: Boolean(process.env.FACEBOOK_APP_SECRET),
      verifyTokenDefault: Boolean(process.env.VERIFY_TOKEN),
      metaAppSecretsPreview: parseWebhookProfiles().map((p) => ({
        profile: p,
        appSecretSet: Boolean(process.env[`${metaEnvPrefix(p)}_APP_SECRET`]),
        appSecretPreview: process.env[`${metaEnvPrefix(p)}_APP_SECRET`]
          ? maskSecret(process.env[`${metaEnvPrefix(p)}_APP_SECRET`])
          : null
      }))
    });
  });

  const staticDir = path.join(__dirname, '../../public/admin');
  router.use(express.static(staticDir));

  return router;
}

module.exports = { createAdminRouter };
