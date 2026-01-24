# Optimizirana Test Strategija - Checkpoint/Rollback s Minimalnim Korisnicima

## 🎯 Koncept

**Umjesto** kreiranja 9+ različitih test korisnika za različite scenarije:
```
❌ clientInvalid, clientMissing, provider, providerNoLicense, providerNoKYC, ...
```

**Koristi** samo 5-6 globalnih korisnika + checkpoint/rollback za različite scenarije:
```
✅ client (1 korisnik za sve test scenarije)
✅ provider (1 korisnik za sve provider scenarije)
✅ director (1 korisnik s timom)
✅ teamMember (1 član tima)
✅ admin (1 admin)
```

## 🔄 Kako radi Checkpoint/Rollback?

### Primjer Test Scenarija

```javascript
// Test 1.1: Registracija s ISPRAVNIM i NEISPRAVNIM podacima

// Scenarij 1: NEISPRAVNA registracija - invalid email
await checkpointManager.create('before-invalid-email-test')  // Spremi stanje
  - Unesi email: "invalid-email" (GREŠKA - nema @)
  - Klikni submit → TREBALA BI GREŠKA
  - Korisnik NIJE kreiran
await checkpointManager.rollback('before-invalid-email-test')  // Vraćanje na prethodno stanje

// Scenarij 2: NEISPRAVNA registracija - slaba lozinka
await checkpointManager.create('before-weak-password-test')
  - Unesi lozinku: "123" (GREŠKA - prekratka)
  - Klikni submit → TREBALA BI GREŠKA
  - Korisnik NIJE kreiran
await checkpointManager.rollback('before-weak-password-test')

// Scenarij 3: ISPRAVNA registracija
await checkpointManager.create('before-valid-registration-test')
  - Unesi ispravne podatke
  - Klikni submit → TREBALA BI USPJEŠNA REGISTRACIJA
  - Korisnik JE kreiran
await checkpointManager.rollback('before-valid-registration-test')  // Obriši korisnika
```

## ✨ Prednosti

| Aspekt | Stari pristup | Novi pristup |
|--------|--------------|-------------|
| Globalni korisnici | 9+ | **5-6** |
| Test konfiguracija | Komplicirano | **Jednostavno** |
| Memorija | Velika | **Manja** |
| Brzina initijalizacije | Spora | **Brža** |
| Čišćenje/Cleanup | Komplicirano | **Jednostavno** |
| Scenariji po korisniku | 1 | **10+** |
| Ukupan broj testova | Isti | **Isti** |

## 🏗️ Struktura Test Suite-a

### optimized-test-suite.spec.js

```javascript
beforeAll() {
  // Kreiraj samo 5-6 globalnih korisnika
  - client
  - provider
  - director
  - teamMember
  - admin
}

describe("Sektor 1: Registracija i Autentifikacija") {
  test("1.1 - Registracija (ispravni i neispravni scenariji)") {
    // Scenarij 1: NEISPRAVNA - invalid email
    checkpoint("before-invalid-email")
    test...
    rollback("before-invalid-email")

    // Scenarij 2: NEISPRAVNA - slaba lozinka
    checkpoint("before-weak-password")
    test...
    rollback("before-weak-password")

    // Scenarij 3: ISPRAVNA
    checkpoint("before-valid-registration")
    test...
    rollback("before-valid-registration")
  }

  test("1.2 - Prijava (ispravni i neispravni scenariji)") {
    // Scenarij 1: NEISPRAVNA prijava
    checkpoint("before-invalid-login")
    test...
    rollback("before-invalid-login")

    // Scenarij 2: ISPRAVNA prijava
    checkpoint("before-valid-login")
    test...
    rollback("before-valid-login")
  }
}
```

## 📊 Test Coverage

### Sektor 1: Registracija i Autentifikacija
- ✅ 1.1: Registracija (invalid email, weak password, valid)
- ✅ 1.2: Prijava (invalid credentials, valid)
- ✅ 1.3: Email verifikacija
- ✅ 1.4: JWT token autentifikacija

### Sektor 2: Upravljanje Poslovima
- ✅ 2.1: Objavljivanje novih poslova
- ✅ 2.2: Filtriranje poslova po kategoriji

### Sektor 3: Sustav Ponuda
- ✅ 3.1: Slanje ponuda za posao

### Sektor 4: Profili Pružatelja
- ✅ 4.1: Profil pružatelja i odabir kategorija
- ✅ 4.2: Team Locations s MapPicker-om

### Sektor 5: Admin Funkcionalnosti
- ✅ 5.1: Admin može vidjeti sve korisnike

## 🚀 Kako pokrenuti testove

```bash
# Pokreni sve optimizirane testove
npx playwright test tests/e2e/optimized-test-suite.spec.js

# Pokreni samo određeni sektor
npx playwright test tests/e2e/optimized-test-suite.spec.js -g "Sektor 1"

# Pokreni samo određeni test
npx playwright test tests/e2e/optimized-test-suite.spec.js -g "1.1 - Registracija"

# Pokreni s vizualizacijom
npx playwright test tests/e2e/optimized-test-suite.spec.js --headed
```

## 📈 Skalabilnost

Ovaj pristup je jednostavno skalabilan - za nove sektore:

```javascript
describe("Sektor N: [Naziv]", () => {
  test("N.1 - [Test naziv]", async ({ page }) => {
    await checkpointManager.create("before-test-n-1")
    // Test scenario 1 (može biti invalid, valid, edge case)
    await checkpointManager.rollback("before-test-n-1")

    await checkpointManager.create("before-test-n-2")
    // Test scenario 2
    await checkpointManager.rollback("before-test-n-2")

    await checkpointManager.create("before-test-n-3")
    // Test scenario 3
    await checkpointManager.rollback("before-test-n-3")
  })
})
```

## ✅ Prednosti za održavanje

1. **Manje konfiguracije** - Samo 5-6 korisnika umjesto 9+
2. **Veća čitljivost** - Svaki test scenarij je jasan (invalid, valid, edge case)
3. **Brže izvršavanje** - Manje inicijalizacije, manje cleanup-a
4. **Lakše dodavanje testova** - Checkpoint/rollback template se lako kopira
5. **Lakše debugiranje** - Manje globalnog stanja koje treba pratiti
6. **Sigurnost podataka** - Automatski rollback osigurava da se podaci ne nakupljaju

## 🔧 Sljedeći koraci

1. Testiraj `optimized-test-suite.spec.js` lokalno
2. Ažuriraj `complete-features-test.spec.js` na isti pristup
3. Zastarjeli testovi (`reorganized-test-suite.spec.js`) mogu biti arhivirani

