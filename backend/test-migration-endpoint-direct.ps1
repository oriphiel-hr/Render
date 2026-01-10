# Test migration-status-test endpoint directly
$EMAIL = "admin@uslugar.hr"
$PASSWORD = "Admin123!"

Write-Host "`n=== Testing Migration Status Endpoint ===" -ForegroundColor Cyan

# Login
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$body = @{email=$EMAIL;password=$PASSWORD} | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body
    if ($loginResponse.token) {
        $token = $loginResponse.token
        Write-Host "   ✅ Login successful" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Login failed: No token received" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Test migration-status-test
Write-Host "`n2. Testing /api/admin/migration-status-test..." -ForegroundColor Yellow
$headers = @{Authorization="Bearer $token"}
try {
    $response = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/admin/migration-status-test" -Method GET -Headers $headers
    Write-Host "   ✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   ❌ FAILED: HTTP $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   Response body: $responseBody" -ForegroundColor Gray
        } catch {
            Write-Host "   Could not read response body" -ForegroundColor Gray
        }
    }
}

# Test migration-status
Write-Host "`n3. Testing /api/admin/migration-status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/admin/migration-status" -Method GET -Headers $headers
    Write-Host "   ✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Summary: $($response.summary | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   ❌ FAILED: HTTP $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan

