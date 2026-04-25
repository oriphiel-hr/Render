import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { getDemoFeedState } from '../services/fairness-service.js';
import { evaluateContactLimiter, evaluatePreferencePolicy } from '../services/policy-service.js';
import { calculateProfileCompleteness } from '../services/profile-service.js';

export const matchmakingRouter = Router();
let dailyContactLimit = Number(process.env.DAILY_CONTACT_LIMIT || 30);

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string');
}

function hasOverlap(a, b) {
  const setB = new Set(b);
  return a.some((item) => setB.has(item));
}

async function getBlockedIdSet(profileId) {
  const [blockedByMe, blockedMe] = await Promise.all([
    prisma.userBlock.findMany({ where: { blockerId: profileId }, select: { blockedId: true } }),
    prisma.userBlock.findMany({ where: { blockedId: profileId }, select: { blockerId: true } })
  ]);
  return new Set([
    ...blockedByMe.map((b) => b.blockedId),
    ...blockedMe.map((b) => b.blockerId)
  ]);
}

matchmakingRouter.get('/fairness-state', async (_req, res) => {
  const state = await getDemoFeedState();
  res.json({ success: true, data: state });
});

matchmakingRouter.get('/feed', requireAuth, async (req, res) => {
  const me = await prisma.userProfile.findUnique({ where: { id: req.auth.profileId } });
  if (!me) return res.status(404).json({ success: false, error: 'Profile not found' });

  const [profiles, blockedIds] = await Promise.all([
    prisma.userProfile.findMany({
      where: { id: { not: me.id }, availability: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    getBlockedIdSet(me.id)
  ]);

  const mySeekingIdentities = normalizeStringArray(me.seekingIdentities);
  const mySeekingProfileTypes = normalizeStringArray(me.seekingProfileTypes);
  const myIntents = normalizeStringArray(me.intents);

  const compatible = profiles.filter((candidate) => {
    if (blockedIds.has(candidate.id)) return false;
    const candidateSeekingIdentities = normalizeStringArray(candidate.seekingIdentities);
    const candidateSeekingProfileTypes = normalizeStringArray(candidate.seekingProfileTypes);
    const candidateIntents = normalizeStringArray(candidate.intents);

    const myWantsCandidate =
      mySeekingIdentities.includes(candidate.identity) &&
      mySeekingProfileTypes.includes(candidate.profileType);
    const candidateWantsMe =
      candidateSeekingIdentities.includes(me.identity) &&
      candidateSeekingProfileTypes.includes(me.profileType);
    const intentOverlap = hasOverlap(myIntents, candidateIntents);

    return myWantsCandidate && candidateWantsMe && intentOverlap;
  });

  return res.json({
    success: true,
    items: compatible.map((candidate) => ({
      ...candidate,
      completeness: calculateProfileCompleteness(candidate)
    }))
  });
});

matchmakingRouter.get('/my-state', requireAuth, async (req, res) => {
  const profile = await prisma.userProfile.findUnique({ where: { id: req.auth.profileId } });
  if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

  const [activePair, pendingIncoming, avgRating] = await Promise.all([
    prisma.engagedPair.findFirst({
      where: { status: 'ACTIVE', OR: [{ userAId: profile.id }, { userBId: profile.id }] }
    }),
    prisma.matchContact.findMany({
      where: { targetId: profile.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    prisma.userRating.aggregate({
      where: { toUserId: profile.id },
      _avg: { score: true },
      _count: { score: true }
    })
  ]);

  return res.json({
    success: true,
    profile,
    completeness: calculateProfileCompleteness(profile),
    activePair,
    pendingIncoming,
    rating: {
      average: avgRating._avg.score || null,
      count: avgRating._count.score || 0
    }
  });
});

matchmakingRouter.post('/contact-request', requireAuth, async (req, res) => {
  const schema = z.object({ targetProfileId: z.string().min(8) });
  try {
    const payload = schema.parse(req.body);
    if (payload.targetProfileId === req.auth.profileId) {
      return res.status(400).json({ success: false, error: 'Cannot contact yourself' });
    }

    const [me, target, blockedIds] = await Promise.all([
      prisma.userProfile.findUnique({ where: { id: req.auth.profileId } }),
      prisma.userProfile.findUnique({ where: { id: payload.targetProfileId } }),
      getBlockedIdSet(req.auth.profileId)
    ]);
    if (!me || !target) return res.status(404).json({ success: false, error: 'Profile not found' });
    if (blockedIds.has(target.id)) {
      return res.status(403).json({ success: false, error: 'Contact blocked between users' });
    }
    if (me.availability !== 'AVAILABLE' || target.availability !== 'AVAILABLE') {
      return res.status(409).json({ success: false, error: 'One profile is not available' });
    }

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const outgoingPendingLast24h = await prisma.matchContact.count({
      where: { requesterId: me.id, status: 'PENDING', createdAt: { gt: last24h } }
    });
    if (outgoingPendingLast24h >= dailyContactLimit) {
      return res.status(429).json({
        success: false,
        error: `Dosegnut dnevni limit zahtjeva (${dailyContactLimit}).`
      });
    }
    const limiter = evaluateContactLimiter(outgoingPendingLast24h);
    if (!limiter.allow) return res.status(429).json({ success: false, error: limiter.reason });

    const existingPending = await prisma.matchContact.findFirst({
      where: { requesterId: me.id, targetId: target.id, status: 'PENDING' }
    });
    if (existingPending) return res.status(409).json({ success: false, error: 'Request already pending' });

    const contact = await prisma.matchContact.create({
      data: { requesterId: me.id, targetId: target.id }
    });
    return res.status(201).json({ success: true, item: contact, warning: limiter.warning || null });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

matchmakingRouter.post('/policy-check', requireAuth, async (req, res) => {
  const schema = z.object({
    ageMin: z.number().int().min(18).max(99).optional(),
    ageMax: z.number().int().min(18).max(99).optional(),
    cities: z.array(z.string().min(2).max(80)).optional(),
    distanceKm: z.number().int().min(1).max(500).optional()
  });
  try {
    const preferences = schema.parse(req.body || {});
    return res.json({ success: true, result: evaluatePreferencePolicy(preferences) });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

matchmakingRouter.post('/block', requireAuth, async (req, res) => {
  const schema = z.object({
    targetProfileId: z.string().min(8),
    reason: z.string().max(240).optional()
  });
  try {
    const payload = schema.parse(req.body);
    if (payload.targetProfileId === req.auth.profileId) {
      return res.status(400).json({ success: false, error: 'Cannot block yourself' });
    }
    await prisma.userBlock.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: req.auth.profileId,
          blockedId: payload.targetProfileId
        }
      },
      update: { reason: payload.reason || null },
      create: {
        blockerId: req.auth.profileId,
        blockedId: payload.targetProfileId,
        reason: payload.reason || null
      }
    });
    return res.json({ success: true });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

matchmakingRouter.post('/report', requireAuth, async (req, res) => {
  const schema = z.object({
    reportedId: z.string().min(8),
    reason: z.string().min(3).max(240),
    details: z.string().max(1000).optional()
  });
  try {
    const payload = schema.parse(req.body);
    if (payload.reportedId === req.auth.profileId) {
      return res.status(400).json({ success: false, error: 'Cannot report yourself' });
    }
    const priority = /threat|abuse|minor|violence|harass/i.test(payload.reason) ? 5 : 2;
    const item = await prisma.userReport.create({
      data: {
        reporterId: req.auth.profileId,
        reportedId: payload.reportedId,
        reason: payload.reason,
        details: payload.details || null,
        priority
      }
    });
    return res.status(201).json({ success: true, item });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

matchmakingRouter.post('/rate', requireAuth, async (req, res) => {
  const schema = z.object({
    toUserId: z.string().min(8),
    score: z.number().int().min(1).max(5),
    comment: z.string().max(400).optional()
  });
  try {
    const payload = schema.parse(req.body);
    if (payload.toUserId === req.auth.profileId) {
      return res.status(400).json({ success: false, error: 'Cannot rate yourself' });
    }
    const item = await prisma.userRating.create({
      data: {
        fromUserId: req.auth.profileId,
        toUserId: payload.toUserId,
        score: payload.score,
        comment: payload.comment || null
      }
    });
    return res.status(201).json({ success: true, item });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

matchmakingRouter.post('/contacts/:contactId/respond', requireAuth, async (req, res) => {
  const schema = z.object({ action: z.enum(['ACCEPT', 'DECLINE']) });
  try {
    const { action } = schema.parse(req.body);
    const contact = await prisma.matchContact.findUnique({ where: { id: req.params.contactId } });
    if (!contact || contact.status !== 'PENDING') {
      return res.status(404).json({ success: false, error: 'Pending contact not found' });
    }
    if (contact.targetId !== req.auth.profileId) {
      return res.status(403).json({ success: false, error: 'Not your request' });
    }

    if (action === 'DECLINE') {
      const item = await prisma.matchContact.update({
        where: { id: contact.id },
        data: { status: 'DECLINED' }
      });
      return res.json({ success: true, item });
    }

    const now = new Date();
    const item = await prisma.$transaction(async (tx) => {
      const accepted = await tx.matchContact.update({
        where: { id: contact.id },
        data: { status: 'ACCEPTED' }
      });
      const pair = await tx.engagedPair.create({
        data: {
          userAId: contact.requesterId,
          userBId: contact.targetId,
          sourceContactId: contact.id,
          status: 'ACTIVE',
          startedAt: now
        }
      });
      await tx.userProfile.updateMany({
        where: { id: { in: [contact.requesterId, contact.targetId] } },
        data: { availability: 'FOCUSED_CONTACT' }
      });
      await tx.matchContact.updateMany({
        where: {
          status: 'PENDING',
          OR: [
            { requesterId: contact.requesterId },
            { targetId: contact.requesterId },
            { requesterId: contact.targetId },
            { targetId: contact.targetId }
          ]
        },
        data: { status: 'AUTO_CLOSED' }
      });
      return { accepted, pair };
    });
    return res.json({ success: true, item });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

matchmakingRouter.post('/pairs/:pairId/close', requireAuth, async (req, res) => {
  const schema = z.object({ reason: z.string().max(240).optional() });
  try {
    const payload = schema.parse(req.body);
    const pair = await prisma.engagedPair.findUnique({ where: { id: req.params.pairId } });
    if (!pair || pair.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, error: 'Active pair not found' });
    }

    const isParticipant = pair.userAId === req.auth.profileId || pair.userBId === req.auth.profileId;
    const isAdmin = req.auth.role === 'ADMIN';
    if (!isParticipant && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not allowed' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.engagedPair.update({
        where: { id: pair.id },
        data: {
          status: 'CLOSED',
          endedAt: new Date(),
          closeReason: payload.reason || 'Closed by user'
        }
      });
      await tx.userProfile.updateMany({
        where: {
          id: { in: [pair.userAId, pair.userBId] },
          availability: 'FOCUSED_CONTACT'
        },
        data: { availability: 'AVAILABLE' }
      });
    });

    return res.json({ success: true });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

matchmakingRouter.post('/pairs/timeout-sweep', requireAuth, requireAdmin, async (req, res) => {
  const thresholdHours = Number(req.query.thresholdHours || 72);
  const cutoff = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);

  const stalePairs = await prisma.engagedPair.findMany({
    where: { status: 'ACTIVE', startedAt: { lt: cutoff } }
  });

  for (const pair of stalePairs) {
    await prisma.$transaction(async (tx) => {
      await tx.engagedPair.update({
        where: { id: pair.id },
        data: {
          status: 'CLOSED',
          endedAt: new Date(),
          closeReason: `Auto timeout after ${thresholdHours}h`
        }
      });
      await tx.userProfile.updateMany({
        where: {
          id: { in: [pair.userAId, pair.userBId] },
          availability: 'FOCUSED_CONTACT'
        },
        data: { availability: 'AVAILABLE' }
      });
    });
  }

  return res.json({ success: true, closedPairs: stalePairs.length });
});

matchmakingRouter.get('/admin-risk-overview', requireAuth, requireAdmin, async (_req, res) => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const profiles = await prisma.userProfile.findMany({ take: 200, orderBy: { createdAt: 'desc' } });

  const risks = [];
  for (const profile of profiles) {
    const [pendingOutgoing, declinedReceived, autoClosedRelated] = await Promise.all([
      prisma.matchContact.count({
        where: { requesterId: profile.id, status: 'PENDING', createdAt: { gt: cutoff } }
      }),
      prisma.matchContact.count({
        where: { requesterId: profile.id, status: 'DECLINED', createdAt: { gt: cutoff } }
      }),
      prisma.matchContact.count({
        where: {
          status: 'AUTO_CLOSED',
          createdAt: { gt: cutoff },
          OR: [{ requesterId: profile.id }, { targetId: profile.id }]
        }
      })
    ]);
    const score = pendingOutgoing * 2 + declinedReceived + autoClosedRelated;
    if (score < 8) continue;
    risks.push({
      profileId: profile.id,
      displayName: profile.displayName,
      city: profile.city,
      riskScore: score,
      pendingOutgoing,
      declinedReceived,
      autoClosedRelated
    });
  }
  risks.sort((a, b) => b.riskScore - a.riskScore);
  return res.json({ success: true, items: risks.slice(0, 30) });
});

matchmakingRouter.get('/admin/moderation-queue', requireAuth, requireAdmin, async (_req, res) => {
  const items = await prisma.userReport.findMany({
    where: { status: { in: ['OPEN', 'IN_REVIEW'] } },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    take: 100
  });
  return res.json({ success: true, items });
});

matchmakingRouter.patch('/admin/reports/:reportId', requireAuth, requireAdmin, async (req, res) => {
  const schema = z.object({
    status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED']),
    priority: z.number().int().min(1).max(10).optional()
  });
  try {
    const payload = schema.parse(req.body);
    const item = await prisma.userReport.update({
      where: { id: req.params.reportId },
      data: {
        status: payload.status,
        ...(payload.priority ? { priority: payload.priority } : {})
      }
    });
    return res.json({ success: true, item });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

matchmakingRouter.get('/admin/fairness-config', requireAuth, requireAdmin, async (_req, res) => {
  const changes = await prisma.fairnessConfigChange.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30
  });
  return res.json({
    success: true,
    config: { dailyContactLimit },
    changes
  });
});

matchmakingRouter.post('/admin/fairness-config', requireAuth, requireAdmin, async (req, res) => {
  const schema = z.object({
    newDailyLimit: z.number().int().min(5).max(200),
    reason: z.string().min(5).max(300)
  });
  try {
    const payload = schema.parse(req.body);
    const oldDailyLimit = dailyContactLimit;
    dailyContactLimit = payload.newDailyLimit;
    const change = await prisma.fairnessConfigChange.create({
      data: {
        changedByUserId: req.auth.profileId,
        oldDailyLimit,
        newDailyLimit: payload.newDailyLimit,
        reason: payload.reason
      }
    });
    return res.json({
      success: true,
      config: { dailyContactLimit },
      change
    });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

matchmakingRouter.get('/admin/fairness-audit', requireAuth, requireAdmin, async (_req, res) => {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [totalProfiles, availableProfiles, focusedProfiles, pendingRequests7d, acceptedRequests7d] =
    await Promise.all([
      prisma.userProfile.count(),
      prisma.userProfile.count({ where: { availability: 'AVAILABLE' } }),
      prisma.userProfile.count({ where: { availability: 'FOCUSED_CONTACT' } }),
      prisma.matchContact.count({ where: { status: 'PENDING', createdAt: { gt: since7d } } }),
      prisma.matchContact.count({ where: { status: 'ACCEPTED', createdAt: { gt: since7d } } })
    ]);

  const usersWithoutIncoming7d = await prisma.userProfile.count({
    where: {
      availability: 'AVAILABLE',
      id: {
        notIn: (
          await prisma.matchContact.findMany({
            where: { createdAt: { gt: since7d } },
            select: { targetId: true },
            distinct: ['targetId']
          })
        ).map((r) => r.targetId)
      }
    }
  });

  return res.json({
    success: true,
    principles: {
      noReachThrottling: true,
      fairnessRankingOnly: true,
      engagedPairsTemporarilyHidden: true
    },
    metrics: {
      totalProfiles,
      availableProfiles,
      focusedProfiles,
      usersWithoutIncoming7d,
      pendingRequests7d,
      acceptedRequests7d
    },
    recommendations: [
      usersWithoutIncoming7d > 20
        ? 'Povecaj vidljivost korisnicima bez kontakta kroz fair boost.'
        : 'Balans vidljivosti je stabilan.',
      pendingRequests7d > acceptedRequests7d * 3
        ? 'Puno otvorenih zahtjeva; pojacaj edukaciju za kvalitetne poruke.'
        : 'Omjer pending/accepted je u zdravom rasponu.'
    ]
  });
});
