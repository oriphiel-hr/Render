// Admin Content Moderation - Moderacija sadržaja
import React, { useState, useEffect } from 'react';
import api from '../api';

const CONTENT_TYPES = [
  { value: 'all', label: 'Sve' },
  { value: 'job', label: 'Poslovi' },
  { value: 'review', label: 'Recenzije' },
  { value: 'offer', label: 'Ponude' },
  { value: 'message', label: 'Poruke' }
];

export default function AdminModeration() {
  const [contentType, setContentType] = useState('all');
  const [moderationData, setModerationData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [moderationAction, setModerationAction] = useState({
    approved: true,
    reason: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [contentType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contentRes, statsRes] = await Promise.all([
        api.get(`/admin/moderation/pending?type=${contentType}`),
        api.get('/admin/moderation/stats')
      ]);
      
      setModerationData(contentRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri učitavanju podataka');
      console.error('Error loading moderation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (type, id, approved) => {
    try {
      const { reason, notes } = moderationAction;
      
      await api.post(`/admin/moderation/${type}/${id}`, {
        approved,
        reason: approved ? null : reason,
        notes: notes || null
      });
      
      // Reset form
      setSelectedItem(null);
      setModerationAction({ approved: true, reason: '', notes: '' });
      
      // Reload data
      await loadData();
      
      alert(approved ? 'Sadržaj odobren' : 'Sadržaj odbijen');
    } catch (err) {
      alert(err.response?.data?.error || 'Greška pri moderaciji');
      console.error('Error moderating content:', err);
    }
  };

  const openModerationModal = (item, type) => {
    setSelectedItem({ ...item, contentType: type });
    setModerationAction({ approved: true, reason: '', notes: '' });
  };

  const renderContentItem = (item, type) => {
    const commonActions = (
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => openModerationModal(item, type)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Moderiraj
        </button>
      </div>
    );

    switch (type) {
      case 'job':
        return (
          <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>👤 {item.user?.fullName || 'N/A'}</span>
                  <span>📁 {item.category?.name || 'N/A'}</span>
                  <span>📍 {item.city || 'N/A'}</span>
                  <span>💰 {item.budgetMin && item.budgetMax ? `${item.budgetMin}-${item.budgetMax} €` : 'N/A'}</span>
                  <span>📅 {new Date(item.createdAt).toLocaleDateString('hr-HR')}</span>
                </div>
              </div>
            </div>
            {commonActions}
          </div>
        );

      case 'review':
        return (
          <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl">{'⭐'.repeat(item.rating)}</div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.rating}/5
                  </span>
                </div>
                {item.comment && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {item.comment}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Od: {item.from?.fullName || 'N/A'}</span>
                  <span>Za: {item.to?.fullName || 'N/A'}</span>
                  <span>Posao: {item.job?.title || 'N/A'}</span>
                  <span>📅 {new Date(item.createdAt).toLocaleDateString('hr-HR')}</span>
                </div>
              </div>
            </div>
            {commonActions}
          </div>
        );

      case 'offer':
        return (
          <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {item.amount} €
                  </span>
                  {item.isNegotiable && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-xs">
                      Pregovorno
                    </span>
                  )}
                </div>
                {item.message && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {item.message}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>👤 {item.user?.fullName || 'N/A'}</span>
                  <span>Posao: {item.job?.title || 'N/A'}</span>
                  {item.estimatedDays && (
                    <span>⏱️ {item.estimatedDays} dana</span>
                  )}
                  <span>📅 {new Date(item.createdAt).toLocaleDateString('hr-HR')}</span>
                </div>
              </div>
            </div>
            {commonActions}
          </div>
        );

      case 'message':
        return (
          <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2">
                  {item.content && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {item.content}
                    </p>
                  )}
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {item.attachments.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Attachment ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>👤 {item.sender?.fullName || 'N/A'}</span>
                  <span>💬 {item.room?.name || item.room?.job?.title || 'N/A'}</span>
                  {item.moderationReportedAt && (
                    <span>🚩 Prijavljeno: {new Date(item.moderationReportedAt).toLocaleDateString('hr-HR')}</span>
                  )}
                  <span>📅 {new Date(item.createdAt).toLocaleDateString('hr-HR')}</span>
                </div>
              </div>
            </div>
            {commonActions}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Učitavanje...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const content = moderationData?.content || {};
  const hasContent = Object.values(content).some(arr => arr && arr.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Moderacija sadržaja</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Pregled i odobravanje/odbijanje sadržaja na platformi
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {stats.totals.pending}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Čeka moderaciju</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {stats.totals.approved}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Odobreno</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {stats.totals.rejected}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">Odbijeno</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.totals.pending + stats.totals.approved + stats.totals.rejected}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Ukupno</div>
          </div>
        </div>
      )}

      {/* Content Type Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filtriraj po tipu:
        </label>
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {CONTENT_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Content List */}
      {hasContent ? (
        <div className="space-y-4">
          {content.jobs && content.jobs.map(job => renderContentItem(job, 'job'))}
          {content.reviews && content.reviews.map(review => renderContentItem(review, 'review'))}
          {content.offers && content.offers.map(offer => renderContentItem(offer, 'offer'))}
          {content.messages && content.messages.map(message => renderContentItem(message, 'message'))}
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <p className="text-blue-800 dark:text-blue-300">
            Nema sadržaja koji čeka moderaciju za odabrani tip.
          </p>
        </div>
      )}

      {/* Moderation Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Moderiraj {CONTENT_TYPES.find(t => t.value === selectedItem.contentType)?.label || 'sadržaj'}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Akcija:
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="true"
                      checked={moderationAction.approved}
                      onChange={() => setModerationAction({ ...moderationAction, approved: true })}
                      className="mr-2"
                    />
                    <span className="text-green-600 dark:text-green-400">Odobri</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="false"
                      checked={!moderationAction.approved}
                      onChange={() => setModerationAction({ ...moderationAction, approved: false })}
                      className="mr-2"
                    />
                    <span className="text-red-600 dark:text-red-400">Odbij</span>
                  </label>
                </div>
              </div>

              {!moderationAction.approved && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Razlog odbijanja: *
                  </label>
                  <textarea
                    value={moderationAction.reason}
                    onChange={(e) => setModerationAction({ ...moderationAction, reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Navedite razlog zašto je sadržaj odbijen..."
                    required={!moderationAction.approved}
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bilješke (opcionalno):
                </label>
                <textarea
                  value={moderationAction.notes}
                  onChange={(e) => setModerationAction({ ...moderationAction, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="2"
                  placeholder="Dodatne bilješke..."
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Odustani
                </button>
                <button
                  onClick={() => {
                    if (!moderationAction.approved && !moderationAction.reason) {
                      alert('Molimo unesite razlog odbijanja');
                      return;
                    }
                    handleModerate(selectedItem.contentType, selectedItem.id, moderationAction.approved);
                  }}
                  className={`px-4 py-2 rounded-lg text-white ${
                    moderationAction.approved
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {moderationAction.approved ? 'Odobri' : 'Odbij'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

