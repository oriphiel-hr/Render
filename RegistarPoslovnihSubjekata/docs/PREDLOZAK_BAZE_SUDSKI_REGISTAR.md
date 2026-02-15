# Predložak baze – RegistarPoslovnihSubjekata (Sudski registar)

Struktura i tipovi izvučeni iz [Open API dokumentacije](https://sudreg-data.gov.hr/api/javni/dokumentacija/open_api) i Uputa za razvojne inženjere v3.0.0.

**Runnable shema:** Prisma shema je u `prisma/schema.prisma` (PostgreSQL). Nakon postavljanja `DATABASE_URL` pokreni `npx prisma generate` i `npx prisma db push` (ili `migrate dev`).

## Načelo

- **Jedan agregirani model**: jedna tablica `Subjekt` (ili slično) za pretragu, s poljima iz više izvora (Sudski registar, FINA, obrtni, OPG). Ovdje je fokus na **podacima iz Sudskog registra**.
- **Detalji u normaliziranim tablicama**: adrese, emailovi, djelatnosti, kapital – po jedna tablica s `subjekt_id` (ili ekvivalentom).
- **Izvor podataka**: svaki red može imati `izvor` (npr. `SUDREG`) i `external_id` (npr. MBS), da se zna odakle podatak dolazi i kako ga ažurirati.

---

## 1. Glavna tablica – Subjekt (agregirano za pretragu)

Mapira se na API: **subjekti** + **tvrtke** (ime) + **skracene_tvrtke** (skraćeni naziv).

| Kolona | Tip | Iz API sheme | Napomena |
|--------|-----|--------------|----------|
| id | UUID / bigint PK | - | Interni PK |
| izvor | enum('SUDREG','FINA','OBRTNI','OPG') | - | Odakle podatak dolazi |
| external_id | varchar(32) | mbs (NUMBER 9) | MBS za Sudski registar; drugi ID za druge izvore |
| oib | varchar(11) | oib (NUMBER 11) | Sa vodećim nulama |
| mb | varchar(8) | mb (NUMBER 8) | Matični broj (DZS) |
| status | smallint | status (NUMBER 1) | 0 = neaktivan/brisan, 1 = aktivan |
| naziv_puni | varchar(1024) | tvrtke.ime | Puna tvrtka / naziv subjekta |
| naziv_naznaka | varchar(512) | tvrtke.naznaka_imena | Naznaka imena |
| naziv_skraceni | varchar(512) | skracene_tvrtke.ime | Skraćeni naziv |
| ino_podruznica | smallint | ino_podruznica | 0/1 – podružnica inozemnog osnivača |
| postupak | smallint | postupak | Stečaj, likvidacija itd. (šifrarnik) |
| datum_osnivanja | date | datum_osnivanja | |
| datum_brisanja | date | datum_brisanja | |
| snapshot_id | bigint NULL | X-Snapshot-Id | Snimka Sudskog registra (ako iz SUDREG) |
| updated_at | timestamp | - | Vrijeme zadnje sinkronizacije |

**Jedinstveni constraint**: `(izvor, external_id)` – jedan red po subjektu po izvoru.

---

## 2. Sjedišta / adrese

Mapira se na API: **sjedista** (1:1 sa subjektom u SR, ali u agregiranoj bazi N adresa po subjektu ako budemo spajali više izvora).

| Kolona | Tip | Iz API sheme | Napomena |
|--------|-----|--------------|----------|
| id | bigint PK | - | |
| subjekt_id | FK → Subjekt | - | Naš agregirani subjekt |
| redni_broj | smallint | - | Ako jedan subjekt ima više adresa |
| drzava_id | bigint NULL | sjedista.drzava_id | Šifrarnik država |
| sifra_zupanije | int NULL | sifra_zupanije | |
| naziv_zupanije | varchar(128) NULL | naziv_zupanije | |
| sifra_opcine | int NULL | sifra_opcine | |
| naziv_opcine | varchar(128) NULL | naziv_opcine | |
| sifra_naselja | bigint NULL | sifra_naselja | |
| naziv_naselja | varchar(128) NULL | naziv_naselja | |
| naselje_van_sifrarnika | varchar(128) NULL | naselje_van_sifrarnika | Inozemstvo |
| sifra_ulice | bigint NULL | sifra_ulice | |
| ulica | varchar(512) NULL | ulica | |
| kucni_broj | int NULL | kucni_broj | |
| kucni_podbroj | varchar(10) NULL | kucni_podbroj | |
| postanski_broj | int NULL | postanski_broj | |

---

## 3. Email adrese

Mapira se na API: **email_adrese**.

| Kolona | Tip | Iz API sheme |
|--------|-----|---------------|
| id | bigint PK | - |
| subjekt_id | FK → Subjekt | - |
| redni_broj | smallint | email_adresa_rbr (NUMBER 3) |
| adresa | varchar(256) | adresa |

---

## 4. Pravni oblik

Mapira se na API: **pravni_oblici** (1:1 po subjektu u SR) + šifrarnik **vrste_pravnih_oblika**.

| Kolona | Tip | Iz API sheme |
|--------|-----|---------------|
| id | bigint PK | - |
| subjekt_id | FK → Subjekt | - |
| vrsta_pravnog_oblika_id | bigint | vrsta_pravnog_oblika_id |

**Šifrarnik vrste pravnih oblika** (iz API-ja): sifra, naziv, kratica (npr. DOO, d.o.o.).

---

## 5. Djelatnosti

Mapira se na API: **pretezite_djelatnosti**, **predmeti_poslovanja**, **evidencijske_djelatnosti**. Jedna tablica za sve s poljem „vrsta” (pretezita / predmet_poslovanja / evidencijska).

| Kolona | Tip | Iz API sheme |
|--------|-----|---------------|
| id | bigint PK | - |
| subjekt_id | FK → Subjekt | - |
| redni_broj | smallint | djelatnost_rbr |
| vrsta | enum('pretezita','predmet_poslovanja','evidencijska') | - |
| nacionalna_klasifikacija_djelatnosti_id | bigint NULL | nacionalna_klasifikacija_djelatnosti_id |
| djelatnost_tekst | varchar(4000) NULL | djelatnost_tekst (slobodni unos) |

---

## 6. Temeljni kapitali

Mapira se na API: **temeljni_kapitali**.

| Kolona | Tip | Iz API sheme |
|--------|-----|---------------|
| id | bigint PK | - |
| subjekt_id | FK → Subjekt | - |
| temeljni_kapital_rbr | smallint | temeljni_kapital_rbr |
| valuta_id | bigint | valuta_id |
| iznos | decimal(22,2) | iznos (NUMBER 22,2) |

---

## 7. Postupak (stečaj, likvidacija)

Mapira se na API: **postupci**.

| Kolona | Tip | Iz API sheme |
|--------|-----|---------------|
| id | bigint PK | - |
| subjekt_id | FK → Subjekt | - |
| postupak | smallint | postupak (šifra) |
| datum_stecaja | timestamp NULL | datum_stecaja |

---

## 8. Šifrarnici (referenca, opcionalno u našoj bazi)

Ako želiš držati šifrarnike lokalno (umjesto samo ID-eva prema API-ju):

- **Drzava**: id, sifra, naziv, oznaka_2, oznaka_3
- **VrstaPravnogOblika**: id, sifra, naziv, kratica
- **NacionalnaKlasifikacijaDjelatnosti**: id, sifra, puni_naziv, verzija
- **Valuta**: id, sifra, naziv, drzava_id
- **VrstaPostupka**: postupak (PK), znacenje
- **Sud** (za nadležni sud): id, sifra, naziv, sifra_zupanije, naziv_zupanije, ...

---

## 9. Snimke (snapshots) Sudskog registra

Za konzistentno ETL preuzimanje (isti snapshot_id za sve tablice u jednoj sesiji).

| Kolona | Tip | Iz API sheme |
|--------|-----|---------------|
| id | bigint PK | snapshots.id |
| timestamp | timestamp | timestamp |
| available_until | timestamp | available_until |
| staleness | int | staleness (1=zadnja, 2=predzadnja) |

---

## 10. API pozivi koji se mapiraju na tablice

| API endpoint (GET) | Tablica(e) |
|--------------------|------------|
| /subjekti | Subjekt (osnovna polja) |
| /tvrtke | Subjekt.naziv_puni, naziv_naznaka |
| /skracene_tvrtke | Subjekt.naziv_skraceni |
| /sjedista | SubjektSjedište (ili SubjektAdresa) |
| /email_adrese | SubjektEmail |
| /pravni_oblici | SubjektPravniOblik |
| /pretezite_djelatnosti | SubjektDjelatnost (vrsta=pretezita) |
| /predmeti_poslovanja | SubjektDjelatnost (vrsta=predmet_poslovanja) |
| /evidencijske_djelatnosti | SubjektDjelatnost (vrsta=evidencijska) |
| /temeljni_kapitali | SubjektTemeljniKapital |
| /postupci | SubjektPostupak |
| /detalji_subjekta?tip_identifikatora=oib&identifikator=... | Sve gore (jedan subjekt) |
| /snapshots | Snapshot |

---

## 11. Primjer Prisma sheme (fragment)

```prisma
enum Izvor {
  SUDREG
  FINA
  OBRTNI
  OPG
}

model Subjekt {
  id              String   @id @default(uuid())
  izvor           Izvor
  externalId      String   // MBS za SUDREG
  oib             String?  @db.VarChar(11)
  mb              String?  @db.VarChar(8)
  status          Int      // 0 neaktivan, 1 aktivan
  nazivPuni       String?  @db.VarChar(1024)
  nazivNaznaka    String?  @db.VarChar(512)
  nazivSkraceni   String?  @db.VarChar(512)
  inoPodruznica   Int?     @default(0)
  postupak        Int?
  datumOsnivanja  DateTime? @db.Date
  datumBrisanja   DateTime? @db.Date
  snapshotId      BigInt?
  updatedAt       DateTime @updatedAt

  adrese          SubjektAdresa[]
  emailovi        SubjektEmail[]
  pravniOblikId   BigInt?
  djelatnosti     SubjektDjelatnost[]
  kapitali        SubjektTemeljniKapital[]
  postupakRow     SubjektPostupak[]

  @@unique([izvor, externalId])
}

model SubjektAdresa {
  id              BigInt   @id @default(autoincrement())
  subjektId       String   @map("subjekt_id")
  redniBroj       Int      @default(1)
  drzavaId        BigInt?
  sifraZupanije   Int?
  nazivZupanije   String?  @db.VarChar(128)
  sifraOpcine     Int?
  nazivOpcine     String?  @db.VarChar(128)
  sifraNaselja    BigInt?
  nazivNaselja    String?  @db.VarChar(128)
  ulica           String?  @db.VarChar(512)
  kucniBroj       Int?
  kucniPodbroj    String?  @db.VarChar(10)
  postanskiBroj   Int?

  subjekt         Subjekt  @relation(fields: [subjektId], references: [id], onDelete: Cascade)
}
```

---

## 12. Indeksi za brzu pretragu

- `Subjekt(oib)` ako OIB imaš za sve izvore
- `Subjekt(izvor, external_id)` UNIQUE
- `Subjekt(naziv_puni)` ili full-text na naziv_puni + naziv_skraceni
- `SubjektAdresa(subjekt_id)`, opcionalno `(naziv_zupanije, naziv_opcine, naziv_naselja)` za pretragu po lokaciji

Ova shema pokriva podatke iz Sudskog registra prema Open API specifikaciji; kasnije se u isti `Subjekt` mogu mapirati FINA, obrtni registar i OPG s istim `id` (spajanje po OIB) ili zasebnim redovima s različitim `izvor` + `external_id`.
