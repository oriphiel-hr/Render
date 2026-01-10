// Database Schema Fix - Add missing columns
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL || 'postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar'
});

async function main() {
  console.log('🔧 Fixing database schema...');
  console.log('Connecting to:', process.env.DATABASE_URL ? '(from env)' : 'production database');
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check if columns exist
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Job' 
      AND column_name IN ('projectType', 'customFields')
    `);
    
    const existingColumns = checkResult.rows.map(r => r.column_name);
    console.log('Existing columns:', existingColumns);
    
    // Add projectType if missing
    if (!existingColumns.includes('projectType')) {
      console.log('Adding projectType column...');
      await client.query('ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "projectType" TEXT');
      console.log('✅ projectType column added');
    } else {
      console.log('✅ projectType column already exists');
    }
    
    // Add customFields if missing
    if (!existingColumns.includes('customFields')) {
      console.log('Adding customFields column...');
      await client.query('ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "customFields" JSONB');
      console.log('✅ customFields column added');
    } else {
      console.log('✅ customFields column already exists');
    }
    
    console.log('');
    console.log('🎉 Database schema fix complete!');
    console.log('');
    console.log('Test: https://uslugar.oriph.io/#leads');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

