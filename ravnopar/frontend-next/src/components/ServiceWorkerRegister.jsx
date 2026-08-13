'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!('serviceWorker' in navigator)) return undefined;
    const ready = navigator.serviceWorker
      .register('/sw.js')
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.warn('[pwa] SW register failed', error?.message || error);
      });
    return () => {
      /* keep SW alive across navigations */
      void ready;
    };
  }, []);

  return null;
}
