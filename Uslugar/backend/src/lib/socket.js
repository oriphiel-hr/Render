import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join room
    socket.on('join-room', async (roomId) => {
      try {
        // Verify user has access to this room
        const room = await prisma.chatRoom.findFirst({
          where: {
            id: roomId,
            participants: {
              some: { id: socket.userId }
            }
          }
        });

        if (!room) {
          socket.emit('error', 'Access denied to this room');
          return;
        }

        socket.join(roomId);
        console.log(`User ${socket.userId} joined room ${roomId}`);

        // Automatski označi sve poruke koje nisu od trenutnog korisnika kao READ
        // jer korisnik je upravo otvorio chat (znači da ih vidi)
        const now = new Date();
        await prisma.chatMessage.updateMany({
          where: {
            roomId,
            senderId: { not: socket.userId },
            status: { not: 'READ' }
          },
          data: {
            status: 'READ',
            readAt: now
          }
        });

        // Provjeri je li korisnik admin
        const user = await prisma.user.findUnique({
          where: { id: socket.userId },
          select: { role: true }
        });

        // Load chat history
        const messages = await prisma.chatMessage.findMany({
          where: { 
            roomId,
            // Filtriraj odbijene poruke (osim ako je admin)
            moderationStatus: user && user.role === 'ADMIN' 
              ? undefined 
              : { not: 'REJECTED' }
          },
          include: {
            sender: {
              select: { id: true, fullName: true, email: true }
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
          orderBy: { createdAt: 'asc' },
          take: 50 // Last 50 messages
        });

        socket.emit('chat-history', messages);

        // Broadcast da su poruke označene kao pročitane (za real-time update)
        io.to(roomId).emit('messages-read', {
          roomId,
          readBy: socket.userId,
          readAt: now
        });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', 'Failed to join room');
      }
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { roomId, content = '', attachments = [] } = data;

        // Validate: mora biti ili content ili attachments
        if (!content.trim() && (!attachments || attachments.length === 0)) {
          socket.emit('error', 'Message must have content or attachments');
          return;
        }

        // Verify user has access to this room
        const room = await prisma.chatRoom.findFirst({
          where: {
            id: roomId,
            participants: {
              some: { id: socket.userId }
            }
          }
        });

        if (!room) {
          socket.emit('error', 'Access denied to this room');
          return;
        }

        // Provjeri je li thread zaključan
        const { isThreadLocked } = await import('../services/thread-locking-service.js');
        const lockStatus = await isThreadLocked(roomId);
        if (lockStatus.isLocked) {
          socket.emit('error', 'Thread is locked and cannot accept new messages');
          return;
        }

        // Automatska moderacija poruke
        let moderationStatus = null;
        let moderationNotes = null;
        
        try {
          const { autoModerateMessage } = await import('../services/message-moderation-service.js');
          const moderationResult = await autoModerateMessage(
            content.trim() || '',
            roomId,
            socket.userId
          );

          if (!moderationResult.isApproved) {
            moderationStatus = 'PENDING';
            moderationNotes = moderationResult.reason;
          }
        } catch (modError) {
          console.error('Error in auto-moderation:', modError);
          // Ne blokiraj poruku ako moderacija ne uspije
        }

        // Save message to database
        const message = await prisma.chatMessage.create({
          data: {
            content: content.trim() || '', // Može biti prazan ako su samo slike
            attachments: Array.isArray(attachments) ? attachments : [],
            senderId: socket.userId,
            roomId,
            moderationStatus: moderationStatus || null,
            moderationNotes: moderationNotes || null
          },
          include: {
            sender: {
              select: { id: true, fullName: true, email: true }
            }
          }
        });

        // Track TRIAL engagement - chat message sent
        try {
          const { trackChatMessage } = await import('../services/trial-engagement-service.js');
          await trackChatMessage(socket.userId, roomId);
        } catch (engagementError) {
          console.error('[SOCKET] Error tracking TRIAL engagement:', engagementError);
          // Ne baci grešku - engagement tracking ne smije blokirati slanje poruke
        }
        
        // Chat-bot trigger - SEND_MESSAGE
        try {
          const { advanceChatbotStep } = await import('../services/chatbot-service.js');
          await advanceChatbotStep(socket.userId, 'SEND_MESSAGE');
        } catch (chatbotError) {
          console.error('[SOCKET] Error advancing chatbot:', chatbotError);
        }

        // Update thread activity
        const { updateThreadActivity } = await import('../services/thread-locking-service.js');
        await updateThreadActivity(roomId);

        // Kreiraj SLA tracking ako poruka nije od samog sebe
        try {
          const { createSLATracking } = await import('../services/sla-reminder-service.js');
          const sender = await prisma.user.findUnique({
            where: { id: socket.userId },
            select: { role: true }
          });
          
          // Ako je poruka od korisnika (USER), kreiraj SLA tracking za providere
          if (sender && sender.role === 'USER') {
            await createSLATracking(message.id, roomId, 240); // 4 sata SLA
          }
        } catch (slaError) {
          console.error('Error creating SLA tracking:', slaError);
        }

        // Provjeri je li ovo odgovor na postojeću poruku i označi je kao odgovorenu
        try {
          const { markMessageAsResponded } = await import('../services/sla-reminder-service.js');
          // Pronađi zadnju poruku u roomu koja nije od trenutnog korisnika i nije odgovorena
          const lastUnansweredSLA = await prisma.messageSLA.findFirst({
            where: {
              roomId,
              respondedAt: null,
              message: {
                senderId: { not: socket.userId }
              }
            },
            include: {
              message: true
            },
            orderBy: {
              message: {
                createdAt: 'desc'
              }
            }
          });

          if (lastUnansweredSLA && lastUnansweredSLA.message) {
            await markMessageAsResponded(lastUnansweredSLA.message.id, message.id);
          }
        } catch (slaError) {
          console.error('Error marking message as responded:', slaError);
        }

        // Broadcast to room
        io.to(roomId).emit('new-message', message);

        // Automatski označi poruke kao DELIVERED kada se broadcast-aju (opcionalno)
        // Status će biti READ kada korisnik otvori chat ili dohvati poruke

        // Create notification for other participants
        const otherParticipants = await prisma.chatRoom.findUnique({
          where: { id: roomId },
          include: {
            participants: {
              where: {
                id: { not: socket.userId }
              },
              select: { id: true }
            }
          }
        });

        for (const participant of otherParticipants.participants) {
          await prisma.notification.create({
            data: {
              title: 'Nova poruka',
              message: `Imate novu poruku u chatu`,
              type: 'SYSTEM',
              userId: participant.id
            }
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Typing indicator
    socket.on('typing', (roomId) => {
      socket.to(roomId).emit('user-typing', { userId: socket.userId });
    });

    socket.on('stop-typing', (roomId) => {
      socket.to(roomId).emit('user-stop-typing', { userId: socket.userId });
    });

    // Edit message (with versioning)
    socket.on('edit-message', async (data) => {
      try {
        const { roomId, messageId, content, attachments, reason } = data;

        // Validate: mora biti ili content ili attachments
        if (content === undefined && attachments === undefined) {
          socket.emit('error', 'Missing content or attachments');
          return;
        }

        // Verify user has access to this room
        const room = await prisma.chatRoom.findFirst({
          where: {
            id: roomId,
            participants: {
              some: { id: socket.userId }
            }
          }
        });

        if (!room) {
          socket.emit('error', 'Access denied to this room');
          return;
        }

        // Provjeri je li thread zaključan
        const { isThreadLocked } = await import('../services/thread-locking-service.js');
        const lockStatus = await isThreadLocked(roomId);
        if (lockStatus.isLocked) {
          socket.emit('error', 'Thread is locked and cannot be edited');
          return;
        }

        // Uredi poruku (kreira novu verziju)
        const { editMessage } = await import('../services/message-versioning.js');
        const updatedMessage = await editMessage(
          messageId,
          socket.userId,
          content !== undefined ? content.trim() : undefined,
          attachments !== undefined ? (Array.isArray(attachments) ? attachments : []) : null,
          reason || null
        );

        // Update thread activity
        const { updateThreadActivity } = await import('../services/thread-locking-service.js');
        await updateThreadActivity(roomId);

        // Broadcast updated message to room
        io.to(roomId).emit('message-edited', updatedMessage);
      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', error.message || 'Failed to edit message');
      }
    });

    // Leave room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.userId} left room ${roomId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

