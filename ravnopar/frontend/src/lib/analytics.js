export function trackPageview(path) {
  if (typeof window.plausible === 'function') {
    window.plausible('pageview', { u: path });
  }
}

export function trackEvent(name, props = {}) {
  if (typeof window.plausible === 'function') {
    window.plausible(name, { props });
  }
}
