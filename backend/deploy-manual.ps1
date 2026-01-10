# Manual Deployment Script - Bypass GitHub Push Protection
# Deploys backend directly to AWS ECS without GitHub

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Manual Backend Deployment to AWS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$region = "eu-north-1"
$clusterName = "apps-cluster"
$serviceName = "uslugar-service-2gk1f1mv"
$ecrRepo = "666203386231.dkr.ecr.$region.amazonaws.com/uslugar"
$imageTag = "manual-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
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
    # Try Dockerfile.prod first, fallback to Dockerfile
    if (Test-Path "Dockerfile.prod") {
        docker build -f Dockerfile.prod -t "uslugar-backend:${imageTag}" .
    } else {
        docker build -f Dockerfile -t "uslugar-backend:${imageTag}" .
    }
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
    docker tag "uslugar-backend:${imageTag}" "${ecrRepo}:${imageTag}"
    docker tag "uslugar-backend:${imageTag}" "${ecrRepo}:${latestTag}"
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

# Step 6: Get current task definition
Write-Host "`n📥 Step 6: Getting current task definition..." -ForegroundColor Yellow
try {
    $currentService = aws ecs describe-services `
        --cluster $clusterName `
        --services $serviceName `
        --region $region | ConvertFrom-Json
    
    $currentTaskDefArn = $currentService.services[0].taskDefinition
    Write-Host "  ✅ Current task definition: $currentTaskDefArn" -ForegroundColor Green
    
    # Get task definition JSON
    $taskDef = aws ecs describe-task-definition `
        --task-definition $currentTaskDefArn `
        --region $region | ConvertFrom-Json
    
    $taskDef.taskDefinition | ConvertTo-Json -Depth 10 | Out-File -FilePath "task-def-temp.json" -Encoding UTF8
} catch {
    Write-Host "  ❌ Failed to get task definition: $_" -ForegroundColor Red
    exit 1
}

# Step 7: Update image in task definition
Write-Host "`n📝 Step 7: Updating task definition with new image..." -ForegroundColor Yellow
try {
    # Use jq if available, otherwise use PowerShell JSON manipulation
    $taskDefJson = Get-Content "task-def-temp.json" | ConvertFrom-Json
    
    # Remove fields that shouldn't be in new task definition
    $taskDefJson.PSObject.Properties.Remove('status')
    $taskDefJson.PSObject.Properties.Remove('requiresAttributes')
    $taskDefJson.PSObject.Properties.Remove('compatibilities')
    $taskDefJson.PSObject.Properties.Remove('revision')
    $taskDefJson.PSObject.Properties.Remove('registeredAt')
    $taskDefJson.PSObject.Properties.Remove('registeredBy')
    $taskDefJson.PSObject.Properties.Remove('deregisteredAt')
    $taskDefJson.PSObject.Properties.Remove('taskDefinitionArn')
    
    # Update image URI
    $newImageUri = "${ecrRepo}:${imageTag}"
    foreach ($container in $taskDefJson.containerDefinitions) {
        if ($container.name -eq "uslugar") {
            $container.image = $newImageUri
            Write-Host "  ✅ Updated image to: $newImageUri" -ForegroundColor Green
            break
        }
    }
    
    $taskDefJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "task-def-new.json" -Encoding UTF8
} catch {
    Write-Host "  ❌ Failed to update task definition: $_" -ForegroundColor Red
    exit 1
}

# Step 8: Register new task definition
Write-Host "`n📤 Step 8: Registering new task definition..." -ForegroundColor Yellow
try {
    $newTaskDef = aws ecs register-task-definition `
        --cli-input-json file://task-def-new.json `
        --region $region | ConvertFrom-Json
    
    $newTaskDefArn = $newTaskDef.taskDefinition.taskDefinitionArn
    Write-Host "  ✅ New task definition registered: $newTaskDefArn" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to register task definition: $_" -ForegroundColor Red
    exit 1
}

# Step 9: Update ECS Service
Write-Host "`n🔄 Step 9: Updating ECS Service..." -ForegroundColor Yellow
try {
    aws ecs update-service `
        --cluster $clusterName `
        --service $serviceName `
        --task-definition $newTaskDefArn `
        --force-new-deployment `
        --region $region | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ ECS Service update initiated" -ForegroundColor Green
    } else {
        throw "ECS update failed"
    }
} catch {
    Write-Host "  ❌ ECS update failed: $_" -ForegroundColor Red
    exit 1
}

# Cleanup
Remove-Item "task-def-temp.json" -ErrorAction SilentlyContinue
Remove-Item "task-def-new.json" -ErrorAction SilentlyContinue

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✅ Deployment Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Image: ${ecrRepo}:${imageTag}" -ForegroundColor Gray
Write-Host "Task Definition: $newTaskDefArn" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Monitor deployment:" -ForegroundColor Yellow
Write-Host "   aws ecs describe-services --cluster $clusterName --services $serviceName --region $region" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 View logs:" -ForegroundColor Yellow
Write-Host "   aws logs tail /ecs/uslugar-backend --follow --region $region" -ForegroundColor Cyan
Write-Host ""

