# Update SMTP Secret in AWS Secrets Manager
# This script updates the SMTP credentials in AWS Secrets Manager

$REGION = "eu-north-1"
$SECRET_NAME = "uslugar-smtp-config-5xXBg5"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "AWS Secrets Manager - SMTP Update" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Read current secret to verify it exists
Write-Host "Checking if secret exists..." -ForegroundColor Yellow
try {
    $secretExists = aws secretsmanager describe-secret --secret-id $SECRET_NAME --region $REGION 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Secret '$SECRET_NAME' not found in AWS Secrets Manager" -ForegroundColor Red
        Write-Host "Please create the secret first or check the secret name." -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✓ Secret found" -ForegroundColor Green
} catch {
    Write-Host "Error checking secret: $_" -ForegroundColor Red
    exit 1
}

# New SMTP credentials
$SMTP_CONFIG = @{
    SMTP_HOST = "smtp.hostinger.com"
    SMTP_PORT = "465"
    SMTP_USER = "uslugar@oriphiel.hr"
    SMTP_PASS = "c|1TYK4YqbF"
    FRONTEND_URL = "https://uslugar.oriph.io"
}

Write-Host ""
Write-Host "Updating secret with new values:" -ForegroundColor Yellow
Write-Host "  Host: $($SMTP_CONFIG.SMTP_HOST)" -ForegroundColor Gray
Write-Host "  Port: $($SMTP_CONFIG.SMTP_PORT)" -ForegroundColor Gray
Write-Host "  User: $($SMTP_CONFIG.SMTP_USER)" -ForegroundColor Gray
Write-Host "  Pass: ********" -ForegroundColor Gray
Write-Host "  Frontend URL: $($SMTP_CONFIG.FRONTEND_URL)" -ForegroundColor Gray
Write-Host ""

# Convert to JSON
$secretJson = $SMTP_CONFIG | ConvertTo-Json -Compress

# Update secret in AWS
Write-Host "Updating secret in AWS Secrets Manager..." -ForegroundColor Yellow
try {
    $result = aws secretsmanager put-secret-value `
        --secret-id $SECRET_NAME `
        --secret-string $secretJson `
        --region $REGION `
        2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Secret updated successfully!" -ForegroundColor Green
        Write-Host ""
        
        # Verify the update
        Write-Host "Verifying update..." -ForegroundColor Yellow
        $secretValue = aws secretsmanager get-secret-value `
            --secret-id $SECRET_NAME `
            --region $REGION `
            --query 'SecretString' `
            --output text `
            2>&1

        if ($LASTEXITCODE -eq 0) {
            $parsedSecret = $secretValue | ConvertFrom-Json
            Write-Host "✓ Verification successful!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Current secret values:" -ForegroundColor Cyan
            Write-Host "  SMTP_HOST: $($parsedSecret.SMTP_HOST)" -ForegroundColor Gray
            Write-Host "  SMTP_PORT: $($parsedSecret.SMTP_PORT)" -ForegroundColor Gray
            Write-Host "  SMTP_USER: $($parsedSecret.SMTP_USER)" -ForegroundColor Gray
            Write-Host "  SMTP_PASS: ********" -ForegroundColor Gray
            Write-Host "  FRONTEND_URL: $($parsedSecret.FRONTEND_URL)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "1. Restart ECS task to pick up new secret values" -ForegroundColor White
            Write-Host "2. Test email sending functionality" -ForegroundColor White
        } else {
            Write-Host "Warning: Could not verify secret update" -ForegroundColor Yellow
        }
    } else {
        Write-Host ""
        Write-Host "✗ Error updating secret:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Update complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan

