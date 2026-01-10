# 🔍 Provjera: Je li Render Servis Povezan s PostgreSQL Bazom?

## 📋 Informacije o Bazi Podataka

**Tvoja baza podataka:**
```
postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a/uslugar
```

**Render servis:**
```
https://uslugar.onrender.com
```

---

## ✅ Kako Provjeriti Da li je Povezan

### **1. Render Dashboard - Environment Variables**

1. **Render Dashboard** → Tvoj Service (`uslugar-backend`) → **Environment**
2. Pronađi varijablu **`DATABASE_URL`**
3. Provjeri da li je vrijednost:
   ```
   postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a/uslugar
   ```

### **2. Render Logs - Provjeri Migracije**

Iz logova vidim da su migracije uspješne:
```
✅ Migrations complete.
```

To znači da je **baza podataka povezana i funkcionalna**, ali trebam provjeriti da li je to **tvoja specifična baza**.

### **3. Provjeri u Render Logs**

U Render Dashboard → **Logs**, traži:
- `Prisma schema loaded from prisma/schema.prisma`
- `✅ Migrations complete.`
- Greške vezane za konekciju s bazom (ako postoje)

---

## 🔍 Kako Provjeriti Trenutnu Konekciju

### **Metoda 1: Provjeri Environment Variables u Render Dashboard**

1. **Render Dashboard** → Tvoj Service → **Environment**
2. Klikni **`DATABASE_URL`** varijablu
3. Provjeri da li vrijednost odgovara tvojoj bazi

### **Metoda 2: Provjeri Preko Render Logs**

Ako želiš vidjeti koja se baza koristi (bez prikazivanja passworda), možeš dodati debug kod:

**Dodaj u `src/server.js` ili neki route:**
```javascript
// Debug: Provjeri DATABASE_URL (bez passworda)
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  // Maskiraj password u URL-u
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':***@');
  console.log('[DEBUG] DATABASE_URL:', maskedUrl);
}
```

**ILI provjeri direktno u Render Dashboard:**

Render Dashboard → **Logs** → Traži `DATABASE_URL` ili connection errors

### **Metoda 3: Provjeri Preko API Endpoint-a (Ako Postoji)**

Ako imaš admin endpoint za provjeru konfiguracije, možeš ga pozvati:
```bash
curl https://uslugar.onrender.com/api/admin/database/tables
```

Ovo bi trebalo vratiti listu tablica iz tvoje baze.

---

## ⚠️ Važno: Render PostgreSQL Add-on

### **Ako Koristiš Render PostgreSQL Add-on:**

Render može automatski dodati `DATABASE_URL` environment varijablu kada:
1. Kreiraš **PostgreSQL** add-on u Render Dashboard-u
2. Povežeš ga sa svojim **Web Service**-om
3. Render automatski postavlja `DATABASE_URL` environment varijablu

### **Ako Koristiš Vanjsku Bazu (kao što je tvoja):**

Ako tvoja baza nije Render PostgreSQL add-on, moraš **ručno dodati** `DATABASE_URL` u Render Dashboard-u:

1. **Render Dashboard** → Tvoj Service → **Environment**
2. Klikni **"Add Environment Variable"**
3. **Key**: `DATABASE_URL`
4. **Value**: `postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a/uslugar`
5. Klikni **"Save Changes"**
6. **Restart** servis (Render će automatski restart-ati nakon spremanja)

---

## 🔐 Provjera Konekcije

### **1. Provjeri da Baza Postoji i Dostupna je:**

```bash
# Testiraj konekciju direktno (s lokalnog računala)
psql "postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a/uslugar" -c "SELECT version();"
```

**Očekivani output:** PostgreSQL verzija (npr. `PostgreSQL 15.x`)

### **2. Provjeri da Servis Koristi Tu Bazu:**

Iz Render logs, migracije su uspješne, što znači da je baza povezana. Ali trebam provjeriti **koja se baza koristi**.

### **3. Provjeri Tabele u Bazi:**

Ako je servis povezan s tvojom bazom, trebao bi moći vidjeti tabele:
```bash
psql "postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a/uslugar" -c "\dt"
```

---

## ✅ Odgovor na Tvoje Pitanje

**Da li je Render servis povezan s tvojom bazom?**

**Provjeri:**
1. ✅ Render Dashboard → Environment → `DATABASE_URL` varijabla
2. ✅ Da li vrijednost odgovara tvojoj bazi
3. ✅ Da li su migracije uspješne (iz logova: `✅ Migrations complete.`)

**Ako `DATABASE_URL` ne odgovara tvojoj bazi:**
1. **Ažuriraj** `DATABASE_URL` u Render Dashboard-u
2. **Restart** servis
3. **Provjeri** migracije ponovo

**Ako `DATABASE_URL` odgovara tvojoj bazi:**
✅ **DA**, servis je povezan s tvojom bazom!

---

## 🔧 Kako Ažurirati DATABASE_URL u Render Dashboard-u

### **Koraci:**

1. **Render Dashboard** → Tvoj Service (`uslugar-backend`)
2. Klikni **"Environment"** tab
3. Pronađi **`DATABASE_URL`** varijablu (ako postoji)
4. **Ažuriraj** vrijednost:
   ```
   postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a/uslugar
   ```
5. **ILI** ako ne postoji, klikni **"Add Environment Variable"**
6. **Key**: `DATABASE_URL`
7. **Value**: Tvoj connection string
8. Klikni **"Save Changes"**
9. Render će automatski restart-ati servis

---

## 🧪 Testiranje Nakon Ažuriranja

### **1. Provjeri Render Logs:**

Render Dashboard → **Logs** → Traži:
```
✅ Migrations complete.
```

**ILI greške:**
```
Error: Can't reach database server
```

### **2. Testiraj API:**

```bash
# Testiraj health check
curl https://uslugar.onrender.com/api/health

# Testiraj database endpoint (ako postoji)
curl https://uslugar.onrender.com/api/admin/database/tables
```

### **3. Provjeri da Podaci Postoje:**

Ako je sve OK, trebao bi moći vidjeti podatke u bazi:
```sql
-- Preko psql
psql "postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a/uslugar" -c "SELECT COUNT(*) FROM \"User\";"
```

---

## 📝 Checklist

- [ ] Render Dashboard → Environment → Provjeri `DATABASE_URL`
- [ ] Vrijednost odgovara: `postgresql://uslugar_user:Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm@dpg-d5g06gshg0os738en9cg-a/uslugar`
- [ ] Render Logs pokazuju: `✅ Migrations complete.`
- [ ] Nema grešaka vezanih za konekciju s bazom
- [ ] API endpoint `/api/health` radi
- [ ] Podaci u bazi su dostupni (ako testiraš endpoint)

---

## 🆘 Troubleshooting

### **Problem: "Can't reach database server"**

**Uzrok:** `DATABASE_URL` je pogrešan ili baza nije dostupna

**Rješenje:**
1. ✅ Provjeri da `DATABASE_URL` je točan
2. ✅ Provjeri da baza je dostupna s interneta (ne samo lokalno)
3. ✅ Provjeri firewall postavke baze
4. ✅ Provjeri da hostname (`dpg-d5g06gshg0os738en9cg-a`) je točan

### **Problem: "Authentication failed"**

**Uzrok:** Username ili password je pogrešan

**Rješenje:**
1. ✅ Provjeri da username: `uslugar_user` je točan
2. ✅ Provjeri da password: `Qwvk5j6QpbR8XGO8flXIDeg0GU76xORm` je točan
3. ✅ Provjeri da nema razmaka u connection string-u

### **Problem: "Database does not exist"**

**Uzrok:** Database name (`uslugar`) ne postoji

**Rješenje:**
1. ✅ Provjeri da database name je točan
2. ✅ Kreiraj database ako ne postoji:
   ```sql
   CREATE DATABASE uslugar;
   ```

---

## ✅ Konačni Odgovor

**Da provjeriš da li je Render servis povezan s tvojom bazom:**

1. **Render Dashboard** → Environment → Provjeri `DATABASE_URL`
2. **Render Logs** → Provjeri da migracije su uspješne
3. **Testiraj API** → Provjeri da podaci su dostupni

**Ako sve to odgovara tvojoj bazi, servis JE povezan!** ✅

