/**
 * Minimalni HTTP server za Registar poslovnih subjekata.
 * - GET/POST /api/sudreg_token – OAuth token za Sudski registar.
 * - GET /api/sudreg?endpoint=<name>&... – jedan proxy prema Sudreg API-ju; endpoint = naziv resursa (npr. subjekti, detalji_subjekta, sudovi). Svi ostali query parametri (snapshot_id, limit, offset, no_data_error, omit_nulls, expand_relations, history_columns, tip_identifikatora, identifikator, only_active, tvrtka_naziv) prosljeđuju se API-ju.
 *   Dokumentacija: https://sudreg-data.gov.hr/api/javni/dokumentacija/open_api
 * - GET /api/sudreg_expected_counts?snapshot_id=<id> – čitanje iz baze (rps_sudreg_expected_counts). Opcionalno: endpoint, limit, offset.
 * - POST /api/sudreg_expected_counts?snapshot_id=<id> – dohvat X-Total-Count s Sudreg API-ja i upis u rps_sudreg_expected_counts. Zahtijeva API ključ.
 * - POST /api/sudreg_sync_promjene?snapshot_id=<id> – poziv Sudreg /promjene; stanje synca u rps_sudreg_sync_glava. Zahtijeva API ključ.
 * - POST /api/sudreg_sync_entiteti?snapshot_id=<id> – sync entitetskih tablica (subjekti, tvrtke, …) za zadani snapshot. Zahtijeva API ključ.
 * - POST /api/sudreg_cron_daily – prvo expected_counts, zatim sync šifrarnika, pa sync entiteti. Za vanjski cron. 202 u pozadini; ?wait=1 čeka rezultat.
 * - GET /api/sudreg_cron_daily/status – status zadnjeg pokretanja (startedAt, finishedAt, status, summary, currentPhase, currentEndpoint).
 * - POST /api/sudreg_cron_daily/stop – zaustavi tekući sync (API ključ). Tekući job prekida na sljedećem provjerom.
 * - POST /api/sudreg_cron_daily/rollback – zaustavi sync i obriši sve podatke iz sudreg_% i rps_sudreg_% tablica (API ključ).
 */
const http = require('http');
const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;
/** API ključ za upis u bazu (POST expected_counts, budući sync). Ako nije postavljen, upis je onemogućen. */
const SUDREG_WRITE_API_KEY = process.env.SUDREG_WRITE_API_KEY || '';
const SUDREG_API_BASE = process.env.SUDREG_API_BASE || 'https://sudreg-data.gov.hr/api/javni';
const SUDREG_TOKEN_URL = process.env.SUDREG_TOKEN_URL || 'https://sudreg-data.gov.hr/api/oauth/token';
const SUDREG_CLIENT_ID = process.env.SUDREG_CLIENT_ID || '';
const SUDREG_CLIENT_SECRET = process.env.SUDREG_CLIENT_SECRET || '';

/** Dozvoljeni nazivi endpointa prema OpenAPI (paths bez leading slash). */
const SUDREG_ALLOWED_ENDPOINTS = new Set([
  'postupci', 'tvrtke', 'skracene_tvrtke', 'prijevodi_tvrtki', 'prijevodi_skracenih_tvrtki', 'inozemni_registri',
  'sjedista', 'email_adrese', 'pravni_oblici', 'pretezite_djelatnosti', 'predmeti_poslovanja', 'evidencijske_djelatnosti',
  'temeljni_kapitali', 'nazivi_podruznica', 'skraceni_nazivi_podruznica', 'sjedista_podruznica', 'email_adrese_podruznica',
  'djelatnosti_podruznica', 'statusni_postupci', 'partneri_statusnih_postupaka', 'objave_priopcenja', 'gfi', 'promjene',
  'subjekti', 'counts', 'snapshots', 'bris_pravni_oblici', 'bris_registri', 'drzave', 'jezici',
  'nacionalna_klasifikacija_djelatnosti', 'statusi', 'sudovi', 'valute', 'vrste_gfi_dokumenata', 'vrste_postupaka',
  'vrste_pravnih_oblika', 'vrste_statusnih_postupaka', 'detalji_subjekta',
]);

/** Endpointi za koje se dohvaća expected count (list-endpointi; isključeni detalji_subjekta, snapshots). */
const SUDREG_EXPECTED_COUNT_ENDPOINTS = [...SUDREG_ALLOWED_ENDPOINTS]
  .filter((e) => e !== 'detalji_subjekta' && e !== 'snapshots')
  .sort();

/** Šifrarnici koje punimo na početku cron joba (redoslijed: prvo neovisni, zatim ovisni). */
const SIFRARNIK_ENDPOINTS = [
  'drzave', 'vrste_pravnih_oblika', 'nacionalna_klasifikacija_djelatnosti',
  'sudovi', 'valute', 'vrste_postupaka',
  'bris_pravni_oblici', 'bris_registri',
];

const SIFRARNIK_PAGE_SIZE = 5000;

/** Entitetski endpointi za sync (punjenje s glava_id i snapshot_id). Redoslijed: subjekti prvo (ostalo ovisi o mbs). */
const ENTITY_ENDPOINTS = [
  'subjekti', 'tvrtke', 'skracene_tvrtke', 'sjedista', 'email_adrese',
  'postupci', 'pravni_oblici', 'pretezite_djelatnosti', 'predmeti_poslovanja',
  'evidencijske_djelatnosti', 'temeljni_kapitali',
];
const ENTITY_PAGE_SIZE = 1000;

/** Broj redaka po transakciji (manje = manji timeout rizik, više = manje round-tripova). */
const SYNC_CHUNK_SIZE = 500;

/** Timeout jedne transakcije u syncu (ms). Mora biti dovoljno za chunk od SYNC_CHUNK_SIZE redaka. */
const SYNC_TX_TIMEOUT_MS = 300000;

let tokenCache = { access_token: null, expiresAt: 0 };

/** Je li greška zbog prekinute veze / nedostupne baze (retry ima smisla). */
function isConnectionError(err) {
  const msg = (err && err.message) ? String(err.message) : '';
  return /closed the connection|Can't reach database server|ECONNRESET|ECONNREFUSED|connection.*closed/i.test(msg)
    || (err && (err.code === 'P1001' || err.code === 'P1017' || err.code === 'P2028'));
}

/** Osiguraj živu vezu prema bazi (nakon dugog joba Render/DB može prekinuti vezu). */
async function ensureDbConnection() {
  try {
    await prisma.$connect();
  } catch (e) {
    await prisma.$disconnect().catch(() => {});
    await new Promise((r) => setTimeout(r, 2000));
    await prisma.$connect();
  }
}

/** Zadnje pokretanje cron_daily (da se zna je li gotov i koji je rezultat). */
let lastCronDailyRun = {
  startedAt: null,
  finishedAt: null,
  status: 'idle', // idle | running | ok | error
  summary: null,
  currentPhase: null,   // 'expected_counts' | 'sync_sifrarnici' | 'sync_entiteti'
  currentEndpoint: null, // točan endpoint iz dokumentacije (npr. 'subjekti', 'drzave')
};

/** Postavi na true da tekući sync job prekine što prije (na sljedećem provjerom). */
let cronDailyShouldStop = false;

function fetchSudregToken() {
  return new Promise((resolve, reject) => {
    if (!SUDREG_CLIENT_ID || !SUDREG_CLIENT_SECRET) {
      reject(new Error('SUDREG_CLIENT_ID and SUDREG_CLIENT_SECRET must be set'));
      return;
    }
    const url = new URL(SUDREG_TOKEN_URL);
    const auth = Buffer.from(`${SUDREG_CLIENT_ID}:${SUDREG_CLIENT_SECRET}`).toString('base64');
    const body = 'grant_type=client_credentials';
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(json.error_description || json.error || data || `HTTP ${res.statusCode}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error(data || e.message));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function getSudregToken() {
  const now = Date.now();
  if (tokenCache.access_token && tokenCache.expiresAt > now + 5 * 60 * 1000) {
    return tokenCache.access_token;
  }
  const json = await fetchSudregToken();
  tokenCache = {
    access_token: json.access_token,
    expiresAt: Date.now() + (Number(json.expires_in) || 21600) * 1000,
  };
  return tokenCache.access_token;
}

/** Nakon 401 od API-ja pozovi prije ponovnog dohvata tokena. */
function invalidateSudregToken() {
  tokenCache = { access_token: null, expiresAt: 0 };
}

/**
 * Skraćuje string na maxLen znakova za response_preview.
 */
function truncatePreview(value, maxLen = 1024) {
  if (value == null) return null;
  const s = typeof value === 'string' ? value : JSON.stringify(value);
  return s.length <= maxLen ? s : s.slice(0, maxLen - 3) + '...';
}

/**
 * GET zahtjev prema Sudreg API-ju. path = npr. 'subjekti' ili 'detalji_subjekta', queryString = ostali parametri.
 * opts = { clientIp, userAgent } za logiranje u rps_sudreg_api_request_log (opcionalno).
 */
function proxySudregGet(path, queryString, token, opts = {}) {
  const startMs = Date.now();
  const logMeta = { clientIp: opts.clientIp ?? null, userAgent: opts.userAgent ?? null };

  return new Promise((resolve, reject) => {
    const base = SUDREG_API_BASE.replace(/\/$/, '');
    const qs = queryString ? `?${queryString}` : '';
    const targetPath = `${base}/${path}${qs}`;
    const u = new URL(targetPath);
    const reqOpts = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };
    const req = https.request(reqOpts, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const durationMs = Date.now() - startMs;
        const h = res.headers;
        const outHeaders = {};
        if (h['x-snapshot-id'] != null) outHeaders['X-Snapshot-Id'] = h['x-snapshot-id'];
        if (h['x-timestamp'] != null) outHeaders['X-Timestamp'] = h['x-timestamp'];
        if (h['x-total-count'] != null) outHeaders['X-Total-Count'] = h['x-total-count'];
        if (h['x-seconds-elapsed'] != null) outHeaders['X-Seconds-Elapsed'] = h['x-seconds-elapsed'];
        if (h['x-rows-returned'] != null) outHeaders['X-Rows-Returned'] = h['x-rows-returned'];
        if (h['x-log-id'] != null) outHeaders['X-Log-Id'] = h['x-log-id'];
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (_) {
          parsed = body;
        }
        const responsePreview = truncatePreview(parsed);
        prisma.apiRequestLog
          .create({
            data: {
              method: 'GET',
              path: path,
              queryString: queryString || null,
              statusCode: res.statusCode,
              durationMs,
              clientIp: logMeta.clientIp,
              userAgent: logMeta.userAgent,
              responsePreview,
            },
          })
          .catch((err) => console.error('rps_sudreg_api_request_log create', err));
        resolve({
          statusCode: res.statusCode,
          body: parsed,
          headers: outHeaders,
        });
      });
    });
    req.on('error', (err) => {
      const durationMs = Date.now() - startMs;
      prisma.apiRequestLog
        .create({
          data: {
            method: 'GET',
            path: path,
            queryString: queryString || null,
            statusCode: 0,
            durationMs,
            clientIp: logMeta.clientIp,
            userAgent: logMeta.userAgent,
            responsePreview: truncatePreview(err.message),
          },
        })
        .catch((e) => console.error('rps_sudreg_api_request_log create', e));
      reject(err);
    });
    req.end();
  });
}

/**
 * Provjera API ključa za endpointe koji pišu u bazu.
 * Ključ u headeru: X-API-Key: <key> ili Authorization: Bearer <key>.
 * Vraća { allowed, status, message }.
 */
function checkWriteApiKey(req) {
  if (!SUDREG_WRITE_API_KEY) {
    return { allowed: false, status: 503, message: 'Write API key not configured (SUDREG_WRITE_API_KEY).' };
  }
  const h = req.headers || {};
  const key = h['x-api-key'] || (typeof h.authorization === 'string' && h.authorization.startsWith('Bearer ')
    ? h.authorization.slice(7).trim()
    : '');
  if (!key || key !== SUDREG_WRITE_API_KEY) {
    return { allowed: false, status: 401, message: 'Missing or invalid API key for write operations.' };
  }
  return { allowed: true };
}

/**
 * Punjenje šifrarnika za zadani snapshot_id. Dohvaća svaki SIFRARNIK_ENDPOINTS i upsert u odgovarajuću tablicu.
 * @param {number} snapshotId
 * @returns {Promise<{ ok: boolean, endpoints: Record<string, { rows: number, error?: string }> }>}
 */
async function runSyncSifrarnici(snapshotId) {
  let token = await getSudregToken();
  const qs = `snapshot_id=${snapshotId}&limit=${SIFRARNIK_PAGE_SIZE}&no_data_error=0`;
  const results = {};

  for (const endpoint of SIFRARNIK_ENDPOINTS) {
    if (cronDailyShouldStop) return { ok: true, endpoints: results, stopped: true };
    lastCronDailyRun.currentEndpoint = endpoint;
    let glavaId = null;
    try {
      const glava = await prisma.sudregSyncGlava.upsert({
        where: { snapshotId_tipEntiteta: { snapshotId: BigInt(snapshotId), tipEntiteta: endpoint } },
        create: {
          snapshotId: BigInt(snapshotId),
          tipEntiteta: endpoint,
          status: 'u_tijeku',
          vrijemePocetka: new Date(),
        },
        update: { status: 'u_tijeku', vrijemePocetka: new Date() },
      });
      glavaId = glava.id;
      const expectedRow = await prisma.sudregExpectedCount.findUnique({
        where: { endpoint_snapshotId: { endpoint, snapshotId: BigInt(snapshotId) } },
      });
      if (expectedRow != null && glava.expectedCount === null) {
        await prisma.sudregSyncGlava.update({
          where: { id: glavaId },
          data: { expectedCount: expectedRow.totalCount },
        });
      }

      let result = await proxySudregGet(endpoint, qs, token);
      if (result.statusCode === 401) {
        invalidateSudregToken();
        token = await getSudregToken();
        result = await proxySudregGet(endpoint, qs, token);
      }
      if (result.statusCode !== 200) {
        await prisma.sudregSyncGlava.update({
          where: { id: glavaId },
          data: { status: 'greska', greska: `HTTP ${result.statusCode}` },
        });
        results[endpoint] = { rows: 0, error: `HTTP ${result.statusCode}` };
        continue;
      }
      const page = Array.isArray(result.body) ? result.body : [];
      let written = 0;
      for (let start = 0; start < page.length; start += SYNC_CHUNK_SIZE) {
        const chunk = page.slice(start, start + SYNC_CHUNK_SIZE);
        const chunkWritten = await prisma.$transaction(async (tx) => {
          let n = 0;
      if (endpoint === 'drzave') {
        for (const row of chunk) {
          if (row == null || row.id == null) continue;
          await tx.drzave.upsert({
            where: { id: BigInt(row.id) },
            create: {
              id: BigInt(row.id),
              sifra: String(row.sifra ?? ''),
              naziv: String(row.naziv ?? ''),
              oznaka2: row.oznaka_2 != null ? String(row.oznaka_2) : null,
              oznaka3: row.oznaka_3 != null ? String(row.oznaka_3) : null,
              glavaId,
            },
            update: {
              sifra: String(row.sifra ?? ''),
              naziv: String(row.naziv ?? ''),
              oznaka2: row.oznaka_2 != null ? String(row.oznaka_2) : null,
              oznaka3: row.oznaka_3 != null ? String(row.oznaka_3) : null,
              glavaId,
            },
          });
          n++;
        }
      } else if (endpoint === 'sudovi') {
        for (const row of chunk) {
          if (row == null || row.id == null) continue;
          await tx.sudovi.upsert({
            where: { id: BigInt(row.id) },
            create: {
              id: BigInt(row.id),
              sifra: String(row.sifra ?? ''),
              naziv: String(row.naziv ?? ''),
              sifraZupanije: row.sifra_zupanije != null ? row.sifra_zupanije : null,
              nazivZupanije: row.naziv_zupanije != null ? String(row.naziv_zupanije) : null,
              glavaId,
            },
            update: {
              sifra: String(row.sifra ?? ''),
              naziv: String(row.naziv ?? ''),
              sifraZupanije: row.sifra_zupanije != null ? row.sifra_zupanije : null,
              nazivZupanije: row.naziv_zupanije != null ? String(row.naziv_zupanije) : null,
              glavaId,
            },
          });
          n++;
        }
      } else if (endpoint === 'valute') {
        for (const row of chunk) {
          if (row == null || row.id == null) continue;
          await tx.valute.upsert({
            where: { id: BigInt(row.id) },
            create: {
              id: BigInt(row.id),
              sifra: String(row.sifra ?? ''),
              naziv: String(row.naziv ?? ''),
              drzavaId: row.drzava_id != null ? BigInt(row.drzava_id) : null,
              glavaId,
            },
            update: {
              sifra: String(row.sifra ?? ''),
              naziv: String(row.naziv ?? ''),
              drzavaId: row.drzava_id != null ? BigInt(row.drzava_id) : null,
              glavaId,
            },
          });
          n++;
        }
      } else if (endpoint === 'vrste_pravnih_oblika') {
        for (const row of chunk) {
          if (row == null || row.id == null) continue;
          await tx.vrstePravnihOblika.upsert({
            where: { id: BigInt(row.id) },
            create: {
              id: BigInt(row.id),
              sifra: String(row.sifra ?? ''),
              naziv: String(row.naziv ?? ''),
              kratica: row.kratica != null ? String(row.kratica) : null,
              glavaId,
            },
            update: {
              sifra: String(row.sifra ?? ''),
              naziv: String(row.naziv ?? ''),
              kratica: row.kratica != null ? String(row.kratica) : null,
              glavaId,
            },
          });
          n++;
        }
      } else if (endpoint === 'nacionalna_klasifikacija_djelatnosti') {
        for (const row of chunk) {
          if (row == null || row.id == null) continue;
          await tx.nacionalnaKlasifikacijaDjelatnosti.upsert({
            where: { id: BigInt(row.id) },
            create: {
              id: BigInt(row.id),
              sifra: String(row.sifra ?? ''),
              puniNaziv: row.puni_naziv != null ? String(row.puni_naziv) : null,
              verzija: row.verzija != null ? String(row.verzija) : null,
              glavaId,
            },
            update: {
              sifra: String(row.sifra ?? ''),
              puniNaziv: row.puni_naziv != null ? String(row.puni_naziv) : null,
              verzija: row.verzija != null ? String(row.verzija) : null,
              glavaId,
            },
          });
          n++;
        }
      } else if (endpoint === 'vrste_postupaka') {
        for (const row of chunk) {
          if (row == null || (row.postupak == null && row.id == null)) continue;
          const postupak = row.postupak != null ? row.postupak : row.id;
          if (postupak == null) continue;
          await tx.vrstePostupaka.upsert({
            where: { postupak: Number(postupak) },
            create: {
              postupak: Number(postupak),
              znacenje: String(row.znacenje ?? ''),
              glavaId,
            },
            update: { znacenje: String(row.znacenje ?? ''), glavaId },
          });
          n++;
        }
      } else if (endpoint === 'bris_pravni_oblici') {
        const sid = BigInt(snapshotId);
        for (const row of chunk) {
          if (row == null || row.bris_kod == null) continue;
          await tx.brisPravniOblici.upsert({
            where: { snapshotId_brisKod: { snapshotId: sid, brisKod: String(row.bris_kod) } },
            create: {
              snapshotId: sid,
              brisKod: String(row.bris_kod),
              kratica: row.kratica != null ? String(row.kratica) : null,
              naziv: String(row.naziv ?? ''),
              drzavaId: BigInt(row.drzava_id ?? 0),
              vrstaPravnogOblikaId: row.vrsta_pravnog_oblika_id != null ? BigInt(row.vrsta_pravnog_oblika_id) : null,
              status: Number(row.status ?? 0),
              glavaId,
            },
            update: {
              kratica: row.kratica != null ? String(row.kratica) : null,
              naziv: String(row.naziv ?? ''),
              drzavaId: BigInt(row.drzava_id ?? 0),
              vrstaPravnogOblikaId: row.vrsta_pravnog_oblika_id != null ? BigInt(row.vrsta_pravnog_oblika_id) : null,
              status: Number(row.status ?? 0),
              glavaId,
            },
          });
          n++;
        }
      } else if (endpoint === 'bris_registri') {
        const sid = BigInt(snapshotId);
        for (const row of chunk) {
          if (row == null || row.identifikator == null) continue;
          await tx.brisRegistri.upsert({
            where: { snapshotId_identifikator: { snapshotId: sid, identifikator: String(row.identifikator) } },
            create: {
              snapshotId: sid,
              identifikator: String(row.identifikator),
              naziv: String(row.naziv ?? ''),
              drzavaId: BigInt(row.drzava_id ?? 0),
              status: Number(row.status ?? 0),
              glavaId,
            },
            update: {
              naziv: String(row.naziv ?? ''),
              drzavaId: BigInt(row.drzava_id ?? 0),
              status: Number(row.status ?? 0),
              glavaId,
            },
          });
          n++;
        }
      }
          return n;
        }, { timeout: SYNC_TX_TIMEOUT_MS });
        written += chunkWritten;
      }
      await prisma.sudregSyncGlava.update({
        where: { id: glavaId },
        data: { status: 'ok', actualCount: BigInt(written), vrijemeZavrsetka: new Date() },
      });
      results[endpoint] = { rows: written };
    } catch (err) {
      console.error(`sync_sifrarnici ${endpoint}`, err);
      if (glavaId != null) {
        await prisma.sudregSyncGlava.update({
          where: { id: glavaId },
          data: { status: 'greska', greska: err.message },
        }).catch(() => {});
      }
      results[endpoint] = { rows: 0, error: err.message };
    }
  }

  return { ok: true, endpoints: results };
}

/**
 * Punjenje entitetskih tablica za zadani snapshot_id. Za svaki ENTITY_ENDPOINTS dohvaća podatke i upsert u tablicu
 * s postavljenim glava_id i snapshot_id (te updated_at/modified_at preko Prisma @updatedAt).
 * @param {number} snapshotId
 * @returns {Promise<{ ok: boolean, endpoints: Record<string, { rows: number, error?: string }> }>}
 */
async function runSyncEntiteti(snapshotId) {
  let token = await getSudregToken();
  const sid = BigInt(snapshotId);
  const results = {};

  for (const endpoint of ENTITY_ENDPOINTS) {
    if (cronDailyShouldStop) return { ok: true, endpoints: results, stopped: true };
    lastCronDailyRun.currentEndpoint = endpoint;
    let glavaId = null;
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          await ensureDbConnection();
          await new Promise((r) => setTimeout(r, 2000));
          console.log('sync_entiteti retry', endpoint);
        } else {
          await ensureDbConnection();
        }
        const glava = await prisma.sudregSyncGlava.upsert({
        where: { snapshotId_tipEntiteta: { snapshotId: sid, tipEntiteta: endpoint } },
        create: {
          snapshotId: sid,
          tipEntiteta: endpoint,
          status: 'u_tijeku',
          vrijemePocetka: new Date(),
        },
        update: { status: 'u_tijeku', vrijemePocetka: new Date() },
      });
      glavaId = glava.id;
      const expectedRow = await prisma.sudregExpectedCount.findUnique({
        where: { endpoint_snapshotId: { endpoint, snapshotId: sid } },
      });
      if (expectedRow != null && glava.expectedCount === null) {
        await prisma.sudregSyncGlava.update({
          where: { id: glavaId },
          data: { expectedCount: expectedRow.totalCount },
        });
      }

      let totalWritten = glava.actualCount != null ? Number(glava.actualCount) : 0;
      let offset = glava.nextOffsetToFetch != null && glava.nextOffsetToFetch >= 0
        ? Number(glava.nextOffsetToFetch)
        : 0;
      let hasMore = true;
      while (hasMore) {
        if (cronDailyShouldStop) {
          await prisma.sudregSyncGlava.update({
            where: { id: glavaId },
            data: { status: 'greska', greska: 'stopped' },
          }).catch(() => {});
          results[endpoint] = { rows: totalWritten, stopped: true };
          return { ok: true, endpoints: results, stopped: true };
        }
        const qs = endpoint === 'subjekti'
          ? `snapshot_id=${snapshotId}&offset=${offset}&limit=${ENTITY_PAGE_SIZE}&no_data_error=0&only_active=false`
          : `snapshot_id=${snapshotId}&offset=${offset}&limit=${ENTITY_PAGE_SIZE}&no_data_error=0`;
        let result = await proxySudregGet(endpoint, qs, token);
        if (result.statusCode === 401) {
          invalidateSudregToken();
          token = await getSudregToken();
          result = await proxySudregGet(endpoint, qs, token);
        }
        if (result.statusCode !== 200) {
          await prisma.sudregSyncGlava.update({
            where: { id: glavaId },
            data: { status: 'greska', greska: `HTTP ${result.statusCode}` },
          });
          results[endpoint] = { rows: totalWritten, error: `HTTP ${result.statusCode}` };
          break;
        }
        const page = Array.isArray(result.body) ? result.body : [];
        const dataSnapGlavaBase = { snapshotId: sid, glavaId };
        for (let chunkStart = 0; chunkStart < page.length; chunkStart += SYNC_CHUNK_SIZE) {
          const chunk = page.slice(chunkStart, chunkStart + SYNC_CHUNK_SIZE);
          const chunkWritten = await prisma.$transaction(async (tx) => {
            let n = 0;
        if (endpoint === 'subjekti') {
          for (let i = 0; i < chunk.length; i++) {
            const row = chunk[i];
            if (row == null || (row.mbs == null && row.id == null)) continue;
            const mbs = row.mbs != null ? BigInt(row.mbs) : BigInt(row.id);
            const upd = {
              ...dataSnapGlavaBase,
              redniBrojUSetu: BigInt(offset + chunkStart + i),
              oib: row.oib != null ? String(row.oib) : null,
              status: row.status != null ? Number(row.status) : null,
              inoPodruznica: row.ino_podruznica != null ? Number(row.ino_podruznica) : null,
              postupak: row.postupak != null ? Number(row.postupak) : null,
              datumOsnivanja: row.datum_osnivanja != null ? new Date(row.datum_osnivanja) : null,
              datumBrisanja: row.datum_brisanja != null ? new Date(row.datum_brisanja) : null,
              sudIdNadlezan: row.sud_id_nadlezan != null ? BigInt(row.sud_id_nadlezan) : null,
              sudIdSluzba: row.sud_id_sluzba != null ? BigInt(row.sud_id_sluzba) : null,
              mb: row.mb != null ? Number(row.mb) : null,
              stecajnaMasa: row.stecajna_masa != null ? Number(row.stecajna_masa) : null,
              likvidacijskaMasa: row.likvidacijska_masa != null ? Number(row.likvidacijska_masa) : null,
              mbsBrisanogSubjekta: row.mbs_brisanog_subjekta != null ? BigInt(row.mbs_brisanog_subjekta) : null,
              glavnaDjelatnost: row.glavna_djelatnost != null ? Number(row.glavna_djelatnost) : null,
              glavnaPodruznicaRbr: row.glavna_podruznica_rbr != null ? Number(row.glavna_podruznica_rbr) : null,
              sudIdBrisanja: row.sud_id_brisanja != null ? BigInt(row.sud_id_brisanja) : null,
              tvrtkaKodBrisanja: row.tvrtka_kod_brisanja != null ? String(row.tvrtka_kod_brisanja) : null,
              poslovniBrojBrisanja: row.poslovni_broj_brisanja != null ? String(row.poslovni_broj_brisanja) : null,
            };
            const r = await tx.subjekti.updateMany({ where: { mbs }, data: upd });
            if (r.count === 0) await tx.subjekti.create({ data: { mbs, ...upd } });
            n++;
          }
        } else if (endpoint === 'tvrtke') {
          for (let i = 0; i < chunk.length; i++) {
            const row = chunk[i];
            if (row == null) continue;
            const mbo = row.mbs != null ? BigInt(row.mbs) : (row.mbo != null ? BigInt(row.mbo) : null);
            if (mbo == null) continue;
            const upd = {
              ...dataSnapGlavaBase,
              redniBrojUSetu: BigInt(offset + chunkStart + i),
              ime: row.ime != null ? String(row.ime) : null,
              naznakaImena: row.naznaka_imena != null ? String(row.naznaka_imena) : null,
            };
            const r = await tx.tvrtke.updateMany({ where: { mbo }, data: upd });
            if (r.count === 0) await tx.tvrtke.create({ data: { mbo, ...upd } });
            n++;
          }
        } else if (endpoint === 'skracene_tvrtke') {
          for (let i = 0; i < chunk.length; i++) {
            const row = chunk[i];
            if (row == null) continue;
            const mbo = row.mbs != null ? BigInt(row.mbs) : (row.mbo != null ? BigInt(row.mbo) : null);
            if (mbo == null) continue;
            const upd = { ...dataSnapGlavaBase, redniBrojUSetu: BigInt(offset + chunkStart + i), ime: row.ime != null ? String(row.ime) : null };
            const r = await tx.skraceneTvrtke.updateMany({ where: { mbo }, data: upd });
            if (r.count === 0) await tx.skraceneTvrtke.create({ data: { mbo, ...upd } });
            n++;
          }
        } else if (endpoint === 'sjedista') {
          for (let i = 0; i < chunk.length; i++) {
            const row = chunk[i];
            if (row == null) continue;
            const mbo = row.mbs != null ? BigInt(row.mbs) : (row.mbo != null ? BigInt(row.mbo) : null);
            const redniBroj = row.redni_broj != null ? Number(row.redni_broj) : 1;
            if (mbo == null) continue;
            const upd = {
              ...dataSnapGlavaBase,
              redniBrojUSetu: BigInt(offset + chunkStart + i),
              drzavaId: row.drzava_id != null ? BigInt(row.drzava_id) : null,
              sifraZupanije: row.sifra_zupanije != null ? Number(row.sifra_zupanije) : null,
              nazivZupanije: row.naziv_zupanije != null ? String(row.naziv_zupanije) : null,
              sifraOpcine: row.sifra_opcine != null ? Number(row.sifra_opcine) : null,
              nazivOpcine: row.naziv_opcine != null ? String(row.naziv_opcine) : null,
              sifraNaselja: row.sifra_naselja != null ? BigInt(row.sifra_naselja) : null,
              nazivNaselja: row.naziv_naselja != null ? String(row.naziv_naselja) : null,
              naseljeVanSifrarnika: row.naselje_van_sifrarnika != null ? String(row.naselje_van_sifrarnika) : null,
              sifraUlice: row.sifra_ulice != null ? BigInt(row.sifra_ulice) : null,
              ulica: row.ulica != null ? String(row.ulica) : null,
              kucniBroj: row.kucni_broj != null ? Number(row.kucni_broj) : null,
              kucniPodbroj: row.kucni_podbroj != null ? String(row.kucni_podbroj) : null,
              postanskiBroj: row.postanski_broj != null ? Number(row.postanski_broj) : null,
            };
            const r = await tx.sjedista.updateMany({ where: { mbo, redniBroj }, data: upd });
            if (r.count === 0) await tx.sjedista.create({ data: { mbo, redniBroj, ...upd } });
            n++;
          }
        } else if (endpoint === 'email_adrese') {
          for (let i = 0; i < chunk.length; i++) {
            const row = chunk[i];
            if (row == null) continue;
            const mbo = row.mbs != null ? BigInt(row.mbs) : (row.mbo != null ? BigInt(row.mbo) : null);
            const emailRbr = row.email_adresa_rbr != null ? Number(row.email_adresa_rbr) : null;
            if (mbo == null) continue;
            const upd = {
              ...dataSnapGlavaBase,
              redniBrojUSetu: BigInt(offset + chunkStart + i),
              emailAdresaRbr: emailRbr,
              adresa: row.adresa != null ? String(row.adresa) : null,
            };
            const r = await tx.emailAdrese.updateMany({ where: { mbo, emailAdresaRbr: emailRbr }, data: upd });
            if (r.count === 0) await tx.emailAdrese.create({ data: { mbo, ...upd } });
            n++;
          }
        } else if (endpoint === 'postupci') {
          for (let i = 0; i < chunk.length; i++) {
            const row = chunk[i];
            if (row == null) continue;
            const mbo = row.mbs != null ? BigInt(row.mbs) : (row.mbo != null ? BigInt(row.mbo) : null);
            const postupak = row.postupak != null ? Number(row.postupak) : null;
            if (mbo == null) continue;
            const upd = {
              ...dataSnapGlavaBase,
              redniBrojUSetu: BigInt(offset + chunkStart + i),
              postupak,
              datumStecaja: row.datum_stecaja != null ? new Date(row.datum_stecaja) : null,
            };
            const r = await tx.postupci.updateMany({ where: { mbo, postupak }, data: upd });
            if (r.count === 0) await tx.postupci.create({ data: { mbo, ...upd } });
            n++;
          }
        } else if (endpoint === 'pravni_oblici') {
          for (let i = 0; i < chunk.length; i++) {
            const row = chunk[i];
            if (row == null) continue;
            const mbo = row.mbs != null ? BigInt(row.mbs) : (row.mbo != null ? BigInt(row.mbo) : null);
            if (mbo == null) continue;
            const upd = {
              ...dataSnapGlavaBase,
              redniBrojUSetu: BigInt(offset + chunkStart + i),
              vrstaPravnogOblikaId: row.vrsta_pravnog_oblika_id != null ? BigInt(row.vrsta_pravnog_oblika_id) : null,
            };
            const r = await tx.pravniOblici.updateMany({ where: { mbo }, data: upd });
            if (r.count === 0) await tx.pravniOblici.create({ data: { mbo, ...upd } });
            n++;
          }
        } else if (endpoint === 'pretezite_djelatnosti') {
          for (let i = 0; i < chunk.length; i++) {
            const row = chunk[i];
            if (row == null) continue;
            const mbo = row.mbs != null ? BigInt(row.mbs) : (row.mbo != null ? BigInt(row.mbo) : null);
            const redniBroj = row.redni_broj != null ? Number(row.redni_broj) : (row.djelatnost_rbr != null ? Number(row.djelatnost_rbr) : null);
            if (mbo == null) continue;
            const upd = {
              ...dataSnapGlavaBase,
              redniBrojUSetu: BigInt(offset + chunkStart + i),
              redniBroj,
              nacionalnaKlasifikacijaDjelatnostiId: row.nacionalna_klasifikacija_djelatnosti_id != null ? BigInt(row.nacionalna_klasifikacija_djelatnosti_id) : null,
              djelatnostTekst: row.djelatnost_tekst != null ? String(row.djelatnost_tekst) : null,
            };
            const r = await tx.preteziteDjelatnosti.updateMany({ where: { mbo, redniBroj }, data: upd });
            if (r.count === 0) await tx.preteziteDjelatnosti.create({ data: { mbo, ...upd } });
            n++;
          }
        } else if (endpoint === 'predmeti_poslovanja') {
          for (let i = 0; i < chunk.length; i++) {
            const row = chunk[i];
            if (row == null) continue;
            const mbo = row.mbs != null ? BigInt(row.mbs) : (row.mbo != null ? BigInt(row.mbo) : null);
            const redniBroj = row.redni_broj != null ? Number(row.redni_broj) : (row.djelatnost_rbr != null ? Number(row.djelatnost_rbr) : null);
            if (mbo == null) continue;
            const upd = {
              ...dataSnapGlavaBase,
              redniBrojUSetu: BigInt(offset + chunkStart + i),
              redniBroj,
              nacionalnaKlasifikacijaDjelatnostiId: row.nacionalna_klasifikacija_djelatnosti_id != null ? BigInt(row.nacionalna_klasifikacija_djelatnosti_id) : null,
              djelatnostTekst: row.djelatnost_tekst != null ? String(row.djelatnost_tekst) : null,
            };
            const r = await tx.predmetiPoslovanja.updateMany({ where: { mbo, redniBroj }, data: upd });
            if (r.count === 0) await tx.predmetiPoslovanja.create({ data: { mbo, ...upd } });
            n++;
          }
        } else if (endpoint === 'evidencijske_djelatnosti') {
          for (let i = 0; i < chunk.length; i++) {
            const row = chunk[i];
            if (row == null) continue;
            const mbo = row.mbs != null ? BigInt(row.mbs) : (row.mbo != null ? BigInt(row.mbo) : null);
            const redniBroj = row.redni_broj != null ? Number(row.redni_broj) : (row.djelatnost_rbr != null ? Number(row.djelatnost_rbr) : null);
            if (mbo == null) continue;
            const upd = {
              ...dataSnapGlavaBase,
              redniBrojUSetu: BigInt(offset + chunkStart + i),
              redniBroj,
              nacionalnaKlasifikacijaDjelatnostiId: row.nacionalna_klasifikacija_djelatnosti_id != null ? BigInt(row.nacionalna_klasifikacija_djelatnosti_id) : null,
              djelatnostTekst: row.djelatnost_tekst != null ? String(row.djelatnost_tekst) : null,
            };
            const r = await tx.evidencijskeDjelatnosti.updateMany({ where: { mbo, redniBroj }, data: upd });
            if (r.count === 0) await tx.evidencijskeDjelatnosti.create({ data: { mbo, ...upd } });
            n++;
          }
        } else if (endpoint === 'temeljni_kapitali') {
          for (let i = 0; i < chunk.length; i++) {
            const row = chunk[i];
            if (row == null) continue;
            const mbo = row.mbs != null ? BigInt(row.mbs) : (row.mbo != null ? BigInt(row.mbo) : null);
            const temeljniKapitalRbr = row.temeljni_kapital_rbr != null ? Number(row.temeljni_kapital_rbr) : null;
            if (mbo == null) continue;
            const upd = {
              ...dataSnapGlavaBase,
              redniBrojUSetu: BigInt(offset + chunkStart + i),
              temeljniKapitalRbr,
              valutaId: row.valuta_id != null ? BigInt(row.valuta_id) : null,
              iznos: row.iznos != null ? Number(row.iznos) : null,
            };
            const r = await tx.temeljniKapitali.updateMany({ where: { mbo, temeljniKapitalRbr }, data: upd });
            if (r.count === 0) await tx.temeljniKapitali.create({ data: { mbo, ...upd } });
            n++;
          }
        }

            return n;
          }, { timeout: SYNC_TX_TIMEOUT_MS });
          totalWritten += chunkWritten;
        }

        const nextOffset = offset + page.length;
        hasMore = page.length === ENTITY_PAGE_SIZE;
        offset = nextOffset;

        await prisma.sudregSyncGlava.update({
          where: { id: glavaId },
          data: {
            nextOffsetToFetch: hasMore ? BigInt(nextOffset) : null,
            actualCount: BigInt(totalWritten),
            ...(hasMore ? {} : { status: 'ok', vrijemeZavrsetka: new Date() }),
          },
        });
      }

      if (results[endpoint] == null) {
        results[endpoint] = { rows: totalWritten };
      }
        break;
    } catch (err) {
      lastError = err;
      if (attempt < 1 && isConnectionError(err)) continue;
      console.error(`sync_entiteti ${endpoint}`, err);
      if (glavaId != null) {
        await prisma.sudregSyncGlava.update({
          where: { id: glavaId },
          data: { status: 'greska', greska: err.message },
        }).catch(() => {});
      }
      results[endpoint] = { rows: 0, error: err.message };
      break;
    }
    }
    if (lastError != null && results[endpoint] == null) {
      results[endpoint] = { rows: 0, error: lastError.message };
    }
  }

  return { ok: true, endpoints: results };
}

/**
 * Logika cron_daily: prvo expected_counts (POST /api/sudreg_expected_counts), zatim sync_sifrarnici, pa sync_entiteti.
 * @returns {Promise<object>}
 */
async function runCronDailyWork() {
  console.log('cron_daily: start');
  cronDailyShouldStop = false;
  const summary = {
    expected_counts: null,
    sync_sifrarnici: null,
    sync_entiteti: null,
    error: null,
  };

  lastCronDailyRun.currentPhase = 'expected_counts';
  lastCronDailyRun.currentEndpoint = null;
  let ec;
  try {
    ec = await internalPost('/api/sudreg_expected_counts');
  } catch (err) {
    console.error('cron_daily: internalPost expected_counts failed', err.message);
    summary.error = err.message;
    lastCronDailyRun.currentPhase = null;
    lastCronDailyRun.currentEndpoint = null;
    return summary;
  }
  summary.expected_counts = {
    status: ec.statusCode,
    ok: ec.statusCode >= 200 && ec.statusCode < 400,
    snapshots_updated: ec.body?.snapshots_updated,
    snapshot_ids: ec.body?.snapshot_ids,
  };
  console.log('cron_daily: expected_counts', ec.statusCode, 'snapshots_updated=', ec.body?.snapshots_updated, 'ids=', ec.body?.snapshot_ids?.length ?? 0);
  if (ec.statusCode >= 400) {
    summary.error = ec.body?.message || ec.body?.error;
    console.error('cron_daily: expected_counts error', summary.error);
    lastCronDailyRun.currentPhase = null;
    lastCronDailyRun.currentEndpoint = null;
    return summary;
  }
  if (cronDailyShouldStop) {
    console.log('cron_daily: stopped by user (after expected_counts)');
    summary.error = 'stopped';
    lastCronDailyRun.currentPhase = null;
    lastCronDailyRun.currentEndpoint = null;
    return summary;
  }

  try {
    const token = await getSudregToken();
    lastCronDailyRun.currentPhase = 'sync_sifrarnici';
    lastCronDailyRun.currentEndpoint = null;
    const snapshotsResult = await proxySudregGet('snapshots', '', token);
    const snapshotsList = Array.isArray(snapshotsResult.body) ? snapshotsResult.body : [];
    // Samo zadnji (najveći) snapshot: to je trenutno stanje registra. Stariji snapshoti su povijesni;
    // punjenje svih snapshotova bi trajalo puno duže i zahtijevalo više resursa.
    const latestSnapshotId = snapshotsList.length > 0
      ? Math.max(...snapshotsList.map((s) => (s != null && (s.id != null || s.snapshot_id != null)) ? Number(s.id ?? s.snapshot_id) : -1).filter((n) => n >= 0))
      : null;
    console.log('cron_daily: snapshots from API', snapshotsList.length, 'latestSnapshotId=', latestSnapshotId);

    if (latestSnapshotId != null) {
      summary.sync_sifrarnici = await runSyncSifrarnici(latestSnapshotId);
      console.log('cron_daily: sync_sifrarnici', summary.sync_sifrarnici?.ok ? 'ok' : 'fail', summary.sync_sifrarnici?.stopped ? 'stopped' : '', summary.sync_sifrarnici?.error ?? '');
      if (cronDailyShouldStop) {
        summary.error = 'stopped';
        lastCronDailyRun.currentPhase = null;
        lastCronDailyRun.currentEndpoint = null;
        return summary;
      }
      await ensureDbConnection();
      lastCronDailyRun.currentPhase = 'sync_entiteti';
      lastCronDailyRun.currentEndpoint = null;
      try {
        summary.sync_entiteti = await runSyncEntiteti(latestSnapshotId);
        console.log('cron_daily: sync_entiteti', summary.sync_entiteti?.ok ? 'ok' : 'fail', summary.sync_entiteti?.stopped ? 'stopped' : '', summary.sync_entiteti?.error ?? '');
        if (summary.sync_entiteti?.stopped) summary.error = 'stopped';
      } catch (err) {
        console.error('runCronDailyWork sync_entiteti', err);
        summary.sync_entiteti = { ok: false, endpoints: {}, error: err.message };
      }
    } else {
      console.warn('cron_daily: nema snapshot_id iz API-ja, preskacem sync');
      summary.sync_sifrarnici = { ok: false, endpoints: {}, error: 'Nema snapshot_id iz API-ja' };
    }
  } catch (err) {
    console.error('runCronDailyWork sync_sifrarnici', err);
    summary.sync_sifrarnici = { ok: false, endpoints: {}, error: err.message };
  }

  console.log('cron_daily: done', JSON.stringify(summary));
  lastCronDailyRun.currentPhase = null;
  lastCronDailyRun.currentEndpoint = null;
  lastCronDailyRun.finishedAt = new Date().toISOString();
  lastCronDailyRun.status = summary.error ? 'error' : 'ok';
  lastCronDailyRun.summary = summary;
  return summary;
}

/**
 * Interni POST na ovaj server (loopback). Za cron_daily koristi ovo da pozove expected_counts.
 * @param {string} path - npr. '/api/sudreg_expected_counts'
 * @returns {Promise<{ statusCode: number, body: any }>}
 */
function internalPost(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port: PORT,
      path: path || '/',
      method: 'POST',
      headers: { 'X-API-Key': SUDREG_WRITE_API_KEY, 'Content-Length': 0 },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let body = data;
        try {
          body = JSON.parse(data);
        } catch (_) {}
        resolve({ statusCode: res.statusCode, body });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method;

  const sendJson = (status, obj) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
  };

  if (path === '/' || path === '/health') {
    sendJson(200, {
      service: 'registar-poslovnih-subjekata',
      status: 'ok',
    });
    return;
  }

  if (path === '/api/sudreg_token' && (method === 'GET' || method === 'POST')) {
    try {
      const tokenResponse = await fetchSudregToken();
      sendJson(200, tokenResponse);
    } catch (err) {
      const status = err.message.includes('SUDREG_CLIENT') ? 503 : 502;
      sendJson(status, { error: 'token_failed', message: err.message });
    }
    return;
  }

  if (path === '/api/sudreg' && method === 'GET') {
    const endpoint = url.searchParams.get('endpoint');
    if (!endpoint || !SUDREG_ALLOWED_ENDPOINTS.has(endpoint)) {
      sendJson(400, {
        error: 'invalid_endpoint',
        message: 'Obavezan parametar endpoint s jednim od dozvoljenih naziva (npr. subjekti, detalji_subjekta, sudovi). Dokumentacija: https://sudreg-data.gov.hr/api/javni/dokumentacija/open_api',
        allowed: [...SUDREG_ALLOWED_ENDPOINTS].sort(),
      });
      return;
    }
    const queryParams = [];
    for (const [key, value] of url.searchParams) {
      if (key !== 'endpoint' && value !== '') queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
    const queryString = queryParams.join('&');
    const clientIp = (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) || req.socket?.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;
    try {
      const token = await getSudregToken();
      const result = await proxySudregGet(endpoint, queryString, token, { clientIp, userAgent });
      const headers = { 'Content-Type': 'application/json; charset=utf-8', ...result.headers };
      res.writeHead(result.statusCode, headers);
      res.end(typeof result.body === 'string' ? result.body : JSON.stringify(result.body));
    } catch (err) {
      const status = err.message.includes('SUDREG_CLIENT') ? 503 : 502;
      sendJson(status, { error: 'proxy_failed', message: err.message });
    }
    return;
  }

  if (path === '/api/sudreg_expected_counts') {
    const snapshotIdParam = url.searchParams.get('snapshot_id');
    const snapshotId = snapshotIdParam ? parseInt(snapshotIdParam, 10) : NaN;
    if (method === 'GET') {
      if (!snapshotIdParam || !Number.isInteger(snapshotId) || snapshotId < 0) {
        sendJson(400, { error: 'snapshot_id_required', message: 'Obavezan parametar snapshot_id (cijeli broj >= 0).' });
        return;
      }
      const endpointParam = url.searchParams.get('endpoint');
      const limitParam = url.searchParams.get('limit');
      const offsetParam = url.searchParams.get('offset');
      const take = limitParam != null ? Math.min(parseInt(limitParam, 10) || 50, 500) : undefined;
      const skip = offsetParam != null ? Math.max(0, parseInt(offsetParam, 10) || 0) : undefined;
      const where = { snapshotId: BigInt(snapshotId) };
      if (endpointParam != null && endpointParam !== '') {
        where.endpoint = endpointParam;
      }
      prisma.sudregExpectedCount
        .findMany({
          where,
          orderBy: { endpoint: 'asc' },
          take,
          skip,
        })
        .then((rows) => {
          const countWhere = { snapshotId: BigInt(snapshotId) };
          if (endpointParam != null && endpointParam !== '') countWhere.endpoint = endpointParam;
          const totalPromise = take != null || skip != null
            ? prisma.sudregExpectedCount.count({ where: countWhere })
            : Promise.resolve(rows.length);
          return totalPromise.then((total) => {
            sendJson(200, {
              snapshot_id: snapshotId,
              items: rows.map((r) => ({
                endpoint: r.endpoint,
                total_count: Number(r.totalCount),
              })),
              total,
            });
          });
        })
        .catch((err) => {
          console.error('GET sudreg_expected_counts', err);
          sendJson(500, { error: 'db_error', message: err.message });
        });
      return;
    }
    if (method === 'POST') {
      const writeCheck = checkWriteApiKey(req);
      if (!writeCheck.allowed) {
        sendJson(writeCheck.status, { error: 'write_forbidden', message: writeCheck.message });
        return;
      }
      (async () => {
        try {
          const token = await getSudregToken();
          const snapshotsResult = await proxySudregGet('snapshots', '', token);
          const snapshotsList = Array.isArray(snapshotsResult.body) ? snapshotsResult.body : [];
          const maxSnapshotFromApi = snapshotsList.length > 0
            ? Math.max(...snapshotsList.map((s) => (s != null && (s.id != null || s.snapshot_id != null)) ? Number(s.id ?? s.snapshot_id) : -1).filter((n) => n >= 0))
            : -1;
          if (snapshotsList.length === 0) {
            console.warn('POST sudreg_expected_counts: API vratio praznu listu snapshots');
          }

          const runOneSnapshot = async (sid, forceSave = false) => {
            const results = [];
            for (const ep of SUDREG_EXPECTED_COUNT_ENDPOINTS) {
              const queryForCount = ep === 'subjekti'
                ? `snapshot_id=${sid}&offset=0&limit=0&no_data_error=0&only_active=false`
                : `snapshot_id=${sid}&offset=0&limit=0&no_data_error=0`;
              let totalCount = -1;
              try {
                const result = await proxySudregGet(ep, queryForCount, token);
                const h = result.headers['X-Total-Count'];
                if (result.statusCode === 200 && h != null) {
                  const n = parseInt(h, 10);
                  if (!Number.isNaN(n) && n >= 0) totalCount = n;
                }
              } catch (_) {}
              results.push({ endpoint: ep, total_count: totalCount });
            }
            const allZeroOrMinusOne =
              results.length > 0 &&
              (results.every((r) => r.total_count === 0) || results.every((r) => r.total_count === -1));
            if (!forceSave && allZeroOrMinusOne) return { results, saved: false };
            for (const r of results) {
              await prisma.sudregExpectedCount.upsert({
                where: { endpoint_snapshotId: { endpoint: r.endpoint, snapshotId: BigInt(sid) } },
                create: { endpoint: r.endpoint, snapshotId: BigInt(sid), totalCount: BigInt(r.total_count) },
                update: { totalCount: BigInt(r.total_count) },
              });
            }
            return { results, saved: true };
          };

          if (snapshotIdParam != null && snapshotIdParam !== '') {
            const snapshotId = parseInt(snapshotIdParam, 10);
            if (!Number.isInteger(snapshotId) || snapshotId < 0) {
              sendJson(400, { error: 'invalid_snapshot_id', message: 'snapshot_id mora biti cijeli broj >= 0.' });
              return;
            }
            if (maxSnapshotFromApi >= 0 && snapshotId > maxSnapshotFromApi) {
              sendJson(400, {
                error: 'snapshot_id_exceeds_max',
                message: `snapshot_id (${snapshotId}) ne smije biti veći od max snapshot_id iz API-ja (${maxSnapshotFromApi}).`,
                max_snapshot_from_api: maxSnapshotFromApi,
              });
              return;
            }
            const { results, saved } = await runOneSnapshot(snapshotId);
            sendJson(200, { snapshot_id: snapshotId, updated: saved ? results.length : 0, saved, items: results });
            return;
          }

          const maxInDb = await prisma.sudregExpectedCount.aggregate({
            _max: { snapshotId: true },
          }).then((r) => r._max.snapshotId != null ? Number(r._max.snapshotId) : null);
          const startFrom = (maxInDb != null ? maxInDb + 1 : 0);
          const snapshotIdsToFill = maxSnapshotFromApi < 0
            ? []
            : snapshotsList
                .map((s) => (s != null && (s.id != null || s.snapshot_id != null)) ? Number(s.id ?? s.snapshot_id) : null)
                .filter((n) => n != null && n >= startFrom && n <= maxSnapshotFromApi)
                .sort((a, b) => a - b)
                .filter((v, i, arr) => i === 0 || arr[i - 1] !== v);

          console.log('POST sudreg_expected_counts: maxInDb=', maxInDb, 'maxSnapshotFromApi=', maxSnapshotFromApi, 'snapshotIdsToFill.length=', snapshotIdsToFill.length);
          const summary = [];
          for (const sid of snapshotIdsToFill) {
            const { saved } = await runOneSnapshot(sid);
            if (saved) summary.push(sid);
          }
          if (summary.length === 0 && maxSnapshotFromApi >= 0) {
            const { saved } = await runOneSnapshot(maxSnapshotFromApi, true);
            if (saved) summary.push(maxSnapshotFromApi);
          }
          sendJson(200, {
            range: { from: startFrom, to: maxSnapshotFromApi },
            snapshots_updated: summary.length,
            snapshot_ids: summary,
          });
        } catch (err) {
          console.error('POST sudreg_expected_counts', err);
          sendJson(err.message.includes('SUDREG_CLIENT') ? 503 : 502, { error: 'failed', message: err.message });
        }
      })();
      return;
    }
  }

  if (path === '/api/sudreg_sync_entiteti' && method === 'POST') {
    const writeCheck = checkWriteApiKey(req);
    if (!writeCheck.allowed) {
      sendJson(writeCheck.status, { error: 'write_forbidden', message: writeCheck.message });
      return;
    }
    const snapshotIdParam = url.searchParams.get('snapshot_id');
    (async () => {
      try {
        let snapshotId;
        if (snapshotIdParam != null && snapshotIdParam !== '') {
          snapshotId = parseInt(snapshotIdParam, 10);
          if (!Number.isInteger(snapshotId) || snapshotId < 0) {
            sendJson(400, { error: 'invalid_snapshot_id', message: 'snapshot_id mora biti cijeli broj >= 0.' });
            return;
          }
        } else {
          const token = await getSudregToken();
          const snapshotsResult = await proxySudregGet('snapshots', '', token);
          const snapshotsList = Array.isArray(snapshotsResult.body) ? snapshotsResult.body : [];
          const latestFromApi = snapshotsList.length > 0
            ? Math.max(...snapshotsList.map((s) => (s != null && (s.id != null || s.snapshot_id != null)) ? Number(s.id ?? s.snapshot_id) : -1).filter((n) => n >= 0))
            : null;
          if (latestFromApi != null) {
            snapshotId = latestFromApi;
          } else {
            const latest = await prisma.sudregExpectedCount.findFirst({
              where: { endpoint: 'subjekti' },
              orderBy: { snapshotId: 'desc' },
              select: { snapshotId: true },
            });
            if (!latest) {
              sendJson(400, {
                error: 'no_snapshot',
                message: 'Nema snapshot_id. Navedi ?snapshot_id=<id> ili pokreni POST /api/sudreg_expected_counts.',
              });
              return;
            }
            snapshotId = Number(latest.snapshotId);
          }
        }
        const result = await runSyncEntiteti(snapshotId);
        sendJson(200, { snapshot_id: snapshotId, ok: result.ok, endpoints: result.endpoints });
      } catch (err) {
        console.error('POST sudreg_sync_entiteti', err);
        sendJson(500, { error: 'sync_failed', message: err.message });
      }
    })();
    return;
  }

  if (path === '/api/sudreg_sync_promjene' && method === 'POST') {
    const writeCheck = checkWriteApiKey(req);
    if (!writeCheck.allowed) {
      sendJson(writeCheck.status, { error: 'write_forbidden', message: writeCheck.message });
      return;
    }
    const snapshotIdParam = url.searchParams.get('snapshot_id');
    const startOffsetParam = url.searchParams.get('start_offset');
    (async () => {
      const errors = [];
      try {
        let snapshotId;
        if (snapshotIdParam != null && snapshotIdParam !== '') {
          snapshotId = parseInt(snapshotIdParam, 10);
          if (!Number.isInteger(snapshotId) || snapshotId < 0) {
            sendJson(400, { error: 'invalid_snapshot_id', message: 'snapshot_id mora biti cijeli broj >= 0.' });
            return;
          }
        } else {
          const latest = await prisma.sudregExpectedCount.findFirst({
            where: { endpoint: 'promjene' },
            orderBy: { snapshotId: 'desc' },
            select: { snapshotId: true },
          });
          if (!latest) {
            sendJson(400, {
              error: 'no_snapshot',
              message: 'Nema snapshot_id s expected_count za promjene. Prvo pokreni POST /api/sudreg_expected_counts?snapshot_id=<id>.',
            });
            return;
          }
          snapshotId = Number(latest.snapshotId);
        }

        const expectedRow = await prisma.sudregExpectedCount.findUnique({
          where: { endpoint_snapshotId: { endpoint: 'promjene', snapshotId: BigInt(snapshotId) } },
        });
        if (!expectedRow) {
          sendJson(409, {
            error: 'expected_count_missing',
            message: `Expected count za endpoint 'promjene' i snapshot_id=${snapshotId} nije pronađen. Prvo pokreni POST /api/sudreg_expected_counts?snapshot_id=${snapshotId}.`,
          });
          return;
        }
        const totalExpected = Number(expectedRow.totalCount) < 0 ? null : Number(expectedRow.totalCount);

        const PAGE_SIZE = 1000;
        let startOffset = 0;
        if (startOffsetParam != null && startOffsetParam !== '') {
          const parsed = parseInt(startOffsetParam, 10);
          if (Number.isInteger(parsed) && parsed >= 0) startOffset = parsed;
        } else {
          const glava = await prisma.sudregSyncGlava.findUnique({
            where: { snapshotId_tipEntiteta: { snapshotId: BigInt(snapshotId), tipEntiteta: 'promjene' } },
            select: { nextOffsetToFetch: true },
          });
          if (glava != null && glava.nextOffsetToFetch != null && glava.nextOffsetToFetch >= 0) {
            startOffset = Number(glava.nextOffsetToFetch);
          }
        }

        const now = new Date();
        await prisma.sudregSyncGlava.upsert({
          where: {
            snapshotId_tipEntiteta: { snapshotId: BigInt(snapshotId), tipEntiteta: 'promjene' },
          },
          create: {
            snapshotId: BigInt(snapshotId),
            tipEntiteta: 'promjene',
            status: 'u_tijeku',
            expectedCount: totalExpected != null ? BigInt(totalExpected) : null,
            vrijemePocetka: startOffset === 0 ? now : undefined,
            updatedAt: now,
          },
          update: {
            status: 'u_tijeku',
            expectedCount: totalExpected != null ? BigInt(totalExpected) : null,
            ...(startOffset === 0 && { vrijemePocetka: now }),
            updatedAt: now,
          },
        });

        const token = await getSudregToken();
        const qs = `snapshot_id=${snapshotId}&offset=${startOffset}&limit=${PAGE_SIZE}&no_data_error=0`;
        const result = await proxySudregGet('promjene', qs, token);
        if (result.statusCode !== 200) {
          const errMsg = `Sudreg API vratio ${result.statusCode} za offset=${startOffset}.`;
          const errNow = new Date();
          await prisma.sudregSyncGlava.upsert({
            where: {
              snapshotId_tipEntiteta: { snapshotId: BigInt(snapshotId), tipEntiteta: 'promjene' },
            },
            create: {
              snapshotId: BigInt(snapshotId),
              tipEntiteta: 'promjene',
              status: 'greska',
              vrijemeZavrsetka: errNow,
              greska: errMsg,
              updatedAt: errNow,
            },
            update: {
              status: 'greska',
              vrijemeZavrsetka: errNow,
              greska: errMsg,
              updatedAt: errNow,
            },
          });
          sendJson(502, {
            error: 'sudreg_error',
            message: errMsg,
            snapshot_id: snapshotId,
            start_offset: startOffset,
          });
          return;
        }
        const totalFromHeader = result.headers['X-Total-Count'] != null ? parseInt(result.headers['X-Total-Count'], 10) : null;
        const page = Array.isArray(result.body) ? result.body : [];
        const nextOffset = startOffset + page.length;
        const hasMore = page.length === PAGE_SIZE && (totalFromHeader == null || nextOffset < totalFromHeader);
        const totalLoadedSoFar = nextOffset;
        const finishNow = new Date();

        await prisma.sudregSyncGlava.upsert({
          where: {
            snapshotId_tipEntiteta: { snapshotId: BigInt(snapshotId), tipEntiteta: 'promjene' },
          },
          create: {
            snapshotId: BigInt(snapshotId),
            tipEntiteta: 'promjene',
            status: hasMore ? 'u_tijeku' : 'ok',
            expectedCount: totalExpected != null ? BigInt(totalExpected) : null,
            actualCount: BigInt(totalLoadedSoFar),
            nextOffsetToFetch: hasMore ? BigInt(nextOffset) : null,
            vrijemeZavrsetka: hasMore ? undefined : finishNow,
            updatedAt: finishNow,
          },
          update: {
            actualCount: BigInt(totalLoadedSoFar),
            nextOffsetToFetch: hasMore ? BigInt(nextOffset) : null,
            status: hasMore ? 'u_tijeku' : 'ok',
            ...(hasMore ? {} : { vrijemeZavrsetka: finishNow, greska: null }),
            updatedAt: finishNow,
          },
        });

        const verified = !hasMore && totalExpected != null && totalLoadedSoFar === totalExpected;

        sendJson(200, {
          snapshot_id: snapshotId,
          total_expected: totalExpected,
          start_offset: startOffset,
          next_offset: hasMore ? nextOffset : null,
          has_more: hasMore,
          page_size: page.length,
          total_so_far: totalLoadedSoFar,
          verified: hasMore ? undefined : verified,
        });
      } catch (err) {
        console.error('POST sudreg_sync_promjene', err);
        const errNow = new Date();
        const snapshotIdNum = snapshotIdParam != null && snapshotIdParam !== '' ? parseInt(snapshotIdParam, 10) : null;
        if (Number.isInteger(snapshotIdNum) && snapshotIdNum >= 0) {
          try {
            await prisma.sudregSyncGlava.upsert({
              where: {
                snapshotId_tipEntiteta: { snapshotId: BigInt(snapshotIdNum), tipEntiteta: 'promjene' },
              },
              create: {
                snapshotId: BigInt(snapshotIdNum),
                tipEntiteta: 'promjene',
                status: 'greska',
                vrijemeZavrsetka: errNow,
                greska: err.message,
                updatedAt: errNow,
              },
              update: {
                status: 'greska',
                vrijemeZavrsetka: errNow,
                greska: err.message,
                updatedAt: errNow,
              },
            });
          } catch (e) {
            console.error('Ažuriranje glave pri grešci', e);
          }
        }
        sendJson(500, {
          error: 'sync_failed',
          message: err.message,
          has_errors: true,
          errors: [err.message],
        });
      }
    })();
    return;
  }

  if (path === '/api/sudreg_cron_daily/status' && method === 'GET') {
    sendJson(200, {
      status: lastCronDailyRun.status,
      startedAt: lastCronDailyRun.startedAt,
      finishedAt: lastCronDailyRun.finishedAt,
      summary: lastCronDailyRun.summary,
      currentPhase: lastCronDailyRun.currentPhase,
      currentEndpoint: lastCronDailyRun.currentEndpoint,
      sudregApi: {
        base: SUDREG_API_BASE,
        tokenUrl: SUDREG_TOKEN_URL,
      },
      sudregApiEndpoints: {
        expected_counts: ['snapshots', ...SUDREG_EXPECTED_COUNT_ENDPOINTS],
        sync_sifrarnici: SIFRARNIK_ENDPOINTS,
        sync_entiteti: ENTITY_ENDPOINTS,
      },
      note: lastCronDailyRun.status === 'running'
        ? 'Job je u tijeku. Osvježi stranicu ili pollaj ovaj URL.'
        : lastCronDailyRun.status === 'idle'
          ? 'Job još nije pokrenut ili je server restartan.'
          : undefined,
    });
    return;
  }

  if (path === '/api/sudreg_cron_daily/stop' && method === 'POST') {
    const writeCheck = checkWriteApiKey(req);
    if (!writeCheck.allowed) {
      sendJson(writeCheck.status, { error: 'write_forbidden', message: writeCheck.message });
      return;
    }
    cronDailyShouldStop = true;
    sendJson(200, { message: 'stop_requested', note: 'Tekući sync će prekinuti na sljedećem provjerom. Pollaj GET /api/sudreg_cron_daily/status.' });
    return;
  }

  if (path === '/api/sudreg_cron_daily/rollback' && method === 'POST') {
    const writeCheck = checkWriteApiKey(req);
    if (!writeCheck.allowed) {
      sendJson(writeCheck.status, { error: 'write_forbidden', message: writeCheck.message });
      return;
    }
    cronDailyShouldStop = true;
    (async () => {
      try {
        const sudregDeleted = await prisma.$queryRawUnsafe("SELECT * FROM public.delete_all_data_respecting_fk('public', 'sudreg_%')");
        const rpsDeleted = await prisma.$queryRawUnsafe("SELECT * FROM public.delete_all_data_respecting_fk('public', 'rps_sudreg_%')");
        sendJson(200, {
          message: 'rollback_done',
          deleted: { sudreg: sudregDeleted, rps_sudreg: rpsDeleted },
        });
      } catch (err) {
        console.error('POST sudreg_cron_daily/rollback', err);
        sendJson(500, { error: 'rollback_failed', message: err.message });
      }
    })();
    return;
  }

  if (path === '/api/sudreg_cron_daily' && method === 'POST') {
    const writeCheck = checkWriteApiKey(req);
    if (!writeCheck.allowed) {
      console.warn('sudreg_cron_daily: odbijen (API ključ)', writeCheck.status, writeCheck.message);
      sendJson(writeCheck.status, { error: 'write_forbidden', message: writeCheck.message });
      return;
    }
    const wait = url.searchParams.get('wait') === '1' || url.searchParams.get('wait') === 'true';
    console.log('sudreg_cron_daily: poziv', wait ? '?wait=1' : 'background');
    lastCronDailyRun.startedAt = new Date().toISOString();
    lastCronDailyRun.finishedAt = null;
    lastCronDailyRun.status = 'running';
    lastCronDailyRun.summary = null;
    lastCronDailyRun.currentPhase = null;
    lastCronDailyRun.currentEndpoint = null;
    if (!wait) {
      sendJson(202, {
        message: 'started',
        background: true,
        statusUrl: '/api/sudreg_cron_daily/status',
        note: 'Work runs in background. GET ' + '/api/sudreg_cron_daily/status' + ' to see when it finishes.',
      });
      setImmediate(() => {
        runCronDailyWork().then((summary) => {
          console.log('cron_daily background done', JSON.stringify(summary));
        }).catch((err) => {
          console.error('cron_daily background failed', err);
          lastCronDailyRun.currentPhase = null;
          lastCronDailyRun.currentEndpoint = null;
          lastCronDailyRun.finishedAt = new Date().toISOString();
          lastCronDailyRun.status = 'error';
          lastCronDailyRun.summary = { error: err.message };
        });
      });
      return;
    }
    (async () => {
      try {
        const summary = await runCronDailyWork();
        sendJson(200, { message: 'ok', ...summary });
      } catch (err) {
        console.error('POST sudreg_cron_daily', err);
        lastCronDailyRun.currentPhase = null;
        lastCronDailyRun.currentEndpoint = null;
        lastCronDailyRun.finishedAt = new Date().toISOString();
        lastCronDailyRun.status = 'error';
        lastCronDailyRun.summary = { error: err.message };
        sendJson(500, { message: 'cron_daily_failed', error: err.message });
      }
    })();
    return;
  }

  sendJson(404, { error: 'not_found', path });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
