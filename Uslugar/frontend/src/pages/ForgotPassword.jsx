import React, { useState } from 'react';
import api from '../api';
import { validateEmail } from '../utils/validators';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Real-time email validacija
    if (value && !validateEmail(value)) {
      setEmailError('Email adresa nije valjana');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    // Validacija emaila prije slanja
    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Email adresa nije valjana');
      setEmailError('Email adresa nije valjana');
      return;
    }

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(response.data.message || 'Password reset email sent!');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Greška pri slanju email-a');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Email poslan!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-blue-900 mb-2">
                📧 <strong>Provjerite svoj email inbox</strong>
              </p>
              <p className="text-sm text-gray-700">
                Ako račun s tim email-om postoji, primiti ćete link za resetiranje lozinke.
                Link vrijedi <strong>1 sat</strong>.
              </p>
            </div>
            <button
              onClick={() => {
                window.location.hash = '#user';
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Povratak na početnu
            </button>
            <button
              onClick={() => setStatus('idle')}
              className="w-full mt-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Pošalji ponovo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Zaboravili ste lozinku?</h2>
          <p className="text-gray-600">
            Unesite vašu email adresu i poslati ćemo vam link za resetiranje lozinke.
          </p>
        </div>

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-sm text-red-700">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email adresa
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="vas@email.com"
              disabled={status === 'loading'}
            />
            {emailError && (
              <p className="text-xs text-red-600 mt-1">✗ {emailError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Šaljem...
              </span>
            ) : (
              'Pošalji link za resetiranje'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Sjetili ste se lozinke?{' '}
            <button
              onClick={() => window.location.hash = '#user'}
              className="text-blue-600 hover:underline font-medium"
            >
              Prijavite se
            </button>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 text-center">
              <strong>Savjet za sigurnost:</strong> Link za resetiranje vrijedi samo 1 sat.
              Nakon toga morate zatražiti novi link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

