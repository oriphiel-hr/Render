/**
 * USLUGAR EXCLUSIVE - Podkategorije
 * Bazirano na analizi Trebam.hr kategorija
 */

const subcategories = [
  // ========================================
  // ELEKTRIČAR - Podkategorije
  // ========================================
  {
    name: 'Električne instalacije',
    description: 'Ugradnja novih električnih instalacija u kućama i stanovima',
    parentCategoryName: 'Električar',
    icon: '🔌',
    isActive: true
  },
  {
    name: 'Popravak električnih uređaja',
    description: 'Servis i popravak kućanskih električnih uređaja',
    parentCategoryName: 'Električar',
    icon: '🔧',
    isActive: true
  },
  {
    name: 'LED rasvjeta',
    description: 'Ugradnja LED rasvjete i pametnih svjetala',
    parentCategoryName: 'Električar',
    icon: '💡',
    isActive: true
  },
  {
    name: 'Električni paneli',
    description: 'Ugradnja i servis električnih panela i osigurača',
    parentCategoryName: 'Električar',
    icon: '⚡',
    isActive: true
  },

  // ========================================
  // VODOINSTALATER - Podkategorije
  // ========================================
  {
    name: 'Vodovodne instalacije',
    description: 'Ugradnja novih vodovodnih instalacija',
    parentCategoryName: 'Vodoinstalater',
    icon: '🚰',
    isActive: true
  },
  {
    name: 'Kanalizacija',
    description: 'Ugradnja i popravak kanalizacijskih sustava',
    parentCategoryName: 'Vodoinstalater',
    icon: '🚽',
    isActive: true
  },
  {
    name: 'Popravak sanitarija',
    description: 'Servis i popravak WC-a, umivaonika, tuša',
    parentCategoryName: 'Vodoinstalater',
    icon: '🛁',
    isActive: true
  },
  {
    name: 'Grijanje vode',
    description: 'Ugradnja bojlera, solarnih panela za grijanje vode',
    parentCategoryName: 'Vodoinstalater',
    icon: '🔥',
    isActive: true
  },

  // ========================================
  // STOLAR - Podkategorije
  // ========================================
  {
    name: 'Izrada namještaja',
    description: 'Izrada po mjeri kuhinja, ormara, police',
    parentCategoryName: 'Stolar',
    icon: '🪑',
    isActive: true
  },
  {
    name: 'Ugradnja kuhinja',
    description: 'Montaža kuhinjskih elemenata i radnih ploča',
    parentCategoryName: 'Stolar',
    icon: '🍳',
    isActive: true
  },
  {
    name: 'Vrata i prozori',
    description: 'Ugradnja drvenih vrata, prozora, šipki',
    parentCategoryName: 'Stolar',
    icon: '🚪',
    isActive: true
  },
  {
    name: 'Parket i laminat',
    description: 'Postavljanje drvenih podova i laminata',
    parentCategoryName: 'Stolar',
    icon: '🪵',
    isActive: true
  },

  // ========================================
  // KERAMIČAR - Podkategorije
  // ========================================
  {
    name: 'Polaganje pločica',
    description: 'Keramičke pločice u kupaonici i kuhinji',
    parentCategoryName: 'Keramičar',
    icon: '🧱',
    isActive: true
  },
  {
    name: 'Kamene ploče',
    description: 'Granit, mramor, kvarc za radne ploče',
    parentCategoryName: 'Keramičar',
    icon: '🪨',
    isActive: true
  },
  {
    name: 'Mosaik i dekorativne pločice',
    description: 'Ukrasne pločice i mosaik radovi',
    parentCategoryName: 'Keramičar',
    icon: '🎨',
    isActive: true
  },
  {
    name: 'Fugiranje',
    description: 'Fugiranje pločica i čišćenje',
    parentCategoryName: 'Keramičar',
    icon: '✨',
    isActive: true
  },

  // ========================================
  // MOLER-SLIKAR - Podkategorije
  // ========================================
  {
    name: 'Bojanje zidova',
    description: 'Bojanje unutarnjih i vanjskih zidova',
    parentCategoryName: 'Moler-Slikar',
    icon: '🎨',
    isActive: true
  },
  {
    name: 'Gletovanje',
    description: 'Gletovanje zidova prije bojanja',
    parentCategoryName: 'Moler-Slikar',
    icon: '🪣',
    isActive: true
  },
  {
    name: 'Tapetiranje',
    description: 'Lijepljenje tapeta i dekorativnih materijala',
    parentCategoryName: 'Moler-Slikar',
    icon: '📄',
    isActive: true
  },
  {
    name: 'Dekorativne tehnike',
    description: 'Spongiranje, marbling, teksturiranje',
    parentCategoryName: 'Moler-Slikar',
    icon: '🖌️',
    isActive: true
  },

  // ========================================
  // KLIMA UREĐAJI - Podkategorije
  // ========================================
  {
    name: 'Ugradnja klima uređaja',
    description: 'Montaža split klima uređaja',
    parentCategoryName: 'Klima uređaji',
    icon: '❄️',
    isActive: true
  },
  {
    name: 'Servis klima uređaja',
    description: 'Čišćenje, punjenje freona, popravak',
    parentCategoryName: 'Klima uređaji',
    icon: '🔧',
    isActive: true
  },
  {
    name: 'Centralna klima',
    description: 'Ugradnja centralnih klimatizacijskih sustava',
    parentCategoryName: 'Klima uređaji',
    icon: '❄️',
    isActive: true
  },
  {
    name: 'Mobilni klima uređaji',
    description: 'Prodaja i servis mobilnih klima uređaja',
    parentCategoryName: 'Klima uređaji',
    icon: '🌡️',
    isActive: true
  },

  // ========================================
  // ČIŠĆENJE I ODRŽAVANJE - Podkategorije
  // ========================================
  {
    name: 'Čišćenje kuće',
    description: 'Redovno čišćenje stanova i kuća',
    parentCategoryName: 'Čišćenje i održavanje',
    icon: '🧹',
    isActive: true
  },
  {
    name: 'Čišćenje ureda',
    description: 'Poslovni prostori i uredi',
    parentCategoryName: 'Čišćenje i održavanje',
    icon: '🏢',
    isActive: true
  },
  {
    name: 'Čišćenje nakon gradnje',
    description: 'Čišćenje nakon renovacije i gradnje',
    parentCategoryName: 'Čišćenje i održavanje',
    icon: '🏗️',
    isActive: true
  },
  {
    name: 'Čišćenje tepiha',
    description: 'Profesionalno čišćenje tepiha i tapeta',
    parentCategoryName: 'Čišćenje i održavanje',
    icon: '🛋️',
    isActive: true
  },

  // ========================================
  // VRTNI RADOVI - Podkategorije
  // ========================================
  {
    name: 'Uređivanje vrtnih površina',
    description: 'Dizajn i uređivanje vrtnih prostora',
    parentCategoryName: 'Vrtni radovi',
    icon: '🌿',
    isActive: true
  },
  {
    name: 'Sadnja bilja i cvijeća',
    description: 'Sadnja cvijeća, grmlja i drveća',
    parentCategoryName: 'Vrtni radovi',
    icon: '🌱',
    isActive: true
  },
  {
    name: 'Održavanje vrtova i travnjaka',
    description: 'Košenje, obrezivanje, zalijevanje',
    parentCategoryName: 'Vrtni radovi',
    icon: '✂️',
    isActive: true
  },
  {
    name: 'Sustavi automatskog zalijevanja',
    description: 'Ugradnja sustava automatskog zalijevanja',
    parentCategoryName: 'Vrtni radovi',
    icon: '💧',
    isActive: true
  },

  // ========================================
  // USLUGE PRIJEVOZA - Podkategorije
  // ========================================
  {
    name: 'Selidba',
    description: 'Selidba stanova i kuća',
    parentCategoryName: 'Usluge prijevoza',
    icon: '📦',
    isActive: true
  },
  {
    name: 'Prijevoz namještaja',
    description: 'Transport namještaja i velikih predmeta',
    parentCategoryName: 'Usluge prijevoza',
    icon: '🚚',
    isActive: true
  },
  {
    name: 'Prijevoz građevinskog materijala',
    description: 'Transport cementa, pijeska, cigle',
    parentCategoryName: 'Usluge prijevoza',
    icon: '🧱',
    isActive: true
  },
  {
    name: 'Prijevoz otpada',
    description: 'Odvoz građevinskog i komunalnog otpada',
    parentCategoryName: 'Usluge prijevoza',
    icon: '🗑️',
    isActive: true
  },

  // ========================================
  // IT USLUGE - Podkategorije
  // ========================================
  {
    name: 'Popravak računala',
    description: 'Servis desktop i laptop računala',
    parentCategoryName: 'IT usluge',
    icon: '💻',
    isActive: true
  },
  {
    name: 'Mrežne instalacije',
    description: 'Ugradnja WiFi mreža i kabeliranje',
    parentCategoryName: 'IT usluge',
    icon: '📶',
    isActive: true
  },
  {
    name: 'Sigurnosni sustavi',
    description: 'Kamere, alarmi, kontrolni sustavi',
    parentCategoryName: 'IT usluge',
    icon: '📹',
    isActive: true
  },
  {
    name: 'Software podrška',
    description: 'Instalacija programa i tehnička podrška',
    parentCategoryName: 'IT usluge',
    icon: '⚙️',
    isActive: true
  }
];

module.exports = subcategories;
