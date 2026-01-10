# Simple script to seed Legal Statuses

Write-Host "Seed Legal Statuses to AWS RDS" -ForegroundColor Cyan
Write-Host ""

# Check for DATABASE_URL in env files
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^DATABASE_URL=(.*)$') {
            $env:DATABASE_URL = $matches[1] -replace '^["'']|["'']$', ''
        }
    }
}

if (-Not $env:DATABASE_URL) {
    Write-Host "Enter your AWS RDS DATABASE_URL:" -ForegroundColor Yellow
    $env:DATABASE_URL = Read-Host
}

Write-Host "Running seed..." -ForegroundColor Green
npm run seed:legal

