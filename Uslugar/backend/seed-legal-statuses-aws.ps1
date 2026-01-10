# Pokreni seed za Legal Statuses na AWS RDS bazi
# NAPOMENA: Trebate imati DATABASE_URL postavljen u environment varijabli ili .env file

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SEED: Legal Statuses na AWS RDS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Provjeri postoji li .env
if (-Not (Test-Path ".env")) {
    Write-Host "ERROR: .env file ne postoji!" -ForegroundColor Red
    Write-Host "Kopirajte ENV_EXAMPLE.txt u .env i unesite AWS RDS podatke" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Učitavanje .env file-a..." -ForegroundColor Yellow
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "env:$name" -Value $value
    }
}

if (-Not $env:DATABASE_URL) {
    Write-Host "ERROR: DATABASE_URL nije postavljen!" -ForegroundColor Red
    exit 1
}

Write-Host "2. DATABASE_URL pronađen" -ForegroundColor Green
Write-Host ""

# Pokreni Prisma DB Execute sa SQL file-om
Write-Host "3. Izvršavanje SQL skripte..." -ForegroundColor Yellow
Write-Host ""

$sqlContent = Get-Content "prisma/insert-legal-statuses.sql" -Raw

# Opcija 1: Koristi psql (PostgreSQL klijent)
Write-Host "Opcija 1: Koristi 'psql' PostgreSQL klijent" -ForegroundColor Cyan
Write-Host "Komanda: psql `$env:DATABASE_URL -f prisma/insert-legal-statuses.sql" -ForegroundColor Gray
Write-Host ""

# Opcija 2: Koristi node seed.js (trebate lokalno povezanu bazu ili AWS tuneliranje)
Write-Host "Opcija 2: Koristi Node.js seed skriptu" -ForegroundColor Cyan
Write-Host "Komanda: npm run seed" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "UPUTE:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Spojite se na AWS RDS bazu putem:" -ForegroundColor White
Write-Host "   - AWS Console Query Editor" -ForegroundColor Gray
Write-Host "   - pgAdmin ili DBeaver" -ForegroundColor Gray
Write-Host "   - psql command line" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Kopirajte sadržaj file-a:" -ForegroundColor White
Write-Host "   prisma/insert-legal-statuses.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Izvršite SQL u bazi" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Prikaži SQL sadržaj za copy-paste
Write-Host ""
Write-Host "SQL SADRŽAJ (kopirajte i zalijepite u query editor):" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Gray
Write-Host $sqlContent -ForegroundColor White
Write-Host "========================================" -ForegroundColor Gray

