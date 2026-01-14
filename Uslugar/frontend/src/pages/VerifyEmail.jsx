import React, { useEffect, useState } from 'react';
import api from '../api';

export default function VerifyEmail() {
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Nedostaje verification token');
      return;
    }

    // Pozovi verification endpoint
    api.get(`/auth/verify?token=${token}`)
      .then(response => {
        setStatus('success');
        setMessage(response.data.message || 'Email uspješno verificiran!');
        setUserEmail(response.data.user?.email || '');
      })
      .catch(error => {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Greška pri verifikaciji');
      });
  }, []);

  const handleResend = async () => {
    if (!userEmail) {
      alert('Unesite vašu email adresu');
      return;
    }

    try {
      await api.post('/auth/resend-verification', { email: userEmail });
      alert('Verification email poslan ponovo! Provjerite inbox.');
    } catch (error) {
      alert(error.response?.data?.error || 'Greška pri slanju email-a');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificiram email...</h2>
            <p className="text-gray-600">Molimo pričekajte</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Email verificiran!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            {userEmail && (
              <p className="text-sm text-gray-500 mb-6">Email: {userEmail}</p>
            )}
            <button
              onClick={() => {
                window.location.hash = '#user';
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Nastavite na platformu
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Verifikacija neuspješna</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-900 font-medium mb-3">
                Možete zatražiti novi verification link:
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Vaša email adresa"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleResend}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg"
                >
                  Pošalji ponovo
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.hash = '#user';
              }}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Povratak na početnu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

