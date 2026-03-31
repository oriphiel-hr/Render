import { useState } from 'react';
import { fetchDemoInsights, fetchTechnologyCatalogStatus, refreshTechnologyCatalog } from '../api/index.js';

export default function AdminDemoInsights() {
  const [apiKey, setApiKey] = useState('');
  const [data, setData] = useState(null);
  const [catalogStatus, setCatalogStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetchDemoInsights(apiKey);
      if (response?.success) {
        setData(response);
      } else {
        setError(response?.error || 'Neuspjelo ucitavanje insights podataka.');
      }
    } catch (_error) {
      setError('Doslo je do greske pri ucitavanju insights podataka.');
    } finally {
      setLoading(false);
    }
  }

  async function loadCatalogStatus() {
    setLoading(true);
    setError('');
    try {
      const response = await fetchTechnologyCatalogStatus(apiKey);
      if (response?.success) {
        setCatalogStatus(response);
      } else {
        setError(response?.error || 'Neuspjelo ucitavanje statusa kataloga.');
      }
    } catch (_error) {
      setError('Doslo je do greske pri ucitavanju statusa kataloga.');
    } finally {
      setLoading(false);
    }
  }

  async function refreshCatalogNow() {
    setLoading(true);
    setError('');
    try {
      const response = await refreshTechnologyCatalog(apiKey);
      if (response?.success) {
        setCatalogStatus(response);
      } else {
        setError(response?.error || 'Refresh kataloga nije uspio.');
      }
    } catch (_error) {
      setError('Doslo je do greske pri refreshu kataloga.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 24 }}>
      <h2 style={{ marginTop: 0 }}>Admin - Demo insights</h2>
      <p style={{ marginTop: 0 }}>
        Grupiranje demo leadova po preporucenom tracku i najcescim pitanjima.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="password"
          placeholder="Admin API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="button" onClick={load} disabled={loading || !apiKey}>
          {loading ? 'Ucitavam...' : 'Ucitaj insights'}
        </button>
        <button type="button" onClick={loadCatalogStatus} disabled={loading || !apiKey}>
          Status kataloga
        </button>
        <button type="button" onClick={refreshCatalogNow} disabled={loading || !apiKey}>
          Refresh kataloga
        </button>
      </div>

      {error && <p>{error}</p>}

      {data && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <strong>Ukupno demo leadova:</strong> {data.totals?.demoLeads ?? 0}
          </div>
          <div>
            <strong>Po recommended tracku</strong>
            <ul>
              <li>Starter: {data.byRecommendedTrack?.STARTER ?? 0}</li>
              <li>Growth: {data.byRecommendedTrack?.GROWTH ?? 0}</li>
              <li>Premium: {data.byRecommendedTrack?.PREMIUM ?? 0}</li>
              <li>Nepoznato: {data.byRecommendedTrack?.UNKNOWN ?? 0}</li>
            </ul>
          </div>
          <div>
            <strong>Najcesca pitanja</strong>
            <ul>
              {(data.topQuestions || []).map((item) => (
                <li key={item.question}>
                  {item.question} ({item.count})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {catalogStatus && (
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          <strong>Technology catalog sync</strong>
          <div>lastSyncAt: {catalogStatus.lastSyncAt || '-'}</div>
          <ul>
            {(catalogStatus.items || []).map((item) => (
              <li key={item.id}>
                {item.name} - {item.sourceOk === null ? 'nije provjereno' : item.sourceOk ? 'OK' : 'greska'}
                {' '}| HTTP: {item.sourceHttpStatus ?? '-'}
                {' '}| lastVerifiedAt: {item.lastVerifiedAt || '-'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
