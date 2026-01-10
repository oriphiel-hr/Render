import { PrismaClient } from '@prisma/client';
import categories from './seeds/categories-complete.js';

const prisma = new PrismaClient();

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
