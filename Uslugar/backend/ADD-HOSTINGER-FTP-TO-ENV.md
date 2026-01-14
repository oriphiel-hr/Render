# 🔐 Dodavanje Hostinger FTP Podataka u .env Datoteku

## ✅ FTP Podatci za Dodavanje

Dodaj ove podatke u `backend/.env` datoteku:

```env
# Hostinger FTP Configuration
HOSTINGER_HOST=194.5.156.10
HOSTINGER_USERNAME=u208993221
HOSTINGER_PASSWORD=G73S3ebakh6O!
HOSTINGER_SERVER_DIR=public_html/
```

---

## 📋 Kako Dodati

### **Opcija 1: Ručno (Preporučeno)**

1. **Otvori** `C:\GIT_PROJEKTI\Render\Uslugar\backend\.env` datoteku
2. **Dodaj na kraj** datoteke:
   ```env
   # Hostinger FTP Configuration
   HOSTINGER_HOST=194.5.156.10
   HOSTINGER_USERNAME=u208993221
   HOSTINGER_PASSWORD=G73S3ebakh6O!
   HOSTINGER_SERVER_DIR=public_html/
   ```
3. **Spremi** datoteku

### **Opcija 2: PowerShell (Automatski)**

```powershell
cd C:\GIT_PROJEKTI\Render\Uslugar\backend

# Provjeri da .env postoji
if (Test-Path ".env") {
    # Provjeri da HOSTINGER podatci već ne postoje
    $content = Get-Content .env -Raw
    if ($content -notmatch "HOSTINGER_HOST") {
        # Dodaj na kraj
        Add-Content -Path .env -Value "`n# Hostinger FTP Configuration`nHOSTINGER_HOST=194.5.156.10`nHOSTINGER_USERNAME=u208993221`nHOSTINGER_PASSWORD=G73S3ebakh6O!`nHOSTINGER_SERVER_DIR=public_html/`n"
        Write-Host "✅ FTP podatci dodani u .env"
    } else {
        Write-Host "⚠️  HOSTINGER podatci već postoje u .env"
    }
} else {
    Write-Host "❌ .env datoteka ne postoji"
}
```

### **Opcija 3: Python Skripta**

```python
# add-hostinger-ftp.py
import os

env_path = '.env'
hostinger_section = '''
# Hostinger FTP Configuration
HOSTINGER_HOST=194.5.156.10
HOSTINGER_USERNAME=u208993221
HOSTINGER_PASSWORD=G73S3ebakh6O!
HOSTINGER_SERVER_DIR=public_html/
'''

if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'HOSTINGER_HOST' not in content:
        with open(env_path, 'a', encoding='utf-8') as f:
            f.write(hostinger_section)
        print('✅ FTP podatci dodani u .env')
    else:
        print('⚠️  HOSTINGER podatci već postoje u .env')
else:
    print('❌ .env datoteka ne postoji')
```

---

## 🔍 Provjera da Su Podatci Dodani

### **PowerShell:**

```powershell
cd C:\GIT_PROJEKTI\Render\Uslugar\backend
Get-Content .env | Select-String -Pattern "HOSTINGER"
```

**Očekivani output:**
```
HOSTINGER_HOST=194.5.156.10
HOSTINGER_USERNAME=u208993221
HOSTINGER_PASSWORD=G73S3ebakh6O!
HOSTINGER_SERVER_DIR=public_html/
```

### **Command Line:**

```bash
cd C:\GIT_PROJEKTI\Render\Uslugar\backend
findstr "HOSTINGER" .env
```

---

## ⚠️ Važne Napomene

### **1. .env Datoteka je u .gitignore**

**✅ DOBRO:** `.env` datoteka je u `.gitignore`, tako da se **ne commit-uje** u Git.

**⚠️ VAŽNO:** 
- ✅ **Nikada ne commit-aj** `.env` datoteku u Git
- ✅ **Koristi GitHub Secrets** za production deployment
- ✅ `.env` je samo za **lokalni development**

### **2. Security**

**⚠️ VAŽNO:**
- ✅ **Ne dijelj** `.env` datoteku javno
- ✅ **Ne commit-uj** `.env` u Git
- ✅ **Rotiraj password** redovito
- ✅ **Koristi GitHub Secrets** za production

### **3. Lokacija**

**`.env` datoteka se nalazi u:**
```
C:\GIT_PROJEKTI\Render\Uslugar\backend\.env
```

---

## 📋 Checklist

- [ ] Otvorena `backend/.env` datoteka
- [ ] Dodani FTP podatci na kraj datoteke:
  - [ ] `HOSTINGER_HOST=194.5.156.10`
  - [ ] `HOSTINGER_USERNAME=u208993221`
  - [ ] `HOSTINGER_PASSWORD=G73S3ebakh6O!`
  - [ ] `HOSTINGER_SERVER_DIR=public_html/`
- [ ] Spremljena datoteka
- [ ] Provjereno da podatci postoje (`Get-Content .env | Select-String "HOSTINGER"`)

---

## ✅ Konačni Sadržaj .env Sekcije

```env
# Hostinger FTP Configuration
HOSTINGER_HOST=194.5.156.10
HOSTINGER_USERNAME=u208993221
HOSTINGER_PASSWORD=G73S3ebakh6O!
HOSTINGER_SERVER_DIR=public_html/
```

**Dodaj ove podatke u `backend/.env` datoteku!** 🎯

