# Deploy Fresh Frontend Build to Hostinger
# Ova skripta build-a novi frontend i upload-uje ga na server
# Usage: .\deploy-fresh-build.ps1 [-SkipBuild]

param(
    [string]$FtpHost = "194.5.156.10",
    [string]$FtpUser = "u208993221",
    [string]$FtpPassword = "G73S3ebakh6O!",
    [string]$FtpBasePath = "/public_html/uslugar/",
    [switch]$SkipBuild = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Frontend Build & Deploy Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Provjeri da smo u frontend direktoriju
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Make sure you're in the frontend directory." -ForegroundColor Red
    exit 1
}

# Korak 1: Build frontend (osim ako se preskoči)
if (-not $SkipBuild) {
    Write-Host "📦 Step 1: Building frontend..." -ForegroundColor Yellow
    Write-Host ""
    
    # Provjeri da li postoji .env fajl
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  Warning: .env file not found. Using default API URL." -ForegroundColor Yellow
        Write-Host "   To set custom API URL, create .env file with: VITE_API_URL=https://uslugar.api.oriph.io" -ForegroundColor Gray
        Write-Host ""
    }
    
    # Obriši stari dist folder ako postoji
    if (Test-Path "dist") {
        Write-Host "🗑️  Removing old dist folder..." -ForegroundColor Gray
        Remove-Item -Path "dist" -Recurse -Force
    }
    
    # Build
    Write-Host "🔨 Running: npm run build" -ForegroundColor Gray
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⏭️  Skipping build (using existing dist folder)" -ForegroundColor Yellow
    Write-Host ""
}

# Provjeri da dist folder postoji
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: dist folder not found. Run build first!" -ForegroundColor Red
    exit 1
}

# Provjeri da index.html postoji
if (-not (Test-Path "dist/index.html")) {
    Write-Host "❌ Error: dist/index.html not found!" -ForegroundColor Red
    exit 1
}

# Provjeri FTP konekciju prije uploada (opcionalno, preskoči ako ne radi)
Write-Host "🔍 Testing FTP connection..." -ForegroundColor Yellow
try {
    $testUri = "ftp://${FtpHost}/"
    $testRequest = [System.Net.FtpWebRequest]::Create($testUri)
    $testRequest.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPassword)
    $testRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $testRequest.UsePassive = $true
    $testRequest.Timeout = 30000  # Povećan timeout na 30 sekundi
    $testRequest.ReadWriteTimeout = 30000
    
    $testResponse = $testRequest.GetResponse()
    $testResponse.Close()
    Write-Host "✅ FTP connection successful!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "⚠️  FTP connection test failed (continuing anyway...)" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "   Will attempt upload anyway..." -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📤 Step 2: Uploading to FTP server..." -ForegroundColor Yellow
Write-Host "   Host: $FtpHost" -ForegroundColor Gray
Write-Host "   Path: $FtpBasePath" -ForegroundColor Gray
Write-Host ""

# Confirmation (osim ako je -Force flag)
if (-not $Force) {
    $confirm = Read-Host "Continue with upload? (Y/N)"
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host "Upload cancelled." -ForegroundColor Yellow
        exit 0
    }
    Write-Host ""
}

# Funkcija za upload fajla (koristi WebClient umjesto FtpWebRequest)
function Upload-File {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    
    try {
        $uri = "ftp://${FtpHost}${RemotePath}"
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPassword)
        $webclient.UploadFile($uri, $LocalPath)
        return $true
    } catch {
        Write-Host "  ❌ Failed to upload: $LocalPath" -ForegroundColor Red
        Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Funkcija za kreiranje direktorija
function Create-Directory {
    param([string]$RemotePath)
    
    try {
        $ftpUri = "ftp://${FtpHost}${RemotePath}"
        $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUri)
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPassword)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $ftpRequest.UsePassive = $true
        
        $response = $ftpRequest.GetResponse()
        $response.Close()
        
        return $true
    } catch {
        # Direktorij možda već postoji, to je OK
        return $false
    }
}

# Funkcija za listanje direktorija
function Get-FtpDirectory {
    param([string]$RemotePath)
    
    try {
        $ftpUri = "ftp://${FtpHost}${RemotePath}"
        $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUri)
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPassword)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $ftpRequest.UsePassive = $true
        
        $response = $ftpRequest.GetResponse()
        $responseStream = $response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $directoryListing = $reader.ReadToEnd()
        $reader.Close()
        $response.Close()
        
        return $directoryListing -split "`r`n" | Where-Object { $_ -ne "" }
    } catch {
        return @()
    }
}

# Funkcija za brisanje fajla
function Remove-FtpFile {
    param([string]$RemotePath)
    
    try {
        $ftpUri = "ftp://${FtpHost}${RemotePath}"
        $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUri)
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPassword)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::DeleteFile
        $ftpRequest.UsePassive = $true
        
        $response = $ftpRequest.GetResponse()
        $response.Close()
        
        return $true
    } catch {
        return $false
    }
}

# Kreiraj assets direktorij ako ne postoji
Write-Host "📁 Creating assets directory..." -ForegroundColor Gray
$assetsPath = $FtpBasePath.TrimEnd('/') + "/assets"
Create-Directory -RemotePath $assetsPath | Out-Null

# Upload index.html
Write-Host "📄 Uploading index.html..." -ForegroundColor Gray
$indexHtmlPath = Join-Path (Get-Location) "dist\index.html"
$indexHtmlPath = Resolve-Path $indexHtmlPath
$success = Upload-File -LocalPath $indexHtmlPath -RemotePath ($FtpBasePath.TrimEnd('/') + "/index.html")
if ($success) {
    Write-Host "  ✅ index.html uploaded" -ForegroundColor Green
} else {
    Write-Host "  ❌ Failed to upload index.html" -ForegroundColor Red
    exit 1
}

# Upload assets folder
Write-Host "📦 Uploading assets folder..." -ForegroundColor Gray
$distPath = Resolve-Path "dist"
$assetsFiles = Get-ChildItem -Path (Join-Path $distPath "assets") -File -Recurse

$uploaded = 0
$failed = 0

foreach ($file in $assetsFiles) {
    $relativePath = $file.FullName.Replace($distPath.Path, "").Replace("\", "/").TrimStart("/")
    $remotePath = $FtpBasePath.TrimEnd('/') + "/" + $relativePath
    
    Write-Host "  📤 $relativePath..." -ForegroundColor Gray -NoNewline
    
    $success = Upload-File -LocalPath $file.FullName -RemotePath $remotePath
    if ($success) {
        Write-Host " ✅" -ForegroundColor Green
        $uploaded++
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $failed++
    }
}

# Upload ostale fajlove (npr. uslugar.ico)
Write-Host "📄 Uploading other files..." -ForegroundColor Gray
$distPath = Resolve-Path "dist"
$otherFiles = Get-ChildItem -Path $distPath -File | Where-Object { $_.Name -ne "index.html" }

foreach ($file in $otherFiles) {
    $remotePath = $FtpBasePath.TrimEnd('/') + "/" + $file.Name
    Write-Host "  📤 $($file.Name)..." -ForegroundColor Gray -NoNewline
    
    $success = Upload-File -LocalPath $file.FullName -RemotePath $remotePath
    if ($success) {
        Write-Host " ✅" -ForegroundColor Green
        $uploaded++
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Summary:" -ForegroundColor Green
Write-Host "   Uploaded: $uploaded files" -ForegroundColor White
if ($failed -gt 0) {
    Write-Host "   Failed: $failed files" -ForegroundColor Red
}
Write-Host ""
Write-Host "🌐 Test your site:" -ForegroundColor Cyan
Write-Host "   https://uslugar.oriph.io" -ForegroundColor White
Write-Host ""
Write-Host "💡 Don't forget to:" -ForegroundColor Yellow
Write-Host "   1. Clear browser cache (Ctrl + Shift + R)" -ForegroundColor White
Write-Host "   2. Unregister Service Workers (F12 → Application → Service Workers)" -ForegroundColor White
Write-Host "   3. Clear site data (F12 → Application → Storage → Clear site data)" -ForegroundColor White
Write-Host ""

