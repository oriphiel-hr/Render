# Deploy Frontend to FTP (uslugar.oriph.io)
# Usage: .\deploy-frontend-ftp-fixed.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Frontend Deployment to FTP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# FTP Configuration
$ftpHost = "194.5.156.10"
$ftpUser = "u208993221"
$ftpPassword = "G73S3ebakh6O!"
$ftpBasePath = "/public_html/uslugar/"
$localPath = "dist/"

if (!(Test-Path $localPath)) {
    Write-Host "ERROR: dist/ folder does not exist!" -ForegroundColor Red
    Write-Host "Run: npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "Uploading files from: $localPath" -ForegroundColor Yellow
Write-Host "To FTP: $ftpHost$ftpBasePath" -ForegroundColor Yellow
Write-Host ""

# Function to create directory if not exists
function Create-FtpDirectory {
    param($path)
    
    try {
        $uri = "ftp://$ftpHost$path"
        $request = [System.Net.FtpWebRequest]::Create($uri)
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.GetResponse() | Out-Null
        return $true
    } catch {
        # Directory might already exist
        return $false
    }
}

# Get all files recursively
$files = Get-ChildItem -Path $localPath -Recurse -File

$totalFiles = $files.Count
$current = 0
$successCount = 0
$failCount = 0

Write-Host "Found $totalFiles files to upload..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    $current++
    $relativePath = $file.FullName.Substring((Resolve-Path $localPath).Path.Length).TrimStart('\')
    $remotePath = "$ftpBasePath$($relativePath -replace '\\', '/')"
    
    # Get directory path
    $remoteDir = $remotePath.Substring(0, $remotePath.LastIndexOf('/'))
    
    Write-Progress -Activity "Uploading files" -Status "$current of $totalFiles" -PercentComplete (($current / $totalFiles) * 100)
    
    # Try to create directory structure
    if ($remoteDir -ne $ftpBasePath.TrimEnd('/')) {
        $dirs = $remoteDir.Replace($ftpBasePath.TrimEnd('/'), '').Split('/') | Where-Object { $_ }
        $currentPath = $ftpBasePath.TrimEnd('/')
        foreach ($dir in $dirs) {
            $currentPath = "$currentPath/$dir"
            Create-FtpDirectory $currentPath | Out-Null
        }
    }
    
    try {
        $uri = "ftp://$ftpHost$remotePath"
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
        $webclient.UploadFile($uri, $file.FullName)
        Write-Host "  OK $relativePath" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "  FAIL $relativePath" -ForegroundColor Red
        Write-Host "       Error: $($_.Exception.Message)" -ForegroundColor DarkGray
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
    Write-Host "Frontend deployed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test at: https://uslugar.oriph.io" -ForegroundColor Yellow
    Write-Host "         or http://oriph.io/uslugar" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Clear browser cache (Ctrl+Shift+R) and test navigation!" -ForegroundColor Cyan
} else {
    Write-Host "Deployment failed. Check errors above." -ForegroundColor Red
}

Write-Host ""

