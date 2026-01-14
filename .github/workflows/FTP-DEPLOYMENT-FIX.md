# 🔧 FTP Deployment Fix - SSL/TLS Error

## ❌ Problem

**Greška:**
```
Error: SSL routines:ssl3_get_record:wrong version number
```

**Uzrok:**
- Workflow pokušava koristiti **FTPS (SSL/TLS)** na portu 21
- Hostinger FTP server **ne podržava SSL/TLS** na portu 21
- Server očekuje **obični FTP** (bez SSL/TLS)

---

## ✅ Rješenje

**Ažuriran workflow da:**
1. ✅ **Prvo pokuša obični FTP** (bez SSL/TLS)
2. ✅ **Zatim pokuša FTPS** samo ako FTP ne radi
3. ✅ **Koristi plain FTP** za `.htaccess` upload

---

## 🔄 Promjene u Workflow-u

### **Prije:**
- ❌ Prvo pokušava FTPS (SSL/TLS)
- ❌ Greška: "wrong version number"

### **Nakon:**
- ✅ Prvo pokušava obični FTP (bez SSL/TLS)
- ✅ Zatim pokušava FTPS samo ako FTP ne radi
- ✅ Plain FTP za `.htaccess` upload

---

## 📋 Ažurirani Workflow Koraci

1. **Deploy via FTP (plain FTP - first attempt)**
   - Protocol: `ftp`
   - Port: `21`
   - Bez SSL/TLS

2. **Retry with FTP (passive mode)**
   - Ako prvi pokušaj ne radi
   - Isti protokol, drugačiji način

3. **Retry with FTPS (implicit)**
   - Samo ako FTP ne radi
   - Protocol: `ftps`
   - Port: `21`

4. **Final retry with FTPS (explicit - port 990)**
   - Ako ni FTPS na portu 21 ne radi
   - Protocol: `ftps`
   - Port: `990`

---

## 🎯 Zašto Ovo Radi

**Hostinger FTP server:**
- ✅ Podržava **obični FTP** na portu 21
- ❌ **Ne podržava FTPS** na portu 21
- ⚠️ Možda podržava FTPS na portu 990 (ali nije potrebno)

**Workflow sada:**
- ✅ Prvo pokušava **obični FTP** (što Hostinger podržava)
- ✅ Ako ne radi, pokušava FTPS (fallback)
- ✅ Većina Hostinger servera radi s običnim FTP-om

---

## 🔍 Provjera

**Nakon push-a workflow-a, provjeri:**
1. ✅ Workflow se pokreće bez greške
2. ✅ FTP konekcija uspješna (obični FTP)
3. ✅ Deployment uspješan
4. ✅ Fajlovi su upload-ani na Hostinger

---

## 💡 Ako Još Uvijek Ne Radi

### **Provjeri GitHub Secrets:**
- ✅ `HOSTINGER_HOST` = samo hostname (npr. `194.5.156.10`)
- ✅ `HOSTINGER_USERNAME` = FTP username
- ✅ `HOSTINGER_PASSWORD` = FTP password
- ❌ **NE** uključi `ftp://` ili `ftps://` u host

### **Provjeri Hostinger FTP Settings:**
- ✅ FTP je omogućen u Hostinger Control Panel-u
- ✅ Port 21 je otvoren
- ✅ FTP credentials su točni

### **Test Ručno:**
```powershell
# Test FTP konekcije
cd "C:\GIT_PROJEKTI\Render\Uslugar\frontend"
.\deploy-frontend-ftp-fixed.ps1
```

---

## ✅ Gotovo!

Workflow je ažuriran da koristi **obični FTP** umjesto FTPS, što bi trebalo riješiti problem s SSL/TLS greškom.

**Sljedeći korak:**
1. Commit i push workflow fajla
2. Pokreni workflow ponovno
3. Provjeri da li deployment radi

---

**Gotovo!** 🎯

