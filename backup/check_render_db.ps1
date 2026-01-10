# Skripta za proveru tabela u Render bazi podataka

$connectionString = "postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com/uslugar"

Write-Host "`n=== PROVERA TABELA U RENDER BAZI ===" -ForegroundColor Cyan
Write-Host "Povezivanje na bazu..." -ForegroundColor Yellow

# SQL upit za listu svih tabela
$sqlQuery = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
"@

# Pokušaj sa psql ako je dostupan
try {
    $env:PGPASSWORD = "Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm"
    
    $host = "dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com"
    $user = "uslugar_user"
    $db = "uslugar"
    
    # Proveri da li je psql dostupan
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    
    if ($psqlPath) {
        Write-Host "Koristim psql..." -ForegroundColor Green
        
        $tablesOutput = & psql -h $host -U $user -d $db -t -c $sqlQuery 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $renderTables = $tablesOutput | Where-Object { $_.Trim() -ne '' } | ForEach-Object { $_.Trim() } | Sort-Object
            
            Write-Host "`nPronađeno tabela u Render bazi: $($renderTables.Count)" -ForegroundColor Green
            
            # Učitaj Prisma modele
            $prismaModels = Get-Content "schema_20260107_225253.prisma" | 
                Select-String -Pattern '^model ' | 
                ForEach-Object { 
                    if ($_ -match '^model (\w+)') { 
                        $matches[1] 
                    } 
                } | Sort-Object
            
            Write-Host "`nPrisma modeli: $($prismaModels.Count)" -ForegroundColor Yellow
            
            # Poredi
            Write-Host "`n=== POREDJENJE ===" -ForegroundColor Cyan
            $missing = Compare-Object $prismaModels $renderTables | 
                Where-Object { $_.SideIndicator -eq '<=' } | 
                Select-Object -ExpandProperty InputObject
            
            $extra = Compare-Object $prismaModels $renderTables | 
                Where-Object { $_.SideIndicator -eq '=>' } | 
                Select-Object -ExpandProperty InputObject
            
            if ($missing) {
                Write-Host "`n❌ NEDOSTAJU U RENDER BAZI:" -ForegroundColor Red
                foreach ($table in $missing) {
                    Write-Host "  - $table" -ForegroundColor Red
                }
            } else {
                Write-Host "`n✅ Svi Prisma modeli su prisutni u Render bazi!" -ForegroundColor Green
            }
            
            if ($extra) {
                Write-Host "`n📋 DODATNE TABELE U RENDER BAZI (ok):" -ForegroundColor Yellow
                foreach ($table in $extra) {
                    Write-Host "  - $table" -ForegroundColor Yellow
                }
            }
            
            Write-Host "`n=== LISTA SVIH TABELA U RENDER BAZI ===" -ForegroundColor Cyan
            $renderTables | ForEach-Object { Write-Host "  ✓ $_" -ForegroundColor Green }
            
        } else {
            Write-Host "Greška pri izvršavanju psql komande:" -ForegroundColor Red
            Write-Host $tablesOutput -ForegroundColor Red
        }
    } else {
        Write-Host "psql nije instaliran. Pokušavam sa .NET..." -ForegroundColor Yellow
        throw "psql not found"
    }
    
} catch {
    Write-Host "Nije moguće koristiti psql. Koristite pgAdmin ili drugi SQL klijent." -ForegroundColor Yellow
    Write-Host "`nSQL upit za ručnu proveru:" -ForegroundColor Cyan
    Write-Host $sqlQuery -ForegroundColor White
    Write-Host "`nIli pokrenite:" -ForegroundColor Cyan
    Write-Host "psql `"$connectionString`" -c `"$sqlQuery`"" -ForegroundColor White
}

