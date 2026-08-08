'use client';

import { useI18n } from '../lib/i18n/index.jsx';

/** SSR: stats dolaze s servera — bez useEffect fetcha. */
export default function DonateImpactSection({ stats = null }) {
  const { t } = useI18n();

  if (!stats) return null;

  return (
    <section className="card donate-impact">
      <h2 className="section-title">{t('donate.impactTitle')}</h2>
      <p className="muted">{t('donate.impactLead')}</p>
      <div className="impact-grid">
        <div className="impact-stat">
          <strong>{stats.activeCount ?? stats.memberCount}</strong>
          <span className="muted">{t('donate.impactMembers')}</span>
        </div>
        <div className="impact-stat">
          <strong>{stats.contactsLast30Days}</strong>
          <span className="muted">{t('donate.impactContacts')}</span>
        </div>
        <div className="impact-stat">
          <strong>{stats.supporterCount}</strong>
          <span className="muted">{t('donate.impactSupporters')}</span>
        </div>
        <div className="impact-stat">
          <strong>{stats.donatedEur30d} €</strong>
          <span className="muted">{t('donate.impactDonated')}</span>
        </div>
      </div>
      {stats.donationCoveragePercent != null && (
        <p className="muted impact-coverage">
          {t('donate.impactCoverage')}: <strong>{stats.donationCoveragePercent}%</strong>
          {' · '}
          {t('donate.impactMonthlyCost')}: ~{stats.monthlyOperatingEur} €
        </p>
      )}
      <div className="impact-columns">
        <div>
          <h3 className="subsection-title">{t('donate.costBreakdownTitle')}</h3>
          <ul className="contact-topics">
            <li>{t('donate.costServer')}</li>
            <li>{t('donate.costEmail')}</li>
            <li>{t('donate.costDomain')}</li>
          </ul>
        </div>
        <div>
          <h3 className="subsection-title">{t('donate.whatDonationDoesNot')}</h3>
          <ul className="contact-topics">
            <li>{t('donate.notBuyBoost')}</li>
            <li>{t('donate.notBuyVisibility')}</li>
            <li>{t('donate.notBuyMessages')}</li>
          </ul>
        </div>
        <div>
          <h3 className="subsection-title">{t('donate.whatDonationDoes')}</h3>
          <ul className="contact-topics">
            <li>{t('donate.helpsServer')}</li>
            <li>{t('donate.helpsCommunity')}</li>
            <li>{t('donate.thanksBadge')}</li>
          </ul>
        </div>
      </div>
      <p className="muted">{t('donate.publicThanks')}</p>
    </section>
  );
}
