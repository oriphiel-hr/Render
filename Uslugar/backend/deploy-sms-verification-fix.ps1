# Deploy SMS Verification Fix to AWS ECS
# Fix: IdentityBadgeVerification sada koristi SMS workflow umjesto automatske verifikacije

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy SMS Verification Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$region = "eu-north-1"
$clusterName = "uslugar-cluster"
$serviceName = "uslugar-backend-service"
$ecrRepo = "666203386231.dkr.ecr.$region.amazonaws.com/uslugar-backend"
$imageTag = "sms-verification-fix-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$latestTag = "latest"

# Step 1: Check Docker
Write-Host "🐳 Step 1: Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "  ✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker is not running!" -ForegroundColor Red
    Write-Host "  Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Step 2: Build Docker image
Write-Host "`n📦 Step 2: Building Docker image..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
try {
    docker build -t "uslugar-backend:$imageTag" .
    Write-Host "  ✅ Build successful" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Build failed: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Login to ECR
Write-Host "`n🔐 Step 3: Logging into AWS ECR..." -ForegroundColor Yellow
try {
    $loginPassword = aws ecr get-login-password --region $region
    if ($LASTEXITCODE -ne 0) {
        throw "ECR login failed"
    }
    echo $loginPassword | docker login --username AWS --password-stdin $ecrRepo
    if ($LASTEXITCODE -ne 0) {
        throw "Docker login failed"
    }
    Write-Host "  ✅ ECR login successful" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ECR login failed: $_" -ForegroundColor Red
    Write-Host "   Make sure AWS CLI is configured: aws configure" -ForegroundColor Yellow
    exit 1
}

# Step 4: Tag images
Write-Host "`n🏷️  Step 4: Tagging Docker images..." -ForegroundColor Yellow
try {
    docker tag "uslugar-backend:$imageTag" "${ecrRepo}:${imageTag}"
    docker tag "uslugar-backend:$imageTag" "${ecrRepo}:${latestTag}"
    Write-Host "  ✅ Images tagged" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Tag failed: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Push to ECR
Write-Host "`n📤 Step 5: Pushing images to ECR..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
try {
    docker push "${ecrRepo}:${imageTag}"
    if ($LASTEXITCODE -ne 0) {
        throw "Push failed"
    }
    docker push "${ecrRepo}:${latestTag}"
    Write-Host "  ✅ Push successful" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Push failed: $_" -ForegroundColor Red
    exit 1
}

# Step 6: Update ECS Service
Write-Host "`n🔄 Step 6: Updating ECS Service..." -ForegroundColor Yellow
try {
    aws ecs update-service `
        --cluster $clusterName `
        --service $serviceName `
        --force-new-deployment `
        --region $region | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        throw "ECS update failed"
    }
    Write-Host "  ✅ ECS Service update initiated" -ForegroundColor Green
} catch {
    Write-Host "  ❌ ECS update failed: $_" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✅ Deployment Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Image: ${ecrRepo}:${imageTag}" -ForegroundColor Gray
Write-Host "Also tagged as: ${ecrRepo}:${latestTag}" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Monitor deployment:" -ForegroundColor Yellow
Write-Host "   aws ecs describe-services --cluster $clusterName --services $serviceName --region $region" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 View logs:" -ForegroundColor Yellow
Write-Host "   aws logs tail /ecs/uslugar-backend --follow --region $region" -ForegroundColor Cyan
Write-Host ""

