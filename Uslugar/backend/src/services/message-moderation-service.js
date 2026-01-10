/**
 * USLUGAR EXCLUSIVE - Message Moderation Service
 * 
 * Automatska i ručna moderacija chat poruka
 * Filtrira neprikladan sadržaj, dijeljenje kontakata i omogućuje prijave
 */

import { prisma } from '../lib/prisma.js';
import { ModerationStatus } from '@prisma/client';

// Zabranjene riječi i fraze (može se proširiti s AI servisom)
const FORBIDDEN_WORDS = [
  // Uvredljive riječi (primjer - treba se proširiti)
  'hack', 'scam', 'fraud'
];

// Regex za detekciju kontakata
const PHONE_REGEX = /(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Automatska provjera poruke za neprikladan sadržaj
 * @param {String} content - Sadržaj poruke
 * @param {String} roomId - ID chat rooma
 * @param {String} senderId - ID pošiljatelja
 * @returns {Object} - { isApproved: boolean, reason: string, flaggedWords: string[] }
 */
export async function autoModerateMessage(content, roomId, senderId) {
  try {
    const lowerContent = content.toLowerCase();
    const flaggedWords = [];
    let reason = null;

    // Provjeri zabranjene riječi
    for (const word of FORBIDDEN_WORDS) {
      if (lowerContent.includes(word.toLowerCase())) {
        flaggedWords.push(word);
      }
    }

    if (flaggedWords.length > 0) {
      reason = `Sadržaj sadrži neprikladne riječi: ${flaggedWords.join(', ')}`;
    }

    // Provjeri dijeljenje kontakata
    const hasPhone = PHONE_REGEX.test(content);
    const hasEmail = EMAIL_REGEX.test(content);

    if (hasPhone || hasEmail) {
      // Provjeri je li ponuda prihvaćena
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: {
          job: {
            include: {
              offers: {
                where: { status: 'ACCEPTED' },
                take: 1
              }
            }
          }
        }
      });

      if (room && room.job) {
        const hasAcceptedOffer = room.job.offers && room.job.offers.length > 0;
        
        if (!hasAcceptedOffer) {
          reason = reason 
            ? `${reason}. Dijeljenje kontakata prije prihvata ponude nije dozvoljeno.`
            : 'Dijeljenje kontakata prije prihvata ponude nije dozvoljeno.';
        }
      } else {
        // Ako nema job-a, provjeri je li INTERNAL chat
        // U INTERNAL chatu dijeljenje kontakata je dozvoljeno
        if (room && !room.jobId) {
          // INTERNAL chat - dozvoljeno
        } else {
          reason = reason 
            ? `${reason}. Dijeljenje kontakata nije dozvoljeno.`
            : 'Dijeljenje kontakata nije dozvoljeno.';
        }
      }
    }

    // Ako ima razlog, poruka treba moderaciju
    if (reason) {
      return {
        isApproved: false,
        reason,
        flaggedWords,
        hasContactInfo: hasPhone || hasEmail
      };
    }

    return {
      isApproved: true,
      reason: null,
      flaggedWords: [],
      hasContactInfo: false
    };
  } catch (error) {
    console.error('[MODERATION ERROR] Failed to auto-moderate message:', error);
    // U slučaju greške, odobri poruku (ne blokiraj komunikaciju)
    return {
      isApproved: true,
      reason: null,
      flaggedWords: [],
      hasContactInfo: false
    };
  }
}

/**
 * Prijavi poruku za moderaciju
 * @param {String} messageId - ID poruke
 * @param {String} reportedById - ID korisnika koji prijavljuje
 * @param {String} reason - Razlog prijave
 * @returns {Object} - Ažurirana poruka
 */
export async function reportMessage(messageId, reportedById, reason) {
  try {
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    if (!message) {
      throw new Error('Message not found');
    }

    // Ne dozvoli prijavu vlastite poruke
    if (message.senderId === reportedById) {
      throw new Error('Cannot report your own message');
    }

    // Ažuriraj poruku s prijavom
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        moderationStatus: ModerationStatus.PENDING,
        moderationReportedBy: reportedById,
        moderationReportedAt: new Date(),
        moderationNotes: reason || 'Poruka prijavljena za moderaciju'
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

    // Obavijesti admine o novoj prijavi
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            title: 'Nova prijava poruke',
            message: `Poruka od ${message.sender.fullName} je prijavljena za moderaciju.`,
            type: 'MODERATION_REPORT',
            userId: admin.id
          }
        });
      }
    } catch (notifError) {
      console.error('[MODERATION] Failed to notify admins:', notifError);
    }

    console.log(`[MODERATION] Message ${messageId} reported by ${reportedById}`);
    return updatedMessage;
  } catch (error) {
    console.error('[MODERATION ERROR] Failed to report message:', error);
    throw error;
  }
}

/**
 * Odobri poruku (admin)
 * @param {String} messageId - ID poruke
 * @param {String} reviewedById - ID admina koji odobrava
 * @param {String} notes - Bilješke
 * @returns {Object} - Ažurirana poruka
 */
export async function approveMessage(messageId, reviewedById, notes = null) {
  try {
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewedById },
      select: { role: true }
    });

    if (!reviewer || reviewer.role !== 'ADMIN') {
      throw new Error('Only admins can approve messages');
    }

    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        moderationStatus: ModerationStatus.APPROVED,
        moderationReviewedBy: reviewedById,
        moderationReviewedAt: new Date(),
        moderationNotes: notes || 'Poruka odobrena'
      }
    });

    console.log(`[MODERATION] Message ${messageId} approved by ${reviewedById}`);
    return updatedMessage;
  } catch (error) {
    console.error('[MODERATION ERROR] Failed to approve message:', error);
    throw error;
  }
}

/**
 * Odbij poruku (admin)
 * @param {String} messageId - ID poruke
 * @param {String} reviewedById - ID admina koji odbija
 * @param {String} rejectionReason - Razlog odbijanja
 * @param {String} notes - Bilješke
 * @returns {Object} - Ažurirana poruka
 */
export async function rejectMessage(messageId, reviewedById, rejectionReason, notes = null) {
  try {
    const reviewer = await prisma.user.findUnique({
      where: { id: reviewedById },
      select: { role: true }
    });

    if (!reviewer || reviewer.role !== 'ADMIN') {
      throw new Error('Only admins can reject messages');
    }

    if (!rejectionReason) {
      throw new Error('Rejection reason is required');
    }

    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        moderationStatus: ModerationStatus.REJECTED,
        moderationReviewedBy: reviewedById,
        moderationReviewedAt: new Date(),
        moderationRejectionReason: rejectionReason,
        moderationNotes: notes || 'Poruka odbijena'
      }
    });

    // Obavijesti pošiljatelja o odbijanju
    try {
      await prisma.notification.create({
        data: {
          title: 'Poruka odbijena',
          message: `Vaša poruka je odbijena: ${rejectionReason}`,
          type: 'MESSAGE_REJECTED',
          userId: updatedMessage.senderId
        }
      });
    } catch (notifError) {
      console.error('[MODERATION] Failed to notify sender:', notifError);
    }

    console.log(`[MODERATION] Message ${messageId} rejected by ${reviewedById}`);
    return updatedMessage;
  } catch (error) {
    console.error('[MODERATION ERROR] Failed to reject message:', error);
    throw error;
  }
}

/**
 * Dohvati poruke koje čekaju moderaciju
 * @param {Number} limit - Broj poruka
 * @param {Number} offset - Offset
 * @returns {Array} - Lista poruka
 */
export async function getPendingModerationMessages(limit = 50, offset = 0) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        moderationStatus: ModerationStatus.PENDING
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        room: {
          include: {
            job: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        moderationReportedAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    return messages;
  } catch (error) {
    console.error('[MODERATION ERROR] Failed to get pending messages:', error);
    return [];
  }
}

/**
 * Dohvati statistiku moderacije
 * @returns {Object} - Statistika
 */
export async function getModerationStats() {
  try {
    const total = await prisma.chatMessage.count({
      where: {
        moderationStatus: { not: null }
      }
    });

    const pending = await prisma.chatMessage.count({
      where: {
        moderationStatus: ModerationStatus.PENDING
      }
    });

    const approved = await prisma.chatMessage.count({
      where: {
        moderationStatus: ModerationStatus.APPROVED
      }
    });

    const rejected = await prisma.chatMessage.count({
      where: {
        moderationStatus: ModerationStatus.REJECTED
      }
    });

    return {
      total,
      pending,
      approved,
      rejected
    };
  } catch (error) {
    console.error('[MODERATION ERROR] Failed to get stats:', error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };
  }
}

