# 🔄 Ažuriraj Twilio Auth Token (Nakon Rotacije)

## Problem
Twilio je rotirao Auth Token jer je bio eksponiran u Git history-u.

## ✅ Rješenje

### 1. Dohvati Novi Auth Token

1. Idi na: https://console.twilio.com
2. Klikni na **Account** > **Account Info**
3. Klikni **Show** za Auth Token
4. Kopiraj novi Auth Token

### 2. Ažuriraj AWS Secrets Manager

**Opcija A: AWS Console**
1. Idi na AWS Console → Secrets Manager
2. Pronađi: `uslugar-twilio-config`
3. Klikni **Retrieve secret value** > **Edit**
4. Ažuriraj `TWILIO_AUTH_TOKEN` s novim tokenom
5. Save

**Opcija B: AWS CLI (CloudShell)**

```bash
# ⚠️ ZAMIJENI s novim Auth Token-om iz Twilio Console!
export TWILIO_ACCOUNT_SID="AC_YOUR_ACCOUNT_SID_HERE"
export TWILIO_AUTH_TOKEN="NOVI_AUTH_TOKEN_OVDJE"
export TWILIO_PHONE_NUMBER="+18027276987"

# Ažuriraj secret
SECRET_JSON=$(cat <<EOF
{
  "TWILIO_ACCOUNT_SID": "$TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN": "$TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER": "$TWILIO_PHONE_NUMBER"
}
EOF
)

aws secretsmanager put-secret-value \
  --secret-id uslugar-twilio-config \
  --secret-string "$SECRET_JSON" \
  --region eu-north-1

# Provjeri
echo "Provjera ažuriranog secret-a:"
aws secretsmanager get-secret-value \
  --secret-id uslugar-twilio-config \
  --region eu-north-1 \
  --query 'SecretString' \
  --output text | python3 -c "import json, sys; data=json.load(sys.stdin); print('✅ Secret ažuriran'); print('Account SID:', data.get('TWILIO_ACCOUNT_SID', 'NEDOSTAJE')[:10] + '...'); print('Auth Token:', 'OK' if data.get('TWILIO_AUTH_TOKEN') else 'NEDOSTAJE')"
```

### 3. Restart ECS Service

```bash
# Forsiraj novi deployment da učita novi Auth Token
aws ecs update-service \
  --cluster apps-cluster \
  --service uslugar-service-2gk1f1mv \
  --force-new-deployment \
  --region eu-north-1

echo "⏳ Pričekajte 2-3 minute za deployment..."
```

### 4. Provjeri da Twilio Radi

```bash
# Nakon 2-3 minute, provjeri logove
aws logs tail /ecs/uslugar-backend \
  --region eu-north-1 \
  --since 2m \
  | grep -i "twilio config"
```

**Očekivani rezultat:**
```
hasAccountSID: true,
hasAuthToken: true,
hasPhoneNumber: true
```

### 5. Testiraj SMS

1. Otvori: https://uslugar.oriph.io/#user
2. Pokušaj poslati SMS verifikacijski kod
3. Provjeri logove za eventualne greške

---

## ⚠️ Važno

- **NIKADA** ne commitaj credentials u Git
- Koristi **environment variables** ili **AWS Secrets Manager**
- Ako Twilio rotira credentials → ažuriraj AWS Secrets Manager
- Novi Auth Token **neće** automatski biti učitán dok ne restart-aš ECS service

