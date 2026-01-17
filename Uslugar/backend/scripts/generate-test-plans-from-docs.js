// Skripta za generiranje test planova iz dokumentacije
// Pokreni: node backend/scripts/generate-test-plans-from-docs.js

import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function generateTestPlans() {
  console.log('📋 Generating test plans from documentation...\n');

  try {
    // Dohvati javne kategorije (za frontend testove)
    const publicCategories = await prisma.documentationCategory.findMany({
      where: {
        isActive: true
      },
      include: {
        features: {
          where: {
            deprecated: false,
            isAdminOnly: false
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Dohvati admin kategorije (za admin testove)
    const allCategories = await prisma.documentationCategory.findMany({
      where: {
        isActive: true
      },
      include: {
        features: {
          where: {
            deprecated: false
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    const adminCategories = allCategories
      .map(cat => ({
        ...cat,
        features: cat.features.filter(f => f.isAdminOnly === true)
      }))
      .filter(cat => cat.features.length > 0 && cat.name !== 'Statistike Implementacije');

    // Filter javnih kategorija (ne "Statistike Implementacije")
    const filteredPublicCategories = publicCategories.filter(
      cat => cat.features.length > 0 && cat.name !== 'Statistike Implementacije'
    );

    // Generiraj Frontend test plan
    let frontendContent = `# Test Plan - Frontend (Javna Dokumentacija)

Ova datoteka je automatski generirana iz javne dokumentacije platforme.

`;

    filteredPublicCategories.forEach((category, catIndex) => {
      frontendContent += `## Kategorija ${catIndex + 1}: ${category.name}\n\n`;
      
      category.features.forEach((feature, featIndex) => {
        const testNum = featIndex + 1;
        frontendContent += `#### Test ${testNum}: ${feature.name}\n\n`;
        
        if (feature.summary) {
          frontendContent += `**Opis:** ${feature.summary}\n\n`;
        }
        
        frontendContent += `**Koraci:**\n`;
        frontendContent += `1. Otvori stranicu sa funkcionalnošću "${feature.name}"\n`;
        frontendContent += `2. Provjeri da li je funkcionalnost dostupna i vidljiva\n`;
        frontendContent += `3. Testiraj osnovne akcije funkcionalnosti\n`;
        
        if (feature.details) {
          // Ekstraktuj glavne korake iz details ako postoje
          const lines = feature.details.split('\n').filter(l => l.trim());
          const numberedSteps = lines.filter(l => /^\d+[\.\)]/.test(l.trim()) || /^[-*]\s/.test(l.trim()));
          if (numberedSteps.length > 0) {
            numberedSteps.slice(0, 5).forEach((step, idx) => {
              const cleanStep = step.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim();
              if (cleanStep && idx < 3) {
                frontendContent += `${idx + 4}. ${cleanStep}\n`;
              }
            });
          }
        }
        
        frontendContent += `\n**Očekivani rezultat:**\n`;
        frontendContent += `- Funkcionalnost "${feature.name}" je dostupna i radi ispravno\n`;
        frontendContent += `- UI elementi su prikazani ispravno\n`;
        if (feature.implemented) {
          frontendContent += `- Funkcionalnost je implementirana i funkcionalna\n`;
        } else {
          frontendContent += `- ⚠️ Funkcionalnost nije implementirana\n`;
        }
        frontendContent += `\n`;
      });
      
      frontendContent += `---\n\n`;
    });

    // Generiraj Admin test plan
    let adminContent = `# Test Plan - Admin (Admin Dokumentacija)

Ova datoteka je automatski generirana iz admin dokumentacije platforme.

`;

    adminCategories.forEach((category, catIndex) => {
      adminContent += `## Kategorija ${catIndex + 1}: ${category.name}\n\n`;
      
      category.features.forEach((feature, featIndex) => {
        const testNum = featIndex + 1;
        adminContent += `#### Test ${testNum}: ${feature.name}\n\n`;
        
        if (feature.summary) {
          adminContent += `**Opis:** ${feature.summary}\n\n`;
        }
        
        adminContent += `**Koraci:**\n`;
        adminContent += `1. Prijavi se kao admin\n`;
        adminContent += `2. Otvori admin panel sa funkcionalnošću "${feature.name}"\n`;
        adminContent += `3. Provjeri da li je funkcionalnost dostupna i vidljiva\n`;
        adminContent += `4. Testiraj osnovne akcije funkcionalnosti\n`;
        
        if (feature.technicalDetails) {
          // Ekstraktuj API endpoint-e ili glavne korake iz technicalDetails
          const apiMatches = feature.technicalDetails.match(/`(GET|POST|PUT|PATCH|DELETE)\s+\/api\/[^`]+`/g);
          if (apiMatches && apiMatches.length > 0) {
            apiMatches.slice(0, 3).forEach((api, idx) => {
              const cleanApi = api.replace(/`/g, '');
              adminContent += `${idx + 5}. Testiraj API endpoint: ${cleanApi}\n`;
            });
          }
        }
        
        adminContent += `\n**Očekivani rezultat:**\n`;
        adminContent += `- Funkcionalnost "${feature.name}" je dostupna u admin panelu\n`;
        adminContent += `- UI elementi su prikazani ispravno\n`;
        if (feature.implemented) {
          adminContent += `- Funkcionalnost je implementirana i funkcionalna\n`;
        } else {
          adminContent += `- ⚠️ Funkcionalnost nije implementirana\n`;
        }
        
        if (feature.technicalDetails) {
          adminContent += `- Tehnički detalji su dostupni za pregled\n`;
        }
        adminContent += `\n`;
      });
      
      adminContent += `---\n\n`;
    });

    // Zapisi datoteke
    const projectRoot = join(__dirname, '../..');
    const frontendPath = join(projectRoot, 'TEST-PLAN-FRONTEND.md');
    const adminPath = join(projectRoot, 'TEST-PLAN-ADMIN.md');
    const backendFrontendPath = join(projectRoot, 'backend', 'TEST-PLAN-FRONTEND.md');
    const backendAdminPath = join(projectRoot, 'backend', 'TEST-PLAN-ADMIN.md');

    writeFileSync(frontendPath, frontendContent, 'utf-8');
    writeFileSync(adminPath, adminContent, 'utf-8');
    writeFileSync(backendFrontendPath, frontendContent, 'utf-8');
    writeFileSync(backendAdminPath, adminContent, 'utf-8');

    console.log('✅ Frontend test plan generated:');
    console.log(`   - ${frontendPath}`);
    console.log(`   - ${backendFrontendPath}`);
    console.log(`   📋 ${filteredPublicCategories.length} kategorija, ${filteredPublicCategories.reduce((sum, cat) => sum + cat.features.length, 0)} testova\n`);

    console.log('✅ Admin test plan generated:');
    console.log(`   - ${adminPath}`);
    console.log(`   - ${backendAdminPath}`);
    console.log(`   📋 ${adminCategories.length} kategorija, ${adminCategories.reduce((sum, cat) => sum + cat.features.length, 0)} testova\n`);

    console.log('✅ Test plans generated successfully!');
    console.log('   Commit and push these files to update test plans in production.\n');

  } catch (error) {
    console.error('❌ Error generating test plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

generateTestPlans()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });

