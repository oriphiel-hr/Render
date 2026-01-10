# 🚀 Pokreni Twilio Setup - Korak po Korak

## ⚠️ Terminal Output Problem

Terminal output se ne prikazuje pravilno, pa ćemo pokrenuti komande ručno.

---

## ✅ Korak 1: Kreiraj Twilio Secret

**Otvorite PowerShell terminal u `uslugar/backend` i pokrenite:**

```powershell
cd C:\GIT_PROJEKTI\AWS\AWS_projekti\uslugar\backend

# Provjeri da li secret već postoji
aws secretsmanager describe-secret --secret-id uslugar-twilio-config --region eu-north-1

# Ako ne postoji, kreiraj novi:
# ⚠️ ZAMIJENI SA TVOJIM TWILIO CREDENTIALS!
$secretJson = @{
    TWILIO_ACCOUNT_SID = "YOUR_ACCOUNT_SID_HERE"
    TWILIO_AUTH_TOKEN = "YOUR_AUTH_TOKEN_HERE"
    TWILIO_PHONE_NUMBER = "YOUR_PHONE_NUMBER_HERE"
} | ConvertTo-Json -Compress

aws secretsmanager create-secret `
    --name uslugar-twilio-config `
    --secret-string $secretJson `
    --region eu-north-1

# Ako već postoji, ažuriraj:
aws secretsmanager put-secret-value `
    --secret-id uslugar-twilio-config `
    --secret-string $secretJson `
    --region eu-north-1
```

---

## ✅ Korak 2: Ažuriraj ECS Task Definition

**Nakon što je secret kreiran, pokrenite:**

```powershell
cd C:\GIT_PROJEKTI\AWS\AWS_projekti\uslugar\backend

.\update-ecs-task-twilio.ps1
```

**Ili ručno:**

```powershell
# 1. Dohvati trenutnu task definition
aws ecs describe-task-definition --task-definition uslugar --region eu-north-1 --query 'taskDefinition' > current-task.json

# 2. Editiraj JSON i dodaj Twilio secrets u "secrets" array:
#    (koristi JSON editor ili skriptu)

# 3. Registriraj novu task definition
aws ecs register-task-definition --cli-input-json file://updated-task.json --region eu-north-1

# 4. Ažuriraj ECS service
aws ecs update-service `
    --cluster uslugar-cluster `
    --service uslugar-backend-service `
    --task-definition uslugar:NOVA_REVISION `
    --force-new-deployment `
    --region eu-north-1
```

---

## 🔄 Alternativa: Koristi Skripte

**Ako skripte ne rade s output-om, pokušaj:**

```powershell
cd C:\GIT_PROJEKTI\AWS\AWS_projekti\uslugar\backend

# Pokušaj s explicitnim PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup-twilio-secrets.ps1
.\update-ecs-task-twilio.ps1
```

---

## 📋 Brzi Test - Provjeri AWS CLI

**Provjeri da li AWS CLI radi:**

```powershell
aws --version
aws sts get-caller-identity
aws ecs list-clusters --region eu-north-1
```

**Ako ove komande ne rade → konfiguriraj AWS CLI:**

```powershell
aws configure
# Unesi: Access Key, Secret Key, Region (eu-north-1)
```

---

## ✅ Verifikacija Nakon Setup-a

**Provjeri backend logove (~5 minuta nakon deployment-a):**

```powershell
aws logs tail /ecs/uslugar-backend --since 5m --region eu-north-1 | Select-String "Twilio config"
```

**Trebao bi vidjeti:**
```
hasAccountSID: true,
hasAuthToken: true,
hasPhoneNumber: true
```

---

## 🎯 Status

- ✅ Skripte su kreirane i spremne
- ✅ Twilio credentials su definirane u skriptama
- ⏳ Pokretanje skripti zahtijeva ručno izvršavanje

**Preporuka:** Pokreni `.\setup-twilio-secrets.ps1` i `.\update-ecs-task-twilio.ps1` u PowerShell terminalu i prati output!

