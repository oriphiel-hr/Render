# PowerShell script to add categories via AWS ECS task
# This version uses a simpler approach: run SQL directly from file

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

Write-Host "2. Running ECS task with psql..." -ForegroundColor Yellow

# Simple command: connect to DB and run SQL file that's already in the container
# OR: use cat to pipe SQL
try {
    # Command to install postgresql-client and run the SQL from file
    $cmd = "apk add --no-cache postgresql-client && cat /dev/stdin | psql `$DATABASE_URL"
    
    # Get SQL content
    $sqlContent = Get-Content "add-categories.sql" -Raw -Encoding utf8
    
    # Create overrides
    $overrides = @{
        containerOverrides = @(
            @{
                name = "psql"
                command = @("sh", "-c", $cmd)
            }
        )
    }
    
    $overridesJson = $overrides | ConvertTo-Json -Depth 10 -Compress
    
    # Pipe SQL to AWS CLI
    $sqlContent | aws ecs run-task `
        --cluster $cluster `
        --launch-type FARGATE `
        --task-definition uslugar-psql-oneoff `
        --network-configuration file://netcfg.json `
        --overrides $overridesJson `
        --region $region
    
    Write-Host "Task started successfully!" -ForegroundColor Green
    Write-Host "Check CloudWatch logs for results." -ForegroundColor Yellow
}
catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
