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

export default function AdminPage({ token }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [thresholdHours, setThresholdHours] = useState(72);
  const [riskItems, setRiskItems] = useState([]);
  const [audit, setAudit] = useState(null);
  const [fairnessConfig, setFairnessConfig] = useState(null);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [newDailyLimit, setNewDailyLimit] = useState(30);
  const [configReason, setConfigReason] = useState('Balans anti-spam i kvalitetnih razgovora.');

  async function load() {
    try {
      const data = await getFairnessState();
      if (!data?.success) throw new Error('Failed');
      setState(data.data);
    } catch (_e) {
      setError('Neuspjelo ucitavanje fairness stanja.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function sweep() {
    if (!token) {
      setStatus('Za timeout sweep treba admin login token.');
      return;
    }
    const data = await runTimeoutSweep(token, thresholdHours);
    if (data?.success) {
      setStatus(`Timeout sweep zatvorio parova: ${data.closedPairs}`);
      await load();
    } else {
      setStatus(data?.error || 'Sweep nije uspio.');
    }
  }

  async function loadRisk() {
    if (!token) {
      setStatus('Za risk overview treba admin token.');
      return;
    }
    const data = await getAdminRiskOverview(token);
    if (data?.success) {
      setRiskItems(data.items || []);
    } else {
      setStatus(data?.error || 'Risk overview nije uspio.');
    }
  }

  async function loadAudit() {
    if (!token) {
      setStatus('Za fairness audit treba admin token.');
      return;
    }
    const data = await getFairnessAudit(token);
    if (data?.success) {
      setAudit(data);
    } else {
      setStatus(data?.error || 'Fairness audit nije uspio.');
    }
  }

  async function loadConfig() {
    if (!token) {
      setStatus('Za fairness config treba admin token.');
      return;
    }
    const data = await getFairnessConfig(token);
    if (data?.success) {
      setFairnessConfig(data);
      setNewDailyLimit(data.config?.dailyContactLimit || 30);
    } else {
      setStatus(data?.error || 'Fairness config nije ucitan.');
    }
  }

  async function saveConfig() {
    const data = await updateFairnessConfig(token, newDailyLimit, configReason);
    if (data?.success) {
      setStatus('Fairness limit azuriran.');
      await loadConfig();
    } else {
      setStatus(data?.error || 'Spremanje fairness configa nije uspjelo.');
    }
  }

  async function loadModeration() {
    const data = await getModerationQueue(token);
    if (data?.success) {
      setModerationQueue(data.items || []);
    } else {
      setStatus(data?.error || 'Moderation queue nije ucitan.');
    }
  }

  async function resolveReport(reportId) {
    const data = await updateReportStatus(token, reportId, 'RESOLVED');
    if (data?.success) {
      setStatus('Report oznacen kao RESOLVED.');
      await loadModeration();
    } else {
      setStatus(data?.error || 'Update report status nije uspio.');
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <h1 style={{ marginBottom: 6 }}>Admin portal - Fairness control center</h1>
        <p className="subtitle">
          Nadgledaj fer distribuciju, anti-spam signal i timeout akcije bez skrivanja dosega.
        </p>
      </section>
      {error && <p className="warning">{error}</p>}
      {status && <p className={status.includes('nije') ? 'warning' : 'success-note'}>{status}</p>}
      {state && (
        <ul className="card compact-list">
          <li>Dostupni profili: {state.availableProfiles}</li>
          <li>Aktivni parovi: {state.engagedPairs}</li>
          <li>Cekaju 7+ dana: {state.usersWaitingLongerThan7Days}</li>
        </ul>
      )}
      {state?.fairnessNote && <p className="muted">{state.fairnessNote}</p>}
      <div className="card">
        <label>
          Timeout prag (sati)
          <input
            type="number"
            value={thresholdHours}
            onChange={(e) => setThresholdHours(Number(e.target.value))}
          />
        </label>
        <button type="button" onClick={sweep}>Pokreni timeout sweep</button>
        <button type="button" onClick={loadRisk} style={{ marginLeft: 8 }}>
          Ucitaj risk overview
        </button>
        <button type="button" onClick={loadAudit} style={{ marginLeft: 8 }}>
          Ucitaj fairness audit
        </button>
        <button type="button" onClick={loadConfig} style={{ marginLeft: 8 }}>
          Fairness config
        </button>
        <button type="button" onClick={loadModeration} style={{ marginLeft: 8 }}>
          Moderation queue
        </button>
      </div>
      {fairnessConfig && (
        <div className="card">
          <h3>Fairness config i changelog</h3>
          <p>Trenutni daily contact limit: <strong>{fairnessConfig.config?.dailyContactLimit}</strong></p>
          <label>Novi limit
            <input type="number" value={newDailyLimit} onChange={(e) => setNewDailyLimit(Number(e.target.value))} />
          </label>
          <label>Razlog promjene
            <input value={configReason} onChange={(e) => setConfigReason(e.target.value)} />
          </label>
          <button type="button" onClick={saveConfig}>Spremi fairness promjenu</button>
          <ul className="compact-list">
            {(fairnessConfig.changes || []).map((change) => (
              <li key={change.id}>
                {new Date(change.createdAt).toLocaleString()} | {change.oldDailyLimit} -&gt; {change.newDailyLimit} | {change.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
      {audit && (
        <div className="card">
          <h3>Fairness audit</h3>
          <ul className="compact-list">
            <li>Ukupno profila: {audit.metrics?.totalProfiles}</li>
            <li>Dostupni profili: {audit.metrics?.availableProfiles}</li>
            <li>Fokusirani kontakti: {audit.metrics?.focusedProfiles}</li>
            <li>Bez dolaznog zahtjeva 7d: {audit.metrics?.usersWithoutIncoming7d}</li>
            <li>Pending zahtjevi 7d: {audit.metrics?.pendingRequests7d}</li>
            <li>Accepted zahtjevi 7d: {audit.metrics?.acceptedRequests7d}</li>
          </ul>
          <strong>Principi</strong>
          <ul className="compact-list">
            <li>No reach throttling: {String(audit.principles?.noReachThrottling)}</li>
            <li>Fairness ranking only: {String(audit.principles?.fairnessRankingOnly)}</li>
            <li>Engaged pairs hidden: {String(audit.principles?.engagedPairsTemporarilyHidden)}</li>
          </ul>
          <strong>Preporuke</strong>
          <ul className="compact-list">
            {(audit.recommendations || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {riskItems.length > 0 && (
        <div className="card">
          <h3>Risk score (zadnjih 7 dana)</h3>
          <ul className="compact-list">
            {riskItems.map((item) => (
              <li key={item.profileId}>
                {item.displayName} ({item.city}) - score: {item.riskScore}
                {' '}| pending: {item.pendingOutgoing}
                {' '}| declined: {item.declinedReceived}
                {' '}| auto-closed: {item.autoClosedRelated}
              </li>
            ))}
          </ul>
        </div>
      )}
      {moderationQueue.length > 0 && (
        <div className="card">
          <h3>Moderation queue (prioritetno)</h3>
          <ul className="compact-list">
            {moderationQueue.map((item) => (
              <li key={item.id}>
                P{item.priority} | {item.status} | {item.reason} | reported: {item.reportedId}
                <button type="button" onClick={() => resolveReport(item.id)} style={{ marginLeft: 8 }}>
                  Oznaci RESOLVED
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
