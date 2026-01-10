# Simple Prisma migration check
# Set DATABASE_URL first!

Write-Host "🔍 Checking migration status with Prisma..." -ForegroundColor Cyan
Write-Host ""

if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Set it like this:" -ForegroundColor Yellow
    Write-Host '   $env:DATABASE_URL = "postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"'
    exit 1
}

Write-Host "1️⃣ Migration Status:" -ForegroundColor Cyan
npx prisma migrate status

Write-Host ""
Write-Host "2️⃣ Checking database columns..." -ForegroundColor Cyan
node check-migration-prisma.cjs

