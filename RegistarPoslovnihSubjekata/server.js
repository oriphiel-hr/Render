/**
 * HTTP server za Registar poslovnih subjekata.
 * - Render zahtijeva proces koji sluša na PORT.
 * - API: GET/POST /api/token – OAuth token za Sudski registar (sudreg-data.gov.hr).
 */
const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;

const SUDREG_TOKEN_URL = process.env.SUDREG_TOKEN_URL || 'https://sudreg-data.gov.hr/api/oauth/token';
const SUDREG_CLIENT_ID = process.env.SUDREG_CLIENT_ID || '';
const SUDREG_CLIENT_SECRET = process.env.SUDREG_CLIENT_SECRET || '';

/**
 * Dohvaća OAuth token od Sudskog registra (client_credentials).
 * Dokumentacija: data.gov.hr (Sudski registar), grant_type=client_credentials, Basic auth.
 * Token vrijedi 6 sati.
 */
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method;

  // Health / root
  if (path === '/' || path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'registar-poslovnih-subjekata',
      status: 'ok',
      endpoints: { token: 'GET|POST /api/token' },
    }));
    return;
  }

  // GET ili POST /api/token – OAuth token za Sudski registar
  if (path === '/api/token' && (method === 'GET' || method === 'POST')) {
    try {
      const tokenResponse = await fetchSudregToken();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tokenResponse));
    } catch (err) {
      const status = err.message.includes('SUDREG_CLIENT') ? 503 : 502;
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'token_failed',
        message: err.message,
      }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found', path }));
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
