// Jednostavan seed script za dodavanje kategorija
// Pokreće se direktno u kontejneru

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  // 🏗️ GRAĐEVINSKE USLUGE
  { name: "Građevina", description: "Opći građevinski radovi, renovacije, adaptacije", icon: "🏗️", nkdCode: "41.20", requiresLicense: true, licenseType: "Građevinska licenca", licenseAuthority: "Hrvatska komora inženjera građevinarstva" },
  { name: "Građevinski nadzor", description: "Nadzor nad izvođenjem građevinskih radova", icon: "👷", nkdCode: "71.12", requiresLicense: true, licenseType: "Licenca građevinskog nadzora", licenseAuthority: "Hrvatska komora inženjera građevinarstva" },
  { name: "Geodetske usluge", description: "Mjerenja, izrada geodetskih elaborata", icon: "📐", nkdCode: "71.12", requiresLicense: true, licenseType: "Geodetska licenca", licenseAuthority: "Hrvatska komora inženjera geodezije" },
  { name: "Energetski certifikati", description: "Izdavanje energetskih certifikata za zgrade", icon: "⚡", nkdCode: "71.12", requiresLicense: true, licenseType: "Licenca energetskog certifikata", licenseAuthority: "Hrvatska energetska agencija" },
  { name: "Legalizacija objekata", description: "Pomoć pri legalizaciji bespravno sagrađenih objekata", icon: "📋", nkdCode: "71.12", requiresLicense: false },

  // 🎨 DIZAJN I INTERIJER
  { name: "Dizajn interijera", description: "Uređenje i dizajn unutarnjih prostora", icon: "🎨", nkdCode: "74.10", requiresLicense: false },
  { name: "Arhitektonske usluge", description: "Projektiranje, izrada arhitektonskih planova", icon: "🏛️", nkdCode: "71.11", requiresLicense: true, licenseType: "Arhitektonska licenca", licenseAuthority: "Hrvatska komora arhitekata" },
  { name: "Landscape dizajn", description: "Uređenje vanjskih prostora, vrtovi", icon: "🌳", nkdCode: "71.12", requiresLicense: false },

  // 🔌 INSTALACIJE
  { name: "Električar", description: "Električne instalacije, popravak električnih uređaja", icon: "⚡", nkdCode: "43.21", requiresLicense: true, licenseType: "Elektrotehnička licenca", licenseAuthority: "Hrvatska komora inženjera elektrotehnike" },
  { name: "Vodoinstalater", description: "Vodovodne instalacije, popravak cijevi", icon: "🚿", nkdCode: "43.22", requiresLicense: true, licenseType: "Licenca za vodovodne instalacije", licenseAuthority: "Hrvatska komora inženjera građevinarstva" },
  { name: "Solarni sustavi", description: "Ugradnja solarnih panela i sustava", icon: "☀️", nkdCode: "43.21", requiresLicense: true, licenseType: "Elektrotehnička licenca", licenseAuthority: "Hrvatska komora inženjera elektrotehnike" },

  // 🎨 ZANATI
  { name: "Soboslikarstvo", description: "Soboslikarski radovi, bojanje zidova", icon: "🎨", nkdCode: "43.30", requiresLicense: false },
  { name: "Keramičar", description: "Položba keramike, pločica", icon: "🧱", nkdCode: "43.30", requiresLicense: false },

  // 💻 IT I DIGITALNE USLUGE
  { name: "IT usluge", description: "Općenite IT usluge, održavanje računala", icon: "💻", nkdCode: "62.01", requiresLicense: false },
  { name: "Web dizajn", description: "Izrada i dizajn web stranica", icon: "🌐", nkdCode: "62.01", requiresLicense: false },
  { name: "SEO usluge", description: "Optimizacija web stranica za pretraživače", icon: "🔍", nkdCode: "62.01", requiresLicense: false },
  { name: "Digitalni marketing", description: "Online marketing, društvene mreže", icon: "📱", nkdCode: "73.11", requiresLicense: false },
  { name: "E-commerce", description: "Izrada online trgovina", icon: "🛒", nkdCode: "62.01", requiresLicense: false },

  // 📸 MEDIJSKE USLUGE
  { name: "Fotografija", description: "Profesionalno fotografiranje za različite potrebe", icon: "📸", nkdCode: "74.20", requiresLicense: false },
  { name: "Drone snimanje", description: "Zračno snimanje dronovima", icon: "🚁", nkdCode: "74.20", requiresLicense: false },
  { name: "3D vizualizacija", description: "3D modeli, renderi, vizualizacije", icon: "🎬", nkdCode: "74.20", requiresLicense: false },

  // 🚚 LOGISTIKA I TRANSPORT
  { name: "Prijevoz", description: "Općenite prijevozne usluge", icon: "🚚", nkdCode: "49.41", requiresLicense: true, licenseType: "Licenca za prijevoz", licenseAuthority: "Ministarstvo mora, prometa i infrastrukture" },
  { name: "Dostava", description: "Dostava paketa, hrane, pošiljki", icon: "📦", nkdCode: "53.20", requiresLicense: false },
  { name: "Selidbe", description: "Usluge selidbe, premještanje namještaja", icon: "📦", nkdCode: "49.41", requiresLicense: false },
  { name: "Prijevoz putnika", description: "Taxi, prijevoz putnika", icon: "🚕", nkdCode: "49.32", requiresLicense: true, licenseType: "Licenca za prijevoz putnika", licenseAuthority: "Ministarstvo mora, prometa i infrastrukture" },

  // 🧹 ČIŠĆENJE I ODRŽAVANJE
  { name: "Čišćenje", description: "Općenite usluge čišćenja", icon: "🧹", nkdCode: "81.21", requiresLicense: false },
  { name: "Čišćenje kućanstva", description: "Čišćenje domova, stanova", icon: "🏠", nkdCode: "81.21", requiresLicense: false },
  { name: "Čišćenje ureda", description: "Čišćenje poslovnih prostora", icon: "🏢", nkdCode: "81.21", requiresLicense: false },
  { name: "Čišćenje nakon gradnje", description: "Čišćenje nakon građevinskih radova", icon: "🏗️", nkdCode: "81.21", requiresLicense: false },

  // 🏥 ZDRAVLJE I LJEPOTA
  { name: "Fizioterapija", description: "Fizioterapijske usluge, rehabilitacija", icon: "🏥", nkdCode: "86.90", requiresLicense: true, licenseType: "Licenca fizioterapeuta", licenseAuthority: "Hrvatska komora fizioterapeuta" },
  { name: "Masage", description: "Opuštajuće i terapeutske masaže", icon: "💆", nkdCode: "96.09", requiresLicense: false },
  { name: "Kozmetika", description: "Kozmetičke usluge, njega lica", icon: "💄", nkdCode: "96.02", requiresLicense: false },
  { name: "Manikura/Pedikura", description: "Njega noktiju ruku i nogu", icon: "💅", nkdCode: "96.02", requiresLicense: false },

  // 🎓 OBRAZOVANJE
  { name: "Instrukcije", description: "Poduka učenika, instrukcije", icon: "📚", nkdCode: "85.59", requiresLicense: false },
  { name: "Jezici", description: "Učenje stranih jezika", icon: "🗣️", nkdCode: "85.59", requiresLicense: false },
  { name: "Muzika", description: "Glazbena nastava, poduka", icon: "🎵", nkdCode: "85.59", requiresLicense: false },

  // ⚖️ PRAVNE I FINANCIJSKE USLUGE
  { name: "Pravo", description: "Općenite pravne usluge", icon: "⚖️", nkdCode: "69.10", requiresLicense: true, licenseType: "Odvjetnička licenca", licenseAuthority: "Hrvatska odvjetnička komora" },
  { name: "Računovodstvo", description: "Knjigovodstvo, računovodstvene usluge", icon: "📊", nkdCode: "69.20", requiresLicense: false },
  { name: "Osiguranje", description: "Osiguravajuće usluge", icon: "🛡️", nkdCode: "65.20", requiresLicense: true, licenseType: "Licenca osiguravajućeg agenta", licenseAuthority: "Hrvatska agencija za nadzor financijskih usluga" },

  // 🌱 EKOLOGIJA I ODRŽIVOST
  { name: "Energetska učinkovitost", description: "Energetski pregledi, optimizacija potrošnje", icon: "🌱", nkdCode: "71.12", requiresLicense: true, licenseType: "Licenca energetskog savjetnika", licenseAuthority: "Hrvatska energetska agencija" },
  { name: "Recikliranje", description: "Usluge recikliranja, odvoz otpada", icon: "♻️", nkdCode: "38.11", requiresLicense: false },

  // 🏠 DOMAĆI RADOVI
  { name: "Popravak kućanskih aparata", description: "Popravak perilica, sušilica, frižidera", icon: "🔧", nkdCode: "95.21", requiresLicense: false },
  { name: "Montaža namještaja", description: "Montaža namještaja, sklapanje", icon: "🪑", nkdCode: "43.30", requiresLicense: false },
  { name: "Montaža klima uređaja", description: "Ugradnja i servis klima uređaja", icon: "❄️", nkdCode: "43.22", requiresLicense: true, licenseType: "Licenca za klimatizaciju", licenseAuthority: "Hrvatska komora inženjera građevinarstva" }
];

async function main() {
  console.log('🌱 Dodajem kompletne kategorije...');
  
  let addedCount = 0;
  let updatedCount = 0;
  
  for (const categoryData of categories) {
    try {
      const existing = await prisma.category.findUnique({
        where: { name: categoryData.name }
      });
      
      if (existing) {
        // Ažuriraj postojeću kategoriju s novim podacima
        await prisma.category.update({
          where: { name: categoryData.name },
          data: {
            description: categoryData.description,
            icon: categoryData.icon,
            nkdCode: categoryData.nkdCode,
            requiresLicense: categoryData.requiresLicense,
            licenseType: categoryData.licenseType,
            licenseAuthority: categoryData.licenseAuthority,
            isActive: true
          }
        });
        updatedCount++;
        console.log(`✅ Ažurirana: ${categoryData.name}`);
      } else {
        // Kreiraj novu kategoriju
        await prisma.category.create({
          data: {
            name: categoryData.name,
            description: categoryData.description,
            icon: categoryData.icon,
            nkdCode: categoryData.nkdCode,
            requiresLicense: categoryData.requiresLicense,
            licenseType: categoryData.licenseType,
            licenseAuthority: categoryData.licenseAuthority,
            isActive: true
          }
        });
        addedCount++;
        console.log(`➕ Dodana: ${categoryData.name}`);
      }
    } catch (error) {
      console.error(`❌ Greška za ${categoryData.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 REZULTAT:`);
  console.log(`➕ Dodano: ${addedCount} kategorija`);
  console.log(`✅ Ažurirano: ${updatedCount} kategorija`);
  console.log(`📋 Ukupno: ${addedCount + updatedCount} kategorija`);
  
  // Prikaži sve kategorije grupirane po područjima
  const allCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
  
  console.log(`\n📋 SVE KATEGORIJE (${allCategories.length}):`);
  allCategories.forEach(cat => {
    const icon = cat.icon || '📋';
    const license = cat.requiresLicense ? '🔒' : '🔓';
    console.log(`${icon} ${cat.name} ${license}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Greška:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
