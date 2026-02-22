/**
 * Minimalni HTTP server za Registar poslovnih subjekata.
 * - GET/POST /api/sudreg_token – OAuth token za Sudski registar.
 * - GET /api/sudreg?endpoint=<name>&... – jedan proxy prema Sudreg API-ju; endpoint = naziv resursa (npr. subjekti, detalji_subjekta, sudovi). Svi ostali query parametri (snapshot_id, limit, offset, no_data_error, omit_nulls, expand_relations, history_columns, tip_identifikatora, identifikator, only_active, tvrtka_naziv) prosljeđuju se API-ju.
 *   Dokumentacija: https://sudreg-data.gov.hr/api/javni/dokumentacija/open_api
 * - GET /api/sudreg_expected_counts?snapshot_id=<id> – čitanje iz baze (public.sudreg_expected_counts). Opcionalno: endpoint (naziv metode; ako nema, vraća sve), limit, offset.
 * - POST /api/sudreg_expected_counts?snapshot_id=<id> – dohvat X-Total-Count s Sudreg API-ja za sve list-endpointe i upis u sudreg_expected_counts. Zahtijeva API ključ (header X-API-Key ili Authorization: Bearer <key>).
 * - POST /api/sudreg_sync_promjene?snapshot_id=<id> – poziv Sudreg /promjene, upis u sudreg_promjene_stavke. snapshot_id opcionalno (ako nema, koristi se zadnji snapshot koji ima expected_count za promjene). Zahtijeva API ključ. Upis samo ako postoji expected_count za taj snapshot.
 * - POST /api/sudreg_cron_daily – jedan poziv: prvo expected_counts (bez parametra), zatim sync_promjene u petlji dok ne završi. Za vanjski cron (npr. cron-job.org). Zahtijeva API ključ.
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

let tokenCache = { access_token: null, expiresAt: 0 };

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

/**
 * GET zahtjev prema Sudreg API-ju. path = npr. 'subjekti' ili 'detalji_subjekta', queryString = ostali parametri (snapshot_id, limit, offset, ...).
 */
function proxySudregGet(path, queryString, token) {
  return new Promise((resolve, reject) => {
    const base = SUDREG_API_BASE.replace(/\/$/, '');
    const qs = queryString ? `?${queryString}` : '';
    const targetPath = `${base}/${path}${qs}`;
    const u = new URL(targetPath);
    const opts = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
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
        resolve({
          statusCode: res.statusCode,
          body: parsed,
          headers: outHeaders,
        });
      });
    });
    req.on('error', reject);
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
 * Interni POST na ovaj server (loopback). Za cron_daily koristi ovo da pozove expected_counts pa sync_promjene.
 * @param {string} path - npr. '/api/sudreg_expected_counts' ili '/api/sudreg_sync_promjene'
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
    try {
      const token = await getSudregToken();
      const result = await proxySudregGet(endpoint, queryString, token);
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

          const runOneSnapshot = async (sid) => {
            const queryForCount = `snapshot_id=${sid}&offset=0&limit=0&no_data_error=0`;
            const results = [];
            for (const ep of SUDREG_EXPECTED_COUNT_ENDPOINTS) {
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
            if (allZeroOrMinusOne) return { results, saved: false };
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

          const summary = [];
          for (const sid of snapshotIdsToFill) {
            const { saved } = await runOneSnapshot(sid);
            if (saved) summary.push(sid);
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
          const existing = await prisma.promjene.findUnique({
            where: { snapshotId: BigInt(snapshotId) },
            select: { nextOffsetToFetch: true, totalLoaded: true },
          });
          if (existing != null && existing.nextOffsetToFetch != null && existing.nextOffsetToFetch >= 0) {
            startOffset = Number(existing.nextOffsetToFetch);
          }
        }

        await prisma.promjene.upsert({
          where: { snapshotId: BigInt(snapshotId) },
          create: { snapshotId: BigInt(snapshotId), expectedCount: totalExpected != null ? BigInt(totalExpected) : null },
          update: { expectedCount: totalExpected != null ? BigInt(totalExpected) : null },
        });

        if (startOffset === 0) {
          await prisma.promjeneStavka.deleteMany({ where: { snapshotId: BigInt(snapshotId) } });
        }

        const token = await getSudregToken();
        const qs = `snapshot_id=${snapshotId}&offset=${startOffset}&limit=${PAGE_SIZE}&no_data_error=0`;
        const result = await proxySudregGet('promjene', qs, token);
        if (result.statusCode !== 200) {
          sendJson(502, {
            error: 'sudreg_error',
            message: `Sudreg API vratio ${result.statusCode} za offset=${startOffset}.`,
            snapshot_id: snapshotId,
            start_offset: startOffset,
          });
          return;
        }
        const totalFromHeader = result.headers['X-Total-Count'] != null ? parseInt(result.headers['X-Total-Count'], 10) : null;
        const page = Array.isArray(result.body) ? result.body : [];
        const allItems = [];
        for (const row of page) {
          if (row != null && (row.mbs != null || row.mbs === 0)) {
            allItems.push({
              snapshotId: BigInt(snapshotId),
              mbs: BigInt(row.mbs),
              scn: BigInt(row.scn != null ? row.scn : 0),
              vrijeme: row.vrijeme != null ? new Date(row.vrijeme) : null,
            });
          }
        }

        const nextOffset = startOffset + page.length;
        const hasMore = page.length === PAGE_SIZE && (totalFromHeader == null || nextOffset < totalFromHeader);

        let writtenThisRequest = 0;
        let totalLoadedSoFar = 0;
        await prisma.$transaction(async (tx) => {
          if (allItems.length > 0) {
            const created = await tx.promjeneStavka.createMany({
              data: allItems,
              skipDuplicates: true,
            });
            writtenThisRequest = created.count;
          }
          totalLoadedSoFar = await tx.promjeneStavka.count({ where: { snapshotId: BigInt(snapshotId) } });
          await tx.promjene.update({
            where: { snapshotId: BigInt(snapshotId) },
            data: {
              totalLoaded: BigInt(totalLoadedSoFar),
              nextOffsetToFetch: hasMore ? BigInt(nextOffset) : null,
            },
          });
        });

        const allWrittenThisChunk = writtenThisRequest === allItems.length;
        const verified = !hasMore && totalExpected != null && totalLoadedSoFar === totalExpected;

        sendJson(200, {
          snapshot_id: snapshotId,
          total_expected: totalExpected,
          start_offset: startOffset,
          next_offset: hasMore ? nextOffset : null,
          has_more: hasMore,
          total_written_this_request: writtenThisRequest,
          total_written_so_far: totalLoadedSoFar,
          page_size: page.length,
          all_written_this_chunk: allWrittenThisChunk,
          verified: hasMore ? undefined : verified,
        });
      } catch (err) {
        console.error('POST sudreg_sync_promjene', err);
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

  if (path === '/api/sudreg_cron_daily' && method === 'POST') {
    const writeCheck = checkWriteApiKey(req);
    if (!writeCheck.allowed) {
      sendJson(writeCheck.status, { error: 'write_forbidden', message: writeCheck.message });
      return;
    }
    (async () => {
      const summary = { expected_counts: null, sync_promjene_chunks: 0, sync_promjene_done: false, error: null };
      try {
        const ec = await internalPost('/api/sudreg_expected_counts');
        summary.expected_counts = { status: ec.statusCode, ok: ec.statusCode >= 200 && ec.statusCode < 400 };
        if (ec.statusCode >= 400) {
          sendJson(200, { message: 'expected_counts failed', ...summary });
          return;
        }
        const MAX_SYNC_CHUNKS = 500;
        for (let i = 0; i < MAX_SYNC_CHUNKS; i++) {
          const sp = await internalPost('/api/sudreg_sync_promjene');
          summary.sync_promjene_chunks += 1;
          if (sp.statusCode >= 400) {
            summary.error = sp.body?.message || sp.body?.error || `HTTP ${sp.statusCode}`;
            sendJson(200, { message: 'sync_promjene error', ...summary });
            return;
          }
          const hasMore = sp.body && sp.body.has_more === true;
          if (!hasMore) {
            summary.sync_promjene_done = true;
            summary.snapshot_id = sp.body?.snapshot_id;
            summary.verified = sp.body?.verified;
            break;
          }
        }
        sendJson(200, { message: 'ok', ...summary });
      } catch (err) {
        console.error('POST sudreg_cron_daily', err);
        summary.error = err.message;
        sendJson(500, { message: 'cron_daily_failed', ...summary });
      }
    })();
    return;
  }

  sendJson(404, { error: 'not_found', path });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
