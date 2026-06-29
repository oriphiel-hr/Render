import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { toPublicProfile } from '../lib/profile-public.js';
import { setTyping, getTypingInPair } from '../lib/typing-state.js';
import { distanceLabelForProfiles } from '../lib/geo.js';
import { getDemoFeedState } from '../services/fairness-service.js';
import { buildExtendedFairnessAudit } from '../services/fairness-audit-service.js';
import { buildRankedFeed } from '../services/feed-ranking-service.js';
import { recordFeedRankingSnapshot, recordSecurityEvent } from '../services/audit-service.js';
import { evaluateContactLimiter, evaluatePreferencePolicy } from '../services/policy-service.js';
import { calculateProfileCompleteness, isFeedReady, hasProfilePhoto } from '../services/profile-service.js';
import {
  notifyContactAccepted,
  notifyContactRequest,
  notifyNewMessage,
  notifyAdminReport
} from '../services/notification-service.js';

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

async function getActivePairForProfile(profileId) {
  return prisma.engagedPair.findFirst({
    where: { status: 'ACTIVE', OR: [{ userAId: profileId }, { userBId: profileId }] }
  });
}

async function assertPairMember(pairId, profileId) {
  const pair = await prisma.engagedPair.findUnique({ where: { id: pairId } });
  if (!pair || pair.status !== 'ACTIVE') return null;
  if (pair.userAId !== profileId && pair.userBId !== profileId) return null;
  return pair;
}

matchmakingRouter.get('/public-stats', async (_req, res) => {
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [memberCount, activeCount, contactCount, cityGroups] = await Promise.all([
    prisma.userProfile.count(),
    prisma.userProfile.count({ where: { availability: { not: 'PAUSED' } } }),
    prisma.matchContact.count({ where: { status: 'ACCEPTED', createdAt: { gt: since30d } } }),
    prisma.userProfile.groupBy({ by: ['city'], _count: { city: true }, orderBy: { _count: { city: 'desc' } }, take: 5 })
  ]);

  return res.json({
    success: true,
    stats: {
      memberCount,
      activeCount,
      contactsLast30Days: contactCount,
      topCities: cityGroups.map((row) => ({ city: row.city, count: row._count.city }))
    }
  });
});

matchmakingRouter.get('/fairness-state', async (_req, res) => {
  const state = await getDemoFeedState();
  res.json({ success: true, data: state });
});

matchmakingRouter.get('/feed', requireAuth, async (req, res) => {
  const me = await prisma.userProfile.findUnique({ where: { id: req.auth.profileId } });
  if (!me) return res.status(404).json({ success: false, error: 'Profile not found' });

  const blockedIds = await getBlockedIdSet(me.id);
  const { items } = await buildRankedFeed(me, {
    blockedIds,
    logSnapshot: true,
    recordSnapshot: recordFeedRankingSnapshot
  });

  return res.json({ success: true, items });
});

matchmakingRouter.get('/my-state', requireAuth, async (req, res) => {
  const profile = await prisma.userProfile.findUnique({ where: { id: req.auth.profileId } });
  if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

  const [activePair, pendingContacts, avgRating] = await Promise.all([
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

  const requesterIds = pendingContacts.map((row) => row.requesterId);
  const requesterProfiles = requesterIds.length
    ? await prisma.userProfile.findMany({ where: { id: { in: requesterIds } } })
    : [];
  const requesterById = new Map(requesterProfiles.map((row) => [row.id, row]));

  let activePairPayload = null;
  if (activePair) {
    const partnerId = activePair.userAId === profile.id ? activePair.userBId : activePair.userAId;
    const partner = await prisma.userProfile.findUnique({
      where: { id: partnerId },
      select: { id: true, displayName: true, city: true, age: true }
    });
    activePairPayload = {
      id: activePair.id,
      partnerId: partner?.id || null,
      partnerName: partner?.displayName || 'Korisnik'
    };
  }

  return res.json({
    success: true,
    profile: {
      ...toPublicProfile(profile),
      email: profile.email,
      dateOfBirth: profile.dateOfBirth,
      notifyEmail: profile.notifyEmail
    },
    completeness: calculateProfileCompleteness(profile),
    feedReady: isFeedReady(profile),
    activePair: activePairPayload,
    pendingIncoming: pendingContacts.map((row) => {
      const requester = requesterById.get(row.requesterId);
      return {
        id: row.id,
        createdAt: row.createdAt,
        requester: requester
          ? toPublicProfile(requester, { completeness: calculateProfileCompleteness(requester) })
          : {
              displayName: 'Korisnik',
              city: '—',
              age: '—'
            }
      };
    }),
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
    if (!isFeedReady(me)) {
      return res.status(403).json({
        success: false,
        error: 'Dodaj fotografiju i bio (min. 10 znakova) prije slanja zahtjeva.'
      });
    }
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
    notifyContactRequest(target.id, me.displayName).catch(() => {});
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
    await recordSecurityEvent({
      action: 'BLOCK',
      actorProfileId: req.auth.profileId,
      targetProfileId: payload.targetProfileId,
      entityType: 'UserBlock',
      summary: 'Korisnik blokiran',
      payload: { reason: payload.reason || null }
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
    const reported = await prisma.userProfile.findUnique({ where: { id: payload.reportedId } });
    const item = await prisma.userReport.create({
      data: {
        reporterId: req.auth.profileId,
        reportedId: payload.reportedId,
        reason: payload.reason,
        details: payload.details || null,
        priority
      }
    });
    await recordSecurityEvent({
      action: 'REPORT',
      actorProfileId: req.auth.profileId,
      targetProfileId: payload.reportedId,
      entityType: 'UserReport',
      entityId: item.id,
      summary: `Prijava profila: ${payload.reason}`,
      payload: {
        reportId: item.id,
        reason: payload.reason,
        details: payload.details || null,
        priority,
        reportedName: reported?.displayName || null
      }
    });
    notifyAdminReport(item.id, reported?.displayName || 'Korisnik', payload.reason).catch(() => {});
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

    const [requester, accepter] = await Promise.all([
      prisma.userProfile.findUnique({ where: { id: contact.requesterId } }),
      prisma.userProfile.findUnique({ where: { id: contact.targetId } })
    ]);
    if (requester && accepter) {
      notifyContactAccepted(requester.id, accepter.displayName).catch(() => {});
    }

    return res.json({
      success: true,
      item,
      pairId: item.pair?.id || null,
      partnerName: requester?.displayName || null,
      partnerId: contact.requesterId
    });
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

  const profileIds = [...new Set(items.flatMap((item) => [item.reporterId, item.reportedId]))];
  const profiles = profileIds.length
    ? await prisma.userProfile.findMany({
        where: { id: { in: profileIds } },
        select: { id: true, displayName: true, city: true }
      })
    : [];
  const profileById = new Map(profiles.map((row) => [row.id, row]));

  return res.json({
    success: true,
    items: items.map((item) => ({
      ...item,
      reporterName: profileById.get(item.reporterId)?.displayName || 'Korisnik',
      reportedName: profileById.get(item.reportedId)?.displayName || 'Korisnik',
      reportedCity: profileById.get(item.reportedId)?.city || '—'
    }))
  });
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
  const audit = await buildExtendedFairnessAudit();
  return res.json({ success: true, ...audit });
});

matchmakingRouter.get('/profiles/:profileId', requireAuth, async (req, res) => {
  const [profile, me] = await Promise.all([
    prisma.userProfile.findUnique({ where: { id: req.params.profileId } }),
    prisma.userProfile.findUnique({ where: { id: req.auth.profileId } })
  ]);
  if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

  const blockedIds = await getBlockedIdSet(req.auth.profileId);
  if (blockedIds.has(profile.id)) {
    return res.status(403).json({ success: false, error: 'Profile unavailable' });
  }

  return res.json({
    success: true,
    profile: toPublicProfile(profile, {
      completeness: calculateProfileCompleteness(profile),
      distanceLabel: me ? distanceLabelForProfiles(me, profile) : null
    })
  });
});

matchmakingRouter.get('/inbox-summary', requireAuth, async (req, res) => {
  const profileId = req.auth.profileId;
  const pairs = await prisma.engagedPair.findMany({
    where: { status: 'ACTIVE', OR: [{ userAId: profileId }, { userBId: profileId }] }
  });

  let unreadTotal = 0;
  const items = [];
  for (const pair of pairs) {
    const readState = await prisma.pairReadState.findUnique({
      where: { pairId_profileId: { pairId: pair.id, profileId } }
    });
    const since = readState?.lastReadAt || new Date(0);
    const unread = await prisma.pairMessage.count({
      where: {
        pairId: pair.id,
        senderId: { not: profileId },
        createdAt: { gt: since }
      }
    });
    unreadTotal += unread;
    const partnerId = pair.userAId === profileId ? pair.userBId : pair.userAId;
    const partner = await prisma.userProfile.findUnique({
      where: { id: partnerId },
      select: { id: true, displayName: true }
    });
    items.push({
      pairId: pair.id,
      partnerId: partner?.id || null,
      partnerName: partner?.displayName || 'Korisnik',
      unread
    });
  }

  return res.json({ success: true, unreadTotal, items });
});

matchmakingRouter.post('/pairs/:pairId/read', requireAuth, async (req, res) => {
  const pair = await assertPairMember(req.params.pairId, req.auth.profileId);
  if (!pair) return res.status(404).json({ success: false, error: 'Active pair not found' });

  await prisma.pairReadState.upsert({
    where: { pairId_profileId: { pairId: pair.id, profileId: req.auth.profileId } },
    create: { pairId: pair.id, profileId: req.auth.profileId, lastReadAt: new Date() },
    update: { lastReadAt: new Date() }
  });

  return res.json({ success: true });
});

matchmakingRouter.get('/pairs/:pairId/messages', requireAuth, async (req, res) => {
  const pair = await assertPairMember(req.params.pairId, req.auth.profileId);
  if (!pair) return res.status(404).json({ success: false, error: 'Active pair not found' });

  const partnerId = pair.userAId === req.auth.profileId ? pair.userBId : pair.userAId;
  const [rows, partnerRead] = await Promise.all([
    prisma.pairMessage.findMany({
      where: { pairId: pair.id },
      orderBy: { createdAt: 'asc' },
      take: 200
    }),
    prisma.pairReadState.findUnique({
      where: { pairId_profileId: { pairId: pair.id, profileId: partnerId } }
    })
  ]);

  const partnerLastReadAt = partnerRead?.lastReadAt || null;
  const items = rows.map((msg) => ({
    ...msg,
    readByPartner:
      msg.senderId === req.auth.profileId &&
      partnerLastReadAt &&
      msg.createdAt <= partnerLastReadAt
  }));

  return res.json({ success: true, items, partnerLastReadAt });
});

matchmakingRouter.post('/pairs/:pairId/messages', requireAuth, async (req, res) => {
  const schema = z.object({ body: z.string().min(1).max(2000) });
  try {
    const pair = await assertPairMember(req.params.pairId, req.auth.profileId);
    if (!pair) return res.status(404).json({ success: false, error: 'Active pair not found' });

    const recipientId = pair.userAId === req.auth.profileId ? pair.userBId : pair.userAId;
    const blockedIds = await getBlockedIdSet(req.auth.profileId);
    if (blockedIds.has(recipientId)) {
      return res.status(403).json({ success: false, error: 'Razgovor nije dostupan.' });
    }

    const { body } = schema.parse(req.body);
    const item = await prisma.pairMessage.create({
      data: {
        pairId: pair.id,
        senderId: req.auth.profileId,
        body: body.trim()
      }
    });

    const sender = await prisma.userProfile.findUnique({ where: { id: req.auth.profileId } });
    if (sender) {
      notifyNewMessage(recipientId, sender.displayName, pair.id).catch(() => {});
    }

    return res.status(201).json({ success: true, item });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

matchmakingRouter.post('/pairs/:pairId/typing', requireAuth, async (req, res) => {
  const pair = await assertPairMember(req.params.pairId, req.auth.profileId);
  if (!pair) return res.status(404).json({ success: false, error: 'Active pair not found' });
  setTyping(pair.id, req.auth.profileId);
  return res.json({ success: true });
});

matchmakingRouter.post('/pairs/:pairId/messages/:messageId/reaction', requireAuth, async (req, res) => {
  const schema = z.object({ emoji: z.string().min(1).max(8).nullable() });
  try {
    const pair = await assertPairMember(req.params.pairId, req.auth.profileId);
    if (!pair) return res.status(404).json({ success: false, error: 'Active pair not found' });

    const message = await prisma.pairMessage.findFirst({
      where: { id: req.params.messageId, pairId: pair.id }
    });
    if (!message) return res.status(404).json({ success: false, error: 'Message not found' });

    const { emoji } = schema.parse(req.body);
    const item = await prisma.pairMessage.update({
      where: { id: message.id },
      data: { reaction: emoji }
    });
    return res.json({ success: true, item });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

matchmakingRouter.get('/pairs/:pairId/messages/stream', requireAuth, async (req, res) => {
  const pair = await assertPairMember(req.params.pairId, req.auth.profileId);
  if (!pair) return res.status(404).json({ success: false, error: 'Active pair not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let since = req.query.since ? new Date(String(req.query.since)) : new Date();
  if (Number.isNaN(since.getTime())) since = new Date();

  const timer = setInterval(async () => {
    try {
      const messages = await prisma.pairMessage.findMany({
        where: { pairId: pair.id, createdAt: { gt: since } },
        orderBy: { createdAt: 'asc' },
        take: 50
      });
      const typing = getTypingInPair(pair.id, req.auth.profileId);
      if (messages.length > 0) {
        since = messages[messages.length - 1].createdAt;
        res.write(`data: ${JSON.stringify({ messages, typing })}\n\n`);
      } else if (typing.length > 0) {
        res.write(`data: ${JSON.stringify({ typing })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ ping: true })}\n\n`);
      }
    } catch (_error) {
      clearInterval(timer);
      res.end();
    }
  }, 2500);

  req.on('close', () => clearInterval(timer));
});
