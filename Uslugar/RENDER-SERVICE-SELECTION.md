# 🎯 Render.com - Što Odabrati?

## ✅ Za Backend (API Server)

**Odaberi: "New Web Service"** ⭐

**Zašto:**
- ✅ Dinamički web app (Node.js backend)
- ✅ API server (Express.js)
- ✅ Potrebno environment variables
- ✅ Potrebna baza podataka (PostgreSQL)
- ✅ Pokreće se s `node src/server.js`

**Konfiguracija:**
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `node src/server.js`
- **Root Directory:** `uslugar/backend` (ili gdje se nalazi backend kod)

---

## ✅ Za Frontend (React/Vite App)

**Odaberi: "New Static Site"** ⭐

**Zašto:**
- ✅ Statički sadržaj (build-ani HTML/JS/CSS)
- ✅ Već deploy-an na Hostingeru
- ✅ Globalni CDN za brže učitavanje

**ALI:** Pošto već imaš frontend na Hostingeru, možda ne trebaš Render.com Static Site!

**Alternativa:** 
- **Ostavi frontend na Hostingeru** (kao što je sada)
- Samo backend na Render.com

---

## 🎯 Preporuka

### Opcija 1: Backend na Render.com + Frontend na Hostingeru (Preporučeno) ⭐

**Zašto:**
- ✅ Frontend već radi na Hostingeru
- ✅ Nema potrebe za migraciju frontenda
- ✅ Samo backend migracija (lakše)

**Render.com servisi:**
1. **PostgreSQL** - baza podataka
2. **Web Service** - backend (API)

**Hostinger:**
- Frontend ostaje na Hostingeru

---

### Opcija 2: Backend + Frontend na Render.com

**Render.com servisi:**
1. **PostgreSQL** - baza podataka
2. **Web Service** - backend (API)
3. **Static Site** - frontend

**Zašto:**
- ✅ Sve na jednom mjestu
- ✅ Jednostavnije upravljanje

**Nedostaci:**
- ❌ Treba migrirati frontend
- ❌ Možda veći troškovi

---

## ✅ Konačna Preporuka

**Za početak: Odaberi:**

1. **PostgreSQL** → Kreiraj prvo (baza podataka)
2. **Web Service** → Backend API server

**Frontend:** Ostavi na Hostingeru za sada (možeš kasnije migrirati ako treba)

---

## 📋 Koraci

### Korak 1: Kreiraj PostgreSQL

1. Klikni **"New Postgres"**
2. Unesi:
   - **Name:** `uslugar-db`
   - **Database:** `uslugar`
   - **User:** `uslugar_user`
   - **Plan:** Starter ($7/mjesec)
   - **Region:** EU (Frankfurt)
3. Klikni **"Create Database"**
4. **SAČUVAJ `DATABASE_URL`!**

### Korak 2: Kreiraj Web Service (Backend)

1. Klikni **"New Web Service"**
2. Poveži GitHub repo:
   - **Repository:** `oriphiel-hr/AWS_projekti` (ili tvoj repo)
   - **Branch:** `main`
   - **Root Directory:** `uslugar/backend`
3. Unesi:
   - **Name:** `uslugar-api`
   - **Region:** EU
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Plan:** Free (testiranje) ili Starter ($7/mjesec)
4. Dodaj environment variables (vidi `RENDER-SETUP-STEP-BY-STEP.md` → Korak 4)
5. Klikni **"Create Web Service"**

### Korak 3: (Opcionalno) Static Site (Frontend)

**Samo ako želiš migrirati frontend na Render.com:**

1. Klikni **"New Static Site"**
2. Poveži GitHub repo:
   - **Repository:** `oriphiel-hr/AWS_projekti`
   - **Branch:** `main`
   - **Root Directory:** `uslugar/frontend`
3. Unesi:
   - **Name:** `uslugar-frontend`
   - **Build Command:** `npm ci && npm run build`
   - **Publish Directory:** `dist`
4. Dodaj environment variable:
   - `VITE_API_URL=https://api.uslugar.oriph.io`
5. Klikni **"Create Static Site"**

---

## 💡 Preporuka

**Za sada: Kreiraj samo PostgreSQL + Web Service**

Frontend ostavi na Hostingeru - možeš ga kasnije migrirati ako treba!

