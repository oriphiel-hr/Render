# 🌐 Hostinger DNS Setup za api.uslugar.eu - Nije Potreban Custom Folder

## ✅ Odgovor: NE, Nije Potreban Custom Folder u Hostinger-u!

Za subdomain `api.uslugar.eu` koji pokazuje na Render servis, **ne trebaš custom folder u Hostinger-u**. Potreban je **samo DNS zapis (CNAME)** koji pokazuje na Render servis.

---

## 🎯 Zašto Nije Potreban Custom Folder?

### **Razlika između DNS-a i Hosting-a:**

**DNS (Domain Name System):**
- DNS zapis samo **pokazuje** gdje se nalazi servis
- `api.uslugar.eu` → CNAME → `uslugar.onrender.com`
- **Nema fizičkih foldera** - samo mapiranje domene na IP/URL

**Hosting (Web Hosting):**
- Ako koristiš Hostinger hosting, imao bi folder strukturu
- `public_html/api/` - za subdomain folder (ako koristiš hosting)
- **Ali ti koristiš Render servis**, ne Hostinger hosting!

### **Tvoja Situacija:**

```
api.uslugar.eu (DNS u Hostinger-u)
    ↓ CNAME
uslugar.onrender.com (Render servis)
    ↓ Render servira backend kod
Backend API (iz Render Root Directory)
```

**Render servis** servira backend kod - Hostinger samo "preusmjerava" DNS upite na Render!

---

## 📋 Hostinger DNS Postavke za api.uslugar.eu

### **1. Prijavi se u Hostinger Control Panel**

1. Idi na: https://hpanel.hostinger.com
2. Prijavi se s Hostinger računom
3. Odaberi domenu: `uslugar.eu`

### **2. Idi na DNS Postavke**

1. U Hostinger Control Panel-u, klikni na `uslugar.eu` domain
2. Idi na **"DNS"** ili **"DNS Zone Editor"** tab
3. Pronađi sekciju za **DNS zapise** (DNS Records)

### **3. Dodaj CNAME Record za Subdomain**

**Hostinger DNS Postavke:**
```
Type: CNAME
Name: api
Value: uslugar.onrender.com
TTL: 3600 (ili default)
```

**Koraci u Hostingeru:**
1. Klikni **"Add Record"** ili **"+ Add"** gumb
2. **Type**: Odaberi **CNAME**
3. **Name**: `api` (za subdomain `api.uslugar.eu`)
4. **Value**: `uslugar.onrender.com` (tvoj Render servis URL)
5. **TTL**: `3600` (ili ostavi default)
6. Klikni **"Save"** ili **"Add Record"**

### **4. To je Sve!**

**Nije potreban:**
- ❌ Custom folder u Hostinger hosting-u
- ❌ Subdirectory folder (`public_html/api/`)
- ❌ Web server konfiguracija (nginx, Apache)
- ❌ PHP ili drugi server-side kod u Hostinger-u

**Samo DNS zapis je dovoljan!**

---

## 🔍 Kako DNS Radi

### **DNS Flow:**

```
Korisnik traži: api.uslugar.eu
    ↓
DNS upit → Hostinger DNS server
    ↓
Hostinger DNS vraća: CNAME → uslugar.onrender.com
    ↓
Browser traži: uslugar.onrender.com
    ↓
Render servis servira backend API
```

**Hostinger DNS samo "preusmjerava"** - Render servira sve sadržaje!

---

## ⚠️ Važne Napomene

### **1. Nema Potrebe za Hostinger Hosting Folders**

**Ako imaš Hostinger Web Hosting:**
- `public_html/` folder - **NE koristi se** za subdomain koji pokazuje na Render
- `public_html/api/` - **NIJE potreban** za DNS CNAME
- DNS zapis je **dovoljan** sam za sebe

### **2. Custom Folder se Koristi Samo Ako:**

**Custom folder je potreban samo ako:**
- ❌ Koristiš Hostinger hosting (ne Render servis)
- ❌ Želiš da subdomain servira statičke fajlove iz Hostinger hosting-a
- ❌ Želiš da subdomain koristi PHP/Python iz Hostinger hosting-a

**Ali ti koristiš Render servis, tako da NIJE potreban!**

### **3. Root Directory u Render Dashboard-u**

**Root Directory se postavlja u Render Dashboard-u, ne u Hostinger-u:**
- Render Dashboard → Settings → Root Directory: `backend` (ili `Uslugar/backend`)
- Hostinger DNS → Samo CNAME zapis: `api` → `uslugar.onrender.com`

---

## 📋 Checklist za Hostinger DNS

### **Hostinger DNS Postavke:**
- [ ] Prijavljen u Hostinger Control Panel
- [ ] Odabrao domenu: `uslugar.eu`
- [ ] Idi na **DNS** ili **DNS Zone Editor** tab
- [ ] Dodao CNAME record:
  - Type: **CNAME**
  - Name: **api**
  - Value: **uslugar.onrender.com**
  - TTL: **3600** (ili default)
- [ ] Save / Add Record
- [ ] **NIJE potreban custom folder** (ignoriraj hosting folder opcije)

### **Render Dashboard Postavke:**
- [ ] Render Dashboard → Custom Domains → Dodao: `api.uslugar.eu`
- [ ] Render Dashboard → Settings → Root Directory: `backend` (ako treba)
- [ ] Render servis radi i servira backend API

---

## 🧪 Provjera da DNS Radi

### **1. Provjeri DNS Propagaciju (Nakon 1-4 sata):**

```bash
# Provjeri CNAME zapis
nslookup api.uslugar.eu

# ILI
dig api.uslugar.eu CNAME

# Očekivani output:
# api.uslugar.eu → uslugar.onrender.com
```

**ILI online:**
- https://dnschecker.org
- Unesi: `api.uslugar.eu`
- Provjeri da CNAME pokazuje na `uslugar.onrender.com`

### **2. Testiraj API Endpoint:**

```bash
# Testiraj API
curl https://api.uslugar.eu/api/health

# Očekivani odgovor: 200 OK
```

### **3. Provjeri u Render Dashboard:**

Render Dashboard → Custom Domains:
- ✅ **Status**: "Active"
- ✅ **SSL**: "Active"
- ✅ **Domain**: `api.uslugar.eu`

---

## 🆘 Troubleshooting

### **Problem: "Subdomain not found" ili "DNS not configured"**

**Uzrok:** DNS zapis nije dodan u Hostingeru ili propagacija još nije završena

**Rješenje:**
1. ✅ Provjeri da CNAME zapis postoji u Hostinger DNS-u
2. ✅ Provjeri da vrijednost je točna: `uslugar.onrender.com` (ne `uslugar.onrender.com.`)
3. ✅ Čekaj DNS propagaciju (1-4 sata)
4. ✅ Provjeri DNS propagaciju na https://dnschecker.org

### **Problem: "Can't reach api.uslugar.eu"**

**Uzrok:** DNS propagacija još nije završena ili CNAME zapis je pogrešan

**Rješenje:**
1. ✅ Provjeri da CNAME zapis postoji: `api` → `uslugar.onrender.com`
2. ✅ Provjeri da nema typo-a u nazivu ili vrijednosti
3. ✅ Čekaj DNS propagaciju (može trajati do 24 sata)
4. ✅ Provjeri da Render servis radi (`https://uslugar.onrender.com`)

### **Problem: Hostinger traži "Subdomain Folder" ili "Document Root"**

**Uzrok:** Hostinger možda ima opciju za hosting subdomain-a (ne DNS CNAME)

**Rješenje:**
1. ✅ **Ignoriraj** hosting folder opcije
2. ✅ Koristi **samo DNS zapise** (DNS Zone Editor)
3. ✅ Dodaj **CNAME record**, ne subdomain hosting opciju
4. ✅ Ako ne vidiš DNS Zone Editor, kontaktiraj Hostinger support

---

## 📝 Razlika: DNS vs Hosting

### **DNS CNAME (Što Ti Treba):**
```
api.uslugar.eu → CNAME → uslugar.onrender.com
```
- ✅ **Samo DNS zapis** u Hostinger-u
- ✅ Pokazuje na Render servis
- ✅ Render servira sve sadržaje
- ✅ Nema potrebe za folder u Hostinger-u

### **Hosting Subdomain (Što NE Trebaš):**
```
api.uslugar.eu → public_html/api/ → Hostinger hosting
```
- ❌ Koristi Hostinger hosting
- ❌ Treba folder: `public_html/api/`
- ❌ Render se ne koristi
- ❌ **Ovo NIJE što ti treba!**

---

## ✅ Konačni Odgovor

**NE, NIJE potreban custom folder u Hostinger-u za subdomain `api.uslugar.eu`!**

**Potrebno je samo:**
1. ✅ **DNS CNAME zapis** u Hostinger-u: `api` → `uslugar.onrender.com`
2. ✅ **Custom Domain** u Render Dashboard-u: `api.uslugar.eu`
3. ✅ **Root Directory** u Render Dashboard-u (ako treba): `backend`

**Nije potrebno:**
- ❌ Custom folder u Hostinger hosting-u
- ❌ Subdirectory folder (`public_html/api/`)
- ❌ Web server konfiguracija u Hostinger-u
- ❌ Hosting subdomain opcija (koristi samo DNS!)

**Gotovo!** 🎉 DNS zapis je dovoljan - Render servira sve!

