# USLUGAR Queue Model - AWS Deployment Script
# Pokreće migraciju direktno na AWS ECS

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "USLUGAR QUEUE MODEL - AWS DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$AWS_REGION = "eu-north-1"
$CLUSTER_NAME = "uslugar-cluster"
$TASK_DEF = "uslugar-backend"

Write-Host "📦 Korak 1: Build i Push Docker Image..." -ForegroundColor Cyan
Write-Host ""

# Build Docker image s novim kodom
Write-Host "Building Docker image..." -ForegroundColor White
docker build -t uslugar-backend:queue-model -f Dockerfile .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

# Tag za ECR
$ECR_URI = "339713096106.dkr.ecr.eu-north-1.amazonaws.com/uslugar-backend"
docker tag uslugar-backend:queue-model "${ECR_URI}:queue-model"
docker tag uslugar-backend:queue-model "${ECR_URI}:latest"

# Login to ECR
Write-Host "Logging in to AWS ECR..." -ForegroundColor White
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI

# Push to ECR
Write-Host "Pushing to ECR..." -ForegroundColor White
docker push "${ECR_URI}:queue-model"
docker push "${ECR_URI}:latest"

Write-Host "✅ Docker image pushed to ECR" -ForegroundColor Green
Write-Host ""

Write-Host "🔄 Korak 2: Pokretanje Migracije na AWS..." -ForegroundColor Cyan
Write-Host ""

# Kreiraj task za migraciju
$migrationCommand = @(
    "sh",
    "-c",
    "npx prisma migrate deploy --schema=prisma/schema.prisma && node prisma/seeds/seed-categories.js"
)

$commandJson = $migrationCommand | ConvertTo-Json -Compress

Write-Host "Pokrećem ECS Task za migraciju..." -ForegroundColor White

# Run task na AWS-u
aws ecs run-task `
    --cluster $CLUSTER_NAME `
    --task-definition $TASK_DEF `
    --launch-type FARGATE `
    --network-configuration "awsvpcConfiguration={subnets=[subnet-0a1b2c3d],securityGroups=[sg-0x1x2x3x],assignPublicIp=ENABLED}" `
    --overrides "{`"containerOverrides`":[{`"name`":`"uslugar-backend`",`"command`":$commandJson}]}" `
    --region $AWS_REGION

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migration task" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternativa: Ručna primjena" -ForegroundColor Yellow
    Write-Host "1. SSH u ECS task" -ForegroundColor Gray
    Write-Host "2. Pokreni: npx prisma migrate deploy" -ForegroundColor Gray
    Write-Host "3. Pokreni: node prisma/seeds/seed-categories.js" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Migration task started" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Praćenje Task-a..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Get task ARN
$tasks = aws ecs list-tasks --cluster $CLUSTER_NAME --region $AWS_REGION | ConvertFrom-Json
if ($tasks.taskArns.Count -gt 0) {
    $latestTask = $tasks.taskArns[0]
    Write-Host "Task ARN: $latestTask" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "Provjeri status u AWS Console:" -ForegroundColor White
    Write-Host "https://eu-north-1.console.aws.amazon.com/ecs/v2/clusters/$CLUSTER_NAME/tasks" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🔄 Korak 3: Update ECS Service..." -ForegroundColor Cyan

# Force new deployment
aws ecs update-service `
    --cluster $CLUSTER_NAME `
    --service uslugar-backend-service `
    --force-new-deployment `
    --region $AWS_REGION

Write-Host "✅ Service deployment triggered" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Provjeri:" -ForegroundColor Cyan
Write-Host "1. ECS Tasks: https://eu-north-1.console.aws.amazon.com/ecs/v2/clusters/$CLUSTER_NAME/tasks" -ForegroundColor Gray
Write-Host "2. CloudWatch Logs: Traži 'Migration' u logovima" -ForegroundColor Gray
Write-Host "3. API Test: https://uslugar-api.oriph.io/api/lead-queue/stats" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Queue Model deployed to AWS!" -ForegroundColor Green

