import { prisma } from './prisma.js';

export async function createInAppNotification({ profileId, type, title, body, linkPath = null }) {
  if (!profileId) return null;
  return prisma.inAppNotification.create({
    data: { profileId, type, title, body, linkPath }
  });
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
