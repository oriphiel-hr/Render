# Test all admin endpoints

$EMAIL = "admin@uslugar.hr"
$PASSWORD = "Admin123!"

Write-Host "Testing All Admin Endpoints" -ForegroundColor Cyan
Write-Host ""

# Login
$body = @{email=$EMAIL;password=$PASSWORD} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body
$token = $r.token
$headers = @{Authorization="Bearer $token"}

# Test endpoints
$endpoints = @(
    "/api/admin/platform-stats",
    "/api/admin/migration-status-test",
    "/api/admin/migration-status"
)

foreach ($endpoint in $endpoints) {
    Write-Host "Testing: $endpoint" -ForegroundColor Yellow
    try {
        $result = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io$endpoint" -Method GET -Headers $headers
        Write-Host "  SUCCESS" -ForegroundColor Green
        if ($result.success) {
            Write-Host "  Response: $($result | ConvertTo-Json -Compress)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

