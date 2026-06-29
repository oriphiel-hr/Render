import { prisma } from './prisma.js';

const TOUCH_INTERVAL_MS = 5 * 60 * 1000;
const lastTouchByProfile = new Map();

export function touchLastActive(profileId) {
  if (!profileId) return;
  const now = Date.now();
  const prev = lastTouchByProfile.get(profileId) || 0;
  if (now - prev < TOUCH_INTERVAL_MS) return;
  lastTouchByProfile.set(profileId, now);
  prisma.userProfile
    .update({
      where: { id: profileId },
      data: { lastActiveAt: new Date() }
    })
    .catch(() => {});
}
