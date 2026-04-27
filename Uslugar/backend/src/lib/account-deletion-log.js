import { prisma } from './prisma.js';

/**
 * @param {string} email
 * @returns {string}
 */
export function redactEmail (email) {
  if (!email || typeof email !== 'string') return '***';
  const at = email.indexOf('@');
  if (at < 1) return '***';
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const first = local[0] || '*';
  return `${first}***@${domain}`;
}

/**
 * @param {import('express').Request} req
 * @returns {string | null}
 */
export function getClientIp (req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) {
    return xff.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || null;
}

/**
 * @param {object} p
 * @param {string} p.formerUserId
 * @param {string} p.email
 * @param {string} p.role
 * @param {'SELF_SERVICE' | 'ADMIN_PANEL'} p.source
 * @param {string | null} [p.ipAddress]
 * @param {string | null} [p.userAgent]
 * @param {string | null} [p.deletedByUserId]
 */
export async function logAccountDeletion (p) {
  return prisma.accountDeletionLog.create({
    data: {
      formerUserId: p.formerUserId,
      emailRedacted: redactEmail(p.email),
      role: String(p.role || 'USER'),
      source: p.source,
      ipAddress: p.ipAddress || null,
      userAgent: p.userAgent || null,
      deletedByUserId: p.deletedByUserId || null
    }
  });
}
