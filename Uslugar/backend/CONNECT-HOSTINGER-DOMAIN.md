# 🌐 Kako Povezati Render Servis s Hostinger Custom Domain

## 📋 Pregled

**Render servis:** `https://uslugar.onrender.com`
**Cilj:** Povezati custom domain s Hostingera (npr. `api.uslugar.hr` ili `uslugar.hr`)

---

## 🔧 Korak po Korak

### **1. Render Dashboard - Dodaj Custom Domain**

1. **Render Dashboard** → Tvoj Service (`uslugar-backend`)
2. Klikni **"Settings"** tab (ili **"Custom Domains"**)
3. U sekciji **"Custom Domains"**, klikni **"+ Add Custom Domain"**
4. Unesi svoj domain (npr. `api.uslugar.hr` ili `backend.uslugar.hr`)
5. Klikni **"Add"** ili **"Save"**

### **2. Render će Pokazati DNS Postavke**

Nakon dodavanja custom domain-a, Render će pokazati **DNS zapise** koje treba dodati u Hostinger:

**Primjer DNS zapisa koje Render traži:**
```
Type: CNAME
Name: api (ili @ za root domain)
Value: uslugar.onrender.com
```

**ILI za root domain:**
```
Type: A
Name: @
Value: [Render IP adresa]
```

---

## 🎯 DNS Postavke u Hostingeru

### **1. Prijavi se u Hostinger Control Panel**

1. Idi na: https://hpanel.hostinger.com
2. Prijavi se s Hostinger računom
3. Odaberi domenu koju želiš koristiti (npr. `uslugar.hr`)

### **2. Idi na DNS Postavke**

1. U Hostinger Control Panel-u, klikni na svoj domain
2. Idi na **"DNS"** ili **"DNS Zone Editor"** tab
3. Pronađi sekciju za **DNS zapise** (DNS Records)

### **3. Dodaj CNAME Record (Za Subdomain)**

Ako želiš koristiti subdomain (npr. `api.uslugar.hr`):

**Hostinger DNS Postavke:**
```
Type: CNAME
Name: api (ili api.uslugar.hr)
Value: uslugar.onrender.com
TTL: 3600 (ili default)
```

**Koraci u Hostingeru:**
1. Klikni **"Add Record"** ili **"+ Add"**
2. **Type**: Odaberi **CNAME**
3. **Name**: `api` (za `api.uslugar.hr`) ili `backend` (za `backend.uslugar.hr`)
4. **Value**: `uslugar.onrender.com`
5. **TTL**: `3600` (ili default)
6. Klikni **"Save"** ili **"Add Record"**

### **4. Dodaj A Record (Za Root Domain)**

Ako želiš koristiti root domain (npr. `uslugar.hr`):

Render će dati IP adresu koja se koristi. Provjeri u Render Dashboard-u pod **Custom Domains** → klikni na domain → vidi **"DNS Configuration"**.

**Hostinger DNS Postavke:**
```
Type: A
Name: @ (ili prazno za root domain)
Value: [Render IP adresa - provjeri u Render Dashboard]
TTL: 3600
```

**Koraci u Hostingeru:**
1. Klikni **"Add Record"** ili **"+ Add"**
2. **Type**: Odaberi **A**
3. **Name**: `@` (za root domain) ili prazno
4. **Value**: Render IP adresa (npr. `54.123.45.67` - provjeri u Render Dashboard)
5. **TTL**: `3600`
6. Klikni **"Save"**

---

## ⚙️ Render Dashboard - SSL Certificate

### **1. Automatski SSL (Preporučeno)**

Render automatski generira SSL certifikat za custom domain:

1. **Render Dashboard** → Custom Domains
2. Nakon što DNS propagacija završi (može trajati 1-24 sata)
3. Render će automatski kreirati SSL certifikat
4. Status će biti: **"SSL Certificate Active"** ✅

### **2. Provjeri SSL Status**

U Render Dashboard-u → Custom Domains → klikni na domain:
- **Status**: "Active" ili "Pending" (ako čeka DNS propagaciju)
- **SSL**: "Active" (kada je certifikat generiran)

---

## 🕐 DNS Propagacija

### **Koliko Vremena Treba?**

- **CNAME Records**: Obično 1-4 sata
- **A Records**: Obično 4-24 sata
- **Maksimalno**: Može trajati do 48 sati (rijetko)

### **Kako Provjeriti da DNS Propagacija Je Završena:**

1. **Online DNS Checker:**
   - https://dnschecker.org
   - Unesi svoj domain (npr. `api.uslugar.hr`)
   - Provjeri da li CNAME ili A record pokazuje na Render

2. **Command Line:**
   ```bash
   # Provjeri CNAME
   nslookup api.uslugar.hr
   
   # ILI
   dig api.uslugar.hr CNAME
   
   # Provjeri A record (za root domain)
   nslookup uslugar.hr
   ```

3. **Očekivani Rezultat:**
   ```
   api.uslugar.hr → uslugar.onrender.com
   ```

---

## ✅ Provjera da Sve Radi

### **1. Provjeri DNS Propagaciju**

Nakon 1-4 sata (za CNAME) ili 4-24 sata (za A record):

```bash
# Provjeri da domain pokazuje na Render
curl -I https://api.uslugar.hr/api/health

# Očekivani odgovor: 200 OK
```

### **2. Provjeri SSL Certificate**

```bash
# Provjeri SSL certifikat
curl -vI https://api.uslugar.hr 2>&1 | grep -i "SSL\|certificate"

# Očekivani odgovor: SSL certificate valid
```

### **3. Provjeri u Render Dashboard**

Render Dashboard → Custom Domains → Status:
- ✅ **"Active"** - Domain je aktivan
- ✅ **"SSL Active"** - SSL certifikat je aktivan
- ⚠️ **"Pending"** - Još čeka DNS propagaciju

---

## 📋 Primjer Konfiguracije

### **Scenario 1: Subdomain (Preporučeno)**

**Domain:** `api.uslugar.hr`

**Render Dashboard:**
1. Custom Domains → Add Custom Domain
2. Unesi: `api.uslugar.hr`
3. Klikni "Add"

**Hostinger DNS:**
```
Type: CNAME
Name: api
Value: uslugar.onrender.com
TTL: 3600
```

**Rezultat:**
- `https://api.uslugar.hr` → Render servis
- SSL certifikat automatski generiran
- Svi API pozivi idu preko custom domain-a

### **Scenario 2: Root Domain**

**Domain:** `uslugar.hr`

**Render Dashboard:**
1. Custom Domains → Add Custom Domain
2. Unesi: `uslugar.hr`
3. Render će dati IP adresu za A record
4. Klikni "Add"

**Hostinger DNS:**
```
Type: A
Name: @
Value: [Render IP adresa - provjeri u Render Dashboard]
TTL: 3600
```

**Rezultat:**
- `https://uslugar.hr` → Render servis
- SSL certifikat automatski generiran

---

## ⚠️ Važne Napomene

### **1. CNAME vs A Record**

- **CNAME (Subdomain)**: Preporučeno, lakše za postavljanje
- **A Record (Root Domain)**: Moguće, ali Render IP adresa može promijeniti (rijetko)

### **2. SSL Certificate**

- Render automatski generira SSL certifikat (Let's Encrypt)
- Certifikat se obnavlja automatski
- Ne moraš ručno dodavati SSL certifikat

### **3. DNS Propagacija**

- **Ne brini ako ne radi odmah** - DNS propagacija može trajati i do 48 sati
- **Provjeri status** u Render Dashboard-u
- **Hostinger DNS cache** može biti sporiji od drugih providera

### **4. Multiple Domains**

- Možeš dodati više custom domain-a (npr. `api.uslugar.hr` i `backend.uslugar.hr`)
- Svaki domain dobiva svoj SSL certifikat
- Svi domain-i pokazuju na isti Render servis

---

## 🆘 Troubleshooting

### **Problem: "DNS not configured" u Render Dashboard**

**Uzrok:** DNS zapisi nisu dodani u Hostingeru ili propagacija još nije završena

**Rješenje:**
1. ✅ Provjeri da DNS zapisi su dodani u Hostingeru
2. ✅ Provjeri da vrijednosti su točne (CNAME → `uslugar.onrender.com`)
3. ✅ Čekaj DNS propagaciju (1-24 sata)
4. ✅ Provjeri DNS propagaciju na https://dnschecker.org

### **Problem: "SSL certificate pending"**

**Uzrok:** DNS propagacija još nije završena ili DNS zapisi nisu točni

**Rješenje:**
1. ✅ Provjeri da DNS propagacija je završena
2. ✅ Provjeri da domain pokazuje na Render (nslookup)
3. ✅ Čekaj da Render generira SSL certifikat (može trajati nekoliko sati)
4. ✅ Provjeri Render Dashboard → Custom Domains → SSL status

### **Problem: "404 Not Found" nakon DNS propagacije**

**Uzrok:** Domain je povezan, ali Render servis ne odgovara na custom domain

**Rješenje:**
1. ✅ Provjeri da custom domain je aktivan u Render Dashboard-u
2. ✅ Provjeri da Render servis radi (`https://uslugar.onrender.com`)
3. ✅ Provjeri da nema firewall ili security grupa koje blokiraju pristup

### **Problem: "Connection refused" ili "Connection timeout"**

**Uzrok:** DNS propagacija nije završena ili DNS zapisi su pogrešni

**Rješenje:**
1. ✅ Provjeri DNS zapise u Hostingeru (CNAME ili A record)
2. ✅ Provjeri da vrijednosti su točne
3. ✅ Provjeri DNS propagaciju (može trajati i do 48 sati)
4. ✅ Kontaktiraj Hostinger support ako problem persistira

---

## 📝 Checklist

- [ ] Render Dashboard → Custom Domains → Dodao custom domain
- [ ] Hostinger DNS → Dodao CNAME ili A record
- [ ] Provjerio da DNS zapisi su točni (CNAME → `uslugar.onrender.com`)
- [ ] Čekao DNS propagaciju (1-24 sata)
- [ ] Provjerio DNS propagaciju na https://dnschecker.org
- [ ] Render Dashboard → SSL Certificate status je "Active"
- [ ] Testirao custom domain (`curl https://api.uslugar.hr/api/health`)
- [ ] Provjerio da SSL certifikat je validan

---

## ✅ Konačni Koraci

1. ✅ **Render Dashboard** → Custom Domains → Dodaj domain
2. ✅ **Hostinger DNS** → Dodaj CNAME ili A record
3. ✅ **Čekaj DNS propagaciju** (1-24 sata)
4. ✅ **Provjeri DNS propagaciju** na https://dnschecker.org
5. ✅ **Provjeri Render Dashboard** → SSL Certificate status
6. ✅ **Testiraj custom domain** → `https://api.uslugar.hr/api/health`

**Gotovo!** 🎉 Custom domain sada pokazuje na Render servis!

---

## 🔗 Korisni Linkovi

- **Render Custom Domains Documentation**: https://render.com/docs/custom-domains
- **Hostinger DNS Guide**: https://support.hostinger.com/en/articles/1583290-dns-zone-editor
- **DNS Checker**: https://dnschecker.org
- **SSL Checker**: https://www.ssllabs.com/ssltest/

