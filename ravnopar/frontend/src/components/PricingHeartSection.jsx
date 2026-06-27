import { FOUNDER_NOTE, PRICING_VALUES } from '../lib/plans.js';

export default function PricingHeartSection() {
  return (
    <>
      <section className="values-strip" aria-label="Vrijednosti Ravnopara">
        <div className="values-grid">
          {PRICING_VALUES.map((item) => (
            <article key={item.title} className="card value-card">
              <span className="value-icon" aria-hidden="true">
                {item.icon}
              </span>
              <h2 className="value-title">{item.title}</h2>
              <p className="muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <blockquote className="card founder-note">
        <p className="founder-quote">{FOUNDER_NOTE.quote}</p>
        <footer className="founder-signature">{FOUNDER_NOTE.signature}</footer>
      </blockquote>
    </>
  );
}
