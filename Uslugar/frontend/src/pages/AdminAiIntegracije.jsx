// Admin AI i Integracije - Pregled AI funkcionalnosti i integracija
import React, { useState, useEffect } from 'react';
import api from '../api';

export default function AdminAiIntegracije() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/ai-status');
      setStatus(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri učitavanju statusa');
      console.error('Error loading AI status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Učitavanje statusa AI i integracija...</p>
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">AI i Integracije</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Pregled AI funkcionalnosti, scoring sustava i vanjskih integracija
        </p>
      </div>

      {/* OpenAI integracija */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">OpenAI integracija</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Koristi se za moderaciju recenzija (provjera sadržaja)
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                status?.openaiConfigured
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
              }`}
            >
              {status?.openaiConfigured ? '✓ Konfigurirano' : '⚠ Nije konfigurirano'}
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {status?.openaiConfigured
              ? 'OPENAI_API_KEY je postavljen. Moderacija recenzija koristi OpenAI Moderation API.'
              : 'OPENAI_API_KEY nije postavljen. Moderacija recenzija koristi fallback (lista zabranjenih riječi i regex provjere).'}
          </p>
          {!status?.openaiConfigured && (
            <a
              href="/docs/SETUP-OPENAI-API-KEY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-3 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Upute za postavljanje API ključa →
            </a>
          )}
        </div>
      </section>

      {/* Lead scoring */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Quality Score</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Bodovanje kvalitete leadova (klijenata)
          </p>
        </div>
        <div className="p-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Rule-based algoritam
          </span>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Bodovanje se izračunava prema fiksnim pravilima u kodu (npr. verificiran email +5 bodova,
            budžet &gt;500 +5 bodova). Ne koristi vanjski AI/ML API.
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Izvor: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">backend/src/services/ai-lead-scoring.js</code>
          </p>
        </div>
      </section>

      {/* Partner score */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partner Score (pružatelji)</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Bodovanje pružatelja usluga u queue sustavu
          </p>
        </div>
        <div className="p-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Rule-based algoritam
          </span>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Partner Score također koristi rule-based logiku. Nema poziva vanjskim AI servisima.
          </p>
        </div>
      </section>

      {/* Sažetak */}
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Što znači &quot;rule-based&quot;?</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Algoritam radi prema fiksnim pravilima u kodu (&quot;ako X onda Y&quot;). Nema strojnog učenja,
          neuralnih mreža ni poziva vanjskom AI API-ju. Sve je if-then logika definirana programski.
        </p>
      </div>
    </div>
  );
}
