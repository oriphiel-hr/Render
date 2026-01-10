# Dodavanje novih kategorija u Uslugar bazu podataka

## Pregled

Ovaj dokument opisuje kako dodati **58 novih kategorija** u Uslugar platformu. Sve nove kategorije će biti **neaktivne** (`isActive: false`) po defaultu, tako da možete aktivirati samo one koje želite koristiti.

## Što je dodano?

### 📊 Statistika
- **Ukupno kategorija:** 58 novih
- **Status:** Sve su `isActive: false` (neaktivne)
- **Format:** Sve kategorije imaju ID, naziv, opis, ikonu i NKD kod

### 📁 Kategorije po prioritetima

#### 🔥 VISOKA PRIORITETA (18 kategorija)
- **Arhitektura i dizajn** (5): Arhitekti, Dizajneri interijera, 3D vizualizacija, Projektiranje građevina, Vrtni dizajn
- **IT i web usluge** (7): Web dizajn, Programiranje, Mobilne aplikacije, SEO, Cyber sigurnost, Cloud, IT konzulting
- **Zdravstvene usluge** (6): Fizioterapija, Nutricionizam, Mentalno zdravlje, Kućni liječnik, Stomatologija, Optometristi

#### ⚡ SREDNJA PRIORITETA (28 kategorija)
- **Edukacija i trening** (6): Jezični tečajevi, Poslovni trening, Glazbena nastava, Sportska nastava, Umjetnička nastava, Online edukacija
- **Turističke usluge** (5): Turistički vodiči, Turistički agenti, Hotelijerske usluge, Prijevoz turista, Event organizacija
- **Financijske usluge** (5): Investicijski savjeti, Bankovne usluge, Financijsko planiranje, Hipotekarni savjeti, Osiguranje
- **Marketing i PR** (5): Marketing agencije, Reklamne usluge, Social media marketing, PR usluge, Branding
- **Transport i logistika** (5): Kamionski prijevoz, Kurirske usluge, Međunarodni transport, Skladišne usluge, Specijalizirani transport

#### 📉 NISKA PRIORITETA (5 kategorija)
- **Ostale usluge** (5): Zabavne usluge, Umjetničke usluge, Trgovinske usluge, Poslovne usluge, Popravak opreme

## 📝 Instrukcije za izvršavanje

### Opcija 1: Izvršavanje na AWS ECS (preporučeno)

1. **Provjerite AWS CLI konfiguraciju**
   ```bash
   aws --version
   aws configure
   ```

2. **Pokrenite PowerShell skriptu**
   ```powershell
   cd uslugar/backend
   .\add-categories-aws.ps1
   ```

3. **Pratite output**
   - Skripta će automatski pronaći pokrenuti ECS task
   - Izvršit će `add-new-categories.js` skriptu
   - Prikazat će sve dodane kategorije

### Opcija 2: Lokalno izvršavanje (potrebna konekcija na RDS)

1. **Postavite DATABASE_URL**
   ```powershell
   $env:DATABASE_URL = "postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar"
   ```

2. **Pokrenite skriptu**
   ```powershell
   cd uslugar/backend
   node add-new-categories.js
   ```

### Opcija 3: Izravni SQL import

1. **Koristite SQL datoteku**
   ```bash
   psql "postgres://uslugar_user:Pastor123@uslugar-db.cr80o0eeg3gy.eu-north-1.rds.amazonaws.com:5432/uslugar" -f add-categories.sql
   ```

## ✅ Provjera

Nakon izvršavanja, provjerite da su kategorije dodane:

```sql
-- Provjeri broj kategorija
SELECT COUNT(*) FROM "Category" WHERE "isActive" = false;

-- Provjeri nove kategorije
SELECT name, description, icon, "requiresLicense", "nkdCode" 
FROM "Category" 
WHERE id LIKE 'arch_%' OR id LIKE 'it_%' OR id LIKE 'health_%'
ORDER BY id;
```

## 🎯 Aktivacija kategorija

Nakon što dodate kategorije, možete ih aktivirati:

```sql
-- Aktiviraj sve visokoprofitabilne kategorije
UPDATE "Category" 
SET "isActive" = true 
WHERE id IN (
  'arch_001', 'arch_002', 'it_001', 'it_002', 'it_003',
  'health_001', 'health_002', 'health_003'
);

-- ILI aktiviraj sve nove kategorije odjednom
UPDATE "Category" 
SET "isActive" = true 
WHERE id LIKE 'arch_%' OR id LIKE 'it_%' OR id LIKE 'health_%';
```

## 📊 Postojeće kategorije

Platforma već ima **42 aktivne kategorije**, stoga ćete nakon dodavanja imati **100 ukupno** kategorija.

## 🔧 Troubleshooting

### Greška: "Can't reach database server"
- Provjerite da li je RDS instanca dostupna
- Provjerite security groups i VPC konfiguraciju

### Greška: "Already exists"
- To je normalno - skripta će preskočiti kategorije koje već postoje

### Greška: "No running tasks found"
- Provjerite da li je ECS servis pokrenut
- Provjerite ime servisa u skripti

## 📞 Kontakt

Za pomoć ili pitanja, kontaktirajte development tim.

---

**Napomena:** Sve nove kategorije imaju `isActive: false` po defaultu. Možete ih aktivirati prema potrebi kroz admin panel ili direktno kroz SQL.
