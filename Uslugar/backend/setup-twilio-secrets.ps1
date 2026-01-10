# Setup Twilio Secrets in AWS Secrets Manager
# Adds Twilio credentials to existing SMTP secret or creates new secret

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Twilio Secrets in AWS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$region = "eu-north-1"
$accountId = "666203386231"
$existingSecretArn = "arn:aws:secretsmanager:${region}:${accountId}:secret:uslugar-smtp-config-5xXBg5"
$secretName = "uslugar-twilio-config"

# Twilio credentials (update these!)
# ⚠️ DO NOT COMMIT REAL CREDENTIALS TO GIT!
# Set these values before running the script, or use environment variables
$twilioAccountSID = $env:TWILIO_ACCOUNT_SID ?? "YOUR_ACCOUNT_SID_HERE"
$twilioAuthToken = $env:TWILIO_AUTH_TOKEN ?? "YOUR_AUTH_TOKEN_HERE"
$twilioPhoneNumber = $env:TWILIO_PHONE_NUMBER ?? "YOUR_PHONE_NUMBER_HERE"

Write-Host "📝 Twilio Configuration:" -ForegroundColor Yellow
Write-Host "   Account SID: $twilioAccountSID"
Write-Host "   Auth Token: ${twilioAuthToken.Substring(0, 8)}..."
Write-Host "   Phone Number: $twilioPhoneNumber"
Write-Host ""

# Check if secret exists
Write-Host "🔍 Step 1: Checking for existing secret..." -ForegroundColor Yellow
$secretExists = $false
try {
    $existing = aws secretsmanager describe-secret --secret-id $secretName --region $region 2>$null
    if ($LASTEXITCODE -eq 0) {
        $secretExists = $true
        Write-Host "  ✅ Secret '$secretName' exists" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  Secret '$secretName' does not exist, will create new" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ℹ️  Secret '$secretName' does not exist, will create new" -ForegroundColor Gray
}

# Create or update secret
if ($secretExists) {
    Write-Host "`n📝 Step 2: Updating existing secret..." -ForegroundColor Yellow
    $secretJson = @{
        TWILIO_ACCOUNT_SID = $twilioAccountSID
        TWILIO_AUTH_TOKEN = $twilioAuthToken
        TWILIO_PHONE_NUMBER = $twilioPhoneNumber
    } | ConvertTo-Json -Compress
    
    try {
        aws secretsmanager put-secret-value `
            --secret-id $secretName `
            --secret-string $secretJson `
            --region $region | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Secret updated successfully" -ForegroundColor Green
        } else {
            throw "Update failed"
        }
    } catch {
        Write-Host "  ❌ Failed to update secret: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n📝 Step 2: Creating new secret..." -ForegroundColor Yellow
    $secretJson = @{
        TWILIO_ACCOUNT_SID = $twilioAccountSID
        TWILIO_AUTH_TOKEN = $twilioAuthToken
        TWILIO_PHONE_NUMBER = $twilioPhoneNumber
    } | ConvertTo-Json -Compress
    
    try {
        $result = aws secretsmanager create-secret `
            --name $secretName `
            --secret-string $secretJson `
            --region $region | ConvertFrom-Json
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Secret created successfully" -ForegroundColor Green
            Write-Host "  ARN: $($result.ARN)" -ForegroundColor Gray
        } else {
            throw "Creation failed"
        }
    } catch {
        Write-Host "  ❌ Failed to create secret: $_" -ForegroundColor Red
        exit 1
    }
}

# Get full ARN
Write-Host "`n🔍 Step 3: Getting secret ARN..." -ForegroundColor Yellow
try {
    $secretInfo = aws secretsmanager describe-secret --secret-id $secretName --region $region | ConvertFrom-Json
    $fullSecretArn = $secretInfo.ARN
    Write-Host "  ✅ Secret ARN: $fullSecretArn" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to get secret ARN: $_" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✅ Twilio Secrets Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update ECS Task Definition to include Twilio secrets:" -ForegroundColor Cyan
Write-Host ""
Write-Host '   {
     "name": "TWILIO_ACCOUNT_SID",
     "valueFrom": "' + $fullSecretArn + ':TWILIO_ACCOUNT_SID::"
   },
   {
     "name": "TWILIO_AUTH_TOKEN",
     "valueFrom": "' + $fullSecretArn + ':TWILIO_AUTH_TOKEN::"
   },
   {
     "name": "TWILIO_PHONE_NUMBER",
     "valueFrom": "' + $fullSecretArn + ':TWILIO_PHONE_NUMBER::"
   }'
Write-Host ""
Write-Host "2. Update ECS Service to use new task definition" -ForegroundColor Cyan
Write-Host "3. Restart ECS service" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or run: .\update-ecs-task-twilio.ps1" -ForegroundColor Green
Write-Host ""

