import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';

const SECRET = process.env.JWT_SECRET || 'dev-super-secret';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function auth(required = true, roles = []) {
  return (req, res, next) => {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) {
      if (!required) return next();
      return res.status(401).json({ error: 'Missing token' });
    }
    try {
      const data = jwt.verify(token, SECRET);
      if (roles.length && !roles.includes(data.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = data;
      next();
    } catch (e) {
      // Ako je auth optional, nastavi bez korisnika
      if (!required) return next();
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

export async function hashPassword(pw) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

export async function verifyPassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}