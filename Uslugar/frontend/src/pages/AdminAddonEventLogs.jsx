import React, { useState, useEffect } from 'react'
import api from '@/api'

export default function AdminAddonEventLogs() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({})
  const [filters, setFilters] = useState({
    addonId: '',
    eventType: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0
  })

  async function loadLogs() {
    setLoading(true)
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
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
    loadLogs()
  }, [filters.offset])

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
      <h2 className="text-2xl font-bold text-gray-900">📦 Addon Event Logs</h2>

      {/* Filteri */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Addon ID</label>
            <input
              type="text"
              value={filters.addonId}
              onChange={e => setFilters({ ...filters, addonId: e.target.value, offset: 0 })}
              placeholder="Addon ID"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select
              value={filters.eventType}
              onChange={e => setFilters({ ...filters, eventType: e.target.value, offset: 0 })}
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
              onChange={e => setFilters({ ...filters, startDate: e.target.value, offset: 0 })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Do datuma</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters({ ...filters, endDate: e.target.value, offset: 0 })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <button
          onClick={() => setFilters({
            addonId: '', eventType: '', startDate: '', endDate: '', limit: 50, offset: 0
          })}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Očisti filtere
        </button>
      </div>

      {/* Statistike */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded p-4">
          <h3 className="font-semibold text-purple-800 mb-3">Statistike</h3>
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
                onClick={() => setFilters({ ...filters, offset: Math.max(0, filters.offset - filters.limit) })}
                disabled={filters.offset === 0 || loading}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Prethodna
              </button>
              <button
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
                        <div>
                          <div className="font-medium">{log.addon.user.fullName}</div>
                          <div className="text-gray-500 text-xs">{log.addon.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.addon?.addonType || '-'}
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

