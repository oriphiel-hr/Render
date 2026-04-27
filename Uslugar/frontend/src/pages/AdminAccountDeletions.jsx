import React, { useState, useEffect, useCallback } from 'react'
import api from '@/api'

const SOURCE_LABELS = {
  SELF_SERVICE: 'Samobrisanje (aplikacija)',
  ADMIN_PANEL: 'Admin panel'
}

export default function AdminAccountDeletions() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ SELF_SERVICE: 0, ADMIN_PANEL: 0, total: 0 })
  const [filters, setFilters] = useState({
    source: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0
  })

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v != null)
      )
      const { data } = await api.get('/admin/account-deletion-logs', { params })
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      setStats(data.stats || { SELF_SERVICE: 0, ADMIN_PANEL: 0, total: 0 })
    } catch (e) {
      console.error('Error loading account deletion logs:', e)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Obrisani korisnički računi</h2>
      <p className="text-sm text-gray-600 max-w-3xl">
        Zapisnik nakon uspješnog brisanja računa. Email je maskiran radi privatnosti. Za admin brisanje
        je prikazan ID administratora.
      </p>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Izvor</label>
            <select
              value={filters.source}
              onChange={e => setFilters(f => ({ ...f, source: e.target.value, offset: 0 }))}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Svi</option>
              <option value="SELF_SERVICE">{SOURCE_LABELS.SELF_SERVICE}</option>
              <option value="ADMIN_PANEL">{SOURCE_LABELS.ADMIN_PANEL}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Od</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters(f => ({ ...f, startDate: e.target.value, offset: 0 }))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Do</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters(f => ({ ...f, endDate: e.target.value, offset: 0 }))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            setFilters({
              source: '',
              startDate: '',
              endDate: '',
              limit: 50,
              offset: 0
            })
          }
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Očisti filtere
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Zbroj (cijela baza logova, neovisno o filtru u tablici)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-blue-600">Samobrisanje</div>
            <div className="text-2xl font-bold text-blue-800">{stats.SELF_SERVICE ?? 0}</div>
          </div>
          <div>
            <div className="text-sm text-blue-600">Admin panel</div>
            <div className="text-2xl font-bold text-blue-800">{stats.ADMIN_PANEL ?? 0}</div>
          </div>
          <div>
            <div className="text-sm text-blue-600">Ukupno (logovi)</div>
            <div className="text-2xl font-bold text-blue-800">{stats.total ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">
              Prikaz: {total} stavki (s filterom u API-ju)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setFilters(f => ({ ...f, offset: Math.max(0, f.offset - f.limit) }))
                }
                disabled={filters.offset === 0 || loading}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Prethodna
              </button>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, offset: f.offset + f.limit }))}
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
          <div className="p-8 text-center text-gray-500">Nema zapisa</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Izvor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bivši korisnik ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email (maska)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uloga</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Obrisao (admin ID)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleString('hr-HR')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={
                          log.source === 'ADMIN_PANEL'
                            ? 'px-2 py-1 bg-amber-100 text-amber-900 rounded text-xs'
                            : 'px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs'
                        }
                      >
                        {SOURCE_LABELS[log.source] || log.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 font-mono break-all max-w-[8rem]">
                      {log.formerUserId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{log.emailRedacted}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{log.role}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                      {log.deletedByUserId || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.ipAddress || '—'}</td>
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
