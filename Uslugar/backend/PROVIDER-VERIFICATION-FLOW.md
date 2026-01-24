# 🔍 Provider Verification Flow - Kako se Provjeravaju Različiti Tipovi Providera

Dokumentacija kako se provjeravaju različiti pravni statusi i što je potrebno za testiranje.

---

## 📋 Tipovi Providera i Zahtjevi

### 1. **FREELANCER** (Samostalni Djelatnik)
```
Što se provjerava:
✓ OIB je validan (kontrolna znamenka)
✓ OIB postoji u bazi (FINA, javni registar)
✓ Dokumentacija: Rješenje Porezne uprave (RPO)
✓ Ime u dokumentu poklapa se s imenom korisnika

Što se unosi:
- Email (obavezno)
- Lozinka (obavezno)
- Puno Ime (obavezno)
- Telefon (obavezno)
- Grad (obavezno)
- OIB (obavezno) - npr. 12345678901
- Naziv tvrtke: NE TREBAM! Koristi se puno ime

Dokumentacija:
- RPO (Rješenje Porezne Uprave) - PDF/JPG/PNG

Provjera:
1. OIB validacija (kontrolna znamenka)
2. OCR iz RPO dokumenta - ekstrahira OIB i ime
3. OIB match - Document OIB == Unijeti OIB
4. Ime match - Document Ime ~= Unijeti Ime
5. Admin odobrenje (finalna provjera)

Primjer:
{
  "email": "freelancer@uslugar.hr",
  "password": "Test123456!",
  "fullName": "Marko Marković",
  "phone": "+385991234567",
  "city": "Zagreb",
  "role": "PROVIDER",
  "legalStatusId": "FREELANCER_ID",
  "taxId": "12345678901"
  // NEMA companyName!
}
```

### 2. **OBRT** (Obrtnik)
```
Što se provjerava:
✓ OIB je validan (kontrolna znamenka)
✓ OIB postoji u Registru za obrtnu djelatnost
✓ Naziv obrta podudara se s Registrom
✓ Zakonska osoba je registrirana i aktivna
✓ Dokumentacija: Rješenje Porezne uprave (RPO) ili Izvod iz Registra

Što se unosi:
- Email (obavezno)
- Lozinka (obavezno)
- Puno Ime (obavezno)
- Telefon (obavezno)
- Grad (obavezno)
- OIB (obavezno)
- Naziv tvrtke (obavezno!) - npr. "Marko Marković - obrt"

Dokumentacija:
- RPO (Rješenje Porezne Uprave) - PDF/JPG/PNG
- Ili: Izvod iz Registra za obrtnu djelatnost

Provjera:
1. OIB validacija (kontrolna znamenka)
2. Automatska provjera Registra za obrtnu djelatnost (ako API dostupan)
3. Naziv podudarnost - Unijeti naziv ~= Naziv u Registru
4. OCR iz dokumenta
5. Admin odobrenje

Primjer:
{
  "email": "obrtnik@uslugar.hr",
  "password": "Test123456!",
  "fullName": "Marko Marković",
  "phone": "+385991234567",
  "city": "Zagreb",
  "role": "PROVIDER",
  "legalStatusId": "OBRT_ID",
  "taxId": "12345678901",
  "companyName": "Marko Marković - obrt"  // OBAVEZNO!
}
```

### 3. **d.o.o.** (Društvo s ograničenom odgovornošću)
```
Što se provjerava:
✓ OIB je validan
✓ OIB postoji u Sudskom registru
✓ Naziv d.o.o. postoji u Sudskom registru
✓ Društvo je aktivno (nije u likvidaciji/stečaju)
✓ Zapisi u sudskom registru su validni
✓ Dokumentacija: Rješenje Porezne uprave + Izvod iz Sudskog registra

Što se unosi:
- Email (obavezno)
- Lozinka (obavezno)
- Puno Ime (obavezno)
- Telefon (obavezno)
- Grad (obavezno)
- OIB (obavezno)
- Naziv tvrtke (obavezno!) - npr. "Tehnički Savjeti d.o.o."

Dokumentacija:
- RPO (Rješenje Porezne Uprave) - PDF/JPG/PNG
- Izvod iz Sudskog registra - PDF/JPG/PNG

Provjera:
1. OIB validacija (kontrolna znamenka)
2. Automatska provjera Sudskog registra (ako API dostupan)
3. Naziv podudarnost - Unijeti naziv == Naziv u Sudskom registru
4. Status provjera - Aktivno (ne sme biti u likvidaciji)
5. OCR iz dokumenta
6. Admin odobrenje (osoba u registru = osoba koja se registrira)

Primjer:
{
  "email": "doo@uslugar.hr",
  "password": "Test123456!",
  "fullName": "Marko Marković",
  "phone": "+385991234567",
  "city": "Zagreb",
  "role": "PROVIDER",
  "legalStatusId": "DOO_ID",
  "taxId": "12345678901",
  "companyName": "Tehnički Savjeti d.o.o."  // OBAVEZNO!
}
```

### 4. **j.d.o.o.** (Jednostavno d.o.o.)
```
Isto kao d.o.o., ali:
- Najveće 1 član
- Manji kapital
- Jednostavniji administrativni zahtjevi
- Ista provjera kao d.o.o. kroz Sudski registar

Primjer:
{
  "email": "jdoo@uslugar.hr",
  "password": "Test123456!",
  "fullName": "Marko Marković",
  "phone": "+385991234567",
  "city": "Zagreb",
  "role": "PROVIDER",
  "legalStatusId": "JDOO_ID",
  "taxId": "12345678901",
  "companyName": "Tehnički Savjeti j.d.o.o."
}
```

---

## 🔄 Verification Flow po Statusu

### FREELANCER Flow
```
1. REGISTRACIJA
   ↓
2. VALIDACIJA PODATAKA
   - OIB format + kontrolna znamenka ✓
   - Nema companyName (jer se koristi fullName)
   ↓
3. UPLOAD DOKUMENTA (RPO)
   ↓
4. AUTO-VERIFIKACIJA
   - OCR iz RPO-a
   - Ekstrahira OIB i Ime
   - Provjerava podudarnost
   ↓
5. ADMIN REVIEW
   - Finalna provjera
   - Odobrenje ili odbijanje
   ↓
6. AKTIVACIJA
   - Provider može slati ponude
```

### OBRT/DOO Flow
```
1. REGISTRACIJA
   ↓
2. VALIDACIJA PODATAKA
   - OIB format + kontrolna znamenka ✓
   - companyName obavezno ✓
   - Naziv ne smije biti prazan
   ↓
3. AUTO-VERIFIKACIJA (Ako API dostupan)
   - Provjera Registra / Sudskog registra
   - Naziv match
   - Status aktivno
   ↓
4. UPLOAD DOKUMENTA (RPO + Izvod)
   ↓
5. MANUAL VERIFIKACIJA (ako auto-verify ne ide)
   - Admin provjerava dokumente
   - Admin unosi podatke iz Registra
   ↓
6. ADMIN REVIEW
   - Finalna provjera
   - Odobrenje ili odbijanje
   ↓
7. AKTIVACIJA
```

---

## 🧪 Test Scenariji

### Test User 1: FREELANCER (Što trebam unijeti)
```json
{
  "email": "test.provider@uslugar.hr",
  "password": "Test123456!",
  "fullName": "Test Provider Freelancer",
  "phone": "+385991111112",
  "city": "Split",
  "role": "PROVIDER",
  "legalStatus": "FREELANCER",
  "oib": "12345678901"
  // NEMA companyName - koristi se fullName
}
```

**Što trebam:**
- ✅ OIB: 12345678901 (validan format)
- ✅ RPO dokument (rješenje iz Porezne uprave)
- ❌ Naziv tvrtke: NE TREBAM

**Provjera:**
```
POST /api/kyc/auto-verify
Body: { taxId: "12345678901", legalStatusId: "FREELANCER_ID" }

Trebao bi vratiti:
{
  "verified": true,
  "needsDocument": false,
  "badges": ["oib_validated"],
  "status": "Ready for upload"
}
```

---

### Test User 2: OBRT (Što trebam unijeti)
```json
{
  "email": "test.obrtnik@uslugar.hr",
  "password": "Test123456!",
  "fullName": "Test Obrtnik",
  "phone": "+385991111113",
  "city": "Rijeka",
  "role": "PROVIDER",
  "legalStatus": "OBRT",
  "oib": "12345678902",
  "companyName": "Test Obrt"  // OBAVEZNO!
}
```

**Što trebam:**
- ✅ OIB: 12345678902 (validan format)
- ✅ Naziv obrta: "Test Obrt"
- ✅ RPO dokument ili Izvod iz Registra
- Provjera Registra (ako API dostupan)

**Provjera:**
```
POST /api/kyc/auto-verify
Body: { 
  taxId: "12345678902", 
  legalStatusId: "OBRT_ID",
  companyName: "Test Obrt"
}

Trebao bi vratiti:
{
  "verified": true,
  "needsDocument": true,  // Za obrt trebam dokument
  "badges": ["oib_validated", "registry_checked"],
  "status": "Awaiting document"
}
```

---

### Test User 3: d.o.o. (Što trebam unijeti)
```json
{
  "email": "test.doo@uslugar.hr",
  "password": "Test123456!",
  "fullName": "Test Direktor",
  "phone": "+385991111114",
  "city": "Zadar",
  "role": "PROVIDER",
  "legalStatus": "DOO",
  "oib": "12345678903",
  "companyName": "Test Company DOO"  // OBAVEZNO!
}
```

**Što trebam:**
- ✅ OIB: 12345678903 (validan format)
- ✅ Naziv d.o.o.: "Test Company DOO"
- ✅ RPO dokument
- ✅ Izvod iz Sudskog registra
- Provjera Sudskog registra (ako API dostupan)

**Provjera:**
```
POST /api/kyc/auto-verify
Body: { 
  taxId: "12345678903", 
  legalStatusId: "DOO_ID",
  companyName: "Test Company DOO"
}

Trebao bi vratiti:
{
  "verified": true,
  "needsDocument": true,
  "badges": ["oib_validated", "registry_checked"],
  "status": "Awaiting document"
}
```

---

## 📊 Tablica: Što Trebam za Svaki Status

| | FREELANCER | OBRT | d.o.o. | j.d.o.o. |
|---|---|---|---|---|
| **Email** | ✅ | ✅ | ✅ | ✅ |
| **Lozinka** | ✅ | ✅ | ✅ | ✅ |
| **Puno Ime** | ✅ | ✅ | ✅ | ✅ |
| **Telefon** | ✅ | ✅ | ✅ | ✅ |
| **Grad** | ✅ | ✅ | ✅ | ✅ |
| **OIB** | ✅ | ✅ | ✅ | ✅ |
| **Naziv Tvrtke** | ❌ | ✅ | ✅ | ✅ |
| **RPO Dokument** | ✅ | ✅ | ✅ | ✅ |
| **Izvod iz Registra** | ❌ | ✅ | ✅ | ✅ |
| **Reg. Provjera** | OIB | Obrtni Reg. | Sudski Reg. | Sudski Reg. |

---

## 🔐 Sigurnosne Provjere

### Pri Registraciji
1. ✅ OIB kontrolna znamenka - BACKEND
2. ✅ OIB format (11 znamenki) - BACKEND
3. ✅ Naziv tvrtke nije prazan (za obrt/doo) - BACKEND
4. ✅ Email nije duplikat - BACKEND
5. ✅ Lozinka minimalno 8 znakova - BACKEND

### Pri Dokumentaciji (KYC)
1. ✅ OCR ekstrahira OIB iz dokumenta
2. ✅ OIB iz dokumenta == OIB pri registraciji
3. ✅ Ime iz dokumenta ~= Unijeto ime
4. ✅ Dokument je validan (nije falsificiran)
5. ✅ Admin finalno odobrava

### Pri Auto-Verifikaciji (Ako dostupna)
1. ✅ Provjera javnog registra (FINA, Sudski registar, itd.)
2. ✅ Status je aktivan (ne u likvidaciji)
3. ✅ Naziv se podudara
4. ✅ OIB se podudara

---

## 📱 Primjer: Testiranje Freelancer-a

### 1. Registracija

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.freelancer@uslugar.hr",
    "password": "Test123456!",
    "fullName": "Test Freelancer",
    "phone": "+385991234567",
    "city": "Zagreb",
    "role": "PROVIDER",
    "legalStatusId": "FREELANCER_ID",
    "taxId": "12345678901"
  }'
```

**Očekivani odgovor:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "test.freelancer@uslugar.hr",
    "role": "PROVIDER",
    "verified": false
  }
}
```

### 2. Auto-Verifikacija (Provjera OIB-a)

```bash
curl -X POST http://localhost:3000/api/kyc/auto-verify \
  -H "Content-Type: application/json" \
  -d '{
    "taxId": "12345678901",
    "legalStatusId": "FREELANCER_ID"
  }'
```

**Očekivani odgovor:**
```json
{
  "verified": true,
  "needsDocument": false,
  "badges": ["oib_validated"],
  "status": "Ready"
}
```

### 3. Upload RPO Dokumenta

```bash
curl -X POST http://localhost:3000/api/kyc/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "document=@rpo.pdf" \
  -F "publicConsent=true"
```

**Očekivani odgovor:**
```json
{
  "success": true,
  "data": {
    "extractedOIB": "12345678901",
    "extractedName": "Test Freelancer",
    "ocrVerified": true,
    "oibValidated": true
  }
}
```

### 4. Admin Odobrenje

```bash
curl -X POST http://localhost:3000/api/admin/providers/PROVIDER_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "notes": "Verificirano"
  }'
```

---

## 🔗 Važne Rute

```
POST   /api/auth/register                    # Registracija providera
POST   /api/kyc/auto-verify                  # Auto-provjera OIB-a i Registra
POST   /api/kyc/upload                       # Upload dokumenta (RPO, itd.)
GET    /api/kyc/status                       # Provjeri KYC status
POST   /api/admin/providers/:id/verify       # Admin verificira
POST   /api/admin/providers/:id/approve      # Admin odobrava
```

---

## 📝 Zaključak

Za test korisnike s javnim registrom (OBRT, DOO):
1. **Unesi točne podatke** - Naziv i OIB trebaju biti točni
2. **Provjeri registar** - Isti OIB i naziv kao u registru
3. **Spremi dokumente** - RPO + Izvod iz Registra
4. **Admin odobrenje** - Finalna provjera

Za test korisnike bez javnog registra (FREELANCER):
1. **Unesi podatke** - Email, Ime, OIB
2. **Nema kompanijskog imena** - Koristi se samo fullName
3. **Spremi RPO** - Samo Rješenje Porezne uprave
4. **Admin odobrenje** - Finalna provjera

**Kljucna razlika:** Kod FREELANCER-a nema companyName, kod OBRT/DOO je obavezno!

