#!/bin/bash
# Quick check script for ECS Execute Command
# Just copy and paste this entire script into ECS terminal

echo "🔍 Quick Migration Check"
echo "========================"
echo ""

# 1. Migration status
echo "1️⃣ Migration Status:"
echo "──────────────────────────────────────────────────"
npx prisma migrate status 2>&1 | head -20
echo ""

# 2. Check columns
echo "2️⃣ Checking ProviderProfile columns:"
echo "──────────────────────────────────────────────────"
npx prisma db execute --stdin <<'EOF'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ProviderProfile' AND column_name = 'isDirector'
        ) THEN '✅ isDirector EXISTS'
        ELSE '❌ isDirector MISSING'
    END AS isDirector_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ProviderProfile' AND column_name = 'companyId'
        ) THEN '✅ companyId EXISTS'
        ELSE '❌ companyId MISSING'
    END AS companyId_status;
EOF

echo ""

# 3. Migration history
echo "3️⃣ Migration History:"
echo "──────────────────────────────────────────────────"
npx prisma db execute --stdin <<'EOF'
SELECT 
    migration_name,
    applied_steps_count,
    started_at,
    finished_at
FROM _prisma_migrations
WHERE migration_name = '20251123000000_add_director_fields'
ORDER BY started_at DESC
LIMIT 1;
EOF

echo ""
echo "✅ Check complete!"
echo ""
echo "💡 If columns are MISSING, run:"
echo "   psql \$DATABASE_URL -c \"ALTER TABLE ProviderProfile ADD COLUMN IF NOT EXISTS isDirector BOOLEAN NOT NULL DEFAULT false;\""
echo "   psql \$DATABASE_URL -c \"ALTER TABLE ProviderProfile ADD COLUMN IF NOT EXISTS companyId TEXT;\""

