import { useI18n } from '../lib/i18n/index.jsx';

export default function StructuredData() {
  const { t, locale } = useI18n();

  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t('meta.defaultTitle'),
    applicationCategory: 'SocialNetworkingApplication',
    operatingSystem: 'Web',
    inLanguage: locale,
    description: t('meta.defaultDescription'),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
