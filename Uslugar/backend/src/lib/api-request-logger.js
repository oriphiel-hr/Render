/**
 * API Request Logger Middleware
 * Logira sve API zahtjeve u bazu za monitoring i debugging.
 * Nije bitno tko poziva API ni s koje instance – API zna u koju bazu upisati (isti DATABASE_URL).
 */

import { prisma } from './prisma.js';

/**
 * Middleware za logiranje API zahtjeva
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken', 'verificationToken'];

function redact(obj) {
  if (obj == null || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const field of SENSITIVE_FIELDS) {
    if (out[field] !== undefined) out[field] = '***REDACTED***';
  }
  return out;
}

export async function apiRequestLogger(req, res, next) {
  const startTime = Date.now();
  const originalSend = res.send.bind(res);
  const originalJson = res.json.bind(res);
  let requestBody = null;
  let errorMessage = null;

  // Request: body za POST/PUT/PATCH, query za GET (i ostale metode) da uvijek ima što prikazati
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    try {
      requestBody = req.body ? JSON.parse(JSON.stringify(req.body)) : null;
      if (requestBody && typeof requestBody === 'object') requestBody = redact(requestBody);
    } catch (e) {
      // Ignore body parsing errors
    }
  } else if (req.method === 'GET' && req.query && Object.keys(req.query).length > 0) {
    requestBody = { query: redact(req.query) };
  }

  let logged = false;
  function captureAndLog(payload) {
    if (logged) return;
    logged = true;
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    // Request body: uzeti u trenutku odgovora (tada je req.body sigurno parsiran)
    let reqBody = null;
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body != null) {
      try {
        reqBody = JSON.parse(JSON.stringify(req.body));
        reqBody = redact(reqBody);
      } catch (_) {}
    } else if (req.method === 'GET' && req.query && Object.keys(req.query).length > 0) {
      reqBody = { query: redact(req.query) };
    }
    let responseBody = null;
    try {
      const parsed = typeof payload === 'string'
        ? (payload && payload.trim() && (payload.trim()[0] === '{' || payload.trim()[0] === '[') ? JSON.parse(payload) : payload)
        : payload;
      if (parsed && typeof parsed === 'object') {
        responseBody = JSON.parse(JSON.stringify(parsed));
        responseBody = redact(responseBody);
      } else if (typeof parsed === 'string') {
        responseBody = parsed.length <= 5000 ? parsed : parsed.slice(0, 5000) + '...[truncated]';
      }
    } catch (_) {}
    const pathWithQuery = req.path + (req.url && req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
    logRequest({
      method: req.method,
      path: pathWithQuery,
      statusCode,
      userId: req.user?.id || null,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      requestBody: reqBody ?? null,
      responseBody: responseBody ?? null,
      responseTime,
      errorMessage: statusCode >= 400 ? (payload && typeof payload === 'object' && (payload.error || payload.message)) || null : null
    }).catch(err => {
      console.error('Error logging API request:', err);
    });
  }

  res.send = function (data) {
    captureAndLog(data);
    return originalSend.call(this, data);
  };
  res.json = function (data) {
    captureAndLog(data);
    return originalJson.call(this, data);
  };

  res.on('finish', () => {
    if (res.statusCode >= 500) {
      errorMessage = 'Server error';
    }
  });

  next();
}

/**
 * Logira API zahtjev u bazu
 * @param {Object} data - Podaci za logiranje
 */
async function logRequest(data) {
  try {
    const pathBase = (data.path || '').split('?')[0];
    if (pathBase === '/health' || pathBase === '/api/health') return;
    if (!(data.path || '').startsWith('/api')) return;

    await prisma.apiRequestLog.create({
      data: {
        method: data.method,
        path: data.path,
        statusCode: data.statusCode,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        requestBody: data.requestBody,
        responseBody: data.responseBody,
        responseTime: data.responseTime,
        errorMessage: data.errorMessage
      }
    });
    // Jedna baza: svaki proces koji primi zahtjev upisuje u istu DB – u logovima vidiš tko je zapisao
    console.log('[apiRequestLog]', data.method, data.path, data.statusCode);
  } catch (error) {
    // Ne bacaj grešku - logging ne smije blokirati aplikaciju
    console.error('Error creating API request log:', error);
  }
}

