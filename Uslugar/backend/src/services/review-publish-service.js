/**
 * Review Publish Service - Automatska objava review-a nakon isteka roka
 * 
 * Provjerava review-e koji nisu objavljeni i čiji je rok istekao,
 * te ih automatski objavljuje (reciprocal delay mehanizam)
 */

import { prisma } from '../lib/prisma.js';

/**
 * Provjerava i objavljuje review-e čiji je rok istekao
 * @returns {Promise<Object>} - Statistika objavljenih review-a
 */
export async function publishExpiredReviews() {
  try {
    const now = new Date();
    
    // Pronađi sve review-e koji nisu objavljeni i čiji je rok istekao
    const expiredReviews = await prisma.review.findMany({
      where: {
        isPublished: false,
        reviewDeadline: {
          lte: now // Rok je istekao
        }
      },
      include: {
        job: {
          select: {
            id: true,
            userId: true,
            assignedProviderId: true
          }
        }
      }
    });

    let publishedCount = 0;
    let errorCount = 0;

    for (const review of expiredReviews) {
      try {
        // Objavi review
        await prisma.review.update({
          where: { id: review.id },
          data: {
            isPublished: true,
            publishedAt: now
          }
        });

        publishedCount++;
        console.log(`[REVIEW_PUBLISH] Published expired review ${review.id} for job ${review.jobId}`);

        // Ažuriraj aggregate samo za provider profile
        const toUser = await prisma.user.findUnique({ 
          where: { id: review.toUserId },
          select: { role: true }
        });

        if (toUser?.role === 'PROVIDER') {
          const aggr = await prisma.review.aggregate({
            where: { 
              toUserId: review.toUserId,
              isPublished: true // Samo objavljene review-e
            },
            _avg: { rating: true },
            _count: { rating: true }
          });

          await prisma.providerProfile.updateMany({
            where: { userId: review.toUserId },
            data: { 
              ratingAvg: aggr._avg.rating || 0, 
              ratingCount: aggr._count.rating 
            }
          });
        }
      } catch (error) {
        console.error(`[REVIEW_PUBLISH] Error publishing review ${review.id}:`, error);
        errorCount++;
      }
    }

    console.log(`[REVIEW_PUBLISH] Published ${publishedCount} expired reviews, ${errorCount} errors`);

    return {
      published: publishedCount,
      errors: errorCount,
      total: expiredReviews.length
    };
  } catch (error) {
    console.error('[REVIEW_PUBLISH] Error in publishExpiredReviews:', error);
    throw error;
  }
}

