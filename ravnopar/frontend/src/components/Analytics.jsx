import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '../lib/analytics.js';

const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL?.trim();

function loadScript() {
  if (!ANALYTICS_URL || document.querySelector('script[data-ravnopar-analytics="1"]')) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = ANALYTICS_URL;
  script.dataset.ravnoparAnalytics = '1';
  script.setAttribute('data-domain', window.location.hostname);
  document.head.appendChild(script);
}

function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location]);

  return null;
}

export default function Analytics() {
  useEffect(() => {
    function maybeLoad() {
      if (localStorage.getItem('ravnoparCookieConsent') === 'accepted') {
        loadScript();
      }
    }
    maybeLoad();
    window.addEventListener('ravnopar-cookie-consent', maybeLoad);
    return () => window.removeEventListener('ravnopar-cookie-consent', maybeLoad);
  }, []);

  return ANALYTICS_URL ? <RouteChangeTracker /> : null;
}
