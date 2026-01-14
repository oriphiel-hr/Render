import React, { useEffect, useState } from 'react';
import api from '@/api';

export default function PaymentSuccess({ setTab }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Get session_id from URL (works with hash-based routing)
    // URL format: #subscription-success?session_id=...
    const hash = window.location.hash;
    
    // Parse query params from hash
    let sessionIdParam = null;
    if (hash.includes('?')) {
      const hashParts = hash.split('?');
      const paramsString = hashParts[1];
      const urlParams = new URLSearchParams(paramsString);
      sessionIdParam = urlParams.get('session_id');
    }
    
    if (!sessionIdParam) {
      setStatus('error');
      setError('Session ID not found');
      return;
    }

    setSessionId(sessionIdParam);
    
    // Verify payment with backend
    api.get(`/payments/success?session_id=${sessionIdParam}`)
      .then(response => {
        setStatus('success');
        
        // Set a flag in localStorage to trigger subscription data refresh
        localStorage.setItem('payment_successful', 'true');
        
        // Redirect to subscription page after payment
        setTimeout(() => {
          window.location.hash = '#subscription';
        }, 3000);
      })
      .catch(err => {
        console.error('Payment verification error:', err);
        setStatus('error');
        setError(err.response?.data?.message || 'Failed to verify payment');
      });
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Provjerava se plaćanje...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Greška pri potvrdi plaćanja
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => setTab('pricing')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Povratak na cjenik
            </button>
            <button
              onClick={() => setTab('subscription')}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Moj pretplata
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pretplata uspješno aktivirana!
        </h1>
        <p className="text-gray-600 mb-6">
          Hvala vam na pretplati. Vaša pretplata je uspješno aktivirana i
          krediti su dodani na vaš račun.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => setTab('subscription')}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Idi na pretplatu
          </button>
          <button
            onClick={() => setTab('leads')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Pregledaj leadove
          </button>
        </div>
        {sessionId && (
          <p className="mt-6 text-xs text-gray-500">
            Session ID: {sessionId}
          </p>
        )}
      </div>
    </div>
  );
}

