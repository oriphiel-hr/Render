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
const { getSnapshots, getPromjene } = require('./sudregApi');
const { comparePromjeneSnapshots } = require('./sudregPromjeneDiff');
const {
  getDataDir,
  saveSnapshotPromjene,
  savePromjeneDiff,
  listStaging,
  resolveStagingDownload
} = require('./sudregStaging');

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

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body, null, 2));
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
  const t0 = Date.now();
  try {
    const result = await saveSnapshotPromjene(snapshotId, { force });
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
  const t0 = Date.now();
  try {
    const result = await savePromjeneDiff(fromId, toId, {
      save_snapshots: saveSnapshots,
      prefer_disk: true
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
      dataDir: getDataDir()
    });
    return;
  }

  if (pathOnly === '/api/sudreg/token-info' && req.method === 'GET') {
    handleSudregTokenInfo(res);
    return;
  }

  if (pathOnly === '/api/sudreg/snapshots' && req.method === 'GET') {
    handleSudregSnapshots(req, res);
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

  if (pathOnly === '/api/staging/download' && req.method === 'GET') {
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
  if (indexPath) console.log(`[registar-rps] index.html: ${indexPath}`);
  else console.warn('[registar-rps] index.html missing — COPY public ./public u Dockerfile.prod');
});
