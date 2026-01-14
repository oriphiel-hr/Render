# Skripta za pokretanje Vite dev servera

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Pokrećem Vite Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pozicioniraj se u frontend folder
Set-Location $PSScriptRoot

Write-Host "📁 Trenutni direktorij: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Provjeri da li postoje node_modules
if (!(Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules ne postoje. Pokrećem npm install..." -ForegroundColor Red
    npm install
} else {
    Write-Host "✓ node_modules pronađeni" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Pokrećem dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Server će biti dostupan na: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Pritisnite CTRL+C da zaustavite server" -ForegroundColor Gray
Write-Host ""

# Pokreni dev server
npm run dev

