# 🎯 Stripe Webhook Events - Što Odabrati

## ⚠️ Upozorenje: "Selecting a large number of events may cause poor performance"

Ovo je samo **upozorenje**, ne greška! Možeš nastaviti, ali:

### ✅ Preporučeno: Odaberi SAMO Potrebne Evente

**NE odaberi "All events"** - to će uzrokovati:
- ❌ Loše performanse
- ❌ Previše webhook zahtjeva (mnogi nisu potrebni)
- ❌ Više troškova (ako imaš rate limiting)
- ❌ Teže debugiranje

---

## ✅ Minimalno Potrebno: 3 Eventa

Za tvoj use case (payment processing), trebaju ti **SAMO 3 eventa**:

### **1. Checkout Event (1 event)**
- ✅ `checkout.session.completed`
  - Kada: Korisnik završi checkout i plaćanje uspije
  - Što radi: Aktivira pretplatu i dodaje kredite

### **2. Invoice Events (2 eventa)**
- ✅ `invoice.payment_succeeded`
  - Kada: Uspješna naplata pretplate (recurring payment)
  - Što radi: Obnavlja kredite za pretplatu
  
- ✅ `invoice.payment_failed`
  - Kada: Neuspješna naplata pretplate
  - Što radi: Obavještava korisnika i možda suspendira pretplatu

---

## 📋 Koraci - Odaberi Samo 3 Eventa

### **1. U polju "Find event by name or description"**

**Traži "checkout":**
- Unesi: `checkout`
- Pronađi **"Checkout"** sekciju (4 eventa)
- Proširi sekciju (klikni na nju)
- ✅ Označi: `checkout.session.completed`

**Traži "invoice":**
- Unesi: `invoice.payment`
- Pronađi **"Invoice"** sekciju (17 eventa)
- Proširi sekciju (klikni na nju)
- ✅ Označi: `invoice.payment_succeeded`
- ✅ Označi: `invoice.payment_failed`

### **2. Provjeri Selekciju**

Gore desno bi trebao vidjeti:
```
Selected events: 3
```

**Ako vidiš "3"**, sve je OK! Možeš kliknuti **"Continue"**.

### **3. Nastavi**

- Klikni **"Continue"** gumb (sada je aktivan)
- Slijedi korake za konfiguraciju destination URL-a

---

## 🎯 Ako Želiš "All Events" (Nije Preporučeno)

Ako i dalje želiš odabrati "All events" (ne preporučujem), možeš:

1. **Ignoriraj upozorenje** - to je samo savjet, ne greška
2. Klikni **"Continue"** ili **"Select all"**
3. Stripe će poslati upozorenje, ali možeš nastaviti

**Ali tvoj webhook handler će primati STO eventa koji nisu potrebni!**

---

## ✅ Preporučeno Rješenje

**Odaberi SAMO ova 3 eventa:**

1. ✅ `checkout.session.completed` - Checkout sekcija
2. ✅ `invoice.payment_succeeded` - Invoice sekcija  
3. ✅ `invoice.payment_failed` - Invoice sekcija

**Ukupno: 3 eventa** (ne 100+ eventa)

To je sve što ti treba za funkcionalnost plaćanja!

---

## 🔍 Ako Ne Možeš Pronaći Evente

### **Problem: Ne mogu pronaći "Checkout" sekciju**

**Rješenje:**
1. U polju **"Find event by name or description"** unesi: `checkout.session`
2. Stripe će filtrirati i prikazati relevantne evente
3. Pronađi **"Checkout"** sekciju
4. Proširi i označi `checkout.session.completed`

### **Problem: Ne mogu pronaći Invoice evente**

**Rješenje:**
1. U polju **"Find event by name or description"** unesi: `invoice.payment`
2. Pronađi **"Invoice"** sekciju (ima 17 eventa)
3. Proširi sekciju
4. Traži:
   - `invoice.payment_succeeded` (obično je negdje u sredini liste)
   - `invoice.payment_failed` (obično je odmah ispod payment_succeeded)

---

## 📝 Checklist - Što Odabrati

### **Minimalno Potrebno (3 eventa):**
- [ ] `checkout.session.completed` - Checkout sekcija
- [ ] `invoice.payment_succeeded` - Invoice sekcija
- [ ] `invoice.payment_failed` - Invoice sekcija

### **Preporučeno Dodatno (5 eventa) - Opcionalno:**
- [ ] `checkout.session.completed` - Checkout sekcija
- [ ] `invoice.payment_succeeded` - Invoice sekcija
- [ ] `invoice.payment_failed` - Invoice sekcija
- [ ] `payment_intent.succeeded` - Payment Intent sekcija (opcionalno)
- [ ] `payment_intent.payment_failed` - Payment Intent sekcija (opcionalno)

### **NE Odaberi (izbjegavaj):**
- ❌ "All events" - Previše eventa, loše performanse
- ❌ Sve Invoice evente - Trebaju ti samo payment eventi
- ❌ Sve Customer evente - Nisu potrebni za payment processing

---

## ✅ Konačni Korak

1. ✅ Odaberi **3 eventa** (minimalno potrebno)
2. ✅ Provjeri da vidiš **"Selected events: 3"** gore desno
3. ✅ Klikni **"Continue"** (ignoriraj upozorenje ako kaže da si odabrao previše - to je OK ako si odabrao samo 3!)
4. ✅ Slijedi korake za konfiguraciju:
   - **Destination type**: Webhook endpoint
   - **Endpoint URL**: `https://uslugar.onrender.com/api/payments/webhook`
   - **API version**: 2025-09-30.clover (ili najnovija)
5. ✅ Klikni **"Create"** ili **"Add destination"**
6. ✅ **Kopiraj Signing secret** nakon kreiranja

---

## 🎯 Sažetak

**NE klikni "Select all"** - odaberi SAMO 3 eventa:
- `checkout.session.completed`
- `invoice.payment_succeeded`  
- `invoice.payment_failed`

To je sve što ti treba! 🎉

