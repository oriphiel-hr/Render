require('dotenv').config();

const express = require('express');
const { createFacebookWebhookRouter } = require('./routes/facebookWebhook');
const { createIngestRouter } = require('./routes/ingestApi');
const { createAdminRouter } = require('./routes/adminApi');
const { metaEnvPrefix, parseWebhookProfiles } = require('./lib/metaEnv');
const { getMessengerOutboundApprovalState } = require('./services/pendingMessengerSend');

const PORT = Number(process.env.PORT) || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'moj_tajni_token_123';
const APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';

function hasAnyDatabaseUrl() {
  if (process.env.DATABASE_URL) return true;
  for (const profile of parseWebhookProfiles()) {
    if (process.env[`${metaEnvPrefix(profile)}_DATABASE_URL`]) return true;
  }
  return false;
}

const app = express();

app.use((req, _res, next) => {
  const path = req.originalUrl || req.url || '';
  const skipNoise =
    req.method === 'GET' && (path === '/health' || path.startsWith('/health?'));
  if (!skipNoise) {
    console.log(`[http] ${req.method} ${path}`);
  }
  if (path.startsWith('/webhook')) {
    console.log(`[webhook-route] ${req.method} ${path}`);
  }
  next();
});

app.get('/health', (_req, res) => {
  const profiles = parseWebhookProfiles();
  const profileDatabases = {};
  for (const p of profiles) {
    profileDatabases[p] = Boolean(process.env[`${metaEnvPrefix(p)}_DATABASE_URL`]);
  }
  res.status(200).json({
    ok: true,
    service: 'uslugar-webhooks',
    db: hasAnyDatabaseUrl(),
    databaseUrlDefault: Boolean(process.env.DATABASE_URL),
    profileDatabases
  });
});

/** Bez tajni — za usporedbu s Meta „Callback URL”. GET jer preglednik ne šalje POST. */
app.get('/debug/webhook-info', (_req, res) => {
  const profiles = parseWebhookProfiles();
  const mounted = profiles.filter((p) => process.env[`${metaEnvPrefix(p)}_VERIFY_TOKEN`]);
  res.status(200).json({
    hint:
      'Meta šalje webhook kao POST (ne GET). U logu GET vidiš preglednik/monitor; POST tek kad Meta okine test ili poruku.',
    callbackUrlsMustMatchExactlyOne: [
      `https://<tvoj-host>/webhook`,
      ...mounted.map((p) => `https://<tvoj-host>/webhook/${p}`)
    ],
    mountedProfiles: mounted.length ? mounted : ['(nema META_WEBHOOK_PROFILES — samo /webhook)'],
    verifyMetaDeveloperWebhookFieldMatchesThesePaths: true,
    fullDiagnostic: '/debug/webhook-diagnostic'
  });
});

/**
 * Jedna stranica istine: što je montirano, koji URL mora biti u Meta Callback URL,
 * zašto preglednik na /webhook daje 400, što znači koji log red.
 */
app.get('/debug/webhook-diagnostic', (req, res) => {
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim();
  const host = req.get('host') || 'localhost';
  const base = `${proto}://${host}`;
  const profiles = parseWebhookProfiles();
  const mountedProfiles = profiles.filter((p) => process.env[`${metaEnvPrefix(p)}_VERIFY_TOKEN`]);

  const profileEndpoints = mountedProfiles.map((p) => {
    const prefix = metaEnvPrefix(p);
    return {
      path: `/webhook/${p}`,
      fullUrl: `${base}/webhook/${p}`,
      verifyTokenEnvVar: `${prefix}_VERIFY_TOKEN`,
      verifyTokenIsSet: Boolean(process.env[`${prefix}_VERIFY_TOKEN`]),
      appSecretEnvVar: `${prefix}_APP_SECRET`,
      appSecretIsSet: Boolean(process.env[`${prefix}_APP_SECRET`]),
      ifAppSecretWrong:
        'Meta šalje X-Hub-Signature-256; ako secret ne odgovara App Secret-u u Meta konzoli za ovu aplikaciju → 403 Invalid signature (u logu i dalje vidiš [http] POST i WEBHOOK_IN).'
    };
  });

  const defaultEndpoint = {
    path: '/webhook',
    fullUrl: `${base}/webhook`,
    verifyTokenEnvVar: 'VERIFY_TOKEN',
    verifyTokenIsSet: Boolean(process.env.VERIFY_TOKEN),
    appSecretEnvVar: 'FACEBOOK_APP_SECRET',
    appSecretIsSet: Boolean(process.env.FACEBOOK_APP_SECRET)
  };

  const issues = [];
  for (const pe of profileEndpoints) {
    if (!pe.appSecretIsSet) {
      issues.push({
        severity: 'high',
        code: 'APP_SECRET_MISSING',
        env: pe.appSecretEnvVar,
        meaning:
          'POST od Mete bez ispravnog potpisa na ovaj profil može dobiti 403 — Meta može i dalje prikazati „success” u UI ako je drugdje prošlo.'
      });
    }
  }
  if (!process.env.FACEBOOK_APP_SECRET && mountedProfiles.length === 0) {
    issues.push({
      severity: 'medium',
      code: 'DEFAULT_WEBHOOK_SECRET',
      meaning: 'Koristi se samo /webhook; FACEBOOK_APP_SECRET prazan → potpis se ne provjerava (dev).'
    });
  }

  res.status(200).json({
    title: 'Webhook dijagnostika (bez tajni)',
    deployRevision: process.env.RENDER_GIT_COMMIT || null,
    requestHost: host,
    metaCallbackUrlMustMatchExactlyOneOf: [
      ...profileEndpoints.map((x) => x.fullUrl),
      defaultEndpoint.fullUrl
    ],
    noteOrder:
      'Ako koristiš META_WEBHOOK_PROFILES=messenger, Meta Callback URL mora biti puni URL koji završava na /webhook/messenger — znak po znak kao fullUrl ispod.',
    profileMounts: profileEndpoints,
    defaultWebhookMount: defaultEndpoint,
    browserGetExplains400:
      'Otvaranje /webhook ili /webhook/messenger u adresnoj traci šalje GET bez hub.mode & hub.verify_token → ovaj servis vraća 400 Bad Request. To je normalno; Meta verify koristi GET s query parametrima.',
    howToReadRenderLogs: {
      '[http] POST /webhook/...': 'Zahtjev je stigao do Nodea.',
      '[webhook-route]': 'Isti zahtjev (dupli marker za /webhook putanje).',
      WEBHOOK_IN: 'Tijelo POST-a je pročitano (barem djelomično).',
      'WEBHOOK_JSON_INVALID': 'Tijelo nije valjani JSON.',
      'Invalid X-Hub-Signature-256': 'POST je stigao, ali App Secret na Renderu ≠ App Secret u Meta Developer aplikaciji.',
      only_GET_health_or_slash:
        'Nema POST od Mete u tom intervalu — ili Meta ne šalje na ovaj host/path, ili gledaš krivi log/vremenski prozor.'
    },
    selfTestWithoutMeta: {
      step1: `POST ${base}/admin/api/debug/post-echo s headerom Authorization: Bearer <ADMIN_PANEL_TOKEN> i tijelom {}`,
      step2: 'U Render Logs mora se pojaviti [admin-debug] POST echo — ako da, POST do Rendera radi; ako ne, problem je izvan ovog app-a.',
      step3:
        'Zatim usporedi Meta Callback URL s metaCallbackUrlMustMatchExactlyOneOf — mora biti identičan puni URL za tvoj profil.'
    },
    issuesFound: issues.length ? issues : [{ severity: 'ok', meaning: 'Nema očitih missing-secret problema za profile iznad (provjeri ručno da secret odgovara Meta app-u).' }]
  });
});

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
      logTag: `webhook:${profile}`,
      profile
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

app.use('/admin', createAdminRouter());

app.use(express.json({ limit: '2mb' }));
app.use('/api/v1', createIngestRouter());

app.get('/', (_req, res) => {
  res.status(200).json({
    service: 'uslugar-webhooks',
    paths: {
      health: '/health',
      admin: '/admin/',
      webhookDefault: '/webhook',
      webhookMessenger: '/webhook/messenger',
      webhookDiagnostic: '/debug/webhook-diagnostic'
    },
    note: 'Meta Callback URL mora točno odgovarati jednoj od webhook putanja.'
  });
});

app.use((_req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  const mountedProfiles = parseWebhookProfiles().filter(
    (p) => process.env[`${metaEnvPrefix(p)}_VERIFY_TOKEN`]
  );
  const usesMetaProfilesOnly = mountedProfiles.length > 0;

  console.log(`Listening on http://localhost:${PORT}`);
  if (process.env.RENDER_GIT_COMMIT) {
    console.log(`Deploy revision: ${process.env.RENDER_GIT_COMMIT}`);
  } else {
    console.log('Deploy revision: (lokalno — na Renderu se ispisuje RENDER_GIT_COMMIT nakon deploya)');
  }
  console.log(`Meta webhook (default): GET/POST http://localhost:${PORT}/webhook`);
  for (const profile of mountedProfiles) {
    console.log(`Meta webhook (${profile}): GET/POST http://localhost:${PORT}/webhook/${profile}`);
  }
  console.log(`Ingest API: POST http://localhost:${PORT}/api/v1/messages (header X-Ingest-Key)`);
  console.log(`Ingest send: POST http://localhost:${PORT}/api/v1/messenger/send`);
  getMessengerOutboundApprovalState()
    .then((s) => {
      const src = s.fromDb !== null ? 'database' : 'environment';
      console.log(
        `Messenger outbound approval: effective=${s.effective} (source=${src}, env MESSENGER_OUTBOUND_REQUIRE_APPROVAL=${s.envVal})`
      );
    })
    .catch(() => {
      if (String(process.env.MESSENGER_OUTBOUND_REQUIRE_APPROVAL || '').trim()) {
        const v = process.env.MESSENGER_OUTBOUND_REQUIRE_APPROVAL;
        console.log(`Messenger outbound approval queue (env only): MESSENGER_OUTBOUND_REQUIRE_APPROVAL=${v}`);
      }
    });
  console.log(`Ingest automation: GET http://localhost:${PORT}/api/v1/automation/paused?pageId=&userId=`);
  console.log(`Admin send: POST http://localhost:${PORT}/admin/api/send/messenger`);
  console.log(`Admin panel: GET http://localhost:${PORT}/admin/ (requires ADMIN_PANEL_TOKEN)`);
  console.log(`Root (info JSON): GET http://localhost:${PORT}/`);
  console.log(`Debug (bez tajni): GET http://localhost:${PORT}/debug/webhook-info`);
  console.log(`Dijagnostika (bez tajni): GET http://localhost:${PORT}/debug/webhook-diagnostic`);
  console.log(
    `HTTP log: [http] za svaki zahtjev osim GET /health. Webhook od Mete = POST /webhook — ako u logu imaš samo GET, Meta još nije poslala POST ili Callback URL u Meta konzoli ne poklapa se s ovim servisom.`
  );
  if (!hasAnyDatabaseUrl()) {
    console.warn(
      'No DATABASE_URL and no META_<PROFILE>_DATABASE_URL — webhook persistence will fail until one is set.'
    );
  } else if (!process.env.DATABASE_URL && !usesMetaProfilesOnly) {
    console.warn(
      'DATABASE_URL not set — default /webhook, ingest API, and prompts need the default DB client.'
    );
  }
  for (const profile of mountedProfiles) {
    const prefix = metaEnvPrefix(profile);
    if (!process.env[`${prefix}_APP_SECRET`]) {
      console.warn(
        `${prefix}_APP_SECRET not set — POST /webhook/${profile} accepts unsigned bodies (dev only).`
      );
    }
  }
  if (!usesMetaProfilesOnly) {
    if (!process.env.VERIFY_TOKEN) {
      console.warn(
        'VERIFY_TOKEN not set — default GET/POST /webhook uses a built-in fallback token (change in production).'
      );
    }
    if (!APP_SECRET) {
      console.warn(
        'FACEBOOK_APP_SECRET not set — default POST /webhook only: signature not verified (dev only).'
      );
    }
  }
  if (!process.env.INGEST_API_KEY) {
    console.warn('INGEST_API_KEY not set — /api/v1/* returns 503 until set.');
  }
  if (!process.env.ADMIN_PANEL_TOKEN) {
    console.warn('ADMIN_PANEL_TOKEN not set — admin JSON API returns 503 until set.');
  }
});
