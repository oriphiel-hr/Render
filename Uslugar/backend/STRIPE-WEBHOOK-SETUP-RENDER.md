# 🔐 Stripe Webhook Secret Setup - Render Deployment

## 🎯 Tvoj Render URL
```
https://uslugar.onrender.com
```

---

## 📋 Korak po Korak - Kreiraj Webhook i Dobij Secret

### **1. Otvori Stripe Dashboard (TEST MODE)**

Idi na: https://dashboard.stripe.com/test/webhooks

⚠️ **VAŽNO**: Provjeri da si u **Test mode** (toggle gore desno treba biti **ON** - zeleno)

### **2. Kreiraj Novi Webhook Endpoint**

1. Klikni **"+ Add endpoint"** ili **"Add endpoint"** gumb
2. U polje **"Endpoint URL"** unesi:
   ```
   https://uslugar.onrender.com/api/payments/webhook
   ```
   (Ovo je tvoj Render backend URL + webhook endpoint)

### **3. Odaberi Events koje želiš slušati**

Klikni **"Select events"** i odaberi ove evente:

**Minimalno potrebni:**
- ✅ `checkout.session.completed` - Kada korisnik završi checkout
- ✅ `invoice.payment_succeeded` - Kada se uspješno naplati pretplata
- ✅ `invoice.payment_failed` - Kada plaćanje ne uspije

**Opcijalno (korisno za debugging):**
- ✅ `payment_intent.succeeded` - Kada je Payment Intent uspješan
- ✅ `payment_intent.payment_failed` - Kada Payment Intent ne uspije

**Ili odaberi:**
- **"Select all events"** - prima sve evente (korisno za testiranje)

Klikni **"Add events"**

### **4. Kreiraj Webhook**

1. Klikni **"Add endpoint"** ili **"Create endpoint"**
2. Stripe će kreirati webhook endpoint
3. Stripe će automatski generirati **Signing secret**

### **5. Kopiraj Signing Secret (TEST_STRIPE_WEBHOOK_SECRET)**

1. Nakon kreiranja webhook-a, otvori detalje webhook-a (klikni na webhook u listi)
2. Pronađi sekciju **"Signing secret"**
3. Klikni **"Reveal"** (ili **"Click to reveal"**) da otkriješ secret
4. Kopiraj secret (počinje sa `whsec_...`)
   - Primjer: `whsec_1234567890abcdefghijklmnopqrstuvwxyz...`

### **6. Dodaj u Render Dashboard Environment Variables**

1. **Render Dashboard** → Tvoj Service (`uslugar-backend`) → **Environment**
2. Klikni **"Add Environment Variable"**
3. **Key**: `TEST_STRIPE_WEBHOOK_SECRET`
4. **Value**: `whsec_...` (secret koji si kopirao)
5. Klikni **"Save Changes"**

**ILI** ako koristiš "Add from .env":
- Dodaj u `.env` datoteku:
  ```env
  TEST_STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz...
  ```
- Zatim kopiraj cijeli sadržaj `.env` u Render Dashboard → Environment → "Add from .env"

### **7. Restart Render Service**

Nakon dodavanja environment varijable:
1. Render Dashboard → Tvoj Service → **Manual Deploy** → **Deploy latest commit**
2. Ili čekaj automatski redeploy (ako je auto-deploy uključen)

---

## 🔍 Gdje Pronaći Signing Secret (Detaljno)

### **Lokacija u Stripe Dashboard:**

1. **Developers** → **Webhooks** (lijevo u sidebaru)
2. Klikni na **webhook endpoint** koji si upravo kreirao
3. U detaljima webhook-a, skrolaj dolje do sekcije **"Signing secret"**
4. Klikni **"Reveal"** (ako je sakriveno)
5. Kopiraj vrijednost (obično je 64+ karaktera, počinje sa `whsec_`)

### **Screenshot Opis:**

```
Stripe Dashboard
├── Developers (lijevo sidebar)
│   └── Webhooks
│       └── [Tvoj Webhook Endpoint] ← Klikni ovdje
│           └── Signing secret
│               └── [Reveal] ← Klikni da otkriješ
│                   └── whsec_... ← Kopiraj ovo
```

---

## ⚠️ Važne Napomene

### **1. Test Mode vs Live Mode**
- **Test Mode**: Webhook secret za test mode počinje sa `whsec_...` (obično)
- **Live Mode**: Webhook secret za production počinje sa `whsec_live_...`
- ⚠️ **NE miješaj Test i Live secrets!**
- Za Render deployment, koristi **Test Mode** secret (`TEST_STRIPE_WEBHOOK_SECRET`)

### **2. Različit Secret za Svaki Webhook**
- Svaki webhook endpoint ima **svoj jedinstveni Signing secret**
- Ako promijeniš webhook URL ili ga obrišeš i kreiraš novi, secret će biti **drugačiji**
- Ako koristiš više webhook endpoint-a, svaki ima svoj secret

### **3. Webhook Secret se NE mijenja**
- Signing secret ostaje **isti** za određeni webhook endpoint
- Ako izgubiš secret, **ne možeš ga ponovno dobiti** - moraš kreirati novi webhook
- Zato **spremi secret odmah** nakon kreiranja webhook-a!

### **4. Webhook URL Mora Biti Dostupan**
- Stripe će pokušati poslati test webhook nakon kreiranja
- Ako Render servis nije pokrenut ili nije dostupan, webhook će biti "pending"
- To je OK - webhook će biti poslan kada servis bude dostupan

---

## 🧪 Testiranje Webhook-a

### **1. Test Webhook iz Stripe Dashboard:**

1. Stripe Dashboard → **Webhooks** → klikni na tvoj webhook
2. Klikni **"Send test webhook"**
3. Odaberi event (npr. `checkout.session.completed`)
4. Klikni **"Send test webhook"**
5. Provjeri Render logs - trebao bi vidjeti:
   ```
   [PAYMENT] Subscription activated for user ...
   ```

### **2. Provjera Render Logs:**

1. **Render Dashboard** → Tvoj Service → **Logs**
2. Provjeri da li webhook dolazi i obrađuje se
3. Traži poruke tipa:
   - `[PAYMENT] Subscription activated`
   - `[PAYMENT] Webhook received`
   - `[PAYMENT] Stripe webhook processed`

### **3. Provjera da Webhook Radi:**

```bash
# Testiraj webhook endpoint direktno (ako imaš curl)
curl -X POST https://uslugar.onrender.com/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Očekivani odgovor:** Greška (jer nema Stripe signature), ali endpoint bi trebao biti dostupan.

---

## 🆘 Troubleshooting

### **Problem: "Webhook signature verification failed"**

**Uzrok:** `TEST_STRIPE_WEBHOOK_SECRET` nije točan ili nije postavljen

**Rješenje:**
1. ✅ Provjeri da `TEST_STRIPE_WEBHOOK_SECRET` je točan (kopiraj iz Stripe Dashboard-a)
2. ✅ Provjeri da koristiš **Test mode secret** u test mode-u (ne Live mode secret)
3. ✅ Provjeri da webhook URL odgovara tvom Render servisu (`https://uslugar.onrender.com/api/payments/webhook`)
4. ✅ Restart Render servis nakon dodavanja environment varijable

### **Problem: "Webhook endpoint not found"**

**Uzrok:** Render servis nije pokrenut ili endpoint nije implementiran

**Rješenje:**
1. ✅ Provjeri da Render servis radi (Render Dashboard → Status)
2. ✅ Provjeri da je `/api/payments/webhook` endpoint implementiran u `src/routes/payments.js`
3. ✅ Provjeri CORS postavke (Render servis mora primati POST zahtjeve od Stripe-a)
4. ✅ Provjeri da je `src` direktorij push-an u Git i dostupan Render-u

### **Problem: "Webhook secret not found in environment"**

**Uzrok:** Environment varijabla nije postavljena u Render Dashboard-u

**Rješenje:**
1. ✅ Render Dashboard → Environment → Provjeri da `TEST_STRIPE_WEBHOOK_SECRET` postoji
2. ✅ Provjeri da je vrijednost točna (bez razmaka, bez navodnika)
3. ✅ Restart Render servis nakon dodavanja varijable

---

## 📝 Checklist

- [ ] Stripe Dashboard otvoren u **Test mode**
- [ ] Webhook endpoint kreiran u **Developers** → **Webhooks**
- [ ] Webhook URL postavljen: `https://uslugar.onrender.com/api/payments/webhook`
- [ ] Events odabrani (`checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`)
- [ ] **Signing secret** kopiran (kliknuo "Reveal")
- [ ] `TEST_STRIPE_WEBHOOK_SECRET` dodan u Render Dashboard → Environment
- [ ] Render servis restart-an (nakon dodavanja varijable)
- [ ] Test webhook poslan iz Stripe Dashboard-a
- [ ] Render logs pokazuju da webhook dolazi i obrađuje se

---

## ✅ Konačna Provjera

Nakon što sve postaviš:

1. **Stripe Dashboard** → **Webhooks** → Tvoj webhook → **"Send test webhook"**
2. Odaberi event: `checkout.session.completed`
3. Klikni **"Send test webhook"**
4. **Render Dashboard** → **Logs** → Provjeri da li se webhook obrađuje

**Očekivani output u Render logs:**
```
[PAYMENT] Webhook received: checkout.session.completed
[PAYMENT] Subscription activated for user ...
```

---

## 🎯 Sažetak

1. **Stripe Dashboard** → **Developers** → **Webhooks** → **"+ Add endpoint"**
2. **Endpoint URL**: `https://uslugar.onrender.com/api/payments/webhook`
3. **Events**: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`
4. **Kreiraj webhook** → **Kopiraj Signing secret** (klikni "Reveal")
5. **Render Dashboard** → **Environment** → Dodaj `TEST_STRIPE_WEBHOOK_SECRET=whsec_...`
6. **Restart Render servis**
7. **Testiraj** webhook iz Stripe Dashboard-a

**Gotovo!** 🎉

