# Deploy Phase 1: Legal Status Infrastructure
# - Seed legal statuses
# - Deploy new endpoint /api/legal-statuses
# - NO strict validation yet (soft validation only)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Phase 1: Legal Status Infrastructure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "  OK Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  ERROR Docker is not running!" -ForegroundColor Red
    Write-Host "  Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# AWS Configuration
$AWS_REGION = "eu-north-1"
$AWS_ACCOUNT_ID = "666203386231"
$ECR_REPO = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/uslugar-api"
$ECS_CLUSTER = "apps-cluster"
$ECS_SERVICE = "uslugar-service-2gk1f1mv"

# Get Git commit hash
$GIT_COMMIT = git rev-parse --short HEAD
Write-Host "Git Commit: $GIT_COMMIT" -ForegroundColor Gray
Write-Host ""

Write-Host "This deployment includes:" -ForegroundColor Cyan
Write-Host "  + Hybrid role (PROVIDER can create jobs)" -ForegroundColor Gray
Write-Host "  + Legal statuses seed data" -ForegroundColor Gray
Write-Host "  + GET /api/legal-statuses endpoint" -ForegroundColor Gray
Write-Host "  + Soft validation (optional legal status)" -ForegroundColor Yellow
Write-Host ""
Write-Host "What's NOT included (Phase 2):" -ForegroundColor Yellow
Write-Host "  - Strict legal status enforcement" -ForegroundColor Gray
Write-Host "  - Frontend UI for legal status" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Continue with deployment? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Deployment canceled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# Step 1: Build Docker image
Write-Host "Step 1: Building Docker image..." -ForegroundColor Yellow
docker build -t uslugar-api:legal-status-phase1 .
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  OK Docker image built" -ForegroundColor Green
Write-Host ""

# Step 2: Login to ECR
Write-Host "Step 2: Logging into AWS ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR ECR login failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  OK Logged into ECR" -ForegroundColor Green
Write-Host ""

# Step 3: Tag images
Write-Host "Step 3: Tagging Docker images..." -ForegroundColor Yellow
docker tag uslugar-api:legal-status-phase1 ${ECR_REPO}:$GIT_COMMIT
docker tag uslugar-api:legal-status-phase1 ${ECR_REPO}:latest
Write-Host "  OK Images tagged" -ForegroundColor Green
Write-Host ""

# Step 4: Push to ECR
Write-Host "Step 4: Pushing to ECR..." -ForegroundColor Yellow
docker push ${ECR_REPO}:$GIT_COMMIT
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR Push failed!" -ForegroundColor Red
    exit 1
}
docker push ${ECR_REPO}:latest | Out-Null
Write-Host "  OK Pushed to ECR" -ForegroundColor Green
Write-Host ""

# Step 5: Update ECS Service
Write-Host "Step 5: Updating ECS Service..." -ForegroundColor Yellow
aws ecs update-service `
    --cluster $ECS_CLUSTER `
    --service $ECS_SERVICE `
    --force-new-deployment `
    --region $AWS_REGION `
    --no-cli-pager | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR ECS update failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  OK ECS Service update initiated" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Waiting for deployment..." -ForegroundColor Yellow
aws ecs wait services-stable `
    --cluster $ECS_CLUSTER `
    --services $ECS_SERVICE `
    --region $AWS_REGION

Write-Host "  OK Deployment completed!" -ForegroundColor Green
Write-Host ""

# Step 6: Run seed on production (if needed)
Write-Host "Step 6: Seed legal statuses..." -ForegroundColor Yellow
Write-Host ""
Write-Host "To populate legal statuses on production DB, run:" -ForegroundColor Cyan
Write-Host "  DATABASE_URL='production-url' npx prisma db seed" -ForegroundColor Gray
Write-Host ""
Write-Host "Or use SQL direct insert (see LEGAL-STATUS-VALIDATION.md)" -ForegroundColor Gray
Write-Host ""

# Test
Write-Host "Testing API..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/health" -Method GET
    Write-Host "  OK API Health: $($healthResponse | ConvertTo-Json -Compress)" -ForegroundColor Green
    
    $legalStatusesResponse = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/legal-statuses" -Method GET
    $count = $legalStatusesResponse.Count
    Write-Host "  OK Legal Statuses: $count items" -ForegroundColor Green
    
    if ($count -eq 0) {
        Write-Host "  WARNING: No legal statuses in database yet!" -ForegroundColor Yellow
        Write-Host "  Run seed script to populate them." -ForegroundColor Yellow
    }
} catch {
    Write-Host "  WARNING: API not responding yet, give it a minute" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Phase 1 Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "What's live now:" -ForegroundColor Cyan
Write-Host "  + GET /api/legal-statuses" -ForegroundColor Green
Write-Host "  + PROVIDER can create jobs (hybrid role)" -ForegroundColor Green
Write-Host "  + Soft legal status validation" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps (Phase 2):" -ForegroundColor Yellow
Write-Host "  1. Implement frontend UI for legal status" -ForegroundColor Gray
Write-Host "  2. Enable strict validation" -ForegroundColor Gray
Write-Host "  3. Grace period for existing PROVIDERs" -ForegroundColor Gray
Write-Host ""

