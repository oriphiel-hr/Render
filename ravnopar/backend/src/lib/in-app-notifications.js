import { prisma } from './prisma.js';
import { sendWebPushToProfile } from './web-push.js';

export async function createInAppNotification({ profileId, type, title, body, linkPath = null }) {
  if (!profileId) return null;
  const row = await prisma.inAppNotification.create({
    data: { profileId, type, title, body, linkPath }
  });
  sendWebPushToProfile(profileId, { title, body, linkPath }).catch(() => {});
  return row;
}

export async function listNotifications(profileId, { limit = 40 } = {}) {
  return prisma.inAppNotification.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

export async function countUnreadNotifications(profileId) {
  return prisma.inAppNotification.count({
    where: { profileId, readAt: null }
  });
}

export async function markNotificationRead(profileId, notificationId) {
  return prisma.inAppNotification.updateMany({
    where: { id: notificationId, profileId },
    data: { readAt: new Date() }
  });
}

export async function markAllNotificationsRead(profileId) {
  return prisma.inAppNotification.updateMany({
    where: { profileId, readAt: null },
    data: { readAt: new Date() }
  });
}
