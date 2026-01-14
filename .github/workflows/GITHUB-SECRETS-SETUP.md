# 🔐 GitHub Secrets Setup - Hostinger FTP

## ✅ Točni FTP Podaci iz Hostingera

```
FTP IP (hostname): ftp://194.5.156.10
FTP username:      u208993221.uslugar.eu
FTP port:          21
Folder:            public_html
```

---

## 🔧 GitHub Secrets Konfiguracija

### **Kako dodati Secrets:**

1. **Idi na GitHub repository:**
   - `https://github.com/oriphiel-hr/Render`
   - Ili tvoj repository URL

2. **Settings > Secrets and variables > Actions**

3. **Klikni "New repository secret"**

4. **Dodaj sljedeće Secrets:**

---

### **Secret 1: HOSTINGER_HOST**

**Name:** `HOSTINGER_HOST`

**Value:** `194.5.156.10`

⚠️ **VAŽNO:**
- ❌ **NE** uključi `ftp://` prefiks
- ❌ **NE** uključi port broj
- ✅ **Samo** IP adresa ili hostname: `194.5.156.10`

---

### **Secret 2: HOSTINGER_USERNAME**

**Name:** `HOSTINGER_USERNAME`

**Value:** `u208993221.uslugar.eu`

✅ **Točan format:** `u208993221.uslugar.eu`

---

### **Secret 3: HOSTINGER_PASSWORD**

**Name:** `HOSTINGER_PASSWORD`

**Value:** `[Tvoj FTP password]`

⚠️ **VAŽNO:**
- Provjeri password u Hostinger Control Panel-u
- Password je case-sensitive
- Ne uključi razmake na početku ili kraju

---

### **Secret 4: HOSTINGER_SERVER_DIR (opcionalno)**

**Name:** `HOSTINGER_SERVER_DIR`

**Value:** `/` (ili `public_html/` ako FTP root nije u public_html/)

⚠️ **VAŽNO:**
- ✅ **Default je `/`** (FTP root je već u `public_html/`)
- ✅ Ako FTP root nije u `public_html/`, koristi `public_html/`
- ✅ Uključi trailing slash ako koristiš `public_html/`

**Kako provjeriti:**
- Spoji se na FTP s FileZilla
- Ako se odmah nađeš u `public_html/` → koristi `/`
- Ako vidiš root direktorij s `public_html/` folderom → koristi `public_html/`

---

## 📋 Checklist - Provjeri Secrets

- [ ] `HOSTINGER_HOST` = `194.5.156.10` (bez `ftp://`)
- [ ] `HOSTINGER_USERNAME` = `u208993221.uslugar.eu`
- [ ] `HOSTINGER_PASSWORD` = [tvoj password] (točan, bez razmaka)
- [ ] `HOSTINGER_SERVER_DIR` = `/` (opcionalno, default je `/` - FTP root je već u public_html/)

---

## 🔍 Kako Provjeriti da li su Secrets Točni

### **Test 1: FileZilla**

1. **Otvorite FileZilla**
2. **Unesite:**
   - **Host:** `194.5.156.10`
   - **Username:** `u208993221.uslugar.eu`
   - **Password:** [tvoj password]
   - **Port:** `21`
   - **Protocol:** `FTP - File Transfer Protocol`
3. **Kliknite "Quickconnect"**
4. **Ako se uspješno spojite:** ✅ Secrets su točni
5. **Ako ne:** ❌ Provjeri password ili credentials u Hostinger Control Panel-u

---

### **Test 2: GitHub Actions Workflow**

1. **Commit i push workflow fajla:**
   ```powershell
   cd "C:\GIT_PROJEKTI\Render"
   git add .github/workflows/frontend-uslugar.yml
   git commit -m "Update workflow with correct FTP credentials"
   git push origin main
   ```

2. **Pokreni workflow:**
   - GitHub > Actions > "Frontend - Build & Deploy (Hostinger)"
   - Klikni "Run workflow"

3. **Provjeri logove:**
   - Ako vidiš "✅ Using HOSTINGER_* secrets" → Secrets su pronađeni
   - Ako vidiš "❌ ERROR: No FTP secrets found!" → Secrets nisu postavljeni

---

## ⚠️ Česti Problemi

### **Problem 1: "No FTP secrets found"**

**Uzrok:** Secrets nisu dodani ili imaju pogrešno ime

**Rješenje:**
- Provjeri da su Secrets dodani u: Settings > Secrets and variables > Actions
- Provjeri da su imena točna: `HOSTINGER_HOST`, `HOSTINGER_USERNAME`, `HOSTINGER_PASSWORD`
- Ne koristi `FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD` (to su fallback opcije)

---

### **Problem 2: "Connection timeout"**

**Uzrok:** Host ima `ftp://` prefiks ili port

**Rješenje:**
- `HOSTINGER_HOST` treba biti samo: `194.5.156.10`
- ❌ **NE:** `ftp://194.5.156.10`
- ❌ **NE:** `194.5.156.10:21`
- ✅ **DA:** `194.5.156.10`

---

### **Problem 3: "Authentication failed"**

**Uzrok:** Pogrešan username ili password

**Rješenje:**
- Provjeri username: `u208993221.uslugar.eu` (točan format)
- Provjeri password u Hostinger Control Panel-u
- Provjeri da nema razmaka na početku ili kraju password-a

---

### **Problem 4: "Wrong version number" (SSL error)**

**Uzrok:** Workflow pokušava koristiti FTPS, ali server ne podržava

**Rješenje:**
- Workflow sada automatski pokušava obični FTP prvo
- Ako i dalje ne radi, provjeri da li server podržava FTP (port 21)

---

## 📝 Primjer Secrets Konfiguracije

```
HOSTINGER_HOST = 194.5.156.10
HOSTINGER_USERNAME = u208993221.uslugar.eu
HOSTINGER_PASSWORD = [tvoj password]
HOSTINGER_SERVER_DIR = /  # Default je / (FTP root je već u public_html/)
```

---

## ✅ Gotovo!

Nakon što su Secrets postavljeni:

1. ✅ Commit i push workflow fajla
2. ✅ Pokreni workflow u GitHub Actions
3. ✅ Provjeri da li deployment radi

---

**Ako i dalje imaš problema:**
- Provjeri FileZilla test (ako FileZilla radi, credentials su točni)
- Provjeri workflow logove za specifične greške
- Kontaktiraj Hostinger support ako FTP account nije aktivan

---

**Gotovo!** 🎯

