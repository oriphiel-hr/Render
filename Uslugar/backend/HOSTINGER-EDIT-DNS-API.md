# 🔧 Kako Urediti DNS Zapis za api.uslugar.eu u Hostinger-u

## ✅ Domena je Već Odabrana!

Vidim da si već u **DNS / Nameservers** sekciji za `uslugar.eu` domenu. **Domena je već odabrana** - svi DNS zapisi koje vidiš se odnose na `uslugar.eu`.

---

## ⚠️ Problem: Postojeći ALIAS Zapis

Vidim da već postoji DNS zapis za `api`:

```
Type: ALIAS
Name: api
Content: api.uslugar.eu.cdn.hstgr.net
TTL: 300
```

**Problem:** Ovaj zapis pokazuje na **Hostinger CDN**, ne na Render servis!

**Rješenje:** Trebaš **urediti** ovaj zapis da pokazuje na `uslugar.onrender.com`.

---

## 🔧 Korak po Korak - Uredi DNS Zapis

### **Opcija 1: Uredi Postojeći ALIAS Zapis (Preporučeno)**

1. **Pronađi postojeći zapis** u listi:
   ```
   ALIAS   api   0   api.uslugar.eu.cdn.hstgr.net   300
   ```

2. **Klikni "Edit"** gumb pored tog zapisa

3. **Promijeni vrijednosti:**
   - **Type**: Promijeni iz `ALIAS` u `CNAME` (ako je moguće)
   - **Name**: `api` (ostavi kako jest)
   - **Content** (ili "Points to"): Promijeni u `uslugar.onrender.com`
   - **TTL**: `3600` (ili `300` - kako želiš)

4. **Klikni "Save"** ili "Update"

### **Opcija 2: Obriši i Dodaj Novi CNAME Zapis**

Ako ne možeš promijeniti ALIAS u CNAME:

1. **Klikni "Delete"** pored postojećeg ALIAS zapisa za `api`
2. **Klikni "Add Record"** gumb
3. **Popuni formu:**
   - **Type**: `CNAME`
   - **Name**: `api`
   - **Content** (ili "Points to"): `uslugar.onrender.com`
   - **TTL**: `3600` (ili `300`)
4. **Klikni "Save"** ili "Add Record"

---

## 📋 Detaljne Upute za Edit

### **1. Pronađi Postojeći Zapis**

U listi DNS zapisa, pronadi:
```
ALIAS   api   0   api.uslugar.eu.cdn.hstgr.net   300
```

### **2. Klikni "Edit"**

Klikni **"Edit"** gumb pored tog zapisa.

### **3. Promijeni Vrijednosti**

**Forma će se otvoriti s postojećim vrijednostima:**

**Prije:**
```
Type: ALIAS
Name: api
Content: api.uslugar.eu.cdn.hstgr.net
TTL: 300
```

**Nakon (promijeni):**
```
Type: CNAME (ili ostavi ALIAS ako ne možeš promijeniti)
Name: api (ostavi kako jest)
Content: uslugar.onrender.com  ← PROMIJENI OVO!
TTL: 3600 (ili 300)
```

### **4. Save**

Klikni **"Save"** ili **"Update"** gumb.

---

## 📋 Detaljne Upute za Delete + Add

### **1. Obriši Postojeći Zapis**

1. Pronađi ALIAS zapis za `api`
2. Klikni **"Delete"** gumb
3. Potvrdi brisanje

### **2. Dodaj Novi CNAME Zapis**

1. Klikni **"Add Record"** gumb (gore u listi)
2. **Type**: Odaberi **CNAME** (iz padajuće liste)
3. **Name**: Unesi `api`
4. **Content** (ili "Points to"): Unesi `uslugar.onrender.com`
5. **TTL**: `3600` (ili `300`)
6. Klikni **"Save"** ili **"Add Record"**

---

## ✅ Konačni Rezultat

**Nakon uređivanja, trebao bi vidjeti:**

```
Type    Name    Content                      TTL
----    ----    -------                      ---
CNAME   api     uslugar.onrender.com        3600
```

**ILI ako ostaviš ALIAS:**

```
Type    Name    Content                      TTL
----    ----    -------                      ---
ALIAS   api     uslugar.onrender.com        3600
```

**Oba će raditi** - CNAME je preporučen, ali ALIAS također radi za subdomain-e.

---

## 🔍 Provjera Nakon Promjene

### **1. Provjeri u Hostinger DNS Listi**

Nakon save-a, provjeri da zapis sada pokazuje na Render:
```
CNAME   api     uslugar.onrender.com        3600
```

### **2. Provjeri DNS Propagaciju (Nakon 1-4 sata)**

```bash
# Provjeri CNAME
nslookup api.uslugar.eu

# Očekivani output:
# api.uslugar.eu canonical name = uslugar.onrender.com
```

**ILI online:**
- https://dnschecker.org
- Unesi: `api.uslugar.eu`
- Provjeri da CNAME pokazuje na `uslugar.onrender.com`

### **3. Testiraj API Endpoint**

```bash
# Testiraj API
curl https://api.uslugar.eu/api/health

# Očekivani odgovor: 200 OK
```

---

## ⚠️ Važne Napomene

### **1. ALIAS vs CNAME**

**ALIAS:**
- Hostinger specifičan tip zapisa
- Radi za root domain i subdomain-e
- **Može** pokazivati na vanjski servis (Render)

**CNAME:**
- Standardni DNS tip zapisa
- Radi za subdomain-e (ne root domain)
- **Može** pokazivati na vanjski servis (Render)

**Oba će raditi** za `api.uslugar.eu` subdomain!

### **2. TTL (Time To Live)**

**TTL = Koliko dugo DNS server cache-ira zapis:**
- `300` = 5 minuta (brže promjene, ali više DNS upita)
- `3600` = 1 sat (sporije promjene, ali manje DNS upita)
- Preporučeno: `3600` za production

### **3. DNS Propagacija**

**Nakon promjene:**
- DNS propagacija može trajati **1-4 sata**
- Stari zapis (`api.uslugar.eu.cdn.hstgr.net`) može biti cache-iran
- Čekaj DNS propagaciju prije testiranja

---

## 📋 Checklist

- [ ] Pronađen postojeći ALIAS zapis za `api`
- [ ] Kliknuo "Edit" (ili "Delete" + "Add Record")
- [ ] Promijenio **Content** iz `api.uslugar.eu.cdn.hstgr.net` u `uslugar.onrender.com`
- [ ] Promijenio **Type** u `CNAME` (ako je moguće)
- [ ] Postavio **TTL** na `3600` (ili `300`)
- [ ] Kliknuo "Save" ili "Update"
- [ ] Provjerio da zapis sada pokazuje na `uslugar.onrender.com`
- [ ] Čekao DNS propagaciju (1-4 sata)
- [ ] Testirao: `https://api.uslugar.eu/api/health`

---

## 🆘 Troubleshooting

### **Problem: Ne Mogu Promijeniti Type iz ALIAS u CNAME**

**Rješenje:**
1. ✅ **Obriši** ALIAS zapis
2. ✅ **Dodaj novi** CNAME zapis
3. ✅ ALIAS također radi - možeš ostaviti ALIAS ako ne možeš promijeniti

### **Problem: "Edit" Gumb Ne Radi**

**Rješenje:**
1. ✅ **Obriši** postojeći zapis
2. ✅ **Dodaj novi** CNAME zapis
3. ✅ Rezultat je isti

### **Problem: DNS Još Uvijek Pokazuje na Hostinger CDN**

**Uzrok:** DNS propagacija još nije završena ili cache

**Rješenje:**
1. ✅ Čekaj DNS propagaciju (1-4 sata)
2. ✅ Provjeri DNS propagaciju na https://dnschecker.org
3. ✅ Očisti DNS cache na svom računalu:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac/Linux
   sudo dscacheutil -flushcache
   ```

---

## ✅ Konačni Koraci

1. ✅ **Pronađi** ALIAS zapis za `api` u DNS listi
2. ✅ **Klikni "Edit"** (ili "Delete" + "Add Record")
3. ✅ **Promijeni Content** u `uslugar.onrender.com`
4. ✅ **Save**
5. ✅ **Čekaj DNS propagaciju** (1-4 sata)
6. ✅ **Testiraj**: `https://api.uslugar.eu/api/health`

**Gotovo!** 🎉 `api.uslugar.eu` sada pokazuje na Render servis!

