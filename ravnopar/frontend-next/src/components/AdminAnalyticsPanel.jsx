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

function formatLanguage(code) {
  if (!code || code === '—') return '—';
  try {
    const name = new Intl.DisplayNames(['hr'], { type: 'language' }).of(code.split('-')[0]);
    return name ? `${name} (${code})` : code;
  } catch {
    return code;
  }
}

function eventLabel(name, t) {
  const key = `admin.analyticsEvents.${name}`;
  const label = t(key);
  return label === key ? name : label;
}

function MetricsTable({ title, rows, nameLabel, visitorsLabel, pageviewsLabel, formatName }) {
  if (!rows?.length) return null;

  return (
    <div>
      <h3 className="admin-analytics-table-title">{title}</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{nameLabel}</th>
              <th>{visitorsLabel}</th>
              {pageviewsLabel && <th>{pageviewsLabel}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{formatName ? formatName(row.name) : row.name}</td>
                <td>{row.visitors}</td>
                {pageviewsLabel && <td>{row.pageviews}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPanel({ analytics, loading = false }) {
  const { t, countryName } = useI18n();

  if (loading || !analytics) {
    return (
      <section className="card admin-analytics">
        <h2 className="section-title">{t('admin.analyticsTitle')}</h2>
        <p className="muted">{t('admin.analyticsLoading')}</p>
      </section>
    );
  }

  const { configured, summary, error, shareUrl, externalUrl, siteId } = analytics;
  const tableProps = {
    nameLabel: t('admin.analyticsName'),
    visitorsLabel: t('admin.analyticsVisitors'),
    pageviewsLabel: t('admin.analyticsPageviews')
  };

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
            <StatCard label={t('admin.analyticsActiveNow')} value={summary.activeNow} />
            <StatCard label={t('admin.analyticsVisitorsToday')} value={summary.visitorsToday} />
            <StatCard label={t('admin.analyticsPageviewsToday')} value={summary.pageviewsToday} />
            <StatCard label={t('admin.analyticsVisitors7d')} value={summary.visitors7d} />
            <StatCard label={t('admin.analyticsPageviews7d')} value={summary.pageviews7d} />
            <StatCard label={t('admin.analyticsVisits7d')} value={summary.visits7d} />
            <StatCard label={t('admin.analyticsVisitors30d')} value={summary.visitors30d} />
            <StatCard label={t('admin.analyticsBounce7d')} value={formatPercent(summary.bounceRate7d)} />
            <StatCard
              label={t('admin.analyticsDuration7d')}
              value={formatDuration(summary.visitDuration7d)}
            />
          </div>

          <div className="admin-analytics-tables">
            <MetricsTable
              title={t('admin.analyticsTopEvents')}
              rows={summary.topEvents}
              nameLabel={t('admin.analyticsEvent')}
              visitorsLabel={t('admin.analyticsEventCount')}
              formatName={(name) => eventLabel(name, t)}
            />
            <MetricsTable
              title={t('admin.analyticsTopPages')}
              rows={summary.topPages}
              {...tableProps}
            />
            <MetricsTable
              title={t('admin.analyticsTopSources')}
              rows={summary.topSources}
              nameLabel={t('admin.analyticsSource')}
              visitorsLabel={t('admin.analyticsVisitors')}
            />
            <MetricsTable
              title={t('admin.analyticsTopCountries')}
              rows={summary.topCountries}
              nameLabel={t('admin.analyticsCountry')}
              visitorsLabel={t('admin.analyticsVisitors')}
              pageviewsLabel={t('admin.analyticsPageviews')}
              formatName={(code) => countryName(code) || code}
            />
            <MetricsTable
              title={t('admin.analyticsTopCities')}
              rows={summary.topCities}
              nameLabel={t('admin.analyticsCity')}
              visitorsLabel={t('admin.analyticsVisitors')}
              pageviewsLabel={t('admin.analyticsPageviews')}
            />
            <MetricsTable
              title={t('admin.analyticsTopDevices')}
              rows={summary.topDevices}
              nameLabel={t('admin.analyticsDevice')}
              visitorsLabel={t('admin.analyticsVisitors')}
              pageviewsLabel={t('admin.analyticsPageviews')}
            />
            <MetricsTable
              title={t('admin.analyticsTopLanguages')}
              rows={summary.topLanguages}
              nameLabel={t('admin.analyticsLanguage')}
              visitorsLabel={t('admin.analyticsVisitors')}
              pageviewsLabel={t('admin.analyticsPageviews')}
              formatName={formatLanguage}
            />
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
