'use client';

import { arePlansPurchasable, formatPlanPrice, getPlans } from '../lib/plans.js';
import { createPlanCheckout } from '../api/index.js';
import { useI18n } from '../lib/i18n/index.jsx';
import { useState } from 'react';

function planStatus(plan, t, purchasable) {
  if (plan.tier === 'free') {
    return { label: t('pricing.planStatusActive'), kind: 'active' };
  }
  if (purchasable) {
    return { label: t('pricing.planStatusBuy'), kind: 'buy' };
  }
  return { label: t('pricing.planStatusDisabled'), kind: 'disabled' };
}

function planButtonLabel(plan, t, purchasable) {
  if (plan.tier === 'free') return t('pricing.planBtnIncluded');
  if (purchasable) return t('pricing.planBtnBuy');
  return t('pricing.planBtnDisabled');
}

export default function PricingPlans({ token }) {
  const { t, catalog } = useI18n();
  const plans = getPlans(catalog);
  const purchasable = arePlansPurchasable() && Boolean(token);
  const [busyPlanId, setBusyPlanId] = useState(null);
  const [error, setError] = useState('');

  async function buyPlan(planId) {
    if (!token) return;
    setBusyPlanId(planId);
    setError('');
    const data = await createPlanCheckout(token, planId);
    if (data?.success && data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    setError(data?.error || t('settings.checkoutFailed'));
    setBusyPlanId(null);
  }

  return (
    <section className="pricing-plans" aria-labelledby="pricing-plans-heading">
      <p className="eyebrow">{t('pricing.plansEyebrow')}</p>
      <h2 id="pricing-plans-heading" className="section-title">
        {t('pricing.plansTitle')}
      </h2>
      <p className="muted">{t('pricing.plansLead')}</p>
      {error && <p className="status-banner status-error">{error}</p>}
      <div className="plan-grid">
        {plans.map((plan) => {
          const status = planStatus(plan, t, purchasable);
          const isFree = plan.tier === 'free';
          const disabled = isFree || (!purchasable && plan.tier !== 'free');
          const canBuy = purchasable && !isFree;

          return (
            <article
              key={plan.id}
              className={`card plan-card plan-card-${status.kind}`}
              aria-disabled={disabled && !canBuy}
            >
              <div className="plan-card-top">
                <span className="plan-icon" aria-hidden="true">
                  {plan.icon}
                </span>
                <div className="plan-card-head">
                  <div>
                    <p className="plan-tagline">{plan.tagline}</p>
                    <h3 className="plan-name">{plan.name}</h3>
                  </div>
                  <span className={`plan-badge plan-badge-${status.kind}`}>{status.label}</span>
                </div>
              </div>
              <p className="plan-price">
                <strong>{formatPlanPrice(plan, t)}</strong>
                {plan.period && <span className="muted">{plan.period}</span>}
              </p>
              <p className="muted plan-description">{plan.description}</p>
              <ul className="plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button
                type="button"
                className={isFree ? 'button button-secondary' : 'button button-primary'}
                disabled={isFree || (!canBuy && disabled) || busyPlanId === plan.id}
                title={!canBuy && !isFree ? t('pricing.planDisabledTitle') : undefined}
                onClick={() => canBuy && buyPlan(plan.id)}
              >
                {busyPlanId === plan.id ? t('common.loading') : planButtonLabel(plan, t, purchasable)}
              </button>
              {!canBuy && !isFree && arePlansPurchasable() && !token && (
                <p className="muted plan-hint">{t('pricing.planHintLogin')}</p>
              )}
              {!canBuy && !isFree && !arePlansPurchasable() && (
                <p className="muted plan-hint">{t('pricing.planHintLater')}</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
