# Seed Legal Statuses direktno na AWS RDS bazu
# Ova skripta učitava DATABASE_URL iz ENV_EXAMPLE.txt ili direktno postavlja AWS URL

param(
    [string]$DatabaseUrl = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SEED: Legal Statuses -> AWS RDS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Funkcija za učitavanje .env file-a
function Load-EnvFile {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-Host "📄 Loading $FilePath..." -ForegroundColor Yellow
        Get-Content $FilePath | ForEach-Object {
            if ($_ -match '^([^=#]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Remove quotes if present
                $value = $value -replace '^["'']|["'']$', ''
                Set-Item -Path "env:$name" -Value $value -ErrorAction SilentlyContinue
            }
        }
        return $true
    }
    return $false
}

# 1. Pokušaj učitati DATABASE_URL
if ($DatabaseUrl -eq "") {
    # Prvo pokušaj .env
    if (Test-Path ".env") {
        Load-EnvFile ".env"
    }
    # Ako nema, pokušaj env.example
    elseif (Test-Path "env.example") {
        Load-EnvFile "env.example"
    }
    # Ako nema, pokušaj ENV_EXAMPLE.txt
    elseif (Test-Path "ENV_EXAMPLE.txt") {
        Load-EnvFile "ENV_EXAMPLE.txt"
    }
    
    $DatabaseUrl = $env:DATABASE_URL
}

# 2. Ako još nema DATABASE_URL, traži od korisnika
if (-Not $DatabaseUrl) {
    Write-Host "❌ DATABASE_URL nije pronađen!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Molimo unesite AWS RDS connection string:" -ForegroundColor Yellow
    Write-Host "Format: postgresql://username:password@endpoint:5432/database" -ForegroundColor Gray
    Write-Host ""
    $DatabaseUrl = Read-Host "DATABASE_URL"
}

# 3. Postavi DATABASE_URL environment varijablu
$env:DATABASE_URL = $DatabaseUrl

Write-Host ""
Write-Host "✅ DATABASE_URL postavljen" -ForegroundColor Green
Write-Host "   Endpoint: $($DatabaseUrl -replace 'postgresql://[^@]+@', 'postgresql://***@')" -ForegroundColor Gray
Write-Host ""

# 4. Generiraj Prisma Client (ako je potrebno)
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
try {
    npm run prisma:generate 2>&1 | Out-Null
    Write-Host "✅ Prisma Client generated" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Prisma Client generation skipped" -ForegroundColor Yellow
}

Write-Host ""

# 5. Pokreni seed
Write-Host "🌱 Running seed script..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

try {
    npm run seed:legal
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ SEED COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sada možete pokrenuti aplikaciju:" -ForegroundColor Cyan
    Write-Host "  npm start" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ SEED FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Provjerite DATABASE_URL" -ForegroundColor White
    Write-Host "2. Provjerite Security Groups na RDS" -ForegroundColor White
    Write-Host "3. Pokrenite migracije" -ForegroundColor White
    Write-Host ""
    exit 1
}

