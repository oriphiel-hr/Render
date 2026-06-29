import { prisma } from '../lib/prisma.js';

export const DATA_RETENTION_DAYS = Number(process.env.AUDIT_RETENTION_DAYS || 365);

export async function recordAuditEvent({
  category,
  action,
  actorProfileId = null,
  targetProfileId = null,
  entityType = null,
  entityId = null,
  summary,
  payload = {}
}) {
  return prisma.auditEvent.create({
    data: {
      category,
      action,
      actorProfileId,
      targetProfileId,
      entityType,
      entityId,
      summary,
      payload
    }
  });
}

export async function recordAdminAction(req, {
  action,
  targetProfileId,
  summary,
  payload = {},
  entityType = 'UserProfile',
  entityId = targetProfileId
}) {
  return recordAuditEvent({
    category: 'ADMIN_ACTION',
    action,
    actorProfileId: req.auth?.profileId || null,
    targetProfileId,
    entityType,
    entityId,
    summary,
    payload: {
      ...payload,
      actorRole: req.auth?.role || null
    }
  });
}

export async function recordModerationDecision({
  reportId,
  resolvedByProfileId,
  outcome,
  actionTaken,
  notes = null,
  targetProfileId = null,
  summary,
  payload = {}
}) {
  const [decision, event] = await prisma.$transaction([
    prisma.moderationDecision.create({
      data: {
        reportId,
        resolvedByProfileId,
        outcome,
        actionTaken,
        notes
      }
    }),
    prisma.auditEvent.create({
      data: {
        category: 'MODERATION',
        action: 'REPORT_RESOLVED',
        actorProfileId: resolvedByProfileId,
        targetProfileId,
        entityType: 'UserReport',
        entityId: reportId,
        summary,
        payload: {
          outcome,
          actionTaken,
          notes,
          ...payload
        }
      }
    })
  ]);
  return { decision, event };
}

export async function recordSecurityEvent({
  action,
  actorProfileId,
  targetProfileId = null,
  entityType = null,
  entityId = null,
  summary,
  payload = {}
}) {
  return recordAuditEvent({
    category: 'SECURITY',
    action,
    actorProfileId,
    targetProfileId,
    entityType,
    entityId,
    summary,
    payload
  });
}

export async function recordComplianceEvent({
  action,
  actorProfileId = null,
  targetProfileId = null,
  summary,
  payload = {}
}) {
  return recordAuditEvent({
    category: 'COMPLIANCE',
    action,
    actorProfileId,
    targetProfileId,
    entityType: 'UserProfile',
    entityId: targetProfileId,
    summary,
    payload: {
      retentionDays: DATA_RETENTION_DAYS,
      ...payload
    }
  });
}

export async function recordFeedRankingSnapshot(viewerProfileId, rankings, topCount = 10) {
  return recordAuditEvent({
    category: 'FEED_RANKING',
    action: 'FEED_SNAPSHOT',
    actorProfileId: viewerProfileId,
    summary: `Feed rangiranje za korisnika (${Math.min(rankings.length, topCount)} od ${rankings.length} profila)`,
    payload: {
      viewerProfileId,
      totalCandidates: rankings.length,
      top: rankings.slice(0, topCount).map((row) => ({
        profileId: row.profileId,
        displayName: row.displayName,
        rank: row.rank,
        score: row.score,
        factors: row.factors
      }))
    }
  });
}

export async function listAuditEvents({ category, limit = 50, cursor }) {
  const take = Math.min(limit, 100);
  const where = category ? { category } : undefined;
  const items = await prisma.auditEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
  });
  const hasMore = items.length > take;
  const page = hasMore ? items.slice(0, take) : items;
  const profileIds = [
    ...new Set(
      page.flatMap((row) => [row.actorProfileId, row.targetProfileId].filter(Boolean))
    )
  ];
  const profiles = profileIds.length
    ? await prisma.userProfile.findMany({
        where: { id: { in: profileIds } },
        select: { id: true, displayName: true, email: true }
      })
    : [];
  const byId = new Map(profiles.map((p) => [p.id, p]));

  return {
    items: page.map((row) => ({
      ...row,
      actor: row.actorProfileId ? byId.get(row.actorProfileId) || null : null,
      target: row.targetProfileId ? byId.get(row.targetProfileId) || null : null
    })),
    nextCursor: hasMore ? page[page.length - 1]?.id : null
  };
}

export async function listModerationDecisions(limit = 30) {
  const take = Math.min(limit, 100);
  const items = await prisma.moderationDecision.findMany({
    orderBy: { createdAt: 'desc' },
    take
  });
  const profileIds = [...new Set(items.flatMap((d) => [d.resolvedByProfileId]))];
  const reportIds = items.map((d) => d.reportId);
  const [profiles, reports] = await Promise.all([
    prisma.userProfile.findMany({
      where: { id: { in: profileIds } },
      select: { id: true, displayName: true }
    }),
    prisma.userReport.findMany({ where: { id: { in: reportIds } } })
  ]);
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const reportById = new Map(reports.map((r) => [r.id, r]));
  const reportedIds = [...new Set(reports.map((r) => r.reportedId))];
  const reportedProfiles = reportedIds.length
    ? await prisma.userProfile.findMany({
        where: { id: { in: reportedIds } },
        select: { id: true, displayName: true }
      })
    : [];
  const reportedById = new Map(reportedProfiles.map((p) => [p.id, p]));

  return items.map((row) => {
    const report = reportById.get(row.reportId);
    return {
      ...row,
      resolver: profileById.get(row.resolvedByProfileId) || null,
      report,
      reported: report ? reportedById.get(report.reportedId) || null : null
    };
  });
}
