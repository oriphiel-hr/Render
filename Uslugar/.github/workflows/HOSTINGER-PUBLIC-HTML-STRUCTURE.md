# 🤔 Da Li Je Pametno Staviti u public_html/?

## ✅ Odgovor: DA, Ali Ovisi o Strukturi Hostinger Account-a

Za domenu `uslugar.eu`, `public_html/` je **obično ispravno mjesto**, ali treba provjeriti strukturu Hostinger hosting-a.

---

## 🎯 Kada Je `public_html/` Ispravno

### **Scenario 1: uslugar.eu je Glavna/Root Domenu**

Ako je `uslugar.eu` **glavna domena** na Hostinger account-u:

```
Hostinger Account
└── uslugar.eu (glavna domena)
    └── public_html/         ← Root folder za uslugar.eu
        ├── index.html       ← Frontend
        └── assets/
```

**✅ DA, `public_html/` je ispravno!**

### **Scenario 2: www.uslugar.eu i uslugar.eu Pokazuju na Isto**

Ako i `www.uslugar.eu` i `uslugar.eu` pokazuju na isti folder:

```
public_html/                 ← Oba domene koriste isti folder
├── index.html
└── assets/
```

**✅ DA, `public_html/` je ispravno!**

---

## ⚠️ Kada Možda Nije Ispravno

### **Scenario 3: Više Domena na Isto Account-u**

Ako imaš **više domena** na istom Hostinger account-u:

```
Hostinger Account
├── uslugar.eu (glavna domena)
│   └── public_html/         ← Root za uslugar.eu
└── druga-domena.com
    └── public_html/         ← Root za drugu domenu
```

**U ovom slučaju:**
- ✅ `public_html/` je ispravno za `uslugar.eu` (glavna domena)
- ⚠️ Druga domena ima svoj `public_html/` folder

### **Scenario 4: Subdomain Folder Struktura**

Ako Hostinger koristi subfolder strukturu:

```
public_html/
├── uslugar/                 ← Subfolder za uslugar.eu
│   ├── index.html
│   └── assets/
└── druga-domena/            ← Subfolder za drugu domenu
```

**U ovom slučaju:**
- ❌ `public_html/` nije ispravno
- ✅ `public_html/uslugar/` bi bilo ispravno

---

## 🔍 Kako Provjeriti Strukturu Hostinger Account-a

### **1. Provjeri u Hostinger Control Panel:**

1. **Hostinger Control Panel** → **Websites** → **Manage**
2. Klikni na `uslugar.eu` website
3. **File Manager** → Provjeri strukturu:
   - **Ako vidiš samo `public_html/`** → To je root folder za `uslugar.eu`
   - **Ako vidiš `public_html/uslugar/`** → Koristi subfolder strukturu

### **2. Provjeri Preko FTP:**

**FileZilla:**
- Connect na FTP: `194.5.156.10`
- Navigate do root-a
- **Provjeri strukturu:**
  - `/public_html/` → Root za glavnu domenu
  - `/domains/uslugar.eu/public_html/` → Specifičan folder za domenu
  - `/public_html/uslugar/` → Subfolder struktura

### **3. Provjeri Trenutni Sadržaj:**

**Ako `public_html/` već sadrži:**
- ✅ `index.html` (Hostinger default stranica) → `public_html/` je root
- ✅ Druge datoteke za `uslugar.eu` → `public_html/` je root
- ✅ Prazan folder → `public_html/` je root

**Ako `public_html/` sadrži:**
- ⚠️ Foldere za druge domene → Možda treba subfolder

---

## 📋 Preporučena Struktura

### **Opcija 1: Root Domain (Preporučeno)**

**Za `uslugar.eu` kao glavnu domenu:**

```
public_html/                 ← Root folder
├── index.html              ← Frontend
├── assets/                 ← Frontend assets
├── sw.js                   ← Service Worker
└── .htaccess               ← SPA routing
```

**GitHub Secret:**
```
HOSTINGER_SERVER_DIR=public_html/
```

**✅ Ovo je najčešće i najjednostavnije!**

### **Opcija 2: Subfolder (Ako Treba)**

**Ako Hostinger koristi subfolder strukturu:**

```
public_html/
└── uslugar/                ← Subfolder
    ├── index.html
    ├── assets/
    └── .htaccess
```

**GitHub Secret:**
```
HOSTINGER_SERVER_DIR=public_html/uslugar/
```

**⚠️ Koristi samo ako Hostinger zahtijeva subfolder!**

---

## ✅ Kako Odrediti Pravi Folder

### **Metoda 1: Provjeri Hostinger File Manager**

1. **Hostinger Control Panel** → **Websites** → `uslugar.eu`
2. **File Manager**
3. **Provjeri gdje se nalazi `index.html`** (ako postoji):
   - `public_html/index.html` → Koristi `public_html/`
   - `public_html/uslugar/index.html` → Koristi `public_html/uslugar/`

### **Metoda 2: Test Upload**

1. **Upload test fajl** (npr. `test.txt`) u `public_html/`
2. **Provjeri da li je dostupan** na `https://uslugar.eu/test.txt`
3. **Ako je dostupan** → `public_html/` je root folder ✅
4. **Ako nije dostupan** → Možda treba subfolder

### **Metoda 3: Provjeri DNS i Hosting**

1. **Provjeri da `uslugar.eu` pokazuje na Hostinger hosting** (ne samo DNS)
2. **Ako je hosting na Hostinger-u** → `public_html/` je root
3. **Ako je samo DNS** (pokazuje na Render) → Ne koristi `public_html/`

---

## 🎯 Preporuka za uslugar.eu

### **Za `uslugar.eu` Domenu:**

**Preporučeno:**
```
HOSTINGER_SERVER_DIR=public_html/
```

**Razlozi:**
- ✅ **Najjednostavnije** - root folder za domenu
- ✅ **Standardna struktura** - većina Hostinger account-a koristi ovo
- ✅ **Lako održavanje** - sve je u jednom folderu
- ✅ **Pravilno za root domain** - `uslugar.eu` koristi root folder

**Ako imaš više domena:**
- ✅ Svaka domena ima svoj `public_html/` folder
- ✅ Ili koristi subfolder strukturu (`public_html/uslugar/`)

---

## ⚠️ Važne Napomene

### **1. Root Domain vs Subdomain:**

**Za `uslugar.eu` (root domain):**
- ✅ `public_html/` - root folder (preporučeno)

**Za `www.uslugar.eu` (subdomain):**
- ✅ Također `public_html/` (ako `www` CNAME pokazuje na root domain)
- ✅ ILI `public_html/www/` (ako je subdomain folder)

**Za `api.uslugar.eu` (subdomain):**
- ✅ Ne koristi `public_html/` - pokazuje na Render servis (DNS CNAME)

### **2. Više Domena na Isto Account-u:**

**Ako imaš više domena:**
- ✅ Svaka domena ima svoj `public_html/` folder
- ✅ ILI koristi subfolder strukturu
- ✅ Provjeri u Hostinger Control Panel-u koja struktura se koristi

### **3. Security:**

**⚠️ VAŽNO:**
- ✅ **Ne dijelj** `public_html/` folder s drugim projektima
- ✅ **Koristi subfolder** ako imaš više projekata na istom account-u
- ✅ **Provjeri permissions** - samo potrebne datoteke trebaju biti u `public_html/`

---

## 📋 Checklist

- [ ] Provjereno u Hostinger Control Panel → File Manager → struktura
- [ ] Provjereno da `public_html/` je root folder za `uslugar.eu`
- [ ] Provjereno da nema drugih projekata u `public_html/`
- [ ] `HOSTINGER_SERVER_DIR` je postavljen na `public_html/` (ili default)
- [ ] Test upload-ano da provjeri da folder je točan

---

## ✅ Konačni Odgovor

**Da li je pametno staviti u `public_html/`?**

**DA, ako:**
- ✅ `uslugar.eu` je glavna domena na Hostinger account-u
- ✅ `public_html/` je root folder za `uslugar.eu`
- ✅ Nema drugih projekata u `public_html/`

**MOŽDA NE, ako:**
- ⚠️ Imaš više domena i koristiš subfolder strukturu
- ⚠️ `public_html/` već sadrži druge projekte
- ⚠️ Hostinger zahtijeva subfolder (`public_html/uslugar/`)

**Preporuka:** Provjeri u Hostinger Control Panel-u strukturu i koristi `public_html/` ako je to root folder za `uslugar.eu`.

---

## 🔍 Kako Provjeriti

1. ✅ **Hostinger Control Panel** → **Websites** → `uslugar.eu` → **File Manager**
2. ✅ **Provjeri strukturu** - gdje se nalazi root folder
3. ✅ **Test upload** - upload test fajl i provjeri da li je dostupan na `https://uslugar.eu/test.txt`
4. ✅ **Postavi `HOSTINGER_SERVER_DIR`** na pravi folder

**Gotovo!** 🎯

