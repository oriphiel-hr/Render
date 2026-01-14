# 📁 Render Root Directory Setup - api.uslugar.eu

## 🎯 Problem

Želiš postaviti `api.uslugar.eu` da koristi **posebni folder** iz Git repository-ja (monorepo struktura).

## ✅ Rješenje: Root Directory u Render Dashboard-u

Render podržava **Root Directory** opciju za Web Services, što omogućava da odabereš specifični folder iz Git repository-ja.

---

## 📋 Korak po Korak

### **1. Struktura Monorepo (Primjer)**

**Pretpostavimo da imaš ovakvu strukturu:**
```
repo/
├── frontend/          # Frontend kod
│   ├── package.json
│   ├── src/
│   └── dist/
├── backend/           # Backend kod (tvoj Render servis)
│   ├── package.json
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile.prod
│   └── start.sh
└── README.md
```

**ILI (ako je backend u `Uslugar/backend`):**
```
repo/
├── Uslugar/
│   ├── backend/       # Backend kod za api.uslugar.eu
│   │   ├── package.json
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── Dockerfile.prod
│   │   └── start.sh
│   └── frontend/      # Frontend kod (ako postoji)
└── README.md
```

---

## 🔧 Render Dashboard - Root Directory Setup

### **1. Otvori Render Dashboard**

1. **Render Dashboard** → Tvoj Backend Service (`uslugar-backend`)
2. Klikni **"Settings"** tab
3. Pronađi sekciju **"Build & Deploy"** ili **"Root Directory"**

### **2. Postavi Root Directory**

**Root Directory:**
```
Uslugar/backend
```

**ILI ako je backend direktno u root-u:**
```
backend
```

**ILI ako je u drugom folderu:**
```
path/to/backend
```

⚠️ **VAŽNO:**
- Root Directory je **relativan put** od root-a Git repository-ja
- Ne koristi **leading slash** (`/backend` ❌, `backend` ✅)
- Ne koristi **trailing slash** (`backend/` ❌, `backend` ✅)

### **3. Render će Sada Koristiti Samo Taj Folder**

Nakon postavljanja Root Directory-a, Render će:
- ✅ Klonirati cijeli Git repository
- ✅ **CD u Root Directory** folder (`Uslugar/backend`)
- ✅ Izvršiti build komande iz tog foldera
- ✅ Koristiti `package.json`, `Dockerfile.prod`, itd. iz tog foldera

---

## 📝 Detaljne Upute

### **1. Render Dashboard - Settings**

1. **Render Dashboard** → Tvoj Service → **Settings**
2. Scroll dolje do sekcije **"Build & Deploy"**
3. Pronađi polje **"Root Directory"** (može biti i **"Working Directory"**)
4. Unesi: `Uslugar/backend` (ili gdje je tvoj backend kod)
5. Klikni **"Save Changes"**
6. Render će automatski trigger-ati novi build

### **2. Provjeri da Root Directory Postoji u Git Repository-ju**

**U tvom Git repository-ju, provjeri strukturu:**
```bash
cd C:\GIT_PROJEKTI\Render\Uslugar
ls -la Uslugar/backend/
# Trebao bi vidjeti: package.json, src/, prisma/, Dockerfile.prod, itd.
```

**ILI u Windows PowerShell:**
```powershell
cd C:\GIT_PROJEKTI\Render\Uslugar
Get-ChildItem Uslugar\backend\
# Trebao bi vidjeti: package.json, src, prisma, Dockerfile.prod, itd.
```

### **3. Build Command i Start Command**

**Build Command:**
Render će automatski koristiti `package.json` iz Root Directory-a. Ako imaš `build` script u `package.json`, Render će ga koristiti.

**ILI možeš eksplicitno postaviti:**
```
npm ci && npm run build
```

**Start Command:**
Render će automatski koristiti `start` script iz `package.json` iz Root Directory-a.

**ILI ako koristiš Docker:**
- Render će koristiti `Dockerfile.prod` iz Root Directory-a
- Provjeri da `Dockerfile.prod` postoji u `Uslugar/backend/`

---

## 🔍 Provjera da Root Directory Radi

### **1. Provjeri Render Build Logs**

Render Dashboard → **Logs** → **Build Logs** → Provjeri:
```
==> Cloning from https://github.com/oriphiel-hr/Render
==> Checking out commit ...
==> Using root directory: Uslugar/backend
==> Build command: npm ci
==> Starting from: Uslugar/backend/src/server.js
```

### **2. Provjeri da Build Koristi Pravi Folder**

U Render build logs, trebao bi vidjeti:
```
# Build context je sada Uslugar/backend
[internal] load build definition from Uslugar/backend/Dockerfile.prod
[prisma-src 4/8] COPY package*.json ./        # Iz Uslugar/backend/
[prisma-src 6/8] COPY prisma ./prisma         # Iz Uslugar/backend/prisma/
[runner 6/11] COPY src ./src                  # Iz Uslugar/backend/src/
```

### **3. Provjeri da Custom Domain Radi**

Nakon build-a:
- **Custom Domain**: `api.uslugar.eu`
- **Health Check**: `https://api.uslugar.eu/api/health`
- **Očekivani odgovor**: `200 OK`

---

## ⚠️ Važne Napomene

### **1. Root Directory Mora Postojati u Git Repository-ju**

- ✅ Root Directory (`Uslugar/backend`) **MORA** biti commit-an i push-an u Git
- ❌ Render **NE MOŽE** koristiti folder koji nije u Git repository-ju
- ✅ Provjeri da je folder u Git: `git ls-files Uslugar/backend/`

### **2. Package.json Mora Biti u Root Directory-u**

**Struktura:**
```
Uslugar/backend/
├── package.json       # ✅ MORA biti ovdje
├── src/
│   └── server.js
├── prisma/
│   └── schema.prisma
├── Dockerfile.prod
└── start.sh
```

### **3. Dockerfile.prod Mora Biti u Root Directory-u**

**Ako koristiš Docker (što izgleda da koristiš):**
- ✅ `Dockerfile.prod` mora biti u `Uslugar/backend/`
- ✅ `Dockerfile.prod` COPY komande su relativne na Root Directory

**Primjer Dockerfile.prod u Root Directory-u:**
```dockerfile
# Dockerfile.prod u Uslugar/backend/
FROM node:20-bookworm-slim

WORKDIR /app

# COPY iz Uslugar/backend/
COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY src ./src
COPY start.sh ./start.sh

CMD ["/app/start.sh"]
```

### **4. Git Repository Root vs Root Directory**

**Git Repository Root:**
```
https://github.com/oriphiel-hr/Render
├── Uslugar/
│   ├── backend/      ← Root Directory: Uslugar/backend
│   └── frontend/
└── README.md
```

**Render će klonirati cijeli repo, zatim cd u Uslugar/backend, pa build-ati.**

---

## 📋 Checklist

### **Prije Postavljanja Root Directory:**
- [ ] Git repository struktura je ispravna (backend je u `Uslugar/backend/`)
- [ ] `Uslugar/backend/package.json` postoji
- [ ] `Uslugar/backend/src/server.js` postoji
- [ ] `Uslugar/backend/prisma/schema.prisma` postoji
- [ ] `Uslugar/backend/Dockerfile.prod` postoji (ako koristiš Docker)
- [ ] `Uslugar/backend/start.sh` postoji (ako koristiš)
- [ ] Sve datoteke su commit-ane i push-ane u Git

### **Render Dashboard Setup:**
- [ ] Render Dashboard → Settings → Root Directory: `Uslugar/backend`
- [ ] Save Changes
- [ ] Render će automatski trigger-ati novi build

### **Nakon Build-a:**
- [ ] Render Build Logs pokazuju: "Using root directory: Uslugar/backend"
- [ ] Build je uspješan (nema grešaka)
- [ ] Custom Domain: `api.uslugar.eu` radi
- [ ] Health Check: `https://api.uslugar.eu/api/health` → `200 OK`

---

## 🆘 Troubleshooting

### **Problem: "Root Directory not found"**

**Uzrok:** Root Directory ne postoji u Git repository-ju ili je putanja pogrešna

**Rješenje:**
1. ✅ Provjeri da `Uslugar/backend/` postoji u Git repository-ju
2. ✅ Provjeri da je folder commit-an i push-an u Git
3. ✅ Provjeri da putanja je točna (`Uslugar/backend`, ne `/Uslugar/backend`)
4. ✅ Provjeri da nema typo-a u nazivu foldera

### **Problem: "package.json not found"**

**Uzrok:** `package.json` nije u Root Directory-u ili Root Directory je pogrešan

**Rješenje:**
1. ✅ Provjeri da `Uslugar/backend/package.json` postoji
2. ✅ Provjeri da Root Directory je točan (`Uslugar/backend`)
3. ✅ Provjeri da `package.json` je commit-an u Git

### **Problem: "Dockerfile.prod not found"**

**Uzrok:** `Dockerfile.prod` nije u Root Directory-u

**Rješenje:**
1. ✅ Provjeri da `Uslugar/backend/Dockerfile.prod` postoji
2. ✅ Provjeri da Root Directory je točan
3. ✅ Provjeri da Dockerfile COPY komande su relativne na Root Directory

### **Problem: "src directory not found" ili "prisma directory not found"**

**Uzrok:** Dockerfile COPY komande traže datoteke koje ne postoje u Root Directory-u

**Rješenje:**
1. ✅ Provjeri da `Uslugar/backend/src/` postoji
2. ✅ Provjeri da `Uslugar/backend/prisma/` postoji
3. ✅ Provjeri da Dockerfile COPY komande su relativne na Root Directory
4. ✅ Provjeri da sve datoteke su commit-ane u Git

---

## 🎯 Primjer Konfiguracije

### **Render Dashboard - Settings:**

```
Service Name: uslugar-backend
Root Directory: Uslugar/backend
Build Command: (auto-detected from package.json)
Start Command: (auto-detected from package.json)
Dockerfile Path: Uslugar/backend/Dockerfile.prod
Custom Domain: api.uslugar.eu
```

### **Git Repository Struktura:**

```
https://github.com/oriphiel-hr/Render
├── Uslugar/
│   ├── backend/              ← Root Directory
│   │   ├── package.json
│   │   ├── src/
│   │   │   └── server.js
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── Dockerfile.prod
│   │   └── start.sh
│   └── frontend/             ← Može biti root za frontend servis
└── README.md
```

### **DNS Postavke (Hostinger):**

```
Type: CNAME
Name: api
Value: uslugar.onrender.com
TTL: 3600
```

---

## ✅ Konačni Koraci

1. ✅ **Render Dashboard** → Settings → Root Directory: `Uslugar/backend`
2. ✅ **Save Changes** → Render će restart-ati build
3. ✅ **Provjeri Build Logs** → Trebao bi vidjeti "Using root directory: Uslugar/backend"
4. ✅ **Provjeri Custom Domain** → `https://api.uslugar.eu/api/health`
5. ✅ **Testiraj** → Sve bi trebalo raditi!

---

## 📝 Napomene

- Root Directory je **relativan put** od Git repository root-a
- Ne koristi leading slash (`/Uslugar/backend` ❌)
- Ne koristi trailing slash (`Uslugar/backend/` ❌)
- Svi build fajlovi (`package.json`, `Dockerfile.prod`, itd.) moraju biti u Root Directory-u
- Root Directory **MORA** biti u Git repository-ju

**Gotovo!** 🎉 Render će sada koristiti samo `Uslugar/backend` folder za `api.uslugar.eu`!

