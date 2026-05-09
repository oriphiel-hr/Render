require('dotenv').config();

const express = require('express');
const { createFacebookWebhookRouter } = require('./routes/facebookWebhook');
const { createIngestRouter } = require('./routes/ingestApi');

const PORT = Number(process.env.PORT) || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'moj_tajni_token_123';
const APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';

const app = express();

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'uslugar-webhooks',
    db: Boolean(process.env.DATABASE_URL)
  });
});

/**
 * Profil u META_WEBHOOK_PROFILES (npr. instant-game) → META_INSTANT_GAME_VERIFY_TOKEN, META_INSTANT_GAME_APP_SECRET
 */
function metaEnvPrefix(profile) {
  return 'META_' + String(profile).trim().replace(/-/g, '_').toUpperCase();
}

function parseWebhookProfiles() {
  const raw = process.env.META_WEBHOOK_PROFILES || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// Meta mora primiti sirovo tijelo za potpis — bez globalnog express.json() prije ovoga.
// Specifičnije putanje prvo (npr. /webhook/instant-game), zatim zadani /webhook.
for (const profile of parseWebhookProfiles()) {
  const prefix = metaEnvPrefix(profile);
  const vTok = process.env[`${prefix}_VERIFY_TOKEN`];
  const sec = process.env[`${prefix}_APP_SECRET`] || '';
  if (!vTok) {
    console.warn(
      `META_WEBHOOK_PROFILES includes "${profile}" but ${prefix}_VERIFY_TOKEN is missing — skipped.`
    );
    continue;
  }
  app.use(
    `/webhook/${profile}`,
    createFacebookWebhookRouter({
      verifyToken: vTok,
      appSecret: sec,
      logTag: `webhook:${profile}`
    })
  );
}

app.use(
  '/webhook',
  createFacebookWebhookRouter({
    verifyToken: VERIFY_TOKEN,
    appSecret: APP_SECRET,
    logTag: 'webhook:default'
  })
);

app.use(express.json({ limit: '2mb' }));
app.use('/api/v1', createIngestRouter());

app.use((_req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
  console.log(`Meta webhook (default): GET/POST http://localhost:${PORT}/webhook`);
  for (const profile of parseWebhookProfiles()) {
    const prefix = metaEnvPrefix(profile);
    if (process.env[`${prefix}_VERIFY_TOKEN`]) {
      console.log(`Meta webhook (${profile}): GET/POST http://localhost:${PORT}/webhook/${profile}`);
    }
  }
  console.log(`Ingest API: POST http://localhost:${PORT}/api/v1/messages (header X-Ingest-Key)`);
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set — persistence will fail until configured.');
  }
  if (!process.env.VERIFY_TOKEN) {
    console.warn('VERIFY_TOKEN not set — using default (change in production).');
  }
  if (!APP_SECRET) {
    console.warn('FACEBOOK_APP_SECRET not set — default /webhook POST not signature-verified (dev only).');
  }
  if (!process.env.INGEST_API_KEY) {
    console.warn('INGEST_API_KEY not set — /api/v1/* returns 503 until set.');
  }
});
