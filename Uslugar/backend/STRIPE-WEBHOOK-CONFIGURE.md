# 🔐 Stripe Webhook Configuration - Render Deployment

## 📋 Kako Popuniti Formu

### **1. Destination name** (Obavezno)
```
uslugar-payment-webhook
```
**ILI:**
```
uslugar-render-backend
```
**ILI bilo što opisno:**
- Maksimalno 100 karaktera
- Koristi samo slova, brojeve i crtice (ne razmake)
- Primjer: `uslugar-production-webhook` ili `uslugar-payments-test`

### **2. Endpoint URL** (Obavezno - KLJUČNO!)

```
https://uslugar.onrender.com/api/payments/webhook
```

⚠️ **VAŽNO:**
- ✅ Koristi **HTTPS** (ne HTTP)
- ✅ URL mora biti **dostupan** (Render servis mora biti pokrenut)
- ✅ Putanja mora biti točna: `/api/payments/webhook`

### **3. Description** (Opcionalno, ali Preporučeno)

```
Payment webhook endpoint for Uslugar backend on Render. Handles checkout.session.completed, invoice.payment_succeeded, and invoice.payment_failed events.
```

**ILI kraće:**
```
Uslugar payment processing webhook - handles Stripe checkout and invoice events
```

**ILI još kraće:**
```
Payment webhook for Uslugar backend
```

### **4. Events from** (Već Postavljeno)

✅ **"Your account"** - To je točno! (ne mijenjaj)

### **5. Payload style** (Već Postavljeno)

✅ **"Snapshot"** - To je točno! (ne mijenjaj)

### **6. API version** (Već Postavljeno)

✅ **"2025-09-30.clover"** - To je točno! (ne mijenjaj)

### **7. Listening to** (Već Postavljeno)

✅ **"3 events"** - To je točno! (odabrao si checkout.session.completed, invoice.payment_succeeded, invoice.payment_failed)

---

## ✅ Primjer Popunjene Forme

### **Destination name:**
```
uslugar-payment-webhook
```

### **Endpoint URL:**
```
https://uslugar.onrender.com/api/payments/webhook
```

### **Description:**
```
Payment webhook endpoint for Uslugar backend. Handles checkout completion and invoice payment events for subscription management.
```

---

## 🔍 Provjera Prije Kreiranja

### **Provjeri da je URL Dostupan:**

Prije nego što klikneš **"Create"** ili **"Save"**, provjeri da Render servis radi:

```bash
# Testiraj da li endpoint odgovara
curl https://uslugar.onrender.com/api/payments/webhook
```

**Očekivani odgovor:**
- Greška je OK (jer nema Stripe signature)
- Bitno je da endpoint **odgovara** (ne 404 ili connection error)

### **Ako Render Servis Još Nije Pokrenut:**

Ako Render servis još nije deploy-an, možeš kreirati webhook sada, ali Stripe će pokušati poslati test webhook koji neće uspjeti dok servis ne bude pokrenut.

**To je OK!** - Webhook će biti "pending" dok servis ne bude dostupan.

---

## 📝 Koraci za Kreiranje

1. ✅ **Destination name**: `uslugar-payment-webhook`
2. ✅ **Endpoint URL**: `https://uslugar.onrender.com/api/payments/webhook`
3. ✅ **Description**: `Payment webhook for Uslugar backend` (ili bilo što opisno)
4. ✅ **Provjeri** da su svi ostali podaci točni (Events from, Payload style, API version, Listening to)
5. ✅ **Klikni "Create"** ili **"Add destination"** ili **"Save"** gumb

---

## 🔐 Nakon Kreiranja - Kopiraj Signing Secret

Nakon što kreiraš destination, Stripe će:

1. **Kreirati webhook endpoint**
2. **Automatski generirati Signing secret**
3. **Prikazati Signing secret** u detaljima destination-a

**Koraci:**
1. Nakon kreiranja, otvori detalje destination-a
2. Pronađi sekciju **"Signing secret"**
3. Klikni **"Reveal"** da otkriješ secret
4. Kopiraj secret (počinje sa `whsec_...`)
5. Dodaj u Render Dashboard kao `TEST_STRIPE_WEBHOOK_SECRET`

---

## ⚠️ Važne Napomene

### **1. Endpoint URL Mora Biti Dostupan**

Stripe će pokušati poslati **test webhook** nakon kreiranja:
- ✅ Ako Render servis radi → test webhook će uspjeti
- ⚠️ Ako Render servis nije pokrenut → webhook će biti "pending" (OK, možeš ga testirati kasnije)

### **2. HTTPS je Obavezan**

- ✅ `https://uslugar.onrender.com` - TOČNO (HTTPS)
- ❌ `http://uslugar.onrender.com` - POGREŠNO (HTTP)

### **3. Putanja Mora Biti Točna**

- ✅ `/api/payments/webhook` - TOČNO
- ❌ `/api/payment/webhook` - POGREŠNO (nema 's' u 'payment')
- ❌ `/payments/webhook` - POGREŠNO (nema '/api')

---

## 🧪 Testiranje Nakon Kreiranja

### **1. Provjeri u Stripe Dashboard:**

1. **Developers** → **Event destinations** (ili **Webhooks**)
2. Klikni na tvoj destination
3. Provjeri **Status**:
   - ✅ **"Active"** - Webhook je aktivan
   - ⚠️ **"Pending"** - Webhook čeka da servis bude dostupan (OK ako servis još nije deploy-an)

### **2. Test Webhook iz Stripe Dashboard:**

1. Klikni **"Send test webhook"** (ili slično)
2. Odaberi event: `checkout.session.completed`
3. Klikni **"Send test webhook"**
4. Provjeri Render logs - trebao bi vidjeti webhook event

### **3. Provjeri Render Logs:**

**Render Dashboard** → Tvoj Service → **Logs** → Traži:
```
[PAYMENT] Webhook received: checkout.session.completed
[PAYMENT] Subscription activated for user ...
```

---

## 🆘 Troubleshooting

### **Problem: "Invalid endpoint URL"**

**Uzrok:** URL nije u pravom formatu ili endpoint ne postoji

**Rješenje:**
1. ✅ Provjeri da URL počinje sa `https://`
2. ✅ Provjeri da nema razmaka u URL-u
3. ✅ Provjeri da je putanja točna: `/api/payments/webhook`
4. ✅ Provjeri da Render servis postoji (može biti i nije pokrenut - to je OK)

### **Problem: "Webhook endpoint not reachable"**

**Uzrok:** Render servis nije pokrenut ili nije dostupan

**Rješenje:**
1. ✅ Provjeri da Render servis postoji i da je deploy-an
2. ✅ Provjeri da Render servis nije u "Suspended" statusu
3. ✅ Ako servis još nije pokrenut, webhook će biti "pending" - to je OK!
4. ✅ Webhook će automatski biti poslan kada servis bude dostupan

### **Problem: "404 Not Found" kada Stripe šalje webhook**

**Uzrok:** Endpoint URL je pogrešan ili route nije implementiran

**Rješenje:**
1. ✅ Provjeri da je `/api/payments/webhook` route implementiran u `src/routes/payments.js`
2. ✅ Provjeri da je route registriran u `src/server.js`
3. ✅ Provjeri da Render servis koristi pravi `src` direktorij

---

## ✅ Finalni Koraci

1. ✅ Popuni formu (Destination name, Endpoint URL, Description)
2. ✅ Klikni **"Create"** ili **"Add destination"**
3. ✅ **Kopiraj Signing secret** nakon kreiranja
4. ✅ Dodaj `TEST_STRIPE_WEBHOOK_SECRET` u Render Dashboard
5. ✅ Restart Render servis (ako već radi)
6. ✅ Testiraj webhook iz Stripe Dashboard-a

---

## 📋 Popunjena Forma - Primjer

```
Destination name:     uslugar-payment-webhook
Endpoint URL:         https://uslugar.onrender.com/api/payments/webhook
Description:          Payment webhook for Uslugar backend - handles checkout and invoice events
Events from:          Your account ✓
Payload style:        Snapshot ✓
API version:          2025-09-30.clover ✓
Listening to:         3 events ✓
```

**Klikni "Create"!** 🚀

