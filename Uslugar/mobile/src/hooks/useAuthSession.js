import { useEffect, useState } from 'react';
import { getCurrentUser, loginWithPassword, validateLoginInput } from '@uslugar/shared';
import { clearSession, readSession, writeSession, writeUser } from '../lib/session';

export function useAuthSession() {
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.uslugar.eu');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const map = await readSession();
        const savedToken = map.token || '';
        const savedApiBaseUrl = map.apiBaseUrl || 'https://api.uslugar.eu';
        if (savedApiBaseUrl) setApiBaseUrl(savedApiBaseUrl);
        if (savedToken) {
          const me = await getCurrentUser({
            apiBaseUrl: savedApiBaseUrl,
            token: savedToken
          });
          setToken(savedToken);
          setUser(me);
          setMessage('Automatska prijava uspješna.');
        }
      } catch (error) {
        await clearSession();
        setMessage('Sesija je istekla. Prijavite se ponovno.');
      } finally {
        setBootstrapping(false);
      }
    };
    bootstrap();
  }, []);

  const handleApiError = async (error, fallbackMessage) => {
    const text = String(error?.message || '');
    if (text.toLowerCase().includes('unauthorized') || text.toLowerCase().includes('expired')) {
      await clearSession();
      setToken('');
      setUser(null);
      setMessage('Sesija je istekla. Prijavite se ponovno.');
      return true;
    }
    setMessage(text || fallbackMessage);
    return false;
  };

  const handleLogin = async () => {
    setMessage('');
    const validation = validateLoginInput({ email, password });
    if (validation) {
      setMessage(validation);
      return false;
    }
    setLoading(true);
    try {
      const result = await loginWithPassword({ apiBaseUrl, email, password });
      if (!result?.token) throw new Error('Login succeeded but token missing');
      const me = await getCurrentUser({ apiBaseUrl, token: result.token });
      await writeSession({
        token: result.token,
        user: me || result.user || {},
        apiBaseUrl
      });
      setToken(result.token);
      setUser(me || result.user || null);
      setMessage(`Prijava uspješna: ${result.user?.fullName || result.user?.email || ''}`);
      return true;
    } catch (error) {
      setMessage(error.message || 'Greška pri prijavi');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearSession();
    setToken('');
    setUser(null);
    setPassword('');
    setMessage('Odjavljeni ste.');
  };

  const handleRefreshProfile = async () => {
    if (!token) return;
    setLoading(true);
    setMessage('');
    try {
      const me = await getCurrentUser({ apiBaseUrl, token });
      setUser(me);
      await writeUser(me);
      setMessage('Profil osvjezen.');
    } catch (error) {
      setMessage(error.message || 'Ne mogu osvjeziti profil.');
    } finally {
      setLoading(false);
    }
  };

  return {
    apiBaseUrl,
    setApiBaseUrl,
    email,
    setEmail,
    password,
    setPassword,
    message,
    setMessage,
    token,
    setToken,
    user,
    setUser,
    loading,
    setLoading,
    bootstrapping,
    handleApiError,
    handleLogin,
    handleLogout,
    handleRefreshProfile
  };
}
