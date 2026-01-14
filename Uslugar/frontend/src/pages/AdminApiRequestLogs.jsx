import React, { useState, useEffect } from 'react'
import api from '@/api'

export default function AdminApiRequestLogs() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({})
  const [filters, setFilters] = useState({
    method: '',
    path: '',
    statusCode: '',
    userId: '',
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
      const { data } = await api.get('/admin/api-request-logs', { params })
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      setStats(data.stats || {})
    } catch (e) {
      console.error('Error loading API request logs:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [filters.offset])

  const getStatusColor = (statusCode) => {
    if (statusCode >= 500) return 'bg-red-100 text-red-800'
    if (statusCode >= 400) return 'bg-yellow-100 text-yellow-800'
    if (statusCode >= 300) return 'bg-blue-100 text-blue-800'
    return 'bg-green-100 text-green-800'
  }

  const getResponseTimeColor = (time) => {
    if (time > 1000) return 'text-red-600'
    if (time > 500) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">🌐 API Request Logs</h2>

      {/* Filteri */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metoda</label>
            <select
              value={filters.method}
              onChange={e => setFilters({ ...filters, method: e.target.value, offset: 0 })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Sve metode</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Path</label>
            <input
              type="text"
              value={filters.path}
              onChange={e => setFilters({ ...filters, path: e.target.value, offset: 0 })}
              placeholder="/api/jobs"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Code</label>
            <input
              type="number"
              value={filters.statusCode}
              onChange={e => setFilters({ ...filters, statusCode: e.target.value, offset: 0 })}
              placeholder="200, 404, 500..."
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
            method: '', path: '', statusCode: '', userId: '',
            startDate: '', endDate: '', limit: 50, offset: 0
          })}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Očisti filtere
        </button>
      </div>

      {/* Statistike */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-semibold text-blue-800 mb-3">Statistike</h3>
          {stats.byStatus && Object.keys(stats.byStatus).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-blue-700 mb-2">Po status kodovima</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.byStatus).map(([status, data]) => (
                  <div key={status}>
                    <div className="text-sm text-blue-600">Status {status}</div>
                    <div className="text-xl font-bold text-blue-800">{data.count}</div>
                    <div className="text-xs text-blue-500">Avg: {Math.round(data.avgResponseTime)}ms</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stats.byMethod && Object.keys(stats.byMethod).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-blue-700 mb-2">Po metodama</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats.byMethod).map(([method, data]) => (
                  <div key={method}>
                    <div className="text-sm text-blue-600">{method}</div>
                    <div className="text-xl font-bold text-blue-800">{data.count}</div>
                    <div className="text-xs text-blue-500">Avg: {Math.round(data.avgResponseTime)}ms</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stats.topPaths && stats.topPaths.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-700 mb-2">Top 10 Paths</h4>
              <div className="space-y-1">
                {stats.topPaths.map((path, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-blue-600">{path.path}</span>
                    <span className="text-blue-800 font-medium">{path.count} req</span>
                    <span className="text-blue-500">{Math.round(path.avgResponseTime)}ms avg</span>
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
              Ukupno: {total} zahtjeva
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
          <div className="p-8 text-center text-gray-500">Nema logova</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metoda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Korisnik</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString('hr-HR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.method}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                      {log.path}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.statusCode)}`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${getResponseTimeColor(log.responseTime)}`}>
                        {log.responseTime}ms
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user ? (
                        <div>
                          <div className="font-medium">{log.user.fullName}</div>
                          <div className="text-gray-500 text-xs">{log.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Anonimno</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress || '-'}
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

