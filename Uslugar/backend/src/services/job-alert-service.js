/**
 * Job Alert Service - Slanje email obavijesti za nove poslove koji odgovaraju job alertovima
 *
 * Cron pokreće processJobAlerts() svaki sat.
 * INSTANT: šalje svaki sat (ako ima novih poslova)
 * DAILY: šalje jednom dnevno
 * WEEKLY: šalje jednom tjedno
 */

import { prisma } from '../lib/prisma.js';
import { sendJobAlertEmail } from '../lib/email.js';

const MS_HOUR = 60 * 60 * 1000;
const MS_DAY = 24 * MS_HOUR;
const MS_WEEK = 7 * MS_DAY;

/**
 * Provjeri treba li poslati alert (na temelju frequency i lastSentAt)
 */
function shouldSendAlert(alert, now) {
  const lastSent = alert.lastSentAt ? new Date(alert.lastSentAt).getTime() : 0;
  const threshold =
    alert.frequency === 'INSTANT'
      ? MS_HOUR
      : alert.frequency === 'WEEKLY'
        ? MS_WEEK
        : MS_DAY;
  return now - lastSent >= threshold;
}

/**
 * Izračunaj "since" datum za dohvat poslova
 */
function getSinceDate(alert, now) {
  const lastSent = alert.lastSentAt ? new Date(alert.lastSentAt) : null;
  const periodMs =
    alert.frequency === 'INSTANT'
      ? MS_HOUR
      : alert.frequency === 'WEEKLY'
        ? MS_WEEK
        : MS_DAY;
  const fallback = new Date(now - periodMs);
  return lastSent && lastSent.getTime() > fallback.getTime() ? lastSent : fallback;
}

/**
 * Dohvati poslove koji odgovaraju filterima alerta, kreirane nakon since
 */
async function getMatchingJobs(alert, since) {
  const filters = typeof alert.filters === 'object' ? alert.filters : {};
  const q = alert.searchQuery || filters.q || filters.searchQuery;

  const where = {
    status: 'OPEN',
    createdAt: { gt: since }
  };

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
  if (filters.minBudget != null) where.budgetMax = { gte: Number(filters.minBudget) };
  if (filters.maxBudget != null) where.budgetMin = { lte: Number(filters.maxBudget) };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } }
    ];
  }

  return prisma.job.findMany({
    where,
    include: { category: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
}

/**
 * Obradi sve aktivne job alertove i pošalji emailove
 * @returns {{ sent: number, errors: number }}
 */
export async function processJobAlerts() {
  const now = Date.now();
  const nowDate = new Date(now);

  const alerts = await prisma.jobAlert.findMany({
    where: { isActive: true },
    include: { user: { select: { id: true, email: true, fullName: true } } }
  });

  let sent = 0;
  let errors = 0;

  for (const alert of alerts) {
    if (!alert.user?.email) continue;
    if (!shouldSendAlert(alert, now)) continue;

    try {
      const since = getSinceDate(alert, now);
      const jobs = await getMatchingJobs(alert, since);

      if (jobs.length === 0) continue;

      await sendJobAlertEmail(
        alert.user.email,
        alert.user.fullName || 'Korisnik',
        alert.name,
        jobs
      );

      await prisma.jobAlert.update({
        where: { id: alert.id },
        data: { lastSentAt: nowDate }
      });

      sent++;
      console.log(`[JOB_ALERT] Sent "${alert.name}" to ${alert.user.email} (${jobs.length} jobs)`);
    } catch (e) {
      errors++;
      console.error(`[JOB_ALERT] Error processing alert ${alert.id}:`, e);
    }
  }

  return { sent, errors, total: alerts.length };
}
