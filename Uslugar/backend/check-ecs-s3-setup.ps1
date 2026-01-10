# Check ECS S3 Setup
# Provjerava da li su S3 environment varijable i IAM dozvole postavljene

Write-Host "`n=== ECS S3 Setup Check ===" -ForegroundColor Cyan

$CLUSTER = "apps-cluster"
$SERVICE = "uslugar-service-2gk1f1mv"

# 1. Get current task definition
Write-Host "`n1. Getting current task definition..." -ForegroundColor Yellow
try {
    $taskDefArn = aws ecs describe-services --cluster $CLUSTER --services $SERVICE --query "services[0].taskDefinition" --output text 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Failed to get task definition: $taskDefArn" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Task Definition: $taskDefArn" -ForegroundColor Green
    
    # Get task definition details
    $taskDef = aws ecs describe-task-definition --task-definition $taskDefArn --output json | ConvertFrom-Json
    $container = $taskDef.taskDefinition.containerDefinitions | Where-Object { $_.name -eq "uslugar" }
    
    if (-not $container) {
        Write-Host "   ❌ Container 'uslugar' not found" -ForegroundColor Red
        exit 1
    }
    
    # Check environment variables
    Write-Host "`n2. Checking environment variables..." -ForegroundColor Yellow
    $envVars = $container.environment
    if (-not $envVars) {
        $envVars = @()
    }
    
    $hasS3Bucket = $envVars | Where-Object { $_.name -eq "AWS_S3_BUCKET_NAME" }
    $hasAwsRegion = $envVars | Where-Object { $_.name -eq "AWS_REGION" }
    
    if ($hasS3Bucket) {
        Write-Host "   ✅ AWS_S3_BUCKET_NAME: $($hasS3Bucket.value)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ AWS_S3_BUCKET_NAME: MISSING" -ForegroundColor Red
    }
    
    if ($hasAwsRegion) {
        Write-Host "   ✅ AWS_REGION: $($hasAwsRegion.value)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ AWS_REGION: MISSING" -ForegroundColor Red
    }
    
    # Check task role
    Write-Host "`n3. Checking IAM task role..." -ForegroundColor Yellow
    $taskRoleArn = $taskDef.taskDefinition.taskRoleArn
    if ($taskRoleArn) {
        Write-Host "   ✅ Task Role ARN: $taskRoleArn" -ForegroundColor Green
        
        # Get role name
        $roleName = $taskRoleArn -replace '.*role/', ''
        Write-Host "   Role Name: $roleName" -ForegroundColor Gray
        
        # Check if role has S3 permissions
        Write-Host "`n4. Checking IAM role policies..." -ForegroundColor Yellow
        $policies = aws iam list-attached-role-policies --role-name $roleName --output json | ConvertFrom-Json
        $inlinePolicies = aws iam list-role-policies --role-name $roleName --output json | ConvertFrom-Json
        
        Write-Host "   Attached Policies: $($policies.AttachedPolicies.Count)" -ForegroundColor Gray
        foreach ($policy in $policies.AttachedPolicies) {
            Write-Host "     - $($policy.PolicyName)" -ForegroundColor Gray
        }
        
        Write-Host "   Inline Policies: $($inlinePolicies.PolicyNames.Count)" -ForegroundColor Gray
        foreach ($policyName in $inlinePolicies.PolicyNames) {
            Write-Host "     - $policyName" -ForegroundColor Gray
            $policyDoc = aws iam get-role-policy --role-name $roleName --policy-name $policyName --output json | ConvertFrom-Json
            $policyJson = $policyDoc.PolicyDocument | ConvertTo-Json -Depth 10
            if ($policyJson -match "s3" -or $policyJson -match "S3") {
                Write-Host "       ✅ Contains S3 permissions" -ForegroundColor Green
            }
        }
        
        # Check for S3 bucket access
        Write-Host "`n5. Testing S3 bucket access..." -ForegroundColor Yellow
        $bucketName = if ($hasS3Bucket) { $hasS3Bucket.value } else { "uslugar-invoices" }
        $s3Test = aws s3 ls "s3://$bucketName/" --region eu-north-1 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ S3 bucket accessible: $bucketName" -ForegroundColor Green
            if ($s3Test) {
                Write-Host "   Files in bucket:" -ForegroundColor Gray
                $s3Test | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
            } else {
                Write-Host "   Bucket is empty" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ⚠️  Could not access S3 bucket (may need AWS credentials or IAM permissions)" -ForegroundColor Yellow
            Write-Host "   Error: $s3Test" -ForegroundColor Gray
        }
        
    } else {
        Write-Host "   ❌ Task Role ARN: MISSING" -ForegroundColor Red
        Write-Host "   ⚠️  Task role is required for S3 access" -ForegroundColor Yellow
    }
    
    Write-Host "`n=== Summary ===" -ForegroundColor Cyan
    if ($hasS3Bucket -and $hasAwsRegion -and $taskRoleArn) {
        Write-Host "✅ S3 setup looks good!" -ForegroundColor Green
        Write-Host "   - Environment variables: OK" -ForegroundColor Green
        Write-Host "   - Task role: OK" -ForegroundColor Green
    } else {
        Write-Host "⚠️  S3 setup incomplete:" -ForegroundColor Yellow
        if (-not $hasS3Bucket) { Write-Host "   - Missing AWS_S3_BUCKET_NAME" -ForegroundColor Red }
        if (-not $hasAwsRegion) { Write-Host "   - Missing AWS_REGION" -ForegroundColor Red }
        if (-not $taskRoleArn) { Write-Host "   - Missing taskRoleArn" -ForegroundColor Red }
    }
    
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

