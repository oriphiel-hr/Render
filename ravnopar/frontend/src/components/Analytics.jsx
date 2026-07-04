import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '../lib/analytics.js';

const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL?.trim();

function loadScript() {
  if (!ANALYTICS_URL || document.querySelector('script[data-ravnopar-analytics="1"]')) return;

  if (typeof window.plausible !== 'function') {
    const inline = document.createElement('script');
    inline.textContent =
      'window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()';
    document.head.appendChild(inline);
  }

  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = ANALYTICS_URL;
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

  return ANALYTICS_URL ? <RouteChangeTracker /> : null;
}
