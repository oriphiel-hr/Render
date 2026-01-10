<# 
.SYNOPSIS
  Build & deploy uslugar-api na AWS ECS (ECR + ECS rollout) iz PowerShella.

.PREREQS
  - AWS CLI (ulogiran: aws configure / SSO / role)
  - Docker (daemon up)
  - Git (radi u git repo-u ili koristi fallback tag)
#>

param(
  [string]$Region         = "eu-central-1",
  [string]$Cluster        = "apps-cluster",
  [string]$Service        = "uslugar-api",
  [string]$Repo           = "uslugar-api",     # ECR repository name
  [string]$ContainerName  = $Service,          # ime kontejnera u task definiciji (često = $Service)
  [switch]$ForceLatest                        # dodatno tagiraj/pushaj :latest i samo force-new-deployment
)

$ErrorActionPreference = 'Stop'
Write-Host "==> Starting deploy (Region=$Region, Cluster=$Cluster, Service=$Service, Repo=$Repo)" -ForegroundColor Cyan

# 0) Resolve AWS account id
$AccountId = aws sts get-caller-identity --query Account --output text
if (-not $AccountId) { throw "Ne mogu dohvatiti AWS AccountId." }
$EcrDomain = "$AccountId.dkr.ecr.$Region.amazonaws.com"

# 1) Prepare tag (git hash or timestamp fallback)
try {
  $Tag = (git rev-parse --short HEAD).Trim()
  if (-not $Tag) { throw "empty" }
} catch {
  $Tag = Get-Date -UFormat "%Y%m%d-%H%M%S"
  Write-Warning "Nije git repo; koristim fallback tag: $Tag"
}

# 2) ECR login + ensure repo
Write-Host "==> ECR login: $EcrDomain"
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $EcrDomain | Out-Null

try {
  aws ecr describe-repositories --repository-names $Repo --region $Region | Out-Null
} catch {
  Write-Host "==> Creating ECR repo $Repo"
  aws ecr create-repository --repository-name $Repo --region $Region | Out-Null
}

# 3) Build & push
$ImageUri = "$EcrDomain/${Repo}:$Tag"
Write-Host "==> Building image $ImageUri"
docker build -t $ImageUri . | Out-Null

Write-Host "==> Pushing $ImageUri"
docker push $ImageUri | Out-Null

if ($ForceLatest) {
  Write-Host "==> Tagging & pushing :latest"
  docker tag  $ImageUri "$EcrDomain/${Repo}:latest" | Out-Null
  docker push "$EcrDomain/${Repo}:latest" | Out-Null
}

# 4) Get current task definition ARN from service
Write-Host "==> Fetching current taskDefinition ARN for service $Service"
$TdArn = aws ecs describe-services --cluster $Cluster --services $Service --region $Region --query 'services[0].taskDefinition' --output text
if (-not $TdArn -or $TdArn -eq "None") { throw "Nisam uspio dohvatiti taskDefinition ARN (provjeri naziv servisa/cluster)." }

# 5) Download current task definition (object)
Write-Host "==> Downloading current task definition: $TdArn"
$TaskDefJson = aws ecs describe-task-definition --task-definition $TdArn --region $Region --query 'taskDefinition' --output json
$TaskDef = $TaskDefJson | ConvertFrom-Json

# 6) Clean unsupported fields
foreach ($prop in @('taskDefinitionArn','revision','status','requiresAttributes','compatibilities','registeredAt','registeredBy')) {
  if ($TaskDef.PSObject.Properties.Name -contains $prop) {
    $TaskDef.PSObject.Properties.Remove($prop) | Out-Null
  }
}

# 7) Update container image (by name or first)
$container = $TaskDef.containerDefinitions | Where-Object { $_.name -eq $ContainerName } | Select-Object -First 1
if (-not $container) {
  Write-Warning "Container '$ContainerName' nije nađen u task definiciji. Mijenjam image prvog container-a."
  $container = $TaskDef.containerDefinitions[0]
}
if ($ForceLatest) {
  $container.image = "$EcrDomain/${Repo}:latest"
} else {
  $container.image = $ImageUri
}

# 8) Save effective taskdef and register new revision
$EffectiveJson = $TaskDef | ConvertTo-Json -Depth 100
$EffectivePath = Join-Path -Path (Get-Location) -ChildPath "taskdef.effective.json"
$EffectiveJson | Set-Content -Path $EffectivePath -Encoding UTF8

Write-Host "==> Registering new task definition…"
$NewTdArn = aws ecs register-task-definition --cli-input-json file://$EffectivePath --region $Region --query 'taskDefinition.taskDefinitionArn' --output text
if (-not $NewTdArn) { throw "Ne mogu registrirati novu task definiciju." }
Write-Host "    New TD: $NewTdArn" -ForegroundColor Green

# 9) Update service to new task definition (or force rollout with latest)
Write-Host "==> Updating service $Service (force new deployment)…"
aws ecs update-service --cluster $Cluster --service $Service --task-definition $NewTdArn --force-new-deployment --region $Region | Out-Null

# 10) Show deployments
Write-Host "==> Current deployments:"
aws ecs describe-services --cluster $Cluster --services $Service --region $Region --query 'services[0].deployments'

Write-Host "`n✅ Done. Image: $ImageUri" -ForegroundColor Green
