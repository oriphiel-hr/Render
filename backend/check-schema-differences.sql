-- Check differences between Prisma schema and database
-- Run this query against production database to see what's missing

-- 1. Check if isDirector and companyId columns exist in ProviderProfile
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ProviderProfile'
  AND column_name IN ('isDirector', 'companyId')
ORDER BY column_name;

-- 2. Check if foreign key constraint exists
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'public."ProviderProfile"'::regclass
  AND conname = 'ProviderProfile_companyId_fkey';

-- 3. Check if indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'ProviderProfile'
  AND indexname IN ('ProviderProfile_isDirector_idx', 'ProviderProfile_companyId_idx');

-- 4. Check all ProviderProfile columns (to see what exists)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ProviderProfile'
ORDER BY ordinal_position;

-- 5. Check migration history for director fields migration
SELECT 
    migration_name,
    applied_steps_count,
    started_at,
    finished_at
FROM _prisma_migrations
WHERE migration_name LIKE '%director%'
ORDER BY started_at DESC;

-- Summary query - shows what's missing
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ProviderProfile' AND column_name = 'isDirector'
        ) THEN '✅ isDirector exists'
        ELSE '❌ isDirector MISSING'
    END AS isDirector_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ProviderProfile' AND column_name = 'companyId'
        ) THEN '✅ companyId exists'
        ELSE '❌ companyId MISSING'
    END AS companyId_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'ProviderProfile_companyId_fkey'
        ) THEN '✅ Foreign key exists'
        ELSE '❌ Foreign key MISSING'
    END AS foreign_key_status;


