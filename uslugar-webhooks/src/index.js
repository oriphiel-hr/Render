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

// Facebook mora primiti sirovo tijelo za potpis — bez globalnog express.json() prije ovoga
app.use(createFacebookWebhookRouter({ verifyToken: VERIFY_TOKEN, appSecret: APP_SECRET }));

app.use(express.json({ limit: '2mb' }));
app.use('/api/v1', createIngestRouter());

app.use((_req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
  console.log(`Facebook webhook: GET/POST http://localhost:${PORT}/webhook`);
  console.log(`Ingest API: POST http://localhost:${PORT}/api/v1/messages (header X-Ingest-Key)`);
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set — persistence will fail until configured.');
  }
  if (!process.env.VERIFY_TOKEN) {
    console.warn('VERIFY_TOKEN not set — using default (change in production).');
  }
  if (!APP_SECRET) {
    console.warn('FACEBOOK_APP_SECRET not set — Meta POST not signature-verified (dev only).');
  }
  if (!process.env.INGEST_API_KEY) {
    console.warn('INGEST_API_KEY not set — /api/v1/* returns 503 until set.');
  }
});
