'use client';

import Link from '../components/Link.jsx';
import StructuredData from '../components/StructuredData.jsx';
import LandingShowcase from '../components/LandingShowcase.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import { useI18n } from '../lib/i18n/index.jsx';

function LandingSocialProof({ stats, t }) {
  if (!stats) return null;

  const showCommunitySize = Number(stats.activeCount) >= 20;
  const topCities = showCommunitySize ? (stats.topCities || []).slice(0, 3) : [];
  const showContacts = showCommunitySize && Number(stats.contactsLast30Days) > 0;

  if (!showCommunitySize && !showContacts && topCities.length === 0) return null;

  return (
    <div className="social-proof">
      {showCommunitySize && (
        <span className="chip">{t('home.communityCount', { count: stats.activeCount })}</span>
      )}
      {showContacts && (
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

/** SSR: stats dolaze s servera — Google vidi sadržaj bez JS. */
export default function HomePage({ stats = null, donateThanks = false }) {
  const { t, catalog } = useI18n();

  const steps = catalog.home?.steps ?? [];
  const values = catalog.home?.values ?? [];
  const safetyItems = catalog.home?.safetyItems ?? [];
  const seoCompare = catalog.home?.seoCompare;
  const seoFree = catalog.home?.seoFree;

  return (
    <main className="page landing-page">
      <StructuredData />
      {donateThanks && (
        <p className="status-banner status-success">{t('home.donateThanks')}</p>
      )}
      <section className="landing-hero landing-hero-animated">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1>{t('home.title')}</h1>
        <p className="landing-lead">{t('home.lead')}</p>
        <div className="landing-lang-picker">
          <p className="lang-picker-hint">{t('langPicker.hint')}</p>
          <LanguageSwitcher />
        </div>
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

      {seoCompare && (
        <section className="landing-section landing-seo">
          <h2 className="landing-heading">{seoCompare.title}</h2>
          <p className="landing-seo-lead muted">{seoCompare.lead}</p>
          <div className="grid-2 landing-seo-grid">
            {seoCompare.points.map((point) => (
              <article key={point.title} className="card landing-seo-card">
                <h3 className="section-title">{point.title}</h3>
                <p className="muted">{point.text}</p>
              </article>
            ))}
          </div>
          <p className="landing-section-link">
            <Link to="/pomoc">{seoCompare.link}</Link>
          </p>
        </section>
      )}

      {seoFree && (
        <section className="landing-section landing-seo">
          <h2 className="landing-heading">{seoFree.title}</h2>
          <p className="landing-seo-lead muted">{seoFree.lead}</p>
          <div className="grid-2 landing-seo-grid">
            {seoFree.points.map((point) => (
              <article key={point.title} className="card landing-seo-card">
                <h3 className="section-title">{point.title}</h3>
                <p className="muted">{point.text}</p>
              </article>
            ))}
          </div>
          <p className="landing-section-link">
            <Link to="/auth">{seoFree.link}</Link>
          </p>
        </section>
      )}

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
