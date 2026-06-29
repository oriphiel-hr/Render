import { useEffect } from 'react';
import { useI18n } from '../lib/i18n/index.jsx';

export default function PageMeta({ title, description, titleKey, descriptionKey }) {
  const { t } = useI18n();

  useEffect(() => {
    const resolvedTitle = title ?? (titleKey ? t(`meta.titles.${titleKey}`) : null);
    const resolvedDescription =
      description ?? (descriptionKey ? t(`meta.descriptions.${descriptionKey}`) : null);
    const siteName = t('meta.defaultTitle');
    const fullTitle = resolvedTitle ? `${resolvedTitle} — ${siteName}` : siteName;

    document.title = fullTitle;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', resolvedDescription || t('meta.defaultDescription'));
  }, [title, description, titleKey, descriptionKey, t]);

  return null;
}
