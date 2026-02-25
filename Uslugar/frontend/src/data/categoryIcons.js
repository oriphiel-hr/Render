/**
 * Mapiranje ikona po nazivu kategorije/podkategorije.
 * Koristi se za pouzdan prikaz ikona (ne ovisi o encodingu iz API-ja).
 * Izvor: prisma/seeds (categories-nkd.js, subcategories.cjs).
 */

const CATEGORY_ICONS = {
  // Glavne kategorije (categories-nkd.js)
  'Električar': '⚡',
  'Vodoinstalater': '🚿',
  'Plinoinstalatér': '🔥',
  'Dizalice i platforme': '🛗',
  'Sigurnosni sustavi': '🚨',
  'Stolar': '🪑',
  'Keramičar': '🧱',
  'Zidar': '🧱',
  'Moler-Slikar': '🎨',
  'Parketar': '🪵',
  'Krovopokrivač': '🏠',
  'Fasader': '🏗️',
  'Limarski radovi': '🔩',
  'Gips-karton': '📐',
  'Klima uređaji': '❄️',
  'Ventilacija': '💨',
  'Grijanje': '🔥',
  'Vrtlar': '🌳',
  'Vrtni radovi': '🌿',
  'Kamenarske usluge': '🪨',
  'Ograđivanje': '🚧',
  'Bazenski radovi': '🏊',
  'Terase i pergole': '🌿',
  'Čišćenje': '🧹',
  'Čišćenje i održavanje': '🧹',
  'Čišćenje fasada': '🏢',
  'Dimnjačar': '🛠️',
  'Selidbe': '📦',
  'Prijevoz robe': '🚚',
  'Usluge prijevoza': '🚚',
  'Autoelektričar': '🔌',
  'Automehaničar': '🔧',
  'Autolimarija i farbanje': '🚗',
  'Vulkanizer': '🛞',
  'Staklarski radovi': '🪟',
  'Bravarski radovi': '🔨',
  'Podne obloge': '📐',
  'Dezinsekcija i deratizacija': '🐛',
  'Popravak kućanskih aparata': '🔧',
  'Računalni servisi': '💻',
  'IT usluge': '💻',
  'Soboslikarski radovi': '🖌️',
  'Ugradnja rolled': '🪟',
  'Fotografski servisi': '📸',
  'Video produkcija': '🎬',
  'Event usluge': '🎉',
  'Frizerske usluge': '✂️',
  'Kozmetičke usluge': '💄',
  'Masažne usluge': '💆',
  'Veterinarske usluge': '🐾',
  'Šetanje pasa': '🐕',
  'Tutorstvo': '📚',
  'Prevodilački servisi': '🗣️',
  'Računovodstvene usluge': '📊',
  'Pravne usluge': '⚖️',
  // Podkategorije (subcategories.cjs)
  'Električne instalacije': '🔌',
  'Popravak električnih uređaja': '🔧',
  'LED rasvjeta': '💡',
  'Električni paneli': '⚡',
  'Vodovodne instalacije': '🚰',
  'Kanalizacija': '🚽',
  'Popravak sanitarija': '🛁',
  'Grijanje vode': '🔥',
  'Izrada namještaja': '🪑',
  'Ugradnja kuhinja': '🍳',
  'Vrata i prozori': '🚪',
  'Parket i laminat': '🪵',
  'Polaganje pločica': '🧱',
  'Kamene ploče': '🪨',
  'Mosaik i dekorativne pločice': '🎨',
  'Fugiranje': '✨',
  'Bojanje zidova': '🎨',
  'Gletovanje': '🪣',
  'Tapetiranje': '📄',
  'Dekorativne tehnike': '🖌️',
  'Ugradnja klima uređaja': '❄️',
  'Servis klima uređaja': '🔧',
  'Centralna klima': '❄️',
  'Mobilni klima uređaji': '🌡️',
  'Čišćenje kuće': '🧹',
  'Čišćenje ureda': '🏢',
  'Čišćenje nakon gradnje': '🏗️',
  'Čišćenje tepiha': '🛋️',
  'Uređivanje vrtnih površina': '🌿',
  'Sadnja bilja i cvijeća': '🌱',
  'Održavanje vrtova i travnjaka': '✂️',
  'Sustavi automatskog zalijevanja': '💧',
  'Selidba': '📦',
  'Prijevoz namještaja': '🚚',
  'Prijevoz građevinskog materijala': '🧱',
  'Prijevoz otpada': '🗑️',
  'Popravak računala': '💻',
  'Mrežne instalacije': '📶',
  'Software podrška': '⚙️',
};

const DEFAULT_ICON = '🔧';

/**
 * Vraća emoji ikonu za kategoriju. Koristi mapu po nazivu da izbjegne čudne znakove iz API-ja.
 * @param {{ name: string, icon?: string | null }} category - objekt kategorije (name, opcionalno icon)
 * @returns {string} emoji ikona
 */
export function getCategoryIcon(category) {
  if (!category || !category.name) return DEFAULT_ICON;
  const fromMap = CATEGORY_ICONS[category.name];
  if (fromMap) return fromMap;
  // Ako API šalje valjani emoji (jedan znak ili kratak niz), možeš ga koristiti – ali često encoding puca
  const apiIcon = category.icon?.trim();
  if (apiIcon && apiIcon.length <= 4 && !/[\uFFFD\u0000-\u001F]/.test(apiIcon))
    return apiIcon;
  return DEFAULT_ICON;
}

export default getCategoryIcon;
