# Deploy Hybrid Role Implementation to AWS ECS
# Prerequisites:
# 1. Docker Desktop running
# 2. AWS CLI configured
# 3. Logged into AWS account

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy Hybrid Role to AWS ECS" -ForegroundColor Cyan
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

# Step 1: Build Docker image
Write-Host "Step 1: Building Docker image..." -ForegroundColor Yellow
docker build -t uslugar-api:hybrid-role .
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
docker tag uslugar-api:hybrid-role ${ECR_REPO}:$GIT_COMMIT
docker tag uslugar-api:hybrid-role ${ECR_REPO}:latest
Write-Host "  OK Images tagged" -ForegroundColor Green
Write-Host "    - ${ECR_REPO}:$GIT_COMMIT" -ForegroundColor Gray
Write-Host "    - ${ECR_REPO}:latest" -ForegroundColor Gray
Write-Host ""

# Step 4: Push to ECR
Write-Host "Step 4: Pushing to ECR..." -ForegroundColor Yellow
Write-Host "  Pushing $GIT_COMMIT..." -ForegroundColor Gray
docker push ${ECR_REPO}:$GIT_COMMIT
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR Push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "  Pushing latest..." -ForegroundColor Gray
docker push ${ECR_REPO}:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "  WARNING Latest push failed (not critical)" -ForegroundColor Yellow
}
Write-Host "  OK Pushed to ECR" -ForegroundColor Green
Write-Host ""

# Step 5: Update ECS Service
Write-Host "Step 5: Updating ECS Service..." -ForegroundColor Yellow
aws ecs update-service `
    --cluster $ECS_CLUSTER `
    --service $ECS_SERVICE `
    --force-new-deployment `
    --region $AWS_REGION `
    --no-cli-pager

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
Write-Host "Details:" -ForegroundColor Cyan
Write-Host "  Image: ${ECR_REPO}:$GIT_COMMIT" -ForegroundColor Gray
Write-Host "  Cluster: $ECS_CLUSTER" -ForegroundColor Gray
Write-Host "  Service: $ECS_SERVICE" -ForegroundColor Gray
Write-Host "  Region: $AWS_REGION" -ForegroundColor Gray
Write-Host ""
Write-Host "ECS will now:" -ForegroundColor Yellow
Write-Host "  1. Pull new image from ECR" -ForegroundColor Gray
Write-Host "  2. Start new tasks with new code" -ForegroundColor Gray
Write-Host "  3. Drain old tasks" -ForegroundColor Gray
Write-Host "  4. Complete deployment (2-3 minutes)" -ForegroundColor Gray
Write-Host ""
Write-Host "Monitor deployment:" -ForegroundColor Cyan
Write-Host "  aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION" -ForegroundColor Gray
Write-Host ""
Write-Host "Or visit AWS Console:" -ForegroundColor Cyan
Write-Host "  https://console.aws.amazon.com/ecs/home?region=$AWS_REGION#/clusters/$ECS_CLUSTER/services/$ECS_SERVICE/deployments" -ForegroundColor Gray
Write-Host ""

# Wait option
$wait = Read-Host "Wait for deployment to complete? (y/n)"
if ($wait -eq "y") {
    Write-Host ""
    Write-Host "Waiting for deployment..." -ForegroundColor Yellow
    aws ecs wait services-stable `
        --cluster $ECS_CLUSTER `
        --services $ECS_SERVICE `
        --region $AWS_REGION
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK Deployment completed successfully!" -ForegroundColor Green
        Write-Host ""
        
        # Test health endpoint
        Write-Host "Testing API health..." -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri "https://uslugar.api.oriph.io/api/health" -Method GET
            Write-Host "  OK API is responding!" -ForegroundColor Green
            Write-Host "  Health: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
        } catch {
            Write-Host "  WARNING API not responding yet" -ForegroundColor Yellow
            Write-Host "  Wait a minute and try again" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ERROR Deployment failed or timed out" -ForegroundColor Red
        Write-Host "  Check AWS Console for details" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Deployment script completed!" -ForegroundColor Cyan
Write-Host ""

