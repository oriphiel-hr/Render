# 🪣 AWS S3 Setup Guide za PDF Fakture

## 📋 Pregled

Ovaj vodič će vas provesti kroz postavljanje AWS S3 bucket-a za čuvanje PDF faktura.

---

## 🎯 Korak 1: Kreiraj S3 Bucket

### Opcija A: Preko AWS Console (Preporučeno)

1. **Otvori AWS Console**: https://eu-north-1.console.aws.amazon.com/s3/
2. **Klikni "Create bucket"**
3. **Konfiguracija**:
   - **Bucket name**: `uslugar-invoices` (mora biti globalno jedinstven)
   - **AWS Region**: `eu-north-1` (Stockholm)
   - **Object Ownership**: ACLs disabled (preporučeno)
   - **Block Public Access**: ✅ **Enable** (bucket je private)
   - **Bucket Versioning**: Disable (nije potrebno)
   - **Default encryption**: Enable (SSE-S3 ili SSE-KMS)
   - **Object Lock**: Disable
4. **Klikni "Create bucket"**

### Opcija B: Preko AWS CLI

```bash
aws s3api create-bucket \
  --bucket uslugar-invoices \
  --region eu-north-1 \
  --create-bucket-configuration LocationConstraint=eu-north-1
```

---

## 🔐 Korak 2: Konfiguriraj IAM Permissions

### Za ECS Task Role (Production)

ECS task role već ima pristup S3-u ako koristi IAM role. Provjeri da task role ima S3 permissions:

**IAM Policy za S3 pristup**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::uslugar-invoices",
        "arn:aws:s3:::uslugar-invoices/*"
      ]
    }
  ]
}
```

**Dodaj policy na ECS Task Role**:
1. Idi na IAM Console: https://console.aws.amazon.com/iam/
2. Roles → pronađi ECS task role (npr. `ecsTaskRole`)
3. Add permissions → Attach policies → Create policy
4. JSON tab → zalijepi gornji JSON
5. Review policy → Name: `S3InvoicesAccess` → Create policy
6. Vrati se na role → Attach policies → odaberi `S3InvoicesAccess` → Add permissions

### Za Lokalni Development

Kreiraj IAM user s programmatic access:

1. **IAM Console** → Users → Create user
2. **User name**: `uslugar-s3-dev`
3. **Access type**: ✅ Programmatic access
4. **Permissions**: Attach existing policies → Create policy → JSON:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::uslugar-invoices",
           "arn:aws:s3:::uslugar-invoices/*"
         ]
       }
     ]
   }
   ```
5. **Save Access Key ID i Secret Access Key** (prikazuju se samo jednom!)

---

## 📝 Korak 3: Postavi Environment Varijable

### Za Lokalni Development

Dodaj u `.env` fajl (ili kopiraj iz `env.example`):

```env
# AWS S3 Configuration
AWS_S3_BUCKET_NAME=uslugar-invoices
AWS_REGION=eu-north-1

# Za lokalni development (opcionalno):
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

**Napomena**: Ako koristiš AWS CLI s konfiguriranim credentials, ove varijable nisu potrebne.

### Za Production (ECS)

Dodaj environment varijable u ECS Task Definition:

1. **AWS Console** → ECS → Task definitions → `uslugar`
2. **Create new revision**
3. U container definition `uslugar`, dodaj u **Environment variables**:
   - **Name**: `AWS_S3_BUCKET_NAME`, **Value**: `uslugar-invoices`
   - **Name**: `AWS_REGION`, **Value**: `eu-north-1`
4. **Create** (nova revizija)
5. **Update service** da koristi novu reviziju

**Napomena**: Za production, **NE** dodavaj `AWS_ACCESS_KEY_ID` i `AWS_SECRET_ACCESS_KEY` - koristi se IAM role!

---

## 🔄 Korak 4: Postavi Lifecycle Policy (Opcionalno, ali preporučeno)

Lifecycle policy automatski premješta stare fakture u jeftiniji storage i briše ih nakon 7 godina.

### Preko AWS Console:

1. **S3 Console** → `uslugar-invoices` bucket
2. **Management** → **Lifecycle rules** → **Create lifecycle rule**
3. **Rule name**: `MoveOldInvoicesToGlacier`
4. **Rule scope**: Apply to all objects in the bucket
5. **Transitions**:
   - ✅ Transition current versions of objects between storage classes
   - **After 90 days** → **Transition to**: `Glacier Instant Retrieval`
6. **Expiration**:
   - ✅ Delete current versions of objects
   - **After**: `2555 days` (7 godina - pravni zahtjev)
7. **Create rule**

### Preko AWS CLI:

```bash
cat > lifecycle-policy.json << 'EOF'
{
  "Rules": [
    {
      "Id": "MoveOldInvoicesToGlacier",
      "Status": "Enabled",
      "Prefix": "invoices/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER_IR"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket uslugar-invoices \
  --lifecycle-configuration file://lifecycle-policy.json \
  --region eu-north-1

rm lifecycle-policy.json
```

---

## ✅ Korak 5: Testiraj Konfiguraciju

### Test Upload (Lokalno)

```bash
cd uslugar/backend
node -e "
import('./src/lib/s3-storage.js').then(async ({ uploadInvoicePDF, isS3Configured }) => {
  console.log('S3 Configured:', isS3Configured());
  if (isS3Configured()) {
    const testBuffer = Buffer.from('Test PDF content');
    const url = await uploadInvoicePDF(testBuffer, 'TEST-0001');
    console.log('Upload URL:', url);
  } else {
    console.log('S3 not configured - check environment variables');
  }
});
"
```

### Test iz Backend API-ja

1. Kreiraj test fakturu preko API-ja
2. Provjeri da se PDF uploada u S3
3. Provjeri da se `pdfUrl` spremi u bazu

---

## 🔍 Troubleshooting

### Problem: "Access Denied" prilikom uploada

**Rješenje**:
- Provjeri IAM permissions za ECS task role
- Provjeri da bucket name odgovara `AWS_S3_BUCKET_NAME`
- Provjeri da bucket postoji u ispravnoj regiji

### Problem: "Bucket not found"

**Rješenje**:
- Provjeri da je bucket kreiran u `eu-north-1` regiji
- Provjeri da `AWS_S3_BUCKET_NAME` odgovara stvarnom bucket name-u
- Provjeri AWS credentials (za lokalni development)

### Problem: S3 upload ne radi, ali nema greške

**Rješenje**:
- Provjeri CloudWatch logs za S3 errors
- Provjeri da `isS3Configured()` vraća `true`
- Provjeri da bucket nije public (mora biti private)

---

## 📊 Monitoring

### CloudWatch Metrics

S3 automatski šalje metrike u CloudWatch:
- `BucketSizeBytes` - Veličina bucket-a
- `NumberOfObjects` - Broj objekata
- `AllRequests` - Broj requesta

### Cost Monitoring

1. **AWS Cost Explorer**: https://console.aws.amazon.com/cost-management/home
2. Filtriraj po S3 servisu
3. Postavi budget alarme ako je potrebno

---

## 🎯 Quick Start Checklist

- [ ] S3 bucket `uslugar-invoices` kreiran u `eu-north-1`
- [ ] IAM permissions dodane na ECS task role
- [ ] Environment varijable postavljene u ECS task definition
- [ ] Lifecycle policy postavljena (opcionalno)
- [ ] Test upload uspješan
- [ ] Monitoring konfiguriran (opcionalno)

---

## 📚 Dodatni Resursi

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [S3 Cost Optimization Guide](./S3-COST-OPTIMIZATION.md)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
