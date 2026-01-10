-- Verify if migration 20251123000000_add_director_fields was actually applied
-- Run this on production database to check

-- 1. Check if migration is recorded in _prisma_migrations
SELECT 
    migration_name,
    applied_steps_count,
    started_at,
    finished_at,
    rolled_back_at,
    logs
FROM _prisma_migrations
WHERE migration_name = '20251123000000_add_director_fields'
ORDER BY started_at DESC
LIMIT 1;

-- 2. Check if columns actually exist
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

-- 3. Check if foreign key exists
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public."ProviderProfile"'::regclass
  AND conname = 'ProviderProfile_companyId_fkey';

-- 4. Check if indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'ProviderProfile'
  AND indexname IN ('ProviderProfile_isDirector_idx', 'ProviderProfile_companyId_idx')
ORDER BY indexname;

-- 5. SUMMARY - All in one query
SELECT 
    -- Migration status
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM _prisma_migrations 
            WHERE migration_name = '20251123000000_add_director_fields'
        ) THEN '✅ Migration recorded'
        ELSE '❌ Migration NOT recorded'
    END AS migration_status,
    
    -- Column status
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
    
    -- Foreign key status
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'ProviderProfile_companyId_fkey'
        ) THEN '✅ Foreign key exists'
        ELSE '❌ Foreign key MISSING'
    END AS foreign_key_status,
    
    -- Indexes status
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'ProviderProfile' 
            AND indexname = 'ProviderProfile_isDirector_idx'
        ) THEN '✅ isDirector index exists'
        ELSE '❌ isDirector index MISSING'
    END AS isDirector_index_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'ProviderProfile' 
            AND indexname = 'ProviderProfile_companyId_idx'
        ) THEN '✅ companyId index exists'
        ELSE '❌ companyId index MISSING'
    END AS companyId_index_status;

