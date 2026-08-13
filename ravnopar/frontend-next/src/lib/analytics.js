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
