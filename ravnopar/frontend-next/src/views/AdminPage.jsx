'use client';

import { useEffect, useState } from 'react';
import {
  deleteAdminUser,
  getAdminAnalytics,
  getAdminOverview,
  getAdminPayments,
  getAdminRiskOverview,
  getAdminUsers,
  getAdminVerificationQueue,
  getFairnessAudit,
  getModerationQueue,
  rejectAdminVerification,
  resolveAdminReport,
  runTimeoutSweep,
  updateAdminUser,
  updateFairnessConfig
} from '../api/index.js';
import AdminAuditPanel, { ModerationResolveForm } from '../components/AdminAuditPanel.jsx';
import AdminAnalyticsPanel from '../components/AdminAnalyticsPanel.jsx';
import PageMeta from '../components/PageMeta.jsx';
import { useI18n } from '../lib/i18n/index.jsx';
import { ADMIN_PLAN_TIERS } from '../lib/labels.js';

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <span className="muted stat-label">{label}</span>
      <strong className="stat-value">{value ?? '—'}</strong>
    </article>
  );
}

export default function AdminPage({ token, profile }) {
  const { t, labels } = useI18n();
  const { labelRole, labelPlanTier, labelReportStatus, labelAvailability, formatDateTime } = labels;

  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [riskItems, setRiskItems] = useState([]);
  const [audit, setAudit] = useState(null);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [statusKind, setStatusKind] = useState('info');
  const [busy, setBusy] = useState(false);
  const [thresholdHours, setThresholdHours] = useState(72);
  const [newDailyLimit, setNewDailyLimit] = useState(30);
  const [resolveForms, setResolveForms] = useState({});

  function setMessage(message, kind = 'info') {
    setStatus(message);
    setStatusKind(kind);
  }

  async function loadAll() {
    const [ov, analyticsData, userData, payData, modData, auditData, riskData, verifyData] = await Promise.all([
      getAdminOverview(token),
      getAdminAnalytics(token),
      getAdminUsers(token),
      getAdminPayments(token),
      getModerationQueue(token),
      getFairnessAudit(token),
      getAdminRiskOverview(token),
      getAdminVerificationQueue(token)
    ]);
    if (ov?.success) setOverview(ov);
    if (analyticsData?.success) setAnalytics(analyticsData.analytics);
    if (userData?.success) setUsers(userData.items || []);
    if (payData?.success) setPayments(payData.items || []);
    if (modData?.success) setModerationQueue(modData.items || []);
    if (auditData?.success) setAudit(auditData);
    if (riskData?.success) setRiskItems(riskData.items || []);
    if (verifyData?.success) setVerificationQueue(verifyData.items || []);
  }

  useEffect(() => {
    loadAll();
  }, [token]);

  async function searchUsers() {
    const data = await getAdminUsers(token, search);
    if (data?.success) setUsers(data.items || []);
  }

  async function patchUser(profileId, payload) {
    const data = await updateAdminUser(token, profileId, payload);
    if (data?.success) {
      setMessage(t('admin.userUpdated'), 'success');
      await loadAll();
    } else {
      setMessage(data?.error || t('admin.updateFailed'), 'error');
    }
  }

  async function removeUser(user) {
    const confirmed = window.confirm(
      t('admin.deleteConfirm', { name: user.displayName, email: user.email })
    );
    if (!confirmed) return;

    const data = await deleteAdminUser(token, user.id);
    if (data?.success) {
      setMessage(t('admin.userDeleted'), 'success');
      await loadAll();
    } else {
      setMessage(data?.error || t('admin.deleteFailed'), 'error');
    }
  }

  async function sweep() {
    setBusy(true);
    const data = await runTimeoutSweep(token, thresholdHours);
    setMessage(
      data?.success ? t('admin.sweepSuccess', { count: data.closedPairs }) : data?.error || t('admin.sweepFailed'),
      data?.success ? 'success' : 'error'
    );
    await loadAll();
    setBusy(false);
  }

  async function saveLimit() {
    const data = await updateFairnessConfig(token, newDailyLimit, 'Admin limit change');
    setMessage(data?.success ? t('admin.limitSaved') : data?.error || t('admin.sweepFailed'), data?.success ? 'success' : 'error');
  }

  async function resolveReport(reportId) {
    const form = resolveForms[reportId] || { outcome: 'RESOLVED', actionTaken: 'NONE', notes: '' };
    if (form.actionTaken === 'DELETE' && !window.confirm(t('admin.deleteReportedConfirm'))) return;
    if (form.actionTaken === 'SUSPEND' && !window.confirm(t('admin.suspendReportedConfirm'))) return;

    const data = await resolveAdminReport(token, {
      reportId,
      outcome: form.outcome,
      actionTaken: form.actionTaken,
      notes: form.notes || undefined
    });
    if (data?.success) {
      setMessage(t('admin.reportResolved'), 'success');
      await loadAll();
    } else {
      setMessage(data?.error || t('admin.reportFailed'), 'error');
    }
  }

  function setResolveField(reportId, field, value) {
    setResolveForms((prev) => ({
      ...prev,
      [reportId]: { outcome: 'RESOLVED', actionTaken: 'NONE', notes: '', ...prev[reportId], [field]: value }
    }));
  }

  async function rejectVerification(profileId) {
    const data = await rejectAdminVerification(token, profileId);
    setMessage(data?.success ? t('admin.selfieRejected') : data?.error || t('admin.sweepFailed'), data?.success ? 'success' : 'error');
    if (data?.success) await loadAll();
  }

  const stats = overview?.stats;

  return (
    <main className="page admin-page">
      <PageMeta title={t('meta.titles.admin')} description={t('meta.descriptions.admin')} />
      <section className="hero admin-hero">
        <h1>{t('admin.title')}</h1>
        <p className="subtitle">{t('admin.subtitle')}</p>
        {profile?.role === 'ADMIN' && (
          <p className="admin-session-role">
            {t('admin.loggedInAs')}{' '}
            <span className="chip chip-admin">{labelRole('ADMIN')}</span>
            <span className="muted"> · {profile.displayName}</span>
          </p>
        )}
      </section>

      {status && <p className={`status-banner status-${statusKind}`}>{status}</p>}

      {stats && (
        <section className="stat-grid">
          <StatCard label={t('admin.stats.totalProfiles')} value={stats.totalProfiles} />
          <StatCard label={t('admin.stats.available')} value={stats.availableProfiles} />
          <StatCard label={t('admin.stats.focused')} value={stats.focusedProfiles} />
          <StatCard label={t('admin.stats.paused')} value={stats.pausedProfiles} />
          <StatCard label={t('admin.stats.suspended')} value={stats.suspendedAccounts} />
          <StatCard label={t('admin.stats.openReports')} value={stats.openReports} />
          <StatCard label={t('admin.stats.pendingContacts')} value={stats.pendingContacts} />
          <StatCard label={t('admin.stats.matches30d')} value={stats.accepted30d} />
          <StatCard label={t('admin.stats.messages7d')} value={stats.messages7d} />
        </section>
      )}

      <AdminAnalyticsPanel analytics={analytics} />

      <section className="card admin-tools">
        <h2 className="section-title">{t('admin.quickActions')}</h2>
        <div className="form-grid">
          <label>
            {t('admin.inactivityThreshold')}
            <input type="number" min={1} value={thresholdHours} onChange={(e) => setThresholdHours(Number(e.target.value))} />
          </label>
          <label>
            {t('admin.dailyContactLimit')}
            <input type="number" min={5} max={200} value={newDailyLimit} onChange={(e) => setNewDailyLimit(Number(e.target.value))} />
          </label>
        </div>
        <div className="admin-actions">
          <button type="button" className="button button-primary" onClick={sweep} disabled={busy}>
            {t('admin.closeInactive')}
          </button>
          <button type="button" className="button button-secondary" onClick={saveLimit}>
            {t('admin.saveLimit')}
          </button>
          <button type="button" className="button button-secondary" onClick={loadAll}>
            {t('admin.refreshAll')}
          </button>
        </div>
      </section>

      {verificationQueue.length > 0 && (
        <section>
          <h2 className="section-title">{t('admin.verificationTitle', { count: verificationQueue.length })}</h2>
          <div className="admin-card-grid">
            {verificationQueue.map((item) => (
              <article key={item.id} className="card admin-verify-card">
                <h3>{item.displayName}</h3>
                <p className="muted">{item.email} · {item.city}</p>
                <div className="verify-compare">
                  <div>
                    <p className="muted">{t('admin.profilePhoto')}</p>
                    {item.photos?.[0] ? (
                      <img src={item.photos[0]} alt="" className="verify-photo" />
                    ) : (
                      <p className="muted">{t('admin.noPhoto')}</p>
                    )}
                  </div>
                  <div>
                    <p className="muted">{t('admin.selfie')}</p>
                    <img src={item.verificationSelfie} alt="" className="verify-photo" />
                  </div>
                </div>
                <div className="admin-row-actions">
                  <button
                    type="button"
                    className="button button-primary button-sm"
                    onClick={() => patchUser(item.id, { photoVerified: true })}
                  >
                    {t('admin.approve')}
                  </button>
                  <button
                    type="button"
                    className="button button-ghost button-sm"
                    onClick={() => rejectVerification(item.id)}
                  >
                    {t('admin.reject')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <h2 className="section-title">{t('admin.usersTitle')}</h2>
        <div className="admin-search-row">
          <input placeholder={t('admin.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="button" className="button button-secondary" onClick={searchUsers}>
            {t('admin.search')}
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.tableName')}</th>
                <th>{t('admin.tableEmail')}</th>
                <th>{t('admin.tableCity')}</th>
                <th>{t('admin.tableRole')}</th>
                <th>{t('admin.tablePlan')}</th>
                <th>{t('admin.tableStatus')}</th>
                <th>{t('admin.tableActions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.displayName}</td>
                  <td>{user.email}</td>
                  <td>{user.city}</td>
                  <td>
                    <span className={`chip ${user.role === 'ADMIN' ? 'chip-admin' : ''}`}>
                      {labelRole(user.role || 'USER')}
                    </span>
                  </td>
                  <td>
                    <select
                      className="admin-plan-select"
                      value={user.planTier || 'free'}
                      aria-label={t('admin.planFor', { name: user.displayName })}
                      onChange={(e) => patchUser(user.id, { planTier: e.target.value })}
                    >
                      {ADMIN_PLAN_TIERS.map((tier) => (
                        <option key={tier} value={tier}>
                          {labelPlanTier(tier)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {user.suspended ? t('admin.suspended') : labelAvailability(user.availability)}
                    {user.photoVerified ? ' · ✓' : ''}
                  </td>
                  <td className="admin-actions-cell">
                    <div className="admin-row-actions">
                    <button type="button" className="button button-ghost button-sm" onClick={() => patchUser(user.id, { photoVerified: true })}>
                      {t('admin.verify')}
                    </button>
                    <button type="button" className="button button-ghost button-sm" onClick={() => patchUser(user.id, { suspended: !user.suspended })}>
                      {user.suspended ? t('admin.unsuspend') : t('admin.suspend')}
                    </button>
                    {user.role === 'ADMIN' ? (
                      <button
                        type="button"
                        className="button button-ghost button-sm"
                        disabled={user.id === profile?.id}
                        title={user.id === profile?.id ? t('admin.cannotRemoveOwnAdmin') : undefined}
                        onClick={() => patchUser(user.id, { role: 'USER' })}
                      >
                        {t('admin.removeAdmin')}
                      </button>
                    ) : (
                      <button type="button" className="button button-ghost button-sm" onClick={() => patchUser(user.id, { role: 'ADMIN' })}>
                        {t('admin.setAdmin')}
                      </button>
                    )}
                    <button
                      type="button"
                      className="button button-sm admin-delete-btn"
                      disabled={user.id === profile?.id || user.role === 'ADMIN'}
                      title={
                        user.id === profile?.id
                          ? t('admin.cannotDeleteSelf')
                          : user.role === 'ADMIN'
                            ? t('admin.cannotDeleteAdmin')
                            : t('admin.deleteUserTitle')
                      }
                      onClick={() => removeUser(user)}
                    >
                      {t('admin.delete')}
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {moderationQueue.length > 0 && (
        <section>
          <h2 className="section-title">{t('admin.moderationTitle')}</h2>
          <div className="admin-card-grid">
            {(overview?.recentReports?.length ? overview.recentReports : moderationQueue).map((item) => (
              <article key={item.id} className="card admin-moderation-card">
                <span className="chip">{labelReportStatus(item.status)}</span>
                <p><strong>{item.reportedName || item.reportedId}</strong></p>
                <p className="muted">{t('admin.reportedBy')} {item.reporterName || item.reporterId}</p>
                <p>{item.reason}</p>
                <p className="muted">{formatDateTime(item.createdAt)}</p>
                <ModerationResolveForm
                  reportId={item.id}
                  form={resolveForms[item.id]}
                  onChange={setResolveField}
                  onSubmit={resolveReport}
                />
              </article>
            ))}
          </div>
        </section>
      )}

      {payments.length > 0 && (
        <section className="card">
          <h2 className="section-title">{t('admin.paymentsTitle')}</h2>
          <ul className="admin-list">
            {payments.slice(0, 15).map((p) => (
              <li key={p.id}>
                <strong>{p.user?.displayName || p.userProfileId}</strong> — {(p.amountCents / 100).toFixed(2)} € — {p.status} — {p.description}
              </li>
            ))}
          </ul>
        </section>
      )}

      <AdminAuditPanel
        token={token}
        audit={audit}
        users={users}
        onRefresh={loadAll}
        onMessage={(message, kind) => setMessage(message, kind)}
      />

      {riskItems.length > 0 && (
        <section>
          <h2 className="section-title">{t('admin.riskTitle')}</h2>
          <div className="admin-card-grid">
            {riskItems.slice(0, 12).map((item) => (
              <article key={item.profileId} className="card admin-risk-card">
                <h3>{item.displayName}</h3>
                <p>{t('admin.riskScore')} {item.riskScore}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
