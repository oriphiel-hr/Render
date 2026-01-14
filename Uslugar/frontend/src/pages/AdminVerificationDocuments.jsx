import React, { useState, useEffect } from 'react';
import api from '../api';

export default function AdminVerificationDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, [statusFilter, typeFilter]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await api.get(`/admin/verification-documents?${params.toString()}`);
      setDocuments(response.data.documents || []);
      setSummary(response.data.summary || null);
    } catch (err) {
      console.error('Error loading documents:', err);
      alert('Greška pri učitavanju dokumenata: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'kyc': 'KYC Dokument',
      'license': 'Licenca',
      'insurance': 'Osiguranje'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'kyc': 'bg-blue-100 text-blue-800',
      'license': 'bg-purple-100 text-purple-800',
      'insurance': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status, verified) => {
    if (verified) return 'bg-green-100 text-green-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status, verified) => {
    if (verified) return '✓ Verificirano';
    if (status === 'pending') return '⏳ Čeka verifikaciju';
    return status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('hr-HR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dokumenti za Verifikaciju
          </h1>
          <p className="text-gray-600">
            Pregled svih dokumenata koji čekaju verifikaciju (KYC, licence, osiguranje)
          </p>
        </div>

        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-600">Ukupno dokumenata</div>
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow-sm p-4 border border-yellow-200">
              <div className="text-sm text-yellow-700">Čeka verifikaciju</div>
              <div className="text-2xl font-bold text-yellow-900">{summary.pending}</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow-sm p-4 border border-green-200">
              <div className="text-sm text-green-700">Verificirano</div>
              <div className="text-2xl font-bold text-green-900">{summary.verified}</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200">
              <div className="text-sm text-blue-700">Po tipu</div>
              <div className="text-sm mt-1">
                KYC: {summary.byType?.kyc || 0} | 
                Licence: {summary.byType?.license || 0} | 
                Osiguranje: {summary.byType?.insurance || 0}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Svi statusi</option>
                <option value="pending">Čeka verifikaciju</option>
                <option value="verified">Verificirano</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tip dokumenta
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Svi tipovi</option>
                <option value="kyc">KYC Dokument</option>
                <option value="license">Licenca</option>
                <option value="insurance">Osiguranje</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Učitavanje dokumenata...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nema dokumenata</h3>
            <p className="mt-2 text-sm text-gray-600">
              Nema dokumenata koji odgovaraju odabranim filterima.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(doc.type)}`}>
                        {getTypeLabel(doc.type)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status, doc.verified)}`}>
                        {getStatusLabel(doc.status, doc.verified)}
                      </span>
                      {doc.daysPending !== null && doc.daysPending > 0 && (
                        <span className="text-xs text-gray-500">
                          Čeka {doc.daysPending} {doc.daysPending === 1 ? 'dan' : 'dana'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Korisnik</div>
                        <div className="font-medium text-gray-900">{doc.userName}</div>
                        <div className="text-sm text-gray-500">{doc.userEmail}</div>
                        {doc.taxId && (
                          <div className="text-sm text-gray-500">OIB: {doc.taxId}</div>
                        )}
                        {doc.legalStatus && (
                          <div className="text-sm text-gray-500">
                            {doc.legalStatus.name} ({doc.legalStatus.code})
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-sm text-gray-600">Dokument</div>
                        <div className="text-sm text-gray-900">
                          {doc.type === 'license' && doc.licenseType && (
                            <>
                              <div className="font-medium">{doc.licenseType}</div>
                              {doc.licenseNumber && (
                                <div className="text-gray-600">Broj: {doc.licenseNumber}</div>
                              )}
                              {doc.issuingAuthority && (
                                <div className="text-gray-600">Tijelo: {doc.issuingAuthority}</div>
                              )}
                              {doc.expiresAt && (
                                <div className={`text-sm ${new Date(doc.expiresAt) < new Date() ? 'text-red-600' : 'text-gray-600'}`}>
                                  Istječe: {formatDate(doc.expiresAt)}
                                </div>
                              )}
                            </>
                          )}
                          {doc.type === 'kyc' && (
                            <>
                              {doc.extractedOIB && (
                                <div className="text-gray-600">OIB iz dokumenta: {doc.extractedOIB}</div>
                              )}
                              {doc.extractedName && (
                                <div className="text-gray-600">Ime iz dokumenta: {doc.extractedName}</div>
                              )}
                              {doc.documentType && (
                                <div className="text-gray-600">Tip: {doc.documentType}</div>
                              )}
                            </>
                          )}
                          {doc.type === 'insurance' && (
                            <div className="text-gray-600">Polica osiguranja</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {doc.notes && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Bilješke:</div>
                        <div className="text-sm text-gray-900">{doc.notes}</div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Uploadano: {formatDate(doc.createdAt || doc.uploadedAt)}</span>
                      {doc.verifiedAt && (
                        <>
                          <span>•</span>
                          <span>Verificirano: {formatDate(doc.verifiedAt)}</span>
                        </>
                      )}
                      {doc.verifiedBy && (
                        <>
                          <span>•</span>
                          <span>Od: Admin ({doc.verifiedBy.substring(0, 8)}...)</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Pogledaj
                    </a>
                    {doc.type === 'kyc' && !doc.verified && (
                      <a
                        href={`/admin/provider-approvals?userId=${doc.userId}`}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Verificiraj
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

