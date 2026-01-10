// Subscription History Service - Praćenje povijesti pretplata
import { prisma } from '../lib/prisma.js';

/**
 * Log subscription change to history
 * @param {Object} params - Parameters for history entry
 * @param {string} params.subscriptionId - Subscription ID
 * @param {string} params.userId - User ID
 * @param {string} params.action - Action type (CREATED, UPGRADED, DOWNGRADED, etc.)
 * @param {string} params.previousPlan - Previous plan (null for CREATED)
 * @param {string} params.newPlan - New plan
 * @param {string} params.previousStatus - Previous status (null for CREATED)
 * @param {string} params.newStatus - New status
 * @param {Object} params.options - Additional options
 * @returns {Promise<SubscriptionHistory>}
 */
export async function logSubscriptionChange({
  subscriptionId,
  userId,
  action,
  previousPlan = null,
  newPlan,
  previousStatus = null,
  newStatus,
  options = {}
}) {
  try {
    const {
      price = null,
      proratedAmount = null,
      discountAmount = null,
      discountType = null,
      creditsAdded = null,
      creditsBefore = null,
      creditsAfter = null,
      validFrom = null,
      validUntil = null,
      previousExpiresAt = null,
      reason = null,
      notes = null,
      metadata = null,
      changedBy = null,
      ipAddress = null
    } = options;

    const historyEntry = await prisma.subscriptionHistory.create({
      data: {
        subscriptionId,
        userId,
        action,
        previousPlan,
        newPlan,
        previousStatus,
        newStatus,
        price,
        proratedAmount,
        discountAmount,
        discountType,
        creditsAdded,
        creditsBefore,
        creditsAfter,
        validFrom,
        validUntil,
        previousExpiresAt,
        reason,
        notes,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        changedBy,
        ipAddress
      }
    });

    console.log(`[SubscriptionHistory] Logged ${action} for subscription ${subscriptionId}, user ${userId}`);
    
    return historyEntry;
  } catch (error) {
    console.error('[SubscriptionHistory] Error logging subscription change:', error);
    // Ne baci grešku - history logging ne smije blokirati subscription operacije
    return null;
  }
}

/**
 * Get subscription history for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getSubscriptionHistory(userId, options = {}) {
  try {
    const {
      limit = 50,
      offset = 0,
      action = null,
      plan = null,
      startDate = null,
      endDate = null
    } = options;

    const where = {
      userId
    };

    if (action) {
      where.action = action;
    }

    if (plan) {
      where.newPlan = plan;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const history = await prisma.subscriptionHistory.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true
          }
        }
      }
    });

    return history;
  } catch (error) {
    console.error('[SubscriptionHistory] Error fetching subscription history:', error);
    throw error;
  }
}

/**
 * Get subscription history for a specific subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getSubscriptionHistoryBySubscription(subscriptionId, options = {}) {
  try {
    const {
      limit = 50,
      offset = 0
    } = options;

    const history = await prisma.subscriptionHistory.findMany({
      where: {
        subscriptionId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    return history;
  } catch (error) {
    console.error('[SubscriptionHistory] Error fetching subscription history:', error);
    throw error;
  }
}

