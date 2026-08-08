import { SITE_URL } from '../lib/env';
import { PUBLIC_PATHS } from '../lib/seo';
import { SUPPORTED_LOCALES } from '../lib/i18n/locale-meta';

export default function sitemap() {
  const lastModified = new Date();
  const entries = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const path of PUBLIC_PATHS) {
      const url = path === '/' ? `${SITE_URL}/${locale}` : `${SITE_URL}/${locale}${path}`;
      entries.push({
        url,
        lastModified,
        changeFrequency: path === '/' ? 'daily' : 'weekly',
        priority: path === '/' ? 1 : 0.7
      });
    }
  }

  return entries;
}
