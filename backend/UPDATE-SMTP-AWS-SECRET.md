# 🔐 Ažuriranje SMTP Secret-a u AWS Secrets Manager

## 📋 Pregled

Ovaj dokument objašnjava kako ažurirati SMTP konfiguraciju u AWS Secrets Manager s novom email adresom i lozinkom.

**Trenutna konfiguracija:**
- **Secret Name:** `uslugar-smtp-config-5xXBg5`
- **Region:** `eu-north-1`
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-smtp-config-5xXBg5`

**Nova konfiguracija:**
- **Email:** `uslugar@oriphiel.hr`
- **Lozinka:** `c|1TYK4YqbF`
- **Host:** `smtp.hostinger.com`
- **Port:** `465`

---

## 🚀 Brzi Start

### Opcija 1: PowerShell (Windows)

```powershell
cd uslugar/backend
.\update-smtp-secret-aws.ps1
```

### Opcija 2: Bash (Linux/Mac)

```bash
cd uslugar/backend
chmod +x update-smtp-secret-aws.sh
./update-smtp-secret-aws.sh
```

---

## 📝 Ručno Ažuriranje (AWS CLI)

### Korak 1: Priprema JSON fajla

Kreirajte fajl `smtp-secret-update.json`:

```json
{
  "SMTP_HOST": "smtp.hostinger.com",
  "SMTP_PORT": "465",
  "SMTP_USER": "uslugar@oriphiel.hr",
  "SMTP_PASS": "c|1TYK4YqbF",
  "FRONTEND_URL": "https://uslugar.oriph.io"
}
```

### Korak 2: Ažuriranje Secret-a

**PowerShell:**
```powershell
aws secretsmanager put-secret-value `
    --secret-id uslugar-smtp-config-5xXBg5 `
    --secret-string file://smtp-secret-update.json `
    --region eu-north-1
```

**Bash:**
```bash
aws secretsmanager put-secret-value \
    --secret-id uslugar-smtp-config-5xXBg5 \
    --secret-string file://smtp-secret-update.json \
    --region eu-north-1
```

### Korak 3: Provjera

**PowerShell:**
```powershell
aws secretsmanager get-secret-value `
    --secret-id uslugar-smtp-config-5xXBg5 `
    --region eu-north-1 `
    --query 'SecretString' `
    --output text | ConvertFrom-Json
```

**Bash:**
```bash
aws secretsmanager get-secret-value \
    --secret-id uslugar-smtp-config-5xXBg5 \
    --region eu-north-1 \
    --query 'SecretString' \
    --output text | python3 -m json.tool
```

---

## 🌐 Ažuriranje preko AWS Console

1. **Idite na AWS Secrets Manager Console**
   - URL: https://eu-north-1.console.aws.amazon.com/secretsmanager/

2. **Pronađite secret**
   - Tražite: `uslugar-smtp-config-5xXBg5`

3. **Kliknite na secret**

4. **Kliknite "Retrieve secret value"**

5. **Kliknite "Edit"**

6. **Ažurirajte vrijednosti:**
   ```json
   {
     "SMTP_HOST": "smtp.hostinger.com",
     "SMTP_PORT": "465",
     "SMTP_USER": "uslugar@oriphiel.hr",
     "SMTP_PASS": "c|1TYK4YqbF",
     "FRONTEND_URL": "https://uslugar.oriph.io"
   }
   ```

7. **Kliknite "Save"**

---

## 🔄 Restart ECS Task

Nakon ažuriranja secret-a, potrebno je restartati ECS task da bi nove vrijednosti bile učitane:

### Preko AWS Console

1. Idite na **ECS Console** → **Clusters** → **uslugar**
2. Kliknite na **Tasks** tab
3. Odaberite task
4. Kliknite **Stop** → **Confirm**
5. Task će se automatski restartati s novim secret vrijednostima

### Preko AWS CLI

**PowerShell:**
```powershell
# Pronađite task ARN
$taskArn = aws ecs list-tasks --cluster uslugar --region eu-north-1 --query 'taskArns[0]' --output text

# Stop task (automatski će se restartati)
aws ecs stop-task --cluster uslugar --task $taskArn --region eu-north-1
```

**Bash:**
```bash
# Pronađite task ARN
TASK_ARN=$(aws ecs list-tasks --cluster uslugar --region eu-north-1 --query 'taskArns[0]' --output text)

# Stop task (automatski će se restartati)
aws ecs stop-task --cluster uslugar --task "$TASK_ARN" --region eu-north-1
```

---

## ✅ Provjera

Nakon restart-a, provjerite da li email funkcionalnost radi:

1. **Test registracije** - registrirajte novog korisnika
2. **Provjerite email inbox** - `uslugar@oriphiel.hr`
3. **Provjerite CloudWatch logs** - tražite "Verification email sent"

---

## 🔍 Troubleshooting

### Problem: Secret nije pronađen

**Rješenje:**
- Provjerite da li je secret name točan: `uslugar-smtp-config-5xXBg5`
- Provjerite da li ste u ispravnom regionu: `eu-north-1`
- Provjerite AWS credentials: `aws sts get-caller-identity`

### Problem: ECS task ne prima nove vrijednosti

**Rješenje:**
- Provjerite da li je task restartiran
- Provjerite CloudWatch logs za greške
- Provjerite da li IAM role ima dozvolu za Secrets Manager

### Problem: Email se ne šalje

**Rješenje:**
- Provjerite SMTP credentials u secret-u
- Provjerite da li je Hostinger SMTP dostupan
- Provjerite CloudWatch logs za SMTP greške

---

## 📚 Dodatne Informacije

- **AWS Secrets Manager:** https://docs.aws.amazon.com/secretsmanager/
- **ECS Task Definitions:** https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html
- **SMTP Configuration:** `uslugar/backend/src/lib/email.js`

---

## ⚠️ Važno

- **Nikada ne commitajte lozinke u Git!**
- **Koristite AWS Secrets Manager za sve production credentials**
- **Provjerite da li su sve ECS tasks restartirane nakon ažuriranja secret-a**

