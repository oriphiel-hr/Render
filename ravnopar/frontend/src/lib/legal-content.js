export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL?.trim() || 'podrska@ravnopar.app';

export const LEGAL_DISCLAIMER =
  'Ovi tekstovi su informativni predlošci za platformu Ravnopar. Prije službenog lansiranja preporučujemo pregled od strane pravnika upoznatog s GDPR-om i zakonodavstvom RH/EU. Zadnja izmjena: lipanj 2026.';

export const PRIVACY_SECTIONS = [
  {
    title: 'Voditelj obrade i kontakt',
    body: `Ravnopar je platforma za fer upoznavanje namijenjena punoljetnim korisnicima (18+). Za pitanja o privatnosti piši na ${CONTACT_EMAIL}.`
  },
  {
    title: 'Dobna granica',
    body: 'Usluga je isključivo za osobe starije od 18 godina. Registracijom potvrđuješ da ispunjavaš dobni uvjet. Datum rođenja koristimo isključivo za provjeru dobi i ne prikazujemo ga javno.'
  },
  {
    title: 'Podaci koje prikupljamo',
    body:
      'Identifikacijski i kontakt podaci (email, ime za prikaz), profil (grad, bio, fotografije, preferencije upoznavanja, icebreaker odgovori), opcionalni video link, poruke nakon matcha, tehnički zapisi (vrijeme aktivnosti), opcionalna grubo zaokružena lokacija (koordinate samo ako uključiš dijeljenje udaljenosti), verifikacijski selfie (nije javan), referral kod te podaci o plaćanjima/donacijama ako ih koristiš.'
  },
  {
    title: 'Lokacija i udaljenost',
    body:
      'Dijeljenje lokacije je opcionalno i isključeno by default. Ako ga uključiš, koordinate služe isključivo za izračun grube udaljenosti (npr. „5–15 km“) — točne koordinate ne prikazujemo drugim korisnicima niti na karti. Lokaciju možeš isključiti u Postavkama; tada se koordinate brišu pri sljedećem spremanju profila.'
  },
  {
    title: 'Verifikacijski selfie',
    body:
      'Selfie za verifikaciju profila koristi se samo u svrhu moderacije (usporedba s profilnom fotografijom). Nije vidljiv drugim korisnicima. Nakon odobrenja ili odbijanja admin tim može obrisati selfie iz sustava.'
  },
  {
    title: 'Svrha obrade',
    body:
      'Pružanje usluge upoznavanja, prikaz profila, sparivanje, chat, sigurnost (blokiranje, prijave), email obavijesti koje odobriš, referral program, analitika (samo uz suglasnost za kolačiće) te održavanje platforme.'
  },
  {
    title: 'Pravna osnova (GDPR)',
    body:
      'Uglavnom izvršavanje ugovora (korištenje usluge), legitimni interes (sigurnost, sprječavanje zloupotrebe) te privola (email obavijesti, lokacija, analitika, kolačići izvan nužnih).'
  },
  {
    title: 'Dijeljenje s trećim stranama',
    body:
      'Ne prodajemo tvoje podatke. Podatke dijelimo samo s pružateljima usluga nužnim za rad (hosting Render, email SMTP, opcionalno Stripe za plaćanja, opcionalno analitika Plausible/Umami) i kad to zakon zahtijeva. Pružatelji su ugovorno obvezni štititi podatke.'
  },
  {
    title: 'Pohrana i sigurnost',
    body:
      'Podatke čuvamo dok koristiš račun. Primjenjujemo razumne tehničke mjere (HTTPS, hash lozinke, pristup admin panelu). Fotografije mogu biti u bazi (base64) ili na S3/R2 ako je konfigurirano. Nijedan sustav nije 100% siguran.'
  },
  {
    title: 'Tvoja prava',
    body:
      'Imate pravo pristupa, ispravka, brisanja, ograničenja obrade, prigovora i prenosivosti podataka (u mjeri u kojoj je primjenjivo). Brisanje računa dostupno je u Postavkama. Za ostale zahtjeve kontaktiraj nas na email; odgovaramo u roku propisanom GDPR-om.'
  },
  {
    title: 'Kolačići i analitika',
    body:
      'Nužni kolačići/tokeni služe za prijavu. Analitika (npr. Plausible/Umami) učitava se samo ako prihvatiš banner kolačića. Analitika ne koristi oglašivačke profile po defaultu — ovisi o odabranom alatu.'
  },
  {
    title: 'Referral',
    body:
      'Ako koristiš pozivnicu, zabilježavamo referral kod osobe koja te pozvala isključivo u statističke svrhe unutar platforme. Ne javljamo tvoju email adresu pozivatelju.'
  },
  {
    title: 'Izmjene politike',
    body:
      'Politiku možemo ažurirati. O bitnim promjenama obavještavamo putem aplikacije ili emaila. Nastavak korištenja nakon objave smatra se prihvaćanjem ažurirane politike.'
  }
];

export const TERMS_SECTIONS = [
  {
    title: 'Prihvaćanje uvjeta',
    body: 'Korištenjem Ravnopara prihvaćaš ove uvjete i politiku privatnosti. Moraš imati najmanje 18 godina.'
  },
  {
    title: 'Opis usluge',
    body:
      'Ravnopar je alat za fer upoznavanje — profili, zahtjevi za kontakt, chat nakon obostranog prihvaćanja te moderacija. Ne jamčimo uspjeh u vezi niti broj matcha.'
  },
  {
    title: 'Račun i profil',
    body:
      'Odgovoran/na si za točnost podataka, sigurnost lozinke i sadržaj profila. Profil s fotografijom i bio tekstom potreban je za slanje zahtjeva drugima. Lažni profili i lažna dob su zabranjeni.'
  },
  {
    title: 'Zabranjeno ponašanje',
    body:
      'Zabranjeno je uznemiravanje, prijetnje, spam, govor mržnje, objava tuđih osobnih podataka, sadržaj bez pristanka, trgovanje uslugama, prijevare te sve protuzakonito po zakonima RH/EU.'
  },
  {
    title: 'Moderacija i suspenzija',
    body:
      'Zadržavamo pravo suspendirati ili obrisati račune koji krše pravila, bez prethodne najave u hitnim slučajevima. Možeš prijaviti korisnike u aplikaciji.'
  },
  {
    title: 'Naplata i donacije',
    body:
      'Osnovne funkcije su besplatne. Premium paketi i donacije su opcionalni (vidi /planovi). Cijene i uvjete naplate objavljujemo unaprijed.'
  },
  {
    title: 'Dostupnost usluge',
    body:
      'Uslugu pružamo „kakva jest”. Mogući su prekidi zbog održavanja, hostinga ili više sile. Preporučujemo redovito spremanje važnih podataka (GDPR export u Postavkama).'
  },
  {
    title: 'Odgovornost',
    body:
      'Susreti izvan platforme odvijaju se na vlastitu odgovornost. Savjetujemo oprez pri prvom susretu (javno mjesto, obavijest bliskoj osobi). Ravnopar nije strana u odnosima između korisnika.'
  },
  {
    title: 'Mjerodavno pravo',
    body:
      'Uvjeti se tumače prema zakonima Republike Hrvatske, uz obvezujuće propise Europske unije (uključujući GDPR) gdje je primjenjivo. Nadležnost: sudovi u RH, osim ako potrošačko pravo EU nalaže drugačije.'
  }
];

export const GUIDELINES_SECTIONS = [
  {
    title: 'Dozvoljeno',
    body: 'Iskren profil, različite preferencije, poštivanje granica, odbijanje kontakta bez objašnjenja, prijava sumnjivog ponašanja.'
  },
  {
    title: 'Nije dozvoljeno',
    body: 'Vrijedjanje, uznemiravanje, prijetnje, spam zahtjevi, lažni profili, eksplicitne fotografije bez konteksta pristanka, traženje novca.'
  },
  {
    title: 'Fer model Ravnopara',
    body: 'Nema paywalla za osnovni chat. Aktivni parovi privremeno izlaze iz feeda. Anti-spam limiti štite zajednicu. Boost/super-like ne postoje.'
  },
  {
    title: 'Profil s fotografijom',
    body: 'Bez fotografije i kratkog bio teksta ne možeš slati zahtjeve — to štiti kvalitetu zajednice i smanjuje lažne profile.'
  },
  {
    title: 'Sigurnost na susretu',
    body: 'Prvi susret na javnom mjestu, javi prijatelju gdje ideš, ne dijeli financijske podatke prerano, prijavi sumnjivo ponašanje admin timu.'
  },
  {
    title: 'Verifikacija',
    body: 'Badge „Verificiran profil“ dodjeljuje admin nakon usporedbe selfija s profilnom fotkom. Nije garancija identiteta, ali pomaže povjerenju.'
  }
];
