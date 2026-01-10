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
    nkdCode: '43.21',
    requiresLicense: true,
    licenseType: 'Elektrotehnička licenca',
    licenseAuthority: 'Hrvatska komora inženjera elektrotehnike (HKIE)',
    isActive: true
  },
  {
    name: 'Vodoinstalater',
    description: 'Vodovodne instalacije, kanalizacija, popravak sanitarija',
    nkdCode: '43.22',
    requiresLicense: true,
    licenseType: 'Ovlaštenje za vodoinstalatere',
    licenseAuthority: 'Hrvatska obrtna komora (HOK)',
    isActive: true
  },
  {
    name: 'Plinoinstalatér',
    description: 'Plinske instalacije, priključci, servis plinskih uređaja',
    nkdCode: '43.22',
    requiresLicense: true,
    licenseType: 'Ovlaštenje za rad s plinom',
    licenseAuthority: 'Hrvatska obrtna komora (HOK)',
    isActive: true
  },
  {
    name: 'Dizalice i platforme',
    description: 'Ugradnja, servis i inspekcija dizala i platformi',
    nkdCode: '43.29',
    requiresLicense: true,
    licenseType: 'Ovlaštenje za rad na dizalicama',
    licenseAuthority: 'Ministarstvo gospodarstva',
    isActive: true
  },
  {
    name: 'Sigurnosni sustavi',
    description: 'Alarmi, protuprovalna zaštita, video nadzor',
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
    nkdCode: '16.23',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Keramičar',
    description: 'Polaganje pločica, keramike, kamena',
    nkdCode: '43.33',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Zidar',
    description: 'Zidanje, betoniranje, fasadni radovi',
    nkdCode: '43.99',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Moler-Slikar',
    description: 'Bojanje, gletovanje, tapetiranje, dekorativne tehnike',
    nkdCode: '43.34',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Parketar',
    description: 'Postavljanje parketa, laminata, vinila',
    nkdCode: '43.33',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Krovopokrivač',
    description: 'Postavljanje krovova, popravak oluka, izolacija',
    nkdCode: '43.91',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Fasader',
    description: 'Fasade, demit fasade, termoizolacija',
    nkdCode: '43.34',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Limarski radovi',
    description: 'Krovni limovi, olučne konstrukcije',
    nkdCode: '43.91',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Gips-karton',
    description: 'Montaža gips-karton konstrukcija, pregradni zidovi',
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
    nkdCode: '43.22',
    requiresLicense: true,
    licenseType: 'F-gas certifikat',
    licenseAuthority: 'Fond za zaštitu okoliša i energetsku učinkovitost',
    isActive: true
  },
  {
    name: 'Ventilacija',
    description: 'Ventilacijski sustavi, rekuperacija',
    nkdCode: '43.22',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Grijanje',
    description: 'Centralna grijanja, radijatori, podno grijanje',
    nkdCode: '43.22',
    requiresLicense: false,
    isActive: true
  },

  // ========================================
  // DOM I VRTI
  // ========================================
  {
    name: 'Vrtlar',
    description: 'Uređenje vrta, održavanje zelenih površina',
    nkdCode: '81.30',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Kamenarske usluge',
    description: 'Obrada kamena, spomeinci, pločnici',
    nkdCode: '23.70',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Ograđivanje',
    description: 'Ograde, kapije, montaža panelnih ograda',
    nkdCode: '43.99',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Bazenski radovi',
    description: 'Izgradnja i održavanje bazena',
    nkdCode: '43.99',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Terase i pergole',
    description: 'Izrada terasa, nadstrešnica, pergola',
    nkdCode: '16.23',
    requiresLicense: false,
    isActive: true
  },

  // ========================================
  // ČIŠĆENJE I ODRŽAVANJE
  // ========================================
  {
    name: 'Čišćenje',
    description: 'Redovito čišćenje, dubinsko pranje',
    nkdCode: '81.21',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Čišćenje fasada',
    description: 'Pranje fasada, uklanjanje grafita',
    nkdCode: '81.29',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Dimnjačar',
    description: 'Čišćenje dimnjaka, kontrola ventilacije',
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
    description: 'Seldbeni radovi, pakiranje, transport',
    nkdCode: '49.42',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Transport robe',
    description: 'Prijevoz tereta, kombi prijevoz',
    nkdCode: '49.41',
    requiresLicense: false,
    isActive: true
  },

  // ========================================
  // AUTI I VOZILA
  // ========================================
  {
    name: 'Autoelektričar',
    description: 'Popravak auto elektrointalacija, dijagnostika',
    nkdCode: '45.20',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Automehaničar',
    description: 'Servis vozila, popravci, održavanje',
    nkdCode: '45.20',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Autolimarija i farbanje',
    description: 'Limarski radovi, farbanje vozila',
    nkdCode: '45.20',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Vulkanizer',
    description: 'Montaža guma, popravak, balansiranje',
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
    nkdCode: '43.34',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Bravarski radovi',
    description: 'Kovana ograda, željezne konstrukcije',
    nkdCode: '25.11',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Podne obloge',
    description: 'Vinyl, linoleum, tepisi',
    nkdCode: '43.33',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Dezinsekcija i deratizacija',
    description: 'Suzbijanje štetočina, dezinfekcija',
    nkdCode: '81.29',
    requiresLicense: true,
    licenseType: 'Dozvola za rad s biocidima',
    licenseAuthority: 'Ministarstvo zdravstva',
    isActive: true
  },
  {
    name: 'Popravak kućanskih aparata',
    description: 'Bijela tehnika, mali kućanski aparati',
    nkdCode: '95.22',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Računalni servisi',
    description: 'Popravak računala, instalacija softwarea',
    nkdCode: '95.11',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Soboslikarski radovi',
    description: 'Tapetiranje, dekorativne tehnike',
    nkdCode: '43.34',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Ugradnja rolled',
    description: 'Rolete, tende, komarnici',
    nkdCode: '43.34',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Fotografski servisi',
    description: 'Događaji, vjenčanja, portrati',
    nkdCode: '74.20',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Video produkcija',
    description: 'Snimanje, montaža, drone snimanje',
    nkdCode: '59.11',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Event usluge',
    description: 'Organizacija događanja, catering, dekor',
    nkdCode: '82.30',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Frizerske usluge',
    description: 'Šišanje, farbanje, fen frizure',
    nkdCode: '96.02',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Kozmetičke usluge',
    description: 'Njega lica, depilacija, manikura',
    nkdCode: '96.02',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Masažne usluge',
    description: 'Opuštajuće masaže, sportske masaže',
    nkdCode: '96.04',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Veterinarske usluge',
    description: 'Kućni posjet veterinara, cijepljenja',
    nkdCode: '75.00',
    requiresLicense: true,
    licenseType: 'Veterinarska licenca',
    licenseAuthority: 'Hrvatska veterinarska komora',
    isActive: true
  },
  {
    name: 'Šetanje pasa',
    description: 'Šetanje kućnih ljubimaca, čuvanje',
    nkdCode: '96.09',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Tutorstvo',
    description: 'Instrukcije, poduka, online nastava',
    nkdCode: '85.59',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Prevodilački servisi',
    description: 'Prevođenje dokumenata, sudsko tumačenje',
    nkdCode: '74.30',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Računovodstvene usluge',
    description: 'Knjigovodstvo, porezi, fiskalizacija',
    nkdCode: '69.20',
    requiresLicense: false,
    isActive: true
  },
  {
    name: 'Pravne usluge',
    description: 'Pravno savjetovanje, sastavljanje ugovora',
    nkdCode: '69.10',
    requiresLicense: true,
    licenseType: 'Odvjetnička licenca',
    licenseAuthority: 'Hrvatska odvjetnička komora',
    isActive: true
  }
]

module.exports = categoriesWithNKD

