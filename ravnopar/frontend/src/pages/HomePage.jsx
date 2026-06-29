import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageMeta from '../components/PageMeta.jsx';
import StructuredData from '../components/StructuredData.jsx';
import LandingShowcase from '../components/LandingShowcase.jsx';
import { getPublicStats } from '../api/index.js';
import { useI18n } from '../lib/i18n/index.jsx';

function LandingSocialProof({ stats, t }) {
  if (!stats) return null;

  const showCommunitySize = stats.activeCount >= 20;
  const topCities = (stats.topCities || []).slice(0, 3);

  return (
    <div className="social-proof">
      {showCommunitySize && (
        <span className="chip">{t('home.communityCount', { count: stats.activeCount })}</span>
      )}
      {stats.contactsLast30Days > 0 && (
        <span className="chip">{t('home.contacts30d', { count: stats.contactsLast30Days })}</span>
      )}
      {topCities.length > 0 && (
        <span className="chip social-proof-cities">
          {t('home.activeCities', { cities: topCities.map((row) => row.city).join(', ') })}
        </span>
      )}
    </div>
  );
}

export default function HomePage() {
  const { t, catalog } = useI18n();
  const [searchParams] = useSearchParams();
  const donateThanks = searchParams.get('donate') === 'thanks';
  const [stats, setStats] = useState(null);

  const steps = catalog.home?.steps ?? [];
  const values = catalog.home?.values ?? [];
  const safetyItems = catalog.home?.safetyItems ?? [];

  useEffect(() => {
    getPublicStats().then((data) => {
      if (data?.success) setStats(data.stats);
    });
  }, []);

  return (
    <main className="page landing-page">
      <StructuredData />
      <PageMeta titleKey="home" descriptionKey="home" />
      {donateThanks && (
        <p className="status-banner status-success">{t('home.donateThanks')}</p>
      )}
      <section className="landing-hero landing-hero-animated">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1>{t('home.title')}</h1>
        <p className="landing-lead">{t('home.lead')}</p>
        {stats && <LandingSocialProof stats={stats} t={t} />}
        <div className="landing-actions">
          <Link className="button button-primary button-lg" to="/auth">
            {t('home.ctaStart')}
          </Link>
          <Link className="button button-secondary button-lg" to="/auth?login=1">
            {t('home.ctaLogin')}
          </Link>
        </div>
        <div className="landing-chips">
          <span className="chip">{t('home.chipNoPaywall')}</span>
          <span className="chip">{t('home.chipChatAfterMatch')}</span>
          <span className="chip">{t('home.chipAntiSpam')}</span>
        </div>
      </section>

      <LandingShowcase />

      <section className="landing-section">
        <h2 className="landing-heading">{t('home.howItWorks')}</h2>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <article key={step.title} className="card step-card">
              <span className="step-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p className="muted">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-heading">{t('home.safetyTitle')}</h2>
        <div className="safety-grid">
          {safetyItems.map((item) => (
            <article key={item.title} className="card safety-card">
              <span className="safety-icon" aria-hidden="true">{item.icon}</span>
              <h3 className="section-title">{item.title}</h3>
              <p className="muted">{item.text}</p>
            </article>
          ))}
        </div>
        <p className="landing-section-link">
          <Link to="/pravila">{t('home.safetyLink')}</Link>
        </p>
      </section>

      <section className="landing-section">
        <h2 className="landing-heading">{t('home.whyTitle')}</h2>
        <div className="grid-2">
          {values.map((item) => (
            <article key={item.title} className="card">
              <h3 className="section-title">{item.title}</h3>
              <p className="muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-heading">{t('home.pricingTitle')}</h2>
        <article className="card pricing-teaser">
          <p className="eyebrow">{t('home.pricingEyebrow')}</p>
          <p className="pricing-teaser-lead">{t('home.pricingLead')}</p>
          <div className="landing-chips">
            <span className="chip">{t('home.pricingChipNoPaywall')}</span>
            <span className="chip">{t('home.pricingChipFair')}</span>
          </div>
          <Link className="button button-secondary" to="/planovi">
            {t('home.pricingLink')}
          </Link>
        </article>
      </section>

      <section className="landing-section">
        <h2 className="landing-heading">{t('home.faqTitle')}</h2>
        <article className="card">
          <p className="muted">{t('home.faqLead')}</p>
          <Link className="button button-secondary" to="/pomoc">
            {t('home.faqLink')}
          </Link>
        </article>
      </section>

      <section className="landing-cta card">
        <h2>{t('home.ctaTitle')}</h2>
        <p className="muted">{t('home.ctaSubtitle')}</p>
        <Link className="button button-primary" to="/auth">
          {t('home.ctaFree')}
        </Link>
      </section>
    </main>
  );
}
