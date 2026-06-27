import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const email = process.argv[2] || 'ravnopar@oriph.io';
const password = process.argv[3];

async function main() {
  const profile = await prisma.userProfile.findUnique({
    where: { email },
    include: { account: true }
  });

  if (!profile) {
    console.log(JSON.stringify({ found: false, email }, null, 2));
    return;
  }

  const result = {
    found: true,
    email: profile.email,
    id: profile.id,
    role: profile.account?.role,
    verified: Boolean(profile.account?.verifiedAt),
    suspended: Boolean(profile.account?.suspendedAt),
    passwordOk: password
      ? await bcrypt.compare(password, profile.account?.passwordHash || '')
      : undefined
  };
  console.log(JSON.stringify(result, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
