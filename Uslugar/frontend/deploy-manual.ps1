# Manual Frontend Deployment Script
# Deploys frontend to Hostinger FTP

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Manual Frontend Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$frontendDir = "uslugar/frontend"
$distDir = "$frontendDir/dist"

# Step 1: Check Node.js
Write-Host "📦 Step 1: Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js is not installed!" -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host "`n📥 Step 2: Installing dependencies..." -ForegroundColor Yellow
try {
    Push-Location $frontendDir
    npm ci
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to install dependencies: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

# Step 3: Build frontend
Write-Host "`n🔨 Step 3: Building frontend..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
try {
    Push-Location $frontendDir
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "  ✅ Build successful" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Build failed: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

# Step 4: Check if dist directory exists
Write-Host "`n📂 Step 4: Checking build output..." -ForegroundColor Yellow
if (-not (Test-Path $distDir)) {
    Write-Host "  ❌ Build output directory not found: $distDir" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Build output found" -ForegroundColor Green

# Step 5: Deploy via FTP (if credentials are available)
Write-Host "`n📤 Step 5: FTP Deployment..." -ForegroundColor Yellow
Write-Host "   ⚠️  FTP credentials must be set as environment variables:" -ForegroundColor Yellow
Write-Host "      - HOSTINGER_HOST" -ForegroundColor Gray
Write-Host "      - HOSTINGER_USERNAME" -ForegroundColor Gray
Write-Host "      - HOSTINGER_PASSWORD" -ForegroundColor Gray
Write-Host ""
Write-Host "   Or use GitHub Actions for automatic deployment:" -ForegroundColor Yellow
Write-Host "      https://github.com/oriphiel-hr/AWS_projekti/actions" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Frontend Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Build output: $distDir" -ForegroundColor Gray
Write-Host ""
Write-Host "📤 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Upload dist/ folder to Hostinger FTP manually" -ForegroundColor Cyan
Write-Host "   2. Or run GitHub Actions workflow:" -ForegroundColor Cyan
Write-Host "      https://github.com/oriphiel-hr/AWS_projekti/actions/workflows/frontend-uslugar.yml" -ForegroundColor Cyan
Write-Host ""

