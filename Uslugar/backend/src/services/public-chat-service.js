/**
 * USLUGAR EXCLUSIVE - Public Chat Service
 * 
 * Upravlja PUBLIC chatom između klijenta i tvrtke
 * Chat se automatski otvara nakon otključavanja lead-a
 */

import { prisma } from '../lib/prisma.js';

/**
 * Kreira PUBLIC chat room između klijenta i tvrtke nakon otključavanja leada
 * @param {String} jobId - ID posla
 * @param {String} providerId - ID providera koji je kupio lead (userId)
 * @returns {Object} - Kreirani chat room
 */
export async function createPublicChatRoom(jobId, providerId) {
  console.log(`💬 Kreiranje PUBLIC chat rooma za job ${jobId} i provider ${providerId}`);

  // Provjeri da li već postoji chat room za ovaj job
  const existingRoom = await prisma.chatRoom.findFirst({
    where: {
      jobId,
      participants: {
        some: { id: providerId }
      }
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

  if (existingRoom) {
    console.log(`   ⚠️ Chat room već postoji`);
    return existingRoom;
  }

  // Dohvati job i klijenta
  const job = await prisma.job.findUnique({
    where: { id: jobId },
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

  if (!job) {
    throw new Error('Job not found');
  }

  // Provjeri da li je provider direktor ili tim član
  // Ako je tim član, dodaj i direktora u chat
  const providerProfile = await prisma.providerProfile.findFirst({
    where: { userId: providerId },
    include: {
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

  const participants = [job.userId, providerId];

  // Ako je provider tim član, dodaj direktora kao sudionika
  // Također provjeri da li je lead dodijeljen tim članu u internom queueu
  if (providerProfile && providerProfile.companyId && providerProfile.company) {
    const directorUserId = providerProfile.company.userId;
    if (directorUserId && !participants.includes(directorUserId)) {
      participants.push(directorUserId);
      console.log(`   👔 Dodavanje direktora ${directorUserId} u chat (tim član je sudionik)`);
    }
  }

  // Provjeri da li je lead dodijeljen tim članu u internom queueu
  const companyLeadQueue = await prisma.companyLeadQueue.findFirst({
    where: {
      jobId,
      assignedToId: {
        not: null
      },
      status: { in: ['ASSIGNED', 'IN_PROGRESS'] }
    },
    include: {
      assignedTo: {
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

  // Ako je lead dodijeljen tim članu, dodaj ga u chat
  if (companyLeadQueue && companyLeadQueue.assignedTo) {
    const teamMemberUserId = companyLeadQueue.assignedTo.userId;
    if (teamMemberUserId && !participants.includes(teamMemberUserId)) {
      participants.push(teamMemberUserId);
      console.log(`   👤 Dodavanje tim člana ${teamMemberUserId} u chat (lead mu je dodijeljen)`);
    }
  }

  // Kreiraj chat room
  const room = await prisma.chatRoom.create({
    data: {
      jobId,
      name: `Chat: ${job.title}`,
      participants: {
        connect: participants.map(id => ({ id }))
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
      job: {
        select: {
          id: true,
          title: true,
          status: true
        }
      }
    }
  });

  // Kreiraj pozdravnu poruku
  await prisma.chatMessage.create({
    data: {
      content: `Chat je otvoren. Možete komunicirati o poslu "${job.title}".`,
      senderId: providerId, // Poruka od strane providera
      roomId: room.id
    }
  });

  console.log(`   ✅ PUBLIC chat room kreiran s ${participants.length} sudionika`);

  return room;
}

/**
 * Provjeri pristup PUBLIC chatu za korisnika
 * @param {String} jobId - ID posla
 * @param {String} userId - ID korisnika
 * @returns {Object} - Informacije o pristupu i chat roomu
 */
export async function checkPublicChatAccess(jobId, userId) {
  // Provjeri da li postoji lead purchase za ovaj job
  const leadPurchase = await prisma.leadPurchase.findFirst({
    where: {
      jobId,
      status: { in: ['ACTIVE', 'CONTACTED', 'CONVERTED'] }
    },
    include: {
      job: {
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

  // Provjeri da li je korisnik vlasnik posla
  const job = await prisma.job.findUnique({
    where: { id: jobId },
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

  if (!job) {
    return {
      hasAccess: false,
      message: 'Posao ne postoji'
    };
  }

  const isJobOwner = job.userId === userId;

  if (!leadPurchase && !isJobOwner) {
    return {
      hasAccess: false,
      message: 'Nemate pristup ovom chatu'
    };
  }

  // Provjeri da li postoji chat room
  const room = await prisma.chatRoom.findFirst({
    where: {
      jobId,
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
      job: {
        select: {
          id: true,
          title: true,
          status: true
        }
      }
    }
  });

  // Ako je korisnik vlasnik posla ili provider koji je kupio lead, ima pristup
  const isProvider = leadPurchase?.providerId === userId;

  // Provjeri da li je tim član koji je dobio lead
  let isTeamMember = false;
  if (leadPurchase) {
    // Provjeri da li je korisnik tim član direktora koji je kupio lead
    const providerProfile = await prisma.providerProfile.findFirst({
      where: { userId: leadPurchase.providerId },
      include: {
        teamMembers: {
          where: { userId: userId }
        }
      }
    });

    if (providerProfile && providerProfile.teamMembers.length > 0) {
      isTeamMember = true;
    }
    
    // Provjeri da li je korisnik tim član koji je dobio lead u internom queueu
    if (!isTeamMember) {
      const companyLeadQueue = await prisma.companyLeadQueue.findFirst({
        where: {
          jobId,
          assignedToId: {
            not: null
          },
          status: { in: ['ASSIGNED', 'IN_PROGRESS'] }
        },
        include: {
          assignedTo: {
            where: { userId: userId }
          }
        }
      });

      if (companyLeadQueue && companyLeadQueue.assignedTo) {
        isTeamMember = true;
      }
    }
  }

  // Ako nema lead purchase, samo vlasnik posla ima pristup
  if (!leadPurchase && !isJobOwner) {
    return {
      hasAccess: false,
      message: 'Nemate pristup ovom chatu'
    };
  }

  // Ako postoji lead purchase, provjeri pristup
  if (leadPurchase && !isJobOwner && !isProvider && !isTeamMember) {
    return {
      hasAccess: false,
      message: 'Nemate pristup ovom chatu'
    };
  }

  return {
    hasAccess: true,
    room,
    isJobOwner,
    isProvider,
    isTeamMember
  };
}

/**
 * Dohvati sve PUBLIC chat roomove za korisnika
 * @param {String} userId - ID korisnika
 * @returns {Array} - Lista chat roomova
 */
export async function getPublicChatRooms(userId) {
  // Dohvati sve chat roomove gdje je korisnik sudionik i gdje postoji lead purchase
  // Također uključi roomove gdje je korisnik tim član koji je dobio lead
  const rooms = await prisma.chatRoom.findMany({
    where: {
      participants: {
        some: { id: userId }
      },
      job: {
        leadPurchases: {
          some: {
            status: { in: ['ACTIVE', 'CONTACTED', 'CONVERTED'] }
          }
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
      },
      job: {
        select: {
          id: true,
          title: true,
          status: true,
          leadPurchases: {
            where: {
              status: { in: ['ACTIVE', 'CONTACTED', 'CONVERTED'] }
            },
            take: 1
          }
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

  return rooms;
}

