# 🚀 Postavi Twilio Credentials u AWS - SAD

## Problem

Backend logovi pokazuju da Twilio credentials nisu postavljeni:
```
hasAccountSID: false,
hasAuthToken: false,
hasPhoneNumber: false
```

## ✅ Rješenje - 2 Koraka

### Korak 1: Postavi Twilio Secret u AWS Secrets Manager

**Otvorite PowerShell u `uslugar/backend` i pokrenite:**

```powershell
cd C:\GIT_PROJEKTI\AWS\AWS_projekti\uslugar\backend

# ⚠️ SECURITY: Postavi environment variables PRIJE pokretanja!
# NIKADA ne stavljaj credentials direktno u kod!
#
# Dohvati credentials iz: https://console.twilio.com → Account → Account Info
# Zatim postavi:
$env:TWILIO_ACCOUNT_SID = "AC_YOUR_ACCOUNT_SID_HERE"
$env:TWILIO_AUTH_TOKEN = "your_auth_token_here"
$env:TWILIO_PHONE_NUMBER = "+1_YOUR_PHONE_NUMBER"

# Provjeri da su postavljeni
if (-not $env:TWILIO_ACCOUNT_SID -or -not $env:TWILIO_AUTH_TOKEN -or -not $env:TWILIO_PHONE_NUMBER) {
    Write-Host "❌ Twilio credentials nisu postavljeni!" -ForegroundColor Red
    Write-Host "💡 Postavi TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER environment variables" -ForegroundColor Yellow
    exit 1
}

$secretJson = @{
    TWILIO_ACCOUNT_SID = $env:TWILIO_ACCOUNT_SID
    TWILIO_AUTH_TOKEN = $env:TWILIO_AUTH_TOKEN
    TWILIO_PHONE_NUMBER = $env:TWILIO_PHONE_NUMBER
} | ConvertTo-Json -Compress

# Provjeri da li secret postoji
aws secretsmanager describe-secret --secret-id uslugar-twilio-config --region eu-north-1 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Secret postoji, ažuriranje..." -ForegroundColor Yellow
    aws secretsmanager put-secret-value `
        --secret-id uslugar-twilio-config `
        --secret-string $secretJson `
        --region eu-north-1
} else {
    Write-Host "Kreiranje novog secreta..." -ForegroundColor Yellow
    aws secretsmanager create-secret `
        --name uslugar-twilio-config `
        --secret-string $secretJson `
        --region eu-north-1
}
```

**Ili koristi skriptu (ako imaš credentials u environment varijablama):**

```powershell
# ⚠️ SECURITY: Zamijeni placeholders s pravim credentials!
# Dohvati iz: https://console.twilio.com → Account → Account Info
$env:TWILIO_ACCOUNT_SID = "AC_YOUR_ACCOUNT_SID_HERE"
$env:TWILIO_AUTH_TOKEN = "your_auth_token_here"
$env:TWILIO_PHONE_NUMBER = "+1_YOUR_PHONE_NUMBER"

.\setup-twilio-secrets.ps1
```

---

### Korak 2: Ažuriraj ECS Task Definition

**Nakon što je secret kreiran:**

```powershell
cd C:\GIT_PROJEKTI\AWS\AWS_projekti\uslugar\backend

.\update-ecs-task-twilio.ps1
```

**Ova skripta će:**
1. Dohvatiti trenutnu task definition
2. Dodati Twilio secrets
3. Registrirati novu task definition
4. Ažurirati ECS service
5. Pokrenuti novi deployment

**Čekaj ~3-5 minuta** za ECS service restart.

---

## 🔍 Verifikacija

**Provjeri backend logove (~5 minuta nakon deployment-a):**

```powershell
aws logs tail /ecs/uslugar-backend --since 5m --region eu-north-1 | Select-String "Twilio config"
```

**Trebao bi vidjeti:**
```
[SMS Service] Twilio config check: {
  hasAccountSID: true,
  hasAuthToken: true,
  hasPhoneNumber: true,
  phoneNumber: '+18027276987'
}
```

**Ako vidiš ovo → Twilio radi!** ✅

---

## ⚠️ Troubleshooting

### Problem: "Secret not found"

**Rješenje:** Provjeri da li je secret kreiran:
```powershell
aws secretsmanager describe-secret --secret-id uslugar-twilio-config --region eu-north-1
```

### Problem: "Permission denied"

**Rješenje:** Provjeri AWS credentials:
```powershell
aws sts get-caller-identity
```

### Problem: SMS i dalje ne dolazi

**Mogući uzroci:**
1. **Twilio Trial Account** - mora verificirati broj u Twilio Console
2. **Broj telefona nije verificiran** - verificiraj u Twilio

**Provjeri Twilio Console:**
- https://console.twilio.com → **Phone Numbers** → **Verified Caller IDs**
- Ako tvoj broj (na koji šalješ SMS) nije verificiran → dodaj ga i verificiraj kodom

---

## 📝 Summary

1. **Kreiraj secret:** `setup-twilio-secrets.ps1` ili ručno komandom
2. **Ažuriraj ECS:** `update-ecs-task-twilio.ps1`
3. **Čekaj ~5 minuta** za deployment
4. **Provjeri logove** da vidiš da Twilio radi

**Vrijeme:** ~5 minuta ukupno

