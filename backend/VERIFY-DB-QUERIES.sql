-- Database Verification Queries
-- Run these queries to check if migrations were applied

-- 1. Check if SubscriptionPlan table exists
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'SubscriptionPlan';

-- 2. Check Job table structure for userId column
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'Job' AND column_name = 'userId';

-- 3. Check for linkingToken columns in Job table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'Job' AND column_name IN ('linkingToken', 'linkingTokenExpiresAt');

-- 4. Check migration history for our migration
SELECT migration_name, applied_steps_count, started_at, finished_at 
FROM _prisma_migrations 
WHERE migration_name LIKE '%20250121%' OR migration_name LIKE '%subscription%' 
ORDER BY started_at DESC;

-- 5. Try to select from SubscriptionPlan (will fail if table doesn't exist)
SELECT name, displayName, price, credits, isPopular, displayOrder, isActive 
FROM "SubscriptionPlan" 
ORDER BY displayOrder;

-- 6. Check all recent migrations
SELECT migration_name, applied_steps_count, started_at, finished_at 
FROM _prisma_migrations 
ORDER BY started_at DESC 
LIMIT 10;
