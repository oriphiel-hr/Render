# 📧 Mailpit vs Mailtrap - Razlike i Kako Radi

## 🔑 Ključne Razlike

### Mailtrap (Cloud Service)
- ✅ **Različiti inbox-ovi** - svaki korisnik/scenario ima svoj inbox ID
- ✅ **API Key** - potreban za pristup
- ✅ **Cloud servis** - dostupan preko interneta
- ❌ **Trošak** - plaćaš po inbox-u ili email-u
- ❌ **Rate limiting** - ograničen broj zahtjeva

**Primjer konfiguracije:**
```json
{
  "mailtrap": {
    "apiKey": "abc123...",
    "inboxId": "12345",  // Različit za svakog korisnika
    "email": "test.client@mailtrap.io"
  }
}
```

### Mailpit (Lokalni Server)
- ✅ **JEDAN inbox** - svi mailovi idu u jedan inbox
- ✅ **Bez API Key-a** - nema autentifikacije
- ✅ **Besplatno** - lokalni server, nema troškova
- ✅ **Bez rate limitinga** - koliko god trebaš
- ❌ **Lokalno** - moraš pokrenuti na svom serveru

**Primjer konfiguracije:**
```json
{
  "mailpit": {
    "baseUrl": "http://localhost:8025/api/v1",  // Ili http://mailpit:8025/api/v1 na Render-u
    "email": "test.client@uslugar.hr"  // Bilo koja email adresa
  }
}
```

## 🎯 Kako Mailpit Radi

### 1. **JEDAN Inbox za Sve Mailove**

Mailpit **nema različite inbox-ove** kao Mailtrap. Svi mailovi idu u **jedan inbox**.

**Kako onda razlikovati mailove za različite korisnike?**

Mailpit filtrira mailove po **recipient email adresi** (To, Cc, Bcc polja).

**Primjer:**
```javascript
// Dohvati sve mailove
const allEmails = await mailpitService.getEmails()

// Filtriraj po recipient-u
const clientEmails = allEmails.filter(email => 
  email.To.some(to => to.Address === 'test.client@uslugar.hr')
)

const providerEmails = allEmails.filter(email => 
  email.To.some(to => to.Address === 'test.provider@uslugar.hr')
)
```

### 2. **Email Adrese za Testiranje**

Umjesto inbox ID-eva, koristiš **različite email adrese** za različite scenarije:

```json
{
  "users": {
    "client": {
      "mailtrap": {  // Property name je još uvijek 'mailtrap' za backward compatibility
        "validData": {
          "email": "test.client@uslugar.hr"  // Za ispravne podatke
        },
        "invalidData": {
          "email": "test.client.invalid@uslugar.hr"  // Za neispravne podatke
        },
        "missingData": {
          "email": "test.client.missing@uslugar.hr"  // Za nedostajuće podatke
        }
      }
    },
    "provider": {
      "mailtrap": {
        "validData": {
          "email": "test.provider@uslugar.hr"
        },
        "invalidData": {
          "email": "test.provider.invalid@uslugar.hr"
        },
        "missingData": {
          "email": "test.provider.missing@uslugar.hr"
        }
      }
    }
  }
}
```

### 3. **Kako Aplikacija Koristi Email Adrese**

Kada aplikacija šalje email:
1. **Koristi email adresu iz test podataka** (npr. `test.client@uslugar.hr`)
2. **Mailpit prima mail** i sprema ga u inbox
3. **Test dohvaća mailove** filtrirano po recipient email adresi

**Primjer u testu:**
```javascript
// 1. Aplikacija šalje email na test.client@uslugar.hr
await sendVerificationEmail('test.client@uslugar.hr', ...)

// 2. Mailpit prima mail i sprema ga u inbox

// 3. Test dohvaća mailove za tog korisnika
const emails = await mailpitService.getEmailsByRecipient('test.client@uslugar.hr')
// Vraća samo mailove poslane na test.client@uslugar.hr
```

## 📊 Usporedba

| Značajka | Mailtrap | Mailpit |
|----------|----------|---------|
| **Inbox-ovi** | Više inbox-ova (različiti ID-evi) | JEDAN inbox (svi mailovi) |
| **Filtriranje** | Po inbox ID-u | Po recipient email adresi |
| **API Key** | Potreban | Nije potreban |
| **Email adrese** | `@mailtrap.io` (automatski) | Bilo koja (npr. `@uslugar.hr`) |
| **Konfiguracija** | API Key + Inbox ID | Samo API URL |
| **Trošak** | Plaćanje | Besplatno (lokalno) |
| **Dostupnost** | Cloud (24/7) | Lokalno (moraš pokrenuti) |

## 🔄 Migracija s Mailtrap-a na Mailpit

### Prije (Mailtrap):
```json
{
  "mailtrap": {
    "apiKey": "abc123...",
    "inboxId": "12345",
    "email": "test.client@mailtrap.io"
  }
}
```

### Sada (Mailpit):
```json
{
  "mailtrap": {  // Property name ostaje 'mailtrap' za backward compatibility
    "validData": {
      "email": "test.client@uslugar.hr"  // Nema inboxId!
    }
  }
}
```

**Promjene:**
- ❌ Uklonjeno: `apiKey`, `inboxId`
- ✅ Dodano: Različite email adrese za validData/invalidData/missingData
- ✅ Email adrese: `@uslugar.hr` umjesto `@mailtrap.io`

## 💡 Zašto Email Adrese za Različite Scenarije?

Mailpit nema inbox ID-eve, ali **možeš koristiti različite email adrese** za različite scenarije:

1. **validData** - Email za ispravne podatke (npr. `test.client@uslugar.hr`)
2. **invalidData** - Email za neispravne podatke (npr. `test.client.invalid@uslugar.hr`)
3. **missingData** - Email za nedostajuće podatke (npr. `test.client.missing@uslugar.hr`)

**Prednosti:**
- ✅ Jasno razlikovanje scenarija
- ✅ Lako filtriranje u testovima
- ✅ Nema potrebe za inbox ID-evima

## 🎯 Kako Koristiti u Testovima

### Automatski Test:
1. Test koristi email adresu iz `userData.email` (npr. `test.client@uslugar.hr`)
2. Aplikacija šalje email na tu adresu
3. Test dohvaća mailove filtrirano po recipient-u:
   ```javascript
   const emails = await mailpitService.getEmailsByRecipient('test.client@uslugar.hr')
   ```
4. Test provjerava da li je email stigao i klikne linkove

### Ručni Test:
1. Otvori Mailpit Web UI: http://localhost:8025
2. Svi mailovi su u jednom inboxu
3. Možeš filtrirati po recipient-u u UI-ju
4. Možeš pregledati HTML, plain text, headers, itd.

## ✅ Zaključak

**Mailpit je jednostavniji od Mailtrap-a:**
- ✅ Nema inbox ID-eve - svi mailovi u jednom inboxu
- ✅ Filtrira se po recipient email adresi
- ✅ Koristiš različite email adrese za različite scenarije
- ✅ Nema API Key-a - samo API URL

**Za testiranje:**
- Unesi email adrese za svakog korisnika (validData, invalidData, missingData)
- Mailpit automatski hvata sve mailove
- Test filtrira mailove po recipient email adresi

