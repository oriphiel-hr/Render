import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const r = Router();

// Dodaj nedostajuće kategorije - javni endpoint
r.post('/add-missing-categories', async (req, res, next) => {
  try {
    console.log('🌱 Dodavanje nedostajućih kategorija...');
    
    const missingCategories = [
      // 🏗️ GRAĐEVINSKE USLUGE
      { name: 'Građevina', description: 'Opći građevinski radovi, renovacije, adaptacije', icon: '🏗️', nkdCode: '41.20', requiresLicense: true, licenseType: 'Građevinska licenca', licenseAuthority: 'Hrvatska komora inženjera građevinarstva' },
      { name: 'Građevinski nadzor', description: 'Nadzor nad izvođenjem građevinskih radova', icon: '👷', nkdCode: '71.12', requiresLicense: true, licenseType: 'Licenca građevinskog nadzora', licenseAuthority: 'Hrvatska komora inženjera građevinarstva' },
      { name: 'Geodetske usluge', description: 'Mjerenja, izrada geodetskih elaborata', icon: '📐', nkdCode: '71.12', requiresLicense: true, licenseType: 'Geodetska licenca', licenseAuthority: 'Hrvatska komora inženjera geodezije' },
      { name: 'Energetski certifikati', description: 'Izdavanje energetskih certifikata za zgrade', icon: '⚡', nkdCode: '71.12', requiresLicense: true, licenseType: 'Licenca energetskog certifikata', licenseAuthority: 'Hrvatska energetska agencija' },
      { name: 'Legalizacija objekata', description: 'Pomoć pri legalizaciji bespravno sagrađenih objekata', icon: '📋', nkdCode: '71.12', requiresLicense: false },
      { name: 'Dizajn interijera', description: 'Uređenje i dizajn unutarnjih prostora', icon: '🎨', nkdCode: '74.10', requiresLicense: false },
      { name: 'Arhitektonske usluge', description: 'Projektiranje, izrada arhitektonskih planova', icon: '🏛️', nkdCode: '71.11', requiresLicense: true, licenseType: 'Arhitektonska licenca', licenseAuthority: 'Hrvatska komora arhitekata' },
      { name: 'Landscape dizajn', description: 'Uređenje vanjskih prostora, vrtovi', icon: '🌳', nkdCode: '71.12', requiresLicense: false },
      { name: 'Solarni sustavi', description: 'Ugradnja solarnih panela i sustava', icon: '☀️', nkdCode: '43.21', requiresLicense: true, licenseType: 'Elektrotehnička licenca', licenseAuthority: 'Hrvatska komora inženjera elektrotehnike' },
      
      // 💻 IT USLUGE
      { name: 'Web dizajn', description: 'Izrada i dizajn web stranica', icon: '🌐', nkdCode: '62.01', requiresLicense: false },
      { name: 'SEO usluge', description: 'Optimizacija web stranica za pretraživače', icon: '🔍', nkdCode: '62.01', requiresLicense: false },
      { name: 'Digitalni marketing', description: 'Online marketing, društvene mreže', icon: '📱', nkdCode: '73.11', requiresLicense: false },
      { name: 'E-commerce', description: 'Izrada online trgovina', icon: '🛒', nkdCode: '62.01', requiresLicense: false },
      
      // 📸 MEDIJSKE USLUGE
      { name: 'Fotografija', description: 'Profesionalno fotografiranje za različite potrebe', icon: '📸', nkdCode: '74.20', requiresLicense: false },
      { name: 'Drone snimanje', description: 'Zračno snimanje dronovima', icon: '🚁', nkdCode: '74.20', requiresLicense: false },
      { name: '3D vizualizacija', description: '3D modeli, renderi, vizualizacije', icon: '🎬', nkdCode: '74.20', requiresLicense: false },
      
      // 🚚 TRANSPORT
      { name: 'Dostava', description: 'Dostava paketa, hrane, pošiljki', icon: '📦', nkdCode: '53.20', requiresLicense: false },
      { name: 'Prijevoz putnika', description: 'Taxi, prijevoz putnika', icon: '🚕', nkdCode: '49.32', requiresLicense: true, licenseType: 'Licenca za prijevoz putnika', licenseAuthority: 'Ministarstvo mora, prometa i infrastrukture' },
      
      // 🧹 ČIŠĆENJE
      { name: 'Čišćenje kućanstva', description: 'Čišćenje domova, stanova', icon: '🏠', nkdCode: '81.21', requiresLicense: false },
      { name: 'Čišćenje ureda', description: 'Čišćenje poslovnih prostora', icon: '🏢', nkdCode: '81.21', requiresLicense: false },
      { name: 'Čišćenje nakon gradnje', description: 'Čišćenje nakon građevinskih radova', icon: '🏗️', nkdCode: '81.21', requiresLicense: false },
      
      // 🏥 ZDRAVSTVO
      { name: 'Fizioterapija', description: 'Fizioterapijske usluge, rehabilitacija', icon: '🏥', nkdCode: '86.90', requiresLicense: true, licenseType: 'Licenca fizioterapeuta', licenseAuthority: 'Hrvatska komora fizioterapeuta' },
      { name: 'Masage', description: 'Opuštajuće i terapeutske masaže', icon: '💆', nkdCode: '96.09', requiresLicense: false },
      
      // 💄 LJEPOTA
      { name: 'Kozmetika', description: 'Kozmetičke usluge, njega lica', icon: '💄', nkdCode: '96.02', requiresLicense: false },
      { name: 'Manikura/Pedikura', description: 'Njega noktiju ruku i nogu', icon: '💅', nkdCode: '96.02', requiresLicense: false },
      
      // 📚 OBRAZOVANJE
      { name: 'Instrukcije', description: 'Poduka učenika, instrukcije', icon: '📚', nkdCode: '85.59', requiresLicense: false },
      { name: 'Jezici', description: 'Učenje stranih jezika', icon: '🗣️', nkdCode: '85.59', requiresLicense: false },
      { name: 'Muzika', description: 'Glazbena nastava, poduka', icon: '🎵', nkdCode: '85.59', requiresLicense: false },
      
      // 💼 POSLOVNE USLUGE
      { name: 'Računovodstvo', description: 'Knjigovodstvo, računovodstvene usluge', icon: '📊', nkdCode: '69.20', requiresLicense: false },
      { name: 'Osiguranje', description: 'Osiguravajuće usluge', icon: '🛡️', nkdCode: '65.20', requiresLicense: true, licenseType: 'Licenca osiguravajućeg agenta', licenseAuthority: 'Hrvatska agencija za nadzor financijskih usluga' },
      
      // 🌱 EKOLOGIJA
      { name: 'Energetska učinkovitost', description: 'Energetski pregledi, optimizacija potrošnje', icon: '🌱', nkdCode: '71.12', requiresLicense: true, licenseType: 'Licenca energetskog savjetnika', licenseAuthority: 'Hrvatska energetska agencija' },
      { name: 'Recikliranje', description: 'Usluge recikliranja, odvoz otpada', icon: '♻️', nkdCode: '38.11', requiresLicense: false },
      
      // 🔧 POPRAVCI
      { name: 'Popravak kućanskih aparata', description: 'Popravak perilica, sušilica, frižidera', icon: '🔧', nkdCode: '95.21', requiresLicense: false },
      { name: 'Montaža namještaja', description: 'Montaža namještaja, sklapanje', icon: '🪑', nkdCode: '43.30', requiresLicense: false },
      { name: 'Montaža klima uređaja', description: 'Ugradnja i servis klima uređaja', icon: '❄️', nkdCode: '43.22', requiresLicense: true, licenseType: 'Licenca za klimatizaciju', licenseAuthority: 'Hrvatska komora inženjera građevinarstva' }
    ];

    let addedCount = 0;
    let updatedCount = 0;

    for (const cat of missingCategories) {
      try {
        const existing = await prisma.category.findUnique({
          where: { name: cat.name }
        });

        if (existing) {
          await prisma.category.update({
            where: { name: cat.name },
            data: {
              description: cat.description,
              icon: cat.icon,
              nkdCode: cat.nkdCode,
              requiresLicense: cat.requiresLicense,
              licenseType: cat.licenseType,
              licenseAuthority: cat.licenseAuthority,
              isActive: true
            }
          });
          updatedCount++;
          console.log('✅ Ažurirana:', cat.name);
        } else {
          await prisma.category.create({
            data: {
              name: cat.name,
              description: cat.description,
              icon: cat.icon,
              nkdCode: cat.nkdCode,
              requiresLicense: cat.requiresLicense,
              licenseType: cat.licenseType,
              licenseAuthority: cat.licenseAuthority,
              isActive: true
            }
          });
          addedCount++;
          console.log('➕ Dodana:', cat.name);
        }
      } catch (error) {
        console.error('❌ Greška za', cat.name + ':', error.message);
      }
    }

    console.log('📊 REZULTAT: Dodano', addedCount, 'Ažurirano', updatedCount);
    
    res.json({ 
      message: 'Kategorije uspješno dodane/ažurirane!',
      added: addedCount,
      updated: updatedCount,
      total: missingCategories.length
    });
  } catch (e) {
    console.error('❌ Greška pri dodavanju kategorija:', e);
    next(e);
  }
});

export default r;
