import { getFaqItems } from '../lib/faq.js';
import { useI18n } from '../lib/i18n/index.jsx';
import { SITE_URL } from '../lib/seo.js';

export default function FaqStructuredData() {
  const { catalog, t, locale } = useI18n();
  const items = getFaqItems(catalog);

  if (!items.length) return null;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: t('meta.titles.faq'),
    description: t('meta.descriptions.faq'),
    url: `${SITE_URL}/${locale}/pomoc`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
