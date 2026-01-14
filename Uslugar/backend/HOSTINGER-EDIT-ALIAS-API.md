# 🔧 Kako Urediti ALIAS Zapis za api.uslugar.eu

## ✅ Odgovor: NE BRIŠI - UREDI!

**Ne briši postojeći ALIAS zapis!** Umjesto toga, **uredi ga** i promijeni vrijednost da pokazuje na Render servis.

---

## 🎯 Zašto Urediti Umjesto Brisanja?

### **Prednosti Uređivanja:**
- ✅ **Brže** - samo promijeniš jednu vrijednost
- ✅ **Jednostavnije** - ne moraš dodavati novi zapis
- ✅ **Zadržava TTL** - možeš zadržati postojeći TTL
- ✅ **Manje grešaka** - ne možeš zaboraviti dodati zapis

### **Ako Obrišeš:**
- ⚠️ Morat ćeš dodati novi zapis
- ⚠️ Možeš zaboraviti dodati zapis
- ⚠️ DNS propagacija može biti sporija (ako imaš različite TTL vrijednosti)

---

## 🔧 Korak po Korak - Uredi ALIAS Zapis

### **1. Pronađi Postojeći ALIAS Zapis**

U DNS listi, pronadi:
```
ALIAS   api   0   api.uslugar.eu.cdn.hstgr.net   300
```

### **2. Klikni "Edit"**

Klikni **"Edit"** gumb pored tog zapisa.

### **3. Promijeni Vrijednost**

**Forma će se otvoriti s postojećim vrijednostima:**

**Prije (trenutno):**
```
Type: ALIAS
Name: api
Content: api.uslugar.eu.cdn.hstgr.net  ← Ovo je Hostinger CDN
TTL: 300
```

**Nakon (promijeni):**
```
Type: ALIAS (ostavi kako jest - ALIAS radi za subdomain-e)
Name: api (ostavi kako jest)
Content: uslugar.onrender.com  ← PROMIJENI OVO!
TTL: 3600 (ili ostavi 300 - kako želiš)
```

### **4. Save**

Klikni **"Save"** ili **"Update"** gumb.

---

## 📋 Detaljne Upute

### **Korak 1: Pronađi Zapis**

U DNS listi, scroll do zapisa:
```
Type    Name    Priority    Content                          TTL
----    ----    --------    -------                          ---
ALIAS   api     0           api.uslugar.eu.cdn.hstgr.net     300
```

### **Korak 2: Klikni Edit**

Klikni **"Edit"** gumb u redu s tim zapisom.

### **Korak 3: Promijeni Content**

**U formi koja se otvori:**

1. **Type**: `ALIAS` (ostavi kako jest - ne moraš mijenjati)
2. **Name**: `api` (ostavi kako jest - ne moraš mijenjati)
3. **Content** (ili "Points to"): 
   - **Stara vrijednost**: `api.uslugar.eu.cdn.hstgr.net`
   - **Nova vrijednost**: `uslugar.onrender.com` ← **PROMIJENI OVO!**
4. **TTL**: 
   - Možeš ostaviti `300` (5 minuta)
   - ILI promijeniti u `3600` (1 sat - preporučeno za production)

### **Korak 4: Save**

Klikni **"Save"** ili **"Update"** gumb.

---

## ✅ Konačni Rezultat

**Nakon uređivanja, trebao bi vidjeti:**

```
Type    Name    Priority    Content                      TTL
----    ----    --------    -------                      ---
ALIAS   api     0           uslugar.onrender.com         3600
```

**Sada `api.uslugar.eu` pokazuje na Render servis!** ✅

---

## 🔄 Alternativno: Obriši i Dodaj Novi (Ako Edit Ne Radi)

**Ako "Edit" gumb ne radi ili ne možeš promijeniti vrijednost:**

### **1. Obriši Postojeći Zapis**

1. Pronađi ALIAS zapis za `api`
2. Klikni **"Delete"** gumb
3. Potvrdi brisanje

### **2. Dodaj Novi CNAME Zapis**

1. Klikni **"Add Record"** gumb
2. **Type**: Odaberi `CNAME` (ili `ALIAS` ako je dostupno)
3. **Name**: Unesi `api`
4. **Content** (ili "Points to"): Unesi `uslugar.onrender.com`
5. **TTL**: `3600` (ili `300`)
6. Klikni **"Save"** ili **"Add Record"**

**Rezultat je isti** - `api.uslugar.eu` pokazuje na Render!

---

## ⚠️ Važne Napomene

### **1. ALIAS vs CNAME**

**ALIAS:**
- Hostinger specifičan tip zapisa
- Radi za root domain i subdomain-e
- **Može** pokazivati na vanjski servis (Render)
- **Možeš ostaviti ALIAS** - ne moraš mijenjati u CNAME

**CNAME:**
- Standardni DNS tip zapisa
- Radi za subdomain-e (ne root domain)
- **Može** pokazivati na vanjski servis (Render)

**Oba će raditi** za `api.uslugar.eu` subdomain!

### **2. TTL (Time To Live)**

**TTL = Koliko dugo DNS server cache-ira zapis:**
- `300` = 5 minuta (brže promjene, ali više DNS upita)
- `3600` = 1 sat (sporije promjene, ali manje DNS upita)
- **Preporučeno**: `3600` za production

### **3. DNS Propagacija**

**Nakon promjene:**
- DNS propagacija može trajati **1-4 sata**
- Stari zapis (`api.uslugar.eu.cdn.hstgr.net`) može biti cache-iran
- Čekaj DNS propagaciju prije testiranja

---

## 🔍 Provjera Nakon Promjene

### **1. Provjeri u Hostinger DNS Listi**

Nakon save-a, provjeri da zapis sada pokazuje na Render:
```
ALIAS   api     0   uslugar.onrender.com   3600
```

### **2. Provjeri DNS Propagaciju (Nakon 1-4 sata)**

```bash
# Provjeri CNAME/ALIAS
nslookup api.uslugar.eu

# Očekivani output:
# api.uslugar.eu canonical name = uslugar.onrender.com
```

**ILI online:**
- https://dnschecker.org
- Unesi: `api.uslugar.eu`
- Provjeri da CNAME/ALIAS pokazuje na `uslugar.onrender.com`

### **3. Testiraj API Endpoint**

```bash
# Testiraj API
curl https://api.uslugar.eu/api/health

# Očekivani odgovor: 200 OK
```

---

## 📋 Checklist

- [ ] Pronađen postojeći ALIAS zapis za `api`
- [ ] Kliknuo **"Edit"** (ne "Delete"!)
- [ ] Promijenio **Content** iz `api.uslugar.eu.cdn.hstgr.net` u `uslugar.onrender.com`
- [ ] Postavio **TTL** na `3600` (ili ostavio `300`)
- [ ] Kliknuo **"Save"** ili **"Update"**
- [ ] Provjerio da zapis sada pokazuje na `uslugar.onrender.com`
- [ ] Čekao DNS propagaciju (1-4 sata)
- [ ] Testirao: `https://api.uslugar.eu/api/health`

---

## 🆘 Troubleshooting

### **Problem: "Edit" Gumb Ne Radi**

**Rješenje:**
1. ✅ **Obriši** postojeći ALIAS zapis
2. ✅ **Dodaj novi** CNAME zapis
3. ✅ Rezultat je isti

### **Problem: Ne Mogu Promijeniti Content Vrijednost**

**Rješenje:**
1. ✅ **Obriši** postojeći zapis
2. ✅ **Dodaj novi** CNAME zapis s `uslugar.onrender.com`
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

## ✅ Konačni Odgovor

**Da li da obrišeš ALIAS zapis?**

**NE! Uredi ga:**

1. ✅ **Klikni "Edit"** na postojećem ALIAS zapisu
2. ✅ **Promijeni Content** u `uslugar.onrender.com`
3. ✅ **Save**
4. ✅ **Čekaj DNS propagaciju** (1-4 sata)
5. ✅ **Testiraj**: `https://api.uslugar.eu/api/health`

**Ako Edit ne radi:**
- ✅ **Obriši** postojeći zapis
- ✅ **Dodaj novi** CNAME zapis s `uslugar.onrender.com`

**Gotovo!** 🎉 `api.uslugar.eu` sada pokazuje na Render servis!

