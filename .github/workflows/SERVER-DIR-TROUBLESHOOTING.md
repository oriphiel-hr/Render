# 🔧 SERVER_DIR Troubleshooting Guide

## ❌ Problem: Secret `/` daje `.../files/` bez `public_html/`

**Situacija:**
- Postavio si `HOSTINGER_SERVER_DIR` secret na `/`
- Dobivaš URL: `.../files/` (bez `public_html/`)
- Fajlovi nisu u `public_html/` direktoriju

---

## 🔍 Analiza

**Hostinger FTP struktura:**
```
/files/                    ← FTP root (gdje si nakon login-a)
  └── public_html/        ← Ovdje trebaju biti fajlovi
      └── (fajlovi)
```

**Problem:**
- Ako koristiš `/` → uploaduje se u `/files/` (root)
- Trebamo uploadati u `/files/public_html/`

---

## ✅ Rješenje

### **Korak 1: Obriši Secret ili Postavi na `public_html/`**

**Opcija A: Obriši Secret**
- Ukloni `HOSTINGER_SERVER_DIR` secret
- Workflow će automatski koristiti `public_html/` (default)

**Opcija B: Postavi Secret na `public_html/`**
- `HOSTINGER_SERVER_DIR` = `public_html/`
- Workflow će koristiti `public_html/`

---

## 🔍 Kako Provjeriti FileZilla Strukturu

1. **Spoji se na FTP s FileZilla:**
   - Host: `194.5.156.10`
   - Username: `u208993221.uslugar.eu`
   - Password: [tvoj password]
   - Port: `21`

2. **Provjeri strukturu:**
   ```
   /files/                    ← Ovdje si nakon login-a?
     └── public_html/        ← Postoji li ovaj folder?
   ```

   **Ili:**
   ```
   /public_html/              ← Ovdje si direktno nakon login-a?
     └── (fajlovi)
   ```

---

## 📋 Pravilna Konfiguracija

### **Ako vidiš `/files/` s `public_html/` folderom unutra:**

**Postavi:**
- `HOSTINGER_SERVER_DIR` = `public_html/`

**Ili obriši secret** (default je `public_html/`)

**Očekivani rezultat:**
- URL: `.../files/public_html/` ✅

---

### **Ako si direktno u `/public_html/` nakon login-a:**

**Postavi:**
- `HOSTINGER_SERVER_DIR` = `/`

**Očekivani rezultat:**
- URL: `.../files/public_html/` ✅ (jer si već u public_html/)

---

## 🎯 Preporučeno Rješenje

**Na temelju tvog URL-a `.../files/`:**

1. **Obriši `HOSTINGER_SERVER_DIR` secret** (ako postoji)
2. **Ili postavi na `public_html/`**

3. **Commit i push:**
   ```powershell
   cd "C:\GIT_PROJEKTI\Render"
   git add .github/workflows/frontend-uslugar.yml
   git commit -m "Fix SERVER_DIR - use public_html/ for Hostinger structure"
   git push origin main
   ```

4. **Pokreni workflow ponovno**

5. **Provjeri URL:**
   - Trebao bi biti: `.../files/public_html/` ✅

---

## 🔍 Debug u Workflow Logovima

Traži u logovima:
```
🔍 Determining correct SERVER_DIR...
✅ Using HOSTINGER_SERVER_DIR secret: '/'
📌 Using root directory '/'
✅ Final SERVER_DIR: '/'
```

**Ako vidiš `/`:**
- Workflow koristi root
- Ako dobivaš `.../files/` bez `public_html/`, to znači da FTP root nije u `public_html/`
- **Rješenje:** Postavi secret na `public_html/`

---

## ✅ Očekivani Rezultat

**Nakon ispravne konfiguracije:**
- URL: `https://srv699-files.hstgr.io/ca90c38d09d457bc/files/public_html/`
- Fajlovi su u `public_html/` direktoriju
- Nema duplikata `public_html/public_html/`

---

**Gotovo!** 🎯

