# 🔄 Ažuriraj Twilio Auth Token u AWS Secrets Manager

## ✅ Direktna AWS CLI Komanda (CloudShell ili lokalno)

```bash
aws secretsmanager put-secret-value \
  --secret-id uslugar-twilio-config \
  --secret-string '{
    "TWILIO_ACCOUNT_SID": "AC...",
    "TWILIO_AUTH_TOKEN": "***REDACTED***",
    "TWILIO_PHONE_NUMBER": "+1..."
  }' \
  --region eu-north-1
```

## 🔍 Provjeri da je Ažurirano

```bash
aws secretsmanager get-secret-value \
  --secret-id uslugar-twilio-config \
  --region eu-north-1 \
  --query 'SecretString' \
  --output text | python3 -m json.tool
```

## 🔄 Restart ECS Service

```bash
aws ecs update-service \
  --cluster apps-cluster \
  --service uslugar-service-2gk1f1mv \
  --force-new-deployment \
  --region eu-north-1
```

## ✅ Provjeri Logove (Nakon 2-3 minute)

```bash
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

---

## 📝 Alternativa: Koristi PowerShell Script

Ako si na Windows PowerShell:

```powershell
cd C:\GIT_PROJEKTI\AWS\AWS_projekti\uslugar\backend
.\update-twilio-secret-now.ps1
```

