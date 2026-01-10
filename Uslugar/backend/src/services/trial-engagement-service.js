import { prisma } from '../lib/prisma.js';

/**
 * Servis za praćenje engagement-a tijekom TRIAL-a
 */

/**
 * Dohvati ili kreira TrialEngagement zapis za korisnika
 * @param {String} userId - ID korisnika
 * @returns {Promise<Object>} - TrialEngagement zapis
 */
export async function getOrCreateTrialEngagement(userId) {
  // Provjeri da li korisnik ima TRIAL subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { id: true, plan: true, status: true, expiresAt: true }
  });

  if (!subscription || subscription.plan !== 'TRIAL' || subscription.status !== 'ACTIVE') {
    return null; // Korisnik nema aktivni TRIAL
  }

  // Provjeri da li postoji engagement zapis
  let engagement = await prisma.trialEngagement.findUnique({
    where: { userId }
  });

  if (!engagement) {
    // Kreiraj novi engagement zapis
    engagement = await prisma.trialEngagement.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        leadsPurchased: 0,
        leadsConverted: 0,
        offersSent: 0,
        chatMessagesSent: 0,
        loginsCount: 0,
        totalTimeSpentMinutes: 0
      }
    });
  }

  return engagement;
}

/**
 * Track lead purchase tijekom TRIAL-a
 * @param {String} userId - ID korisnika
 * @param {String} jobId - ID leada/posla
 */
export async function trackLeadPurchase(userId, jobId) {
  try {
    const engagement = await getOrCreateTrialEngagement(userId);
    if (!engagement) return; // Nije TRIAL korisnik

    await prisma.trialEngagement.update({
      where: { userId },
      data: {
        leadsPurchased: { increment: 1 },
        lastActivityAt: new Date()
      }
    });

    console.log(`[TRIAL-ENGAGEMENT] Tracked lead purchase for user ${userId}, job ${jobId}`);
  } catch (error) {
    console.error(`[TRIAL-ENGAGEMENT] Error tracking lead purchase:`, error);
  }
}

/**
 * Track lead conversion tijekom TRIAL-a
 * @param {String} userId - ID korisnika
 * @param {String} jobId - ID leada/posla
 */
export async function trackLeadConversion(userId, jobId) {
  try {
    const engagement = await getOrCreateTrialEngagement(userId);
    if (!engagement) return; // Nije TRIAL korisnik

    await prisma.trialEngagement.update({
      where: { userId },
      data: {
        leadsConverted: { increment: 1 },
        lastActivityAt: new Date()
      }
    });

    console.log(`[TRIAL-ENGAGEMENT] Tracked lead conversion for user ${userId}, job ${jobId}`);
  } catch (error) {
    console.error(`[TRIAL-ENGAGEMENT] Error tracking lead conversion:`, error);
  }
}

/**
 * Track offer sent tijekom TRIAL-a
 * @param {String} userId - ID korisnika
 * @param {String} jobId - ID posla
 */
export async function trackOfferSent(userId, jobId) {
  try {
    const engagement = await getOrCreateTrialEngagement(userId);
    if (!engagement) return; // Nije TRIAL korisnik

    await prisma.trialEngagement.update({
      where: { userId },
      data: {
        offersSent: { increment: 1 },
        lastActivityAt: new Date()
      }
    });

    console.log(`[TRIAL-ENGAGEMENT] Tracked offer sent for user ${userId}, job ${jobId}`);
  } catch (error) {
    console.error(`[TRIAL-ENGAGEMENT] Error tracking offer sent:`, error);
  }
}

/**
 * Track chat message sent tijekom TRIAL-a
 * @param {String} userId - ID korisnika
 * @param {String} roomId - ID chat rooma
 */
export async function trackChatMessage(userId, roomId) {
  try {
    const engagement = await getOrCreateTrialEngagement(userId);
    if (!engagement) return; // Nije TRIAL korisnik

    await prisma.trialEngagement.update({
      where: { userId },
      data: {
        chatMessagesSent: { increment: 1 },
        lastActivityAt: new Date()
      }
    });

    console.log(`[TRIAL-ENGAGEMENT] Tracked chat message for user ${userId}, room ${roomId}`);
  } catch (error) {
    console.error(`[TRIAL-ENGAGEMENT] Error tracking chat message:`, error);
  }
}

/**
 * Track login tijekom TRIAL-a
 * @param {String} userId - ID korisnika
 */
export async function trackLogin(userId) {
  try {
    const engagement = await getOrCreateTrialEngagement(userId);
    if (!engagement) return; // Nije TRIAL korisnik

    await prisma.trialEngagement.update({
      where: { userId },
      data: {
        loginsCount: { increment: 1 },
        lastLoginAt: new Date(),
        lastActivityAt: new Date()
      }
    });

    console.log(`[TRIAL-ENGAGEMENT] Tracked login for user ${userId}`);
  } catch (error) {
    console.error(`[TRIAL-ENGAGEMENT] Error tracking login:`, error);
  }
}

/**
 * Track time spent na platformi
 * @param {String} userId - ID korisnika
 * @param {Number} minutes - Broj minuta provedenih na platformi
 */
export async function trackTimeSpent(userId, minutes) {
  try {
    const engagement = await getOrCreateTrialEngagement(userId);
    if (!engagement) return; // Nije TRIAL korisnik

    await prisma.trialEngagement.update({
      where: { userId },
      data: {
        totalTimeSpentMinutes: { increment: minutes },
        lastActivityAt: new Date()
      }
    });

    console.log(`[TRIAL-ENGAGEMENT] Tracked ${minutes} minutes for user ${userId}`);
  } catch (error) {
    console.error(`[TRIAL-ENGAGEMENT] Error tracking time spent:`, error);
  }
}

/**
 * Dohvati engagement podatke za korisnika
 * @param {String} userId - ID korisnika
 * @returns {Promise<Object|null>} - Engagement podaci ili null
 */
export async function getTrialEngagement(userId) {
  try {
    const engagement = await prisma.trialEngagement.findUnique({
      where: { userId },
      include: {
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            expiresAt: true,
            creditsBalance: true
          }
        }
      }
    });

    return engagement;
  } catch (error) {
    console.error(`[TRIAL-ENGAGEMENT] Error getting engagement:`, error);
    return null;
  }
}

/**
 * Dohvati sve TRIAL engagement podatke (za admin/analytics)
 * @returns {Promise<Array>} - Lista svih engagement zapisa
 */
export async function getAllTrialEngagements() {
  try {
    const engagements = await prisma.trialEngagement.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            expiresAt: true
          }
        }
      },
      orderBy: {
        lastActivityAt: 'desc'
      }
    });

    return engagements;
  } catch (error) {
    console.error(`[TRIAL-ENGAGEMENT] Error getting all engagements:`, error);
    return [];
  }
}

