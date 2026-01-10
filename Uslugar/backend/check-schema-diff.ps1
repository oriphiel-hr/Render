# Check differences between Prisma schema and production database
# This script compares the schema with the actual database structure

Write-Host "🔍 Checking differences between Prisma schema and production database..." -ForegroundColor Cyan
Write-Host ""

cd uslugar\backend

# Set production DATABASE_URL
$env:DATABASE_URL = "postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"

Write-Host "📊 Database: Production (AWS RDS)" -ForegroundColor Yellow
Write-Host ""

# Check migration status
Write-Host "1️⃣ Checking migration status..." -ForegroundColor Cyan
npx prisma migrate status

Write-Host ""
Write-Host "2️⃣ Checking schema differences..." -ForegroundColor Cyan
Write-Host "   (This shows what would change if we run 'prisma db push')" -ForegroundColor Gray
Write-Host ""

# Use prisma db pull to see what's in the database
# Then compare with schema
npx prisma db pull --print 2>&1 | Out-File -FilePath "db-schema-temp.prisma" -Encoding UTF8

Write-Host "✅ Check complete!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 To see detailed differences, run:" -ForegroundColor Yellow
Write-Host "   npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script" -ForegroundColor Gray


