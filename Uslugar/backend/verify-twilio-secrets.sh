#!/bin/bash

REGION="eu-north-1"
CLUSTER_NAME="apps-cluster"
SERVICE_NAME="uslugar-service-2gk1f1mv"
TASK_FAMILY="uslugar"

echo "========================================"
echo "  Provjera Twilio Secrets Konfiguracije"
echo "========================================"
echo ""

# 1. Provjeri koja task definition je aktivna u servisu
echo "📊 Aktivna task definition u servisu:"
CURRENT_TASK_DEF=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].taskDefinition' \
  --output text)

echo "  $CURRENT_TASK_DEF"
echo ""

# 2. Provjeri Twilio secrets u task definition
echo "🔍 Provjera Twilio secrets u task definition:"
TASK_DEF_JSON=$(aws ecs describe-task-definition \
  --task-definition "$CURRENT_TASK_DEF" \
  --region $REGION \
  --query 'taskDefinition' \
  --output json)

# Pronađi uslugar container i provjeri secrets
python3 << 'PYEOF'
import json
import sys

task_def = json.loads('''$TASK_DEF_JSON''')

backend_container = None
for container in task_def['containerDefinitions']:
    if container.get('name') == 'uslugar':
        backend_container = container
        break

if not backend_container:
    print("  ❌ Container 'uslugar' nije pronađen!")
    sys.exit(1)

secrets = backend_container.get('secrets', [])
print(f"  📋 Ukupno secrets u containeru: {len(secrets)}")

twilio_secrets = [s for s in secrets if 'TWILIO' in s.get('name', '')]
print(f"  📱 Twilio secrets: {len(twilio_secrets)}")

for secret in twilio_secrets:
    name = secret.get('name', '')
    value_from = secret.get('valueFrom', '')
    print(f"    - {name}: {value_from[:80]}...")

if len(twilio_secrets) == 0:
    print("  ❌ Nema Twilio secrets u task definition!")
    print("  💡 Trebalo bi biti 3: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER")
elif len(twilio_secrets) < 3:
    print(f"  ⚠️  Nedostaju Twilio secrets! (Pronađeno: {len(twilio_secrets)}, Očekivano: 3)")
else:
    print("  ✅ Svi Twilio secrets su konfigurirani")
PYEOF

echo ""

# 3. Provjeri execution role permissions
echo "🔐 Provjera execution role:"
EXECUTION_ROLE=$(echo "$TASK_DEF_JSON" | python3 -c "import json, sys; print(json.load(sys.stdin)['executionRoleArn'])")
echo "  Execution Role: $EXECUTION_ROLE"

echo ""
echo "========================================"
echo "  💡 Ako secrets nisu vidljivi:"
echo "  1. Pričekajte još 2-3 minute (deployment može potrajati)"
echo "  2. Provjerite da li je nova task definition (330) aktivna"
echo "  3. Provjerite execution role permissions za Secrets Manager"
echo "========================================"

