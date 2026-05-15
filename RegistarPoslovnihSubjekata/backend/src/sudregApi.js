/**
 * Proxy pozivi na Sudski registar — javni REST API.
 * @see https://sudreg-data.gov.hr/api/javni/dokumentacija/open_api
 */

const { getSudregAccessToken, sudregAuthorizationHeader } = require('./sudregToken');

const DEFAULT_JAVNI_BASE = 'https://sudreg-data.gov.hr/api/javni';

function javniBaseUrl() {
  return String(process.env.SUDREG_JAVNI_BASE_URL || DEFAULT_JAVNI_BASE).replace(/\/$/, '');
}

/**
 * @param {string} path — npr. "/snapshots" (vodeća kosina opcionalna)
 * @param {Record<string, string | number | undefined>} [query]
 * @param {{ signal?: AbortSignal }} [opts]
 */
async function fetchSudregJavni(path, query = {}, opts = {}) {
  const base = javniBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(base + normalized);

  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    url.searchParams.set(k, String(v));
  }

  const { accessToken, tokenType } = await getSudregAccessToken({ signal: opts.signal });

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: sudregAuthorizationHeader(accessToken, tokenType)
    },
    signal: opts.signal
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  const meta = {
    xTotalCount: res.headers.get('x-total-count'),
    xRowsReturned: res.headers.get('x-rows-returned'),
    xSecondsElapsed: res.headers.get('x-seconds-elapsed'),
    xLogId: res.headers.get('x-log-id'),
    xSnapshotId: res.headers.get('x-snapshot-id'),
    xTimestamp: res.headers.get('x-timestamp')
  };

  if (!res.ok) {
    const hint =
      (data && data.error_message) ||
      (Array.isArray(data) && data[0]?.error_message) ||
      (data && data.message) ||
      (typeof data === 'string' ? data : JSON.stringify(data));
    throw new Error(`Sudreg ${normalized} ${res.status}: ${hint || res.statusText}`);
  }

  return { url: url.toString(), data, meta, status: res.status };
}

/**
 * GET /snapshots — popis snimki glavne baze.
 * @param {{ no_data_error?: string, omit_nulls?: string, signal?: AbortSignal }} [query]
 */
async function getSnapshots(query = {}) {
  return fetchSudregJavni('/snapshots', {
    no_data_error: query.no_data_error,
    omit_nulls: query.omit_nulls
  }, { signal: query.signal });
}

module.exports = {
  javniBaseUrl,
  fetchSudregJavni,
  getSnapshots,
  DEFAULT_JAVNI_BASE
};
