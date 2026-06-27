import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { issueAuthToken, requireAuth } from '../lib/auth.js';
import { normalizePhotos, toPublicProfile } from '../lib/profile-public.js';
import { validatePhotosArray } from '../lib/photo-validation.js';
import { calculateProfileCompleteness } from '../services/profile-service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/notification-service.js';
import { verifyRegisterCaptcha, validateTurnstile } from '../lib/captcha.js';
import { persistPhotos } from '../lib/storage.js';
import { rateLimit } from '../lib/rate-limit.js';

export const authRouter = Router();

const authLimiter = rateLimit({ windowMs: 60_000, max: 20, keyPrefix: 'auth' });
authRouter.use(authLimiter);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(80),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string().min(2).max(80),
  bio: z.string().max(500).optional(),
  identity: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER']),
  profileType: z.enum(['INDIVIDUAL', 'COUPLE']),
  seekingIdentities: z.array(z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'])).min(1).max(4),
  seekingProfileTypes: z.array(z.enum(['INDIVIDUAL', 'COUPLE'])).min(1).max(2),
  intents: z.array(z.enum(['CHAT', 'CASUAL', 'RELATIONSHIP', 'MARRIAGE', 'ADVENTURE'])).min(1).max(5),
  website: z.string().max(0).optional(),
  captchaToken: z.string().optional()
});

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function calculateAge(dateOfBirth) {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

authRouter.post('/register', async (req, res) => {
  try {
    const captcha = verifyRegisterCaptcha(req.body);
    if (!captcha.ok) {
      return res.status(400).json({ success: false, error: captcha.error });
    }
    if (captcha.secret && captcha.token) {
      const valid = await validateTurnstile(captcha.token, captcha.secret);
      if (!valid) return res.status(400).json({ success: false, error: 'Captcha nije prošla.' });
    }

    const payload = registerSchema.parse(req.body);
    const age = calculateAge(payload.dateOfBirth);
    if (Number.isNaN(age) || age < 18) {
      return res.status(400).json({ success: false, error: 'Only adults (18+) can register.' });
    }
    const existing = await prisma.userProfile.findUnique({
      where: { email: payload.email }
    });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const existingAccounts = await prisma.userAccount.count();
    const bootstrapAdminEnabled = process.env.FIRST_USER_IS_ADMIN !== 'false';
    const initialRole = existingAccounts === 0 && bootstrapAdminEnabled ? 'ADMIN' : 'USER';

    await prisma.$transaction(async (tx) => {
      const profile = await tx.userProfile.create({
        data: {
          email: payload.email,
          displayName: payload.displayName,
          age,
          dateOfBirth: new Date(payload.dateOfBirth),
          city: payload.city,
          bio: payload.bio || null,
          identity: payload.identity,
          profileType: payload.profileType,
          seekingIdentities: payload.seekingIdentities,
          seekingProfileTypes: payload.seekingProfileTypes,
          intents: payload.intents
        }
      });
      await tx.userAccount.create({
        data: {
          profileId: profile.id,
          passwordHash,
          role: initialRole
        }
      });
      await tx.emailVerificationCode.create({
        data: {
          email: payload.email,
          code,
          expiresAt
        }
      });
    });

    await sendVerificationEmail(payload.email, code);

    return res.status(201).json({
      success: true,
      message: 'Account created. Verify your email code.',
      bootstrapRole: initialRole,
      devVerificationCode: process.env.NODE_ENV === 'production' ? undefined : code
    });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

authRouter.post('/verify-email', async (req, res) => {
  try {
    const payload = verifySchema.parse(req.body);
    const codeRow = await prisma.emailVerificationCode.findFirst({
      where: {
        email: payload.email,
        code: payload.code,
        consumedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!codeRow) {
      return res.status(400).json({ success: false, error: 'Invalid or expired code' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.emailVerificationCode.update({
        where: { id: codeRow.id },
        data: { consumedAt: new Date() }
      });

      const profile = await tx.userProfile.findUnique({
        where: { email: payload.email }
      });
      if (profile) {
        await tx.userAccount.update({
          where: { profileId: profile.id },
          data: { verifiedAt: new Date() }
        });
      }
    });

    return res.json({ success: true });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const payload = loginSchema.parse(req.body);
    const profile = await prisma.userProfile.findUnique({
      where: { email: payload.email }
    });
    if (!profile) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const account = await prisma.userAccount.findUnique({
      where: { profileId: profile.id }
    });
    if (!account) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    if (!account.verifiedAt) {
      return res.status(403).json({ success: false, error: 'Email not verified' });
    }
    if (account.suspendedAt) {
      return res.status(403).json({ success: false, error: 'Račun je suspendiran. Kontaktiraj podršku.' });
    }

    const ok = await bcrypt.compare(payload.password, account.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = issueAuthToken(account);
    return res.json({
      success: true,
      token,
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        city: profile.city,
        availability: profile.availability,
        planTier: profile.planTier || 'free',
        onboardingDone: profile.onboardingDone,
        role: account.role
      }
    });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

authRouter.post('/forgot-password', async (req, res) => {
  const schema = z.object({ email: z.string().email() });
  try {
    const { email } = schema.parse(req.body);
    const profile = await prisma.userProfile.findUnique({ where: { email } });
    let devCode;
    if (profile) {
      const code = generateCode();
      devCode = code;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await prisma.passwordResetCode.create({ data: { email, code, expiresAt } });
      await sendPasswordResetEmail(email, code);
    }
    return res.json({
      success: true,
      message: 'Ako email postoji, poslan je kod za reset lozinke.',
      devResetCode: process.env.NODE_ENV === 'production' ? undefined : devCode
    });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    code: z.string().regex(/^\d{6}$/),
    newPassword: z.string().min(8).max(128)
  });
  try {
    const payload = schema.parse(req.body);
    const row = await prisma.passwordResetCode.findFirst({
      where: {
        email: payload.email,
        code: payload.code,
        consumedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
    if (!row) return res.status(400).json({ success: false, error: 'Invalid or expired code' });

    const profile = await prisma.userProfile.findUnique({ where: { email: payload.email } });
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    const passwordHash = await bcrypt.hash(payload.newPassword, 10);
    await prisma.$transaction(async (tx) => {
      await tx.passwordResetCode.update({ where: { id: row.id }, data: { consumedAt: new Date() } });
      await tx.userAccount.update({ where: { profileId: profile.id }, data: { passwordHash } });
    });

    return res.json({ success: true });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

authRouter.get('/export-data', requireAuth, async (req, res) => {
  const profile = await prisma.userProfile.findUnique({
    where: { id: req.auth.profileId },
    include: { account: { select: { role: true, verifiedAt: true, createdAt: true, suspendedAt: true } } }
  });
  if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

  const [contacts, pairs, messages, reports, ratings, orders] = await Promise.all([
    prisma.matchContact.findMany({
      where: { OR: [{ requesterId: profile.id }, { targetId: profile.id }] },
      orderBy: { createdAt: 'desc' },
      take: 200
    }),
    prisma.engagedPair.findMany({
      where: { OR: [{ userAId: profile.id }, { userBId: profile.id }] },
      orderBy: { startedAt: 'desc' },
      take: 100
    }),
    prisma.pairMessage.findMany({
      where: { senderId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 500
    }),
    prisma.userReport.findMany({
      where: { OR: [{ reporterId: profile.id }, { reportedId: profile.id }] },
      take: 100
    }),
    prisma.userRating.findMany({
      where: { OR: [{ fromUserId: profile.id }, { toUserId: profile.id }] },
      take: 100
    }),
    prisma.paymentOrder.findMany({ where: { userProfileId: profile.id }, take: 50 })
  ]);

  return res.json({
    success: true,
    exportedAt: new Date().toISOString(),
    profile: {
      ...toPublicProfile(profile),
      email: profile.email,
      dateOfBirth: profile.dateOfBirth,
      notifyEmail: profile.notifyEmail,
      account: profile.account
    },
    contacts,
    pairs,
    messagesSent: messages,
    reports,
    ratings,
    orders
  });
});

const profileUpdateSchema = z.object({
  displayName: z.string().min(2).max(80).optional(),
  city: z.string().min(2).max(80).optional(),
  bio: z.string().max(500).nullable().optional(),
  identity: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER']).optional(),
  profileType: z.enum(['INDIVIDUAL', 'COUPLE']).optional(),
  seekingIdentities: z.array(z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'])).min(1).max(4).optional(),
  seekingProfileTypes: z.array(z.enum(['INDIVIDUAL', 'COUPLE'])).min(1).max(2).optional(),
  intents: z.array(z.enum(['CHAT', 'CASUAL', 'RELATIONSHIP', 'MARRIAGE', 'ADVENTURE'])).min(1).max(5).optional(),
  availability: z.enum(['AVAILABLE', 'PAUSED']).optional(),
  notifyEmail: z.boolean().optional(),
  onboardingDone: z.boolean().optional(),
  photos: z.array(z.string()).max(3).optional()
});

authRouter.get('/profile', requireAuth, async (req, res) => {
  const profile = await prisma.userProfile.findUnique({ where: { id: req.auth.profileId } });
  if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
  return res.json({
    success: true,
    profile: {
      ...toPublicProfile(profile),
      email: profile.email,
      dateOfBirth: profile.dateOfBirth,
      notifyEmail: profile.notifyEmail
    },
    completeness: calculateProfileCompleteness(profile)
  });
});

authRouter.patch('/profile', requireAuth, async (req, res) => {
  try {
    const payload = profileUpdateSchema.parse(req.body);
    const profile = await prisma.userProfile.findUnique({ where: { id: req.auth.profileId } });
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    if (payload.availability === 'PAUSED' && profile.availability === 'FOCUSED_CONTACT') {
      return res.status(409).json({
        success: false,
        error: 'Ne možeš pauzirati profil dok si u aktivnom razgovoru. Prvo završi kontakt.'
      });
    }

    if (payload.photos && !validatePhotosArray(payload.photos)) {
      return res.status(400).json({ success: false, error: 'Neispravna fotografija.' });
    }

    const data = { ...payload };
    if (payload.photos) {
      data.photos = await persistPhotos(profile.id, normalizePhotos(payload.photos));
    }

    const updated = await prisma.userProfile.update({
      where: { id: profile.id },
      data
    });

    return res.json({
      success: true,
      profile: {
        ...toPublicProfile(updated),
        email: updated.email,
        dateOfBirth: updated.dateOfBirth,
        notifyEmail: updated.notifyEmail
      },
      completeness: calculateProfileCompleteness(updated)
    });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

authRouter.delete('/account', requireAuth, async (req, res) => {
  const profileId = req.auth.profileId;
  const profile = await prisma.userProfile.findUnique({ where: { id: profileId } });
  if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

  await prisma.$transaction(async (tx) => {
    await tx.engagedPair.updateMany({
      where: {
        status: 'ACTIVE',
        OR: [{ userAId: profileId }, { userBId: profileId }]
      },
      data: { status: 'CLOSED', endedAt: new Date(), closeReason: 'Account deleted' }
    });
    await tx.userProfile.delete({ where: { id: profileId } });
  });

  return res.json({ success: true });
});
