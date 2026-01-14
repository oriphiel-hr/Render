# 🔧 Fix Duplicate public_html/public_html/ Path

## ❌ Problem

**URL s problemom:**
```
https://srv699-files.hstgr.io/ca90c38d09d457bc/files/public_html/public_html/
```

**Uzrok:**
- Hostinger FTP root već vodi u `public_html/` direktorij
- Workflow dodaje još jedan `public_html/` preko `SERVER_DIR`
- Rezultat: `public_html/public_html/`

---

## ✅ Rješenje

**Default `SERVER_DIR` je sada `/` umjesto `public_html/`**

**Razlog:**
- Hostinger FTP account `u208993221.uslugar.eu` već vodi u `public_html/` direktorij
- Kada se spojiš na FTP, već si u `public_html/`
- Ako workflow dodaje još jedan `public_html/`, dobiješ duplikat

---

## 🔍 Kako Provjeriti

### **Test s FileZilla:**

1. **Spoji se na FTP:**
   - Host: `194.5.156.10`
   - Username: `u208993221.uslugar.eu`
   - Password: [tvoj password]
   - Port: `21`

2. **Provjeri gdje se nalaziš:**
   - **Ako vidiš:** `public_html/` folder odmah nakon spajanja
     - ✅ **FTP root je u `public_html/`** → koristi `/` (default)
   - **Ako vidiš:** root direktorij s `public_html/` folderom unutra
     - ✅ **FTP root je iznad `public_html/`** → koristi `public_html/`

---

## 📋 GitHub Secrets

### **Ako FTP root je u `public_html/` (većina Hostinger accounta):**

**Ne postavi `HOSTINGER_SERVER_DIR` secret** - default je `/`

Ili postavi:
- `HOSTINGER_SERVER_DIR` = `/`

---

### **Ako FTP root je iznad `public_html/`:**

Postavi:
- `HOSTINGER_SERVER_DIR` = `public_html/`

---

## ✅ Provjera Nakon Fix-a

1. **Commit i push workflow fajla:**
   ```powershell
   cd "C:\GIT_PROJEKTI\Render"
   git add .github/workflows/frontend-uslugar.yml
   git commit -m "Fix duplicate public_html path - use / as default"
   git push origin main
   ```

2. **Pokreni workflow ponovno**

3. **Provjeri URL:**
   - Trebao bi biti: `https://srv699-files.hstgr.io/.../public_html/` (bez duplikata)
   - ❌ **NE:** `.../public_html/public_html/`
   - ✅ **DA:** `.../public_html/`

---

## 💡 Zašto Ovo Radi

**Hostinger FTP struktura:**
- FTP account `u208993221.uslugar.eu` već vodi u `public_html/` direktorij
- Kada se spojiš na FTP, već si u `public_html/`
- Ako workflow dodaje još jedan `public_html/`, dobiješ duplikat

**Rješenje:**
- Koristi `/` kao `SERVER_DIR` jer si već u `public_html/`
- Ili provjeri FileZilla gdje se točno nalaziš nakon spajanja

---

## ✅ Gotovo!

Nakon ažuriranja workflow-a, `public_html/public_html/` problem bi trebao biti riješen.

**Ako i dalje imaš problem:**
- Provjeri FileZilla gdje se nalaziš nakon spajanja
- Ako si u `public_html/`, koristi `/`
- Ako si iznad `public_html/`, koristi `public_html/`

---

**Gotovo!** 🎯

