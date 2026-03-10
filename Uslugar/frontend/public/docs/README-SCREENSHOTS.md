# Screenshotovi za vodič dokumentacije

Slike u ovom folderu koristi stranica [Dokumentacija](https://www.uslugar.eu/#documentation) (vodič po ulozi).  
Ako slike nedostaju, prikazuje se placeholder ili "Screenshot uskoro".

## Kako generirati prave screenshotove

1. **Instaliraj ovisnosti** (ako već nisi):
   ```bash
   cd tests && npm install
   ```

2. **Javne stranice** (bez prijave) – samo pokreni:
   ```bash
   cd tests && npm run screenshots:docs
   ```
   Snimit će se: `guide-korisnik-1.png` (login), `guide-pruzatelj-1.png` (registracija pružatelja), `guide-pruzatelj-5.png` (cjenik). Ostale datoteke će se preskočiti jer za njih treba prijava.

3. **Sve stranice (s prijavom)** – postavi testne račune u env i ponovno pokreni:
   ```bash
   cd tests
   set TEST_EMAIL_KORISNIK=korisnik@primjer.hr
   set TEST_PASSWORD_KORISNIK=lozinka123
   set TEST_EMAIL_PRUVATELJ=pružatelj@primjer.hr
   set TEST_PASSWORD_PRUVATELJ=lozinka123
   set TEST_EMAIL_TIM_CLAN=tim@primjer.hr
   set TEST_PASSWORD_TIM_CLAN=lozinka123
   set TEST_EMAIL_DIREKTOR=direktor@primjer.hr
   set TEST_PASSWORD_DIREKTOR=lozinka123
   npm run screenshots:docs
   ```
   Na Linuxu/macOS-u koristi `export` umjesto `set`.

4. **Lokalno** (umjesto production URL-a):
   ```bash
   set BASE_URL=http://localhost:5173
   npm run screenshots:docs
   ```

Screenshotovi se spremaju u `frontend/public/docs/`. Nakon toga osvježi [/#documentation](https://www.uslugar.eu/#documentation) – vodič će prikazivati prave slike.

## Lista datoteka (mapa na korak vodiča)

| Datoteka | Uloga | Što prikazuje |
|----------|--------|----------------|
| guide-korisnik-1.png | Korisnik | Registracija / prijava |
| guide-korisnik-2.png | Korisnik | Početna (objavi posao) |
| moji-poslovi-mock.png | Korisnik | Moji poslovi, ponude |
| guide-korisnik-4.png | Korisnik | Chat |
| guide-korisnik-5.png | Korisnik | Ocjenjivanje (npr. Moji poslovi) |
| guide-korisnik-6.png | Korisnik | Notifikacije / refund |
| guide-pruzatelj-1.png | — | Registracija pružatelja |
| guide-pruzatelj-2.png | Pružatelj | Leadovi (lista) |
| guide-pruzatelj-3.png | Pružatelj | Slanje ponude |
| moji-leadovi-direktor-mock.png | Direktor | Moji leadovi, interni queue |
| guide-pruzatelj-5.png | — | Cjenik |
| guide-pruzatelj-6.png | Pružatelj | ROI / profil |
| guide-tim-1.png | Član tima | Moji leadovi (dodijeljeni meni) |
| moji-leadovi-team-member-mock.png | Član tima | Leadovi dodijeljeni meni |
| guide-tim-3.png | Član tima | Chat s klijentom |
| guide-tim-4.png | Član tima | Interni chat |
| director-dashboard-lead-queue-mock.png | Direktor | Nadzorna ploča, red leadova |
