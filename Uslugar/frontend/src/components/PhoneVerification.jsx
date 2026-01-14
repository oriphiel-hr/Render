import React, { useState, useEffect } from 'react';
import { sendVerificationCode, verifyCode, getVerificationStatus } from '../api/sms';
import api from '../api';

const PhoneVerification = ({ phone, onVerified, currentPhone }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [codeExpiresAt, setCodeExpiresAt] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Timer za expiration koda (10 minuta)
  useEffect(() => {
    if (!codeExpiresAt) return;
    
    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(codeExpiresAt);
      const remaining = Math.max(0, Math.floor((expires - now) / 1000)); // sekunde
      
      if (remaining <= 0) {
        setTimeRemaining(null);
        setCodeExpiresAt(null);
        setError('Verifikacijski kod je istekao. Zatražite novi kod.');
      } else {
        setTimeRemaining(remaining);
      }
    };
    
    updateTimer(); // Odmah provjeri
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [codeExpiresAt]);

  const checkStatus = async () => {
    try {
      const response = await getVerificationStatus();
      setStatus(response.data);
      
      // Postavi expiration time ako postoji aktivan kod
      if (response.data.expiresAt) {
        setCodeExpiresAt(response.data.expiresAt);
      }
      
      if (response.data.phoneVerified) {
        setSuccess('Telefon je verificiran!');
        onVerified?.();
      } else if (response.data.hasActiveCode && !success && !error) {
        // Ako postoji aktivan kod, samo reci da postoji (bez prikazivanja koda)
        setSuccess('Aktivni verifikacijski kod je dostupan. Provjerite telefon ili unesite kod.');
        setError(''); // Očisti error ako postoji
      }
    } catch (err) {
      console.error('Status check error:', err);
    }
  };

  const handleSendCode = async () => {
    const phoneToVerify = phone || currentPhone;
    
    if (!phoneToVerify) {
      setError('Molimo unesite broj telefona');
      return;
    }

    // Validacija formata
    const phoneRegex = /^\+385[0-9]{8,9}$/;
    if (!phoneRegex.test(phoneToVerify)) {
      setError('Neispravan format. Koristite format: +385XXXXXXXXX (npr. +385912345678)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await sendVerificationCode(phoneToVerify);
      
      // Koristi poruku iz backend-a, bez prikazivanja koda direktno
      if (response.data.message) {
        setSuccess(response.data.message);
      } else {
        setSuccess('SMS kod je poslan! Provjerite telefon.');
      }
      
      // Postavi expiration time (10 minuta od sada)
      if (response.data.expiresAt) {
        setCodeExpiresAt(response.data.expiresAt);
      } else {
        // Fallback: postavi na 10 minuta od sada ako backend ne vraća expiresAt
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + 10);
        setCodeExpiresAt(expires.toISOString());
      }
      
      
      setCountdown(60); // 60 sekundi countdown
      setCanResend(false);
      
      // Ažuriraj status odmah da se prikaže forma za unos koda
      await checkStatus();
    } catch (err) {
      console.error('SMS send error:', err);
      
      // Posebno rukovanje za 429 (Too Many Requests)
      if (err.response?.status === 429) {
        const errorMsg = err.response?.data?.error || 'Previše pokušaja. Molimo pričekajte 1 sat prije sljedećeg pokušaja.';
        setError(errorMsg);
        
        // Provjeri da li već postoji aktivan kod
        setTimeout(async () => {
          await checkStatus();
          if (status?.hasActiveCode) {
            setSuccess('Aktivni verifikacijski kod je dostupan. Provjerite telefon ili unesite kod.');
            setError('');
          }
        }, 500);
      } else {
        setError(err.response?.data?.error || 'Greška pri slanju SMS koda');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!code || code.length !== 6) {
      setError('Kod mora imati 6 znamenki');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await verifyCode(code);
      setSuccess(response.data.message || '✓ Telefon uspješno verificiran!');
      setCode('');
      
      // Ažuriraj status - bit će ažuriran u checkStatus
      await checkStatus();
      
      // Provjeri da li je verificiran i sakrij formu
      if (response.data.phoneVerified) {
        // Callback da parent komponenta zna da je verificiran
        if (onVerified) {
          onVerified();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Neispravan kod. Molimo pokušajte ponovno.');
      
      // Prikaži preostale pokušaje
      if (err.response?.data?.attemptsRemaining !== undefined) {
        setError(`${err.response.data.error} (${err.response.data.attemptsRemaining} preostalo)`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Ako je već verificiran
  if (status?.phoneVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-green-600 text-xl">✓</span>
          <div>
            <p className="text-sm font-medium text-green-800">Telefon je verificiran</p>
            <p className="text-xs text-green-600 mt-1">
              Verificiran: {status.phoneVerifiedAt 
                ? new Date(status.phoneVerifiedAt).toLocaleDateString('hr-HR')
                : ''}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">📱 SMS Verifikacija telefona</h3>
        <p className="text-xs text-gray-600">
          Verificirajte svoj broj telefona da biste dobivali SMS obavijesti o novim leadovima
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Status info */}
      {status && (
        <div className="text-xs text-gray-600 space-y-1">
          {status.hasActiveCode && (
            <p>✓ Aktivni kod poslan ({status.attemptsRemaining} preostalo pokušaja)</p>
          )}
          {!status.hasActiveCode && status.attemptsRemaining < 5 && (
            <p>⚠️ {status.attemptsRemaining} preostalo pokušaja</p>
          )}
        </div>
      )}

      {/* Send code button */}
      {!status?.hasActiveCode && (
        <button
          onClick={handleSendCode}
          disabled={loading || !canResend || countdown > 0}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {loading ? 'Slanje...' : countdown > 0 ? `Pošalji ponovno (${countdown}s)` : '📱 Pošalji SMS kod'}
        </button>
      )}

      {/* Verify code form - prikaži samo ako NIJE verificiran i ako je SMS poslan ili ima aktivni kod */}
      {!status?.phoneVerified && (status?.hasActiveCode || success.includes('poslan')) && (
        <form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVerifyCode(e);
        }} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Unesite 6-znamenkasti kod:
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError('');
              }}
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
              autoFocus
            />
            <div className="text-xs text-gray-500 mt-1 text-center space-y-1">
              {status?.attemptsRemaining !== undefined && (
                <p>Preostalo pokušaja: {status.attemptsRemaining}</p>
              )}
              {timeRemaining !== null && timeRemaining > 0 && (
                <p className={timeRemaining < 60 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                  ⏱️ Kod istječe za: {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                </p>
              )}
              {timeRemaining === 0 && (
                <p className="text-red-600 font-semibold">⚠️ Kod je istekao! Zatražite novi kod.</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleVerifyCode(e);
            }}
            disabled={loading || code.length !== 6}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer"
            title={code.length !== 6 ? 'Unesite 6 znamenki' : loading ? 'Verificiranje...' : 'Kliknite za verifikaciju'}
          >
            {loading ? 'Verificiranje...' : `✓ Verificiraj${code.length !== 6 ? ` (${code.length}/6)` : ''}`}
          </button>

          <button
            type="button"
            onClick={handleSendCode}
            disabled={loading || !canResend || countdown > 0}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {countdown > 0 ? `Pošalji novi kod (${countdown}s)` : '📱 Pošalji novi kod'}
          </button>
        </form>
      )}
      
      {/* Fallback: ako je SMS poslan ali status još nije ažuriran, prikaži formu ručno (samo ako NIJE verificiran) */}
      {!status?.phoneVerified && success.includes('poslan') && !status?.hasActiveCode && (
        <div className="space-y-3">
          <p className="text-xs text-gray-600 text-center">
            Provjerite telefon za SMS kod, ili unesite kod koji ste primili:
          </p>
          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleVerifyCode(e);
          }} className="space-y-3">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError('');
              }}
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
              autoFocus
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleVerifyCode(e);
              }}
              disabled={loading || code.length !== 6}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium cursor-pointer"
            >
              {loading ? 'Verificiranje...' : `✓ Verificiraj${code.length !== 6 ? ` (${code.length}/6)` : ''}`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PhoneVerification;

