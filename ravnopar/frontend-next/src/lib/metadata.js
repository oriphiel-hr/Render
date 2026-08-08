import { LOCALE_HREFLANG, OG_LOCALE, SITE_URL, buildPageUrl, getOgImageUrl } from './seo';
import { SUPPORTED_LOCALES } from './i18n/locale-meta';
import { buildPageMetadata } from './i18n/server';

export function createPublicMetadata(locale, path, titleKey, descriptionKey) {
  const { title, description, siteName } = buildPageMetadata(locale, titleKey, descriptionKey);
  const canonical = buildPageUrl(path, locale);
  const ogImage = getOgImageUrl();

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
      languages: Object.fromEntries([
        ...SUPPORTED_LOCALES.map((code) => [LOCALE_HREFLANG[code] || code, buildPageUrl(path, code)]),
        ['x-default', buildPageUrl(path, 'hr')]
      ])
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale: OG_LOCALE[locale] || locale,
      type: 'website',
      images: [{ url: ogImage, alt: siteName }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' }
    }
  };
}

export function createNoindexMetadata(title = 'Ravnopar') {
  return {
    title,
    robots: { index: false, follow: false }
  };
}
