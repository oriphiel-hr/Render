import { Link } from 'react-router-dom';
import { getDonateRevolutUrl, hasRevolut, isDonateConfigured } from '../lib/donate-config.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function VoluntarySupportTeaser({ token }) {
  const { t } = useI18n();

  if (!isDonateConfigured()) return null;

  const revolutUrl = getDonateRevolutUrl();

  return (
    <section className="card planovi-support" aria-labelledby="planovi-support-heading">
      <p className="eyebrow">{t('pricing.supportEyebrow')}</p>
      <h2 id="planovi-support-heading" className="section-title">{t('pricing.supportTitle')}</h2>
      <p className="muted">{t('pricing.supportLead')}</p>
      <div className="planovi-support-actions">
        {hasRevolut() && (
          <a
            className="button button-secondary"
            href={revolutUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('pricing.supportRevolutBtn')}
          </a>
        )}
        {token && (
          <Link className="button button-ghost" to="/app/podrzi">
            {t('pricing.supportAppLink')}
          </Link>
        )}
      </div>
      <p className="muted donate-note">{t('donate.note')}</p>
    </section>
  );
}
