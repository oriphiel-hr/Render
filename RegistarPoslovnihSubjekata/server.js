/**
 * Minimalni HTTP server za Registar poslovnih subjekata.
 * - GET/POST /api/sudreg_token – OAuth token za Sudski registar.
 * - GET /api/sudreg?endpoint=<name>&... – jedan proxy prema Sudreg API-ju; endpoint = naziv resursa (npr. subjekti, detalji_subjekta, sudovi). Svi ostali query parametri (snapshot_id, limit, offset, no_data_error, omit_nulls, expand_relations, history_columns, tip_identifikatora, identifikator, only_active, tvrtka_naziv) prosljeđuju se API-ju.
 *   Dokumentacija: https://sudreg-data.gov.hr/api/javni/dokumentacija/open_api
 */
const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;
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
      const headers = { 'Content-Type': 'application/json', ...result.headers };
      res.writeHead(result.statusCode, headers);
      res.end(typeof result.body === 'string' ? result.body : JSON.stringify(result.body));
    } catch (err) {
      const status = err.message.includes('SUDREG_CLIENT') ? 503 : 502;
      sendJson(status, { error: 'proxy_failed', message: err.message });
    }
    return;
  }

  sendJson(404, { error: 'not_found', path });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
