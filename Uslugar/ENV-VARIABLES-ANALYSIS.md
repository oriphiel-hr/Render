# 📊 Analiza Environment Variables - Koje se koriste i koje ne

## ✅ Environment Variables koje se koriste u kodu

### **1. Server Configuration** (OBAVEZNO)
- ✅ `NODE_ENV` - Production/Development mode (`backend/src/server.js`)
- ✅ `PORT` - Server port (default: 4000) (`backend/src/server.js`)

### **2. Database** (OBAVEZNO)
- ✅ `DATABASE_URL` - PostgreSQL connection string (`backend/src/lib/prisma.js`, Prisma schema)

### **3. Authentication** (OBAVEZNO)
- ✅ `JWT_SECRET` - JWT signing secret (koristi se u auth middleware-u)

### **4. CORS & Frontend** (OBAVEZNO)
- ✅ `CORS_ORIGINS` - Allowed CORS origins (`backend/src/server.js`)
- ✅ `FRONTEND_URL` - Frontend URL za email linkove (`backend/src/lib/email.js`, `backend/src/lib/subscription-reminder.js`, `backend/src/services/monthly-report-service.js`)
- ✅ `CLIENT_URL` - Alternative za FRONTEND_URL (`backend/src/routes/payments.js`, `backend/src/services/addon-lifecycle-service.js`)

### **5. Email (SMTP)** (OBAVEZNO za email funkcionalnost)
- ✅ `SMTP_HOST` - SMTP server (`backend/src/lib/email.js`, `backend/src/lib/subscription-reminder.js`, `backend/src/services/monthly-report-service.js`)
- ✅ `SMTP_PORT` - SMTP port (`backend/src/lib/email.js`, `backend/src/lib/subscription-reminder.js`, `backend/src/services/monthly-report-service.js`)
- ✅ `SMTP_USER` - SMTP username/email (`backend/src/lib/email.js`, `backend/src/lib/subscription-reminder.js`, `backend/src/services/monthly-report-service.js`)
- ✅ `SMTP_PASS` - SMTP password (`backend/src/lib/email.js`, `backend/src/lib/subscription-reminder.js`, `backend/src/services/monthly-report-service.js`)

### **6. Push Notifications (VAPID)** (Opcionalno)
- ✅ `VAPID_PUBLIC_KEY` - VAPID public key (`backend/src/services/push-notification-service.js`)
- ✅ `VAPID_PRIVATE_KEY` - VAPID private key (`backend/src/services/push-notification-service.js`)
- ✅ `VAPID_SUBJECT` - VAPID subject (default: `mailto:admin@uslugar.oriph.io`) (`backend/src/services/push-notification-service.js`)

### **7. Stripe Payments** (Opcionalno - ako koristiš Stripe)
- ✅ `TEST_STRIPE_SECRET_KEY` - Stripe secret key (`backend/src/routes/payments.js`, `backend/src/routes/exclusive-leads.js`, `backend/src/services/subscription-refund-service.js`, `backend/src/services/lead-service.js`)
- ✅ `TEST_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (`backend/src/routes/payments.js`)
- ✅ `TEST_STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (`backend/src/routes/payments.js`)

### **8. Twilio SMS** (Opcionalno - ako koristiš Twilio)
- ✅ `TEST_TWILIO_ACCOUNT_SID` - Twilio Account SID (`backend/src/services/sms-service.js`, `backend/src/routes/admin.js`)
- ✅ `TEST_TWILIO_AUTH_TOKEN` - Twilio Auth Token (`backend/src/services/sms-service.js`, `backend/src/routes/admin.js`)
- ✅ `TEST_TWILIO_PHONE_NUMBER` - Twilio phone number (`backend/src/services/sms-service.js`)

### **9. OpenAI** (Opcionalno - za AI moderaciju recenzija)
- ✅ `OPENAI_API_KEY` - OpenAI API key za Review Moderation (`backend/src/services/review-moderation-service.js`)

### **10. Testing** (Opcionalno)
- ✅ `API_URL` - API URL za testove (`backend/src/routes/testing.js`, default: `https://api.uslugar.eu`)

---

## ❓ Varijable koje možda NE koriste se (potrebno provjeriti)

### **1. SUDREG API** (Provjeri da li se koristi)
- ❓ `SUDREG_CLIENT_ID` - Nije pronađeno u kodu (možda nije implementirano)
- ❓ `SUDREG_CLIENT_SECRET` - Nije pronađeno u kodu (možda nije implementirano)

### **2. AWS S3** (Provjeri da li se koristi)
- ❓ `AWS_S3_BUCKET_NAME` - Nije pronađeno u kodu (možda nije implementirano)
- ❓ `AWS_REGION` - Nije pronađeno u kodu (možda nije implementirano)
- ❓ `AWS_ACCESS_KEY_ID` - Nije pronađeno u kodu (možda nije implementirano)
- ❓ `AWS_SECRET_ACCESS_KEY` - Nije pronađeno u kodu (možda nije implementirano)

### **3. Fiscalization (eRačun)** (Provjeri da li se koristi)
- ❓ `FISCALIZATION_ENABLED` - Nije pronađeno u kodu (možda nije implementirano)
- ❓ `ERACUN_API_URL` - Nije pronađeno u kodu (možda nije implementirano)
- ❓ `ERACUN_API_KEY` - Nije pronađeno u kodu (možda nije implementirano)
- ❓ `COMPANY_OIB` - Nije pronađeno u kodu (možda nije implementirano)
- ❓ `COMPANY_NAME` - Nije pronađeno u kodu (možda nije implementirano)
- ❓ `COMPANY_ADDRESS` - Nije pronađeno u kodu (možda nije implementirano)
- ❓ `COMPANY_DIRECTOR` - Nije pronađeno u kodu (možda nije implementirano)

---

## 🔍 Detaljna provjera korištenja

### Provjeri u kodu:
```bash
# SUDREG
grep -r "SUDREG" backend/src/

# AWS S3
grep -r "AWS" backend/src/
grep -r "S3" backend/src/

# Fiscalization
grep -r "FISCALIZATION" backend/src/
grep -r "ERACUN" backend/src/
grep -r "COMPANY_OIB\|COMPANY_NAME\|COMPANY_ADDRESS\|COMPANY_DIRECTOR" backend/src/
```

---

## 📋 Preporuke za Render.com

### **Varijable koje DEFINITIVNO trebaju biti na Render.com:**

1. ✅ `NODE_ENV=production`
2. ✅ `PORT` (Render automatski postavlja, ali možeš eksplicitno)
3. ✅ `DATABASE_URL` (iz Render PostgreSQL add-on)
4. ✅ `JWT_SECRET`
5. ✅ `CORS_ORIGINS`
6. ✅ `FRONTEND_URL`
7. ✅ `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
8. ✅ `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (ako koristiš push notifications)

### **Varijable koje su OPCIONALNE:**

9. ✅ `TEST_STRIPE_SECRET_KEY`, `TEST_STRIPE_PUBLISHABLE_KEY`, `TEST_STRIPE_WEBHOOK_SECRET` (ako koristiš Stripe)
10. ✅ `TEST_TWILIO_ACCOUNT_SID`, `TEST_TWILIO_AUTH_TOKEN`, `TEST_TWILIO_PHONE_NUMBER` (ako koristiš Twilio)
11. ✅ `OPENAI_API_KEY` (ako koristiš AI moderaciju)
12. ✅ `API_URL` (za testove)
13. ✅ `CLIENT_URL` (ako se koristi umjesto FRONTEND_URL)

### **Varijable koje MOGU biti NEPOTREBNE:**

14. ❓ `SUDREG_CLIENT_ID`, `SUDREG_CLIENT_SECRET` - **Provjeri da li se koriste!**
15. ❓ `AWS_S3_BUCKET_NAME`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - **Provjeri da li se koriste!**
16. ❓ `FISCALIZATION_ENABLED`, `ERACUN_API_URL`, `ERACUN_API_KEY`, `COMPANY_*` - **Provjeri da li se koriste!**

---

## ✅ Akcija: Provjeri na Render.com

### Korak 1: Otvori Render Dashboard

1. Idi na: https://dashboard.render.com/
2. Otvori Backend Service
3. Idi na **Environment** tab

### Korak 2: Provjeri svaku varijablu

Za svaku varijablu na Render.com provjeri:
1. ✅ Postoji li u gornjoj listi "koristi se"?
2. ❓ Ako ne postoji, provjeri da li je u listi "možda ne koristi"
3. 🗑️ Ako nije ni u jednoj listi, možda je nepotrebna

### Korak 3: Obriši nepotrebne varijable

Ako si siguran da varijabla ne koristi se:
1. Klikni na varijablu
2. Klikni **Delete** ili **Remove**
3. **Save Changes**
4. Redeploy backend (Render automatski redeploy-uje nakon brisanja varijable)

---

## 🧪 Testiranje nakon brisanja

Nakon brisanja varijabli:
1. **Provjeri backend logove** - traži greške vezane uz nedostajuće varijable
2. **Testiraj funkcionalnost:**
   - Email slanje
   - Stripe payments (ako koristiš)
   - Twilio SMS (ako koristiš)
   - Push notifications (ako koristiš)
   - AI moderacija (ako koristiš)

---

## 📝 Checklist za čišćenje

- [ ] Provjerena svaka varijabla na Render.com
- [ ] Identificirane varijable koje se ne koriste
- [ ] Obrisane nepotrebne varijable (ako si siguran)
- [ ] Testiran backend nakon brisanja
- [ ] Provjereni logovi za greške
- [ ] Dokumentirane promjene

---

**Napomena:** Ako nisi siguran za neku varijablu, **NE briši ju**! Bolje je ostaviti nepotrebnu varijablu nego obrisati nešto što se koristi.

