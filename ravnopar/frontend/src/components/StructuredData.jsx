import { useI18n } from '../lib/i18n/index.jsx';
import { SITE_URL, getOgImageUrl } from '../lib/seo.js';
import { CONTACT_EMAIL } from '../lib/legal-content.js';

export default function StructuredData() {
  const { t, locale } = useI18n();
  const name = t('meta.defaultTitle');
  const description = t('meta.defaultDescription');

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name,
        url: SITE_URL,
        email: CONTACT_EMAIL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/icon.svg`
        }
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name,
        description,
        inLanguage: locale,
        publisher: { '@id': `${SITE_URL}/#organization` }
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#app`,
        name,
        url: SITE_URL,
        applicationCategory: 'SocialNetworkingApplication',
        operatingSystem: 'Web',
        inLanguage: locale,
        description,
        image: getOgImageUrl(),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR'
        },
        publisher: { '@id': `${SITE_URL}/#organization` }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
