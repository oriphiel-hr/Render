import { useEffect } from 'react';
import { useLocation } from '../lib/next-router-compat.js';
import { trackPageview } from '../lib/analytics.js';
import { ANALYTICS_URL, UMAMI_WEBSITE_ID } from '../lib/env.js';

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
