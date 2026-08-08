import { useEffect } from 'react';
import { useLocation } from '../lib/next-router-compat.js';
import { useI18n } from '../lib/i18n/index.jsx';
import { isPublicPath } from '../lib/seo.js';

const SEO_ATTR = 'data-ravnopar-seo';

function removeSeoNodes() {
  document.querySelectorAll(`[${SEO_ATTR}]`).forEach((node) => node.remove());
}

function upsertMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Na privatnim rutama (/app, /auth, /admin) postavi noindex i očisti javni SEO. */
export default function PrivateRouteSeo() {
  const { pathname } = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    if (isPublicPath(pathname)) return;

    document.title = t('meta.defaultTitle');
    removeSeoNodes();
    upsertMeta('description', t('meta.defaultDescription'));
    upsertMeta('robots', 'noindex, nofollow');
    upsertMeta('googlebot', 'noindex, nofollow');
  }, [pathname, t]);

  return null;
}
