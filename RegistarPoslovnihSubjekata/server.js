/**
 * HTTP server za Registar poslovnih subjekata.
 * - GET/POST /api/token – OAuth token za Sudski registar.
 * - GET /api/sudreg_:endpoint – proxy prema sudreg-data.gov.hr (npr. /api/sudreg_sudovi, /api/sudreg_detalji_subjekta).
 * - Svaki proxy poziv zapisuje se u sudreg_proxy_log (endpoint, parametri, status, trajanje, headeri).
 */
const http = require('http');
const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const SUDREG_API_BASE = process.env.SUDREG_API_BASE || 'https://sudreg-data.gov.hr/api/javni';
const SUDREG_TOKEN_URL = process.env.SUDREG_TOKEN_URL || 'https://sudreg-data.gov.hr/api/oauth/token';
const SUDREG_CLIENT_ID = process.env.SUDREG_CLIENT_ID || '';
const SUDREG_CLIENT_SECRET = process.env.SUDREG_CLIENT_SECRET || '';

// Cache tokena (vrijedi 6 h; osvježavamo 5 min prije isteka)
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

/** Iz odgovora Sudreg API-ja izvlači standardne headere (X-Snapshot-Id, X-Timestamp, itd.) */
function extractSudregHeaders(res) {
  const h = res.headers;
  const parseBigInt = (v) => (v != null && v !== '' ? BigInt(parseInt(String(v), 10)) : null);
  const parseIntSafe = (v) => (v != null && v !== '' ? parseInt(String(v), 10) : null);
  const parseDecimal = (v) => (v != null && v !== '' ? parseFloat(String(v)) : null);
  return {
    xSnapshotId: parseBigInt(h['x-snapshot-id']),
    xTimestamp: h['x-timestamp'] ? String(h['x-timestamp']).slice(0, 64) : null,
    xTotalCount: parseBigInt(h['x-total-count']),
    xSecondsElapsed: parseDecimal(h['x-seconds-elapsed']),
    xRowsReturned: parseIntSafe(h['x-rows-returned']),
    xLogId: parseBigInt(h['x-log-id']),
  };
}

/** Konfiguracija sync endpointa: API path -> mapRow + Prisma model. idField = ključ za upsert (npr. 'id' ili 'postupak'). */
const SYNC_CONFIG = {
  sudovi: {
    apiPath: 'sudovi',
    model: 'sudovi',
    idField: 'id',
    mapRow: (r) => ({
      id: BigInt(r.id),
      sifra: String(r.sifra ?? ''),
      naziv: String(r.naziv ?? ''),
      sifraZupanije: r.sifra_zupanije != null ? parseInt(r.sifra_zupanije, 10) : null,
      nazivZupanije: r.naziv_zupanije != null ? String(r.naziv_zupanije) : null,
    }),
  },
  drzave: {
    apiPath: 'drzave',
    model: 'drzave',
    idField: 'id',
    mapRow: (r) => ({
      id: BigInt(r.id),
      sifra: String(r.sifra ?? ''),
      naziv: String(r.naziv ?? ''),
      oznaka2: r.oznaka_2 != null ? String(r.oznaka_2) : null,
      oznaka3: r.oznaka_3 != null ? String(r.oznaka_3) : null,
    }),
  },
  valute: {
    apiPath: 'valute',
    model: 'valute',
    idField: 'id',
    mapRow: (r) => ({
      id: BigInt(r.id),
      sifra: String(r.sifra ?? ''),
      naziv: String(r.naziv ?? ''),
      drzavaId: r.drzava_id != null ? BigInt(r.drzava_id) : null,
    }),
  },
  nacionalna_klasifikacija_djelatnosti: {
    apiPath: 'nacionalna_klasifikacija_djelatnosti',
    model: 'nacionalnaKlasifikacijaDjelatnosti',
    idField: 'id',
    mapRow: (r) => ({
      id: BigInt(r.id),
      sifra: String(r.sifra ?? ''),
      puniNaziv: r.puni_naziv != null ? String(r.puni_naziv) : null,
      verzija: r.verzija != null ? String(r.verzija) : null,
    }),
  },
  vrste_pravnih_oblika: {
    apiPath: 'vrste_pravnih_oblika',
    model: 'vrstePravnihOblika',
    idField: 'id',
    mapRow: (r) => ({
      id: BigInt(r.id),
      sifra: String(r.sifra ?? ''),
      naziv: String(r.naziv ?? ''),
      kratica: r.kratica != null ? String(r.kratica) : null,
    }),
  },
  vrste_postupaka: {
    apiPath: 'vrste_postupaka',
    model: 'vrstePostupaka',
    idField: 'postupak',
    mapRow: (r) => ({
      postupak: parseInt(r.postupak ?? r.id ?? 0, 10),
      znacenje: String(r.znacenje ?? ''),
    }),
  },
};

/** Tablice koje se syncaju po snapshot_id: na početku brišu sve redove za taj snapshot, zatim batch upis. Pri grešci rollback (brišu se upisani redovi za taj snapshot). mapRow(r, snapshotIdBig) vraća objekt za createMany. */
const toBigInt = (v) => (v != null && v !== '' ? BigInt(Number(v)) : null);
const toDate = (v) => (v != null && v !== '' ? new Date(v) : null);
const SYNC_SNAPSHOT_CONFIG = {
  subjekti: {
    apiPath: 'subjekti',
    model: 'subjekti',
    mapRow: (r, sid) => ({
      mbs: toBigInt(r.mbs),
      oib: r.oib ?? null,
      status: r.status != null ? Number(r.status) : 1,
      inoPodruznica: r.ino_podruznica != null ? Number(r.ino_podruznica) : 0,
      postupak: r.postupak != null ? Number(r.postupak) : null,
      datumOsnivanja: toDate(r.datum_osnivanja),
      datumBrisanja: toDate(r.datum_brisanja),
      snapshotId: sid,
    }),
  },
  tvrtke: {
    apiPath: 'tvrtke',
    model: 'tvrtke',
    mapRow: (r, sid) => ({
      subjektId: toBigInt(r.subjekt_id),
      ime: r.ime ?? null,
      naznakaImena: r.naznaka_imena ?? null,
      snapshotId: sid,
    }),
  },
  sjedista: {
    apiPath: 'sjedista',
    model: 'sjedista',
    mapRow: (r, sid) => ({
      subjektId: toBigInt(r.subjekt_id),
      redniBroj: r.redni_broj != null ? Number(r.redni_broj) : 1,
      drzavaId: toBigInt(r.drzava_id),
      sifraZupanije: r.sifra_zupanije != null ? Number(r.sifra_zupanije) : null,
      nazivZupanije: r.naziv_zupanije ?? null,
      sifraOpcine: r.sifra_opcine != null ? Number(r.sifra_opcine) : null,
      nazivOpcine: r.naziv_opcine ?? null,
      sifraNaselja: toBigInt(r.sifra_naselja),
      nazivNaselja: r.naziv_naselja ?? null,
      naseljeVanSifrarnika: r.naselje_van_sifrarnika ?? null,
      sifraUlice: toBigInt(r.sifra_ulice),
      ulica: r.ulica ?? null,
      kucniBroj: r.kucni_broj != null ? Number(r.kucni_broj) : null,
      kucniPodbroj: r.kucni_podbroj ?? null,
      postanskiBroj: r.postanski_broj != null ? Number(r.postanski_broj) : null,
      snapshotId: sid,
    }),
  },
};

/** Sync tablice s snapshot_id: delete za snapshot na početku, batch createMany, rollback pri grešci. */
async function runSyncWithSnapshot(sendJson, endpointName, requestedSnapshotId, config) {
  const BATCH_SIZE = 500;
  const startMs = Date.now();
  let writtenSnapshotId = null;
  let lastPhase = 'token';
  let batchCount = 0;
  try {
  const model = prisma[config.model];
  if (!model || typeof model.deleteMany !== 'function') {
    sendJson(500, { error: 'sync_failed', message: `Model ${config.model} not found` });
    return;
  }
  if (requestedSnapshotId != null && requestedSnapshotId !== '') {
    const sid = BigInt(Number(requestedSnapshotId));
    const deleted = await model.deleteMany({ where: { snapshotId: sid } });
    if (deleted?.count > 0) console.log(`[Sync ${endpointName}] Na početku obrisano`, deleted.count, 'redaka za snapshot', requestedSnapshotId);
  }
  lastPhase = 'token';
  const token = await getSudregToken();
  let offset = 0;
  let totalSynced = 0;
  let snapshotId = null;
  let rows;
  do {
    lastPhase = 'fetch';
    const queryString = `offset=${offset}&limit=${BATCH_SIZE}`;
    const result = await proxyWithToken(config.apiPath, queryString, requestedSnapshotId, token);
    if (result.statusCode !== 200 || !Array.isArray(result.body)) {
      sendJson(result.statusCode || 500, result.body || { error: 'sync_failed' });
      return;
    }
    rows = result.body;
    if (result.headers && result.headers.xSnapshotId != null) snapshotId = result.headers.xSnapshotId;
    if (rows.length === 0) break;
    const snapshotIdBig = requestedSnapshotId != null && requestedSnapshotId !== ''
      ? BigInt(Number(requestedSnapshotId))
      : (snapshotId != null ? BigInt(Number(snapshotId)) : null);
    if (snapshotIdBig == null) {
      sendJson(500, { error: 'sync_failed', message: 'X-Snapshot-Id missing; navedi snapshot_id u queryu ili X-Snapshot-Id u headeru' });
      return;
    }
    writtenSnapshotId = snapshotIdBig;
    lastPhase = 'write';
    const toInsert = rows.map((r) => config.mapRow(r, snapshotIdBig)).filter((row) => row != null);
    if (toInsert.length > 0) {
      await model.createMany({ data: toInsert, skipDuplicates: true });
    }
    totalSynced += toInsert.length;
    batchCount += 1;
    offset += BATCH_SIZE;
  } while (rows.length === BATCH_SIZE);
  const durationMs = Date.now() - startMs;
  sendJson(200, {
    ok: true,
    endpoint: endpointName,
    synced: totalSynced,
    batches: batchCount,
    snapshotId: snapshotId != null ? String(snapshotId) : null,
    durationMs,
  });
  } catch (err) {
    const errCode = err.code || err.errno || '';
    const errMsg = err.message || String(err);
    console.error(`[Sync ${endpointName}] GREŠKA phase=%s code=%s batch≈%s message=%s`, lastPhase, errCode, batchCount, errMsg);
    if (writtenSnapshotId != null) {
      try {
        const model = prisma[config.model];
        if (model && typeof model.deleteMany === 'function') {
          const rolled = await model.deleteMany({ where: { snapshotId: writtenSnapshotId } });
          console.log(`[Sync ${endpointName}] Rollback: obrisano`, rolled?.count ?? 0, 'redaka za snapshot', String(writtenSnapshotId));
        }
      } catch (rollbackErr) {
        console.error(`[Sync ${endpointName}] Rollback nije uspio:`, rollbackErr.message);
      }
    }
    sendJson(502, {
      error: 'sync_failed',
      message: errMsg,
      errorCode: errCode,
      phase: lastPhase,
      hint: lastPhase === 'fetch' ? 'Prekid vjerojatno od strane Sudreg API-ja ili mreže.' : (lastPhase === 'write' ? 'Prekid tijekom upisa (možda Render timeout).' : 'Prekid pri dohvatu tokena.'),
    });
  }
}

/** Sync metode promjene: dohvaća cijeli popis (offset/limit), sprema stavke. requestedSnapshotId = opcionalno. Na početku briše postojeće redove za taj snapshot. Pri grešci: rollback. Faza (phase) u logu/odgovoru: token|fetch|write – za dijagnostiku tko prekida (Render vs Sudreg API). */
async function runSyncPromjene(sendJson, requestedSnapshotId = null) {
  const BATCH_SIZE = 500;
  const startMs = Date.now();
  let writtenSnapshotId = null;
  let lastPhase = 'token'; // token | fetch | write – gdje je došlo do greške
  try {
    if (requestedSnapshotId != null && requestedSnapshotId !== '') {
      const sid = BigInt(Number(requestedSnapshotId));
      const deleted = await prisma.promjeneStavka.deleteMany({ where: { snapshotId: sid } });
      if (deleted?.count > 0) console.log('[Sync promjene] Na početku obrisano', deleted.count, 'redaka za snapshot', requestedSnapshotId);
    }
    lastPhase = 'token';
    const token = await getSudregToken();
    let offset = 0;
    let totalSynced = 0;
    let snapshotId = null;
    let batchCount = 0;
    let rows;
    do {
      lastPhase = 'fetch';
      const queryString = `offset=${offset}&limit=${BATCH_SIZE}`;
      const result = await proxyWithToken('promjene', queryString, requestedSnapshotId, token);
      if (result.statusCode !== 200 || !Array.isArray(result.body)) {
        sendJson(result.statusCode || 500, result.body || { error: 'sync_failed' });
        return;
      }
      rows = result.body;
      if (result.headers && result.headers.xSnapshotId != null) snapshotId = result.headers.xSnapshotId;
      if (rows.length === 0) break;
      const snapshotIdBig = requestedSnapshotId != null && requestedSnapshotId !== ''
        ? BigInt(Number(requestedSnapshotId))
        : (snapshotId != null ? BigInt(Number(snapshotId)) : null);
      if (snapshotIdBig == null) {
        sendJson(500, { error: 'sync_failed', message: 'X-Snapshot-Id missing in response; navedi snapshot_id u queryu ili X-Snapshot-Id u headeru' });
        return;
      }
      writtenSnapshotId = snapshotIdBig;
      const toUpsert = rows.map((r) => {
        const mbs = r.mbs != null && r.mbs !== '' ? BigInt(r.mbs) : null;
        const scn = BigInt(r.scn ?? 0);
        const vrijeme = r.vrijeme != null && r.vrijeme !== '' ? new Date(r.vrijeme) : null;
        return {
          snapshotId: snapshotIdBig,
          mbs,
          scn,
          vrijeme,
        };
      }).filter((r) => r.mbs != null);
      lastPhase = 'write';
      await prisma.$transaction(
        toUpsert.map((row) =>
          prisma.promjeneStavka.upsert({
            where: {
              snapshotId_mbs: { snapshotId: row.snapshotId, mbs: row.mbs },
            },
            create: row,
            update: { scn: row.scn, vrijeme: row.vrijeme },
          })
        )
      );
      totalSynced += toUpsert.length;
      batchCount += 1;
      offset += BATCH_SIZE;
    } while (rows.length === BATCH_SIZE);
    const durationMs = Date.now() - startMs;
    sendJson(200, {
      ok: true,
      endpoint: 'promjene',
      synced: totalSynced,
      batches: batchCount,
      snapshotId: snapshotId != null ? String(snapshotId) : null,
      durationMs,
    });
  } catch (err) {
    const errCode = err.code || err.errno || '';
    const errMsg = err.message || String(err);
    console.error('[Sync promjene] GREŠKA phase=%s code=%s batch≈%s message=%s', lastPhase, errCode, batchCount, errMsg);
    if (writtenSnapshotId != null) {
      try {
        const rolled = await prisma.promjeneStavka.deleteMany({ where: { snapshotId: writtenSnapshotId } });
        console.log('[Sync promjene] Rollback: obrisano', rolled?.count ?? 0, 'redaka za snapshot', String(writtenSnapshotId));
      } catch (rollbackErr) {
        console.error('[Sync promjene] Rollback nije uspio:', rollbackErr.message);
      }
    }
    sendJson(502, {
      error: 'sync_failed',
      message: errMsg,
      errorCode: errCode,
      phase: lastPhase,
      hint: lastPhase === 'fetch' ? 'Prekid vjerojatno od strane Sudreg API-ja ili mreže prema njemu.' : (lastPhase === 'write' ? 'Prekid tijekom upisa u bazu (možda Render timeout).' : 'Prekid pri dohvatu tokena.'),
    });
  }
}

async function runSync(sendJson, endpointName, config) {
  const BATCH_SIZE = 500;
  const startMs = Date.now();
  try {
    const token = await getSudregToken();
    const model = prisma[config.model];
    if (!model || typeof model.upsert !== 'function') {
      sendJson(500, { error: 'sync_failed', message: `Model ${config.model} not found` });
      return;
    }
    let offset = 0;
    let totalSynced = 0;
    let snapshotId = null;
    let batchCount = 0;
    let rows;
    do {
      const queryString = `offset=${offset}&limit=${BATCH_SIZE}`;
      const result = await proxyWithToken(config.apiPath, queryString, null, token);
      if (result.statusCode !== 200 || !Array.isArray(result.body)) {
        sendJson(result.statusCode || 500, result.body || { error: 'sync_failed' });
        return;
      }
      rows = result.body;
      if (result.headers && result.headers.xSnapshotId != null) snapshotId = result.headers.xSnapshotId;
      if (rows.length === 0) break;
      const toUpsert = rows.map((r) => config.mapRow(r)).filter(Boolean);
      const idField = config.idField;
      await prisma.$transaction(
        toUpsert.map((row) => {
          const where = { [idField]: row[idField] };
          const create = row;
          const update = { ...row };
          delete update[idField];
          return model.upsert({ where, create, update });
        })
      );
      totalSynced += toUpsert.length;
      batchCount += 1;
      offset += BATCH_SIZE;
    } while (rows.length === BATCH_SIZE);
    const durationMs = Date.now() - startMs;
    sendJson(200, {
      ok: true,
      endpoint: endpointName,
      synced: totalSynced,
      batches: batchCount,
      snapshotId: snapshotId != null ? String(snapshotId) : null,
      durationMs,
    });
  } catch (err) {
    sendJson(502, { error: 'sync_failed', message: err.message });
  }
}

/** Sudreg API prema specu prima snapshot_id isključivo u queryju, ne u headeru. */
async function proxyWithToken(endpoint, queryString, snapshotId, token) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams(queryString || '');
    if (snapshotId != null && String(snapshotId).trim() !== '') params.set('snapshot_id', String(snapshotId).trim());
    const qs = params.toString();
    const path = qs ? `${endpoint}?${qs}` : endpoint;
    const target = new URL(SUDREG_API_BASE.replace(/\/$/, '') + '/' + path.replace(/^\//, ''));
    const options = {
      hostname: target.hostname,
      port: target.port || 443,
      path: target.pathname + target.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 400) {
            const err = JSON.parse(data || '{}');
            reject({ statusCode: res.statusCode, body: err });
            return;
          }
          const headers = extractSudregHeaders(res);
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null,
            headers,
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data, headers: {} });
        }
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

  const sendJson = (status, obj, extraHeaders = {}) => {
    const headers = { 'Content-Type': 'application/json', ...extraHeaders };
    res.writeHead(status, headers);
    res.end(JSON.stringify(obj));
  };

  // Health / root
  if (path === '/' || path === '/health') {
    sendJson(200, {
      service: 'registar-poslovnih-subjekata',
      status: 'ok',
      endpoints: {
        token: 'GET|POST /api/token',
        sudreg: 'GET /api/sudreg_<endpoint> (npr. /api/sudreg_sudovi, /api/sudreg_detalji_subjekta)',
        sync: 'POST /api/sudreg_sync_<endpoint> (promjene, subjekti, tvrtke, sjedista=po snapshot_id+rollback; sudovi, drzave, valute, ...=šifrarnici)',
        promjeneRazlike: 'GET /api/sudreg_promjene_razlike?stari_snapshot=&novi_snapshot= (usporedba SCN, promijenjeni subjekti)',
      },
    });
    return;
  }

  // GET ili POST /api/token
  if (path === '/api/token' && (method === 'GET' || method === 'POST')) {
    try {
      const tokenResponse = await fetchSudregToken();
      sendJson(200, tokenResponse);
    } catch (err) {
      const status = err.message.includes('SUDREG_CLIENT') ? 503 : 502;
      sendJson(status, { error: 'token_failed', message: err.message });
    }
    return;
  }

  // POST /api/sudreg_sync_promjene – dohvat popisa promjena i upis. ?snapshot_id=1090 | X-Snapshot-Id. ?background=1 = 202 odmah, sync u pozadini (za izbjegavanje timeouta).
  if (path === '/api/sudreg_sync_promjene' && method === 'POST') {
    const snapshotParam = url.searchParams.get('snapshot_id');
    const snapshotHeader = req.headers['x-snapshot-id'];
    const requestedSnapshotId = snapshotParam != null && snapshotParam !== '' ? snapshotParam : (snapshotHeader != null && snapshotHeader !== '' ? snapshotHeader : null);
    const background = url.searchParams.get('background') === '1' || url.searchParams.get('async') === '1';
    if (background) {
      sendJson(202, { ok: true, message: 'Sync promjene pokrenut u pozadini. Može trajati 10+ min.', snapshot_id: requestedSnapshotId || 'zadnji (iz API-ja)' });
      const logOnly = (status, obj) => console.log('[Sync promjene background done]', status, obj?.synced ?? obj?.error);
      runSyncPromjene(logOnly, requestedSnapshotId).catch((e) => console.error('[Sync promjene background]', e.message));
      return;
    }
    await runSyncPromjene(sendJson, requestedSnapshotId);
    return;
  }

  // POST /api/sudreg_sync_<endpoint> – šifrarnici (upsert po id) ili tablice po snapshotu (delete + insert + rollback)
  const syncMatch = path.match(/^\/api\/sudreg_sync_(.+)$/);
  if (method === 'POST' && syncMatch) {
    const endpointName = syncMatch[1].replace(/\/$/, '');
    const snapshotParam = url.searchParams.get('snapshot_id');
    const snapshotHeader = req.headers['x-snapshot-id'];
    const requestedSnapshotId = snapshotParam != null && snapshotParam !== '' ? snapshotParam : (snapshotHeader != null && snapshotHeader !== '' ? snapshotHeader : null);
    const snapshotConfig = SYNC_SNAPSHOT_CONFIG[endpointName];
    if (snapshotConfig) {
      await runSyncWithSnapshot(sendJson, endpointName, requestedSnapshotId, snapshotConfig);
      return;
    }
    const config = SYNC_CONFIG[endpointName];
    if (config) {
      await runSync(sendJson, endpointName, config);
      return;
    }
  }

  // GET /api/sudreg_promjene_razlike – usporedba dva snapshota: subjekti kod kojih je SCN veći u novijem (ili samo u novijem)
  // Query: stari_snapshot, novi_snapshot (ako izostave, koriste se zadnja dva snapshota u bazi)
  if (path === '/api/sudreg_promjene_razlike' && method === 'GET') {
    try {
      const stariParam = url.searchParams.get('stari_snapshot');
      const noviParam = url.searchParams.get('novi_snapshot');
      let stariSnapshotId = stariParam != null ? Number(stariParam) : null;
      let noviSnapshotId = noviParam != null ? Number(noviParam) : null;
      if (stariSnapshotId == null || noviSnapshotId == null || isNaN(stariSnapshotId) || isNaN(noviSnapshotId)) {
        const snapshots = await prisma.$queryRaw`
          SELECT DISTINCT snapshot_id AS snapshot_id
          FROM sudreg_promjene_stavke
          ORDER BY snapshot_id DESC
          LIMIT 2
        `;
        if (snapshots.length < 2) {
          sendJson(200, {
            ok: true,
            message: 'Potrebna su najmanje dva snapshota za usporedbu. Pokreni sync promjene dva puta (u razmaku).',
            snapshots: snapshots.length,
            promijenjeniMbs: [],
            ukupnoPromijenjeno: 0,
          });
          return;
        }
        noviSnapshotId = Number(snapshots[0].snapshot_id);
        stariSnapshotId = Number(snapshots[1].snapshot_id);
      }
      const promijenjeni = await prisma.$queryRaw`
        SELECT n.mbs AS "mbs"
        FROM sudreg_promjene_stavke n
        LEFT JOIN sudreg_promjene_stavke s
          ON s.mbs = n.mbs AND s.snapshot_id = ${stariSnapshotId}
        WHERE n.snapshot_id = ${noviSnapshotId}
          AND (s.mbs IS NULL OR n.scn > s.scn)
        ORDER BY n.mbs
      `;
      const maxScn = await prisma.$queryRaw`
        SELECT snapshot_id AS "snapshotId", MAX(scn) AS "maxScn"
        FROM sudreg_promjene_stavke
        WHERE snapshot_id IN (${stariSnapshotId}, ${noviSnapshotId})
        GROUP BY snapshot_id
      `;
      const promijenjeniMbs = (promijenjeni || []).map((r) => String(r.mbs));
      const maxScnMap = Object.fromEntries((maxScn || []).map((r) => [String(r.snapshotId), String(r.maxScn)]));
      sendJson(200, {
        ok: true,
        stariSnapshotId: String(stariSnapshotId),
        noviSnapshotId: String(noviSnapshotId),
        promijenjeniMbs: promijenjeniMbs,
        ukupnoPromijenjeno: promijenjeniMbs.length,
        maxScnStari: maxScnMap[String(stariSnapshotId)] ?? null,
        maxScnNovi: maxScnMap[String(noviSnapshotId)] ?? null,
      });
    } catch (err) {
      sendJson(500, { error: 'razlike_failed', message: err.message });
    }
    return;
  }

  // GET /api/sudreg_:endpoint – proxy (samo dohvat) + zapis u sudreg_proxy_log; u logu endpoint = sudreg_*
  const sudregMatch = path.match(/^\/api\/sudreg_(.+)$/);
  if (method === 'GET' && sudregMatch) {
    const endpointSuffix = sudregMatch[1].replace(/\/$/, ''); // npr. sudovi, detalji_subjekta
    const endpointForLog = 'sudreg_' + endpointSuffix;        // u log: sudreg_sudovi
    const queryString = url.search ? url.search.slice(1) : '';
    const snapshotId = url.searchParams.get('snapshot_id') || url.searchParams.get('X-Snapshot-Id') || req.headers['x-snapshot-id'];
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || null;
    const userAgent = req.headers['user-agent'] || null;
    const startMs = Date.now();
    try {
      const token = await getSudregToken();
      const result = await proxyWithToken(endpointSuffix, queryString, snapshotId, token);
      const durationMs = Date.now() - startMs;
      const h = result.headers || {};
      const outHeaders = {};
      if (h.xSnapshotId != null) outHeaders['X-Snapshot-Id'] = String(h.xSnapshotId);
      if (h.xTimestamp != null) outHeaders['X-Timestamp'] = h.xTimestamp;
      if (h.xTotalCount != null) outHeaders['X-Total-Count'] = String(h.xTotalCount);
      if (h.xSecondsElapsed != null) outHeaders['X-Seconds-Elapsed'] = String(h.xSecondsElapsed);
      if (h.xRowsReturned != null) outHeaders['X-Rows-Returned'] = String(h.xRowsReturned);
      if (h.xLogId != null) outHeaders['X-Log-Id'] = String(h.xLogId);
      sendJson(result.statusCode, result.body, outHeaders);
      prisma.sudregProxyLog.create({
        data: {
          endpoint: endpointForLog,
          queryString: queryString || null,
          responseStatus: result.statusCode,
          durationMs,
          clientIp: clientIp || null,
          userAgent: userAgent || null,
          xSnapshotId: h.xSnapshotId ?? null,
          xTimestamp: h.xTimestamp ?? null,
          xTotalCount: h.xTotalCount ?? null,
          xSecondsElapsed: h.xSecondsElapsed != null ? h.xSecondsElapsed : null,
          xRowsReturned: h.xRowsReturned ?? null,
          xLogId: h.xLogId ?? null,
        },
      }).catch((e) => console.error('SudregProxyLog create error:', e.message));
    } catch (err) {
      const durationMs = Date.now() - startMs;
      const statusCode = err.statusCode || 502;
      const body = err.body || { error: 'proxy_failed', message: err.message };
      sendJson(statusCode, body);
      prisma.sudregProxyLog.create({
        data: {
          endpoint: endpointForLog,
          queryString: queryString || null,
          responseStatus: statusCode,
          durationMs,
          clientIp: clientIp || null,
          userAgent: userAgent || null,
        },
      }).catch((e) => console.error('SudregProxyLog create error:', e.message));
    }
    return;
  }

  sendJson(404, { error: 'not_found', path });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
