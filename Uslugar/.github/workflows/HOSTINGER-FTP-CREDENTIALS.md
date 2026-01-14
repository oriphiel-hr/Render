# 🔐 Hostinger FTP Credentials - Izvučeno iz AWS Projekta

## ✅ FTP Podatci iz AWS Projekta

Izvučeno iz `uslugar/frontend/deploy-frontend-ftp-fixed.ps1`:

### **FTP Credentials:**

```
HOSTINGER_HOST=194.5.156.10
HOSTINGER_USERNAME=u208993221
HOSTINGER_PASSWORD=G73S3ebakh6O!
HOSTINGER_SERVER_DIR=public_html/
```

---

## 📋 Detaljno

### **1. HOSTINGER_HOST**

**IP Adresa (iz skripte):**
```
194.5.156.10
```

**Hostname (iz dokumentacije):**
```
ftp.uslugar.oriph.io
```

**ILI:**
```
ftp.oriph.io
```

**⚠️ Napomena:** Možeš koristiti ili IP adresu (`194.5.156.10`) ili hostname (`ftp.uslugar.oriph.io`). Oba bi trebala raditi.

### **2. HOSTINGER_USERNAME**

```
u208993221
```

### **3. HOSTINGER_PASSWORD**

```
G73S3ebakh6O!
```

### **4. HOSTINGER_SERVER_DIR**

**Iz skripte:**
```
/public_html/uslugar/
```

**Za novi Render projekt (www.uslugar.eu):**
```
public_html/
```

**⚠️ Napomena:** Za `www.uslugar.eu` domain, koristi `public_html/` (bez `/uslugar/` subfoldera).

---

## 🔧 Kako Dodati u GitHub Secrets

### **Korak 1: GitHub Repository → Settings**

1. **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. **Repository secrets** tab
3. **New repository secret**

### **Korak 2: Dodaj Secrets**

#### **1. HOSTINGER_HOST**
- **Name**: `HOSTINGER_HOST`
- **Secret**: `194.5.156.10` (ILI `ftp.uslugar.oriph.io`)
- **Add secret**

#### **2. HOSTINGER_USERNAME**
- **Name**: `HOSTINGER_USERNAME`
- **Secret**: `u208993221`
- **Add secret**

#### **3. HOSTINGER_PASSWORD**
- **Name**: `HOSTINGER_PASSWORD`
- **Secret**: `G73S3ebakh6O!`
- **Add secret**

#### **4. HOSTINGER_SERVER_DIR (Opcionalno)**
- **Name**: `HOSTINGER_SERVER_DIR`
- **Secret**: `public_html/` (za www.uslugar.eu)
- **Add secret**

**ILI za stari AWS setup:**
- **Secret**: `public_html/uslugar/` (ako koristiš subfolder)

---

## ⚠️ Važne Napomene

### **1. Server Directory Razlika**

**AWS Projekt (stari):**
```
HOSTINGER_SERVER_DIR=public_html/uslugar/
```

**Render Projekt (novi - www.uslugar.eu):**
```
HOSTINGER_SERVER_DIR=public_html/
```

**Za `www.uslugar.eu` domain, koristi `public_html/` (root folder)!**

### **2. FTP Host Format**

**Možeš koristiti:**
- ✅ IP adresa: `194.5.156.10`
- ✅ Hostname: `ftp.uslugar.oriph.io`
- ✅ Hostname: `ftp.oriph.io`

**Workflow automatski uklanja `ftp://` prefiks i port ako postoji!**

### **3. Security**

**⚠️ VAŽNO:**
- ✅ **Nikada ne commit-aj** ove podatke u Git
- ✅ **Koristi GitHub Secrets** umjesto hardcoding-a
- ✅ **Rotiraj password** redovito
- ✅ **Ne dijelj** ove podatke javno

---

## 📋 Checklist

- [ ] `HOSTINGER_HOST` = `194.5.156.10` (ILI `ftp.uslugar.oriph.io`)
- [ ] `HOSTINGER_USERNAME` = `u208993221`
- [ ] `HOSTINGER_PASSWORD` = `G73S3ebakh6O!`
- [ ] `HOSTINGER_SERVER_DIR` = `public_html/` (za www.uslugar.eu)
- [ ] Secrets su dodani u **Repository secrets** (ne Environment secrets)
- [ ] Testiraj workflow (push promjene u `frontend/` folderu)

---

## 🧪 Provjera da Secrets Radi

### **1. Testiraj Workflow**

1. **GitHub Repository** → **Actions** tab
2. **Frontend - Build & Deploy (Hostinger)** workflow
3. **Run workflow** → **Run workflow** (manual trigger)
4. **Provjeri logs** - trebao bi vidjeti:
   ```
   ✅ Using HOSTINGER_* secrets
   ✅ All required secrets are present
   ✅ Host format is valid: 194.5.156.10
   ```

### **2. Provjeri FTP Konekciju**

Ako workflow ne radi, testiraj FTP konekciju ručno:

**FileZilla:**
- Host: `194.5.156.10` (ILI `ftp.uslugar.oriph.io`)
- Username: `u208993221`
- Password: `G73S3ebakh6O!`
- Port: 21

**Ako konekcija radi u FileZilla, ali ne u workflow-u:**
- Provjeri da secrets su točno kopirani (bez razmaka)
- Provjeri da `HOSTINGER_HOST` nema `ftp://` prefiks
- Provjeri da `HOSTINGER_SERVER_DIR` ima trailing slash (`public_html/`)

---

## 🔄 Ažuriranje za Novi Domain (www.uslugar.eu)

**Za `www.uslugar.eu` domain:**

```
HOSTINGER_HOST=194.5.156.10 (ILI ftp.uslugar.eu ako postoji)
HOSTINGER_USERNAME=u208993221
HOSTINGER_PASSWORD=G73S3ebakh6O!
HOSTINGER_SERVER_DIR=public_html/  ← Za www.uslugar.eu (root folder)
```

**Razlika:**
- **Stari (AWS)**: `public_html/uslugar/` (subfolder)
- **Novi (Render)**: `public_html/` (root folder za www.uslugar.eu)

---

## ✅ Konačni Secrets za Render Projekt

```
HOSTINGER_HOST=194.5.156.10
HOSTINGER_USERNAME=u208993221
HOSTINGER_PASSWORD=G73S3ebakh6O!
HOSTINGER_SERVER_DIR=public_html/
```

**Dodaj ove u GitHub Repository Secrets!** 🎯

