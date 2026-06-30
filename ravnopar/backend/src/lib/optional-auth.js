import jwt from 'jsonwebtoken';
import { getTokenFromRequest } from './auth.js';
import { touchLastActive } from './profile-activity.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

/** Postavlja req.auth ako postoji valjan token; inače nastavlja bez greške. */
export function optionalAuth(req, _res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    touchLastActive(payload.profileId);
  } catch (_error) {
    /* ignore invalid token for optional routes */
  }
  return next();
}
