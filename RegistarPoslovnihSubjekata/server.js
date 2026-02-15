/**
 * HTTP server za Registar poslovnih subjekata.
 * - GET/POST /api/token – OAuth token za Sudski registar.
 * - GET /api/sudreg/:endpoint – proxy prema sudreg-data.gov.hr (samo dohvat, bez spremanja u bazu).
 */
const http = require('http');
const https = require('https');

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

async function proxyWithToken(endpoint, queryString, snapshotId, token) {
  return new Promise((resolve, reject) => {
    const path = queryString ? `${endpoint}?${queryString}` : endpoint;
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
    if (snapshotId) options.headers['X-Snapshot-Id'] = String(snapshotId);
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
          resolve({ statusCode: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
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

  const sendJson = (status, obj) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
  };

  // Health / root
  if (path === '/' || path === '/health') {
    sendJson(200, {
      service: 'registar-poslovnih-subjekata',
      status: 'ok',
      endpoints: {
        token: 'GET|POST /api/token',
        sudreg: 'GET /api/sudreg/:endpoint (query params i X-Snapshot-Id proslijeđeni Sudregu)',
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

  // GET /api/sudreg/:endpoint – proxy (samo dohvat, bez spremanja u bazu)
  const sudregMatch = path.match(/^\/api\/sudreg\/(.+)$/);
  if (method === 'GET' && sudregMatch) {
    const endpoint = sudregMatch[1].replace(/\/$/, '');
    const queryString = url.search ? url.search.slice(1) : '';
    const snapshotId = url.searchParams.get('X-Snapshot-Id') || req.headers['x-snapshot-id'];
    try {
      const token = await getSudregToken();
      const result = await proxyWithToken(endpoint, queryString, snapshotId, token);
      sendJson(result.statusCode, result.body);
    } catch (err) {
      if (err.statusCode) {
        sendJson(err.statusCode, err.body || { error: 'sudreg_error' });
      } else {
        sendJson(502, { error: 'proxy_failed', message: err.message });
      }
    }
    return;
  }

  sendJson(404, { error: 'not_found', path });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
