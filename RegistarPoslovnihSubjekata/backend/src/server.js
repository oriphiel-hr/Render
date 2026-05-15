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

let cachedIndexHtml = null;

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

function serveIndexHtml(res) {
  if (cachedIndexHtml) {
    sendText(res, 200, cachedIndexHtml, 'text/html; charset=utf-8');
    return;
  }
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
    cachedIndexHtml = data;
    sendText(res, 200, data, 'text/html; charset=utf-8');
  });
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
      )
    });
    return;
  }

  if (pathOnly === '/api/sudreg/token-info' && req.method === 'GET') {
    handleSudregTokenInfo(res);
    return;
  }

  if (pathOnly === '/' || pathOnly === '/index.html') {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendText(res, 405, 'Method Not Allowed');
      return;
    }
    if (req.method === 'HEAD') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
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
  if (indexPath) console.log(`[registar-rps] index.html: ${indexPath}`);
  else console.warn('[registar-rps] index.html missing — COPY public ./public u Dockerfile.prod');
});
