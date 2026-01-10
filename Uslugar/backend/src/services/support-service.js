// Support Ticket Service - USLUGAR EXCLUSIVE
import { prisma } from '../lib/prisma.js';

/**
 * Kreiraj support ticket
 * @param {String} userId - ID korisnika
 * @param {String} subject - Naslov
 * @param {String} message - Poruka
 * @param {String} priority - NORMAL, HIGH, URGENT (premium/PRO dobiva HIGH/URGENT)
 * @param {String} category - BILLING, TECHNICAL, REFUND, OTHER
 * @returns {Object} - Kreirani ticket
 */
export async function createSupportTicket(userId, subject, message, priority = 'NORMAL', category = 'OTHER') {
  try {
    // Provjeri plan korisnika za prioritet
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });
    
    // Automatski povišaj prioritet za PREMIUM/PRO
    if (subscription?.plan === 'PRO') {
      priority = 'URGENT'; // VIP podrška
    } else if (subscription?.plan === 'PREMIUM') {
      priority = 'HIGH'; // Prioritetna podrška
    }
    
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message,
        priority,
        category,
        status: 'OPEN'
      }
    });
    
    console.log(`📧 Support ticket kreiran: ${ticket.id}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   User: ${userId}`);
    console.log(`   Priority: ${priority} (plan: ${subscription?.plan || 'NONE'})`);
    
    // TODO: Send email to support team
    // await sendTicketToSupportTeam(ticket);
    
    return ticket;
    
  } catch (error) {
    console.error('❌ Error creating support ticket:', error);
    throw new Error('Failed to create support ticket');
  }
}

/**
 * Dohvati support ticket-e za korisnika
 * @param {String} userId - ID korisnika
 * @returns {Array} - Lista ticket-a
 */
export async function getMySupportTickets(userId) {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    return tickets;
  } catch (error) {
    console.error('❌ Error fetching support tickets:', error);
    return [];
  }
}

/**
 * Dohvati support ticket
 * @param {String} ticketId - ID ticket-a
 * @returns {Object} - Ticket
 */
export async function getSupportTicket(ticketId, userId) {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });
    
    if (!ticket || ticket.userId !== userId) {
      throw new Error('Ticket not found');
    }
    
    return ticket;
  } catch (error) {
    console.error('❌ Error fetching support ticket:', error);
    throw new Error('Failed to get support ticket');
  }
}

/**
 * Označi ticket kao resolved
 * @param {String} ticketId - ID ticket-a
 * @param {String} userId - ID korisnika (verification)
 * @returns {Object} - Ažurirani ticket
 */
export async function resolveTicket(ticketId, userId) {
  try {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date()
      }
    });
    
    console.log(`✅ Support ticket resolved: ${ticketId}`);
    
    return ticket;
  } catch (error) {
    throw new Error('Failed to resolve ticket');
  }
}

/**
 * Dodaj napomenu na ticket (samo za admin)
 * @param {String} ticketId - ID ticket-a
 * @param {String} notes - Napomena
 * @returns {Object} - Ažurirani ticket
 */
export async function addTicketNote(ticketId, notes) {
  try {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        notes: notes
      }
    });
    
    return ticket;
  } catch (error) {
    throw new Error('Failed to add note');
  }
}

/**
 * Kreiraj ili dohvati support chat sobu za korisnika
 * @param {String} userId - ID korisnika
 * @returns {Object} - Chat room
 */
export async function getOrCreateSupportChatRoom(userId) {
  try {
    // Provjeri plan korisnika
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    // Samo PRO korisnici imaju pristup live chat podršci
    if (subscription?.plan !== 'PRO') {
      throw new Error('Live chat podrška dostupna samo za PRO korisnike');
    }

    // Pronađi postojeću support chat sobu
    let room = await prisma.chatRoom.findFirst({
      where: {
        participants: {
          some: { id: userId }
        },
        isSupportRoom: true,
        isLocked: false
      },
      include: {
        participants: true
      }
    });

    if (!room) {
      // Kreiraj novu support chat sobu
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      // Pronađi admin korisnika za support (prioritetno onog s najmanje aktivnih chat-ova)
      const admins = await prisma.user.findMany({
        where: { 
          role: 'ADMIN',
          isActive: true
        }
      });

      if (admins.length === 0) {
        throw new Error('Nema dostupnih support agenata');
      }

      // Pronađi agenta s najmanje aktivnih support chat-ova
      const adminsWithChatCounts = await Promise.all(
        admins.map(async (admin) => {
          const activeChats = await prisma.chatRoom.count({
            where: {
              isSupportRoom: true,
              isLocked: false,
              participants: {
                some: { id: admin.id }
              }
            }
          });
          return { ...admin, activeChats };
        })
      );

      // Odaberi agenta s najmanje aktivnih support chat-ova
      const agent = adminsWithChatCounts.reduce((min, current) => 
        current.activeChats < min.activeChats ? current : min
      );

      room = await prisma.chatRoom.create({
        data: {
          name: `Support Chat - ${user?.fullName || user?.email || 'Korisnik'}`,
          isSupportRoom: true,
          participants: {
            connect: [{ id: userId }, { id: agent.id }]
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

      console.log(`💬 Support chat room kreiran: ${room.id} za korisnika ${userId}`);
    }

    return room;
  } catch (error) {
    console.error('❌ Error getting support chat room:', error);
    throw error;
  }
}

/**
 * Provjeri dostupnost 24/7 support tima
 * @returns {Object} - Status dostupnosti
 */
export async function checkSupportAvailability() {
  try {
    // Provjeri da li ima aktivnih admin korisnika
    const activeAdmins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        isActive: true
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        lastLoginAt: true
      }
    });

    // Provjeri aktivne support chat sobe
    const activeSupportRooms = await prisma.chatRoom.count({
      where: {
        isSupportRoom: true,
        isLocked: false,
        messages: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Zadnja 24h
            }
          }
        }
      }
    });

    // Provjeri otvorene URGENT ticket-e
    const urgentTickets = await prisma.supportTicket.count({
      where: {
        priority: 'URGENT',
        status: { in: ['OPEN', 'IN_PROGRESS'] }
      }
    });

    const isAvailable = activeAdmins.length > 0;
    const averageResponseTime = urgentTickets > 0 ? '< 1h' : '< 15min';

    return {
      isAvailable,
      availableAgents: activeAdmins.length,
      activeSupportRooms,
      urgentTickets,
      averageResponseTime,
      status: isAvailable ? 'ONLINE' : 'OFFLINE',
      message: isAvailable 
        ? 'Support tim je dostupan 24/7' 
        : 'Support tim trenutno nije dostupan'
    };
  } catch (error) {
    console.error('❌ Error checking support availability:', error);
    return {
      isAvailable: false,
      availableAgents: 0,
      activeSupportRooms: 0,
      urgentTickets: 0,
      averageResponseTime: 'N/A',
      status: 'ERROR',
      message: 'Greška pri provjeri dostupnosti'
    };
  }
}

/**
 * Automatski dodijeli VIP ticket najdostupnijem agentu
 * @param {String} ticketId - ID ticket-a
 * @returns {Object} - Ažurirani ticket
 */
export async function assignTicketToAgent(ticketId) {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket || ticket.priority !== 'URGENT') {
      return ticket; // Samo URGENT ticket-e automatski dodjeljujemo
    }

    // Pronađi agenta s najmanje aktivnih ticket-a
    const agents = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        isActive: true
      }
    });

    if (agents.length === 0) {
      console.warn(`⚠️  Nema dostupnih agenata za ticket ${ticketId}`);
      return ticket;
    }

    // Pronađi agenta s najmanje aktivnih ticket-a
    const agentsWithTicketCounts = await Promise.all(
      agents.map(async (agent) => {
        const activeTickets = await prisma.supportTicket.count({
          where: {
            assignedTo: agent.id,
            status: { in: ['OPEN', 'IN_PROGRESS'] }
          }
        });
        return { ...agent, activeTickets };
      })
    );

    // Odaberi agenta s najmanje aktivnih ticket-a
    const agent = agentsWithTicketCounts.reduce((min, current) => 
      current.activeTickets < min.activeTickets ? current : min
    );

    // Dodijeli ticket agentu
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedTo: agent.id,
        status: 'IN_PROGRESS'
      }
    });

    console.log(`✅ Ticket ${ticketId} dodijeljen agentu ${agent.email}`);

    return updatedTicket;
  } catch (error) {
    console.error('❌ Error assigning ticket to agent:', error);
    throw error;
  }
}

export default {
  createSupportTicket,
  getMySupportTickets,
  getSupportTicket,
  resolveTicket,
  addTicketNote,
  getOrCreateSupportChatRoom,
  checkSupportAvailability,
  assignTicketToAgent
};

