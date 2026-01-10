# Test Admin Endpoints

$EMAIL = "admin@uslugar.hr"
$PASSWORD = "Admin123!"

Write-Host "Testing Admin Endpoints" -ForegroundColor Cyan
Write-Host ""

# Login
$body = @{email=$EMAIL;password=$PASSWORD} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$token = $r.token
$headers = @{Authorization="Bearer $token"}

# Test postojeći endpoint
Write-Host "1. Testing existing endpoint: /api/admin/platform-stats" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/admin/platform-stats" -Method GET -Headers $headers
    Write-Host "✅ Existing endpoint works!" -ForegroundColor Green
} catch {
    Write-Host "❌ Existing endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test novi endpoint
Write-Host "2. Testing new endpoint: /api/admin/migration-status" -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/admin/migration-status" -Method GET -Headers $headers
    Write-Host "✅ New endpoint works!" -ForegroundColor Green
    Write-Host "Total tables: $($status.summary.totalTables)" -ForegroundColor White
} catch {
    Write-Host "❌ New endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# List all admin routes (if possible)
Write-Host "3. Checking server logs or routes..." -ForegroundColor Yellow
Write-Host "   (This would require server access)" -ForegroundColor Gray

