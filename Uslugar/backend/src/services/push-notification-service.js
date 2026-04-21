import webpush from 'web-push';
import { prisma } from '../lib/prisma.js';

const EXPO_TOKEN_PREFIXES = ['ExponentPushToken[', 'ExpoPushToken['];
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Initialize web-push with VAPID keys from environment
// Generate keys with: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@uslugar.oriph.io';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('⚠️  VAPID keys not configured. Push notifications will not work.');
  console.warn('   Generate keys with: npx web-push generate-vapid-keys');
  console.warn('   Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env');
}

function isExpoPushToken(value) {
  return EXPO_TOKEN_PREFIXES.some((prefix) => String(value || '').startsWith(prefix));
}

function isExpoSubscription(subscription) {
  return Boolean(subscription?.endpoint && isExpoPushToken(subscription.endpoint));
}

/**
 * Save push subscription for a user
 */
export async function savePushSubscription(userId, subscription, userAgent = null) {
  try {
    const { endpoint, keys } = subscription;

    const normalizedKeys = isExpoPushToken(endpoint)
      ? { p256dh: 'expo', auth: 'expo' }
      : keys;

    if (!endpoint || !normalizedKeys || !normalizedKeys.p256dh || !normalizedKeys.auth) {
      throw new Error('Invalid subscription data');
    }

    const subscriptionData = {
      userId,
      endpoint,
      p256dh: normalizedKeys.p256dh,
      auth: normalizedKeys.auth,
      userAgent: userAgent || null,
      isActive: true,
      lastUsedAt: new Date()
    };

    // Upsert subscription (update if exists, create if not)
    const saved = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId,
          endpoint
        }
      },
      update: {
        ...subscriptionData,
        updatedAt: new Date()
      },
      create: subscriptionData
    });

    console.log(`✅ Push subscription saved for user ${userId}`);
    return saved;
  } catch (error) {
    console.error('Error saving push subscription:', error);
    throw error;
  }
}

/**
 * Remove push subscription
 */
export async function removePushSubscription(userId, endpoint) {
  try {
    await prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint
      }
    });
    console.log(`✅ Push subscription removed for user ${userId}`);
  } catch (error) {
    console.error('Error removing push subscription:', error);
    throw error;
  }
}

/**
 * Get all active push subscriptions for a user
 */
export async function getUserPushSubscriptions(userId) {
  try {
    return await prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true
      }
    });
  } catch (error) {
    console.error('Error getting user push subscriptions:', error);
    return [];
  }
}

/**
 * Send push notification to a single subscription
 */
async function sendPushToSubscription(subscription, payload) {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    
    // Update lastUsedAt
    await prisma.pushSubscription.update({
      where: { id: subscription.id },
      data: { lastUsedAt: new Date() }
    });

    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    
    // If subscription is invalid (410 Gone), mark as inactive
    if (error.statusCode === 410) {
      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: { isActive: false }
      });
      console.log(`⚠️  Subscription ${subscription.id} marked as inactive (410 Gone)`);
    }
    
    return false;
  }
}

async function sendExpoPushToSubscription(subscription, payload) {
  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate'
      },
      body: JSON.stringify({
        to: subscription.endpoint,
        sound: payload?.requireInteraction ? 'default' : undefined,
        title: payload.title,
        body: payload.body,
        data: payload.data
      })
    });

    const data = await response.json().catch(() => ({}));
    const success = response.ok && data?.data?.status === 'ok';
    if (!success) {
      const details = data?.data?.details || {};
      const shouldDeactivate = details?.error === 'DeviceNotRegistered';
      if (shouldDeactivate) {
        await prisma.pushSubscription.update({
          where: { id: subscription.id },
          data: { isActive: false }
        });
      }
      throw new Error(data?.errors?.[0]?.message || data?.data?.message || 'Expo push send failed');
    }

    await prisma.pushSubscription.update({
      where: { id: subscription.id },
      data: { lastUsedAt: new Date() }
    });
    return true;
  } catch (error) {
    console.error('Error sending expo push notification:', error);
    return false;
  }
}

/**
 * Send push notification to a user
 */
export async function sendPushNotification(userId, notification) {
  try {
    const subscriptions = await getUserPushSubscriptions(userId);
    
    if (subscriptions.length === 0) {
      console.log(`ℹ️  No push subscriptions found for user ${userId}`);
      return { sent: 0, failed: 0 };
    }

    const payload = {
      title: notification.title || 'Uslugar',
      body: notification.message || '',
      icon: notification.icon || '/uslugar.ico',
      badge: '/uslugar.ico',
      data: {
        url: notification.url || '/',
        notificationId: notification.id,
        type: notification.type || 'GENERAL'
      },
      requireInteraction: notification.requireInteraction || false,
      tag: notification.tag || notification.type || 'general'
    };

    let sent = 0;
    let failed = 0;

    // Send to all user's devices
    for (const subscription of subscriptions) {
      let success = false;
      if (isExpoSubscription(subscription)) {
        success = await sendExpoPushToSubscription(subscription, payload);
      } else if (vapidPublicKey && vapidPrivateKey) {
        success = await sendPushToSubscription(subscription, payload);
      } else {
        console.warn('⚠️  VAPID keys not configured. Skipping WebPush subscription.');
      }
      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    console.log(`📱 Push notification sent to user ${userId}: ${sent} successful, ${failed} failed`);
    return { sent, failed };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { sent: 0, failed: 0 };
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToUsers(userIds, notification) {
  const results = { sent: 0, failed: 0 };
  
  for (const userId of userIds) {
    const result = await sendPushNotification(userId, notification);
    results.sent += result.sent;
    results.failed += result.failed;
  }
  
  return results;
}

/**
 * Get VAPID public key (for frontend)
 */
export function getVapidPublicKey() {
  return vapidPublicKey;
}

export default {
  savePushSubscription,
  removePushSubscription,
  getUserPushSubscriptions,
  sendPushNotification,
  sendPushNotificationToUsers,
  getVapidPublicKey
};

