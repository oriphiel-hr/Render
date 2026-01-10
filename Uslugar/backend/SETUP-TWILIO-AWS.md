# 🔧 Setup Twilio Credentials in AWS

## Problem

Backend logovi pokazuju:
```
[SMS Service] Twilio config check: {
  hasAccountSID: false,
  hasAuthToken: false,
  hasPhoneNumber: false,
  phoneNumber: 'NOT SET'
}
```

**Rješenje:** Postaviti Twilio credentials u AWS Secrets Manager i dodati ih u ECS Task Definition.

---

## ✅ Opcija 1: Automatski Setup (Preporučeno)

### Korak 1: Kreiraj Twilio Secret

```powershell
cd uslugar/backend
.\setup-twilio-secrets.ps1
```

**Ako trebaš ažurirati credentials, editaj script:**
```powershell
# U setup-twilio-secrets.ps1 promijeni:
# ⚠️ ZAMIJENI SA TVOJIM TWILIO CREDENTIALS!
$twilioAccountSID = "YOUR_ACCOUNT_SID_HERE"
$twilioAuthToken = "YOUR_AUTH_TOKEN_HERE"
$twilioPhoneNumber = "YOUR_PHONE_NUMBER_HERE"
```

### Korak 2: Ažuriraj ECS Task Definition

```powershell
.\update-ecs-task-twilio.ps1
```

Ovo će:
1. Dohvatiti trenutnu task definition
2. Dodati Twilio secrets
3. Registrirati novu task definition
4. Ažurirati ECS service
5. Pokrenuti novi deployment

**Vrijeme:** ~3-5 minuta za ECS service restart

---

## ✅ Opcija 2: Ručno Setup (AWS Console)

### Korak 1: Kreiraj Secret u AWS Secrets Manager

1. AWS Console → **Secrets Manager**
2. **Store a new secret**
3. Secret type: **Other type of secret**
4. **Plaintext** (ne JSON):
   ```
   {
     "TWILIO_ACCOUNT_SID": "YOUR_ACCOUNT_SID_HERE",
     "TWILIO_AUTH_TOKEN": "YOUR_AUTH_TOKEN_HERE",
     "TWILIO_PHONE_NUMBER": "YOUR_PHONE_NUMBER_HERE"
   }
   ```
5. Secret name: `uslugar-twilio-config`
6. Klikni **Next** → **Store**

### Korak 2: Ažuriraj ECS Task Definition

1. AWS Console → **ECS** → **Task Definitions**
2. Odaberi `uslugar` → **Create new revision**
3. Scroll do **Container definitions** → `uslugar` container
4. **Environment variables** sekcija
5. Klikni **Add secret** (3 puta):

   **Secret 1:**
   - Secret: `uslugar-twilio-config`
   - Key: `TWILIO_ACCOUNT_SID`
   
   **Secret 2:**
   - Secret: `uslugar-twilio-config`
   - Key: `TWILIO_AUTH_TOKEN`
   
   **Secret 3:**
   - Secret: `uslugar-twilio-config`
   - Key: `TWILIO_PHONE_NUMBER`

6. **Create** (nova revision)

### Korak 3: Ažuriraj ECS Service

1. AWS Console → **ECS** → **Clusters** → `uslugar-cluster`
2. **Services** → `uslugar-backend-service`
3. **Update**
4. Task Definition: odaberi novu revision (npr. `uslugar:123`)
5. **Force new deployment** ✓
6. **Update**

**Čekaj ~3-5 minuta** za restart servisa.

---

## 🔍 Verifikacija

### Provjeri Backend Logove (CloudWatch):

```powershell
aws logs tail /ecs/uslugar-backend --since 5m --region eu-north-1 | Select-String "Twilio config"
```

**Trebao bi vidjeti:**
```
[SMS Service] Twilio config check: {
  hasAccountSID: true,
  hasAuthToken: true,
  hasPhoneNumber: true,
  phoneNumber: '+1XXXXXXXXXX'  # Tvoj Twilio phone number
}
```

### Test SMS:

1. Pošalji SMS kod preko frontend-a
2. Provjeri backend logove:
   ```
   [SMS Service] Sending SMS via Twilio to +385... from +1XXXXXXXXXX
   ✅ SMS poslan via Twilio: SM..., Status: queued
   ```

**Ako vidiš ovo → Twilio radi!** ✅

---

## ⚠️ Troubleshooting

### Problem: "Secret not found"

**Rješenje:** Provjeri da li je secret kreiran:
```powershell
aws secretsmanager describe-secret --secret-id uslugar-twilio-config --region eu-north-1
```

### Problem: "Permission denied" pri pristupu Secrets Manager

**Rješenje:** Provjeri da li ECS Task Execution Role ima dozvole:
- `secretsmanager:GetSecretValue` na secret ARN

### Problem: SMS i dalje ne dolazi

**Mogući uzroci:**
1. **Twilio Trial Account** - mora verificirati broj u Twilio Console
2. **Twilio credentials pogrešni** - provjeri u Secrets Manager
3. **Broj telefona nije verificiran** (trial account) - verificiraj u Twilio

**Provjeri Twilio Console:**
- https://console.twilio.com → **Phone Numbers** → **Verified Caller IDs**
- Ako broj nije verificiran → dodaj ga i verificiraj kodom

---

## 📝 Summary

**Automatski:**
1. `.\setup-twilio-secrets.ps1` - kreira secret
2. `.\update-ecs-task-twilio.ps1` - ažurira ECS

**Ručno:**
1. AWS Console → Secrets Manager → kreiraj secret
2. AWS Console → ECS → Task Definition → dodaj secrets
3. AWS Console → ECS → Service → update task definition

**Vrijeme:** ~5 minuta

**Status:** ✅ Twilio credentials će biti dostupni u ECS nakon deployment-a!

