# Deploy New Frontend Build to FTP
# Usage: .\deploy-new-build.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy New Frontend Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if dist folder exists
$distPath = "dist"
if (!(Test-Path $distPath)) {
    Write-Host "ERROR: dist/ folder does not exist!" -ForegroundColor Red
    Write-Host "Run: npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found dist/ folder" -ForegroundColor Green
Write-Host ""

# FTP Configuration
$ftpHost = "194.5.156.10"
$ftpUser = "u208993221"
$ftpPass = "G73S3ebakh6O!"
$ftpBasePath = "/public_html/uslugar/"

Write-Host "FTP Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $ftpHost" -ForegroundColor White
Write-Host "  User: $ftpUser" -ForegroundColor White
Write-Host "  Path: $ftpBasePath" -ForegroundColor White
Write-Host ""

# Confirm
$confirm = Read-Host "Continue with upload? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Upload cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Uploading files..." -ForegroundColor Cyan

# Function to upload file
function Upload-File {
    param($localPath, $remotePath)
    
    try {
        $uri = "ftp://$ftpHost$remotePath"
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $webclient.UploadFile($uri, $localPath)
        return $true
    } catch {
        Write-Host "  ✗ FAIL: $remotePath" -ForegroundColor Red
        Write-Host "       Error: $($_.Exception.Message)" -ForegroundColor DarkGray
        return $false
    }
}

# Get all files recursively
$files = Get-ChildItem -Path $distPath -Recurse -File
$totalFiles = $files.Count
$current = 0
$successCount = 0
$failCount = 0

Write-Host "Found $totalFiles files to upload..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    $current++
    $relativePath = $file.FullName.Substring((Resolve-Path $distPath).Path.Length).TrimStart('\')
    $remotePath = "$ftpBasePath$($relativePath -replace '\\', '/')"
    
    Write-Progress -Activity "Uploading files" -Status "$current of $totalFiles" -PercentComplete (($current / $totalFiles) * 100)
    
    if (Upload-File -localPath $file.FullName -remotePath $remotePath) {
        Write-Host "  ✓ OK: $relativePath" -ForegroundColor Green
        $successCount++
    } else {
        $failCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary:" -ForegroundColor Cyan
Write-Host "  Success: $successCount files" -ForegroundColor Green
Write-Host "  Failed:  $failCount files" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Gray" })
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "✅ Frontend deployed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test at: https://uslugar.oriph.io" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Clear browser cache (Ctrl+Shift+R) and test!" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed. Check errors above." -ForegroundColor Red
}

Write-Host ""

