/**
 * USLUGAR EXCLUSIVE - Thread Locking Service
 * 
 * Upravlja zaključavanjem chat threadova nakon završetka posla ili neaktivnosti
 */

import { prisma } from '../lib/prisma.js';

/**
 * Provjeri je li thread zaključan
 * @param {String} roomId - ID chat rooma
 * @returns {Object} - { isLocked: boolean, reason: string, unlockedUntil: Date | null }
 */
export async function isThreadLocked(roomId) {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    select: {
      isLocked: true,
      lockedReason: true,
      unlockedUntil: true
    }
  });

  if (!room) {
    throw new Error('Chat room not found');
  }

  // Ako nije zaključan, vrati false
  if (!room.isLocked) {
    return { isLocked: false, reason: null, unlockedUntil: null };
  }

  // Ako je zaključan, provjeri je li privremeno otključan
  if (room.unlockedUntil && new Date(room.unlockedUntil) > new Date()) {
    return { isLocked: false, reason: null, unlockedUntil: room.unlockedUntil };
  }

  return {
    isLocked: true,
    reason: room.lockedReason,
    unlockedUntil: room.unlockedUntil
  };
}

/**
 * Zaključaj thread
 * @param {String} roomId - ID chat rooma
 * @param {String} reason - Razlog zaključavanja (JOB_COMPLETED, INACTIVITY, MANUAL)
 * @param {String} lockedById - ID korisnika koji zaključava (null = automatski)
 * @param {Date} unlockedUntil - Privremeno otključan do (null = trajno)
 * @returns {Object} - Ažurirani chat room
 */
export async function lockThread(roomId, reason, lockedById = null, unlockedUntil = null) {
  const room = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      isLocked: true,
      lockedAt: new Date(),
      lockedReason: reason,
      lockedById,
      unlockedUntil
    },
    include: {
      participants: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  console.log(`🔒 Thread ${roomId} zaključan: ${reason}`);

  return room;
}

/**
 * Otključaj thread
 * @param {String} roomId - ID chat rooma
 * @param {String} unlockedById - ID korisnika koji otključava
 * @returns {Object} - Ažurirani chat room
 */
export async function unlockThread(roomId, unlockedById) {
  const room = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      isLocked: false,
      lockedAt: null,
      lockedReason: null,
      lockedById: null,
      unlockedUntil: null
    },
    include: {
      participants: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  console.log(`🔓 Thread ${roomId} otključan od strane ${unlockedById}`);

  return room;
}

/**
 * Privremeno otključaj thread
 * @param {String} roomId - ID chat rooma
 * @param {Number} durationMinutes - Trajanje otključavanja u minutama
 * @param {String} unlockedById - ID korisnika koji otključava
 * @returns {Object} - Ažurirani chat room
 */
export async function temporarilyUnlockThread(roomId, durationMinutes, unlockedById) {
  const unlockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);

  const room = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      isLocked: false, // Privremeno otključan
      unlockedUntil
    },
    include: {
      participants: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  console.log(`🔓 Thread ${roomId} privremeno otključan do ${unlockedUntil.toISOString()}`);

  return room;
}

/**
 * Automatski zaključaj threadove za završene poslove
 * @param {String} jobId - ID posla
 * @returns {Number} - Broj zaključanih threadova
 */
export async function lockThreadsForCompletedJob(jobId) {
  const rooms = await prisma.chatRoom.findMany({
    where: {
      jobId,
      isLocked: false
    }
  });

  let lockedCount = 0;

  for (const room of rooms) {
    await lockThread(room.id, 'JOB_COMPLETED', null, null);
    lockedCount++;
  }

  console.log(`🔒 Zaključano ${lockedCount} threadova za završeni posao ${jobId}`);

  return lockedCount;
}

/**
 * Automatski zaključaj neaktivne threadove
 * @param {Number} inactivityDays - Broj dana neaktivnosti prije zaključavanja (default: 90)
 * @returns {Number} - Broj zaključanih threadova
 */
export async function lockInactiveThreads(inactivityDays = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - inactivityDays);

  const inactiveRooms = await prisma.chatRoom.findMany({
    where: {
      isLocked: false,
      OR: [
        { lastActivityAt: { lt: cutoffDate } },
        { 
          AND: [
            { lastActivityAt: null },
            { updatedAt: { lt: cutoffDate } }
          ]
        }
      ]
    },
    include: {
      job: {
        select: {
          status: true
        }
      }
    }
  });

  let lockedCount = 0;

  for (const room of inactiveRooms) {
    // Ne zaključavaj threadove za poslove koji su još u tijeku
    if (room.job && room.job.status === 'IN_PROGRESS') {
      continue;
    }

    await lockThread(room.id, 'INACTIVITY', null, null);
    lockedCount++;
  }

  console.log(`🔒 Zaključano ${lockedCount} neaktivnih threadova`);

  return lockedCount;
}

/**
 * Ažuriraj zadnju aktivnost u threadu
 * @param {String} roomId - ID chat rooma
 */
export async function updateThreadActivity(roomId) {
  await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      lastActivityAt: new Date(),
      updatedAt: new Date()
    }
  });
}

/**
 * Provjeri i ponovno zaključaj threadove čije je privremeno otključavanje isteklo
 * @returns {Number} - Broj ponovno zaključanih threadova
 */
export async function reLockExpiredTemporaryUnlocks() {
  const now = new Date();

  const expiredRooms = await prisma.chatRoom.findMany({
    where: {
      isLocked: false,
      unlockedUntil: {
        lte: now
      },
      lockedReason: { not: null } // Samo threadovi koji su bili zaključani
    }
  });

  let reLockedCount = 0;

  for (const room of expiredRooms) {
    await prisma.chatRoom.update({
      where: { id: room.id },
      data: {
        isLocked: true,
        unlockedUntil: null
      }
    });
    reLockedCount++;
  }

  if (reLockedCount > 0) {
    console.log(`🔒 Ponovno zaključano ${reLockedCount} threadova nakon isteka privremenog otključavanja`);
  }

  return reLockedCount;
}

