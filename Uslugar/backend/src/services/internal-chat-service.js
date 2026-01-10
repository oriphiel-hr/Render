/**
 * USLUGAR EXCLUSIVE - Internal Chat Service
 * 
 * Upravlja INTERNAL chatom između direktora i timova
 * Privatni interni chat za operativnu koordinaciju, nevidljiv klijentu
 */

import { prisma } from '../lib/prisma.js';

/**
 * Kreira ili dohvaća INTERNAL chat room između direktora i tim člana
 * @param {String} directorId - ID direktora (providerProfile.id)
 * @param {String} teamMemberId - ID tim člana (providerProfile.id)
 * @param {String} roomName - Naziv chat rooma (opcionalno)
 * @returns {Object} - Chat room
 */
export async function createOrGetInternalChatRoom(directorId, teamMemberId, roomName = null) {
  console.log(`💬 Kreiranje/dohvaćanje INTERNAL chat rooma između direktora ${directorId} i tim člana ${teamMemberId}`);

  // Provjeri da li je prvi korisnik direktor
  const directorProfile = await prisma.providerProfile.findUnique({
    where: { id: directorId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  if (!directorProfile || !directorProfile.isDirector) {
    throw new Error('Prvi korisnik mora biti direktor');
  }

  // Provjeri da li je drugi korisnik tim član direktora
  const teamMemberProfile = await prisma.providerProfile.findUnique({
    where: { id: teamMemberId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  if (!teamMemberProfile) {
    throw new Error('Tim član ne postoji');
  }

  if (teamMemberProfile.companyId !== directorId) {
    throw new Error('Tim član nije član tima ovog direktora');
  }

  // Provjeri da li već postoji chat room između direktora i tim člana
  // INTERNAL chat nema jobId (null)
  const existingRoom = await prisma.chatRoom.findFirst({
    where: {
      jobId: null, // INTERNAL chat nije vezan uz job
      participants: {
        every: {
          id: { in: [directorProfile.userId, teamMemberProfile.userId] }
        }
      }
    },
    include: {
      participants: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        }
      }
    }
  });

  if (existingRoom) {
    console.log(`   ✅ INTERNAL chat room već postoji`);
    return existingRoom;
  }

  // Kreiraj novi INTERNAL chat room
  const room = await prisma.chatRoom.create({
    data: {
      jobId: null, // INTERNAL chat nije vezan uz job
      name: roomName || `Interni chat: ${directorProfile.user.fullName} ↔ ${teamMemberProfile.user.fullName}`,
      participants: {
        connect: [
          { id: directorProfile.userId },
          { id: teamMemberProfile.userId }
        ]
      }
    },
    include: {
      participants: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        }
      }
    }
  });

  // Kreiraj pozdravnu poruku
  await prisma.chatMessage.create({
    data: {
      content: `Interni chat je otvoren za operativnu koordinaciju.`,
      senderId: directorProfile.userId,
      roomId: room.id
    }
  });

  console.log(`   ✅ INTERNAL chat room kreiran`);

  return room;
}

/**
 * Kreira grupni INTERNAL chat room za direktor i više tim članova
 * @param {String} directorId - ID direktora (providerProfile.id)
 * @param {Array<String>} teamMemberIds - Lista ID-ova tim članova (providerProfile.id[])
 * @param {String} roomName - Naziv chat rooma
 * @returns {Object} - Chat room
 */
export async function createGroupInternalChatRoom(directorId, teamMemberIds, roomName) {
  console.log(`💬 Kreiranje grupnog INTERNAL chat rooma za direktor ${directorId} i ${teamMemberIds.length} tim članova`);

  // Provjeri da li je korisnik direktor
  const directorProfile = await prisma.providerProfile.findUnique({
    where: { id: directorId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  if (!directorProfile || !directorProfile.isDirector) {
    throw new Error('Korisnik mora biti direktor');
  }

  // Provjeri da li su svi tim članovi članovi tima direktora
  const teamMemberProfiles = await prisma.providerProfile.findMany({
    where: {
      id: { in: teamMemberIds },
      companyId: directorId
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  if (teamMemberProfiles.length !== teamMemberIds.length) {
    throw new Error('Neki tim članovi nisu članovi tima direktora');
  }

  // Kreiraj grupni chat room
  const participantIds = [
    directorProfile.userId,
    ...teamMemberProfiles.map(p => p.user.id)
  ];

  const room = await prisma.chatRoom.create({
    data: {
      jobId: null, // INTERNAL chat nije vezan uz job
      name: roomName || `Grupni interni chat: ${directorProfile.user.fullName}`,
      participants: {
        connect: participantIds.map(id => ({ id }))
      }
    },
    include: {
      participants: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        }
      }
    }
  });

  // Kreiraj pozdravnu poruku
  await prisma.chatMessage.create({
    data: {
      content: `Grupni interni chat je otvoren za operativnu koordinaciju.`,
      senderId: directorProfile.userId,
      roomId: room.id
    }
  });

  console.log(`   ✅ Grupni INTERNAL chat room kreiran s ${participantIds.length} sudionika`);

  return room;
}

/**
 * Provjeri pristup INTERNAL chatu za korisnika
 * @param {String} roomId - ID chat rooma
 * @param {String} userId - ID korisnika
 * @returns {Object} - Informacije o pristupu
 */
export async function checkInternalChatAccess(roomId, userId) {
  // Provjeri da li je chat room INTERNAL (nema jobId)
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      participants: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        }
      }
    }
  });

  if (!room) {
    return {
      hasAccess: false,
      message: 'Chat room ne postoji'
    };
  }

  // INTERNAL chat mora imati jobId = null
  if (room.jobId !== null) {
    return {
      hasAccess: false,
      message: 'Ovo nije INTERNAL chat room'
    };
  }

  // Provjeri da li je korisnik sudionik
  const isParticipant = room.participants.some(p => p.id === userId);

  if (!isParticipant) {
    return {
      hasAccess: false,
      message: 'Nemate pristup ovom INTERNAL chatu'
    };
  }

  // Provjeri da li su svi sudionici direktor ili tim članovi iste tvrtke
  const participantUserIds = room.participants.map(p => p.id);
  const providerProfiles = await prisma.providerProfile.findMany({
    where: {
      userId: { in: participantUserIds }
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  // Provjeri da li postoji direktor
  const director = providerProfiles.find(p => p.isDirector);
  if (!director) {
    return {
      hasAccess: false,
      message: 'INTERNAL chat mora imati direktora'
    };
  }

  // Provjeri da li su svi ostali sudionici tim članovi direktora
  const teamMembers = providerProfiles.filter(p => !p.isDirector);
  const allTeamMembersValid = teamMembers.every(p => p.companyId === director.id);

  if (!allTeamMembersValid) {
    return {
      hasAccess: false,
      message: 'Svi sudionici moraju biti direktor ili tim članovi iste tvrtke'
    };
  }

  return {
    hasAccess: true,
    room,
    isDirector: providerProfiles.find(p => p.userId === userId)?.isDirector || false,
    directorId: director.id
  };
}

/**
 * Dohvati sve INTERNAL chat roomove za korisnika
 * @param {String} userId - ID korisnika
 * @returns {Array} - Lista INTERNAL chat roomova
 */
export async function getInternalChatRooms(userId) {
  // Provjeri da li je korisnik direktor ili tim član
  const providerProfile = await prisma.providerProfile.findFirst({
    where: { userId },
    include: {
      teamMembers: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      },
      company: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!providerProfile) {
    return [];
  }

  // Ako je direktor, dohvaći sve INTERNAL chat roomove gdje je sudionik
  // Ako je tim član, dohvaći sve INTERNAL chat roomove gdje je sudionik i gdje je direktor njegov direktor
  const directorId = providerProfile.isDirector ? providerProfile.id : providerProfile.companyId;

  if (!directorId) {
    return [];
  }

  // Dohvati sve INTERNAL chat roomove (jobId = null) gdje je korisnik sudionik
  const rooms = await prisma.chatRoom.findMany({
    where: {
      jobId: null, // INTERNAL chat nije vezan uz job
      participants: {
        some: { id: userId }
      }
    },
    include: {
      participants: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Filtriraj da uključi samo roomove gdje je direktor ili tim članovi iste tvrtke
  const validRooms = [];
  for (const room of rooms) {
    const participantUserIds = room.participants.map(p => p.id);
    const participantProfiles = await prisma.providerProfile.findMany({
      where: {
        userId: { in: participantUserIds }
      }
    });

    const roomDirector = participantProfiles.find(p => p.isDirector);
    if (roomDirector && roomDirector.id === directorId) {
      validRooms.push(room);
    }
  }

  return validRooms;
}

