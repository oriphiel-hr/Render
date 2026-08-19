/** Umami custom event names — keep in sync with admin analytics labels. */
export const ANALYTICS_EVENTS = {
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  DONATE_CLICK: 'donate_click',
  PLAN_VIEW: 'plan_view'
};

const OPTOUT_KEY = 'ravnopar-analytics-optout';

const BOT_UA =
  /bot|crawl|spider|slurp|archiver|petal|headless|phantom|selenium|lighthouse|bytespider|gptbot|claudebot|amazonbot|facebookexternalhit|pingdom|uptime|monitor|curl|wget|python-requests|go-http-client|java\/|libwww|scrapy|semrush|ahrefs/i;

/** @type {{ role?: string | null, hasToken?: boolean }} */
let analyticsContext = {};

export function setAnalyticsContext(ctx = {}) {
  analyticsContext = { ...analyticsContext, ...ctx };
}

export function isLikelyBot() {
  if (typeof navigator === 'undefined') return true;
  if (navigator.webdriver) return true;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return true;
  const ua = navigator.userAgent || '';
  return BOT_UA.test(ua);
}

export function isAnalyticsOptedOut() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(OPTOUT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAnalyticsOptOut(enabled = true) {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) localStorage.setItem(OPTOUT_KEY, '1');
    else localStorage.removeItem(OPTOUT_KEY);
  } catch {
    /* ignore */
  }
}

/** Skip Umami for bots, admin area, admin users, and local opt-out. */
export function shouldTrackAnalytics(pathname = '', ctx = analyticsContext) {
  if (typeof window === 'undefined') return false;
  if (isLikelyBot()) return false;
  if (isAnalyticsOptedOut()) return false;
  if (pathname.startsWith('/admin')) return false;
  if (ctx.role === 'ADMIN') return false;
  return true;
}

export function trackPageview(path) {
  if (!shouldTrackAnalytics(path)) return;
  if (typeof window.umami?.track === 'function') {
    window.umami.track((props) => ({ ...props, url: path }));
  }
}

export function trackEvent(name, props = {}) {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  if (!shouldTrackAnalytics(path)) return;
  if (typeof window.umami?.track === 'function') {
    window.umami.track(name, props);
  }
}

export function trackConversion(name, props = {}) {
  trackEvent(name, props);
}
