# Check migration status for production database
# This script sets DATABASE_URL and runs Prisma checks

$env:DATABASE_URL = "postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"

Write-Host "🔍 Checking migration status with Prisma..." -ForegroundColor Cyan
Write-Host "📊 Database: Production (AWS RDS)" -ForegroundColor Gray
Write-Host ""

# Run the Node.js check script
node check-migration-prisma.cjs

