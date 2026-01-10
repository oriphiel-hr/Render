# 🔐 Stripe Webhook Secret - Kako dobiti TEST_STRIPE_WEBHOOK_SECRET

## ⚠️ Važno
`STRIPE_WEBHOOK_SECRET` (ili `TEST_STRIPE_WEBHOOK_SECRET`) **NEMA** na API Keys stranici!
Webhook secret se generira **SAMO NAKON** što kreirate webhook endpoint u Stripe Dashboard-u.

---

## 📋 Korak po Korak - Kako dobiti Webhook Secret

### **1. Otvori Stripe Dashboard (TEST MODE)**
```
https://dashboard.stripe.com/test/webhooks
```
⚠️ **VAŽNO**: Provjeri da si u **Test mode** (toggle gore desno treba biti **ON** - zeleno)

### **2. Kreiraj Novi Webhook Endpoint (ili otvori postojeći)**

**Ako već imaš webhook:**
1. Klikni na postojeći webhook endpoint
2. Idi na "Signing secret" sekciju
3. Klikni "Reveal" (otkrije secret)
4. Kopiraj secret (počinje sa `whsec_...`)

**Ako trebaš kreirati novi webhook:**
1. Klikni **"+ Add endpoint"** ili **"Add endpoint"** gumb
2. U polje **"Endpoint URL"** unesi:
   ```
   https://uslugar-backend.onrender.com/api/payments/webhook
   ```
   (Ili URL tvog Render servisa - provjeri u Render Dashboard-u)

### **3. Odaberi Events koje želiš slušati**

Klikni **"Select events"** i odaberi:
- ✅ `checkout.session.completed` - Kada korisnik završi checkout
- ✅ `invoice.payment_succeeded` - Kada se uspješno naplati pretplata
- ✅ `invoice.payment_failed` - Kada plaćanje ne uspije
- ✅ `payment_intent.succeeded` - (opcionalno) Kada je Payment Intent uspješan
- ✅ `payment_intent.payment_failed` - (opcionalno) Kada Payment Intent ne uspije

**Ili odaberi:**
- **"Select all events"** - prima sve evente (korisno za testiranje)

Klikni **"Add events"**

### **4. Kreiraj Webhook**

1. Klikni **"Add endpoint"** ili **"Create endpoint"**
2. Stripe će kreirati webhook endpoint
3. Stripe će automatski generirati **Signing secret**

### **5. Kopiraj Signing Secret**

1. Nakon kreiranja webhook-a, otvori detalje webhook-a
2. Pronađi sekciju **"Signing secret"**
3. Klikni **"Reveal"** (ili **"Click to reveal"**) da otkriješ secret
4. Kopiraj secret (počinje sa `whsec_...`)
   - Primjer: `whsec_1234567890abcdefghijklmnopqrstuvwxyz...`

### **6. Dodaj u .env datoteku**

Dodaj u `.env` datoteku:
```env
TEST_STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz...
```

---

## 🔍 Gdje pronaći Signing Secret (detaljno)

### **Lokacija u Stripe Dashboard:**

1. **Developers** → **Webhooks** (lijevo u sidebaru)
2. Klikni na **webhook endpoint** (lista webhook-a)
3. U detaljima webhook-a, skrolaj dolje do sekcije **"Signing secret"**
4. Klikni **"Reveal"** (ako je sakriveno)
5. Kopiraj vrijednost (obično je 64+ karaktera, počinje sa `whsec_`)

### **Alternativno - Test Webhook Endpoint:**

Ako želiš testirati webhook bez stvarnog endpoint-a:
1. Stripe Dashboard → **Developers** → **Webhooks**
2. Klikni **"+ Add endpoint"**
3. Unesi **dummy URL** (npr. `https://example.com/webhook`)
4. Odaberi evente
5. Klikni **"Add endpoint"**
6. **Signing secret** će biti generiran i vidljiv čak iako endpoint ne postoji
7. Kopiraj secret i koristi ga u `.env` datoteci

---

## ⚠️ Važne Napomene

### **1. Test Mode vs Live Mode**
- **Test Mode**: Webhook secret za test mode počinje sa `whsec_test_...` ili `whsec_...`
- **Live Mode**: Webhook secret za production počinje sa `whsec_live_...`
- ⚠️ **NE miješaj Test i Live secrets!**

### **2. Različit Secret za Svaki Webhook**
- Svaki webhook endpoint ima **svoj jedinstveni Signing secret**
- Ako promijeniš webhook URL ili ga obrišeš i kreiraš novi, secret će biti **drugačiji**
- Ako koristiš više webhook endpoint-a, svaki ima svoj secret

### **3. Webhook Secret se NE mijenja**
- Signing secret ostaje **isti** za određeni webhook endpoint
- Ako izgubiš secret, **ne možeš ga ponovno dobiti** - moraš kreirati novi webhook
- Zato **spremi secret odmah** nakon kreiranja webhook-a!

### **4. Testiranje Webhook-a Lokalno**

Za lokalno testiranje webhook-a:
1. Instaliraj Stripe CLI: `stripe listen --forward-to localhost:4000/api/payments/webhook`
2. Stripe CLI će automatski generirati **test webhook secret** koji možeš koristiti lokalno
3. Secret se prikazuje u konzoli: `whsec_...`

---

## 🧪 Provjera da Webhook Secret Radi

Nakon što dodaš `TEST_STRIPE_WEBHOOK_SECRET` u `.env`, testiraj webhook:

### **1. Test Webhook iz Stripe Dashboard:**

1. Stripe Dashboard → **Webhooks** → klikni na tvoj webhook
2. Klikni **"Send test webhook"**
3. Odaberi event (npr. `checkout.session.completed`)
4. Klikni **"Send test webhook"**
5. Provjeri backend logove - trebao bi vidjeti:
   ```
   [PAYMENT] Subscription activated for user ...
   ```

### **2. Provjera Backend Logova:**

```powershell
# Render logovi (ako koristiš Render)
# Render Dashboard → Logs → Provjeri da li webhook dolazi

# Ili lokalno (ako testiraš lokalno)
# Backend konzola bi trebala pokazati webhook event
```

### **3. Ako Webhook ne Radi:**

**Problem: "Webhook signature verification failed"**
- ✅ Provjeri da `TEST_STRIPE_WEBHOOK_SECRET` je točan (kopiraj iz Stripe Dashboard-a)
- ✅ Provjeri da koristiš **Test mode secret** u test mode-u (ne Live mode secret)
- ✅ Provjeri da webhook URL odgovara tvom Render servisu

**Problem: "Webhook endpoint not found"**
- ✅ Provjeri da Render servis radi i da je dostupan na URL-u
- ✅ Provjeri da je `/api/payments/webhook` endpoint implementiran
- ✅ Provjeri CORS postavke (Render servis mora primati POST zahtjeve od Stripe-a)

---

## 📝 Primjer .env Konfiguracije

```env
# Stripe Test Keys (iz API Keys stranice)
TEST_STRIPE_SECRET_KEY=sk_test_51SMU46EPit...
TEST_STRIPE_PUBLISHABLE_KEY=pk_test_51SMU46EPi...

# Stripe Webhook Secret (iz Webhooks sekcije, NAKON kreiranja webhook endpoint-a)
TEST_STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz...
```

---

## ✅ Checklist

- [ ] Stripe Dashboard otvoren u **Test mode**
- [ ] Webhook endpoint kreiran u **Developers** → **Webhooks**
- [ ] Webhook URL postavljen (npr. `https://uslugar-backend.onrender.com/api/payments/webhook`)
- [ ] Events odabrani (`checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`)
- [ ] **Signing secret** kopiran (kliknuo "Reveal")
- [ ] `TEST_STRIPE_WEBHOOK_SECRET` dodan u `.env` datoteku
- [ ] Test webhook poslan iz Stripe Dashboard-a
- [ ] Backend logovi pokazuju da webhook dolazi i obrađuje se

---

## 🆘 Pomagaj

**Ako i dalje ne možeš pronaći Signing Secret:**
1. Provjeri da si u **Test mode** (ne Live mode)
2. Provjeri da si kliknuo na **webhook endpoint** (ne samo na listu webhook-a)
3. Provjeri da si kliknuo **"Reveal"** da otkriješ secret
4. Ako secret nije vidljiv, webhook možda nije kreiran - kreiraj novi webhook endpoint

**Ako webhook endpoint ne postoji:**
- Kreiraj novi webhook endpoint (koraci gore)
- Stripe će automatski generirati Signing secret nakon kreiranja

