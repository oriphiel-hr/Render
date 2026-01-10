/**
 * USLUGAR EXCLUSIVE - Seed script za kategorije s NKD kodovima
 * 
 * Pokretanje:
 * node prisma/seeds/seed-categories.js
 */

const { PrismaClient } = require('@prisma/client')
const categoriesWithNKD = require('./categories-nkd')

const prisma = new PrismaClient()

async function seedCategories() {
  console.log('🌱 Započinjem seed kategorija...')
  
  let created = 0
  let updated = 0
  let skipped = 0
  
  for (const category of categoriesWithNKD) {
    try {
      // Provjeri postoji li kategorija
      const existing = await prisma.category.findUnique({
        where: { name: category.name }
      })
      
      if (existing) {
        // Ažuriraj postojeću kategoriju
        await prisma.category.update({
          where: { id: existing.id },
          data: {
            description: category.description,
            nkdCode: category.nkdCode,
            requiresLicense: category.requiresLicense,
            licenseType: category.licenseType || null,
            licenseAuthority: category.licenseAuthority || null,
            isActive: category.isActive
          }
        })
        updated++
        console.log(`✅ Ažurirana: ${category.name}`)
      } else {
        // Kreiraj novu kategoriju
        await prisma.category.create({
          data: {
            name: category.name,
            description: category.description,
            nkdCode: category.nkdCode,
            requiresLicense: category.requiresLicense,
            licenseType: category.licenseType || null,
            licenseAuthority: category.licenseAuthority || null,
            isActive: category.isActive
          }
        })
        created++
        console.log(`✨ Kreirana: ${category.name}`)
      }
    } catch (error) {
      console.error(`❌ Greška za kategoriju ${category.name}:`, error.message)
      skipped++
    }
  }
  
  console.log('\n📊 REZULTATI:')
  console.log(`   Kreirano: ${created}`)
  console.log(`   Ažurirano: ${updated}`)
  console.log(`   Preskočeno: ${skipped}`)
  console.log(`   Ukupno: ${categoriesWithNKD.length}`)
  
  // Statistika licenci
  const licensedCount = categoriesWithNKD.filter(c => c.requiresLicense).length
  console.log(`\n🔐 Licencirane djelatnosti: ${licensedCount}`)
  
  // Provjeri koliko je ukupno u bazi
  const totalInDb = await prisma.category.count()
  console.log(`\n💾 Ukupno kategorija u bazi: ${totalInDb}`)
}

async function main() {
  try {
    await seedCategories()
  } catch (error) {
    console.error('❌ Greška pri seedanju:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

