import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const email = process.argv[2] || 'admin@ravnopar.app';
const password = process.argv[3] || crypto.randomBytes(12).toString('base64url');

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);

  let profile = await prisma.userProfile.findUnique({ where: { email } });

  if (!profile) {
    profile = await prisma.userProfile.create({
      data: {
        email,
        displayName: 'Admin',
        age: 30,
        dateOfBirth: new Date('1995-01-15'),
        city: 'Zagreb',
        identity: 'MALE',
        profileType: 'INDIVIDUAL',
        seekingIdentities: ['FEMALE'],
        seekingProfileTypes: ['INDIVIDUAL'],
        intents: ['RELATIONSHIP'],
        availability: 'AVAILABLE',
        bio: 'Admin račun'
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
        role: 'ADMIN',
        verifiedAt: new Date()
      }
    });
  } else {
    await prisma.userAccount.update({
      where: { id: account.id },
      data: {
        passwordHash,
        role: 'ADMIN',
        verifiedAt: account.verifiedAt || new Date(),
        suspendedAt: null
      }
    });
  }

  console.log(JSON.stringify({ email, password, role: 'ADMIN' }, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
