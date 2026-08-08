import { useI18n } from '../lib/i18n/index.jsx';

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <span className="muted stat-label">{label}</span>
      <strong className="stat-value">{value ?? '—'}</strong>
    </article>
  );
}

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return '—';
  const total = Math.round(Number(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${Math.round(Number(value))}%`;
}

export default function AdminAnalyticsPanel({ analytics }) {
  const { t } = useI18n();

  if (!analytics) return null;

  const { configured, summary, error, shareUrl, externalUrl, siteId } = analytics;

  return (
    <section className="card admin-analytics">
      <div className="admin-analytics-header">
        <div>
          <h2 className="section-title">{t('admin.analyticsTitle')}</h2>
          <p className="muted admin-analytics-subtitle">{t('admin.analyticsSubtitle', { site: siteId || '—' })}</p>
        </div>
        {externalUrl && (
          <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="button button-secondary button-sm">
            {t('admin.analyticsOpenExternal')}
          </a>
        )}
      </div>

      {!configured && (
        <p className="admin-analytics-setup">{t('admin.analyticsNotConfigured')}</p>
      )}

      {error && <p className="status-banner status-error">{error}</p>}

      {summary && (
        <>
          <div className="stat-grid stat-grid-compact admin-analytics-stats">
            <StatCard label={t('admin.analyticsVisitorsToday')} value={summary.visitorsToday} />
            <StatCard label={t('admin.analyticsPageviewsToday')} value={summary.pageviewsToday} />
            <StatCard label={t('admin.analyticsVisitors7d')} value={summary.visitors7d} />
            <StatCard label={t('admin.analyticsPageviews7d')} value={summary.pageviews7d} />
            <StatCard label={t('admin.analyticsVisitors30d')} value={summary.visitors30d} />
            <StatCard label={t('admin.analyticsBounce7d')} value={formatPercent(summary.bounceRate7d)} />
            <StatCard
              label={t('admin.analyticsDuration7d')}
              value={formatDuration(summary.visitDuration7d)}
            />
          </div>

          <div className="admin-analytics-tables">
            {summary.topPages?.length > 0 && (
              <div>
                <h3 className="admin-analytics-table-title">{t('admin.analyticsTopPages')}</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t('admin.analyticsPage')}</th>
                        <th>{t('admin.analyticsVisitors')}</th>
                        <th>{t('admin.analyticsPageviews')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.topPages.map((row) => (
                        <tr key={row.page}>
                          <td>{row.page}</td>
                          <td>{row.visitors}</td>
                          <td>{row.pageviews}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {summary.topSources?.length > 0 && (
              <div>
                <h3 className="admin-analytics-table-title">{t('admin.analyticsTopSources')}</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{t('admin.analyticsSource')}</th>
                        <th>{t('admin.analyticsVisitors')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.topSources.map((row) => (
                        <tr key={row.source}>
                          <td>{row.source}</td>
                          <td>{row.visitors}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {shareUrl && (
        <div className="admin-analytics-embed">
          <h3 className="admin-analytics-table-title">{t('admin.analyticsDashboard')}</h3>
          <iframe
            title={t('admin.analyticsTitle')}
            src={shareUrl}
            loading="lazy"
            className="admin-analytics-iframe"
          />
        </div>
      )}

      {configured && !summary && !shareUrl && !error && (
        <p className="muted">{t('admin.analyticsPartialConfig')}</p>
      )}
    </section>
  );
}
