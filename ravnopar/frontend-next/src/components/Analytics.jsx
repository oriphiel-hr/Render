import { useEffect } from 'react';
import { useLocation } from '../lib/next-router-compat.js';
import {
  setAnalyticsContext,
  shouldTrackAnalytics,
  trackPageview
} from '../lib/analytics.js';
import { ANALYTICS_URL, UMAMI_WEBSITE_ID } from '../lib/env.js';
import { useAuth } from './AuthProvider.jsx';

function loadScript() {
  if (
    !ANALYTICS_URL ||
    !UMAMI_WEBSITE_ID ||
    document.querySelector('script[data-ravnopar-analytics="1"]')
  ) {
    return;
  }

  const script = document.createElement('script');
  script.defer = true;
  script.src = ANALYTICS_URL;
  script.dataset.websiteId = UMAMI_WEBSITE_ID;
  script.dataset.autoTrack = 'false';
  script.dataset.ravnoparAnalytics = '1';
  document.head.appendChild(script);
}

function RouteChangeTracker({ pathname, role, hasToken }) {
  useEffect(() => {
    setAnalyticsContext({ role, hasToken });
  }, [role, hasToken]);

  useEffect(() => {
    if (!shouldTrackAnalytics(pathname, { role, hasToken })) return;
    trackPageview(pathname);
  }, [pathname, role, hasToken]);

  return null;
}

export default function Analytics() {
  const location = useLocation();
  const { token, profile } = useAuth();
  const pathname = location.pathname;
  const role = profile?.role ?? null;
  const hasToken = Boolean(token);
  const enabled = shouldTrackAnalytics(pathname, { role, hasToken });

  useEffect(() => {
    if (!enabled) return;
    loadScript();
  }, [enabled]);

  if (!ANALYTICS_URL || !UMAMI_WEBSITE_ID || !enabled) return null;

  return (
    <RouteChangeTracker
      pathname={pathname + location.search}
      role={role}
      hasToken={hasToken}
    />
  );
}
