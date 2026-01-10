# Import SQL dump to Render.com PostgreSQL
# Quick import script

$ErrorActionPreference = "Stop"

$renderDbUrl = "postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com/uslugar"
$backupFile = "backup\uslugar_complete_backup_20260107_232327.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 IMPORT BAZE U RENDER.COM" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backup file exists
if (-not (Test-Path $backupFile)) {
    Write-Host "❌ SQL dump nije pronađen: $backupFile" -ForegroundColor Red
    Write-Host "`nProvjeri da li je fajl kopiran u Render\backup\" -ForegroundColor Yellow
    exit 1
}

$fileSize = (Get-Item $backupFile).Length / 1MB
Write-Host "📄 SQL Dump: $backupFile" -ForegroundColor White
Write-Host "   Veličina: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Render Database:" -ForegroundColor White
Write-Host "   postgresql://uslugar_user:...@dpg-d5g06gshg0os738en9cg-a/uslugar" -ForegroundColor Gray
Write-Host ""

# Parse DATABASE_URL
$uri = [System.Uri]::new($renderDbUrl)
$userInfo = $uri.UserInfo.Split(':')
$renderUser = $userInfo[0]
$renderPassword = $userInfo[1]
$renderHost = $uri.Host
$renderPort = if ($uri.Port -ne -1) { $uri.Port } else { 5432 }
$renderDb = $uri.AbsolutePath.TrimStart('/')

Write-Host "📊 Detalji:" -ForegroundColor Yellow
Write-Host "   Host: $renderHost" -ForegroundColor Gray
Write-Host "   Port: $renderPort" -ForegroundColor Gray
Write-Host "   Database: $renderDb" -ForegroundColor Gray
Write-Host "   User: $renderUser" -ForegroundColor Gray
Write-Host ""

# Warning
Write-Host "⚠️  UPOZORENJE: Ovo će OBRISATI sve postojeće podatke u Render.com bazi!" -ForegroundColor Yellow
Write-Host ""
# Check for -AutoConfirm flag
$autoConfirm = $args -contains "-AutoConfirm"
if (-not $autoConfirm) {
    $confirm = Read-Host "Nastaviti? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "Import otkazan." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "⚠️  Auto-confirm aktiviran - nastavljam bez pitanja" -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "🔍 Testiranje konekcije..." -ForegroundColor Yellow
$env:PGPASSWORD = $renderPassword

# Test connection
$testResult = docker run --rm `
    -e PGPASSWORD=$env:PGPASSWORD `
    postgres:16 `
    psql -h $renderHost -p $renderPort -U $renderUser -d $renderDb -c "SELECT version();" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Neuspješna konekcija na Render.com bazu" -ForegroundColor Red
    Write-Host $testResult
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "✅ Konekcija uspješna!" -ForegroundColor Green
Write-Host ""

# Import
Write-Host "📥 Importiranje SQL dump-a..." -ForegroundColor Yellow
Write-Host "   Ovo može potrajati 10-30 minuta ovisno o veličini baze..." -ForegroundColor Gray
Write-Host ""

# Copy to temp for Docker
$tempFile = Join-Path $env:TEMP "render_import_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
Copy-Item $backupFile $tempFile
Write-Host "   Kopiran u temp: $tempFile" -ForegroundColor Gray
Write-Host ""

# Import using Docker
Write-Host "🔄 Pokretanje importa..." -ForegroundColor Yellow
docker run --rm `
    -v "${tempFile}:/backup.sql:ro" `
    -e PGPASSWORD=$env:PGPASSWORD `
    postgres:16 `
    sh -c "psql -h $renderHost -p $renderPort -U $renderUser -d $renderDb -f /backup.sql" 2>&1 | Tee-Object -Variable importOutput

$importSuccess = ($LASTEXITCODE -eq 0)

# Cleanup
Remove-Item $tempFile -ErrorAction SilentlyContinue
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($importSuccess) {
    Write-Host "✅ IMPORT USPJEŠAN!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Baza uspješno importirana u Render.com!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Sljedeći koraci:" -ForegroundColor Yellow
    Write-Host "1. Provjeri podatke u Render.com PostgreSQL dashboardu" -ForegroundColor White
    Write-Host "2. Deploy backend na Render.com s novim DATABASE_URL" -ForegroundColor White
    Write-Host "3. Testiraj API endpoint-e" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ IMPORT NEUSPJEŠAN!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Provjeri:" -ForegroundColor Yellow
    Write-Host "- Da li je DATABASE_URL ispravan" -ForegroundColor White
    Write-Host "- Da li Render.com baza dozvoljava konekcije" -ForegroundColor White
    Write-Host "- Da li je SQL dump validan" -ForegroundColor White
    Write-Host ""
    Write-Host "Output:" -ForegroundColor Yellow
    Write-Host $importOutput
    Write-Host ""
    exit 1
}

