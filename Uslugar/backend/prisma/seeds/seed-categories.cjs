/**
 * USLUGAR EXCLUSIVE - Seed script za kategorije s NKD kodovima
 * 
 * Pokretanje:
 * node prisma/seeds/seed-categories.js
 */

const { PrismaClient } = require('@prisma/client')
const categoriesWithNKD = require('./categories-nkd.cjs')

const prisma = new PrismaClient()

// Mapiranje starih naziva na nove (za preimenovanje u duhu hrvatskog jezika)
const RENAME_MAP = {
  'Baštanski radovi': 'Vrtni radovi',
  'Čistoća i održavanje': 'Čišćenje i održavanje',
  'Transport robe': 'Prijevoz robe',
  'Prijevoz': 'Usluge prijevoza',
  'IT podrška': 'IT usluge'
}

async function seedCategories() {
  console.log('🌱 Započinjem seed kategorija...')

  // Preimenuj stare kategorije u nove nazive (ili spoji ako nova već postoji)
  for (const [oldName, newName] of Object.entries(RENAME_MAP)) {
    const existingOld = await prisma.category.findUnique({ where: { name: oldName } })
    const existingNew = await prisma.category.findUnique({ where: { name: newName } })

    if (!existingOld) continue

    if (existingNew) {
      // Nova kategorija već postoji – spoji stare reference u novu, zatim obriši staru
      const oldId = existingOld.id
      const newId = existingNew.id
      if (oldId === newId) continue // Ista kategorija

      const subcats = await prisma.category.updateMany({ where: { parentId: oldId }, data: { parentId: newId } })
      const jobs = await prisma.job.updateMany({ where: { categoryId: oldId }, data: { categoryId: newId } })
      const providersWithOld = await prisma.providerProfile.findMany({
        where: { categories: { some: { id: oldId } } },
        select: { id: true }
      })
      for (const p of providersWithOld) {
        await prisma.providerProfile.update({
          where: { id: p.id },
          data: {
            categories: {
              disconnect: { id: oldId },
              connect: { id: newId }
            }
          }
        })
      }
      if (subcats.count > 0 || jobs.count > 0 || providersWithOld.length > 0) {
        console.log(`🔄 Spojeno u "${newName}": ${subcats.count} podkategorija, ${jobs.count} poslova, ${providersWithOld.length} pružatelja`)
      }
      await prisma.category.delete({ where: { id: oldId } })
      console.log(`🗑️ Obrisana duplikat: "${oldName}" (reference prebačene na "${newName}")`)
    } else {
      // Jednostavno preimenovanje
      await prisma.category.update({
        where: { id: existingOld.id },
        data: { name: newName }
      })
      console.log(`🔄 Preimenovano: "${oldName}" → "${newName}"`)
    }
  }
  
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
            icon: category.icon || null,
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
            icon: category.icon || null,
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

