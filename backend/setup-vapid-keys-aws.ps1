# PowerShell script to create VAPID keys secret in AWS Secrets Manager

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  SETUP VAPID KEYS IN AWS SECRETS MANAGER" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$REGION = "eu-north-1"
$SECRET_NAME = "uslugar-vapid-keys"

# VAPID Keys
$VAPID_PRIVATE_KEY = "2IXc0O30gh9A182x2AaJvW2SMqr-lEHvGBuBkPz5u24"
$VAPID_PUBLIC_KEY = "BDG4-j--YWXbakF85YGca1YvaghsIlnsxDIT9RnK1Obiga15pMgNbl2i-HVcoDgrZvZyPMlJMQrabWGa1-7xr30"
$VAPID_SUBJECT = "mailto:admin@uslugar.oriph.io"

Write-Host "1. Checking if secret already exists..." -ForegroundColor Yellow

# Provjeri postoji li secret
$existingSecret = aws secretsmanager describe-secret --secret-id $SECRET_NAME --region $REGION 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Secret already exists!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. Updating existing secret..." -ForegroundColor Yellow
    
    # Ažuriraj postojeći secret
    $secretValue = @{
        VAPID_PRIVATE_KEY = $VAPID_PRIVATE_KEY
        VAPID_PUBLIC_KEY = $VAPID_PUBLIC_KEY
        VAPID_SUBJECT = $VAPID_SUBJECT
    } | ConvertTo-Json -Compress
    
    $result = aws secretsmanager put-secret-value `
        --secret-id $SECRET_NAME `
        --secret-string $secretValue `
        --region $REGION 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Secret updated successfully!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error updating secret:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   Secret does not exist, creating new one..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "2. Creating new secret..." -ForegroundColor Yellow
    
    # Kreiraj novi secret
    $secretValue = @{
        VAPID_PRIVATE_KEY = $VAPID_PRIVATE_KEY
        VAPID_PUBLIC_KEY = $VAPID_PUBLIC_KEY
        VAPID_SUBJECT = $VAPID_SUBJECT
    } | ConvertTo-Json -Compress
    
    $result = aws secretsmanager create-secret `
        --name $SECRET_NAME `
        --secret-string $secretValue `
        --description "VAPID keys for push notifications" `
        --region $REGION 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Secret created successfully!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error creating secret:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "3. Getting secret ARN..." -ForegroundColor Yellow

# Dohvati ARN
$arnOutput = aws secretsmanager describe-secret --secret-id $SECRET_NAME --region $REGION --query 'ARN' --output text 2>&1

if ($LASTEXITCODE -eq 0) {
    $secretArn = $arnOutput.Trim()
    Write-Host "   Secret ARN: $secretArn" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "4. Verifying secret value..." -ForegroundColor Yellow
    
    # Provjeri vrijednost
    $secretValue = aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region $REGION --query 'SecretString' --output text 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Secret value verified!" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "=========================================" -ForegroundColor Cyan
        Write-Host "✅ VAPID Keys Secret Setup Complete!" -ForegroundColor Green
        Write-Host "=========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Secret Name: $SECRET_NAME" -ForegroundColor Gray
        Write-Host "Secret ARN:  $secretArn" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Verify task-def-final.json has correct ARN:" -ForegroundColor Gray
        Write-Host "   arn:aws:secretsmanager:$REGION`:666203386231:secret:$SECRET_NAME-XXXXX:VAPID_PRIVATE_KEY::" -ForegroundColor DarkGray
        Write-Host ""
        Write-Host "2. If ARN is different, update task-def-final.json:" -ForegroundColor Gray
        Write-Host "   `"valueFrom`": `"$secretArn:VAPID_PRIVATE_KEY::`"" -ForegroundColor DarkGray
        Write-Host ""
        Write-Host "3. Deploy updated task definition to ECS" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "   ⚠️  Could not verify secret value" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Could not get secret ARN" -ForegroundColor Yellow
    Write-Host "   Error: $arnOutput" -ForegroundColor Red
}

Write-Host ""
Write-Host "VAPID Keys:" -ForegroundColor Cyan
Write-Host "  Public Key:  $VAPID_PUBLIC_KEY" -ForegroundColor Gray
Write-Host "  Private Key: $VAPID_PRIVATE_KEY" -ForegroundColor Gray
Write-Host "  Subject:     $VAPID_SUBJECT" -ForegroundColor Gray
Write-Host ""

