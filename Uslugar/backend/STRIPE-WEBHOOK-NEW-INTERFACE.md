# 🔐 Stripe Webhook Setup - NOVI Interface (Event Destination)

## 📋 Korak po Korak - Novi Stripe Interface

### **1. Otvori Stripe Dashboard (TEST MODE)**
```
https://dashboard.stripe.com/test/webhooks
```
⚠️ **VAŽNO**: Provjeri da si u **Test mode** (toggle gore desno)

### **2. Klikni "Create an event destination"**

### **3. Select Events - OVO JE KLJUČNO!**

Stripe zahtijeva da **ODABEREŠ EVENTE** prije nego što možeš nastaviti.

#### **Traži ove evente:**

**1. Checkout Event:**
- U polju **"Find event by name or description"** unesi: `checkout`
- Pronađi **"Checkout"** sekciju
- Odaberi:
  - ✅ `checkout.session.completed` (KLJUČAN - kada korisnik završi checkout)

**2. Invoice Events:**
- U polju **"Find event by name or description"** unesi: `invoice`
- Pronađi **"Invoice"** sekciju
- Odaberi:
  - ✅ `invoice.payment_succeeded` (KLJUČAN - kada se pretplata naplati)
  - ✅ `invoice.payment_failed` (KLJUČAN - kada plaćanje ne uspije)

**3. Payment Intent Events (opcionalno, ali korisno):**
- U polju **"Find event by name or description"** unesi: `payment_intent`
- Pronađi **"Payment Intent"** sekciju
- Odaberi (opcionalno):
  - ✅ `payment_intent.succeeded` (za dodatno praćenje)
  - ✅ `payment_intent.payment_failed` (za dodatno praćenje)

---

## ✅ Minimalno Potrebni Eventi (3 eventa)

**MORAŠ odabrati najmanje:**
1. ✅ `checkout.session.completed`
2. ✅ `invoice.payment_succeeded`
3. ✅ `invoice.payment_failed`

**ILI možeš odabrati "All events" ako želiš primati sve evente (korisno za testiranje).**

---

## 📝 Detaljne Upute za Odabir Event-a

### **Kako Odabrati Evente:**

1. **U polju "Find event by name or description"** unesi naziv event-a (npr. `checkout`)
2. Stripe će prikazati relevantne sekcije
3. **Proširi sekciju** (npr. "Checkout") klikom na nju
4. **Označi checkbox** pored event-a koji želiš (npr. `checkout.session.completed`)
5. Ponovi za sve potrebne evente

### **Provjeri da si Odabrao Evente:**

Gore desno, pored **"Selected events"** bi trebao vidjeti broj (npr. **"3"** ili koliko si odabrao).

**Ako vidiš "Selected events: 0"**, znači da **NIJEDAN event nije odabran** - zato ne možeš kliknuti "Continue"!

---

## 🎯 Brzi Put - Odaberi "All events"

**Najbrži način (za testiranje):**

1. U sekciji **"Events"**, klikni **"All events"** (gumb/checkbox gore)
2. Ovo će automatski odabrati **SVE evente**
3. Tada ćeš moći kliknuti **"Continue"**

**Napomena:** "All events" je korisno za testiranje, ali za produkciju možda želiš odabrati samo potrebne evente.

---

## ✅ Nakon Odabira Event-a

1. **Provjeri da si odabrao evente** (gore desno bi trebao vidjeti "Selected events: 3" ili više)
2. Klikni **"Continue"** gumb (sada će biti aktivan)
3. Slijedi korake za konfiguraciju destination (webhook URL)

---

## 🔍 Ako Ne Možeš Pronaći Evente

### **Problem: Ne mogu pronaći `checkout.session.completed`**

**Rješenje:**
1. U polju **"Find event by name or description"** unesi: `checkout.session.completed` (cijeli naziv)
2. Stripe će automatski filtrirati i prikazati relevantne evente
3. Pronađi **"Checkout"** sekciju
4. Proširi sekciju i označi `checkout.session.completed`

### **Problem: Ne mogu pronaći invoice evente**

**Rješenje:**
1. U polju **"Find event by name or description"** unesi: `invoice.payment`
2. Pronađi **"Invoice"** sekciju (ima 17 eventa)
3. Proširi sekciju i označi:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

---

## 📋 Checklist - Što Odabrati

### **Minimalno Potrebno (3 eventa):**
- [ ] `checkout.session.completed` - Checkout sekcija
- [ ] `invoice.payment_succeeded` - Invoice sekcija
- [ ] `invoice.payment_failed` - Invoice sekcija

### **Preporučeno (5 eventa):**
- [ ] `checkout.session.completed` - Checkout sekcija
- [ ] `invoice.payment_succeeded` - Invoice sekcija
- [ ] `invoice.payment_failed` - Invoice sekcija
- [ ] `payment_intent.succeeded` - Payment Intent sekcija
- [ ] `payment_intent.payment_failed` - Payment Intent sekcija

### **Za Testiranje (Svi Eventi):**
- [ ] "All events" checkbox - Automatski odabire sve evente

---

## 🎯 Konačni Koraci Nakon Odabira Event-a

1. ✅ Odaberi **najmanje 3 eventa** (ili "All events")
2. ✅ Provjeri da vidiš **"Selected events: 3"** (ili više) gore desno
3. ✅ Klikni **"Continue"** (sada će biti aktivan)
4. ✅ Slijedi korake za konfiguraciju:
   - **Destination type**: Odaberi "Webhook endpoint" (ili slično)
   - **Endpoint URL**: `https://uslugar.onrender.com/api/payments/webhook`
   - **API version**: 2025-09-30.clover (ili najnovija verzija)
5. ✅ Klikni **"Create"** ili **"Add destination"**
6. ✅ **Kopiraj Signing secret** nakon kreiranja

---

## 🆘 Ako i Dalje Ne Može Kliknuti "Continue"

**Provjeri:**
1. ✅ Da si **odabrao najmanje 1 event** (ili "All events")
2. ✅ Da vidiš **"Selected events: 1+"** gore desno (ne "0")
3. ✅ Da si u **Test mode** (ne Live mode)
4. ✅ Da imaš **internet konekciju** (Stripe možda ne može sinkronizirati)

**Ako ništa od ovoga ne pomaže:**
- Pokušaj odabrati **"All events"** i klikni **"Continue"**
- Ili refresh stranicu (F5) i pokušaj ponovo

