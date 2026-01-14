# Upload Only JavaScript and CSS Files to FTP
# Usage: .\upload-js-only.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Upload JavaScript Build Files" -ForegroundColor Cyan
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

# Get only JavaScript and CSS files from assets
$assetsPath = Join-Path $distPath "assets"
if (!(Test-Path $assetsPath)) {
    Write-Host "ERROR: dist/assets/ folder does not exist!" -ForegroundColor Red
    exit 1
}

$jsFiles = Get-ChildItem -Path $assetsPath -Filter "*.js" -File
$cssFiles = Get-ChildItem -Path $assetsPath -Filter "*.css" -File
$allFiles = @($jsFiles) + @($cssFiles)

if ($allFiles.Count -eq 0) {
    Write-Host "ERROR: No JavaScript or CSS files found in dist/assets/" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($allFiles.Count) files to upload:" -ForegroundColor Cyan
Write-Host "  JavaScript: $($jsFiles.Count) files" -ForegroundColor White
Write-Host "  CSS: $($cssFiles.Count) files" -ForegroundColor White
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($file in $allFiles) {
    $relativePath = $file.Name
    $remotePath = "$ftpBasePath" + "assets/$relativePath"
    
    Write-Host "  Uploading: $relativePath" -ForegroundColor Yellow -NoNewline
    
    if (Upload-File -localPath $file.FullName -remotePath $remotePath) {
        Write-Host " ✓" -ForegroundColor Green
        $successCount++
    } else {
        $failCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Upload Summary:" -ForegroundColor Cyan
Write-Host "  Success: $successCount files" -ForegroundColor Green
Write-Host "  Failed:  $failCount files" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Gray" })
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "✅ JavaScript/CSS files uploaded!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Clear browser cache (Ctrl+Shift+R)" -ForegroundColor White
    Write-Host "  2. Test: https://uslugar.oriph.io" -ForegroundColor White
} else {
    Write-Host "❌ Upload failed. Check errors above." -ForegroundColor Red
}

Write-Host ""

