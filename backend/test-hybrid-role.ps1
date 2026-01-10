# Test Hybrid Role Implementation
# Run backend locally first: node src/server.js

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Hybrid Role Implementation Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:4000/api"

# Test 1: Register as USER
Write-Host "Test 1: Register new USER..." -ForegroundColor Yellow
$registerUser = @{
    email = "testuser_$(Get-Random)@example.com"
    password = "password123"
    fullName = "Test User"
    role = "USER"
} | ConvertTo-Json

try {
    $userResponse = Invoke-RestMethod -Uri "$API_URL/auth/register" -Method POST -Body $registerUser -ContentType "application/json"
    $userToken = $userResponse.token
    $userEmail = $userResponse.user.email
    Write-Host "  OK User registered: $userEmail" -ForegroundColor Green
    Write-Host "  Role: $($userResponse.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "  FAIL $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 2: Upgrade USER to PROVIDER
Write-Host ""
Write-Host "Test 2: Upgrade USER -> PROVIDER..." -ForegroundColor Yellow
$upgradeData = @{
    email = $userEmail
    password = "password123"
} | ConvertTo-Json

try {
    $upgradeResponse = Invoke-RestMethod -Uri "$API_URL/auth/upgrade-to-provider" -Method POST -Body $upgradeData -ContentType "application/json"
    $providerToken = $upgradeResponse.token
    Write-Host "  OK User upgraded to PROVIDER" -ForegroundColor Green
    Write-Host "  New Role: $($upgradeResponse.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "  FAIL $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 3: Register another PROVIDER
Write-Host ""
Write-Host "Test 3: Register new PROVIDER..." -ForegroundColor Yellow
$registerProvider = @{
    email = "testprovider_$(Get-Random)@example.com"
    password = "password123"
    fullName = "Test Provider"
    role = "PROVIDER"
} | ConvertTo-Json

try {
    $providerResponse = Invoke-RestMethod -Uri "$API_URL/auth/register" -Method POST -Body $registerProvider -ContentType "application/json"
    $provider2Token = $providerResponse.token
    Write-Host "  OK Provider registered: $($providerResponse.user.email)" -ForegroundColor Green
} catch {
    Write-Host "  FAIL $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 4: Get categories (for creating job)
Write-Host ""
Write-Host "Test 4: Fetch categories..." -ForegroundColor Yellow
try {
    $categories = Invoke-RestMethod -Uri "$API_URL/categories" -Method GET
    $categoryId = $categories[0].id
    Write-Host "  OK Got $($categories.Count) categories" -ForegroundColor Green
    Write-Host "  Using category: $($categories[0].name)" -ForegroundColor Gray
} catch {
    Write-Host "  FAIL $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 5: PROVIDER creates a Job (NEW FEATURE!)
Write-Host ""
Write-Host "Test 5: PROVIDER creates Job (NEW!)..." -ForegroundColor Yellow
$createJob = @{
    title = "Test Job from PROVIDER"
    description = "PROVIDER is looking for another service"
    categoryId = $categoryId
    city = "Zagreb"
    budgetMax = 500
    urgency = "NORMAL"
} | ConvertTo-Json

try {
    $headers = @{ Authorization = "Bearer $providerToken" }
    $jobResponse = Invoke-RestMethod -Uri "$API_URL/jobs" -Method POST -Body $createJob -ContentType "application/json" -Headers $headers
    $jobId = $jobResponse.id
    Write-Host "  OK PROVIDER created Job: $($jobResponse.title)" -ForegroundColor Green
    Write-Host "  Job ID: $jobId" -ForegroundColor Gray
} catch {
    Write-Host "  FAIL $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  This should work now!" -ForegroundColor Yellow
    exit 1
}

Start-Sleep -Seconds 1

# Test 6: Second PROVIDER sends offer to first PROVIDER's job
Write-Host ""
Write-Host "Test 6: PROVIDER sends offer to another PROVIDER's Job..." -ForegroundColor Yellow
$createOffer = @{
    jobId = $jobId
    amount = 300
    message = "I can do this for you!"
    estimatedDays = 2
} | ConvertTo-Json

try {
    $headers2 = @{ Authorization = "Bearer $provider2Token" }
    $offerResponse = Invoke-RestMethod -Uri "$API_URL/offers" -Method POST -Body $createOffer -ContentType "application/json" -Headers $headers2
    $offerId = $offerResponse.id
    Write-Host "  OK Offer sent: $($offerResponse.amount) EUR" -ForegroundColor Green
    Write-Host "  Offer ID: $offerId" -ForegroundColor Gray
} catch {
    Write-Host "  FAIL $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Test 7: First PROVIDER accepts offer (NEW FEATURE!)
Write-Host ""
Write-Host "Test 7: PROVIDER accepts offer on their Job (NEW!)..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $providerToken" }
    $acceptResponse = Invoke-RestMethod -Uri "$API_URL/jobs/$jobId/accept/$offerId" -Method POST -Headers $headers
    Write-Host "  OK PROVIDER accepted offer on their Job" -ForegroundColor Green
} catch {
    Write-Host "  FAIL $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  This should work now!" -ForegroundColor Yellow
    exit 1
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Hybrid Role Implementation is working!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  OK USER can register" -ForegroundColor Green
Write-Host "  OK USER can upgrade to PROVIDER" -ForegroundColor Green
Write-Host "  OK PROVIDER can create Jobs" -ForegroundColor Green
Write-Host "  OK PROVIDER can send Offers" -ForegroundColor Green
Write-Host "  OK PROVIDER can accept Offers on their Jobs" -ForegroundColor Green
Write-Host ""

