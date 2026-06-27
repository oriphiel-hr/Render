import { useEffect, useState } from 'react';
import {
  deleteAdminUser,
  getAdminOverview,
  getAdminPayments,
  getAdminRiskOverview,
  getAdminUsers,
  getAdminVerificationQueue,
  getFairnessAudit,
  getModerationQueue,
  rejectAdminVerification,
  runTimeoutSweep,
  updateAdminUser,
  updateFairnessConfig,
  updateReportStatus
} from '../api/index.js';
import PageMeta from '../components/PageMeta.jsx';
import { ADMIN_PLAN_TIERS, formatDateTime, labelPlanTier, labelReportStatus, labelRole } from '../lib/labels.js';

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <span className="muted stat-label">{label}</span>
      <strong className="stat-value">{value ?? '—'}</strong>
    </article>
  );
}

export default function AdminPage({ token, profile }) {
  const [overview, setOverview] = useState(null);
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

  function setMessage(message, kind = 'info') {
    setStatus(message);
    setStatusKind(kind);
  }

  async function loadAll() {
    const [ov, userData, payData, modData, auditData, riskData, verifyData] = await Promise.all([
      getAdminOverview(token),
      getAdminUsers(token),
      getAdminPayments(token),
      getModerationQueue(token),
      getFairnessAudit(token),
      getAdminRiskOverview(token),
      getAdminVerificationQueue(token)
    ]);
    if (ov?.success) setOverview(ov);
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
      setMessage('Korisnik ažuriran.', 'success');
      await loadAll();
    } else {
      setMessage(data?.error || 'Ažuriranje nije uspjelo.', 'error');
    }
  }

  async function removeUser(user) {
    const confirmed = window.confirm(
      `Trajno obrisati korisnika ${user.displayName} (${user.email})?\n\nOva radnja se ne može poništiti.`
    );
    if (!confirmed) return;

    const data = await deleteAdminUser(token, user.id);
    if (data?.success) {
      setMessage('Korisnik obrisan.', 'success');
      await loadAll();
    } else {
      setMessage(data?.error || 'Brisanje nije uspjelo.', 'error');
    }
  }

  async function sweep() {
    setBusy(true);
    const data = await runTimeoutSweep(token, thresholdHours);
    setMessage(
      data?.success ? `Zatvoreno parova: ${data.closedPairs}.` : data?.error || 'Neuspjeh.',
      data?.success ? 'success' : 'error'
    );
    await loadAll();
    setBusy(false);
  }

  async function saveLimit() {
    const data = await updateFairnessConfig(token, newDailyLimit, 'Admin promjena limita');
    setMessage(data?.success ? 'Limit spremljen.' : data?.error || 'Neuspjeh.', data?.success ? 'success' : 'error');
  }

  async function resolveReport(reportId) {
    const data = await updateReportStatus(token, reportId, 'RESOLVED');
    if (data?.success) {
      setMessage('Prijava riješena.', 'success');
      await loadAll();
    }
  }

  async function rejectVerification(profileId) {
    const data = await rejectAdminVerification(token, profileId);
    setMessage(data?.success ? 'Selfie odbijen.' : data?.error || 'Neuspjeh.', data?.success ? 'success' : 'error');
    if (data?.success) await loadAll();
  }

  const stats = overview?.stats;

  return (
    <main className="page admin-page">
      <PageMeta title="Admin" description="Ravnopar admin centar." />
      <section className="hero admin-hero">
        <h1>Admin centar</h1>
        <p className="subtitle">Korisnici, moderacija, plaćanja i poštenost platforme.</p>
        {profile?.role === 'ADMIN' && (
          <p className="admin-session-role">
            Prijavljen kao <span className="chip chip-admin">{labelRole('ADMIN')}</span>
            <span className="muted"> · {profile.displayName}</span>
          </p>
        )}
      </section>

      {status && <p className={`status-banner status-${statusKind}`}>{status}</p>}

      {stats && (
        <section className="stat-grid">
          <StatCard label="Ukupno profila" value={stats.totalProfiles} />
          <StatCard label="Dostupni" value={stats.availableProfiles} />
          <StatCard label="U razgovoru" value={stats.focusedProfiles} />
          <StatCard label="Pauzirani" value={stats.pausedProfiles} />
          <StatCard label="Suspendirani" value={stats.suspendedAccounts} />
          <StatCard label="Otvorene prijave" value={stats.openReports} />
          <StatCard label="Pending kontakti" value={stats.pendingContacts} />
          <StatCard label="Match (30d)" value={stats.accepted30d} />
          <StatCard label="Poruke (7d)" value={stats.messages7d} />
        </section>
      )}

      <section className="card admin-tools">
        <h2 className="section-title">Brze akcije</h2>
        <div className="form-grid">
          <label>
            Prag neaktivnosti (h)
            <input type="number" min={1} value={thresholdHours} onChange={(e) => setThresholdHours(Number(e.target.value))} />
          </label>
          <label>
            Dnevni limit kontakata
            <input type="number" min={5} max={200} value={newDailyLimit} onChange={(e) => setNewDailyLimit(Number(e.target.value))} />
          </label>
        </div>
        <div className="admin-actions">
          <button type="button" className="button button-primary" onClick={sweep} disabled={busy}>
            Zatvori neaktivne parove
          </button>
          <button type="button" className="button button-secondary" onClick={saveLimit}>
            Spremi limit
          </button>
          <button type="button" className="button button-secondary" onClick={loadAll}>
            Osvježi sve
          </button>
        </div>
      </section>

      {verificationQueue.length > 0 && (
        <section>
          <h2 className="section-title">Verifikacija profila ({verificationQueue.length})</h2>
          <div className="admin-card-grid">
            {verificationQueue.map((item) => (
              <article key={item.id} className="card admin-verify-card">
                <h3>{item.displayName}</h3>
                <p className="muted">{item.email} · {item.city}</p>
                <div className="verify-compare">
                  <div>
                    <p className="muted">Profilna</p>
                    {item.photos?.[0] ? (
                      <img src={item.photos[0]} alt="" className="verify-photo" />
                    ) : (
                      <p className="muted">Nema fotke</p>
                    )}
                  </div>
                  <div>
                    <p className="muted">Selfie</p>
                    <img src={item.verificationSelfie} alt="" className="verify-photo" />
                  </div>
                </div>
                <div className="admin-row-actions">
                  <button
                    type="button"
                    className="button button-primary button-sm"
                    onClick={() => patchUser(item.id, { photoVerified: true })}
                  >
                    Odobri
                  </button>
                  <button
                    type="button"
                    className="button button-ghost button-sm"
                    onClick={() => rejectVerification(item.id)}
                  >
                    Odbij
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <h2 className="section-title">Korisnici</h2>
        <div className="admin-search-row">
          <input placeholder="Pretraži ime, email, grad..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="button" className="button button-secondary" onClick={searchUsers}>
            Pretraži
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ime</th>
                <th>Email</th>
                <th>Grad</th>
                <th>Uloga</th>
                <th>Paket</th>
                <th>Status</th>
                <th>Akcije</th>
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
                      aria-label={`Paket za ${user.displayName}`}
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
                    {user.suspended ? 'Suspendiran' : user.availability}
                    {user.photoVerified ? ' · ✓' : ''}
                  </td>
                  <td className="admin-row-actions">
                    <button type="button" className="button button-ghost button-sm" onClick={() => patchUser(user.id, { photoVerified: true })}>
                      Verificiraj
                    </button>
                    <button type="button" className="button button-ghost button-sm" onClick={() => patchUser(user.id, { suspended: !user.suspended })}>
                      {user.suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    {user.role === 'ADMIN' ? (
                      <button
                        type="button"
                        className="button button-ghost button-sm"
                        disabled={user.id === profile?.id}
                        title={user.id === profile?.id ? 'Ne možeš ukloniti vlastitu admin ulogu' : undefined}
                        onClick={() => patchUser(user.id, { role: 'USER' })}
                      >
                        Ukloni admin
                      </button>
                    ) : (
                      <button type="button" className="button button-ghost button-sm" onClick={() => patchUser(user.id, { role: 'ADMIN' })}>
                        Postavi admin
                      </button>
                    )}
                    <button
                      type="button"
                      className="button button-sm admin-delete-btn"
                      disabled={user.id === profile?.id || user.role === 'ADMIN'}
                      title={
                        user.id === profile?.id
                          ? 'Ne možeš obrisati vlastiti račun'
                          : user.role === 'ADMIN'
                            ? 'Admin računi se ne brišu iz panela'
                            : 'Trajno obriši korisnika'
                      }
                      onClick={() => removeUser(user)}
                    >
                      Obriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {moderationQueue.length > 0 && (
        <section>
          <h2 className="section-title">Moderacija</h2>
          <div className="admin-card-grid">
            {(overview?.recentReports?.length ? overview.recentReports : moderationQueue).map((item) => (
              <article key={item.id} className="card admin-moderation-card">
                <span className="chip">{labelReportStatus(item.status)}</span>
                <p><strong>{item.reportedName || item.reportedId}</strong></p>
                <p className="muted">Prijavio/la: {item.reporterName || item.reporterId}</p>
                <p>{item.reason}</p>
                <p className="muted">{formatDateTime(item.createdAt)}</p>
                <button type="button" className="button button-primary" onClick={() => resolveReport(item.id)}>
                  Označi riješeno
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {payments.length > 0 && (
        <section className="card">
          <h2 className="section-title">Plaćanja</h2>
          <ul className="admin-list">
            {payments.slice(0, 15).map((p) => (
              <li key={p.id}>
                <strong>{p.user?.displayName || p.userProfileId}</strong> — {(p.amountCents / 100).toFixed(2)} € — {p.status} — {p.description}
              </li>
            ))}
          </ul>
        </section>
      )}

      {audit && (
        <section className="card">
          <h2 className="section-title">Revizija poštenosti</h2>
          <ul className="compact-list">
            {(audit.recommendations || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {riskItems.length > 0 && (
        <section>
          <h2 className="section-title">Rizični profili</h2>
          <div className="admin-card-grid">
            {riskItems.slice(0, 12).map((item) => (
              <article key={item.profileId} className="card admin-risk-card">
                <h3>{item.displayName}</h3>
                <p>Rizik: {item.riskScore}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
