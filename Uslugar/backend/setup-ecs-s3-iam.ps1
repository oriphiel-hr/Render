# Setup ECS S3 IAM Role and Permissions
# Provjerava i postavlja IAM role za S3 pristup iz ECS task-a

Write-Host "`n=== ECS S3 IAM Setup ===" -ForegroundColor Cyan

$ROLE_NAME = "ecsTaskRole"
$ACCOUNT_ID = "666203386231"
$BUCKET_NAME = "uslugar-invoices"
$REGION = "eu-north-1"

# 1. Provjeri da li role postoji
Write-Host "`n1. Checking IAM role..." -ForegroundColor Yellow
try {
    $role = aws iam get-role --role-name $ROLE_NAME --output json 2>&1 | ConvertFrom-Json
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Role exists: $($role.Role.Arn)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Role does not exist: $ROLE_NAME" -ForegroundColor Red
        Write-Host "   Creating role..." -ForegroundColor Yellow
        
        # Create trust policy for ECS
        $trustPolicy = @{
            Version = "2012-10-17"
            Statement = @(
                @{
                    Effect = "Allow"
                    Principal = @{
                        Service = "ecs-tasks.amazonaws.com"
                    }
                    Action = "sts:AssumeRole"
                }
            )
        } | ConvertTo-Json -Depth 10
        
        $trustPolicy | Out-File -FilePath "trust-policy.json" -Encoding utf8
        
        # Create role
        $createRole = aws iam create-role `
            --role-name $ROLE_NAME `
            --assume-role-policy-document file://trust-policy.json `
            --description "ECS Task Role for S3 access" `
            --output json 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Role created successfully" -ForegroundColor Green
            Remove-Item "trust-policy.json" -ErrorAction SilentlyContinue
        } else {
            Write-Host "   ❌ Failed to create role: $createRole" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "   ❌ Error checking role: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Provjeri inline policies
Write-Host "`n2. Checking inline policies..." -ForegroundColor Yellow
$policies = aws iam list-role-policies --role-name $ROLE_NAME --output json | ConvertFrom-Json
$hasS3Policy = $false

if ($policies.PolicyNames -contains "S3InvoicesAccess") {
    Write-Host "   ✅ S3InvoicesAccess policy exists" -ForegroundColor Green
    $hasS3Policy = $true
} else {
    Write-Host "   ⚠️  S3InvoicesAccess policy not found" -ForegroundColor Yellow
    Write-Host "   Creating S3 policy..." -ForegroundColor Yellow
    
    # Create S3 policy
    $s3Policy = @{
        Version = "2012-10-17"
        Statement = @(
            @{
                Sid = "S3InvoicesAccess"
                Effect = "Allow"
                Action = @(
                    "s3:PutObject",
                    "s3:GetObject",
                    "s3:DeleteObject",
                    "s3:ListBucket"
                )
                Resource = @(
                    "arn:aws:s3:::$BUCKET_NAME",
                    "arn:aws:s3:::$BUCKET_NAME/*"
                )
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $s3Policy | Out-File -FilePath "s3-policy.json" -Encoding utf8
    
    # Attach policy
    $attachPolicy = aws iam put-role-policy `
        --role-name $ROLE_NAME `
        --policy-name "S3InvoicesAccess" `
        --policy-document file://s3-policy.json `
        --output json 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ S3 policy attached successfully" -ForegroundColor Green
        $hasS3Policy = $true
        Remove-Item "s3-policy.json" -ErrorAction SilentlyContinue
    } else {
        Write-Host "   ❌ Failed to attach policy: $attachPolicy" -ForegroundColor Red
        exit 1
    }
}

# 3. Provjeri da li bucket postoji
Write-Host "`n3. Checking S3 bucket..." -ForegroundColor Yellow
$bucketCheck = aws s3 ls "s3://$BUCKET_NAME/" --region $REGION 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Bucket exists: $BUCKET_NAME" -ForegroundColor Green
    if ($bucketCheck) {
        Write-Host "   Files in bucket:" -ForegroundColor Gray
        $bucketCheck | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
    } else {
        Write-Host "   Bucket is empty" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️  Bucket not found or not accessible: $BUCKET_NAME" -ForegroundColor Yellow
    Write-Host "   Error: $bucketCheck" -ForegroundColor Gray
    Write-Host "   You may need to create the bucket manually:" -ForegroundColor Yellow
    Write-Host "   aws s3 mb s3://$BUCKET_NAME --region $REGION" -ForegroundColor Gray
}

# 4. Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Role ARN: arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}" -ForegroundColor Green
if ($hasS3Policy) {
    Write-Host "✅ S3 permissions: Configured" -ForegroundColor Green
} else {
    Write-Host "❌ S3 permissions: Missing" -ForegroundColor Red
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Ensure task definition has taskRoleArn set to: arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}" -ForegroundColor Gray
Write-Host "2. Ensure environment variables are set:" -ForegroundColor Gray
Write-Host "   - AWS_S3_BUCKET_NAME=$BUCKET_NAME" -ForegroundColor Gray
Write-Host "   - AWS_REGION=$REGION" -ForegroundColor Gray
Write-Host "3. Update ECS service with new task definition" -ForegroundColor Gray

