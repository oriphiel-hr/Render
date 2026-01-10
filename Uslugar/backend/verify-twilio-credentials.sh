#!/bin/bash

REGION="eu-north-1"
SECRET_NAME="uslugar-twilio-config"

echo "========================================"
echo "  Provjera Twilio Credentials"
echo "========================================"
echo ""

# Provjeri da li secret postoji
echo "🔍 Provjera secret-a:"
SECRET_ARN=$(aws secretsmanager describe-secret --secret-id $SECRET_NAME --region $REGION --query 'ARN' --output text 2>/dev/null)

if [ -z "$SECRET_ARN" ]; then
  echo "  ❌ Secret '$SECRET_NAME' ne postoji!"
  exit 1
fi

echo "  ✅ Secret postoji: $SECRET_ARN"
echo ""

# Dohvati vrijednosti (bez prikazivanja osjetljivih podataka)
echo "📋 Provjera vrijednosti (maskirano):"
SECRET_VALUE=$(aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region $REGION --query 'SecretString' --output text 2>/dev/null)

if [ -z "$SECRET_VALUE" ]; then
  echo "  ❌ Ne mogu dohvatiti secret vrijednosti!"
  exit 1
fi

# Provjeri strukturu JSON-a
echo "$SECRET_VALUE" | python3 << 'PYEOF'
import json
import sys

try:
    data = json.load(sys.stdin)
    
    account_sid = data.get('TWILIO_ACCOUNT_SID', '')
    auth_token = data.get('TWILIO_AUTH_TOKEN', '')
    phone_number = data.get('TWILIO_PHONE_NUMBER', '')
    
    print("  TWILIO_ACCOUNT_SID:")
    if account_sid:
        print(f"    ✅ Postoji (duljina: {len(account_sid)}, počinje: {account_sid[:2]}...)")
    else:
        print("    ❌ Nedostaje!")
    
    print("  TWILIO_AUTH_TOKEN:")
    if auth_token:
        print(f"    ✅ Postoji (duljina: {len(auth_token)}, počinje: {auth_token[:2]}...)")
    else:
        print("    ❌ Nedostaje!")
    
    print("  TWILIO_PHONE_NUMBER:")
    if phone_number:
        print(f"    ✅ Postoji: {phone_number}")
    else:
        print("    ❌ Nedostaje!")
    
    # Provjeri format
    if account_sid and not account_sid.startswith('AC'):
        print("    ⚠️  Account SID obično počinje s 'AC'")
    
    if auth_token and len(auth_token) < 20:
        print("    ⚠️  Auth Token je obično dugačak (32+ znakova)")
    
except Exception as e:
    print(f"  ❌ Greška pri parsiranju JSON-a: {e}")
PYEOF

echo ""
echo "========================================"
echo ""
echo "💡 Error 20003 'Authenticate' znači:"
echo "   - Account SID ili Auth Token su neispravni"
echo "   - Credentials možda nisu pravilno postavljeni u Secrets Manager"
echo "   - Auth Token možda je istekao ili promijenjen"
echo ""
echo "🔧 Rješenje:"
echo "   1. Provjeri Twilio Console: https://console.twilio.com"
echo "   2. Provjeri Account SID i Auth Token"
echo "   3. Ažuriraj secret u AWS:"
echo "      aws secretsmanager put-secret-value --secret-id uslugar-twilio-config --secret-string '{\"TWILIO_ACCOUNT_SID\":\"AC...\",\"TWILIO_AUTH_TOKEN\":\"...\",\"TWILIO_PHONE_NUMBER\":\"+18027276987\"}' --region eu-north-1"
echo ""

