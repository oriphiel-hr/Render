#!/bin/sh
# USLUGAR Queue Model - ECS Migration Script

set -e

echo "════════════════════════════════════════════════════════════"
echo "🚀 USLUGAR Queue Model - Migration on ECS"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "🔄 Generating Prisma Client..."
npx prisma generate --schema=prisma/schema.prisma
echo "✅ Prisma Client generated"
echo ""

echo "🔄 Applying database migration..."
npx prisma migrate deploy --schema=prisma/schema.prisma
echo "✅ Migration applied"
echo ""

echo "🌱 Seeding categories with NKD codes..."
if [ -f "prisma/seeds/seed-categories.js" ]; then
    node prisma/seeds/seed-categories.js
    echo "✅ Categories seeded"
else
    echo "⚠️  Seed file not found"
fi
echo ""

echo "════════════════════════════════════════════════════════════"
echo "✅ MIGRATION COMPLETE!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🎉 Queue Model is now active on AWS!"
echo ""

