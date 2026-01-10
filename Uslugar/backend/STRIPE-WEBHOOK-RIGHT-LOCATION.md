# 🔐 Stripe Webhook Setup - Gdje je "Select All"?

## ⚠️ VAŽNO: Si u Pravom Mjestu?

Izgleda da si u **"Workbench"** sekciji - to je za **pregledanje** eventa koji su se već dogodili, **NISU** za kreiranje webhook-a!

---

## ✅ Pravi Put - Developers → Event Destinations

### **1. Idi na Developers Sekciju**

**NE idi na "Workbench" ili "Home"!**

**Idi na:**
- **"Developers"** (lijevo u sidebaru) ili
- Direktno: https://dashboard.stripe.com/test/event-destinations

### **2. Event Destinations (NOVI Interface)**

Stripe je promijenio interface - sada se koristi **"Event Destinations"** umjesto starog "Webhooks".

**Lokacija:**
```
Stripe Dashboard (Test Mode)
├── Developers (lijevo sidebar)
│   ├── API keys
│   ├── Webhooks (STARI interface - možda još postoji)
│   └── Event destinations (NOVI interface) ← OVDJE!
```

### **3. Kreiraj Event Destination**

1. **Developers** → **Event destinations** (ili **Webhooks** ako postoji stari interface)
2. Klikni **"+ Add destination"** ili **"Create event destination"**
3. **ODABERI EVENTE** prije nego što možeš nastaviti

---

## 🎯 Kako Pronaći "Select All" ili "All Events"

### **Opcija 1: Traži "Select all" gumb**

U **"Select events"** sekciji:
- Gornji desni kut ekrana, ili
- Iznad liste eventa, ili
- Pored "Selected events: 0" broja

**Traži:**
- "Select all" gumb/checkbox
- "All events" gumb/checkbox
- Toggle switch za "All events"

### **Opcija 2: Ručno Odaberi Evente**

Ako ne vidiš "Select all" gumb:

1. **U polju "Find event by name or description"** unesi: `checkout`
2. Pronađi **"Checkout"** sekciju
3. Proširi sekciju (klikni na nju)
4. Označi checkbox pored: `checkout.session.completed`
5. Ponovi za:
   - `invoice` → `invoice.payment_succeeded`
   - `invoice` → `invoice.payment_failed`

---

## 📍 Alternativni Put - Stari Webhooks Interface

Ako novi "Event destinations" interface ne radi ili ne vidiš opcije, probaj **stari Webhooks interface**:

### **Direktna Putanja:**
```
https://dashboard.stripe.com/test/webhooks
```

**Ili:**
1. **Developers** → **Webhooks** (ako postoji u sidebaru)
2. Klikni **"+ Add endpoint"**
3. Upiši URL: `https://uslugar.onrender.com/api/payments/webhook`
4. Odaberi evente
5. Klikni **"Add endpoint"**

---

## 🔍 Gdje Točno Tražiti "Select All"

### **Lokacije gdje može biti:**

1. **Gornji desni kut** - pored "Selected events: 0"
2. **Iznad liste eventa** - prije početka liste sekcija
3. **Filter sekcija** - gdje piše "All events" vs "Selected events"
4. **Toggle switch** - možda ima toggle za "Select all events"

### **Ako Ne Vidiš "Select All":**

**Ručno odaberi ova 3 eventa (minimalno):**

1. U polju **"Find event by name or description"** unesi: `checkout`
   - Označi: `checkout.session.completed`

2. U polju **"Find event by name or description"** unesi: `invoice.payment`
   - Označi: `invoice.payment_succeeded`
   - Označi: `invoice.payment_failed`

3. Provjeri da vidiš **"Selected events: 3"** (ne "0")

4. Klikni **"Continue"**

---

## 🆘 Ako i Dalje Ne Možeš Pronaći

### **Problem: Ne vidim "Select all" gumb**

**Rješenje 1: Ručno Odaberi Minimalno 3 Eventa**
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Rješenje 2: Probaj Stari Webhooks Interface**
- Idi na: https://dashboard.stripe.com/test/webhooks
- Klikni "+ Add endpoint"
- Ovdje bi trebao imati jednostavniji interface

**Rješenje 3: Kontaktiraj Stripe Support**
- Možda je bug u novom interface-u
- Ili koristi Stripe CLI za lokalno testiranje

---

## ✅ Brzi Checklist

- [ ] ✅ Si u **Developers** → **Event destinations** (NE Workbench!)
- [ ] ✅ Kliknuo **"+ Add destination"** ili **"Create event destination"**
- [ ] ✅ U sekciji **"Select events"**
- [ ] ✅ **Odabrao najmanje 3 eventa** ili kliknuo "Select all" (ako postoji)
- [ ] ✅ Vidiš **"Selected events: 3+"** (ne "0")
- [ ] ✅ **"Continue"** gumb je aktivan

---

## 🎯 Ako Ništa Ne Radi - Koristi Stripe CLI

Za testiranje webhook-a lokalno, možeš koristiti Stripe CLI:

```bash
# Instaliraj Stripe CLI
# Windows: https://stripe.com/docs/stripe-cli

# Pokreni webhook forwarding
stripe listen --forward-to https://uslugar.onrender.com/api/payments/webhook

# Stripe CLI će automatski generirati webhook secret koji možeš koristiti
# Output će pokazati: whsec_...
```

Ovaj secret možeš koristiti za `TEST_STRIPE_WEBHOOK_SECRET` u Render Dashboard-u.

