// Subscription-based Feature Access Control
import { prisma } from './prisma.js';

/**
 * Middleware za provjeru subscription plan-a
 * Omogućava ili blokira pristup specifičnim features
 */

/**
 * Provjeri da li korisnik ima plan koji omogućava određenu feature
 * @param {String} requiredPlan - Minimalni plan (BASIC, PREMIUM, PRO)
 * @returns {Function} - Express middleware
 */
export function requirePlan(requiredPlan) {
  const planHierarchy = { 'TRIAL': 1, 'BASIC': 1, 'PREMIUM': 2, 'PRO': 3 };
  
  return async (req, res, next) => {
    try {
      // Dohvati subscription
      const subscription = await prisma.subscription.findUnique({
        where: { userId: req.user.id }
      });

      if (!subscription) {
        return res.status(403).json({ 
          error: 'Subscription required',
          message: 'Please subscribe to access this feature'
        });
      }

      // TRIAL ima sve Premium features, tretiraj ga kao PREMIUM za feature access
      const effectivePlan = subscription.plan === 'TRIAL' ? 'PREMIUM' : subscription.plan;
      
      // Provjeri plan tier
      const userTier = planHierarchy[effectivePlan] || 0;
      const requiredTier = planHierarchy[requiredPlan] || 999;

      if (userTier < requiredTier) {
        return res.status(403).json({
          error: 'Upgrade required',
          message: `This feature requires ${requiredPlan} plan. Your current plan: ${subscription.plan}`,
          currentPlan: subscription.plan,
          requiredPlan: requiredPlan,
          upgradeUrl: '/subscription'
        });
      }

      // Dodaj subscription info u request
      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Subscription auth error:', error);
      res.status(500).json({ error: 'Subscription check failed' });
    }
  };
}

/**
 * Provjeri da li korisnik ima kredite za određenu akciju
 * @param {Number} requiredCredits - Broj kredita potrebnih
 * @returns {Function} - Express middleware
 */
export function requireCredits(requiredCredits) {
  return async (req, res, next) => {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: req.user.id }
      });

      if (!subscription) {
        return res.status(403).json({ 
          error: 'Subscription required'
        });
      }

      // PRO plan ima unlimited credits
      if (subscription.plan === 'PRO' && subscription.credits === -1) {
        req.hasCredits = true;
        return next();
      }

      if (subscription.creditsBalance < requiredCredits) {
        return res.status(402).json({
          error: 'Insufficient credits',
          message: `You need ${requiredCredits} credits. You have ${subscription.creditsBalance}`,
          creditsBalance: subscription.creditsBalance,
          required: requiredCredits
        });
      }

      req.subscription = subscription;
      req.hasCredits = true;
      next();
    } catch (error) {
      console.error('Credits check error:', error);
      res.status(500).json({ error: 'Credits check failed' });
    }
  };
}

/**
 * Provjeri da li feature dostupan za trenutni plan
 * @param {String} featureName - Ime feature-a
 * @param {String} userPlan - Korisnički plan
 * @returns {Boolean}
 */
export function hasFeatureAccess(featureName, userPlan) {
  const featureAccess = {
    'MINI_CRM': ['TRIAL', 'BASIC', 'PREMIUM', 'PRO'],
    'ROI_STATS': ['TRIAL', 'BASIC', 'PREMIUM', 'PRO'],
    'EXCLUSIVE_LEADS': ['TRIAL', 'BASIC', 'PREMIUM', 'PRO'],
    'REFUND': ['TRIAL', 'BASIC', 'PREMIUM', 'PRO'],
    'EMAIL_NOTIFICATIONS': ['TRIAL', 'BASIC', 'PREMIUM', 'PRO'],
    'AI_PRIORITY': ['TRIAL', 'PREMIUM', 'PRO'], // TRIAL ima sve Premium features
    'SMS_NOTIFICATIONS': ['TRIAL', 'PREMIUM', 'PRO'], // TRIAL ima sve Premium features
    'PRIORITY_SUPPORT': ['TRIAL', 'PREMIUM', 'PRO'],  // TRIAL ima sve Premium features
    'PREMIUM_QUALITY_LEADS': ['PRO'],
    'VIP_SUPPORT': ['PRO'],  // ← VIP podrška 24/7 (viši level)
    'FEATURED_PROFILE': ['PRO'],
    'CSV_EXPORT': ['TRIAL', 'PREMIUM', 'PRO'], // TRIAL ima sve Premium features
    'ADVANCED_ANALYTICS': ['TRIAL', 'PREMIUM', 'PRO'] // TRIAL ima sve Premium features
  };

  const allowedPlans = featureAccess[featureName] || [];
  return allowedPlans.includes(userPlan);
}

/**
 * Dohvati dostupne features za korisnički plan
 * @param {String} userPlan - Korisnički plan
 * @returns {Array} - Lista dostupnih features
 */
export function getAvailableFeatures(userPlan) {
  const features = {
    'TRIAL': [
      // TRIAL = maksimalni paket funkcionalnosti - sve Premium features
      'MINI_CRM',
      'ROI_STATS',
      'EXCLUSIVE_LEADS',
      'REFUND',
      'EMAIL_NOTIFICATIONS',
      'AI_PRIORITY', // ✅ Premium feature
      'SMS_NOTIFICATIONS', // ✅ Premium feature
      'PRIORITY_SUPPORT', // ✅ Premium feature
      'CSV_EXPORT', // ✅ Premium feature
      'ADVANCED_ANALYTICS' // ✅ Premium feature
      // ❌ NEMA: VIP podrška 24/7 (samo PRO)
      // ❌ NEMA: Premium Quality Leads (samo PRO)
      // ❌ NEMA: Featured Profile (samo PRO)
    ],
    'BASIC': [
      'MINI_CRM',
      'ROI_STATS',
      'EXCLUSIVE_LEADS',
      'REFUND',
      'EMAIL_NOTIFICATIONS'
      // ❌ NEMA: Prioritetna podrška
      // ❌ NEMA: SMS notifikacije
      // ❌ NEMA: AI Priority
      // ❌ NEMA: CSV Export
    ],
    'PREMIUM': [
      'MINI_CRM',
      'ROI_STATS',
      'EXCLUSIVE_LEADS',
      'REFUND',
      'EMAIL_NOTIFICATIONS',
      'AI_PRIORITY',
      'SMS_NOTIFICATIONS',
      'PRIORITY_SUPPORT',  // ✅ Prioritetna podrška
      'CSV_EXPORT',
      'ADVANCED_ANALYTICS'
      // ❌ NEMA: VIP podrška 24/7
    ],
    'PRO': [
      'MINI_CRM',
      'ROI_STATS',
      'EXCLUSIVE_LEADS',
      'REFUND',
      'EMAIL_NOTIFICATIONS',
      'AI_PRIORITY',
      'SMS_NOTIFICATIONS',
      'PRIORITY_SUPPORT',  // ✅ Prioritetna podrška
      'CSV_EXPORT',
      'ADVANCED_ANALYTICS',
      'PREMIUM_QUALITY_LEADS',
      'VIP_SUPPORT',  // ✅ VIP podrška 24/7 (PRO-only)
      'FEATURED_PROFILE'
    ]
  };

  return features[userPlan] || [];
}

export default {
  requirePlan,
  requireCredits,
  hasFeatureAccess,
  getAvailableFeatures
};

