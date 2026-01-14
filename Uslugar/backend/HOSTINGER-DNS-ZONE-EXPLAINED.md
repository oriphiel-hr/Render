# 🔍 Kako Hostinger DNS Zna da "api" Se Odnosi na "uslugar.eu"

## ✅ Odgovor: DNS Zone Automatski Povezuje Subdomain s Root Domain-om

Kada dodaješ DNS zapis u Hostinger Control Panel-u, **odabereš domenu prvo** (`uslugar.eu`), a zatim dodaješ DNS zapise **unutar te DNS zone**. Hostinger automatski zna da svi zapisi u toj DNS zone se odnose na tu domenu.

---

## 🎯 Kako DNS Zone Radi

### **1. DNS Zone = Svi DNS Zapis za Jednu Domenu**

**DNS Zone za `uslugar.eu`:**
```
uslugar.eu (root domain)
├── @ (root domain) → A record → [IP adresa]
├── www → CNAME → uslugar.eu
├── api → CNAME → uslugar.onrender.com  ← Tvoj zapis
├── mail → MX record → mail server
└── ... (drugi subdomain-i)
```

**Kada dodaješ DNS zapis:**
- **Odabereš domenu**: `uslugar.eu` (DNS zone)
- **Dodaješ zapis**: `api` (subdomain)
- **Hostinger automatski zna**: `api` + `uslugar.eu` = `api.uslugar.eu`

---

## 📋 Korak po Korak u Hostinger Control Panel-u

### **1. Odaberi Domenu (DNS Zone)**

1. **Hostinger Control Panel** → **Domains**
2. Klikni na domenu: **`uslugar.eu`**
3. Sada si **unutar DNS zone** za `uslugar.eu`
4. Svi DNS zapisi koje dodaješ se **automatski odnose na `uslugar.eu`**

### **2. Dodaj DNS Zapis**

1. Idi na **"DNS"** ili **"DNS Zone Editor"** tab
2. Klikni **"Add Record"** ili **"+ Add"**
3. **Type**: CNAME
4. **Name**: `api` ← **Samo "api", ne "api.uslugar.eu"!**
5. **Value**: `uslugar.onrender.com`
6. **TTL**: 3600
7. **Save**

### **3. Hostinger Automatski Kombinira**

**Hostinger automatski zna:**
- **DNS Zone**: `uslugar.eu` (odabrana domena)
- **Name**: `api` (subdomain)
- **Kombinacija**: `api` + `uslugar.eu` = **`api.uslugar.eu`**

---

## 🔍 Kako DNS Zone Funkcionira

### **DNS Zone Struktura:**

```
DNS Zone: uslugar.eu
│
├── @ (ili prazno) → Root domain: uslugar.eu
├── www → Subdomain: www.uslugar.eu
├── api → Subdomain: api.uslugar.eu  ← Tvoj zapis
├── mail → Subdomain: mail.uslugar.eu
└── ftp → Subdomain: ftp.uslugar.eu
```

**Kada uneseš "api" u Name polje:**
- Hostinger automatski dodaje: `api` + `.uslugar.eu` = `api.uslugar.eu`
- **Ne moraš pisati** `api.uslugar.eu` - samo `api`!

---

## 📝 Primjer u Hostinger Control Panel-u

### **Kada Otvoriš DNS Zone Editor:**

**Domain:** `uslugar.eu` ← **Ovo je DNS Zone**

**DNS Records:**
```
Type    Name    Value                          TTL
----    ----    -----                          ---
A       @       [IP adresa]                    3600
CNAME   www     uslugar.eu                     3600
CNAME   api     uslugar.onrender.com           3600  ← Tvoj zapis
MX      @       mail.uslugar.eu                3600
```

**Kada uneseš:**
- **Name**: `api`
- **Hostinger automatski zna**: `api.uslugar.eu`

**Ne moraš pisati:**
- ❌ `api.uslugar.eu` (predugačko)
- ❌ `api.` (ne treba trailing dot)
- ✅ **Samo `api`** (Hostinger automatski dodaje `.uslugar.eu`)

---

## ⚠️ Važne Napomene

### **1. Name Polje = Samo Subdomain Naziv**

**U Hostinger DNS Zone Editor-u:**
- **Name**: `api` ← **Samo subdomain naziv**
- **NE**: `api.uslugar.eu` ← **Predugačko!**
- **NE**: `api.` ← **Ne treba trailing dot**

**Hostinger automatski dodaje root domain!**

### **2. Root Domain = @ ili Prazno**

**Za root domain (`uslugar.eu`):**
- **Name**: `@` (ili prazno)
- **Hostinger zna**: `@` = root domain = `uslugar.eu`

**Za subdomain (`api.uslugar.eu`):**
- **Name**: `api`
- **Hostinger zna**: `api` + `uslugar.eu` = `api.uslugar.eu`

### **3. DNS Zone = Kontekst**

**Kada si u DNS Zone Editor-u za `uslugar.eu`:**
- Svi zapisi se automatski odnose na `uslugar.eu`
- Ne moraš ponavljati domenu u svakom zapisu
- **Name polje** = samo subdomain naziv

---

## 🔍 Provjera u Hostinger Control Panel-u

### **Kako Provjeriti da je Zapis Točan:**

1. **Hostinger Control Panel** → **Domains** → `uslugar.eu`
2. **DNS Zone Editor**
3. Pronađi CNAME zapis za `api`
4. Trebao bi vidjeti:
   ```
   Type: CNAME
   Name: api
   Value: uslugar.onrender.com
   ```
5. **Hostinger automatski zna**: `api` = `api.uslugar.eu`

### **Kako Provjeriti da DNS Radi:**

**Nakon DNS propagacije (1-4 sata):**
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

---

## 📋 Checklist

### **Hostinger DNS Setup:**
- [ ] Prijavljen u Hostinger Control Panel
- [ ] **Odabrao domenu**: `uslugar.eu` (DNS Zone)
- [ ] Idi na **DNS Zone Editor** tab
- [ ] Dodao CNAME record:
  - **Type**: CNAME
  - **Name**: `api` ← **Samo "api", ne "api.uslugar.eu"!**
  - **Value**: `uslugar.onrender.com`
  - **TTL**: 3600
- [ ] Save
- [ ] Hostinger automatski zna: `api` = `api.uslugar.eu`

---

## 🎯 Sažetak

**Kako Hostinger zna da "api" se odnosi na "uslugar.eu"?**

1. ✅ **Odabereš domenu prvo**: `uslugar.eu` (DNS Zone)
2. ✅ **Dodaješ DNS zapis unutar te zone**: `api` (Name)
3. ✅ **Hostinger automatski kombinira**: `api` + `uslugar.eu` = `api.uslugar.eu`

**Ne moraš pisati:**
- ❌ `api.uslugar.eu` u Name polju (predugačko)
- ❌ `api.` (ne treba trailing dot)

**Samo:**
- ✅ `api` u Name polju
- ✅ Hostinger automatski dodaje `.uslugar.eu`

**DNS Zone = Kontekst** - svi zapisi u DNS zone se automatski odnose na tu domenu!

---

## 🔗 Kako DNS Zone Funkcionira Tehnički

### **DNS Zone File Format:**

```
; DNS Zone for uslugar.eu
$ORIGIN uslugar.eu.

@       IN  A       [IP adresa]
www     IN  CNAME   uslugar.eu.
api     IN  CNAME   uslugar.onrender.com.  ← Tvoj zapis
mail    IN  MX      10 mail.uslugar.eu.
```

**Kada uneseš "api" u Hostinger:**
- Hostinger automatski dodaje `$ORIGIN` (uslugar.eu)
- Rezultat: `api.uslugar.eu` → `uslugar.onrender.com`

**To je zašto ne moraš pisati puni naziv!**

---

## ✅ Konačni Odgovor

**Kako Hostinger zna da "api" se odnosi na "uslugar.eu"?**

**Odgovor:**
1. **Odabereš domenu**: `uslugar.eu` (DNS Zone)
2. **Dodaješ zapis**: `api` (Name)
3. **Hostinger automatski kombinira**: `api` + `uslugar.eu` = `api.uslugar.eu`

**DNS Zone = Kontekst** - svi zapisi se automatski odnose na odabranu domenu!

**Ne moraš pisati puni naziv** - samo subdomain naziv (`api`) je dovoljan!

