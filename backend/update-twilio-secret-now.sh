#!/bin/bash
# Ažuriraj Twilio Secret u AWS Secrets Manager s novim Auth Token-om

REGION="eu-north-1"
SECRET_NAME="uslugar-twilio-config"

# ⚠️ OVI CREDENTIALS SU REDACTED - DODAJ STVARNE VRIJEDNOSTI!
# Novi Auth Token iz Twilio Console
NEW_AUTH_TOKEN="***REDACTED***"
ACCOUNT_SID="AC..."
PHONE_NUMBER="+1..."

echo "========================================"
echo "  Ažuriranje Twilio Secret u AWS"
echo "========================================"
echo ""

# Provjeri da li secret postoji
if ! aws secretsmanager describe-secret --secret-id $SECRET_NAME --region $REGION &>/dev/null; then
  echo "❌ Secret '$SECRET_NAME' ne postoji!"
  echo "💡 Kreiraj secret prvo:"
  echo "   aws secretsmanager create-secret --name $SECRET_NAME --region $REGION"
  exit 1
fi

echo "✅ Secret postoji"
echo ""

# Ažuriraj secret
echo "📝 Ažuriranje secret-a..."
SECRET_JSON=$(cat <<EOF
{
  "TWILIO_ACCOUNT_SID": "$ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN": "$NEW_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER": "$PHONE_NUMBER"
}
EOF
)

aws secretsmanager put-secret-value \
  --secret-id $SECRET_NAME \
  --secret-string "$SECRET_JSON" \
  --region $REGION > /dev/null

if [ $? -eq 0 ]; then
  echo "✅ Secret uspješno ažuriran!"
  echo ""
  echo "🔍 Provjera ažuriranog secret-a:"
  aws secretsmanager get-secret-value \
    --secret-id $SECRET_NAME \
    --region $REGION \
    --query 'SecretString' \
    --output text | python3 -c "import json, sys; data=json.load(sys.stdin); print('   Account SID:', data.get('TWILIO_ACCOUNT_SID', 'NEDOSTAJE')); print('   Auth Token:', '✅ Postoji (' + str(len(data.get('TWILIO_AUTH_TOKEN', ''))) + ' znakova)' if data.get('TWILIO_AUTH_TOKEN') else '❌ Nedostaje'); print('   Phone Number:', data.get('TWILIO_PHONE_NUMBER', 'NEDOSTAJE'))"
  echo ""
  echo "🔄 Sljedeći korak: Restart ECS service da učita novi token"
  echo "   aws ecs update-service --cluster apps-cluster --service uslugar-service-2gk1f1mv --force-new-deployment --region eu-north-1"
else
  echo "❌ Greška pri ažuriranju secret-a!"
  exit 1
fi

