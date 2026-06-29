import { useEffect, useState } from 'react';
import {
  getAdminAuditEvents,
  getAdminFeedExplain,
  getAdminModerationDecisions,
  getAdminRetentionPolicy
} from '../api/index.js';
import { formatDateTime, labelAuditAction, labelAuditCategory, labelIdentity, labelModerationAction } from '../lib/labels.js';

const AUDIT_TABS = [
  { id: 'timeline', label: 'Dnevnik' },
  { id: 'moderation', label: 'Moderacija' },
  { id: 'fairness', label: 'Poštenost' },
  { id: 'feed', label: 'Feed rang' },
  { id: 'compliance', label: 'Compliance' }
];

export default function AdminAuditPanel({ token, audit, users, onRefresh, onMessage }) {
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
    else onMessage(data?.error || 'Feed explain nije dostupan.', 'error');
  }

  useEffect(() => {
    if (tab === 'timeline') loadTimeline();
    if (tab === 'moderation') loadDecisions();
    if (tab === 'compliance') loadRetention();
  }, [tab, category, token]);

  return (
    <section className="card admin-audit-panel">
      <h2 className="section-title">Revizija i audit</h2>
      <div className="admin-audit-tabs" role="tablist">
        {AUDIT_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={tab === item.id ? 'button button-secondary button-sm active' : 'button button-ghost button-sm'}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'timeline' && (
        <div className="admin-audit-body">
          <div className="admin-audit-filters">
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Kategorija audita">
              <option value="">Sve kategorije</option>
              <option value="ADMIN_ACTION">Admin akcije</option>
              <option value="MODERATION">Moderacija</option>
              <option value="SECURITY">Sigurnost</option>
              <option value="FEED_RANKING">Feed rang</option>
              <option value="COMPLIANCE">Compliance</option>
            </select>
            <button type="button" className="button button-ghost button-sm" onClick={loadTimeline}>
              Osvježi
            </button>
          </div>
          <ul className="audit-timeline">
            {events.length === 0 && <li className="muted">Nema zapisa.</li>}
            {events.map((event) => (
              <li key={event.id} className="audit-timeline-item">
                <div className="audit-timeline-head">
                  <span className="chip">{labelAuditCategory(event.category)}</span>
                  <span className="chip chip-muted">{labelAuditAction(event.action)}</span>
                  <time className="muted">{formatDateTime(event.createdAt)}</time>
                </div>
                <p>{event.summary}</p>
                <p className="muted audit-timeline-meta">
                  {event.actor?.displayName && <>Od: {event.actor.displayName} · </>}
                  {event.target?.displayName && <>Na: {event.target.displayName}</>}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'moderation' && (
        <div className="admin-audit-body">
          <p className="muted">Povijest odluka o prijavama — tko je riješio, koja akcija, suspend/brisanje.</p>
          <ul className="audit-timeline">
            {decisions.length === 0 && <li className="muted">Još nema odluka.</li>}
            {decisions.map((row) => (
              <li key={row.id} className="audit-timeline-item">
                <div className="audit-timeline-head">
                  <span className="chip">{row.outcome}</span>
                  <span className="chip">{labelModerationAction(row.actionTaken)}</span>
                  <time className="muted">{formatDateTime(row.createdAt)}</time>
                </div>
                <p>
                  <strong>{row.reported?.displayName || '—'}</strong>
                  {row.report?.reason ? ` — ${row.report.reason}` : ''}
                </p>
                <p className="muted">
                  Riješio/la: {row.resolver?.displayName || '—'}
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
              <h3 className="subsection-title">Po gradu (dostupni)</h3>
              <ul className="compact-list">
                {(audit.trends.byCity || []).map((row) => (
                  <li key={row.city}>{row.city}: {row.available}</li>
                ))}
              </ul>
              <h3 className="subsection-title">Po identitetu</h3>
              <ul className="compact-list">
                {(audit.trends.byIdentity || []).map((row) => (
                  <li key={row.identity}>{labelIdentity(row.identity)}: {row.available}</li>
                ))}
              </ul>
              <h3 className="subsection-title">Novi korisnici</h3>
              <p className="muted">
                7d: {audit.trends.newUsers?.last7d ?? '—'} · 30d: {audit.trends.newUsers?.last30d ?? '—'} ·
                bez kontakta (7d): {audit.trends.newUsers?.withoutIncoming7d ?? '—'}
              </p>
            </>
          )}
          {audit.metrics && (
            <p className="muted">
              Bez dolaznih (7d): {audit.metrics.usersWithoutIncoming7d} · Pending: {audit.metrics.pendingRequests7d} ·
              Accepted: {audit.metrics.acceptedRequests7d}
            </p>
          )}
        </div>
      )}

      {tab === 'feed' && (
        <div className="admin-audit-body">
          <p className="muted">Zašto je profil X iznad Y — transparentno objašnjenje rangiranja (paket ne daje bodove).</p>
          <div className="admin-search-row">
            <select value={feedViewerId} onChange={(e) => setFeedViewerId(e.target.value)} aria-label="Korisnik čiji feed">
              <option value="">Odaberi korisnika…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.displayName} ({u.email})</option>
              ))}
            </select>
            <button type="button" className="button button-secondary" onClick={() => loadFeedExplain(feedViewerId)} disabled={!feedViewerId}>
              Prikaži rang
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
                    <th>#</th>
                    <th>Profil</th>
                    <th>Grad</th>
                    <th>Bodovi</th>
                    <th>Faktori</th>
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
          <p className="muted">Zadržavanje audit zapisa: {retention.auditRetentionDays} dana</p>
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
  const value = form || { outcome: 'RESOLVED', actionTaken: 'NONE', notes: '' };
  return (
    <div className="moderation-resolve-form">
      <select value={value.outcome} onChange={(e) => onChange(reportId, 'outcome', e.target.value)} aria-label="Ishod">
        <option value="RESOLVED">Riješeno</option>
        <option value="DISMISSED">Odbijeno</option>
      </select>
      <select value={value.actionTaken} onChange={(e) => onChange(reportId, 'actionTaken', e.target.value)} aria-label="Akcija">
        <option value="NONE">Bez akcije</option>
        <option value="WARN">Upozorenje</option>
        <option value="SUSPEND">Suspend</option>
        <option value="DELETE">Obriši korisnika</option>
      </select>
      <input
        placeholder="Bilješka (opcionalno)"
        value={value.notes}
        onChange={(e) => onChange(reportId, 'notes', e.target.value)}
      />
      <button type="button" className="button button-primary button-sm" onClick={() => onSubmit(reportId)}>
        Riješi i zapiši
      </button>
    </div>
  );
}
