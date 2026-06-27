export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL?.trim() || 'podrska@ravnopar.app';

export const PRIVACY_SECTIONS = [
  {
    title: 'Tko smo',
    body: 'Ravnopar je platforma za fer upoznavanje. Ova politika objašnjava koje podatke prikupljamo i kako ih koristimo.'
  },
  {
    title: 'Podaci koje prikupljamo',
    body: 'Email, ime za prikaz, datum rođenja (za provjeru dobi), grad, preferencije upoznavanja, bio, fotografije profila, poruke nakon matcha te tehnički zapisi (npr. vrijeme prijave).'
  },
  {
    title: 'Zašto koristimo podatke',
    body: 'Za registraciju, prikaz profila, sparivanje, chat, sigurnost (blokiranje, prijave), obavijesti koje odobriš i održavanje platforme.'
  },
  {
    title: 'Dijeljenje podataka',
    body: 'Ne prodajemo tvoje podatke. Dijelimo samo ono što je nužno s pružateljima usluga (hosting, email, plaćanje) i kad to zakon zahtijeva.'
  },
  {
    title: 'Tvoja prava (GDPR)',
    body: 'Možeš zatražiti pristup, ispravak ili brisanje podataka. Brisanje računa dostupno je u Postavkama. Za zahtjeve piši na kontakt email.'
  },
  {
    title: 'Pohrana i sigurnost',
    body: 'Podatke čuvamo dok koristiš uslugu. Primjenjujemo razumne tehničke mjere zaštite, ali nijedan sustav nije 100% siguran.'
  },
  {
    title: 'Kontakt',
    body: `Pitanja o privatnosti: ${CONTACT_EMAIL}`
  }
];

export const TERMS_SECTIONS = [
  {
    title: 'Prihvaćanje uvjeta',
    body: 'Korištenjem Ravnopara prihvaćaš ove uvjete. Moraš imati najmanje 18 godina.'
  },
  {
    title: 'Račun i odgovornost',
    body: 'Odgovoran/na si za sigurnost lozinke i sadržaj svog profila. Ne smiješ davati lažne podatke niti zloupotrebljavati platformu.'
  },
  {
    title: 'Zabranjeno ponašanje',
    body: 'Zabranjeno je uznemiravanje, prijetnje, spam, govor mržnje, objava tuđih osobnih podataka bez pristanka i sadržaj protuzakonit po zakonu RH/EU.'
  },
  {
    title: 'Usluga „kakva jest”',
    body: 'Ravnopar se razvija. Ne jamčimo neprekidnu dostupnost niti da će svaki kontakt rezultirati vezom — pružamo alat za upoznavanje.'
  },
  {
    title: 'Naplata',
    body: 'Osnovne funkcije su besplatne. Budući premium paketi bit će opcionalni; o promjenama obavještavamo unaprijed (vidi /planovi).'
  },
  {
    title: 'Prekid korištenja',
    body: 'Možeš obrisati račun u Postavkama. Zadržavamo pravo suspendirati račune koji krše pravila.'
  },
  {
    title: 'Mjerodavno pravo',
    body: 'Uvjeti se tumače prema zakonima Republike Hrvatske, osim ako obvezujući propisi EU nalaže drugačije.'
  }
];

export const GUIDELINES_SECTIONS = [
  {
    title: 'Dozvoljeno',
    body: 'Različite preferencije, iskren razgovor uz obostrani pristanak, postavljanje vlastitih granica i odbijanje kontakta.'
  },
  {
    title: 'Nije dozvoljeno',
    body: 'Vrijedjanje, uznemiravanje, prijetnje, spam, eksplicitni sadržaj bez pristanka, lažni profili.'
  },
  {
    title: 'Fer pravila platforme',
    body: 'Nema paywalla za osnovnu komunikaciju. Aktivni parovi privremeno izlaze iz feeda. Anti-spam limiti štite zajednicu.'
  },
  {
    title: 'Sigurnosni savjeti',
    body: 'Prvi susret na javnom mjestu, javi prijatelju gdje ideš, ne dijeli financijske podatke prerano, prijavi sumnjivo ponašanje.'
  }
];
