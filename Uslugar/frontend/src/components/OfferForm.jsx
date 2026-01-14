import React, { useState, useEffect } from 'react';
import { createOffer, canSendOffer } from '../api/offers';
import api from '../api';

const OfferForm = ({ job, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(job?.budgetMin?.toString() || '');
  const [message, setMessage] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [estimatedDays, setEstimatedDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canSend, setCanSend] = useState(true);
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    checkCanSendOffer();
  }, []);

  const checkCanSendOffer = async () => {
    try {
      const response = await canSendOffer();
      setCanSend(response.data.canSend);
      setCredits(response.data.credits);
    } catch (err) {
      console.error('Error checking offer eligibility:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!amount || parseFloat(amount) <= 0) {
      setError('Molimo unesite valjanu cijenu');
      setLoading(false);
      return;
    }

    try {
      await createOffer(
        job.id,
        amount,
        message,
        isNegotiable,
        estimatedDays || null
      );
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Greška pri slanju ponude');
      if (err.response?.status === 403 && err.response?.data?.message?.includes('kredita')) {
        // Ako nema kredita, možda želi nadograditi pretplatu
        if (confirm('Nemate dovoljno kredita. Želite li nadograditi pretplatu?')) {
          window.location.hash = '#subscription';
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pošalji ponudu
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Zatvori"
            >
              ✕
            </button>
          </div>

          {job && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{job.city}</p>
              {job.budgetMin && job.budgetMax && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Budžet: {job.budgetMin} - {job.budgetMax} €
                </p>
              )}
            </div>
          )}

          {!canSend && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Nemate dovoljno kredita za slanje ponude.
                {credits !== null && (
                  <span className="block mt-1">Trenutno kredita: {credits}</span>
                )}
              </p>
              <button
                onClick={() => {
                  onClose();
                  window.location.hash = '#subscription';
                }}
                className="mt-2 text-sm text-yellow-800 dark:text-yellow-200 underline"
              >
                Nadogradite pretplatu →
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cijena (€) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
                disabled={!canSend || loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Poruka uz ponudu
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Opišite svoj pristup poslu, iskustvo i zašto ste pravi izbor..."
                disabled={!canSend || loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Procijenjeni broj dana za izvršenje
              </label>
              <input
                type="number"
                min="1"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Npr. 7"
                disabled={!canSend || loading}
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="mr-2"
                  disabled={!canSend || loading}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Ponuda je pregovorna (spremni smo na fleksibilnost u cijeni)
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Odustani
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canSend || loading}
              >
                {loading ? 'Slanje...' : 'Pošalji ponudu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OfferForm;

