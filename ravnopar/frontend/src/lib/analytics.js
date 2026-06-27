const CONSENT_KEY = 'ravnoparCookieConsent';

export function hasAnalyticsConsent() {
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

export function trackPageview(path) {
  if (!hasAnalyticsConsent()) return;
  if (typeof window.plausible === 'function') {
    window.plausible('pageview', { u: path });
  }
}

export function trackEvent(name, props = {}) {
  if (!hasAnalyticsConsent()) return;
  if (typeof window.plausible === 'function') {
    window.plausible(name, { props });
  }
}
