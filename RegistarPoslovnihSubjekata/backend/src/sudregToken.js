/**
 * OAuth2 client credentials — Sudski registar javni API.
 * @see https://sudreg-data.gov.hr/api/javni/dokumentacija/open_api (securitySchemes.Oauth2)
 *
 * Env (Render):
 * - SUDREG_CLIENT_ID
 * - SUDREG_CLIENT_SECRET
 * - SUDREG_TOKEN_URL (default: https://sudreg-data.gov.hr/api/oauth/token)
 */

const { sudregFetch } = require('./sudregHttp');

const DEFAULT_TOKEN_URL = 'https://sudreg-data.gov.hr/api/oauth/token';

/**
 * @param {{ clientId?: string, clientSecret?: string, tokenUrl?: string, signal?: AbortSignal }} [opts]
 * @returns {Promise<{ accessToken: string, tokenType: string, expiresIn?: number, scope?: string, raw: object }>}
 */
async function getSudregAccessToken(opts = {}) {
  const clientId = String(opts.clientId ?? process.env.SUDREG_CLIENT_ID ?? '').trim();
  const clientSecret = String(opts.clientSecret ?? process.env.SUDREG_CLIENT_SECRET ?? '').trim();
  const tokenUrl = String(opts.tokenUrl ?? process.env.SUDREG_TOKEN_URL ?? DEFAULT_TOKEN_URL).trim();

  if (!clientId || !clientSecret) {
    throw new Error('Nedostaju SUDREG_CLIENT_ID ili SUDREG_CLIENT_SECRET (ili opts.clientId / opts.clientSecret).');
  }

  // Sudreg dokumentacija: curl --user ClientId:ClientSecret --data "grant_type=client_credentials"
  // (Basic auth u headeru, ne client_id/client_secret u body-ju).
  const basic = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
  const body = new URLSearchParams({ grant_type: 'client_credentials' });

  const res = await sudregFetch(
    tokenUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${basic}`
      },
      body: body.toString(),
      signal: opts.signal
    },
    { label: 'Sudreg OAuth token' }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const hint =
      data.error_description ||
      data.error ||
      data.message ||
      (typeof data === 'string' ? data : JSON.stringify(data));
    throw new Error(`Sudreg token ${res.status}: ${hint || res.statusText}`);
  }

  const accessToken = data.access_token != null ? String(data.access_token) : '';
  if (!accessToken) {
    throw new Error('Odgovor tokena ne sadrži access_token: ' + JSON.stringify(data));
  }

  return {
    accessToken,
    tokenType: data.token_type != null ? String(data.token_type) : 'Bearer',
    expiresIn: data.expires_in != null ? Number(data.expires_in) : undefined,
    scope: data.scope != null ? String(data.scope) : undefined,
    raw: data
  };
}

/**
 * Zaglavlje Authorization za GET pozive na /api/javni/...
 * @param {string} accessToken
 * @param {string} [tokenType]
 */
function sudregAuthorizationHeader(accessToken, tokenType = 'Bearer') {
  return `${tokenType} ${accessToken}`.trim();
}

module.exports = { getSudregAccessToken, sudregAuthorizationHeader, DEFAULT_TOKEN_URL };
