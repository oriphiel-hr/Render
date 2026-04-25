import { prisma } from '../lib/prisma.js';

export async function getDemoFeedState() {
  const [availableProfiles, engagedPairs, usersWaitingLongerThan7Days] = await Promise.all([
    prisma.userProfile.count({ where: { availability: 'AVAILABLE' } }),
    prisma.engagedPair.count({ where: { status: 'ACTIVE' } }),
    prisma.userProfile.count({
      where: {
        availability: 'AVAILABLE',
        createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    })
  ]);

  return {
    availableProfiles,
    engagedPairs,
    usersWaitingLongerThan7Days,
    fairnessNote:
      'Engaged parovi su privremeno maknuti iz glavnog feeda kako bi ostali korisnici dobili nove prilike.'
  };
}
