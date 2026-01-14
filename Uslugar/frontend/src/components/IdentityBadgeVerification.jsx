import React, { useState } from 'react';
import api from '../api';
import PhoneVerification from './PhoneVerification';

export default function IdentityBadgeVerification({ profile, onUpdated }) {
  const [verifying, setVerifying] = useState(false);
  const [verificationType, setVerificationType] = useState('email'); // email, phone, dns
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false); // Za SMS workflow

  const handleVerify = async (e) => {
    // Spriječi default form submission ako je pozvano iz forme
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Double check - ako je disabled, ne nastavljaj
    if (!value || verifying) {
      return;
    }
    
    // Za telefon, ne pozivamo direktno - koristimo PhoneVerification komponentu
    if (verificationType === 'phone') {
      setError('Molimo unesite telefonski broj i verificirajte ga SMS kodom');
      return;
    }

    if (!value) {
      setError(`Molimo unesite ${verificationType === 'email' ? 'email adresu' : 'domenu'}`);
      return;
    }

    try {
      setVerifying(true);
      setError('');
      setSuccess('');
      
      const response = await api.post('/kyc/verify-identity', {
        type: verificationType,
        value: value
      });

      const successMessage = verificationType === 'email' 
        ? '✓ Email je verificiran!' 
        : verificationType === 'dns'
        ? '✓ DNS je verificiran!'
        : '✓ Verifikacija uspješna!';
      
      setSuccess(successMessage);
      
      // Refresh profile
      if (onUpdated) {
        onUpdated();
      }
      
      // Reset
      setTimeout(() => {
        setValue('');
        setSuccess('');
      }, 5000);
      
    } catch (err) {
      console.error('❌ Verification error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      const errorMsg = err.response?.data?.error || err.message || 'Neuspjela verifikacija';
      const hint = err.response?.data?.hint || '';
      const userId = err.response?.data?.userId || '';
      
      // Za DNS, prikaži hint s user ID-om
      if (verificationType === 'dns' && hint) {
        setError(`${errorMsg}\n\n${hint}`);
      } else {
        setError(errorMsg + (hint ? `\n\n${hint}` : ''));
      }
      
      // Ako nema error poruke, pokušaj generirati bolju poruku
      if (!err.response?.data?.error && !err.message) {
        setError(`Greška pri verifikaciji (${err.response?.status || 'unknown'}). Molimo pokušajte ponovno.`);
      }
    } finally {
      setVerifying(false);
    }
  };

  // Callback kada se SMS kod uspješno verificira
  const handlePhoneVerified = async () => {
    try {
      // Ažuriraj backend da je telefon verificiran (provjeri da li je već SMS verificiran)
      const phoneStatus = await api.get('/sms-verification/status');
      
      if (phoneStatus.data.phoneVerified) {
        // Telefon je već SMS verificiran, sada postavi identityPhoneVerified
        // Koristi value iz inputa ili phone prop
        const phoneToVerify = value || phoneStatus.data.phone;
        
        const verifyResponse = await api.post('/kyc/verify-identity', {
          type: 'phone',
          value: phoneToVerify
        });
        
        setPhoneVerified(true);
        setSuccess('✓ Telefon je verificiran i Identity značka dodijeljena!');
        
        // Refresh profile da se prikaže novi status
        if (onUpdated) {
          await onUpdated();
        }
        
        // Reset nakon 3 sekunde
        setTimeout(() => {
          setValue('');
          setSuccess('');
          setPhoneVerified(false);
        }, 3000);
      } else {
        setError('Telefon mora biti prvo SMS verificiran prije dodjeljivanja Identity značke');
      }
      
    } catch (err) {
      console.error('❌ Phone verification update error:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Greška pri ažuriranju statusa verifikacije');
    }
  };


  return (
    <div className="space-y-4">
      {/* Verification Type Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Odaberite tip verifikacije:
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVerificationType('email')}
            className={`flex-1 px-4 py-2 rounded-lg border ${
              verificationType === 'email'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            📧 Email
          </button>
          <button
            type="button"
            onClick={() => setVerificationType('phone')}
            className={`flex-1 px-4 py-2 rounded-lg border ${
              verificationType === 'phone'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            📱 Telefon
          </button>
          <button
            type="button"
            onClick={() => setVerificationType('dns')}
            className={`flex-1 px-4 py-2 rounded-lg border ${
              verificationType === 'dns'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            🌐 DNS
          </button>
        </div>
      </div>

      {/* Input Field & Verification */}
      {/* Prikaži formu ako postoje neki načini koji nisu verificirani */}
      {(!profile.identityEmailVerified || !profile.identityPhoneVerified || !profile.identityDnsVerified) && (
        <>
          {/* Za Email - prikaži samo ako nije verificiran */}
          {verificationType === 'email' && !profile.identityEmailVerified && (
            <div className="space-y-2">
              <input
                type="email"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="info@vasafirma.hr"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleVerify(e);
                }}
                disabled={!value || verifying}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed active:bg-purple-800 cursor-pointer"
                title={!value ? 'Molimo unesite email adresu' : verifying ? 'Verificiram...' : 'Kliknite za verifikaciju'}
              >
              {verifying ? 'Verificiram...' : `✓ Verificiraj${!value ? ' (unesite email)' : ''}`}
            </button>
            </div>
          )}

          {/* Za DNS - prikaži samo ako nije verificiran */}
          {verificationType === 'dns' && !profile.identityDnsVerified && (
            <div className="space-y-2">
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="vasafirma.hr"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleVerify(e);
                }}
                disabled={!value || verifying}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed active:bg-purple-800 cursor-pointer"
                title={!value ? 'Molimo unesite email adresu' : verifying ? 'Verificiram...' : 'Kliknite za verifikaciju'}
              >
              {verifying ? 'Verificiram...' : `✓ Verificiraj${!value ? ' (unesite domenu)' : ''}`}
            </button>
            </div>
          )}

          {/* Za Telefon - prikaži samo ako nije verificiran */}
          {verificationType === 'phone' && !profile.identityPhoneVerified && (
            <div className="space-y-4">
              <div>
                <input
                  type="tel"
                  value={value}
                  onChange={(e) => {
                    // Ukloni sve što nije broj ili +
                    let cleaned = e.target.value.replace(/[^\d+]/g, '');
                    // Osiguraj da počinje s +385
                    if (cleaned && !cleaned.startsWith('+385')) {
                      if (cleaned.startsWith('385')) {
                        cleaned = '+' + cleaned;
                      } else if (cleaned.startsWith('0')) {
                        cleaned = '+385' + cleaned.substring(1);
                      } else {
                        cleaned = '+385' + cleaned;
                      }
                    }
                    // Ograniči na +385 + 8-9 znamenki
                    if (cleaned.startsWith('+385')) {
                      const digits = cleaned.substring(4);
                      if (digits.length <= 9) {
                        setValue(cleaned);
                      }
                    } else if (cleaned === '+') {
                      setValue(cleaned);
                    }
                  }}
                  placeholder="+385912345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: +385XXXXXXXXX (npr. +385912345678)
                </p>
              </div>
              
              {value && value.startsWith('+385') && value.length >= 12 && (
                <div>
                  <PhoneVerification
                    phone={value}
                    onVerified={() => {
                      handlePhoneVerified();
                    }}
                    currentPhone={value}
                  />
                </div>
              )}
              
              {(!value || !value.startsWith('+385') || value.length < 12) && (
                <p className="text-sm text-gray-500 text-center">
                  Unesite telefonski broj u formatu +385XXXXXXXXX da biste započeli SMS verifikaciju
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Poruka ako su svi načini verificirani */}
      {profile.identityEmailVerified && profile.identityPhoneVerified && profile.identityDnsVerified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-800">
            ✓ Svi načini verifikacije su uspješno verificirani!
          </p>
        </div>
      )}

      {/* Poruka ako je određeni način verificiran */}
      {verificationType === 'email' && profile.identityEmailVerified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-800">
            ✓ Email je već verificiran
          </p>
        </div>
      )}
      
      {verificationType === 'phone' && profile.identityPhoneVerified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-800">
            ✓ Telefon je već verificiran
          </p>
        </div>
      )}
      
      {verificationType === 'dns' && profile.identityDnsVerified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-800">
            ✓ DNS je već verificiran
          </p>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          ⚠️ {error}
        </div>
      )}
      
      {success && (
        <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2">
          ✓ {success}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-xs text-blue-800">
          <strong>Kako to funkcionira?</strong>
        </p>
        <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc list-inside">
          <li><strong>Email:</strong> Verificirajte email na domeni vaše tvrtke (npr. info@vasafirma.hr)</li>
          <li><strong>Telefon:</strong> Verificirajte službeni telefonski broj s web stranice tvrtke</li>
          <li><strong>DNS:</strong> Dodajte TXT zapis u DNS postavke domene: <code className="bg-blue-100 px-1 rounded">uslugar-verification=VAŠ_USER_ID</code></li>
        </ul>
        {verificationType === 'dns' && value && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs font-semibold text-yellow-800 mb-2">📋 Koraci za DNS verifikaciju:</p>
            <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside mb-2">
              <li>Prijavite se u DNS postavke vaše domene (cPanel, Cloudflare, itd.)</li>
              <li>Dodajte <strong>TXT</strong> zapis za domenu <code className="bg-yellow-100 px-1 rounded">{value.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]}</code></li>
              <li>Naziv: <code className="bg-yellow-100 px-1 rounded">@</code> (ili prazno, ovisno o provideru)</li>
              <li>Vrijednost: <code className="bg-yellow-100 px-1 rounded font-mono">uslugar-verification=VAŠ_USER_ID</code></li>
              <li>Sačekajte 5-10 minuta da se DNS propagira</li>
              <li>Kliknite "✓ Verificiraj" ponovno</li>
            </ol>
            <p className="text-xs text-yellow-800 mt-2">
              <strong>Napomena:</strong> User ID će biti prikazan u poruci greške ako verifikacija ne uspije.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

