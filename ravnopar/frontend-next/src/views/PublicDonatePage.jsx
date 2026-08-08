'use client';

import Link from '../components/Link.jsx';
import DonateImpactSection from '../components/DonateImpactSection.jsx';
import SupportContent from '../components/SupportContent.jsx';
import { isDonateConfigured } from '../lib/donate-config.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function PublicDonatePage({ impactStats = null, thanks = false }) {
  const { t } = useI18n();

  return (
    <main className="page donate-page">
      {thanks && <p className="status-banner status-info">{t('home.donateThanks')}</p>}
      <section className="hero donate-hero donate-hero-warm">
        <p className="eyebrow">{t('donate.eyebrow')}</p>
        <h1>{t('donate.title')}</h1>
        <p className="landing-lead">{t('donate.lead')}</p>
      </section>
      <DonateImpactSection stats={impactStats} />
      {isDonateConfigured() && <SupportContent showHeart={false} policyVariant="compact" />}
      <p className="auth-footer">
        <Link to="/kako-radi-feed">{t('fairFeed.title')}</Link>
        {' · '}
        <Link to="/fer-izvjestaj">{t('fairnessReport.title')}</Link>
        {' · '}
        <Link to="/">{t('common.backHome')}</Link>
      </p>
    </main>
  );
}
