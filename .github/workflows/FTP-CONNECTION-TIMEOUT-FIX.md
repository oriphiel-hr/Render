# 🔧 FTP Connection Timeout Fix - ETIMEDOUT Error

## ❌ Problem

**Greška:**
```
Error: connect ETIMEDOUT ***:21
```

**Uzrok:**
- Ne može se spojiti na FTP server na portu 21
- Vjerojatno firewall blokira port 21
- Ili server ne podržava FTP na portu 21
- Ili network connectivity problem

---

## ✅ Rješenja

### **1. Provjeri GitHub Secrets**

**Provjeri da su Secrets točni:**
- ✅ `HOSTINGER_HOST` = `194.5.156.10` (samo IP, bez `ftp://`)
- ✅ `HOSTINGER_USERNAME` = `u208993221.uslugar.eu`
- ✅ `HOSTINGER_PASSWORD` = [tvoj password]

---

### **2. Test Ručno s FileZilla**

**Ako FileZilla radi:**
- ✅ Credentials su točni
- ✅ Problem je u workflow konfiguraciji ili firewallu
- ✅ Možda treba koristiti drugačiji port ili protokol

**Ako FileZilla ne radi:**
- ❌ Provjeri credentials u Hostinger Control Panel-u
- ❌ Provjeri da je FTP account aktivan
- ❌ Provjeri firewall postavke

---

### **3. Provjeri Hostinger FTP Settings**

**U Hostinger Control Panel-u:**
1. **Idi u:** FTP Accounts
2. **Provjeri:**
   - ✅ FTP account je aktivan
   - ✅ FTP IP/hostname je točan
   - ✅ Username je točan
   - ✅ Password je točan

---

### **4. Provjeri Firewall**

**Mogući problemi:**
- ❌ GitHub Actions runner ne može pristupiti portu 21
- ❌ Hostinger firewall blokira pristup s GitHub IP-ova
- ❌ Network connectivity problem

**Rješenja:**
- Kontaktiraj Hostinger support da omoguće pristup s GitHub IP-ova
- Ili koristi alternativni deployment metodu (FileZilla, SSH, itd.)

---

### **5. Alternativni Deployment Metode**

#### **Opcija 1: Ručni Deployment s FileZilla**

1. **Build lokalno:**
   ```powershell
   cd "C:\GIT_PROJEKTI\Render\Uslugar\frontend"
   npm ci
   npm run build
   ```

2. **Upload s FileZilla:**
   - Spoji se na FTP
   - Upload `dist/*` u `public_html/`

---

#### **Opcija 2: PowerShell Script**

1. **Koristi postojeći script:**
   ```powershell
   cd "C:\GIT_PROJEKTI\Render\Uslugar\frontend"
   .\deploy-frontend-ftp-fixed.ps1
   ```

---

#### **Opcija 3: Hostinger File Manager**

1. **Idi u Hostinger Control Panel**
2. **File Manager**
3. **Upload fajlove** preko web interfejsa

---

### **6. Provjeri da li Server Podržava SFTP**

**Ako server podržava SFTP (port 22):**
- Workflow će automatski pokušati SFTP ako FTP ne radi
- Provjeri workflow logove da vidiš da li je SFTP pokušan

---

## 🔍 Debugging Steps

### **Step 1: Provjeri Secrets**

```bash
# U workflow logovima, provjeri:
✅ Using HOSTINGER_* secrets
   Original host: 194.5.156.10...
   Cleaned host: 194.5.156.10
   Username: u208993221.uslugar.eu
```

---

### **Step 2: Provjeri Port Connectivity**

```bash
# U workflow logovima, provjeri:
Testing port 21 (FTP):
✅ Port 21 is reachable  # Ili ❌ Port 21 timeout
```

---

### **Step 3: Test s FileZilla**

1. **Spoji se na FTP:**
   - Host: `194.5.156.10`
   - Username: `u208993221.uslugar.eu`
   - Password: [tvoj password]
   - Port: `21`

2. **Ako se uspješno spojiš:**
   - ✅ Credentials su točni
   - ✅ Problem je u workflow konfiguraciji

3. **Ako se ne spojiš:**
   - ❌ Provjeri credentials u Hostinger Control Panel-u
   - ❌ Provjeri da je FTP account aktivan

---

## 💡 Česti Problemi i Rješenja

### **Problem 1: "ETIMEDOUT" na portu 21**

**Uzrok:** Firewall blokira port 21 ili server ne podržava FTP

**Rješenja:**
- Provjeri da li FileZilla radi (ako radi, problem je u workflow-u)
- Kontaktiraj Hostinger support
- Koristi alternativni deployment metodu

---

### **Problem 2: "Connection refused"**

**Uzrok:** Server ne prihvaća konekcije na portu 21

**Rješenja:**
- Provjeri da li je FTP account aktivan
- Provjeri da li server podržava FTP
- Pokušaj s SFTP (port 22)

---

### **Problem 3: "Authentication failed"**

**Uzrok:** Pogrešan username ili password

**Rješenja:**
- Provjeri GitHub Secrets
- Provjeri credentials u Hostinger Control Panel-u
- Provjeri da nema razmaka u password-u

---

## ✅ Provjera Nakon Fix-a

1. **Commit i push workflow fajla:**
   ```powershell
   cd "C:\GIT_PROJEKTI\Render"
   git add .github/workflows/frontend-uslugar.yml
   git commit -m "Improve FTP connection timeout handling"
   git push origin main
   ```

2. **Pokreni workflow ponovno**

3. **Provjeri logove:**
   - Provjeri port connectivity test
   - Provjeri da li se SFTP pokušava ako FTP ne radi
   - Provjeri specifične greške

---

## 🎯 Sljedeći Koraci

1. ✅ **Provjeri GitHub Secrets** - da su točni
2. ✅ **Test s FileZilla** - da potvrdiš credentials
3. ✅ **Provjeri Hostinger FTP Settings** - da je account aktivan
4. ✅ **Pokreni workflow ponovno** - s ažuriranim timeout-om
5. ✅ **Ako i dalje ne radi** - koristi alternativni deployment metodu

---

## 📞 Kontakt

**Ako i dalje imaš problema:**
- Kontaktiraj Hostinger support
- Provjeri da li server podržava FTP/FTPS/SFTP
- Provjeri firewall postavke

---

**Gotovo!** 🎯

