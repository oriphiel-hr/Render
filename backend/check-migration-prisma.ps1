# Check migration status using Prisma CLI
# PowerShell version

Write-Host "🔍 Checking migration status with Prisma..." -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL environment variable is not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Set it like this:" -ForegroundColor Yellow
    Write-Host '   $env:DATABASE_URL = "postgres://user:pass@host:5432/dbname"'
    Write-Host ""
    Write-Host "For production database:" -ForegroundColor Gray
    Write-Host '   $env:DATABASE_URL = "postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"'
    exit 1
}

Write-Host "📊 Database: $($env:DATABASE_URL -replace ':[^:@]+@', ':****@')" -ForegroundColor Gray
Write-Host ""

# 1. Check migration status
Write-Host "1️⃣ Checking migration status..." -ForegroundColor Cyan
Write-Host ("─" * 50) -ForegroundColor Gray
try {
    $statusOutput = npx prisma migrate status 2>&1
    Write-Host $statusOutput
} catch {
    Write-Host "⚠️  Migration status check had issues" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
}

Write-Host ""

# 2. Check if migration file exists
Write-Host "2️⃣ Checking for director fields migration file..." -ForegroundColor Cyan
Write-Host ("─" * 50) -ForegroundColor Gray
$migrationPath = "prisma\migrations\20251123000000_add_director_fields\migration.sql"
if (Test-Path $migrationPath) {
    Write-Host "✅ Migration file exists: 20251123000000_add_director_fields" -ForegroundColor Green
    $content = Get-Content $migrationPath -Raw
    Write-Host "   File size: $($content.Length) bytes" -ForegroundColor Gray
    if ($content -match 'isDirector') {
        Write-Host "   Contains isDirector: ✅" -ForegroundColor Green
    } else {
        Write-Host "   Contains isDirector: ❌" -ForegroundColor Red
    }
    if ($content -match 'companyId') {
        Write-Host "   Contains companyId: ✅" -ForegroundColor Green
    } else {
        Write-Host "   Contains companyId: ❌" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Migration file NOT found: $migrationPath" -ForegroundColor Red
}

Write-Host ""

# 3. Check database schema using Prisma
Write-Host "3️⃣ Checking database schema (ProviderProfile table)..." -ForegroundColor Cyan
Write-Host ("─" * 50) -ForegroundColor Gray
Write-Host "   Running Prisma query to check columns..." -ForegroundColor Gray
Write-Host ""

# Use Node.js script for database queries
node check-migration-prisma.cjs

Write-Host ""
Write-Host "4️⃣ Summary" -ForegroundColor Cyan
Write-Host ("─" * 50) -ForegroundColor Gray
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "   - If columns are missing, check: fix-director-fields-manually.sql" -ForegroundColor Gray
Write-Host "   - Or wait for auto-fix on server restart" -ForegroundColor Gray
Write-Host "   - Or manually apply migration SQL from migration file" -ForegroundColor Gray

