import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '../lib/analytics.js';

const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL?.trim();
const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID?.trim();

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
  script.dataset.ravnoparAnalytics = '1';
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
    loadScript();
  }, []);

  return ANALYTICS_URL && UMAMI_WEBSITE_ID ? <RouteChangeTracker /> : null;
}
