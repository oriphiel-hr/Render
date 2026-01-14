# 🌐 Kako Postaviti Frontend i Backend na Isto Domene

## ✅ DA, Možeš Imati I Frontend I Backend na Isto Domene!

Postoje **3 glavne opcije** kako postaviti frontend i backend:

---

## 🎯 Opcija 1: Subdomain Pristup (PREPORUČENO)

### **Struktura:**
- **Frontend**: `uslugar.hr` ili `www.uslugar.hr`
- **Backend API**: `api.uslugar.hr`

### **Prednosti:**
- ✅ **Jednostavno** za postavljanje
- ✅ **Čisto razdvajanje** frontenda i backenda
- ✅ **Lako za održavanje**
- ✅ **CORS nije problem** (različiti subdomain-i)

### **Konfiguracija:**

#### **1. Backend (Render):**
```
Custom Domain: api.uslugar.hr
DNS (Hostinger):
  Type: CNAME
  Name: api
  Value: uslugar.onrender.com
```

#### **2. Frontend (Render ili Hostinger):**
```
Custom Domain: uslugar.hr (ili www.uslugar.hr)
DNS (Hostinger):
  Type: A (za root domain) ili CNAME (za www)
  Name: @ ili www
  Value: [Frontend server IP] ili [Frontend Render URL]
```

### **Primjer:**

**Backend API:**
- URL: `https://api.uslugar.hr`
- Endpoint: `https://api.uslugar.hr/api/health`

**Frontend:**
- URL: `https://uslugar.hr`
- Poziva API: `https://api.uslugar.hr/api/*`

---

## 🎯 Opcija 2: Path Routing (Kompleksnije)

### **Struktura:**
- **Frontend**: `uslugar.hr`
- **Backend API**: `uslugar.hr/api`

### **Prednosti:**
- ✅ **Jedan domain** za sve
- ✅ **Jednostavniji URL** (bez subdomain-a)

### **Mane:**
- ❌ **Zahtijeva reverse proxy** (nginx, Cloudflare, itd.)
- ❌ **Kompleksnija konfiguracija**
- ❌ **CORS konfiguracija** potrebna (isti domain)

### **Konfiguracija:**

#### **1. Koristiti Reverse Proxy (nginx):**

```nginx
# nginx.conf
server {
    listen 80;
    server_name uslugar.hr;

    # Frontend (static files)
    location / {
        root /var/www/frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass https://uslugar.onrender.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### **2. ILI Koristiti Cloudflare Workers (Reverse Proxy):**

Cloudflare Workers može route-ovati zahtjeve:
- `/api/*` → Render backend
- `/*` → Frontend

---

## 🎯 Opcija 3: Render za Oboje (Najjednostavnije)

### **Struktura:**
- **Frontend**: Render Static Site ili Web Service (`www.uslugar.hr`)
- **Backend**: Render Web Service (`api.uslugar.hr`)

### **Prednosti:**
- ✅ **Sve na Render-u** (jednostavno održavanje)
- ✅ **Automatski SSL** za oboje
- ✅ **Jednostavna konfiguracija**

### **Konfiguracija:**

#### **1. Backend (Render Web Service):**
```
Service: uslugar-backend
Custom Domain: api.uslugar.hr
DNS: CNAME api → uslugar.onrender.com
```

#### **2. Frontend (Render Static Site ILI Web Service):**

**Opcija A: Static Site (Preporučeno za React/Vue/Angular SPA)**
```
Service: uslugar-frontend (Static Site)
Custom Domain: uslugar.hr
DNS: A @ → [Render Static IP] ili CNAME → [Render Static URL]
```

**Opcija B: Web Service (Ako frontend ima server-side rendering)**
```
Service: uslugar-frontend (Web Service)
Custom Domain: uslugar.hr
DNS: A @ → [Render Web Service IP] ili CNAME → [Render Web Service URL]
```

---

## 📋 Detaljne Upute za Subdomain Pristup (Opcija 1)

### **Korak 1: Backend na Render-u (api.uslugar.hr)**

1. **Render Dashboard** → Tvoj Backend Service → **Settings**
2. **Custom Domains** → **Add Custom Domain**
3. Unesi: `api.uslugar.hr`
4. Render će pokazati DNS zapis:
   ```
   Type: CNAME
   Name: api
   Value: uslugar.onrender.com
   ```

5. **Hostinger DNS** → Dodaj CNAME:
   ```
   Type: CNAME
   Name: api
   Value: uslugar.onrender.com
   TTL: 3600
   ```

6. **Čekaj DNS propagaciju** (1-4 sata)

### **Korak 2: Frontend na Render-u (uslugar.hr)**

#### **Ako Frontend je Static Site (React/Vue/Angular SPA):**

1. **Render Dashboard** → **New** → **Static Site**
2. **Connect** tvoj Git repository (frontend kod)
3. **Root Directory**: `frontend` (ili gdje je frontend kod)
4. **Build Command**: `npm run build` (ili `yarn build`)
5. **Publish Directory**: `dist` (ili `build`, ovisno o frameworku)
6. **Custom Domain** → Add: `uslugar.hr`
7. Render će pokazati DNS zapis:
   ```
   Type: A
   Name: @
   Value: [Render Static IP] (Render će dati IP)
   ```

8. **Hostinger DNS** → Dodaj A record:
   ```
   Type: A
   Name: @
   Value: [Render Static IP]
   TTL: 3600
   ```

#### **Ako Frontend je Web Service (Next.js SSR, itd.):**

1. **Render Dashboard** → **New** → **Web Service**
2. **Connect** tvoj Git repository
3. **Root Directory**: `frontend`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start` (ili `node server.js`)
6. **Custom Domain** → Add: `uslugar.hr`
7. **Hostinger DNS** → Dodaj A record ili CNAME (Render će reći što koristiti)

### **Korak 3: Ažuriraj Frontend API URL**

U frontend kodu, ažuriraj API base URL:

**Environment Variable (`.env` ili Render Environment):**
```env
VITE_API_URL=https://api.uslugar.hr
# ILI
REACT_APP_API_URL=https://api.uslugar.hr
# ILI
NEXT_PUBLIC_API_URL=https://api.uslugar.hr
```

**Primjer u kodu:**
```javascript
// frontend/.env
VITE_API_URL=https://api.uslugar.hr

// frontend/src/api/config.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.uslugar.hr';

export default API_BASE_URL;
```

### **Korak 4: CORS Konfiguracija u Backend-u**

U backend kodu (`src/server.js` ili gdje konfiguriraš CORS):

```javascript
// Dopusti CORS za frontend domain
const corsOptions = {
  origin: [
    'https://uslugar.hr',
    'https://www.uslugar.hr',
    'http://localhost:5173', // za lokalni development
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## 📋 Detaljne Upute za Render Static Site

### **1. Pripremi Frontend za Production Build**

**React/Vue/Vite:**
```bash
# Build frontend
npm run build
# Output: dist/ ili build/
```

**Next.js:**
```bash
# Build frontend
npm run build
# Output: .next/
```

### **2. Render Static Site Setup**

1. **Render Dashboard** → **New** → **Static Site**
2. **Connect Repository**: Tvoj Git repository
3. **Name**: `uslugar-frontend`
4. **Root Directory**: `frontend` (ili gdje je frontend kod)
5. **Build Command**: `npm install && npm run build`
6. **Publish Directory**: `dist` (ili `build`)
7. **Environment Variables**: Dodaj `VITE_API_URL=https://api.uslugar.hr`
8. **Custom Domain**: `uslugar.hr`
9. **Create Static Site**

### **3. DNS Postavke**

Render će dati DNS zapise:
- **A Record** za root domain (`@`)
- **CNAME** za www subdomain (`www`)

**Hostinger DNS:**
```
Type: A
Name: @
Value: [Render Static IP]
TTL: 3600

Type: CNAME
Name: www
Value: [Render Static Site URL]
TTL: 3600
```

---

## 🎯 Preporučena Konfiguracija

### **Najbolja Opcija: Subdomain Pristup na Render-u**

```
Frontend: uslugar.hr (Render Static Site)
Backend:  api.uslugar.hr (Render Web Service)
```

**Prednosti:**
- ✅ **Jednostavno** za postavljanje
- ✅ **Automatski SSL** za oboje
- ✅ **Lako održavanje** (sve na Render-u)
- ✅ **Dobro performanse**
- ✅ **Skalabilno**

---

## 📋 Checklist

### **Backend (api.uslugar.hr):**
- [ ] Render Dashboard → Backend Service → Custom Domain → `api.uslugar.hr`
- [ ] Hostinger DNS → CNAME `api` → `uslugar.onrender.com`
- [ ] DNS propagacija završena (1-4 sata)
- [ ] SSL certifikat aktivan
- [ ] CORS konfiguriran za `https://uslugar.hr`
- [ ] Testirao: `curl https://api.uslugar.hr/api/health`

### **Frontend (uslugar.hr):**
- [ ] Render Dashboard → New Static Site (ili Web Service)
- [ ] Connect Git repository
- [ ] Build command konfiguriran (`npm run build`)
- [ ] Publish directory konfiguriran (`dist` ili `build`)
- [ ] Environment variable: `VITE_API_URL=https://api.uslugar.hr`
- [ ] Custom Domain → `uslugar.hr`
- [ ] Hostinger DNS → A record `@` → [Render IP]
- [ ] DNS propagacija završena
- [ ] SSL certifikat aktivan
- [ ] Frontend poziva `https://api.uslugar.hr/api/*`

---

## 🆘 Troubleshooting

### **Problem: Frontend ne može pristupiti Backend API-u**

**Uzrok:** CORS nije konfiguriran ili frontend URL je pogrešan

**Rješenje:**
1. ✅ Provjeri CORS konfiguraciju u backend-u
2. ✅ Provjeri da frontend koristi `https://api.uslugar.hr` (ne `http://`)
3. ✅ Provjeri environment variables u Render Dashboard-u

### **Problem: Frontend pokazuje 404 za rute**

**Uzrok:** Static Site ne zna kako servirati SPA rute

**Rješenje:**
1. ✅ Render Static Site automatski servira `index.html` za sve rute
2. ✅ Provjeri da frontend `index.html` postoji u publish directory
3. ✅ Provjeri da build komanda radi ispravno

### **Problem: SSL certifikat ne radi za frontend**

**Uzrok:** DNS propagacija nije završena ili DNS zapisi su pogrešni

**Rješenje:**
1. ✅ Provjeri DNS propagaciju na https://dnschecker.org
2. ✅ Provjeri da DNS zapisi su točni u Hostingeru
3. ✅ Čekaj da Render generira SSL certifikat (može trajati nekoliko sati)

---

## ✅ Konačni Sažetak

**DA, možeš imati i frontend i backend na isto domeni!**

**Preporučena konfiguracija:**
- **Frontend**: `uslugar.hr` (Render Static Site)
- **Backend**: `api.uslugar.hr` (Render Web Service)

**Koraci:**
1. ✅ Backend → Render Custom Domain: `api.uslugar.hr`
2. ✅ Frontend → Render Static Site → Custom Domain: `uslugar.hr`
3. ✅ Hostinger DNS → Dodaj oba DNS zapisa
4. ✅ Ažuriraj frontend API URL: `https://api.uslugar.hr`
5. ✅ Konfiguriraj CORS u backend-u za `https://uslugar.hr`

**Gotovo!** 🎉

