import jwt from 'jsonwebtoken';
import { touchLastActive } from './profile-activity.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function issueAuthToken(account) {
  return jwt.sign(
    {
      sub: account.id,
      profileId: account.profileId,
      role: account.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function getTokenFromRequest(req) {
  const authorization = req.header('authorization') || '';
  if (authorization.startsWith('Bearer ')) return authorization.slice(7);
  if (req.query?.access_token) return String(req.query.access_token);
  return null;
}

export function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    touchLastActive(payload.profileId);
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.auth || req.auth.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Admin only' });
  }
  return next();
}
