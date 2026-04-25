import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_SEED_RESET !== 'true') {
    throw new Error('Seed reset blocked. Set ALLOW_SEED_RESET=true before running seed:reset.');
  }

  await prisma.engagedPair.deleteMany({});
  await prisma.matchContact.deleteMany({});
  await prisma.emailVerificationCode.deleteMany({});
  await prisma.userAccount.deleteMany({});
  await prisma.userProfile.deleteMany({});
}

main()
  .then(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log('Ravnopar seed reset done.');
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
