/** Umami custom event names — keep in sync with admin analytics labels. */
export const ANALYTICS_EVENTS = {
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  DONATE_CLICK: 'donate_click',
  PLAN_VIEW: 'plan_view'
};

export function trackPageview(path) {
  if (typeof window.umami?.track === 'function') {
    window.umami.track((props) => ({ ...props, url: path }));
  }
}

export function trackEvent(name, props = {}) {
  if (typeof window.umami?.track === 'function') {
    window.umami.track(name, props);
  }
}

export function trackConversion(name, props = {}) {
  trackEvent(name, props);
}
