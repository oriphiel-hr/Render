'use client';

import Link from '../components/Link.jsx';
import PricingHeartSection from '../components/PricingHeartSection.jsx';
import SupportContent from '../components/SupportContent.jsx';
import VoluntarySupportTeaser from '../components/VoluntarySupportTeaser.jsx';
import { useI18n } from '../lib/i18n/index.jsx';
import { useAuth } from '../components/AuthProvider.jsx';

export default function PlanoviPage() {
  const { t } = useI18n();
  const { token } = useAuth();

  return (
    <main className="page planovi-page">
      <section className="landing-hero planovi-hero-warm">
        <p className="eyebrow">{t('pricing.heroEyebrow')}</p>
        <h1>{t('pricing.heroTitle')}</h1>
        <p className="landing-lead">{t('pricing.heroLead')}</p>
        <div className="landing-chips">
          <span className="chip">{t('pricing.heroChipChat')}</span>
          <span className="chip">{t('pricing.heroChipFair')}</span>
          <span className="chip">{t('pricing.heroChipNotice')}</span>
        </div>
      </section>

      <PricingHeartSection />

      <SupportContent showDonate={false} />

      <VoluntarySupportTeaser token={token} />

      <section className="card planovi-cta">
        <h2>{t('pricing.ctaTitle')}</h2>
        <p className="muted">{t('pricing.ctaLead')}</p>
        <div className="planovi-cta-actions">
          <Link className="button button-primary" to="/auth">
            {t('pricing.ctaStart')}
          </Link>
          <Link className="button button-secondary" to="/">
            {t('pricing.ctaBack')}
          </Link>
        </div>
      </section>
    </main>
  );
}
