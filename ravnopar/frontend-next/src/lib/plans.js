import { PLANS_ENABLED } from './env.js';

export function arePlansPurchasable() {
  return PLANS_ENABLED;
}

export function formatPlanPrice(plan, t) {
  const price = Number(plan?.priceEur);
  if (!Number.isFinite(price) || price === 0) {
    return t ? t('pricing.freePrice') : '0 €';
  }
  const amount = `${price.toFixed(2).replace('.', ',')} €`;
  return plan.period ? `${amount}${plan.period}` : amount;
}

export function getPricingPolicy(catalog) {
  return catalog?.pricing?.policy ?? {};
}

export function getPricingPromises(catalog) {
  return catalog?.pricing?.promises ?? [];
}

export function getPricingTriggers(catalog) {
  return catalog?.pricing?.triggers ?? [];
}

export function getPricingValues(catalog) {
  return catalog?.pricing?.values ?? [];
}

export function getFounderNote(catalog) {
  return catalog?.pricing?.founderNote ?? {};
}

export function getPlans(catalog) {
  return catalog?.pricing?.plans ?? [];
}
