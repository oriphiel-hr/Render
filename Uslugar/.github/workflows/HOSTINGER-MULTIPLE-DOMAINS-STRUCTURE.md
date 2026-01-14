# 🌐 Hostinger - Više Domena i File Manager Struktura

## ✅ Odgovor: Ovisi o Tipu Hostinger Account-a

**Kratak odgovor:** 
- **Shared Hosting**: Sve domene dijele isti File Manager, ali imaju **različite `public_html/` foldere**
- **VPS/Dedicated**: Svaka domena može imati svoj File Manager

---

## 🎯 Hostinger Shared Hosting (Najčešći)

### **Struktura:**

**Jedan Hostinger Account:**
```
Hostinger Account
├── File Manager (jedan za sve domene)
│   ├── public_html/              ← Root za glavnu domenu (uslugar.eu)
│   ├── public_html/druga-domena/ ← Subfolder za drugu domenu
│   └── domains/
│       ├── uslugar.eu/
│       │   └── public_html/     ← ILI specifičan folder za domenu
│       └── druga-domena.com/
│           └── public_html/
```

**File Manager:**
- ✅ **Jedan File Manager** za sve domene
- ✅ **Različiti folderi** za svaku domenu
- ✅ **Navigacija** između domena unutar istog File Manager-a

---

## 📋 Kako Hostinger Organizira Domene

### **Opcija 1: Glavna Domenu + Addon Domene**

**Glavna domena (uslugar.eu):**
```
public_html/                 ← Root folder za uslugar.eu
├── index.html
└── assets/
```

**Addon domena (druga-domena.com):**
```
public_html/druga-domena/    ← Subfolder za addon domenu
├── index.html
└── assets/
```

**ILI:**
```
domains/druga-domena.com/public_html/  ← Specifičan folder
├── index.html
└── assets/
```

### **Opcija 2: Svi Domene Imaju Svoj Folder**

**Svaka domena ima svoj `public_html/` folder:**

```
domains/
├── uslugar.eu/
│   └── public_html/         ← Root za uslugar.eu
├── druga-domena.com/
│   └── public_html/        ← Root za drugu domenu
└── treca-domena.hr/
    └── public_html/        ← Root za treću domenu
```

---

## 🔍 Kako Provjeriti Strukturu

### **1. Hostinger Control Panel:**

1. **Hostinger Control Panel** → **Websites** → **Manage**
2. **Vidiš listu domena:**
   - `uslugar.eu` (glavna domena)
   - `druga-domena.com` (addon domena)
   - itd.

3. **Klikni na `uslugar.eu`** → **File Manager**
4. **Provjeri strukturu:**
   - Ako vidiš samo `public_html/` → To je root za `uslugar.eu`
   - Ako vidiš `domains/uslugar.eu/public_html/` → Specifičan folder

### **2. Provjeri Preko FTP:**

**FileZilla:**
- Connect na FTP: `194.5.156.10`
- Navigate do root-a
- **Provjeri strukturu:**
  ```
  /public_html/                    ← Glavna domena
  /domains/uslugar.eu/public_html/ ← ILI specifičan folder
  /public_html/druga-domena/       ← ILI subfolder za addon domenu
  ```

---

## 🎯 Za uslugar.eu Domenu

### **Najvjerojatnija Struktura:**

**Ako je `uslugar.eu` glavna domena:**
```
File Manager (jedan za sve)
└── public_html/              ← Root za uslugar.eu
    ├── index.html
    └── assets/
```

**GitHub Secret:**
```
HOSTINGER_SERVER_DIR=public_html/
```

**Ako je `uslugar.eu` addon domena:**
```
File Manager (jedan za sve)
└── domains/uslugar.eu/public_html/  ← Specifičan folder
    ├── index.html
    └── assets/
```

**GitHub Secret:**
```
HOSTINGER_SERVER_DIR=domains/uslugar.eu/public_html/
```

---

## 📋 Kako Odrediti Pravi Folder

### **Metoda 1: Hostinger Control Panel**

1. **Hostinger Control Panel** → **Websites** → **Manage**
2. **Klikni na `uslugar.eu`** → **File Manager**
3. **Provjeri gdje se nalazi root folder:**
   - Ako si direktno u `public_html/` → Koristi `public_html/`
   - Ako si u `domains/uslugar.eu/public_html/` → Koristi `domains/uslugar.eu/public_html/`

### **Metoda 2: Provjeri Trenutni Sadržaj**

**Ako `public_html/` već sadrži:**
- ✅ `index.html` za `uslugar.eu` → `public_html/` je root ✅
- ✅ Druge datoteke za `uslugar.eu` → `public_html/` je root ✅
- ⚠️ Datoteke za druge domene → Možda treba specifičan folder

### **Metoda 3: Test Upload**

1. **Upload test fajl** (npr. `test.txt`) u `public_html/`
2. **Provjeri da li je dostupan** na `https://uslugar.eu/test.txt`
3. **Ako je dostupan** → `public_html/` je root folder ✅
4. **Ako nije dostupan** → Provjeri `domains/uslugar.eu/public_html/`

---

## ✅ Preporuka za uslugar.eu

### **Najvjerojatnije:**

**Ako je `uslugar.eu` glavna domena:**
```
HOSTINGER_SERVER_DIR=public_html/
```

**Ako je `uslugar.eu` addon domena:**
```
HOSTINGER_SERVER_DIR=domains/uslugar.eu/public_html/
```

**ILI:**
```
HOSTINGER_SERVER_DIR=public_html/uslugar/
```

---

## 🔍 Kako Provjeriti u Hostinger Control Panel-u

### **Korak 1: Otvori File Manager**

1. **Hostinger Control Panel** → **Websites** → **Manage**
2. **Klikni na `uslugar.eu`** → **File Manager**

### **Korak 2: Provjeri Trenutnu Lokaciju**

**U File Manager-u, provjeri:**
- **Gdje si trenutno?** (putanja gore u File Manager-u)
- **Što vidiš?** (foldere i datoteke)

**Ako vidiš:**
- ✅ `public_html/` direktno → Koristi `public_html/`
- ✅ `domains/uslugar.eu/public_html/` → Koristi `domains/uslugar.eu/public_html/`
- ✅ `public_html/uslugar/` → Koristi `public_html/uslugar/`

### **Korak 3: Provjeri Putanju**

**U File Manager-u, klikni na bilo koji folder i provjeri putanju:**
- `/public_html/` → Root za glavnu domenu
- `/domains/uslugar.eu/public_html/` → Specifičan folder za domenu
- `/public_html/uslugar/` → Subfolder struktura

---

## 📋 Checklist

- [ ] Otvoren Hostinger Control Panel → Websites → `uslugar.eu` → File Manager
- [ ] Provjerena trenutna lokacija (putanja u File Manager-u)
- [ ] Provjereno da li `public_html/` je root za `uslugar.eu`
- [ ] Provjereno da li postoji `domains/uslugar.eu/public_html/` folder
- [ ] Test upload-ano da provjeri da folder je točan
- [ ] `HOSTINGER_SERVER_DIR` je postavljen na pravi folder

---

## ✅ Konačni Odgovor

**Svaka domena ima svoj File Manager na Hostingeru?**

**NE - File Manager je jedan, ali:**
- ✅ **Svaka domena ima svoj folder** (`public_html/` ili `domains/[domena]/public_html/`)
- ✅ **Navigacija** između domena unutar istog File Manager-a
- ✅ **Različite putanje** za svaku domenu

**Za `uslugar.eu`:**
- ✅ Provjeri u Hostinger Control Panel-u gdje je root folder
- ✅ Koristi tu putanju za `HOSTINGER_SERVER_DIR`
- ✅ Najčešće: `public_html/` (glavna domena) ili `domains/uslugar.eu/public_html/` (addon domena)

---

## 🎯 Preporuka

1. ✅ **Otvori Hostinger Control Panel** → **Websites** → `uslugar.eu` → **File Manager**
2. ✅ **Provjeri putanju** gdje se nalaziš
3. ✅ **Koristi tu putanju** za `HOSTINGER_SERVER_DIR` u GitHub Secrets
4. ✅ **Test upload** da provjeriš da folder je točan

**Gotovo!** 🎯

