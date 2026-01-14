import React, { useState, useEffect } from 'react';
import api from '../api';
import { useLegalStatuses } from '../hooks/useLegalStatuses';
import { validateOIB, validateEmail } from '../utils/validators';

export default function UserRegister({ onSuccess }) {
  const { legalStatuses, loading: loadingStatuses } = useLegalStatuses();
  
  // State za odabir tipa korisnika
  const [userType, setUserType] = useState(null); // null | 'USER' | 'PROVIDER'
  
  // State za odabir da li je USER fizička ili pravna osoba
  const [isCompany, setIsCompany] = useState(false); // true = pravna osoba, false = fizička osoba
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    city: '',
    // User specifično - kao ProviderRegister
    bio: '',
    specialties: '',
    experience: '',
    website: '',
    legalStatusId: '',
    taxId: '',
    companyName: '',
    // Kategorije
    categoryIds: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [oibError, setOibError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [categories, setCategories] = useState([]);
  const [companyNameValidating, setCompanyNameValidating] = useState(false);
  const [companyNameValidation, setCompanyNameValidation] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Auto-verification state
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [kycDocument, setKycDocument] = useState(null);
  const [publicConsent, setPublicConsent] = useState(false);

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validacija emaila u realnom vremenu
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setEmailError('Email adresa nije valjana');
      } else {
        setEmailError('');
      }
    }

    // Validacija OIB-a u realnom vremenu - samo ako je PROVIDER ili USER koji je pravna osoba
    if ((userType === 'PROVIDER' || (userType === 'USER' && isCompany)) && name === 'taxId') {
      if (value && !validateOIB(value)) {
        setOibError('OIB nije validan. Provjerite kontrolnu znamenku.');
      } else {
        setOibError('');
      }
    }
    
    // Validacija naziva tvrtke u realnom vremenu - samo ako je PROVIDER ili USER koji je pravna osoba
    if (userType === 'PROVIDER' || (userType === 'USER' && isCompany)) {
      if (name === 'companyName' && value && formData.taxId && formData.taxId.length === 11) {
        verifyCompanyName(value, formData.taxId, formData.legalStatusId);
      } else if (name === 'companyName' && !value) {
        setCompanyNameValidation(null);
      }
      
      // Ako se mijenja OIB ili legalStatus, provjeri ponovno companyName
      if ((name === 'taxId' || name === 'legalStatusId') && formData.companyName && formData.companyName.length >= 3) {
        if (name === 'taxId' && value && value.length === 11) {
          verifyCompanyName(formData.companyName, value, formData.legalStatusId);
        } else if (name === 'legalStatusId' && formData.taxId && formData.taxId.length === 11) {
          verifyCompanyName(formData.companyName, formData.taxId, value);
        }
      }
    }
  };
  
  // Učitaj kategorije
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Greška pri učitavanju kategorija');
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

      // Auto-verify kada se unese OIB i odabere legal status - samo ako je PROVIDER ili USER koji je pravna osoba
  useEffect(() => {
    const autoVerify = async () => {
      // Auto-verify samo za PROVIDER-e i USER-e koji su pravne osobe
      if (userType !== 'PROVIDER' && !(userType === 'USER' && isCompany)) {
        return;
      }
      
      if (!formData.taxId || formData.taxId.length !== 11 || !formData.legalStatusId) {
        return;
      }
      
      // Validiraj OIB format
      if (!/^\d{11}$/.test(formData.taxId)) {
        return;
      }
      
      setAutoVerifying(true);
      setError('');
      
      try {
        const response = await api.post('/kyc/auto-verify', {
          taxId: formData.taxId,
          legalStatusId: formData.legalStatusId,
          companyName: formData.companyName
        });
        
        setVerificationResult(response.data);
        
      } catch (err) {
        console.error('[Auto-Verify] ❌ Error:', err.response?.data || err.message);
        // Ignore errors - just continue registration
        setVerificationResult(null);
      } finally {
        setAutoVerifying(false);
      }
    };
    
    // Debounce - čekaj 500ms nakon zadnjeg unosa
    const timer = setTimeout(autoVerify, 500);
    return () => clearTimeout(timer);
  }, [formData.taxId, formData.legalStatusId, formData.companyName, userType, isCompany]);
  
  // Provjeri naziv tvrtke u registrima
  const verifyCompanyName = async (companyName, taxId, legalStatusId) => {
    if (!companyName || !taxId || taxId.length !== 11) {
      setCompanyNameValidation(null);
      return;
    }
    
    setCompanyNameValidating(true);
    setCompanyNameValidation(null);
    
    try {
      const response = await api.post('/kyc/verify-company-name', {
        taxId,
        companyName,
        legalStatusId
      });
      
      if (response.data.success && response.data.shouldUpdate && response.data.officialName) {
        // Automatski ažuriraj naziv ako je pronađen službeni naziv
        setFormData(prev => ({
          ...prev,
          companyName: response.data.officialName
        }));
        
        setCompanyNameValidation({
          type: 'success',
          message: response.data.message || 'Naziv tvrtke je ažuriran prema službenom registru',
          officialName: response.data.officialName,
          similarity: response.data.similarity
        });
      } else if (response.data.officialName && !response.data.shouldUpdate) {
        // Pronađen ali nije dovoljno sličan - upozori korisnika
        setCompanyNameValidation({
          type: 'warning',
          message: response.data.warning || 'Provjerite točnost naziva',
          officialName: response.data.officialName,
          similarity: response.data.similarity
        });
      } else {
        // Nije pronađen u registrima
        setCompanyNameValidation({
          type: 'info',
          message: response.data.message || 'Naziv nije provjeren u službenim registrima'
        });
      }
    } catch (err) {
      console.error('Company name verification error:', err);
      // Nemoj blokirati korisnika ako verifikacija ne uspije
      setCompanyNameValidation(null);
    } finally {
      setCompanyNameValidating(false);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validacija emaila prije slanja
      if (!validateEmail(formData.email)) {
        setError('Email adresa nije valjana');
        setEmailError('Email adresa nije valjana');
        setLoading(false);
        return;
      }

      // VALIDACIJA: Za PROVIDER-e su kategorije OBAVEZNE
      if (userType === 'PROVIDER' && formData.categoryIds.length === 0) {
        setError('Morate odabrati minimalno 1 kategoriju usluga kojima se bavite.');
        setLoading(false);
        return;
      }

      // VALIDACIJA: Pravni status je OBAVEZAN za PROVIDER-e i USER-e koji su pravne osobe
      if (userType === 'PROVIDER' || (userType === 'USER' && isCompany)) {
        if (!formData.legalStatusId) {
          setError('Pravni status je obavezan. Odaberite pravni oblik vašeg poslovanja.');
          setLoading(false);
          return;
        }
        
        if (!formData.taxId) {
          setError('OIB je obavezan.');
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
        
        // Obavezna izjava (mekana provjera) za PROVIDER-e
        if (!publicConsent) {
          setError('Morate potvrditi izjavu o odgovornosti za točnost OIB-a i status poslovnog subjekta.');
          setLoading(false);
          return;
        }
        
        // Provjeri da li je naziv tvrtke obavezan (osim za freelancere)
        const selectedStatus = legalStatuses.find(s => s.id === formData.legalStatusId);
        if (selectedStatus?.code !== 'FREELANCER' && !formData.companyName) {
          setError('Naziv tvrtke/obrta je obavezan. Samo samostalni djelatnici mogu raditi pod svojim imenom.');
          setLoading(false);
          return;
        }
      }
      
      // VALIDACIJA: Za USER-e koji su pravne osobe - obavezna izjava
      if (userType === 'USER' && isCompany && !publicConsent) {
        setError('Morate potvrditi izjavu o odgovornosti za točnost OIB-a i status poslovnog subjekta.');
        setLoading(false);
        return;
      }
      
      // Registriraj user-a s odabranim role-om (USER ili PROVIDER)
      const userData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: userType || 'USER', // Koristi odabrani userType
        phone: formData.phone,
        city: formData.city
      };
      
      // Dodaj legalStatusId, taxId, companyName samo ako je PROVIDER ili USER koji je pravna osoba
      if (userType === 'PROVIDER' || (userType === 'USER' && isCompany)) {
        userData.legalStatusId = formData.legalStatusId || undefined;
        userData.taxId = formData.taxId || undefined;
        userData.companyName = formData.companyName || undefined;
      }

      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // Za PROVIDER-e i USER-e koji su pravne osobe, ažuriraj ProviderProfile
      if (userType === 'PROVIDER' || (userType === 'USER' && isCompany)) {
        const profileData = {};
        if (formData.bio) profileData.bio = formData.bio;
        if (formData.specialties) profileData.specialties = formData.specialties.split(',').map(s => s.trim());
        if (formData.experience) profileData.experience = parseInt(formData.experience);
        if (formData.website) profileData.website = formData.website;
        if (formData.legalStatusId) profileData.legalStatusId = formData.legalStatusId;
        if (formData.taxId) profileData.taxId = formData.taxId;
        if (formData.companyName) profileData.companyName = formData.companyName;
        
        // Dodaj kategorije
        profileData.categoryIds = formData.categoryIds;
        
        // Update profila (koristimo fix-profile da kreira ako ne postoji)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Prvo pokušaj kreirati profil ako ne postoji
        try {
          await api.post('/providers/fix-profile');
        } catch (fixErr) {
          // Ignoriraj grešku ako profil već postoji
        }
        
        // Ažuriraj profil ako postoji
        try {
          await api.put('/providers/me', profileData);
        } catch (updateErr) {
          // Ignoriraj grešku ako profil ne postoji
        }

        // Ažuriraj consent (GDPR/izjava) nakon registracije
        try {
          await api.post('/kyc/update-consent', { publicConsent: true });
        } catch (consentErr) {
          console.error('Consent update error:', consentErr);
        }
      }
      
      // Prikaži success message
      setSuccess(true);
      localStorage.setItem('pendingVerification', formData.email);
      
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.error || 'Greška pri registraciji';
      const errorDetails = err.response?.data?.details;
      
      setError(errorDetails ? `${errorMsg}\n\nDetalji: ${errorDetails}` : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Email verificacija sekcija */}
        <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Registracija uspješna!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Poslali smo vam email na adresu:
          </p>
            <p className="text-xl font-semibold text-green-600 mb-6">
            {formData.email}
          </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-green-900 mb-2">
              📧 <strong>Provjerite svoj email inbox</strong>
            </p>
              <p className="text-sm text-gray-700 mb-4">
              Kliknite na link u email-u da aktivirate svoj račun. 
              Link vrijedi 24 sata.
            </p>
              <div className="bg-white border border-green-300 rounded-lg p-4 mt-4">
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Aktivacijski link:</strong>
                </p>
                <p className="text-sm text-blue-600 break-all font-mono bg-gray-50 p-3 rounded border border-blue-200">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://uslugar.oriph.io'}/#verify?token=...
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Link će doći na vašu email adresu. Kopirajte cijeli link iz emaila ako button ne radi.
                </p>
              </div>
            </div>
          </div>
        </div>


        <div className="bg-white rounded-xl shadow-lg p-8">
          <button
            onClick={() => {
              window.location.hash = '#user';
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Povratak na početnu
          </button>
        </div>
      </div>
    );
  }

  // Početni ekran s odabiron tipa korisnika
  if (!userType) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Registracija</h2>
          <p className="text-lg text-gray-600 mb-8">Odaberite kako želite koristiti platformu</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Korisnik usluge */}
          <button
            onClick={() => setUserType('USER')}
            className="group relative bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-8 hover:border-green-500 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl">
                  👤
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Korisnik usluge</h3>
                <p className="text-gray-700 mb-4">
                  Tražite usluge i kontaktirate pružatelje. Idealan za klijente koji traže majstore, servise i druge usluge.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Traženje i pregledavanje pružatelja usluga</li>
                  <li>✓ Kreiranje upita za usluge</li>
                  <li>✓ Komuniciranje s pružateljima</li>
                  <li>✓ Pregledavanje recenzija i ocjena</li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <span className="inline-flex items-center text-green-600 font-semibold">
                Odaberi
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </button>

          {/* Pružatelj usluge */}
          <button
            onClick={() => setUserType('PROVIDER')}
            className="group relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-8 hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-3xl">
                  🏢
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pružatelj usluge</h3>
                <p className="text-gray-700 mb-4">
                  Nudite svoje usluge i povezujete se s klijentima. Idealan za majstore, servise, obrte i tvrtke.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Profil pružatelja usluga</li>
                  <li>✓ Pristup ekskluzivnim leadovima</li>
                  <li>✓ Upravljanje kategorijama i uslugama</li>
                  <li>✓ Reputacijski sustav i recenzije</li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <span className="inline-flex items-center text-blue-600 font-semibold">
                Odaberi
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.hash = '#user'}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            ← Povratak na početnu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Registracija {userType === 'PROVIDER' ? 'pružatelja usluge' : 'korisnika usluge'}
            </h2>
            <p className="text-gray-600 mt-2">
              {userType === 'PROVIDER' 
                ? 'Ponudite svoje usluge i započnite zarađivati'
                : 'Kreirajte račun i počnite koristiti platformu'}
            </p>
          </div>
          <button
            onClick={() => setUserType(null)}
            className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
            title="Promijeni tip korisnika"
          >
            ← Promijeni
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Osnovni podaci */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Osnovni podaci</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ime i prezime {userType === 'USER' && !isCompany ? '' : 'odgovorne osobe'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ana Horvat"
            />
            <p className="text-xs text-gray-500 mt-1">
              {userType === 'USER' && !isCompany 
                ? 'Ime i prezime korisnika usluge'
                : 'Ime i prezime vlasnika/direktora (ne naziv tvrtke)'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="vas@email.com"
            />
            {emailError && (
              <p className="text-xs text-red-600 mt-1">✗ {emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lozinka <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+385 91 234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Zagreb"
              />
            </div>
          </div>
        </div>

        {/* Profesionalni podaci - samo za PROVIDER-e i USER-e koji su pravne osobe */}
        {(userType === 'PROVIDER' || (userType === 'USER' && isCompany)) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Profesionalni podaci</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              O meni / Biografija
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Opišite svoje iskustvo i usluge koje nudite..."
            />
            <p className="text-xs text-gray-500 mt-1">Preporučeno: 100-300 znakova</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specijalizacije
            </label>
            <input
              type="text"
              name="specialties"
              value={formData.specialties}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Popravak cijevi, Instalacija bojlera, Održavanje"
            />
            <p className="text-xs text-gray-500 mt-1">Odvojeno zarezom</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Godine iskustva
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min={0}
                max={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://vasa-web.hr"
              />
            </div>
          </div>
        </div>
        )}

        {/* Odabir fizička/pravna osoba - samo za USER-e */}
        {userType === 'USER' && (
        <div className="space-y-4 bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Tip korisnika</h3>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="userPersonType"
                checked={!isCompany}
                onChange={() => setIsCompany(false)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">Fizička osoba</span>
                <p className="text-sm text-gray-600">Registrirate se kao pojedinac bez poslovnog subjekta</p>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="userPersonType"
                checked={isCompany}
                onChange={() => setIsCompany(true)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">Pravna osoba (tvrtka/obrt)</span>
                <p className="text-sm text-gray-600">Registrirate se s poslovnim subjektom - trebat će OIB i pravni status</p>
              </div>
            </label>
          </div>
        </div>
        )}

        {/* Kategorije usluga - samo za PROVIDER-e */}
        {userType === 'PROVIDER' && (
        <div className="space-y-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
            Kategorije usluga (obavezno)
          </h3>
          <p className="text-sm text-gray-700">
            <strong>Odaberite kategorije</strong> usluga kojima se bavite. Klijenti će vas moći pronaći prema ovim kategorijama.
          </p>
          
          {loadingCategories ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 mt-2">Učitavanje kategorija...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories
                  .filter(category => !category.parentId) // Samo glavne kategorije
                  .map(category => {
                    const subcategories = categories.filter(cat => cat.parentId === category.id);
                    return (
                      <div key={category.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.categoryIds.includes(category.id)}
                            onChange={() => handleCategoryChange(category.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{category.icon || '🛠️'}</span>
                              <span className="font-medium text-gray-900">{category.name}</span>
                            </div>
                            {category.description && (
                              <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                            )}
                            {subcategories.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Podkategorije:</p>
                                <div className="space-y-1">
                                  {subcategories.slice(0, 3).map(subcategory => (
                                    <label key={subcategory.id} className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={formData.categoryIds.includes(subcategory.id)}
                                        onChange={() => handleCategoryChange(subcategory.id)}
                                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <span className="text-xs text-gray-700">{subcategory.name}</span>
                                    </label>
                                  ))}
                                  {subcategories.length > 3 && (
                                    <p className="text-xs text-gray-500">+{subcategories.length - 3} više</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
          </label>
                      </div>
                    );
                  })}
              </div>
              
              {formData.categoryIds.length === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    ⚠️ <strong>Morate odabrati minimalno 1 kategoriju</strong> usluga kojima se bavite.
                  </p>
                </div>
              )}
              
              {formData.categoryIds.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    ✅ Odabrano <strong>{formData.categoryIds.length}</strong> kategorija
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Pravni status - za PROVIDER-e i USER-e koji su pravne osobe */}
        {(userType === 'PROVIDER' || (userType === 'USER' && isCompany)) && (
          <div className="space-y-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            Pravni status (obavezno)
            </h3>
            <p className="text-sm text-gray-700">
            <strong>Prema zakonu</strong>, svi pružatelji usluga moraju biti registrirani kao obrt, tvrtka ili samostalni djelatnik.
            </p>
            
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
                  disabled={!formData.legalStatusId}
                  maxLength={11}
                  pattern="[0-9]{11}"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    oibError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={formData.legalStatusId ? "12345678901" : "Prvo odaberite pravni status"}
                />
                {oibError ? (
                  <p className="text-xs text-red-600 mt-1">✗ {oibError}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">11 brojeva</p>
                )}
              {/* Meka izjava o odgovornosti */}
              {formData.legalStatusId && (
                <div className="mt-2 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-2">
                  🧾 Unosom OIB-a potvrđujem da je moj poslovni subjekt aktivan i nije u blokadi. Platforma može provjeriti točnost kroz javne registre.
                </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Naziv obrta/tvrtke {legalStatuses.find(s => s.id === formData.legalStatusId)?.code !== 'FREELANCER' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required={formData.legalStatusId && legalStatuses.find(s => s.id === formData.legalStatusId)?.code !== 'FREELANCER'}
                  disabled={!formData.legalStatusId}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  companyNameValidation?.type === 'success' ? 'border-green-500 bg-green-50' :
                  companyNameValidation?.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-gray-300'
                }`}
                placeholder={!formData.legalStatusId ? 'Prvo odaberite pravni status' : (legalStatuses.find(s => s.id === formData.legalStatusId)?.code === 'FREELANCER' ? 'Opcionalno - možete raditi pod svojim imenom' : 'Vodoinstalater Horvat obrt')}
              />
              {companyNameValidating && (
                <p className="text-xs text-blue-600 mt-1">⏳ Provjeravam naziv u službenim registrima...</p>
              )}
              {companyNameValidation && !companyNameValidating && (
                <div className={`mt-1 p-2 rounded text-xs ${
                  companyNameValidation.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                  companyNameValidation.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {companyNameValidation.type === 'success' && (
                    <p>✓ {companyNameValidation.message}</p>
                  )}
                  {companyNameValidation.type === 'warning' && (
                    <div>
                      <p className="font-medium">⚠️ {companyNameValidation.message}</p>
                      {companyNameValidation.officialName && (
                        <p className="mt-1">U registru: "{companyNameValidation.officialName}"</p>
                      )}
                    </div>
                  )}
                  {companyNameValidation.type === 'info' && (
                    <p>ℹ️ {companyNameValidation.message}</p>
                  )}
                </div>
              )}
              {formData.legalStatusId && legalStatuses.find(s => s.id === formData.legalStatusId)?.code === 'FREELANCER' && !companyNameValidation && (
                <p className="text-xs text-gray-500 mt-1">Samostalni djelatnici mogu raditi pod svojim imenom i prezimenom</p>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Izjava (meka provjera) - za PROVIDER-e i USER-e koji su pravne osobe */}
        {(userType === 'PROVIDER' || (userType === 'USER' && isCompany)) && (
        <div className="space-y-3 bg-purple-50 border border-purple-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🧾</span> Izjava o odgovornosti
          </h3>
          <p className="text-sm text-gray-700">
            Unosom OIB-a potvrđujem da je moj poslovni subjekt aktivan i nije u blokadi. Platforma može provjeriti točnost kroz javne registre.
          </p>
          <label className="flex items-start space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={publicConsent}
              onChange={e => setPublicConsent(e.target.checked)}
              className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-800">Potvrđujem ovu izjavu (obavezno)            </span>
          </label>
        </div>
        )}

        {/* Auto-Verification Status - za PROVIDER-e i USER-e koji su pravne osobe */}
        {(userType === 'PROVIDER' || (userType === 'USER' && isCompany)) && autoVerifying && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-sm text-blue-900">
                🔍 Brzo provjeravamo vaš OIB u javnim registrima. Obično traje nekoliko sekundi.
              </p>
            </div>
          </div>
        )}

        {/* Verification Success - za PROVIDER-e i USER-e koji su pravne osobe */}
        {(userType === 'PROVIDER' || (userType === 'USER' && isCompany)) && verificationResult?.verified && !autoVerifying && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-green-600 text-xl">✓</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {verificationResult.badges.map((badge, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                      ✓ {badge.type} ({badge.source})
                    </span>
                  ))}
                </div>
                <p className="text-xs text-green-700">
                  {verificationResult.badges[0]?.description || 'Potvrđeno u javnim registrima. Nije potreban dokument.'}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {verificationResult.badgeCount > 0 && `Dodijeljeno ${verificationResult.badgeCount} značke${verificationResult.badgeCount === 1 ? '' : 'a'}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document Needed - za obrt/paušal uvijek traži upload zbog WAF - za PROVIDER-e i USER-e koji su pravne osobe */}
        {(userType === 'PROVIDER' || (userType === 'USER' && isCompany)) && (() => {
          const selectedStatus = legalStatuses.find(s => s.id === formData.legalStatusId);
          const isObrt = selectedStatus?.code === 'SOLE_TRADER' || selectedStatus?.code === 'PAUSAL';
          const needsDoc = verificationResult?.needsDocument || isObrt;
          if (!needsDoc || autoVerifying) return null;
          return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-600 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  Nismo mogli automatski potvrditi podatke iz registra
                </p>
                <p className="text-xs text-yellow-700 mb-4">
                  Automatska provjera nije dostupna zbog WAF zaštite Obrtnog registra. Molimo učitajte službeni izvadak (PDF/screenshot) – prihvaćamo i fotografiju ekrana.
                </p>
                
                {/* Upload Dokumenta */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Učitaj izvadak iz registra (PDF/JPG/PNG)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setKycDocument(e.target.files[0])}
                    className="w-full text-sm text-gray-600 border border-gray-300 rounded-lg p-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Opcionalno – možete dodati i nakon registracije
                  </p>
                </div>
                
                <div className="mt-3">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={publicConsent}
                      onChange={(e) => setPublicConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 text-green-600 rounded border-gray-300"
                    />
                    <span className="ml-2 text-xs text-gray-700">
                      Dopuštam prikaz osnovnih podataka (naziv/grad/status) na profilu.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {/* KYC-lite Verifikacija za Freelancere - Volonterski - za PROVIDER-e i USER-e koji su pravne osobe */}
        {(userType === 'PROVIDER' || (userType === 'USER' && isCompany)) && (() => {
          const selectedStatus = legalStatuses.find(s => s.id === formData.legalStatusId);
          const isFreelancer = selectedStatus?.code === 'FREELANCER';
          
          if (!isFreelancer || verificationResult?.verified) return null;
          
          return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                📄 Freelancer: Potrebno Rješenje Porezne uprave
              </h4>
              <p className="text-sm text-gray-700 mb-4">
                Ako nemate obrt ni pravnu osobu, učitajte Rješenje Porezne uprave (RPO).
                <br />
                <strong>Ovo nije javna objava;</strong> koristimo samo za provjeru.
              </p>
              <div className="text-xs text-blue-600 mb-2">
                💡 Možete to dodati i nakon registracije u sekciji Pružatelj usluga.
              </div>
            </div>
          );
        })()}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registracija u tijeku...' : userType === 'PROVIDER' ? 'Registriraj se kao pružatelj' : 'Registriraj se kao korisnik'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Već imate račun?{' '}
          <a href="#login" className="text-blue-600 hover:underline font-medium">
            Prijavite se
          </a>
        </p>
      </div>
    </div>
  );
}

