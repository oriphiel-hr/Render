/**
 * HTTP servis za Render (PORT).
 * Sudreg token: require('./sudregToken') iz /api/sudreg/token-info.
 */
try {
  require('dotenv').config();
} catch (_) {
  /* dotenv nije obavezan na Renderu */
}

const http = require('http');
const fs = require('fs');
const path = require('path');
const { getSudregAccessToken } = require('./sudregToken');
const { getFetchTimeoutMs, getRetryCount } = require('./sudregHttp');
const { getSnapshots, getPromjene } = require('./sudregApi');
const { comparePromjeneSnapshots } = require('./sudregPromjeneDiff');
const { listSifrarniciCatalog, getSifrarnik } = require('./sudregSifrarnici');
const { listDatasets } = require('./sudregDatasets');
const { fetchDatasetPage, listDatasetFetchOptions } = require('./sudregDatasetFetch');
const {
  getDataDir,
  saveSnapshotPromjene,
  savePromjeneDiff,
  listStaging,
  resolveStagingDownload
} = require('./sudregStaging');
const {
  shouldSyncDb,
  syncSnapshotPromjeneToDb,
  syncDiffPromjeneToDb,
  getDbStagingSummary,
  isDatabaseConfigured
} = require('./sudregDb');
const { runFullImport } = require('./sudregFullImport');

const port = Number(process.env.PORT) || 3000;

/** Render Docker (backend/): /app/public — lokalno: backend/public */
function findIndexHtmlPath() {
  const candidates = [
    path.join(__dirname, '..', 'public', 'index.html'),
    path.join(process.cwd(), 'public', 'index.html'),
    path.join(process.cwd(), 'backend', 'public', 'index.html')
  ];
  for (const file of candidates) {
    if (fs.existsSync(file)) return file;
  }
  return null;
}

const HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache'
};

function jsonReplacer(_key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body, jsonReplacer, 2));
}

function beginSse(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-store',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  return (payload) => {
    res.write(`data: ${JSON.stringify(payload, jsonReplacer)}\n\n`);
  };
}

function sendText(res, status, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
  res.end(text);
}

function sendFileDownload(res, filePath, downloadName, contentType) {
  if (!fs.existsSync(filePath)) {
    sendJson(res, 404, { ok: false, error: 'Datoteka ne postoji na disku.', path: filePath });
    return;
  }
  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${downloadName.replace(/"/g, '')}"`,
    'Content-Length': stat.size,
    'Cache-Control': 'no-store'
  });
  const stream = fs.createReadStream(filePath);
  stream.on('error', (err) => {
    if (!res.headersSent) {
      sendJson(res, 500, { ok: false, error: err.message });
    } else {
      res.destroy();
    }
  });
  stream.pipe(res);
}

function handleStagingDownload(req, res) {
  const q = parseQueryString(req.url);
  const resolved = resolveStagingDownload(q);
  if (resolved.error) {
    sendJson(res, 400, { ok: false, error: resolved.error });
    return;
  }
  if (!fs.existsSync(resolved.filePath)) {
    sendJson(res, 404, {
      ok: false,
      error: 'Datoteka ne postoji na disku. Prvo „Spremi snimku” ili „Spremi diff”.',
      path: resolved.filePath
    });
    return;
  }
  if (req.method === 'HEAD') {
    const stat = fs.statSync(resolved.filePath);
    res.writeHead(200, {
      'Content-Type': resolved.contentType,
      'Content-Disposition': `attachment; filename="${resolved.downloadName.replace(/"/g, '')}"`,
      'Content-Length': stat.size,
      'Cache-Control': 'no-store'
    });
    res.end();
    return;
  }
  sendFileDownload(res, resolved.filePath, resolved.downloadName, resolved.contentType);
}

function serveIndexHtml(res) {
  const file = findIndexHtmlPath();
  if (!file) {
    sendText(
      res,
      500,
      'index.html nije pronađen. U Dockerfile dodaj: COPY public ./public (i redeploy).'
    );
    return;
  }
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      sendText(res, 500, 'index.html nije mogao biti učitan: ' + err.message);
      return;
    }
    res.writeHead(200, HTML_HEADERS);
    res.end(data);
  });
}

function parseQueryString(reqUrl) {
  const i = (reqUrl || '').indexOf('?');
  if (i < 0) return new URLSearchParams();
  return new URLSearchParams((reqUrl || '').slice(i + 1));
}

async function handleSudregSnapshots(req, res) {
  const q = parseQueryString(req.url);
  try {
    const result = await getSnapshots({
      no_data_error: q.get('no_data_error') || undefined,
      omit_nulls: q.get('omit_nulls') || undefined
    });
    sendJson(res, 200, {
      ok: true,
      endpoint: '/snapshots',
      source: result.url,
      meta: result.meta,
      data: result.data
    });
  } catch (e) {
    sendJson(res, 500, {
      ok: false,
      endpoint: '/snapshots',
      error: e instanceof Error ? e.message : String(e)
    });
  }
}

function parsePagingInt(value, fallback) {
  if (value == null || value === '') return fallback;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

async function handleSudregPromjene(req, res) {
  const q = parseQueryString(req.url);
  const snapshotId = q.get('snapshot_id');
  if (!snapshotId) {
    sendJson(res, 400, {
      ok: false,
      endpoint: '/promjene',
      error: 'snapshot_id je obavezan (odaberi snapshot u UI).'
    });
    return;
  }
  try {
    const result = await getPromjene({
      snapshot_id: snapshotId,
      offset: parsePagingInt(q.get('offset'), 0),
      limit: parsePagingInt(q.get('limit'), 1000),
      no_data_error: q.get('no_data_error') || undefined,
      omit_nulls: q.get('omit_nulls') || undefined
    });
    sendJson(res, 200, {
      ok: true,
      endpoint: '/promjene',
      source: result.url,
      meta: result.meta,
      data: result.data
    });
  } catch (e) {
    sendJson(res, 500, {
      ok: false,
      endpoint: '/promjene',
      error: e instanceof Error ? e.message : String(e)
    });
  }
}

async function handleSudregPromjeneDiff(req, res) {
  const q = parseQueryString(req.url);
  const fromId = q.get('snapshot_id_from');
  const toId = q.get('snapshot_id_to');
  if (!fromId || !toId) {
    sendJson(res, 400, {
      ok: false,
      endpoint: '/promjene/diff',
      error: 'snapshot_id_from i snapshot_id_to su obavezni (starija i novija snimka).'
    });
    return;
  }
  if (String(fromId) === String(toId)) {
    sendJson(res, 400, {
      ok: false,
      endpoint: '/promjene/diff',
      error: 'Odaberi dvije različite snimke za usporedbu.'
    });
    return;
  }
  const t0 = Date.now();
  try {
    const result = await comparePromjeneSnapshots({
      snapshot_id_from: fromId,
      snapshot_id_to: toId
    });
    sendJson(res, 200, {
      ok: true,
      endpoint: '/promjene/diff',
      durationMs: Date.now() - t0,
      ...result
    });
  } catch (e) {
    sendJson(res, 500, {
      ok: false,
      endpoint: '/promjene/diff',
      durationMs: Date.now() - t0,
      error: e instanceof Error ? e.message : String(e)
    });
  }
}

async function handleStagingList(res) {
  try {
    sendJson(res, 200, { ok: true, ...listStaging() });
  } catch (e) {
    sendJson(res, 500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}

async function handleStagingSavePromjene(req, res) {
  const q = parseQueryString(req.url);
  const snapshotId = q.get('snapshot_id');
  if (!snapshotId) {
    sendJson(res, 400, { ok: false, error: 'snapshot_id je obavezan.' });
    return;
  }
  const force = q.get('force') === '1';
  const syncDb = shouldSyncDb({ sync_db: q.get('sync_db') });
  const t0 = Date.now();
  try {
    const result = await saveSnapshotPromjene(snapshotId, { force });
    let database = null;
    if (syncDb) {
      database = await syncSnapshotPromjeneToDb(snapshotId);
    }
    sendJson(res, 200, {
      ok: true,
      durationMs: Date.now() - t0,
      dataDir: getDataDir(),
      database,
      ...result
    });
  } catch (e) {
    sendJson(res, 500, {
      ok: false,
      durationMs: Date.now() - t0,
      error: e instanceof Error ? e.message : String(e)
    });
  }
}

async function handleStagingSaveDiff(req, res) {
  const q = parseQueryString(req.url);
  const fromId = q.get('snapshot_id_from');
  const toId = q.get('snapshot_id_to');
  if (!fromId || !toId) {
    sendJson(res, 400, {
      ok: false,
      error: 'snapshot_id_from i snapshot_id_to su obavezni.'
    });
    return;
  }
  const saveSnapshots = q.get('save_snapshots') !== '0';
  const syncDb = shouldSyncDb({ sync_db: q.get('sync_db') });
  const t0 = Date.now();
  try {
    const result = await savePromjeneDiff(fromId, toId, {
      save_snapshots: saveSnapshots,
      prefer_disk: true
    });
    let database = null;
    if (syncDb) {
      database = await syncDiffPromjeneToDb(fromId, toId);
    }
    sendJson(res, 200, {
      ok: true,
      durationMs: Date.now() - t0,
      dataDir: getDataDir(),
      database,
      ...result
    });
  } catch (e) {
    sendJson(res, 500, {
      ok: false,
      durationMs: Date.now() - t0,
      error: e instanceof Error ? e.message : String(e)
    });
  }
}

async function handleDbStagingSummary(res) {
  try {
    const summary = await getDbStagingSummary();
    sendJson(res, 200, { ok: true, ...summary });
  } catch (e) {
    sendJson(res, 500, {
      ok: false,
      error: e instanceof Error ? e.message : String(e)
    });
  }
}

function parseImportAllQuery(req) {
  const q = parseQueryString(req.url);
  const toId = q.get('snapshot_id_to') || q.get('snapshot_id');
  const fromId = q.get('snapshot_id_from');
  if (!toId) {
    return { error: 'snapshot_id_to (ili snapshot_id) je obavezan — novija snimka.' };
  }
  return {
    toId,
    fromId: fromId || undefined,
    sync_db: q.get('sync_db'),
    force: q.get('force') === '1'
  };
}

async function handleStagingImportAll(req, res) {
  const parsed = parseImportAllQuery(req);
  if (parsed.error) {
    sendJson(res, 400, { ok: false, error: parsed.error });
    return;
  }
  const t0 = Date.now();
  try {
    const result = await runFullImport({
      snapshot_id_to: parsed.toId,
      snapshot_id_from: parsed.fromId,
      sync_db: parsed.sync_db,
      force: parsed.force
    });
    sendJson(res, 200, {
      ok: true,
      durationMs: Date.now() - t0,
      dataDir: getDataDir(),
      ...result
    });
  } catch (e) {
    sendJson(res, 500, {
      ok: false,
      durationMs: Date.now() - t0,
      error: e instanceof Error ? e.message : String(e)
    });
  }
}

async function handleStagingImportAllStream(req, res) {
  const parsed = parseImportAllQuery(req);
  if (parsed.error) {
    sendJson(res, 400, { ok: false, error: parsed.error });
    return;
  }
  const send = beginSse(res);
  const t0 = Date.now();
  let closed = false;
  req.on('close', () => {
    closed = true;
  });

  try {
    const result = await runFullImport({
      snapshot_id_to: parsed.toId,
      snapshot_id_from: parsed.fromId,
      sync_db: parsed.sync_db,
      force: parsed.force,
      onProgress: (ev) => {
        if (!closed) send(ev);
      }
    });
    if (!closed) {
      send({
        type: 'done',
        ok: true,
        durationMs: Date.now() - t0,
        dataDir: getDataDir(),
        ...result
      });
    }
  } catch (e) {
    if (!closed) {
      send({
        type: 'error',
        ok: false,
        durationMs: Date.now() - t0,
        error: e instanceof Error ? e.message : String(e)
      });
    }
  }
  if (!closed) res.end();
}

async function handleStagingSyncDb(req, res) {
  const q = parseQueryString(req.url);
  const snapshotId = q.get('snapshot_id');
  const fromId = q.get('snapshot_id_from');
  const toId = q.get('snapshot_id_to');
  const t0 = Date.now();
  if (!isDatabaseConfigured()) {
    sendJson(res, 400, { ok: false, error: 'DATABASE_URL nije postavljen.' });
    return;
  }
  try {
    let database;
    if (fromId && toId) {
      database = await syncDiffPromjeneToDb(fromId, toId);
    } else if (snapshotId) {
      database = await syncSnapshotPromjeneToDb(snapshotId);
    } else {
      sendJson(res, 400, {
        ok: false,
        error: 'snapshot_id ili snapshot_id_from + snapshot_id_to su obavezni.'
      });
      return;
    }
    sendJson(res, 200, {
      ok: true,
      durationMs: Date.now() - t0,
      database
    });
  } catch (e) {
    sendJson(res, 500, {
      ok: false,
      durationMs: Date.now() - t0,
      error: e instanceof Error ? e.message : String(e)
    });
  }
}

function handleSudregDatasetsList(res) {
  sendJson(res, 200, {
    ok: true,
    endpoint: '/datasets',
    description: 'Skupovi matičnih podataka — dohvat: GET /api/sudreg/datasets/{id}',
    fetchOptions: listDatasetFetchOptions(),
    data: listDatasets()
  });
}

async function handleSudregDatasetFetch(req, res, datasetId) {
  const q = parseQueryString(req.url);
  const snapshotId = q.get('snapshot_id');
  if (!snapshotId) {
    sendJson(res, 400, {
      ok: false,
      endpoint: `/datasets/${datasetId}`,
      error: 'snapshot_id je obavezan (odaberi snimku u UI).'
    });
    return;
  }
  const t0 = Date.now();
  try {
    const result = await fetchDatasetPage(datasetId, {
      snapshot_id: snapshotId,
      offset: parsePagingInt(q.get('offset'), 0),
      limit: parsePagingInt(q.get('limit'), 1000),
      api_path: q.get('api_path') || undefined,
      vrsta: q.get('vrsta') || undefined,
      only_active: q.get('only_active') || undefined,
      expand_relations: q.get('expand_relations') || undefined,
      no_data_error: q.get('no_data_error') || '0',
      omit_nulls: q.get('omit_nulls') || undefined
    });
    sendJson(res, 200, {
      ok: true,
      endpoint: result.api_path,
      dataset_id: result.dataset_id,
      label: result.label,
      durationMs: Date.now() - t0,
      source: result.url,
      meta: result.meta,
      rowCount: result.rowCount,
      totalCount: result.totalCount,
      query: {
        snapshot_id: snapshotId,
        offset: parsePagingInt(q.get('offset'), 0),
        limit: parsePagingInt(q.get('limit'), 1000),
        only_active: q.get('only_active') || (datasetId === 'subjekti' ? '1' : undefined),
        expand_relations: q.get('expand_relations') || undefined,
        api_path: q.get('api_path') || undefined,
        vrsta: q.get('vrsta') || undefined
      },
      data: result.data
    });
  } catch (e) {
    sendJson(res, 500, {
      ok: false,
      endpoint: `/datasets/${datasetId}`,
      durationMs: Date.now() - t0,
      error: e instanceof Error ? e.message : String(e)
    });
  }
}

function handleSudregSifrarniciList(res) {
  sendJson(res, 200, {
    ok: true,
    endpoint: '/sifrarnici',
    paging: false,
    description: 'Šifrarnici se dohvaćaju cijeli u jednom odgovoru (bez offset/limit).',
    data: listSifrarniciCatalog()
  });
}

async function handleSudregSifrarnikFetch(req, res, sifrarnikId) {
  const q = parseQueryString(req.url);
  const t0 = Date.now();
  try {
    const result = await getSifrarnik(sifrarnikId, {
      snapshot_id: q.get('snapshot_id') || undefined,
      expand_relations: q.get('expand_relations') || undefined,
      history_columns: q.get('history_columns') || undefined,
      no_data_error: q.get('no_data_error') || '0',
      omit_nulls: q.get('omit_nulls') || undefined
    });
    sendJson(res, 200, {
      ok: true,
      endpoint: result.path,
      sifrarnik_id: result.sifrarnik_id,
      label: result.label,
      paging: false,
      durationMs: Date.now() - t0,
      source: result.url,
      meta: result.meta,
      rowCount: result.rowCount,
      totalCount: result.totalCount,
      data: result.data
    });
  } catch (e) {
    sendJson(res, 500, {
      ok: false,
      endpoint: `/sifrarnici/${sifrarnikId}`,
      durationMs: Date.now() - t0,
      error: e instanceof Error ? e.message : String(e)
    });
  }
}

async function handleSudregTokenInfo(res) {
  try {
    const t = await getSudregAccessToken();
    sendJson(res, 200, {
      ok: true,
      tokenType: t.tokenType,
      expiresIn: t.expiresIn,
      scope: t.scope,
      accessTokenPreview: t.accessToken.slice(0, 12) + '…',
      message: 'Sudreg OAuth token uspješno dohvaćen (puni token se ne vraća u odgovoru).'
    });
  } catch (e) {
    sendJson(res, 500, {
      ok: false,
      error: e instanceof Error ? e.message : String(e)
    });
  }
}

/** Dijagnostika mreže prema Sudregu (token + mali GET /snapshots). */
async function handleSudregConnectivity(res) {
  const steps = [];
  const clientId = String(process.env.SUDREG_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.SUDREG_CLIENT_SECRET || '').trim();

  steps.push({
    step: 'env',
    ok: Boolean(clientId && clientSecret),
    detail: clientId && clientSecret ? 'SUDREG_CLIENT_ID i SECRET postavljeni' : 'Nedostaje SUDREG_CLIENT_ID ili SUDREG_CLIENT_SECRET'
  });

  if (!clientId || !clientSecret) {
    sendJson(res, 500, { ok: false, steps });
    return;
  }

  try {
    const t0 = Date.now();
    await getSudregAccessToken();
    steps.push({
      step: 'oauth_token',
      ok: true,
      durationMs: Date.now() - t0,
      detail: 'OAuth token OK'
    });
  } catch (e) {
    steps.push({
      step: 'oauth_token',
      ok: false,
      error: e instanceof Error ? e.message : String(e)
    });
    sendJson(res, 500, { ok: false, steps, fetchTimeoutMs: getFetchTimeoutMs(), fetchRetries: getRetryCount() });
    return;
  }

  try {
    const t0 = Date.now();
    const result = await getSnapshots({ no_data_error: '0' });
    const rows = Array.isArray(result.data) ? result.data.length : 0;
    steps.push({
      step: 'javni_snapshots',
      ok: true,
      durationMs: Date.now() - t0,
      detail: `GET /snapshots OK, redova=${rows}`,
      xSecondsElapsed: result.meta?.xSecondsElapsed
    });
    sendJson(res, 200, {
      ok: true,
      steps,
      fetchTimeoutMs: getFetchTimeoutMs(),
      fetchRetries: getRetryCount(),
      message: 'Veza prema Sudreg API-ju radi.'
    });
  } catch (e) {
    steps.push({
      step: 'javni_snapshots',
      ok: false,
      error: e instanceof Error ? e.message : String(e)
    });
    sendJson(res, 500, {
      ok: false,
      steps,
      fetchTimeoutMs: getFetchTimeoutMs(),
      fetchRetries: getRetryCount()
    });
  }
}

const server = http.createServer((req, res) => {
  const pathOnly = (req.url || '').split('?')[0] || '/';

  if (pathOnly === '/health') {
    sendText(res, 200, 'ok');
    return;
  }

  if (pathOnly === '/api/status') {
    sendJson(res, 200, {
      ok: true,
      service: 'registar-poslovnih-subjekata',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      sudregConfigured: Boolean(
        String(process.env.SUDREG_CLIENT_ID || '').trim() &&
          String(process.env.SUDREG_CLIENT_SECRET || '').trim()
      ),
      databaseConfigured: isDatabaseConfigured(),
      dataDir: getDataDir(),
      sudregFetchTimeoutMs: getFetchTimeoutMs(),
      sudregFetchRetries: getRetryCount()
    });
    return;
  }

  if (pathOnly === '/api/sudreg/token-info' && req.method === 'GET') {
    handleSudregTokenInfo(res);
    return;
  }

  if (pathOnly === '/api/sudreg/connectivity' && req.method === 'GET') {
    handleSudregConnectivity(res);
    return;
  }

  if (pathOnly === '/api/sudreg/snapshots' && req.method === 'GET') {
    handleSudregSnapshots(req, res);
    return;
  }

  if (pathOnly === '/api/sudreg/datasets' && req.method === 'GET') {
    handleSudregDatasetsList(res);
    return;
  }

  const datasetMatch = /^\/api\/sudreg\/datasets\/([^/]+)$/.exec(pathOnly);
  if (datasetMatch && req.method === 'GET') {
    handleSudregDatasetFetch(req, res, decodeURIComponent(datasetMatch[1]));
    return;
  }

  if (pathOnly === '/api/sudreg/sifrarnici' && req.method === 'GET') {
    handleSudregSifrarniciList(res);
    return;
  }

  const sifrarnikMatch = /^\/api\/sudreg\/sifrarnici\/([^/]+)$/.exec(pathOnly);
  if (sifrarnikMatch && req.method === 'GET') {
    handleSudregSifrarnikFetch(req, res, decodeURIComponent(sifrarnikMatch[1]));
    return;
  }

  if (pathOnly === '/api/sudreg/promjene' && req.method === 'GET') {
    handleSudregPromjene(req, res);
    return;
  }

  if (pathOnly === '/api/sudreg/promjene/diff' && req.method === 'GET') {
    handleSudregPromjeneDiff(req, res);
    return;
  }

  if (pathOnly === '/api/staging/list' && req.method === 'GET') {
    handleStagingList(res);
    return;
  }

  if (
    pathOnly === '/api/staging/download' &&
    (req.method === 'GET' || req.method === 'HEAD')
  ) {
    handleStagingDownload(req, res);
    return;
  }

  if (pathOnly === '/api/staging/save-promjene' && req.method === 'GET') {
    handleStagingSavePromjene(req, res);
    return;
  }

  if (pathOnly === '/api/staging/save-diff' && req.method === 'GET') {
    handleStagingSaveDiff(req, res);
    return;
  }

  if (pathOnly === '/api/staging/sync-db' && req.method === 'GET') {
    handleStagingSyncDb(req, res);
    return;
  }

  if (pathOnly === '/api/staging/import-all' && req.method === 'GET') {
    handleStagingImportAll(req, res);
    return;
  }

  if (pathOnly === '/api/staging/import-all/stream' && req.method === 'GET') {
    handleStagingImportAllStream(req, res);
    return;
  }

  if (pathOnly === '/api/db/staging' && req.method === 'GET') {
    handleDbStagingSummary(res);
    return;
  }

  if (pathOnly === '/' || pathOnly === '/index.html') {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendText(res, 405, 'Method Not Allowed');
      return;
    }
    if (req.method === 'HEAD') {
      res.writeHead(200, HTML_HEADERS);
      res.end();
      return;
    }
    serveIndexHtml(res);
    return;
  }

  sendText(res, 404, 'Not found');
});

server.listen(port, '0.0.0.0', () => {
  const indexPath = findIndexHtmlPath();
  console.log(`[registar-rps] listening on 0.0.0.0:${port}`);
  console.log(`[registar-rps] staging dataDir: ${getDataDir()}`);
  console.log(
    `[registar-rps] database: ${isDatabaseConfigured() ? 'DATABASE_URL postavljen (disk → JSON → PostgreSQL)' : 'nije konfigurirano'}`
  );
  if (indexPath) console.log(`[registar-rps] index.html: ${indexPath}`);
  else console.warn('[registar-rps] index.html missing — COPY public ./public u Dockerfile.prod');
});
