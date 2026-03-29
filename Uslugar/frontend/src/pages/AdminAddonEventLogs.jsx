import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '@/api'

export default function AdminAddonEventLogs() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({})
  const [reloadNonce, setReloadNonce] = useState(0)
  const [backfillLoading, setBackfillLoading] = useState(false)
  const [backfillTargetUserId, setBackfillTargetUserId] = useState('')
  const [backfillResult, setBackfillResult] = useState(null)
  const [filters, setFilters] = useState({
    addonId: '',
    eventType: '',
    userId: '',
    userEmail: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0
  })

  async function fetchLogs() {
    setLoading(true)
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )
      const { data } = await api.get('/admin/addon-event-logs', { params })
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      setStats(data.stats || {})
    } catch (e) {
      console.error('Error loading addon event logs:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filters.offset, reloadNonce])

  function applyFilters() {
    setFilters(f => ({ ...f, offset: 0 }))
    setReloadNonce(n => n + 1)
  }

  function clearFilters() {
    setFilters({
      addonId: '',
      eventType: '',
      userId: '',
      userEmail: '',
      startDate: '',
      endDate: '',
      limit: 50,
      offset: 0
    })
    setReloadNonce(n => n + 1)
  }

  async function runBackfill() {
    if (!window.confirm('Dopuniti trial add-onove za sve aktivne TRIAL pretplate? (idempotentno)')) return
    setBackfillLoading(true)
    setBackfillResult(null)
    try {
      const { data } = await api.post('/admin/trial-addons/backfill')
      setBackfillResult(data)
      setReloadNonce(n => n + 1)
    } catch (e) {
      setBackfillResult({
        success: false,
        error: e?.response?.data?.error || e?.message || String(e)
      })
    } finally {
      setBackfillLoading(false)
    }
  }

  async function runBackfillSingle() {
    const id = backfillTargetUserId.trim()
    if (!id) {
      window.alert('Upiši User ID (cuid iz tablice Korisnika).')
      return
    }
    if (!window.confirm(`Dopuniti trial add-onove samo za korisnika ${id}?`)) return
    setBackfillLoading(true)
    setBackfillResult(null)
    try {
      const { data } = await api.post('/admin/trial-addons/backfill', { userId: id })
      setBackfillResult(data)
      setReloadNonce(n => n + 1)
    } catch (e) {
      setBackfillResult({
        success: false,
        scope: 'single',
        error: e?.response?.data?.error || e?.message || String(e)
      })
    } finally {
      setBackfillLoading(false)
    }
  }

  function singleBackfillMessage(r) {
    if (r.reason === 'MISSING_USER_ID') return 'Nedostaje User ID.'
    if (r.reason === 'NO_SUBSCRIPTION') return 'Korisnik nema pretplatu.'
    if (r.reason === 'NOT_ACTIVE_TRIAL') {
      return `Pretplata nije aktivni TRIAL (plan: ${r.plan ?? '—'}, status: ${r.status ?? '—'}).`
    }
    return r.reason || r.error || 'Nepoznata greška.'
  }

  const eventTypeLabels = {
    PURCHASED: 'Kupljeno',
    RENEWED: 'Obnovljeno',
    EXPIRED: 'Isteklo',
    DEPLETED: 'Iscrpljeno',
    LOW_BALANCE: 'Niska bilanca',
    GRACE_STARTED: 'Grace period započeo',
    CANCELLED: 'Otkazano'
  }

  const getEventTypeColor = (type) => {
    if (type === 'EXPIRED' || type === 'DEPLETED' || type === 'CANCELLED') return 'bg-red-100 text-red-800'
    if (type === 'LOW_BALANCE' || type === 'GRACE_STARTED') return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">📦 Dnevnik add-on događaja</h2>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-2">TRIAL add-onovi (backfill)</h3>
        <p className="text-sm text-amber-900/90 mb-3">
          Za korisnike s aktivnom TRIAL pretplatom kreira nedostajuće trial add-onove (2 kategorije + regija),
          TrialEngagement i odgovarajuće PURCHASED logove. Sigurno je pokrenuti više puta.
        </p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-start sm:items-end">
          <button
            type="button"
            onClick={runBackfill}
            disabled={backfillLoading}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
          >
            {backfillLoading ? 'Radim…' : 'Dopuni za sve TRIAL'}
          </button>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={backfillTargetUserId}
              onChange={e => setBackfillTargetUserId(e.target.value)}
              placeholder="User ID (cuid)"
              className="border rounded px-3 py-2 min-w-[14rem] bg-white"
            />
            <button
              type="button"
              onClick={runBackfillSingle}
              disabled={backfillLoading}
              className="px-4 py-2 bg-white border border-amber-700 text-amber-900 rounded hover:bg-amber-100 disabled:opacity-50"
            >
              Dopuni za ovog korisnika
            </button>
          </div>
        </div>
        {backfillResult && (
          <div className="mt-3 text-sm rounded bg-white border border-amber-100 p-3">
            {backfillResult.scope === 'single' ? (
              backfillResult.success === false ? (
                <span className="text-red-700">{singleBackfillMessage(backfillResult)}</span>
              ) : (
                <ul className="space-y-1 text-gray-800">
                  <li>User ID: <strong className="font-mono text-xs">{backfillResult.userId}</strong></li>
                  <li>Trial add-onova prije: <strong>{backfillResult.trialAddonsBefore}</strong> → poslije: <strong>{backfillResult.trialAddonsAfter}</strong></li>
                  <li>
                    {backfillResult.seeded
                      ? <span className="text-green-800">Dopuna izvršena (novi ili ažurirani zapisi).</span>
                      : <span>Već kompletno, nije bilo promjene.</span>}
                  </li>
                </ul>
              )
            ) : backfillResult.success === false ? (
              <span className="text-red-700">{backfillResult.error}</span>
            ) : (
              <ul className="space-y-1 text-gray-800">
                <li>Pregledano pretplata: <strong>{backfillResult.checked}</strong></li>
                <li>Korisnika s dopunom / promjenom: <strong>{backfillResult.seededUsers}</strong></li>
                <li>Bez promjene (već kompletno): <strong>{backfillResult.unchangedUsers}</strong></li>
                {backfillResult.errors?.length > 0 && (
                  <li className="text-red-700">
                    Greške: {backfillResult.errors.length} — provjeri server log
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Filteri */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={filters.userId}
              onChange={e => setFilters({ ...filters, userId: e.target.value })}
              placeholder="cuid korisnika"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail korisnika</label>
            <input
              type="text"
              value={filters.userEmail}
              onChange={e => setFilters({ ...filters, userEmail: e.target.value })}
              placeholder="djelomičan match"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Addon ID</label>
            <input
              type="text"
              value={filters.addonId}
              onChange={e => setFilters({ ...filters, addonId: e.target.value })}
              placeholder="Addon ID"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select
              value={filters.eventType}
              onChange={e => setFilters({ ...filters, eventType: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Svi tipovi</option>
              {Object.entries(eventTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Od datuma</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Do datuma</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={applyFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Primijeni filter
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Očisti filtere
          </button>
        </div>
      </div>

      {/* Statistike */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded p-4">
          <h3 className="font-semibold text-purple-800 mb-3">Statistike (za trenutni filter)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats).map(([eventType, count]) => (
              <div key={eventType}>
                <div className="text-sm text-purple-600">{eventTypeLabels[eventType] || eventType}</div>
                <div className="text-2xl font-bold text-purple-800">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logovi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Ukupno: {total} eventa
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilters({ ...filters, offset: Math.max(0, filters.offset - filters.limit) })}
                disabled={filters.offset === 0 || loading}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Prethodna
              </button>
              <button
                type="button"
                onClick={() => setFilters({ ...filters, offset: filters.offset + filters.limit })}
                disabled={filters.offset + filters.limit >= total || loading}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Sljedeća
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Učitavanje...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nema eventa</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Korisnik</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Addon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metadata</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.occurredAt).toLocaleString('hr-HR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(log.eventType)}`}>
                        {eventTypeLabels[log.eventType] || log.eventType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.addon?.user ? (
                        <div className="space-y-1">
                          <div className="font-medium">{log.addon.user.fullName}</div>
                          <div className="text-gray-500 text-xs">{log.addon.user.email}</div>
                          {log.addon.user.id && (
                            <Link
                              to={`/admin/User?id=${encodeURIComponent(log.addon.user.id)}`}
                              className="inline-block text-xs text-blue-600 hover:underline"
                            >
                              Otvori korisnika
                            </Link>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.addon
                        ? [log.addon.type, log.addon.displayName].filter(Boolean).join(' · ') || '-'
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.oldStatus && (
                        <div className="text-xs">
                          <span className="text-gray-500">{log.oldStatus}</span>
                          <span className="mx-1">→</span>
                          <span className="font-medium">{log.newStatus || 'N/A'}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.metadata && (
                        <details>
                          <summary className="cursor-pointer text-blue-600 text-xs">Metadata</summary>
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-w-md">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
