# Direct import to Render.com - No confirmation needed
$ErrorActionPreference = "Continue"

$renderDbUrl = "postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com/uslugar"
$backupFile = "backup\uslugar_complete_backup_20260107_232327.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 IMPORT BAZE U RENDER.COM" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $backupFile)) {
    Write-Host "❌ SQL dump nije pronađen: $backupFile" -ForegroundColor Red
    exit 1
}

$fileSize = (Get-Item $backupFile).Length / 1MB
Write-Host "📄 SQL Dump: $backupFile" -ForegroundColor White
Write-Host "   Veličina: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Gray
Write-Host ""

$uri = [System.Uri]::new($renderDbUrl)
$userInfo = $uri.UserInfo.Split(':')
$renderUser = $userInfo[0]
$renderPassword = $userInfo[1]
$renderHost = $uri.Host
$renderPort = if ($uri.Port -ne -1) { $uri.Port } else { 5432 }
$renderDb = $uri.AbsolutePath.TrimStart('/')

Write-Host "🔗 Render Database:" -ForegroundColor White
Write-Host "   Host: $renderHost" -ForegroundColor Gray
Write-Host "   Port: $renderPort" -ForegroundColor Gray
Write-Host "   Database: $renderDb" -ForegroundColor Gray
Write-Host "   User: $renderUser" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  UPOZORENJE: Ovo će OBRISATI postojeće podatke!" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 Testiranje konekcije..." -ForegroundColor Yellow
$env:PGPASSWORD = $renderPassword

try {
    $testResult = docker run --rm -e PGPASSWORD=$env:PGPASSWORD postgres:16 psql -h $renderHost -p $renderPort -U $renderUser -d $renderDb -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Konekcija uspješna!" -ForegroundColor Green
    } else {
        Write-Host "❌ Konekcija neuspješna!" -ForegroundColor Red
        Write-Host $testResult
        exit 1
    }
} catch {
    Write-Host "❌ Greška pri testiranju konekcije: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📥 Importiranje SQL dump-a..." -ForegroundColor Yellow
Write-Host "   Ovo može potrajati 10-30 minuta..." -ForegroundColor Gray
Write-Host ""

$tempFile = Join-Path $env:TEMP "render_import_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
Copy-Item $backupFile $tempFile
Write-Host "   Kopiran u temp: $tempFile" -ForegroundColor Gray

Write-Host ""
Write-Host "🔄 Pokretanje importa preko Docker-a..." -ForegroundColor Yellow
Write-Host ""

try {
    docker run --rm -v "${tempFile}:/backup.sql:ro" -e PGPASSWORD=$env:PGPASSWORD postgres:16 sh -c "psql -h $renderHost -p $renderPort -U $renderUser -d $renderDb -f /backup.sql" 2>&1 | Tee-Object -Variable importOutput
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "✅ IMPORT USPJEŠAN!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✅ Baza uspješno importirana u Render.com!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ IMPORT NEUSPJEŠAN (Exit code: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host "Output:" -ForegroundColor Yellow
        Write-Host $importOutput
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Greška pri importu: $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "📋 Sljedeći koraci:" -ForegroundColor Yellow
Write-Host "1. Provjeri podatke u Render.com PostgreSQL dashboardu" -ForegroundColor White
Write-Host "2. Deploy backend na Render.com" -ForegroundColor White
Write-Host ""

