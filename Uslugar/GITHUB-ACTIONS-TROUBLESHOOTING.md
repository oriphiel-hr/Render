# 🔍 GitHub Actions Troubleshooting - Workflow Se Ne Pokreće

## ❌ Problem: Workflow Se Ne Pokreće Nakon Commit-a

Ako si commit-ao promjene, ali workflow se ne pojavljuje u GitHub Actions, provjeri sljedeće:

---

## 🔍 Provjera 1: Da Li Je Workflow Fajl Commit-an?

### **Provjeri Git Status:**

```powershell
cd C:\GIT_PROJEKTI\Render\Uslugar
git status
```

**Ako vidiš `.github/workflows/frontend-uslugar.yml` u "Untracked files" ili "Changes not staged":**

```bash
# Dodaj workflow fajl u Git
git add .github/workflows/frontend-uslugar.yml
git commit -m "Add GitHub Actions workflow for frontend deployment"
git push origin main
```

---

## 🔍 Provjera 2: Da Li Si Push-ao na Main Branch?

### **Provjeri Branch:**

```powershell
git branch --show-current
```

**Ako nisi na `main` branch-u:**

```bash
# Prebaci se na main
git checkout main

# ILI merge promjene u main
git checkout main
git merge [tvoj-branch]
git push origin main
```

**Workflow se pokreće SAMO na `main` branch!**

---

## 🔍 Provjera 3: Da Li Su Promjene u Frontend Folderu?

### **Workflow Se Pokreće Samo Ako:**

- ✅ Promjene su u `frontend/**` folderu
- ✅ ILI promjene su u `.github/workflows/frontend-uslugar.yml`

**Ako si commit-ao samo backend promjene:**

```bash
# Workflow se NEĆE pokrenuti!
# Dodaj promjenu u frontend/ folderu ILI workflow fajlu
```

**Rješenje:**
1. **Dodaj workflow fajl u commit:**
   ```bash
   git add .github/workflows/frontend-uslugar.yml
   git commit -m "Add GitHub Actions workflow"
   git push origin main
   ```

2. **ILI napravi promjenu u frontend/ folderu:**
   ```bash
   # Napravi bilo koju promjenu u frontend/ folderu
   # Npr. dodaj komentar u neki fajl
   git add frontend/
   git commit -m "Trigger workflow"
   git push origin main
   ```

---

## 🔍 Provjera 4: Da Li Je GitHub Actions Omogućen?

### **Provjeri u GitHub Repository:**

1. **GitHub Repository** → **Settings** → **Actions** → **General**
2. **Provjeri da "Allow all actions and reusable workflows"** je odabrano
3. **ILI "Allow local actions and reusable workflows"** je odabrano

**Ako je "Disable Actions" odabrano:**
- ✅ Promijeni u "Allow all actions"
- ✅ Save

---

## 🔍 Provjera 5: Da Li Je Workflow Fajl Na Pravom Mjestu?

### **Struktura Mora Biti:**

```
Render/
├── .github/
│   └── workflows/
│       └── frontend-uslugar.yml  ← Ovdje!
├── frontend/
└── backend/
```

**Provjeri:**

```powershell
cd C:\GIT_PROJEKTI\Render\Uslugar
Test-Path ".github\workflows\frontend-uslugar.yml"
```

**Ako ne postoji:**
```bash
# Kreiraj folder strukturu
mkdir -p .github/workflows
# Dodaj workflow fajl
git add .github/workflows/frontend-uslugar.yml
git commit -m "Add GitHub Actions workflow"
git push origin main
```

---

## 🔍 Provjera 6: Da Li Je Remote Repository Točan?

### **Provjeri Remote:**

```powershell
git remote -v
```

**Očekivani output:**
```
origin  https://github.com/oriphiel-hr/Render.git (fetch)
origin  https://github.com/oriphiel-hr/Render.git (push)
```

**Ako remote nije točan:**

```bash
# Postavi remote
git remote set-url origin https://github.com/oriphiel-hr/Render.git
git push origin main
```

---

## 🔍 Provjera 7: Da Li Je Workflow Syntax Točan?

### **Provjeri Workflow Fajl:**

Workflow fajl mora biti validan YAML. Provjeri da nema sintaksnih grešaka:

```yaml
name: Frontend - Build & Deploy (Hostinger)

on:
  workflow_dispatch:  # Manual trigger
  push:
    branches: ["main"]  # Samo main branch
    paths:
      - "frontend/**"  # Samo frontend promjene
      - ".github/workflows/frontend-uslugar.yml"
```

**Ako ima sintaksnih grešaka:**
- GitHub će prikazati grešku u Actions tabu
- Provjeri YAML syntax

---

## ✅ Rješenje: Ručno Pokreni Workflow

### **Ako Sve Ovo Ne Radi, Pokušaj Ručno:**

1. **GitHub Repository** → **Actions** tab
2. **Pronađi** "Frontend - Build & Deploy (Hostinger)" workflow
3. **Ako ne vidiš workflow:**
   - Provjeri da workflow fajl je commit-an i push-an
   - Provjeri da si na `main` branch-u
   - Refresh stranicu

4. **Ako vidiš workflow:**
   - Klikni na workflow
   - Klikni **"Run workflow"** gumb (desno gore)
   - Odaberi **"main"** branch
   - Klikni **"Run workflow"**

---

## 📋 Checklist

- [ ] Workflow fajl postoji: `.github/workflows/frontend-uslugar.yml`
- [ ] Workflow fajl je commit-an: `git ls-files .github/workflows/frontend-uslugar.yml`
- [ ] Workflow fajl je push-an: `git log --oneline | grep -i workflow`
- [ ] Si na `main` branch-u: `git branch --show-current`
- [ ] Remote repository je točan: `git remote -v`
- [ ] GitHub Actions je omogućen: Settings → Actions → General
- [ ] Promjene su u `frontend/` folderu ILI workflow fajlu
- [ ] Push je uspješan: `git push origin main`

---

## 🆘 Ako Ništa Ne Radi

### **1. Provjeri GitHub Repository:**

1. **GitHub Repository** → **Actions** tab
2. **Provjeri da vidiš** "Frontend - Build & Deploy (Hostinger)" workflow
3. **Ako ne vidiš:**
   - Workflow fajl nije push-an
   - ILI GitHub Actions nije omogućen

### **2. Provjeri Workflow Fajl Lokalno:**

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

### **3. Force Push Workflow Fajl:**

```bash
# Dodaj workflow fajl
git add .github/workflows/frontend-uslugar.yml
git commit -m "Add GitHub Actions workflow for frontend deployment"
git push origin main

# Provjeri da je push-ano
git log --oneline -1
```

---

## ✅ Konačni Koraci

1. ✅ **Provjeri** da workflow fajl postoji lokalno
2. ✅ **Dodaj** workflow fajl u Git: `git add .github/workflows/frontend-uslugar.yml`
3. ✅ **Commit**: `git commit -m "Add GitHub Actions workflow"`
4. ✅ **Push na main**: `git push origin main`
5. ✅ **Provjeri GitHub** → Actions tab → Trebao bi vidjeti workflow

**Ako i dalje ne radi, pokušaj ručno pokrenuti workflow iz GitHub Actions taba!**

