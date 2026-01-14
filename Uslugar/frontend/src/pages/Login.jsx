import React, { useState } from 'react';
import api from '@/api';
import { validateEmail } from '../utils/validators';

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [userType, setUserType] = useState(null); // null | 'USER' | 'PROVIDER'
  const [requiresRoleSelection, setRequiresRoleSelection] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);

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
    setError('');
    setLoading(true);
    setRequiresRoleSelection(false);

    // Validacija emaila prije slanja
    if (!validateEmail(email)) {
      setError('Email adresa nije valjana');
      setEmailError('Email adresa nije valjana');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        ...(userType && { role: userType }) // Dodaj role samo ako je odabran
      });

      // Check if role selection is required
      if (response.data.requiresRoleSelection) {
        setRequiresRoleSelection(true);
        setAvailableRoles(response.data.availableRoles || []);
        setLoading(false);
        return;
      }

      if (response.data.token) {
        // Save token and user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Call success callback
        if (onSuccess) {
          onSuccess(response.data.token, response.data.user);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Greška pri prijavi. Provjerite email i lozinku.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async (selectedRole) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        role: selectedRole
      });

      if (response.data.token) {
        // Save token and user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Call success callback
        if (onSuccess) {
          onSuccess(response.data.token, response.data.user);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Greška pri prijavi. Provjerite email i lozinku.');
    } finally {
      setLoading(false);
    }
  };

  // If role selection is required, show role selection UI
  if (requiresRoleSelection) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Odaberite ulogu</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vaša tvrtka ima registriranu i korisničku i pružateljsku ulogu. Odaberite kako želite pristupiti platformi.
          </p>

          {error && (
            <div 
              className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <div className="space-y-3">
            {availableRoles.map((roleOption) => (
              <button
                key={roleOption.role}
                onClick={() => handleRoleSelection(roleOption.role)}
                disabled={loading}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all bg-white dark:bg-gray-700 ${
                  roleOption.role === 'USER'
                    ? 'border-blue-500 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:border-blue-400'
                    : 'border-green-500 hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:border-green-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {roleOption.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {roleOption.description}
                    </p>
                  </div>
                  <div className={`ml-4 text-2xl ${
                    roleOption.role === 'USER' ? 'text-blue-500 dark:text-blue-400' : 'text-green-500 dark:text-green-400'
                  }`}>
                    {roleOption.role === 'USER' ? '👤' : '🏢'}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setRequiresRoleSelection(false);
              setAvailableRoles([]);
            }}
            className="mt-4 w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
          >
            ← Povratak na prijavu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Prijava</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Prijavite se na svoj račun</p>

        {/* Odabir tipa korisnika */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Prijavite se kao: <span className="text-xs text-gray-500 font-normal">(opcionalno)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType(userType === 'USER' ? null : 'USER')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                userType === 'USER'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`text-2xl ${userType === 'USER' ? 'text-green-500 dark:text-green-400' : 'text-gray-400'}`}>
                  👤
                </div>
                <div>
                  <div className={`font-semibold ${userType === 'USER' ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Korisnik usluge
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Tražim usluge
                  </div>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setUserType(userType === 'PROVIDER' ? null : 'PROVIDER')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                userType === 'PROVIDER'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`text-2xl ${userType === 'PROVIDER' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400'}`}>
                  🏢
                </div>
                <div>
                  <div className={`font-semibold ${userType === 'PROVIDER' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    Pružatelj usluge
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Nudim usluge
                  </div>
                </div>
              </div>
            </button>
          </div>
          {userType && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Odabrano: {userType === 'USER' ? 'Korisnik usluge' : 'Pružatelj usluge'} • Kliknite ponovno za poništavanje
            </p>
          )}
        </div>

        {error && (
          <div 
            className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Prijava forma">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-600" aria-label="obavezno polje">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                emailError ? 'border-red-500 dark:border-red-400' : 'border-gray-300'
              }`}
              placeholder="vas@email.com"
              disabled={loading}
              aria-describedby={emailError ? 'email-error' : undefined}
              aria-invalid={!!emailError}
              autoComplete="email"
            />
            {emailError && (
              <p id="email-error" className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
                ✗ {emailError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lozinka <span className="text-red-600" aria-label="obavezno polje">*</span>
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="login-remember" className="flex items-center cursor-pointer">
              <input
                id="login-remember"
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Zapamti me</span>
            </label>
            <a
              href="#forgot-password"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Zaboravili ste lozinku? Otvori stranicu za reset lozinke"
            >
              Zaboravili ste lozinku?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-busy={loading}
            aria-label={loading ? 'Prijavljivanje u tijeku' : 'Prijavite se'}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Prijava...
              </span>
            ) : (
              'Prijavite se'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nemate račun?{' '}
            <a 
              href="#register-user" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Registrirajte se kao korisnik"
            >
              Registrirajte se kao korisnik
            </a>
            {' '}ili{' '}
            <a 
              href="#register-user" 
              className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 font-medium underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
              aria-label="Registrirajte se kao pružatelj usluga"
            >
              kao pružatelj usluga
            </a>
          </p>
        </div>

        {/* Social login (opciono za kasnije) */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ili se prijavite s</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
              <span className="ml-2">Twitter</span>
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">GitHub</span>
            </button>
          </div>
          <p className="mt-2 text-xs text-center text-gray-500">
            Social login uskoro dostupan
          </p>
        </div>
      </div>
    </div>
  );
}

