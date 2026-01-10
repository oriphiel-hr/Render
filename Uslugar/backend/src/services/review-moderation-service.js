/**
 * Review Moderation Service - AI + Ljudska moderacija ocjena
 * 
 * Automatska AI provjera sadržaja recenzija (OpenAI Moderation API) i ljudska moderacija
 */

import { prisma } from '../lib/prisma.js';
import OpenAI from 'openai';

// Inicijaliziraj OpenAI klijent (ako je API key postavljen)
let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('[REVIEW_MODERATION] OpenAI Moderation API initialized');
  } else {
    console.warn('[REVIEW_MODERATION] OPENAI_API_KEY not set, using fallback moderation only');
  }
} catch (error) {
  console.error('[REVIEW_MODERATION] Error initializing OpenAI:', error);
}

// Zabranjene riječi i fraze (fallback ako OpenAI nije dostupan)
const FORBIDDEN_WORDS = [
  // Uvredljive riječi
  'kreten', 'idiot', 'glup', 'debil', 'retard',
  // Spam riječi
  'click here', 'buy now', 'free money', 'make money fast',
  // Reklamne fraze
  'visit my website', 'check out my', 'promo code', 'discount code'
];

// Regex za detekciju spam-a (linkovi, email-ovi, telefoni)
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g;

/**
 * OpenAI Moderation API provjera sadržaja
 * @param {String} text - Tekst za provjeru
 * @returns {Promise<Object>} - { flagged: boolean, categories: object, scores: object }
 */
async function checkWithOpenAI(text) {
  if (!openai || !text || text.trim().length === 0) {
    return null;
  }

  try {
    const response = await openai.moderations.create({
      input: text
    });

    const result = response.results[0];
    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores
    };
  } catch (error) {
    console.error('[REVIEW_MODERATION] OpenAI API error:', error.message);
    return null; // Fallback na osnovne provjere
  }
}

/**
 * AI automatska provjera sadržaja recenzije (OpenAI Moderation API + fallback provjere)
 * @param {String} comment - Tekst recenzije
 * @param {Number} rating - Ocjena (1-5)
 * @returns {Object} - { isApproved: boolean, reason: string, flaggedWords: string[], confidence: number, aiUsed: boolean }
 */
export async function autoModerateReview(comment, rating) {
  try {
    const lowerComment = (comment || '').toLowerCase();
    const flaggedWords = [];
    const reasons = [];
    let confidence = 1.0; // Početna pouzdanost (1.0 = 100%)
    let aiUsed = false;
    let aiResult = null;

    // 1. POKUŠAJ KORISTITI OPENAI MODERATION API (pravi AI)
    if (openai && comment && comment.trim().length > 0) {
      try {
        aiResult = await checkWithOpenAI(comment);
        if (aiResult) {
          aiUsed = true;
          console.log('[REVIEW_MODERATION] OpenAI moderation result:', {
            flagged: aiResult.flagged,
            categories: Object.keys(aiResult.categories).filter(k => aiResult.categories[k])
          });

          // Provjeri kategorije koje su flag-ane
          if (aiResult.flagged) {
            const flaggedCategories = Object.keys(aiResult.categories).filter(
              cat => aiResult.categories[cat]
            );
            
            // Provjeri ozbiljnost kategorija
            for (const category of flaggedCategories) {
              const score = aiResult.categoryScores[category] || 0;
              
              // Kategorije koje automatski odbijaju
              if (['hate', 'hate/threatening', 'self-harm', 'sexual/minors', 'violence/graphic'].includes(category)) {
                reasons.push(`AI detektirao neprikladan sadržaj: ${category} (score: ${(score * 100).toFixed(1)}%)`);
                confidence -= 0.8; // Velika smanjenje pouzdanosti
              }
              // Kategorije koje zahtijevaju ljudsku provjeru
              else if (['harassment', 'harassment/threatening', 'violence'].includes(category)) {
                reasons.push(`AI detektirao potencijalno problematičan sadržaj: ${category} (score: ${(score * 100).toFixed(1)}%)`);
                confidence -= 0.5;
              }
              // Manje ozbiljne kategorije
              else if (['sexual', 'self-harm/intent', 'self-harm/instructions'].includes(category)) {
                reasons.push(`AI detektirao upitni sadržaj: ${category} (score: ${(score * 100).toFixed(1)}%)`);
                confidence -= 0.3;
              }
            }
          }
        }
      } catch (aiError) {
        console.error('[REVIEW_MODERATION] OpenAI API error, falling back to basic checks:', aiError.message);
        // Nastavi s fallback provjerama
      }
    }

    // 2. FALLBACK: Provjeri zabranjene riječi (ako OpenAI nije dostupan ili nije flag-ao)
    if (!aiUsed || !aiResult?.flagged) {
      for (const word of FORBIDDEN_WORDS) {
        if (lowerComment.includes(word.toLowerCase())) {
          flaggedWords.push(word);
          reasons.push(`Sadržaj sadrži neprikladne riječi: ${word}`);
          confidence -= 0.3; // Smanji pouzdanost za 30%
        }
      }
    }

    // 3. Provjeri spam (linkovi, email-ovi, telefoni) - uvijek provjeravamo
    const hasUrl = URL_REGEX.test(comment || '');
    const hasEmail = EMAIL_REGEX.test(comment || '');
    const hasPhone = PHONE_REGEX.test(comment || '');

    if (hasUrl) {
      reasons.push('Sadržaj sadrži linkove (potencijalni spam)');
      confidence -= 0.4;
    }
    if (hasEmail) {
      reasons.push('Sadržaj sadrži email adrese (potencijalni spam)');
      confidence -= 0.3;
    }
    if (hasPhone) {
      reasons.push('Sadržaj sadrži telefonske brojeve (potencijalni spam)');
      confidence -= 0.2;
    }

    // 4. Provjeri ekstremne ocjene s kratkim komentarom (potencijalni spam)
    if (rating === 5 && (!comment || comment.trim().length < 10)) {
      reasons.push('Ekstremno pozitivna ocjena s kratkim komentarom (potencijalni spam)');
      confidence -= 0.2;
    }
    if (rating === 1 && (!comment || comment.trim().length < 10)) {
      reasons.push('Ekstremno negativna ocjena s kratkim komentarom (potencijalni spam)');
      confidence -= 0.2;
    }

    // 5. Provjeri duplicirane riječi (potencijalni spam)
    const words = (comment || '').split(/\s+/);
    const wordCount = {};
    for (const word of words) {
      const lowerWord = word.toLowerCase();
      wordCount[lowerWord] = (wordCount[lowerWord] || 0) + 1;
      if (wordCount[lowerWord] > 5 && word.length > 3) {
        reasons.push(`Previše ponavljanja riječi "${word}" (potencijalni spam)`);
        confidence -= 0.1;
        break;
      }
    }

    // 6. Provjeri minimalnu duljinu komentara (ako postoji)
    if (comment && comment.trim().length > 0 && comment.trim().length < 5) {
      reasons.push('Komentar je prekratak (minimalno 5 znakova)');
      confidence -= 0.1;
    }

    // 7. Provjeri maksimalnu duljinu komentara (potencijalni spam)
    if (comment && comment.length > 2000) {
      reasons.push('Komentar je predugačak (maksimalno 2000 znakova)');
      confidence -= 0.2;
    }

    // Ako je pouzdanost ispod 0.5, automatski odbij
    // Ako je pouzdanost između 0.5 i 0.7, zahtijevaj ljudsku moderaciju
    // Ako je pouzdanost iznad 0.7, automatski odobri
    const isApproved = confidence >= 0.7;
    const needsHumanReview = confidence >= 0.5 && confidence < 0.7;

    return {
      isApproved,
      needsHumanReview,
      reason: reasons.length > 0 ? reasons.join('; ') : null,
      flaggedWords,
      confidence: Math.max(0, Math.min(1, confidence)),
      moderationStatus: isApproved ? 'APPROVED' : needsHumanReview ? 'PENDING' : 'REJECTED',
      aiUsed: aiUsed, // Da li je korišten OpenAI API
      aiFlagged: aiResult?.flagged || false // Da li je OpenAI flag-ao sadržaj
    };
  } catch (error) {
    console.error('[REVIEW_MODERATION] Error in auto-moderate review:', error);
    // U slučaju greške, zahtijevaj ljudsku moderaciju (sigurnija opcija)
    return {
      isApproved: false,
      needsHumanReview: true,
      reason: 'Greška pri automatskoj provjeri - zahtijeva ljudsku moderaciju',
      flaggedWords: [],
      confidence: 0.5,
      moderationStatus: 'PENDING',
      aiUsed: false,
      aiFlagged: false
    };
  }
}

/**
 * Odobri recenziju (admin)
 * @param {String} reviewId - ID recenzije
 * @param {String} adminId - ID admina koji odobrava
 * @param {String} notes - Bilješke
 * @returns {Promise<Object>} Ažurirana recenzija
 */
export async function approveReview(reviewId, adminId, notes = null) {
  try {
    const reviewer = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true }
    });

    if (!reviewer || reviewer.role !== 'ADMIN') {
      throw new Error('Only admins can approve reviews');
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        to: { select: { id: true, role: true } }
      }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        moderationStatus: 'APPROVED',
        moderationReviewedBy: adminId,
        moderationReviewedAt: new Date(),
        moderationNotes: notes || 'Recenzija odobrena',
        // Ako je odobrena, objavi je ako još nije objavljena
        isPublished: review.isPublished || true,
        publishedAt: review.publishedAt || new Date()
      }
    });

    // Ažuriraj aggregate ako je review objavljen i toUserId je PROVIDER
    if (updatedReview.isPublished && review.to.role === 'PROVIDER') {
      const aggr = await prisma.review.aggregate({
        where: {
          toUserId: review.toUserId,
          isPublished: true,
          moderationStatus: 'APPROVED'
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

    console.log(`[REVIEW_MODERATION] Review ${reviewId} approved by ${adminId}`);
    return updatedReview;
  } catch (error) {
    console.error('[REVIEW_MODERATION] Error approving review:', error);
    throw error;
  }
}

/**
 * Odbij recenziju (admin)
 * @param {String} reviewId - ID recenzije
 * @param {String} adminId - ID admina koji odbija
 * @param {String} rejectionReason - Razlog odbijanja
 * @param {String} notes - Bilješke
 * @returns {Promise<Object>} Ažurirana recenzija
 */
export async function rejectReview(reviewId, adminId, rejectionReason, notes = null) {
  try {
    const reviewer = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true }
    });

    if (!reviewer || reviewer.role !== 'ADMIN') {
      throw new Error('Only admins can reject reviews');
    }

    if (!rejectionReason) {
      throw new Error('Rejection reason is required');
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        from: { select: { id: true, fullName: true, email: true } }
      }
    });

    if (!review) {
      throw new Error('Review not found');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        moderationStatus: 'REJECTED',
        moderationReviewedBy: adminId,
        moderationReviewedAt: new Date(),
        moderationRejectionReason: rejectionReason,
        moderationNotes: notes || 'Recenzija odbijena',
        // Ako je odbijena, ne objavljuj je
        isPublished: false
      }
    });

    // Obavijesti korisnika o odbijanju
    try {
      await prisma.notification.create({
        data: {
          title: 'Recenzija odbijena',
          message: `Vaša recenzija je odbijena: ${rejectionReason}`,
          type: 'REVIEW_REJECTED',
          userId: review.fromUserId
        }
      });
    } catch (notifError) {
      console.error('[REVIEW_MODERATION] Failed to notify user:', notifError);
    }

    // Ažuriraj aggregate (ukloni odbijenu recenziju iz kalkulacije)
    const toUser = await prisma.user.findUnique({
      where: { id: review.toUserId },
      select: { role: true }
    });

    if (toUser?.role === 'PROVIDER') {
      const aggr = await prisma.review.aggregate({
        where: {
          toUserId: review.toUserId,
          isPublished: true,
          moderationStatus: 'APPROVED'
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

    console.log(`[REVIEW_MODERATION] Review ${reviewId} rejected by ${adminId}`);
    return updatedReview;
  } catch (error) {
    console.error('[REVIEW_MODERATION] Error rejecting review:', error);
    throw error;
  }
}

/**
 * Dohvati recenzije koje čekaju moderaciju
 * @param {Number} limit - Broj recenzija
 * @param {Number} offset - Offset
 * @returns {Promise<Array>} Lista recenzija
 */
export async function getPendingModerationReviews(limit = 50, offset = 0) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        moderationStatus: 'PENDING'
      },
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
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    return reviews;
  } catch (error) {
    console.error('[REVIEW_MODERATION] Error fetching pending reviews:', error);
    return [];
  }
}

