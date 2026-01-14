// Admin SMS Logs - Pregled svih SMS-ova
import React, { useState, useEffect } from 'react';
import api from '../api';

const SMS_TYPES = [
  { value: '', label: 'Svi tipovi' },
  { value: 'VERIFICATION', label: 'Verifikacija' },
  { value: 'LEAD_NOTIFICATION', label: 'Lead notifikacija' },
  { value: 'REFUND', label: 'Refund' },
  { value: 'URGENT', label: 'Urgentno' },
  { value: 'OTHER', label: 'Ostalo' }
];

const SMS_STATUSES = [
  { value: '', label: 'Svi statusi' },
  { value: 'SUCCESS', label: 'Uspješno' },
  { value: 'FAILED', label: 'Neuspješno' },
  { value: 'PENDING', label: 'Na čekanju' }
];

export default function AdminSmsLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    phone: '',
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [filters, pagination.offset]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {
        limit: pagination.limit,
        offset: pagination.offset,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      };
      
      const response = await api.get('/admin/sms-logs', { params });
      setLogs(response.data.logs);
      setPagination(prev => ({
        ...prev,
        total: response.data.total
      }));
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri učitavanju SMS logova');
      console.error('Error loading SMS logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const response = await api.get('/admin/sms-logs/stats', { params });
      setStats(response.data);
    } catch (err) {
      console.error('Error loading SMS stats:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handlePageChange = (newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  };

  const syncFromTwilio = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      setError('');
      
      const response = await api.post('/admin/sms-logs/sync-from-twilio', {}, {
        params: { limit: 500, days: 90 }
      });
      
      setSyncResult(response.data);
      
      // Osvježi podatke nakon sinkronizacije
      await loadLogs();
      await loadStats();
      
      // Sakrij poruku nakon 5 sekundi
      setTimeout(() => setSyncResult(null), 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           err.message || 
                           'Greška pri sinkronizaciji';
      setError(errorMessage);
      console.error('Error syncing from Twilio:', err);
      console.error('Error response:', err.response?.data);
      
      // Ako je greška zbog nedostajućih credentials, prikaži detaljniju poruku
      if (err.response?.status === 400) {
        const details = err.response?.data?.details;
        if (details) {
          setError(`${errorMessage} (Account SID: ${details.hasAccountSid ? '✅' : '❌'}, Auth Token: ${details.hasAuthToken ? '✅' : '❌'})`);
        }
      }
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status) => {
    const colors = {
      SUCCESS: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const colors = {
      VERIFICATION: 'bg-blue-100 text-blue-800',
      LEAD_NOTIFICATION: 'bg-purple-100 text-purple-800',
      REFUND: 'bg-green-100 text-green-800',
      URGENT: 'bg-red-100 text-red-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  const getModeBadge = (mode) => {
    const colors = {
      twilio: 'bg-indigo-100 text-indigo-800',
      simulation: 'bg-gray-100 text-gray-800',
      twilio_error: 'bg-orange-100 text-orange-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[mode] || 'bg-gray-100 text-gray-800'}`}>
        {mode}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 SMS Logs</h1>
          <p className="text-gray-600">Pregled svih poslanih SMS-ova</p>
        </div>
        <button
          onClick={syncFromTwilio}
          disabled={syncing}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {syncing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sinkroniziranje...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Sinkroniziraj iz Twilio</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {syncResult && (
        <div className={`mb-4 p-4 rounded-lg border ${
          syncResult.success 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="font-medium mb-2">{syncResult.message}</div>
          {syncResult.synced && (
            <div className="text-sm">
              <div>Ukupno: {syncResult.synced.total}</div>
              <div>Kreirano: {syncResult.synced.created}</div>
              <div>Preskočeno: {syncResult.synced.skipped}</div>
              {syncResult.synced.errors > 0 && (
                <div className="text-red-600">Greške: {syncResult.synced.errors}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Statistike */}
      {stats && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Ukupno SMS-ova</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Uspješno</div>
            <div className="text-2xl font-bold text-green-600">{stats.byStatus?.SUCCESS || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Neuspješno</div>
            <div className="text-2xl font-bold text-red-600">{stats.byStatus?.FAILED || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Twilio</div>
            <div className="text-2xl font-bold text-indigo-600">{stats.byMode?.twilio || 0}</div>
          </div>
        </div>
      )}

      {/* Filteri */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="text"
              value={filters.phone}
              onChange={(e) => handleFilterChange('phone', e.target.value)}
              placeholder="+385..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {SMS_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {SMS_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Od datuma</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Do datuma</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tablica */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Učitavanje...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nema SMS logova za prikazane filtere
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Korisnik</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poruka</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.phone}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getTypeBadge(log.type)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getModeBadge(log.mode)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {log.user ? (
                          <div>
                            <div className="font-medium">{log.user.fullName}</div>
                            <div className="text-xs">{log.user.email}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="max-w-xs truncate">{log.message}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginacija */}
            {pagination.total > pagination.limit && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Prikazano {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} od {pagination.total}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                    disabled={pagination.offset === 0}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ← Prethodna
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sljedeća →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal za detalje */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">SMS Detalji</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedLog.phone}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Poruka</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedLog.message}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tip</label>
                    <div className="mt-1">{getTypeBadge(selectedLog.type)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mode</label>
                    <div className="mt-1">{getModeBadge(selectedLog.mode)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Datum</label>
                    <div className="mt-1 text-sm text-gray-900">{formatDate(selectedLog.createdAt)}</div>
                  </div>
                </div>
                
                {selectedLog.user && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Korisnik</label>
                    <div className="mt-1 text-sm text-gray-900">
                      <div className="font-medium">{selectedLog.user.fullName}</div>
                      <div className="text-gray-500">{selectedLog.user.email}</div>
                      <div className="text-gray-500">{selectedLog.user.role}</div>
                    </div>
                  </div>
                )}
                
                {selectedLog.twilioSid && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Twilio SID</label>
                    <div className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.twilioSid}</div>
                  </div>
                )}
                
                {selectedLog.error && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Greška</label>
                    <div className="mt-1 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                      {selectedLog.error}
                    </div>
                  </div>
                )}
                
                {selectedLog.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Metadata</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-900 font-mono">
                      <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

