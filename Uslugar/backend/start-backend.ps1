# Start Backend Server
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting Uslugar Backend Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "✗ ERROR: .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ .env file found" -ForegroundColor Green
Write-Host ""

# Check DATABASE_URL
$dbUrl = Select-String -Path .env -Pattern "DATABASE_URL" | Select-Object -First 1
if ($dbUrl) {
    Write-Host "✓ DATABASE_URL configured" -ForegroundColor Green
} else {
    Write-Host "✗ ERROR: DATABASE_URL not found in .env!" -ForegroundColor Red
    exit 1
}

# Check SMTP
$smtpUser = Select-String -Path .env -Pattern "SMTP_USER" | Select-Object -First 1
if ($smtpUser) {
    Write-Host "✓ SMTP configured" -ForegroundColor Green
} else {
    Write-Host "⚠ WARNING: SMTP not configured (emails won't work)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting server on port 8080..." -ForegroundColor Yellow
Write-Host ""

# Start server
node src/server.js

