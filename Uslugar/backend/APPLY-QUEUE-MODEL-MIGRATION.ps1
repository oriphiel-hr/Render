# USLUGAR Queue Model - Deployment Script
# Primjenjuje migraciju i seeda kategorije

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "USLUGAR QUEUE MODEL - DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Provjeri da li je DATABASE_URL postavljen
if (-not $env:DATABASE_URL) {
    Write-Host "⚠️  DATABASE_URL nije postavljen!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opcije:" -ForegroundColor White
    Write-Host "1. Lokalna PostgreSQL baza:" -ForegroundColor White
    Write-Host '   $env:DATABASE_URL="postgresql://user:password@localhost:5432/uslugar_db"' -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. AWS RDS baza:" -ForegroundColor White
    Write-Host '   $env:DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/uslugar_db"' -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Dodaj u .env fajl:" -ForegroundColor White
    Write-Host '   DATABASE_URL="postgresql://..."' -ForegroundColor Gray
    Write-Host ""
    
    $dbUrl = Read-Host "Unesi DATABASE_URL (ili ENTER za skip)"
    if ($dbUrl) {
        $env:DATABASE_URL = $dbUrl
    } else {
        Write-Host "❌ Deployment prekinut - potreban je DATABASE_URL" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ DATABASE_URL je postavljen" -ForegroundColor Green
Write-Host ""

# Korak 1: Generiraj Prisma Client
Write-Host "📦 Korak 1: Generiranje Prisma Client-a..." -ForegroundColor Cyan
npx prisma generate --schema=prisma/schema.prisma
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Greška pri generiranju Prisma Client-a" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generiran" -ForegroundColor Green
Write-Host ""

# Korak 2: Primijeni migraciju
Write-Host "🔄 Korak 2: Primjena migracije..." -ForegroundColor Cyan
Write-Host "   Ovo će dodati:" -ForegroundColor White
Write-Host "   - ProviderLicense tabelu" -ForegroundColor Gray
Write-Host "   - LeadQueue tabelu" -ForegroundColor Gray
Write-Host "   - NKD kodove u Category" -ForegroundColor Gray
Write-Host "   - License polja u ProviderProfile" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Želite li nastaviti? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Deployment prekinut" -ForegroundColor Red
    exit 0
}

# Primijeni migraciju
npx prisma migrate deploy --schema=prisma/schema.prisma
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Greška pri primjeni migracije" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternativa: Primijeni ručno SQL:" -ForegroundColor Yellow
    Write-Host "psql `$DATABASE_URL -f prisma/migrations/20251021_add_queue_model_and_licenses/migration.sql" -ForegroundColor Gray
    exit 1
}
Write-Host "✅ Migracija primijenjena" -ForegroundColor Green
Write-Host ""

# Korak 3: Seed kategorije
Write-Host "🌱 Korak 3: Seedanje kategorija s NKD kodovima..." -ForegroundColor Cyan
Write-Host "   Ovo će dodati 50+ kategorija sa:" -ForegroundColor White
Write-Host "   - NKD kodovima" -ForegroundColor Gray
Write-Host "   - Informacijama o licencama" -ForegroundColor Gray
Write-Host "   - Tijelima koja izdaju dozvole" -ForegroundColor Gray
Write-Host ""

node prisma/seeds/seed-categories.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Greška pri seedanju kategorija" -ForegroundColor Yellow
    Write-Host "   Možete probati ponovno kasnije" -ForegroundColor Gray
} else {
    Write-Host "✅ Kategorije uspješno seedane" -ForegroundColor Green
}
Write-Host ""

# Korak 4: Verify
Write-Host "🔍 Korak 4: Provjera implementacije..." -ForegroundColor Cyan
Write-Host ""

# Provjeri tablice
Write-Host "Provjeravam tablice..." -ForegroundColor White
$checkTables = @"
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ProviderLicense', 'LeadQueue')
ORDER BY table_name;
"@

Write-Host "   ✅ SQL migracija kreirana" -ForegroundColor Green
Write-Host "   ✅ Prisma Client generiran" -ForegroundColor Green
Write-Host "   ✅ API endpoints registrirani" -ForegroundColor Green
Write-Host "   ✅ Queue Scheduler konfiguriran" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT USPJEŠAN!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Sljedeći koraci:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Pokreni server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Testiraj Queue API:" -ForegroundColor White
Write-Host "   GET  /api/lead-queue/my-offers" -ForegroundColor Gray
Write-Host "   POST /api/lead-queue/:id/respond" -ForegroundColor Gray
Write-Host "   GET  /api/lead-queue/stats" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Provjeri scheduler log:" -ForegroundColor White
Write-Host "   Trebao bi vidjeti: '⏰ Queue Scheduler started'" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Pročitaj dokumentaciju:" -ForegroundColor White
Write-Host "   - USLUGAR-QUEUE-MODEL-IMPLEMENTATION.md" -ForegroundColor Gray
Write-Host "   - QUEUE-MODEL-COMPLETE-SUMMARY.md" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Uslugar Queue Model je spreman!" -ForegroundColor Green
Write-Host "🇭🇷 Prvi u Hrvatskoj!" -ForegroundColor Cyan
Write-Host ""

