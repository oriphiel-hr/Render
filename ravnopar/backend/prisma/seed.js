import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureUser({
  email,
  displayName,
  age,
  city,
  role,
  identity,
  profileType,
  seekingIdentities,
  seekingProfileTypes,
  intents
}) {
  let profile = await prisma.userProfile.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash('Test12345!', 10);

  if (!profile) {
    profile = await prisma.userProfile.create({
      data: {
        email,
        displayName,
        age,
        dateOfBirth: new Date(Date.now() - age * 365 * 24 * 60 * 60 * 1000),
        city,
        identity,
        profileType,
        seekingIdentities,
        seekingProfileTypes,
        intents,
        availability: 'AVAILABLE'
      }
    });
  }

  const account = await prisma.userAccount.findUnique({
    where: { profileId: profile.id }
  });
  if (!account) {
    await prisma.userAccount.create({
      data: {
        profileId: profile.id,
        passwordHash,
        role,
        verifiedAt: new Date()
      }
    });
  } else if (!account.verifiedAt || account.role !== role) {
    await prisma.userAccount.update({
      where: { id: account.id },
      data: { verifiedAt: account.verifiedAt || new Date(), role }
    });
  }

  return profile;
}

async function main() {
  const admin = await ensureUser({
    email: 'admin@ravnopar.test',
    displayName: 'Admin Ravnopar',
    age: 30,
    city: 'Zagreb',
    role: 'ADMIN',
    identity: 'MALE',
    profileType: 'INDIVIDUAL',
    seekingIdentities: ['FEMALE'],
    seekingProfileTypes: ['INDIVIDUAL'],
    intents: ['RELATIONSHIP', 'MARRIAGE']
  });

  const ana = await ensureUser({
    email: 'ana@ravnopar.test',
    displayName: 'Ana',
    age: 28,
    city: 'Split',
    role: 'USER',
    identity: 'FEMALE',
    profileType: 'INDIVIDUAL',
    seekingIdentities: ['MALE'],
    seekingProfileTypes: ['INDIVIDUAL'],
    intents: ['RELATIONSHIP']
  });
  const marko = await ensureUser({
    email: 'marko@ravnopar.test',
    displayName: 'Marko',
    age: 31,
    city: 'Rijeka',
    role: 'USER',
    identity: 'MALE',
    profileType: 'INDIVIDUAL',
    seekingIdentities: ['FEMALE'],
    seekingProfileTypes: ['INDIVIDUAL'],
    intents: ['CHAT', 'CASUAL']
  });
  const iva = await ensureUser({
    email: 'iva@ravnopar.test',
    displayName: 'Iva',
    age: 27,
    city: 'Osijek',
    role: 'USER',
    identity: 'FEMALE',
    profileType: 'INDIVIDUAL',
    seekingIdentities: ['MALE', 'FEMALE'],
    seekingProfileTypes: ['INDIVIDUAL'],
    intents: ['CHAT', 'ADVENTURE']
  });

  const pending = await prisma.matchContact.findFirst({
    where: {
      requesterId: marko.id,
      targetId: iva.id,
      status: 'PENDING'
    }
  });
  if (!pending) {
    await prisma.matchContact.create({
      data: { requesterId: marko.id, targetId: iva.id, status: 'PENDING' }
    });
  }

  const existingPair = await prisma.engagedPair.findFirst({
    where: {
      status: 'ACTIVE',
      OR: [
        { userAId: admin.id, userBId: ana.id },
        { userAId: ana.id, userBId: admin.id }
      ]
    }
  });
  if (!existingPair) {
    await prisma.engagedPair.create({
      data: {
        userAId: admin.id,
        userBId: ana.id,
        status: 'ACTIVE',
        startedAt: new Date(Date.now() - 80 * 60 * 60 * 1000)
      }
    });
    await prisma.userProfile.updateMany({
      where: { id: { in: [admin.id, ana.id] } },
      data: { availability: 'FOCUSED_CONTACT' }
    });
  }

  const reportExists = await prisma.userReport.findFirst({
    where: { reporterId: marko.id, reportedId: ana.id }
  });
  if (!reportExists) {
    await prisma.userReport.create({
      data: {
        reporterId: marko.id,
        reportedId: ana.id,
        reason: 'Spam poruke',
        details: 'Ponovljene copy-paste poruke.',
        priority: 3
      }
    });
  }

  const ratingExists = await prisma.userRating.findFirst({
    where: { fromUserId: iva.id, toUserId: marko.id }
  });
  if (!ratingExists) {
    await prisma.userRating.create({
      data: {
        fromUserId: iva.id,
        toUserId: marko.id,
        score: 4,
        comment: 'Uredna komunikacija.'
      }
    });
  }

  const fairnessChangeExists = await prisma.fairnessConfigChange.findFirst();
  if (!fairnessChangeExists) {
    await prisma.fairnessConfigChange.create({
      data: {
        changedByUserId: admin.id,
        oldDailyLimit: 30,
        newDailyLimit: 30,
        reason: 'Initial fairness baseline'
      }
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed done. Test password for all users: Test12345!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
