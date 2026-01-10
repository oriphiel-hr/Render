# 🔧 Riješeno: Docker Build Error - prisma i src direktoriji

## ❌ Problem

Docker build greška:
```
ERROR: failed to calculate checksum: "/prisma": not found
ERROR: failed to calculate checksum: "/src": not found
```

**Uzrok:** `prisma` i `src` direktoriji nisu u Git repozitoriju, pa Render ne može pristupiti njima prilikom build-a.

---

## ✅ Rješenje

### **1. Provjeri da su direktoriji kopirani lokalno**

Provjeri da postoje:
- ✅ `C:\GIT_PROJEKTI\Render\Uslugar\backend\src\` - kopiran
- ✅ `C:\GIT_PROJEKTI\Render\Uslugar\backend\prisma\` - kopiran
- ✅ `C:\GIT_PROJEKTI\Render\Uslugar\backend\start.sh` - kopiran

### **2. Dodaj u Git repozitorij**

Render klonira kod sa GitHuba, tako da **MORAŠ commit-ati i push-ati** `prisma` i `src` direktorije u Git!

**Koraci:**

```powershell
cd C:\GIT_PROJEKTI\Render\Uslugar

# Provjeri status
git status

# Dodaj prisma direktorij
git add backend/prisma/

# Dodaj src direktorij (ako već nije dodan)
git add backend/src/

# Dodaj start.sh
git add backend/start.sh

# Commit
git commit -m "Add prisma, src directories and start.sh for Render deployment"

# Push na GitHub
git push origin main
```

### **3. Provjeri da su datoteke u Git repozitoriju**

```powershell
# Provjeri da li su datoteke tracked u Git-u
git ls-files backend/prisma/schema.prisma
git ls-files backend/src/server.js
git ls-files backend/start.sh
```

Ako nisu tracked, dodaj ih:
```powershell
git add backend/prisma/
git add backend/src/
git add backend/start.sh
git commit -m "Add missing directories for Render build"
git push
```

---

## ⚠️ VAŽNO: Provjeri .gitignore

Provjeri da `.gitignore` **NE ignorira** ove direktorije:

```gitignore
# ❌ NE ignoriraj prisma direktorij!
# ❌ NE ignoriraj src direktorij!

# ✅ OK ignorirati (ako želiš):
prisma/migrations/.db
*.db
*.db-journal

# ✅ Ali prisma/schema.prisma MORA biti u Git-u!
# ✅ I prisma/migrations/ MORA biti u Git-u!
```

---

## 🔍 Provjera Prije Push-a

### **Provjeri strukturu:**

```powershell
cd C:\GIT_PROJEKTI\Render\Uslugar\backend

# Provjeri da sve postoji
Test-Path "src\server.js"       # Treba biti $true
Test-Path "prisma\schema.prisma" # Treba biti $true
Test-Path "start.sh"            # Treba biti $true
Test-Path "package.json"        # Treba biti $true
Test-Path "Dockerfile.prod"     # Treba biti $true
```

### **Provjeri Git status:**

```powershell
cd C:\GIT_PROJEKTI\Render\Uslugar

# Provjeri što će biti commit-ano
git status backend/prisma/
git status backend/src/
git status backend/start.sh

# Ako su "untracked", dodaj ih:
git add backend/prisma/
git add backend/src/
git add backend/start.sh
```

---

## 🚀 Nakon Push-a

1. **Čekaj da Render klonira novi commit**
2. **Render će automatski pokrenuti novi build**
3. **Provjeri logs** - sada bi trebao moći pronaći `prisma` i `src` direktorije

---

## 📝 Checklist

- [ ] `prisma` direktorij postoji lokalno u `backend/prisma/`
- [ ] `src` direktorij postoji lokalno u `backend/src/`
- [ ] `start.sh` postoji lokalno u `backend/start.sh`
- [ ] `.gitignore` NE ignorira `prisma/` ili `src/`
- [ ] `prisma/` je dodan u Git (`git add backend/prisma/`)
- [ ] `src/` je dodan u Git (`git add backend/src/`)
- [ ] `start.sh` je dodan u Git (`git add backend/start.sh`)
- [ ] Sve je commit-ano (`git commit -m "..."`)
- [ ] Sve je push-ano na GitHub (`git push origin main`)
- [ ] Render Dashboard pokazuje novi commit u build logovima

---

## 🆘 Ako i dalje ne radi

### **Problem: "prisma: not found" nakon push-a**

**Provjeri:**
1. Da li je `prisma` direktorij stvarno u Git repozitoriju:
   ```powershell
   git ls-files backend/prisma/schema.prisma
   ```
   Ako nije, dodaj ga i push-aj ponovo.

2. Da li Render build koristi pravi Root Directory:
   - Render Dashboard → Environment → Root Directory: `Uslugar/backend`
   - Provjeri da Dockerfile.prod traži `prisma` relativno na root directory

3. Da li `.dockerignore` ne ignorira `prisma`:
   Provjeri da `.dockerignore` ne sadrži:
   ```
   prisma/
   ```
   Ili da ignorira samo database fajlove, ali ne schema.prisma i migrations:
   ```
   *.db
   *.db-journal
   prisma/migrations/.db
   ```

### **Problem: "src: not found" nakon push-a**

Isto kao za `prisma`:
1. Provjeri da `src` je u Git-u
2. Provjeri da `.dockerignore` ne ignorira `src/`
3. Provjeri Root Directory u Render Dashboard-u

---

## ✅ Konačna Provjera

Nakon što push-uješ sve u Git, provjeri u Render Dashboard-u:

1. **Logs** → **Build Logs** → Provjeri da Docker build sada pronalazi `prisma` i `src`
2. **Logs** → **Runtime Logs** → Provjeri da se server uspješno pokreće

**Očekivani output u build logs:**
```
✅ [prisma-src 6/8] COPY prisma ./prisma - SUCCESS
✅ [runner 6/11] COPY src ./src - SUCCESS
✅ [runner 7/11] COPY prisma ./prisma - SUCCESS
```

