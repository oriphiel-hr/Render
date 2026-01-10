# 🚀 S3 Setup za ECS (Production)

## Brzi Setup - Dodaj S3 Environment Varijable u ECS Task Definition

### Korak 1: Otvori ECS Task Definition

1. **AWS Console**: https://eu-north-1.console.aws.amazon.com/ecs/v2/task-definitions
2. Pronađi task definition: **`uslugar`** (ili trenutnu aktivnu)
3. Klikni na task definition → **Create new revision**

### Korak 2: Dodaj Environment Varijable

U container definition **`uslugar`**, u sekciji **"Environment variables"**, dodaj:

**Environment Variable 1:**
- **Name**: `AWS_S3_BUCKET_NAME`
- **Value**: `uslugar-invoices`

**Environment Variable 2:**
- **Name**: `AWS_REGION`
- **Value**: `eu-north-1`

**⚠️ VAŽNO**: **NE** dodavaj `AWS_ACCESS_KEY_ID` i `AWS_SECRET_ACCESS_KEY` - ECS koristi IAM role!

### Korak 3: Provjeri IAM Permissions

ECS task role mora imati S3 permissions. Provjeri:

1. **IAM Console**: https://console.aws.amazon.com/iam/
2. **Roles** → pronađi ECS task role (npr. `ecsTaskRole` ili slično)
3. Provjeri da role ima policy s S3 permissions (vidi `iam-policy-s3-invoices.json`)

Ako nema, dodaj:
- **Add permissions** → **Create inline policy** → **JSON** → zalijepi sadržaj iz `iam-policy-s3-invoices.json`

### Korak 4: Kreiraj i Aktiviraj Novu Reviziju

1. Scroll do dna task definition
2. Klikni **"Create"** (kreira se nova revizija, npr. 330)
3. Vrati se na **ECS Service** (`uslugar-service-2gk1f1mv`)
4. Klikni **"Update"**
5. U **"Task definition"** dropdownu odaberi **novu reviziju**
6. Klikni **"Update service"**
7. Čekaj deployment (2-3 minute)

### Korak 5: Testiraj

1. Kreiraj test fakturu preko API-ja
2. Provjeri CloudWatch logs da vidiš S3 upload
3. Provjeri da se `pdfUrl` spremi u bazu

---

## 🔍 Troubleshooting

### Problem: "Access Denied" u CloudWatch logs

**Rješenje**: Provjeri IAM permissions za ECS task role. Role mora imati `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket` permissions.

### Problem: "Bucket not found"

**Rješenje**: 
- Provjeri da je bucket kreiran: `aws s3 ls | grep uslugar-invoices`
- Provjeri da `AWS_S3_BUCKET_NAME` odgovara stvarnom bucket name-u
- Provjeri da je bucket u `eu-north-1` regiji

### Problem: S3 upload ne radi, ali nema greške

**Rješenje**:
- Provjeri CloudWatch logs za S3 errors
- Provjeri da `isS3Configured()` vraća `true` (dodaj log u kod)
- Provjeri da bucket nije public (mora biti private)

---

## 📋 Checklist

- [ ] S3 bucket `uslugar-invoices` kreiran u `eu-north-1`
- [ ] IAM policy dodana na ECS task role (`iam-policy-s3-invoices.json`)
- [ ] Environment varijable dodane u ECS task definition:
  - [ ] `AWS_S3_BUCKET_NAME=uslugar-invoices`
  - [ ] `AWS_REGION=eu-north-1`
- [ ] Nova task definition revizija kreirana i aktivirana
- [ ] ECS service ažuriran s novom revizijom
- [ ] Test upload uspješan

