import { useEffect, useState } from 'react';
import {
  getAdminAuditEvents,
  getAdminFeedExplain,
  getAdminModerationDecisions,
  getAdminRetentionPolicy
} from '../api/index.js';
import { useI18n } from '../lib/i18n/index.jsx';

const AUDIT_TAB_IDS = ['timeline', 'moderation', 'fairness', 'feed', 'compliance'];

const AUDIT_CATEGORY_OPTIONS = [
  { value: '', key: 'allCategories' },
  { value: 'ADMIN_ACTION', key: 'categoryAdmin' },
  { value: 'MODERATION', key: 'categoryModeration' },
  { value: 'SECURITY', key: 'categorySecurity' },
  { value: 'FEED_RANKING', key: 'categoryFeed' },
  { value: 'COMPLIANCE', key: 'categoryCompliance' }
];

const OUTCOME_LABEL_KEYS = {
  RESOLVED: 'outcomeResolved',
  DISMISSED: 'outcomeDismissed'
};

export default function AdminAuditPanel({ token, audit, users, onRefresh, onMessage }) {
  const { t, labels } = useI18n();
  const { formatDateTime, labelAuditCategory, labelAuditAction, labelModerationAction, labelIdentity } = labels;

  const [tab, setTab] = useState('timeline');
  const [category, setCategory] = useState('');
  const [events, setEvents] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [retention, setRetention] = useState(null);
  const [feedExplain, setFeedExplain] = useState(null);
  const [feedViewerId, setFeedViewerId] = useState('');

  async function loadTimeline() {
    const data = await getAdminAuditEvents(token, category || undefined);
    if (data?.success) setEvents(data.items || []);
  }

  async function loadDecisions() {
    const data = await getAdminModerationDecisions(token);
    if (data?.success) setDecisions(data.items || []);
  }

  async function loadRetention() {
    const data = await getAdminRetentionPolicy(token);
    if (data?.success) setRetention(data.policy);
  }

  async function loadFeedExplain(viewerId) {
    if (!viewerId) return;
    const data = await getAdminFeedExplain(token, viewerId);
    if (data?.success) setFeedExplain(data);
    else onMessage(data?.error || t('audit.feedExplainFailed'), 'error');
  }

  useEffect(() => {
    if (tab === 'timeline') loadTimeline();
    if (tab === 'moderation') loadDecisions();
    if (tab === 'compliance') loadRetention();
  }, [tab, category, token]);

  return (
    <section className="card admin-audit-panel">
      <h2 className="section-title">{t('audit.title')}</h2>
      <div className="admin-audit-tabs" role="tablist">
        {AUDIT_TAB_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            className={tab === id ? 'button button-secondary button-sm active' : 'button button-ghost button-sm'}
            onClick={() => setTab(id)}
          >
            {t(`audit.tabs.${id}`)}
          </button>
        ))}
      </div>

      {tab === 'timeline' && (
        <div className="admin-audit-body">
          <div className="admin-audit-filters">
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label={t('audit.allCategories')}>
              {AUDIT_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {t(`audit.${opt.key}`)}
                </option>
              ))}
            </select>
            <button type="button" className="button button-ghost button-sm" onClick={loadTimeline}>
              {t('audit.refresh')}
            </button>
          </div>
          <ul className="audit-timeline">
            {events.length === 0 && <li className="muted">{t('audit.noEvents')}</li>}
            {events.map((event) => (
              <li key={event.id} className="audit-timeline-item">
                <div className="audit-timeline-head">
                  <span className="chip">{labelAuditCategory(event.category)}</span>
                  <span className="chip chip-muted">{labelAuditAction(event.action)}</span>
                  <time className="muted">{formatDateTime(event.createdAt)}</time>
                </div>
                <p>{event.summary}</p>
                <p className="muted audit-timeline-meta">
                  {event.actor?.displayName && <>{t('audit.actor')} {event.actor.displayName} · </>}
                  {event.target?.displayName && <>{t('audit.target')} {event.target.displayName}</>}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'moderation' && (
        <div className="admin-audit-body">
          <p className="muted">{t('audit.moderationHint')}</p>
          <ul className="audit-timeline">
            {decisions.length === 0 && <li className="muted">{t('audit.noDecisions')}</li>}
            {decisions.map((row) => (
              <li key={row.id} className="audit-timeline-item">
                <div className="audit-timeline-head">
                  <span className="chip">{t(`audit.${OUTCOME_LABEL_KEYS[row.outcome] || 'outcomeResolved'}`)}</span>
                  <span className="chip">{labelModerationAction(row.actionTaken)}</span>
                  <time className="muted">{formatDateTime(row.createdAt)}</time>
                </div>
                <p>
                  <strong>{row.reported?.displayName || '—'}</strong>
                  {row.report?.reason ? ` — ${row.report.reason}` : ''}
                </p>
                <p className="muted">
                  {t('audit.resolvedBy')} {row.resolver?.displayName || '—'}
                  {row.notes ? ` · ${row.notes}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'fairness' && audit && (
        <div className="admin-audit-body">
          <ul className="compact-list">
            {(audit.recommendations || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {audit.trends && (
            <>
              <h3 className="subsection-title">{t('audit.byCity')}</h3>
              <ul className="compact-list">
                {(audit.trends.byCity || []).map((row) => (
                  <li key={row.city}>{row.city}: {row.available}</li>
                ))}
              </ul>
              <h3 className="subsection-title">{t('audit.byIdentity')}</h3>
              <ul className="compact-list">
                {(audit.trends.byIdentity || []).map((row) => (
                  <li key={row.identity}>{labelIdentity(row.identity)}: {row.available}</li>
                ))}
              </ul>
              <h3 className="subsection-title">{t('audit.newUsers')}</h3>
              <p className="muted">
                {t('audit.newUsersStats', {
                  last7d: audit.trends.newUsers?.last7d ?? '—',
                  last30d: audit.trends.newUsers?.last30d ?? '—',
                  withoutIncoming7d: audit.trends.newUsers?.withoutIncoming7d ?? '—'
                })}
              </p>
            </>
          )}
          {audit.metrics && (
            <p className="muted">
              {t('audit.metrics', {
                withoutIncoming: audit.metrics.usersWithoutIncoming7d,
                pending: audit.metrics.pendingRequests7d,
                accepted: audit.metrics.acceptedRequests7d
              })}
            </p>
          )}
        </div>
      )}

      {tab === 'feed' && (
        <div className="admin-audit-body">
          <p className="muted">{t('audit.feedHint')}</p>
          <div className="admin-search-row">
            <select value={feedViewerId} onChange={(e) => setFeedViewerId(e.target.value)} aria-label={t('audit.feedViewer')}>
              <option value="">{t('audit.selectUser')}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.displayName} ({u.email})</option>
              ))}
            </select>
            <button type="button" className="button button-secondary" onClick={() => loadFeedExplain(feedViewerId)} disabled={!feedViewerId}>
              {t('audit.showRanking')}
            </button>
          </div>
          {feedExplain?.principles && (
            <ul className="compact-list">
              {feedExplain.principles.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          {feedExplain?.rankings?.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('audit.tableRank')}</th>
                    <th>{t('audit.tableProfile')}</th>
                    <th>{t('audit.tableCity')}</th>
                    <th>{t('audit.tableScore')}</th>
                    <th>{t('audit.tableFactors')}</th>
                  </tr>
                </thead>
                <tbody>
                  {feedExplain.rankings.map((row) => (
                    <tr key={row.profileId}>
                      <td>{row.rank}</td>
                      <td>{row.displayName}</td>
                      <td>{row.city}</td>
                      <td>{row.score}</td>
                      <td className="audit-factors">
                        {(row.factors || []).map((f) => (
                          <span key={f.key} className="chip chip-muted" title={f.detail || ''}>
                            {f.label}{f.points ? ` (+${f.points})` : ''}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'compliance' && retention && (
        <div className="admin-audit-body">
          <p>{retention.description}</p>
          <p className="muted">{t('audit.retentionDays', { days: retention.auditRetentionDays })}</p>
          <ul className="compact-list">
            {(retention.categories || []).map((cat) => (
              <li key={cat.id}>
                <strong>{cat.label}</strong> — {cat.examples}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function ModerationResolveForm({ reportId, form, onChange, onSubmit }) {
  const { t } = useI18n();
  const value = form || { outcome: 'RESOLVED', actionTaken: 'NONE', notes: '' };
  return (
    <div className="moderation-resolve-form">
      <select value={value.outcome} onChange={(e) => onChange(reportId, 'outcome', e.target.value)} aria-label={t('audit.resolveOutcome')}>
        <option value="RESOLVED">{t('audit.outcomeResolved')}</option>
        <option value="DISMISSED">{t('audit.outcomeDismissed')}</option>
      </select>
      <select value={value.actionTaken} onChange={(e) => onChange(reportId, 'actionTaken', e.target.value)} aria-label={t('audit.resolveAction')}>
        <option value="NONE">{t('audit.actionNone')}</option>
        <option value="WARN">{t('audit.actionWarn')}</option>
        <option value="SUSPEND">{t('audit.actionSuspend')}</option>
        <option value="DELETE">{t('audit.actionDelete')}</option>
      </select>
      <input
        placeholder={t('audit.resolveNotes')}
        value={value.notes}
        onChange={(e) => onChange(reportId, 'notes', e.target.value)}
      />
      <button type="button" className="button button-primary button-sm" onClick={() => onSubmit(reportId)}>
        {t('audit.resolveSubmit')}
      </button>
    </div>
  );
}
