import React, { useState, useEffect } from 'react';
import api from '../api';
import { useLegalStatuses } from '../hooks/useLegalStatuses';
import { validateOIB } from '../utils/validators';

export default function UpgradeToProvider() {
  const { legalStatuses, loading: loadingStatuses } = useLegalStatuses();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    legalStatusId: '',
    taxId: '',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [oibError, setOibError] = useState('');

  useEffect(() => {
    // Auto-fill email if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setFormData(prev => ({ ...prev, email: payload.email }));
        setUser(payload);
      } catch (err) {
        console.error('Failed to parse token:', err);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validacija OIB-a u realnom vremenu
    if (name === 'taxId') {
      if (value && !validateOIB(value)) {
        setOibError('OIB nije validan. Provjerite kontrolnu znamenku.');
      } else {
        setOibError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // VALIDACIJA: Pravni status je OBAVEZAN za pružatelje
      if (!formData.legalStatusId) {
        setError('Pravni status je obavezan. Odaberite pravni oblik vašeg poslovanja.');
        setLoading(false);
        return;
      }
      
      if (!formData.taxId) {
        setError('OIB je obavezan za pružatelje usluga.');
        setLoading(false);
        return;
      }
      
      // Validacija OIB-a prije slanja
      if (formData.taxId && !validateOIB(formData.taxId)) {
        setError('OIB nije validan. Molimo provjerite uneseni broj.');
        setOibError('OIB nije validan. Provjerite kontrolnu znamenku.');
        setLoading(false);
        return;
      }
      
      // Provjeri da li je naziv firme obavezan (osim za freelancere)
      const selectedStatus = legalStatuses.find(s => s.id === formData.legalStatusId);
      if (selectedStatus?.code !== 'FREELANCER' && !formData.companyName) {
        setError('Naziv firme/obrta je obavezan. Samo samostalni djelatnici mogu raditi pod svojim imenom.');
        setLoading(false);
        return;
      }
      
      const response = await api.post('/auth/upgrade-to-provider', formData);
      const { token, user: updatedUser } = response.data;
      
      // Save new token
      localStorage.setItem('token', token);
      
      setSuccess(true);
      
      // Redirect nakon 3 sekunde
      setTimeout(() => {
        window.location.hash = '#provider-profile-setup';
      }, 3000);
      
    } catch (err) {
      console.error('Upgrade error:', err);
      const errorMsg = err.response?.data?.error || 'Greška pri nadogradnji';
      const errorMessage = err.response?.data?.message || '';
      const requiredFields = err.response?.data?.requiredFields || [];
      
      let fullError = errorMsg;
      if (errorMessage) fullError += '\n\n' + errorMessage;
      if (requiredFields.length > 0) {
        fullError += '\n\nObavezna polja: ' + requiredFields.join(', ');
      }
      
      setError(fullError);
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Čestitamo!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Uspješno ste postali pružatelj usluga!
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-green-900 mb-3">
              🎉 <strong>Vaš nalog je nadograđen</strong>
            </p>
            <p className="text-sm text-gray-700 mb-2">
              Sada možete:
            </p>
            <ul className="text-sm text-gray-700 text-left space-y-1">
              <li>✅ Nuditi svoje usluge</li>
              <li>✅ Slati ponude na oglase</li>
              <li>✅ Tražiti usluge od drugih pružatelja</li>
              <li>✅ Kreirati oglase za posao</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Preusmjeravanje na podešavanje profila...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Postani pružatelj usluga</h2>
        <p className="text-gray-600 mt-2">Nadogradite svoj nalog i počnite nuditi usluge</p>
      </div>

      {/* Info box */}
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Važno:</strong> Prema zakonu, pružatelji usluga moraju imati pravni oblik (obrt, d.o.o., itd.). 
              Potrebno je unijeti podatke o pravnom statusu, OIB i naziv firme/obrta.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              💡 Vaše ime i prezime iz profila odnosi se na vas kao odgovornu osobu (vlasnik/direktor).
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            readOnly={!!user}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent read-only:bg-gray-100"
            placeholder="vas@email.com"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lozinka (za potvrdu) <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="••••••••"
          />
          <p className="text-xs text-gray-500 mt-1">Unesite lozinku da potvrdite nadogradnju</p>
        </div>

        {/* Pravni status - REQUIRED */}
        <div className="space-y-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Pravni podaci (obavezno)
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pravni status <span className="text-red-500">*</span>
            </label>
            <select
              name="legalStatusId"
              value={formData.legalStatusId}
              onChange={handleChange}
              required
              disabled={loadingStatuses}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Odaberite pravni oblik</option>
              {legalStatuses
                .filter(status => status.code !== 'INDIVIDUAL')
                .map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name} - {status.description}
                  </option>
                ))}
            </select>
            {loadingStatuses && (
              <p className="text-xs text-gray-500 mt-1">Učitavanje pravnih statusa...</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OIB <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                required
                maxLength={11}
                pattern="[0-9]{11}"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  oibError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12345678901"
              />
              {oibError ? (
                <p className="text-xs text-red-600 mt-1">✗ {oibError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">11 brojeva</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naziv firme/obrta {legalStatuses.find(s => s.id === formData.legalStatusId)?.code !== 'FREELANCER' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required={legalStatuses.find(s => s.id === formData.legalStatusId)?.code !== 'FREELANCER'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={legalStatuses.find(s => s.id === formData.legalStatusId)?.code === 'FREELANCER' ? 'Opcionalno - možete raditi pod svojim imenom' : 'Obrt Horvat'}
              />
              {legalStatuses.find(s => s.id === formData.legalStatusId)?.code === 'FREELANCER' && (
                <p className="text-xs text-blue-600 mt-1">💡 Samostalni djelatnici mogu raditi pod svojim imenom i prezimenom</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || loadingStatuses}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Nadogradnja u tijeku...' : 'Postani pružatelj usluga'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Već ste pružatelj?{' '}
          <button 
            onClick={() => window.location.hash = '#user'}
            className="text-green-600 hover:underline font-medium"
          >
            Povratak na početnu
          </button>
        </p>
      </div>
    </div>
  );
}


