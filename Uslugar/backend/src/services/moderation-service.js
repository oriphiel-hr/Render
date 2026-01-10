// Content Moderation Service - Moderacija sadržaja
import { prisma } from '../lib/prisma.js';
import { notifyClient } from '../lib/notifications.js';

/**
 * Odobri ili odbij sadržaj
 * @param {string} contentType - 'job', 'review', 'offer', 'message'
 * @param {string} contentId - ID sadržaja
 * @param {string} adminId - ID admina koji moderira
 * @param {boolean} approved - true za odobravanje, false za odbijanje
 * @param {string} reason - Razlog odbijanja (opcionalno)
 * @param {string} notes - Bilješke (opcionalno)
 * @returns {Promise<object>} Ažurirani sadržaj
 */
export async function moderateContent(contentType, contentId, adminId, approved, reason = null, notes = null) {
  try {
    const now = new Date();
    const moderationStatus = approved ? 'APPROVED' : 'REJECTED';
    
    let updatedContent;
    let userId = null;
    let contentTitle = '';
    
    switch (contentType) {
      case 'job':
        const job = await prisma.job.findUnique({
          where: { id: contentId },
          include: { user: { select: { id: true, fullName: true } } }
        });
        
        if (!job) throw new Error('Job not found');
        
        userId = job.userId;
        contentTitle = job.title;
        
        updatedContent = await prisma.job.update({
          where: { id: contentId },
          data: {
            moderationStatus,
            moderationReviewedBy: adminId,
            moderationReviewedAt: now,
            moderationRejectionReason: approved ? null : reason,
            moderationNotes: notes,
            // Ako je odobren, posao se može vidjeti, ako je odbijen, skriva se
            status: approved ? job.status : 'CANCELLED'
          }
        });
        break;
        
      case 'review':
        const review = await prisma.review.findUnique({
          where: { id: contentId },
          include: {
            from: { select: { id: true, fullName: true } },
            job: { select: { title: true } }
          }
        });
        
        if (!review) throw new Error('Review not found');
        
        userId = review.fromUserId;
        contentTitle = `Recenzija za posao: ${review.job.title}`;
        
        updatedContent = await prisma.review.update({
          where: { id: contentId },
          data: {
            moderationStatus,
            moderationReviewedBy: adminId,
            moderationReviewedAt: now,
            moderationRejectionReason: approved ? null : reason,
            moderationNotes: notes
          }
        });
        break;
        
      case 'offer':
        const offer = await prisma.offer.findUnique({
          where: { id: contentId },
          include: {
            user: { select: { id: true, fullName: true } },
            job: { select: { title: true } }
          }
        });
        
        if (!offer) throw new Error('Offer not found');
        
        userId = offer.userId;
        contentTitle = `Ponuda za posao: ${offer.job.title}`;
        
        updatedContent = await prisma.offer.update({
          where: { id: contentId },
          data: {
            moderationStatus,
            moderationReviewedBy: adminId,
            moderationReviewedAt: now,
            moderationRejectionReason: approved ? null : reason,
            moderationNotes: notes,
            // Ako je odbijen, automatski postavi status na REJECTED
            status: approved ? offer.status : 'REJECTED'
          }
        });
        break;
        
      case 'message':
        const message = await prisma.chatMessage.findUnique({
          where: { id: contentId },
          include: {
            sender: { select: { id: true, fullName: true } }
          }
        });
        
        if (!message) throw new Error('Message not found');
        
        userId = message.senderId;
        contentTitle = 'Chat poruka';
        
        updatedContent = await prisma.chatMessage.update({
          where: { id: contentId },
          data: {
            moderationStatus,
            moderationReviewedBy: adminId,
            moderationReviewedAt: now,
            moderationRejectionReason: approved ? null : reason,
            moderationNotes: notes
            // Poruke se ne brišu, samo se označavaju
          }
        });
        break;
        
      default:
        throw new Error(`Invalid content type: ${contentType}`);
    }
    
    // Pošalji notifikaciju korisniku
    if (userId) {
      await notifyClient(userId, {
        title: approved ? 'Sadržaj odobren' : 'Sadržaj odbijen',
        message: approved
          ? `Vaš sadržaj "${contentTitle}" je odobren i sada je vidljiv na platformi.`
          : `Vaš sadržaj "${contentTitle}" je odbijen. Razlog: ${reason || 'Krši pravila platforme'}`,
        type: approved ? 'INFO' : 'WARNING'
      });
    }
    
    return updatedContent;
  } catch (error) {
    console.error('[Moderation Service] Error moderating content:', error);
    throw error;
  }
}

/**
 * Dohvati sadržaj koji čeka moderaciju
 * @param {string} contentType - 'job', 'review', 'offer', 'message', ili 'all'
 * @param {number} limit - Maksimalan broj rezultata
 * @param {number} offset - Offset za paginaciju
 * @returns {Promise<object>} Lista sadržaja za moderaciju
 */
export async function getPendingModeration(contentType = 'all', limit = 50, offset = 0) {
  try {
    const results = {};
    
    if (contentType === 'all' || contentType === 'job') {
      const jobs = await prisma.job.findMany({
        where: { moderationStatus: 'PENDING' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          category: {
            select: {
              name: true,
              icon: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset
      });
      
      results.jobs = jobs;
    }
    
    if (contentType === 'all' || contentType === 'review') {
      const reviews = await prisma.review.findMany({
        where: { moderationStatus: 'PENDING' },
        include: {
          from: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          to: {
            select: {
              id: true,
              fullName: true
            }
          },
          job: {
            select: {
              title: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset
      });
      
      results.reviews = reviews;
    }
    
    if (contentType === 'all' || contentType === 'offer') {
      const offers = await prisma.offer.findMany({
        where: { moderationStatus: 'PENDING' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          job: {
            select: {
              title: true,
              userId: true,
              user: {
                select: {
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset
      });
      
      results.offers = offers;
    }
    
    if (contentType === 'all' || contentType === 'message') {
      const messages = await prisma.chatMessage.findMany({
        where: { 
          moderationStatus: 'PENDING'
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
            select: {
              id: true,
              name: true,
              job: {
                select: {
                  title: true
                }
              }
            }
          }
        },
        orderBy: { moderationReportedAt: 'asc' },
        take: limit,
        skip: offset
      });
      
      results.messages = messages;
    }
    
    // Izračunaj statistike
    const stats = await getModerationStats();
    
    return {
      content: results,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: Object.values(results).some(arr => arr.length === limit)
      }
    };
  } catch (error) {
    console.error('[Moderation Service] Error fetching pending moderation:', error);
    throw error;
  }
}

/**
 * Dohvati statistike moderacije
 * @returns {Promise<object>} Statistike
 */
export async function getModerationStats() {
  try {
    const [
      pendingJobs,
      approvedJobs,
      rejectedJobs,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      pendingOffers,
      approvedOffers,
      rejectedOffers,
      pendingMessages,
      approvedMessages,
      rejectedMessages
    ] = await Promise.all([
      prisma.job.count({ where: { moderationStatus: 'PENDING' } }),
      prisma.job.count({ where: { moderationStatus: 'APPROVED' } }),
      prisma.job.count({ where: { moderationStatus: 'REJECTED' } }),
      prisma.review.count({ where: { moderationStatus: 'PENDING' } }),
      prisma.review.count({ where: { moderationStatus: 'APPROVED' } }),
      prisma.review.count({ where: { moderationStatus: 'REJECTED' } }),
      prisma.offer.count({ where: { moderationStatus: 'PENDING' } }),
      prisma.offer.count({ where: { moderationStatus: 'APPROVED' } }),
      prisma.offer.count({ where: { moderationStatus: 'REJECTED' } }),
      prisma.chatMessage.count({ where: { moderationStatus: 'PENDING' } }),
      prisma.chatMessage.count({ where: { moderationStatus: 'APPROVED' } }),
      prisma.chatMessage.count({ where: { moderationStatus: 'REJECTED' } })
    ]);
    
    return {
      jobs: {
        pending: pendingJobs,
        approved: approvedJobs,
        rejected: rejectedJobs,
        total: pendingJobs + approvedJobs + rejectedJobs
      },
      reviews: {
        pending: pendingReviews,
        approved: approvedReviews,
        rejected: rejectedReviews,
        total: pendingReviews + approvedReviews + rejectedReviews
      },
      offers: {
        pending: pendingOffers,
        approved: approvedOffers,
        rejected: rejectedOffers,
        total: pendingOffers + approvedOffers + rejectedOffers
      },
      messages: {
        pending: pendingMessages,
        approved: approvedMessages,
        rejected: rejectedMessages,
        total: pendingMessages + approvedMessages + rejectedMessages
      },
      totals: {
        pending: pendingJobs + pendingReviews + pendingOffers + pendingMessages,
        approved: approvedJobs + approvedReviews + approvedOffers + approvedMessages,
        rejected: rejectedJobs + rejectedReviews + rejectedOffers + rejectedMessages
      }
    };
  } catch (error) {
    console.error('[Moderation Service] Error fetching moderation stats:', error);
    throw error;
  }
}

/**
 * Prijavi chat poruku za moderaciju
 * @param {string} messageId - ID poruke
 * @param {string} reportedBy - ID korisnika koji prijavljuje
 * @param {string} reason - Razlog prijave
 * @returns {Promise<object>} Ažurirana poruka
 */
export async function reportMessage(messageId, reportedBy, reason) {
  try {
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });
    
    if (!message) throw new Error('Message not found');
    
    // Ažuriraj poruku
    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        moderationStatus: 'PENDING',
        moderationReportedBy: reportedBy,
        moderationReportedAt: new Date(),
        moderationNotes: reason ? `Prijavljeno: ${reason}` : null
      }
    });
    
    // Notificiraj admine (opcionalno - možemo dodati admin notifikacije)
    
    return updated;
  } catch (error) {
    console.error('[Moderation Service] Error reporting message:', error);
    throw error;
  }
}

