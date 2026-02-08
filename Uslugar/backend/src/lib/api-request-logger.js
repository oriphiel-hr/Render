/**
 * API Request Logger Middleware
 * Logira sve API zahtjeve u bazu za monitoring i debugging
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
  const originalSend = res.send;
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

  // Intercept response – uvijek snimi Request i Response za debugging (i nakon rollbacka ako log ne rollbackamo)
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    let responseBody = null;
    try {
      const parsed = typeof data === 'string' ? (data && data.trim() && (data.trim()[0] === '{' || data.trim()[0] === '[') ? JSON.parse(data) : data) : data;
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
      requestBody,
      responseBody,
      responseTime,
      errorMessage: statusCode >= 400 ? (data?.error || data?.message || 'Unknown error') : null
    }).catch(err => {
      console.error('Error logging API request:', err);
    });
    return originalSend.call(this, data);
  };

  // Handle errors
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

    // Ne logiraj ako je response time prekratak (vjerojatno health check ili static file)
    if (data.responseTime < 10) {
      return;
    }

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
  } catch (error) {
    // Ne bacaj grešku - logging ne smije blokirati aplikaciju
    console.error('Error creating API request log:', error);
  }
}

