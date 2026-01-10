-- Manual fix for isDirector and companyId fields
-- Run this directly on production database if migration didn't apply correctly

-- 1. Check current state
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ProviderProfile'
  AND column_name IN ('isDirector', 'companyId');

-- 2. Add isDirector column (if missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ProviderProfile' 
        AND column_name = 'isDirector'
    ) THEN
        ALTER TABLE "ProviderProfile" 
        ADD COLUMN "isDirector" BOOLEAN NOT NULL DEFAULT false;
        
        RAISE NOTICE '✅ Added isDirector column';
    ELSE
        RAISE NOTICE 'ℹ️  isDirector column already exists';
    END IF;
END $$;

-- 3. Add companyId column (if missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ProviderProfile' 
        AND column_name = 'companyId'
    ) THEN
        ALTER TABLE "ProviderProfile" 
        ADD COLUMN "companyId" TEXT;
        
        RAISE NOTICE '✅ Added companyId column';
    ELSE
        RAISE NOTICE 'ℹ️  companyId column already exists';
    END IF;
END $$;

-- 4. Add foreign key constraint (if missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ProviderProfile_companyId_fkey'
    ) THEN
        ALTER TABLE "ProviderProfile" 
        ADD CONSTRAINT "ProviderProfile_companyId_fkey" 
        FOREIGN KEY ("companyId") 
        REFERENCES "ProviderProfile"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
        
        RAISE NOTICE '✅ Added foreign key constraint';
    ELSE
        RAISE NOTICE 'ℹ️  Foreign key constraint already exists';
    END IF;
END $$;

-- 5. Create indexes (if missing)
CREATE INDEX IF NOT EXISTS "ProviderProfile_isDirector_idx" 
ON "ProviderProfile"("isDirector");

CREATE INDEX IF NOT EXISTS "ProviderProfile_companyId_idx" 
ON "ProviderProfile"("companyId");

-- 6. Verify final state
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

