# PowerShell script to add categories via AWS ECS task

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ADD CATEGORIES TO USLUGAR VIA ECS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$cluster = "apps-cluster"
$region = "eu-north-1"

Write-Host "1. Creating network configuration..." -ForegroundColor Yellow

# Network config
$netConfig = @{
    awsvpcConfiguration = @{
        subnets = @("subnet-0a00f97768705bbcf", "subnet-01b67edfd00dc288c")
        securityGroups = @("sg-084c1e49c9c77aff1")
        assignPublicIp = "DISABLED"
    }
}

$netConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "netcfg.json" -Encoding utf8

Write-Host "2. Reading SQL file..." -ForegroundColor Yellow

$sqlContent = Get-Content "add-categories.sql" -Raw -Encoding utf8

Write-Host "3. Creating task with SQL script..." -ForegroundColor Yellow

# Base64 encode the SQL to avoid encoding issues
$sqlBytes = [System.Text.Encoding]::UTF8.GetBytes($sqlContent)
$sqlBase64 = [Convert]::ToBase64String($sqlBytes)

# Create command that decodes and runs SQL
$command = @"
apk add --no-cache postgresql-client base64 >/dev/null 2>&1
echo '$sqlBase64' | base64 -d | psql `$DATABASE_URL
if [ `$? -eq 0 ]; then
  echo "SUCCESS: Categories added!"
else
  echo "ERROR: Failed to add categories"
  exit 1
fi
"@

# Overrides with command
$overrides = @{
    containerOverrides = @(
        @{
            name = "psql"
            command = @("sh", "-c", $command)
        }
    )
}

$overridesJson = $overrides | ConvertTo-Json -Depth 10 -Compress

Write-Host "4. Running ECS task..." -ForegroundColor Yellow

try {
    # Run the task
    $result = aws ecs run-task `
        --cluster $cluster `
        --launch-type FARGATE `
        --task-definition uslugar-psql-oneoff `
        --network-configuration file://netcfg.json `
        --overrides $overridesJson `
        --region $region
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to run task" -ForegroundColor Red
        exit 1
    }
    
    # Extract task ARN
    $taskArn = ($result | ConvertFrom-Json).tasks[0].taskArn
    Write-Host "   Task ARN: $taskArn" -ForegroundColor Green
    
    # Wait for task to complete
    Write-Host "5. Waiting for task to complete..." -ForegroundColor Yellow
    aws ecs wait tasks-stopped --cluster $cluster --tasks $taskArn --region $region
    
    # Get task ID
    $taskId = $taskArn.Split('/')[-1]
    
    # Get logs
    Write-Host "6. Fetching logs..." -ForegroundColor Yellow
    aws logs get-log-events `
        --log-group-name "/ecs/uslugar/prisma" `
        --log-stream-name "psql/psql/$taskId" `
        --start-from-head `
        --region $region `
        --query 'events[].message' `
        --output text
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Done!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Cyan
}
catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    exit 1
}
