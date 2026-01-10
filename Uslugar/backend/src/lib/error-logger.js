/**
 * Error Logger
 * Centralizirano logiranje grešaka u bazu
 */

import { prisma } from './prisma.js';

/**
 * Logira grešku u bazu
 * @param {Error|Object} error - Error objekt ili error podaci
 * @param {Object} options - Dodatne opcije
 * @param {String} options.level - Error level (ERROR, WARN, CRITICAL)
 * @param {String} options.endpoint - API endpoint
 * @param {String} options.method - HTTP metoda
 * @param {String} options.userId - ID korisnika
 * @param {Object} options.req - Express request (opcionalno)
 * @param {Object} options.context - Dodatni kontekst
 */
export async function logError(error, options = {}) {
  try {
    const {
      level = 'ERROR',
      endpoint = null,
      method = null,
      userId = null,
      req = null,
      context = {}
    } = options;

    // Izvuci podatke iz error objekta
    const message = error?.message || error?.toString() || 'Unknown error';
    const stack = error?.stack || null;

    // Izvuci dodatne podatke iz request-a ako je dostupan
    const ipAddress = req?.ip || req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress || null;
    const userAgent = req?.headers['user-agent'] || null;
    const requestContext = req ? {
      path: req.path,
      query: req.query,
      params: req.params,
      body: sanitizeRequestBody(req.body)
    } : {};

    // Kombiniraj kontekst
    const fullContext = {
      ...requestContext,
      ...context
    };

    await prisma.errorLog.create({
      data: {
        level,
        message,
        stack,
        endpoint: endpoint || req?.path || null,
        method: method || req?.method || null,
        userId: userId || req?.user?.id || null,
        ipAddress,
        userAgent,
        context: Object.keys(fullContext).length > 0 ? fullContext : null,
        status: 'NEW'
      }
    });

    console.error(`[${level}] ${message}`, { endpoint, userId, stack });
  } catch (logError) {
    // Ne bacaj grešku - error logging ne smije blokirati aplikaciju
    console.error('Error creating error log:', logError);
    console.error('Original error:', error);
  }
}

/**
 * Sanitizira request body (ukloni osjetljive podatke)
 * @param {Object} body - Request body
 * @returns {Object} - Sanitizirani body
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = JSON.parse(JSON.stringify(body));
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken', 'creditCard', 'cvv'];

  function sanitize(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => sanitize(item));
    }
    if (obj && typeof obj === 'object') {
      const result = {};
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '***REDACTED***';
        } else {
          result[key] = sanitize(obj[key]);
        }
      }
      return result;
    }
    return obj;
  }

  return sanitize(sanitized);
}

/**
 * Error handler middleware za Express
 * Automatski logira sve greške
 */
export function errorHandlerMiddleware(err, req, res, next) {
  // Logiraj grešku
  logError(err, {
    level: err.statusCode >= 500 ? 'CRITICAL' : 'ERROR',
    endpoint: req.path,
    method: req.method,
    userId: req.user?.id || null,
    req,
    context: {
      statusCode: err.statusCode || 500,
      originalUrl: req.originalUrl
    }
  }).catch(() => {
    // Ignore logging errors
  });

  // Nastavi sa standardnim error handling-om
  next(err);
}

