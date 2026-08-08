import { useEffect } from 'react';
import { useLocation } from '../lib/next-router-compat.js';
import { trackPageview } from '../lib/analytics.js';

import { ANALYTICS_URL } from '../lib/env.js';

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
