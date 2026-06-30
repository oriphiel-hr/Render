import { Link, useSearchParams } from 'react-router-dom';
import PageMeta from '../components/PageMeta.jsx';
import DonateImpactSection from '../components/DonateImpactSection.jsx';
import SupportContent from '../components/SupportContent.jsx';
import { isDonateConfigured } from '../lib/donate-config.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function PublicDonatePage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const thanks = params.get('donate') === 'thanks';

  return (
    <main className="page donate-page">
      <PageMeta titleKey="donatePublic" descriptionKey="donate" />
      {thanks && <p className="status-banner status-info">{t('home.donateThanks')}</p>}
      <section className="hero donate-hero donate-hero-warm">
        <p className="eyebrow">{t('donate.eyebrow')}</p>
        <h1>{t('donate.title')}</h1>
        <p className="landing-lead">{t('donate.lead')}</p>
      </section>
      <DonateImpactSection />
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
