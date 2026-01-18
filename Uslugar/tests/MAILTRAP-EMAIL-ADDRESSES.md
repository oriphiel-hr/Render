# Mailtrap.io Email Adrese za Testiranje

Ovo je dokumentacija s preporučenim Mailtrap.io email adresama za testiranje.

## ⚠️ VAŽNO

**JA NE MOGU KREIRATI MAILTRAP.IO RAČUNE ZA TEBE** - moraš ih kreirati sam u Mailtrap.io servisu.

Međutim, evo **preporučenih email adresa** koje možeš koristiti kada kreiraš Mailtrap račune.

## Preporučene Email Adrese

### Klijenti (Clients)

Kreiraj Mailtrap inbox za clients (npr. Inbox ID: `12345`), i koristi sljedeće email adrese:

| Test Korisnik | Email Adresa (za aplikaciju) | Mailtrap Email Adresa | Inbox ID |
|--------------|------------------------------|----------------------|----------|
| client | `test.client@uslugar.hr` | `test.client@mailtrap.io` | `12345` |
| client1 | `test.client1@uslugar.hr` | `test.client1@mailtrap.io` | `12345` |
| client2 | `test.client2@uslugar.hr` | `test.client2@mailtrap.io` | `12345` |
| client3 | `test.client3@uslugar.hr` | `test.client3@mailtrap.io` | `12345` |
| client4 | `test.client4@uslugar.hr` | `test.client4@mailtrap.io` | `12345` |
| client5 | `test.client5@uslugar.hr` | `test.client5@mailtrap.io` | `12345` |

**Napomena:** Svi client korisnici mogu koristiti isti Mailtrap inbox (npr. `12345`), a emailovi se filtriraju po `to` adresi.

### Pružatelji (Providers)

Kreiraj Mailtrap inbox za providers (npr. Inbox ID: `12346`), i koristi sljedeće email adrese:

| Test Korisnik | Email Adresa (za aplikaciju) | Mailtrap Email Adresa | Inbox ID |
|--------------|------------------------------|----------------------|----------|
| provider | `test.provider@uslugar.hr` | `test.provider@mailtrap.io` | `12346` |
| provider1 | `test.provider1@uslugar.hr` | `test.provider1@mailtrap.io` | `12346` |
| provider2 | `test.provider2@uslugar.hr` | `test.provider2@mailtrap.io` | `12346` |
| provider3 | `test.provider3@uslugar.hr` | `test.provider3@mailtrap.io` | `12346` |
| provider4 | `test.provider4@uslugar.hr` | `test.provider4@mailtrap.io` | `12346` |
| provider5 | `test.provider5@uslugar.hr` | `test.provider5@mailtrap.io` | `12346` |

**Napomena:** Svi provider korisnici mogu koristiti isti Mailtrap inbox (npr. `12346`).

### Tvrtke (Provider Companies)

Kreiraj Mailtrap inbox za provider companies (npr. Inbox ID: `12347`), i koristi sljedeće email adrese:

| Test Korisnik | Email Adresa (za aplikaciju) | Mailtrap Email Adresa | Inbox ID |
|--------------|------------------------------|----------------------|----------|
| providerCompany | `test.company@uslugar.hr` | `test.company@mailtrap.io` | `12347` |
| providerCompany1 | `test.company1@uslugar.hr` | `test.company1@mailtrap.io` | `12347` |

### Administratori (Admin)

**Za ADMIN-a ne treba Mailtrap račun** - admin korisnik ne primaju test emailove (verifikaciju, reset lozinke, itd.).

## Kako Postaviti

### 1. Kreiraj Mailtrap.io Račun

1. Otvori https://mailtrap.io
2. Registriraj se (besplatno)
3. Kreiraj projekt "Uslugar E2E Tests"

### 2. Kreiraj Inbox-e

Kreiraj sljedeće inbox-e:

- **Clients Inbox** → Kopiraj Inbox ID (npr. `12345`)
- **Providers Inbox** → Kopiraj Inbox ID (npr. `12346`)
- **Provider Company Inbox** → Kopiraj Inbox ID (npr. `12347`)
- **Default/Global Inbox** → Kopiraj Inbox ID (obično `0`)

### 3. Dobij API Key

1. Settings → API Tokens
2. Generate New Token
3. Kopiraj token (npr. `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### 4. Konfiguriraj u Admin Panelu

1. **Email Konfiguracija** (gore):
   - **Mailtrap API Key**: `[TVOJ_API_KEY]`
   - **Mailtrap Inbox ID**: `0` (ili default inbox ID)

2. **Za Svakog Korisnika** (Email Pristup sekcija):
   - **Mailtrap Email Adresa**: Unesi Mailtrap email adresu (npr. `test.client@mailtrap.io`)
   - **Mailtrap Inbox ID**: Unesi inbox ID za tu grupu (npr. `12345` za clients)

### 5. Konfiguriraj Aplikaciju

⚠️ **VAŽNO:** Aplikacija mora slati emailove na **Mailtrap email adrese**, ne na aplikacijske email adrese.

Primjer:
- Ako je korisnik `test.client@uslugar.hr`, aplikacija bi trebala slati emailove na `test.client@mailtrap.io`
- Ili konfigurirati Mailtrap kao SMTP server u aplikaciji

## Primjer Konfiguracije

### Globalna Email Konfiguracija:
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

### Client Korisnik:
```json
{
  "users": {
    "client": {
      "email": "test.client@uslugar.hr",
      "mailtrapEmail": "test.client@mailtrap.io",
      "emailConfig": {
        "inboxId": "12345"
      }
    }
  }
}
```

### Provider Korisnik:
```json
{
  "users": {
    "provider": {
      "email": "test.provider@uslugar.hr",
      "mailtrapEmail": "test.provider@mailtrap.io",
      "emailConfig": {
        "inboxId": "12346"
      }
    }
  }
}
```

## Alternativa: Koristi Mailtrap Generirane Email Adrese

Mailtrap automatski generira email adrese za svaki inbox:
- `clients@mailtrap.io` (za Clients inbox)
- `providers@mailtrap.io` (za Providers inbox)
- `company@mailtrap.io` (za Company inbox)

Možeš koristiti ove adrese umjesto `test.client@mailtrap.io`, ali onda moraš filtrirati emailove po `to` adresi unutar istog inboxa.

## Povezivanje Email Adresa s Testovima

Email helper automatski:
1. Koristi `mailtrapEmail` ako postoji (umjesto aplikacijske email adrese)
2. Koristi `inboxId` iz `emailConfig` ako postoji (umjesto globalnog inbox ID-a)
3. Filtrira emailove po `to` adresi i `subject` pattern-u

Tako da su emailovi automatski povezani s testovima kroz:
- **Email adresu korisnika** → **Mailtrap email adresu** → **Mailtrap inbox ID**

## Pitanja?

Ako imaš pitanja o postavljanju Mailtrap računa, provjeri:
- `tests/MAILTRAP-SETUP.md` - Detaljni vodič za postavljanje
- `tests/MAILTRAP-ACCOUNTS-TEMPLATE.md` - Template za strukturu računa

