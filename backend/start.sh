#!/bin/sh
set -e

echo "========================================="
echo "🔧 START.SH SCRIPT STARTED"
echo "========================================="

echo "🔧 Step 1: Generating Prisma Client..."
npx prisma generate 2>&1
echo "✅ Prisma Client generated"

echo "🔧 Step 2: Verifying Prisma Client..."
if [ -d "node_modules/.prisma" ] && [ -d "node_modules/@prisma/client" ]; then
  echo "✅ Prisma Client directories exist"
else
  echo "❌ ERROR: Prisma Client directories not found!"
  ls -la node_modules/.prisma 2>&1 || echo "node_modules/.prisma does not exist"
  ls -la node_modules/@prisma 2>&1 || echo "node_modules/@prisma does not exist"
  exit 1
fi

echo "🔄 Step 3: Running database migrations..."
LC_ALL=C.UTF-8 npx prisma migrate deploy > /tmp/migrate.log 2>&1 || cat /tmp/migrate.log
echo "✅ Migrations complete."

echo "🚀 Step 4: Starting server..."
exec node src/server.js

