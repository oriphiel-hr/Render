# Mailtrap.io Setup Guide za Testiranje

Ovaj vodič objašnjava kako postaviti Mailtrap.io račune za automatsko testiranje emailova.

## Korak 1: Kreiraj Mailtrap.io Račun

1. Otvori https://mailtrap.io
2. Registriraj se (besplatno) ili prijavi se
3. Kreiraj novi projekt "Uslugar E2E Tests"

## Korak 2: Kreiraj Inbox-e za Grupe Korisnika

### Preporučena struktura inbox-ova:

1. **Clients Inbox** (ID: npr. `12345`)
   - Za: client, client1, client2, client3, ...
   - Emailovi koji dolaze na sve test client emailove

2. **Providers Inbox** (ID: npr. `12346`)
   - Za: provider, provider1, provider2, provider3, ...
   - Emailovi koji dolaze na sve test provider emailove

3. **Provider Company Inbox** (ID: npr. `12347`)
   - Za: providerCompany
   - Emailovi za tvrtke/obrte

4. **Global Inbox** (ID: `0` ili default)
   - Fallback inbox za sve ostale emailove

## Korak 3: Kreiraj Email Adrese za Test Korisnike

Za svakog test korisnika, kreiraj email adresu koja će koristiti Mailtrap inbox:

### Preporučene email adrese (možeš koristiti bilo koje):

**Klijenti:**
- `test.client@mailtrap.io` → Clients Inbox (ID: 12345)
- `test.client1@mailtrap.io` → Clients Inbox (ID: 12345)
- `test.client2@mailtrap.io` → Clients Inbox (ID: 12345)
- `test.client3@mailtrap.io` → Clients Inbox (ID: 12345)

**Pružatelji:**
- `test.provider@mailtrap.io` → Providers Inbox (ID: 12346)
- `test.provider1@mailtrap.io` → Providers Inbox (ID: 12346)
- `test.provider2@mailtrap.io` → Providers Inbox (ID: 12346)
- `test.provider3@mailtrap.io` → Providers Inbox (ID: 12346)

**Tvrtke:**
- `test.company@mailtrap.io` → Provider Company Inbox (ID: 12347)

### Alternativa: Koristi Mailtrap Email Adrese

Mailtrap automatski generira email adrese za svaki inbox:
- `clients@mailtrap.io` (za Clients inbox)
- `providers@mailtrap.io` (za Providers inbox)
- `company@mailtrap.io` (za Company inbox)

## Korak 4: Dobij API Key

1. U Mailtrap.io, otvori **Settings → API Tokens**
2. Klikni **Generate New Token**
3. Kopiraj token (npr. `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
4. Spremi token u Admin Panel → Test Podaci → Email Konfiguracija

## Korak 5: Dobij Inbox ID-eve

1. U Mailtrap.io, otvori svaki inbox
2. U URL-u ćeš vidjeti ID: `https://mailtrap.io/inboxes/12345/messages`
3. Inbox ID je broj (npr. `12345`)
4. Spremi inbox ID-eve u Admin Panel → Test Podaci

## Korak 6: Konfiguriraj u Admin Panelu

### Globalna Email Konfiguracija:
- **Mailtrap API Key**: Tvoj API token
- **Mailtrap Inbox ID**: Default inbox ID (npr. `0` ili glavni inbox ID)

### Za Svakog Korisnika:
- **Email**: `test.client@mailtrap.io` ili korištenje Mailtrap generiranih adresa
- **Email Pristup → Mailtrap Inbox ID**: Specifični inbox ID za tu grupu (npr. `12345` za clients)

## Primjer Konfiguracije

### Globalna:
```json
{
  "email": {
    "testService": {
      "apiKey": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "inboxId": "0"
    }
  }
}
```

### Client Korisnici:
```json
{
  "users": {
    "client": {
      "email": "test.client@mailtrap.io",
      "emailConfig": {
        "inboxId": "12345"
      }
    },
    "client1": {
      "email": "test.client1@mailtrap.io",
      "emailConfig": {
        "inboxId": "12345"
      }
    }
  }
}
```

### Provider Korisnici:
```json
{
  "users": {
    "provider": {
      "email": "test.provider@mailtrap.io",
      "emailConfig": {
        "inboxId": "12346"
      }
    },
    "provider1": {
      "email": "test.provider1@mailtrap.io",
      "emailConfig": {
        "inboxId": "12346"
      }
    }
  }
}
```

## Korak 7: Testiraj Konfiguraciju

1. U Admin Panelu → Test Podaci, unesi sve podatke
2. Klikni **Spremi test podatke**
3. Pokreni test "Verifikacija emaila" - trebao bi pronaći email u Mailtrap inboxu
4. Provjeri Mailtrap.io inbox - trebao bi vidjeti pristigle emailove

## Važno

- **API Key** je osjetljiv podatak - ne dijeli ga javno
- **Inbox ID** se može mijenjati, ali emailovi u starom inboxu neće biti dostupni
- Mailtrap je **besplatan** do određenih limita (oko 500 emailova mjesečno)
- Emailovi se **automatski brišu** nakon određenog vremena (proveri Mailtrap settings)

## Troubleshooting

### Emailovi se ne pronalaze:
1. Provjeri da je API Key ispravan
2. Provjeri da je Inbox ID ispravan
3. Provjeri da aplikacija šalje emailove na pravu adresu (`test.client@mailtrap.io`)
4. Provjeri Mailtrap inbox - možda email još nije pristigao (delay)

### API greška:
- Provjeri da je API Key kopiran u cijelosti (bez razmaka)
- Provjeri da imaš dozvole za pristup inboxu

## Alternativa: Lokalno Testiranje

Ako ne želiš koristiti Mailtrap, možeš koristiti:
- **MailHog** (lokalno)
- **MailCatcher** (lokalno)
- **Gmail App Passwords** (za stvarne emailove - ne preporučeno za testiranje)

