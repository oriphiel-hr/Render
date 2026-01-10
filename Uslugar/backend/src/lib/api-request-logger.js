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
export async function apiRequestLogger(req, res, next) {
  const startTime = Date.now();
  const originalSend = res.send;
  let requestBody = null;
  let errorMessage = null;

  // Snimi request body (samo za POST/PUT/PATCH)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    try {
      requestBody = req.body ? JSON.parse(JSON.stringify(req.body)) : null;
      // Ukloni osjetljive podatke (lozinke, tokeni)
      if (requestBody && typeof requestBody === 'object') {
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'];
        sensitiveFields.forEach(field => {
          if (requestBody[field]) {
            requestBody[field] = '***REDACTED***';
          }
        });
      }
    } catch (e) {
      // Ignore body parsing errors
    }
  }

  // Intercept response
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Log asynchronously (ne blokira response)
    logRequest({
      method: req.method,
      path: req.path,
      statusCode,
      userId: req.user?.id || null,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      requestBody,
      responseTime,
      errorMessage: statusCode >= 400 ? (data?.error || data?.message || 'Unknown error') : null
    }).catch(err => {
      console.error('Error logging API request:', err);
    });

    // Call original send
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
    // Ne logiraj health check i admin endpoint-e (osim ako je potrebno)
    if (data.path === '/health' || data.path === '/api/health') {
      return;
    }

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
        responseTime: data.responseTime,
        errorMessage: data.errorMessage
      }
    });
  } catch (error) {
    // Ne bacaj grešku - logging ne smije blokirati aplikaciju
    console.error('Error creating API request log:', error);
  }
}

