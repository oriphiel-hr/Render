/**
 * Invoices Page - Povijest faktura
 */

import React, { useState, useEffect } from 'react';
import api from '../api';

function isDocsScreenshotMode() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('screenshotMode') === 'docs';
}

function getDocsInvoicesMock() {
  const now = Date.now();
  return [
    {
      id: 'docs-inv-1',
      invoiceNumber: '2026-0101',
      type: 'LEAD_PURCHASE',
      status: 'DRAFT',
      totalAmount: 1250,
      issueDate: new Date(now - 1000 * 60 * 60 * 24 * 1).toISOString(),
      dueDate: new Date(now + 1000 * 60 * 60 * 24 * 13).toISOString(),
      leadPurchase: { job: { title: 'Sanacija krova nakon nevremena' } },
      emailSentAt: null,
      emailSentTo: null,
    },
    {
      id: 'docs-inv-2',
      invoiceNumber: '2026-0102',
      type: 'LEAD_PURCHASE',
      status: 'SENT',
      totalAmount: 2375,
      issueDate: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
      dueDate: new Date(now + 1000 * 60 * 60 * 24 * 11).toISOString(),
      leadPurchase: { job: { title: 'Zamjena podova i izolacija' } },
      emailSentAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
      emailSentTo: 'demo-provider@uslugar.hr',
    },
    {
      id: 'docs-inv-3',
      invoiceNumber: '2026-0103',
      type: 'ADDON',
      status: 'PAID',
      totalAmount: 4990,
      issueDate: new Date(now - 1000 * 60 * 60 * 24 * 8).toISOString(),
      dueDate: new Date(now - 1000 * 60 * 60 * 24 * 1).toISOString(),
      addon: { displayName: '100 Extra Credits' },
      paidAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
      emailSentAt: new Date(now - 1000 * 60 * 60 * 24 * 8).toISOString(),
      emailSentTo: 'demo-provider@uslugar.hr',
    },
    {
      id: 'docs-inv-4',
      invoiceNumber: '2026-0104',
      type: 'LEAD_PURCHASE',
      status: 'STORNED',
      totalAmount: 1500,
      issueDate: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
      dueDate: new Date(now + 1000 * 60 * 60 * 24 * 9).toISOString(),
      leadPurchase: { job: { title: 'Procjena štete i hitna sanacija dimnjaka' } },
      emailSentAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
      emailSentTo: 'demo-provider@uslugar.hr',
    },
  ];
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, SUBSCRIPTION, LEAD_PURCHASE
  const [statusFilter, setStatusFilter] = useState('all'); // all, DRAFT, SENT, PAID, CANCELLED

  useEffect(() => {
    loadInvoices();
  }, [filter, statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (filter !== 'all') params.type = filter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await api.get('/invoices', { params });
      const nextInvoices = response.data.invoices || [];
      if (isDocsScreenshotMode() && nextInvoices.length === 0) {
        setInvoices(getDocsInvoicesMock());
      } else {
        setInvoices(nextInvoices);
      }
    } catch (err) {
      console.error('Error loading invoices:', err);
      if (isDocsScreenshotMode()) {
        setInvoices(getDocsInvoicesMock());
        setError('');
      } else {
        setError(err.response?.data?.error || 'Greška pri učitavanju faktura.');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });

      // Kreiraj download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `faktura-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Greška pri preuzimanju PDF-a');
    }
  };

  const resendInvoice = async (invoiceId) => {
    try {
      await api.post(`/invoices/${invoiceId}/send`);
      alert('Faktura je uspješno poslana na email!');
      await loadInvoices();
    } catch (err) {
      console.error('Error resending invoice:', err);
      alert(err.response?.data?.error || 'Greška pri slanju fakture');
    }
  };

  const formatCurrency = (cents) => {
    return `${(cents / 100).toFixed(2)} €`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('hr-HR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    if (type === 'SUBSCRIPTION') return 'Pretplata';
    if (type === 'ADDON') return 'Add-on paket';
    return 'Kupovina leada';
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'text-gray-600 bg-gray-100',
      SENT: 'text-blue-600 bg-blue-100',
      PAID: 'text-green-600 bg-green-100',
      CANCELLED: 'text-red-600 bg-red-100',
      STORNED: 'text-red-700 bg-red-100'
    };
    
    const labels = {
      DRAFT: 'Nacrt',
      SENT: 'Poslana',
      PAID: 'Plaćena',
      CANCELLED: 'Otkazana',
      STORNED: 'Stornirana'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'text-gray-600 bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">⏳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Učitavanje faktura...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Moje fakture</h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filtri */}
      <div className="mb-6 flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Svi tipovi</option>
          <option value="SUBSCRIPTION">Pretplate</option>
          <option value="LEAD_PURCHASE">Kupovine leadova</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Svi statusi</option>
          <option value="DRAFT">Nacrt</option>
          <option value="SENT">Poslana</option>
          <option value="PAID">Plaćena</option>
          <option value="CANCELLED">Otkazana</option>
        </select>
      </div>

      {/* Lista faktura */}
      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nema faktura</h3>
          <p className="text-gray-600">Nemate još nijednu fakturu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </h3>
                    {getStatusBadge(invoice.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Tip:</span> {getTypeLabel(invoice.type)}
                    </div>
                    <div>
                      <span className="font-medium">Datum:</span> {formatDate(invoice.issueDate)}
                    </div>
                    <div>
                      <span className="font-medium">Rok:</span> {formatDate(invoice.dueDate)}
                    </div>
                    <div>
                      <span className="font-medium">Ukupno:</span>{' '}
                      <span className="font-bold text-green-600">
                        {formatCurrency(invoice.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {invoice.subscription && (
                    <p className="text-sm text-gray-600 mb-2">
                      Plan: {invoice.subscription.plan}
                    </p>
                  )}

                  {invoice.leadPurchase && invoice.leadPurchase.job && (
                    <p className="text-sm text-gray-600 mb-2">
                      Lead: {invoice.leadPurchase.job.title}
                    </p>
                  )}

                  {invoice.emailSentAt && (
                    <p className="text-xs text-gray-500">
                      Poslano: {formatDate(invoice.emailSentAt)} na {invoice.emailSentTo}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => downloadPDF(invoice.id, invoice.invoiceNumber)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    📥 Preuzmi PDF
                  </button>
                  {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                    <button
                      onClick={() => resendInvoice(invoice.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      ✉️ Pošalji email
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistika */}
      {invoices.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistika</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Ukupno faktura</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plaćeno</p>
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter((i) => i.status === 'PAID').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Na čekanju</p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoices.filter((i) => i.status === 'SENT' || i.status === 'DRAFT').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ukupan iznos</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  invoices.filter((i) => i.status === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

