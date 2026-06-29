import {
  getPricingPolicy,
  getPricingPromises,
  getPricingTriggers
} from '../lib/plans.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function PricingPolicySection({ variant = 'full' }) {
  const { t, catalog } = useI18n();
  const policy = getPricingPolicy(catalog);
  const promises = getPricingPromises(catalog);
  const triggers = getPricingTriggers(catalog);
  const compact = variant === 'compact';

  return (
    <section className="card pricing-policy" aria-labelledby="pricing-policy-heading">
      <p className="eyebrow">{t('pricing.policyEyebrow')}</p>
      <h2 id="pricing-policy-heading" className="section-title">
        {policy.headline}
      </h2>
      <p className="muted pricing-lead">{policy.lead}</p>

      {!compact && (
        <>
          <h3 className="subsection-title">{policy.promisesIntro}</h3>
          <div className="promise-grid">
            {promises.map((item) => (
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

          <h3 className="subsection-title">{policy.triggersIntro}</h3>
          <div className="trigger-grid">
            {triggers.map((item) => (
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
          {promises.slice(0, 3).map((item) => (
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

      <p className="muted pricing-footnote">{policy.footnote}</p>
    </section>
  );
}
