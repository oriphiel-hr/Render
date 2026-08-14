'use client';

import Link from '../components/Link.jsx';
import { useI18n } from '../lib/i18n/index.jsx';

/** SSR: report dolazi s servera. */
export default function FairnessReportPage({ report = null }) {
  const { t, catalog } = useI18n();
  const premiumItems = catalog.fairnessReport?.premiumItems ?? [];
  const stats = report?.stats;

  return (
    <main className="page fairness-report-page">
      <section className="hero legal-hero">
        <h1>{t('fairnessReport.title')}</h1>
        <p className="subtitle">{t('fairnessReport.subtitle')}</p>
      </section>
      {stats && (
        <article className="card">
          <h2 className="section-title">{t('fairnessReport.statsTitle')}</h2>
          <div className="impact-grid">
            {stats.contactsLast30Days != null && (
              <div className="impact-stat">
                <strong>{stats.contactsLast30Days}</strong>
                <span className="muted">{t('donate.impactContacts')}</span>
              </div>
            )}
            {stats.matchesLast30Days != null && (
              <div className="impact-stat">
                <strong>{stats.matchesLast30Days}</strong>
                <span className="muted">Matchova (30d)</span>
              </div>
            )}
            {stats.supporterCount != null && (
              <div className="impact-stat">
                <strong>{stats.supporterCount}</strong>
                <span className="muted">{t('donate.impactSupporters')}</span>
              </div>
            )}
            {stats.donationCoveragePercent != null && (
              <div className="impact-stat">
                <strong>{stats.donationCoveragePercent}%</strong>
                <span className="muted">{t('donate.impactCoverage')}</span>
              </div>
            )}
          </div>
        </article>
      )}
      <article className="card">
        <h2 className="section-title">{t('fairnessReport.premiumTitle')}</h2>
        <ul className="contact-topics">
          {premiumItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
      <article className="card">
        <h2 className="section-title">{t('fairnessReport.changesTitle')}</h2>
        {report?.stats?.fairnessChanges90d?.length ? (
          <ul className="contact-topics">
            {report.stats.fairnessChanges90d.map((row) => (
              <li key={row.at}>
                {new Date(row.at).toLocaleDateString()} — limit {row.oldDailyLimit} → {row.newDailyLimit}:{' '}
                {row.reason}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">{t('fairnessReport.noChanges')}</p>
        )}
      </article>
      <p className="auth-footer">
        <Link to="/kako-radi-feed">{t('fairFeed.title')}</Link>
        {' · '}
        <Link to="/doniraj">{t('nav.donate')}</Link>
        {' · '}
        <Link to="/">{t('common.backHome')}</Link>
      </p>
    </main>
  );
}
