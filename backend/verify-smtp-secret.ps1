# Verify SMTP Secret in AWS Secrets Manager
# This script checks the current SMTP configuration in AWS

$REGION = "eu-north-1"
$SECRET_NAME = "uslugar-smtp-config"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "AWS SMTP Secret Verification" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Fetching secret from AWS..." -ForegroundColor Yellow

try {
    $secretValue = aws secretsmanager get-secret-value `
        --secret-id $SECRET_NAME `
        --region $REGION `
        --query 'SecretString' `
        --output text `
        2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Error fetching secret: $secretValue" -ForegroundColor Red
        exit 1
    }

    # Parse JSON (handle escaped JSON from AWS)
    $secretJson = $secretValue -replace '\\"', '"' | ConvertFrom-Json

    Write-Host "✓ Secret retrieved successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Current SMTP Configuration:" -ForegroundColor Cyan
    Write-Host "  SMTP_HOST: $($secretJson.SMTP_HOST)" -ForegroundColor Gray
    Write-Host "  SMTP_PORT: $($secretJson.SMTP_PORT)" -ForegroundColor Gray
    Write-Host "  SMTP_USER: $($secretJson.SMTP_USER)" -ForegroundColor Gray
    Write-Host "  SMTP_PASS: ********" -ForegroundColor Gray
    Write-Host "  FRONTEND_URL: $($secretJson.FRONTEND_URL)" -ForegroundColor Gray
    Write-Host ""

    # Check if email is updated
    if ($secretJson.SMTP_USER -eq "uslugar@oriphiel.hr") {
        Write-Host "✓ Email address is correctly set to: uslugar@oriphiel.hr" -ForegroundColor Green
    } else {
        Write-Host "✗ Email address is NOT updated!" -ForegroundColor Red
        Write-Host "  Current: $($secretJson.SMTP_USER)" -ForegroundColor Yellow
        Write-Host "  Expected: uslugar@oriphiel.hr" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan

} catch {
    Write-Host "✗ Error parsing secret: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Raw secret value:" -ForegroundColor Yellow
    Write-Host $secretValue -ForegroundColor Gray
    exit 1
}

