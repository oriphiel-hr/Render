import { useEffect, useState } from 'react';
import {
  getAdminRiskOverview,
  getFairnessAudit,
  getFairnessConfig,
  getFairnessState,
  getModerationQueue,
  runTimeoutSweep,
  updateFairnessConfig,
  updateReportStatus
} from '../api/index.js';
import { formatDateTime, labelReportStatus } from '../lib/labels.js';

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <span className="muted stat-label">{label}</span>
      <strong className="stat-value">{value ?? '—'}</strong>
    </article>
  );
}

export default function AdminPage({ token }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [statusKind, setStatusKind] = useState('info');
  const [busy, setBusy] = useState(false);
  const [thresholdHours, setThresholdHours] = useState(72);
  const [riskItems, setRiskItems] = useState([]);
  const [audit, setAudit] = useState(null);
  const [fairnessConfig, setFairnessConfig] = useState(null);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [newDailyLimit, setNewDailyLimit] = useState(30);
  const [configReason, setConfigReason] = useState('Balans anti-spama i kvalitetnih razgovora.');

  function setMessage(message, kind = 'info') {
    setStatus(message);
    setStatusKind(kind);
  }

  async function load() {
    try {
      const data = await getFairnessState();
      if (!data?.success) throw new Error('Failed');
      setState(data.data);
      setError('');
    } catch (_e) {
      setError('Nije uspjelo učitavanje stanja platforme.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function sweep() {
    if (!token) return;
    setBusy(true);
    const data = await runTimeoutSweep(token, thresholdHours);
    if (data?.success) {
      setMessage(`Automatsko zatvaranje završeno. Zatvoreno parova: ${data.closedPairs}.`, 'success');
      await load();
    } else {
      setMessage(data?.error || 'Automatsko zatvaranje nije uspjelo.', 'error');
    }
    setBusy(false);
  }

  async function loadRisk() {
    const data = await getAdminRiskOverview(token);
    if (data?.success) {
      setRiskItems(data.items || []);
      setMessage(`Učitano rizičnih profila: ${(data.items || []).length}.`, 'success');
    } else {
      setMessage(data?.error || 'Pregled rizika nije uspio.', 'error');
    }
  }

  async function loadAudit() {
    const data = await getFairnessAudit(token);
    if (data?.success) {
      setAudit(data);
      setMessage('Revizija poštenosti je učitana.', 'success');
    } else {
      setMessage(data?.error || 'Revizija poštenosti nije učitana.', 'error');
    }
  }

  async function loadConfig() {
    const data = await getFairnessConfig(token);
    if (data?.success) {
      setFairnessConfig(data);
      setNewDailyLimit(data.config?.dailyContactLimit || 30);
      setMessage('Postavke limita su učitane.', 'success');
    } else {
      setMessage(data?.error || 'Postavke limita nisu učitane.', 'error');
    }
  }

  async function saveConfig() {
    const data = await updateFairnessConfig(token, newDailyLimit, configReason);
    if (data?.success) {
      setMessage('Dnevni limit kontakata je ažuriran.', 'success');
      await loadConfig();
    } else {
      setMessage(data?.error || 'Spremanje postavki nije uspjelo.', 'error');
    }
  }

  async function loadModeration() {
    const data = await getModerationQueue(token);
    if (data?.success) {
      setModerationQueue(data.items || []);
      setMessage(`Red čekanja moderacije: ${(data.items || []).length} prijava.`, 'success');
    } else {
      setMessage(data?.error || 'Red čekanja moderacije nije učitan.', 'error');
    }
  }

  async function resolveReport(reportId) {
    const data = await updateReportStatus(token, reportId, 'RESOLVED');
    if (data?.success) {
      setMessage('Prijava je označena kao riješena.', 'success');
      await loadModeration();
    } else {
      setMessage(data?.error || 'Ažuriranje prijave nije uspjelo.', 'error');
    }
  }

  return (
    <main className="page admin-page">
      <section className="hero admin-hero">
        <h1>Admin — centar poštenosti</h1>
        <p className="subtitle">
          Nadzor fer distribucije, anti-spam signala i moderacije bez skrivanja dosega.
        </p>
      </section>

      {error && <p className="status-banner status-error">{error}</p>}
      {status && <p className={`status-banner status-${statusKind}`}>{status}</p>}

      {state && (
        <section className="stat-grid">
          <StatCard label="Dostupni profili" value={state.availableProfiles} />
          <StatCard label="Aktivni parovi" value={state.engagedPairs} />
          <StatCard label="Čekaju 7+ dana" value={state.usersWaitingLongerThan7Days} />
        </section>
      )}

      {state?.fairnessNote && (
        <section className="card">
          <p className="muted">{state.fairnessNote}</p>
        </section>
      )}

      <section className="card admin-tools">
        <h2 className="section-title">Alati</h2>
        <label>
          Prag neaktivnosti (sati)
          <input
            type="number"
            min={1}
            value={thresholdHours}
            onChange={(e) => setThresholdHours(Number(e.target.value))}
          />
        </label>
        <div className="admin-actions">
          <button type="button" className="button button-primary" onClick={sweep} disabled={busy}>
            {busy ? 'Obrada...' : 'Zatvori neaktivne parove'}
          </button>
          <button type="button" className="button button-secondary" onClick={loadRisk}>
            Pregled rizika
          </button>
          <button type="button" className="button button-secondary" onClick={loadAudit}>
            Revizija poštenosti
          </button>
          <button type="button" className="button button-secondary" onClick={loadConfig}>
            Postavke limita
          </button>
          <button type="button" className="button button-secondary" onClick={loadModeration}>
            Moderacija
          </button>
        </div>
      </section>

      {fairnessConfig && (
        <section className="card">
          <h2 className="section-title">Dnevni limit kontakata</h2>
          <p>Trenutni limit: <strong>{fairnessConfig.config?.dailyContactLimit}</strong> zahtjeva dnevno</p>
          <div className="form-grid">
            <label>
              Novi limit
              <input type="number" min={5} max={200} value={newDailyLimit} onChange={(e) => setNewDailyLimit(Number(e.target.value))} />
            </label>
            <label>
              Razlog promjene
              <input value={configReason} onChange={(e) => setConfigReason(e.target.value)} />
            </label>
          </div>
          <button type="button" className="button button-primary" onClick={saveConfig}>
            Spremi promjenu
          </button>
          {(fairnessConfig.changes || []).length > 0 && (
            <>
              <h3 className="subsection-title">Povijest promjena</h3>
              <ul className="admin-list">
                {(fairnessConfig.changes || []).map((change) => (
                  <li key={change.id}>
                    <strong>{formatDateTime(change.createdAt)}</strong>
                    <span>{change.oldDailyLimit} → {change.newDailyLimit}</span>
                    <span className="muted">{change.reason}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {audit && (
        <section className="card">
          <h2 className="section-title">Revizija poštenosti</h2>
          <div className="stat-grid stat-grid-compact">
            <StatCard label="Ukupno profila" value={audit.metrics?.totalProfiles} />
            <StatCard label="Dostupni" value={audit.metrics?.availableProfiles} />
            <StatCard label="U razgovoru" value={audit.metrics?.focusedProfiles} />
            <StatCard label="Bez zahtjeva (7d)" value={audit.metrics?.usersWithoutIncoming7d} />
            <StatCard label="Otvoreni zahtjevi (7d)" value={audit.metrics?.pendingRequests7d} />
            <StatCard label="Prihvaćeni zahtjevi (7d)" value={audit.metrics?.acceptedRequests7d} />
          </div>
          <h3 className="subsection-title">Načela platforme</h3>
          <ul className="admin-list">
            <li>Bez ograničavanja dosega: {audit.principles?.noReachThrottling ? 'da' : 'ne'}</li>
            <li>Rangiranje samo po fer pravilima: {audit.principles?.fairnessRankingOnly ? 'da' : 'ne'}</li>
            <li>Aktivni parovi privremeno skriveni: {audit.principles?.engagedPairsTemporarilyHidden ? 'da' : 'ne'}</li>
          </ul>
          <h3 className="subsection-title">Preporuke</h3>
          <ul className="compact-list">
            {(audit.recommendations || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {riskItems.length > 0 && (
        <section>
          <h2 className="section-title">Rizični profili (7 dana)</h2>
          <div className="admin-card-grid">
            {riskItems.map((item) => (
              <article key={item.profileId} className="card admin-risk-card">
                <h3>{item.displayName}</h3>
                <p className="muted">{item.city}</p>
                <p>Rizik: <strong>{item.riskScore}</strong></p>
                <ul className="compact-list muted">
                  <li>Na čekanju: {item.pendingOutgoing}</li>
                  <li>Odbijeno: {item.declinedReceived}</li>
                  <li>Auto-zatvoreno: {item.autoClosedRelated}</li>
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {moderationQueue.length > 0 && (
        <section>
          <h2 className="section-title">Red čekanja moderacije</h2>
          <div className="admin-card-grid">
            {moderationQueue.map((item) => (
              <article key={item.id} className="card admin-moderation-card">
                <div className="row">
                  <span className="chip">Prioritet {item.priority}</span>
                  <span className="chip">{labelReportStatus(item.status)}</span>
                </div>
                <p><strong>{item.reportedName}</strong> ({item.reportedCity})</p>
                <p className="muted">Prijavio/la: {item.reporterName}</p>
                <p>{item.reason}</p>
                {item.details && <p className="muted">{item.details}</p>}
                <p className="muted">{formatDateTime(item.createdAt)}</p>
                <button type="button" className="button button-primary" onClick={() => resolveReport(item.id)}>
                  Označi riješeno
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
