import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';
import { upload, getImageUrl } from '../lib/upload.js';

const r = Router();

// ============================================================
// INTERNAL CHAT ROUTES (Direktor ↔ Team)
// ============================================================

/**
 * GET /api/chat/internal/rooms
 * Dohvaća sve INTERNAL chat roomove za korisnika
 */
r.get('/internal/rooms', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { getInternalChatRooms } = await import('../services/internal-chat-service.js');
    const rooms = await getInternalChatRooms(req.user.id);
    res.json(rooms);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/chat/internal/rooms
 * Kreira novi INTERNAL chat room između direktora i tim člana
 */
r.post('/internal/rooms', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { teamMemberId, roomName } = req.body;

    if (!teamMemberId) {
      return res.status(400).json({ error: 'Missing teamMemberId' });
    }

    // Provjeri da li je korisnik direktor
    const directorProfile = await prisma.providerProfile.findFirst({
      where: {
        userId: req.user.id,
        isDirector: true
      }
    });

    if (!directorProfile) {
      return res.status(403).json({ error: 'Samo direktor može kreirati INTERNAL chat room' });
    }

    const { createOrGetInternalChatRoom } = await import('../services/internal-chat-service.js');
    const room = await createOrGetInternalChatRoom(directorProfile.id, teamMemberId, roomName);

    res.status(201).json(room);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/chat/internal/rooms/group
 * Kreira grupni INTERNAL chat room za direktor i više tim članova
 */
r.post('/internal/rooms/group', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { teamMemberIds, roomName } = req.body;

    if (!teamMemberIds || !Array.isArray(teamMemberIds) || teamMemberIds.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid teamMemberIds' });
    }

    if (!roomName) {
      return res.status(400).json({ error: 'Missing roomName' });
    }

    // Provjeri da li je korisnik direktor
    const directorProfile = await prisma.providerProfile.findFirst({
      where: {
        userId: req.user.id,
        isDirector: true
      }
    });

    if (!directorProfile) {
      return res.status(403).json({ error: 'Samo direktor može kreirati grupni INTERNAL chat room' });
    }

    const { createGroupInternalChatRoom } = await import('../services/internal-chat-service.js');
    const room = await createGroupInternalChatRoom(directorProfile.id, teamMemberIds, roomName);

    res.status(201).json(room);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/chat/internal/rooms/:roomId/check
 * Provjerava pristup INTERNAL chatu
 */
r.get('/internal/rooms/:roomId/check', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const { checkInternalChatAccess } = await import('../services/internal-chat-service.js');
    const access = await checkInternalChatAccess(roomId, req.user.id);

    res.json(access);
  } catch (e) {
    next(e);
  }
});

// ============================================================
// PUBLIC CHAT ROUTES (Klijent ↔ Tvrtka)
// ============================================================

// Get user's chat rooms (PUBLIC, OFFER_BASED, i INTERNAL)
r.get('/rooms', auth(true), async (req, res, next) => {
  try {
    // Dohvati PUBLIC chat roomove
    const { getPublicChatRooms } = await import('../services/public-chat-service.js');
    const publicRooms = await getPublicChatRooms(req.user.id);

    // Dohvati OFFER_BASED chat roomove (stari sustav)
    const offerBasedRooms = await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: { id: req.user.id }
        },
        job: {
          offers: {
            some: { status: 'ACCEPTED' }
          },
          leadPurchases: {
            none: {
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
            status: true
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

    // Dohvati INTERNAL chat roomove (samo za PROVIDER role)
    let internalRooms = [];
    if (req.user.role === 'PROVIDER') {
      try {
        const { getInternalChatRooms } = await import('../services/internal-chat-service.js');
        internalRooms = await getInternalChatRooms(req.user.id);
      } catch (e) {
        console.warn('Greška pri dohvaćanju INTERNAL chat roomova:', e.message);
      }
    }

    // Kombiniraj i ukloni duplikate
    const allRooms = [...publicRooms, ...offerBasedRooms, ...internalRooms];
    const uniqueRooms = Array.from(
      new Map(allRooms.map(room => [room.id, room])).values()
    );

    res.json(uniqueRooms);
  } catch (e) {
    next(e);
  }
});

// Create or get chat room for a job
r.post('/rooms', auth(true), async (req, res, next) => {
  try {
    const { jobId, participantId } = req.body;

    if (!jobId || !participantId) {
      return res.status(400).json({ error: 'Missing jobId or participantId' });
    }

    // Get job and verify status
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        offers: {
          where: { status: 'ACCEPTED' },
          include: {
            user: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if job has accepted offer
    const acceptedOffer = job.offers[0];
    if (!acceptedOffer) {
      return res.status(403).json({ 
        error: 'Chat is only available after a provider accepts the job' 
      });
    }

    // Verify that the participants are the job owner and the accepted provider
    const isJobOwner = req.user.id === job.userId;
    const isAcceptedProvider = req.user.id === acceptedOffer.userId;
    
    if (!isJobOwner && !isAcceptedProvider) {
      return res.status(403).json({ 
        error: 'Only the job owner and accepted provider can chat' 
      });
    }

    // Verify participantId matches
    const expectedOtherParticipant = isJobOwner ? acceptedOffer.userId : job.userId;
    if (participantId !== expectedOtherParticipant) {
      return res.status(403).json({ 
        error: 'Invalid participant - you can only chat with the job owner or accepted provider' 
      });
    }

    // Check if room already exists
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        jobId,
        participants: {
          every: {
            id: { in: [req.user.id, participantId] }
          }
        }
      },
      include: {
        participants: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (existingRoom) {
      return res.json(existingRoom);
    }

    // Create new room
    const room = await prisma.chatRoom.create({
      data: {
        jobId,
        participants: {
          connect: [
            { id: req.user.id },
            { id: participantId }
          ]
        }
      },
      include: {
        participants: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.status(201).json(room);
  } catch (e) {
    next(e);
  }
});

// Check chat access and get other participant info
r.get('/check/:jobId', auth(true), async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Provjeri PUBLIC chat pristup (nakon otključavanja leada)
    const { checkPublicChatAccess } = await import('../services/public-chat-service.js');
    const publicChatAccess = await checkPublicChatAccess(jobId, req.user.id);

    if (publicChatAccess.hasAccess) {
      return res.json({
        hasAccess: true,
        chatType: 'PUBLIC',
        room: publicChatAccess.room,
        job: publicChatAccess.room?.job,
        roomExists: !!publicChatAccess.room,
        roomId: publicChatAccess.room?.id,
        isJobOwner: publicChatAccess.isJobOwner,
        isProvider: publicChatAccess.isProvider,
        isTeamMember: publicChatAccess.isTeamMember
      });
    }

    // Fallback na stari sustav (ACCEPTED offer)
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        offers: {
          where: { status: 'ACCEPTED' },
          include: {
            user: {
              select: { id: true, fullName: true, email: true }
            }
          }
        },
        user: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const acceptedOffer = job.offers[0];
    const isJobOwner = req.user.id === job.userId;
    const isAcceptedProvider = acceptedOffer && req.user.id === acceptedOffer.userId;

    // Determine who can chat
    if (!isJobOwner && !isAcceptedProvider) {
      return res.json({
        hasAccess: false,
        message: 'Chat is only available for the job owner and accepted provider'
      });
    }

    // Get the other participant
    const otherParticipant = isJobOwner ? acceptedOffer?.user : job.user;

    // Check if chat room exists
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        jobId,
        participants: {
          some: { id: req.user.id }
        }
      }
    });

    res.json({
      hasAccess: true,
      chatType: 'OFFER_BASED',
      otherParticipant,
      job: {
        id: job.id,
        title: job.title,
        status: job.status
      },
      roomExists: !!existingRoom,
      roomId: existingRoom?.id
    });
  } catch (e) {
    next(e);
  }
});

// Get messages for a room
r.get('/rooms/:roomId/messages', auth(true), async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      },
      include: {
        job: {
          include: {
            offers: {
              where: { status: 'ACCEPTED' },
              include: { user: true }
            },
            leadPurchases: {
              where: {
                status: { in: ['ACTIVE', 'CONTACTED', 'CONVERTED'] }
              },
              take: 1
            }
          }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Provjeri tip chata: INTERNAL (jobId = null), PUBLIC (lead purchase), ili OFFER_BASED (accepted offer)
    if (room.jobId === null) {
      // INTERNAL chat - provjeri pristup
      const { checkInternalChatAccess } = await import('../services/internal-chat-service.js');
      const access = await checkInternalChatAccess(roomId, req.user.id);
      
      if (!access.hasAccess) {
        return res.status(403).json({ error: access.message || 'Nemate pristup ovom INTERNAL chatu' });
      }
    } else {
      // PUBLIC ili OFFER_BASED chat
      const hasLeadPurchase = room.job.leadPurchases && room.job.leadPurchases.length > 0;
      const hasAcceptedOffer = room.job.offers && room.job.offers.length > 0;

      if (!hasLeadPurchase && !hasAcceptedOffer) {
        return res.status(403).json({ error: 'Chat is only available after lead unlock or job acceptance' });
      }
    }

    const messages = await prisma.chatMessage.findMany({
      where: { 
        roomId,
        // Filtriraj odbijene poruke (osim ako je admin)
        moderationStatus: req.user.role === 'ADMIN' 
          ? undefined 
          : { not: 'REJECTED' }
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          select: {
            version: true,
            editedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Označi poruke koje nisu od trenutnog korisnika kao DELIVERED ako još nisu
    // A automatski kao READ ako korisnik dohvaća poruke (znači da gleda chat)
    const now = new Date();
    const messageIdsToUpdate = messages
      .filter(msg => msg.senderId !== req.user.id && msg.status !== 'READ')
      .map(msg => msg.id);

    if (messageIdsToUpdate.length > 0) {
      await prisma.chatMessage.updateMany({
        where: {
          id: { in: messageIdsToUpdate }
        },
        data: {
          status: 'READ',
          readAt: now
        }
      });
    }

    // Ponovno dohvati poruke s ažuriranim statusom
    const updatedMessages = await prisma.chatMessage.findMany({
      where: { 
        roomId,
        // Filtriraj odbijene poruke (osim ako je admin)
        moderationStatus: req.user.role === 'ADMIN' 
          ? undefined 
          : { not: 'REJECTED' }
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          select: {
            version: true,
            editedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Provjeri je li thread zaključan
    const { isThreadLocked } = await import('../services/thread-locking-service.js');
    const lockStatus = await isThreadLocked(roomId);

    res.json({
      messages: updatedMessages.reverse(),
      threadLocked: lockStatus.isLocked,
      lockReason: lockStatus.reason,
      unlockedUntil: lockStatus.unlockedUntil
    });
  } catch (e) {
    next(e);
  }
});

// Delete chat room (only for participants)
r.delete('/rooms/:roomId', auth(true), async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete all messages first
    await prisma.chatMessage.deleteMany({ where: { roomId } });

    // Delete room
    await prisma.chatRoom.delete({ where: { id: roomId } });

    res.json({ message: 'Chat room deleted successfully' });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/chat/rooms/:roomId/upload-image
 * Upload slike za chat poruku
 */
r.post('/rooms/:roomId/upload-image', auth(true), upload.single('image'), async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      },
      include: {
        job: {
          include: {
            offers: {
              where: { status: 'ACCEPTED' },
              include: { user: true }
            },
            leadPurchases: {
              where: {
                status: { in: ['ACTIVE', 'CONTACTED', 'CONVERTED'] }
              },
              take: 1
            }
          }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Provjeri je li thread zaključan
    const { isThreadLocked } = await import('../services/thread-locking-service.js');
    const lockStatus = await isThreadLocked(roomId);
    if (lockStatus.isLocked) {
      return res.status(403).json({ 
        error: 'Thread is locked',
        reason: lockStatus.reason,
        message: 'Ovaj thread je zaključan i ne može se uploadati privitke.'
      });
    }

    // Provjeri tip chata: INTERNAL (jobId = null), PUBLIC (lead purchase), ili OFFER_BASED (accepted offer)
    if (room.jobId === null) {
      // INTERNAL chat - provjeri pristup
      const { checkInternalChatAccess } = await import('../services/internal-chat-service.js');
      const access = await checkInternalChatAccess(roomId, req.user.id);
      
      if (!access.hasAccess) {
        return res.status(403).json({ error: access.message || 'Nemate pristup ovom INTERNAL chatu' });
      }
    } else {
      // PUBLIC ili OFFER_BASED chat
      const hasLeadPurchase = room.job.leadPurchases && room.job.leadPurchases.length > 0;
      const hasAcceptedOffer = room.job.offers && room.job.offers.length > 0;

      if (!hasLeadPurchase && !hasAcceptedOffer) {
        return res.status(403).json({ error: 'Chat is only available after lead unlock or job acceptance' });
      }
    }

    // Get image URL
    const imageUrl = getImageUrl(req, req.file.filename);

    // Log audit - attachment uploaded
    const { logAttachmentUploaded } = await import('../services/audit-log-service.js');
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await logAttachmentUploaded(
      null, // messageId - privitak se može uploadati prije kreiranja poruke
      req.user.id,
      roomId,
      {
        filename: req.file.filename,
        size: req.file.size,
        type: req.file.mimetype,
        url: imageUrl
      },
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename,
      size: req.file.size,
      message: 'Image uploaded successfully'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/chat/rooms/:roomId/messages
 * Kreiraj novu poruku (može sadržavati tekst i/ili slike)
 */
r.post('/rooms/:roomId/messages', auth(true), async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { content = '', attachments = [] } = req.body;

    // Validate: mora biti ili content ili attachments
    if (!content.trim() && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Message must have content or attachments' });
    }

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      },
      include: {
        job: {
          include: {
            offers: {
              where: { status: 'ACCEPTED' },
              include: { user: true }
            },
            leadPurchases: {
              where: {
                status: { in: ['ACTIVE', 'CONTACTED', 'CONVERTED'] }
              },
              take: 1
            }
          }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Provjeri je li thread zaključan
    const { isThreadLocked } = await import('../services/thread-locking-service.js');
    const lockStatus = await isThreadLocked(roomId);
    if (lockStatus.isLocked) {
      return res.status(403).json({ 
        error: 'Thread is locked',
        reason: lockStatus.reason,
        message: 'Ovaj thread je zaključan i ne može se slati nove poruke.'
      });
    }

    // Provjeri tip chata: INTERNAL (jobId = null), PUBLIC (lead purchase), ili OFFER_BASED (accepted offer)
    if (room.jobId === null) {
      // INTERNAL chat - provjeri pristup
      const { checkInternalChatAccess } = await import('../services/internal-chat-service.js');
      const access = await checkInternalChatAccess(roomId, req.user.id);
      
      if (!access.hasAccess) {
        return res.status(403).json({ error: access.message || 'Nemate pristup ovom INTERNAL chatu' });
      }
    } else {
      // PUBLIC ili OFFER_BASED chat
      const hasLeadPurchase = room.job.leadPurchases && room.job.leadPurchases.length > 0;
      const hasAcceptedOffer = room.job.offers && room.job.offers.length > 0;

      if (!hasLeadPurchase && !hasAcceptedOffer) {
        return res.status(403).json({ error: 'Chat is only available after lead unlock or job acceptance' });
      }
    }

    // Automatska moderacija poruke
    let moderationStatus = null;
    let moderationNotes = null;
    
    try {
      const { autoModerateMessage } = await import('../services/message-moderation-service.js');
      const moderationResult = await autoModerateMessage(
        content.trim() || '',
        roomId,
        req.user.id
      );

      if (!moderationResult.isApproved) {
        moderationStatus = 'PENDING';
        moderationNotes = moderationResult.reason;
      }
    } catch (modError) {
      console.error('Error in auto-moderation:', modError);
      // Ne blokiraj poruku ako moderacija ne uspije
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim() || '',
        attachments: Array.isArray(attachments) ? attachments : [],
        senderId: req.user.id,
        roomId,
        moderationStatus: moderationStatus || null,
        moderationNotes: moderationNotes || null
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    // Update room updatedAt and lastActivityAt
    const { updateThreadActivity } = await import('../services/thread-locking-service.js');
    await updateThreadActivity(roomId);

    // Kreiraj SLA tracking ako poruka nije od samog sebe (npr. provider odgovara klijentu)
    try {
      const { createSLATracking } = await import('../services/sla-reminder-service.js');
      // Provjeri je li poruka od korisnika (klijenta) - provideri trebaju odgovoriti
      const sender = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true }
      });
      
      // Ako je poruka od korisnika (USER), kreiraj SLA tracking za providere
      if (sender && sender.role === 'USER') {
        await createSLATracking(message.id, roomId, 240); // 4 sata SLA
      }
    } catch (slaError) {
      console.error('Error creating SLA tracking:', slaError);
      // Ne bacamo grešku - SLA tracking ne smije blokirati slanje poruke
    }

    // Log audit - message created
    const { logMessageCreated } = await import('../services/audit-log-service.js');
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await logMessageCreated(
      message.id,
      req.user.id,
      roomId,
      {
        contentPreview: content.trim().substring(0, 100),
        attachmentsCount: Array.isArray(attachments) ? attachments.length : 0
      },
      ipAddress,
      userAgent
    );

    res.status(201).json(message);
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/chat/rooms/:roomId/messages/:messageId
 * Uredi poruku (kreira novu verziju)
 */
r.patch('/rooms/:roomId/messages/:messageId', auth(true), async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params;
    const { content, attachments, reason } = req.body;

    // Validate: mora biti ili content ili attachments
    if (content === undefined && attachments === undefined) {
      return res.status(400).json({ error: 'Missing content or attachments' });
    }

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      },
      include: {
        job: {
          include: {
            offers: {
              where: { status: 'ACCEPTED' },
              include: { user: true }
            },
            leadPurchases: {
              where: {
                status: { in: ['ACTIVE', 'CONTACTED', 'CONVERTED'] }
              },
              take: 1
            }
          }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Provjeri je li thread zaključan
    const { isThreadLocked } = await import('../services/thread-locking-service.js');
    const lockStatus = await isThreadLocked(roomId);
    if (lockStatus.isLocked) {
      return res.status(403).json({ 
        error: 'Thread is locked',
        reason: lockStatus.reason,
        message: 'Ovaj thread je zaključan i ne može se uređivati.'
      });
    }

    // Provjeri tip chata: INTERNAL (jobId = null), PUBLIC (lead purchase), ili OFFER_BASED (accepted offer)
    if (room.jobId === null) {
      // INTERNAL chat - provjeri pristup
      const { checkInternalChatAccess } = await import('../services/internal-chat-service.js');
      const access = await checkInternalChatAccess(roomId, req.user.id);
      
      if (!access.hasAccess) {
        return res.status(403).json({ error: access.message || 'Nemate pristup ovom INTERNAL chatu' });
      }
    } else {
      // PUBLIC ili OFFER_BASED chat
      const hasLeadPurchase = room.job.leadPurchases && room.job.leadPurchases.length > 0;
      const hasAcceptedOffer = room.job.offers && room.job.offers.length > 0;

      if (!hasLeadPurchase && !hasAcceptedOffer) {
        return res.status(403).json({ error: 'Chat is only available after lead unlock or job acceptance' });
      }
    }

    // Uredi poruku (kreira novu verziju)
    const { editMessage } = await import('../services/message-versioning.js');
    const updatedMessage = await editMessage(
      messageId,
      req.user.id,
      content !== undefined ? content.trim() : undefined,
      attachments !== undefined ? (Array.isArray(attachments) ? attachments : []) : null,
      reason || null
    );

    // Update room updatedAt and lastActivityAt
    const { updateThreadActivity } = await import('../services/thread-locking-service.js');
    await updateThreadActivity(roomId);

    // Log audit - message edited (s IP i user agent)
    try {
      const { logMessageEdited } = await import('../services/audit-log-service.js');
      const latestVersion = updatedMessage.versions?.[0];
      if (latestVersion && oldMessage) {
        await logMessageEdited(
          messageId,
          req.user.id,
          roomId,
          latestVersion.version,
          oldMessage,
          { content: updatedMessage.content, attachments: updatedMessage.attachments },
          reason || null,
          ipAddress,
          userAgent
        );
      }
    } catch (auditError) {
      console.error('Error logging message edit audit:', auditError);
    }

    res.json(updatedMessage);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/chat/rooms/:roomId/messages/:messageId/versions
 * Dohvati sve verzije poruke
 */
r.get('/rooms/:roomId/messages/:messageId/versions', auth(true), async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params;

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { getMessageVersions } = await import('../services/message-versioning.js');
    const versions = await getMessageVersions(messageId, req.user.id);

    res.json(versions);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/chat/rooms/:roomId/messages/:messageId/versions/:version
 * Dohvati specifičnu verziju poruke
 */
r.get('/rooms/:roomId/messages/:messageId/versions/:version', auth(true), async (req, res, next) => {
  try {
    const { roomId, messageId, version } = req.params;
    const versionNumber = parseInt(version);

    if (isNaN(versionNumber) || versionNumber < 0) {
      return res.status(400).json({ error: 'Invalid version number' });
    }

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { getMessageVersion } = await import('../services/message-versioning.js');
    const messageVersion = await getMessageVersion(messageId, versionNumber, req.user.id);

    res.json(messageVersion);
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/chat/rooms/:roomId/messages/:messageId/read
 * Označi poruku kao pročitanu
 */
r.patch('/rooms/:roomId/messages/:messageId/read', auth(true), async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params;

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Provjeri da poruka nije od trenutnog korisnika (ne možete označiti svoje poruke kao pročitane)
    if (message.senderId === req.user.id) {
      return res.status(400).json({ error: 'Cannot mark your own message as read' });
    }

    // Ažuriraj status
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        status: 'READ',
        readAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    res.json(updatedMessage);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/chat/rooms/:roomId/mark-all-read
 * Označi sve poruke u sobi kao pročitane (za trenutnog korisnika)
 */
r.post('/rooms/:roomId/mark-all-read', auth(true), async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Označi sve poruke koje nisu od trenutnog korisnika kao pročitane
    const now = new Date();
    const result = await prisma.chatMessage.updateMany({
      where: {
        roomId,
        senderId: { not: req.user.id }, // Samo poruke od drugih korisnika
        status: { not: 'READ' } // Samo one koje još nisu pročitane
      },
      data: {
        status: 'READ',
        readAt: now
      }
    });

    res.json({
      success: true,
      messagesMarkedAsRead: result.count,
      message: `${result.count} poruka označeno kao pročitano`
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/chat/rooms/:roomId/audit-logs
 * Dohvati audit logove za chat room
 */
r.get('/rooms/:roomId/audit-logs', auth(true), async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { getRoomAuditLogs } = await import('../services/audit-log-service.js');
    const auditLogs = await getRoomAuditLogs(roomId, parseInt(limit), parseInt(offset));

    res.json(auditLogs);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/chat/messages/:messageId/audit-logs
 * Dohvati audit logove za poruku
 */
r.get('/messages/:messageId/audit-logs', auth(true), async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user has access to this message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        room: {
          include: {
            participants: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const isParticipant = message.room.participants.some(p => p.id === req.user.id);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { getMessageAuditLogs } = await import('../services/audit-log-service.js');
    const auditLogs = await getMessageAuditLogs(messageId, parseInt(limit), parseInt(offset));

    res.json(auditLogs);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/chat/rooms/:roomId/lock
 * Zaključaj thread (samo za sudionike)
 */
r.post('/rooms/:roomId/lock', auth(true), async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { reason = 'MANUAL' } = req.body;

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { lockThread } = await import('../services/thread-locking-service.js');
    const lockedRoom = await lockThread(roomId, reason, req.user.id, null);

    res.json({
      success: true,
      room: lockedRoom,
      message: 'Thread zaključan'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/chat/rooms/:roomId/unlock
 * Otključaj thread (samo za sudionike)
 */
r.post('/rooms/:roomId/unlock', auth(true), async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { unlockThread } = await import('../services/thread-locking-service.js');
    const unlockedRoom = await unlockThread(roomId, req.user.id);

    res.json({
      success: true,
      room: unlockedRoom,
      message: 'Thread otključan'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/chat/rooms/:roomId/temporarily-unlock
 * Privremeno otključaj thread (samo za sudionike)
 */
r.post('/rooms/:roomId/temporarily-unlock', auth(true), async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { durationMinutes = 60 } = req.body; // Default: 1 sat

    if (durationMinutes < 1 || durationMinutes > 1440) {
      return res.status(400).json({ error: 'Duration must be between 1 and 1440 minutes (24 hours)' });
    }

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { temporarilyUnlockThread } = await import('../services/thread-locking-service.js');
    const unlockedRoom = await temporarilyUnlockThread(roomId, durationMinutes, req.user.id);

    res.json({
      success: true,
      room: unlockedRoom,
      message: `Thread privremeno otključan na ${durationMinutes} minuta`
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/chat/rooms/:roomId/sla-status
 * Dohvati SLA status za chat room
 */
r.get('/rooms/:roomId/sla-status', auth(true), async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // Verify user has access to this room
    const room = await prisma.chatRoom.findFirst({
      where: {
        id: roomId,
        participants: {
          some: { id: req.user.id }
        }
      }
    });

    if (!room) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { getSLAStatusForRoom } = await import('../services/sla-reminder-service.js');
    const slaStatus = await getSLAStatusForRoom(roomId);

    if (!slaStatus) {
      return res.status(500).json({ error: 'Failed to fetch SLA status' });
    }

    res.json(slaStatus);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/chat/providers/:providerId/sla-status
 * Dohvati SLA status za providera
 */
r.get('/providers/:providerId/sla-status', auth(true), async (req, res, next) => {
  try {
    const { providerId } = req.params;

    // Provjeri da li je korisnik provider ili admin
    if (req.user.role !== 'ADMIN' && req.user.id !== providerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { getSLAStatusForProvider } = await import('../services/sla-reminder-service.js');
    const slaStatus = await getSLAStatusForProvider(providerId);

    if (!slaStatus) {
      return res.status(500).json({ error: 'Failed to fetch SLA status' });
    }

    res.json(slaStatus);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/chat/messages/:messageId/report
 * Prijavi poruku za moderaciju
 */
r.post('/messages/:messageId/report', auth(true), async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { reason } = req.body;

    const { reportMessage } = await import('../services/message-moderation-service.js');
    const reportedMessage = await reportMessage(messageId, req.user.id, reason);

    res.json({
      success: true,
      message: reportedMessage,
      info: 'Poruka je prijavljena za moderaciju'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/chat/moderation/pending
 * Dohvati poruke koje čekaju moderaciju (samo admin)
 */
r.get('/moderation/pending', auth(true), async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can view pending moderation' });
    }

    const { limit = 50, offset = 0 } = req.query;
    const { getPendingModerationMessages } = await import('../services/message-moderation-service.js');
    const messages = await getPendingModerationMessages(parseInt(limit), parseInt(offset));

    res.json(messages);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/chat/moderation/stats
 * Dohvati statistiku moderacije (samo admin)
 */
r.get('/moderation/stats', auth(true), async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can view moderation stats' });
    }

    const { getModerationStats } = await import('../services/message-moderation-service.js');
    const stats = await getModerationStats();

    res.json(stats);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/chat/messages/:messageId/approve
 * Odobri poruku (samo admin)
 */
r.post('/messages/:messageId/approve', auth(true), async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can approve messages' });
    }

    const { messageId } = req.params;
    const { notes } = req.body;

    const { approveMessage } = await import('../services/message-moderation-service.js');
    const approvedMessage = await approveMessage(messageId, req.user.id, notes);

    res.json({
      success: true,
      message: approvedMessage
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/chat/messages/:messageId/reject
 * Odbij poruku (samo admin)
 */
r.post('/messages/:messageId/reject', auth(true), async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can reject messages' });
    }

    const { messageId } = req.params;
    const { rejectionReason, notes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const { rejectMessage } = await import('../services/message-moderation-service.js');
    const rejectedMessage = await rejectMessage(messageId, req.user.id, rejectionReason, notes);

    res.json({
      success: true,
      message: rejectedMessage
    });
  } catch (e) {
    next(e);
  }
});

export default r;

