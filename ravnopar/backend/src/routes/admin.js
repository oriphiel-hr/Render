import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { toPublicProfile } from '../lib/profile-public.js';
import { calculateProfileCompleteness } from '../services/profile-service.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/overview', async (_req, res) => {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalProfiles,
    availableProfiles,
    focusedProfiles,
    pausedProfiles,
    suspendedAccounts,
    openReports,
    pendingContacts,
    accepted30d,
    messages7d,
    recentPayments,
    topCities
  ] = await Promise.all([
    prisma.userProfile.count(),
    prisma.userProfile.count({ where: { availability: 'AVAILABLE' } }),
    prisma.userProfile.count({ where: { availability: 'FOCUSED_CONTACT' } }),
    prisma.userProfile.count({ where: { availability: 'PAUSED' } }),
    prisma.userAccount.count({ where: { suspendedAt: { not: null } } }),
    prisma.userReport.count({ where: { status: { in: ['OPEN', 'IN_REVIEW'] } } }),
    prisma.matchContact.count({ where: { status: 'PENDING' } }),
    prisma.matchContact.count({ where: { status: 'ACCEPTED', createdAt: { gt: since30d } } }),
    prisma.pairMessage.count({ where: { createdAt: { gt: since7d } } }),
    prisma.paymentOrder.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.userProfile.groupBy({ by: ['city'], _count: { city: true }, orderBy: { _count: { city: 'desc' } }, take: 5 })
  ]);

  const recentReports = await prisma.userReport.findMany({
    where: { status: { in: ['OPEN', 'IN_REVIEW'] } },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    take: 5
  });

  const profileIds = [...new Set(recentReports.flatMap((r) => [r.reporterId, r.reportedId]))];
  const profiles = profileIds.length
    ? await prisma.userProfile.findMany({ where: { id: { in: profileIds } } })
    : [];
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  return res.json({
    success: true,
    stats: {
      totalProfiles,
      availableProfiles,
      focusedProfiles,
      pausedProfiles,
      suspendedAccounts,
      openReports,
      pendingContacts,
      accepted30d,
      messages7d,
      topCities: topCities.map((row) => ({ city: row.city, count: row._count.city }))
    },
    recentPayments,
    recentReports: recentReports.map((row) => ({
      ...row,
      reporterName: profileById.get(row.reporterId)?.displayName || '—',
      reportedName: profileById.get(row.reportedId)?.displayName || '—'
    }))
  });
});

adminRouter.get('/users', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const take = Math.min(Number(req.query.limit) || 50, 100);

  const profiles = await prisma.userProfile.findMany({
    where: q
      ? {
          OR: [
            { displayName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } }
          ]
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take,
    include: { account: true }
  });

  return res.json({
    success: true,
    items: profiles.map((profile) => ({
      ...toPublicProfile(profile),
      email: profile.email,
      role: profile.account?.role || 'USER',
      suspended: Boolean(profile.account?.suspendedAt),
      verifiedEmail: Boolean(profile.account?.verifiedAt),
      photoVerified: profile.photoVerified,
      onboardingDone: profile.onboardingDone,
      completeness: calculateProfileCompleteness(profile),
      createdAt: profile.createdAt
    }))
  });
});

adminRouter.patch('/users/:profileId', async (req, res) => {
  const schema = z.object({
    planTier: z.enum(['free', 'plus', 'supporter']).optional(),
    photoVerified: z.boolean().optional(),
    onboardingDone: z.boolean().optional(),
    availability: z.enum(['AVAILABLE', 'PAUSED', 'FOCUSED_CONTACT']).optional(),
    suspended: z.boolean().optional(),
    role: z.enum(['USER', 'ADMIN']).optional()
  });

  try {
    const payload = schema.parse(req.body);
    const profile = await prisma.userProfile.findUnique({
      where: { id: req.params.profileId },
      include: { account: true }
    });
    if (!profile?.account) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const profileData = {};
    if (payload.planTier !== undefined) profileData.planTier = payload.planTier;
    if (payload.photoVerified !== undefined) profileData.photoVerified = payload.photoVerified;
    if (payload.onboardingDone !== undefined) profileData.onboardingDone = payload.onboardingDone;
    if (payload.availability !== undefined) profileData.availability = payload.availability;

    const accountData = {};
    if (payload.suspended !== undefined) {
      accountData.suspendedAt = payload.suspended ? new Date() : null;
      if (payload.suspended) profileData.availability = 'PAUSED';
    }
    if (payload.role !== undefined) accountData.role = payload.role;

    await prisma.$transaction(async (tx) => {
      if (Object.keys(profileData).length > 0) {
        await tx.userProfile.update({ where: { id: profile.id }, data: profileData });
      }
      if (Object.keys(accountData).length > 0) {
        await tx.userAccount.update({ where: { profileId: profile.id }, data: accountData });
      }
    });

    const updated = await prisma.userProfile.findUnique({
      where: { id: profile.id },
      include: { account: true }
    });

    return res.json({
      success: true,
      user: {
        ...toPublicProfile(updated),
        email: updated.email,
        role: updated.account.role,
        suspended: Boolean(updated.account.suspendedAt),
        photoVerified: updated.photoVerified
      }
    });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

adminRouter.get('/payments', async (_req, res) => {
  const items = await prisma.paymentOrder.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  const profileIds = [...new Set(items.map((i) => i.userProfileId))];
  const profiles = await prisma.userProfile.findMany({
    where: { id: { in: profileIds } },
    select: { id: true, displayName: true, email: true }
  });
  const byId = new Map(profiles.map((p) => [p.id, p]));

  return res.json({
    success: true,
    items: items.map((item) => ({
      ...item,
      user: byId.get(item.userProfileId) || null
    }))
  });
});
