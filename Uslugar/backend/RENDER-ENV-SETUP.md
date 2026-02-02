# 🔐 Render Dashboard - Environment Variables Setup

## ✅ Opcija 1: "Add from .env" - Kopiraj Cijeli Sadržaj

**DA, možeš kopirati cijeli sadržaj `.env` datoteke!**

Render Dashboard će automatski:
- ✅ Parsirati sve `KEY=VALUE` linije
- ✅ Ignorirati komentare (linije koje počinju sa `#`)
- ✅ Ignorirati prazne linije
- ✅ Postaviti sve varijable odjednom

### Koraci:

1. **Otvori `.env` datoteku** u editoru
2. **Kopiraj SVE** (Ctrl+A, Ctrl+C ili Cmd+A, Cmd+C na Mac)
3. **Render Dashboard** → Tvoj Service → **Environment** → **Add from .env**
4. **Paste** (Ctrl+V ili Cmd+V) cijeli sadržaj
5. **Save Changes**

Render će automatski izvući sve varijable i postaviti ih.

---

## ⚠️ VAŽNO: Provjeri Prije Kopiranja

### **1. Ne Kopiraj Osjetljive Podatke u Git!**
`.env` datoteka **NE IDE** u Git (.gitignore), ali Render Dashboard koristi env vars koje ručno dodaješ.

### **2. Provjeri da Su Sve Vrijednosti Točne**
- ✅ `TEST_STRIPE_SECRET_KEY` - Kopiraj iz Stripe Dashboard (Test mode)
- ✅ `TEST_STRIPE_PUBLISHABLE_KEY` - Kopiraj iz Stripe Dashboard (Test mode)
- ✅ `TEST_STRIPE_WEBHOOK_SECRET` - **Moraš prvo kreirati webhook** u Stripe Dashboard-u, zatim kopirati Signing secret
- ✅ `INFOBIP_BASE_URL` - https://eejv92.api.infobip.com (ili tvoj subdomain)
- ✅ `INFOBIP_API_KEY` - Iz Infobip Portal → API keys
- ✅ `INFOBIP_SENDER` - ServiceSMS (trial) ili tvoj broj/sender
- ✅ `DATABASE_URL` - Iz Render PostgreSQL add-on ili tvoja baza
- ✅ `JWT_SECRET` - Generiran jak secret

### **3. Placeholder Vrijednosti**
Ako u `.env` imaš placeholder vrijednosti (npr. `YOUR_STRIPE_TEST_SECRET_KEY_HERE`), **MORAŠ ih zamijeniti** stvarnim vrijednostima prije kopiranja u Render Dashboard!

---

## 📋 Opcija 2: Dodaj Varijable Ručno (Jedna po Jedna)

Ako ne želiš kopirati cijelu datoteku, možeš dodati varijable ručno:

### Render Dashboard → Environment → Add Environment Variable

Dodaj ove varijable (minimalno potrebne):

#### **1. Server Configuration**
```
NODE_ENV=production
PORT=10000
```

#### **2. Database**
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

#### **3. Authentication**
```
JWT_SECRET=your-jwt-secret-min-32-chars
```

#### **4. CORS**
```
CORS_ORIGINS=https://uslugar.oriph.io,http://localhost:5173
FRONTEND_URL=https://uslugar.oriph.io
```

#### **5. Email (SMTP)**
```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=uslugar@oriphiel.hr
SMTP_PASS=your-smtp-password
```

#### **6. Push Notifications (VAPID)**
```
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@uslugar.oriph.io
```

#### **7. Stripe (TEST MODE)**
```
TEST_STRIPE_SECRET_KEY=sk_test_...
TEST_STRIPE_PUBLISHABLE_KEY=pk_test_...
TEST_STRIPE_WEBHOOK_SECRET=whsec_... (nakon kreiranja webhook-a)
```

#### **8. Twilio (TEST MODE)**
```
INFOBIP_BASE_URL=https://eejv92.api.infobip.com
INFOBIP_API_KEY=your_api_key_from_portal
INFOBIP_SENDER=ServiceSMS
```

#### **9. SUDREG API**
```
SUDREG_CLIENT_ID=your-client-id
SUDREG_CLIENT_SECRET=your-client-secret
```

#### **10. AWS S3 (ako koristiš)**
```
AWS_S3_BUCKET_NAME=uslugar-invoices
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

#### **11. Fiscalization (eRačun)**
```
FISCALIZATION_ENABLED=true
ERACUN_API_URL=https://cis.porezna-uprava.hr/api/v1/fiscalization
ERACUN_API_KEY=your-eracun-api-key
COMPANY_OIB=88070789896
COMPANY_NAME=ORIPHIEL d.o.o.
COMPANY_ADDRESS=Slavenskoga ulica 5, 10000 Zagreb
COMPANY_DIRECTOR=Tomislav Kranjec
```

---

## 🔍 Koje Varijable IGNORIRATI?

Render Dashboard će automatski ignorirati:
- ✅ Komentare (linije koje počinju sa `#`)
- ✅ Prazne linije
- ✅ Linije koje nisu u formatu `KEY=VALUE`

**ALI**, ako imaš varijable koje **NE želiš** postaviti na Render (npr. lokalne development varijable), jednostavno ih **ne kopiraj** ili ih **obriši** prije paste-a.

---

## ✅ Preporučeni Pristup

### **Najbrži Način (Preporučeno):**

1. **Otvorite `.env` datoteku**
2. **Provjerite da su SVE vrijednosti točne** (ne placeholder-i!)
3. **Kopirajte CIJELI sadržaj** (Ctrl+A, Ctrl+C)
4. **Render Dashboard** → Environment → **Add from .env**
5. **Paste** (Ctrl+V)
6. **Save Changes**
7. **Provjerite** da su sve varijable dodane (Render će prikazati listu)

### **Ako Ima Placeholder Vrijednosti:**

1. **Prvo zamijeni** placeholder-e stvarnim vrijednostima u `.env` datoteci
2. **Zatim kopiraj** cijelu datoteku u Render Dashboard

**ILI:**
1. **Kopiraj cijelu datoteku** u Render Dashboard
2. **Ručno ažuriraj** varijable s placeholder-ima u Render Dashboard-u

---

## 🧪 Provjera Nakon Dodavanja

### **1. Provjeri u Render Dashboard:**
- Environment → Provjeri da su SVE varijable dodane
- Provjeri da NEMA placeholder vrijednosti

### **2. Provjeri u Logs:**
- Render Dashboard → Logs
- Provjeri da nema grešaka tipa: `Missing environment variable: ...`
- Provjeri da se server uspješno pokreće

### **3. Test Endpoints:**
```bash
# Health check
curl https://your-render-service.onrender.com/api/health

# Provjeri Stripe config (ako je implementiran)
curl https://your-render-service.onrender.com/api/payments/config
```

---

## ⚠️ SIGURNOSNE NAPOMENE

### **1. .env Datoteka ne Ide u Git**
- ✅ Provjeri da je `.env` u `.gitignore`
- ✅ NE commitaj `.env` datoteku!

### **2. Render Dashboard Environment Variables su Sigurne**
- ✅ Render Dashboard enkriptira environment variables
- ✅ Ne prikazuju se u logs (osim ako ih eksplicitno logiraš)
- ✅ Nisu vidljive u public source code-u

### **3. Rotiraj Secrets Redovito**
- ✅ JWT_SECRET - Rotiraj svakih 90 dana
- ✅ Stripe keys - Rotiraj ako su kompromitirane
- ✅ Twilio Auth Token - Rotiraj ako je izložen

---

## 📝 Checklist Prije Kopiranja .env

- [ ] `.env` datoteka postoji u `backend/` direktoriju
- [ ] **SVE vrijednosti su točne** (ne placeholder-i)
- [ ] `TEST_STRIPE_WEBHOOK_SECRET` je dodan (nakon kreiranja webhook-a u Stripe)
- [ ] `DATABASE_URL` je točan (iz Render PostgreSQL add-on ili tvoja baza)
- [ ] `JWT_SECRET` je generiran jak secret (min 32 karaktera)
- [ ] Render Dashboard → Tvoj Service → Environment otvoren
- [ ] Spreman za paste cijelog sadržaja `.env` datoteke

---

## 🆘 Troubleshooting

### Problem: "Invalid environment variable format"
**Uzrok:** Možda imaš linije koje nisu u formatu `KEY=VALUE`
**Rješenje:** Provjeri `.env` datoteku, sve varijable moraju biti `KEY=VALUE` (bez razmaka oko `=`)

### Problem: "Environment variable not found"
**Uzrok:** Varijabla nije dodana u Render Dashboard
**Rješenje:** Provjeri da je varijabla dodana i da je naziv točan (case-sensitive!)

### Problem: "Missing TEST_STRIPE_WEBHOOK_SECRET"
**Uzrok:** Webhook secret nije dodan jer webhook endpoint nije kreiran
**Rješenje:** Kreiraj webhook endpoint u Stripe Dashboard-u prvo, zatim dodaj secret

---

## ✅ Zaključak

**DA, možeš kopirati cijeli sadržaj `.env` datoteke** u Render Dashboard "Add from .env" opciju!

Render će automatski parsirati i postaviti sve varijable. Samo provjeri da:
1. ✅ SVE vrijednosti su točne (ne placeholder-i)
2. ✅ `TEST_STRIPE_WEBHOOK_SECRET` je dodan (nakon kreiranja webhook-a)
3. ✅ Nema osjetljivih podataka koji ne trebaju biti u Render Dashboard-u

