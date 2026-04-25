# Uslugar — usporedba s konkretnim tržišnim oblicima

**Svrha:** realna slika odnosno **referentne** platforme (SAD / Uj.K / AU), **lead-gen** obrazac i **domaći oglasnički** obrazac — usklađeno s onim što je u repou (`docs/PLATFORM-SCOPE-STATUS.md`, `backend/src/server.js`).

**Metoda:** značajke konkurenata u tablici temelje se na **javno dostupnim** opisima (help centar, kako radi, cjenik). To nije formalni product teardown svake aplikacije. **Uslugar** — kolona se odnosi na trenutno ponašanje/projektnu istinu u repou (npr. nema punog „CRM“ workflowa).

## Konkretni referenti (zašto baš ovi)

| Ime | Tržište / uloga | Zašto u matrici |
|-----|-----------------|-----------------|
| [TaskRabbit](https://www.taskrabbit.com/) | SAD / Uj.K., lokalne usluge | Uobičajeni **benchmark** za „marketplace s obvezatnim plaćanjem kroz platformu“; podrška i pravila o plaćanju javno su dokumentirani ([npr. Payment Policy / How Do I Pay](https://support.taskrabbit.com/)). |
| [Thumbtack](https://www.thumbtack.com/) | SAD, lokalne usluge | Snažan lokalni matcher s **citatima / angažmanom** i digitalnim plaćanjem u mnogim kategorijama; drugačiji UX od lead-gen, ali ista tržišna klasa. |
| [Bark.com](https://www.bark.com/) | Uj.K. / globalno, lead-gen | Eksplicitno: **plaćaš uvod / lead (kredita)**, posao nakon toga isključivo između klijenta i izvođača (bez provizije na cijenu posla) — npr. [kako rade leadovi](https://help.bark.com/hc/en-us/articles/13342669635484-What-is-Bark-and-how-does-it-work). |
| [Airtasker](https://www.airtasker.com/) | AU, Uj.K. (dijelovi) | Sličan obrazac **nudi i escrowsko / platformsko** posredovanje oko iznosa zadatka — korisno za usporedbu s „puni escrow“. |
| **Domaći oglasnik** (npr. [Njuškalo](https://www.njuskalo.hr/), [Oglasnik](https://www.oglasnik.hr/)) | HR | Tipičan **1:1 oglas, kontakt izvan ograničenog workflowa**; rijetko postoji jedinstveni in-app cijeli život posla, escrow i sl. — to je uobičajen „krov“ za HR kada govorimo o lokalnim majstorima. |

*Ne postoji u HR jedan javni, potpuni paritet TaskRabbitu na razini cijele države; usporedba s oglasnicima i međunarodnim liderima daje dva realna anker-a.*

## Matrica (praksa proizvoda, grubo: Da / djelom. / Ne)

Legenda: **Djelom.** = djelomično, MVP, ovisi o kategoriji ili o backendu/okruženju.

| Dimenzija | Uslugar (repo) | TaskRabbit | Thumbtack | Bark | Airtasker | Domaći oglasnik |
|-----------|----------------|------------|----------|------|------------|-----------------|
| **Primarni poslovni obrazac** | Lead + poslovi + pružatelji, pretplate / isključivi olovi, **growth** (instant, favoriti) — hibrid | Povezivanje + **moralno/produktno obvezno plaćanje** kroz platformu | Citati → angažman, često digitalno plaćanje | **Plaćeni uvod** do kontakta; posao off-platform (često) | Nudi + zadatak, platformsko posredovanje po iznosu | Oglas, telefon / poruka, dogovor slobodan |
| **Cijela transakcija posla in-app s pravnom „off-platform” zabranom** (kako TaskRabbit propagira) | **Ne** na razini cijele industrijske politike; postoje poslovi, chat, recenzije | **Da** (strogo promovirano) | Snažno, kategorijski | Nije ishodište — naplata leada, ne cijele usluge | Snažno (escrow) | **Ne** |
| **Automatizam isplata pružatelju (bank/PSP) za svaki završeni posao** kako to rade lideri | [PLATFORM-SCOPE-STATUS:](PLATFORM-SCOPE-STATUS.md) **nije** puni automatsam; polja mogu biti informativna/ručni tok | Uobičajeno: Tasker/PSP | Često mreža plaćanja u sustavu | Nije u fokusu (vani) | Uobičajeno za task | Rijetko u platformi |
| **Pretplata / naplata leadova / ograde** | **Djelom. / Da** (Stripe, pretplate, exclusive leads — vidi rute) | I ostale naknade platforme (javno) | Slično | Krediti, po leadu cijena unaprijed | Kombinirano | Obično oglas ili paket, bez escrowa posla |
| **Recenzije + (anti-)fake / moderacija** | U repou su rute i admin; dizajn ovisi o pravilima | Da | Da | Ograničenije na profil/lead | Da | Povjerenje, često slaba kontrola |
| **In-app chat** | Da (rute) | Da | Da | Bark messenger nakon odluke za lead | Da | Rijetko/ograničeno (ovisno o oglasu) |
| **Kalendar: jednokratni slotovi + instant zahtjev** | [PLATFORM:](PLATFORM-SCOPE-STATUS.md) **Da** (no RRULE) | Booking / kategorije | Slični alati, ovisi | Rijeđe fokus | Slično | Rijetko ugrađeno |
| **Ponavljajući kalendar (RRULE)** | **Ne** (dokumentirano) | Rješava se unutar zadatka, ne obavezno iCal RRULE u produktu korisnika | Kategorijski | — | Vario | Nije očekivano |
| **Puni „CRM / Zendesk” za korisnike** | **Ne** — sporovi, admin | Podrška, tiketi | Slično | Tim za prodaju leadova | Slično | Nije svrha oglasa |
| **Mobil + web** | Cilj: oba (npr. mobil `ProtectedShell`, web profili) | Oba | Oba | Oba | Oba | Ponekad samo web |

## Zaključak (čitaj zajedno s [PLATFORM-SCOPE-STATUS](PLATFORM-SCOPE-STATUS.md))

- **Gdjе ste** u klasi s **liderima na plaćanju/escrowu cijele usluge i isplatama (TaskRabbit, Airtasker)**: očekivano **izvan trenutnog proizvodnog ranga** u repou — to već imate eksplicitno kao „nije u opsegu / ručno / informativno“.
- **Bark** i **Njuškalo** (oglasnički) model pokazuju: biti **dobar lead / dogovor / oglas** već je legitimno; ne mora sve biti escrow.
- Uslugar ima **značajnu dubinu** (pružatelji, poslovi, Stripe, rast, kalendar brzih termina, sporo — vidi rute) što je **iznad** golog oglasnika, no **nije 1:1** s punim globalnim „happy path“ plaćanja svakog završnog posla kao na TaskRabbitu.

*Ažurirati ovu tablicu kad u repou dođe automatizam isplata, RRULE, ili proširen support/CRM — ili kad se promijene javni proizvodi konkurencija.*
