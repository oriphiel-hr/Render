# AWS S3 Cost Optimization za PDF Fakture

## 📊 AWS S3 Cijene (eu-north-1, Stockholm)

### Storage (Standard)
- **Prvih 50 TB/mjesec**: $0.023 per GB
- **Sljedećih 450 TB/mjesec**: $0.022 per GB
- **Preko 500 TB/mjesec**: $0.021 per GB

### Request Pricing
- **PUT requests**: $0.005 per 1,000 requests
- **GET requests**: $0.0004 per 1,000 requests
- **DELETE requests**: Besplatno

### Data Transfer
- **Out to Internet**: $0.09 per GB (prvih 10 TB/mjesec)
- **Out to CloudFront**: $0.00 (besplatno)
- **In (upload)**: Besplatno

---

## 💰 Procijenjeni Troškovi za Uslugar

### Pretpostavke:
- **100 faktura/mjesec** (pretplate + lead purchases)
- **Prosječna veličina PDF-a**: 50 KB (0.05 MB)
- **Ukupno storage/mjesec**: 100 × 0.05 MB = 5 MB = 0.005 GB
- **Ukupno storage/godina**: 0.005 GB × 12 = 0.06 GB

### Mjesečni troškovi:
1. **Storage**: 0.005 GB × $0.023 = **$0.000115** (≈ 0.01 centa)
2. **PUT requests**: 100 × $0.005 / 1000 = **$0.0005** (≈ 0.05 centa)
3. **GET requests**: 200 × $0.0004 / 1000 = **$0.00008** (≈ 0.01 centa)
4. **Data transfer out**: 200 × 0.05 MB × $0.09 / 1024 = **$0.00088** (≈ 0.09 centa)

**Ukupno mjesečno**: **≈ $0.0016** (≈ 0.16 centa/mjesec)

**Ukupno godišnje**: **≈ $0.02** (≈ 2 centa/godina)

---

## 🎯 Optimizacije za Smanjenje Troškova

### 1. **Intelligent-Tiering Storage Class**
Automatski premješta fakture u jeftiniji storage class ako se ne pristupa često.

```javascript
// U s3-storage.js, dodaj StorageClass:
StorageClass: 'INTELLIGENT_TIERING'
```

**Ušteda**: Do 40% za fakture starije od 30 dana koje se rijetko preuzimaju.

### 2. **Lifecycle Policies**
Automatski premješta stare fakture u Glacier ili briše nakon određenog vremena.

**Primjer lifecycle policy (AWS Console ili Terraform)**:
```json
{
  "Rules": [
    {
      "Id": "MoveOldInvoicesToGlacier",
      "Status": "Enabled",
      "Prefix": "invoices/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    },
    {
      "Id": "DeleteVeryOldInvoices",
      "Status": "Enabled",
      "Prefix": "invoices/",
      "Expiration": {
        "Days": 2555  // 7 godina (pravni zahtjev za čuvanje faktura)
      }
    }
  ]
}
```

**Ušteda**: 
- Glacier: $0.004 per GB (83% jeftinije od Standard)
- Nakon 7 godina: Automatsko brisanje (0 trošak)

### 3. **CloudFront Distribution** (opcionalno)
Za česte preuzimanja faktura, koristite CloudFront za caching.

**Ušteda**: 
- Data transfer: $0.00 (besplatno iz CloudFront)
- Brže preuzimanje za korisnike

### 4. **Kompresija PDF-a** (opcionalno)
Smanji veličinu PDF-a prije uploada (ako je moguće).

**Ušteda**: Manji storage i transfer troškovi.

---

## 📋 Preporučena Konfiguracija

### Za Malu Skalu (< 1000 faktura/mjesec):
- **Storage Class**: Standard (ili Intelligent-Tiering)
- **Lifecycle Policy**: Ne (fakture se čuvaju 7 godina)
- **CloudFront**: Ne potrebno
- **Procijenjeni trošak**: **< $0.10/mjesec**

### Za Srednju Skalu (1000-10000 faktura/mjesec):
- **Storage Class**: Intelligent-Tiering
- **Lifecycle Policy**: 
  - Nakon 90 dana → Glacier
  - Nakon 7 godina → Delete
- **CloudFront**: Opcionalno
- **Procijenjeni trošak**: **< $1/mjesec**

### Za Veliku Skalu (> 10000 faktura/mjesec):
- **Storage Class**: Intelligent-Tiering
- **Lifecycle Policy**: 
  - Nakon 30 dana → Standard-IA (Infrequent Access)
  - Nakon 90 dana → Glacier
  - Nakon 7 godina → Delete
- **CloudFront**: Preporučeno
- **Procijenjeni trošak**: **< $10/mjesec**

---

## 🔧 Postavljanje Lifecycle Policy

### Preko AWS Console:
1. Otvori S3 bucket
2. Idi na **Management** → **Lifecycle rules**
3. Klikni **Create lifecycle rule**
4. Konfiguriraj prema preporukama iznad

### Preko AWS CLI:
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket uslugar-invoices \
  --lifecycle-configuration file://lifecycle-policy.json
```

### Preko Terraform:
```hcl
resource "aws_s3_bucket_lifecycle_configuration" "invoices" {
  bucket = aws_s3_bucket.invoices.id

  rule {
    id     = "MoveOldInvoicesToGlacier"
    status = "Enabled"
    prefix = "invoices/"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }

  rule {
    id     = "DeleteVeryOldInvoices"
    status = "Enabled"
    prefix = "invoices/"

    expiration {
      days = 2555  # 7 godina
    }
  }
}
```

---

## 📝 Pravni Zahtjevi

Prema hrvatskom zakonu, fakture se moraju čuvati **najmanje 7 godina**. Lifecycle policy bi trebao brisati fakture tek nakon 7 godina.

---

## 💡 Dodatni Savjeti

1. **Monitoriraj troškove**: Koristi AWS Cost Explorer za praćenje S3 troškova
2. **Alarmi**: Postavi CloudWatch alarme za neočekivane troškove
3. **Tagging**: Tagiraj S3 objekte za bolje praćenje (npr. `Environment: production`)
4. **Backup**: Razmotri backup strategiju (S3 Cross-Region Replication)

---

## 🎯 Zaključak

Za Uslugar platformu s **< 1000 faktura/mjesec**, S3 troškovi će biti **< $0.10/mjesec** (≈ 0.70 HRK/mjesec), što je zanemarivo u odnosu na vrijednost usluge.

S3 je **izuzetno jeftin** za čuvanje PDF faktura i ne bi trebao biti značajan trošak.

