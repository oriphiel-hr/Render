import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_SEED_RESET !== 'true') {
    throw new Error(
      'Seed reset blocked. Set ALLOW_SEED_RESET=true before running seed:reset.'
    );
  }

  // Delete child -> parent to keep FK constraints clean.
  await prisma.clientConfiguration.deleteMany({});
  await prisma.partnerInquiry.deleteMany({});
  await prisma.client.deleteMany({});
}

main()
  .then(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log('Seed reset completed.');
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error('Seed reset failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
