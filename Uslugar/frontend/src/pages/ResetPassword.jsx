import React, { useEffect, useState } from 'react';
import api from '../api';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Izvuci token iz URL-a
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const resetToken = params.get('token');
    
    if (!resetToken) {
      setStatus('error');
      setMessage('Nedostaje reset token. Molimo zatražite novi link.');
    } else {
      setToken(resetToken);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validacija
    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('Lozinka mora imati najmanje 6 znakova');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Lozinke se ne podudaraju');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });
      
      setStatus('success');
      setMessage(response.data.message || 'Lozinka uspješno resetirana!');
      setUserEmail(response.data.user?.email || '');
    } catch (error) {
      setStatus('error');
      const errorMsg = error.response?.data?.error;
      
      if (errorMsg?.includes('expired')) {
        setMessage('Link za resetiranje je istekao. Molimo zatražite novi link.');
      } else if (errorMsg?.includes('Invalid')) {
        setMessage('Neispravan link za resetiranje. Molimo zatražite novi link.');
      } else {
        setMessage(errorMsg || 'Greška pri resetiranju lozinke');
      }
    }
  };

  // Success screen
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Lozinka resetirana!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            {userEmail && (
              <p className="text-sm text-gray-500 mb-6">Email: {userEmail}</p>
            )}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-green-900">
                ✓ Sada se možete prijaviti sa svojom novom lozinkom
              </p>
            </div>
            <button
              onClick={() => {
                window.location.hash = '#user';
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Prijavite se
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Resetirajte lozinku</h2>
          <p className="text-gray-600">
            Unesite novu lozinku za svoj račun.
          </p>
        </div>

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-sm text-red-700">{message}</p>
            {message.includes('istekao') || message.includes('Neispravan') ? (
              <button
                onClick={() => {
                  window.location.hash = '#forgot-password';
                }}
                className="mt-3 text-sm text-red-800 hover:text-red-900 font-medium underline"
              >
                Zatražite novi link
              </button>
            ) : null}
          </div>
        )}

        {!token ? (
          <div className="text-center">
            <p className="text-gray-600 mb-6">Nedostaje reset token</p>
            <button
              onClick={() => window.location.hash = '#forgot-password'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Zatražite novi link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova lozinka <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={status === 'loading'}
              />
              <p className="text-xs text-gray-500 mt-1">Minimalno 6 znakova</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potvrdite lozinku <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={status === 'loading'}
              />
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-red-600">⚠ Lozinke se ne podudaraju</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !token}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetiram...
                </span>
              ) : (
                'Resetiraj lozinku'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 text-center">
              <strong>Napomena:</strong> Nakon resetiranja lozinke, bit ćete preusmjereni na login stranicu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

