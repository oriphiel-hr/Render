# 🔧 Kako Popraviti GitHub Actions - Workflow Se Ne Pokreće

## ❌ Problem: Workflow Se Ne Pokreće Nakon Commit-a

Ako si commit-ao promjene, ali workflow se ne pojavljuje u [GitHub Actions](https://github.com/oriphiel-hr/Render/actions), evo najčešćih razloga:

---

## 🔍 Najčešći Razlozi

### **1. Workflow Fajl Nije Commit-an i Push-an**

**Provjeri:**

```powershell
cd C:\GIT_PROJEKTI\Render\Uslugar
git status
```

**Ako vidiš `.github/workflows/frontend-uslugar.yml` u "Untracked files":**

```bash
# Dodaj workflow fajl
git add .github/workflows/frontend-uslugar.yml
git commit -m "Add GitHub Actions workflow for frontend deployment"
git push origin main
```

---

### **2. Nisi na Main Branch-u**

**Provjeri:**

```powershell
git branch --show-current
```

**Ako nisi na `main`:**

```bash
git checkout main
git merge [tvoj-branch]  # ako imaš promjene
git push origin main
```

**Workflow se pokreće SAMO na `main` branch!**

---

### **3. Promjene Nisu u Frontend Folderu**

**Problem:** Workflow se pokreće samo ako su promjene u `frontend/**` folderu, ali taj folder možda ne postoji u Render projektu!

**Rješenje - Ručno Pokreni Workflow:**

1. **GitHub Repository** → **Actions** tab
2. **Pronađi** "Frontend - Build & Deploy (Hostinger)" workflow
3. **Klikni** na workflow
4. **Klikni** **"Run workflow"** gumb (desno gore)
5. **Odaberi** **"main"** branch
6. **Klikni** **"Run workflow"**

**Workflow ima `workflow_dispatch` trigger, tako da možeš ga pokrenuti ručno!**

---

### **4. GitHub Actions Nije Omogućen**

**Provjeri u GitHub Repository:**

1. **GitHub Repository** → **Settings** → **Actions** → **General**
2. **Provjeri da "Allow all actions and reusable workflows"** je odabrano
3. **Save**

---

## ✅ Brzi Fix - Dodaj Workflow Fajl i Push-aj

```powershell
cd C:\GIT_PROJEKTI\Render\Uslugar

# Provjeri da workflow fajl postoji
Test-Path ".github\workflows\frontend-uslugar.yml"

# Dodaj u Git
git add .github/workflows/frontend-uslugar.yml

# Commit
git commit -m "Add GitHub Actions workflow for frontend deployment"

# Push na main
git push origin main
```

**Nakon push-a, provjeri GitHub Actions tab - workflow bi trebao biti vidljiv!**

---

## 🎯 Ručno Pokreni Workflow (Najbrže Rješenje)

**Ako workflow fajl je već push-an, možeš ga pokrenuti ručno:**

1. **GitHub Repository** → **Actions** tab
   - URL: https://github.com/oriphiel-hr/Render/actions

2. **Pronađi** "Frontend - Build & Deploy (Hostinger)" workflow
   - Ako ne vidiš, refresh stranicu (F5)

3. **Klikni** na workflow

4. **Klikni** **"Run workflow"** gumb (desno gore)

5. **Odaberi** **"main"** branch

6. **Klikni** **"Run workflow"**

**Workflow će se pokrenuti ručno!**

---

## 🔍 Provjera da Workflow Postoji

### **1. Provjeri GitHub Repository:**

1. **GitHub Repository** → **Actions** tab
2. **Trebao bi vidjeti** "Frontend - Build & Deploy (Hostinger)" workflow u lijevom sidebaru
3. **Ako ne vidiš:**
   - Workflow fajl nije push-an
   - Provjeri da si push-ao na `main` branch

### **2. Provjeri da Workflow Fajl Postoji Lokalno:**

```powershell
cd C:\GIT_PROJEKTI\Render\Uslugar
Get-Content .github\workflows\frontend-uslugar.yml | Select-Object -First 10
```

**Trebao bi vidjeti:**
```yaml
name: Frontend - Build & Deploy (Hostinger)

on:
  workflow_dispatch:  # ← Ovo omogućava ručno pokretanje!
  push:
    branches: ["main"]
```

---

## 📋 Checklist

- [ ] Workflow fajl postoji: `.github/workflows/frontend-uslugar.yml`
- [ ] Workflow fajl je commit-an: `git ls-files .github/workflows/frontend-uslugar.yml`
- [ ] Workflow fajl je push-an: `git log --oneline | grep -i workflow`
- [ ] Si na `main` branch-u: `git branch --show-current`
- [ ] Remote repository je točan: `git remote -v`
- [ ] GitHub Actions je omogućen: Settings → Actions → General
- [ ] Pokušao ručno pokrenuti workflow: Actions → Run workflow

---

## ✅ Konačni Koraci

1. ✅ **Provjeri** da workflow fajl postoji lokalno
2. ✅ **Dodaj** u Git: `git add .github/workflows/frontend-uslugar.yml`
3. ✅ **Commit**: `git commit -m "Add GitHub Actions workflow"`
4. ✅ **Push na main**: `git push origin main`
5. ✅ **Provjeri GitHub** → Actions tab → Workflow bi trebao biti vidljiv
6. ✅ **Ručno pokreni** workflow: Actions → Run workflow → Run workflow

**Ako workflow fajl je već push-an, samo ga ručno pokreni iz GitHub Actions taba!**

