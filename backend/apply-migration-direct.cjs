/**
 * USLUGAR Queue Model - Direct Database Migration
 * 
 * Spaja se direktno na AWS RDS i primjenjuje migraciju
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = "postgresql://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar?schema=public";

async function applyMigration() {
    console.log('═'.repeat(60));
    console.log('🚀 USLUGAR Queue Model - Direct Migration');
    console.log('═'.repeat(60));
    console.log('');

    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // AWS RDS requires SSL
        }
    });

    try {
        // Connect
        console.log('🔌 Connecting to AWS RDS database...');
        await client.connect();
        console.log('✅ Connected successfully');
        console.log('');

        // Read migration SQL
        console.log('📄 Reading migration SQL...');
        const migrationPath = path.join(__dirname, 'prisma', 'migrations', '20251021_add_queue_model_and_licenses', 'migration.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        console.log('✅ Migration SQL loaded');
        console.log('');

        // Apply migration
        console.log('🔄 Applying migration...');
        console.log('   This will add:');
        console.log('   - LeadQueueStatus enum');
        console.log('   - QueueResponse enum');
        console.log('   - NKD codes to Category table');
        console.log('   - License fields to ProviderProfile table');
        console.log('   - ProviderLicense table');
        console.log('   - LeadQueue table');
        console.log('   - All necessary indexes and foreign keys');
        console.log('');

        await client.query(migrationSQL);
        
        console.log('✅ Migration applied successfully!');
        console.log('');

        // Verify tables
        console.log('🔍 Verifying new tables...');
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('ProviderLicense', 'LeadQueue')
            ORDER BY table_name;
        `);
        
        if (result.rows.length === 2) {
            console.log('✅ Tables created:');
            result.rows.forEach(row => {
                console.log(`   ✓ ${row.table_name}`);
            });
        } else {
            console.log('⚠️  Warning: Expected 2 tables, found', result.rows.length);
        }
        console.log('');

        // Check Category columns
        console.log('🔍 Verifying Category columns...');
        const categoryCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Category' 
            AND column_name IN ('nkdCode', 'requiresLicense', 'licenseType', 'licenseAuthority')
            ORDER BY column_name;
        `);
        
        console.log(`✅ Category columns added: ${categoryCheck.rows.length}/4`);
        categoryCheck.rows.forEach(row => {
            console.log(`   ✓ ${row.column_name}`);
        });
        console.log('');

        console.log('═'.repeat(60));
        console.log('✅ MIGRATION COMPLETE!');
        console.log('═'.repeat(60));
        console.log('');
        console.log('🌱 Next step: Seed categories with NKD codes');
        console.log('   Run: node prisma/seeds/seed-categories.js');
        console.log('');

    } catch (error) {
        console.error('═'.repeat(60));
        console.error('❌ MIGRATION FAILED!');
        console.error('═'.repeat(60));
        console.error('');
        console.error('Error:', error.message);
        console.error('');
        
        if (error.message.includes('already exists')) {
            console.log('ℹ️  Note: Some objects already exist. This might be OK.');
            console.log('   Run seed script to continue:');
            console.log('   node prisma/seeds/seed-categories.js');
        } else if (error.message.includes('connect')) {
            console.error('🔒 Connection failed. Check:');
            console.error('   1. Security Group allows your IP');
            console.error('   2. Database is running');
            console.error('   3. Credentials are correct');
        }
        
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Run
applyMigration().catch(console.error);

