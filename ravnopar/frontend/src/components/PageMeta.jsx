import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../lib/i18n/index.jsx';
import {
  LOCALE_HREFLANG,
  OG_LOCALE,
  buildPageUrl,
  getOgImageUrl,
  isPublicPath,
  shouldNoindex
} from '../lib/seo.js';
import { SUPPORTED_LOCALES } from '../lib/i18n/locale-meta.js';

const SEO_ATTR = 'data-ravnopar-seo';

function removeSeoNodes() {
  document.querySelectorAll(`[${SEO_ATTR}]`).forEach((node) => node.remove());
}

function appendSeoNode(tag, attrs) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value != null) el.setAttribute(key, value);
  });
  el.setAttribute(SEO_ATTR, '');
  document.head.appendChild(el);
  return el;
}

function upsertMeta(name, content, property = false) {
  if (!content) return;
  const attr = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    el.setAttribute(SEO_ATTR, '');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function PageMeta({
  title,
  description,
  titleKey,
  descriptionKey,
  noindex = false,
  indexable
}) {
  const { t, locale } = useI18n();
  const { pathname } = useLocation();

  useEffect(() => {
    const resolvedTitle = title ?? (titleKey ? t(`meta.titles.${titleKey}`) : null);
    const resolvedDescription =
      description ?? (descriptionKey ? t(`meta.descriptions.${descriptionKey}`) : null);
    const siteName = t('meta.defaultTitle');
    const fullTitle = resolvedTitle
      ? titleKey === 'home'
        ? `${siteName} — ${resolvedTitle}`
        : `${resolvedTitle} — ${siteName}`
      : siteName;
    const metaDescription = resolvedDescription || t('meta.defaultDescription');
    const publicPage = isPublicPath(pathname);
    const blockIndex = noindex || shouldNoindex(pathname) || indexable === false || !publicPage;
    const canonical = buildPageUrl(pathname, locale);
    const ogLocale = OG_LOCALE[locale] || locale;
    const ogImage = getOgImageUrl();

    document.title = fullTitle;

    removeSeoNodes();

    upsertMeta('description', metaDescription);
    upsertMeta('robots', blockIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    upsertMeta('googlebot', blockIndex ? 'noindex, nofollow' : 'index, follow');

    upsertMeta('og:title', fullTitle, true);
    upsertMeta('og:description', metaDescription, true);
    upsertMeta('og:type', 'website', true);
    upsertMeta('og:url', canonical, true);
    upsertMeta('og:site_name', siteName, true);
    upsertMeta('og:locale', ogLocale, true);
    upsertMeta('og:image', ogImage, true);
    upsertMeta('og:image:alt', siteName, true);

    SUPPORTED_LOCALES.forEach((code) => {
      if (code === locale) return;
      const alt = OG_LOCALE[code];
      if (alt) appendSeoNode('meta', { property: 'og:locale:alternate', content: alt });
    });

    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', fullTitle);
    upsertMeta('twitter:description', metaDescription);
    upsertMeta('twitter:image', ogImage);

    appendSeoNode('link', { rel: 'canonical', href: canonical });

    SUPPORTED_LOCALES.forEach((code) => {
      appendSeoNode('link', {
        rel: 'alternate',
        hreflang: LOCALE_HREFLANG[code] || code,
        href: buildPageUrl(pathname, code)
      });
    });
    appendSeoNode('link', {
      rel: 'alternate',
      hreflang: 'x-default',
      href: buildPageUrl(pathname, 'hr')
    });

    return () => removeSeoNodes();
  }, [
    title,
    description,
    titleKey,
    descriptionKey,
    noindex,
    indexable,
    pathname,
    locale,
    t
  ]);

  return null;
}
