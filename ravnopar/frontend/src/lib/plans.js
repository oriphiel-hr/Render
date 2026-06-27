export const PRICING_POLICY = {
  headline: 'Model naplate',
  lead:
    'Ravnopar je danas besplatan za osnovno upoznavanje. Nećemo uvesti naplatu dok proizvod nije stabilan i dok zajednica stvarno koristi platformu.',
  promises: [
    'Slanje zahtjeva, prihvaćanje kontakta i razgovor ostaju besplatni — bez paywalla.',
    'Ne naplaćujemo po broju članova u gradu niti skrivamo doseg onima koji ne plate.',
    'Premium (kad bude dostupan) bit će samo opcionalni dodaci, ne pravo na razgovor.',
    'O uvođenju naplate obavijestit ćemo unaprijed (najmanje 30 dana) na e-mail i u aplikaciji.',
    'Donacije su i ostaju dobrovoljne te ne daju dodatne funkcije.'
  ],
  triggers: [
    'stabilan proizvod bez kritičnih prekida',
    'dovoljno mjesečno aktivnih korisnika (MAU)',
    'značajan udio korisnika koji stvarno šalju ili prihvaćaju kontakte',
    'troškovi održavanja koje donacije ne pokrivaju dugoročno'
  ],
  footnote:
    'Kad budu ispunjeni uvjeti, uključit ćemo opcionalne pakete ispod. Cijene su orientacijske i mogu se blago prilagoditi prije lansiranja.'
};

export const PLANS = [
  {
    id: 'free',
    name: 'Besplatno',
    priceEur: 0,
    period: '',
    description: 'Sve što trebaš za fer upoznavanje — danas i ubuduće.',
    features: [
      'Profil i vidljivost u feedu',
      'Slanje i prihvaćanje zahtjeva za kontakt',
      'Blokiranje, prijave i anti-spam zaštita',
      'Bez skrivenog smanjenja dosega'
    ],
    tier: 'free'
  },
  {
    id: 'plus',
    name: 'Ravnopar Plus',
    priceEur: 4.99,
    period: '/ mj',
    description: 'Opcionalni dodaci za one koji žele više kontrole nad profilom.',
    features: [
      'Više fotografija na profilu',
      'Napredni filtri (bez utjecaja na vidljivost drugih)',
      'Prioritet u obradi prijava profila',
      'Značka verificiranog profila (kad bude dostupna)'
    ],
    tier: 'premium'
  },
  {
    id: 'supporter',
    name: 'Ravnopar Supporter',
    priceEur: 2.99,
    period: '/ mj',
    description: 'Za one koji žele direktno podržati održavanje uz simbolične dodatke.',
    features: [
      'Sve iz besplatnog paketa',
      'Supporter značka na profilu',
      'Rani pristup novim funkcijama (beta)',
      'Transparentni mjesečni izvještaj troškova platforme'
    ],
    tier: 'premium'
  }
];

export function arePlansPurchasable() {
  return import.meta.env.VITE_PLANS_ENABLED === 'true';
}

export function formatPlanPrice(plan) {
  if (plan.priceEur === 0) return '0 €';
  return `${plan.priceEur.toFixed(2).replace('.', ',')} €`;
}
