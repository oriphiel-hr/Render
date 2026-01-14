import React, { useState, useEffect } from 'react';
import api from '../api';

export default function AdminKYCMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/kyc-metrics');
      setMetrics(response.data);
    } catch (err) {
      console.error('Error loading KYC metrics:', err);
      setError(err.response?.data?.error || 'Greška pri učitavanju metrika');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nema podataka o KYC verifikacijama</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">KYC Verifikacija Metrike</h2>
        <button
          onClick={loadMetrics}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          🔄 Osvježi
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Ukupno Registriranih</div>
          <div className="text-3xl font-bold text-gray-900">{metrics.total}</div>
        </div>
        
        <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
          <div className="text-sm text-green-700 mb-1">Verificiran</div>
          <div className="text-3xl font-bold text-green-600">{metrics.verified}</div>
          <div className="text-sm text-green-600 mt-1">{metrics.verificationRate}</div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
          <div className="text-sm text-yellow-700 mb-1">Dokument Uploadan</div>
          <div className="text-3xl font-bold text-yellow-600">{metrics.pendingDocument}</div>
          <div className="text-xs text-yellow-600 mt-1">Čeka odobrenje</div>
        </div>
        
        <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
          <div className="text-sm text-red-700 mb-1">Nikad Verificiran</div>
          <div className="text-3xl font-bold text-red-600">{metrics.neverVerified}</div>
          <div className="text-xs text-red-600 mt-1">{metrics.avgVerificationMinutes} min prosjek</div>
        </div>
      </div>

      {/* By Status Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Raspodjela po Pravnom Statusu</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pravni Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ujedno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Napomena
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.byStatus && metrics.byStatus.length > 0 ? (
                metrics.byStatus.map((status, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {status.name || status.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {status.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {status.code === 'FREELANCER' && (
                        <span className="text-blue-600">Potreban RPO dokument</span>
                      )}
                      {(status.code === 'DOO' || status.code === 'JDOO') && (
                        <span className="text-green-600">Auto-verifikacija: Sudski registar</span>
                      )}
                      {(status.code === 'SOLE_TRADER' || status.code === 'PAUSAL') && (
                        <span className="text-green-600">Auto-verifikacija: Obrtni registar</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    Nema podataka
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifikacija Rate</h3>
          <div className="text-4xl font-bold text-indigo-600">{metrics.verificationRate}</div>
          <p className="text-sm text-gray-500 mt-2">
            {metrics.verified} od {metrics.total} pružatelja verificirano
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Prosječno vrijeme</h3>
          <div className="text-4xl font-bold text-indigo-600">
            {metrics.avgVerificationMinutes} min
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Prosjek vremena do verifikacije
          </p>
        </div>
      </div>
    </div>
  );
}

