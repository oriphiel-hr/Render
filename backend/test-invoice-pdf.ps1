# Test Invoice PDF Generation
$EMAIL = "admin@uslugar.hr"
$PASSWORD = "Admin123!"

Write-Host "`n=== Test Invoice PDF Generation ===" -ForegroundColor Cyan

# 1. Login
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
    exit 1
}

$headers = @{Authorization="Bearer $token"}

# 2. Get user ID from /api/users/me endpoint
Write-Host "`n2. Getting user ID..." -ForegroundColor Yellow
try {
    $userResponse = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/users/me" -Method GET -Headers $headers
    $userId = $userResponse.id
    Write-Host "   ✅ User ID: $userId" -ForegroundColor Green
    Write-Host "   Email: $($userResponse.email)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Failed to get user ID: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   Response: $responseBody" -ForegroundColor Gray
        } catch {}
    }
    exit 1
}

# 3. Create test invoice
Write-Host "`n3. Creating test invoice..." -ForegroundColor Yellow
$invoiceBody = @{
    userId = $userId
    amount = 100
    type = "SUBSCRIPTION"
} | ConvertTo-Json

try {
    $invoiceResponse = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/invoices/create-test" -Method POST -Headers $headers -ContentType "application/json" -Body $invoiceBody
    if ($invoiceResponse.success) {
        $invoiceId = $invoiceResponse.invoice.id
        $invoiceNumber = $invoiceResponse.invoice.invoiceNumber
        $pdfUrl = $invoiceResponse.invoice.pdfUrl
        Write-Host "   ✅ Invoice created!" -ForegroundColor Green
        Write-Host "   Invoice ID: $invoiceId" -ForegroundColor Gray
        Write-Host "   Invoice Number: $invoiceNumber" -ForegroundColor Gray
        Write-Host "   PDF URL: $pdfUrl" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Failed to create invoice" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Failed to create invoice: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   Response: $responseBody" -ForegroundColor Gray
        } catch {
            Write-Host "   Could not read response body" -ForegroundColor Gray
        }
    }
    exit 1
}

# 4. Download PDF
Write-Host "`n4. Downloading PDF..." -ForegroundColor Yellow
try {
    $pdfResponse = Invoke-WebRequest -Uri "https://uslugar.api.oriph.io/api/invoices/$invoiceId/pdf" -Method GET -Headers $headers
    $pdfFileName = "test-invoice-$invoiceNumber.pdf"
    [System.IO.File]::WriteAllBytes($pdfFileName, $pdfResponse.Content)
    Write-Host "   ✅ PDF downloaded: $pdfFileName" -ForegroundColor Green
    Write-Host "   File size: $($pdfResponse.Content.Length) bytes" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Failed to download PDF: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 5. Check S3
Write-Host "`n5. Checking S3 bucket..." -ForegroundColor Yellow
try {
    $s3Files = aws s3 ls s3://uslugar-invoices/invoices/ --region eu-north-1 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ S3 bucket accessible" -ForegroundColor Green
        if ($s3Files) {
            Write-Host "   Files in S3:" -ForegroundColor Gray
            $s3Files | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
        } else {
            Write-Host "   No files in S3 yet" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  Could not access S3 bucket (may need AWS credentials)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not check S3 bucket" -ForegroundColor Yellow
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "PDF saved as: $pdfFileName" -ForegroundColor Green

