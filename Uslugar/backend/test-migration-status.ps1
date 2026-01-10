# Test Migration Status Endpoint

Write-Host "Testing Migration Status Endpoint" -ForegroundColor Cyan
Write-Host ""

# Login
$EMAIL = "admin@uslugar.hr"
$PASSWORD = "Admin123!"

Write-Host "1. Logging in..." -ForegroundColor Yellow
$body = @{email=$EMAIL;password=$PASSWORD} | ConvertTo-Json
$r = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/auth/login" -Method POST -ContentType "application/json" -Body $body

if (-not $r.token) {
    Write-Host "Login failed!" -ForegroundColor Red
    Write-Host $r | ConvertTo-Json
    exit 1
}

$token = $r.token
Write-Host "Login successful!" -ForegroundColor Green
Write-Host ""

# Provjeri migration status
Write-Host "2. Checking migration status (ALL tables and columns)..." -ForegroundColor Yellow
$headers = @{Authorization="Bearer $token"}

try {
    $status = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/admin/migration-status" -Method GET -Headers $headers
    
    Write-Host "Request successful!" -ForegroundColor Green
    Write-Host ""
    
    # Summary
    Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
    Write-Host "Total tables: $($status.summary.totalTables)" -ForegroundColor White
    Write-Host "Existing tables: $($status.summary.existingTables)" -ForegroundColor Green
    Write-Host "Missing tables: $($status.summary.missingTables)" -ForegroundColor $(if ($status.summary.missingTables -gt 0) { "Red" } else { "Green" })
    Write-Host "Total fields: $($status.summary.totalFields)" -ForegroundColor White
    Write-Host ""
    
    # Tables status
    Write-Host "=== TABLES STATUS ===" -ForegroundColor Cyan
    $status.tables.PSObject.Properties | ForEach-Object {
        $color = if ($_.Value.exists) { "Green" } else { "Red" }
        Write-Host "$($_.Name): $($_.Value.status)" -ForegroundColor $color
    }
    Write-Host ""
    
    # Check ProviderProfile specifically
    if ($status.tablesDetails.ProviderProfile) {
        Write-Host "=== PROVIDER PROFILE DETAILS ===" -ForegroundColor Cyan
        $pp = $status.tablesDetails.ProviderProfile
        Write-Host "Exists: $($pp.exists)" -ForegroundColor $(if ($pp.exists) { "Green" } else { "Red" })
        Write-Host "Total fields: $($pp.summary.totalFields)" -ForegroundColor White
        Write-Host ""
        
        # Check for isDirector and companyId
        if ($pp.fields.isDirector) {
            Write-Host "isDirector: $($pp.fields.isDirector.status)" -ForegroundColor $(if ($pp.fields.isDirector.exists) { "Green" } else { "Red" })
        } else {
            Write-Host "isDirector: NOT FOUND" -ForegroundColor Red
        }
        
        if ($pp.fields.companyId) {
            Write-Host "companyId: $($pp.fields.companyId.status)" -ForegroundColor $(if ($pp.fields.companyId.exists) { "Green" } else { "Red" })
        } else {
            Write-Host "companyId: NOT FOUND" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    # Show first few tables with field counts
    Write-Host "=== TABLES WITH FIELD COUNTS ===" -ForegroundColor Cyan
    $status.tablesDetails.PSObject.Properties | Select-Object -First 10 | ForEach-Object {
        $tableName = $_.Name
        $details = $_.Value
        if ($details.exists) {
            $fieldCount = $details.summary.totalFields
            Write-Host "$tableName : $fieldCount fields" -ForegroundColor Gray
        }
    }
    Write-Host ""
    
    # Save full response to file
    $status | ConvertTo-Json -Depth 10 | Out-File -FilePath "migration-status-result.json" -Encoding UTF8
    Write-Host "Full response saved to: migration-status-result.json" -ForegroundColor Yellow
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
