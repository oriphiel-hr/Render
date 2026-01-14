# 🌐 Konfiguracija za uslugar.eu Domenu

## ✅ Da, Workflow će Kopirati Datoteke na Pravo Mjesto!

Za domenu `uslugar.eu`, workflow će kopirati datoteke u **`public_html/`** folder (root folder za tu domenu).

---

## 📋 Trenutna Konfiguracija

### **Workflow Konfiguracija:**

```yaml
env:
  SERVER_DIR: ${{ secrets.HOSTINGER_SERVER_DIR && secrets.HOSTINGER_SERVER_DIR || 'public_html/' }}
```

**Default vrijednost:** `public_html/` (root folder za `uslugar.eu` domenu)

### **FTP Deployment:**

```yaml
- name: Deploy via FTP
  with:
    local-dir: frontend/dist/      # Izvor
    server-dir: public_html/       # Odredište (root za uslugar.eu)
```

**Rezultat:** Sve datoteke iz `frontend/dist/` → `public_html/` na Hostinger serveru

---

## 🎯 Struktura na Hostinger Serveru

### **Za `uslugar.eu` Domenu:**

```
Hostinger FTP Server
└── public_html/              ← Root folder za uslugar.eu
    ├── index.html           ← Frontend (kopirano iz frontend/dist/)
    ├── assets/              ← Frontend assets (kopirano)
    ├── sw.js                ← Service Worker (kopirano)
    ├── uslugar.ico          ← Favicon (kopirano)
    └── .htaccess            ← SPA routing (upload-ano)
```

**Ovo je ispravno!** `public_html/` je root folder za `uslugar.eu` domenu.

---

## ⚠️ Razlika: Stari vs Novi Setup

### **Stari Setup (AWS projekt):**
```
public_html/uslugar/         ← Subfolder za stari domain
```

### **Novi Setup (Render projekt - uslugar.eu):**
```
public_html/                 ← Root folder za uslugar.eu domain
```

**Za novu domenu `uslugar.eu`, koristi `public_html/` (root folder)!**

---

## ✅ Provjera Konfiguracije

### **1. Provjeri GitHub Secret (Opcionalno):**

Ako želiš eksplicitno postaviti `HOSTINGER_SERVER_DIR`:

**GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**:
- **Name**: `HOSTINGER_SERVER_DIR`
- **Value**: `public_html/` (za `uslugar.eu` root domain)

**ILI ostavi prazno** - workflow će koristiti default `public_html/`.

### **2. Provjeri da Workflow Koristi Pravi Folder:**

Workflow automatski koristi:
- `public_html/` (default) - **TOČNO za uslugar.eu!**
- ILI `HOSTINGER_SERVER_DIR` secret (ako je postavljen)

**Oba su ispravna za `uslugar.eu` domenu!**

---

## 🔍 Kako Provjeriti da Je To Pravo Mjesto

### **1. Provjeri u Hostinger Control Panel:**

1. **Hostinger Control Panel** → **Websites** → **Manage**
2. Klikni na `uslugar.eu` website
3. **File Manager** → Otvori `public_html/` folder
4. **Ovo je root folder** za `uslugar.eu` domenu

### **2. Provjeri FTP Strukturu:**

**Preko FileZilla:**
- Connect na FTP: `194.5.156.10`
- Navigate do: `/public_html/`
- **Ovo je root folder** za `uslugar.eu`

### **3. Provjeri da Website Radi:**

Nakon deployment-a:
- Otvori: `https://uslugar.eu/`
- Trebao bi vidjeti frontend (ako je `public_html/index.html` postavljen)

---

## 📋 Checklist za uslugar.eu Domenu

- [ ] `HOSTINGER_SERVER_DIR` je postavljen na `public_html/` (ili default)
- [ ] Workflow kopira u `public_html/` (root folder)
- [ ] Frontend fajlovi su u `public_html/` (ne `public_html/uslugar/`)
- [ ] `index.html` je u `public_html/` root-u
- [ ] `.htaccess` je u `public_html/` root-u
- [ ] Website radi: `https://uslugar.eu/`

---

## 🆘 Troubleshooting

### **Problem: Datoteke Nisu Na Pravom Mjestu**

**Uzrok:** `HOSTINGER_SERVER_DIR` je možda postavljen na `public_html/uslugar/` (stari setup)

**Rješenje:**
1. ✅ Provjeri GitHub Secret `HOSTINGER_SERVER_DIR` = `public_html/` (ne `public_html/uslugar/`)
2. ✅ ILI obriši secret - workflow će koristiti default `public_html/`
3. ✅ Provjeri da workflow kopira u `public_html/` (ne subfolder)

### **Problem: Website Ne Prikazuje Frontend**

**Uzrok:** Datoteke su možda u krivom folderu ili `index.html` ne postoji

**Rješenje:**
1. ✅ Provjeri da `public_html/index.html` postoji
2. ✅ Provjeri da `public_html/assets/` folder postoji
3. ✅ Provjeri da DNS pokazuje na Hostinger hosting (ne Render)
4. ✅ Provjeri da `www.uslugar.eu` CNAME pokazuje na `uslugar.eu` (ili Hostinger hosting)

---

## ✅ Konačni Odgovor

**DA, workflow će kopirati datoteke na pravo mjesto!**

**Za `uslugar.eu` domenu:**
- ✅ **Server Directory**: `public_html/` (root folder)
- ✅ **Workflow kopira**: `frontend/dist/*` → `public_html/*`
- ✅ **Rezultat**: `https://uslugar.eu/` prikazuje frontend iz `public_html/`

**Konfiguracija je već ispravna!** Samo provjeri da GitHub Secrets su postavljeni i pokreni workflow.

---

## 📝 Napomene

### **1. Root Domain vs Subdomain:**

**Za `uslugar.eu` (root domain):**
- ✅ `public_html/` - root folder

**Za `www.uslugar.eu` (subdomain):**
- ✅ Također `public_html/` (ako `www` CNAME pokazuje na root domain)
- ✅ ILI `public_html/www/` (ako je subdomain folder)

**Za `api.uslugar.eu` (subdomain):**
- ✅ Ne koristi `public_html/` - pokazuje na Render servis (DNS CNAME)

### **2. Default vs Custom Server Directory:**

**Default (ako nema secret):**
```
HOSTINGER_SERVER_DIR = public_html/
```

**Custom (ako postoji secret):**
```
HOSTINGER_SERVER_DIR = [vrijednost iz secret-a]
```

**Oba su ispravna za `uslugar.eu`!**

---

## ✅ Provjera Prije Deployment-a

1. ✅ **GitHub Secrets** su postavljeni:
   - `HOSTINGER_HOST=194.5.156.10`
   - `HOSTINGER_USERNAME=u208993221`
   - `HOSTINGER_PASSWORD=G73S3ebakh6O!`
   - `HOSTINGER_SERVER_DIR=public_html/` (opcionalno - default je već `public_html/`)

2. ✅ **Workflow** će kopirati u `public_html/` (root za `uslugar.eu`)

3. ✅ **Website** će raditi na `https://uslugar.eu/`

**Gotovo!** 🎉 Workflow je ispravno konfiguriran za `uslugar.eu` domenu!

