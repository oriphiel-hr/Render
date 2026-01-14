# 🚀 Frontend Deployment Guide

## Quick Deploy

```powershell
cd uslugar/frontend
.\deploy-fresh-build.ps1
```

## Opcije

### Standardni deploy (build + upload)
```powershell
.\deploy-fresh-build.ps1
```

### Deploy bez build-a (koristi postojeći dist)
```powershell
.\deploy-fresh-build.ps1 -SkipBuild
```

### Deploy bez potvrde
```powershell
.\deploy-fresh-build.ps1 -Force
```

### Kombinacija
```powershell
.\deploy-fresh-build.ps1 -SkipBuild -Force
```

## Što skripta radi?

1. ✅ **Testira FTP konekciju** - provjerava da li server odgovara
2. ✅ **Build-a frontend** - pokreće `npm run build`
3. ✅ **Briše stari dist folder** - osigurava čist build
4. ✅ **Upload-uje index.html** - glavni HTML fajl
5. ✅ **Upload-uje assets/** - svi JavaScript i CSS fajlovi
6. ✅ **Upload-uje ostale fajlove** - ikone, itd.

## FTP Konfiguracija

Skripta koristi ove podrazumijevane vrijednosti:
- **Host:** `194.5.156.10`
- **User:** `u208993221`
- **Password:** `G73S3ebakh6O!`
- **Path:** `/public_html/uslugar/`

Ako trebaš promijeniti, edituj skriptu ili dodaj parametre.

## Nakon Deploy-a

### 1. Clear Browser Cache
- **Edge/Chrome:** `Ctrl + Shift + R` (Hard Refresh)
- **Firefox:** `Ctrl + F5`

### 2. Unregister Service Workers
1. Otvori Developer Tools (`F12`)
2. **Application** tab → **Service Workers**
3. Klikni **Unregister** za sve service workere

### 3. Clear Site Data
1. Developer Tools (`F12`)
2. **Application** tab → **Storage**
3. Klikni **Clear site data**

### 4. Test
- Otvori: `https://uslugar.oriph.io`
- Provjeri da li se stranica učitava bez preusmjeravanja

## Troubleshooting

### ❌ FTP Connection Failed
- Provjeri FTP credentials
- Provjeri da li je server dostupan
- Provjeri firewall settings

### ❌ Build Failed
- Provjeri da li su svi dependencies instalirani: `npm install`
- Provjeri da li postoji `.env` fajl (opcionalno)
- Provjeri Node.js verziju: `node --version` (treba biti 20.x)

### ❌ Upload Failed
- Provjeri FTP credentials
- Provjeri da li postoji dovoljno prostora na serveru
- Provjeri permissions na serveru

### ⚠️ Stranica još uvijek preusmjerava
- Provjeri Hostinger Control Panel → Domains → Redirects
- Provjeri CDN cache (ako koristiš CloudFlare, purge cache)
- Provjeri da li postoji stari `.htaccess` na serveru s redirect logikom

## Alternative: Manual Upload (FileZilla)

Ako skripta ne radi, možeš ručno upload-ovati:

1. **Build frontend:**
   ```powershell
   npm run build
   ```

2. **Otvori FileZilla:**
   - Host: `194.5.156.10`
   - User: `u208993221`
   - Password: `G73S3ebakh6O!`

3. **Navigate:**
   - Remote: `/public_html/uslugar/`
   - Local: `C:\GIT_PROJEKTI\AWS\AWS_projekti\uslugar\frontend\dist\`

4. **Upload:**
   - Selektuj SVE fajlove iz `dist/`
   - Drag & drop u `public_html/uslugar/`
   - Overwrite postojeće fajlove

## Alternative: GitHub Actions

Ako push-uješ na `main` branch, GitHub Actions će automatski:
1. Build-ati frontend
2. Upload-ovati na FTP server

Workflow: `.github/workflows/frontend-uslugar.yml`

