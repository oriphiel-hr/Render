# 🔧 API Konfiguracija - Frontend

## Problem riješen:

### ❌ Prije:
```
GET https://uslugar.api.oriph.io/api/categories 404 (Not Found)
                                   ^^^^ dupli /api/
Uncaught SyntaxError: Cannot use 'import.meta' outside a module
```

### ✅ Sada:
- API URL se pravilno konfigurira
- crud.js radi bez ESM syntax-a
- Nema duplog `/api/api/`

---

## 🌍 Environment Varijable

### Development (lokalno):

Kreiraj `.env` fajl u `uslugar/frontend/`:
```env
VITE_API_URL=http://localhost:4000/api
```

**Backend mora biti pokrenut na:**
```bash
cd uslugar/backend
node src/server.js
# Server na http://localhost:4000
```

---

### Production (Hostinger):

**Opcija 1: Backend na istom serveru (relativan path)**
```env
# NE treba VITE_API_URL, koristi default
# api.js će koristiti: /api
```

**Opcija 2: Backend na subdomeni**
```env
VITE_API_URL=https://api.uslugar.oriph.io/api
```

**Opcija 3: AWS Backend**
```env
VITE_API_URL=https://uslugar.api.oriph.io/api
```

---

## 📁 Gdje se konfiguracija postavlja:

### 1. **`src/api.js`** (Axios instance)
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const api = axios.create({ baseURL: API_BASE });
```

**Pozivi:**
```javascript
api.get('/jobs')           → http://localhost:4000/api/jobs
api.get('/categories')     → http://localhost:4000/api/categories
api.post('/auth/login')    → http://localhost:4000/api/auth/login
```

### 2. **`public/assets/js/crud.js`** (CRUD Admin panel)
```javascript
const API_ORIGIN = (window.API_ORIGIN || '').replace(/\/+$/, '');
const API_PREFIX = window.API_PREFIX || '/api/admin';
const API_BASE = API_ORIGIN ? `${API_ORIGIN}${API_PREFIX}` : API_PREFIX;
```

**Postavlja se iz `CrudTab.jsx`:**
```javascript
window.API_ORIGIN = import.meta.env?.VITE_API_URL || '';
window.API_PREFIX = '/api/admin';
```

**Pozivi:**
```javascript
fetch('/api/admin/users')      → server/api/admin/users
fetch('/api/admin/categories') → server/api/admin/categories
```

---

## 🚀 Deployment Setup

### GitHub Actions Build (automatski):

**Za production:** Dodaj GitHub Secret
```
VITE_API_URL=https://uslugar.oriph.io/api
```

**U workflow:**
```yaml
- name: Build frontend
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
  run: npm run build
```

### Ručni Build:

**Development:**
```bash
cd uslugar/frontend
npm run build
# Koristi .env (VITE_API_URL=http://localhost:4000/api)
```

**Production:**
```bash
cd uslugar/frontend
VITE_API_URL=https://uslugar.oriph.io/api npm run build
# ili
export VITE_API_URL=https://uslugar.oriph.io/api
npm run build
```

---

## 🐛 Troubleshooting

### ❌ 404 na API endpoints

**Problem:** Dupli `/api/api/` u URL-u

**Provjeri:**
```bash
# Console u browseru:
console.log(import.meta.env.VITE_API_URL)
```

**Rješenje:**
- Provjeri `.env` fajl - ne stavljaj dupli `/api`
- `VITE_API_URL=http://localhost:4000/api` ✅
- `VITE_API_URL=http://localhost:4000/api/api` ❌

### ❌ CORS greške

**Problem:** Backend ne dozvoljava frontend origin

**Rješenje:** Provjeri backend `.env`:
```env
CORS_ORIGINS=http://localhost:5173,https://uslugar.oriph.io
```

### ❌ `import.meta` greška u crud.js

**Problem:** crud.js se učitava kao regular script, ne kao module

**Rješenje:** ✅ FIXED - crud.js sada koristi `window.API_ORIGIN`

---

## 🔍 Kako testirati konfiguraciju:

### 1. Development mode:
```bash
# Terminal 1: Backend
cd uslugar/backend
node src/server.js

# Terminal 2: Frontend
cd uslugar/frontend
npm run dev

# Browser: http://localhost:5173
# Otvori Console (F12)
# Provjeri Network tab - API pozivi trebaju ići na localhost:4000
```

### 2. Production build test:
```bash
cd uslugar/frontend
VITE_API_URL=https://uslugar.oriph.io/api npm run build
npm run preview

# Browser: http://localhost:4173
# Provjeri Network tab - API pozivi trebaju ići na uslugar.oriph.io
```

### 3. API endpoint test:
```bash
# Backend health check
curl http://localhost:4000/api/health
# Trebao bi vratiti: {"ok":true,"ts":"..."}

# Categories endpoint
curl http://localhost:4000/api/admin/categories
# Trebao bi vratiti JSON ili 401 (ako treba auth)
```

---

## ✅ Checklist prije deploymenta:

- [ ] `.env` kreiran za development
- [ ] `VITE_API_URL` postavljen ispravno
- [ ] Backend pokrenut i radi
- [ ] Frontend test: `npm run dev`
- [ ] Network tab: API pozivi idu na ispravnu adresu
- [ ] Nema CORS grešaka
- [ ] Production build test: `npm run build && npm run preview`

---

## 📝 Примјери ispravnih URL-ova:

### Development:
```
Frontend: http://localhost:5173
Backend:  http://localhost:4000
API:      http://localhost:4000/api

VITE_API_URL=http://localhost:4000/api
```

### Production (Hostinger - isti server):
```
Frontend: https://uslugar.oriph.io
Backend:  https://uslugar.oriph.io/api (Node.js app)
API:      https://uslugar.oriph.io/api

VITE_API_URL=/api (relativan)
```

### Production (Hostinger - subdomena):
```
Frontend: https://uslugar.oriph.io
Backend:  https://api.uslugar.oriph.io
API:      https://api.uslugar.oriph.io/api

VITE_API_URL=https://api.uslugar.oriph.io/api
```

### Production (AWS ECS):
```
Frontend: https://uslugar.oriph.io
Backend:  https://uslugar.api.oriph.io
API:      https://uslugar.api.oriph.io/api

VITE_API_URL=https://uslugar.api.oriph.io/api
```

---

**Status:** ✅ API konfiguracija fixana i dokumentirana!








