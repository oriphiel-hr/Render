import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { issueAuthToken } from '../lib/auth.js';

export const authRouter = Router();

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
  intents: z.array(z.enum(['CHAT', 'CASUAL', 'RELATIONSHIP', 'MARRIAGE', 'ADVENTURE'])).min(1).max(5)
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
        role: account.role
      }
    });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});
