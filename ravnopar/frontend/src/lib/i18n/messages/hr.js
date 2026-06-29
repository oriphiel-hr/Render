export default {
  lang: {
    hr: 'Hrvatski',
    en: 'English',
    de: 'Deutsch',
    sl: 'Slovenščina',
    bs: 'Bosanski',
    sr: 'Srpski',
    it: 'Italiano',
    hu: 'Magyar',
    pl: 'Polski',
    cs: 'Čeština',
    fr: 'Français',
    es: 'Español',
    sk: 'Slovenčina'
  },

  nav: {
    home: 'Početna',
    login: 'Prijava',
    plans: 'Planovi',
    help: 'Pomoć',
    mySpace: 'Moj prostor',
    settings: 'Postavke',
    admin: 'Admin',
    logout: 'Odjava',
    menu: 'Izbornik',
    close: 'Zatvori',
    greeting: 'Pozdrav, {name}',
    quickNav: 'Brza navigacija',
    mySpaceUnread: 'Moj prostor ({count})',
    donate: 'Podrži'
  },

  auth: {
    welcome: 'Dobrodošao/la u Ravnopar',
    welcomeLogin: 'Prijavi se',
    subtitleRegister: 'Tri jednostavna koraka do tvog profila.',
    subtitleLogin: 'Unesi email i lozinku za pristup svom profilu.',
    stepAccount: 'Račun',
    stepVerify: 'Verifikacija',
    stepLogin: 'Prijava',
    stepReset: 'Reset',
    stepNewPassword: 'Nova lozinka',
    createAccount: '1. Kreiraj račun',
    referralApplied: 'Pozivnica primijenjena — hvala što si došao/la preko prijatelja.',
    email: 'Email',
    password: 'Lozinka',
    displayName: 'Ime za prikaz',
    dateOfBirth: 'Datum rođenja',
    day: 'Dan',
    month: 'Mjesec',
    year: 'Godina',
    city: 'Grad',
    country: 'Država',
    language: 'Jezik',
    identity: 'Tvoj identitet',
    profileType: 'Tip profila',
    aboutOptional: 'O meni (opcionalno)',
    aboutPlaceholder: 'Kratko se predstavi...',
    seekingWho: 'Koga tražiš',
    seekingType: 'Tip profila koji tražiš',
    seekingIntent: 'Što tražiš',
    continueVerify: 'Nastavi na verifikaciju',
    saving: 'Spremanje...',
    hasAccount: 'Već imaš račun?',
    signIn: 'Prijavi se',
    verifyTitle: '2. Potvrdi email',
    verifyHint: 'Unesi 6-znamenkasti kod koji si primio/la na email.',
    verifyCode: 'Verifikacijski kod',
    back: 'Natrag',
    confirmEmail: 'Potvrdi email',
    checking: 'Provjera...',
    loginTitle: '3. Prijavi se',
    loginTitleOnly: 'Prijava',
    forgotPassword: 'Zaboravljena lozinka?',
    loggingIn: 'Prijava...',
    enterApp: 'Uđi u Ravnopar',
    noAccount: 'Nemaš račun?',
    register: 'Registriraj se',
    resetTitle: 'Reset lozinke',
    resetHint: 'Poslat ćemo kod na email ako račun postoji.',
    sendCode: 'Pošalji kod',
    sending: 'Slanje...',
    newPasswordTitle: 'Nova lozinka',
    newPassword: 'Nova lozinka',
    savePassword: 'Spremi lozinku',
    backHome: '← Natrag na početnu',
    captchaRequired: 'Potvrdi captchu prije registracije.',
    registerSuccess: 'Račun je kreiran. Unesi verifikacijski kod koji si primio/la.',
    registerFailed: 'Registracija nije uspjela. Provjeri podatke i pokušaj ponovo.',
    verifySuccess: 'Email je potvrđen. Sada se možeš prijaviti.',
    verifyFailed: 'Verifikacija nije uspjela. Provjeri kod i pokušaj ponovo.',
    loginFailed: 'Prijava nije uspjela. Provjeri email i lozinku.',
    resetSuccess: 'Lozinka promijenjena. Prijavi se.',
    resetFailed: 'Reset nije uspio.',
    checkEmail: 'Provjeri email.',
    dobInvalid: 'Odaberi valjan datum rođenja (18+).',
    dobInvalidMonth: 'Nepostojeći mjesec — upiši broj od 01 do 12.',
    dobInvalidDay: 'Dan mora biti najmanje 01.',
    dobInvalidDayForMonth: 'U tom mjesecu nema {day}. dana (maksimalno {max}).',
    dobFeb29NotLeap: '29. veljače {year}. ne postoji — ta godina nije prijestupna.',
    dobInvalidYear: 'Godina mora biti između {min} i {max}.',
    dobUnderage: 'Moraš imati najmanje 18 godina.',
    dobPlaceholder: '15.03.1985.',
    dobFormatHint: 'Jedno polje — upiši dan, mjesec i godinu (npr. 15.03.1985.).',
    dobSelected: 'Odabrano: {date}'
  },

  months: [
    'Siječanj',
    'Veljača',
    'Ožujak',
    'Travanj',
    'Svibanj',
    'Lipanj',
    'Srpanj',
    'Kolovoz',
    'Rujan',
    'Listopad',
    'Studeni',
    'Prosinac'
  ],

  countries: {
    HR: 'Hrvatska',
    SI: 'Slovenija',
    BA: 'Bosna i Hercegovina',
    RS: 'Srbija',
    ME: 'Crna Gora',
    MK: 'Sjeverna Makedonija',
    AT: 'Austrija',
    DE: 'Njemačka',
    CH: 'Švicarska',
    IT: 'Italija',
    HU: 'Mađarska',
    SK: 'Slovačka',
    CZ: 'Češka',
    PL: 'Poljska',
    GB: 'Ujedinjeno Kraljevstvo',
    IE: 'Irska',
    US: 'SAD',
    CA: 'Kanada',
    FR: 'Francuska',
    ES: 'Španjolska',
    PT: 'Portugal',
    NL: 'Nizozemska',
    BE: 'Belgija',
    LU: 'Luksemburg',
    SE: 'Švedska',
    NO: 'Norveška',
    DK: 'Danska',
    FI: 'Finska',
    GR: 'Grčka',
    RO: 'Rumunjska',
    BG: 'Bugarska',
    UA: 'Ukrajina',
    TR: 'Turska',
    AU: 'Australija',
    NZ: 'Novi Zeland'
  },

  api: {
    ADULTS_ONLY: 'Registracija je dopuštena samo punoljetnima (18+).',
    EMAIL_EXISTS: 'Email adresa je već registrirana.',
    INVALID_PAYLOAD: 'Neispravni podaci. Provjeri unos i pokušaj ponovo.',
    INVALID_CODE: 'Kod nije ispravan ili je istekao.',
    INVALID_CREDENTIALS: 'Email ili lozinka nisu ispravni.',
    EMAIL_NOT_VERIFIED: 'Email još nije potvrđen. Provjeri pristiglu poštu.',
    ACCOUNT_SUSPENDED: 'Račun je suspendiran. Kontaktiraj podršku.',
    PROFILE_NOT_FOUND: 'Profil nije pronađen.',
    CAPTCHA_FAILED: 'Captcha provjera nije uspjela.',
    CAPTCHA_REQUIRED: 'Potvrdi captchu prije nastavka.',
    INVALID_SUBMISSION: 'Neispravan zahtjev.',
    SEEKING_AGE_UNDER_MIN: 'Tražena dob ne smije biti manja od 18 godina.',
    SEEKING_AGE_OVER_MAX: 'Tražena dob ne smije biti veća od 99 godina.',
    SEEKING_AGE_INVERTED: 'Najmanja tražena dob mora biti manja ili jednaka najvećoj.'
  },

  errors: {
    generic: 'Nešto nije u redu. Pokušaj ponovo.'
  },

  identity: {
    MALE: 'Muško',
    FEMALE: 'Žensko',
    NON_BINARY: 'Nebinarno',
    OTHER: 'Drugo'
  },

  profileType: {
    INDIVIDUAL: 'Osoba',
    COUPLE: 'Par'
  },

  intent: {
    CHAT: 'Razgovor',
    CASUAL: 'Ležerno druženje',
    RELATIONSHIP: 'Veza',
    MARRIAGE: 'Brak',
    ADVENTURE: 'Avantura'
  },

  activity: {
    online: 'Online',
    today: 'Aktivan danas',
    week: 'Aktivan ovaj tjedan',
    daysAgo: 'Aktivan prije {days} dana'
  },

  tags: {
    remove: 'Ukloni',
    addCustom: 'Dodaj',
    customPlaceholder: 'Vlastiti tag (npr. planinarenje)',
    count: '{current}/{max} tagova',
    common: 'Zajedničko: {tags}',
    public: {
      READING: 'Čitanje',
      HIKING: 'Planinarenje',
      ANIMALS: 'Životinje',
      COFFEE: 'Kava',
      MUSIC: 'Glazba',
      TRAVEL: 'Putovanja',
      SPORTS: 'Sport',
      COOKING: 'Kuhanje',
      GAMING: 'Igre',
      ART: 'Umjetnost',
      NATURE: 'Priroda',
      MOVIES: 'Filmovi',
      DANCING: 'Ples',
      PHOTOGRAPHY: 'Fotografija'
    },
    private: {
      CASUAL_SEX: 'Ležerno / fizički',
      NO_RUSH_INTIMACY: 'Ne žurim s intimnošću',
      CUDDLES: 'Nježnost i mazanje',
      OPEN_MINDED: 'Otvoren/a za razgovor o željama',
      MONOGAMOUS: 'Monogamna intimnost',
      EXPLORING: 'Još istražujem što tražim',
      FRIENDSHIP_FIRST: 'Prvo prijateljstvo',
      LONG_TERM_FOCUS: 'Fokus na dugoročno'
    }
  },

  relationship: {
    SINGLE: 'Sam/a',
    OPEN: 'U vezi (otvoren/a za upoznavanje)',
    COMPLICATED: 'Komplicirano'
  },

  children: {
    NONE: 'Nemam djece',
    HAS: 'Imam djecu',
    WANTS_SOMEDAY: 'Želim djecu jednog dana',
    NOT_IMPORTANT: 'Nije mi bitno'
  },

  smoking: {
    NO: 'Nepušač',
    SOMETIMES: 'Povremeno pušim',
    YES: 'Pušač'
  },

  availability: {
    AVAILABLE: 'Dostupan/na',
    FOCUSED_CONTACT: 'U razgovoru',
    PAUSED: 'Pauzirano'
  },

  role: {
    USER: 'Korisnik',
    ADMIN: 'Administrator'
  },

  planTier: {
    free: 'Besplatno',
    plus: 'Plus',
    supporter: 'Supporter'
  },

  reportStatus: {
    OPEN: 'Otvoreno',
    IN_REVIEW: 'U pregledu',
    RESOLVED: 'Riješeno',
    DISMISSED: 'Odbijeno'
  },

  auditCategory: {
    ADMIN_ACTION: 'Admin',
    MODERATION: 'Moderacija',
    SECURITY: 'Sigurnost',
    FEED_RANKING: 'Feed rang',
    COMPLIANCE: 'Compliance'
  },

  auditAction: {
    SUSPEND: 'Suspend',
    UNSUSPEND: 'Unsuspend',
    DELETE_USER: 'Brisanje',
    PLAN_CHANGE: 'Paket',
    ROLE_CHANGE: 'Uloga',
    VERIFY_PHOTO: 'Verifikacija',
    UNVERIFY_PHOTO: 'Ukloni verifikaciju',
    VERIFY_REJECT: 'Odbij selfie',
    AVAILABILITY_CHANGE: 'Status',
    ONBOARDING_CHANGE: 'Onboarding',
    REPORT_RESOLVED: 'Prijava riješena',
    BLOCK: 'Blok',
    REPORT: 'Prijava',
    FEED_SNAPSHOT: 'Feed snapshot',
    DATA_EXPORT: 'Export podataka',
    ACCOUNT_DELETE_SELF: 'Brisanje računa',
    ACCOUNT_DELETE: 'Brisanje računa',
    ADMIN_USER_SEARCH: 'Admin pretraga'
  },

  moderationAction: {
    NONE: 'Bez akcije',
    WARN: 'Upozorenje',
    SUSPEND: 'Suspend',
    DELETE: 'Brisanje'
  },

  common: {
    back: 'Natrag',
    backHome: '← Natrag na početnu',
    backToApp: '← Moj prostor',
    loading: 'Učitavanje...',
    saving: 'Spremanje...',
    save: 'Spremi',
    remove: 'Ukloni',
    copy: 'Kopiraj',
    copied: 'Kopirano',
    user: 'Korisnik',
    yearsShort: 'god.',
    question: 'Pitanje',
    answer: 'Odgovor',
    yes: 'Da',
    no: 'Ne',
    close: 'Zatvori',
    refresh: 'Osvježi',
    confirm: 'Potvrdi',
    cancel: 'Odustani',
    unreadCount: '{count} novo',
    percent: '{percent}%',
    photoCount: '{current}/{max}'
  },

  meta: {
    defaultTitle: 'Ravnopar',
    defaultDescription:
      'Ravnopar — fer dating platforma za Hrvatsku. Bez paywalla za razgovor, s chatom nakon matcha i transparentnim pravilima.',
    titles: {
      home: 'Početna',
      auth: 'Prijava i registracija',
      settings: 'Postavke',
      app: 'Moj prostor',
      chat: 'Razgovor',
      profile: 'Profil',
      onboarding: 'Dobrodošao/la',
      donate: 'Podrži projekt',
      plans: 'Planovi',
      faq: 'Pomoć i FAQ',
      guidelines: 'Pravila zajednice',
      privacy: 'Politika privatnosti',
      terms: 'Uvjeti korištenja',
      contact: 'Kontakt',
      admin: 'Admin'
    },
    descriptions: {
      home:
        'Ravnopar — fer dating platforma za Hrvatsku. Bez paywalla za razgovor, s chatom nakon matcha i transparentnim pravilima.',
      auth: 'Registracija i prijava na Ravnopar — fer platformu za upoznavanje.',
      settings: 'Uredi profil, fotografije, obavijesti i privatnost.',
      app: 'Tvoj feed, zahtjevi za kontakt i razgovori na Ravnoparu.',
      chat: 'Privatni razgovor nakon obostranog kontakta.',
      profile: 'Javni profil korisnika na Ravnoparu.',
      onboarding: 'Brzi vodič kroz Ravnopar.',
      donate: 'Dobrovoljna podrška održavanju Ravnopara.',
      plans:
        'Transparentan model naplate Ravnopara — besplatan chat, premium paketi unaprijed pripremljeni.',
      faq: 'Česta pitanja o Ravnoparu — besplatno korištenje, match, chat, sigurnost i postavke.',
      guidelines: 'Što je dozvoljeno, što nije i kako ostati siguran/na na Ravnoparu.',
      privacy: 'Kako Ravnopar prikuplja, koristi i štiti tvoje podatke.',
      terms: 'Pravila korištenja Ravnopar platforme.',
      contact: 'Kontaktiraj Ravnopar tim za podršku, privatnost i prijave.',
      admin: 'Ravnopar admin centar.'
    }
  },

  footer: {
    plans: 'Planovi',
    help: 'Pomoć',
    guidelines: 'Pravila',
    privacy: 'Privatnost',
    terms: 'Uvjeti',
    contact: 'Kontakt',
    donate: 'Podrži projekt',
    settings: 'Postavke',
    copyright: '© {year} Ravnopar · 18+ · Fer upoznavanje',
    navLabel: 'Podnožje',
    mobileDockLabel: 'Brza navigacija',
    mySpace: 'Moj prostor'
  },

  cookie: {
    ariaLabel: 'Kolačići',
    message:
      'Koristimo nužne kolačiće za prijavu i analitiku samo ako je uključena. Više u',
    privacyLink: 'politici privatnosti',
    accept: 'Razumijem'
  },

  theme: {
    toggle: 'Promijeni temu'
  },

  gallery: {
    prev: 'Prethodna',
    next: 'Sljedeća'
  },

  video: {
    embedTitle: 'Video profil',
    externalLink: 'Pogledaj video profil'
  },

  avatar: {
    alt: 'Profilna fotografija: {name}'
  },

  home: {
    donateThanks: 'Hvala na donaciji! Tvoja podrška pomaže održavanju Ravnopara.',
    eyebrow: 'Dating bez manipulacije dosega',
    title: 'Ravnopar',
    lead:
      'Fer platforma za upoznavanje: profili s fotografijom, chat nakon matcha i pravila koja su jasna unaprijed.',
    communityCount: '{count}+ dostupno u zajednici',
    contacts30d: '{count} kontakata (30 dana)',
    activeCities: 'Aktivno: {cities}',
    ctaStart: 'Kreni',
    ctaLogin: 'Već imam račun',
    chipNoPaywall: 'Bez skrivanja dosega',
    chipChatAfterMatch: 'Chat nakon matcha',
    chipAntiSpam: 'Zaštita od spama',
    showcaseEyebrow: 'Pregled iskustva',
    showcaseTitle: 'Upoznaj ljude kao u dating appu — bez paywalla',
    showcaseText:
      'Swipe kartice, galerija fotografija i chat nakon matcha. Fer pravila ostaju ista.',
    showcaseMockName: 'Maja, 28 · Zagreb',
    showcaseMockBio: 'Volim kavu, planinarenje i fer razgovor.',
    howItWorks: 'Kako funkcionira',
    steps: [
      {
        title: 'Registriraj se',
        text: 'Napravi profil, dodaj fotografiju i bio, odaberi koga tražiš.'
      },
      {
        title: 'Upoznaj ljude',
        text: 'Pregledaj feed dostupnih profila bez skrivenog smanjenja dosega.'
      },
      {
        title: 'Razgovaraj fer',
        text: 'Kad se uspostavi obostrani kontakt, otvori chat i razgovaraj u aplikaciji.'
      }
    ],
    safetyTitle: 'Sigurnost i zajednica',
    safetyItems: [
      {
        icon: '🛡️',
        title: 'Blokiraj i prijavi',
        text: 'Neugodan profil možeš blokirati ili prijaviti admin timu.'
      },
      {
        icon: '✉️',
        title: 'Verificiran email',
        text: 'Registracija zahtijeva potvrdu emaila — manje lažnih profila.'
      },
      {
        icon: '🤝',
        title: 'Pravila zajednice',
        text: 'Jasna pravila ponašanja i poštivanje granica drugih korisnika.'
      },
      {
        icon: '⏸️',
        title: 'Kontrola vidljivosti',
        text: 'Pauziraj profil ili obriši račun kad god želiš — u Postavkama.'
      }
    ],
    safetyLink: 'Pročitaj pravila zajednice →',
    whyTitle: 'Zašto Ravnopar',
    values: [
      {
        title: 'Bez paywalla za razgovor',
        text: 'Osnovna komunikacija je dostupna svima — bez umjetnih barijera.'
      },
      {
        title: 'Poštena vidljivost',
        text: 'Aktivni parovi privremeno izlaze iz feeda kako bi ostali dobili priliku.'
      },
      {
        title: 'Zaštita i kontrola',
        text: 'Blokiranje, prijave i anti-spam limiti čuvaju kvalitetu zajednice.'
      }
    ],
    pricingTitle: 'Model naplate',
    pricingEyebrow: 'Bez iznenađenja',
    pricingLead:
      'Ravnopar je besplatan za razgovor — i to ostaje temelj. Premium će doći tek kad platforma bude stabilna, a ti ćeš znati unaprijed.',
    pricingChipNoPaywall: '♥ Bez paywalla',
    pricingChipFair: 'Fer vidljivost',
    pricingLink: 'Pročitaj model naplate',
    faqTitle: 'Pitanja?',
    faqLead:
      'Kako radi match, chat, pauza profila i email obavijesti — sve na jednom mjestu.',
    faqLink: 'Pomoć i FAQ',
    ctaTitle: 'Spreman/na za fer upoznavanje?',
    ctaSubtitle: 'Registracija traje nekoliko minuta. Potrebno je imati 18+ godina.',
    ctaFree: 'Kreni besplatno'
  },

  settings: {
    loading: 'Učitavanje postavki...',
    backToApp: '← Moj prostor',
    title: 'Postavke profila',
    subtitle: 'Popunjenost: {percent}% · Status: {status}',
    photos: 'Fotografije',
    photosHint: 'JPG/PNG, automatski smanjeno. Maks. 3 fotografije.',
    displayName: 'Ime za prikaz',
    city: 'Grad',
    bio: 'O meni (bio)',
    bioPlaceholder: 'Kratko se predstavi — što tražiš, što voliš...',
    publicTagsLegend: 'Interesi i hobiji (javno)',
    publicTagsHint: 'Do 5 tagova — vidljivo na profilu i u feedu. Pomaže drugima da vide što voliš (čitanje, životinje, sport…).',
    privateTagsLegend: 'Intimne preference (privatno)',
    privateTagsHint:
      'Do 5 tagova — vidljivo tek nakon prihvaćenog kontakta. Jasno označava što tražiš u intimnom smislu (npr. ležerno, bez žurbe).',
    lifestyleLegend: 'Životni detalji (opcionalno)',
    lifestyleHint:
      'Pomaže drugima da razumiju kontekst — nije filter u pretrazi, ali daje mali bonus u feedu kad se vrijednosti podudaraju.',
    childrenLabel: 'Djeca',
    smokingLabel: 'Pušenje',
    relationshipLabel: 'Status',
    lifestyleUnset: '— ne želim navesti',
    icebreakersLegend: 'Icebreaker pitanja (do 3)',
    icebreakersHint: 'Kratka pitanja i odgovori — pomažu pri prvom kontaktu.',
    addIcebreaker: 'Dodaj icebreaker',
    preferencesLegend: 'Preference upoznavanja',
    preferencesHint: 'Određuju koje profile vidiš u feedu — uz identitet, namjeru i kompatibilnost.',
    seekingAgeMin: 'Tražim dob od',
    seekingAgeMax: 'do',
    seekingAgeHint: 'Obostrano — i drugi moraju tražiti tvoju dob. Minimalno 18 godina.',
    seekingAgeUnder18: 'Tražena dob ne smije biti manja od 18 godina.',
    ageRangeInvalid: 'Najmanja tražena dob mora biti manja ili jednaka najvećoj.',
    seekingAgeOver99: 'Tražena dob ne smije biti veća od 99 godina.',
    maxDistanceLabel: 'Maksimalna udaljenost',
    distanceUnlimited: 'Bez ograničenja',
    distanceKmOption: 'Do {km} km',
    maxDistanceHint:
      'Za filtriranje po udaljenosti uključi lokaciju u odjeljku ispod. Profili bez lokacije se i dalje mogu pojaviti.',
    sameCountryOnly: 'Samo profili iz moje države',
    sameCountryHint: 'Kad je uključeno, vidiš samo korisnike iz iste države kao na tvom profilu.',
    profileTypeLegend: 'Tip profila',
    seekingProfileTypeLegend: 'Tražim tip profila',
    locationLegend: 'Udaljenost (privatno)',
    locationHint:
      'Koordinate se ne prikazuju drugima — samo gruba udaljenost (npr. „5–15 km"). Oboje mora uključiti opciju.',
    shareLocation: 'Prikaži udaljenost od mene drugim korisnicima',
    loadLocation: 'Učitaj moju lokaciju',
    locationSaved: 'Lokacija spremljena',
    videoLegend: 'Video profil (link)',
    videoPlaceholder: 'YouTube, Vimeo, Instagram ili TikTok link',
    videoUrlPlaceholder: 'https://youtube.com/...',
    verificationLegend: 'Verifikacija profila',
    verificationHint:
      'Selfie za ručnu provjeru admin tima — usporedba s profilnom fotkom. Nije javno vidljivo.',
    verified: 'Profil verificiran',
    verificationPending: 'Selfie je na provjeri — obavijest stiže nakon pregleda.',
    verificationSelfie: 'Verifikacijski selfie',
    identityLegend: 'Identitet',
    seekingIdentityLegend: 'Tražim identitet',
    intentLegend: 'Namjera',
    availabilityLabel: 'Vidljivost profila',
    availabilityAvailable: 'Dostupan/na u feedu',
    availabilityPaused: 'Pauzirano (skriven/a)',
    availabilityFocused: 'U aktivnom razgovoru',
    notifyEmail: 'Email obavijesti (novi zahtjevi, match, poruke)',
    saveProfile: 'Spremi profil',
    premiumTitle: 'Premium paketi',
    premiumHint: 'Checkout je spreman — aktivacija paketa nakon uplate.',
    gdprTitle: 'Privatnost (GDPR)',
    gdprHint: 'Preuzmi kopiju svojih podataka u JSON formatu.',
    exportData: 'Preuzmi moje podatke',
    dangerTitle: 'Opasna zona',
    dangerHint: 'Brisanje računa uklanja profil, poruke i povijest kontakata.',
    deleteAccount: 'Obriši račun',
    photoAdded: 'Fotografija dodana — klikni Spremi profil.',
    photoUploadFailed: 'Upload fotografije nije uspio.',
    exportDone: 'Izvoz podataka preuzet.',
    exportFailed: 'Izvoz nije uspio.',
    selfieAdded: 'Selfie dodan — spremi profil za slanje na provjeru.',
    selfieFailed: 'Selfie nije uspio.',
    geolocationUnsupported: 'Preglednik ne podržava geolokaciju.',
    locationLoaded: 'Lokacija učitana. Spremi profil.',
    locationFailed: 'Lokacija nije dostupna. Provjeri dozvole preglednika.',
    locationRequired: 'Uključi lokaciju gumbom „Učitaj moju lokaciju" prije spremanja.',
    profileSaved: 'Profil je spremljen.',
    saveFailed: 'Spremanje nije uspjelo.',
    deleteConfirm: 'Trajno obrisati račun? Ova radnja se ne može poništiti.',
    deleteFailed: 'Brisanje računa nije uspjelo.',
    planSuccess: 'Uplata zaprimljena. Premium aktivacija slijedi nakon provjere.',
    checkoutFailed: 'Premium checkout nije dostupan.'
  },

  dashboard: {
    greeting: 'Pozdrav, {name}',
    subtitle: 'Swipeaj profile ili koristi gumbe — jedan po jedan, bez žurbe.',
    feedCount: '{count} profila u tvom feedu',
    feedEmpty: 'Trenutno nema kompatibilnih profila u tvom feedu.',
    settingsLink: 'Postavke profila',
    loading: 'Učitavanje...',
    incompleteTitle: 'Profil ti još nije kompletan ({percent}%).',
    incompleteHint: 'Dodaj fotografiju, bio i icebreaker — to povećava šanse za kontakt.',
    completeProfile: 'Dovrši profil',
    conversations: 'Razgovori',
    conversationsUnread: 'Razgovori ({count} novo)',
    openChat: 'Otvori chat',
    policyTitle: 'Uz preference',
    policyNarrowAge: 'Dobni raspon je vrlo uzak — razmisli o širem rasponu za više prilika.',
    policySameCountry: 'Filtriraš samo svoju državu — to značajno smanjuje broj profila.',
    policySmallDistance: 'Mala udaljenost ({km} km) može ograničiti broj profila u feedu.',
    policyDistanceNoLocation:
      'Postavio/la si maks. udaljenost, ali lokacija nije uključena — filtar neće raditi dok je ne učitaš u Postavkama.',
    statusTitle: 'Tvoj status',
    availability: 'Dostupnost',
    completeness: 'Popunjenost',
    rating: 'Prosječna ocjena',
    activeContact: 'Trenutno razgovaraš s {name}.',
    openChatBtn: 'Otvori chat',
    closeContact: 'Završi razgovor',
    visibleInFeed: 'Vidljiv/a si u feedu — swipeaj profile ispod.',
    incomingTitle: 'Zahtjevi za kontakt',
    accept: 'Prihvati',
    decline: 'Odbij',
    discoverTitle: 'Otkrij profile',
    discoverCount: ' · {count} za tebe',
    gateTitle: 'Profil nije spreman za feed',
    gateHint: 'Dodaj fotografiju i bio (min. 10 znakova) prije slanja zahtjeva i swipea.',
    gateOnboarding: 'Pogledaj uvod',
    emptyTitle: 'Nema novih profila',
    emptyHint:
      'Proširi grad ili preference u Postavkama — ili se vrati uskoro kad se netko novi registrira.',
    expandPreferences: 'Proširi preference',
    seenAllTitle: 'Pregledao/la si sve',
    seenAllHint: 'Vrati se kasnije — novi profili se pojavljuju redovito.',
    seenAllAgain: 'Pogledaj ponovo',
    feedCounter: '{current} / {total}',
    contactSent: 'Zahtjev za kontakt je poslan.',
    contactSentWarning: 'Zahtjev poslan. {warning}',
    contactFailed: 'Slanje zahtjeva nije uspjelo.',
    blocked: 'Korisnik je blokiran.',
    blockFailed: 'Blokiranje nije uspjelo.',
    reported: 'Prijava je zaprimljena. Hvala.',
    reportFailed: 'Prijava nije uspjela.',
    accepted: 'Kontakt je prihvaćen.',
    declined: 'Zahtjev je odbijen.',
    respondFailed: 'Odgovor nije spremljen.',
    closed: 'Kontakt zatvoren. Ponovno si dostupan/na u feedu.',
    closeFailed: 'Zatvaranje nije uspjelo.',
    reportReason: 'Neprimjereno ponašanje',
    reportNote: 'Prijava iz korisničkog sučelja.',
    blockReason: 'Korisnička preferenca',
    closeReason: 'Korisnik je zatvorio kontakt'
  },

  chat: {
    backToApp: '← Moj prostor',
    title: 'Razgovor',
    loading: 'Učitavanje...',
    unavailable: 'Chat nije dostupan.',
    empty: 'Pošalji prvu poruku — možeš i icebreaker s profila.',
    read: 'Pročitano',
    react: 'Reagiraj',
    typing: 'Piše…',
    placeholder: 'Napiši poruku...',
    send: 'Pošalji',
    sending: 'Slanje...',
    back: 'Natrag',
    sendFailed: 'Slanje poruke nije uspjelo.'
  },

  profile: {
    back: '← Natrag',
    loading: 'Učitavanje...',
    unavailable: 'Profil nije dostupan.',
    verified: 'Verificiran profil',
    supporter: 'Supporter',
    video: 'Video',
    seeking: 'Traži:',
    interests: 'Interesi',
    lifestyle: 'Životni detalji',
    privatePreferences: 'Intimne preference',
    privateLocked: 'Intimne preference vidljive su tek nakon prihvaćenog kontakta.',
    noPrivateTags: 'Nema privatnih tagova — dodaj ih u Postavkama.',
    sendRequest: 'Pošalji zahtjev',
    report: 'Prijavi',
    block: 'Blokiraj',
    requestSent: 'Zahtjev poslan.',
    requestFailed: 'Slanje nije uspjelo.',
    reportDone: 'Prijava zaprimljena.',
    reportFailed: 'Prijava nije uspjela.',
    reportReason: 'Neprimjereno ponašanje',
    reportNote: 'Prijava s profila.',
    blockReason: 'Korisnička preferenca'
  },

  onboarding: {
    eyebrow: 'Dobrodošao/la',
    title: 'Profil koji privlači pažnju',
    lead:
      'Prije nego kreneš u feed, dodaj fotografiju i kratki opis — to je obavezno za slanje zahtjeva.',
    stepPhoto: '1. Fotografija',
    stepPhotoHint: 'Profili s fotkom dobivaju više odgovora.',
    changePhoto: 'Promijeni fotku',
    addPhoto: 'Dodaj fotografiju',
    stepBio: '2. Bio (min. 10 znakova)',
    stepBioHint: 'Kratko reci tko si i što tražiš.',
    editBio: 'Uredi bio',
    writeBio: 'Napiši bio',
    stepFeed: '3. Feed',
    stepFeedHint: 'Kad profil bude spreman, swipeaj i pošalji prvi zahtjev.',
    finishReady: 'Završi uvod i otvori feed',
    finishIncomplete: 'Dovrši profil u Postavkama',
    finishHint: 'Prvo dovrši fotografiju i bio',
    incompleteError: 'Dodaj fotografiju i bio (min. 10 znakova) u Postavkama prije nastavka.',
    saveFailed: 'Spremanje nije uspjelo.'
  },

  match: {
    eyebrow: 'Obostrani kontakt',
    title: 'Imate match!',
    lead: 'Ti i {partner} ste spremni za razgovor.',
    startChat: 'Počni razgovor',
    backToApp: 'Natrag u app',
    continueBrowsing: 'Nastavi pregled'
  },

  donate: {
    backToApp: '← Natrag na Moj prostor',
    pricingLink: 'Model naplate',
    eyebrow: 'Zahvaljujemo se',
    title: 'Podrži projekt',
    lead:
      'Ravnopar održavamo s puno truda i malo budžeta. Ako ti platforma znači, možeš dobrovoljno pomoći — bez pritiska i bez dodatnih funkcija u zamjenu.',
    sectionEyebrow: 'Podrška projektu',
    sectionTitle: 'Podrži Ravnopar',
    sectionLead:
      'Ako ti platforma pomogne u upoznavanju, možeš dobrovoljno pomoći s troškovima servera. Svaka kuna (ili euro) stvarno pomaže — a ti ne dobivaš nikakvu prednost u feedu.',
    note: 'Donacija je potpuno dobrovoljna. Hvala ti što razmišljaš o tome. ♥',
    revolutTitle: 'Kartica (Revolut)',
    revolutHint: 'Brza uplata karticom — otvara se sigurna Revolut stranica.',
    revolutBtn: 'Doniraj karticom',
    stripeTitle: 'Kartica (Stripe)',
    stripeRedirecting: 'Preusmjeravanje...',
    stripeFailed: 'Plaćanje karticom trenutno nije dostupno.',
    stripeNote: 'Plaćanje obrađuje Stripe.',
    bankTitle: 'Bankovna uplata',
    recipient: 'Primatelj',
    iban: 'IBAN',
    reference: 'Poziv na broj / opis',
    copyIban: 'Kopiraj IBAN',
    copyRef: 'Kopiraj',
    defaultReference: 'Ravnopar donacija'
  },

  invite: {
    title: 'Pozovi prijatelja',
    hint: 'Podijeli link — besplatno je, bez nagrada za sada, ali pomaže maloj zajednici da raste.',
    invitedCount: 'Pozvanih registracija:',
    copyLink: 'Kopiraj link',
    yourCode: 'Tvoj kod:'
  },

  swipe: {
    stampLike: 'Zanimljivo',
    stampPass: 'Preskoči',
    sameCity: 'Isti grad',
    seeking: 'Traži:',
    awaitingContact: 'Čeka kontakt',
    multiPhotos: '{count} fotografije',
    fullProfile: 'Potpun profil',
    report: 'Prijavi',
    block: 'Blokiraj',
    ariaPass: 'Preskoči',
    ariaLike: 'Pošalji zahtjev'
  },

  pricing: {
    heroEyebrow: 'Fer i otvoreno',
    heroTitle: 'Planovi s ljudskim licem',
    heroLead:
      'Ravnopar nije tu da te iscijedi novcem prije prvog razgovora. Ovdje pišemo kako platforma danas radi — i kako će raditi kad porastemo, bez iznenađenja.',
    heroChipChat: '♥ Besplatan razgovor',
    heroChipFair: 'Bez skrivenog dosega',
    heroChipNotice: 'Obavijest 30 dana unaprijed',
    ctaTitle: 'Spreman/na za fer upoznavanje?',
    ctaLead: 'Registracija je besplatna. Ako ti se sviđa pristup — dobrodošao/la si u zajednicu.',
    ctaStart: 'Kreni besplatno',
    ctaBack: 'Natrag na početnu',
    supportEyebrow: 'Dobrovoljno',
    supportTitle: 'Dobrovoljna podrška',
    supportLead:
      'Ako ti se sviđa pristup Ravnopara, možeš dobrovoljno pomoći s troškovima održavanja — bez ikakve prednosti u feedu.',
    supportRevolutBtn: 'Podrži na Revolutu',
    supportAppLink: 'Sve opcije plaćanja',
    policyEyebrow: 'Transparentno unaprijed',
    policy: {
      headline: 'Novac ne smije stajati između ljudi',
      lead:
        'Ravnopar je danas besplatan za upoznavanje — i to nam je namjera. Nećemo uvesti naplatu dok proizvod nije stabilan i dok zajednica stvarno živi na platformi.',
      promisesIntro: 'Na ovo možeš računati — danas i kad uvedemo Premium:',
      triggersIntro:
        'Ne žurimo s naplatom. Premium pakete uključujemo tek kad sve sljedeće ima smisla:',
      footnote:
        'Kad dođe taj trenutak, uključit ćemo pakete ispod. Cijene su orientacijske; prije lansiranja ćemo ih potvrditi i obavijestiti te najmanje 30 dana unaprijed.'
    },
    promises: [
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
    ],
    triggers: [
      { icon: '🛠️', text: 'Proizvod radi stabilno, bez stalnih prekida' },
      { icon: '👥', text: 'Dovoljno ljudi aktivno koristi Ravnopar svaki mjesec' },
      { icon: '💌', text: 'Značajan broj korisnika stvarno šalje ili prihvaća kontakte' },
      { icon: '🌱', text: 'Troškovi servera koje donacije dugoročno ne pokrivaju' }
    ],
    values: [
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
    ],
    founderNote: {
      quote:
        'Nismo napravili Ravnopar da te tjera na pretplatu prije nego što upoznaš ikoga. Ako jednog dana uvedemo Premium, to će biti zato što platforma raste i treba održavanje — ne zato što ti treba platiti da bi te netko uopće vidio.',
      signature: 'Hvala što si ovdje. — tim iza Ravnopara'
    },
    valuesAriaLabel: 'Vrijednosti Ravnopara',
    plansEyebrow: 'Paketi',
    plansTitle: 'Odaberi svoj ritam — bez pritiska',
    plansLead:
      'Besplatni paket pokriva sve bitno. Premium opcije su već pripremljene, ali namjerno isključene dok zajednica ne bude spremna.',
    planStatusActive: 'Aktivan',
    planStatusSoon: 'Uskoro',
    planStatusDisabled: 'U pripremi',
    planBtnIncluded: 'Uključeno u aplikaciji',
    planBtnSoon: 'Uskoro dostupno',
    planBtnDisabled: 'Još nije dostupno',
    planDisabledTitle:
      'Paket još nije dostupan. Obavijestit ćemo unaprijed prije uvođenja naplate.',
    planHintCheckout:
      'Premium checkout dostupan u Postavkama nakon prijave.',
    planHintLater:
      'Aktiviramo kad proizvod i zajednica budu spremni — obavijest stiže unaprijed.',
    freePrice: '0 €',
    plans: [
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
    ]
  },

  faq: {
    title: 'Pomoć i FAQ',
    subtitle: 'Odgovori na najčešća pitanja o Ravnoparu.',
    backHome: '← Natrag na početnu',
    contact: 'Kontakt',
    items: [
      {
        q: 'Je li Ravnopar besplatan?',
        a: 'Da — slanje zahtjeva, prihvaćanje kontakta i razgovor u aplikaciji su besplatni. Donacije su dobrovoljne i ne daju prednost u feedu.'
      },
      {
        q: 'Kako funkcionira match?',
        a: 'Pregledaš profile u feedu i šalješ zahtjev za kontakt. Ako druga strana prihvati, otvara se privatni chat i oboje ste privremeno fokusirani na razgovor.'
      },
      {
        q: 'Što se događa nakon prihvaćenog kontakta?',
        a: 'Možeš otvoriti chat s osobom i razgovarati u aplikaciji. Aktivni parovi privremeno izlaze iz feeda kako bi ostali imali priliku.'
      },
      {
        q: 'Hoćete li naplaćivati razgovor?',
        a: 'Ne. Osnovna komunikacija ostaje besplatna. Premium paketi (kad budu dostupni) bit će samo opcionalni dodaci — obavijest unaprijed.'
      },
      {
        q: 'Kako mogu pauzirati ili obrisati profil?',
        a: 'U Postavkama možeš pauzirati vidljivost ili trajno obrisati račun. Brisanje je nepovratno.'
      },
      {
        q: 'Kako prijaviti neprimjereno ponašanje?',
        a: 'Na profilu koristi gumb Prijavi. Admin tim pregledava prijave i može poduzeti mjere.'
      },
      {
        q: 'Primam li email obavijesti?',
        a: 'Možeš uključiti obavijesti za nove zahtjeve, prihvaćene kontakte i poruke. U Postavkama možeš isključiti email obavijesti.'
      },
      {
        q: 'Tko može koristiti Ravnopar?',
        a: 'Odrasli (18+) s verificiranim emailom. Poštuj pravila zajednice i granice drugih korisnika.'
      }
    ]
  },

  contact: {
    title: 'Kontakt',
    subtitle: 'Tu smo za pitanja, prijave i zahtjeve vezane uz privatnost.',
    emailTitle: 'Email',
    emailHint: 'Odgovaramo u razumnom roku — obično unutar nekoliko radnih dana.',
    emergencyTitle: 'Hitne situacije',
    emergencyHint:
      'Ravnopar nije hitna služba. U opasnosti kontaktiraj lokalnu policiju ili hitnu pomoć (112).',
    faqLink: 'FAQ',
    homeLink: 'Početna'
  },

  legal: {
    back: '← Natrag',
    disclaimer:
      'Ovi tekstovi su informativni predlošci za platformu Ravnopar. Prije službenog lansiranja preporučujemo pregled od strane pravnika upoznatog s GDPR-om i zakonodavstvom RH/EU. Zadnja izmjena: lipanj 2026.',
    privacy: {
      title: 'Politika privatnosti',
      description: 'Kako Ravnopar prikuplja, koristi i štiti tvoje podatke.',
      sections: [
        {
          title: 'Voditelj obrade i kontakt',
          body: 'Ravnopar je platforma za fer upoznavanje namijenjena punoljetnim korisnicima (18+). Za pitanja o privatnosti piši na {email}.'
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
            'Dijeljenje lokacije je opcionalno i isključeno by default. Ako ga uključiš, koordinate služe isključivo za izračun grube udaljenosti (npr. „5–15 km") — točne koordinate ne prikazujemo drugim korisnicima niti na karti. Lokaciju možeš isključiti u Postavkama; tada se koordinate brišu pri sljedećem spremanju profila.'
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
      ]
    },
    terms: {
      title: 'Uvjeti korištenja',
      description: 'Pravila korištenja Ravnopar platforme.',
      sections: [
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
            'Uslugu pružamo „kakva jest". Mogući su prekidi zbog održavanja, hostinga ili više sile. Preporučujemo redovito spremanje važnih podataka (GDPR export u Postavkama).'
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
      ]
    },
    guidelines: {
      title: 'Pravila zajednice',
      description: 'Što je dozvoljeno, što nije i kako ostati siguran/na na Ravnoparu.',
      sections: [
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
          body: 'Badge „Verificiran profil" dodjeljuje admin nakon usporedbe selfija s profilnom fotkom. Nije garancija identiteta, ali pomaže povjerenju.'
        }
      ]
    }
  },

  admin: {
    title: 'Admin centar',
    subtitle: 'Korisnici, moderacija, plaćanja i poštenost platforme.',
    loggedInAs: 'Prijavljen kao',
    stats: {
      totalProfiles: 'Ukupno profila',
      available: 'Dostupni',
      focused: 'U razgovoru',
      paused: 'Pauzirani',
      suspended: 'Suspendirani',
      openReports: 'Otvorene prijave',
      pendingContacts: 'Pending kontakti',
      matches30d: 'Match (30d)',
      messages7d: 'Poruke (7d)'
    },
    quickActions: 'Brze akcije',
    inactivityThreshold: 'Prag neaktivnosti (h)',
    dailyContactLimit: 'Dnevni limit kontakata',
    closeInactive: 'Zatvori neaktivne parove',
    saveLimit: 'Spremi limit',
    refreshAll: 'Osvježi sve',
    verificationTitle: 'Verifikacija profila ({count})',
    profilePhoto: 'Profilna',
    noPhoto: 'Nema fotke',
    selfie: 'Selfie',
    approve: 'Odobri',
    reject: 'Odbij',
    usersTitle: 'Korisnici',
    searchPlaceholder: 'Pretraži ime, email, grad...',
    search: 'Pretraži',
    tableName: 'Ime',
    tableEmail: 'Email',
    tableCity: 'Grad',
    tableRole: 'Uloga',
    tablePlan: 'Paket',
    tableStatus: 'Status',
    tableActions: 'Akcije',
    planFor: 'Paket za {name}',
    suspended: 'Suspendiran',
    verify: 'Verificiraj',
    unsuspend: 'Unsuspend',
    suspend: 'Suspend',
    removeAdmin: 'Ukloni admin',
    setAdmin: 'Postavi admin',
    delete: 'Obriši',
    cannotRemoveOwnAdmin: 'Ne možeš ukloniti vlastitu admin ulogu',
    cannotDeleteSelf: 'Ne možeš obrisati vlastiti račun',
    cannotDeleteAdmin: 'Admin računi se ne brišu iz panela',
    deleteUserTitle: 'Trajno obriši korisnika',
    deleteConfirm: 'Trajno obrisati korisnika {name} ({email})?\n\nOva radnja se ne može poništiti.',
    moderationTitle: 'Moderacija',
    reportedBy: 'Prijavio/la:',
    paymentsTitle: 'Plaćanja',
    riskTitle: 'Rizični profili',
    riskScore: 'Rizik:',
    userUpdated: 'Korisnik ažuriran.',
    updateFailed: 'Ažuriranje nije uspjelo.',
    userDeleted: 'Korisnik obrisan.',
    deleteFailed: 'Brisanje nije uspjelo.',
    sweepSuccess: 'Zatvoreno parova: {count}.',
    sweepFailed: 'Neuspjeh.',
    limitSaved: 'Limit spremljen.',
    reportResolved: 'Prijava obrađena i zapisana u audit.',
    reportFailed: 'Obrada prijave nije uspjela.',
    deleteReportedConfirm: 'Trajno obrisati prijavljenog korisnika?',
    suspendReportedConfirm: 'Suspendirati prijavljenog korisnika?',
    selfieRejected: 'Selfie odbijen.'
  },

  audit: {
    title: 'Revizija i audit',
    tabs: {
      timeline: 'Dnevnik',
      moderation: 'Moderacija',
      fairness: 'Poštenost',
      feed: 'Feed rang',
      compliance: 'Compliance'
    },
    allCategories: 'Sve kategorije',
    categoryAdmin: 'Admin akcije',
    categoryModeration: 'Moderacija',
    categorySecurity: 'Sigurnost',
    categoryFeed: 'Feed rang',
    categoryCompliance: 'Compliance',
    refresh: 'Osvježi',
    noEvents: 'Nema zapisa.',
    actor: 'Od:',
    target: 'Na:',
    moderationHint: 'Povijest odluka o prijavama — tko je riješio, koja akcija, suspend/brisanje.',
    noDecisions: 'Još nema odluka.',
    resolvedBy: 'Riješio/la:',
    byCity: 'Po gradu (dostupni)',
    byIdentity: 'Po identitetu',
    newUsers: 'Novi korisnici',
    newUsersStats: '7d: {last7d} · 30d: {last30d} · bez kontakta (7d): {withoutIncoming7d}',
    metrics:
      'Bez dolaznih (7d): {withoutIncoming} · Pending: {pending} · Accepted: {accepted}',
    feedHint: 'Zašto je profil X iznad Y — transparentno objašnjenje rangiranja (paket ne daje bodove).',
    feedViewer: 'Korisnik čiji feed',
    selectUser: 'Odaberi korisnika…',
    showRanking: 'Prikaži rang',
    feedExplainFailed: 'Feed explain nije dostupan.',
    tableRank: '#',
    tableProfile: 'Profil',
    tableCity: 'Grad',
    tableScore: 'Bodovi',
    tableFactors: 'Faktori',
    retentionDays: 'Zadržavanje audit zapisa: {days} dana',
    resolveOutcome: 'Ishod',
    resolveAction: 'Akcija',
    resolveNotes: 'Bilješka (opcionalno)',
    resolveSubmit: 'Riješi i zapiši',
    outcomeResolved: 'Riješeno',
    outcomeDismissed: 'Odbijeno',
    actionNone: 'Bez akcije',
    actionWarn: 'Upozorenje',
    actionSuspend: 'Suspend',
    actionDelete: 'Obriši korisnika'
  },

  icebreakers: {
    prompts: [
      'Omiljena kava u tvom gradu?',
      'Idealni vikend izgleda ovako…',
      'Nešto što me odmah nasmije:',
      'Moja go-to comfort hrana:',
      'Plan za prvi susret:',
      'Trenutno me zanima:',
      'Pjesma koja me opisuje:',
      'Putovanje koje bih odmah krenuo/la:'
    ]
  },

  donatePrompt: {
    match: {
      title: 'Čestitamo na kontaktu!',
      text: 'Ako ti Ravnopar pomaže u upoznavanju, možeš dobrovoljno podržati održavanje platforme.'
    },
    milestone: {
      title: 'Hvala što koristiš Ravnopar',
      text: 'Već neko vrijeme si s nama. Ako želiš pomoći pokrivanje servera, donacija je dobrodošla — ali nije obavezna.'
    },
    support: 'Podrži projekt',
    notNow: 'Ne sada',
    neverAgain: 'Ne prikazuj ponovo'
  }
};
