# 🚀 Ručno Pokretanje Deploymenta

## Problem

GitHub Actions workflow se nije automatski pokrenuo nakon push-a.

## Rješenje

### Opcija 1: Ručno Pokreni Workflow (Preporučeno)

1. Otvori: https://github.com/oriphiel-hr/AWS_projekti/actions
2. Odaberi workflow: **"Backend - Reuse existing Task Definition (ECR→ECS)"**
3. Klikni **"Run workflow"** (desno gore)
4. Odaberi branch: **main**
5. Klikni **"Run workflow"**

### Opcija 2: Prazan Commit (Već Urađeno)

Napravljen je prazan commit koji bi trebao triggerati workflow.

### Opcija 3: Provjeri Workflow Konfiguraciju

Workflow bi trebao reagirati na:
- Push na `main` branch
- Promjene u `uslugar/backend/**`
- Promjene u `.github/workflows/backend-uslugar-ecs.yml`

## Provjera

Nakon pokretanja workflow-a:
1. Provjeri da li je workflow pokrenut
2. Provjeri da li je završio uspješno
3. Testiraj endpoint ponovno

