import { useEffect, useRef, useState } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();

let scriptPromise;
let activeWidgetId = null;

function loadTurnstileScript() {
  if (!SITE_KEY) return Promise.resolve(false);
  if (window.turnstile) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-turnstile="1"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.turnstile)));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = '1';
    script.onload = () => resolve(Boolean(window.turnstile));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function isTurnstileEnabled() {
  return Boolean(SITE_KEY);
}

export function resetTurnstileWidget() {
  if (activeWidgetId != null && window.turnstile?.reset) {
    window.turnstile.reset(activeWidgetId);
  }
}

export default function TurnstileWidget({ onToken, onExpire }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!SITE_KEY) return undefined;

    let cancelled = false;

    loadTurnstileScript().then((loaded) => {
      if (cancelled || !loaded || !containerRef.current || !window.turnstile) return;

      activeWidgetId = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onToken?.(token),
        'expired-callback': () => {
          onToken?.('');
          onExpire?.();
        },
        'error-callback': () => onToken?.('')
      });
      setReady(true);
    });

    return () => {
      cancelled = true;
      if (activeWidgetId != null && window.turnstile?.remove) {
        window.turnstile.remove(activeWidgetId);
        activeWidgetId = null;
      }
    };
  }, [onExpire, onToken]);

  if (!SITE_KEY) return null;

  return (
    <div className="turnstile-wrap" aria-hidden={!ready}>
      <div ref={containerRef} />
    </div>
  );
}
