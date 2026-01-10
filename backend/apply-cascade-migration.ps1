# Skripta za primenu CASCADE DELETE migracije
# Pokreni sa: .\apply-cascade-migration.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Primena CASCADE DELETE migracije" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ucitaj .env fajl ako postoji
if (Test-Path ".env") {
    Write-Host "OK Ucitavam .env konfiguraciju..." -ForegroundColor Green
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Host "UPOZORENJE: .env fajl ne postoji!" -ForegroundColor Yellow
    Write-Host "   Kopiram env.example u .env..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "   Molim vas da uredite .env sa pravim podacima!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Opcije za primenu migracije:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Automatska migracija (Prisma Migrate)" -ForegroundColor White
Write-Host "2. Rucna SQL skripta (za production baze)" -ForegroundColor White
Write-Host "3. Odustani" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Izaberite opciju (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Pokrecem Prisma Migrate..." -ForegroundColor Yellow
        Write-Host ""
        
        # Proveri da li je baza dostupna
        $dbUrl = $env:DATABASE_URL
        if (-not $dbUrl) {
            Write-Host "GRESKA: DATABASE_URL nije postavljen u .env" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Baza: $dbUrl" -ForegroundColor Gray
        Write-Host ""
        
        # Pokreni migraciju
        npx prisma migrate dev --name add_cascade_deletes
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "OK Migracija uspesno primenjena!" -ForegroundColor Green
            
            # Regenerisi Prisma Client
            Write-Host ""
            Write-Host "Generise se novi Prisma Client..." -ForegroundColor Yellow
            npx prisma generate
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "OK SVE GOTOVO!" -ForegroundColor Green
                Write-Host ""
                Write-Host "Sada mozete sigurno brisati User-e sa povezanim podacima." -ForegroundColor Cyan
            }
        } else {
            Write-Host ""
            Write-Host "GRESKA pri migraciji!" -ForegroundColor Red
            Write-Host "Pokusajte opciju 2 (rucna SQL skripta)" -ForegroundColor Yellow
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "SQL skripta se nalazi u:" -ForegroundColor Yellow
        Write-Host "   prisma/migrations/20251020_add_cascade_deletes.sql" -ForegroundColor White
        Write-Host ""
        Write-Host "Pokrenite je na vasoj bazi pomocu:" -ForegroundColor Cyan
        Write-Host "   - pgAdmin" -ForegroundColor White
        Write-Host "   - psql" -ForegroundColor White
        Write-Host "   - AWS RDS Query Editor" -ForegroundColor White
        Write-Host ""
        Write-Host "Primer sa psql:" -ForegroundColor Yellow
        Write-Host '   psql -h localhost -U postgres -d uslugar_db -f prisma/migrations/20251020_add_cascade_deletes.sql' -ForegroundColor Gray
        Write-Host ""
        
        $openFile = Read-Host "Zelite li otvoriti SQL fajl? (y/n)"
        if ($openFile -eq "y") {
            notepad "prisma\migrations\20251020_add_cascade_deletes.sql"
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "Odustano." -ForegroundColor Gray
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "GRESKA: Nepoznata opcija!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
