# Fix Twilio Authentication Error (20003)

## Problem
Twilio vraća error 20003 "Authenticate" što znači da su credentials neispravni.

## Rješenje

### 1. Provjeri Twilio Credentials u Twilio Console

1. Idi na: https://console.twilio.com
2. Klikni na "Account" > "Account Info"
3. Provjeri:
   - **Account SID**: Trebao bi počinjati s `AC...`
   - **Auth Token**: Klikni "Show" da vidiš token

### 2. Ažuriraj Secret u AWS Secrets Manager

**Opcija A: Kroz AWS Console**
1. Idi na AWS Secrets Manager
2. Pronađi secret: `uslugar-twilio-config`
3. Klikni "Retrieve secret value" > "Edit"
4. Ažuriraj JSON:
```json
{
  "TWILIO_ACCOUNT_SID": "AC_YOUR_ACCOUNT_SID_HERE",
  "TWILIO_AUTH_TOKEN": "your_auth_token_here",
  "TWILIO_PHONE_NUMBER": "+1_YOUR_PHONE_NUMBER"
}
```

**Opcija B: Kroz AWS CLI (CloudShell)**

```bash
# ⚠️ SECURITY: Postavi environment variables PRIJE pokretanja!
export TWILIO_ACCOUNT_SID="AC_YOUR_ACCOUNT_SID_HERE"
export TWILIO_AUTH_TOKEN="your_auth_token_here"
export TWILIO_PHONE_NUMBER="+1_YOUR_PHONE_NUMBER"

# Ažuriraj secret s novim credentials
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

# Provjeri da je ažurirano
aws secretsmanager get-secret-value \
  --secret-id uslugar-twilio-config \
  --region eu-north-1 \
  --query 'SecretString' \
  --output text | python3 -m json.tool
```

### 3. Provjeri da li ECS Task koristi novi secret

```bash
# Provjeri da li task definition koristi secret
aws ecs describe-task-definition \
  --task-definition uslugar:330 \
  --region eu-north-1 \
  --query 'taskDefinition.containerDefinitions[?name==`uslugar`].secrets[?contains(name, `TWILIO`)]' \
  --output json
```

### 4. Restart ECS Service da učita nove credentials

```bash
aws ecs update-service \
  --cluster apps-cluster \
  --service uslugar-service-2gk1f1mv \
  --force-new-deployment \
  --region eu-north-1
```

### 5. Provjeri logove nakon restart-a

```bash
# Pričekaj 2-3 minute za deployment
aws logs tail /ecs/uslugar-backend \
  --region eu-north-1 \
  --since 5m \
  | grep -i "twilio config"
```

## Napomena

Ako je Auth Token promijenjen u Twilio konzoli, **moraš ažurirati secret u AWS Secrets Manager** jer ECS task koristi credentials iz Secrets Manager-a, ne direktno iz Twilio.

