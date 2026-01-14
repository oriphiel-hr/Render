# 📋 Kako GitHub Actions Workflow Kopira Datoteke

## ✅ Render Workflow Već Ima Logiku za Kopiranje Datoteka

Workflow automatski kopira datoteke iz build output foldera (`frontend/dist/`) na Hostinger FTP server (`public_html/`).

---

## 🔄 Kako Workflow Kopira Datoteke

### **1. Build Frontend**

Workflow build-a frontend aplikaciju:
```bash
cd frontend
npm ci && npm run build
```

**Build output** se generira u:
- `frontend/dist/` (Vite, Vue, React)
- `frontend/build/` (Create React App)
- `frontend/out/` (Next.js export)

### **2. Detektira Build Output Folder**

Workflow automatski detektira gdje je build output:
```yaml
- name: Detect output dir
  id: detect
  working-directory: ${{ env.FRONTEND_DIR }}
  run: |
    # Traži dist/, build/, out/, itd.
    # Pronalazi folder s index.html
```

**Rezultat:** `steps.detect.outputs.dir` = `dist` (ili `build`, `out`, itd.)

### **3. Kopira Datoteke Preko FTP-a**

Workflow koristi `FTP-Deploy-Action` za kopiranje:

```yaml
- name: Deploy via FTP
  uses: SamKirkland/FTP-Deploy-Action@v4.3.6
  with:
    local-dir: ${{ env.FRONTEND_DIR }}/${{ steps.detect.outputs.dir }}/
    # Primjer: frontend/dist/
    
    server-dir: ${{ env.SERVER_DIR }}
    # Primjer: public_html/
```

**Što se kopira:**
- ✅ Sve datoteke iz `frontend/dist/` → `public_html/`
- ✅ `index.html` → `public_html/index.html`
- ✅ `assets/` folder → `public_html/assets/`
- ✅ Sve CSS, JS, image fajlovi
- ✅ Sve statičke datoteke

**Što se NE kopira (excluded):**
- ❌ `.git/` folder
- ❌ `node_modules/` folder
- ❌ `.DS_Store` fajlovi

### **4. Upload .htaccess Fajla**

Workflow također uploada `.htaccess` fajl za SPA routing:

```yaml
- name: Upload .htaccess file
  run: |
    # Traži .htaccess u više lokacija:
    # - frontend/.htaccess
    # - frontend/public/.htaccess
    # - frontend/dist/.htaccess
    # Uploada na public_html/.htaccess
```

---

## 📋 Detaljno: Što Se Kopira

### **Izvor (Lokalno):**
```
frontend/
└── dist/                    ← Build output folder
    ├── index.html           ← Main HTML file
    ├── assets/              ← CSS, JS, images
    │   ├── index-*.css
    │   ├── index-*.js
    │   └── ...
    ├── sw.js                ← Service Worker
    └── uslugar.ico          ← Favicon
```

### **Odredište (Hostinger FTP):**
```
public_html/                 ← Root folder za www.uslugar.eu
    ├── index.html           ← Kopirano iz frontend/dist/
    ├── assets/              ← Kopirano iz frontend/dist/assets/
    │   ├── index-*.css
    │   ├── index-*.js
    │   └── ...
    ├── sw.js                ← Kopirano iz frontend/dist/
    ├── uslugar.ico          ← Kopirano iz frontend/dist/
    └── .htaccess            ← Upload-ano zasebno
```

---

## 🔄 Workflow Koraci (Detaljno)

### **Korak 1: Checkout Repository**
```yaml
- name: Checkout
  uses: actions/checkout@v4
```
**Rezultat:** Cijeli Git repository je kloniran

### **Korak 2: Build Frontend**
```yaml
- name: Build
  working-directory: frontend
  run: npm ci && npm run build
```
**Rezultat:** `frontend/dist/` folder je kreiran s build output-om

### **Korak 3: Detektira Build Output**
```yaml
- name: Detect output dir
  id: detect
  run: |
    # Pronalazi dist/, build/, out/ folder s index.html
```
**Rezultat:** `steps.detect.outputs.dir` = `dist`

### **Korak 4: Kopira Preko FTP-a**
```yaml
- name: Deploy via FTP
  uses: SamKirkland/FTP-Deploy-Action@v4.3.6
  with:
    local-dir: frontend/dist/     # Izvor
    server-dir: public_html/      # Odredište
```
**Rezultat:** Sve datoteke iz `frontend/dist/` su kopirane u `public_html/`

### **Korak 5: Upload .htaccess**
```yaml
- name: Upload .htaccess file
  run: |
    curl -T frontend/public/.htaccess \
      ftp://host/public_html/.htaccess
```
**Rezultat:** `.htaccess` fajl je upload-an za SPA routing

---

## 📊 Usporedba: AWS vs Render Workflow

### **AWS Workflow:**
```yaml
env:
  FRONTEND_DIR: uslugar/frontend
  SERVER_DIR: public_html/

local-dir: uslugar/frontend/dist/
server-dir: public_html/
```

### **Render Workflow:**
```yaml
env:
  FRONTEND_DIR: frontend
  SERVER_DIR: public_html/

local-dir: frontend/dist/
server-dir: public_html/
```

**Razlika:** Samo putanje su drugačije (`uslugar/frontend` vs `frontend`), ali logika kopiranja je ista!

---

## ✅ Provjera da Kopiranje Radi

### **1. Provjeri Build Output:**

Nakon build-a, provjeri da `frontend/dist/` postoji:
```bash
cd frontend
npm run build
ls -la dist/
# Trebao bi vidjeti: index.html, assets/, sw.js, itd.
```

### **2. Provjeri FTP Deployment:**

Nakon deployment-a, provjeri na Hostinger serveru:
```bash
# Preko FileZilla ili SSH
ls -la public_html/
# Trebao bi vidjeti: index.html, assets/, sw.js, .htaccess
```

### **3. Provjeri Website:**

Otvori u browser-u:
```
https://www.uslugar.eu/
```

**Očekivani rezultat:**
- ✅ Frontend se prikazuje
- ✅ CSS i JS se učitavaju
- ✅ SPA routing radi (nema 404 za rute)

---

## 🔍 Troubleshooting

### **Problem: "Nije nađen build output (index.html)"**

**Uzrok:** Build nije uspješan ili build output folder ne postoji

**Rješenje:**
1. ✅ Provjeri da `npm run build` radi lokalno
2. ✅ Provjeri da `frontend/dist/index.html` postoji nakon build-a
3. ✅ Provjeri da build command je točan u workflow-u

### **Problem: "FTP Deployment failed"**

**Uzrok:** FTP konekcija ne radi ili credentials su pogrešni

**Rješenje:**
1. ✅ Provjeri GitHub Secrets (HOSTINGER_HOST, HOSTINGER_USERNAME, HOSTINGER_PASSWORD)
2. ✅ Provjeri FTP konekciju ručno (FileZilla)
3. ✅ Provjeri da server-dir je točan (`public_html/`)

### **Problem: "Datoteke nisu kopirane"**

**Uzrok:** FTP deployment je neuspješan ili datoteke su u krivom folderu

**Rješenje:**
1. ✅ Provjeri GitHub Actions logs - vidiš li "Uploading files..."?
2. ✅ Provjeri da `local-dir` je točan (`frontend/dist/`)
3. ✅ Provjeri da `server-dir` je točan (`public_html/`)
4. ✅ Provjeri na Hostinger serveru da datoteke postoje

---

## ✅ Konačni Sažetak

**Workflow automatski:**

1. ✅ **Build-a** frontend aplikaciju (`npm run build`)
2. ✅ **Detektira** build output folder (`dist/`, `build/`, `out/`)
3. ✅ **Kopira** sve datoteke iz `frontend/dist/` → `public_html/` preko FTP-a
4. ✅ **Uploada** `.htaccess` fajl za SPA routing

**Sve je već konfigurirano - samo trebaš:**
- ✅ Dodati GitHub Secrets (HOSTINGER_HOST, HOSTINGER_USERNAME, HOSTINGER_PASSWORD)
- ✅ Push-ati promjene u `frontend/` folderu
- ✅ ILI ručno pokrenuti workflow iz GitHub Actions taba

**Gotovo!** 🎉 Workflow će automatski kopirati sve datoteke!

