# 🎯 Render Dashboard - Detaljne Postavke za Uslugar Backend

## ✅ OSNOVNE POSTAVKE

### 1. Source Code
- **Repository:** `oriphiel-hr/Render`
- **Branch:** `main`
- **Region:** `Frankfurt (EU Central)` ✅ (već imaš jedan service tamo)

### 2. Basic Settings
- **Name:** `uslugar-backend`
- **Project:** `My project` (ili kreiraj novi "Uslugar")
- **Environment:** `Production`

### 3. Language
- **Language:** `Docker` ✅

### 4. Root Directory ⭐ **KLJUČNO!**
```
Uslugar/backend
```
**ILI** (ako Render ne prihvaća velika slova):
```
uslugar/backend
```

### 5. Dockerfile Path ⭐ **KLJUČNO!**
```
Dockerfile.prod
```
**NE** `.` (točka) - to je POGREŠNO!

**Razlog:** 
- Root Directory je `Uslugar/backend`
- Dockerfile.prod je u `Uslugar/backend/Dockerfile.prod`
- Dakle, relativno na root directory = `Dockerfile.prod`

### 6. Instance Type
- **Preporuka:** `Starter` ($7/mesec) za početak
- **Za production:** `Standard` ($25/mesec) - 2 GB RAM, 1 CPU

---

## 🔧 ADVANCED SETTINGS

### Health Check Path
```
/api/health
```
**ILI:**
```
/health
```
(Oba endpoint-a postoje u `server.js`)

### Auto-Deploy
- ✅ **Enable Auto-Deploy:** `ON` (automatski deploy na git push)

---

## 🔐 ENVIRONMENT VARIABLES

### ⚠️ VAŽNO: Dodaj sve ove varijable prije prvog deploy-a!

### 1. Server Configuration
```
NODE_ENV=production
PORT=10000
```
**Napomena:** Render automatski postavlja `PORT` env var, ali možeš eksplicitno postaviti.

### 2. Database (PostgreSQL) ⭐ **KLJUČNO!**

**Opcija A: Koristi Render PostgreSQL Add-on (Preporučeno)**
1. Prvo kreiraj PostgreSQL database u Render Dashboard
2. Zatim u Web Service environment variables:
   - Klikni **"Link Database"** ili
   - Dodaj ručno:
   ```
   DATABASE_URL=<Render automatski generira connection string>
   ```

**Opcija B: Koristi postojeću Render bazu**
Ako već imaš PostgreSQL na Renderu:
```
DATABASE_URL=postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a.frankfurt-postgres.render.com/uslugar
```

### 3. Email (SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@uslugar.oriph.io
SMTP_PASS=<app-specific-password>
FRONTEND_URL=https://uslugar.oriph.io
```

### 4. JWT Authentication
```
JWT_SECRET=<tvoj-super-secret-jwt-key-min-32-karaktera>
```

### 5. CORS
```
CORS_ORIGINS=https://uslugar.oriph.io,https://www.uslugar.oriph.io
```

### 6. Push Notifications (VAPID)
```
VAPID_PUBLIC_KEY=BDG4-j--YWXbakF85YGca1YvaghsIlnsxDIT9RnK1Obiga15pMgNbl2i-HVcoDgrZvZyPMlJMQrabWGa1-7xr30
VAPID_PRIVATE_KEY=2IXc0O30gh9A182x2AaJvW2SMqr-lEHvGBuBkPz5u24
VAPID_SUBJECT=mailto:admin@uslugar.oriph.io
```

### 7. Stripe Payments
```
STRIPE_SECRET_KEY=sk_live_<tvoj-stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=pk_live_<tvoj-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=whsec_<tvoj-stripe-webhook-secret>
```

### 8. Twilio SMS
```
TWILIO_ACCOUNT_SID=<tvoj-twilio-account-sid>
TWILIO_AUTH_TOKEN=<tvoj-twilio-auth-token>
TWILIO_PHONE_NUMBER=<tvoj-twilio-phone-number>
```

### 9. Sudreg API
```
SUDREG_CLIENT_ID=<tvoj-sudreg-client-id>
SUDREG_CLIENT_SECRET=<tvoj-sudreg-client-secret>
```

### 10. AWS S3 (ako i dalje koristiš S3)
```
AWS_S3_BUCKET_NAME=<tvoj-s3-bucket-name>
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=<tvoj-aws-access-key>
AWS_SECRET_ACCESS_KEY=<tvoj-aws-secret-key>
```

### 11. Fiscalization (eRačun)
```
FISCALIZATION_ENABLED=true
ERACUN_API_URL=<eRačun-api-url>
ERACUN_API_KEY=<eRačun-api-key>
COMPANY_OIB=<tvoj-company-oib>
COMPANY_NAME=<tvoj-company-name>
COMPANY_ADDRESS=<tvoj-company-address>
COMPANY_DIRECTOR=<tvoj-company-director>
```

---

## 📋 CHECKLIST PRIJE DEPLOY-A

- [ ] Root Directory: `Uslugar/backend` ✅
- [ ] Dockerfile Path: `Dockerfile.prod` ✅
- [ ] Instance Type: `Starter` ili `Standard` ✅
- [ ] Health Check Path: `/api/health` ✅
- [ ] PostgreSQL Database: Kreiran i povezan ✅
- [ ] DATABASE_URL: Postavljen ✅
- [ ] NODE_ENV: `production` ✅
- [ ] JWT_SECRET: Postavljen ✅
- [ ] SMTP credentials: Postavljene ✅
- [ ] VAPID keys: Postavljene ✅
- [ ] Stripe keys: Postavljene (ako koristiš) ✅
- [ ] Twilio credentials: Postavljene (ako koristiš) ✅
- [ ] Sudreg credentials: Postavljene (ako koristiš) ✅
- [ ] CORS_ORIGINS: Postavljen ✅
- [ ] FRONTEND_URL: Postavljen ✅

---

## 🚀 NAKON DEPLOY-A

### 1. Provjeri Logs
- Render Dashboard → `uslugar-backend` → Logs
- Provjeri da li je:
  - ✅ Prisma Client generiran
  - ✅ Migracije pokrenute
  - ✅ Server pokrenut na portu

### 2. Testiraj Health Check
```bash
curl https://uslugar-backend.onrender.com/api/health
```
**Očekivani odgovor:** `ok`

### 3. Provjeri Database Connection
- Provjeri u logs da li se Prisma uspješno povezala na bazu
- Provjeri da li su migracije primijenjene

---

## ⚠️ ČESTE GREŠKE

### Greška 1: "Dockerfile not found"
**Uzrok:** Dockerfile Path je pogrešan
**Rješenje:** Postavi `Dockerfile.prod` (NE `.`)

### Greška 2: "Cannot connect to database"
**Uzrok:** DATABASE_URL nije postavljen ili je pogrešan
**Rješenje:** Provjeri DATABASE_URL i linkaj PostgreSQL add-on

### Greška 3: "Prisma Client not generated"
**Uzrok:** Prisma CDN problem ili build error
**Rješenje:** Provjeri logs, možda treba ručno generirati lokalno prije push-a

### Greška 4: "Port already in use"
**Uzrok:** Server pokušava koristiti fiksni port umjesto `process.env.PORT`
**Rješenje:** Server.js već koristi `process.env.PORT || 4000`, što je OK

---

## 📝 SAŽETAK - ŠTO STAVITI U DASHBOARD

| Setting | Vrijednost |
|---------|-----------|
| **Name** | `uslugar-backend` |
| **Region** | `Frankfurt (EU Central)` |
| **Branch** | `main` |
| **Root Directory** | `Uslugar/backend` ⭐ |
| **Dockerfile Path** | `Dockerfile.prod` ⭐ |
| **Instance Type** | `Starter` ($7/mesec) |
| **Health Check Path** | `/api/health` |
| **Auto-Deploy** | `ON` |

**Environment Variables:**
- Dodaj sve iz gornje liste (minimalno: DATABASE_URL, NODE_ENV, JWT_SECRET)

---

**Datum:** 2026-01-10

