import React, { useEffect, useState } from 'react';
import api from '@/api';

export default function AdminProviderApprovals() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [approvalAction, setApprovalAction] = useState(null); // 'approve' | 'reject'
  const [rejectionNotes, setRejectionNotes] = useState('');

  useEffect(() => {
    loadPendingProviders();
  }, []);

  const loadPendingProviders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/providers/pending');
      setProviders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading pending providers:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Nemate pristup admin panelu. Morate biti ulogirani kao admin.');
      } else {
        setError('Failed to load pending providers');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (providerId) => {
    setSelectedProvider(providerId);
    setApprovalAction('approve');
  };

  const handleReject = (providerId) => {
    setSelectedProvider(providerId);
    setApprovalAction('reject');
  };

  const confirmAction = async () => {
    if (!selectedProvider) return;

    try {
      const status = approvalAction === 'approve' ? 'APPROVED' : 'REJECTED';
      const notes = approvalAction === 'reject' ? rejectionNotes : undefined;

      await api.patch(`/admin/providers/${selectedProvider}/approval`, {
        status,
        notes
      });

      // Reload list
      loadPendingProviders();

      // Reset state
      setSelectedProvider(null);
      setApprovalAction(null);
      setRejectionNotes('');
    } catch (err) {
      console.error('Error approving/rejecting provider:', err);
      alert('Greška pri odobrenju/odbijanju pružatelja');
    }
  };

  const cancelAction = () => {
    setSelectedProvider(null);
    setApprovalAction(null);
    setRejectionNotes('');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Odobrenje pružatelja</h1>
        <p className="text-gray-600">
          {providers.length} {providers.length === 1 ? 'pružatelj čeka' : 'pružatelja čeka'} odobrenje
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Prikaženo</div>
          <div className="text-2xl font-bold text-gray-900">{providers.length}</div>
          <div className="text-xs text-gray-400">pružatelja</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">📋 Licence</div>
          <div className="text-2xl font-bold text-blue-600">
            {providers.reduce((sum, p) => sum + (p.licenses?.length || 0), 0)}
          </div>
          <div className="text-xs text-gray-400">ukupno</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">📅 Prosjek čekanja</div>
          <div className="text-2xl font-bold text-gray-700">
            {providers.length > 0 
              ? Math.round(providers.reduce((sum, p) => {
                  const days = Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24));
                  return sum + days;
                }, 0) / providers.length)
              : 0} dana
          </div>
        </div>
      </div>

      {/* Providers List */}
      {providers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-600">Svi pružatelji su odobreni!</p>
          <p className="text-sm text-gray-500 mt-2">Nema pružatelja koji čekaju odobrenje.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {providers.map((provider) => (
            <div key={provider.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="p-6">
                {/* Provider Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{provider.user.fullName}</h3>
                    <p className="text-sm text-gray-500">{provider.user.email}</p>
                    {provider.user.phone && (
                      <p className="text-sm text-gray-500">{provider.user.phone}</p>
                    )}
                    {provider.user.city && (
                      <p className="text-sm text-gray-500">{provider.user.city}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      ⏳ Čeka odobrenje
                    </span>
                    <p className="text-xs text-gray-500 mt-2">
                      Registriran: {new Date(provider.user.createdAt).toLocaleDateString('hr-HR')}
                    </p>
                  </div>
                </div>

                {/* Categories */}
                {provider.categories && provider.categories.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Kategorije:</h4>
                    <div className="flex flex-wrap gap-2">
                      {provider.categories.map(cat => (
                        <span key={cat.id} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Licenses */}
                {provider.licenses && provider.licenses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Licence ({provider.licenses.length}):
                    </h4>
                    <div className="space-y-2">
                      {provider.licenses.map(license => (
                        <div key={license.id} className="border rounded p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{license.licenseType}</p>
                              <p className="text-sm text-gray-600">{license.issuingAuthority}</p>
                              {license.documentUrl && (
                                <a 
                                  href={license.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                                >
                                  📄 Pogledaj dokument
                                </a>
                              )}
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              license.isVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {license.isVerified ? '✓ Verificirano' : '⏳ Čeka verifikaciju'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(provider.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ✓ Odobri
                  </button>
                  <button
                    onClick={() => handleReject(provider.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ✕ Odbij
                  </button>
                  <button
                    onClick={() => window.location.href = `#admin-User?id=${provider.userId}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    👤 Profil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {approvalAction === 'reject' && selectedProvider && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Odbij pružatelja</h3>
            <label className="block mb-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Razlog odbijanja:</div>
              <textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Opišite razlog odbijanja..."
                rows={4}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
              />
            </label>
            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelAction}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Odustani
              </button>
              <button
                onClick={confirmAction}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Odbij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {approvalAction === 'approve' && selectedProvider && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Odobri pružatelja?</h3>
            <p className="text-gray-600 mb-6">
              Pružatelj će dobiti TRIAL status i moći će koristiti platformu.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelAction}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Odustani
              </button>
              <button
                onClick={confirmAction}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Odobri
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6">
        <button
          onClick={loadPendingProviders}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Osvježi
        </button>
      </div>
    </div>
  );
}
