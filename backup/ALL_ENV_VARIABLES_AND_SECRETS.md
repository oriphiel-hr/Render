# 📋 SVE ENVIRONMENT VARIJABLE I SECRETI - AWS Projekti

## 🎯 Pregled

Ovaj dokument sadrži kompletnu listu svih environment varijabli i secret-a koji se koriste u projektu `oriphiel-hr/AWS_projekti`.

---

## 1️⃣ DATABASE

### DATABASE_URL
- **Tip:** Secret (AWS Secrets Manager)
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-db-secret-FBWhyv:DATABASE_URL::`
- **Primjer:** `postgresql://username:password@host:5432/uslugar?schema=public`
- **Koristi se u:** ECS Task Definition, Prisma migracije
- **Lokacija:**
  - ✅ AWS Secrets Manager: `uslugar-db-secret`
  - ✅ ECS Task Definition secrets
  - ✅ Prisma workflow: `secrets.DB_SECRET_ARN`

---

## 2️⃣ AUTHENTICATION & SECURITY

### JWT_SECRET
- **Tip:** Environment Variable / Secret
- **Primjer:** `your-super-secret-jwt-key-here` (min 32 karaktera)
- **Koristi se u:** JWT token generiranje
- **Lokacija:**
  - 📄 `uslugar/backend/env.example`
  - 📄 `uslugar/backend/ENV_EXAMPLE.txt`
  - ⚠️ **NEDOSTAJE u ECS Task Definition** (treba dodati)

---

## 3️⃣ EMAIL (SMTP)

### SMTP_HOST
- **Tip:** Secret (AWS Secrets Manager)
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-smtp-config-5xXBg5:SMTP_HOST::`
- **Primjer:** `smtp.gmail.com` ili `smtp.hostinger.com`
- **Koristi se u:** Email slanje

### SMTP_PORT
- **Tip:** Secret (AWS Secrets Manager)
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-smtp-config-5xXBg5:SMTP_PORT::`
- **Primjer:** `587` (TLS) ili `465` (SSL)
- **Koristi se u:** Email slanje

### SMTP_USER
- **Tip:** Secret (AWS Secrets Manager)
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-smtp-config-5xXBg5:SMTP_USER::`
- **Primjer:** `noreply@uslugar.oriph.io` ili `your-email@gmail.com`
- **Koristi se u:** Email autentifikacija

### SMTP_PASS
- **Tip:** Secret (AWS Secrets Manager)
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-smtp-config-5xXBg5:SMTP_PASS::`
- **Primjer:** App-specific password za Gmail ili email password
- **Koristi se u:** Email autentifikacija

### FRONTEND_URL
- **Tip:** Secret (AWS Secrets Manager)
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-smtp-config-5xXBg5:FRONTEND_URL::`
- **Vrijednost (vjerovatno):** `https://uslugar.oriph.io` (produkcija) ili `http://localhost:5173` (dev)
- **Status:** ℹ️ Vrijednost u Secrets Manager (nije u kodu)
- **Koristi se u:** Email linkovi, CORS, redirect URL-ovi

---

## 4️⃣ PUSH NOTIFICATIONS (VAPID)

### VAPID_PUBLIC_KEY
- **Tip:** Environment Variable (hardcoded u Task Definition)
- **Vrijednost:** `BDG4-j--YWXbakF85YGca1YvaghsIlnsxDIT9RnK1Obiga15pMgNbl2i-HVcoDgrZvZyPMlJMQrabWGa1-7xr30`
- **Status:** ✅ **KONKRETNA VRIJEDNOST** (public key, OK da bude vidljiv)
- **Koristi se u:** Web Push notifikacije (browser)
- **Generira se:** `npx web-push generate-vapid-keys`
- **Lokacija:**
  - ✅ ECS Task Definition environment variables (`task-def-final.json` linija 27)
  - 📄 `uslugar/backend/env.example` (linija 29)
  - 📄 `uslugar/backend/ENV_EXAMPLE.txt` (linija 34)

### VAPID_PRIVATE_KEY
- **Tip:** Secret (AWS Secrets Manager)
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-vapid-keys-kgCgMk:VAPID_PRIVATE_KEY::`
- **Vrijednost:** `2IXc0O30gh9A182x2AaJvW2SMqr-lEHvGBuBkPz5u24`
- **Status:** ⚠️ **KONKRETNA VRIJEDNOST** (private key, već je u env.example - trebalo bi rotirati!)
- **Koristi se u:** Web Push notifikacije signing
- **Lokacija:**
  - ✅ AWS Secrets Manager: `uslugar-vapid-keys-kgCgMk`
  - ✅ ECS Task Definition secrets (`task-def-final.json` linija 63)
  - 📄 `uslugar/backend/env.example` (linija 30) ⚠️ **SIGURNOSNI RIZIK**
  - 📄 `uslugar/backend/ENV_EXAMPLE.txt` (linija 35) ⚠️ **SIGURNOSNI RIZIK**

### VAPID_SUBJECT
- **Tip:** Environment Variable (hardcoded u Task Definition)
- **Vrijednost:** `mailto:admin@uslugar.oriph.io`
- **Status:** ✅ **KONKRETNA VRIJEDNOST** (email contact, OK)
- **Koristi se u:** Web Push notifikacije
- **Lokacija:**
  - ✅ ECS Task Definition environment variables (`task-def-final.json` linija 31)
  - 📄 `uslugar/backend/env.example` (linija 31)

---

## 5️⃣ STRIPE PAYMENTS

### STRIPE_SECRET_KEY
- **Tip:** Secret (AWS Secrets Manager)
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar/stripe-secret-key-jKdcdD`
- **Primjer:** `sk_test_...` (test) ili `sk_live_...` (produkcija)
- **Koristi se u:** Stripe API pozivi (checkout sessions, payment intents)
- **Lokacija:**
  - ✅ AWS Secrets Manager: `uslugar/stripe-secret-key`
  - ✅ ECS Task Definition secrets (dodano u workflow)
  - 📄 `.github/workflows/backend-uslugar-ecs.yml` (linija 123)

### STRIPE_PUBLISHABLE_KEY
- **Tip:** Secret (AWS Secrets Manager)
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar/stripe-publishable-key-37rvJI`
- **Primjer:** `pk_test_...` (test) ili `pk_live_...` (produkcija)
- **Koristi se u:** Frontend Stripe Checkout (public key)
- **Lokacija:**
  - ✅ AWS Secrets Manager: `uslugar/stripe-publishable-key`
  - ✅ ECS Task Definition secrets (dodano u workflow)
  - 📄 `.github/workflows/backend-uslugar-ecs.yml` (linija 124)

### STRIPE_WEBHOOK_SECRET
- **Tip:** Environment Variable / Secret
- **Primjer:** `whsec_...`
- **Koristi se u:** Stripe webhook signature verification
- **Lokacija:**
  - 📄 `uslugar/backend/src/routes/payments.js` (linija 338)
  - ⚠️ **NEDOSTAJE u ECS Task Definition** (treba dodati u Secrets Manager)

---

## 6️⃣ TWILIO SMS

### TWILIO_ACCOUNT_SID
- **Tip:** Secret (AWS Secrets Manager - JSON secret)
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-twilio-config-xv1Y6q:TWILIO_ACCOUNT_SID::`
- **Vrijednost:** `AC...` (u Secrets Manager - nedostaje u dokumentaciji)
- **Status:** ⚠️ **KONKRETNA VRIJEDNOST** (već je u dokumentaciji - trebalo bi rotirati!)
- **Koristi se u:** Twilio SMS API pozivi
- **Lokacija:**
  - ✅ AWS Secrets Manager: `uslugar-twilio-config-xv1Y6q` (JSON)
  - 📄 `TWILIO-SECRETS-STATUS.md` (linija 16) ⚠️ **SIGURNOSNI RIZIK**
  - ⚠️ **NEDOSTAJE u ECS Task Definition** (treba dodati)

### TWILIO_AUTH_TOKEN
- **Tip:** Secret (AWS Secrets Manager - JSON secret)
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-twilio-config-xv1Y6q:TWILIO_AUTH_TOKEN::`
- **Vrijednost:** `***REDACTED***` (u Secrets Manager - nedostaje u dokumentaciji)
- **Status:** ⚠️ **KONKRETNA VRIJEDNOST** (već je u dokumentaciji - **KRITIČAN SIGURNOSNI RIZIK!**)
- **Koristi se u:** Twilio SMS API autentifikacija
- **Lokacija:**
  - ✅ AWS Secrets Manager: `uslugar-twilio-config-xv1Y6q` (JSON)
  - 📄 `TWILIO-SECRETS-STATUS.md` (linija 17) ⚠️ **KRITIČAN SIGURNOSNI RIZIK**
  - ⚠️ **NEDOSTAJE u ECS Task Definition** (treba dodati)

### TWILIO_PHONE_NUMBER
- **Tip:** Secret (AWS Secrets Manager - JSON secret)
- **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-twilio-config-xv1Y6q:TWILIO_PHONE_NUMBER::`
- **Vrijednost:** `+1...` (u Secrets Manager - nedostaje u dokumentaciji)
- **Status:** ✅ **KONKRETNA VRIJEDNOST** (phone number, manje kritično)
- **Koristi se u:** Twilio SMS sender number
- **Lokacija:**
  - ✅ AWS Secrets Manager: `uslugar-twilio-config-xv1Y6q` (JSON)
  - 📄 `TWILIO-SECRETS-STATUS.md` (linija 18)
  - ⚠️ **NEDOSTAJE u ECS Task Definition** (treba dodati)

---

## 7️⃣ SUDREG API (Hrvatska Registar)

### SUDREG_CLIENT_ID
- **Tip:** Environment Variable (hardcoded u workflow)
- **Vrijednost:** `UcfrGwvRv3uGkqvYnUMxIA..`
- **Status:** ⚠️ **KONKRETNA VRIJEDNOST** (hardcoded u workflow - **SIGURNOSNI RIZIK!**)
- **Koristi se u:** Sudreg API autentifikacija (verifikacija tvrtki)
- **Lokacija:**
  - ✅ ECS Task Definition environment variables (hardcoded) - `.github/workflows/backend-uslugar-ecs.yml` (linija 165)
  - 📄 `.github/workflows/backend-uslugar-ecs.yml` (linija 164) ⚠️ **SIGURNOSNI RIZIK**
  - 📄 `SETUP-SUDREG-SECRETS.md` (linija 17) ⚠️ **SIGURNOSNI RIZIK**
  - 📄 `ADD-SUDREG-CREDENTIALS.md` (linija 5) ⚠️ **SIGURNOSNI RIZIK**
  - ⚠️ **TREBALO BI BITI U SECRETS MANAGER** (trenutno hardcoded)

### SUDREG_CLIENT_SECRET
- **Tip:** Environment Variable (hardcoded u workflow)
- **Vrijednost:** `-TX-7q_UfffSEaRmGIP4bA..`
- **Status:** ⚠️ **KONKRETNA VRIJEDNOST** (hardcoded u workflow - **KRITIČAN SIGURNOSNI RIZIK!**)
- **Koristi se u:** Sudreg API autentifikacija
- **Lokacija:**
  - ✅ ECS Task Definition environment variables (hardcoded) - `.github/workflows/backend-uslugar-ecs.yml` (linija 169)
  - 📄 `.github/workflows/backend-uslugar-ecs.yml` (linija 168) ⚠️ **KRITIČAN SIGURNOSNI RIZIK**
  - 📄 `SETUP-SUDREG-SECRETS.md` (linija 18) ⚠️ **KRITIČAN SIGURNOSNI RIZIK**
  - 📄 `ADD-SUDREG-CREDENTIALS.md` (linija 6) ⚠️ **KRITIČAN SIGURNOSNI RIZIK**
  - ⚠️ **TREBALO BI BITI U SECRETS MANAGER** (trenutno hardcoded)
  - ℹ️ Postoji secret u Secrets Manager: `uslugar-sudreg-creds` (JSON), ali se ne koristi

---

## 8️⃣ AWS S3

### AWS_S3_BUCKET_NAME
- **Tip:** Environment Variable (hardcoded u workflow)
- **Vrijednost:** `uslugar-invoices`
- **Status:** ✅ **KONKRETNA VRIJEDNOST** (bucket name, OK)
- **Koristi se u:** S3 upload faktura (PDF)
- **Lokacija:**
  - ✅ ECS Task Definition environment variables (`.github/workflows/backend-uslugar-ecs.yml` linija 173)
  - 📄 `.github/workflows/backend-uslugar-ecs.yml` (linija 172)
  - 📄 `uslugar/backend/env.example` (linija 21)

### AWS_REGION
- **Tip:** Environment Variable (hardcoded u workflow)
- **Vrijednost:** `eu-north-1`
- **Status:** ✅ **KONKRETNA VRIJEDNOST** (AWS region, OK)
- **Koristi se u:** AWS servisi (S3, Secrets Manager, ECS)
- **Lokacija:**
  - ✅ ECS Task Definition environment variables (`.github/workflows/backend-uslugar-ecs.yml` linija 177)
  - 📄 `.github/workflows/backend-uslugar-ecs.yml` (linija 176, env: linija 12)
  - 📄 `uslugar/backend/env.example` (linija 22)

### AWS_ACCOUNT_ID
- **Tip:** Hardcoded u ARN-ovima i konfiguracijama
- **Vrijednost:** `666203386231`
- **Status:** ✅ **KONKRETNA VRIJEDNOST** (AWS Account ID, OK)
- **Koristi se u:** ARN-ovi za AWS resurse
- **Lokacija:**
  - 📄 Svi ARN-ovi u dokumentaciji
  - 📄 `uslugar/backend/task-def-final.json`
  - 📄 `.github/workflows/backend-uslugar-ecs.yml`

### AWS_ACCESS_KEY_ID
- **Tip:** Optional (ECS koristi IAM role)
- **Primjer:** `AKIA...`
- **Koristi se u:** Lokalni development (opcionalno)
- **Lokacija:**
  - 📄 `uslugar/backend/env.example` (komentirano)
  - ⚠️ **Nije potrebno u ECS** (koristi se IAM role: `ecsTaskRole`)

### AWS_SECRET_ACCESS_KEY
- **Tip:** Optional (ECS koristi IAM role)
- **Primjer:** `...`
- **Koristi se u:** Lokalni development (opcionalno)
- **Lokacija:**
  - 📄 `uslugar/backend/env.example` (komentirano)
  - ⚠️ **Nije potrebno u ECS** (koristi se IAM role: `ecsTaskRole`)

---

## 9️⃣ CORS

### CORS_ORIGINS
- **Tip:** Environment Variable (hardcoded u workflow)
- **Vrijednost:** `https://uslugar.oriph.io,http://localhost:5173,http://localhost:3000`
- **Status:** ✅ **KONKRETNA VRIJEDNOST** (CORS origins, OK)
- **Koristi se u:** CORS middleware (Express.js)
- **Lokacija:**
  - ✅ ECS Task Definition environment variables (`.github/workflows/backend-uslugar-ecs.yml` linija 161)
  - 📄 `.github/workflows/backend-uslugar-ecs.yml` (linija 161)
  - 📄 `uslugar/backend/env.example` (linija 8)
  - 📄 `uslugar/backend/src/server.js` (linija 113)

---

## 🔟 SERVER CONFIGURATION

### PORT
- **Tip:** Environment Variable (hardcoded u Task Definition)
- **Vrijednost:** `8080` (ECS) ili `4000` (lokalno)
- **Status:** ✅ **KONKRETNA VRIJEDNOST** (port number, OK)
- **Koristi se u:** Express.js server port
- **Lokacija:**
  - ✅ ECS Task Definition environment variables (`task-def-final.json` linija 23: PORT=8080)
  - 📄 `uslugar/backend/src/server.js` (linija 70: `process.env.PORT || 4000`)
  - 📄 `uslugar/backend/env.example` (linija 17: PORT="4000")

### NODE_ENV
- **Tip:** Environment Variable
- **Vrijednost:** `production` (ECS) ili `development` (lokalno)
- **Koristi se u:** Node.js environment detection
- **Lokacija:**
  - 📄 `uslugar/backend/env.example`
  - 📄 `uslugar/backend/src/server.js` (linija 56, 106)
  - ⚠️ **Nije eksplicitno postavljeno u ECS Task Definition**

---

## 1️⃣1️⃣ FISCALIZATION (eRačun - Porezna Uprava)

### FISCALIZATION_ENABLED
- **Tip:** Environment Variable
- **Primjer:** `true` ili `false`
- **Koristi se u:** Omogućava/onemogućava fiskalizaciju faktura
- **Lokacija:**
  - 📄 `FISCALIZATION-CONFIG.md`
  - ⚠️ **NEDOSTAJE u ECS Task Definition**

### ERACUN_API_URL
- **Tip:** Environment Variable
- **Test:** `https://cistest.apis.hr/api/v1/fiscalization`
- **Produkcija:** `https://cis.porezna-uprava.hr/api/v1/fiscalization`
- **Koristi se u:** Porezna uprava API pozivi
- **Lokacija:**
  - 📄 `FISCALIZATION-CONFIG.md`
  - ⚠️ **NEDOSTAJE u ECS Task Definition**

### ERACUN_API_KEY
- **Tip:** Environment Variable / Secret
- **Primjer:** `your_api_key_here`
- **Koristi se u:** Porezna uprava API autentifikacija
- **Lokacija:**
  - 📄 `FISCALIZATION-CONFIG.md`
  - ⚠️ **NEDOSTAJE u ECS Task Definition**

### ERACUN_CERT_PATH
- **Tip:** Environment Variable (opcionalno)
- **Primjer:** `/path/to/certificate.pem`
- **Koristi se u:** SSL certifikat za Porezna uprava API
- **Lokacija:**
  - 📄 `FISCALIZATION-CONFIG.md`
  - ⚠️ **NEDOSTAJE u ECS Task Definition**

### COMPANY_OIB
- **Tip:** Environment Variable / Hardcoded u kodu
- **Vrijednost:** `88070789896`
- **Status:** ✅ **KONKRETNA VRIJEDNOST** (OIB tvrtke, OK)
- **Koristi se u:** Fakture (OIB tvrtke)
- **Lokacija:**
  - 📄 `FISCALIZATION-CONFIG.md` (linija 17)
  - 📄 `uslugar/backend/src/services/fiscalization-service.js` (linija 21 - default vrijednost)
  - 📄 `uslugar/backend/src/services/invoice-service.js` (linija 174)
  - ⚠️ **NEDOSTAJE u ECS Task Definition**

### COMPANY_NAME
- **Tip:** Environment Variable
- **Vrijednost:** `ORIPHIEL d.o.o.`
- **Status:** ✅ **KONKRETNA VRIJEDNOST** (naziv tvrtke, OK)
- **Koristi se u:** Fakture (naziv tvrtke)
- **Lokacija:**
  - 📄 `FISCALIZATION-CONFIG.md` (linija 18)
  - ⚠️ **NEDOSTAJE u ECS Task Definition**

### COMPANY_ADDRESS
- **Tip:** Environment Variable
- **Vrijednost:** `Slavenskoga ulica 5, 10000 Zagreb`
- **Status:** ✅ **KONKRETNA VRIJEDNOST** (adresa tvrtke, OK)
- **Koristi se u:** Fakture (adresa tvrtke)
- **Lokacija:**
  - 📄 `FISCALIZATION-CONFIG.md` (linija 19)
  - ⚠️ **NEDOSTAJE u ECS Task Definition**

### COMPANY_DIRECTOR
- **Tip:** Environment Variable
- **Vrijednost:** `Tomislav Kranjec`
- **Status:** ✅ **KONKRETNA VRIJEDNOST** (direktor tvrtke, OK)
- **Koristi se u:** Fakture (direktor tvrtke)
- **Lokacija:**
  - 📄 `FISCALIZATION-CONFIG.md` (linija 20)
  - ⚠️ **NEDOSTAJE u ECS Task Definition**

---

## 1️⃣2️⃣ GITHUB ACTIONS SECRETS

### AWS_OIDC_ROLE_ARN
- **Tip:** GitHub Secret
- **Koristi se u:** GitHub Actions AWS authentication (OIDC)
- **Lokacija:**
  - 📄 `.github/workflows/backend-uslugar-ecs.yml` (linija 45)
  - 📄 `.github/workflows/prisma-uslugar.yml` (linija 56)

### DB_SECRET_ARN
- **Tip:** GitHub Secret
- **Vrijednost:** ARN za `uslugar-db-secret`
- **Koristi se u:** Prisma migracije workflow
- **Lokacija:**
  - 📄 `.github/workflows/prisma-uslugar.yml` (linija 89, 126)

### AWS_ECS_TASK_EXEC_ROLE_ARN
- **Tip:** GitHub Secret
- **Vrijednost:** `arn:aws:iam::666203386231:role/ecsTaskExecutionRole`
- **Koristi se u:** Prisma migracije (one-off tasks)
- **Lokacija:**
  - 📄 `.github/workflows/prisma-uslugar.yml` (linija 90, 155)

### AWS_ECS_TASK_ROLE_ARN
- **Tip:** GitHub Secret
- **Vrijednost:** `arn:aws:iam::666203386231:role/ecsTaskRole`
- **Koristi se u:** Prisma migracije (one-off tasks)
- **Lokacija:**
  - 📄 `.github/workflows/prisma-uslugar.yml` (linija 91, 156)

### HOSTINGER_HOST
- **Tip:** GitHub Secret
- **Primjer:** `ftp.uslugar.oriph.io` ili IP adresa
- **Koristi se u:** Frontend deployment (FTP)
- **Lokacija:**
  - 📄 `.github/workflows/frontend-uslugar.yml` (linija 134)

### HOSTINGER_USERNAME
- **Tip:** GitHub Secret
- **Koristi se u:** Frontend deployment (FTP)
- **Lokacija:**
  - 📄 `.github/workflows/frontend-uslugar.yml` (linija 135)

### HOSTINGER_PASSWORD
- **Tip:** GitHub Secret
- **Koristi se u:** Frontend deployment (FTP)
- **Lokacija:**
  - 📄 `.github/workflows/frontend-uslugar.yml` (linija 136)

### HOSTINGER_SERVER_DIR
- **Tip:** GitHub Secret (opcionalno)
- **Default:** `public_html/`
- **Koristi se u:** Frontend deployment (FTP target directory)
- **Lokacija:**
  - 📄 `.github/workflows/frontend-uslugar.yml` (linija 20)

### VITE_API_URL
- **Tip:** GitHub Secret (opcionalno)
- **Default:** `https://api.uslugar.oriph.io`
- **Koristi se u:** Frontend build (Vite environment variable)
- **Lokacija:**
  - 📄 `.github/workflows/frontend-uslugar.yml` (linija 72)

### FTP_HOST, FTP_USERNAME, FTP_PASSWORD
- **Tip:** GitHub Secrets (fallback za HOSTINGER_*)
- **Koristi se u:** Frontend deployment (FTP fallback)
- **Lokacija:**
  - 📄 `.github/workflows/frontend-uslugar.yml` (linija 138-141)

### AWS_REGION, AWS_ACCOUNT_ID, AWS_ROLE_ARN
- **Tip:** GitHub Variables/Secrets
- **Koristi se u:** Ostali AWS workflows
- **Lokacija:**
  - 📄 `.github/workflows/build-oriphiel-poslovni-imenik.yml`
  - 📄 `.github/workflows/build-in-store-nav.yml`

---

## 1️⃣3️⃣ OPENAI (Nedostaje)

### OPENAI_API_KEY
- **Tip:** Environment Variable / Secret
- **Status:** ⚠️ **NEDOSTAJE** - nije konfiguriran
- **Koristi se u:** OpenAI API integracija (ako se koristi)
- **Lokacija:**
  - 📦 `uslugar/backend/package.json` (openai dependency, linija 48)
  - ⚠️ **Nije pronađen u kodu** - možda nije implementirano

---

## ⚠️ SIGURNOSNI RIZICI - KONKRETNE VRIJEDNOSTI U KODU

### 🔴 KRITIČNO - Treba odmah rotirati:
1. **TWILIO_AUTH_TOKEN**: `***REDACTED***` (u `TWILIO-SECRETS-STATUS.md` - rotirati odmah!)
2. **SUDREG_CLIENT_SECRET**: `***REDACTED***` (hardcoded u `.github/workflows/backend-uslugar-ecs.yml` - rotirati!)

### 🟡 VISOK - Treba premjestiti u Secrets Manager:
1. **VAPID_PRIVATE_KEY**: `***REDACTED***` (u `env.example` fajlovima - ukloniti!)
2. **TWILIO_ACCOUNT_SID**: `***REDACTED***` (u `TWILIO-SECRETS-STATUS.md` - ukloniti!)
3. **SUDREG_CLIENT_ID**: `***REDACTED***` (hardcoded u workflow - premjestiti u Secrets Manager)

### ✅ OK - Public/Non-sensitive vrijednosti:
- VAPID_PUBLIC_KEY (public key, OK)
- VAPID_SUBJECT (email, OK)
- COMPANY_OIB, COMPANY_NAME, COMPANY_ADDRESS, COMPANY_DIRECTOR (public info, OK)
- AWS_REGION, AWS_ACCOUNT_ID, AWS_S3_BUCKET_NAME (infrastructure info, OK)
- CORS_ORIGINS (OK)
- PORT, FRONTEND_URL (OK)

---

## 📊 SAŽETAK PO STATUSU

### ✅ KONFIGURISANO I RADI
- ✅ DATABASE_URL (Secrets Manager)
- ✅ SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (Secrets Manager)
- ✅ FRONTEND_URL (Secrets Manager)
- ✅ VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
- ✅ STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY (Secrets Manager)
- ✅ AWS_S3_BUCKET_NAME, AWS_REGION
- ✅ CORS_ORIGINS
- ✅ PORT (8080 u ECS)

### ⚠️ POSTOJI ALI NEDOSTAJE U ECS TASK DEFINITION
- ⚠️ JWT_SECRET
- ⚠️ TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
- ⚠️ STRIPE_WEBHOOK_SECRET
- ⚠️ NODE_ENV

### ⚠️ HARDCODED (TREBALO BI BITI U SECRETS MANAGER)
- ⚠️ SUDREG_CLIENT_ID, SUDREG_CLIENT_SECRET (hardcoded u workflow)

### ❌ POTREBNO DODATI
- ❌ FISCALIZATION varijable (FISCALIZATION_ENABLED, ERACUN_API_URL, ERACUN_API_KEY, COMPANY_*)
- ❌ OPENAI_API_KEY (ako se koristi)

---

## 🔐 AWS SECRETS MANAGER - KOMPLETNA LISTA SA ARN-OVIMA

### Postojeći Secrets sa ARN-ovima:

1. ✅ **`uslugar-db-secret-FBWhyv`**
   - **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-db-secret-FBWhyv`
   - **Sadrži:** `DATABASE_URL`
   - **Koristi se u:** ECS Task Definition, Prisma migracije

2. ✅ **`uslugar-smtp-config-5xXBg5`**
   - **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-smtp-config-5xXBg5`
   - **Sadrži:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FRONTEND_URL`
   - **Koristi se u:** ECS Task Definition secrets

3. ✅ **`uslugar-vapid-keys-kgCgMk`**
   - **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-vapid-keys-kgCgMk`
   - **Sadrži:** `VAPID_PRIVATE_KEY` = `2IXc0O30gh9A182x2AaJvW2SMqr-lEHvGBuBkPz5u24`
   - **Koristi se u:** ECS Task Definition secrets

4. ✅ **`uslugar/stripe-secret-key-jKdcdD`**
   - **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar/stripe-secret-key-jKdcdD`
   - **Sadrži:** `STRIPE_SECRET_KEY` (test ili live key)
   - **Koristi se u:** ECS Task Definition secrets (dodano u workflow)

5. ✅ **`uslugar/stripe-publishable-key-37rvJI`**
   - **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar/stripe-publishable-key-37rvJI`
   - **Sadrži:** `STRIPE_PUBLISHABLE_KEY` (test ili live key)
   - **Koristi se u:** ECS Task Definition secrets (dodano u workflow)

6. ✅ **`uslugar-twilio-config-xv1Y6q`**
   - **ARN:** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-twilio-config-xv1Y6q`
   - **Sadrži (JSON):** ⚠️ **REDACTED - Sadrži TWILIO credentials u AWS Secrets Manager**
     ```json
     {
       "TWILIO_ACCOUNT_SID": "AC...",
       "TWILIO_AUTH_TOKEN": "***REDACTED***",
       "TWILIO_PHONE_NUMBER": "+1..."
     }
     ```
   - **Koristi se u:** ⚠️ **NEDOSTAJE u ECS Task Definition** (treba dodati)

7. ⚠️ **`uslugar-sudreg-creds-dccouu`** (ili slično)
   - **ARN (vjerovatno):** `arn:aws:secretsmanager:eu-north-1:666203386231:secret:uslugar-sudreg-creds-dccouu`
   - **Sadrži (JSON):**
     ```json
     {
       "clientId": "UcfrGwvRv3uGkqvYnUMxIA..",
       "clientSecret": "-TX-7q_UfffSEaRmGIP4bA.."
     }
     ```
   - **Status:** ⚠️ Postoji u Secrets Manager ali se **NE KORISTI** (hardcoded u workflow umjesto toga)

### Treba kreirati:
- ❌ `uslugar-jwt-secret` → `JWT_SECRET`
- ❌ `uslugar-stripe-webhook-secret` → `STRIPE_WEBHOOK_SECRET`
- ❌ `uslugar-fiscalization-config` → JSON sa svim fiscalization varijablama

---

## 📝 PREPORUKE ZA POBOLJŠANJA

### 1. Premjestiti hardcoded vrijednosti u Secrets Manager:
- SUDREG_CLIENT_ID i SUDREG_CLIENT_SECRET (koristiti postojeći `uslugar-sudreg-creds`)
- VAPID_PUBLIC_KEY (trenutno hardcoded, ali je public pa OK)

### 2. Dodati nedostajuće secrets u ECS Task Definition:
- JWT_SECRET
- TWILIO_* (3 varijable iz `uslugar-twilio-config`)
- STRIPE_WEBHOOK_SECRET
- NODE_ENV=production

### 3. Implementirati Fiscalization secrets:
- Kreirati `uslugar-fiscalization-config` u Secrets Manager
- Dodati u ECS Task Definition

### 4. Dokumentacija:
- ✅ Ovaj dokument sve varijable i secrete
- ⚠️ Trebalo bi dodati u README ili setup dokumentaciju

---

## 🔗 REFERENCE

- **AWS Secrets Manager Console:** https://eu-north-1.console.aws.amazon.com/secretsmanager/
- **ECS Task Definition:** `uslugar` (cluster: `apps-cluster`, service: `uslugar-service-2gk1f1mv`)
- **GitHub Secrets:** https://github.com/oriphiel-hr/AWS_projekti/settings/secrets/actions
- **Prisma Schema:** `uslugar/backend/prisma/schema.prisma`
- **Backend ENV Example:** `uslugar/backend/env.example`

---

---

## 📋 KOMPLETNA LISTA KONKRETNIH VRIJEDNOSTI

### Hardcoded u Task Definition / Workflow:
- **PORT:** `8080`
- **VAPID_PUBLIC_KEY:** `BDG4-j--YWXbakF85YGca1YvaghsIlnsxDIT9RnK1Obiga15pMgNbl2i-HVcoDgrZvZyPMlJMQrabWGa1-7xr30`
- **VAPID_SUBJECT:** `mailto:admin@uslugar.oriph.io`
- **CORS_ORIGINS:** `https://uslugar.oriph.io,http://localhost:5173,http://localhost:3000`
- **AWS_S3_BUCKET_NAME:** `uslugar-invoices`
- **AWS_REGION:** `eu-north-1`
- **SUDREG_CLIENT_ID:** `UcfrGwvRv3uGkqvYnUMxIA..` ⚠️
- **SUDREG_CLIENT_SECRET:** `-TX-7q_UfffSEaRmGIP4bA..` ⚠️

### U Secrets Manager (konkretne vrijednosti iz dokumentacije):
- **VAPID_PRIVATE_KEY:** `***REDACTED***` ⚠️ (također u env.example - ukloniti!)
- **TWILIO_ACCOUNT_SID:** `AC...` ⚠️ **REDACTED**
- **TWILIO_AUTH_TOKEN:** `***REDACTED***` ⚠️ **KRITIČNO - REDACTED**
- **TWILIO_PHONE_NUMBER:** `+1...` **REDACTED**

### Company Info (public, OK):
- **COMPANY_OIB:** `88070789896`
- **COMPANY_NAME:** `ORIPHIEL d.o.o.`
- **COMPANY_ADDRESS:** `Slavenskoga ulica 5, 10000 Zagreb`
- **COMPANY_DIRECTOR:** `Tomislav Kranjec`

### AWS Infrastructure:
- **AWS_ACCOUNT_ID:** `666203386231`
- **AWS_REGION:** `eu-north-1`
- **ECS_CLUSTER:** `apps-cluster`
- **ECS_SERVICE:** `uslugar-service-2gk1f1mv`
- **ECR_REGISTRY:** `666203386231.dkr.ecr.eu-north-1.amazonaws.com`

### IAM Roles:
- **ECS_TASK_EXECUTION_ROLE_ARN:** `arn:aws:iam::666203386231:role/ecsTaskExecutionRole`
- **ECS_TASK_ROLE_ARN:** `arn:aws:iam::666203386231:role/ecsTaskRole`

---

**Datum generiranja:** 2026-01-07  
**Verzija:** 2.0 (sa konkretnim vrijednostima)  
**⚠️ UPOZORENJE:** Dokument sadrži stvarne credentials - koristite pažljivo i rotirajte izložene secrete!

