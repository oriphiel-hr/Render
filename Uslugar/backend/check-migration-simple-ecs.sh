#!/bin/bash
# Simple migration check for ECS
# Just run: bash check-migration-simple-ecs.sh

echo "🔍 Quick Migration Check"
echo ""

# 1. Migration status
echo "1️⃣ Migration Status:"
npx prisma migrate status
echo ""

# 2. Check columns directly
echo "2️⃣ Checking columns:"
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
echo "✅ Done!"

