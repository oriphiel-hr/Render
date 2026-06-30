import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta.jsx';
import { getFairnessReport } from '../api/index.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function FairnessReportPage() {
  const { t, catalog } = useI18n();
  const [report, setReport] = useState(null);
  const premiumItems = catalog.fairnessReport?.premiumItems ?? [];

  useEffect(() => {
    getFairnessReport().then((data) => {
      if (data?.success) setReport(data.report);
    });
  }, []);

  const stats = report?.stats;

  return (
    <main className="page fairness-report-page">
      <PageMeta titleKey="fairnessReport" descriptionKey="fairnessReport" />
      <section className="hero legal-hero">
        <h1>{t('fairnessReport.title')}</h1>
        <p className="subtitle">{t('fairnessReport.subtitle')}</p>
      </section>
      {stats && (
        <article className="card">
          <h2 className="section-title">{t('fairnessReport.statsTitle')}</h2>
          <div className="impact-grid">
            <div className="impact-stat">
              <strong>{stats.contactsLast30Days}</strong>
              <span className="muted">{t('donate.impactContacts')}</span>
            </div>
            <div className="impact-stat">
              <strong>{stats.matchesLast30Days ?? '—'}</strong>
              <span className="muted">Matchova (30d)</span>
            </div>
            <div className="impact-stat">
              <strong>{stats.supporterCount}</strong>
              <span className="muted">{t('donate.impactSupporters')}</span>
            </div>
            <div className="impact-stat">
              <strong>{stats.donationCoveragePercent}%</strong>
              <span className="muted">{t('donate.impactCoverage')}</span>
            </div>
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
