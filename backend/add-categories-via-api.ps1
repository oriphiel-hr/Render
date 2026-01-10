# PowerShell script to add categories via AWS SSM SendCommand API

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ADD NEW CATEGORIES TO USLUGAR DB" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$CLUSTER = "apps-cluster"
$SERVICE = "uslugar-service-2gk1f1mv"
$REGION = "eu-north-1"
$DATABASE_URL = "postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"

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

# Extract task ID
$taskId = $taskArn.Split('/')[-1]
Write-Host "   Task ID: $taskId" -ForegroundColor Green
Write-Host ""

Write-Host "2. Adding categories via SSM SendCommand..." -ForegroundColor Yellow
Write-Host ""

# SQL commands
$sql1 = "INSERT INTO \`"Category\`" (id, name, description, \`"isActive\`", icon, \`"requiresLicense\`", \`"nkdCode\`", \`"createdAt\`") VALUES ('arch_001', 'Arhitekti', 'Projektiranje građevina, renovacije, legalizacije', false, '🏗️', true, '71.11', NOW()), ('arch_002', 'Dizajneri interijera', 'Dizajn interijera, namještaj, dekor', false, '🎨', false, '74.10', NOW()), ('arch_003', '3D vizualizacija', '3D modeli, renderi, virtualne turneje', false, '🖼️', false, '74.20', NOW()), ('arch_004', 'Projektiranje građevina', 'Građevinski projekti, statika, instalacije', false, '🏛️', true, '71.12', NOW()), ('arch_005', 'Vrtni dizajn', 'Dizajn vrtova, krajobrazno uređenje', false, '🌳', false, '71.12', NOW()), ('it_001', 'Web dizajn', 'Dizajn web stranica, UI/UX', false, '💻', false, '62.01', NOW()), ('it_002', 'Programiranje', 'Razvoj aplikacija, software', false, '🔧', false, '62.01', NOW()), ('it_003', 'Mobilne aplikacije', 'iOS, Android aplikacije', false, '📱', false, '62.01', NOW()), ('it_004', 'SEO optimizacija', 'Optimizacija za tražilice', false, '🔍', false, '62.02', NOW()), ('it_005', 'Cyber sigurnost', 'Sigurnost IT sustava', false, '🛡️', false, '62.02', NOW()), ('it_006', 'Cloud servisi', 'Cloud infrastruktura, migracije', false, '☁️', false, '62.02', NOW()), ('it_007', 'IT konzulting', 'IT savjetovanje, implementacija', false, '📊', false, '62.03', NOW()), ('health_001', 'Fizioterapija', 'Fizikalna terapija, rehabilitacija', false, '🏥', true, '86.90', NOW()), ('health_002', 'Nutricionizam', 'Prehrambena savjetovanja', false, '🥗', true, '86.90', NOW()), ('health_003', 'Mentalno zdravlje', 'Psihološke usluge, savjetovanje', false, '🧘', true, '86.90', NOW()), ('health_004', 'Kućni liječnik', 'Kućni posjeti, pregledi', false, '👨‍⚕️', true, '86.21', NOW()), ('health_005', 'Stomatologija', 'Zubarske usluge', false, '🦷', true, '86.23', NOW()), ('health_006', 'Optometristi', 'Pregled vida, naočale', false, '👁️', true, '86.90', NOW()) ON CONFLICT (id) DO NOTHING;"

$command1 = "export DATABASE_URL=`"$DATABASE_URL`" && psql \$DATABASE_URL -c `"$sql1`""

Write-Host "   Executing Batch 1/4..." -ForegroundColor Cyan
$result1 = aws ssm send-command `
    --document-name "AWS-RunShellScript" `
    --targets "Key=resourceIds,Values=$taskId" `
    --parameters "commands=[$command1]" `
    --comment "Add categories batch 1" `
    --region $REGION 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR executing batch 1" -ForegroundColor Red
    Write-Host $result1 -ForegroundColor Red
    exit 1
}

Write-Host $result1 -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Command sent successfully!" -ForegroundColor Green
Write-Host "Check AWS Console for results" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
