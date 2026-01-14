import React, { useState, useEffect } from 'react'
import api from '@/api'

export default function AdminErrorLogs() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({})
  const [selectedLog, setSelectedLog] = useState(null)
  const [filters, setFilters] = useState({
    level: '',
    status: '',
    endpoint: '',
    userId: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0
  })
  const [updateNotes, setUpdateNotes] = useState('')

  async function loadLogs() {
    setLoading(true)
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      )
      const { data } = await api.get('/admin/error-logs', { params })
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      setStats(data.stats || {})
    } catch (e) {
      console.error('Error loading error logs:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [filters.offset])

  async function updateErrorStatus(id, status, notes) {
    try {
      await api.patch(`/admin/error-logs/${id}`, { status, notes })
      loadLogs()
      setSelectedLog(null)
      setUpdateNotes('')
    } catch (e) {
      console.error('Error updating error log:', e)
      alert('Greška pri ažuriranju')
    }
  }

  const getLevelColor = (level) => {
    if (level === 'CRITICAL') return 'bg-red-100 text-red-800'
    if (level === 'ERROR') return 'bg-orange-100 text-orange-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusColor = (status) => {
    if (status === 'RESOLVED') return 'bg-green-100 text-green-800'
    if (status === 'IN_PROGRESS') return 'bg-blue-100 text-blue-800'
    if (status === 'IGNORED') return 'bg-gray-100 text-gray-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">❌ Error Logs</h2>

      {/* Filteri */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              value={filters.level}
              onChange={e => setFilters({ ...filters, level: e.target.value, offset: 0 })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Svi leveli</option>
              <option value="ERROR">ERROR</option>
              <option value="WARN">WARN</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value, offset: 0 })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Svi statusi</option>
              <option value="NEW">NEW</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="IGNORED">IGNORED</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
            <input
              type="text"
              value={filters.endpoint}
              onChange={e => setFilters({ ...filters, endpoint: e.target.value, offset: 0 })}
              placeholder="/api/jobs"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={filters.userId}
              onChange={e => setFilters({ ...filters, userId: e.target.value, offset: 0 })}
              placeholder="User ID"
              className="w-full border rounded px-3 py-2"
            />
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
            level: '', status: '', endpoint: '', userId: '',
            startDate: '', endDate: '', limit: 50, offset: 0
          })}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Očisti filtere
        </button>
      </div>

      {/* Statistike */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h3 className="font-semibold text-red-800 mb-3">Statistike</h3>
          {stats.byLevel && Object.keys(stats.byLevel).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-700 mb-2">Po levelima</h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(stats.byLevel).map(([level, count]) => (
                  <div key={level}>
                    <div className="text-sm text-red-600">{level}</div>
                    <div className="text-2xl font-bold text-red-800">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stats.byStatus && Object.keys(stats.byStatus).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-700 mb-2">Po statusima</h4>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status}>
                    <div className="text-sm text-red-600">{status}</div>
                    <div className="text-2xl font-bold text-red-800">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logovi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Ukupno: {total} grešaka
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
          <div className="p-8 text-center text-gray-500">Nema grešaka</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poruka</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Korisnik</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcije</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map(log => (
                  <tr key={log.id} className={log.level === 'CRITICAL' ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString('hr-HR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      <div className="truncate" title={log.message}>
                        {log.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {log.endpoint || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user ? (
                        <div>
                          <div className="font-medium">{log.user.fullName}</div>
                          <div className="text-gray-500 text-xs">{log.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        Detalji
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal za detalje */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4">Error Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poruka</label>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">{selectedLog.message}</div>
              </div>
              {selectedLog.stack && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stack Trace</label>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">{selectedLog.stack}</pre>
                </div>
              )}
              {selectedLog.context && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kontekst</label>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                    {JSON.stringify(selectedLog.context, null, 2)}
                  </pre>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedLog.status}
                  onChange={e => setSelectedLog({ ...selectedLog, status: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="NEW">NEW</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="IGNORED">IGNORED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Napomene</label>
                <textarea
                  value={updateNotes || selectedLog.notes || ''}
                  onChange={e => setUpdateNotes(e.target.value)}
                  rows={3}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Dodaj napomene..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateErrorStatus(selectedLog.id, selectedLog.status, updateNotes || selectedLog.notes)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Spremi
                </button>
                <button
                  onClick={() => {
                    setSelectedLog(null)
                    setUpdateNotes('')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

