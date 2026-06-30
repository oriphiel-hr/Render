import { prisma } from '../lib/prisma.js';
import { createInAppNotification } from '../lib/in-app-notifications.js';
import {
  notifyPairAutoClosed,
  notifyPairInactivityWarning,
  notifyPendingContactExpired
} from '../services/notification-service.js';

async function lastMessageAt(pairId) {
  const last = await prisma.pairMessage.findFirst({
    where: { pairId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  });
  return last?.createdAt || null;
}

export async function runInactivitySweep({
  warnHours = 48,
  closeHours = 72,
  pendingDays = 14
} = {}) {
  const now = Date.now();
  const warnCutoff = new Date(now - warnHours * 60 * 60 * 1000);
  const closeCutoff = new Date(now - closeHours * 60 * 60 * 1000);
  const pendingCutoff = new Date(now - pendingDays * 24 * 60 * 60 * 1000);

  const activePairs = await prisma.engagedPair.findMany({ where: { status: 'ACTIVE' } });
  let warned = 0;
  let closed = 0;

  for (const pair of activePairs) {
    const lastMsg = await lastMessageAt(pair.id);
    const inactiveSince = lastMsg || pair.startedAt;

    if (inactiveSince < closeCutoff) {
      await prisma.$transaction(async (tx) => {
        await tx.engagedPair.update({
          where: { id: pair.id },
          data: {
            status: 'CLOSED',
            endedAt: new Date(),
            closeReason: `Auto timeout after ${closeHours}h inactivity`
          }
        });
        await tx.userProfile.updateMany({
          where: {
            id: { in: [pair.userAId, pair.userBId] },
            availability: 'FOCUSED_CONTACT'
          },
          data: { availability: 'AVAILABLE' }
        });
      });

      for (const profileId of [pair.userAId, pair.userBId]) {
        await createInAppNotification({
          profileId,
          type: 'PAIR_CLOSED',
          title: 'Razgovor zatvoren',
          body: 'Kontakt je zatvoren zbog neaktivnosti — oboje ste ponovno dostupni u feedu.',
          linkPath: '/app'
        });
        notifyPairAutoClosed(profileId, closeHours).catch(() => {});
      }
      closed += 1;
      continue;
    }

    if (inactiveSince < warnCutoff) {
      const warnType = `PAIR_WARN_${pair.id}`;
      for (const profileId of [pair.userAId, pair.userBId]) {
        const existing = await prisma.inAppNotification.findFirst({
          where: {
            profileId,
            type: warnType,
            createdAt: { gt: new Date(now - 24 * 60 * 60 * 1000) }
          }
        });
        if (existing) continue;

        await createInAppNotification({
          profileId,
          type: warnType,
          title: 'Razgovor čeka odgovor',
          body: 'Dugo nema poruka — odgovori ili zatvori kontakt da drugima ostane prilika.',
          linkPath: `/app/chat/${pair.id}`
        });
        notifyPairInactivityWarning(profileId, warnHours).catch(() => {});
        warned += 1;
      }
    }
  }

  const stalePending = await prisma.matchContact.findMany({
    where: { status: 'PENDING', createdAt: { lt: pendingCutoff } }
  });

  let expiredPending = 0;
  for (const contact of stalePending) {
    await prisma.matchContact.update({
      where: { id: contact.id },
      data: { status: 'AUTO_CLOSED' }
    });
    await createInAppNotification({
      profileId: contact.requesterId,
      type: 'CONTACT_EXPIRED',
      title: 'Zahtjev istekao',
      body: 'Tvoj zahtjev za kontakt nije prihvaćen na vrijeme — možeš poslati novi kasnije.',
      linkPath: '/app'
    });
    notifyPendingContactExpired(contact.requesterId).catch(() => {});
    expiredPending += 1;
  }

  return { warned, closed, expiredPending };
}
