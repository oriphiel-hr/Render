# 🌐 Kako Postaviti Frontend na www.uslugar.eu na Hostingeru

## 📋 Pregled

Trenutno `www.uslugar.eu` pokazuje na Hostinger default stranicu ("You Are All Set to Go!"). Trebaš postaviti frontend kod na Hostinger hosting.

---

## 🎯 Dvije Opcije

### **Opcija 1: Hostinger Web Hosting (Preporučeno za Statičke Stranice)**

- ✅ Frontend fajlovi se upload-aju na Hostinger hosting
- ✅ `www.uslugar.eu` servira fajlove direktno s Hostinger-a
- ✅ Jednostavno za statičke stranice (HTML, CSS, JS)
- ✅ Brže za jednostavne projekte

### **Opcija 2: Render Static Site + DNS (Preporučeno za React/Vue/Angular)**

- ✅ Frontend se build-a na Render-u
- ✅ `www.uslugar.eu` pokazuje na Render Static Site (preko DNS-a)
- ✅ Automatski SSL i CDN
- ✅ Lako za SPA aplikacije

---

## 🔧 Opcija 1: Hostinger Web Hosting (Upload Fajlova)

### **Korak 1: Prijavi se u Hostinger Control Panel**

1. Idi na: https://hpanel.hostinger.com
2. Prijavi se s Hostinger računom
3. Odaberi domenu: `uslugar.eu`

### **Korak 2: Otvori File Manager**

1. **Hostinger Control Panel** → **Websites** → **Manage**
2. Klikni na `uslugar.eu` website
3. Idi na **"File Manager"** ili **"FTP"** tab
4. Otvorit će se File Manager

### **Korak 3: Upload Frontend Fajlova**

**File Manager struktura:**
```
public_html/
├── index.html          ← Ovo je root za www.uslugar.eu
├── css/
├── js/
└── assets/
```

**Koraci:**

1. **Otvori `public_html/` folder** (ovo je root folder za `www.uslugar.eu`)
2. **Obriši default fajlove** (ako postoje):
   - `index.html` (default Hostinger stranica)
   - `cgi-bin/` (ako ne treba)
3. **Upload frontend fajlove:**
   - **Drag & drop** frontend fajlove u `public_html/`
   - ILI **Upload** gumb → odaberi fajlove
   - ILI **FTP** klijent (FileZilla, WinSCP, itd.)

**Frontend struktura (nakon upload-a):**
```
public_html/
├── index.html          ← Main HTML file
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── [drugi frontend fajlovi]
```

### **Korak 4: Provjeri da Index.html Postoji**

**Važno:** `public_html/index.html` mora postojati - to je default stranica!

**Ako koristiš React/Vue/Angular SPA:**
- Upload **build output** (`dist/` ili `build/` folder)
- Provjeri da `index.html` je u `public_html/` root-u

### **Korak 5: Provjeri DNS Postavke**

**Provjeri da `www` subdomain pokazuje na Hostinger hosting:**

1. **Hostinger Control Panel** → **Domains** → `uslugar.eu`
2. **DNS / Nameservers** tab
3. Provjeri da postoji CNAME zapis:
   ```
   Type: CNAME
   Name: www
   Content: uslugar.eu (ili www.uslugar.eu.cdn.hstgr.net)
   ```

**Ako ne postoji, dodaj:**
- **Type**: CNAME
- **Name**: `www`
- **Content**: `uslugar.eu` (ili Hostinger hosting URL)
- **TTL**: 3600

### **Korak 6: Provjeri da Frontend Radi**

Nakon upload-a (može trajati nekoliko minuta):

```bash
# Provjeri da frontend radi
curl https://www.uslugar.eu/

# Očekivani odgovor: HTML sadržaj (ne "You Are All Set to Go!")
```

**ILI u browser-u:**
- Otvori: `https://www.uslugar.eu/`
- Trebao bi vidjeti tvoj frontend, ne Hostinger default stranicu

---

## 🔧 Opcija 2: Render Static Site + DNS (Za React/Vue/Angular)

### **Korak 1: Render Dashboard - Kreiraj Static Site**

1. **Render Dashboard** → **New** → **Static Site**
2. **Connect Repository**: Tvoj Git repository (frontend kod)
3. **Name**: `uslugar-frontend`
4. **Root Directory**: `frontend` (ili gdje je frontend kod)
5. **Build Command**: `npm install && npm run build`
6. **Publish Directory**: `dist` (ili `build`, ovisno o frameworku)
7. **Environment Variables**: 
   - `VITE_API_URL=https://api.uslugar.eu` (ili `REACT_APP_API_URL`, `NEXT_PUBLIC_API_URL`)
8. **Create Static Site**

### **Korak 2: Render Dashboard - Dodaj Custom Domain**

1. **Render Dashboard** → Tvoj Static Site → **Settings**
2. **Custom Domains** → **Add Custom Domain**
3. Unesi: `www.uslugar.eu`
4. Render će pokazati DNS zapise koje treba dodati

### **Korak 3: Hostinger DNS - Dodaj CNAME**

1. **Hostinger Control Panel** → **Domains** → `uslugar.eu`
2. **DNS / Nameservers** tab
3. **Pronađi postojeći CNAME zapis za `www`** (ako postoji)
4. **Uredi** (ili **Delete** + **Add Record**):
   - **Type**: CNAME
   - **Name**: `www`
   - **Content**: [Render Static Site URL] (npr. `uslugar-frontend.onrender.com`)
   - **TTL**: 3600
5. **Save**

### **Korak 4: Provjeri DNS Propagaciju**

Nakon 1-4 sata (DNS propagacija):

```bash
# Provjeri CNAME
nslookup www.uslugar.eu

# Očekivani output:
# www.uslugar.eu canonical name = [Render Static Site URL]
```

**ILI online:**
- https://dnschecker.org
- Unesi: `www.uslugar.eu`
- Provjeri da CNAME pokazuje na Render Static Site

### **Korak 5: Provjeri da Frontend Radi**

```bash
# Provjeri da frontend radi
curl https://www.uslugar.eu/

# Očekivani odgovor: HTML sadržaj (ne "You Are All Set to Go!")
```

---

## 📋 Detaljne Upute za Upload na Hostinger

### **Metoda 1: File Manager (Web Interface)**

1. **Hostinger Control Panel** → **Websites** → **Manage**
2. Klikni na `uslugar.eu` website
3. **File Manager** tab
4. **Otvori `public_html/` folder**
5. **Upload** gumb → odaberi frontend fajlove
6. **Drag & drop** fajlove u `public_html/`
7. **Provjeri da `index.html` postoji** u root-u

### **Metoda 2: FTP (FileZilla, WinSCP, itd.)**

1. **Hostinger Control Panel** → **Websites** → **Manage**
2. Klikni na `uslugar.eu` website
3. **FTP** tab → **FTP Accounts**
4. **Kreiraj FTP account** (ako ne postoji):
   - **Username**: `uslugar` (ili bilo koji)
   - **Password**: [generiraj siguran password]
   - **Directory**: `public_html/`
5. **Koristi FTP klijent** (FileZilla, WinSCP):
   - **Host**: `ftp.uslugar.eu` (ili IP adresa)
   - **Username**: [FTP username]
   - **Password**: [FTP password]
   - **Port**: 21 (ili 22 za SFTP)
6. **Connect** → **Upload** frontend fajlove u `public_html/`

### **Metoda 3: Git Deploy (Ako Hostinger Podržava)**

1. **Hostinger Control Panel** → **Websites** → **Manage**
2. Klikni na `uslugar.eu` website
3. **Git** tab (ako postoji)
4. **Connect Git repository**
5. **Auto-deploy** kada push-uješ u Git

---

## 🔍 Provjera da Frontend Radi

### **1. Provjeri u Browser-u**

Otvori: `https://www.uslugar.eu/`

**Očekivani rezultat:**
- ✅ Tvoj frontend se prikazuje
- ❌ NE "You Are All Set to Go!" (Hostinger default stranica)

### **2. Provjeri da API Pozivi Rade**

Ako frontend poziva backend API:

```javascript
// Frontend kod bi trebao koristiti:
const API_URL = 'https://api.uslugar.eu/api';
```

**Provjeri u browser console:**
- Nema CORS grešaka
- API pozivi idu na `https://api.uslugar.eu/api/*`

### **3. Provjeri SSL Certificate**

```bash
# Provjeri SSL
curl -I https://www.uslugar.eu/

# Očekivani odgovor: 200 OK (ne greška)
```

---

## ⚠️ Važne Napomene

### **1. Index.html Mora Biti u Root-u**

**Za `www.uslugar.eu` da radi:**
- ✅ `public_html/index.html` mora postojati
- ✅ To je default stranica koju Hostinger servira

**Ako koristiš React/Vue/Angular SPA:**
- Upload **build output** (`dist/` ili `build/` folder)
- Provjeri da `index.html` je u `public_html/` root-u

### **2. SPA Routing (React Router, Vue Router, itd.)**

**Ako koristiš SPA routing, trebaš `.htaccess` fajl:**

**Kreiraj `public_html/.htaccess`:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Ovo osigurava da sve rute idu na `index.html` (SPA routing).**

### **3. API URL u Frontend-u**

**Ažuriraj frontend kod da koristi pravi API URL:**

```javascript
// .env ili environment variable
VITE_API_URL=https://api.uslugar.eu

// ILI u kodu
const API_BASE_URL = 'https://api.uslugar.eu/api';
```

---

## 📋 Checklist

### **Opcija 1: Hostinger Web Hosting**
- [ ] Prijavljen u Hostinger Control Panel
- [ ] Otvoren File Manager za `uslugar.eu`
- [ ] Otvoren `public_html/` folder
- [ ] Obrisani default fajlovi (ako postoje)
- [ ] Upload-ani frontend fajlovi u `public_html/`
- [ ] `index.html` postoji u `public_html/` root-u
- [ ] Provjereno da `www.uslugar.eu` radi
- [ ] Provjereno da API pozivi rade (ako postoje)

### **Opcija 2: Render Static Site**
- [ ] Render Dashboard → New Static Site
- [ ] Connect Git repository
- [ ] Build command konfiguriran
- [ ] Publish directory konfiguriran
- [ ] Environment variable: `VITE_API_URL=https://api.uslugar.eu`
- [ ] Custom Domain: `www.uslugar.eu`
- [ ] Hostinger DNS → CNAME `www` → Render Static Site URL
- [ ] DNS propagacija završena (1-4 sata)
- [ ] Provjereno da `www.uslugar.eu` radi

---

## 🆘 Troubleshooting

### **Problem: "You Are All Set to Go!" Još Uvijek Se Prikazuje**

**Uzrok:** Frontend fajlovi nisu upload-ani ili `index.html` ne postoji

**Rješenje:**
1. ✅ Provjeri da `public_html/index.html` postoji
2. ✅ Provjeri da frontend fajlovi su upload-ani u `public_html/`
3. ✅ Očisti browser cache (Ctrl+F5)
4. ✅ Provjeri da DNS pokazuje na Hostinger hosting (ne Render)

### **Problem: "404 Not Found" za Rute**

**Uzrok:** SPA routing nije konfiguriran (`.htaccess` nedostaje)

**Rješenje:**
1. ✅ Kreiraj `public_html/.htaccess` fajl
2. ✅ Dodaj rewrite rules za SPA routing
3. ✅ Provjeri da mod_rewrite je omogućen na Hostinger-u

### **Problem: API Pozivi Ne Rade (CORS Greške)**

**Uzrok:** Backend CORS nije konfiguriran za `www.uslugar.eu`

**Rješenje:**
1. ✅ Backend CORS → dodaj `https://www.uslugar.eu` u allowed origins
2. ✅ Provjeri da API URL u frontend-u je točan: `https://api.uslugar.eu/api`

---

## ✅ Konačni Koraci

### **Opcija 1: Hostinger Web Hosting**
1. ✅ Upload frontend fajlova u `public_html/`
2. ✅ Provjeri da `index.html` postoji
3. ✅ Testiraj: `https://www.uslugar.eu/`

### **Opcija 2: Render Static Site**
1. ✅ Render Dashboard → Static Site → Custom Domain: `www.uslugar.eu`
2. ✅ Hostinger DNS → CNAME `www` → Render Static Site URL
3. ✅ Čekaj DNS propagaciju (1-4 sata)
4. ✅ Testiraj: `https://www.uslugar.eu/`

**Gotovo!** 🎉 Frontend sada radi na `https://www.uslugar.eu/`!

