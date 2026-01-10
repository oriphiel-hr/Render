# Test Email Script - Local Testing
# This script tests email sending with new SMTP configuration

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Email Test - New SMTP Configuration" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variables for testing
$env:SMTP_HOST = "smtp.hostinger.com"
$env:SMTP_PORT = "465"
$env:SMTP_USER = "uslugar@oriphiel.hr"
$env:SMTP_PASS = "c|1TYK4YqbF"

Write-Host "SMTP Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $env:SMTP_HOST" -ForegroundColor Gray
Write-Host "  Port: $env:SMTP_PORT" -ForegroundColor Gray
Write-Host "  User: $env:SMTP_USER" -ForegroundColor Gray
Write-Host "  Pass: ********" -ForegroundColor Gray
Write-Host ""

# Get recipient email (default to SMTP_USER)
$recipient = $args[0]
if (-not $recipient) {
    $recipient = $env:SMTP_USER
    Write-Host "No recipient specified, sending to: $recipient" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Running test email script..." -ForegroundColor Yellow
Write-Host ""

# Run the test script
node test-email-new.js $recipient

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Test completed successfully!" -ForegroundColor Green
    Write-Host "Check inbox: $recipient" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✗ Test failed!" -ForegroundColor Red
    exit 1
}

