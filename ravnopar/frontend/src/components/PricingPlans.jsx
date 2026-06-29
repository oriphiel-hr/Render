import { arePlansPurchasable, formatPlanPrice, getPlans } from '../lib/plans.js';
import { useI18n } from '../lib/i18n/index.jsx';

function planStatus(plan, t) {
  if (plan.tier === 'free') {
    return { label: t('pricing.planStatusActive'), kind: 'active' };
  }
  if (arePlansPurchasable()) {
    return { label: t('pricing.planStatusSoon'), kind: 'soon' };
  }
  return { label: t('pricing.planStatusDisabled'), kind: 'disabled' };
}

function planButtonLabel(plan, t) {
  if (plan.tier === 'free') return t('pricing.planBtnIncluded');
  if (arePlansPurchasable()) return t('pricing.planBtnSoon');
  return t('pricing.planBtnDisabled');
}

export default function PricingPlans() {
  const { t, catalog } = useI18n();
  const plans = getPlans(catalog);
  const purchasable = arePlansPurchasable();

  return (
    <section className="pricing-plans" aria-labelledby="pricing-plans-heading">
      <p className="eyebrow">{t('pricing.plansEyebrow')}</p>
      <h2 id="pricing-plans-heading" className="section-title">
        {t('pricing.plansTitle')}
      </h2>
      <p className="muted">{t('pricing.plansLead')}</p>
      <div className="plan-grid">
        {plans.map((plan) => {
          const status = planStatus(plan, t);
          const isFree = plan.tier === 'free';
          const disabled = !isFree;

          return (
            <article
              key={plan.id}
              className={`card plan-card plan-card-${status.kind}`}
              aria-disabled={disabled}
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
                disabled={disabled || isFree}
                title={disabled ? t('pricing.planDisabledTitle') : undefined}
              >
                {planButtonLabel(plan, t)}
              </button>
              {disabled && purchasable && (
                <p className="muted plan-hint">{t('pricing.planHintCheckout')}</p>
              )}
              {disabled && !purchasable && (
                <p className="muted plan-hint">{t('pricing.planHintLater')}</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
