#!/bin/bash
# Check migration status in ECS task
# Run this in ECS Execute Command terminal

set -e

echo "🔍 Checking migration status with Prisma..."
echo ""

# Check if DATABASE_URL is set (should be set in ECS task)
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set, using default..."
    export DATABASE_URL="postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"
fi

echo "1️⃣ Migration Status:"
echo "──────────────────────────────────────────────────"
npx prisma migrate status || echo "⚠️  Migration status check had issues"

echo ""
echo "2️⃣ Checking ProviderProfile columns:"
echo "──────────────────────────────────────────────────"

# Check isDirector column
if npx prisma db execute --stdin <<'EOF' 2>/dev/null | grep -q "isDirector"; then
    echo "✅ isDirector column EXISTS"
else
    echo "❌ isDirector column MISSING"
fi

# Check companyId column
if npx prisma db execute --stdin <<'EOF' 2>/dev/null | grep -q "companyId"; then
    echo "✅ companyId column EXISTS"
else
    echo "❌ companyId column MISSING"
fi

# Direct SQL query
echo ""
echo "3️⃣ Direct SQL Query:"
echo "──────────────────────────────────────────────────"
npx prisma db execute --stdin <<'EOF'
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'ProviderProfile'
  AND column_name IN ('isDirector', 'companyId')
ORDER BY column_name;
EOF

echo ""
echo "4️⃣ Migration History:"
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

