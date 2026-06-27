import { arePlansPurchasable, formatPlanPrice, PLANS } from '../lib/plans.js';

function planStatus(plan) {
  if (plan.tier === 'free') {
    return { label: 'Aktivan', kind: 'active' };
  }
  if (arePlansPurchasable()) {
    return { label: 'Uskoro', kind: 'soon' };
  }
  return { label: 'U pripremi', kind: 'disabled' };
}

function planButtonLabel(plan) {
  if (plan.tier === 'free') return 'Uključeno u aplikaciji';
  if (arePlansPurchasable()) return 'Uskoro dostupno';
  return 'Još nije dostupno';
}

export default function PricingPlans() {
  const purchasable = arePlansPurchasable();

  return (
    <section className="pricing-plans" aria-labelledby="pricing-plans-heading">
      <p className="eyebrow">Paketi</p>
      <h2 id="pricing-plans-heading" className="section-title">
        Odaberi svoj ritam — bez pritiska
      </h2>
      <p className="muted">
        Besplatni paket pokriva sve bitno. Premium opcije su već pripremljene, ali namjerno
        isključene dok zajednica ne bude spremna.
      </p>
      <div className="plan-grid">
        {PLANS.map((plan) => {
          const status = planStatus(plan);
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
                <strong>{formatPlanPrice(plan)}</strong>
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
                title={
                  disabled
                    ? 'Paket još nije dostupan. Obavijestit ćemo unaprijed prije uvođenja naplate.'
                    : undefined
                }
              >
                {planButtonLabel(plan)}
              </button>
              {disabled && !purchasable && (
                <p className="muted plan-hint">
                  Aktiviramo kad proizvod i zajednica budu spremni — obavijest stiže unaprijed.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
