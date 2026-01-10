# 📄 PDF Storage - Gdje se PDF fakture spremaju?

## Lokacije gdje se PDF sprema

### 1. **AWS S3 Bucket** (Glavna lokacija) ✅

**Lokacija:**
- **Bucket:** `uslugar-invoices`
- **Region:** `eu-north-1`
- **Path:** `invoices/{invoiceNumber}.pdf`
- **Primjer:** `invoices/2025-0001.pdf`

**Kada se sprema:**
- PDF se automatski uploada u S3 kada se faktura generira i šalje
- Funkcija: `saveInvoicePDF()` → `uploadInvoicePDF()`
- URL se sprema u bazi u polju `Invoice.pdfUrl`

**Kako pristupiti:**
- Preko S3 URL-a: `https://uslugar-invoices.s3.eu-north-1.amazonaws.com/invoices/2025-0001.pdf`
- Preko API endpointa: `GET /api/invoices/:invoiceId/pdf` (preuzima iz S3 ako postoji)

---

### 2. **Baza podataka** (Metapodaci) 📊

**Lokacija:**
- **Tablica:** `Invoice`
- **Polje:** `pdfUrl` (TEXT, nullable)
- **Sadržaj:** S3 URL fakture (npr. `https://uslugar-invoices.s3.eu-north-1.amazonaws.com/invoices/2025-0001.pdf`)

**Kada se sprema:**
- Nakon uspješnog S3 uploada
- Ako S3 upload ne uspije, `pdfUrl` ostaje `null`

---

### 3. **Memorija (Buffer)** - Privremeno 💾

**Lokacija:**
- **RAM memorija** (Node.js Buffer)
- **Trajanje:** Tijekom generiranja i slanja emaila

**Kada se koristi:**
- PDF se generira u memoriji kao `Buffer` objekt
- Koristi se za:
  - Upload u S3
  - Slanje emaila (prilog)
  - Preuzimanje preko API-ja (ako nije u S3)

**Napomena:** PDF se **NE sprema** na lokalni disk servera!

---

## Kako funkcionira?

### Scenario 1: S3 je konfiguriran ✅

1. **Generiranje fakture:**
   ```
   generateInvoicePDF() → pdfBuffer (u memoriji)
   ↓
   saveInvoicePDF() → uploadInvoicePDF() → S3
   ↓
   Spremi pdfUrl u bazu
   ```

2. **Preuzimanje PDF-a:**
   ```
   GET /api/invoices/:id/pdf
   ↓
   Provjeri pdfUrl u bazi
   ↓
   Ako postoji: downloadInvoicePDF() → S3 → vraća Buffer
   Ako ne postoji: generateInvoicePDF() → vraća Buffer
   ```

### Scenario 2: S3 nije konfiguriran ⚠️

1. **Generiranje fakture:**
   ```
   generateInvoicePDF() → pdfBuffer (u memoriji)
   ↓
   saveInvoicePDF() → S3 nije konfiguriran → skip
   ↓
   pdfUrl ostaje null u bazi
   ```

2. **Preuzimanje PDF-a:**
   ```
   GET /api/invoices/:id/pdf
   ↓
   Provjeri pdfUrl u bazi → null
   ↓
   generateInvoicePDF() → generira novi PDF iz podataka u bazi
   ↓
   Vraća Buffer (PDF se generira svaki put)
   ```

---

## Prednosti S3 storage-a

✅ **Trajno spremište** - PDF se ne gubi nakon restart-a servera
✅ **Skalabilnost** - Ne koristi lokalni disk servera
✅ **Backup** - S3 automatski replicira podatke
✅ **Performanse** - Brži pristup nego generiranje svaki put
✅ **Cost-effective** - S3 Intelligent-Tiering automatski optimizira troškove

---

## Brisanje PDF-a s S3

**Endpoint:** `DELETE /api/invoices/:invoiceId/pdf-s3` (samo admin)

**Što se događa:**
1. Briše PDF file s S3 bucketa
2. Postavlja `pdfUrl` na `null` u bazi
3. PDF se i dalje može generirati na zahtjev iz podataka u bazi

---

## Sažetak

| Lokacija | Tip | Trajnost | Kada se koristi |
|----------|-----|----------|-----------------|
| **S3 Bucket** | Cloud storage | Trajno | Glavna lokacija za spremanje PDF-a |
| **Baza podataka** | Metapodaci | Trajno | Spremanje S3 URL-a (`pdfUrl`) |
| **Memorija (Buffer)** | Privremeno | Tijekom requesta | Generiranje i upload |

**Važno:** PDF se **NE sprema** na lokalni disk servera. Ako S3 nije konfiguriran, PDF se generira dinamički iz podataka u bazi svaki put kada se zatraži.

