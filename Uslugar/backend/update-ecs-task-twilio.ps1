# Update ECS Task Definition with Twilio Secrets
# Adds Twilio environment variables from Secrets Manager to ECS Task Definition

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Update ECS Task Definition" -ForegroundColor Cyan
Write-Host "  Add Twilio Secrets" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$region = "eu-north-1"
$clusterName = "uslugar-cluster"
$serviceName = "uslugar-backend-service"
$taskFamily = "uslugar"
$secretName = "uslugar-twilio-config"

# Step 1: Get current task definition
Write-Host "📥 Step 1: Getting current task definition..." -ForegroundColor Yellow
try {
    $currentTaskDef = aws ecs describe-task-definition `
        --task-definition $taskFamily `
        --region $region `
        --query 'taskDefinition' | ConvertFrom-Json
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to get task definition"
    }
    
    Write-Host "  ✅ Task definition retrieved (revision: $($currentTaskDef.revision))" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to get task definition: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Get Twilio secret ARN
Write-Host "`n🔍 Step 2: Getting Twilio secret ARN..." -ForegroundColor Yellow
try {
    $secretInfo = aws secretsmanager describe-secret --secret-id $secretName --region $region | ConvertFrom-Json
    $secretArn = $secretInfo.ARN
    Write-Host "  ✅ Secret ARN: $secretArn" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Twilio secret not found: $secretName" -ForegroundColor Red
    Write-Host "  Run .\setup-twilio-secrets.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Step 3: Check if Twilio secrets already exist
Write-Host "`n🔍 Step 3: Checking if Twilio secrets already exist..." -ForegroundColor Yellow
$containerDef = $currentTaskDef.containerDefinitions[0]
$hasTwilioSID = $containerDef.secrets | Where-Object { $_.name -eq "TWILIO_ACCOUNT_SID" }
$hasTwilioToken = $containerDef.secrets | Where-Object { $_.name -eq "TWILIO_AUTH_TOKEN" }
$hasTwilioPhone = $containerDef.secrets | Where-Object { $_.name -eq "TWILIO_PHONE_NUMBER" }

if ($hasTwilioSID -and $hasTwilioToken -and $hasTwilioPhone) {
    Write-Host "  ✅ Twilio secrets already exist in task definition" -ForegroundColor Green
    Write-Host "  No update needed!" -ForegroundColor Gray
    exit 0
} else {
    Write-Host "  ℹ️  Twilio secrets not found, will add them" -ForegroundColor Gray
}

# Step 4: Add Twilio secrets to task definition
Write-Host "`n📝 Step 4: Adding Twilio secrets to task definition..." -ForegroundColor Yellow

# Create new secrets array with Twilio secrets
$newSecrets = @()

# Add existing secrets
foreach ($secret in $containerDef.secrets) {
    $newSecrets += $secret
}

# Add Twilio secrets
$newSecrets += @{
    name = "TWILIO_ACCOUNT_SID"
    valueFrom = "${secretArn}:TWILIO_ACCOUNT_SID::"
}
$newSecrets += @{
    name = "TWILIO_AUTH_TOKEN"
    valueFrom = "${secretArn}:TWILIO_AUTH_TOKEN::"
}
$newSecrets += @{
    name = "TWILIO_PHONE_NUMBER"
    valueFrom = "${secretArn}:TWILIO_PHONE_NUMBER::"
}

# Update container definition
$containerDef.secrets = $newSecrets

# Remove fields that shouldn't be in new task definition
$newTaskDef = @{
    family = $currentTaskDef.family
    networkMode = $currentTaskDef.networkMode
    requiresCompatibilities = $currentTaskDef.requiresCompatibilities
    cpu = $currentTaskDef.cpu
    memory = $currentTaskDef.memory
    executionRoleArn = $currentTaskDef.executionRoleArn
    containerDefinitions = @($containerDef)
    taskRoleArn = $currentTaskDef.taskRoleArn
} | ConvertTo-Json -Depth 10

# Step 5: Register new task definition
Write-Host "`n📤 Step 5: Registering new task definition..." -ForegroundColor Yellow
$tempFile = "task-def-twilio-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
try {
    $newTaskDef | Out-File -FilePath $tempFile -Encoding UTF8
    
    $result = aws ecs register-task-definition `
        --cli-input-json file://$tempFile `
        --region $region | ConvertFrom-Json
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ New task definition registered (revision: $($result.taskDefinition.revision))" -ForegroundColor Green
    } else {
        throw "Registration failed"
    }
} catch {
    Write-Host "  ❌ Failed to register task definition: $_" -ForegroundColor Red
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    exit 1
} finally {
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

# Step 6: Update ECS Service
Write-Host "`n🔄 Step 6: Updating ECS Service..." -ForegroundColor Yellow
try {
    $newRevision = $result.taskDefinition.revision
    aws ecs update-service `
        --cluster $clusterName `
        --service $serviceName `
        --task-definition "${taskFamily}:${newRevision}" `
        --force-new-deployment `
        --region $region | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ ECS Service update initiated" -ForegroundColor Green
    } else {
        throw "Service update failed"
    }
} catch {
    Write-Host "  ❌ Failed to update service: $_" -ForegroundColor Red
    Write-Host "  Task definition updated, but service update failed" -ForegroundColor Yellow
    Write-Host "  You can manually update the service with:" -ForegroundColor Yellow
    Write-Host "    aws ecs update-service --cluster $clusterName --service $serviceName --task-definition ${taskFamily}:${newRevision} --region $region" -ForegroundColor Cyan
    exit 1
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✅ ECS Task Definition Updated!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Task Definition: ${taskFamily}:${newRevision}" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Monitor deployment:" -ForegroundColor Yellow
Write-Host "   aws ecs describe-services --cluster $clusterName --services $serviceName --region $region" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 View logs (wait ~2 minutes for service to restart):" -ForegroundColor Yellow
Write-Host "   aws logs tail /ecs/uslugar-backend --follow --region $region" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Verify Twilio config in logs:" -ForegroundColor Yellow
Write-Host "   Look for: [SMS Service] Twilio config check: { hasAccountSID: true, ... }" -ForegroundColor Cyan
Write-Host ""

