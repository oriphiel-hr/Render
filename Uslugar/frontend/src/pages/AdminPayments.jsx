import React, { useEffect, useState } from 'react';
import api from '@/api';

export default function AdminPayments() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Clear any hash fragments (like #register-provider) from URL
    // Admin panel uses React Router, not hash-based routing
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/admin/sessions');
      setSessions(response.data.sessions);
      setError(null);
    } catch (err) {
      console.error('Error loading sessions:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Nemate pristup admin panelu. Morate biti ulogirani kao admin.');
      } else {
        setError('Failed to load payment sessions');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString('hr-HR');
  };

  const formatAmount = (amount, currency) => {
    if (!amount) return 'N/A';
    return `${(amount / 100).toFixed(2)} ${currency?.toUpperCase() || 'EUR'}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'complete':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    // Filter by status
    if (filterStatus !== 'all' && session.paymentStatus !== filterStatus) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (session.user?.fullName || '').toLowerCase().includes(searchLower) ||
        (session.user?.email || session.customerEmail || '').toLowerCase().includes(searchLower) ||
        session.plan?.toLowerCase().includes(searchLower) ||
        session.id?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Export functions
  const exportToCSV = () => {
    const headers = ['Korisnik', 'Email', 'Paket', 'Status', 'Iznos', 'Datum', 'Session ID'];
    const rows = filteredSessions.map(session => [
      session.user?.fullName || session.customerEmail || 'N/A',
      session.user?.email || session.customerEmail || 'N/A',
      session.plan || 'N/A',
      session.paymentStatus || session.status || 'N/A',
      session.amountTotal ? (session.amountTotal / 100).toFixed(2) : 'N/A',
      session.createdAt ? formatDate(session.createdAt) : 'N/A',
      session.id || 'N/A'
    ]);
    
    const csv = [headers.join(','), ...rows.map(row => 
      row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    )].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToJSON = () => {
    const data = JSON.stringify(filteredSessions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Administracija uplata</h1>
            <p className="text-gray-600">Pregled svih Stripe checkout session-a</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              📄 CSV
            </button>
            <button 
              onClick={exportToJSON}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              📄 JSON
            </button>
            <button
              onClick={loadSessions}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              🔄 Osvježi
            </button>
          </div>
        </div>
      </div>

      {/* Stats Box with Export */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-gray-600">Prikazano</div>
              <div className="text-2xl font-bold text-blue-700">
                {filteredSessions.length} / {sessions.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Ukupno</div>
              <div className="text-2xl font-bold text-gray-700">{sessions.length}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              📄 Export CSV
            </button>
            <button 
              onClick={exportToJSON}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              📄 Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">✅ Plaćeno</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredSessions.filter(s => s.paymentStatus === 'paid').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">💰 Plaćeno iznos</div>
          <div className="text-2xl font-bold text-green-700">
            {filteredSessions
              .filter(s => s.paymentStatus === 'paid')
              .reduce((sum, s) => sum + (s.amountTotal || 0), 0) / 100}€
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">❌ Neplaćeno</div>
          <div className="text-2xl font-bold text-red-600">
            {filteredSessions.filter(s => s.paymentStatus === 'unpaid' || !s.paymentStatus).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">💰 Neplaćeno iznos</div>
          <div className="text-2xl font-bold text-red-700">
            {filteredSessions
              .filter(s => s.paymentStatus === 'unpaid' || !s.paymentStatus)
              .reduce((sum, s) => sum + (s.amountTotal || 0), 0) / 100}€
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">📊 Ukupno</div>
          <div className="text-2xl font-bold text-blue-600">
            {filteredSessions.reduce((sum, s) => sum + (s.amountTotal || 0), 0) / 100}€
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pretraga
            </label>
            <input
              type="text"
              placeholder="Ime, email, plan, session ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Svi statusi</option>
              <option value="paid">Plaćeno</option>
              <option value="unpaid">Nije plaćeno</option>
              <option value="complete">Završeno</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Korisnik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Iznos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {session.user ? (
                          <a 
                            href={`#user-profile?id=${session.userId}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {session.user.fullName || session.user.email}
                          </a>
                        ) : (
                          <span>{session.customerEmail || 'N/A'}</span>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {session.user?.email || session.customerEmail || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.plan === 'PRO' ? 'bg-purple-100 text-purple-800' :
                        session.plan === 'PREMIUM' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.plan || 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {session.credits} kredita
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.paymentStatus)}`}>
                      {session.paymentStatus || session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatAmount(session.amountTotal, session.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(session.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                    {session.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

