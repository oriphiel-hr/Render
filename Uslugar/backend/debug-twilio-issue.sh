#!/bin/bash

REGION="eu-north-1"
SECRET_NAME="uslugar-twilio-config"

echo "========================================"
echo "  Debug Twilio Issue"
echo "========================================"
echo ""

# 1. Provjeri logove s Twilio informacijama
echo "📋 Zadnji Twilio Logovi (zadnjih 10 minuta):"
aws logs tail /ecs/uslugar-backend --region $REGION --since 10m --format short 2>/dev/null | grep -i -E "(twilio|SMS|sms-verification)" | tail -30

echo ""
echo "========================================"
echo ""

# 2. Provjeri da li secret postoji i ima pravilne vrijednosti
echo "🔍 Provjera Secret u AWS Secrets Manager:"
SECRET_EXISTS=$(aws secretsmanager describe-secret --secret-id $SECRET_NAME --region $REGION --query 'ARN' --output text 2>/dev/null)

if [ -z "$SECRET_EXISTS" ]; then
  echo "  ❌ Secret '$SECRET_NAME' ne postoji!"
else
  echo "  ✅ Secret postoji: $SECRET_EXISTS"
  
  # Provjeri vrijednosti (bez prikazivanja osjetljivih podataka)
  SECRET_KEYS=$(aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region $REGION --query 'SecretString' --output text 2>/dev/null | python3 -c "import json, sys; data=json.load(sys.stdin); print('Keys:', list(data.keys()))")
  
  echo "  $SECRET_KEYS"
  
  # Provjeri da li postoje sve 3 vrijednosti
  HAS_SID=$(aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region $REGION --query 'SecretString' --output text 2>/dev/null | python3 -c "import json, sys; data=json.load(sys.stdin); print('HAS' if data.get('TWILIO_ACCOUNT_SID') else 'MISSING')")
  HAS_TOKEN=$(aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region $REGION --query 'SecretString' --output text 2>/dev/null | python3 -c "import json, sys; data=json.load(sys.stdin); print('HAS' if data.get('TWILIO_AUTH_TOKEN') else 'MISSING')")
  HAS_PHONE=$(aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region $REGION --query 'SecretString' --output text 2>/dev/null | python3 -c "import json, sys; data=json.load(sys.stdin); print('HAS' if data.get('TWILIO_PHONE_NUMBER') else 'MISSING')")
  
  echo "  TWILIO_ACCOUNT_SID: $HAS_SID"
  echo "  TWILIO_AUTH_TOKEN: $HAS_TOKEN"
  echo "  TWILIO_PHONE_NUMBER: $HAS_PHONE"
fi

echo ""
echo "========================================"
echo ""

# 3. Provjeri IAM permissions
echo "🔐 Provjera IAM Permissions:"
ROLE_NAME="ecsTaskExecutionRole"

POLICY=$(aws iam get-role-policy --role-name $ROLE_NAME --policy-name "TwilioSecretAccess" --output json 2>/dev/null)

if [ -z "$POLICY" ]; then
  echo "  ❌ Policy 'TwilioSecretAccess' ne postoji!"
else
  echo "  ✅ Policy 'TwilioSecretAccess' postoji"
  
  # Provjeri da li policy omogućava GetSecretValue
  ALLOWS_GET=$(echo "$POLICY" | python3 -c "import json, sys; p=json.load(sys.stdin); statements=p.get('PolicyDocument', {}).get('Statement', []); print('YES' if any(s.get('Action', []).__contains__('secretsmanager:GetSecretValue') if isinstance(s.get('Action'), list) else s.get('Action') == 'secretsmanager:GetSecretValue' for s in statements) else 'NO')")
  
  echo "  Allows GetSecretValue: $ALLOWS_GET"
fi

echo ""
echo "========================================"
echo ""

# 4. Provjeri da li su secrets u task definition
echo "📋 Provjera Secrets u Task Definition 330:"
TASK_DEF_SECRETS=$(aws ecs describe-task-definition --task-definition uslugar:330 --region $REGION --query 'taskDefinition.containerDefinitions[?name==`uslugar`].secrets[?contains(name, `TWILIO`)]' --output json)

TWILIO_COUNT=$(echo "$TASK_DEF_SECRETS" | python3 -c "import json, sys; data=json.load(sys.stdin); print(len(data[0]) if data and len(data) > 0 else 0)")

if [ "$TWILIO_COUNT" -eq "3" ]; then
  echo "  ✅ Task definition 330 ima 3 Twilio secrets"
  echo "$TASK_DEF_SECRETS" | python3 -m json.tool
else
  echo "  ⚠️  Task definition 330 ima samo $TWILIO_COUNT Twilio secrets (očekivano: 3)"
fi

echo ""
echo "========================================"
echo ""
echo "💡 Ako sve izgleda OK, provjeri zadnje logove nakon SMS zahtjeva:"
echo "   aws logs tail /ecs/uslugar-backend --region eu-north-1 --since 2m | tail -100"
echo ""

