import { PRICING_POLICY } from '../lib/plans.js';

export default function PricingPolicySection({ variant = 'full' }) {
  const compact = variant === 'compact';

  return (
    <section className="card pricing-policy" aria-labelledby="pricing-policy-heading">
      <p className="eyebrow">Transparentno unaprijed</p>
      <h2 id="pricing-policy-heading" className="section-title">
        {PRICING_POLICY.headline}
      </h2>
      <p className="muted">{PRICING_POLICY.lead}</p>

      {!compact && (
        <>
          <h3 className="subsection-title">Što obećavamo</h3>
          <ul className="policy-list">
            {PRICING_POLICY.promises.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3 className="subsection-title">Kad bismo razmotrili Premium</h3>
          <p className="muted">Tek kad su ispunjeni svi relevantni uvjeti, primjerice:</p>
          <ul className="policy-list">
            {PRICING_POLICY.triggers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {compact && (
        <ul className="policy-list policy-list-compact">
          {PRICING_POLICY.promises.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <p className="muted pricing-footnote">{PRICING_POLICY.footnote}</p>
    </section>
  );
}
