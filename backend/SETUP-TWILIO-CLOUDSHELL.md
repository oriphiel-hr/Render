# 🚀 Setup Twilio Credentials - AWS CloudShell

## 📋 Korak 1: Kreiraj/Ažuriraj Twilio Secret

```bash
# ⚠️ SECURITY: Zamijeni placeholders s pravim Twilio credentials!
# Dohvati credentials iz: https://console.twilio.com → Account → Account Info
export TWILIO_ACCOUNT_SID="AC_YOUR_ACCOUNT_SID_HERE"
export TWILIO_AUTH_TOKEN="your_auth_token_here"
export TWILIO_PHONE_NUMBER="+1_YOUR_PHONE_NUMBER"

# Postavi Twilio credentials (koristi environment variables)
SECRET_JSON=$(cat <<EOF
{
  "TWILIO_ACCOUNT_SID": "$TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN": "$TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER": "$TWILIO_PHONE_NUMBER"
}
EOF
)

# Provjeri da li secret postoji
aws secretsmanager describe-secret --secret-id uslugar-twilio-config --region eu-north-1 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Secret postoji - ažuriranje..."
  aws secretsmanager put-secret-value \
    --secret-id uslugar-twilio-config \
    --secret-string "$SECRET_JSON" \
    --region eu-north-1
else
  echo "ℹ️  Secret ne postoji - kreiranje..."
  aws secretsmanager create-secret \
    --name uslugar-twilio-config \
    --secret-string "$SECRET_JSON" \
    --region eu-north-1
fi
```

---

## 📋 Korak 2: Dohvati Secret ARN

```bash
# Dohvati ARN
SECRET_ARN=$(aws secretsmanager describe-secret \
  --secret-id uslugar-twilio-config \
  --region eu-north-1 \
  --query 'ARN' \
  --output text)

echo "Secret ARN: $SECRET_ARN"
```

---

## 📋 Korak 3: Dohvati Trenutnu Task Definition

```bash
# Konfiguracija
REGION="eu-north-1"
CLUSTER_NAME="uslugar-cluster"
SERVICE_NAME="uslugar-backend-service"
TASK_FAMILY="uslugar"

# Dohvati trenutnu task definition
aws ecs describe-task-definition \
  --task-definition $TASK_FAMILY \
  --region $REGION \
  --query 'taskDefinition' > current-task.json

echo "✅ Task definition spremljena u current-task.json"
```

---

## 📋 Korak 4: Dodaj Twilio Secrets u Task Definition

```bash
# Dodaj Twilio secrets u JSON (koristi jq ili python)
python3 << 'EOF'
import json

# Učitaj task definition
with open('current-task.json', 'r') as f:
    task_def = json.load(f)

# Dohvati secret ARN
import subprocess
result = subprocess.run(
    ['aws', 'secretsmanager', 'describe-secret', 
     '--secret-id', 'uslugar-twilio-config', 
     '--region', 'eu-north-1', 
     '--query', 'ARN', '--output', 'text'],
    capture_output=True, text=True
)
secret_arn = result.stdout.strip()

# Dodaj Twilio secrets u container definition
container = task_def['containerDefinitions'][0]

# Provjeri da li secrets već postoje
existing_secrets = container.get('secrets', [])
twilio_secrets = [
    {
        "name": "TWILIO_ACCOUNT_SID",
        "valueFrom": f"{secret_arn}:TWILIO_ACCOUNT_SID::"
    },
    {
        "name": "TWILIO_AUTH_TOKEN",
        "valueFrom": f"{secret_arn}:TWILIO_AUTH_TOKEN::"
    },
    {
        "name": "TWILIO_PHONE_NUMBER",
        "valueFrom": f"{secret_arn}:TWILIO_PHONE_NUMBER::"
    }
]

# Provjeri da li već postoje
has_twilio = any(s.get('name') == 'TWILIO_ACCOUNT_SID' for s in existing_secrets)

if not has_twilio:
    # Dodaj Twilio secrets
    container['secrets'] = existing_secrets + twilio_secrets
    print("✅ Twilio secrets dodani")
else:
    print("ℹ️  Twilio secrets već postoje")
    # Ažuriraj postojeće
    for i, secret in enumerate(container['secrets']):
        if secret.get('name') == 'TWILIO_ACCOUNT_SID':
            container['secrets'][i] = twilio_secrets[0]
        elif secret.get('name') == 'TWILIO_AUTH_TOKEN':
            container['secrets'][i] = twilio_secrets[1]
        elif secret.get('name') == 'TWILIO_PHONE_NUMBER':
            container['secrets'][i] = twilio_secrets[2]

# Ukloni polja koja ne trebaju u novoj task definition
new_task_def = {
    "family": task_def['family'],
    "networkMode": task_def.get('networkMode'),
    "requiresCompatibilities": task_def['requiresCompatibilities'],
    "cpu": task_def.get('cpu'),
    "memory": task_def.get('memory'),
    "executionRoleArn": task_def['executionRoleArn'],
    "containerDefinitions": [container],
    "taskRoleArn": task_def.get('taskRoleArn')
}

# Spremi novu task definition
with open('new-task.json', 'w') as f:
    json.dump(new_task_def, f, indent=2)

print("✅ Nova task definition spremljena u new-task.json")
EOF
```

---

## 📋 Korak 5: Registriraj Novu Task Definition

```bash
# Registriraj novu task definition
REGISTER_RESULT=$(aws ecs register-task-definition \
  --cli-input-json file://new-task.json \
  --region $REGION)

NEW_REVISION=$(echo $REGISTER_RESULT | grep -o '"revision":[0-9]*' | grep -o '[0-9]*')

echo "✅ Nova task definition registrirana (revision: $NEW_REVISION)"
```

---

## 📋 Korak 6: Ažuriraj ECS Service

```bash
# Ažuriraj ECS service
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition "${TASK_FAMILY}:${NEW_REVISION}" \
  --force-new-deployment \
  --region $REGION

echo "✅ ECS service ažuriran - deployment u tijeku"
```

---

## 📋 Korak 7: Provjeri Status

```bash
# Provjeri status servisa
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount}'

# Provjeri logove (čekaj ~2-3 minute)
echo "Čekaj ~3 minute, zatim provjeri logove:"
echo "aws logs tail /ecs/uslugar-backend --since 5m --region $REGION | grep 'Twilio config'"
```

---

## 🎯 Sve u Jednom Scriptu

```bash
#!/bin/bash
set -e

REGION="eu-north-1"
CLUSTER_NAME="uslugar-cluster"
SERVICE_NAME="uslugar-backend-service"
TASK_FAMILY="uslugar"
SECRET_NAME="uslugar-twilio-config"

echo "========================================"
echo "  Setup Twilio Credentials in AWS"
echo "========================================"
echo ""

# Step 1: Kreiraj/Ažuriraj Secret
echo "📝 Step 1: Creating/updating secret..."
# ⚠️ SECURITY: Postavi environment variables PRIJE pokretanja!
if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ] || [ -z "$TWILIO_PHONE_NUMBER" ]; then
  echo "❌ Twilio credentials nisu postavljeni!"
  echo "💡 Postavi TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
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
  aws secretsmanager put-secret-value --secret-id $SECRET_NAME --secret-string "$SECRET_JSON" --region $REGION
  echo "✅ Secret updated"
else
  aws secretsmanager create-secret --name $SECRET_NAME --secret-string "$SECRET_JSON" --region $REGION
  echo "✅ Secret created"
fi

# Step 2: Dohvati Secret ARN
echo ""
echo "🔍 Step 2: Getting secret ARN..."
SECRET_ARN=$(aws secretsmanager describe-secret --secret-id $SECRET_NAME --region $REGION --query 'ARN' --output text)
echo "✅ Secret ARN: $SECRET_ARN"

# Step 3: Dohvati Task Definition
echo ""
echo "📥 Step 3: Getting current task definition..."
aws ecs describe-task-definition --task-definition $TASK_FAMILY --region $REGION --query 'taskDefinition' > current-task.json
echo "✅ Task definition retrieved"

# Step 4: Dodaj Twilio Secrets
echo ""
echo "📝 Step 4: Adding Twilio secrets..."
python3 << EOF
import json
import subprocess

with open('current-task.json', 'r') as f:
    task_def = json.load(f)

result = subprocess.run(['aws', 'secretsmanager', 'describe-secret', '--secret-id', '$SECRET_NAME', '--region', '$REGION', '--query', 'ARN', '--output', 'text'], capture_output=True, text=True)
secret_arn = result.stdout.strip()

container = task_def['containerDefinitions'][0]
existing_secrets = container.get('secrets', [])

# Provjeri da li već postoje
has_twilio = any(s.get('name') == 'TWILIO_ACCOUNT_SID' for s in existing_secrets)

if not has_twilio:
    twilio_secrets = [
        {"name": "TWILIO_ACCOUNT_SID", "valueFrom": f"{secret_arn}:TWILIO_ACCOUNT_SID::"},
        {"name": "TWILIO_AUTH_TOKEN", "valueFrom": f"{secret_arn}:TWILIO_AUTH_TOKEN::"},
        {"name": "TWILIO_PHONE_NUMBER", "valueFrom": f"{secret_arn}:TWILIO_PHONE_NUMBER::"}
    ]
    container['secrets'] = existing_secrets + twilio_secrets
    print("✅ Twilio secrets added")
else:
    print("ℹ️  Twilio secrets already exist")

new_task_def = {
    "family": task_def['family'],
    "networkMode": task_def.get('networkMode'),
    "requiresCompatibilities": task_def['requiresCompatibilities'],
    "cpu": task_def.get('cpu'),
    "memory": task_def.get('memory'),
    "executionRoleArn": task_def['executionRoleArn'],
    "containerDefinitions": [container],
    "taskRoleArn": task_def.get('taskRoleArn')
}

with open('new-task.json', 'w') as f:
    json.dump(new_task_def, f, indent=2)
EOF

# Step 5: Registriraj Novu Task Definition
echo ""
echo "📤 Step 5: Registering new task definition..."
REGISTER_OUTPUT=$(aws ecs register-task-definition --cli-input-json file://new-task.json --region $REGION)
NEW_REVISION=$(echo $REGISTER_OUTPUT | grep -oP '"revision":\s*\K[0-9]+')
echo "✅ New task definition registered (revision: $NEW_REVISION)"

# Step 6: Ažuriraj ECS Service
echo ""
echo "🔄 Step 6: Updating ECS service..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition "${TASK_FAMILY}:${NEW_REVISION}" \
  --force-new-deployment \
  --region $REGION > /dev/null
echo "✅ ECS Service update initiated"

# Cleanup
rm -f current-task.json new-task.json

echo ""
echo "========================================"
echo "  ✅ Setup Complete!"
echo "========================================"
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
```

---

## 📋 Quick Copy-Paste (Minimalno)

```bash
# 1. Kreiraj Secret
aws secretsmanager create-secret \
  --name uslugar-twilio-config \
  --secret-string "{\"TWILIO_ACCOUNT_SID\":\"$TWILIO_ACCOUNT_SID\",\"TWILIO_AUTH_TOKEN\":\"$TWILIO_AUTH_TOKEN\",\"TWILIO_PHONE_NUMBER\":\"$TWILIO_PHONE_NUMBER\"}" \
  --region eu-north-1

# 2. Dohvati ARN
SECRET_ARN=$(aws secretsmanager describe-secret --secret-id uslugar-twilio-config --region eu-north-1 --query 'ARN' --output text)

# 3. Dohvati Task Definition i dodaj secrets (koristi Python)
# (Koristi kompletan script iznad)
```

---

## ✅ Verifikacija

Nakon ~3-5 minuta, provjeri logove:

```bash
aws logs tail /ecs/uslugar-backend --since 5m --region eu-north-1 | grep "Twilio config"
```

Trebao bi vidjeti:
```
hasAccountSID: true,
hasAuthToken: true,
hasPhoneNumber: true
```

