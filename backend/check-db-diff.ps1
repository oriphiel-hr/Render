# Check differences between Prisma schema and production database

$env:DATABASE_URL = "postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"

Write-Host "🔍 Checking migration status..." -ForegroundColor Cyan
npx prisma migrate status

Write-Host ""
Write-Host "🔍 Checking schema differences..." -ForegroundColor Cyan
Write-Host "   (Comparing Prisma schema with database structure)" -ForegroundColor Gray
Write-Host ""

# Use migrate diff to see what's different
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script


