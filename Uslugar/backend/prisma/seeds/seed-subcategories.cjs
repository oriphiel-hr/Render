/**
 * USLUGAR EXCLUSIVE - Seed script za podkategorije
 * Dodaje podkategorije povezane s glavnim kategorijama
 */

const { PrismaClient } = require('@prisma/client');
const subcategories = require('./subcategories.cjs');

const prisma = new PrismaClient();

// Preimenovanje starih podkategorija u nove nazive (duh hrvatskog jezika)
const SUB_RENAME_MAP = {
  'Uređivanje vrta': 'Uređivanje vrtnih površina',
  'Sadnja biljaka': 'Sadnja bilja i cvijeća',
  'Održavanje vrta': 'Održavanje vrtova i travnjaka',
  'Automatsko zalijevanje': 'Sustavi automatskog zalijevanja'
};

async function seedSubcategories() {
  console.log('🌱 Početak seed-a podkategorija...');

  try {
    // Preimenuj stare podkategorije
    for (const [oldName, newName] of Object.entries(SUB_RENAME_MAP)) {
      const existing = await prisma.category.findUnique({ where: { name: oldName } });
      if (existing) {
        await prisma.category.update({
          where: { id: existing.id },
          data: { name: newName }
        });
        console.log(`🔄 Preimenovano: "${oldName}" → "${newName}"`);
      }
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const subcategoryData of subcategories) {
      try {
        // Pronađi roditeljsku kategoriju
        const parentCategory = await prisma.category.findFirst({
          where: {
            name: subcategoryData.parentCategoryName
          }
        });

        if (!parentCategory) {
          console.log(`⚠️  Roditeljska kategorija "${subcategoryData.parentCategoryName}" nije pronađena, preskačem...`);
          skippedCount++;
          continue;
        }

        // Provjeri postoji li već podkategorija (name je unique globalno)
        const existingSubcategory = await prisma.category.findFirst({
          where: {
            name: subcategoryData.name,
            parentId: parentCategory.id
          }
        });

        if (existingSubcategory) {
          // Ažuriraj ikonu i opis ako nisu usklađeni
          const updates = {};
          if (existingSubcategory.icon !== (subcategoryData.icon || null)) updates.icon = subcategoryData.icon || null;
          if (existingSubcategory.description !== subcategoryData.description) updates.description = subcategoryData.description;
          if (Object.keys(updates).length > 0) {
            await prisma.category.update({
              where: { id: existingSubcategory.id },
              data: updates
            });
            console.log(`🔄 Ažurirana podkategorija: "${subcategoryData.name}" (ikona/opis)`);
          } else {
            console.log(`⏭️  Podkategorija "${subcategoryData.name}" već postoji, preskačem...`);
          }
          skippedCount++;
          continue;
        }

        // Kreiraj podkategoriju
        const subcategory = await prisma.category.create({
          data: {
            name: subcategoryData.name,
            description: subcategoryData.description,
            parentId: parentCategory.id,
            icon: subcategoryData.icon,
            isActive: subcategoryData.isActive,
            // Naslijedi NKD podatke od roditelja
            nkdCode: parentCategory.nkdCode,
            requiresLicense: parentCategory.requiresLicense,
            licenseType: parentCategory.licenseType,
            licenseAuthority: parentCategory.licenseAuthority
          }
        });

        console.log(`✅ Kreirana podkategorija: "${subcategory.name}" (roditelj: ${parentCategory.name})`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Greška pri kreiranju podkategorije "${subcategoryData.name}":`, error.message);
        skippedCount++;
      }
    }

    console.log('\n📊 Rezultat seed-a podkategorija:');
    console.log(`✅ Kreirano: ${createdCount} podkategorija`);
    console.log(`⏭️  Preskočeno: ${skippedCount} podkategorija`);
    console.log(`📝 Ukupno obrađeno: ${subcategories.length} podkategorija`);

    // Prikaži statistike
    const totalCategories = await prisma.category.count();
    const parentCategories = await prisma.category.count({
      where: { parentId: null }
    });
    const subcategoriesCount = await prisma.category.count({
      where: { parentId: { not: null } }
    });

    console.log('\n📈 Statistike kategorija:');
    console.log(`📁 Glavne kategorije: ${parentCategories}`);
    console.log(`📂 Podkategorije: ${subcategoriesCount}`);
    console.log(`📊 Ukupno kategorija: ${totalCategories}`);

  } catch (error) {
    console.error('❌ Kritična greška pri seed-u podkategorija:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Pokreni seed samo ako se pozove direktno
if (require.main === module) {
  seedSubcategories()
    .then(() => {
      console.log('🎉 Seed podkategorija završen uspješno!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed podkategorija neuspješan:', error);
      process.exit(1);
    });
}

module.exports = seedSubcategories;
