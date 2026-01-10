# PowerShell script to seed categories on AWS ECS

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  SEED CATEGORIES ON AWS ECS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$CLUSTER = "apps-cluster"
$SERVICE = "uslugar-service-2gk1f1mv"
$REGION = "eu-north-1"

Write-Host "1. Finding running ECS task..." -ForegroundColor Yellow

# Get task ARN
$taskArn = aws ecs list-tasks --cluster $CLUSTER --service-name $SERVICE --region $REGION --query 'taskArns[0]' --output text

if (-Not $taskArn -or $taskArn -eq "None") {
    Write-Host "ERROR: No running tasks found!" -ForegroundColor Red
    Write-Host "Make sure ECS service is running." -ForegroundColor Yellow
    exit 1
}

Write-Host "   Task: $taskArn" -ForegroundColor Green
Write-Host ""

Write-Host "2. Running Prisma seed..." -ForegroundColor Yellow

# Run Prisma seed
aws ecs execute-command `
    --cluster $CLUSTER `
    --task $taskArn `
    --container uslugar `
    --region $REGION `
    --interactive `
    --command "cd /app && npx prisma db seed" `
    2>&1

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Done! Check results above." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
