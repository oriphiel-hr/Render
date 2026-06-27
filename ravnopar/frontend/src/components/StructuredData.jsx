export default function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Ravnopar',
    applicationCategory: 'SocialNetworkingApplication',
    operatingSystem: 'Web',
    inLanguage: 'hr',
    description:
      'Fer dating platforma za Hrvatsku — bez paywalla za razgovor, chat nakon matcha, transparentna pravila.',
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
