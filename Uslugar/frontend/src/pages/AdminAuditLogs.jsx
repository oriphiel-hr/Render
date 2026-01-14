import React, { useState, useEffect } from 'react'
import api from '@/api'

export default function AdminAuditLogs() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({})
  const [filters, setFilters] = useState({
    action: '',
    actorId: '',
    messageId: '',
    roomId: '',
    jobId: '',
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
      const { data } = await api.get('/admin/audit-logs', { params })
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      setStats(data.stats || {})
    } catch (e) {
      console.error('Error loading audit logs:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [filters.offset])

  const actionLabels = {
    MESSAGE_CREATED: 'Poruka kreirana',
    MESSAGE_EDITED: 'Poruka uređena',
    MESSAGE_DELETED: 'Poruka obrisana',
    ATTACHMENT_UPLOADED: 'Privitak uploadan',
    ATTACHMENT_DELETED: 'Privitak obrisan',
    CONTACT_REVEALED: 'Kontakt otkriven',
    CONTACT_MASKED: 'Kontakt maskiran',
    ROOM_CREATED: 'Chat soba kreirana',
    ROOM_DELETED: 'Chat soba obrisana'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">📋 Audit Logs</h2>

      {/* Filteri */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Akcija</label>
            <select
              value={filters.action}
              onChange={e => setFilters({ ...filters, action: e.target.value, offset: 0 })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Sve akcije</option>
              {Object.entries(actionLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actor ID</label>
            <input
              type="text"
              value={filters.actorId}
              onChange={e => setFilters({ ...filters, actorId: e.target.value, offset: 0 })}
              placeholder="User ID"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message ID</label>
            <input
              type="text"
              value={filters.messageId}
              onChange={e => setFilters({ ...filters, messageId: e.target.value, offset: 0 })}
              placeholder="Message ID"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room ID</label>
            <input
              type="text"
              value={filters.roomId}
              onChange={e => setFilters({ ...filters, roomId: e.target.value, offset: 0 })}
              placeholder="Room ID"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job ID</label>
            <input
              type="text"
              value={filters.jobId}
              onChange={e => setFilters({ ...filters, jobId: e.target.value, offset: 0 })}
              placeholder="Job ID"
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
            action: '', actorId: '', messageId: '', roomId: '', jobId: '',
            startDate: '', endDate: '', limit: 50, offset: 0
          })}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Očisti filtere
        </button>
      </div>

      {/* Statistike */}
      {Object.keys(stats).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Statistike</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats).map(([action, count]) => (
              <div key={action}>
                <div className="text-sm text-blue-600">{actionLabels[action] || action}</div>
                <div className="text-2xl font-bold text-blue-800">{count}</div>
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
              Ukupno: {total} logova
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akcija</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Korisnik</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalji</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString('hr-HR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.actor ? (
                        <div>
                          <div className="font-medium">{log.actor.fullName}</div>
                          <div className="text-gray-500 text-xs">{log.actor.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.message && <div>Poruka: {log.message.id}</div>}
                      {log.room && <div>Soba: {log.room.name || log.room.id}</div>}
                      {log.job && <div>Posao: {log.job.title || log.job.id}</div>}
                      {log.metadata && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-blue-600">Metadata</summary>
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-w-md">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
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

