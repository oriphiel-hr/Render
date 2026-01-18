# ✅ Provjera neiskorištenih Environment Variables na Render.com

## 📊 Rezultat analize

**ZAKLJUČAK:** **SVE environment varijable koje su dokumentirane u `RENDER-ENV-SETUP.md` KORISTE SE u kodu!**

**Nema nepotrebnih varijabli koje se mogu obrisati bez dodatne provjere.**

---

## 📋 Varijable koje su OPCIONALNE (aplikacija radi i bez njih):

### **Ako ne koristiš neku funkcionalnost, možeš obrisati odgovarajuće varijable:**

1. **AWS S3** (ako ne koristiš S3 za invoice PDF-ove)
   - `AWS_S3_BUCKET_NAME`
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - **Status:** Koristi se u `backend/src/lib/s3-storage.js` za upload invoice PDF-ova

2. **Fiscalization (eRačun)** (ako ne fiskaliziraš fakture)
   - `FISCALIZATION_ENABLED`
   - `ERACUN_API_URL`
   - `ERACUN_API_KEY`
   - `ERACUN_CERT_PATH`
   - `COMPANY_OIB`
   - `COMPANY_NAME`
   - `COMPANY_ADDRESS`
   - `COMPANY_DIRECTOR`
   - **Status:** Koristi se u `backend/src/services/fiscalization-service.js` za fiskalizaciju faktura

3. **SUDREG API** (ako ne koristiš automatsku verifikaciju tvrtki)
   - `SUDREG_CLIENT_ID`
   - `SUDREG_CLIENT_SECRET`
   - **Status:** Koristi se u `backend/src/routes/kyc.js` za automatsku verifikaciju tvrtki

4. **Stripe** (ako ne koristiš Stripe payments)
   - `TEST_STRIPE_SECRET_KEY`
   - `TEST_STRIPE_PUBLISHABLE_KEY`
   - `TEST_STRIPE_WEBHOOK_SECRET`
   - **Status:** Koristi se u `backend/src/routes/payments.js` i drugim fajlovima

5. **Twilio** (ako ne koristiš SMS funkcionalnost)
   - `TEST_TWILIO_ACCOUNT_SID`
   - `TEST_TWILIO_AUTH_TOKEN`
   - `TEST_TWILIO_PHONE_NUMBER`
   - **Status:** Koristi se u `backend/src/services/sms-service.js` i `backend/src/routes/admin.js`

6. **OpenAI** (ako ne koristiš AI moderaciju recenzija)
   - `OPENAI_API_KEY`
   - **Status:** Koristi se u `backend/src/services/review-moderation-service.js`

7. **VAPID (Push Notifications)** (ako ne koristiš push notifications)
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
   - **Status:** Koristi se u `backend/src/services/push-notification-service.js`

---

## ✅ Varijable koje su OBAVEZNE (ne briši ih!)

1. `NODE_ENV=production`
2. `PORT` (Render automatski postavlja, ali možeš eksplicitno)
3. `DATABASE_URL` - **OBAVEZNO!**
4. `JWT_SECRET` - **OBAVEZNO!**
5. `CORS_ORIGINS` - **OBAVEZNO!**
6. `FRONTEND_URL` - **OBAVEZNO za email linkove!**
7. `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - **OBAVEZNO za email!**

---

## 🔍 Kako provjeriti na Render.com

### Korak 1: Otvori Render Dashboard

1. Idi na: https://dashboard.render.com/
2. Otvori **Backend Service**
3. Idi na **Environment** tab

### Korak 2: Provjeri svaku varijablu

Za svaku varijablu provjeri:
1. **Da li koristiš tu funkcionalnost?**
   - Ako NE → možeš obrisati (ako si siguran)
   - Ako DA → **NE briši!**

2. **Provjeri u dokumentaciji:**
   - Pregledaj `ENV-VARIABLES-ANALYSIS.md` za detalje o korištenju

### Korak 3: Obriši samo ako si siguran

**VAŽNO:** Ako nisi siguran, **NE briši varijablu!** Bolje je ostaviti nepotrebnu varijablu nego obrisati nešto što se koristi.

---

## 📝 Checklist prije brisanja varijable

- [ ] Provjereno da varijabla nije obavezna
- [ ] Provjereno da ne koristim tu funkcionalnost
- [ ] Provjereno u kodu da se varijabla koristi samo za tu funkcionalnost
- [ ] Provjereno da aplikacija radi bez te varijable
- [ ] Spreman za brisanje

---

## ⚠️ Upozorenje

**NIKADA nemoj brisati:**
- `DATABASE_URL` - Aplikacija neće moći pristupiti bazi
- `JWT_SECRET` - Autentifikacija neće raditi
- `CORS_ORIGINS` - Frontend neće moći pristupiti API-ju
- `SMTP_*` - Email funkcionalnost neće raditi (ako koristiš)

---

## 🧪 Testiranje nakon brisanja

Ako obrišeš opcionalnu varijablu:
1. **Redeploy backend** (Render automatski redeploy-uje)
2. **Provjeri logove** - traži greške vezane uz nedostajuće varijable
3. **Testiraj funkcionalnost** - provjeri da li radi sve što koristiš

---

**Sve varijable se koriste! Samo provjeri koje funkcionalnosti stvarno koristiš.** ✅

