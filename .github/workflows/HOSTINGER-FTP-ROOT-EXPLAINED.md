# 🔍 Hostinger FTP Root Directory - Objašnjenje

## ❌ Problem: Duplirani `public_html/public_html/`

**URL s problemom:**
```
https://srv699-files.hstgr.io/ca90c38d09d457bc/files/public_html/public_html/
```

**Uzrok:** `public_html/` se dodaje dva puta jer:
1. Hostinger FTP root već vodi u `public_html/` direktorij
2. Workflow dodaje još jedan `public_html/` preko `SERVER_DIR`

---

## ✅ Rješenje

### **Opcija 1: Koristi `/` (preporučeno)**

**Ako se FTP konekcija već nalazi u `public_html/` direktoriju:**

```yaml
SERVER_DIR: /  # Ili prazan string
```

**GitHub Secret:**
- `HOSTINGER_SERVER_DIR` = `/` (ili ne postavi - default je `/`)

---

### **Opcija 2: Koristi `public_html/`**

**Ako se FTP konekcija nalazi u root direktoriju (iznad `public_html/`):**

```yaml
SERVER_DIR: public_html/
```

**GitHub Secret:**
- `HOSTINGER_SERVER_DIR` = `public_html/`

---

## 🔍 Kako Provjeriti FTP Root Directory

### **Test s FileZilla:**

1. **Spoji se na FTP:**
   - Host: `194.5.156.10`
   - Username: `u208993221.uslugar.eu`
   - Password: [tvoj password]
   - Port: `21`

2. **Provjeri gdje se nalaziš:**
   - **Ako vidiš:** `public_html/` folder odmah nakon spajanja
     - ✅ **FTP root je u `public_html/`** → koristi `/`
   - **Ako vidiš:** root direktorij s `public_html/` folderom unutra
     - ✅ **FTP root je iznad `public_html/`** → koristi `public_html/`

---

## 📋 Primjeri

### **Primjer 1: FTP root je u `public_html/`**

**FileZilla prikazuje:**
```
/public_html/
  ├── index.html
  ├── assets/
  └── ...
```

**Workflow konfiguracija:**
```yaml
SERVER_DIR: /  # Ili prazan string
```

**GitHub Secret:**
- `HOSTINGER_SERVER_DIR` = `/` (ili ne postavi)

**Rezultat:**
- Fajlovi se uploadaju u: `/public_html/` ✅
- URL: `https://srv699-files.hstgr.io/.../public_html/` ✅

---

### **Primjer 2: FTP root je iznad `public_html/`**

**FileZilla prikazuje:**
```
/
  ├── public_html/
  │   ├── index.html
  │   └── ...
  ├── logs/
  └── ...
```

**Workflow konfiguracija:**
```yaml
SERVER_DIR: public_html/
```

**GitHub Secret:**
- `HOSTINGER_SERVER_DIR` = `public_html/`

**Rezultat:**
- Fajlovi se uploadaju u: `/public_html/` ✅
- URL: `https://srv699-files.hstgr.io/.../public_html/` ✅

---

## 🔧 Ažurirani Workflow

**Prije (pogrešno):**
```yaml
SERVER_DIR: public_html/  # Dodaje public_html/ na već postojeći public_html/
```

**Nakon (točno):**
```yaml
SERVER_DIR: /  # Koristi FTP root direktno (već je u public_html/)
```

---

## ✅ Provjera Nakon Ažuriranja

1. **Commit i push workflow fajla:**
   ```powershell
   cd "C:\GIT_PROJEKTI\Render"
   git add .github/workflows/frontend-uslugar.yml
   git commit -m "Fix duplicate public_html path - use / instead of public_html/"
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
- Ažuriraj `HOSTINGER_SERVER_DIR` secret prema tome gdje si

---

**Gotovo!** 🎯

