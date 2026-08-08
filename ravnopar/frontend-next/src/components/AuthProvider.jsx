'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getInboxSummary, getProfile } from '../api/index.js';
import { recordMemberSinceIfNeeded } from '../lib/donate-prompt.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [profile, setProfile] = useState(null);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [notificationUnread, setNotificationUnread] = useState(0);
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [feedReady, setFeedReady] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const nextToken = localStorage.getItem('ravnoparToken') || '';
    const raw = localStorage.getItem('ravnoparProfile');
    setToken(nextToken);
    setProfile(raw ? JSON.parse(raw) : null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    getProfile(token).then((data) => {
      if (data?.success) {
        setOnboardingDone(Boolean(data.profile?.onboardingDone));
        setFeedReady(data.feedReady === true);
      }
    });
    const refreshInbox = () => {
      getInboxSummary(token).then((data) => {
        if (data?.success) {
          setUnreadTotal(data.unreadTotal || 0);
          setNotificationUnread(data.notificationUnread || 0);
        }
      });
    };
    refreshInbox();
    const timer = window.setInterval(refreshInbox, 15000);
    return () => window.clearInterval(timer);
  }, [token]);

  const onLogin = useCallback((nextToken, nextProfile) => {
    setToken(nextToken);
    setProfile(nextProfile);
    setOnboardingDone(Boolean(nextProfile?.onboardingDone));
    localStorage.setItem('ravnoparToken', nextToken);
    localStorage.setItem('ravnoparProfile', JSON.stringify(nextProfile));
    recordMemberSinceIfNeeded();
  }, []);

  const onProfileUpdate = useCallback((nextProfile) => {
    setProfile(nextProfile);
    localStorage.setItem('ravnoparProfile', JSON.stringify(nextProfile));
  }, []);

  const onProfileLocaleSaved = useCallback((locale) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, locale };
      localStorage.setItem('ravnoparProfile', JSON.stringify(next));
      return next;
    });
  }, []);

  const onLogout = useCallback(() => {
    setToken('');
    setProfile(null);
    setUnreadTotal(0);
    localStorage.removeItem('ravnoparToken');
    localStorage.removeItem('ravnoparProfile');
  }, []);

  const value = useMemo(
    () => ({
      token,
      profile,
      unreadTotal,
      notificationUnread,
      setNotificationUnread,
      onboardingDone,
      setOnboardingDone,
      feedReady,
      setFeedReady,
      hydrated,
      onLogin,
      onLogout,
      onProfileUpdate,
      onProfileLocaleSaved,
      needsOnboarding: Boolean(token && profile && !onboardingDone),
      needsProfileSetup: Boolean(token && profile && onboardingDone && !feedReady)
    }),
    [
      token,
      profile,
      unreadTotal,
      notificationUnread,
      onboardingDone,
      feedReady,
      hydrated,
      onLogin,
      onLogout,
      onProfileUpdate,
      onProfileLocaleSaved
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
