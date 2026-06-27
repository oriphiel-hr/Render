import {
  PRICING_POLICY,
  PRICING_PROMISES,
  PRICING_TRIGGERS
} from '../lib/plans.js';

export default function PricingPolicySection({ variant = 'full' }) {
  const compact = variant === 'compact';

  return (
    <section className="card pricing-policy" aria-labelledby="pricing-policy-heading">
      <p className="eyebrow">Transparentno unaprijed</p>
      <h2 id="pricing-policy-heading" className="section-title">
        {PRICING_POLICY.headline}
      </h2>
      <p className="muted pricing-lead">{PRICING_POLICY.lead}</p>

      {!compact && (
        <>
          <h3 className="subsection-title">{PRICING_POLICY.promisesIntro}</h3>
          <div className="promise-grid">
            {PRICING_PROMISES.map((item) => (
              <article key={item.title} className="promise-card">
                <span className="promise-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <div>
                  <h4 className="promise-title">{item.title}</h4>
                  <p className="muted promise-text">{item.text}</p>
                </div>
              </article>
            ))}
          </div>

          <h3 className="subsection-title">{PRICING_POLICY.triggersIntro}</h3>
          <div className="trigger-grid">
            {PRICING_TRIGGERS.map((item) => (
              <div key={item.text} className="trigger-chip">
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {compact && (
        <div className="promise-grid promise-grid-compact">
          {PRICING_PROMISES.slice(0, 3).map((item) => (
            <article key={item.title} className="promise-card">
              <span className="promise-icon" aria-hidden="true">
                {item.icon}
              </span>
              <div>
                <h4 className="promise-title">{item.title}</h4>
                <p className="muted promise-text">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="muted pricing-footnote">{PRICING_POLICY.footnote}</p>
    </section>
  );
}
