#!/usr/bin/env node
/**
 * Check migration status using Prisma CLI
 * This script checks if migrations are applied and compares schema with database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking migration status with Prisma...\n');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.log('\n💡 Set it like this:');
  console.log('   export DATABASE_URL="postgres://user:pass@host:5432/dbname"');
  console.log('   Or on Windows:');
  console.log('   $env:DATABASE_URL="postgres://user:pass@host:5432/dbname"');
  console.log('\nFor production:');
  console.log('   $env:DATABASE_URL="postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"');
  process.exit(1);
}

async function checkDatabase() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Try to query isDirector column
    try {
      await prisma.$queryRaw`SELECT "isDirector" FROM "ProviderProfile" LIMIT 1`;
      console.log('✅ isDirector column EXISTS in database');
    } catch (error) {
      if (error.message.includes('does not exist') || (error.message.includes('column') && error.message.includes('isDirector'))) {
        console.log('❌ isDirector column MISSING in database');
      } else {
        console.log('⚠️  Could not check isDirector:', error.message);
      }
    }

    // Try to query companyId column
    try {
      await prisma.$queryRaw`SELECT "companyId" FROM "ProviderProfile" LIMIT 1`;
      console.log('✅ companyId column EXISTS in database');
    } catch (error) {
      if (error.message.includes('does not exist') || (error.message.includes('column') && error.message.includes('companyId'))) {
        console.log('❌ companyId column MISSING in database');
      } else {
        console.log('⚠️  Could not check companyId:', error.message);
      }
    }

    // Check migration history
    try {
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, applied_steps_count, started_at, finished_at
        FROM _prisma_migrations
        WHERE migration_name = '20251123000000_add_director_fields'
        ORDER BY started_at DESC
        LIMIT 1
      `;
      
      if (migrations && migrations.length > 0) {
        console.log('\n✅ Migration is recorded in _prisma_migrations:');
        console.log(`   Name: ${migrations[0].migration_name}`);
        console.log(`   Applied steps: ${migrations[0].applied_steps_count}`);
        console.log(`   Started: ${migrations[0].started_at}`);
        console.log(`   Finished: ${migrations[0].finished_at || 'N/A'}`);
      } else {
        console.log('\n❌ Migration NOT found in _prisma_migrations');
        console.log('   This means the migration was never applied');
      }
    } catch (error) {
      console.log('\n⚠️  Could not check migration history:', error.message);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ Error connecting to database:', error.message);
    console.log('   Make sure DATABASE_URL is correct and database is accessible');
  }
}

async function main() {
  try {
    // 1. Check migration status
    console.log('1️⃣ Checking migration status...');
    console.log('─'.repeat(50));
    try {
      const statusOutput = execSync('npx prisma migrate status', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      console.log(statusOutput);
    } catch (error) {
      console.log(error.stdout || error.message);
      if (error.status !== 0) {
        console.log('\n⚠️  Migration status check had issues (this is normal if migrations are pending)');
      }
    }

    console.log('\n');

    // 2. Check if specific migration exists
    console.log('2️⃣ Checking for director fields migration...');
    console.log('─'.repeat(50));
    try {
      const migrationPath = path.join(__dirname, 'prisma', 'migrations', '20251123000000_add_director_fields', 'migration.sql');
      if (fs.existsSync(migrationPath)) {
        console.log('✅ Migration file exists: 20251123000000_add_director_fields');
        const migrationContent = fs.readFileSync(migrationPath, 'utf-8');
        console.log(`   File size: ${migrationContent.length} bytes`);
        console.log(`   Contains isDirector: ${migrationContent.includes('isDirector') ? '✅' : '❌'}`);
        console.log(`   Contains companyId: ${migrationContent.includes('companyId') ? '✅' : '❌'}`);
      } else {
        console.log('❌ Migration file NOT found: 20251123000000_add_director_fields');
      }
    } catch (error) {
      console.log('❌ Error checking migration file:', error.message);
    }

    console.log('\n');

    // 3. Check database schema directly
    console.log('3️⃣ Checking database schema (ProviderProfile table)...');
    console.log('─'.repeat(50));
    await checkDatabase();

    console.log('\n');

    // 4. Summary
    console.log('4️⃣ Summary');
    console.log('─'.repeat(50));
    console.log('💡 Next steps:');
    console.log('   - If columns are missing, run: fix-director-fields-manually.sql');
    console.log('   - Or wait for auto-fix on server restart (ensureDirectorFields in server.js)');
    console.log('   - Or manually apply migration SQL from: prisma/migrations/20251123000000_add_director_fields/migration.sql');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
