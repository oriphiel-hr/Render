/**
 * HTTP prema Sudregu — timeout, retry na mrežne greške, čitljive poruke (umjesto samo "fetch failed").
 */

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 2_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getFetchTimeoutMs() {
  const n = Number(process.env.SUDREG_FETCH_TIMEOUT_MS);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TIMEOUT_MS;
}

function getRetryCount() {
  const n = Number(process.env.SUDREG_FETCH_RETRIES);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : DEFAULT_RETRIES;
}

function errorCode(err) {
  if (!err || typeof err !== 'object') return '';
  if (err.code) return String(err.code);
  if (err.cause && err.cause.code) return String(err.cause.code);
  return '';
}

function isRetryableNetworkError(err) {
  if (!err) return false;
  const msg = String(err.message || err).toLowerCase();
  const code = errorCode(err).toLowerCase();
  if (err.name === 'AbortError' && msg.includes('timeout')) return true;
  if (code === 'aborterror' && msg.includes('timeout')) return true;
  const retryCodes = [
    'econnreset',
    'etimedout',
    'econnrefused',
    'enotfound',
    'eai_again',
    'und_err_connect_timeout',
    'und_err_headers_timeout',
    'und_err_body_timeout',
    'und_err_socket'
  ];
  if (retryCodes.some((c) => code.includes(c))) return true;
  if (msg.includes('fetch failed')) return true;
  if (msg.includes('network') || msg.includes('socket') || msg.includes('timed out')) return true;
  return false;
}

/**
 * @param {unknown} err
 * @param {string} label — npr. "Sudreg token" ili "Sudreg GET /subjekti"
 */
function formatSudregFetchError(err, label) {
  const parts = [label];
  if (err instanceof Error) {
    if (err.message && err.message !== 'fetch failed') {
      parts.push(err.message);
    } else if (err.message) {
      parts.push('mrežna greška (fetch failed)');
    }
    const c = err.cause;
    if (c instanceof Error) {
      if (c.message && !parts.includes(c.message)) parts.push(c.message);
    } else if (c && typeof c === 'object' && c.message) {
      parts.push(String(c.message));
    }
    const code = errorCode(err);
    if (code) parts.push(`(${code})`);
  } else {
    parts.push(String(err));
  }
  parts.push(
    '— provjeri SUDREG_CLIENT_ID/SECRET na Renderu, mrežu i /api/sudreg/connectivity'
  );
  return parts.join(' ');
}

function mergeSignals(userSignal, timeoutMs) {
  const signals = [];
  if (userSignal) signals.push(userSignal);
  if (typeof AbortSignal.timeout === 'function') {
    signals.push(AbortSignal.timeout(timeoutMs));
  }
  if (signals.length === 0) return undefined;
  if (signals.length === 1) return signals[0];
  if (typeof AbortSignal.any === 'function') return AbortSignal.any(signals);
  return signals[0];
}

/**
 * @param {string} url
 * @param {RequestInit} init
 * @param {{ label?: string, retries?: number, retryDelayMs?: number }} [opts]
 */
async function sudregFetch(url, init = {}, opts = {}) {
  const label = opts.label || `Sudreg ${url}`;
  const retries = opts.retries != null ? opts.retries : getRetryCount();
  const retryDelayMs = opts.retryDelayMs != null ? opts.retryDelayMs : DEFAULT_RETRY_DELAY_MS;
  const timeoutMs = getFetchTimeoutMs();
  let lastErr;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const signal = mergeSignals(init.signal, timeoutMs);
      return await fetch(url, { ...init, signal });
    } catch (err) {
      lastErr = err;
      const retryable = isRetryableNetworkError(err);
      if (retryable && attempt <= retries) {
        await sleep(retryDelayMs * attempt);
        continue;
      }
      throw new Error(formatSudregFetchError(err, label), { cause: err });
    }
  }

  throw new Error(formatSudregFetchError(lastErr, label), { cause: lastErr });
}

module.exports = {
  sudregFetch,
  formatSudregFetchError,
  isRetryableNetworkError,
  getFetchTimeoutMs,
  getRetryCount
};
