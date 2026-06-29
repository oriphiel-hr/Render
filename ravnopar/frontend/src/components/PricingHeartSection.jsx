import { getFounderNote, getPricingValues } from '../lib/plans.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function PricingHeartSection() {
  const { t, catalog } = useI18n();
  const values = getPricingValues(catalog);
  const founderNote = getFounderNote(catalog);

  return (
    <>
      <section className="values-strip" aria-label={t('pricing.valuesAriaLabel')}>
        <div className="values-grid">
          {values.map((item) => (
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
        <p className="founder-quote">{founderNote.quote}</p>
        <footer className="founder-signature">{founderNote.signature}</footer>
      </blockquote>
    </>
  );
}
