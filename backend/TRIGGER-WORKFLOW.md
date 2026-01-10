# 🚀 Kako Ručno Pokrenuti Backend Deployment

## Problem

GitHub Actions workflow se ne pokreće automatski nakon push-a.

## Rješenje: Ručno Pokretanje

### Korak 1: Otvori GitHub Actions

Idi na: https://github.com/oriphiel-hr/AWS_projekti/actions

### Korak 2: Odaberi Workflow

Klikni na: **"Backend - Reuse existing Task Definition (ECR→ECS)"**

### Korak 3: Pokreni Workflow

1. Klikni gumb **"Run workflow"** (desno gore, pored "Filter workflows")
2. Odaberi branch: **main**
3. Klikni **"Run workflow"**

### Korak 4: Prati Progress

- Workflow će se pokrenuti
- Traje obično 2-5 minuta
- Provjeri da li je završio uspješno (zelena kvačica)

## Alternativa: Promijeni Fajl

Ako ručno pokretanje ne radi, promijeni neki fajl u `uslugar/backend/`:

```bash
# Dodaj prazan red u neki fajl
echo "" >> uslugar/backend/src/server.js
git add uslugar/backend/src/server.js
git commit -m "chore: Trigger backend deployment"
git push origin main
```

## Provjera Nakon Deploymenta

Nakon što workflow završi, testiraj endpoint:

```powershell
powershell -ExecutionPolicy Bypass -File test-all-endpoints.ps1
```

