# Migrate to C:\GIT_PROJEKTI\Render
# This script copies everything and updates paths

$source = "C:\GIT_PROJEKTI\AWS\uslugar_render"
$dest = "C:\GIT_PROJEKTI\Render"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📦 PREMIEŠTANJE NA RENDER" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Izvor: $source" -ForegroundColor Gray
Write-Host "Destinacija: $dest" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $source)) {
    Write-Host "❌ Izvorni direktorij ne postoji: $source" -ForegroundColor Red
    exit 1
}

# Create destination
if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    Write-Host "✅ Kreiran direktorij: $dest" -ForegroundColor Green
} else {
    Write-Host "⚠️  Direktorij već postoji: $dest" -ForegroundColor Yellow
}

# Copy everything
Write-Host "`n📋 Kopiranje fajlova..." -ForegroundColor Yellow
Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force
Write-Host "✅ Kopiranje završeno!" -ForegroundColor Green

# Update all references
Write-Host "`n🔄 Ažuriranje referenci..." -ForegroundColor Yellow

Get-ChildItem -Path $dest -Recurse -Include "*.ps1","*.md" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # Replace old paths
    $content = $content -replace 'C:\\GIT_PROJEKTI\\AWS\\uslugar_render', 'C:\GIT_PROJEKTI\Render'
    $content = $content -replace 'C:\\GIT_PROJEKTI\\AWS\\AWS_projekti\\uslugar_render', 'C:\GIT_PROJEKTI\Render'
    
    if ($content -ne $original) {
        Set-Content $_.FullName -Value $content -NoNewline
        Write-Host "  ✅ $($_.Name)" -ForegroundColor Green
    }
}

Write-Host "`n✅ Migracija završena!" -ForegroundColor Green
Write-Host ""
Write-Host "Nova lokacija: $dest" -ForegroundColor Cyan
Write-Host ""

