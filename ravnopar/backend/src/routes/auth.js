import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { issueAuthToken, requireAuth } from '../lib/auth.js';
import { normalizePhotos, toPublicProfile, normalizeIcebreakers } from '../lib/profile-public.js';
import { normalizePrivateTags, normalizePublicTags } from '../lib/profile-tags.js';
import {
  normalizeChildrenPref,
  normalizeRelationshipStatus,
  normalizeSmoking
} from '../lib/profile-lifestyle.js';
import { validatePhotosArray } from '../lib/photo-validation.js';
import { calculateProfileCompleteness, isFeedReady } from '../services/profile-service.js';
import { recordComplianceEvent, recordSecurityEvent } from '../services/audit-service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/notification-service.js';
import { verifyRegisterCaptcha, validateTurnstile } from '../lib/captcha.js';
import { persistPhotos } from '../lib/storage.js';
import { persistVerificationSelfie } from '../lib/verification-selfie.js';
import { normalizeVideoUrl } from '../lib/video-url.js';
import { rateLimit } from '../lib/rate-limit.js';
import { ensureReferralCode, generateReferralCode } from '../lib/referral.js';
import { sendError } from '../lib/api-errors.js';
import { SUPPORTED_LOCALES } from '../lib/locales.js';
import {
  defaultSeekingAgeRange,
  normalizeMaxDistanceKm,
  normalizeSeekingAgeRange,
  validateSeekingAgeRange
} from '../lib/match-preferences.js';

const localeSchema = z.enum(SUPPORTED_LOCALES);

function ownerProfileExtras(profile) {
  const { seekingAgeMin, seekingAgeMax } = normalizeSeekingAgeRange(
    profile.seekingAgeMin,
    profile.seekingAgeMax,
    profile.age
  );
  return {
    email: profile.email,
    dateOfBirth: profile.dateOfBirth,
    country: profile.country,
    locale: profile.locale,
    notifyEmail: profile.notifyEmail,
    shareLocation: profile.shareLocation,
    seekingAgeMin,
    seekingAgeMax,
    maxDistanceKm: normalizeMaxDistanceKm(profile.maxDistanceKm),
    sameCountryOnly: profile.sameCountryOnly === true,
    publicTags: normalizePublicTags(profile.publicTags),
    privateTags: normalizePrivateTags(profile.privateTags),
    childrenPref: normalizeChildrenPref(profile.childrenPref),
    smoking: normalizeSmoking(profile.smoking),
    relationshipStatus: normalizeRelationshipStatus(profile.relationshipStatus),
    verificationPending: profile.verificationPending,
    verificationSelfie: profile.verificationSelfie || null
  };
}

export const authRouter = Router();

const authLimiter = rateLimit({ windowMs: 60_000, max: 20, keyPrefix: 'auth' });
authRouter.use(authLimiter);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(80),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string().min(2).max(80),
  country: z.string().length(2).default('HR'),
  locale: localeSchema.default('hr'),
  bio: z.string().max(500).optional(),
  identity: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER']),
  profileType: z.enum(['INDIVIDUAL', 'COUPLE']),
  seekingIdentities: z.array(z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'])).min(1).max(4),
  seekingProfileTypes: z.array(z.enum(['INDIVIDUAL', 'COUPLE'])).min(1).max(2),
  intents: z.array(z.enum(['CHAT', 'CASUAL', 'RELATIONSHIP', 'MARRIAGE', 'ADVENTURE'])).min(1).max(5),
  website: z.string().max(0).optional(),
  captchaToken: z.string().optional(),
  referralCode: z.string().min(4).max(12).optional()
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
      return sendError(req, res, 400, captcha.code || 'INVALID_SUBMISSION');
    }
    if (captcha.secret && captcha.token) {
      const valid = await validateTurnstile(captcha.token, captcha.secret);
      if (!valid) return sendError(req, res, 400, 'CAPTCHA_FAILED');
    }

    const payload = registerSchema.parse(req.body);
    const age = calculateAge(payload.dateOfBirth);
    if (Number.isNaN(age) || age < 18) {
      return sendError(req, res, 400, 'ADULTS_ONLY');
    }
    const existing = await prisma.userProfile.findUnique({
      where: { email: payload.email }
    });
    if (existing) {
      return sendError(req, res, 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const existingAccounts = await prisma.userAccount.count();
    const bootstrapAdminEnabled = process.env.FIRST_USER_IS_ADMIN !== 'false';
    const initialRole = existingAccounts === 0 && bootstrapAdminEnabled ? 'ADMIN' : 'USER';

    let referredByProfileId = null;
    if (payload.referralCode) {
      const code = payload.referralCode.trim().toLowerCase();
      const referrer = await prisma.userProfile.findFirst({
        where: { referralCode: code }
      });
      if (referrer) referredByProfileId = referrer.id;
    }

    const ageDefaults = defaultSeekingAgeRange(age);

    await prisma.$transaction(async (tx) => {
      const profile = await tx.userProfile.create({
        data: {
          email: payload.email,
          displayName: payload.displayName,
          age,
          dateOfBirth: new Date(payload.dateOfBirth),
          city: payload.city,
          country: payload.country,
          locale: payload.locale,
          bio: payload.bio || null,
          identity: payload.identity,
          profileType: payload.profileType,
          seekingIdentities: payload.seekingIdentities,
          seekingProfileTypes: payload.seekingProfileTypes,
          intents: payload.intents,
          seekingAgeMin: ageDefaults.seekingAgeMin,
          seekingAgeMax: ageDefaults.seekingAgeMax,
          referredByProfileId,
          referralCode: generateReferralCode(payload.displayName)
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
    return sendError(req, res, 400, 'INVALID_PAYLOAD');
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
      return sendError(req, res, 400, 'INVALID_CODE');
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
    return sendError(req, res, 400, 'INVALID_PAYLOAD');
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const payload = loginSchema.parse(req.body);
    const profile = await prisma.userProfile.findUnique({
      where: { email: payload.email }
    });
    if (!profile) {
      return sendError(req, res, 401, 'INVALID_CREDENTIALS');
    }

    const account = await prisma.userAccount.findUnique({
      where: { profileId: profile.id }
    });
    if (!account) {
      return sendError(req, res, 401, 'INVALID_CREDENTIALS');
    }
    if (!account.verifiedAt) {
      return sendError(req, res, 403, 'EMAIL_NOT_VERIFIED');
    }
    if (account.suspendedAt) {
      return sendError(req, res, 403, 'ACCOUNT_SUSPENDED');
    }

    const ok = await bcrypt.compare(payload.password, account.passwordHash);
    if (!ok) {
      return sendError(req, res, 401, 'INVALID_CREDENTIALS');
    }

    const token = issueAuthToken(account);
    return res.json({
      success: true,
      token,
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        city: profile.city,
        country: profile.country,
        locale: profile.locale,
        availability: profile.availability,
        planTier: profile.planTier || 'free',
        onboardingDone: profile.onboardingDone,
        role: account.role
      }
    });
  } catch (_error) {
    return sendError(req, res, 400, 'INVALID_PAYLOAD');
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

  await recordComplianceEvent({
    action: 'DATA_EXPORT',
    actorProfileId: profile.id,
    targetProfileId: profile.id,
    summary: 'Korisnik preuzeo GDPR export podataka',
    payload: { email: profile.email }
  });

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
  country: z.string().length(2).optional(),
  locale: localeSchema.optional(),
  bio: z.string().max(500).nullable().optional(),
  identity: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER']).optional(),
  profileType: z.enum(['INDIVIDUAL', 'COUPLE']).optional(),
  seekingIdentities: z.array(z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'])).min(1).max(4).optional(),
  seekingProfileTypes: z.array(z.enum(['INDIVIDUAL', 'COUPLE'])).min(1).max(2).optional(),
  intents: z.array(z.enum(['CHAT', 'CASUAL', 'RELATIONSHIP', 'MARRIAGE', 'ADVENTURE'])).min(1).max(5).optional(),
  availability: z.enum(['AVAILABLE', 'PAUSED']).optional(),
  notifyEmail: z.boolean().optional(),
  onboardingDone: z.boolean().optional(),
  photos: z.array(z.string()).max(3).optional(),
  icebreakers: z
    .array(z.object({ question: z.string().min(2).max(120), answer: z.string().min(1).max(200) }))
    .max(3)
    .optional(),
  shareLocation: z.boolean().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  seekingAgeMin: z.number().int().min(18).max(99).optional(),
  seekingAgeMax: z.number().int().min(18).max(99).optional(),
  maxDistanceKm: z.number().int().min(1).max(500).nullable().optional(),
  sameCountryOnly: z.boolean().optional(),
  publicTags: z.array(z.string().min(2).max(32)).max(5).optional(),
  privateTags: z.array(z.string().min(2).max(32)).max(5).optional(),
  childrenPref: z.enum(['NONE', 'HAS', 'WANTS_SOMEDAY', 'NOT_IMPORTANT']).nullable().optional(),
  smoking: z.enum(['NO', 'SOMETIMES', 'YES']).nullable().optional(),
  relationshipStatus: z.enum(['SINGLE', 'OPEN', 'COMPLICATED']).nullable().optional(),
  videoUrl: z.string().max(500).nullable().optional(),
  verificationSelfie: z.string().max(600_000).nullable().optional()
});

authRouter.get('/profile', requireAuth, async (req, res) => {
  const profile = await prisma.userProfile.findUnique({ where: { id: req.auth.profileId } });
  if (!profile) return sendError(req, res, 404, 'PROFILE_NOT_FOUND');
  return res.json({
    success: true,
    profile: {
      ...toPublicProfile(profile),
      ...ownerProfileExtras(profile)
    },
    feedReady: isFeedReady(profile),
    completeness: calculateProfileCompleteness(profile)
  });
});

authRouter.get('/referral', requireAuth, async (req, res) => {
  const profile = await prisma.userProfile.findUnique({ where: { id: req.auth.profileId } });
  if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

  const referralCode = await ensureReferralCode(prisma, profile.id, profile.displayName);
  const invitedCount = await prisma.userProfile.count({
    where: { referredByProfileId: profile.id }
  });

  const frontendBase = (process.env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');

  return res.json({
    success: true,
    referralCode,
    inviteUrl: `${frontendBase}/auth?ref=${referralCode}`,
    invitedCount
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
    if (payload.icebreakers) {
      data.icebreakers = normalizeIcebreakers(payload.icebreakers);
    }
    if (payload.videoUrl !== undefined) {
      data.videoUrl = payload.videoUrl ? normalizeVideoUrl(payload.videoUrl) : null;
      if (payload.videoUrl && !data.videoUrl) {
        return res.status(400).json({ success: false, error: 'Neispravan video link.' });
      }
    }
    if (payload.shareLocation === false) {
      data.shareLocation = false;
      data.latitude = null;
      data.longitude = null;
    } else if (payload.shareLocation === true) {
      data.shareLocation = true;
    }
    if (payload.latitude !== undefined && payload.shareLocation !== false) {
      data.latitude = payload.latitude;
    }
    if (payload.longitude !== undefined && payload.shareLocation !== false) {
      data.longitude = payload.longitude;
    }
    if (payload.seekingAgeMin !== undefined || payload.seekingAgeMax !== undefined) {
      const validated = validateSeekingAgeRange(
        payload.seekingAgeMin ?? profile.seekingAgeMin,
        payload.seekingAgeMax ?? profile.seekingAgeMax
      );
      if (!validated.ok) {
        if (validated.code === 'UNDER_MIN') {
          return sendError(req, res, 400, 'SEEKING_AGE_UNDER_MIN');
        }
        if (validated.code === 'OVER_MAX') {
          return sendError(req, res, 400, 'SEEKING_AGE_OVER_MAX');
        }
        if (validated.code === 'INVERTED') {
          return sendError(req, res, 400, 'SEEKING_AGE_INVERTED');
        }
        return sendError(req, res, 400, 'INVALID_PAYLOAD');
      }
      data.seekingAgeMin = validated.seekingAgeMin;
      data.seekingAgeMax = validated.seekingAgeMax;
    }
    if (payload.maxDistanceKm !== undefined) {
      data.maxDistanceKm = normalizeMaxDistanceKm(payload.maxDistanceKm);
    }
    if (payload.sameCountryOnly !== undefined) {
      data.sameCountryOnly = payload.sameCountryOnly;
    }
    if (payload.publicTags !== undefined) {
      data.publicTags = normalizePublicTags(payload.publicTags);
    }
    if (payload.privateTags !== undefined) {
      data.privateTags = normalizePrivateTags(payload.privateTags);
    }
    if (payload.childrenPref !== undefined) {
      data.childrenPref = normalizeChildrenPref(payload.childrenPref);
    }
    if (payload.smoking !== undefined) {
      data.smoking = normalizeSmoking(payload.smoking);
    }
    if (payload.relationshipStatus !== undefined) {
      data.relationshipStatus = normalizeRelationshipStatus(payload.relationshipStatus);
    }
    if (payload.verificationSelfie !== undefined) {
      if (payload.verificationSelfie === null) {
        data.verificationSelfie = null;
        data.verificationPending = false;
      } else {
        const stored = await persistVerificationSelfie(profile.id, payload.verificationSelfie);
        if (!stored) {
          return res.status(400).json({ success: false, error: 'Neispravan selfie.' });
        }
        data.verificationSelfie = stored;
        data.verificationPending = true;
        data.photoVerified = false;
      }
    }

    if (payload.onboardingDone === true) {
      const merged = { ...profile, ...data };
      if (!isFeedReady(merged)) {
        return res.status(400).json({
          success: false,
          error: 'Prije završetka uvoda dodaj fotografiju i bio (min. 10 znakova).'
        });
      }
    }

    const updated = await prisma.userProfile.update({
      where: { id: profile.id },
      data
    });

    return res.json({
      success: true,
      profile: {
        ...toPublicProfile(updated),
        ...ownerProfileExtras(updated)
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

  await recordComplianceEvent({
    action: 'ACCOUNT_DELETE_SELF',
    actorProfileId: profileId,
    targetProfileId: profileId,
    summary: 'Korisnik obrisao vlastiti račun',
    payload: { email: profile.email, displayName: profile.displayName }
  });
  await recordSecurityEvent({
    action: 'ACCOUNT_DELETE',
    actorProfileId: profileId,
    targetProfileId: profileId,
    summary: `Račun obrisan (korisnik): ${profile.displayName}`,
    payload: { email: profile.email, via: 'self_service' }
  });

  const { deleteUserProfile } = await import('../services/profile-service.js');
  await deleteUserProfile(prisma, profileId);

  return res.json({ success: true });
});
