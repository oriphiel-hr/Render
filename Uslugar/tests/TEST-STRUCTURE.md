# Reorganizirana struktura testova

## Pregled

Testovi su reorganizirani prema prirodnom toku s checkpoint/rollback mehanizmom. Svaki test dokumentira:
- **Tko izvršava**: Koji korisnik/rola izvršava test
- **Rollback**: Da li se koristi rollback nakon testa
- **Redoslijed**: Sequential (nijedna akcija nije istovremena)

## Struktura testova

### Sektor 1: Korisnici s neispravnim podacima (najkraći tok)
**IZVRŠAVA**: Test framework  
**ROLLBACK**: Da (nakon svakog testa)  
**REDOSLIJED**: Prvo

1. **1.1** - Registracija klijenta s invalid email formatom
   - IZVRŠAVA: Test framework
   - ROLLBACK: Da
   - Očekivani rezultat: Greška za invalid email

2. **1.2** - Registracija providera s prekratkim OIB-om
   - IZVRŠAVA: Test framework
   - ROLLBACK: Da
   - Očekivani rezultat: Greška za invalid OIB

3. **1.3** - Registracija tvrtke (DOO) bez naziva tvrtke
   - IZVRŠAVA: Test framework
   - ROLLBACK: Da
   - Očekivani rezultat: Greška za nedostajući naziv tvrtke

4. **1.4** - Prijava s nevažećim credentials
   - IZVRŠAVA: Test framework
   - ROLLBACK: Da
   - Očekivani rezultat: Greška za invalid credentials

### Sektor 2: Korisnici s nedostajućim podacima
**IZVRŠAVA**: Test framework  
**ROLLBACK**: Da (nakon svakog testa)

1. **2.1** - Registracija klijenta s nedostajućim podacima
   - IZVRŠAVA: Test framework
   - ROLLBACK: Da
   - Očekivani rezultat: Greške za nedostajuće obavezne podatke

### Sektor 3: Grupa A - Povezani korisnici
**IZVRŠAVA**: Klijent A, Direktor A, Član tima A (sequential)  
**ROLLBACK**: Da (nakon svakog testa)

**Setup (beforeAll)**:
- Kreiraj Klijent A
- Kreiraj Direktor A (direktor tvrtke)
- Kreiraj Član tima A (zaposlenik tvrtke, povezan s Direktorom A)
- Checkpoint: `initial-setup`

1. **3.1** - Klijent A kreira Posao 1
   - IZVRŠAVA: Klijent A
   - ROLLBACK: Da
   - Checkpoint: `after-job-1-creation`
   - Očekivani rezultat: Posao 1 uspješno kreiran

2. **3.2** - Direktor A vidi Posao 1
   - IZVRŠAVA: Direktor A
   - ROLLBACK: Da (rollback na `after-job-1-creation`)
   - Očekivani rezultat: Direktor A vidi Posao 1 u leadovima

3. **3.3** - Član tima A vidi Posao 1
   - IZVRŠAVA: Član tima A
   - ROLLBACK: Da (rollback na `after-job-1-creation`)
   - Očekivani rezultat: Član tima A vidi Posao 1 u leadovima

### Sektor 4: Grupa B - Izolirani korisnici
**IZVRŠAVA**: Klijent B, Direktor B, Član tima B (sequential)  
**ROLLBACK**: Da (nakon svakog testa)

**Setup (beforeAll)**:
- Kreiraj Klijent B
- Kreiraj Direktor B (druga tvrtka)
- Kreiraj Član tima B (druga tvrtka, povezan s Direktorom B)

1. **4.1** - Klijent B NE vidi Posao 1 (security test)
   - IZVRŠAVA: Klijent B
   - ROLLBACK: Da (rollback na `after-job-1-creation`)
   - Očekivani rezultat: Klijent B NE vidi Posao 1

2. **4.2** - Direktor B NE vidi Posao 1 (security test)
   - IZVRŠAVA: Direktor B
   - ROLLBACK: Da (rollback na `after-job-1-creation`)
   - Očekivani rezultat: Direktor B NE vidi Posao 1

3. **4.3** - Član tima B NE vidi Posao 1 (security test)
   - IZVRŠAVA: Član tima B
   - ROLLBACK: Da (rollback na `after-job-1-creation`)
   - Očekivani rezultat: Član tima B NE vidi Posao 1

### Sektor 5: Admin testovi
**IZVRŠAVA**: Admin  
**ROLLBACK**: Da (nakon svakog testa)

1. **5.1** - Admin vidi sve korisnike
   - IZVRŠAVA: Admin
   - ROLLBACK: Da (rollback na `initial-setup`)
   - Očekivani rezultat: Admin vidi sve korisnike (Grupa A i Grupa B)

2. **5.2** - Admin vidi sve poslove
   - IZVRŠAVA: Admin
   - ROLLBACK: Da (rollback na `after-job-1-creation`)
   - Očekivani rezultat: Admin vidi Posao 1

3. **5.3** - Admin može obrisati korisnika
   - IZVRŠAVA: Admin
   - ROLLBACK: Da (rollback na `initial-setup`)
   - Očekivani rezultat: Admin uspješno briše korisnika

## Checkpoint/Rollback mehanizam

### Trenutna implementacija (simulacija)
- `TestCheckpoint` klasa simulira checkpoint/rollback
- Checkpointi se spremaju u memoriju
- Rollback vraća na checkpoint (u stvarnoj implementaciji bi bilo SQL UPDATE)

### Buduća implementacija (stvarni SQL rollback)
```sql
-- Kreiraj checkpoint (snapshot stanja)
CREATE TABLE checkpoint_state AS 
SELECT * FROM users WHERE email LIKE 'test.%';

-- Rollback na checkpoint
UPDATE users SET ... WHERE email IN (SELECT email FROM checkpoint_state);
```

## Redoslijed izvršavanja

1. **beforeAll**: Kreiraj sve test korisnike (Grupa A, Grupa B, Admin)
2. **Sektor 1**: Neispravni podaci (najkraći tok)
3. **Sektor 2**: Nedostajući podaci
4. **Sektor 3**: Grupa A - Povezani korisnici
5. **Sektor 4**: Grupa B - Izolirani korisnici (security testovi)
6. **Sektor 5**: Admin testovi
7. **afterAll**: Rollback i cleanup svih korisnika

## Pokretanje testova

```bash
# Pokreni reorganizirane testove
npx playwright test e2e/reorganized-test-suite.spec.js

# Pokreni s verbose output
npx playwright test e2e/reorganized-test-suite.spec.js --reporter=list

# Pokreni samo jedan sektor
npx playwright test e2e/reorganized-test-suite.spec.js -g "Sektor 1"
```

## Napomene

- **Sequential izvršavanje**: `fullyParallel: false` u `playwright.config.js`
- **Nijedna akcija nije istovremena**: Testovi se izvršavaju jedan za drugim
- **Checkpoint/rollback**: Svaki test koristi checkpoint prije akcija i rollback nakon testa
- **Security focus**: Sektor 4 testira da korisnici ne vide što ne smiju

