export const PRICING_POLICY = {
  headline: 'Novac ne smije stajati između ljudi',
  lead:
    'Ravnopar je danas besplatan za upoznavanje — i to nam je namjera. Nećemo uvesti naplatu dok proizvod nije stabilan i dok zajednica stvarno živi na platformi.',
  promisesIntro: 'Na ovo možeš računati — danas i kad uvedemo Premium:',
  triggersIntro:
    'Ne žurimo s naplatom. Premium pakete uključujemo tek kad sve sljedeće ima smisla:',
  footnote:
    'Kad dođe taj trenutak, uključit ćemo pakete ispod. Cijene su orientacijske; prije lansiranja ćemo ih potvrditi i obavijestiti te najmanje 30 dana unaprijed.'
};

export const PRICING_PROMISES = [
  {
    icon: '💬',
    title: 'Razgovor ostaje besplatan',
    text: 'Slanje zahtjeva, prihvaćanje kontakta i chat neće ikad biti iza paywalla.'
  },
  {
    icon: '⚖️',
    title: 'Fer vidljivost',
    text: 'Ne naplaćujemo po broju ljudi u gradu niti skrivamo doseg onima koji ne plate.'
  },
  {
    icon: '✨',
    title: 'Premium = dodaci, ne pravo',
    text: 'Plaćeni paketi bit će samo opcionalni — nikad ulaznica za razgovor.'
  },
  {
    icon: '📬',
    title: 'Obavijest unaprijed',
    text: 'Prije bilo kakve naplate javit ćemo se e-mailom i u aplikaciji — najmanje 30 dana ranije.'
  },
  {
    icon: '🤝',
    title: 'Donacije ostaju dobrovoljne',
    text: 'Ako doniraš, ne dobivaš prednost u feedu — samo našu iskrenu zahvalu.'
  }
];

export const PRICING_TRIGGERS = [
  {
    icon: '🛠️',
    text: 'Proizvod radi stabilno, bez stalnih prekida'
  },
  {
    icon: '👥',
    text: 'Dovoljno ljudi aktivno koristi Ravnopar svaki mjesec'
  },
  {
    icon: '💌',
    text: 'Značajan broj korisnika stvarno šalje ili prihvaća kontakte'
  },
  {
    icon: '🌱',
    text: 'Troškovi servera koje donacije dugoročno ne pokrivaju'
  }
];

export const PRICING_VALUES = [
  {
    icon: '♥',
    title: 'Ljudi prije prihoda',
    text: 'Platformu gradimo za stvarne susrete, ne za maksimalnu naplatu.'
  },
  {
    icon: '☀',
    title: 'Iskrenost bez sitnih slova',
    text: 'Pravila pišemo razumljivo — da znaš što možeš očekivati danas i sutra.'
  },
  {
    icon: '◉',
    title: 'Zajednica, ne brojke',
    text: 'Odluke donosimo prema aktivnosti i povjerenju, ne prema pritisku „puni grad".'
  }
];

export const FOUNDER_NOTE = {
  quote:
    'Nismo napravili Ravnopar da te tjera na pretplatu prije nego što upoznaš ikoga. Ako jednog dana uvedemo Premium, to će biti zato što platforma raste i treba održavanje — ne zato što ti treba platiti da bi te netko uopće vidio.',
  signature: 'Hvala što si ovdje. — tim iza Ravnopara'
};

export const PLANS = [
  {
    id: 'free',
    name: 'Besplatno',
    icon: '🏠',
    priceEur: 0,
    period: '',
    tagline: 'Tvoj start',
    description: 'Sve što trebaš za fer upoznavanje — danas i kad uvedemo Premium.',
    features: [
      'Profil i vidljivost u feedu',
      'Slanje i prihvaćanje zahtjeva',
      'Blokiranje, prijave i zaštita od spama',
      'Bez skrivenog smanjenja dosega'
    ],
    tier: 'free'
  },
  {
    id: 'plus',
    name: 'Ravnopar Plus',
    icon: '✦',
    priceEur: 4.99,
    period: '/ mj',
    tagline: 'Više za profil',
    description: 'Za one koji žele dodatnu kontrolu — bez utjecaja na druge u feedu.',
    features: [
      'Više fotografija na profilu',
      'Napredni filtri (fer prema svima)',
      'Prioritet u obradi prijava',
      'Značka verificiranog profila (uskoro)'
    ],
    tier: 'premium'
  },
  {
    id: 'supporter',
    name: 'Ravnopar Supporter',
    icon: '♥',
    priceEur: 2.99,
    period: '/ mj',
    tagline: 'Podrži i ostani',
    description: 'Simbolična pretplata za one koji vjeruju u ono što gradimo.',
    features: [
      'Sve iz besplatnog paketa',
      'Supporter značka na profilu',
      'Rani pristup novim stvarima (beta)',
      'Mjesečni uvid u troškove platforme'
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
