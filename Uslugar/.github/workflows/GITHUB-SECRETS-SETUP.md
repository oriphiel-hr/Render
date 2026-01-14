# 🔐 GitHub Secrets Setup - Repository vs Environment Secrets

## ✅ Odgovor: Koristi **Repository Secrets**

Za frontend deployment workflow, koristi **Repository Secrets** (ne Environment Secrets).

---

## 🔍 Razlika: Repository vs Environment Secrets

### **Repository Secrets**
- ✅ **Dostupni svim workflow-ima** u repository-ju
- ✅ **Jednostavnije** za postavljanje
- ✅ **Dovoljno** za većinu slučajeva
- ✅ **Preporučeno** za ovaj workflow

**Lokacija:**
```
GitHub Repository → Settings → Secrets and variables → Actions → Repository secrets
```

### **Environment Secrets**
- ⚙️ **Povezani s environment-om** (production, staging, itd.)
- ⚙️ **Zahtijevaju kreiranje environment-a** prvo
- ⚙️ **Koristi se za** kompleksnije deployment strategije
- ⚙️ **Nije potrebno** za ovaj workflow

**Lokacija:**
```
GitHub Repository → Settings → Environments → [Environment Name] → Secrets
```

---

## 📋 Kako Dodati Repository Secrets

### **Korak 1: Otvori GitHub Repository**

1. Idi na: `https://github.com/[username]/[repository]`
2. Klikni **"Settings"** tab (gore u repository-ju)

### **Korak 2: Idi na Secrets**

1. U lijevom sidebaru, klikni **"Secrets and variables"**
2. Klikni **"Actions"** (pod "Secrets and variables")
3. Klikni **"New repository secret"** gumb

### **Korak 3: Dodaj Secrets**

**Dodaj svaki secret zasebno:**

#### **1. HOSTINGER_HOST**
- **Name**: `HOSTINGER_HOST`
- **Secret**: `ftp.uslugar.eu` (ili IP adresa, npr. `194.5.156.10`)
- **⚠️ VAŽNO**: Bez `ftp://` prefiksa, bez porta!
- **Klikni**: "Add secret"

#### **2. HOSTINGER_USERNAME**
- **Name**: `HOSTINGER_USERNAME`
- **Secret**: Tvoj FTP username (npr. `uslugar` ili `uslugar_user`)
- **Klikni**: "Add secret"

#### **3. HOSTINGER_PASSWORD**
- **Name**: `HOSTINGER_PASSWORD`
- **Secret**: Tvoj FTP password
- **Klikni**: "Add secret"

#### **4. VITE_API_URL (Opcionalno)**
- **Name**: `VITE_API_URL`
- **Secret**: `https://api.uslugar.eu`
- **Klikni**: "Add secret"

---

## 📋 Checklist - Repository Secrets

- [ ] `HOSTINGER_HOST` - FTP hostname (bez `ftp://`, bez porta)
- [ ] `HOSTINGER_USERNAME` - FTP username
- [ ] `HOSTINGER_PASSWORD` - FTP password
- [ ] `VITE_API_URL` - API URL (opcionalno, default: `https://api.uslugar.eu`)

---

## 🔍 Kako Pronaći FTP Podatke u Hostinger-u

### **1. Hostinger Control Panel**

1. **Hostinger Control Panel** → **Websites** → **Manage**
2. Klikni na `uslugar.eu` website
3. **FTP** tab → **FTP Accounts**

### **2. Provjeri Postojeći FTP Account**

Ako već imaš FTP account:
- **Host**: `ftp.uslugar.eu` (ili IP adresa)
- **Username**: [tvoj FTP username]
- **Password**: [tvoj FTP password]

### **3. Kreiraj Novi FTP Account (Ako Ne Postoji)**

1. **FTP Accounts** → **Create FTP Account**
2. **Username**: Unesi username (npr. `uslugar`)
3. **Password**: Generiraj siguran password
4. **Directory**: `public_html/` (ili root)
5. **Create**
6. **Kopiraj podatke** i dodaj u GitHub Secrets

---

## ⚠️ Važne Napomene

### **1. HOSTINGER_HOST Format**

**✅ TOČNO:**
```
ftp.uslugar.eu
194.5.156.10
```

**❌ POGREŠNO:**
```
ftp://ftp.uslugar.eu
ftp.uslugar.eu:21
ftp://ftp.uslugar.eu:21
```

**Workflow automatski uklanja prefikse i portove!**

### **2. Security Best Practices**

- ✅ **Nikada ne commit-aj** secrets u Git
- ✅ **Koristi GitHub Secrets** umjesto hardcoding-a
- ✅ **Rotiraj passwords** redovito
- ✅ **Koristi jak password** za FTP account

### **3. Alternative: Generic FTP Secrets**

Ako ne želiš koristiti `HOSTINGER_*` prefiks, možeš koristiti:

- `FTP_HOST` (umjesto `HOSTINGER_HOST`)
- `FTP_USERNAME` (umjesto `HOSTINGER_USERNAME`)
- `FTP_PASSWORD` (umjesto `HOSTINGER_PASSWORD`)

**Workflow podržava obje opcije!**

---

## 🧪 Provjera da Secrets Radi

### **1. Provjeri u GitHub Repository**

1. **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. **Repository secrets** tab
3. Provjeri da svi secrets postoje:
   - ✅ `HOSTINGER_HOST`
   - ✅ `HOSTINGER_USERNAME`
   - ✅ `HOSTINGER_PASSWORD`
   - ✅ `VITE_API_URL` (opcionalno)

### **2. Testiraj Workflow**

1. **GitHub Repository** → **Actions** tab
2. **Frontend - Build & Deploy (Hostinger)** workflow
3. **Run workflow** → **Run workflow** (manual trigger)
4. **Provjeri logs** - trebao bi vidjeti:
   ```
   ✅ Using HOSTINGER_* secrets
   ✅ All required secrets are present
   ```

### **3. Ako Vidiš Grešku**

**Greška: "No FTP secrets found!"**
- ✅ Provjeri da secrets su u **Repository secrets** (ne Environment secrets)
- ✅ Provjeri da imena su točna (`HOSTINGER_HOST`, ne `HOSTINGER_HOSTNAME`)
- ✅ Provjeri da secrets nisu prazni

---

## 📋 Primjer Konfiguracije

### **GitHub Repository Secrets:**

```
HOSTINGER_HOST = ftp.uslugar.eu
HOSTINGER_USERNAME = uslugar
HOSTINGER_PASSWORD = [tvoj siguran password]
VITE_API_URL = https://api.uslugar.eu
```

### **Workflow će Automatski:**

1. ✅ Detektirati `HOSTINGER_*` secrets
2. ✅ Koristiti ih za FTP deployment
3. ✅ Fallback na `FTP_*` secrets ako `HOSTINGER_*` ne postoje

---

## 🆘 Troubleshooting

### **Problem: "No FTP secrets found!"**

**Uzrok:** Secrets nisu dodani ili su u krivom mjestu

**Rješenje:**
1. ✅ Provjeri da secrets su u **Repository secrets** (ne Environment secrets)
2. ✅ Provjeri da imena su točna (`HOSTINGER_HOST`, `HOSTINGER_USERNAME`, `HOSTINGER_PASSWORD`)
3. ✅ Provjeri da secrets nisu prazni

### **Problem: "FTP host is missing!"**

**Uzrok:** `HOSTINGER_HOST` secret je prazan ili ne postoji

**Rješenje:**
1. ✅ Provjeri da `HOSTINGER_HOST` postoji u Repository secrets
2. ✅ Provjeri da vrijednost nije prazna
3. ✅ Provjeri da format je točan (bez `ftp://`, bez porta)

### **Problem: "FTP username is missing!"**

**Uzrok:** `HOSTINGER_USERNAME` secret je prazan ili ne postoji

**Rješenje:**
1. ✅ Provjeri da `HOSTINGER_USERNAME` postoji u Repository secrets
2. ✅ Provjeri da vrijednost nije prazna
3. ✅ Provjeri FTP username u Hostinger Control Panel-u

---

## ✅ Konačni Odgovor

**Koristi Repository Secrets:**

1. ✅ **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. ✅ **Repository secrets** tab (ne Environment secrets!)
3. ✅ **New repository secret**
4. ✅ Dodaj: `HOSTINGER_HOST`, `HOSTINGER_USERNAME`, `HOSTINGER_PASSWORD`
5. ✅ **Save**

**Environment Secrets nisu potrebni** za ovaj workflow!

---

## 📝 Sažetak

**Repository Secrets:**
- ✅ **Jednostavnije** za postavljanje
- ✅ **Dovoljno** za većinu slučajeva
- ✅ **Preporučeno** za ovaj workflow

**Environment Secrets:**
- ⚙️ **Kompleksnije** (zahtijevaju environment setup)
- ⚙️ **Nije potrebno** za ovaj workflow

**Koristi Repository Secrets!** 🎯

