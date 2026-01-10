#!/bin/bash
set -e

REGION="eu-north-1"
TASK_FAMILY="uslugar"
SECRET_NAME="uslugar-twilio-config"

echo "========================================"
echo "  Setup Twilio Credentials in AWS"
echo "========================================"
echo ""

# Auto-detect cluster and service
echo "🔍 Auto-detecting ECS cluster and service..."
CLUSTERS=$(aws ecs list-clusters --region $REGION --query 'clusterArns[]' --output text)

if [ -z "$CLUSTERS" ]; then
  echo "❌ No clusters found in region $REGION"
  exit 1
fi

CLUSTER_NAME=""
SERVICE_NAME=""
TASK_FAMILY_FOUND=""

# Pronađi klaster i servis - probaj prvo "uslugar", zatim "backend"/"api"
for cluster_arn in $CLUSTERS; do
  cluster=$(basename $cluster_arn)
  echo "  Checking cluster: $cluster"
  
  SERVICES=$(aws ecs list-services --cluster $cluster --region $REGION --query 'serviceArns[]' --output text 2>/dev/null)
  
  if [ -z "$SERVICES" ]; then
    continue
  fi
  
  for service_arn in $SERVICES; do
    service=$(basename $service_arn)
    
    # Provjeri task definition servisa
    TASK_DEF=$(aws ecs describe-services \
      --cluster $cluster \
      --services $service \
      --region $REGION \
      --query 'services[0].taskDefinition' \
      --output text 2>/dev/null)
    
    if [ ! -z "$TASK_DEF" ] && [ "$TASK_DEF" != "None" ]; then
      TASK_FAMILY_CHECK=$(echo $TASK_DEF | cut -d: -f1)
      
      # Provjeri da li odgovara target task family
      if [ "$TASK_FAMILY_CHECK" = "$TASK_FAMILY" ]; then
        CLUSTER_NAME=$cluster
        SERVICE_NAME=$service
        TASK_FAMILY_FOUND=$TASK_FAMILY_CHECK
        echo "  ✅ Found matching service!"
        break 2
      fi
      
      # Ako tražimo "uslugar" i ne pronađemo, probaj alternativne nazive
      if [ "$TASK_FAMILY" = "uslugar" ]; then
        # Provjeri da li task family sadrži "uslugar", "backend" ili "api" (case insensitive)
        TASK_LOWER=$(echo $TASK_FAMILY_CHECK | tr '[:upper:]' '[:lower:]')
        SERVICE_LOWER=$(echo $service | tr '[:upper:]' '[:lower:]')
        
        # Preskoči migration, test, dev servise
        if echo "$SERVICE_LOWER" | grep -q "migration\|test\|dev"; then
          continue
        fi
        
        if echo "$TASK_LOWER" | grep -q "uslugar\|backend\|api" || \
           echo "$SERVICE_LOWER" | grep -q "uslugar\|backend\|api"; then
          CLUSTER_NAME=$cluster
          SERVICE_NAME=$service
          TASK_FAMILY_FOUND=$TASK_FAMILY_CHECK
          echo "  ✅ Found likely backend service!"
          break 2
        fi
      fi
      
      # Ako nismo pronašli ništa specifično, uzmi prvi pronađeni (fallback)
      if [ -z "$CLUSTER_NAME" ]; then
        CLUSTER_NAME=$cluster
        SERVICE_NAME=$service
        TASK_FAMILY_FOUND=$TASK_FAMILY_CHECK
      fi
    fi
  done
done

# Ako je pronađen task family, ažuriraj TASK_FAMILY varijablu
if [ ! -z "$TASK_FAMILY_FOUND" ]; then
  TASK_FAMILY=$TASK_FAMILY_FOUND
fi

if [ -z "$CLUSTER_NAME" ] || [ -z "$SERVICE_NAME" ]; then
  echo "❌ Could not find cluster/service using task family '$TASK_FAMILY'"
  echo ""
  echo "Available clusters and services:"
  for cluster_arn in $CLUSTERS; do
    cluster=$(basename $cluster_arn)
    echo ""
    echo "  📋 Cluster: $cluster"
    SERVICES=$(aws ecs list-services --cluster $cluster --region $REGION --query 'serviceArns[]' --output text 2>/dev/null)
    if [ ! -z "$SERVICES" ]; then
      for service_arn in $SERVICES; do
        service=$(basename $service_arn)
        TASK_DEF=$(aws ecs describe-services \
          --cluster $cluster \
          --services $service \
          --region $REGION \
          --query 'services[0].taskDefinition' \
          --output text 2>/dev/null)
        if [ ! -z "$TASK_DEF" ] && [ "$TASK_DEF" != "None" ]; then
          TASK_FAMILY_FOUND=$(echo $TASK_DEF | cut -d: -f1)
          echo "    - Service: $service → Task: $TASK_FAMILY_FOUND"
        fi
      done
    else
      echo "    (no services)"
    fi
  done
  echo ""
  echo "💡 Tip: Možda je task family drugačiji. Provjeri iznad i ručno pokreni:"
  echo "   CLUSTER_NAME=\"<cluster>\" SERVICE_NAME=\"<service>\" ./setup-twilio.sh"
  exit 1
fi

echo "  ✅ Cluster: $CLUSTER_NAME"
echo "  ✅ Service: $SERVICE_NAME"
echo ""

# Step 1: Provjeri/Ažuriraj Secret
echo "📝 Step 1: Checking/updating secret..."
# ⚠️ SECURITY: Koristi environment variables - NIKADA ne stavljaj credentials direktno u kod!
if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ] || [ -z "$TWILIO_PHONE_NUMBER" ]; then
  echo "  ❌ Twilio credentials nisu postavljeni kao environment variables!"
  echo "  💡 Postavi TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER prije pokretanja"
  exit 1
fi
SECRET_JSON=$(cat <<EOF
{
  "TWILIO_ACCOUNT_SID": "$TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN": "$TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER": "$TWILIO_PHONE_NUMBER"
}
EOF
)

if aws secretsmanager describe-secret --secret-id $SECRET_NAME --region $REGION &>/dev/null; then
  echo "  Secret postoji - ažuriranje..."
  aws secretsmanager put-secret-value --secret-id $SECRET_NAME --secret-string "$SECRET_JSON" --region $REGION > /dev/null
  echo "  ✅ Secret updated"
else
  echo "  Secret ne postoji - kreiranje..."
  aws secretsmanager create-secret --name $SECRET_NAME --secret-string "$SECRET_JSON" --region $REGION > /dev/null
  echo "  ✅ Secret created"
fi

# Step 2: Dohvati Secret ARN
echo ""
echo "🔍 Step 2: Getting secret ARN..."
SECRET_ARN=$(aws secretsmanager describe-secret --secret-id $SECRET_NAME --region $REGION --query 'ARN' --output text)
echo "  ✅ Secret ARN: $SECRET_ARN"

# Step 3: Dohvati Task Definition
echo ""
echo "📥 Step 3: Getting current task definition..."
aws ecs describe-task-definition --task-definition $TASK_FAMILY --region $REGION --query 'taskDefinition' > task.json
echo "  ✅ Task definition retrieved"

# Step 4: Dodaj Twilio Secrets
echo ""
echo "📝 Step 4: Adding Twilio secrets..."
python3 << 'EOF'
import json
import subprocess

with open('task.json', 'r') as f:
    task = json.load(f)

container = task['containerDefinitions'][0]
existing = container.get('secrets', [])

# Dohvati ARN
result = subprocess.run(['aws', 'secretsmanager', 'describe-secret', '--secret-id', 'uslugar-twilio-config', '--region', 'eu-north-1', '--query', 'ARN', '--output', 'text'], capture_output=True, text=True)
arn = result.stdout.strip()

# Provjeri da li već postoje
has_twilio = any(s.get('name') == 'TWILIO_ACCOUNT_SID' for s in existing)

if not has_twilio:
    container['secrets'] = existing + [
        {"name": "TWILIO_ACCOUNT_SID", "valueFrom": f"{arn}:TWILIO_ACCOUNT_SID::"},
        {"name": "TWILIO_AUTH_TOKEN", "valueFrom": f"{arn}:TWILIO_AUTH_TOKEN::"},
        {"name": "TWILIO_PHONE_NUMBER", "valueFrom": f"{arn}:TWILIO_PHONE_NUMBER::"}
    ]
    print("  ✅ Twilio secrets added")
else:
    print("  ℹ️  Twilio secrets already exist")

new_task = {
    "family": task['family'],
    "networkMode": task.get('networkMode'),
    "requiresCompatibilities": task['requiresCompatibilities'],
    "cpu": task.get('cpu'),
    "memory": task.get('memory'),
    "executionRoleArn": task['executionRoleArn'],
    "containerDefinitions": [container]
}

# Dodaj taskRoleArn samo ako postoji i nije None
if task.get('taskRoleArn'):
    new_task["taskRoleArn"] = task['taskRoleArn']

with open('new-task.json', 'w') as f:
    json.dump(new_task, f, indent=2)
print("  ✅ New task definition saved")
EOF

# Step 5: Registriraj Novu Task Definition
echo ""
echo "📤 Step 5: Registering new task definition..."
OUTPUT=$(aws ecs register-task-definition --cli-input-json file://new-task.json --region $REGION)
REVISION=$(echo $OUTPUT | grep -oP '"revision":\s*\K[0-9]+')

if [ -z "$REVISION" ]; then
  echo "  ❌ Failed to register task definition"
  echo "$OUTPUT"
  exit 1
fi

echo "  ✅ New task definition registered (revision: $REVISION)"

# Step 6: Ažuriraj ECS Service
echo ""
echo "🔄 Step 6: Updating ECS service..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition "${TASK_FAMILY}:${REVISION}" \
  --force-new-deployment \
  --region $REGION > /dev/null

echo "  ✅ ECS Service update initiated"

# Cleanup
rm -f task.json new-task.json

echo ""
echo "========================================"
echo "  ✅ Setup Complete!"
echo "========================================"
echo ""
echo "Cluster: $CLUSTER_NAME"
echo "Service: $SERVICE_NAME"
echo "Task Definition: ${TASK_FAMILY}:${REVISION}"
echo ""
echo "📊 Monitor deployment:"
echo "   aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION"
echo ""
echo "📋 View logs (wait ~3 minutes):"
echo "   aws logs tail /ecs/uslugar-backend --follow --region $REGION | grep 'Twilio config'"
echo ""
echo "🔍 Verify Twilio config in logs:"
echo "   Look for: hasAccountSID: true, hasAuthToken: true, hasPhoneNumber: true"
echo ""

