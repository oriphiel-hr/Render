// Admin Contact Inquiries - Pregled kontakt upita s web forme
import React, { useState, useEffect } from 'react';
import api from '../api';

const SUBJECT_LABELS = {
  general: 'Općenito pitanje',
  technical: 'Tehnička podrška',
  business: 'Poslovni upit',
  partnership: 'Partnerstvo',
  complaint: 'Žalba'
};

export default function AdminContactInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    subject: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({ limit: 50, offset: 0 });

  const loadInquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        limit: pagination.limit,
        offset: pagination.offset,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== '')
        )
      };
      const res = await api.get('/admin/contact-inquiries', { params });
      setInquiries(res.data.inquiries);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [filters, pagination.offset]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const handlePageChange = (delta) => {
    const newOffset = Math.max(0, pagination.offset + delta);
    setPagination((prev) => ({ ...prev, offset: newOffset }));
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleString('hr-HR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Kontakt upiti</h2>

      {/* Filteri */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Predmet</label>
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Svi</option>
            {Object.entries(SUBJECT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Od datuma</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Do datuma</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={loadInquiries}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Osvježi
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Učitavanje...</div>
      ) : (
        <>
          <p className="text-sm text-gray-600">Ukupno: {total} upita</p>

          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ime</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Predmet</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Poruka</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Akcije</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nema upita
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-600">{formatDate(inq.createdAt)}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{inq.name}</td>
                      <td className="px-4 py-2 text-sm">
                        <a href={`mailto:${inq.email}`} className="text-indigo-600 hover:underline">
                          {inq.email}
                        </a>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {SUBJECT_LABELS[inq.subject] || inq.subject}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">
                        {inq.message}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setSelected(inq)}
                          className="text-indigo-600 hover:underline text-sm"
                        >
                          Detalji
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginacija */}
          {total > pagination.limit && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => handlePageChange(-pagination.limit)}
                disabled={pagination.offset === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ← Prethodna
              </button>
              <span className="text-sm text-gray-600">
                {pagination.offset + 1}–{Math.min(pagination.offset + pagination.limit, total)} od {total}
              </span>
              <button
                onClick={() => handlePageChange(pagination.limit)}
                disabled={pagination.offset + pagination.limit >= total}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Sljedeća →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal s detaljima */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detalji upita</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Datum</dt>
                <dd>{formatDate(selected.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Ime</dt>
                <dd className="font-medium">{selected.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd>
                  <a href={`mailto:${selected.email}`} className="text-indigo-600 hover:underline">
                    {selected.email}
                  </a>
                </dd>
              </div>
              {selected.phone && (
                <div>
                  <dt className="text-gray-500">Telefon</dt>
                  <dd>
                    <a href={`tel:${selected.phone}`} className="text-indigo-600 hover:underline">
                      {selected.phone}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Predmet</dt>
                <dd>{SUBJECT_LABELS[selected.subject] || selected.subject}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Poruka</dt>
                <dd className="whitespace-pre-wrap bg-gray-50 p-3 rounded">{selected.message}</dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <a
                href={`mailto:${selected.email}?subject=Re: ${SUBJECT_LABELS[selected.subject] || selected.subject}`}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                📧 Odgovori
              </a>
              {selected.phone && (
                <a
                  href={`tel:${selected.phone}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  📞 Nazovi
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
