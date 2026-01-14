# 🔧 Kako Popraviti GitHub Actions Workflow

## ❌ Problem: Workflow Se Ne Pokreće

Ako si commit-ao promjene, ali workflow se ne pojavljuje u [GitHub Actions](https://github.com/oriphiel-hr/Render/actions), provjeri sljedeće:

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

**Workflow se pokreće samo ako:**
- ✅ Promjene su u `frontend/**` folderu
- ✅ ILI promjene su u `.github/workflows/frontend-uslugar.yml`

**Ako si commit-ao samo backend promjene, workflow se NEĆE pokrenuti!**

**Rješenje:**

```bash
# Opcija 1: Dodaj workflow fajl u commit
git add .github/workflows/frontend-uslugar.yml
git commit -m "Add GitHub Actions workflow"
git push origin main

# Opcija 2: Napravi promjenu u frontend/ folderu
# (npr. dodaj komentar u neki fajl)
git add frontend/
git commit -m "Trigger workflow"
git push origin main
```

---

### **4. GitHub Actions Nije Omogućen**

**Provjeri u GitHub Repository:**

1. **GitHub Repository** → **Settings** → **Actions** → **General**
2. **Provjeri da "Allow all actions and reusable workflows"** je odabrano
3. **Save**

**Ako je "Disable Actions" odabrano:**
- ✅ Promijeni u "Allow all actions"
- ✅ Save

---

## ✅ Rješenje: Ručno Pokreni Workflow

### **Ako Sve Ovo Ne Radi:**

1. **GitHub Repository** → **Actions** tab
2. **Pronađi** "Frontend - Build & Deploy (Hostinger)" workflow
3. **Ako ne vidiš workflow:**
   - Workflow fajl nije push-an
   - Provjeri da si push-ao na `main` branch

4. **Ako vidiš workflow:**
   - Klikni na workflow
   - Klikni **"Run workflow"** gumb (desno gore)
   - Odaberi **"main"** branch
   - Klikni **"Run workflow"**

---

## 📋 Brzi Fix - Dodaj Workflow Fajl

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

## 🔍 Provjera da Workflow Radi

### **1. Provjeri GitHub Repository:**

1. **GitHub Repository** → **Actions** tab
2. **Trebao bi vidjeti** "Frontend - Build & Deploy (Hostinger)" workflow
3. **Ako vidiš workflow:**
   - Klikni na njega
   - Provjeri da je status "Completed" ili "Running"

### **2. Provjeri da Workflow Fajl Postoji Lokalno:**

```powershell
cd C:\GIT_PROJEKTI\Render\Uslugar
Get-Content .github\workflows\frontend-uslugar.yml | Select-Object -First 10
```

**Trebao bi vidjeti:**
```yaml
name: Frontend - Build & Deploy (Hostinger)

on:
  workflow_dispatch:
  push:
    branches: ["main"]
```

---

## 🆘 Ako Ništa Ne Radi

### **1. Provjeri Remote Repository:**

```powershell
git remote -v
```

**Očekivani output:**
```
origin  https://github.com/oriphiel-hr/Render.git (fetch)
origin  https://github.com/oriphiel-hr/Render.git (push)
```

### **2. Force Push Workflow Fajl:**

```bash
# Dodaj workflow fajl
git add .github/workflows/frontend-uslugar.yml
git commit -m "Add GitHub Actions workflow"
git push origin main --force  # Samo ako je potrebno!
```

### **3. Provjeri GitHub Actions Settings:**

1. **GitHub Repository** → **Settings** → **Actions** → **General**
2. **Provjeri:**
   - ✅ "Allow all actions and reusable workflows" je odabrano
   - ✅ "Workflow permissions" je postavljeno na "Read and write permissions"

---

## ✅ Konačni Koraci

1. ✅ **Provjeri** da workflow fajl postoji: `.github/workflows/frontend-uslugar.yml`
2. ✅ **Dodaj** u Git: `git add .github/workflows/frontend-uslugar.yml`
3. ✅ **Commit**: `git commit -m "Add GitHub Actions workflow"`
4. ✅ **Push na main**: `git push origin main`
5. ✅ **Provjeri GitHub** → Actions tab → Workflow bi trebao biti vidljiv

**Ako i dalje ne radi, pokušaj ručno pokrenuti workflow iz GitHub Actions taba!**

