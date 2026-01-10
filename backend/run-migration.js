/**
 * USLUGAR Queue Model - Migration Runner
 * 
 * Ovaj file se automatski pokreće pri deployment-u na AWS
 * Primjenjuje migracije i seeda kategorije
 */

const { execSync } = require('child_process');

async function runMigration() {
    console.log('=' .repeat(50));
    console.log('🚀 USLUGAR Queue Model - Migration');
    console.log('=' .repeat(50));
    console.log('');
    
    try {
        // Korak 1: Prisma Generate
        console.log('📦 Step 1: Generating Prisma Client...');
        execSync('npx prisma generate --schema=prisma/schema.prisma', { 
            stdio: 'inherit' 
        });
        console.log('✅ Prisma Client generated');
        console.log('');
        
        // Korak 2: Apply Migration
        console.log('🔄 Step 2: Applying migration...');
        console.log('   - Adding ProviderLicense table');
        console.log('   - Adding LeadQueue table');
        console.log('   - Adding NKD codes to Category');
        console.log('   - Adding license fields to ProviderProfile');
        console.log('');
        
        execSync('npx prisma migrate deploy --schema=prisma/schema.prisma', { 
            stdio: 'inherit' 
        });
        console.log('✅ Migration applied successfully');
        console.log('');
        
        // Korak 3: Seed Categories
        console.log('🌱 Step 3: Seeding categories with NKD codes...');
        execSync('node prisma/seeds/seed-categories.js', { 
            stdio: 'inherit' 
        });
        console.log('✅ Categories seeded');
        console.log('');
        
        console.log('=' .repeat(50));
        console.log('✅ MIGRATION COMPLETE!');
        console.log('=' .repeat(50));
        console.log('');
        console.log('🎯 Queue Model is now active!');
        console.log('');
        
        process.exit(0);
    } catch (error) {
        console.error('=' .repeat(50));
        console.error('❌ MIGRATION FAILED');
        console.error('=' .repeat(50));
        console.error('');
        console.error('Error:', error.message);
        console.error('');
        console.error('Check DATABASE_URL is set correctly');
        console.error('Check network connectivity to RDS');
        console.error('');
        process.exit(1);
    }
}

// Pokreni migraciju
runMigration();

