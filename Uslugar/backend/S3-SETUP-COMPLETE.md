# ✅ S3 Setup Završen!

## 🎉 Što je postavljeno:

1. ✅ **S3 Bucket kreiran**: `uslugar-invoices` u `eu-north-1` regiji
2. ✅ **Encryption postavljen**: SSE-S3 (AES256)
3. ✅ **Public access blokiran**: Bucket je private
4. ✅ **Lifecycle policy postavljena**: 
   - Nakon 90 dana → Glacier Instant Retrieval
   - Nakon 7 godina → Automatsko brisanje
5. ✅ **Test upload uspješan**: Bucket radi!

---

## 📝 Sljedeći koraci:

### 1. Dodaj IAM Permissions za ECS Task Role

1. **IAM Console**: https://console.aws.amazon.com/iam/
2. **Roles** → pronađi ECS task role (npr. `ecsTaskRole`)
3. **Add permissions** → **Create inline policy** → **JSON**
4. Zalijepi sadržaj iz `uslugar/backend/iam-policy-s3-invoices.json`
5. **Review policy** → **Name**: `S3InvoicesAccess` → **Create policy**
6. Vrati se na role → **Attach policies** → odaberi `S3InvoicesAccess`

### 2. Dodaj Environment Varijable u ECS Task Definition

1. **ECS Console**: https://eu-north-1.console.aws.amazon.com/ecs/v2/task-definitions
2. Pronađi task definition: **`uslugar`**
3. **Create new revision**
4. U container `uslugar`, dodaj **Environment variables**:
   - `AWS_S3_BUCKET_NAME` = `uslugar-invoices`
   - `AWS_REGION` = `eu-north-1`
5. **Create** (nova revizija)
6. **ECS Service** → **Update** → odaberi novu reviziju → **Update service**

### 3. Testiraj

Nakon deployment-a, testiraj generiranje fakture preko API-ja i provjeri da se PDF uploada u S3.

---

## 📚 Dokumentacija

- **Quick Setup**: `S3-QUICK-SETUP.md`
- **Detaljni vodič**: `S3-SETUP-GUIDE.md`
- **ECS Setup**: `S3-ECS-SETUP.md`
- **Cost Optimization**: `S3-COST-OPTIMIZATION.md`

---

## 🔍 Provjera

```bash
# Provjeri da bucket postoji
aws s3 ls | grep uslugar-invoices

# Provjeri lifecycle policy
aws s3api get-bucket-lifecycle-configuration --bucket uslugar-invoices

# Provjeri encryption
aws s3api get-bucket-encryption --bucket uslugar-invoices
```

