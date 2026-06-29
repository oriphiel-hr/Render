import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import {
  DATA_RETENTION_DAYS,
  listAuditEvents,
  listModerationDecisions,
  recordAdminAction,
  recordModerationDecision
} from '../services/audit-service.js';
import { buildExtendedFairnessAudit } from '../services/fairness-audit-service.js';
import { explainFeedForViewer } from '../services/feed-ranking-service.js';
import { deleteUserProfile } from '../services/profile-service.js';

export const adminAuditRouter = Router();

adminAuditRouter.use(requireAuth, requireAdmin);

adminAuditRouter.get('/events', async (req, res) => {
  const category = req.query.category ? String(req.query.category).toUpperCase() : undefined;
  const limit = Number(req.query.limit) || 50;
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
  const valid = ['ADMIN_ACTION', 'MODERATION', 'SECURITY', 'FEED_RANKING', 'COMPLIANCE'];
  if (category && !valid.includes(category)) {
    return res.status(400).json({ success: false, error: 'Invalid category' });
  }
  const page = await listAuditEvents({ category, limit, cursor });
  return res.json({ success: true, ...page });
});

adminAuditRouter.get('/moderation-decisions', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const items = await listModerationDecisions(limit);
  return res.json({ success: true, items });
});

adminAuditRouter.get('/fairness', async (_req, res) => {
  const audit = await buildExtendedFairnessAudit();
  return res.json({ success: true, ...audit });
});

adminAuditRouter.get('/feed-explain', async (req, res) => {
  const viewerId = String(req.query.viewerId || req.auth.profileId);
  const explain = await explainFeedForViewer(viewerId);
  if (!explain) return res.status(404).json({ success: false, error: 'Viewer not found' });
  return res.json({ success: true, ...explain });
});

adminAuditRouter.get('/retention-policy', async (_req, res) => {
  return res.json({
    success: true,
    policy: {
      auditRetentionDays: DATA_RETENTION_DAYS,
      description:
        'Audit zapisi (admin, moderacija, sigurnost, compliance, feed rang) čuvaju se radi odgovornosti i GDPR-a. Poruke u chatu nisu trajno arhivirane u audit logu — samo metadata događaja.',
      categories: [
        { id: 'ADMIN_ACTION', label: 'Admin akcije', examples: 'suspend, brisanje, paket, uloga' },
        { id: 'MODERATION', label: 'Moderacija', examples: 'rješavanje prijava' },
        { id: 'SECURITY', label: 'Sigurnost', examples: 'blok, prijava, brisanje računa' },
        { id: 'FEED_RANKING', label: 'Feed rang', examples: 'snapshot rangiranja' },
        { id: 'COMPLIANCE', label: 'Compliance', examples: 'export podataka, GDPR brisanje' }
      ]
    }
  });
});

adminAuditRouter.post('/resolve-report', async (req, res) => {
  const schema = z.object({
    reportId: z.string().min(8),
    outcome: z.enum(['RESOLVED', 'DISMISSED']),
    actionTaken: z.enum(['NONE', 'WARN', 'SUSPEND', 'DELETE']),
    notes: z.string().max(500).optional()
  });
  try {
    const payload = schema.parse(req.body);
    const report = await prisma.userReport.findUnique({ where: { id: payload.reportId } });
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });

    const reported = await prisma.userProfile.findUnique({
      where: { id: report.reportedId },
      include: { account: true }
    });

    if (payload.actionTaken === 'DELETE' && reported?.account?.role === 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Admin računi se ne mogu brisati.' });
    }

    await prisma.userReport.update({
      where: { id: report.id },
      data: { status: payload.outcome }
    });

    if (payload.actionTaken === 'SUSPEND' && reported?.account) {
      await prisma.$transaction(async (tx) => {
        await tx.userAccount.update({
          where: { profileId: reported.id },
          data: { suspendedAt: new Date() }
        });
        await tx.userProfile.update({
          where: { id: reported.id },
          data: { availability: 'PAUSED' }
        });
      });
      await recordAdminAction(req, {
        action: 'SUSPEND',
        targetProfileId: reported.id,
        summary: `Suspend zbog prijave ${report.id.slice(0, 8)}…`,
        payload: { reportId: report.id, reason: report.reason, via: 'moderation' }
      });
    }

    if (payload.actionTaken === 'DELETE' && reported) {
      await recordAdminAction(req, {
        action: 'DELETE_USER',
        targetProfileId: reported.id,
        summary: `Brisanje zbog prijave ${report.id.slice(0, 8)}…`,
        payload: {
          reportId: report.id,
          email: reported.email,
          displayName: reported.displayName,
          via: 'moderation'
        }
      });
      await deleteUserProfile(prisma, reported.id);
    }

    const { decision } = await recordModerationDecision({
      reportId: report.id,
      resolvedByProfileId: req.auth.profileId,
      outcome: payload.outcome,
      actionTaken: payload.actionTaken,
      notes: payload.notes || null,
      targetProfileId: report.reportedId,
      summary: `Prijava ${payload.outcome.toLowerCase()}: ${payload.actionTaken}`,
      payload: { reason: report.reason, reporterId: report.reporterId }
    });

    return res.json({ success: true, decision });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});
