# PowerShell script za deployment ProviderTeamLocation migracije
# Usage: .\deploy-team-locations.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 ProviderTeamLocation Migration Deployment" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# Configuration
$region = "eu-north-1"
$clusterName = "uslugar-cluster"
$serviceName = "uslugar-backend-service"
$ecrRepo = "339713096106.dkr.ecr.eu-north-1.amazonaws.com/uslugar-backend"
$imageTag = "latest"

# Step 1: Navigate to backend directory
Write-Host "`n📁 Step 1: Navigate to backend directory..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot ".." "uslugar" "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}
Push-Location $backendPath
Write-Host "✅ Current directory: $(Get-Location)" -ForegroundColor Green

# Step 2: Check if Docker is running
Write-Host "`n🐳 Step 2: Check Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    Pop-Location
    exit 1
}

# Step 3: Build Docker image
Write-Host "`n🔨 Step 3: Build Docker image..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
try {
    docker build -f Dockerfile.prod -t uslugar-backend:$imageTag . 2>&1 | ForEach-Object {
        if ($_ -match "error|ERROR|Error") {
            Write-Host $_ -ForegroundColor Red
        } else {
            Write-Host $_ -ForegroundColor Gray
        }
    }
    Write-Host "✅ Build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Step 4: Login to ECR
Write-Host "`n🔐 Step 4: Login to AWS ECR..." -ForegroundColor Yellow
try {
    $loginCmd = aws ecr get-login-password --region $region 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw $loginCmd
    }
    $loginCmd | docker login --username AWS --password-stdin $ecrRepo 2>&1 | Out-Null
    Write-Host "✅ ECR login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ ECR login failed: $_" -ForegroundColor Red
    Write-Host "   Make sure AWS CLI is configured: aws configure" -ForegroundColor Yellow
    Pop-Location
    exit 1
}

# Step 5: Tag image
Write-Host "`n🏷️  Step 5: Tag image..." -ForegroundColor Yellow
try {
    docker tag "uslugar-backend:$imageTag" "$ecrRepo:$imageTag"
    Write-Host "✅ Image tagged" -ForegroundColor Green
} catch {
    Write-Host "❌ Tag failed: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Step 6: Push to ECR
Write-Host "`n📤 Step 6: Push image to ECR..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
try {
    docker push "$ecrRepo:$imageTag" 2>&1 | ForEach-Object {
        if ($_ -match "error|ERROR|Error|denied") {
            Write-Host $_ -ForegroundColor Red
        } elseif ($_ -match "Pushed|pushed|Layer") {
            Write-Host $_ -ForegroundColor Green
        } else {
            Write-Host $_ -ForegroundColor Gray
        }
    }
    Write-Host "✅ Push successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Push failed: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Step 7: Deploy to ECS
Write-Host "`n🚀 Step 7: Deploy to ECS..." -ForegroundColor Yellow
try {
    $deployOutput = aws ecs update-service `
        --cluster $clusterName `
        --service $serviceName `
        --force-new-deployment `
        --region $region 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw $deployOutput
    }
    
    Write-Host "✅ Deployment initiated" -ForegroundColor Green
    Write-Host "   Service: $serviceName" -ForegroundColor Gray
    Write-Host "   Cluster: $clusterName" -ForegroundColor Gray
    Write-Host "   Region: $region" -ForegroundColor Gray
} catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Step 8: Wait for deployment
Write-Host "`n⏳ Step 8: Waiting for deployment to stabilize..." -ForegroundColor Yellow
Write-Host "   This may take 2-3 minutes..." -ForegroundColor Gray

$maxWait = 300 # 5 minutes
$elapsed = 0
$checkInterval = 10

while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
    
    try {
        $service = aws ecs describe-services `
            --cluster $clusterName `
            --services $serviceName `
            --region $region `
            --query 'services[0]' | ConvertFrom-Json
        
        $runningCount = $service.runningCount
        $desiredCount = $service.desiredCount
        $deployments = $service.deployments
        
        Write-Host "   Status: $runningCount/$desiredCount running, $($deployments.Count) deployment(s)" -ForegroundColor Gray
        
        # Check if deployment is stable
        $stableDeployment = $deployments | Where-Object { $_.status -eq "PRIMARY" -and $_.runningCount -eq $desiredCount }
        
        if ($stableDeployment -and $runningCount -eq $desiredCount) {
            Write-Host "✅ Deployment stable!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "   ⚠️  Could not check status: $_" -ForegroundColor Yellow
    }
}

if ($elapsed -ge $maxWait) {
    Write-Host "⚠️  Deployment check timeout. Please check manually." -ForegroundColor Yellow
}

# Step 9: Check migration logs
Write-Host "`n📋 Step 9: Checking migration status..." -ForegroundColor Yellow
Write-Host "   To check migration logs, run:" -ForegroundColor Gray
Write-Host "   aws logs tail /ecs/uslugar-backend --since 10m --region $region" -ForegroundColor Cyan

# Step 10: Verification instructions
Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Check logs for migration output:" -ForegroundColor White
Write-Host "      aws logs tail /ecs/uslugar-backend --since 10m --region $region | Select-String 'migrate'" -ForegroundColor Gray
Write-Host "`n   2. Verify table exists (RDS Query Editor):" -ForegroundColor White
Write-Host "      SELECT table_name FROM information_schema.tables WHERE table_name = 'ProviderTeamLocation';" -ForegroundColor Gray
Write-Host "`n   3. Test API endpoint:" -ForegroundColor White
Write-Host "      https://uslugar.api.oriph.io/api/exclusive/leads/available" -ForegroundColor Gray
Write-Host "`n   4. Test frontend:" -ForegroundColor White
Write-Host "      https://uslugar.oriph.io/#team-locations" -ForegroundColor Gray

Pop-Location

Write-Host "`n🎉 Done! Migration will run automatically on container startup." -ForegroundColor Green

