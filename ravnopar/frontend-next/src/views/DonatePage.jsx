'use client';

import Link from '../components/Link.jsx';
import PageMeta from '../components/PageMeta.jsx';
import DonateImpactSection from '../components/DonateImpactSection.jsx';
import SupportContent from '../components/SupportContent.jsx';
import { useI18n } from '../lib/i18n/index.jsx';

export default function DonatePage({ token }) {
  const { t } = useI18n();

  return (
    <main className="page donate-page">
      <PageMeta titleKey="donate" descriptionKey="donate" />
      <p className="auth-footer">
        <Link to="/app">{t('donate.backToApp')}</Link>
        {' · '}
        <Link to="/planovi">{t('donate.pricingLink')}</Link>
        {' · '}
        <Link to="/fer-izvjestaj">{t('fairnessReport.title')}</Link>
      </p>
      <section className="hero donate-hero donate-hero-warm">
        <p className="eyebrow">{t('donate.eyebrow')}</p>
        <h1>{t('donate.title')}</h1>
        <p className="landing-lead">{t('donate.lead')}</p>
      </section>
      <DonateImpactSection />
      <SupportContent token={token} />
    </main>
  );
}
