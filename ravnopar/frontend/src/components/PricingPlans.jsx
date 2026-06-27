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
  if (plan.tier === 'free') return 'Uključeno';
  if (arePlansPurchasable()) return 'Uskoro dostupno';
  return 'Još nije dostupno';
}

export default function PricingPlans() {
  const purchasable = arePlansPurchasable();

  return (
    <section className="pricing-plans" aria-labelledby="pricing-plans-heading">
      <h2 id="pricing-plans-heading" className="section-title">
        Paketi
      </h2>
      <p className="muted">
        Paketi su pripremljeni unaprijed. Premium opcije su onemogućene dok zajednica i proizvod ne
        dosegnu dogovorene uvjete.
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
              <div className="plan-card-head">
                <h3 className="plan-name">{plan.name}</h3>
                <span className={`plan-badge plan-badge-${status.kind}`}>{status.label}</span>
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
                <p className="muted plan-hint">Aktivacija nakon stabilnog MAU-a i aktivnosti zajednice.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
