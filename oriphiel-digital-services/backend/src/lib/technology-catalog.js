export const technologyCatalogBase = [
  {
    id: 'react',
    name: 'React',
    category: 'Frontend',
    pricingModel: 'Open source',
    indicativeMonthlyEur: 0,
    sourceUrl: 'https://react.dev/',
    notes: 'Licenca se ne naplacuje; trosak je razvoj i odrzavanje.'
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'Frontend/Fullstack',
    pricingModel: 'Open source',
    indicativeMonthlyEur: 0,
    sourceUrl: 'https://nextjs.org/',
    notes: 'Trošak je uglavnom hosting i razvoj.'
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'Backend runtime',
    pricingModel: 'Open source',
    indicativeMonthlyEur: 0,
    sourceUrl: 'https://nodejs.org/',
    notes: 'Licenca bez troska, operativni troskovi na hostingu.'
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    category: 'Baza podataka',
    pricingModel: 'Open source',
    indicativeMonthlyEur: 0,
    sourceUrl: 'https://www.postgresql.org/',
    notes: 'Managed hosting baze se naplacuje odvojeno.'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Placanja',
    pricingModel: 'Transaction fee',
    indicativeMonthlyEur: 0,
    sourceUrl: 'https://stripe.com/pricing',
    notes: 'Varijabilni trosak po transakciji ovisi o trzistu i nacinu placanja.'
  },
  {
    id: 'ga4',
    name: 'Google Analytics 4',
    category: 'Analitika',
    pricingModel: 'Free tier / Enterprise',
    indicativeMonthlyEur: 0,
    sourceUrl: 'https://marketingplatform.google.com/about/analytics/',
    notes: 'Za vecinu SMB use-caseova bez licence; enterprise varijante se posebno ugovaraju.'
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    category: 'Marketing',
    pricingModel: 'Ad spend + management',
    indicativeMonthlyEur: 0,
    sourceUrl: 'https://ads.google.com/',
    notes: 'Budzet oglasa je odvojen od operativne usluge upravljanja.'
  }
];

export const industryCostScenarios = [
  {
    id: 'construction',
    label: 'Gradjevina i adaptacije',
    industry: 'Građevina i adaptacije',
    recommendedTrack: 'GROWTH',
    defaultTechIds: ['react', 'nodejs', 'postgres', 'ga4', 'google-ads'],
    notes: 'Fokus na leadove i pozive; lokalna segmentacija i sezonalnost.'
  },
  {
    id: 'beauty',
    label: 'Beauty i wellness',
    industry: 'Ljepota i wellness',
    recommendedTrack: 'STARTER',
    defaultTechIds: ['react', 'nodejs', 'postgres', 'ga4', 'google-ads'],
    notes: 'Fokus na booking leadove i branded pretragu.'
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    industry: 'E-commerce',
    recommendedTrack: 'PREMIUM',
    defaultTechIds: ['nextjs', 'nodejs', 'postgres', 'stripe', 'ga4', 'google-ads'],
    notes: 'Fokus na prodaju, feed quality i performance segmentaciju.'
  }
];
