# ⚡ S3 Quick Setup - Korak po Korak

## 🎯 Opcija 1: Automatski Setup (Preporučeno)

### Windows (PowerShell):

```powershell
cd uslugar/backend
.\scripts\setup-s3-bucket.ps1
```

### Linux/Mac (Bash):

```bash
cd uslugar/backend
chmod +x scripts/setup-s3-bucket.sh
./scripts/setup-s3-bucket.sh
```

**Što skripta radi:**
- ✅ Kreira S3 bucket `uslugar-invoices` u `eu-north-1`
- ✅ Postavlja encryption i security settings
- ✅ Postavlja lifecycle policy (Glacier nakon 90 dana, brisanje nakon 7 godina)
- ✅ Testira upload

---

## 🎯 Opcija 2: Ručno Setup (AWS Console)

### Korak 1: Kreiraj S3 Bucket

1. Otvori: https://eu-north-1.console.aws.amazon.com/s3/
2. **Create bucket**
3. **Bucket name**: `uslugar-invoices`
4. **Region**: `eu-north-1` (Stockholm)
5. **Block Public Access**: ✅ Enable (bucket je private)
6. **Encryption**: Enable (SSE-S3)
7. **Create bucket**

### Korak 2: Postavi IAM Permissions

1. Otvori: https://console.aws.amazon.com/iam/
2. **Roles** → pronađi ECS task role (npr. `ecsTaskRole`)
3. **Add permissions** → **Create inline policy** → **JSON**
4. Zalijepi sadržaj iz `uslugar/backend/iam-policy-s3-invoices.json`
5. **Review policy** → **Name**: `S3InvoicesAccess` → **Create policy**
6. Vrati se na role → **Attach policies** → odaberi `S3InvoicesAccess`

### Korak 3: Dodaj Environment Varijable u ECS

1. Otvori: https://eu-north-1.console.aws.amazon.com/ecs/v2/task-definitions
2. Pronađi task definition: **`uslugar`**
3. **Create new revision**
4. U container `uslugar`, dodaj **Environment variables**:
   - `AWS_S3_BUCKET_NAME` = `uslugar-invoices`
   - `AWS_REGION` = `eu-north-1`
5. **Create** (nova revizija)
6. **ECS Service** → **Update** → odaberi novu reviziju → **Update service**

### Korak 4: Postavi Lifecycle Policy (Opcionalno)

1. **S3 Console** → `uslugar-invoices` bucket
2. **Management** → **Lifecycle rules** → **Create lifecycle rule**
3. **Rule name**: `MoveOldInvoicesToGlacier`
4. **Prefix**: `invoices/`
5. **Transitions**: After 90 days → Glacier Instant Retrieval
6. **Expiration**: After 2555 days (7 godina)
7. **Create rule**

---

## ✅ Provjera

Nakon setup-a, provjeri da sve radi:

1. **Test upload** (skripta to automatski radi)
2. **Kreiraj test fakturu** preko API-ja
3. **Provjeri CloudWatch logs** da vidiš S3 upload
4. **Provjeri bazu** da se `pdfUrl` spremi

---

## 📚 Detaljne Upute

- **Kompletan vodič**: `S3-SETUP-GUIDE.md`
- **ECS setup**: `S3-ECS-SETUP.md`
- **Cost optimization**: `S3-COST-OPTIMIZATION.md`

---

## 🆘 Troubleshooting

### "Access Denied"
→ Provjeri IAM permissions za ECS task role

### "Bucket not found"
→ Provjeri da je bucket kreiran u `eu-north-1`

### Skripta ne radi
→ Provjeri da je AWS CLI instaliran i konfiguriran (`aws configure`)

