import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta.jsx';
import FaqStructuredData from '../components/FaqStructuredData.jsx';
import { getFaqItems } from '../lib/faq.js';
import { CONTACT_EMAIL } from '../lib/legal-content.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function FaqPage() {
  const { t, catalog } = useI18n();
  const faqItems = getFaqItems(catalog);

  return (
    <main className="page faq-page">
      <FaqStructuredData />
      <PageMeta titleKey="faq" descriptionKey="faq" />
      <section className="hero legal-hero">
        <h1>{t('faq.title')}</h1>
        <p className="subtitle">{t('faq.subtitle')}</p>
      </section>
      <div className="faq-list">
        {faqItems.map((item) => (
          <article key={item.q} className="card faq-item">
            <h2 className="section-title">{item.q}</h2>
            <p className="muted">{item.a}</p>
          </article>
        ))}
      </div>
      <section className="card faq-contact-cta">
        <h2 className="section-title">{t('faq.ctaTitle')}</h2>
        <p className="muted">{t('faq.ctaLead')}</p>
        <div className="faq-contact-cta-actions">
          <a className="button button-primary" href={`mailto:${CONTACT_EMAIL}`}>
            {t('faq.ctaEmail')}
          </a>
          <a className="muted faq-contact-email" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>
      <p className="auth-footer">
        <Link to="/">{t('faq.backHome')}</Link>
        {' · '}
        <Link to="/kontakt">{t('faq.contact')}</Link>
      </p>
    </main>
  );
}
