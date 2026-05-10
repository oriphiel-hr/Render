const express = require('express');
const path = require('path');
const { prisma } = require('../lib/prisma');
const { metaEnvPrefix, parseWebhookProfiles } = require('../lib/metaEnv');
const { listMessages, listThreads, listPageIdPrefixes } = require('../services/messageQuery');
const { requireAdminToken, adminCors } = require('../middleware/adminAuth');

function maskSecret(s) {
  if (!s || s.length < 8) return '(set)';
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

function createAdminRouter() {
  const router = express.Router();
  router.use(adminCors);

  router.get('/api/bootstrap', requireAdminToken, (_req, res) => {
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

    res.json({
      service: 'uslugar-webhooks',
      metaWebhookProfilesRaw: process.env.META_WEBHOOK_PROFILES || '',
      profiles: mounted,
      defaultWebhookPath: '/webhook',
      hint:
        'Meta Callback URL = https://<host>/webhook/<profile> — profile mora biti u META_WEBHOOK_PROFILES.'
    });
  });

  router.get('/api/messages', requireAdminToken, async (req, res) => {
    try {
      const { channel, pageId, limit, offset } = req.query;
      const result = await listMessages({
        channel: channel || undefined,
        pageIdPrefix: pageId || undefined,
        limit,
        offset
      });
      res.json(result);
    } catch (e) {
      console.error('[admin]', e);
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
      res.json({ pageIds });
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
