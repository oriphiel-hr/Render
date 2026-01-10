# 🚀 Render Deployment Setup - Uslugar Backend

## ❌ POGREŠNO: Root Directory = `Uslugar\backup`

**`backup/` direktorij sadrži:**
- ❌ SQL backup fajlove
- ❌ Dokumentaciju
- ❌ `render.yaml` konfiguraciju (koja je samo template)
- ❌ Nema backend koda!

---

## ✅ ISPRAVNO: Root Directory = `Uslugar` ili `Uslugar/backend`

### Struktura projekta:
```
Uslugar/
├── backend/          ← Backend kod (Node.js, Dockerfile.prod, package.json, src/)
├── backup/           ← Backup fajlovi i dokumentacija (NE za deployment)
└── render.yaml       ← Render Blueprint (treba biti u root ili kopirati iz backup/)
```

---

## 🎯 Opcija 1: Koristi Render Blueprint (render.yaml)

### Korak 1: Premjesti render.yaml u root Uslugar direktorij

```bash
# Kopiraj render.yaml iz backup/ u Uslugar root
cp Uslugar/backup/render.yaml Uslugar/render.yaml

# ILI ručno kopiraj fajl
```

### Korak 2: Ažuriraj render.yaml pathove

Ako kopiraš `render.yaml` iz `backup/` u `Uslugar/` root, trebaš ažurirati pathove:

**BILO:**
```yaml
dockerfilePath: ./uslugar/backend/Dockerfile.prod
dockerContext: ./uslugar/backend
```

**SADA (ako je render.yaml u Uslugar/ root):**
```yaml
dockerfilePath: ./backend/Dockerfile.prod
dockerContext: ./backend
```

### Korak 3: Push u GitHub i Render Blueprint

1. **Push render.yaml:**
   ```bash
   git add Uslugar/render.yaml
   git commit -m "Add render.yaml for Render Blueprint deployment"
   git push origin main
   ```

2. **Render Dashboard:**
   - New + → Blueprint
   - Odaberi repo: `oriphiel-hr/Render`
   - Render će detektirati `Uslugar/render.yaml`
   - **Root Directory:** `Uslugar` (ili ostavi prazno ako Render automatski detektira)
   - Klikni **Apply**

---

## 🎯 Opcija 2: Ručno Kreiranje Web Service (Preporučeno)

### Render Dashboard Settings:

1. **Connect GitHub:**
   - Repo: `oriphiel-hr/Render`
   - Branch: `main`

2. **Basic Settings:**
   - **Name:** `uslugar-backend`
   - **Region:** Frankfurt (EU)
   - **Branch:** `main`
   - **Root Directory:** `Uslugar/backend` ⭐ **OVO JE KLJUČNO!**

3. **Build & Deploy:**
   - **Environment:** `Docker`
   - **Dockerfile Path:** `Dockerfile.prod` (relativno na root directory, dakle samo ime fajla)
   - **Docker Context:** `.` (točka = current directory, koji je `Uslugar/backend`)

4. **Plan:** Starter ($7/mesec) ili Standard ($25/mesec)

5. **Environment Variables:**
   - Dodaj sve iz `backup/ALL_ENV_VARIABLES_AND_SECRETS.md`
   - `DATABASE_URL` → Poveži sa PostgreSQL add-on

6. **Create Web Service**

---

## 📋 Što postaviti u Render Dashboard:

### ✅ Root Directory:
```
Uslugar/backend
```

### ✅ Dockerfile Path:
```
Dockerfile.prod
```
*(Relativno na root directory - dakle samo ime fajla jer je root već `Uslugar/backend`)*

### ✅ Build Command:
*(Prazno - koristi Docker)*

### ✅ Start Command:
```
/app/start.sh
```
*(Već definisano u Dockerfile CMD)*

---

## ⚠️ VAŽNO - Path Reference:

Ako je **Root Directory = `Uslugar/backend`**:
- ✅ Dockerfile.prod je u root-u (`Uslugar/backend/Dockerfile.prod`)
- ✅ package.json je u root-u (`Uslugar/backend/package.json`)
- ✅ src/ direktorij je u root-u (`Uslugar/backend/src/`)
- ✅ start.sh je u root-u (`Uslugar/backend/start.sh`)

Zato su svi pathovi u Dockerfile relativni na `Uslugar/backend` directory.

---

## 🔄 Alternativa: Root Directory = `Uslugar`

Ako želiš **Root Directory = `Uslugar`** (cijeli Uslugar direktorij):

### Render Dashboard Settings:
- **Root Directory:** `Uslugar`
- **Dockerfile Path:** `backend/Dockerfile.prod`
- **Docker Context:** `backend`

**ILI** ažuriraj Dockerfile.prod da koristi relativne pathove iz `Uslugar/` root-a (što je komplikovanije).

---

## ✅ PREPORUKA

**Koristi Opciju 2 (Ručno) sa:**
- **Root Directory:** `Uslugar/backend`
- **Dockerfile Path:** `Dockerfile.prod`
- **Docker Context:** `.`

**Zašto?**
- ✅ Najjednostavnije (svi pathovi su relativni na backend/)
- ✅ Ne treba mijenjati Dockerfile
- ✅ Ne treba mijenjati package.json pathove
- ✅ Ne treba mijenjati start.sh

---

## 📝 Sažetak

| Setting | Vrijednost |
|---------|-----------|
| **Root Directory** | `Uslugar/backend` ✅ |
| **Dockerfile Path** | `Dockerfile.prod` |
| **Docker Context** | `.` (ili `backend` ako je root `Uslugar`) |
| **Start Command** | `/app/start.sh` (iz Dockerfile) |
| **Build Command** | *(prazno - koristi Docker)* |

**❌ NE koristi:**
- ❌ Root Directory = `Uslugar/backup` (nema backend koda!)
- ❌ Root Directory = `backup` (nema backend koda!)

**✅ KORISTI:**
- ✅ Root Directory = `Uslugar/backend` (backend kod je ovdje!)

---

**Datum:** 2026-01-10

