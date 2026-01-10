# Test both endpoints

$EMAIL = "admin@uslugar.hr"
$PASSWORD = "Admin123!"

Write-Host "Testing Endpoints" -ForegroundColor Cyan
Write-Host ""

# Login
$body = @{email=$EMAIL;password=$PASSWORD} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$token = $r.token
$headers = @{Authorization="Bearer $token"}

# Test 1: Simple test endpoint
Write-Host "1. Testing /api/admin/migration-status-test" -ForegroundColor Yellow
try {
    $test = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/admin/migration-status-test" -Method GET -Headers $headers
    Write-Host "SUCCESS: $($test | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Main endpoint
Write-Host "2. Testing /api/admin/migration-status" -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/admin/migration-status" -Method GET -Headers $headers
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Total tables: $($status.summary.totalTables)" -ForegroundColor White
    Write-Host "Total fields: $($status.summary.totalFields)" -ForegroundColor White
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

