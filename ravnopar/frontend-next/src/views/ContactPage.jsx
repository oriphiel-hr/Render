'use client';

import Link from '../components/Link.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { CONTACT_EMAIL } from '../lib/legal-content.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function ContactPage() {
  const { t, catalog } = useI18n();
  const topics = catalog.contact?.topics ?? [];

  return (
    <main className="page contact-page">
      <PageMeta titleKey="contact" descriptionKey="contact" />
      <section className="hero legal-hero">
        <h1>{t('contact.title')}</h1>
        <p className="subtitle">{t('contact.subtitle')}</p>
      </section>
      <article className="card">
        <h2 className="section-title">{t('contact.topicsTitle')}</h2>
        <ul className="contact-topics">
          {topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
        <p className="muted">{t('contact.reportHint')}</p>
      </article>
      <article className="card">
        <h2 className="section-title">{t('contact.emailTitle')}</h2>
        <p className="muted">
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p className="muted">{t('contact.emailHint')}</p>
        <a className="button button-primary" href={`mailto:${CONTACT_EMAIL}`}>
          {t('faq.ctaEmail')}
        </a>
      </article>
      <article className="card">
        <h2 className="section-title">{t('contact.emergencyTitle')}</h2>
        <p className="muted">{t('contact.emergencyHint')}</p>
      </article>
      <p className="auth-footer">
        <Link to="/pomoc">{t('contact.faqLink')}</Link>
        {' · '}
        <Link to="/">{t('contact.homeLink')}</Link>
      </p>
    </main>
  );
}
