-- Comprehensive check of ALL ProviderProfile fields
-- This query checks if all fields from Prisma schema exist in the database

-- 1. Get all columns that SHOULD exist (from Prisma schema)
-- Expected fields based on schema.prisma:
WITH expected_fields AS (
  SELECT unnest(ARRAY[
    'id', 'userId', 'bio', 'portfolio', 'ratingAvg', 'ratingCount',
    'avgResponseTimeMinutes', 'totalResponseTimeTracked', 'conversionRate',
    'serviceArea', 'specialties', 'experience', 'website', 'isAvailable',
    'legalStatusId', 'taxId', 'companyName',
    'maxCategories', 'nkdCodes',
    'isFeatured',
    'approvalStatus',
    'kycVerified', 'kycDocumentUrl', 'kycExtractedOib', 'kycExtractedName',
    'kycDocumentType', 'kycPublicConsent', 'kycVerificationNotes', 'kycVerifiedAt',
    'kycOcrVerified', 'kycOibValidated', 'kycObrtnRegChecked', 'kycKamaraChecked', 'kycViesChecked',
    'identityEmailAddress', 'identityEmailToken', 'identityEmailTokenExpiresAt',
    'identityEmailVerified', 'identityEmailVerifiedAt',
    'isDirector', 'companyId'
  ]) AS field_name
),
actual_fields AS (
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'ProviderProfile'
)
SELECT 
  ef.field_name,
  CASE 
    WHEN af.column_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status,
  CASE 
    WHEN af.column_name IS NOT NULL THEN 
      (SELECT data_type || 
       CASE WHEN is_nullable = 'YES' THEN ' (nullable)' ELSE ' (not null)' END
       FROM information_schema.columns 
       WHERE table_name = 'ProviderProfile' AND column_name = ef.field_name)
    ELSE 'N/A'
  END AS data_type
FROM expected_fields ef
LEFT JOIN actual_fields af ON ef.field_name = af.column_name
ORDER BY 
  CASE WHEN af.column_name IS NULL THEN 0 ELSE 1 END,
  ef.field_name;

-- 2. Summary - count missing fields
SELECT 
  COUNT(*) FILTER (WHERE status = '❌ MISSING') AS missing_count,
  COUNT(*) FILTER (WHERE status = '✅ EXISTS') AS existing_count,
  COUNT(*) AS total_expected
FROM (
  SELECT 
    ef.field_name,
    CASE 
      WHEN af.column_name IS NOT NULL THEN '✅ EXISTS'
      ELSE '❌ MISSING'
    END AS status
  FROM expected_fields ef
  LEFT JOIN actual_fields af ON ef.field_name = af.column_name
) AS field_status;

-- 3. Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'ProviderProfile'
ORDER BY indexname;

-- 4. Check foreign keys
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public."ProviderProfile"'::regclass
  AND contype = 'f'
ORDER BY conname;

