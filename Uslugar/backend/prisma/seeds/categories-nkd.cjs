/**
 * USLUGAR EXCLUSIVE - Kategorije s NKD kodovima
 * Bazirano na analizi Trebam.hr + Hrvatske komora obrtnika
 */

const categoriesWithNKD = [
  // ========================================
  // LICENCIRANE DJELATNOSTI
  // ========================================
  {
    name: 'Električar',
    description: 'Električne instalacije, popravak električnih uređaja, LED rasvjeta',
    icon: '⚡',
    nkdCode: '43.21',
    requiresLicense: true,
    licenseType: 'Elektrotehnička licenca',
    licenseAuthority: 'Hrvatska komora inženjera elektrotehnike (HKIE)',
    isActive: true
  },
  {
    name: 'Vodoinstalater',
    description: 'Vodovodne instalacije, kanalizacija, popravak sanitarija',
    icon: '🚿',
    nkdCode: '43.22',
    requiresLicense: true,
    licenseType: 'Ovlaštenje za vodoinstalatere',
    licenseAuthority: 'Hrvatska obrtna komora (HOK)',
    isActive: true
  },
  {
    name: 'Plinoinstalater',
    description: 'Plinske instalacije, priključci, servis plinskih uređaja',
    icon: '🔥',
    nkdCode: '43.22',
    requiresLicense: true,
    licenseType: 'Ovlaštenje za rad s plinom',
    licenseAuthority: 'Hrvatska obrtna komora (HOK)',
    isActive: true
  },
  {
    name: 'Dizalice i platforme',
    description: 'Ugradnja, servis i inspekcija dizala i platformi',
    icon: '🛗',
    nkdCode: '43.29',
    requiresLicense: true,
    licenseType: 'Ovlaštenje za rad na dizalicama',
    licenseAuthority: 'Ministarstvo gospodarstva',
    isActive: true
  },
  {
    name: 'Sigurnosni sustavi',
    description: 'Alarmi, protuprovalna zaštita, video nadzor',
    icon: '🚨',
    nkdCode: '43.21',
    requiresLicense: true,
    licenseType: 'Dozvola za ugradnju sigurnosnih sustava',
    licenseAuthority: 'MUP Republike Hrvatske',
    isActive: true
  },

  // ========================================
  // GRAĐEVINSKI RADOVI (ne zahtijevaju licencu)
  // ========================================
  {
    name: 'Stolar',
    description: 'Izrada namještaja, ugradnja kuhinja, vrata, prozori',
    icon: '🪑',
    nkdCode: '16.23',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Keramičar',
    description: 'Polaganje pločica, keramike, kamena',
    icon: '🧱',
    nkdCode: '43.33',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Zidar',
    description: 'Zidanje, betoniranje, fasadni radovi',
    icon: '🧱',
    nkdCode: '43.99',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Moler-Slikar',
    description: 'Bojanje, gletovanje, tapetiranje, dekorativne tehnike',
    icon: '🎨',
    nkdCode: '43.34',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Parketar',
    description: 'Postavljanje parketa, laminata, vinila',
    icon: '🪵',
    nkdCode: '43.33',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Krovopokrivač',
    description: 'Postavljanje krovova, popravak oluka, izolacija',
    icon: '🏠',
    nkdCode: '43.91',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Fasader',
    description: 'Fasade, demit fasade, termoizolacija',
    icon: '🏗️',
    nkdCode: '43.34',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Limarski radovi',
    description: 'Krovni limovi, olučne konstrukcije',
    icon: '🔩',
    nkdCode: '43.91',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Gips-karton',
    description: 'Montaža gips-karton konstrukcija, pregradni zidovi',
    icon: '📐',
    nkdCode: '43.32',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Adaptacija stana',
    description: 'Kompletna ili djelomična adaptacija stanova',
    icon: '🏠',
    nkdCode: '43.39',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Adaptacija kupaonice',
    description: 'Renovacija kupaonica, zamjena sanitarija i keramike',
    icon: '🛁',
    nkdCode: '43.39',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Estrih',
    description: 'Izrada cementnog i samonivelirajućeg estriha',
    icon: '🧱',
    nkdCode: '43.33',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Žbukanje',
    description: 'Strojno i ručno žbukanje unutarnjih i vanjskih zidova',
    icon: '🪣',
    nkdCode: '43.31',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Suha gradnja (knauf)',
    description: 'Pregradni zidovi, spušteni stropovi i obloge od knaufa',
    icon: '📏',
    nkdCode: '43.32',
    requiresLicense: false,
    isActive: true
  },

  // ========================================
  // KLIMATIZACIJA I VENTILACIJA
  // ========================================
  {
    name: 'Klima uređaji',
    description: 'Ugradnja, servis i popravak klima uređaja',
    icon: '❄️',
    nkdCode: '43.22',
    requiresLicense: true,
    licenseType: 'F-gas certifikat',
    licenseAuthority: 'Fond za zaštitu okoliša i energetsku učinkovitost',
    isActive: true
  },
  {
    name: 'Ventilacija',
    description: 'Ventilacijski sustavi, rekuperacija',
    icon: '💨',
    nkdCode: '43.22',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Grijanje',
    description: 'Centralna grijanja, radijatori, podno grijanje',
    icon: '🔥',
    nkdCode: '43.22',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Kamini',
    description: 'Ugradnja i servis kamina',
    icon: '🔥',
    nkdCode: '43.22',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Peći',
    description: 'Ugradnja i servis peći na drva, pelete i plin',
    icon: '♨️',
    nkdCode: '43.22',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Infracrveni paneli',
    description: 'Prodaja, ugradnja i servis infracrvenih panela',
    icon: '🌡️',
    nkdCode: '43.22',
    requiresLicense: false,
    isActive: true
  },

  // ========================================
  // DOM I VRT
  // ========================================
  {
    name: 'Vrtlar',
    description: 'Uređenje vrta, održavanje zelenih površina',
    icon: '🌳',
    nkdCode: '81.30',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Vrtni radovi',
    description: 'Uređivanje vrta, sadnja, održavanje, zalijevanje',
    icon: '🌿',
    nkdCode: '81.30',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Kamenarske usluge',
    description: 'Obrada kamena, spomenici, pločnici',
    icon: '🪨',
    nkdCode: '23.70',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Ograđivanje',
    description: 'Ograde, kapije, montaža panelnih ograda',
    icon: '🚧',
    nkdCode: '43.99',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Bazenski radovi',
    description: 'Izgradnja i održavanje bazena',
    icon: '🏊',
    nkdCode: '43.99',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Terase i pergole',
    description: 'Izrada terasa, nadstrešnica, pergola',
    icon: '🌿',
    nkdCode: '16.23',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Uređenje okućnice',
    description: 'Planiranje i izvedba uređenja dvorišta i okućnice',
    icon: '🏡',
    nkdCode: '81.30',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Popločavanje dvorišta',
    description: 'Postavljanje opločnika, rubnjaka i staza',
    icon: '🧱',
    nkdCode: '43.99',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Asfaltiranje',
    description: 'Asfaltiranje prilaza, parkirališta i pristupnih puteva',
    icon: '🛣️',
    nkdCode: '42.11',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Nadstrešnice',
    description: 'Izrada i montaža nadstrešnica za ulaze, terase i parkirna mjesta',
    icon: '🏗️',
    nkdCode: '43.99',
    requiresLicense: false,
    isActive: true
  },

  // ========================================
  // ČIŠĆENJE I ODRŽAVANJE
  // ========================================
  {
    name: 'Čišćenje',
    description: 'Redovito čišćenje, dubinsko pranje',
    icon: '🧹',
    nkdCode: '81.21',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Čišćenje i održavanje',
    description: 'Čišćenje kuće, ureda, nakon gradnje, tepiha',
    icon: '🧹',
    nkdCode: '81.21',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Čišćenje fasada',
    description: 'Pranje fasada, uklanjanje grafita',
    icon: '🏢',
    nkdCode: '81.29',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Dimnjačar',
    description: 'Čišćenje dimnjaka, kontrola ventilacije',
    icon: '🛠️',
    nkdCode: '43.22',
    requiresLicense: true,
    licenseType: 'Ovlaštenje dimnjačara',
    licenseAuthority: 'Hrvatska obrtna komora (HOK)',
    isActive: true
  },

  // ========================================
  // PRIJEVOZ I SELIDBE
  // ========================================
  {
    name: 'Selidbe',
    description: 'Selidbeni radovi, pakiranje i transport',
    icon: '📦',
    nkdCode: '49.42',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Prijevoz robe',
    description: 'Prijevoz tereta, kombi prijevoz',
    icon: '🚚',
    nkdCode: '49.41',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Usluge prijevoza',
    description: 'Selidbe, transport namještaja, građevinskog materijala, otpada',
    icon: '🚚',
    nkdCode: '49.41',
    requiresLicense: false,
    isActive: true
  },

  // ========================================
  // AUTI I VOZILA
  // ========================================
  {
    name: 'Autoelektričar',
    description: 'Popravak auto elektroinstalacija i dijagnostika',
    icon: '🔌',
    nkdCode: '45.20',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Automehaničar',
    description: 'Servis vozila, popravci, održavanje',
    icon: '🔧',
    nkdCode: '45.20',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Autolimarija i farbanje',
    description: 'Limarski radovi, farbanje vozila',
    icon: '🚗',
    nkdCode: '45.20',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Vulkanizer',
    description: 'Montaža guma, popravak, balansiranje',
    icon: '🛞',
    nkdCode: '45.20',
    requiresLicense: false,
    isActive: true
  },

  // ========================================
  // OSTALE USLUGE
  // ========================================
  {
    name: 'Staklarski radovi',
    description: 'Ugradnja stakala, ogledala, zamjena prozora',
    icon: '🪟',
    nkdCode: '43.34',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Bravarski radovi',
    description: 'Kovana ograda, željezne konstrukcije',
    icon: '🔨',
    nkdCode: '25.11',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Podne obloge',
    description: 'Vinyl, linoleum, tepisi',
    icon: '📐',
    nkdCode: '43.33',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Dezinsekcija i deratizacija',
    description: 'Suzbijanje štetočina, dezinfekcija',
    icon: '🐛',
    nkdCode: '81.29',
    requiresLicense: true,
    licenseType: 'Dozvola za rad s biocidima',
    licenseAuthority: 'Ministarstvo zdravstva',
    isActive: true
  },
  {
    name: 'Popravak kućanskih aparata',
    description: 'Bijela tehnika, mali kućanski aparati',
    icon: '🔧',
    nkdCode: '95.22',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Računalni servisi',
    description: 'Popravak računala, instalacija softwarea',
    icon: '💻',
    nkdCode: '95.11',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'IT usluge',
    description: 'Popravak računala, mreže, sigurnosni sustavi, software podrška',
    icon: '💻',
    nkdCode: '95.11',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Soboslikarstvo',
    description: 'Soboslikarski radovi: bojanje zidova, tapetiranje, gletovanje, dekorativne tehnike',
    icon: '🖌️',
    nkdCode: '43.34',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Ugradnja roleta',
    description: 'Rolete, tende, komarnici',
    icon: '🪟',
    nkdCode: '43.34',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Stolarija - prozori',
    description: 'Izrada i ugradnja PVC, ALU i drvenih prozora',
    icon: '🪟',
    nkdCode: '43.32',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Stolarija - vrata',
    description: 'Izrada i ugradnja ulaznih i unutarnjih vrata',
    icon: '🚪',
    nkdCode: '43.32',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Sjenila',
    description: 'Montaža roleta, žaluzina, tendi i komarnika',
    icon: '🪟',
    nkdCode: '43.34',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Fotografski servisi',
    description: 'Događaji, vjenčanja, portreti',
    icon: '📸',
    nkdCode: '74.20',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Video produkcija',
    description: 'Snimanje, montaža, drone snimanje',
    icon: '🎬',
    nkdCode: '59.11',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Event usluge',
    description: 'Organizacija događanja, catering, dekor',
    icon: '🎉',
    nkdCode: '82.30',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Frizerske usluge',
    description: 'Šišanje, farbanje, fen frizure',
    icon: '✂️',
    nkdCode: '96.02',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Kozmetičke usluge',
    description: 'Njega lica, depilacija, manikura',
    icon: '💄',
    nkdCode: '96.02',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Masažne usluge',
    description: 'Opuštajuće masaže, sportske masaže',
    icon: '💆',
    nkdCode: '96.04',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Veterinarske usluge',
    description: 'Kućni posjet veterinara, cijepljenja',
    icon: '🐾',
    nkdCode: '75.00',
    requiresLicense: true,
    licenseType: 'Veterinarska licenca',
    licenseAuthority: 'Hrvatska veterinarska komora',
    isActive: true
  },
  {
    name: 'Šetanje pasa',
    description: 'Šetanje kućnih ljubimaca, čuvanje',
    icon: '🐕',
    nkdCode: '96.09',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Tutorstvo',
    description: 'Instrukcije, poduka, online nastava',
    icon: '📚',
    nkdCode: '85.59',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Prevodilački servisi',
    description: 'Prevođenje dokumenata, sudsko tumačenje',
    icon: '🗣️',
    nkdCode: '74.30',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Računovodstvene usluge',
    description: 'Knjigovodstvo, porezi, fiskalizacija',
    icon: '📊',
    nkdCode: '69.20',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Pravne usluge',
    description: 'Pravno savjetovanje, sastavljanje ugovora',
    icon: '⚖️',
    nkdCode: '69.10',
    requiresLicense: true,
    licenseType: 'Odvjetnička licenca',
    licenseAuthority: 'Hrvatska odvjetnička komora',
    isActive: true
  }
]

module.exports = categoriesWithNKD

