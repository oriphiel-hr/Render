# 🚫 Rješavanje 403 Forbidden Greške na www.uslugar.eu

## ❌ Problem

```
GET https://www.uslugar.eu/ 403 (Forbidden)
```

**403 Forbidden** znači da server odbija pristup zbog:
- Permissions problema
- Nedostajućih fajlova
- FTP deployment nije uspješan
- Index.html ne postoji

---

## 🔍 Provjera Problema

### **1. Provjeri da FTP Deployment je Uspješan**

**GitHub Actions → Workflow Logs:**
1. Idi na: GitHub Repository → **Actions** tab
2. Pronađi najnoviji **Frontend - Build & Deploy (Hostinger)** run
3. Provjeri da **Deploy via FTP** korak je **success** (zeleno ✅)

**Ako deployment ne radi:**
- Provjeri **FTP credentials** u GitHub Secrets
- Vidi grešku u workflow logovima
- Vidi dokumentaciju: `.github/workflows/HOSTINGER-FTP-CREDENTIALS.md`

---

### **2. Provjeri da Fajlovi Postoje na Serveru**

**Preko FTP klijenta (FileZilla):**
1. Konektiraj se na FTP:
   - Host: `194.5.156.10`
   - Username: `u208993221`
   - Password: `G73S3ebakh6O!`
   - Port: `21`
2. Otvori `public_html/` folder
3. **Provjeri da postoje:**
   - ✅ `index.html` (mora postojati!)
   - ✅ `assets/` folder
   - ✅ `.htaccess` fajl

**Ako fajlovi ne postoje:**
- FTP deployment nije uspješan
- Provjeri GitHub Actions workflow logs

---

### **3. Provjeri Permissions na Serveru**

**Preko Hostinger File Manager:**
1. **Hostinger Control Panel** → **Websites** → **Manage**
2. Klikni na `uslugar.eu` website
3. **File Manager** tab
4. Otvori `public_html/` folder
5. **Provjeri permissions:**
   - `index.html` → **644** (rw-r--r--)
   - Folders → **755** (rwxr-xr-x)
   - `.htaccess` → **644** (rw-r--r--)

**Ako permissions nisu ispravni:**
1. Desni klik na `index.html` → **Change Permissions**
2. Postavi na **644** (Read: Owner, Group, Others; Write: Owner only)
3. Za foldere: **755** (Execute: Owner, Group, Others; Read: All; Write: Owner only)

---

### **4. Provjeri .htaccess Fajl**

**Preko File Manager ili FTP:**
1. Provjeri da `public_html/.htaccess` postoji
2. Otvori fajl i provjeri da sadrži:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Don't rewrite API calls
  RewriteCond %{REQUEST_URI} !^/api/
  
  # Don't rewrite assets (CSS, JS, images, etc.)
  RewriteCond %{REQUEST_URI} !^/assets/
  
  # Rewrite everything else to index.html (for SPA routing)
  RewriteRule ^ index.html [L]
</IfModule>
```

**Ako .htaccess ne postoji:**
- Upload `frontend/public/.htaccess` na `public_html/.htaccess`
- Ili kreiraj novi .htaccess fajl s gornjim sadržajem

---

## 🔧 Rješenja

### **Rješenje 1: Ručni Upload Index.html**

**Ako FTP deployment ne radi:**
1. Lokalno buildaj frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Preko FileZilla, upload `frontend/dist/index.html` na `public_html/index.html`
3. Upload cijeli `frontend/dist/assets/` folder na `public_html/assets/`

---

### **Rješenje 2: Fiksaj Permissions**

**Preko Hostinger File Manager:**
1. **File Manager** → `public_html/`
2. **Select All** fajlove
3. **Change Permissions**:
   - Files: **644**
   - Folders: **755**
4. **Apply to subdirectories**: ✅ (check)

**ILI preko FTP klijenta:**
- FileZilla → Desni klik → File permissions → 644 (fajlovi) ili 755 (folderi)

---

### **Rješenje 3: Provjeri Hostinger Control Panel**

**Hostinger Control Panel → Websites → Manage:**
1. Provjeri da `uslugar.eu` domena je aktivna
2. Provjeri da **Document Root** pokazuje na `public_html/`
3. Provjeri da nema **Custom Index Files** koje override-aju `index.html`

---

### **Rješenje 4: Očisti Browser Cache**

**Ponekad je problem u browser cache-u:**
1. Očisti browser cache (Ctrl+Shift+Delete)
2. Ili otvori u **Incognito/Private mode**
3. Ili hard refresh: **Ctrl+F5**

---

### **Rješenje 5: Provjeri DNS i Redirects**

**Hostinger Control Panel → Domains:**
1. Provjeri da **DNS** pokazuje na Hostinger hosting (ne Render)
2. Provjeri da **nema redirects** koji blokiraju pristup
3. Provjeri da **SSL Certificate** je aktivan

---

## 🧪 Testiranje

### **Test 1: Provjeri da Index.html Postoji**

```bash
# Preko curl (iz terminala)
curl -I https://www.uslugar.eu/

# Očekivani odgovor:
# HTTP/1.1 200 OK (ne 403 Forbidden)
```

### **Test 2: Provjeri da Assets Se Učitavaju**

Otvorite browser Developer Tools (F12):
1. **Network** tab
2. Reload stranicu (F5)
3. Provjeri da `assets/` fajlovi se učitavaju (200 OK)

---

## ⚠️ Uobičajeni Problemi

### **Problem 1: FTP Deployment Failed**

**Uzrok:** FTP credentials su pogrešni ili FTP nije omogućen

**Rješenje:**
1. Provjeri GitHub Secrets (HOSTINGER_HOST, HOSTINGER_USERNAME, HOSTINGER_PASSWORD)
2. Testiraj FTP konekciju ručno (FileZilla)
3. Kontaktiraj Hostinger support ako FTP ne radi

### **Problem 2: Index.html Ne Postoji**

**Uzrok:** FTP deployment nije kopirao `index.html`

**Rješenje:**
1. Ručno upload `frontend/dist/index.html` na `public_html/index.html`
2. Provjeri da build output (`frontend/dist/`) sadrži `index.html`

### **Problem 3: Permissions Problem**

**Uzrok:** Fajlovi nemaju ispravne permissions

**Rješenje:**
1. Postavi `index.html` na **644**
2. Postavi foldere na **755**
3. Provjeri da owner je ispravan (obično FTP user)

---

## ✅ Checklist

- [ ] FTP deployment je **success** u GitHub Actions
- [ ] `public_html/index.html` **postoji** na serveru
- [ ] `public_html/assets/` folder **postoji**
- [ ] `public_html/.htaccess` **postoji**
- [ ] Permissions: Files **644**, Folders **755**
- [ ] Browser cache je **očišćen**
- [ ] DNS pokazuje na **Hostinger hosting** (ne Render)
- [ ] Nema **redirects** koji blokiraju pristup

---

## 🆘 Ako Ništa Ne Pomaže

1. **Kontaktiraj Hostinger Support:**
   - Email: support@hostinger.com
   - Chat: Hostinger Control Panel → Support
   - Opiši problem: "403 Forbidden na www.uslugar.eu, index.html postoji, permissions su ispravni"

2. **Provjeri Hostinger Documentation:**
   - File permissions: https://www.hostinger.com/tutorials/how-to-set-up-file-permissions
   - .htaccess: https://www.hostinger.com/tutorials/htaccess-guide

3. **Alternative Deployment:**
   - Koristi **Render Static Site** umjesto Hostinger hosting
   - Ili **GitHub Pages** za statički frontend

---

## 📝 Napomene

- **403 Forbidden** je obično problem s **permissions** ili **nedostajućim fajlovima**
- **Provjeri prvo** da FTP deployment je uspješan
- **Ručni upload** može pomoći ako automation ne radi
- **Permissions** moraju biti točni (644 za fajlove, 755 za foldere)

