# 🚀 BRZI SEED - Legal Statuses

## Metoda 1: Automatska PowerShell skripta (PREPORUČENO) ⚡

```powershell
cd uslugar/backend
.\seed-legal-aws.ps1
```

Skripta će:
1. Potražiti DATABASE_URL u `.env`, `env.example`, ili `ENV_EXAMPLE.txt`
2. Ako ne nađe, zatražit će ga od vas
3. Automatski izvršiti seed

---

## Metoda 2: Ručno sa DATABASE_URL

### Korak 1: Kreirajte `.env` file

```powershell
cd uslugar/backend
Copy-Item env.example .env
```

### Korak 2: Otvorite `.env` i unesite AWS DATABASE_URL

```env
DATABASE_URL="postgresql://username:password@your-rds-endpoint.amazonaws.com:5432/uslugar_db"
```

**Primjer:**
```env
DATABASE_URL="postgresql://uslugar_admin:MyPassword123@uslugar-db.abc123.eu-central-1.rds.amazonaws.com:5432/uslugar_prod"
```

### Korak 3: Pokrenite seed

```powershell
npm run seed:legal
```

---

## Metoda 3: Inline DATABASE_URL (jednokratno)

```powershell
$env:DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/dbname"
npm run seed:legal
```

---

## Provjera uspjeha

Ako vidite:
```
✅ INDIVIDUAL      - Fizička osoba
✅ SOLE_TRADER     - Obrtnik
✅ PAUSAL          - Paušalni obrt
✅ DOO             - d.o.o.
✅ JDOO            - j.d.o.o.
✅ FREELANCER      - Samostalni djelatnik

🎉 Seed completed!
```

**Uspjeh!** 🎉 Sada možete registrirati pružatelje usluga!

---

## Troubleshooting

### Problem: "Can't reach database server"

**Rješenje:**
1. Provjerite Security Group na RDS - mora dozvoliti pristup sa vašeg IP-a
2. Provjerite je li RDS javno dostupan (Publicly accessible = Yes)
3. Provjerite endpoint, username i password

### Problem: "Table 'LegalStatus' does not exist"

**Rješenje:** Prvo pokrenite migracije:
```powershell
npm run migrate:deploy
```

Zatim pokrenite seed:
```powershell
npm run seed:legal
```

---

## Gdje naći AWS RDS podatke?

1. AWS Console → RDS → Databases
2. Kliknite na vašu bazu
3. Kopirajte **Endpoint**
4. Username/Password imate iz vremena kreiranja baze

**Format:**
```
postgresql://USERNAME:PASSWORD@ENDPOINT:5432/DATABASE_NAME
```

