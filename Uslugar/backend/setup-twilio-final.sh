#!/bin/bash
set -e

REGION="eu-north-1"
CLUSTER_NAME="apps-cluster"
SERVICE_NAME="uslugar-service-2gk1f1mv"
SECRET_NAME="uslugar-twilio-config"

echo "========================================"
echo "  Setup Twilio Credentials in AWS"
echo "========================================"
echo ""

echo "Cluster: $CLUSTER_NAME"
echo "Service: $SERVICE_NAME"
echo ""

# Step 1: Provjeri/Ažuriraj Secret
echo "📝 Step 1: Checking/updating secret..."
# ⚠️ SECURITY: Koristi environment variables - NIKADA ne stavljaj credentials direktno u kod!
# Postavi environment variables prije pokretanja:
#   export TWILIO_ACCOUNT_SID="AC..."
#   export TWILIO_AUTH_TOKEN="your_auth_token"
#   export TWILIO_PHONE_NUMBER="+1..."
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

# Step 3: Dohvati Task Definition iz servisa
echo ""
echo "📥 Step 3: Getting task definition from service..."
TASK_DEF=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION --query 'services[0].taskDefinition' --output text)

if [ -z "$TASK_DEF" ] || [ "$TASK_DEF" = "None" ]; then
  echo "  ❌ Failed to get task definition from service"
  exit 1
fi

echo "  ✅ Task definition ARN: $TASK_DEF"

# Task definition ARN format: arn:aws:ecs:region:account:task-definition/family:revision
# Extract family from: task-definition/family:revision
TASK_FAMILY=$(echo $TASK_DEF | cut -d/ -f2 | cut -d: -f1)
echo "  ✅ Task family: $TASK_FAMILY"

# Use the FULL task definition ARN (with revision) that the service is using
# This ensures we get the exact same task definition, including all containers
aws ecs describe-task-definition --task-definition "$TASK_DEF" --region $REGION --query 'taskDefinition' > task.json

# Debug: Show how many containers we found
CONTAINER_COUNT=$(python3 -c "import json; f=open('task.json'); data=json.load(f); print(len(data.get('containerDefinitions', [])))")
echo "  ✅ Task definition retrieved ($CONTAINER_COUNT containers found)"

# Step 4: Dodaj Twilio Secrets
echo ""
echo "📝 Step 4: Adding Twilio secrets..."
python3 << 'PYEOF'
import json
import subprocess

with open('task.json', 'r') as f:
    task = json.load(f)

# Debug: Print all container names
container_names = [c.get('name') for c in task['containerDefinitions']]
print(f"  📋 Found containers: {container_names}")

# Find the backend container (name: "uslugar")
backend_container = None
for container in task['containerDefinitions']:
    if container.get('name') == 'uslugar':
        backend_container = container
        break

if not backend_container:
    print("  ❌ Backend container 'uslugar' not found!")
    print(f"  Available containers: {container_names}")
    exit(1)

print(f"  ✅ Found backend container: {backend_container.get('name')}")

existing = backend_container.get('secrets', [])

result = subprocess.run(['aws', 'secretsmanager', 'describe-secret', '--secret-id', 'uslugar-twilio-config', '--region', 'eu-north-1', '--query', 'ARN', '--output', 'text'], capture_output=True, text=True)
arn = result.stdout.strip()

has_twilio = any(s.get('name') == 'TWILIO_ACCOUNT_SID' for s in existing)

if not has_twilio:
    backend_container['secrets'] = existing + [
        {"name": "TWILIO_ACCOUNT_SID", "valueFrom": f"{arn}:TWILIO_ACCOUNT_SID::"},
        {"name": "TWILIO_AUTH_TOKEN", "valueFrom": f"{arn}:TWILIO_AUTH_TOKEN::"},
        {"name": "TWILIO_PHONE_NUMBER", "valueFrom": f"{arn}:TWILIO_PHONE_NUMBER::"}
    ]
    print("  ✅ Twilio secrets added to backend container")
else:
    print("  ℹ️  Twilio secrets already exist in backend container")

# Preserve ALL containers in the new task definition
new_task = {
    "family": task['family'],
    "networkMode": task.get('networkMode'),
    "requiresCompatibilities": task['requiresCompatibilities'],
    "cpu": task.get('cpu'),
    "memory": task.get('memory'),
    "executionRoleArn": task['executionRoleArn'],
    "containerDefinitions": task['containerDefinitions']  # Keep ALL containers
}

if task.get('taskRoleArn'):
    new_task["taskRoleArn"] = task['taskRoleArn']

# Preserve other optional fields
optional_fields = ['volumes', 'placementConstraints', 'placementStrategy', 'tags']
for field in optional_fields:
    if field in task:
        new_task[field] = task[field]

with open('new-task.json', 'w') as f:
    json.dump(new_task, f, indent=2)
print(f"  ✅ New task definition saved ({len(task['containerDefinitions'])} containers preserved)")
PYEOF

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

