import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta.jsx';
import SupportContent from '../components/SupportContent.jsx';
import { useI18n } from '../lib/i18n/index.jsx';

export default function DonatePage() {
  const { t } = useI18n();

  return (
    <main className="page donate-page">
      <PageMeta titleKey="donate" descriptionKey="donate" />
      <p className="auth-footer">
        <Link to="/app">{t('donate.backToApp')}</Link>
        {' · '}
        <Link to="/planovi">{t('donate.pricingLink')}</Link>
      </p>
      <section className="hero donate-hero donate-hero-warm">
        <p className="eyebrow">{t('donate.eyebrow')}</p>
        <h1>{t('donate.title')}</h1>
        <p className="landing-lead">{t('donate.lead')}</p>
      </section>
      <SupportContent />
    </main>
  );
}
