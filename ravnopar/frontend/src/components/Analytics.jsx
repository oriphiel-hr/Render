import { useEffect } from 'react';

const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL?.trim();

export default function Analytics() {
  useEffect(() => {
    if (!ANALYTICS_URL) return;
    if (localStorage.getItem('ravnoparCookieConsent') !== 'accepted') return;

    const script = document.createElement('script');
    script.defer = true;
    script.src = ANALYTICS_URL;
    script.setAttribute('data-domain', 'ravnopar.app');
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return null;
}
