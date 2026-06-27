import { prisma } from './prisma.js';

const COOLDOWN_MS = Number(process.env.MESSAGE_EMAIL_COOLDOWN_MS || 15 * 60 * 1000);

export async function canSendMessageEmail(pairId, profileId) {
  const row = await prisma.pairMessageEmailLog.findUnique({
    where: { pairId_profileId: { pairId, profileId } }
  });
  if (!row) return true;
  return Date.now() - row.lastSentAt.getTime() >= COOLDOWN_MS;
}

export async function markMessageEmailSent(pairId, profileId) {
  await prisma.pairMessageEmailLog.upsert({
    where: { pairId_profileId: { pairId, profileId } },
    create: { pairId, profileId, lastSentAt: new Date() },
    update: { lastSentAt: new Date() }
  });
}
