# Test Plan - Frontend (Javna Dokumentacija)

Ova datoteka je automatski generirana iz javne dokumentacije platforme.

## Kategorija 1: Registracija i Autentifikacija

#### Test 1: Registracija korisnika usluge

**Opis:** Stvorite račun kao korisnik usluge da biste mogli objavljivati poslove i tražiti pružatelje usluga.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Registracija korisnika usluge"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik unosi ime, prezime, e-mail i lozinku, odabire ulogu ÔÇťKorisnik uslugeÔÇŁ te po potrebi navodi podatke tvrtke.
5. Nakon registracije dobiva verifikacijski email; klikom na link aktivira račun i može objavljivati poslove te pratiti ponude.
6. Jedan e-mail može imati i korisnički i pružateljski profil, uz brzo prebacivanje u profilu.

**Očekivani rezultat:**
- Funkcionalnost "Registracija korisnika usluge" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Registracija pružatelja usluga

**Opis:** Registrirajte se kao pružatelj usluga i počnite primati ekskluzivne leadove.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Registracija pružatelja usluga"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj unosi osobne i poslovne podatke (telefon, pravni status, OIB); sustav validira podatke i kreira TRIAL (7 dana, 5 kredita).
5. Nakon email verifikacije dobiva pristup leadovima, ROI dashboardu, chatovima i licencnim modulima.
6. Wizard vodi kroz odabir kategorija/regija, postavljanje portfelja i timskih članova prije kupnje prvog leada.

**Očekivani rezultat:**
- Funkcionalnost "Registracija pružatelja usluga" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Prijava korisnika

**Opis:** Prijavite se na svoj račun koristeći email i lozinku.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Prijava korisnika"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Unesite e-mail i lozinku; sustav provjerava vjerodajnice, izdaje token i preusmjerava na dashboard uloge.
5. Opcija ÔÇťZapamti meÔÇŁ aktivira produljenu sesiju (refresh token), dok ÔÇťOdjava na svim uređajimaÔÇŁ gasi druge sesije.
6. Aktivnosti prijave (device, lokacija) prate se radi sigurnosti i prikazuju u profilu.

**Očekivani rezultat:**
- Funkcionalnost "Prijava korisnika" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Email verifikacija

**Opis:** Potvrdite svoju email adresu klikom na link koji primite u email poruci.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Email verifikacija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon registracije platforma šalje email s jednokratnim linkom koji vrijedi 24 sata.
5. Klikom na link adresa se potvrđuje, korisnik se preusmjerava na prijavu i aktiviraju se sve funkcionalnosti.
6. Ako poruka ne stigne, korisnik može zatražiti novo slanje ÔÇô stari link postaje nevažeći.

**Očekivani rezultat:**
- Funkcionalnost "Email verifikacija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Resetiranje lozinke

**Opis:** Resetirajte svoju lozinku ako je zaboravite ili želite promijeniti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Resetiranje lozinke"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Klikom na ÔÇťZaboravljena lozinka?ÔÇŁ unosite e-mail; sustav šalje jednokratni link s rokom trajanja (1 h).
5. Otvaranjem linka dolazite na stranicu gdje unosite novu lozinku (dvostruka potvrda) i automatski se prijavljujete.
6. Link vrijedi jednom; ako istekne ili je iskorišten, treba zatražiti novi.

**Očekivani rezultat:**
- Funkcionalnost "Resetiranje lozinke" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Zaboravljena lozinka

**Opis:** Vratite pristup svom računu ako ste zaboravili lozinku.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Zaboravljena lozinka"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Na login stranici odaberete ÔÇťZaboravljena lozinka?ÔÇŁ, unesete e-mail i pošaljete zahtjev.
5. Na e-mail stiže siguran link (vrijedi 1 sat) koji vodi na stranicu za postavljanje nove lozinke.
6. Nakon potvrde nove lozinke sve stare sesije se automatski odjavljuju i možete se prijaviti s novim podacima.

**Očekivani rezultat:**
- Funkcionalnost "Zaboravljena lozinka" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: JWT token autentifikacija

**Opis:** Sigurna autentifikacija koja vam omogućava pristup platformi bez stalnog ponovnog prijavljivanja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "JWT token autentifikacija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon uspješne prijave backend generira access token (kratak rok) i refresh token (dulji rok) vezan uz sesiju.
5. Access token se šalje u Authorization headeru; refresh token obnavlja sesiju kada access token istekne.
6. Odjava ili promjena lozinke opoziva refresh token i zatvara sve povezane sesije.

**Očekivani rezultat:**
- Funkcionalnost "JWT token autentifikacija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Različite uloge korisnika (USER, PROVIDER, ADMIN)

**Opis:** Platforma podržava tri različite uloge korisnika s različitim dozvolama i funkcionalnostima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Različite uloge korisnika (USER, PROVIDER, ADMIN)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaki korisnik ima jednu ili više uloga (USER, PROVIDER, ADMIN) koje definiraju dostupne module i API dozvole.
5. Prebacivanje između uloga radi se kroz role switcher bez ponovnog login-a.
6. RBAC middleware provjerava ulogu prije svake osjetljive akcije (npr. kupnja leada, moderacija).

**Očekivani rezultat:**
- Funkcionalnost "Različite uloge korisnika (USER, PROVIDER, ADMIN)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Wizard registracije (odabir kategorija i regija)

**Opis:** Interaktivni wizard koji vodi novu tvrtku kroz registraciju. Omogućava odabir kategorija i regija u kojima želi raditi.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Wizard registracije (odabir kategorija i regija)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik prolazi kroz korake: osnovni podaci, odabir kategorija, odabir regija, tim, licence i potvrda.
5. Sustav validira svaki korak, sprema privremeni napredak i na kraju automatski aktivira TRIAL paket.
6. Nakon završetka wizard šalje onboarding upute i ističe ograničenja (npr. 5-10 leadova u trialu).

**Očekivani rezultat:**
- Funkcionalnost "Wizard registracije (odabir kategorija i regija)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 2: Upravljanje Kategorijama

#### Test 1: 51 kategorija usluga

**Opis:** Platforma nudi 51 različitu kategoriju usluga iz raznih područja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "51 kategorija usluga"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kategorije pokrivaju građevinu, instalacije, održavanje, čišćenje, IT i specijalizirane usluge.
5. Korisnik pri objavi posla bira glavnu kategoriju i opcionalne podkategorije; pružatelj označava u kojim kategorijama želi primati leadove.
6. Svaka kategorija ima opis, ikonu i pravila licenciranja koji pomažu filtrirati prave partnere.

**Očekivani rezultat:**
- Funkcionalnost "51 kategorija usluga" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Dinamičko učitavanje kategorija iz baze

**Opis:** Kategorije se automatski učitavaju i ažuriraju s platforme bez potrebe za restartom.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Dinamičko učitavanje kategorija iz baze"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Frontend dohvaća kategorije preko API-ja i kešira ih, a promjene se invalidiraju čim admin nešto izmijeni.
5. Backend služi kategorije iz baze uz podršku za hijerarhiju, prijevode i licence.
6. Webhook/event invalidacija osigurava da su svi servisi sinkronizirani bez redeploya.

**Očekivani rezultat:**
- Funkcionalnost "Dinamičko učitavanje kategorija iz baze" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Emoji ikone za kategorije

**Opis:** Svaka kategorija ima emoji ikonu koja olakšava prepoznavanje i navigaciju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Emoji ikone za kategorije"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svakoj kategoriji dodijeljen je emoji koji vizualno predstavlja vrstu usluge.
5. Emoji se prikazuju u listama, dropdownovima i na karticama poslova kako bi korisnici brže uočili relevantne kategorije.
6. Admin panel omogućuje promjenu emojija bez redeploya.

**Očekivani rezultat:**
- Funkcionalnost "Emoji ikone za kategorije" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Opisi kategorija

**Opis:** Svaka kategorija ima detaljan opis koji objašnjava koje usluge spadaju u tu kategoriju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Opisi kategorija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaka kategorija ima opis s primjerima usluga, ograničenjima i zahtjevima (npr. licence).
5. Opisi se prikazuju u dropdownovima, tooltipovima i admin sučelju za uređivanje.
6. Verzije opisa su lokalizirane (HR/EN) i automatski se povlače prema jeziku korisnika.

**Očekivani rezultat:**
- Funkcionalnost "Opisi kategorija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: NKD kodovi djelatnosti

**Opis:** Svaka kategorija ima pridruženi NKD (Nacionalna klasifikacija djelatnosti) kod za točnu klasifikaciju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "NKD kodovi djelatnosti"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaka kategorija ima pripadajući NKD kod (npr. F43.33) koji preuzimamo iz službene baze.
5. Kodovi se prikazuju u detaljima kategorije, prilikom onboardinga i na fakturama.
6. Admin panel omogućuje mapiranje ili ažuriranje NKD kodova bez redeploya.

**Očekivani rezultat:**
- Funkcionalnost "NKD kodovi djelatnosti" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Oznake za licencirane djelatnosti

**Opis:** Kategorije koje zahtijevaju licence imaju posebnu oznaku koja to jasno označava.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Oznake za licencirane djelatnosti"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kategorije vezane uz regulirane djelatnosti imaju badge (npr. ­čĆŤ) i tooltip koji navodi potrebne licence.
5. Badge se prikazuje u listama kategorija, marketplaceu i profilima pružatelja.
6. Ako pružatelj nema validnu licencu, sustav onemogućava aktivaciju te kategorije.

**Očekivani rezultat:**
- Funkcionalnost "Oznake za licencirane djelatnosti" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Tipovi licenci (Elektrotehnička, Građevinska, itd.)

**Opis:** Sustav podržava različite tipove profesionalnih licenci potrebnih za određene djelatnosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Tipovi licenci (Elektrotehnička, Građevinska, itd.)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Administratori definiraju tipove licenci (npr. Elektrotehnička, Građevinska) s opisom i nadležnim tijelom.
5. Pružatelji uploadaju dokumente i povezuju ih s tipovima; status verifikacije vidljiv je u profilu.
6. Tipovi licenci se mapiraju na kategorije i badgeve u marketplaceu.

**Očekivani rezultat:**
- Funkcionalnost "Tipovi licenci (Elektrotehnička, Građevinska, itd.)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Tijela koja izdaju licence

**Opis:** Navedite tijelo koje je izdalo vašu licencu - npr. Ministarstvo graditeljstva, Hrvatska komora inženjera, itd.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Tijela koja izdaju licence"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Ministarstvo graditeljstva i prostornog uređenja
5. Hrvatska komora inženjera
6. Hrvatski zavod za norme

**Očekivani rezultat:**
- Funkcionalnost "Tijela koja izdaju licence" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Hijerarhijska struktura kategorija

**Opis:** Kategorije su organizirane u glavne kategorije i podkategorije za lakšu navigaciju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Hijerarhijska struktura kategorija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Glavne kategorije (npr. građevinarstvo, elektrotehnika) grupiraju srodne usluge.
5. Ugniježđene podkategorije pružaju detaljnu razinu (keramičar, ugradnja bojlera) i prikazuju se u registraciji, objavi posla i filterima.
6. Hijerarhija se koristi u matchmakingu kako bi lead dobio relevantne ponuditelje.

**Očekivani rezultat:**
- Funkcionalnost "Hijerarhijska struktura kategorija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Filtriranje poslova po kategorijama

**Opis:** Filtrirate poslove prema kategorijama kako biste vidjeli samo relevantne poslove.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Filtriranje poslova po kategorijama"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Na listi poslova dostupni su filteri po glavnim i podkategorijama; odabir ažurira rezultate u realnom vremenu.
5. Kombinacija više kategorija omogućuje fokus na specijalizirane poslove uz spremanje memoriranih filtera.
6. UI prikazuje broj rezultata po kategoriji kako bi se lakše odabrao fokus.

**Očekivani rezultat:**
- Funkcionalnost "Filtriranje poslova po kategorijama" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 3: Upravljanje Poslovima

#### Test 1: Objavljivanje novih poslova

**Opis:** Objavite posao koji tražite i primite ponude od pružatelja usluga.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Objavljivanje novih poslova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik klikne ÔÇťObjavi posaoÔÇŁ, unosi naslov, opis, kategoriju/podkategoriju, lokaciju te opcionalno budžet, rok i priloge.
5. Nakon objave posao se prikazuje pružateljima koji pokrivaju odabrane kategorije/regije; oni šalju ponude i poruke kroz chat.
6. Korisnik uspoređuje ponude, komunicira i ažurira status posla (aktivno, u tijeku, završeno, otkazano).

**Očekivani rezultat:**
- Funkcionalnost "Objavljivanje novih poslova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Upravljanje recenzijama

**Opis:** Dajte što detaljniji opis posla kako bi pružatelji znali točno što trebate.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Upravljanje recenzijama"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Formular za objavu posla traži detalje: što treba napraviti, trenutno stanje, dimenzije, specifične zahtjeve i materijale.
5. Preporučuje upload fotografija i odabir kategorije/podne kategorije kako bi algoritam bolje spojio pružatelje.
6. Preview prikazuje kako će posao izgledati pružateljima prije objave.

**Očekivani rezultat:**
- Funkcionalnost "Upravljanje recenzijama" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Postavljanje budžeta (min-max)

**Opis:** Navedite minimalni i maksimalni budžet za vaš posao kako bi pružatelji znali vaše cjenovne očekivanja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Postavljanje budžeta (min-max)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Formular za objavu posla uključuje polja za minimalni i maksimalni budžet (obavezna za neke kategorije).
5. Vrijednosti se prikazuju na kartici posla i u marketplace filtrima.
6. Sustav validira da je min ÔëĄ max i nudi preporuke prema tržišnim prosjecima.

**Očekivani rezultat:**
- Funkcionalnost "Postavljanje budžeta (min-max)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Lokacija posla (grad)

**Opis:** Navedite grad ili područje gdje se posao obavlja kako bi pružatelji znali lokaciju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Lokacija posla (grad)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Poslovi zahtijevaju unos grada/općine i opcionalno adrese (auto-complete + geokodiranje).
5. Lokacija se koristi za filtriranje, prikaz na karti i izračun udaljenosti.
6. Pružatelji vide lokaciju prije slanja ponude.

**Očekivani rezultat:**
- Funkcionalnost "Lokacija posla (grad)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Geolokacija (latitude/longitude)

**Opis:** Precizna geolokacija posla omogućava točno određivanje pozicije i proračun udaljenosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Geolokacija (latitude/longitude)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Platforma sprema latitude/longitude prilikom geokodiranja adrese ili ručnog odabira na karti.
5. Koordinate se koriste za prikaz posla na karti, rutu i izračun udaljenosti između klijenta i pružatelja.
6. ML modeli i matchmaking uzimaju u obzir udaljenost.

**Očekivani rezultat:**
- Funkcionalnost "Geolokacija (latitude/longitude)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Slike posla

**Opis:** Uploadajte slike situacije koju treba riješiti kako bi pružatelji bolje razumjeli vaš posao.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Slike posla"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Tijekom objave posla možete dodati do 10 slika (drag&drop ili odabirom datoteka).
5. Slike se komprimiraju, provjeravaju veličinu/tip i spremaju uz posao.
6. Pružatelji ih pregledavaju u galeriji prije slanja ponude.

**Očekivani rezultat:**
- Funkcionalnost "Slike posla" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Status posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN)

**Opis:** Svaki posao ima status koji pokazuje u kojoj je fazi - otvoren, u tijeku, završen ili otkazan.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Status posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Posao započinje kao OTVOREN dok korisnik prikuplja ponude.
5. Odabirom pružatelja status prelazi u U TIJEKU; završetkom radova prelazi u ZAVRŠEN.
6. Korisnik ili sustav mogu označiti OTKAZAN (npr. prekinut posao).

**Očekivani rezultat:**
- Funkcionalnost "Status posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Hitnost posla (NORMALNA, HITNA)

**Opis:** Označite posao kao hitan ako vam treba brzo rješenje, ili normalan za standardni tempo.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Hitnost posla (NORMALNA, HITNA)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Prilikom objave posla odabirete status hitnosti (NORMALNA/HITNA).
5. Hitni poslovi dobivaju badge i viši prioritet u marketplaceu i notifikacijama.
6. SLA podsjetnici naglašavaju rokove i pomažu koordinirati očekivanja.

**Očekivani rezultat:**
- Funkcionalnost "Hitnost posla (NORMALNA, HITNA)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Veličina posla (MALA, SREDNJA, VELIKA)

**Opis:** Kategorizirajte posao prema veličini kako bi pružatelji znali obim rada.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Veličina posla (MALA, SREDNJA, VELIKA)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pri objavi posla birate veličinu (MALA, SREDNJA, VELIKA) na temelju obujma i trajanja.
5. Informacija se prikazuje na kartici posla i utječe na preporučene tipove pružatelja.
6. Marketplace i analitika koriste veličinu za segmentaciju.

**Očekivani rezultat:**
- Funkcionalnost "Veličina posla (MALA, SREDNJA, VELIKA)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Rok izvršenja

**Opis:** Navedite željeni rok za završetak posla kako bi pružatelji znali vaše vremenske zahtjeve.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Rok izvršenja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pri objavi posla možete unijeti konkretan datum ili okvir (npr. sljedećih 7 dana).
5. Rok se prikazuje pružateljima i utječe na prioritet u pretragama.
6. Pružatelj može predložiti alternativni rok u ponudi.

**Očekivani rezultat:**
- Funkcionalnost "Rok izvršenja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 11: Pretraživanje poslova

**Opis:** Pronađite poslove koji vas zanimaju pomoću moderne tražilice s naprednim filterima, sortiranjem i spremljenim pretragama.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pretraživanje poslova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Sticky search bar na vrhu stranice omogućava brzu pretragu po naslovu, opisu ili kategoriji.
5. Quick filters (kategorija, grad, sortiranje) su dostupni odmah ispod search bara.
6. Napredni filteri (budžet, status, datum) se otvaraju klikom na gumb "Filteri".

**Očekivani rezultat:**
- Funkcionalnost "Pretraživanje poslova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 12: Filtriranje po kategoriji, lokaciji, budžetu

**Opis:** Kombinirajte više filtera kako biste pronašli točno ono što tražite - po kategoriji, lokaciji i budžetu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Filtriranje po kategoriji, lokaciji, budžetu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Filter panel omogućuje kombinaciju kategorija, gradova i budžet raspona.
5. Rezultati se ažuriraju u realnom vremenu, a odabrani filteri spremaju se u URL.
6. Saved filters omogućuju spremanje i re-use najčešćih kombinacija.

**Očekivani rezultat:**
- Funkcionalnost "Filtriranje po kategoriji, lokaciji, budžetu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 13: Pregled detalja posla

**Opis:** Pregledajte sve ključne informacije o poslu na jednom mjestu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pregled detalja posla"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Stranica detalja okuplja opis, budžet, rok, status, kategoriju, lokaciju, slike i povijest aktivnosti.
5. Ponude, chat i status tijeka prikazuju se u kontekstu istog posla.
6. Uloge odlučuju koje akcije se prikazuju (uređivanje, prihvat ponude, ocjene).

**Očekivani rezultat:**
- Funkcionalnost "Pregled detalja posla" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 14: Moderna tražilica poslova (sticky search bar)

**Opis:** Sticky search bar na vrhu stranice omogućava brzu i jednostavnu pretragu poslova bez skrolanja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Moderna tražilica poslova (sticky search bar)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Tražilica je uvijek vidljiva na vrhu stranice (sticky positioning) čak i kada korisnik skrola.
5. Veliki search input s ikonom omogućava brzu pretragu po naslovu, opisu ili kategoriji.
6. Quick filters (kategorija, grad, sortiranje) su dostupni odmah ispod search bara.

**Očekivani rezultat:**
- Funkcionalnost "Moderna tražilica poslova (sticky search bar)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 15: Napredni filteri (kategorija, grad, budžet, status, datum)

**Opis:** Napredni filteri omogućavaju precizno sužavanje rezultata pretrage poslova.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Napredni filteri (kategorija, grad, budžet, status, datum)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kategorija: Odabir specifične kategorije usluge.
5. Grad: Filtriranje po lokaciji posla.
6. Budžet: Min i max budžet u eurima.

**Očekivani rezultat:**
- Funkcionalnost "Napredni filteri (kategorija, grad, budžet, status, datum)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 16: Sortiranje poslova (najnoviji, najstariji, budžet visok→nizak, budžet nizak→visok)

**Opis:** Sortiranje rezultata pretrage omogućava prikaz poslova prema vašim preferencama.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Sortiranje poslova (najnoviji, najstariji, budžet visok→nizak, budžet nizak→visok)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Najnoviji: Poslovi sortirani po datumu objave (najnoviji prvo).
5. Najstariji: Poslovi sortirani po datumu objave (najstariji prvo).
6. Budžet visok→nizak: Poslovi sortirani po budžetu (najveći prvo).

**Očekivani rezultat:**
- Funkcionalnost "Sortiranje poslova (najnoviji, najstariji, budžet visok→nizak, budžet nizak→visok)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 17: View mode - Grid i List prikaz poslova

**Opis:** Prebacivanje između grid i list prikaza omogućava personalizaciju načina prikaza poslova.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "View mode - Grid i List prikaz poslova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Grid prikaz: Poslovi prikazani u kartičnom formatu (3 kolone na desktopu).
5. List prikaz: Poslovi prikazani u listi s detaljnijim informacijama.
6. Gumb za prebacivanje između prikaza nalazi se u headeru tražilice.

**Očekivani rezultat:**
- Funkcionalnost "View mode - Grid i List prikaz poslova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 18: Spremljene pretrage (saved searches)

**Opis:** Spremite svoje pretrage za brzo ponovno korištenje bez ponovnog postavljanja filtera.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Spremljene pretrage (saved searches)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon postavljanja filtera, kliknite "Spremi pretragu" i unesite naziv.
5. Spremljene pretrage se prikazuju u dropdownu u tražilici.
6. Odabirom spremljene pretrage automatski se učitavaju filteri i query.

**Očekivani rezultat:**
- Funkcionalnost "Spremljene pretrage (saved searches)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 19: Job alerts - email notifikacije za nove poslove

**Opis:** Primajte email notifikacije za nove poslove koji odgovaraju vašim kriterijima pretrage.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Job alerts - email notifikacije za nove poslove"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kreirajte job alert s nazivom, filterima i frekvencijom (DAILY, WEEKLY, INSTANT).
5. Sustav automatski provjerava nove poslove i šalje email notifikacije.
6. Email sadrži linkove na nove poslove koji odgovaraju kriterijima.

**Očekivani rezultat:**
- Funkcionalnost "Job alerts - email notifikacije za nove poslove" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 20: Frekvencije job alertova (DAILY, WEEKLY, INSTANT)

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Frekvencije job alertova (DAILY, WEEKLY, INSTANT)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Frekvencije job alertova (DAILY, WEEKLY, INSTANT)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 21: Upravljanje spremljenim pretragama u profilu

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Upravljanje spremljenim pretragama u profilu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Upravljanje spremljenim pretragama u profilu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 22: Upravljanje job alertovima u profilu

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Upravljanje job alertovima u profilu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Upravljanje job alertovima u profilu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 23: Quick filters u tražilici

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Quick filters u tražilici"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Quick filters u tražilici" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 24: Prikaz broja pronađenih poslova

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Prikaz broja pronađenih poslova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Prikaz broja pronađenih poslova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 25: Očisti filtere funkcionalnost

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Očisti filtere funkcionalnost"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Očisti filtere funkcionalnost" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 4: Sustav Ponuda

#### Test 1: Slanje ponuda za poslove

**Opis:** Kao pružatelj, pošaljite ponudu korisniku s cijenom i porukom u kojoj objašnjavate svoj pristup.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Slanje ponuda za poslove"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. U detaljima posla odaberete ÔÇťPošalji ponuduÔÇŁ, unesete iznos, procijenjeno trajanje, poruku i po želji označite ÔÇťPregovornoÔÇŁ.
5. Klijent prima obavijest, uspoređuje ponude i može ih prihvatiti, odbiti ili zatražiti izmjene kroz chat.
6. Status ponude (Na čekanju, Prihvaćena, Odbijena) vidljiv je u ÔÇťMoje ponudeÔÇŁ i automatski se ažurira.

**Očekivani rezultat:**
- Funkcionalnost "Slanje ponuda za poslove" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Iznos ponude

**Opis:** Unesite iznos vaše ponude - cijenu koju tražite za obavljanje posla.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Iznos ponude"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. U obrascu ponude upisujete iznos (fiksni ili pregovarački) i valutu.
5. Sustav validira minimalni iznos, uspoređuje s budžetom posla i prikazuje upozorenja.
6. Iznos se prikazuje korisniku uz opcionalne popuste/dodatke.

**Očekivani rezultat:**
- Funkcionalnost "Iznos ponude" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Poruka uz ponudu

**Opis:** Napišite poruku u kojoj objašnjavate svoj pristup poslu i zašto ste pravi izbor.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Poruka uz ponudu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Uz iznos ponude dodajte poruku s uvodom, planom rada i referencama.
5. Editor podržava formatiranje (Markdown) i predloške.
6. Poruka se prikazuje korisniku uz iznos i vidljiva je u chatu.

**Očekivani rezultat:**
- Funkcionalnost "Poruka uz ponudu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Status ponude (NA ČEKANJU, PRIHVAćENA, ODBIJENA)

**Opis:** Pratite status svoje ponude - je li na čekanju, prihvaćena ili odbijena.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Status ponude (NA ČEKANJU, PRIHVAćENA, ODBIJENA)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nova ponuda kreće kao NA ČEKANJU dok korisnik ne reagira.
5. Prihvaćanjem ponude posao prelazi u U TIJEKU; odbijanjem se zaključava daljnje izmjene.
6. Status se sinkronizira s notifikacijama i prikazuje se na dashboardu.

**Očekivani rezultat:**
- Funkcionalnost "Status ponude (NA ČEKANJU, PRIHVAćENA, ODBIJENA)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Mogućnost pregovaranja o cijeni

**Opis:** Pregovarajte o cijeni s korisnikom ili pružateljem kako biste postigli dogovor.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Mogućnost pregovaranja o cijeni"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Ponudu možete označiti kao pregovornu i putem chata dogovarati alternativne iznose ili uvjete.
5. Svaka promjena iznosa bilježi se uz referencu na poruku/korisnika.
6. Završni dogovor potvrđujete ažuriranjem ponude ili slanjem nove verzije.

**Očekivani rezultat:**
- Funkcionalnost "Mogućnost pregovaranja o cijeni" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Označavanje ponuda kao pregovorno

**Opis:** Označite svoju ponudu kao pregovornu ako ste spremni na fleksibilnost u cijeni.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Označavanje ponuda kao pregovorno"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. U obrascu ponude uključite opciju "pregovorno" kako bi korisnik znao da je cijena otvorena za dogovor.
5. Badge "Pregovorno" pojavljuje se uz ponudu i u listi.
6. Sustav potiče korisnika da predloži kontraponudu.

**Očekivani rezultat:**
- Funkcionalnost "Označavanje ponuda kao pregovorno" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Procijenjeni broj dana za izvršenje

**Opis:** Navedite koliko dana vam je potrebno da završite posao - to pomaže korisnicima planirati.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Procijenjeni broj dana za izvršenje"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pri slanju ponude unosite broj dana potrebnih za završetak posla.
5. Podatak se prikazuje uz ponudu i koristi za usporedbu.
6. Ažuriranje je moguće kroz edit ponude ili nakon dogovora.

**Očekivani rezultat:**
- Funkcionalnost "Procijenjeni broj dana za izvršenje" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Pregled svih ponuda za posao

**Opis:** Kao korisnik, vidite sve ponude koje su pružatelji poslali za vaš posao na jednom mjestu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pregled svih ponuda za posao"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Dashboard posla prikazuje tablicu svih pristiglih ponuda s ključnim metrikama.
5. Omogućen je pregled detalja, usporedba i sortiranje po cijeni, ETA-i i ocjeni pružatelja.
6. Iz istog pogleda korisnik može prihvatiti, odbiti ili otvoriti chat.

**Očekivani rezultat:**
- Funkcionalnost "Pregled svih ponuda za posao" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Prihvaćanje/odbijanje ponuda

**Opis:** Prihvatite ponudu koja vam odgovara ili odbijte one koje ne odgovaraju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Prihvaćanje/odbijanje ponuda"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. U tablici ponuda dostupni su gumbi za prihvat i odbijanje.
5. Prihvaćena ponuda zaključava posao i pokreće status "U TIJEKU".
6. Odbijanjem se može navesti razlog koji se dijeli s pružateljem.

**Očekivani rezultat:**
- Funkcionalnost "Prihvaćanje/odbijanje ponuda" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 5: Sustav Bodovanja i Recenzija

#### Test 1: Ocjenjivanje pružatelja usluga (1-5 zvjezdica)

**Opis:** Ocijenite pružatelja nakon završenog posla i pomozite drugim korisnicima odabrati kvalitetnog pružatelja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Ocjenjivanje pružatelja usluga (1-5 zvjezdica)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada je posao označen dovršenim, otključava se forma za ocjenu (1-5 zvjezdica) i kratku recenziju.
5. Recenzija se prikazuje na profilu pružatelja, a prosječna ocjena i reputacijski bodovi automatski se ažuriraju.
6. Pružatelj može uzvratno ocijeniti klijenta; obje strane vide svoje povratne informacije.

**Očekivani rezultat:**
- Funkcionalnost "Ocjenjivanje pružatelja usluga (1-5 zvjezdica)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Komentiranje iskustva s pružateljem

**Opis:** Napišite komentar o svom iskustvu s pružateljem - što vam se svidjelo i što bi se moglo poboljšati.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Komentiranje iskustva s pružateljem"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon dovršetka posla forma traži ocjenu i komentar.
5. Komentar se objavljuje uz ocjenu na profilu pružatelja i u povijesti posla.
6. Pružatelj može odgovoriti na komentar radi konteksta.

**Očekivani rezultat:**
- Funkcionalnost "Komentiranje iskustva s pružateljem" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Bilateralno ocjenjivanje (korisnik ↔ pružatelj)

**Opis:** I vi možete ocijeniti pružatelja, i pružatelj može ocijeniti vas - fer i objektivno ocjenjivanje.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Bilateralno ocjenjivanje (korisnik ↔ pružatelj)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon što posao prijeđe u status ZAVRŠEN, i klijent i pružatelj dobivaju zadatak za ocjenu.
5. Svaka strana daje ocjenu i komentar neovisno o drugoj.
6. Ocjene postaju vidljive nakon što obje strane ocijene ili nakon isteka roka.

**Očekivani rezultat:**
- Funkcionalnost "Bilateralno ocjenjivanje (korisnik ↔ pružatelj)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Sprečavanje duplikata recenzija

**Opis:** Sustav osigurava da možete ocijeniti svaki posao samo jednom - sprečava zloupotrebe.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Sprečavanje duplikata recenzija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon što ostavite recenziju za posao, forma se zaključava i prikazuje obavijest da recenzija već postoji.
5. Unique guard na poslu i recenzentu sprječava kreiranje novog zapisa.
6. Umjesto nove recenzije nudimo uređivanje postojeće.

**Očekivani rezultat:**
- Funkcionalnost "Sprečavanje duplikata recenzija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Uređivanje postojećih recenzija

**Opis:** Možete urediti svoju recenziju ako se vaša mišljenja promijene ili želite ažurirati komentar.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Uređivanje postojećih recenzija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik pronalazi svoju recenziju i otvara modal za uređivanje ocjene i komentara.
5. Promjene se spremaju uz oznaku da je recenzija uređena te se recalculira prosjek.
6. Povijest uređivanja ostaje dostupna adminu radi transparentnosti.

**Očekivani rezultat:**
- Funkcionalnost "Uređivanje postojećih recenzija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Brisanje recenzija

**Opis:** Možete obrisati svoju recenziju ako smatrate da više nije relevantna ili želite je ukloniti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Brisanje recenzija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Autor recenzije ili admin može pokrenuti brisanje iz liste recenzija.
5. Potvrdom se recenzija soft-delete-a (oznaka `deletedAt`) ili trajno uklanja.
6. Prosječna ocjena i broj recenzija se odmah ažuriraju.

**Očekivani rezultat:**
- Funkcionalnost "Brisanje recenzija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Automatsko izračunavanje prosječne ocjene

**Opis:** Platforma automatski izračunava prosječnu ocjenu pružatelja na temelju svih recenzija.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatsko izračunavanje prosječne ocjene"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaki put kad se doda, uredi ili obriše recenzija pokreće se recalculacija prosjeka.
5. Prosjek se prikazuje na profilu pružatelja, karticama i u filterima.
6. Za nove profile koristimo fallback (npr. "N/A" ili minimalni broj recenzija).

**Očekivani rezultat:**
- Funkcionalnost "Automatsko izračunavanje prosječne ocjene" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Brojanje ukupnog broja recenzija

**Opis:** Vidite koliko ukupno recenzija pružatelj ima - više recenzija znači više iskustva.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Brojanje ukupnog broja recenzija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon svake promjene recenzije (create/update/delete) ponovno izračunamo ukupan broj.
5. Broj se prikazuje uz prosjek (npr. "4.8 ÔşÉ (23 recenzije)") i dostupno je za sortiranje.
6. Novi profili s malo recenzija dobivaju badge "Novi" ili "Uskoro ocjene".

**Očekivani rezultat:**
- Funkcionalnost "Brojanje ukupnog broja recenzija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Prikaz recenzija na profilu pružatelja

**Opis:** Sve recenzije koje je pružatelj primio prikazuju se na njegovom profilu za javni pregled.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Prikaz recenzija na profilu pružatelja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Sekcija recenzija prikazuje ocjene, komentare, datum i autora.
5. Sort i filteri (npr. samo 5ÔşÉ) pomažu korisnicima pronaći relevantne primjere.
6. Pružatelj može odgovoriti na recenziju; odgovor se prikazuje ispod originala.

**Očekivani rezultat:**
- Funkcionalnost "Prikaz recenzija na profilu pružatelja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 6: Profili Pružatelja

#### Test 1: Detaljni profil pružatelja

**Opis:** Sveobuhvatan profil pružatelja s informacijama o iskustvu, licencama, portfoliju i recenzijama.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Detaljni profil pružatelja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Profil je podijeljen u sekcije: biografija, usluge, portfolio, recenzije, verifikacije i kontakt.
5. Podaci se dohvaćaju kroz jedan API poziv i keširaju za brze prikaze.
6. Verifikacijski badgevi prikazuju status (email, telefon, licenca, kućni testovi).

**Očekivani rezultat:**
- Funkcionalnost "Detaljni profil pružatelja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Biografija pružatelja

**Opis:** Napišite kratku biografiju koja predstavlja vas, vaše iskustvo i pristup poslu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Biografija pružatelja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj unosi biografiju u dashboardu; polje podržava osnovni markdown.
5. Biografija se prikazuje na vrhu profila (skraćena verzija u listama rezultata).
6. Validacija sprječava unos zabranjenih podataka (kontakt, URL-ovi izvan dozvoljenih polja).

**Očekivani rezultat:**
- Funkcionalnost "Biografija pružatelja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Specijalizacije

**Opis:** Navedite svoja specijalizirana područja - gdje ste najbolji i što najviše volite raditi.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Specijalizacije"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj odabire specijalizacije iz predefiniranog popisa ili dodaje prilagođene tagove (uz odobrenje admina).
5. Specijalizacije se prikazuju na profilu, u karticama i koriste u filtriranju pretrage.
6. Admini mogu upravljati popisom i mapirati specijalizacije na kategorije.

**Očekivani rezultat:**
- Funkcionalnost "Specijalizacije" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Godine iskustva

**Opis:** Navedite koliko godina radite u svojoj djelatnosti - to pokazuje vaše iskustvo.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Godine iskustva"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj unosi broj godina iskustva (ukupno ili po kategoriji) kroz profil.
5. Vrijednost se prikazuje na profilu i može utjecati na sortiranje/preporuke.
6. Admin može zatražiti dokaz (certifikat, referenca) kada su vrijednosti neuobičajeno visoke.

**Očekivani rezultat:**
- Funkcionalnost "Godine iskustva" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Web stranica

**Opis:** Dodajte link na svoju web stranicu kako bi korisnici mogli vidjeti više o vašim uslugama.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Web stranica"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj unosi URL web stranice; sustav validira format i dostupnost.
5. Link se prikazuje na profilu i u karticama kao CTA (otvara se u novom tabu).
6. Admini mogu označiti link kao verificiran (npr. DNS provjera).

**Očekivani rezultat:**
- Funkcionalnost "Web stranica" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Područje rada

**Opis:** Navedite gradove ili područja u kojima radite - to pomaže korisnicima vidjeti pokrivate li njihovo područje.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Područje rada"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj odabire regije/gradove (autocomplete + karta) i opcionalno definira radijus.
5. Područja se prikazuju na profilu, a korisnici i sustav koriste ih za filtriranje.
6. Moguće je označiti primarne i sekundarne zone te postaviti nadoplate za udaljene lokacije.

**Očekivani rezultat:**
- Funkcionalnost "Područje rada" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Status dostupnosti

**Opis:** Označite jesite li trenutno dostupni za nove poslove ili ste zauzeti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Status dostupnosti"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj odabire status (DOSTUPAN, ZAUZET, NEAKTIVAN) u profilu ili mobilnoj aplikaciji.
5. Status se prikazuje na profilu, karticama i u filtrima pretrage; može imati auto-expire.
6. Admin ili automatika može prebaciti status na ZAUZET ako postoje aktivni poslovi iznad definiranog praga.

**Očekivani rezultat:**
- Funkcionalnost "Status dostupnosti" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Kategorije u kojima radi

**Opis:** Odaberite kategorije usluga u kojima radite - to određuje koje poslove vidite.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kategorije u kojima radi"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj bira kategorije iz hijerarhije (glavne i podkategorije) i povezuje ih sa svojim profilom.
5. Odabrane kategorije prikazuju se na profilu i filtriraju poslove, leadove i pretrage.
6. Admin može odobriti ili odbiti zahtjev za novom kategorijom (compliance/licence check).

**Očekivani rezultat:**
- Funkcionalnost "Kategorije u kojima radi" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Odabir kategorija za primanje leadova

**Opis:** Odaberite u kojim kategorijama želite primati ekskluzivne leadove - to određuje koje leadove vidite.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Odabir kategorija za primanje leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj označi kategorije iz kojih želi primati leadove (može biti subset radnih kategorija).
5. Lead distribucija koristi listu za formiranje reda čekanja i obavijesti.
6. Promjene stupaju na snagu odmah; sustav može provjeriti minimalne kriterije (npr. licence).

**Očekivani rezultat:**
- Funkcionalnost "Odabir kategorija za primanje leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Filtriranje leadova po kategorijama

**Opis:** Filtrirate leadove prema kategorijama kako biste vidjeli samo relevantne leadove.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Filtriranje leadova po kategorijama"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Lead marketplace nudi filter po kategorijama (višestruki odabir, podkategorije).
5. Rezultati se ažuriraju u realnom vremenu i pamte kroz URL/saved filtere.
6. Filtriranje se kombinira s ostalim kriterijima (lokacija, cijena, status).

**Očekivani rezultat:**
- Funkcionalnost "Filtriranje leadova po kategorijama" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 11: Portfolio radova

**Opis:** Prikažite svoje najbolje radove kroz galeriju slika na vašem profilu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Portfolio radova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktor ili tim dodaje projekt s naslovom, opisom i više fotografija.
5. Radovi se grupiraju po kategorijama i prikazuju na javnom profilu s pregledom u punoj veličini.
6. Posjetitelji mogu filtrirati portfolio po uslugama ili regiji.

**Očekivani rezultat:**
- Funkcionalnost "Portfolio radova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 12: Certifikati i licence

**Opis:** Uploadajte i upravljajte svojim profesionalnim certifikatima i licencama koje su potrebne za određene kategorije.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Certifikati i licence"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj učitava PDF dokument, unosi tip, broj, izdavatelja i datum isteka.
5. Sustav licencu povezuje s kategorijama/poslovima koji je zahtijevaju i šalje ju u admin verifikaciju.
6. Automatske notifikacije (30/14/7/1 dan prije isteka) podsjećaju na obnovu, a status licence se osvježava na profilu.

**Očekivani rezultat:**
- Funkcionalnost "Certifikati i licence" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 13: Pregled svih pružatelja

**Opis:** Pregledajte sve pružatelje na platformi i pronađite onog koji najbolje odgovara vašim potrebama.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pregled svih pružatelja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Stranica "Svi pružatelji" prikazuje grid/listu sa ključnim informacijama (ocjena, recenzije, lokacije, verifikacije).
5. Filteri (kategorija, lokacija, ocjena, dostupnost) i sortiranja (rating, broj recenzija, udaljenost) pomažu suziti rezultate.
6. Klik na karticu vodi na detaljni profil pružatelja.

**Očekivani rezultat:**
- Funkcionalnost "Pregled svih pružatelja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 14: Filtriranje pružatelja

**Opis:** Pronađite pružatelje koji odgovaraju vašim kriterijima filtriranjem po kategoriji, lokaciji, ocjeni i dostupnosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Filtriranje pružatelja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Filter panel omogućuje kombinaciju kategorija, gradova, raspona ocjena, dostupnosti i cijene.
5. Rezultati se ažuriraju u realnom vremenu; filteri se pamte u URL-u i mogu se spremiti.
6. Algoritam podržava geo-sorting (udaljenost) i dostupnost status.

**Očekivani rezultat:**
- Funkcionalnost "Filtriranje pružatelja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 15: Team Locations - geo-dinamičke lokacije

**Opis:** Timovi definiraju dinamičke lokacije rada koje se osvježavaju u realnom vremenu radi preciznog matchinga.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Team Locations - geo-dinamičke lokacije"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj dodaje više lokacija (uredi, vozila, zone) i definira radijus pokrivenosti.
5. Lokacije se ažuriraju ručno, putem mobilne aplikacije ili telemetrijskih integracija.
6. Matcher koristi najbližu aktivnu lokaciju za dodjelu poslova i prikaz korisnicima.

**Očekivani rezultat:**
- Funkcionalnost "Team Locations - geo-dinamičke lokacije" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 16: Upravljanje tim lokacijama

**Opis:** Adminsko sučelje omogućuje dodavanje, uređivanje i deaktivaciju geo lokacija tima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Upravljanje tim lokacijama"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Role-based UI omogućuje vlasnicima/menadžerima da kreiraju lokacije, postave radijus i radno vrijeme.
5. Lokacije se mogu grupirati (npr. vozni park) i privremeno deaktivirati.
6. Svaka promjena odmah utječe na matchmaking i prikaze korisnicima.

**Očekivani rezultat:**
- Funkcionalnost "Upravljanje tim lokacijama" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 17: Radius checking za lokacije

**Opis:** Poslovi se dodjeljuju lokacijama koje pokrivaju određeni radijus ili poligon, uz opcionalne nadoplate za udaljene zone.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Radius checking za lokacije"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaka lokacija definira radijus ili poligon pokrivenosti te pravila cijena.
5. Kod pojave novog posla geo servis izračuna udaljenost i provjeri poklapa li se s pokrivenošću.
6. Ako je izvan zone, sustav nudi alternativne timove ili naplatu dodatka.

**Očekivani rezultat:**
- Funkcionalnost "Radius checking za lokacije" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 18: Haversine formula za udaljenost

**Opis:** Za precizne geo izračune koristimo Haversine formulu (udaljenost dvije točke na Zemlji).

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Haversine formula za udaljenost"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Latitude/longitude koordinati pretvaramo u udaljenost u kilometrima koristeći Haversine formulu.
5. Rezultat se koristi u filtrima, sortiranju i provjerama pokrivenosti.
6. Optimizacije u bazi (PostGIS) smanjuju potrošnju CPU-a kod velikih upita.

**Očekivani rezultat:**
- Funkcionalnost "Haversine formula za udaljenost" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 7: Chat i Komunikacija

#### Test 1: Real-time chat između korisnika i pružatelja

**Opis:** Komunicirajte s korisnicima ili pružateljima u realnom vremenu preko chata na platformi.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Real-time chat između korisnika i pružatelja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaki posao otvara dedikiranu chat sobu u kojoj sudjeluju klijent i odabrani pružatelji.
5. Poruke se isporučuju u realnom vremenu (typing indicator, delivered/read status), uz mogućnost dijeljenja slika i dokumenata.
6. Povijest razgovora ostaje dostupna i služi kao audit trail u slučaju nesporazuma.

**Očekivani rezultat:**
- Funkcionalnost "Real-time chat između korisnika i pružatelja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Chat sobe za svaki posao

**Opis:** Svaki posao ima svoju chat sobu gdje možete komunicirati s korisnikom ili pružateljem oko tog posla.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Chat sobe za svaki posao"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kreira se jedna chat soba po poslu (jobId) čim se pojavi interakcija (ponuda, pitanje, prihvat).
5. Sudionici (korisnik, pružatelji, admin) komuniciraju u realnom vremenu s tipkanje/pročitano indikatorima.
6. Povijest ostaje pohranjena i dostupna u bilo kojem trenutku.

**Očekivani rezultat:**
- Funkcionalnost "Chat sobe za svaki posao" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Povijest poruka

**Opis:** Sve poruke koje pošaljete i primite su spremljene tako da možete vidjeti cijelu povijest razgovora.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Povijest poruka"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Poruke se pohranjuju kronološki i mogu se dohvatiti paginirano.
5. Status (poslano, dostavljeno, pročitano) prati lifecycle svake poruke.
6. Prilozi i reference (ponude, dokumenti) povezani su s porukama.

**Očekivani rezultat:**
- Funkcionalnost "Povijest poruka" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Slanje slika u chatu

**Opis:** Dijelite slike direktno u chat razgovoru s korisnicima ili pružateljima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Slanje slika u chatu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. U chatu odaberete opciju za prilog, odaberete fotografiju i aplikacija je automatski uploada, provjerava i prikazuje u razgovoru.
5. Poruka s prilogom prikazuje thumbnail, opciju preuzimanja i informacije o veličini/datum uploada.
6. Sustav validira tip i veličinu datoteke te obavještava ako je potrebno ponovno slanje.

**Očekivani rezultat:**
- Funkcionalnost "Slanje slika u chatu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Notifikacije za nove poruke

**Opis:** Primajte obavijesti kada vam netko pošalje poruku u chatu - ne propustite važne poruke.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Notifikacije za nove poruke"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon svake nove poruke u sobi u kojoj sudjelujete, kreira se notifikacija (toast + badge).
5. Push/email obavijesti šalju se ako ste offline ili imate omogućene browser notifikacije.
6. Klik na notifikaciju vodi izravno u odgovarajući chat i označava poruke pročitanima.

**Očekivani rezultat:**
- Funkcionalnost "Notifikacije za nove poruke" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Status poruke (poslana, pročitana)

**Opis:** Vidite status svake poruke koju pošaljete - je li poslana, dostavljena ili pročitana.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Status poruke (poslana, pročitana)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaka poslata poruka dobiva status: Poslana (Ôťô), Dostavljena (ÔťôÔťô) ili Pročitana (ÔťôÔťô s označenjem).
5. Status se ažurira u realnom vremenu preko WebSocket događaja kad primatelj primi ili otvori poruku.
6. Ako poruka ostane bez dostave, korisnik dobiva upozorenje i mogućnost ponovnog slanja.

**Očekivani rezultat:**
- Funkcionalnost "Status poruke (poslana, pročitana)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 8: Notifikacije

#### Test 1: Notifikacije za nove ponude

**Opis:** Primajte obavijesti kada vam pružatelj pošalje ponudu za vaš posao.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Notifikacije za nove ponude"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kad pružatelj pošalje ponudu, sustav u realnom vremenu šalje in-app notifikaciju, e-mail i opciono push/SMS.
5. Notifikacija prikazuje ključne informacije (pružatelj, iznos, poruka) i link na pregled ponude.
6. Klikom otvarate ponudu, možete prihvatiti/odbijati ili odgovoriti kroz chat.

**Očekivani rezultat:**
- Funkcionalnost "Notifikacije za nove ponude" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Notifikacije za prihvaćene ponude

**Opis:** Primajte obavijest kada korisnik prihvati vašu ponudu - možete započeti rad na poslu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Notifikacije za prihvaćene ponude"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada klijent prihvati ponudu, sustav kreira notifikaciju za pružatelja i označi posao kao U TIJEKU.
5. Push/email informacija uključuje ključne podatke (posao, iznos, klijent) i link na detalje.
6. Notifikacija se uklanja nakon što otvorite posao ili ručno označite kao pročitanu.

**Očekivani rezultat:**
- Funkcionalnost "Notifikacije za prihvaćene ponude" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Notifikacije za nove poruke

**Opis:** Primajte obavijesti kada vam netko pošalje poruku u chatu - ne propustite važne poruke.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Notifikacije za nove poruke"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon svake nove poruke u sobi u kojoj sudjelujete, kreira se notifikacija (toast + badge).
5. Push/email obavijesti šalju se ako ste offline ili imate omogućene browser notifikacije.
6. Klik na notifikaciju vodi izravno u odgovarajući chat i označava poruke pročitanima.

**Očekivani rezultat:**
- Funkcionalnost "Notifikacije za nove poruke" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Notifikacije za nove poslove (providere)

**Opis:** Kao pružatelj, primajte obavijesti kada se objavi novi posao u vašim kategorijama - ne propustite priliku.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Notifikacije za nove poslove (providere)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Job publish event provjerava koje tvrtke imaju odabrane kategorije/lokacije i kreira im notifikaciju.
5. Obavijest prikazuje naslov, budžet, lokaciju i link na detalje ÔÇô dostupna kao push/email/SMS.
6. Saved filteri i preferencije omogućuju odabir frekvencije (real-time, digest) i kanala.

**Očekivani rezultat:**
- Funkcionalnost "Notifikacije za nove poslove (providere)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Email notifikacije

**Opis:** Primajte važne obavijesti na email kako biste bili informirani čak i ako niste na platformi.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Email notifikacije"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon važnih događaja (nova poruka, novi posao, promjena statusa ponude) generira se email prema korisnikovim preferencama.
5. Svaki email sadrži sažetak, ključne CTA linkove i mogućnost upravljanja postavkama.
6. Digest opcija šalje objedinjene obavijesti (dnevno/tjedno) kako bi se smanjio broj poruka.

**Očekivani rezultat:**
- Funkcionalnost "Email notifikacije" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: SMS notifikacije (Twilio)

**Opis:** Sustav šalje transakcijske SMS poruke preko Twilio API-ja (verifikacija, novi leadovi, kupnje, refundacije, urgentne obavijesti) i sve ih logira u bazu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "SMS notifikacije (Twilio)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Centralni `sms-service` definira generičku funkciju `sendSMS` i specifične helper funkcije (`sendVerificationCode`, `notifyNewLeadAvailable`, `notifyLeadPurchased`, `notifyRefund`, `sendUrgentNotification`).
5. Ako su Twilio kredencijali podešeni, poruke se šalju preko Twilio Messaging API-ja; u suprotnom se koristi "simulation" način za development/test okruženja.
6. Svaki pokušaj slanja (uspješan ili neuspješan) zapisuje se u tablicu `SmsLog` s metapodacima (tip, status, Twilio SID, error, userId, metadata).

**Očekivani rezultat:**
- Funkcionalnost "SMS notifikacije (Twilio)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: In-app notifikacije

**Opis:** Primajte obavijesti direktno na platformi - vidite ih u realnom vremenu dok koristite platformu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "In-app notifikacije"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. U realnom vremenu renderiramo toast i unos u panel čim se dogodi relevantan event (ponuda, poruka, status).
5. Ikonica zvona prikazuje broj nepročitanih; klik otvara listu s quick akcijama.
6. Korisnik može označiti pojedinačne ili sve notifikacije kao pročitane.

**Očekivani rezultat:**
- Funkcionalnost "In-app notifikacije" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Push notifikacije (browser notifications)

**Opis:** Primajte browser push notifikacije direktno na vašem uređaju čak i kada niste na platformi - ne propustite važne obavijesti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Push notifikacije (browser notifications)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik klikne gumb "Uključi push notifikacije" i dozvoljava browseru da prikazuje notifikacije.
5. Sustav registrira service worker i pohranjuje push subscription u bazu podataka.
6. Kada se dogodi važan događaj (novi posao, ponuda, poruka), backend šalje push notifikaciju kroz web-push protokol.

**Očekivani rezultat:**
- Funkcionalnost "Push notifikacije (browser notifications)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Brojač nepročitanih notifikacija

**Opis:** Vidite broj nepročitanih notifikacija na ikonici zvona - znate koliko novih obavijesti imate.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Brojač nepročitanih notifikacija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaka nova nepročitana notifikacija povećava badge brojača; čitanjem se broj smanjuje ili resetira.
5. Brojač se sinkronizira u realnom vremenu preko WebSocket eventa i resetira nakon `markRead` akcija.
6. Fallback polling osigurava točnost i nakon reconnecta.

**Očekivani rezultat:**
- Funkcionalnost "Brojač nepročitanih notifikacija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 9: USLUGAR EXCLUSIVE Funkcionalnosti

#### Test 1: Ekskluzivni lead sustav

**Opis:** Kupite ekskluzivni pristup leadu - samo vi kontaktirate klijenta, bez konkurencije.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Ekskluzivni lead sustav"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Marketplace prikazuje ekskluzivne leadove s oznakama kvalitete (VRHUNSKI, DOBAR, PROSJEČAN) i procjenom vrijednosti.
5. Plaćanje kreditima ili Stripe Checkout odmah otkriva kontakt podatke i zaključava lead samo za vašu tvrtku.
6. Nakon kupnje lead prelazi u ÔÇťMoje leadoveÔÇŁ sa statusima (Aktivno, Kontaktirano, Konvertirano, Refundirano, Isteklo).

**Očekivani rezultat:**
- Funkcionalnost "Ekskluzivni lead sustav" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Tržište leadova

**Opis:** Pregledajte sve dostupne ekskluzivne leadove na jednom mjestu i odaberite najbolje za vas.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Tržište leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Marketplace prikazuje sve aktivne ekskluzivne leadove s ključnim informacijama (opis, budžet, AI score, cijena).
5. Filtri omogućuju odabir po kategoriji, lokaciji, budžetu, AI scoreu i statusu hitnosti; sortiranje po datumu, cijeni ili kvaliteti.
6. Klik na lead otvara detalje, a kupnja se potvrđuje kreditima ili karticom; kontakt podaci postaju dostupni samo kupcu.

**Očekivani rezultat:**
- Funkcionalnost "Tržište leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Kreditni sustav

**Opis:** Interni sustav kredita za kupovinu leadova - umjesto direktnog plaćanja, koristite kredite koje kupujete ili dobivate s pretplatom.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kreditni sustav"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kupnja pretplate - svaki paket uključuje određeni broj kredita
5. Jednokratna kupovina - možete kupiti dodatne kredite
6. Besplatni trial - dobivate besplatne kredite za probno razdoblje

**Očekivani rezultat:**
- Funkcionalnost "Kreditni sustav" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Cijene leadova (10-20 kredita)

**Opis:** Transparentne cijene leadova - svaki lead košta između 10 i 20 kredita, ovisno o kategoriji i kvaliteti leada.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Cijene leadova (10-20 kredita)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Minimum: 10 kredita - za osnovne leadove
5. Maksimum: 20 kredita - za visokokvalitetne leadove
6. Prosjek: 15 kredita - za većinu leadova

**Očekivani rezultat:**
- Funkcionalnost "Cijene leadova (10-20 kredita)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Kupnja leadova

**Opis:** Kupite ekskluzivni lead klikom na gumb - krediti se troše automatski ili plaćate direktno karticom.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kupnja leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Klik na "Kupi lead" pokreće provjeru raspoloživih kredita i zaključavanje leada.
5. Ako krediti nisu dovoljni, nudimo Stripe plaćanje ili top-up prije dovršetka kupnje.
6. Nakon uspješne transakcije, lead prelazi u "Moji leadovi" i kontakt podaci se otkrivaju samo vama.

**Očekivani rezultat:**
- Funkcionalnost "Kupnja leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: ROI dashboard

**Opis:** Vidite detaljne statistike vašeg poslovanja - koliko zaradujete, koliko trošite i koliki je vaš ROI.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "ROI dashboard"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Dashboard prikuplja KPI-je (ROI, stopu konverzije, prosječnu vrijednost leada, potrošene kredite i prihod) iz lead događaja, plaćanja i konverzija.
5. Grafovi i tablice prikazuju trendove po mjesecima, kategorijama i regijama te usporedbu s prosjekom tržišta.
6. AI modul generira preporuke (npr. fokusirajte se na leadove s budžetom 5-10k EUR, produljite SLA u kategoriji Elektro).

**Očekivani rezultat:**
- Funkcionalnost "ROI dashboard" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Moji leadovi

**Opis:** Upravljajte svim leadovima koje ste kupili - pratite status, kontaktirajte klijente i označite rezultate.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Moji leadovi"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Sekcija prikazuje sve kupljene leadove s ključnim podacima (status, AI score, cijena, vrijeme od kupnje).
5. Status se ažurira kroz akcije (Kontaktirano, Konvertirano, Refundirano, Isteklo) i sinkronizira s refund/SLA pravilima.
6. Klik na lead otvara detalje s kontaktima, bilješkama, timelineom aktivnosti i gumbima za refund ili bilješku.

**Očekivani rezultat:**
- Funkcionalnost "Moji leadovi" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Red čekanja za leadove

**Opis:** Uredite se u red čekanja za leadove - leadovi se automatski dijele redom providerima u redu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Red čekanja za leadove"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj se prijavljuje u queue za odabrane kategorije/lokacije uz definirane limite troška.
5. Novi lead automatski se ponudi prvom slobodnom u redu; ako odbije/istekne SLA, prelazi na sljedećeg.
6. Queue algoritam bilježi redoslijed, vrijeme reakcije i pravednu distribuciju.

**Očekivani rezultat:**
- Funkcionalnost "Red čekanja za leadove" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: AI score kvalitete leadova

**Opis:** Svaki lead dobiva automatsku ocjenu kvalitete od 0-100 koja pokazuje koliko je lead vrijedan. (Rule-based scoring algoritam)

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "AI score kvalitete leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Rule-based scoring algoritam ocjenjuje leadove prema verifikaciji klijenta, detaljnosti opisa, budžetu, prilozima, hitnosti, roku i lokaciji.
5. Napomena: Ovo je rule-based algoritam (ne pravi AI), ali se može nadograditi s pravim AI-om u budućnosti.
6. Rezultat (0-100) mapira se na razrede kvalitete (Slab, Prosječan, Dobar, Vrhunski) i determinira cijenu leada.

**Očekivani rezultat:**
- Funkcionalnost "AI score kvalitete leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Verifikacija klijenata

**Opis:** Provjeravamo email, telefon, OIB i poslovne podatke klijenata kako bismo osigurali kvalitetu leadova.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Verifikacija klijenata"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Klijent prolazi kroz više provjera: email link, SMS kod, OIB provjeru i provjeru poslovnog registra.
5. Status verifikacije prikazuje se badgevima na lead kartici i utječe na AI score.
6. Eventualne promjene (npr. istek licence tvrtke) automatski obaraju badge i šalju upozorenje.

**Očekivani rezultat:**
- Funkcionalnost "Verifikacija klijenata" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 11: Pretplata na leadove

**Opis:** Pretplatite se na plan (BASIC, PREMIUM, PRO) kako biste dobili kredite i pristup ekskluzivnim leadovima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pretplata na leadove"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik odabire plan; Stripe kreira pretplatu i mjesečno dodaje kredite na račun.
5. Plan definira kvote, dostupne značajke (AI filteri, auto-buy, analitika) i SLA podršku.
6. Upgrade/downgrade i otkazivanje obrađuju se prorata logikom; preostali krediti ostaju.

**Očekivani rezultat:**
- Funkcionalnost "Pretplata na leadove" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 12: Statistike uspješnosti

**Opis:** Vidite sve svoje statistike uspješnosti - konverziju, ROI, prihod i druge metrike.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Statistike uspješnosti"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Dashboard agregira konverziju, ROI, prihod, potrošene kredite i performanse po kategorijama/regionima.
5. Period filteri (danas, mjesec, custom) i usporedba s prethodnim razdobljem pomažu pratiti trend.
6. AI modul predlaže akcije (npr. povećaj budžet u kategoriji gdje ROI raste).

**Očekivani rezultat:**
- Funkcionalnost "Statistike uspješnosti" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 13: VIP podrška 24/7 (Support tickets)

**Opis:** PRO i PREMIUM partneri dobivaju prioritetnu 24/7 podršku kroz support ticket sustav i live chat widget. Uključuje automatski routing, 24/7 monitoring i real-time chat podršku.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "VIP podrška 24/7 (Support tickets)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Support Tickets: Korisnik kreira ticket s temom i opisom; backend ga sprema u `SupportTicket` s početnim statusom OPEN. Ovisno o pretplatničkom planu, prioritet se automatski diže (PRO → URGENT, PREMIUM → HIGH), dok BASIC ostaje NORMAL. VIP ticket-e (URGENT) automatski se dodjeljuju agentu s najmanje aktivnih ticket-a.
5. Live Chat Widget: PRO korisnici mogu pokrenuti live chat putem `POST /api/support/chat/start`. Automatski se kreira support chat soba s dostupnim agentom. Real-time komunikacija kroz Socket.io.
6. 24/7 Monitoring: `GET /api/support/availability` provjerava dostupnost support tima, broj aktivnih agenata, aktivne support chat sobe i URGENT ticket-e. Prikazuje prosječno vrijeme odgovora.

**Očekivani rezultat:**
- Funkcionalnost "VIP podrška 24/7 (Support tickets)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 14: White-label opcija (PRO plan)

**Opis:** PRO partneri mogu brendirati Uslugar portal svojim logotipom, bojama i domenom kako bi platforma izgledala kao njihov vlastiti lead portal.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "White-label opcija (PRO plan)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktoru PRO plana se u postavkama prikazuje ÔÇťWhite-labelÔÇŁ modul gdje može dodati logotip, primarnu/sekundarnu boju i vlastitu domenu (CNAME).
5. Frontend koristi te postavke za brandiranje navigacije, headera, email predložaka i javnih stranica (npr. pozivi klijentima, onboarding tima).
6. Backend učitava `WhiteLabel` konfiguraciju po `userId`/tvrtki i dinamički vraća odgovarajuće brand parametre (theme, logo URL, naziv brenda).

**Očekivani rezultat:**
- Funkcionalnost "White-label opcija (PRO plan)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 10: Queue Sustav za Distribuciju Leadova

#### Test 1: Red čekanja za leadove (LeadQueue)

**Opis:** Automatski red čekanja koji distribuira leadove pružateljima prema njihovoj poziciji i reputaciji - pravedna i efikasna distribucija.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Red čekanja za leadove (LeadQueue)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada se pojavi novi lead, dodaje se u red čekanja
5. Pružatelji se dodjeljuju prema poziciji u redu
6. Pružatelji s boljom reputacijom dobivaju prioritet

**Očekivani rezultat:**
- Funkcionalnost "Red čekanja za leadove (LeadQueue)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Pozicija u redu čekanja

**Opis:** Vidite svoju poziciju u redu čekanja za svaku kategoriju - znate koliko vas još čeka prije vas.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pozicija u redu čekanja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Dashboard reda prikazuje trenutnu poziciju i ukupan broj partnera u svakoj kategoriji.
5. Pozicija se automatski ažurira kada netko ispred prihvati/odbije lead ili pauzira red.
6. Možete pregledati povijest pozicija i procijenjeno vrijeme do sljedećeg leada.

**Očekivani rezultat:**
- Funkcionalnost "Pozicija u redu čekanja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Statusi u redu (WAITING, OFFERED, ACCEPTED, DECLINED, EXPIRED, SKIPPED)

**Opis:** Različiti statusi leadova u redu čekanja - vidite gdje se svaki lead nalazi u procesu distribucije.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Statusi u redu (WAITING, OFFERED, ACCEPTED, DECLINED, EXPIRED, SKIPPED)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Lead čeka na dodjelu pružatelju
5. Još nije ponuđen nikome
6. U redu čekanja za distribuciju

**Očekivani rezultat:**
- Funkcionalnost "Statusi u redu (WAITING, OFFERED, ACCEPTED, DECLINED, EXPIRED, SKIPPED)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Automatska distribucija leadova

**Opis:** Leadovi se automatski dijele providerima u redu čekanja - nema potrebe za ručnom intervencijom.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatska distribucija leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kad se lead objavi, engine pronalazi relevantni red i nudi lead prvom aktivnom članu.
5. SLA timer prati reakciju i po isteku automatski dodjeljuje sljedećem u redu.
6. Distribucija je transakcijska ÔÇô lead se zaključava čim ga provider prihvati.

**Očekivani rezultat:**
- Funkcionalnost "Automatska distribucija leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Rok za odgovor (24h)

**Opis:** Imate 24 sata da odgovorite na lead koji vam je ponuđen - nakon toga se automatski vraća u red ili se refundira.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Rok za odgovor (24h)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Lead vam se ponudi u queue sustavu
5. Od trenutka ponude imate 24 sata za odgovor
6. Možete prihvatiti (INTERESTED) ili odbiti (NOT_INTERESTED)

**Očekivani rezultat:**
- Funkcionalnost "Rok za odgovor (24h)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Odgovori providera (INTERESTED, NOT_INTERESTED, NO_RESPONSE)

**Opis:** Tri moguća odgovora kada vam se ponudi lead - prihvatite, odbijte ili ne odgovorite u roku.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Odgovori providera (INTERESTED, NOT_INTERESTED, NO_RESPONSE)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Prihvaćate lead i želite kontaktirati korisnika
5. Lead postaje aktivan za vas
6. Možete odmah kontaktirati korisnika

**Očekivani rezultat:**
- Funkcionalnost "Odgovori providera (INTERESTED, NOT_INTERESTED, NO_RESPONSE)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Preskakanje neaktivnih providera

**Opis:** Provideri koji ne reagiraju u roku automatski se preskaču kako red ne bi stajao.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Preskakanje neaktivnih providera"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon isteka roka (zadano 24 h) lead prelazi u status SKIPPED i nudi se sljedećem u redu.
5. Neaktivni provider dobiva obavijest i može naknadno prilagoditi postavke (pauza, filteri).
6. Ponavljana neaktivnost utječe na prioritet i reputaciju u queueu.

**Očekivani rezultat:**
- Funkcionalnost "Preskakanje neaktivnih providera" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Queue scheduler (provjera svakih sat vremena)

**Opis:** Automatska provjera queue sustava svakih sat vremena - distribuira nove leadove i ažurira status postojećih.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Queue scheduler (provjera svakih sat vremena)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Automatski pokretanje svakih sat vremena
5. Provjerava nove leadove koji čekaju distribuciju
6. Distribuira leadove pružateljima prema poziciji u redu

**Očekivani rezultat:**
- Funkcionalnost "Queue scheduler (provjera svakih sat vremena)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Notifikacije za nove leadove u redu

**Opis:** Primajte obavijest svaki put kada vam sustav ponudi novi lead u redu čekanja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Notifikacije za nove leadove u redu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada lead dođe na vaš red, sustav šalje in-app, email i (opcionalno) SMS obavijest.
5. Notifikacija sadrži ključne podatke (naslov, budžet, lokacija) i countdown do isteka.
6. Klik vas vodi na detalje leada gdje birate odgovor.

**Očekivani rezultat:**
- Funkcionalnost "Notifikacije za nove leadove u redu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Pregled mojih leadova u redu

**Opis:** Centralizirani prikaz svih leadova koji su vam ponuđeni kroz red čekanja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pregled mojih leadova u redu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Tablica prikazuje sve leadove koji su vam ikad ponuđeni uz status, rok i odgovor.
5. Filtri po statusu, kategoriji i datumu pomažu fokusirati se na aktivne prilike.
6. Moguće je otvoriti lead, odgovoriti ili pregledati povijest komunikacije.

**Očekivani rezultat:**
- Funkcionalnost "Pregled mojih leadova u redu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 11: Statistike queue sustava

**Opis:** Pratite metrike reda čekanja ÔÇô protok leadova, vrijeme odgovora i konverziju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Statistike queue sustava"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Sustav kontinuirano bilježi leadove kroz queue (offered, accepted, skipped) i vrijeme reakcije.
5. Dashboardi prikazuju KPI-je (lead throughput, win-rate, prosječno vrijeme odgovora, % preskočenih).
6. Segmentacija po kategoriji/regionu pomaže otkriti uska grla.

**Očekivani rezultat:**
- Funkcionalnost "Statistike queue sustava" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 11: Refund i Povrat Kredita

#### Test 1: Refund kredita (vraćanje internih kredita)

**Opis:** Vraćanje internih kredita na vaš račun kada je potreban refund - jednostavno i brzo vraćanje kredita.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Refund kredita (vraćanje internih kredita)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Refund ako klijent ne odgovori u roku
5. Automatski refund nakon 48h neaktivnosti
6. Ručno zatraživanje refund-a

**Očekivani rezultat:**
- Funkcionalnost "Refund kredita (vraćanje internih kredita)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Stripe Payment Intent refund API (PSD2 compliant)

**Opis:** Ako ste platili lead putem Stripe kartice, refund se vraća direktno na vašu karticu prema PSD2 propisima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Stripe Payment Intent refund API (PSD2 compliant)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Ako ste platili Stripe karticom, refund ide na karticu
5. Automatski proces refund-a
6. PSD2 compliant - u skladu s europskim propisima

**Očekivani rezultat:**
- Funkcionalnost "Stripe Payment Intent refund API (PSD2 compliant)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Automatski odabir refund metode (Stripe API ili interni krediti)

**Opis:** Sustav automatski odabire najbolju metodu refund-a - vraćanje na karticu ako ste platili karticom, inače vraćanje kredita.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatski odabir refund metode (Stripe API ili interni krediti)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Sustav provjerava kako ste platili
5. Ako ste platili Stripe karticom, refund ide na karticu
6. Ako ste platili kreditima, refund ide kao krediti

**Očekivani rezultat:**
- Funkcionalnost "Automatski odabir refund metode (Stripe API ili interni krediti)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Refund ako klijent ne odgovori u roku

**Opis:** Ako klijent ne reagira u definiranom vremenu, lead se automatski refundira.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Refund ako klijent ne odgovori u roku"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon kupnje lead ulazi u monitoring (npr. 48 h). Ako nema potvrde kontakta, pokreće se automatski refund.
5. Sustav provjerava komunikacijske događaje (poziv, SMS, email) i bilježi pokušaje.
6. Refund vraća kredite ili kartičnu uplatu, a lead dobiva status REFUNDED (NO_RESPONSE).

**Očekivani rezultat:**
- Funkcionalnost "Refund ako klijent ne odgovori u roku" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Razlozi za refund (klijent ne odgovori, itd.)

**Opis:** Različiti razlozi za refund - klijent ne odgovori, automatska neaktivnost ili ručno zatraživanje.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Razlozi za refund (klijent ne odgovori, itd.)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Klijent ne odgovori na vaš kontakt u određenom roku
5. Automatski refund nakon određenog vremena
6. Lead se oslobađa i vraća na tržište

**Očekivani rezultat:**
- Funkcionalnost "Razlozi za refund (klijent ne odgovori, itd.)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Ručno zatraživanje refund-a

**Opis:** Zatražite refund za lead preko formulara s odabirom razloga i dodatnim napomenama.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Ručno zatraživanje refund-a"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. U detaljima leada kliknete "Zatraži refund", odaberete razlog i po želji dodate napomenu/dokaz.
5. Zahtjev se šalje podršci ili automatskom motoru koji donosi odluku.
6. Odluka i povrat prikazuju se u povijesti leadova/kredita.

**Očekivani rezultat:**
- Funkcionalnost "Ručno zatraživanje refund-a" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Povijest refund transakcija

**Opis:** Pregled svih povrata sredstava s detaljnim razlozima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Povijest refund transakcija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Datum i vrijeme refund-a
5. Iznos refund-a
6. Razlog refund-a

**Očekivani rezultat:**
- Funkcionalnost "Povijest refund transakcija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Status refund-a (REFUNDED)

**Opis:** Status REFUNDED označava da je refund uspješno procesuiran i da su sredstva vraćena.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Status refund-a (REFUNDED)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Refund je uspješno procesuiran
5. Sredstva su vraćena
6. Lead je oslobođen

**Očekivani rezultat:**
- Funkcionalnost "Status refund-a (REFUNDED)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Oslobađanje leada nakon refund-a (lead se vraća na tržište)

**Opis:** Nakon refund-a, lead se automatski oslobađa i vraća na tržište kako bi ga drugi pružatelji mogli kupiti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Oslobađanje leada nakon refund-a (lead se vraća na tržište)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon refund-a, lead se automatski oslobađa
5. Lead se vraća na tržište leadova
6. Drugi pružatelji mogu kupiti lead

**Očekivani rezultat:**
- Funkcionalnost "Oslobađanje leada nakon refund-a (lead se vraća na tržište)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Stripe refund ID tracking (stripeRefundId)

**Opis:** Praćenje Stripe refund ID-a za svaki refund - lako praćenje refund transakcija i podrška.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Stripe refund ID tracking (stripeRefundId)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Stripe refund ID za svaki refund
5. Povezivanje s refund transakcijom
6. Praćenje statusa refund-a u Stripe-u

**Očekivani rezultat:**
- Funkcionalnost "Stripe refund ID tracking (stripeRefundId)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 11: Fallback na interne kredite ako Stripe refund ne uspije

**Opis:** Ako Stripe refund ne uspije, sustav automatski vraća iznos kao interne kredite.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Fallback na interne kredite ako Stripe refund ne uspije"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon pokušaja kartičnog refunda provjerava se odgovor Stripe-a.
5. U slučaju greške (npr. bank/processor), refundService automatski vraća kredite na saldo.
6. Korisnik dobiva obavijest s objašnjenjem i može pratiti fallback u povijesti transakcija.

**Očekivani rezultat:**
- Funkcionalnost "Fallback na interne kredite ako Stripe refund ne uspije" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 12: Povrat novca za pretplate (refund subscription payment)

**Opis:** Mogućnost refund-a za pretplate - vraćanje novca za pretplatu ako je potrebno.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Povrat novca za pretplate (refund subscription payment)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Ako ste platili pretplatu a ne zadovoljni ste
5. Ako imate problem s pretplatom
6. Ako je došlo do greške

**Očekivani rezultat:**
- Funkcionalnost "Povrat novca za pretplate (refund subscription payment)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 13: Automatski refund nakon 48h neaktivnosti

**Opis:** Ako ne kontaktirate klijenta unutar 48 sati nakon kupovine leada, krediti vam se automatski vraćaju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatski refund nakon 48h neaktivnosti"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon kupnje leada starta countdown od 48 sati; ako status ostane ÔÇťAktivnoÔÇŁ, sustav automatski vraća kredite i lead vraća na tržište.
5. Direktor dobiva obavijest o auto-refundu, a lead se označava kao ÔÇťRefundiranÔÇŁ i ponovno ulazi u distributivni red.
6. Bilo koja interakcija (status ÔÇťKontaktiranoÔÇŁ ili bilješka) zaustavlja countdown i sprječava refund.

**Očekivani rezultat:**
- Funkcionalnost "Automatski refund nakon 48h neaktivnosti" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 12: Upravljanje Pretplatama

#### Test 1: Pregled trenutne pretplate

**Opis:** Pregledajte aktivni plan, stanje kredita i datume obnove na jednoj stranici.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pregled trenutne pretplate"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Stranica pretplate prikazuje plan (BASIC/PREMIUM/PRO), status, period, dostupne kredite i povijest.
5. Vizualni indikator upozorava kada se približava datum obnove ili nizak saldo.
6. Kartica nudi quick akcije (nadogradnja, otkazivanje, promjena metode plaćanja).

**Očekivani rezultat:**
- Funkcionalnost "Pregled trenutne pretplate" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Dostupni planovi (BASIC, PREMIUM, PRO)

**Opis:** Tri plana pretplate s različnim kreditima i funkcionalnostima ÔÇô odaberite onaj koji vam odgovara.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Dostupni planovi (BASIC, PREMIUM, PRO)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Plan kartice uspoređuju broj kredita, cijenu i uključene značajke (npr. AI filter, ROI dashboard, auto-buy).
5. Klikom na "Pretplati se" otvara se Stripe checkout s odabranim planom.
6. Plan se može kasnije nadograditi/downgradati prema potrebama.

**Očekivani rezultat:**
- Funkcionalnost "Dostupni planovi (BASIC, PREMIUM, PRO)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Nadogradnja pretplate

**Opis:** Nadogradite na viši plan u bilo kojem trenutku uz proporcionalnu naplatu (prorated billing). Sustav automatski izračunava preostale dane i naplaćuje samo razliku.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Nadogradnja pretplate"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Upgrade: Ako korisnik ima aktivnu plaćenu pretplatu i želi upgrade na viši plan, sustav izračunava:
5. - Preostale dane u trenutnom ciklusu
6. - Dnevnu cijenu trenutnog i novog plana

**Očekivani rezultat:**
- Funkcionalnost "Nadogradnja pretplate" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Otkazivanje pretplate

**Opis:** Otkažite plan u bilo kojem trenutku; koristite benefite do kraja razdoblja, a krediti ostaju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Otkazivanje pretplate"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. U postavkama kliknete "Otkaži pretplatu"; sustav postavlja cancel_at_period_end u Stripe-u.
5. Plan ostaje aktivan do isteka trenutnog ciklusa, potom prelazi u EXPIRED/BASIC.
6. Krediti zarađeni u ciklusu ostaju dostupni.

**Očekivani rezultat:**
- Funkcionalnost "Otkazivanje pretplate" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Status pretplate (ACTIVE, CANCELLED, EXPIRED)

**Opis:** Praćenje statusa vaše pretplate - vidite je li pretplata aktivna, otkazana ili istekla.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Status pretplate (ACTIVE, CANCELLED, EXPIRED)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. ACTIVE (Aktivna) - pretplata je aktivna i možete koristiti sve funkcionalnosti
5. CANCELLED (Otkazana) - pretplata je otkazana ali još vrijedi do kraja perioda
6. EXPIRED (Istekla) - pretplata je istekla i više ne možete koristiti funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Status pretplate (ACTIVE, CANCELLED, EXPIRED)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Automatsko isteka pretplate

**Opis:** Neuspjela naplata ili istekao ciklus automatski označava pretplatu kao EXPIRED i vraća korisnika na BASIC.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatsko isteka pretplate"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Stripe pokušava naplatu; nakon konačnog neuspjeha webhook šalje signal.
5. Sistem postavlja status EXPIRED, deaktivira premium značajke i, po potrebi, prebacuje na BASIC.
6. Korisnik zadržava postojeće kredite ali više ne prima nove.

**Očekivani rezultat:**
- Funkcionalnost "Automatsko isteka pretplate" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Notifikacije o isteku pretplate

**Opis:** Podsjetnici 7/3/1 dan prije isteka osiguravaju da ne propustite obnovu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Notifikacije o isteku pretplate"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Scheduler provjerava `currentPeriodEnd` i šalje notifikacije 7, 3 i 1 dan prije isteka.
5. Uključuje email, in-app i opcionalno SMS kanal s linkom za obnovu ili ažuriranje kartice.
6. Ako naplata padne, šalje se dodatna obavijest ÔÇťPayment failedÔÇŁ.

**Očekivani rezultat:**
- Funkcionalnost "Notifikacije o isteku pretplate" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Povijest pretplata

**Opis:** Pregledajte sve promjene planova, nadogradnje i otkazivanja kroz vrijeme.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Povijest pretplata"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Tablica povijesti prikazuje svaki plan, datum početka/završetka, razlog promjene i korištene kredite.
5. Filtri (plan, status, datum, akcija) pomažu analizirati kako se pretplata razvijala.
6. Automatsko logiranje svih promjena: CREATED, UPGRADED, DOWNGRADED, RENEWED, CANCELLED, EXPIRED, REACTIVATED, PRORATED.

**Očekivani rezultat:**
- Funkcionalnost "Povijest pretplata" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Trial period (7 dana)

**Opis:** Probno razdoblje od 7 dana - isprobajte platformu besplatno prije nego što kupite pretplatu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Trial period (7 dana)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Besplatno probno razdoblje od 7 dana
5. Besplatni krediti za kupovinu leadova
6. Pristup svim funkcionalnostima

**Očekivani rezultat:**
- Funkcionalnost "Trial period (7 dana)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Besplatni krediti za trial (5 leadova)

**Opis:** Dobivate besplatne kredite za kupovinu 5 leadova tijekom probnog razdoblja - dovoljno da isprobate funkcionalnosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Besplatni krediti za trial (5 leadova)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Dovoljno kredita za kupovinu 5 leadova
5. Možete isprobati kupovinu leadova
6. Možete testirati queue sustav

**Očekivani rezultat:**
- Funkcionalnost "Besplatni krediti za trial (5 leadova)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 11: Automatsko vraćanje na BASIC plan

**Opis:** Nakon isteka pretplate račun se automatski vraća na BASIC plan s osnovnim funkcionalnostima. Premium značajke se deaktiviraju, ali krediti i povijest leadova ostaju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatsko vraćanje na BASIC plan"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada status pretplate postane EXPIRED/CANCELLED, sustav aktivira BASIC plan.
5. Premium značajke se deaktiviraju, ali krediti i povijest leadova ostaju.
6. Korisnik može ponovno aktivirati viši plan u bilo kojem trenutku.

**Očekivani rezultat:**
- Funkcionalnost "Automatsko vraćanje na BASIC plan" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 13: Pravni Status i Verifikacija

#### Test 1: Različiti pravni statusi (Fizička osoba, Obrt, d.o.o., j.d.o.o., itd.)

**Opis:** Odaberite svoj pravni status pri registraciji - fizička osoba, obrt, d.o.o., j.d.o.o. ili drugi pravni oblik.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Različiti pravni statusi (Fizička osoba, Obrt, d.o.o., j.d.o.o., itd.)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Za privatne osobe koje nude usluge
5. Osnovni podaci - ime, prezime, OIB
6. Idealno za freelance radnike

**Očekivani rezultat:**
- Funkcionalnost "Različiti pravni statusi (Fizička osoba, Obrt, d.o.o., j.d.o.o., itd.)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: OIB validacija

**Opis:** Sustav provjerava format i postojanje OIB-a prije nego ga spremi u profil ili dokumentaciju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "OIB validacija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Klijent ili provider unosi OIB kroz formu; frontend radi osnovnu check-sum provjeru.
5. Backend dodatno validira kroz algoritam kontrole te opcionalno poziva vanjski registar (npr. FINA) za potvrdu.
6. Rezultat verifikacije sprema se u profil i podiže trust score / status verifikacije.

**Očekivani rezultat:**
- Funkcionalnost "OIB validacija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Naziv tvrtke/obrta

**Opis:** Provider dodaje službeni naziv tvrtke/obrta koji se prikazuje klijentima na profilu, ponudama i računima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Naziv tvrtke/obrta"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Tijekom onboardinga ili kasnije u postavkama unosite naziv tvrtke/obrta.
5. Naziv se prikazuje u karticama ponuda, chatu i dokumentima (fakture, ugovori).
6. Promjene prolaze kroz kratku validaciju kako bi se izbjegla zloupotreba brandova.

**Očekivani rezultat:**
- Funkcionalnost "Naziv tvrtke/obrta" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Auto-verifikacija naziva tvrtke (Sudski registar, Obrtni registar)

**Opis:** Platforma automatski provjerava naziv vaše tvrtke ili obrta u službenim registrima - potvrđuje legitimnost vaše tvrtke.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Auto-verifikacija naziva tvrtke (Sudski registar, Obrtni registar)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon unosa naziva i OIB-a pozivamo sudski/obrtni registar, uspoređujemo podatke i vraćamo status u realnom vremenu.
5. Uspješno podudaranje odmah dodaje badge i povećava povjerenje; neslaganja vraćaju upozorenje da ispravite podatke.
6. Bez ručne papirologije dokazujete legitimnost tvrtke i štitite marketplace od lažnih profila.

**Očekivani rezultat:**
- Funkcionalnost "Auto-verifikacija naziva tvrtke (Sudski registar, Obrtni registar)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Porezni broj

**Opis:** Pružatelj unosi porezni broj radi ispravnog fakturiranja i porezne usklađenosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Porezni broj"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pri registraciji ili u postavkama provider upisuje porezni broj (npr. PDV ID, VAT broj).
5. Sustav provodi osnovnu validaciju formata i čuva podatak šifriran.
6. Porezni broj koristi se u fakturama, ponudama i ugovorima.

**Očekivani rezultat:**
- Funkcionalnost "Porezni broj" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Email verifikacija

**Opis:** Potvrdite svoju email adresu klikom na link koji primite u email poruci.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Email verifikacija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon registracije platforma šalje email s jednokratnim linkom koji vrijedi 24 sata.
5. Klikom na link adresa se potvrđuje, korisnik se preusmjerava na prijavu i aktiviraju se sve funkcionalnosti.
6. Ako poruka ne stigne, korisnik može zatražiti novo slanje ÔÇô stari link postaje nevažeći.

**Očekivani rezultat:**
- Funkcionalnost "Email verifikacija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: SMS verifikacija telefonskog broja (Twilio)

**Opis:** Verifikacija vašeg telefonskog broja putem SMS poruke - potvrda da telefon stvarno pripada vama.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "SMS verifikacija telefonskog broja (Twilio)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Unesete svoj telefonski broj
5. Sustav šalje SMS poruku s verifikacijskim kodom
6. Unesete kod koji ste primili

**Očekivani rezultat:**
- Funkcionalnost "SMS verifikacija telefonskog broja (Twilio)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: DNS TXT record verifikacija domena

**Opis:** Vlasništvo nad domenom potvrđuje se dodavanjem DNS TXT zapisa koji platforma provjerava.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "DNS TXT record verifikacija domena"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Sustav generira jedinstveni TXT token i prikazuje u profilu.
5. Korisnik ga dodaje u DNS postavke svoje domene; periodični job provjerava DNS i potvrđuje vlasništvo.
6. Nakon potvrde, profil dobiva DNS badge i veći trust score.

**Očekivani rezultat:**
- Funkcionalnost "DNS TXT record verifikacija domena" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Email verifikacija na domeni tvrtke

**Opis:** Email adrese na vlastitoj domeni potvrđuju se verifikacijskim linkom kako bi se dokazalo vlasništvo. Sustav automatski šalje verifikacijski email s linkom koji vrijedi 24 sata.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Email verifikacija na domeni tvrtke"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik unosi email na poslovnoj domeni preko `POST /api/kyc/verify-identity` endpointa (type: 'email').
5. Sustav provjerava da li se domena email adrese podudara s domenom korisnika.
6. Generira se verifikacijski token (32-byte hex, unique) koji vrijedi 24 sata.

**Očekivani rezultat:**
- Funkcionalnost "Email verifikacija na domeni tvrtke" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Identity Badge sustav (Email, Phone, DNS, Business značke)

**Opis:** Verifikacije identiteta prikazuju se kroz skup znački (Email, Phone, DNS, Business) na profilu providera.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Identity Badge sustav (Email, Phone, DNS, Business značke)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaka uspješno dovršena verifikacija automatski dodjeljuje odgovarajuću badge oznaku.
5. Badge prikazuje datum verifikacije i stanje (aktivno, isteka, u reviziji).
6. Sustav kombinira badgeve u Trust score komponentu vidljivu klijentima.

**Očekivani rezultat:**
- Funkcionalnost "Identity Badge sustav (Email, Phone, DNS, Business značke)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 11: Datum verifikacije za svaku značku

**Opis:** Svaki badge prikazuje datum/verziju verifikacije kako bi kupci vidjeli svježinu potvrde.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Datum verifikacije za svaku značku"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada je verifikacija uspješna, sustav spremi `issuedAt` i prikazuje ga uz badge.
5. Ako badge zahtijeva obnovu, pojavljuje se i `expiresAt` ili datum posljednje revizije.
6. UI formatira datume u lokalni oblik (dd.MM.yyyy) radi jasnoće.

**Očekivani rezultat:**
- Funkcionalnost "Datum verifikacije za svaku značku" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 12: Prikaz znački na profilu pružatelja

**Opis:** Sve relevantne verifikacijske značke renderiraju se na javnom profilu i listing karticama providera.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Prikaz znački na profilu pružatelja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Komponenta profila dohvaća badgeve i prikazuje ikonice/titl uz osnovne informacije.
5. Listing kartice (directory/search) renderiraju sažetu verziju badgeva radi brze usporedbe.
6. Responsive layout osigurava uredan prikaz na mobilnim uređajima.

**Očekivani rezultat:**
- Funkcionalnost "Prikaz znački na profilu pružatelja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 13: Dokumenti za verifikaciju

**Opis:** Platforma omogućuje upload i moderaciju dokumenata potrebnih za regulatorne verifikacije.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Dokumenti za verifikaciju"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik odabire tip dokumenta (osobna, izvadak iz registra, licenca) i učitava PDF/scan.
5. Dokument prolazi antivirus/quality check te je vidljiv samo ovlaštenim administratorima.
6. Nakon reviewa dokument se odobrava/odbijđ░ uz feedback korisniku.

**Očekivani rezultat:**
- Funkcionalnost "Dokumenti za verifikaciju" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 14: Identity Badge Sustav i Verifikacije

#### Test 1: Email Identity Badge (značka)

**Opis:** Badge potvrđuje da je primarni email-verifikacijski proces završen i javno označava pouzdan kontakt.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Email Identity Badge (značka)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon uspješne email verifikacije (link token), sustav emitira event `email.verified`.
5. Badge se automatski dodaje profilu i prikazuje u listama i profilu.
6. Ako korisnik promijeni primarni email, badge ulazi u pending dok nova adresa ne bude potvrđena.

**Očekivani rezultat:**
- Funkcionalnost "Email Identity Badge (značka)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Phone Identity Badge (SMS verifikacija)

**Opis:** Badge signalizira da je telefonski broj prošao OTP potvrdu i može se koristiti za lead komunikaciju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Phone Identity Badge (SMS verifikacija)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon validacije OTP-a, sustav podiže event `phone.verified` i badge se aktivira.
5. Promjena broja automatski deaktivira badge do nove verifikacije.
6. Status badgea prikazuje se klijentima kako bi znali da je broj provjeren.

**Očekivani rezultat:**
- Funkcionalnost "Phone Identity Badge (SMS verifikacija)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: DNS Identity Badge (TXT record)

**Opis:** Badge potvrđuje vlasništvo nad domenom nakon uspješne DNS TXT verifikacije.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "DNS Identity Badge (TXT record)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Provider preuzima jedinstveni TXT token i dodaje ga u DNS konfiguraciju svoje domene.
5. Periodični check (ili ručno pokretanje) validira prisutnost zapisa; uspješna provjera aktivira badge.
6. Promjena domene automatski deaktivira badge dok se novi token ne potvrdi.

**Očekivani rezultat:**
- Funkcionalnost "DNS Identity Badge (TXT record)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Business Badge (tvrtka/obrt verifikacija)

**Opis:** Badge potvrđuje da je tvrtka/obrt verificiran kroz službene registre (Sudski/Obrtni).

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Business Badge (tvrtka/obrt verifikacija)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Provider unosi poslovne podatke; sustav ih validira kroz API/scrape službenih registara.
5. Po uspješnoj provjeri badge se dodaje i vidljiv je klijentima s datumom verifikacije.
6. Redoviti job provjerava je li tvrtka i dalje aktivna; u suprotnom badge prelazi u pending/expired.

**Očekivani rezultat:**
- Funkcionalnost "Business Badge (tvrtka/obrt verifikacija)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Prikaz datuma verifikacije

**Opis:** Sve badge oznake prikazuju datum izdavanja/obnove kako bi status bio transparentan.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Prikaz datuma verifikacije"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada se badge dodijeli ili obnovi, sustav pohranjuje `issuedAt` i opcionalni `expiresAt`.
5. UI formatira datume (dd.MM.yyyy) i prikazuje ih uz naziv badgea.
6. Ističe se i badge kojem se bliži istec╠üi kako bi korisnik znao da treba obnovu.

**Očekivani rezultat:**
- Funkcionalnost "Prikaz datuma verifikacije" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Status verifikacije na profilu

**Opis:** Profil prikazuje agregirani status (broj i postotak dovršenih verifikacija).

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Status verifikacije na profilu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Backend prebrojava verificirane badgeve i izračunava postotak dovršenosti.
5. UI prikazuje indikator (npr. 3/4, 75%) i označava koje značke nedostaju.
6. Status se sinkronizira u stvarnom vremenu nakon svake nove verifikacije.

**Očekivani rezultat:**
- Funkcionalnost "Status verifikacije na profilu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Identity Badge Verifikacija komponenta

**Opis:** Centralizirana komponenta vodi korisnika kroz sve verifikacije (email, telefon, domen, tvrtka).

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Identity Badge Verifikacija komponenta"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Unutar settings/onboarding sekcije korisnik vidi kartice za svaku verifikaciju.
5. Svaka kartica sadrži CTA, status, očekivano trajanje i link na detaljne upute.
6. Komponenta reagira na real-time evente (websocket/sse) i ažurira status bez reloada.

**Očekivani rezultat:**
- Funkcionalnost "Identity Badge Verifikacija komponenta" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Rate limiting za SMS verifikaciju

**Opis:** Ograničavamo broj SMS verifikacija po korisniku kako bismo spriječili zloupotrebu i troškove.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Rate limiting za SMS verifikaciju"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Na korisnika primjenjujemo limit (npr. 3 koda na sat, 10 dnevno) i pratimo pokušaje u Redis cacheu.
5. Ako je limit dosegnut, prikazujemo vrijeme resetiranja i alternative (email verifikacija, podrška).
6. Limiti se resetiraju cron jobom ili TTL-om u cacheu.

**Očekivani rezultat:**
- Funkcionalnost "Rate limiting za SMS verifikaciju" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Verifikacijski kod expiration (10 minuta)

**Opis:** SMS OTP kod vrijedi 10 minuta, nakon čega korisnik mora zatražiti novi radi sigurnosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Verifikacijski kod expiration (10 minuta)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kod se generira s timestampom i pohranjuje s TTL=10 minuta.
5. UI prikazuje odbrojavanje i onemogućuje unos nakon isteka.
6. Nakon isteka korisnik može zatražiti novi kod unutar rate limit pravila.

**Očekivani rezultat:**
- Funkcionalnost "Verifikacijski kod expiration (10 minuta)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 15: Reputacijski Sustav

#### Test 1: Prosječno vrijeme odgovora (avgResponseTimeMinutes)

**Opis:** Automatsko praćenje koliko brzo odgovarate na leadove - bitno za vašu reputaciju i prioritet u distribuciji leadova.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Prosječno vrijeme odgovora (avgResponseTimeMinutes)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kad lead stigne, sustav mjeri koliko brzo odgovorite (INTERESTED / NOT_INTERESTED).
5. Ako nema odgovora unutar 24 sata, zapisuje se maksimalno vrijeme i lead prelazi na sljedećeg.
6. Zbrajaju se sva vremena odgovora i dijele s brojem obrađenih leadova.

**Očekivani rezultat:**
- Funkcionalnost "Prosječno vrijeme odgovora (avgResponseTimeMinutes)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Stopa konverzije leadova (conversionRate)

**Opis:** Automatski izračun postotka kupljenih leadova koji su završili kao ostvareni poslovi.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Stopa konverzije leadova (conversionRate)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Konverzija = broj leadova sa statusom CONVERTED podijeljen s ukupno kupljenim leadovima u periodu.
5. KPI karta i graf prikazuju trend te usporedbu s ciljem.
6. Utječe na reputaciju i prioritet distribucije leadova.

**Očekivani rezultat:**
- Funkcionalnost "Stopa konverzije leadova (conversionRate)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Praćenje vremena odgovora na leadove

**Opis:** Bilježimo vrijeme između primitka leada i odgovora providera radi optimizacije queue sustava.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Praćenje vremena odgovora na leadove"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaki lead event (assign, respond, expire) zapisuje se s timestampom.
5. Izračun po leadu pohranjuje se i ulazi u prosjeke, reputaciju i SLA izvještaje.
6. Dashboard prikazuje distribuciju vremena i identifikaciju outliera.

**Očekivani rezultat:**
- Funkcionalnost "Praćenje vremena odgovora na leadove" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Automatsko izračunavanje reputacije

**Opis:** Reputacijski score se automatski ažurira na temelju ključnih performansi providera.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatsko izračunavanje reputacije"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Algoritam kombinira vrijeme odgovora, stopu konverzije, recenzije, povijest disputea i aktivnost.
5. Svaki signal ima ponder; rezultat se normalizira na skalu 0-100.
6. Reputacija se recalculira nakon relevantnog događaja ili batch jobom.

**Očekivani rezultat:**
- Funkcionalnost "Automatsko izračunavanje reputacije" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Prikaz reputacije na profilu

**Opis:** Korisnici na profilu providera vide reputacijski score, rang i zvjezdice prije odabira usluge.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Prikaz reputacije na profilu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Na javnom profilu prikazuju se numerički score, badge (npr. Gold, Silver) i vizual (zvjezdice/trodimenzionalni indikator).
5. Reputacija se prikazuje i u listama rezultata, karticama leadova i ponuda.
6. Hover/tooltip objašnjava glavne faktore koji doprinose rezultatu.

**Očekivani rezultat:**
- Funkcionalnost "Prikaz reputacije na profilu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Integracija s lead matching algoritmom

**Opis:** Reputacija, konverzije i SLA integrirani su u algoritam koji određuje prioritet dodjele leadova.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Integracija s lead matching algoritmom"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Matching engine prikuplja signale (reputacija, trust score, lokacija, dostupnost) i izračunava ranking kandidata.
5. Lead se nudi providerima prema rankingu, uz transparentan queue koji pokazuje poredak.
6. Algoritam se prilagođava segmentu (hitni, premium leadovi) i planu pretplate.

**Očekivani rezultat:**
- Funkcionalnost "Integracija s lead matching algoritmom" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 16: Korisnici Usluge (Service Users)

#### Test 1: Registracija kao korisnik usluge

**Opis:** Korisnik usluge otvara račun kako bi objavljivao poslove i upravljao ponudama.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Registracija kao korisnik usluge"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Registracijski wizard traži osnovne podatke (ime, email, lozinka) i potvrdu emaila.
5. Nakon aktivacije, korisnik dobiva pristup dashboardu s vodičem za objavu prvog posla.
6. Dodatne informacije (telefon, adresa) mogu se dodati kasnije radi verifikacije.

**Očekivani rezultat:**
- Funkcionalnost "Registracija kao korisnik usluge" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Odabir tipa korisnika (Korisnik usluge / Pružatelj usluge)

**Opis:** Tijekom registracije odaberite jesmo li korisnik usluge (tražite usluge) ili pružatelj usluga (nudite usluge).

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Odabir tipa korisnika (Korisnik usluge / Pružatelj usluge)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik usluge - tražite usluge, objavljujete poslove, primate ponude
5. Pružatelj usluga - nudite usluge, šaljete ponude, primate leadove
6. Možete imati obje uloge - odaberite obje opcije

**Očekivani rezultat:**
- Funkcionalnost "Odabir tipa korisnika (Korisnik usluge / Pružatelj usluge)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Fizička osoba vs Pravna osoba za korisnike

**Opis:** Korisnici označavaju jesu li fizička ili pravna osoba kako bi dobili prilagođene opcije i dokumentaciju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Fizička osoba vs Pravna osoba za korisnike"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Tijekom registracije ili u profilu korisnik bira tip (fizička/pravno lice) te ispunjava relevantne podatke.
5. Pravne osobe unose dodatne podatke za fakturiranje (tvrtka, OIB, adresa, kontakt osoba).
6. Sustav koristi tip za prilagođavanje pravila, ugovora i faktura.

**Očekivani rezultat:**
- Funkcionalnost "Fizička osoba vs Pravna osoba za korisnike" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Profil korisnika usluge (UserProfile)

**Opis:** Vaš osobni profil kao korisnik usluge - upravljajte svojim podacima, postavkama i pregledom aktivnosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Profil korisnika usluge (UserProfile)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Osobni podaci - ime, prezime, email, telefon
5. Lokacija - grad, adresa gdje tražite usluge
6. Postavke - preferencije i postavke profila

**Očekivani rezultat:**
- Funkcionalnost "Profil korisnika usluge (UserProfile)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Objavljivanje poslova od strane korisnika

**Opis:** Korisnik objavljuje posao s opisom, lokacijom i budžetom te automatski informira relevantne pružatelje.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Objavljivanje poslova od strane korisnika"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Formular vodi kroz unos naslova, opisa, kategorije, lokacije, budžeta, roka i priloga.
5. Nakon pohrane posao dobiva status OPEN i prikazuje se providerima koji zadovoljavaju kriterije.
6. Korisnik može kasnije urediti detalje ili promijeniti status (U TIJEKU, ZAVRŠEN, OTKAZAN).

**Očekivani rezultat:**
- Funkcionalnost "Objavljivanje poslova od strane korisnika" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Pregled vlastitih poslova (MyJobs)

**Opis:** Jednostavno pregledajte sve svoje objavljene poslove na jednom mjestu - praćenje statusa i upravljanje poslovima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pregled vlastitih poslova (MyJobs)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svi vaši objavljeni poslovi
5. Status svakog posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN)
6. Broj primljenih ponuda za svaki posao

**Očekivani rezultat:**
- Funkcionalnost "Pregled vlastitih poslova (MyJobs)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Primanje ponuda za poslove

**Opis:** Korisnik prima ponude s cijenom, porukom i procijenjenim rokom od relevantnih pružatelja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Primanje ponuda za poslove"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada provider pošalje ponudu, klijent dobiva notifikaciju i badge u MyJobs.
5. Ponuda prikazuje iznos, opis, procijenjeni rok, profil providera i njegove recenzije.
6. Klijent može odgovoriti u chatu, postaviti pitanja, odbiti ili prihvatiti ponudu.

**Očekivani rezultat:**
- Funkcionalnost "Primanje ponuda za poslove" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Prihvaćanje ponuda

**Opis:** Klijent odabire ponudu, posao prelazi u status U TIJEKU, a chat i zadaci se aktiviraju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Prihvaćanje ponuda"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Klikom na "Prihvati" sustav potvrđuje dostupnost ponude i zaključava druge ponude.
5. Posao prelazi u status IN_PROGRESS, generira se ugovor/task lista i otvara escrow (ako postoji).
6. Provider i klijent dobivaju notifikacije te mogu nastaviti komunikaciju u dedikiranom kanalu.

**Očekivani rezultat:**
- Funkcionalnost "Prihvaćanje ponuda" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Navigacija specifična za korisnike usluge

**Opis:** UI prikazuje samo stavke relevantne korisnicima usluge (objava posla, ponude, chat, profil).

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Navigacija specifična za korisnike usluge"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon logina s CLIENT rolom generira se konfiguracija menija prilagođena toj ulozi.
5. Linkovi prema provider funkcijama (leadovi, pretplate, ROI) skrivaju se dok korisnik ne doda drugu ulogu.
6. Navigacija se dinamički osvježava kad se promijeni rola ili aktiviraju novi feature flagovi.

**Očekivani rezultat:**
- Funkcionalnost "Navigacija specifična za korisnike usluge" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Sakrivanje provider-specifičnih linkova za korisnike

**Opis:** Klijentska navigacija skriva provider funkcionalnosti (leadovi, ROI dashboard, pretplate).

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Sakrivanje provider-specifičnih linkova za korisnike"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Role guard provjerava korisnikove uloge i uklanja stavke koje pripadaju provider iskustvu.
5. UI i API sloj provode autorizaciju kako linkovi ne bi bili dostupni ni direktnim URL-om.
6. Kada korisnik dobije i provider rolu, meni se proširuje uz onboardingske upute.

**Očekivani rezultat:**
- Funkcionalnost "Sakrivanje provider-specifičnih linkova za korisnike" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 17: Plaćanja i Stripe Integracija

#### Test 1: Stripe Checkout integracija

**Opis:** Pretplate naplaćujemo kroz Stripe Checkout za siguran i jednostavan korisnički tok.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Stripe Checkout integracija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik odabire plan, a backend kreira Stripe Checkout session.
5. Redirect vodi na Stripe hosted stranicu gdje se unose podaci o plaćanju.
6. Nakon uspješnog plaćanja korisnik se vraća na platformu i pretplata se aktivira.

**Očekivani rezultat:**
- Funkcionalnost "Stripe Checkout integracija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Plaćanje pretplata preko Stripe

**Opis:** Mjesečne pretplate naplaćujemo preko Stripe Billinga s automatskim obnavljanjem i naplatom kartice.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Plaćanje pretplata preko Stripe"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon Checkouta kreira se Stripe subscription s odabranim planom.
5. Stripe automatski naplaćuje karticu na renewal datum i obavještava naš backend webhook.
6. Krediti/benefiti se dodaju korisniku nakon uspješne naplate.

**Očekivani rezultat:**
- Funkcionalnost "Plaćanje pretplata preko Stripe" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Stripe Payment Intent za kupovinu leadova

**Opis:** Jednokratnu kupovinu leada omogućavamo Stripe Payment Intentom kada nema dovoljno internih kredita.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Stripe Payment Intent za kupovinu leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pri pokušaju kupnje provjeravamo saldo kredita; ako je nedovoljan kreiramo Payment Intent s točnim iznosom leada.
5. Korisnik unosi kartične podatke, plaćanje se potvrđuje i lead se označava kupljenim.
6. Uspješna uplata dodaje transakciju tipa CARD_PURCHASE i osvježava saldo.

**Očekivani rezultat:**
- Funkcionalnost "Stripe Payment Intent za kupovinu leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Kreiranje Payment Intent-a za pojedinačnu kupovinu leada

**Opis:** Za svaki lead bez pokrivenja kreditima kreiramo zaseban Payment Intent s dinamičkom cijenom.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kreiranje Payment Intent-a za pojedinačnu kupovinu leada"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Backend izračuna točan iznos prema lead cjeniku i kreira Payment Intent u Stripeu.
5. Metadata uključuje leadId i buyerId radi kasnijeg reconcilea.
6. Nakon potvrde uplate lead se automatski označava kao kupljen i postavlja dostupnost u marketplaceu.

**Očekivani rezultat:**
- Funkcionalnost "Kreiranje Payment Intent-a za pojedinačnu kupovinu leada" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Plaćanje leadova kroz Stripe (opcionalno, umjesto internih kredita)

**Opis:** Umjesto korištenja internih kredita, možete direktno platiti lead karticom preko Stripe-a - fleksibilno plaćanje.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Plaćanje leadova kroz Stripe (opcionalno, umjesto internih kredita)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Koristite kredite koje imate na računu
5. Brzo i jednostavno plaćanje
6. Nema potrebe za unosom kartice

**Očekivani rezultat:**
- Funkcionalnost "Plaćanje leadova kroz Stripe (opcionalno, umjesto internih kredita)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Stripe webhook handling

**Opis:** Stripe webhookovi održavaju pretplate i plaćanja usklađenima u realnom vremenu bez ručnih intervencija.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Stripe webhook handling"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Stripe šalje webhook za ključne evente (checkout.session.completed, invoice.payment_succeeded/failed...).
5. Backend validira potpis, učitava payload i ažurira pretplate, kredite i status plaćanja.
6. Idempotency ključ osigurava da ponovljeni webhook ne duplira radnje.

**Očekivani rezultat:**
- Funkcionalnost "Stripe webhook handling" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Automatsko ažuriranje pretplate nakon plaćanja

**Opis:** Potvrda Stripe plaćanja automatski aktivira pretplatu i dodaje kredite bez čekanja admina.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatsko ažuriranje pretplate nakon plaćanja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon uspješnog Checkouta ili invoice plaćanja, webhook pokreće aktivaciju pretplate.
5. Sustav postavlja status na ACTIVE, izračunava period i alocira kredite.
6. Korisnik dobiva potvrdu i odmah vidi novo stanje.

**Očekivani rezultat:**
- Funkcionalnost "Automatsko ažuriranje pretplate nakon plaćanja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Payment success/failure handling

**Opis:** Sustav razlikuje uspješne i neuspjele naplate, automatski aktivira pretplatu ili šalje upozorenje korisniku.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Payment success/failure handling"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Stripe webhook signalizira `invoice.payment_succeeded` ili `invoice.payment_failed`.
5. Uspjeh aktivira pretplatu, dodaje kredite i šalje potvrdu.
6. Neuspjeh postavlja status na PAST_DUE/EXPIRED, šalje email i nudi promjenu kartice.

**Očekivani rezultat:**
- Funkcionalnost "Payment success/failure handling" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Povrat na platformu nakon plaćanja

**Opis:** Nakon Stripe Checkouta korisnik se vraća na potvrđenu stranicu s jasnim statusom pretplate i kredita.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Povrat na platformu nakon plaćanja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Checkout session ima definirane success/cancel URL-ove prema našoj aplikaciji.
5. Nakon plaćanja Stripe redirecta korisnika na success stranicu s query parametrima.
6. Frontend dohvaća svježe podatke i prikazuje potvrdu.

**Očekivani rezultat:**
- Funkcionalnost "Povrat na platformu nakon plaćanja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Sigurnosno skladištenje Stripe secret key u AWS Secrets Manager

**Opis:** Sigurno čuvanje vaših podataka o plaćanju - svi podaci o kartici se čuvaju sigurno u AWS Secrets Manager, ne na platformi.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Sigurnosno skladištenje Stripe secret key u AWS Secrets Manager"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Podaci o kartici se ne čuvaju na platformi
5. Stripe obrađuje sve podatke o kartici
6. Sigurnosni ključevi su u AWS Secrets Manager

**Očekivani rezultat:**
- Funkcionalnost "Sigurnosno skladištenje Stripe secret key u AWS Secrets Manager" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 11: Fakturiranje (PDF fakture za pretplate i kupovine)

**Opis:** Automatski generirane PDF fakture za sve vaše pretplate i kupovine - profesionalne fakture za računovodstvo. PDF fakture se automatski spremaju u AWS S3 za trajno čuvanje.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Fakturiranje (PDF fakture za pretplate i kupovine)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Automatski prilikom aktivacije pretplate
5. Automatski prilikom kupovine leadova (ako platite karticom)
6. Možete preuzeti fakturu bilo kada

**Očekivani rezultat:**
- Funkcionalnost "Fakturiranje (PDF fakture za pretplate i kupovine)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 12: Povrat novca za pretplate (refund subscription payment)

**Opis:** Mogućnost refund-a za pretplate - vraćanje novca za pretplatu ako je potrebno.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Povrat novca za pretplate (refund subscription payment)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Ako ste platili pretplatu a ne zadovoljni ste
5. Ako imate problem s pretplatom
6. Ako je došlo do greške

**Očekivani rezultat:**
- Funkcionalnost "Povrat novca za pretplate (refund subscription payment)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 18: Upravljanje Licencama

#### Test 1: Upload dokumenata licenci

**Opis:** Prenesite dokumente licenci kako bi admini mogli verificirati profil.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Upload dokumenata licenci"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pružatelj odabire tip licence, unosi broj, datum i tijelo izdavanja te uploada dokument (PDF/JPG/PNG).
5. Sustav validira format/veličinu, maskira osjetljive podatke i šalje adminu na verifikaciju.
6. Nakon odobrenja licenca se prikazuje na profilu s badgeom.

**Očekivani rezultat:**
- Funkcionalnost "Upload dokumenata licenci" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Praćenje isteka licenci

**Opis:** Automatske obavijesti podsjećaju vas na obnovu licence prije isteka.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Praćenje isteka licenci"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Sustav prati `expiresAt` na licenci i šalje podsjetnike 30/14/7/1 dan prije isteka.
5. Nakon isteka licenca prelazi u status EXPIRED i badge se uklanja dok se ne obnovi.
6. Moguće je unijeti novu licencu ili ažurirati datum.

**Očekivani rezultat:**
- Funkcionalnost "Praćenje isteka licenci" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Različiti tipovi licenci po kategorijama

**Opis:** Svaka kategorija može zahtijevati specifične licence (elektrotehnička, građevinska, itd.).

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Različiti tipovi licenci po kategorijama"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaka kategorija definira obavezne/dopunske licence (npr. Elektrotehnička za električare).
5. Pružatelj odabire licencu i povezuje je s kategorijama kojima zadovoljava uvjet.
6. Marketplace filter može prikazivati samo licencirane pružatelje po kategoriji.

**Očekivani rezultat:**
- Funkcionalnost "Različiti tipovi licenci po kategorijama" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Tijela koja izdaju licence

**Opis:** Navedite tijelo koje je izdalo vašu licencu - npr. Ministarstvo graditeljstva, Hrvatska komora inženjera, itd.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Tijela koja izdaju licence"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Ministarstvo graditeljstva i prostornog uređenja
5. Hrvatska komora inženjera
6. Hrvatski zavod za norme

**Očekivani rezultat:**
- Funkcionalnost "Tijela koja izdaju licence" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Broj licence i datum izdavanja

**Opis:** Unesite broj i datum izdavanja licence kako bi admini mogli verificirati podatke i prikazati ih klijentima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Broj licence i datum izdavanja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pri unosu licence korisnik upisuje broj i datum izdavanja iz službenog dokumenta.
5. Podaci se prikazuju na profilu i koriste u admin verifikaciji.
6. Ažuriranje je dostupno kada se licenca obnovi.

**Očekivani rezultat:**
- Funkcionalnost "Broj licence i datum izdavanja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Notifikacije o isteku licenci

**Opis:** Sustav šalje više niveliranih podsjetnika (30/14/7/1 dan) prije isteka licence radi pravovremene obnove.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Notifikacije o isteku licenci"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Scheduler svakodnevno provjerava datume isteka licenci i generira podsjetnike.
5. Notifikacije se šalju kroz preferirane kanale (in-app/email/SMS).
6. Ako licenca istekne, status se automatski mijenja i badge pada dok se ne obnovi.

**Očekivani rezultat:**
- Funkcionalnost "Notifikacije o isteku licenci" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Automatska provjera valjanosti licenci

**Opis:** Sustav automatski provjerava valjanost vaših licenci - proverava datume isteka i status licenci.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatska provjera valjanosti licenci"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Sustav automatski provjerava datume isteka licenci
5. Provjerava se status licence (akt├şvna, istekla, itd.)
6. Provjeravaju se podaci o licenci

**Očekivani rezultat:**
- Funkcionalnost "Automatska provjera valjanosti licenci" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Skener dokumenata za licence

**Opis:** OCR skener čita podatke s licenci i automatski popunjava formu za brže dodavanje dokumenata.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Skener dokumenata za licence"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Provider učitava fotografiju ili PDF licence putem web ili mobilne aplikacije.
5. OCR modul prepoznaje ključne podatke (broj, izdavatelj, datum) i predlaže ih u formi.
6. Korisnik potvrđuje ili ispravlja podatke prije spremanja.

**Očekivani rezultat:**
- Funkcionalnost "Skener dokumenata za licence" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 19: Verifikacija Klijenata i Trust Score

#### Test 1: Trust score sustav (0-100)

**Opis:** Sustav ocjene pouzdanosti korisnika (0-100) koji određuje kvalitetu leadova i povjerenje u korisnika.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Trust score sustav (0-100)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik starta s 0 bodova; svaka verifikacija (e-mail, telefon, OIB, tvrtka, domena) dodaje određeni broj bodova do maksimuma 100.
5. Rasponi (0-30, 31-60, 61-80, 81-100) jasno označavaju razinu pouzdanosti.
6. Trust score je vidljiv pružateljima prije prihvata leada, utječe na prioritet distribucije i ulazi u AI ocjene kvalitete.

**Očekivani rezultat:**
- Funkcionalnost "Trust score sustav (0-100)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Verificiranje telefona

**Opis:** Klijent potvrđuje telefon SMS kodom i time povećava trust score.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Verificiranje telefona"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Klijent upisuje broj u profilu; sustav šalje OTP kod (npr. 6 znamenki).
5. Klijent unosi kod i broj dobiva status VERIFIED.
6. Trust score i lead badge reflektiraju verifikaciju.

**Očekivani rezultat:**
- Funkcionalnost "Verificiranje telefona" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Verificiranje emaila

**Opis:** Klijent potvrđuje email klikom na verifikacijski link i time povećava trust score.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Verificiranje emaila"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon unosa emaila sustav šalje verifikacijski link.
5. Klik potvrđuje email i povećava trust score.
6. Status se prikazuje u profilu i lead karticama.

**Očekivani rezultat:**
- Funkcionalnost "Verificiranje emaila" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Verificiranje OIB-a

**Opis:** Klijenti potvrđuju OIB kroz provjeru s državnim registrom, čime se povećava trust score.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Verificiranje OIB-a"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Klijent unosi OIB; servis provjerava broj u vanjskoj bazi (npr. Fina).
5. Uspješan rezultat označava OIB kao verified i podiže trust score.
6. OIB verifikacija čuva se u profilu i lead karticama.

**Očekivani rezultat:**
- Funkcionalnost "Verificiranje OIB-a" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Verificiranje firme (sudski registar)

**Opis:** Automatska verifikacija vaše tvrtke u sudskom registru - provjera da je tvrtka registrirana i da su podaci ispravni.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Verificiranje firme (sudski registar)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Unesete naziv tvrtke i OIB
5. Sustav automatski provjerava u sudskom registru
6. Provjerava se registracija tvrtke

**Očekivani rezultat:**
- Funkcionalnost "Verificiranje firme (sudski registar)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Kvaliteta leadova na osnovu verifikacije

**Opis:** AI model ponderira trust score i verifikacije klijenta za procjenu kvalitete leada.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kvaliteta leadova na osnovu verifikacije"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. AI engine prikuplja signale (verifikacije, historiju, engagement) i računa quality score.
5. Viši score povisuje cijenu leada i ističe ga u marketplaceu.
6. Provider može filtrirati i sortirati leadove po kvaliteti.

**Očekivani rezultat:**
- Funkcionalnost "Kvaliteta leadova na osnovu verifikacije" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Automatska verifikacija

**Opis:** Sustav automatski provjerava ključne podatke (email, telefon, OIB, tvrtka) putem vanjskih servisa i pravila.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatska verifikacija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon unosa podataka pokreću se automatizirani checkovi (format, checksum, vanjski registri).
5. Rezultat (VERIFIED, REJECTED, MANUAL_REVIEW) ažurira profil i trust score.
6. Neuspješni pokušaji generiraju zadatak za ručnu provjeru ili traže dodatni dokument.

**Očekivani rezultat:**
- Funkcionalnost "Automatska verifikacija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Dokument upload za verifikaciju

**Opis:** Korisnici mogu sigurno učitati identifikacijske i poslovne dokumente potrebne za verifikaciju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Dokument upload za verifikaciju"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Wizard traži vrstu dokumenta (osobni identifikacijski, registracija tvrtke, potvrda OIB-a...).
5. Dokument (PDF/PNG/JPG) se učitava, validira format i šalje na siguran storage.
6. Admin dobiva zadatak za pregled ili se pokreće automatizirana provjera.

**Očekivani rezultat:**
- Funkcionalnost "Dokument upload za verifikaciju" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Notifikacije o verifikaciji

**Opis:** Automatske obavijesti informiraju korisnike o statusu verifikacije i potrebnim akcijama.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Notifikacije o verifikaciji"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kad se promijeni status verifikacije (initiated, pending docs, approved, rejected) kreira se notifikacija.
5. Korisnik dobiva in-app i/ili email s razlogom i sljedećim koracima.
6. Sustav nudi direktne linkove za upload dodatnih dokumenata ili kontakt podrške.

**Očekivani rezultat:**
- Funkcionalnost "Notifikacije o verifikaciji" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 20: ROI Analitika i Statistike

#### Test 1: ROI dashboard za providere

**Opis:** ROI dashboard centralizira ključne metrike (prihod, ROI, konverzija, troškovi, reputacija) za providere.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "ROI dashboard za providere"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Dashboard povlači agregirane podatke o leadovima, prihodima, troškovima i SLA-ovima.
5. Vizualizacije prikazuju trendove, breakdown po kategorijama i usporedbe s ciljevima.
6. Filtri (period, kategorija, plan) omogućuju dubinsku analizu.

**Očekivani rezultat:**
- Funkcionalnost "ROI dashboard za providere" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Konverzija leadova

**Opis:** Stopa konverzije pokazuje udio kupljenih leadova koji su postali ostvareni poslovi.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Konverzija leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaki lead prolazi kroz funnel (kupnja → kontakt → prihvaćena ponuda → posao) i označava se statusom.
5. Konverzija se računa kao omjer konvertiranih leadova i ukupno kupljenih u odabranom periodu.
6. Grafikon u dashboardu prikazuje trendove i usporedbe po kategorijama ili lokaciji.

**Očekivani rezultat:**
- Funkcionalnost "Konverzija leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Ukupan prihod od leadova

**Opis:** Sumarni prihod iz svih konvertiranih leadova daje uvid u ostvarenu vrijednost.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Ukupan prihod od leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon što se posao zatvori, provider unosi ostvareni prihod ili ga sinkroniziramo iz CRM-a.
5. Sustav zbraja prihode po periodu, kategoriji ili timu.
6. Dashboard prikazuje ukupnu vrijednost, trend liniju i top izvore.

**Očekivani rezultat:**
- Funkcionalnost "Ukupan prihod od leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Prosječna vrijednost leada

**Opis:** Prosječna vrijednost prikazuje koliko u prosjeku donosi jedan konvertirani lead.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Prosječna vrijednost leada"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Sustav dijeli ukupan prihod s brojem konvertiranih leadova u zadanim filtrima.
5. Prikazuje se KPI i usporedba s ciljanom vrijednošću.
6. Može se segmentirati po kategorijama, lokacijama ili kanalima.

**Očekivani rezultat:**
- Funkcionalnost "Prosječna vrijednost leada" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Ukupno potrošenih kredita

**Opis:** Zbroj svih potrošenih kredita pokazuje koliko je uloženo u kupnju leadova.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Ukupno potrošenih kredita"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaka kupnja leada zapisuje potrošeni iznos kredita.
5. Agregacija sumira potrošnju po periodu, kategoriji ili timu.
6. Dashboard prikazuje ukupni trošak, trend i usporedbu s prihodima.

**Očekivani rezultat:**
- Funkcionalnost "Ukupno potrošenih kredita" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Ukupno konvertiranih leadova

**Opis:** Broj konvertiranih leadova mjeri koliko je prilika pretvoreno u poslove.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Ukupno konvertiranih leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Lead se smatra konvertiranim kada korisnik označi posao završenim ili sinkronizirani CRM zatvori deal.
5. Sustav broji konverzije u odabranom periodu i segmentira po kategorijama/timu.
6. KPI prikazuje apsolutni broj i rast u odnosu na prethodni period.

**Očekivani rezultat:**
- Funkcionalnost "Ukupno konvertiranih leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Napredne analitike

**Opis:** Napredni analitički modul daje detaljne metrike, trendove i prediktivne uvide za donošenje odluka.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Napredne analitike"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. ROI dashboard kombinira podatke o leadovima, prihodima, kreditima i interakcijama te nudi drill-down po kategoriji/kanalu.
5. Korisnik može primijeniti filtre (vrijeme, lokacija, kategorija, plan) i generirati usporedne grafove ili tablice.
6. Export i schedule report opcije šalju analize na email ili u BI alate.

**Očekivani rezultat:**
- Funkcionalnost "Napredne analitike" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Mesečni/godišnji izvještaji

**Opis:** Periodični izvještaji (mjesec/kvartal/godina) daju objedinjene KPI-je, trendove i usporedbe za lakše planiranje.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Mesečni/godišnji izvještaji"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. ROI modul agregira metrike (leadovi, prihodi, troškovi, ROI, reputacija) po odabranom periodu.
5. Korisnik bira mjesec, kvartal, godinu ili custom raspon i dobiva grafove, tablice i komentare.
6. Izvještaj se može spremiti ili zakazati za automatsko slanje emailom.

**Očekivani rezultat:**
- Funkcionalnost "Mesečni/godišnji izvještaji" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Grafički prikaz statistika

**Opis:** Interaktivni grafički prikazi vaših poslovnih rezultata kroz različite period.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Grafički prikaz statistika"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Dashboard kombinira linijske, stupčaste i doughnut grafove za ROI, prihode, status leadova i konverzije.
5. Filteri (period, kategorija, regija) automatski osvježavaju dataset i sinkroniziraju se s KPI karticama.
6. Sparklines i mini kartice daju brzi pregled trenda bez otvaranja dodatnih tabova.

**Očekivani rezultat:**
- Funkcionalnost "Grafički prikaz statistika" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Usporedba s drugim providerima

**Opis:** Benchmark modul anonimno uspoređuje vaše metrike s prosjekom industrije i top performerima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Usporedba s drugim providerima"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Sustav agregira anonimizirane podatke (konverzija, prihod po leadu, vrijeme odgovora) po kategoriji i regiji.
5. Dashboard prikazuje gdje ste iznad ili ispod prosjeka te nudi preporuke.
6. Podaci se osvježavaju periodično kako bi reflektirali aktualno stanje tržišta.

**Očekivani rezultat:**
- Funkcionalnost "Usporedba s drugim providerima" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 11: Predviđanje budućih performansi

**Opis:** AI model predviđa buduće konverzije, prihode i ROI na temelju povijesnih podataka i trenda.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Predviđanje budućih performansi"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Servis koristi vremenske serije (konverzije, prihodi, broj leadova), sezonalnost i reputacijske metrike.
5. Generira projekcije po mjesecima i scenarijima (optimistično, bazno, konzervativno).
6. Dashboard prikazuje graf prognoze i preporuke za budžet/kapacitete.

**Očekivani rezultat:**
- Funkcionalnost "Predviđanje budućih performansi" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 21: Povijest Transakcija i Krediti

#### Test 1: Detaljno praćenje kredita

**Opis:** Svaka promjena stanja kredita zapisuje se s metapodacima i povezanim entitetima radi potpune transparentnosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Detaljno praćenje kredita"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaka akcija (kupnja, trošak, refund, bonus) generira transakciju s vremenom, tipom i referencom.
5. Povijest je dostupna kroz dashboard uz filtriranje i izvoz.
6. Admin i provider mogu auditirati pojedine transakcije.

**Očekivani rezultat:**
- Funkcionalnost "Detaljno praćenje kredita" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Različiti tipovi transakcija

**Opis:** Transakcije kredita imaju klasificirane tipove (PURCHASE, LEAD_PURCHASE, REFUND...) radi lakšeg praćenja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Različiti tipovi transakcija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaka transakcija dobije tip prema događaju (kupnja, lead, bonus, pretplata...).
5. Tipovi se prikazuju u povijesti i omogućuju filtriranje/analizu.
6. Novi tipovi se definiraju centralno kako bi se održala konzistentnost.

**Očekivani rezultat:**
- Funkcionalnost "Različiti tipovi transakcija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Povezivanje s poslovima

**Opis:** Transakcije kredita linkamo na poslove kako bi ROI bio vidljiv na razini pojedinog posla.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Povezivanje s poslovima"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kod kupnje leada transakcija se veže na posao i lead ID.
5. Dashboard prikazuje potrošene kredite i prihod po poslu.
6. ROI se računa prema statusu konverzije i unesenom prihodu.

**Očekivani rezultat:**
- Funkcionalnost "Povezivanje s poslovima" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Povezivanje s kupnjama leadova

**Opis:** Svaka kupnja leada kreira kreditnu transakciju povezanu s lead ID-jem i statusom.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Povezivanje s kupnjama leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada provider kupi lead, bilježi se transakcija tipa LEAD_PURCHASE.
5. Transakcija sadrži referencu na lead, status i ključne atribute (kategorija, lokacija).
6. Refund automatski stvara povezanu REFUND transakciju.

**Očekivani rezultat:**
- Funkcionalnost "Povezivanje s kupnjama leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Stanje nakon svake transakcije

**Opis:** Sustav prikazuje ažurirano stanje kredita nakon svake transakcije radi jasnog uvida u saldo.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Stanje nakon svake transakcije"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon evidentiranja transakcije izračunava se novo stanje i sprema uz zapis.
5. Trenutni saldo se prikazuje u headeru dashboarda i u svakoj transakciji.
6. Admin može rekonstruirati stanje na bilo koji datum.

**Očekivani rezultat:**
- Funkcionalnost "Stanje nakon svake transakcije" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Opisi transakcija

**Opis:** Svaka kreditna transakcija dobiva razumljiv opis kako bi korisnik odmah znao što se dogodilo.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Opisi transakcija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Prilikom kreiranja transakcije generiramo opis na temelju tipa, povezanog leada/posla i dodatnih meta podataka.
5. Opis se prikazuje u povijesti kredita, exportu i admin panelu.
6. Pretraga i filtriranje omogućuju brzo pronalaženje transakcija po tekstu.

**Očekivani rezultat:**
- Funkcionalnost "Opisi transakcija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Filtriranje transakcija po tipu

**Opis:** Transakcije kredita možete filtrirati po tipu (kupnja, refund, pretplata, bonus...) radi brze analize.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Filtriranje transakcija po tipu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Povijest transakcija nudi filter za tip (LEAD_PURCHASE, REFUND, SUBSCRIPTION, BONUS, ADMIN_ADJUST...).
5. Filter se može kombinirati s datumom, iznosom i stanjem kako biste suzili rezultate.
6. Spremanje filter preseta omogućuje brzi pristup čestim upitima.

**Očekivani rezultat:**
- Funkcionalnost "Filtriranje transakcija po tipu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Izvoz povijesti transakcija

**Opis:** Korisnici mogu izvesti kreditne transakcije u CSV, Excel, PDF ili JSON radi analize i računovodstva.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Izvoz povijesti transakcija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. UI nudi izbor formata i perioda za izvoz transakcija.
5. Backend generira datoteku asinhrono i šalje link za preuzimanje (email ili in-app notifikacija).
6. Izvoz uključuje sve ključne atribute (datum, tip, iznos, saldo, reference).

**Očekivani rezultat:**
- Funkcionalnost "Izvoz povijesti transakcija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Notifikacije o transakcijama

**Opis:** Sustav šalje obavijesti za ključne transakcije (kupnja, refund, pretplata) kako biste bili odmah informirani.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Notifikacije o transakcijama"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kod svake značajne transakcije kreira se notifikacijski događaj (in-app i/ili email).
5. Obavijest sadrži tip transakcije, iznos, saldo nakon transakcije i link na detalje.
6. Korisnik u postavkama bira koje tipove želi primati.

**Očekivani rezultat:**
- Funkcionalnost "Notifikacije o transakcijama" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 22: Cjenik i Plaćanja

#### Test 1: Pregled cjenika

**Opis:** Stranica cjenika prikazuje cijene leadova i pretplatničkih planova uz uključene pogodnosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pregled cjenika"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Cjenik povlači aktualne podatke o cijenama leadova po kategoriji i planovima pretplate.
5. Korisnik može usporediti pakete, vidjeti što je uključeno i pokrenuti kupnju/upgrade.
6. Popusti, trial i jednokratne kupnje prikazuju se kroz istu komponentu.

**Očekivani rezultat:**
- Funkcionalnost "Pregled cjenika" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Različiti paketi pretplate (BASIC, PREMIUM, PRO)

**Opis:** Tri pretplatni plana nude različite količine kredita i funkcionalnosti (BASIC, PREMIUM, PRO).

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Različiti paketi pretplate (BASIC, PREMIUM, PRO)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Planovi definiraju mjesečni broj kredita, cijenu i dodatne pogodnosti (prioritet leadova, support, analitiku).
5. Korisnik može nadograditi/degradirati plan; promjena se primjenjuje na sljedeći billing ciklus.
6. Dashboard prikazuje trenutno korištenje kredita i benefite plana.

**Očekivani rezultat:**
- Funkcionalnost "Različiti paketi pretplate (BASIC, PREMIUM, PRO)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Kreditni sustav

**Opis:** Interni sustav kredita za kupovinu leadova - umjesto direktnog plaćanja, koristite kredite koje kupujete ili dobivate s pretplatom.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kreditni sustav"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kupnja pretplate - svaki paket uključuje određeni broj kredita
5. Jednokratna kupovina - možete kupiti dodatne kredite
6. Besplatni trial - dobivate besplatne kredite za probno razdoblje

**Očekivani rezultat:**
- Funkcionalnost "Kreditni sustav" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Povijest transakcija

**Opis:** Kompletan zapis svih vaših transakcija s kreditima - kupnje, refundovi, pretplate i ostale transakcije.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Povijest transakcija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kupnja leadova - kada kupite lead, transakcija se bilježi
5. Refund - kada dobijete refund, transakcija se bilježi
6. Pretplata - aktivacija pretplate se bilježi

**Očekivani rezultat:**
- Funkcionalnost "Povijest transakcija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Refund kredita (vraćanje internih kredita)

**Opis:** Vraćanje internih kredita na vaš račun kada je potreban refund - jednostavno i brzo vraćanje kredita.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Refund kredita (vraćanje internih kredita)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Refund ako klijent ne odgovori u roku
5. Automatski refund nakon 48h neaktivnosti
6. Ručno zatraživanje refund-a

**Očekivani rezultat:**
- Funkcionalnost "Refund kredita (vraćanje internih kredita)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Stripe Payment Intent refund API (PSD2)

**Opis:** Refundi kartičnih uplata izvršavaju se preko Stripe Payment Intenta u skladu s PSD2 regulativom.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Stripe Payment Intent refund API (PSD2)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada se odobri refund transakcije plaćene karticom, backend poziva Stripe Refund API nad izvornim Payment Intentom.
5. Stripe vraća sredstva korisniku na istu karticu; status refund-a sinkronizira se putem webhooka.
6. Korisnik u povijesti transakcija vidi da je refund obraden karticom.

**Očekivani rezultat:**
- Funkcionalnost "Stripe Payment Intent refund API (PSD2)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Automatski odabir refund metode ovisno o načinu plaćanja

**Opis:** Refund engine bira između kartičnog povrata i vraćanja kredita prema izvornom načinu plaćanja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatski odabir refund metode ovisno o načinu plaćanja"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Sustav dohvaća originalnu transakciju i provjerava je li plaćena karticom ili internim kreditima.
5. Kartične naplate refundiraju se preko Stripe API-ja; kreditne naplate vraćaju saldo u kreditnom leđeru.
6. Kod split transakcija (dio kartica, dio krediti) radi se proporcionalni refund po metodi.

**Očekivani rezultat:**
- Funkcionalnost "Automatski odabir refund metode ovisno o načinu plaćanja" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Refund ako klijent ne odgovori u roku

**Opis:** Ako klijent ne reagira u definiranom vremenu, lead se automatski refundira.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Refund ako klijent ne odgovori u roku"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon kupnje lead ulazi u monitoring (npr. 48 h). Ako nema potvrde kontakta, pokreće se automatski refund.
5. Sustav provjerava komunikacijske događaje (poziv, SMS, email) i bilježi pokušaje.
6. Refund vraća kredite ili kartičnu uplatu, a lead dobiva status REFUNDED (NO_RESPONSE).

**Očekivani rezultat:**
- Funkcionalnost "Refund ako klijent ne odgovori u roku" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Razlozi za refund (klijent ne odgovori, itd.)

**Opis:** Različiti razlozi za refund - klijent ne odgovori, automatska neaktivnost ili ručno zatraživanje.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Razlozi za refund (klijent ne odgovori, itd.)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Klijent ne odgovori na vaš kontakt u određenom roku
5. Automatski refund nakon određenog vremena
6. Lead se oslobađa i vraća na tržište

**Očekivani rezultat:**
- Funkcionalnost "Razlozi za refund (klijent ne odgovori, itd.)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Otkazivanje pretplate

**Opis:** Otkažite plan u bilo kojem trenutku; koristite benefite do kraja razdoblja, a krediti ostaju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Otkazivanje pretplate"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. U postavkama kliknete "Otkaži pretplatu"; sustav postavlja cancel_at_period_end u Stripe-u.
5. Plan ostaje aktivan do isteka trenutnog ciklusa, potom prelazi u EXPIRED/BASIC.
6. Krediti zarađeni u ciklusu ostaju dostupni.

**Očekivani rezultat:**
- Funkcionalnost "Otkazivanje pretplate" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 11: Status pretplate (ACTIVE, CANCELLED, EXPIRED)

**Opis:** Praćenje statusa vaše pretplate - vidite je li pretplata aktivna, otkazana ili istekla.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Status pretplate (ACTIVE, CANCELLED, EXPIRED)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. ACTIVE (Aktivna) - pretplata je aktivna i možete koristiti sve funkcionalnosti
5. CANCELLED (Otkazana) - pretplata je otkazana ali još vrijedi do kraja perioda
6. EXPIRED (Istekla) - pretplata je istekla i više ne možete koristiti funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Status pretplate (ACTIVE, CANCELLED, EXPIRED)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 12: Automatsko isteka pretplate

**Opis:** Neuspjela naplata ili istekao ciklus automatski označava pretplatu kao EXPIRED i vraća korisnika na BASIC.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatsko isteka pretplate"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Stripe pokušava naplatu; nakon konačnog neuspjeha webhook šalje signal.
5. Sistem postavlja status EXPIRED, deaktivira premium značajke i, po potrebi, prebacuje na BASIC.
6. Korisnik zadržava postojeće kredite ali više ne prima nove.

**Očekivani rezultat:**
- Funkcionalnost "Automatsko isteka pretplate" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 13: Notifikacije o isteku pretplate

**Opis:** Podsjetnici 7/3/1 dan prije isteka osiguravaju da ne propustite obnovu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Notifikacije o isteku pretplate"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Scheduler provjerava `currentPeriodEnd` i šalje notifikacije 7, 3 i 1 dan prije isteka.
5. Uključuje email, in-app i opcionalno SMS kanal s linkom za obnovu ili ažuriranje kartice.
6. Ako naplata padne, šalje se dodatna obavijest ÔÇťPayment failedÔÇŁ.

**Očekivani rezultat:**
- Funkcionalnost "Notifikacije o isteku pretplate" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 14: Online plaćanje (Stripe Checkout)

**Opis:** Sigurno online plaćanje za pretplate i kupovinu leadova preko Stripe Checkout-a - brzo i sigurno plaćanje karticom.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Online plaćanje (Stripe Checkout)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Odaberete paket pretplate ili lead koji želite kupiti
5. Kliknete na "Plaćanje" ili "Kupnja"
6. Preusmjereni ste na Stripe Checkout stranicu

**Očekivani rezultat:**
- Funkcionalnost "Online plaćanje (Stripe Checkout)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 15: Fakturiranje (PDF fakture za pretplate i kupovine)

**Opis:** Automatski generirane PDF fakture za sve vaše pretplate i kupovine - profesionalne fakture za računovodstvo. PDF fakture se automatski spremaju u AWS S3 za trajno čuvanje.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Fakturiranje (PDF fakture za pretplate i kupovine)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Automatski prilikom aktivacije pretplate
5. Automatski prilikom kupovine leadova (ako platite karticom)
6. Možete preuzeti fakturu bilo kada

**Očekivani rezultat:**
- Funkcionalnost "Fakturiranje (PDF fakture za pretplate i kupovine)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 16: Povrat novca za pretplate (refund subscription payment)

**Opis:** Mogućnost refund-a za pretplate - vraćanje novca za pretplatu ako je potrebno.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Povrat novca za pretplate (refund subscription payment)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Ako ste platili pretplatu a ne zadovoljni ste
5. Ako imate problem s pretplatom
6. Ako je došlo do greške

**Očekivani rezultat:**
- Funkcionalnost "Povrat novca za pretplate (refund subscription payment)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 23: Korisničko Iskustvo

#### Test 1: Responsive dizajn (mobilni, tablet, desktop)

**Opis:** UI se prilagođava svim uređajima (mobilni, tablet, desktop) radi konzistentnog iskustva.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Responsive dizajn (mobilni, tablet, desktop)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Layout koristi fleksibilnu grid i breakpoint sustav (mobile-first) za automatsko prilagođavanje.
5. Kontrole i navigacija optimizirani su za touch geste na mobilnim uređajima i produktivnost na desktopu.
6. Sve ključne funkcije dostupne su na svakom form factoru bez dodatnih instalacija.

**Očekivani rezultat:**
- Funkcionalnost "Responsive dizajn (mobilni, tablet, desktop)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Intuitivno korisničko sučelje

**Opis:** Dizajn sučelja prati jasne uzorke i vodi korisnika kroz procese bez potrebe za tutorijalima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Intuitivno korisničko sučelje"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Navigacija je organizirana po ulogama, a ključne akcije dostupne su u 1-2 klika.
5. Kontekstualni tooltips, validacije i error poruke nude objašnjenja u trenutku potrebe.
6. UX pisani vodiči (empty states, checklist) pomažu novim korisnicima.

**Očekivani rezultat:**
- Funkcionalnost "Intuitivno korisničko sučelje" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Brzo učitavanje stranica

**Opis:** Performanse frontenda optimizirane su kako bi stranice i liste učitavale u milisekundama.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Brzo učitavanje stranica"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Lazy loading, code splitting i CDN cache minimiziraju payload.
5. Pre-fetch najčešćih podataka i offline caching (Service Worker) za kritične viewove.
6. Monitoring prati stvarno vrijeme učitavanja i automatski alarmira na degradacije.

**Očekivani rezultat:**
- Funkcionalnost "Brzo učitavanje stranica" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Pretraživanje u realnom vremenu

**Opis:** Rezultati se ažuriraju dok korisnik tipka, omogućujući trenutno pronalaženje poslova, leadova ili providera.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pretraživanje u realnom vremenu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaki unos znaka šalje throttled upit prema search servisu.
5. Rezultati se prikazuju bez reload-a, s isticanjem ključnih pojmova.
6. Pametni algoritmi toleriraju tipfelere i nude sugestije.

**Očekivani rezultat:**
- Funkcionalnost "Pretraživanje u realnom vremenu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Filtriranje i sortiranje

**Opis:** Dinamični filteri i sortiranja omogućuju brzo sužavanje rezultata prema kriterijima korisnika.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Filtriranje i sortiranje"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. UI nudi kombiniranje filtera (kategorija, lokacija, budžet, status, reputacija) i odmah osvježava rezultate.
5. Sort opcije (najnovije, cijena, ROI, udaljenost) prilagođene su kontekstu (poslovi, leadovi, provideri).
6. Korisnici mogu spremiti favorite i ponovno koristiti konfiguracije.

**Očekivani rezultat:**
- Funkcionalnost "Filtriranje i sortiranje" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Dark mode

**Opis:** Prebacite se između svijetlog i tamnog načina rada prema vašoj preferenciji.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Dark mode"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Switch u zaglavlju aktivira tamnu temu i zapisuje preferenciju u profil korisnika.
5. Ako korisnik ne odabere ručno, primjenjuje se OS `prefers-color-scheme` postavka.
6. Sve komponente (grafovi, forme, kartice) koriste prilagođene boje i kontrast za ugodan prikaz.

**Očekivani rezultat:**
- Funkcionalnost "Dark mode" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Lokalizacija (hrvatski jezik)

**Opis:** Sučelje, sadržaj i notifikacije lokalizirani su na hrvatski jezik s prilagođenim formatima datuma i valuta.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Lokalizacija (hrvatski jezik)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. i18n sloj koristi hrvatski kao zadani jezik (hr-HR locale) na webu i u emailovima.
5. Lexikon poruka i copy održava se centralno; dinamički sadržaj (npr. nazivi kategorija) također ima prijevode.
6. Formatiranje datuma, valuta i pluralizacije usklađeno je s hrvatskim standardom.

**Očekivani rezultat:**
- Funkcionalnost "Lokalizacija (hrvatski jezik)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Pristupačnost (accessibility)

**Opis:** Platforma je prilagođena za sve korisnike, uključujući one s posebnim potrebama.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pristupačnost (accessibility)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Navigacija tipkovnicom (Tab/Shift+Tab) pokriva sve interaktivne elemente, uz skip-linkove za brzo preskakanje na sadržaj.
5. ARIA atributi, alternativni opisi i semantički HTML omogućuju rad s čitačima ekrana.
6. Tema održava WCAG kontrastne omjere i podržava povećanje fonta bez lomljenja layouta.

**Očekivani rezultat:**
- Funkcionalnost "Pristupačnost (accessibility)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 24: Upravljanje Tvrtkama i Timovima

#### Test 1: Tvrtka kao pravni entitet

**Opis:** Tvrtka je nositelj profila, ugovora i financija; direktor i tim djeluju u njezino ime.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Tvrtka kao pravni entitet"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaki provider profil povezan je s entitetom `Company` koji predstavlja pravnu osobu (d.o.o., obrt, j.d.o.o.).
5. Direktor upravlja postavkama, timovima i financijama; tim članovi izvršavaju operativne zadatke u ime tvrtke.
6. Sve ponude, fakture i recenzije vežu se uz tvrtku, čuvajući konzistentan pravni trag.

**Očekivani rezultat:**
- Funkcionalnost "Tvrtka kao pravni entitet" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Direktor kao administrator profila

**Opis:** Direktor je primarni administrator koji upravlja timovima, financijama i ključnim odlukama tvrtke.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Direktor kao administrator profila"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktor ima puni pristup profilu tvrtke, leadovima, ponudama i financijskim izvještajima kroz Direktor Dashboard.
5. Potvrđuje kritične akcije (npr. slanje ponude, dodjela leadova, upravljanje licencama).
6. Administrira timove: dodaje članove preko email adrese, uklanja članove i nadzire njihov rad.

**Očekivani rezultat:**
- Funkcionalnost "Direktor kao administrator profila" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Team članovi (operativci)

**Opis:** Operativci vode komunikaciju i ponude za dodijeljene leadove, ali bez administratorskih ovlasti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Team članovi (operativci)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktor dodaje tim članove preko email adrese PROVIDER korisnika; član se automatski povezuje s tvrtkom.
5. Tim članovi rade u ime tvrtke, ali nemaju pristup financijama ni postavkama tvrtke.
6. Direktor vidi sve aktivnosti tim članova kroz Direktor Dashboard.

**Očekivani rezultat:**
- Funkcionalnost "Team članovi (operativci)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Dodavanje članova tima

**Opis:** Direktor dodaje nove članove tima preko email adrese PROVIDER korisnika kroz Direktor Dashboard.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Dodavanje članova tima"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktor u Direktor Dashboard tabu "Tim" unosi email adresu PROVIDER korisnika.
5. Sustav provjerava da korisnik postoji i ima PROVIDER profil.
6. Ako korisnik već postoji u timu, prikazuje se greška.

**Očekivani rezultat:**
- Funkcionalnost "Dodavanje članova tima" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Upravljanje pravima tima

**Opis:** Direktor upravlja tim članovima kroz Direktor Dashboard - dodavanje i uklanjanje članova.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Upravljanje pravima tima"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktor Dashboard tab "Tim" prikazuje sve članove tima s njihovim informacijama.
5. Direktor može dodati novog člana unoseći email adresu PROVIDER korisnika.
6. Direktor može ukloniti člana iz tima jednim klikom.

**Očekivani rezultat:**
- Funkcionalnost "Upravljanje pravima tima" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Interna distribucija leadova unutar tvrtke

**Opis:** Leadovi pristigli tvrtki idu u interni queue; direktor ih može ručno dodijeliti ili prepustiti auto-engineu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Interna distribucija leadova unutar tvrtke"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada lead stigne tvrtki (direktoru), automatski se dodaje u interni queue tvrtke (CompanyLeadQueue).
5. Direktor vidi sve leadove u queueu kroz Direktor Dashboard tab "Interni Lead Queue".
6. Direktor može ručno dodijeliti lead odabranom tim članu ili koristiti auto-assign za automatsku dodjelu najboljem tim članu.

**Očekivani rezultat:**
- Funkcionalnost "Interna distribucija leadova unutar tvrtke" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Tvrtka bez tima (solo firma)

**Opis:** Solo izvođači rade u modu gdje je direktor i operativac; leadovi se automatski dodjeljuju njemu dok ne formira tim.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Tvrtka bez tima (solo firma)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Prilikom registracije bez tima platforma kreira virtualni ÔÇťdefault teamÔÇŁ i sve leadove dodjeljuje direktoru.
5. UI skriva sekcije za timove i pojednostavljuje procese (nema internal chata, manji limiti aktivnih leadova).
6. Dodavanjem prvog člana tvrtka prelazi u multi-team mod, a povijest leadova ostaje direktorova.

**Očekivani rezultat:**
- Funkcionalnost "Tvrtka bez tima (solo firma)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Auto-assign leadova timu

**Opis:** Direktor može koristiti auto-assign za automatsku dodjelu leada najboljem tim članu na temelju kategorije, dostupnosti i KPI-jeva.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Auto-assign leadova timu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktor klikne "Auto-assign" na PENDING leadu u Direktor Dashboard tabu "Interni Lead Queue".
5. Algoritam procjenjuje sve dostupne tim članove i odabire najboljeg na temelju:
6. - Match po kategoriji (tim član mora imati kategoriju leada)

**Očekivani rezultat:**
- Funkcionalnost "Auto-assign leadova timu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Ručna dodjela leadova od strane direktora

**Opis:** Direktor ručno odabire tim člana koji preuzima lead iz dropdowna u Direktor Dashboard tabu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Ručna dodjela leadova od strane direktora"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktor vidi sve PENDING leadove u Direktor Dashboard tabu "Interni Lead Queue".
5. Za svaki PENDING lead, direktor može odabrati tim člana iz dropdowna.
6. Odabrani tim član automatski dobiva lead i notifikaciju.

**Očekivani rezultat:**
- Funkcionalnost "Ručna dodjela leadova od strane direktora" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Pregled aktivnosti tima

**Opis:** Direktor prati aktivnosti tima kroz Direktor Dashboard - pregled ponuda i leadova koji čekaju na odobrenje.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pregled aktivnosti tima"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktor Dashboard tab "Odluke" prikazuje ponude koje čekaju na odobrenje (od tim članova).
5. Prikazuju se leadovi koje tim članovi trebaju odobriti.
6. Direktor vidi sve relevantne informacije za donošenje odluke (naslov posla, iznos ponude, kontakt informacije).

**Očekivani rezultat:**
- Funkcionalnost "Pregled aktivnosti tima" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 11: Direktor Dashboard - upravljanje timovima

**Opis:** Direktor Dashboard omogućava upravljanje timovima - dodavanje i uklanjanje članova tima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Direktor Dashboard - upravljanje timovima"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktor Dashboard ima tab "Tim" koji prikazuje sve članove tima.
5. Direktor može dodati novog člana unoseći email adresu PROVIDER korisnika.
6. Direktor može ukloniti člana iz tima jednim klikom.

**Očekivani rezultat:**
- Funkcionalnost "Direktor Dashboard - upravljanje timovima" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 12: Direktor Dashboard - pristup financijama

**Opis:** Direktor Dashboard omogućava pristup financijskim podacima tvrtke - pretplate, fakture i leadovi.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Direktor Dashboard - pristup financijama"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktor Dashboard ima tab "Financije" koji prikazuje sve financijske podatke tvrtke.
5. Prikazuje se pretplata direktora (plan, status, krediti, datum isteka, cijena).
6. Prikazuju se fakture direktora i svih tim članova s detaljima (ukupno potrošeno, status, datum).

**Očekivani rezultat:**
- Funkcionalnost "Direktor Dashboard - pristup financijama" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 13: Direktor Dashboard - ključne odluke

**Opis:** Direktor Dashboard omogućava pregled ključnih odluka koje čekaju na odobrenje - ponude i leadovi.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Direktor Dashboard - ključne odluke"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktor Dashboard ima tab "Odluke" koji prikazuje sve odluke koje čekaju na odobrenje direktora.
5. Prikazuju se ponude koje čekaju na odobrenje (od tim članova) s detaljima o poslu, iznosu i statusu.
6. Prikazuju se leadovi koje tim članovi trebaju odobriti s informacijama o klijentu, kategoriji i cijeni.

**Očekivani rezultat:**
- Funkcionalnost "Direktor Dashboard - ključne odluke" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 25: Chat Sustav (PUBLIC i INTERNAL)

#### Test 1: PUBLIC chat (Klijent ↔ Tvrtka)

**Opis:** Javni chat između klijenta i tvrtke automatski se otvara nakon otključavanja lead-a i prati cijeli posao.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "PUBLIC chat (Klijent ↔ Tvrtka)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Chat se automatski kreira kada provider kupi lead (otključa kontakt informacije).
5. Sudionici chata su: klijent (vlasnik posla), provider koji je kupio lead, direktor (ako je provider tim član), i tim član kojem je lead dodijeljen (ako je lead dodijeljen u internom queueu).
6. Chat prati cijeli životni ciklus posla - od otključavanja leada do završetka posla.

**Očekivani rezultat:**
- Funkcionalnost "PUBLIC chat (Klijent ↔ Tvrtka)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: INTERNAL chat (Direktor ↔ Team)

**Opis:** Privatni interni chat između direktora i timova za operativnu koordinaciju, nevidljiv klijentu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "INTERNAL chat (Direktor ↔ Team)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. INTERNAL chat je privatni chat između direktora i tim članova za operativnu koordinaciju.
5. Chat nije vezan uz posao (jobId = null) - razlikuje se od PUBLIC chata koji je vezan uz posao.
6. Direktor može kreirati 1-on-1 chat s tim članom ili grupni chat s više tim članova.

**Očekivani rezultat:**
- Funkcionalnost "INTERNAL chat (Direktor ↔ Team)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Maskirani kontakti do prihvata ponude

**Opis:** Email i telefon klijenta ostaju skriveni dok ponuda nije prihvaćena, čime se štiti privatnost i marketplace ekonomija.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Maskirani kontakti do prihvata ponude"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Email i telefon klijenta se maskiraju dok ponuda nije prihvaćena (status Ôëá ACCEPTED).
5. Email se maskira kao "j*@example.com" (prvo slovo, maskirani dio, zadnje slovo, domena).
6. Telefon se maskira kao "+385 * * 123" (maskirani dio, zadnje 3-4 znamenke).

**Očekivani rezultat:**
- Funkcionalnost "Maskirani kontakti do prihvata ponude" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Chat thread vezan uz upit/ponudu

**Opis:** Svaki lead i pripadajuća ponuda imaju svoj thread kako bi komunikacija i privici bili u jednoj vremenskoj liniji.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Chat thread vezan uz upit/ponudu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Lead automatski kreira PUBLIC thread `chat:{leadId}`; interne dodjele otvaraju INTERNAL thread.
5. Ponude i promjene statusa ažuriraju metapodatke threada (npr. aktivna verzija ponude, zadnja aktivnost).
6. CRM linkovi i breadcrumbs vode korisnika iz leada u odgovarajući thread bez traženja.

**Očekivani rezultat:**
- Funkcionalnost "Chat thread vezan uz upit/ponudu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Privici u chatu (fotke, PDF ponude)

**Opis:** Chat podržava upload slika, PDF-ova i dokumenata uz verzioniranje i sigurno pohranjivanje.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Privici u chatu (fotke, PDF ponude)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnici drag-and-dropom ili izborom datoteke prilažu privitke uz poruke; PDF ponude se automatski prilažu pri slanju.
5. Sustav validira tip i veličinu datoteke, pohranjuje je u siguran storage i povezuje s porukom.
6. Privici su dostupni u kontekstu threada, a nakon zatvaranja posla ostaju read-only radi arhive.

**Očekivani rezultat:**
- Funkcionalnost "Privici u chatu (fotke, PDF ponude)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Verzioniranje poruka

**Opis:** Poruke i privici imaju verzije ÔÇô svaka izmjena čuva staru verziju radi audita i transparentnosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Verzioniranje poruka"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik može urediti svoju poruku; sustav čuva original i označava poruku kao uređenu.
5. Svaka izmjena kreira novu verziju poruke - stara verzija se čuva u MessageVersion modelu.
6. Sudionici chata imaju uvid u povijest verzija (tekst + privici) s informacijom tko je i kada mijenjao sadržaj.

**Očekivani rezultat:**
- Funkcionalnost "Verzioniranje poruka" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Audit log svih poruka

**Opis:** Svaka poruka, uređivanje, privitak i otkrivanje kontakta bilježi se u audit log s vremenom i korisnikom.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Audit log svih poruka"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kreiranje, uređivanje, brisanje poruka i otkrivanje kontakata zapisuje se s korisnikom, vremenom i metapodacima.
5. Svaka akcija se bilježi s IP adresom i user agentom za potpunu sljedivost.
6. Direktor/moderator ima pristup audit logovima kroz API endpointove s filtriranjem po tipu akcije, korisniku i datumu.

**Očekivani rezultat:**
- Funkcionalnost "Audit log svih poruka" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Zaključavanje threada nakon završetka

**Opis:** Nakon završetka posla ili dulje neaktivnosti thread prelazi u read-only uz opciju privremenog otključavanja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Zaključavanje threada nakon završetka"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada posao dobije status COMPLETED, svi threadovi za taj posao se automatski zaključavaju.
5. Threadovi bez aktivnosti dulje od 90 dana se automatski zaključavaju (cron job).
6. Sudionici mogu pregledavati povijest, ali ne mogu slati nove poruke ili uređivati postojeće.

**Očekivani rezultat:**
- Funkcionalnost "Zaključavanje threada nakon završetka" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: SLA podsjetnici za odgovor

**Opis:** Platforma podsjeća timove na obvezu odgovora unutar SLA-a i bilježi kršenja koja utječu na reputaciju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "SLA podsjetnici za odgovor"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Kada korisnik (USER) pošalje poruku, automatski se kreira SLA tracking s ciljem odgovora unutar 4 sata (240 minuta).
5. Platforma šalje podsjetnike:
6. - 1 sat prije isteka SLA-a (50% vremena)

**Očekivani rezultat:**
- Funkcionalnost "SLA podsjetnici za odgovor" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Moderacija chat poruka

**Opis:** Automatska i ručna moderacija filtrira neprikladan sadržaj, dijeljenje kontakata i omogućuje prijave.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Moderacija chat poruka"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaka poruka prolazi automatsku heurističku provjeru; sumnjive se označavaju "pending review".
5. Korisnici mogu prijaviti poruku moderatorima koji odlučuju (odobri, odbij).
6. Politike zabranjuju dijeljenje osobnih podataka (email, telefon) prije prihvata ponude i uvredljiv sadržaj.

**Očekivani rezultat:**
- Funkcionalnost "Moderacija chat poruka" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 26: Weighted Queue i Partner Scoring

#### Test 1: Weighted Queue algoritam

**Opis:** Algoritam rangira providere prema reputaciji, odzivu, lokaciji i kapacitetu kako bi leadove dobili najkvalitetniji izvođači.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Weighted Queue algoritam"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Lead ne ide prvom koji klikne, nego partneru s najvećim SCORE-om (reputacija, brzina odgovora, paket, udaljenost, vrijeme od zadnje dodjele).
5. Filtriraju se kandidati koji pokrivaju kategoriju/leadu i imaju raspoloživ kapacitet, zatim se izračuna SCORE i lead dodjeljuje najboljem.
6. Premium partneri mogu primiti lead auto-assignom; ostali dobivaju claim obavijest. Nakon isteka time-outa lead prelazi na sljedećeg kandidata.

**Očekivani rezultat:**
- Funkcionalnost "Weighted Queue algoritam" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Partner Score izračun

**Opis:** Kompozitni PARTNER_SCORE (0-100) kombinira ResponseRate, CompletionRate, Rating, ConversionRate, Compliance i Freshness za tieriranje partnera.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Partner Score izračun"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Dnevni/tjedni job računa PARTNER_SCORE na temelju ključnih metrika i dodjeljuje tier (Premium ≥80, Verified 60-79, Basic <60).
5. Promjene scorea utječu na vidljivost i prioritet u lead distribuciji; top partneri prolaze ručni QA review.
6. Partner vidi breakdown komponenti i događaje koji su utjecali na score (npr. nova recenzija, SLA kršenje).

**Očekivani rezultat:**
- Funkcionalnost "Partner Score izračun" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Reputation Score (0-100)

**Opis:** Reputation Score je numerička ocjena pružatelja usluga od 0 do 100 koja odražava njihovu kvalitetu, pouzdanost i profesionalnost.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Reputation Score (0-100)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Reputation Score se izračunava na temelju više faktora: prosječna ocjena korisnika, brzina odgovora na ponude, stopa konverzije, broj završenih poslova i povijest recenzija.
5. Score se automatski ažurira nakon svake nove recenzije, završenog posla ili promjene u performansama pružatelja.
6. Prikazuje se na profilu pružatelja kao numerička vrijednost od 0 do 100, gdje 100 predstavlja najbolju moguću ocjenu.

**Očekivani rezultat:**
- Funkcionalnost "Reputation Score (0-100)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Response Rate mjerenje

**Opis:** Response Rate mjerenje prati postotak odgovora pružatelja usluga na primljene ponude i leadove, što je ključni pokazatelj angažmana i profesionalnosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Response Rate mjerenje"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Response Rate se izračunava kao postotak odgovora pružatelja na primljene ponude i leadove u određenom vremenskom periodu.
5. Sustav automatski bilježi svaki odgovor (prihvaćanje, odbijanje, pregovaranje) i ažurira Response Rate u realnom vremenu.
6. Response Rate se prikazuje kao postotak (npr. 85%) i može se filtrirati po različitim periodima (dnevno, tjedno, mjesečno).

**Očekivani rezultat:**
- Funkcionalnost "Response Rate mjerenje" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Completion Rate tracking

**Opis:** Completion Rate tracking prati postotak uspješno završenih poslova u odnosu na prihvaćene ponude, što je ključni pokazatelj pouzdanosti i profesionalnosti pružatelja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Completion Rate tracking"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Completion Rate se izračunava kao postotak uspješno završenih poslova u odnosu na sve prihvaćene ponude u određenom vremenskom periodu.
5. Sustav automatski bilježi status svakog posla (ZAVRŠEN, OTKAZAN, U TIJEKU) i ažurira Completion Rate u realnom vremenu.
6. Completion Rate se prikazuje kao postotak (npr. 92%) i može se filtrirati po različitim periodima (dnevno, tjedno, mjesečno).

**Očekivani rezultat:**
- Funkcionalnost "Completion Rate tracking" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Platform Compliance Score

**Opis:** Platform Compliance Score mjeri usklađenost pružatelja usluga s pravilima i standardima platforme, uključujući licence, verifikacije, dokumentaciju i etičke standarde.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Platform Compliance Score"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Platform Compliance Score se izračunava na temelju više faktora: valjanost licenci, verifikacije identiteta, ažurnost dokumentacije, povijest kršenja pravila i usklađenost s etičkim standardima.
5. Sustav automatski provjerava compliance faktore i ažurira score u realnom vremenu kada se promijene relevantni podaci.
6. Compliance Score se prikazuje kao numerička vrijednost (npr. 0-100) gdje viša vrijednost označava bolju usklađenost s pravilima platforme.

**Očekivani rezultat:**
- Funkcionalnost "Platform Compliance Score" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Premium Partner tier (Score ≥ 80)

**Opis:** Premium Partner tier je najviša razina partnera na platformi, dodjeljuje se pružateljima usluga s PARTNER_SCORE-om od 80 ili više, što osigurava prioritetnu dodjelu leadova i ekskluzivne privilegije.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Premium Partner tier (Score ≥ 80)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Premium Partner tier se automatski dodjeljuje pružateljima usluga koji postignu PARTNER_SCORE od 80 ili više.
5. PARTNER_SCORE se izračunava na temelju više faktora: Response Rate, Completion Rate, Rating, Conversion Rate, Compliance Score i Freshness.
6. Dnevni/tjedni job automatski računa PARTNER_SCORE i dodjeljuje odgovarajući tier (Premium ≥80, Verified 60-79, Basic <60).

**Očekivani rezultat:**
- Funkcionalnost "Premium Partner tier (Score ≥ 80)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Verified Partner tier (Score 60-79)

**Opis:** Verified Partner tier je srednja razina partnera na platformi, dodjeljuje se pružateljima usluga s PARTNER_SCORE-om između 60 i 79, što osigurava standardnu dodjelu leadova i osnovne privilegije.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Verified Partner tier (Score 60-79)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Verified Partner tier se automatski dodjeljuje pružateljima usluga koji postignu PARTNER_SCORE između 60 i 79.
5. PARTNER_SCORE se izračunava na temelju više faktora: Response Rate, Completion Rate, Rating, Conversion Rate, Compliance Score i Freshness.
6. Dnevni/tjedni job automatski računa PARTNER_SCORE i dodjeljuje odgovarajući tier (Premium ≥80, Verified 60-79, Basic <60).

**Očekivani rezultat:**
- Funkcionalnost "Verified Partner tier (Score 60-79)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Basic Partner tier (Score < 60)

**Opis:** Basic Partner tier je osnovna razina partnera na platformi, dodjeljuje se pružateljima usluga s PARTNER_SCORE-om ispod 60, što osigurava ograničenu dodjelu leadova i osnovne funkcionalnosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Basic Partner tier (Score < 60)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Basic Partner tier se automatski dodjeljuje pružateljima usluga koji postignu PARTNER_SCORE ispod 60.
5. PARTNER_SCORE se izračunava na temelju više faktora: Response Rate, Completion Rate, Rating, Conversion Rate, Compliance Score i Freshness.
6. Dnevni/tjedni job automatski računa PARTNER_SCORE i dodjeljuje odgovarajući tier (Premium ≥80, Verified 60-79, Basic <60).

**Očekivani rezultat:**
- Funkcionalnost "Basic Partner tier (Score < 60)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Auto-assign prioritet za Premium partnere

**Opis:** Auto-assign prioritet za Premium partnere osigurava da Premium Partneri (PARTNER_SCORE ≥ 80) dobivaju prioritetnu automatsku dodjelu leadova u queue sustavu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Auto-assign prioritet za Premium partnere"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Auto-assign prioritet automatski dodjeljuje leadove Premium Partnerima prije ostalih partnera u queue sustavu.
5. Premium Partneri (PARTNER_SCORE ≥ 80) dobivaju najviši prioritet u automatskoj distribuciji leadova.
6. Algoritam prvo provjerava dostupne Premium Partnere prije nego što proslijedi leadove Verified ili Basic Partnerima.

**Očekivani rezultat:**
- Funkcionalnost "Auto-assign prioritet za Premium partnere" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 11: Fairness algoritam (sprečava previše leadova istom partneru)

**Opis:** Fairness algoritam osigurava pravednu distribuciju leadova između partnera sprječavajući da jedan partner dobije previše leadova u kratkom vremenskom periodu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Fairness algoritam (sprečava previše leadova istom partneru)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Fairness algoritam prati broj leadova dodijeljenih svakom partneru u određenom vremenskom periodu (npr. dnevno, tjedno).
5. Algoritam postavlja maksimalni limit leadova po partneru u određenom periodu kako bi osigurao pravednu distribuciju.
6. Kada partner dosegne limit, algoritam ga privremeno isključuje iz dodjele leadova dok se limit ne resetira.

**Očekivani rezultat:**
- Funkcionalnost "Fairness algoritam (sprečava previše leadova istom partneru)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 27: Matchmaking Kategorija

#### Test 1: Usporedba kategorija korisnika i tvrtke

**Opis:** Lead se prvo filtrira prema kategorijama koje tvrtka pokriva kako bi relevantni provideri dobili priliku.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Usporedba kategorija korisnika i tvrtke"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pri dolasku leada validira se poklapanje s kategorijama koje tvrtka nudi (npr. "Vodoinstalacije").
5. Samo kompatibilne tvrtke s dostupnim kapacitetom ulaze u daljnje rangiranje (Weighted Queue).
6. Admin alati i dashboard prikazuju badge ÔÇťCategory MatchÔÇŁ za jasnu sliku kompatibilnosti.

**Očekivani rezultat:**
- Funkcionalnost "Usporedba kategorija korisnika i tvrtke" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Usporedba kategorija korisnika i tima

**Opis:** Nakon filtera po tvrtki, lead se uspoređuje s vještinama timova kako bi ga preuzeo najrelevantniji specijalist.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Usporedba kategorija korisnika i tima"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon što lead prođe filter po tvrtki, engine uspoređuje kategoriju posla s kategorijama tim članova.
5. Match score se izračunava na osnovu točnog poklapanja kategorija (1.0 = savršen match, 0 = nema matcha).
6. Lead se automatski dodjeljuje tim članu s najvišim match score-om.

**Očekivani rezultat:**
- Funkcionalnost "Usporedba kategorija korisnika i tima" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Kombinirani match score (Tvrtka + Tim)

**Opis:** Kombinirani score spaja reputaciju tvrtke i specijalizaciju tima kako bi lead dodjela bila fer i transparentna.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kombinirani match score (Tvrtka + Tim)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Company Score (reputacija, odziv, compliance) + Team Skill Score (vještine, workload) + Context Score (hitnost, paket, povijest) čine ukupni rezultat.
5. Nakon što tvrtka prođe kategorijski filter, engine računa score za svaku kombinaciju tvrtka+tim i rangira ih.
6. Lead dobiva kandidat s najvišim scoreom; direktor može vidjeti breakdown i eventualno ručno override-ati.

**Očekivani rezultat:**
- Funkcionalnost "Kombinirani match score (Tvrtka + Tim)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Eligibility filter po kategoriji

**Opis:** Eligibility filter po kategoriji osigurava da se leadovi dodjeljuju samo partnerima koji su kvalificirani za određene kategorije usluga, na temelju njihovih odabranih kategorija i licenci.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Eligibility filter po kategoriji"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Eligibility filter po kategoriji provjerava da li je partner kvalificiran za kategoriju leada prije dodjele.
5. Partner mora imati odabranu kategoriju u svom profilu i, ako je potrebno, valjanu licencu za tu kategoriju.
6. Algoritam filtrira partnere na temelju njihovih odabranih kategorija i licenci prije dodjele leadova.

**Očekivani rezultat:**
- Funkcionalnost "Eligibility filter po kategoriji" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Eligibility filter po regiji

**Opis:** Eligibility filter po regiji osigurava da se leadovi dodjeljuju samo partnerima koji rade u određenim regijama, na temelju njihovih odabranih regija i lokacije.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Eligibility filter po regiji"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Eligibility filter po regiji provjerava da li je partner kvalificiran za regiju leada prije dodjele.
5. Partner mora imati odabranu regiju u svom profilu koja odgovara regiji leada.
6. Algoritam filtrira partnere na temelju njihovih odabranih regija prije dodjele leadova.

**Očekivani rezultat:**
- Funkcionalnost "Eligibility filter po regiji" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Prioritet timu s boljim matchom

**Opis:** Prioritet timu s boljim matchom osigurava da se leadovi dodjeljuju timovima s najboljim match score-om, koji kombinira faktore tvrtke i tim članova za optimalnu dodjelu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Prioritet timu s boljim matchom"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Prioritet timu s boljim matchom koristi kombinirani match score koji uzima u obzir faktore tvrtke (PARTNER_SCORE, tier, compliance) i tim članova (kategorije, licence, dostupnost).
5. Algoritam izračunava match score za svaki tim na temelju relevantnosti tim članova za određeni lead (kategorija, regija, licence).
6. Timovi s višim match score-om dobivaju prioritet u queue sustavu i prvo im se nude leadovi.

**Očekivani rezultat:**
- Funkcionalnost "Prioritet timu s boljim matchom" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Fallback na direktora ako nema tima

**Opis:** Fallback na direktora ako nema tima osigurava da se leadovi dodjeljuju direktoru tvrtke kada tim nema dostupnih članova ili kada tim ne može primiti lead.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Fallback na direktora ako nema tima"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Fallback na direktora se aktivira kada tim nema dostupnih članova koji mogu primiti lead (npr. svi članovi su zauzeti, nedostaju licence, ili tim nije aktivan).
5. Algoritam prvo pokušava dodijeliti lead timu, ali ako tim ne može primiti lead, automatski se prebacuje na direktora tvrtke.
6. Direktor dobiva lead kao fallback opciju, osiguravajući da lead ne ostane nedodijeljen.

**Očekivani rezultat:**
- Funkcionalnost "Fallback na direktora ako nema tima" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 28: Fer Billing Model

#### Test 1: Dinamički billing po volumenu leadova

**Opis:** Naplata paketa prilagođava se stvarnom volumenu leadova po kategoriji/regiji ÔÇô višak se naplaćuje, manjak kompenzira.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Dinamički billing po volumenu leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Sustav uspoređuje očekivani i isporučeni volumen leadova za paket i automatski obračunava razliku.
5. Ako je isporuka manja od garantirane, generira se korekcija (kredit, produženje perioda, popust).
6. Ako je volumen premašen, može se aktivirati surcharge ili preporuka za viši paket.

**Očekivani rezultat:**
- Funkcionalnost "Dinamički billing po volumenu leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Garancija minimalnog broja leadova

**Opis:** Paket garantira minimalan broj leadova; ako tržište ne isporuči kvotu, sustav automatski odobrava kompenzaciju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Garancija minimalnog broja leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Svaki plan definira minimalni broj leadova po kategoriji/regiji.
5. Na kraju perioda mjeri se isporuka; manjak pokreće kompenzaciju (krediti, produženje, popust) i šalje izvještaj direktoru.
6. Rezultati su vidljivi na billing dashboardu i u fakturama.

**Očekivani rezultat:**
- Funkcionalnost "Garancija minimalnog broja leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Automatsko snižavanje cijene ako nema leadova

**Opis:** Automatsko snižavanje cijene ako nema leadova osigurava da se klijentima automatski odobrava credit refund kada u obračunskom periodu nema isporučenih leadova, što predstavlja automatsko snižavanje cijene.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatsko snižavanje cijene ako nema leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Automatsko snižavanje cijene se aktivira kada u obračunskom periodu nema isporučenih leadova (deliveredLeads = 0).
5. Sustav automatski kreira BillingAdjustment s tipom CREDIT i odobrava puni credit za cijelu kvotu (adjustmentCredits = expectedLeads).
6. Credit se automatski dodaje na subscription balance klijenta, što predstavlja snižavanje cijene za sljedeći period.

**Očekivani rezultat:**
- Funkcionalnost "Automatsko snižavanje cijene ako nema leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Credit refund ako tržište miruje

**Opis:** Credit refund ako tržište miruje automatski vraća kredite klijentima kada u obračunskom periodu nema isporučenih leadova (0 leadova), što predstavlja kompenzaciju za mirno tržište.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Credit refund ako tržište miruje"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Credit refund se aktivira kada u obračunskom periodu nema isporučenih leadova (deliveredLeads = 0).
5. Sustav automatski pronalazi sve BillingAdjustment-e s tipom CREDIT i deliveredLeads = 0 koji su u statusu PENDING.
6. Za svaki takav adjustment, sustav automatski dodaje credit na subscription balance klijenta.

**Očekivani rezultat:**
- Funkcionalnost "Credit refund ako tržište miruje" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Proporcionalna naplata (REAL_VALUE)

**Opis:** REAL_VALUE faktor prilagođava cijenu paketa stvarnom volumenu leadova (plaća se proporcionalno isporuci).

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Proporcionalna naplata (REAL_VALUE)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Izračunava se faktor = min(isporučeni leadovi / očekivani leadovi, 1.0).
5. Konačna cijena = osnovna cijena ├Ś faktor; npr. očekivano 10, isporučeno 6 → factor 0.6 → naplata 60% cijene.
6. Faktor i sirovi podaci prikazuju se na fakturi i dashboardu radi transparentnosti.

**Očekivani rezultat:**
- Funkcionalnost "Proporcionalna naplata (REAL_VALUE)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Mjesečni izvještaj o isporučenim leadovima

**Opis:** Mjesečni izvještaj o isporučenim leadovima automatski generira i šalje klijentima detaljne izvještaje o isporučenim leadovima u obračunskom periodu, uključujući statistike, trendove i billing informacije.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Mjesečni izvještaj o isporučenim leadovima"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Mjesečni izvještaj se automatski generira na kraju svakog obračunskog perioda (obično mjesec dana).
5. Izvještaj uključuje detaljne informacije o isporučenim leadovima: ukupan broj, po kategorijama, po regijama, konverzija, ROI.
6. Izvještaj prikazuje usporedbu očekivanog i isporučenog volumena leadova s grafikonskim prikazom.

**Očekivani rezultat:**
- Funkcionalnost "Mjesečni izvještaj o isporučenim leadovima" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Carryover neiskorištenih leadova

**Opis:** Carryover neiskorištenih leadova omogućava da se neiskorišteni leadovi iz jednog obračunskog perioda prenesu u sljedeći period, što osigurava da klijenti ne gube leadove koje nisu iskoristili.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Carryover neiskorištenih leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Carryover se aktivira kada u obračunskom periodu nije isporučeno dovoljno leadova u odnosu na očekivani volumen (deliveredLeads < expectedLeads).
5. Neiskorišteni leadovi se automatski prenose u sljedeći obračunski period kao carryoverLeads.
6. U sljedećem periodu, efektivni očekivani volumen = baza (expectedLeads) + carryoverLeads iz prethodnog perioda.

**Očekivani rezultat:**
- Funkcionalnost "Carryover neiskorištenih leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Pauziranje kategorije bez naplate

**Opis:** Pauziranje kategorije bez naplate omogućava klijentima da privremeno pauziraju primanje leadova iz određene kategorije bez naplate za tu kategoriju u obračunskom periodu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Pauziranje kategorije bez naplate"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pauziranje kategorije se aktivira postavljanjem BillingPlan.isPaused = true za određenu kategoriju.
5. Kada je kategorija pauzirana, klijent ne prima leadove iz te kategorije u obračunskom periodu.
6. Pauzirana kategorija se ne naplaćuje u obračunskom periodu, što znači da se ne računaju expectedLeads za tu kategoriju.

**Očekivani rezultat:**
- Funkcionalnost "Pauziranje kategorije bez naplate" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 29: Paketi i Add-on Model

#### Test 1: Hijerarhijski model paketa (Basic → Pro → Premium)

**Opis:** Hijerarhijski model paketa omogućava korisnicima da odaberu i napreduju kroz tri razine paketa (Basic → Pro → Premium), svaki s različitim cijenama, kreditima i funkcionalnostima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Hijerarhijski model paketa (Basic → Pro → Premium)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Hijerarhijski model paketa sastoji se od tri razine: Basic, Pro i Premium, svaki s različitim cijenama i beneficijama.
5. Korisnici mogu odabrati bilo koji paket pri registraciji ili nadograditi postojeći paket na višu razinu.
6. Svaki paket ima određenu mjesečnu cijenu, alokaciju kredita i pristup različitim funkcionalnostima.

**Očekivani rezultat:**
- Funkcionalnost "Hijerarhijski model paketa (Basic → Pro → Premium)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Segmentni model paketa

**Opis:** Segmentni model paketa omogućava definiranje različitih paketa prema regijama ili kategorijama, što omogućava fleksibilniju strukturu paketa prilagođenu specifičnim tržišnim potrebama.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Segmentni model paketa"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Segmentni model paketa omogućava definiranje različitih paketa za različite regije ili kategorije usluga.
5. Svaki segment (regija ili kategorija) može imati svoj set paketa s različitim cijenama i beneficijama.
6. Korisnici mogu odabrati paket specifičan za njihovu regiju ili kategoriju interesa.

**Očekivani rezultat:**
- Funkcionalnost "Segmentni model paketa" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Feature ownership (funkcionalnosti ne nestaju)

**Opis:** Jednom otključane funkcionalnosti (CRM, Chat, StatistikaÔÇŽ) ostaju trajno u vlasništvu tvrtke i ne naplaćuju se ponovno, što osigurava da tvrtke ne plaćaju duplo za iste funkcionalnosti.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Feature ownership (funkcionalnosti ne nestaju)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Plaćanjem funkcionalnosti tvrtka dobiva trajno pravo korištenja bez ponovne naplate u budućim paketima.
5. Pri novoj kupnji uspoređujemo tražene feature s već otkupljenima i naplaćujemo samo razliku.
6. Primjer: Premium paket (Chat, CRM, Statistika) → kasnije Basic paket za novu kategoriju naplaćuje samo kategoriju.

**Očekivani rezultat:**
- Funkcionalnost "Feature ownership (funkcionalnosti ne nestaju)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Add-on paketi (regija, kategorija, krediti)

**Opis:** Add-oni proširuju osnovni plan novim regijama, kategorijama ili kreditima uz lifecycle (active → low balance → expired), omogućavajući fleksibilno širenje poslovanja bez mijenjanja osnovnog paketa.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Add-on paketi (regija, kategorija, krediti)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Direktor može kupiti dodatne regije, kategorije, kredite ili promo boost bez mijenjanja osnovnog plana.
5. Add-on prati status: ACTIVE → LOW_BALANCE (<20%) → EXPIRED/DEPLETED → GRACE_MODE (7 dana) → RENEWED.
6. Podsjetnici stižu na 80/50/20% potrošnje; nakon isteka pristup se pauzira dok se addon ne obnovi.

**Očekivani rezultat:**
- Funkcionalnost "Add-on paketi (regija, kategorija, krediti)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Automatska provjera postojećih funkcionalnosti

**Opis:** Automatska provjera postojećih funkcionalnosti osigurava da se pri kupnji novog paketa ili add-ona automatski provjerava koje funkcionalnosti tvrtka već posjeduje, što omogućava izračun točne doplate bez duplog plaćanja.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatska provjera postojećih funkcionalnosti"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pri kupnji novog paketa ili add-ona sustav automatski provjerava koje funkcionalnosti tvrtka već posjeduje kroz `CompanyFeatureOwnership` tablicu.
5. Sustav uspoređuje tražene funkcionalnosti s već otkupljenima i izračunava samo doplatu za nove funkcionalnosti.
6. Automatska provjera se izvršava u realnom vremenu pri checkout procesu, osiguravajući točan izračun cijene.

**Očekivani rezultat:**
- Funkcionalnost "Automatska provjera postojećih funkcionalnosti" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Smanjena cijena za nove pakete (bez duplikata)

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Smanjena cijena za nove pakete (bez duplikata)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Smanjena cijena za nove pakete (bez duplikata)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Grace period za Add-on (7 dana)

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Grace period za Add-on (7 dana)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Grace period za Add-on (7 dana)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Auto-renew opcija za Add-on

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Auto-renew opcija za Add-on"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Auto-renew opcija za Add-on" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Upozorenja pri 80%, 50%, 20% iskorištenosti

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Upozorenja pri 80%, 50%, 20% iskorištenosti"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Upozorenja pri 80%, 50%, 20% iskorištenosti" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Upsell mehanizam pri isteku Add-on

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Upsell mehanizam pri isteku Add-on"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Upsell mehanizam pri isteku Add-on" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 30: TRIAL Paket

#### Test 1: TRIAL = maksimalni paket funkcionalnosti

**Opis:** Trial od 14 dana aktivira sve Premium module (8 leadova, 2 kategorije, 1 regija) kako bi partner vidio punu vrijednost.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "TRIAL = maksimalni paket funkcionalnosti"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon registracije automatski se aktivira trial s limitima: 14 dana, 8 leadova (srednja vrijednost između 5-10), 2 kategorije, 1 regija.
5. Automatski se kreiraju add-on subscriptions za 2 aktivne kategorije i 1 regiju (Zagreb).
6. TRIAL ima sve Premium funkcionalnosti: AI_PRIORITY, SMS_NOTIFICATIONS, PRIORITY_SUPPORT, CSV_EXPORT, ADVANCED_ANALYTICS.

**Očekivani rezultat:**
- Funkcionalnost "TRIAL = maksimalni paket funkcionalnosti" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: 14-dnevni probni period

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "14-dnevni probni period"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "14-dnevni probni period" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Ograničen broj leadova (5-10)

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Ograničen broj leadova (5-10)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Ograničen broj leadova (5-10)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Ograničen broj kategorija/regija

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Ograničen broj kategorija/regija"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Ograničen broj kategorija/regija" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Sve Premium funkcionalnosti otključane

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Sve Premium funkcionalnosti otključane"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Sve Premium funkcionalnosti otključane" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Engagement tracking tijekom TRIAL-a

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Engagement tracking tijekom TRIAL-a"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Engagement tracking tijekom TRIAL-a" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Podsjetnici 3 dana prije isteka

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Podsjetnici 3 dana prije isteka"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Podsjetnici 3 dana prije isteka" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Automatski downgrade na BASIC nakon isteka

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatski downgrade na BASIC nakon isteka"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Automatski downgrade na BASIC nakon isteka" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Popust za upgrade iz TRIAL-a

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Popust za upgrade iz TRIAL-a"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Popust za upgrade iz TRIAL-a" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 31: Obostrano Ocjenjivanje (Detaljno)

#### Test 1: Korisnik ocjenjuje izvođača (kvaliteta, pouzdanost, cijena)

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Korisnik ocjenjuje izvođača (kvaliteta, pouzdanost, cijena)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Korisnik ocjenjuje izvođača (kvaliteta, pouzdanost, cijena)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Izvođač ocjenjuje korisnika (komunikacija, pouzdanost)

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Izvođač ocjenjuje korisnika (komunikacija, pouzdanost)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Izvođač ocjenjuje korisnika (komunikacija, pouzdanost)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Simultana objava ocjena (reciprocal delay)

**Opis:** Ocjene se objavljuju kad obje strane ocijene ili istekne rok, čime se sprječava osvetničko ocjenjivanje.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Simultana objava ocjena (reciprocal delay)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Nakon završetka posla obje strane daju ocjenu; obje ocjene ostaju skrivene dok i druga strana ne ocijeni.
5. Ako jedna strana ne ocijeni u roku (10 dana), pristigla ocjena se objavljuje po isteku roka.
6. Review se automatski objavljuje ako postoji recipročni review (druga strana je već ocijenila).

**Očekivani rezultat:**
- Funkcionalnost "Simultana objava ocjena (reciprocal delay)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Rok za ocjenjivanje (7-10 dana)

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Rok za ocjenjivanje (7-10 dana)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Rok za ocjenjivanje (7-10 dana)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Ocjene vidljive tek nakon obje strane ocijene

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Ocjene vidljive tek nakon obje strane ocijene"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Ocjene vidljive tek nakon obje strane ocijene" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Odgovor na recenziju (1x dozvoljen)

**Opis:** Korisnik koji je dobio recenziju može odgovoriti na nju, ali samo jednom. Odgovor je vidljiv javno uz originalnu recenziju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Odgovor na recenziju (1x dozvoljen)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik koji je dobio recenziju (toUserId) može odgovoriti na objavljenu recenziju.
5. Odgovor je dozvoljen samo jednom po recenziji (hasReplied flag sprječava višestruke odgovore).
6. Odgovor se može poslati samo na objavljene recenzije (isPublished = true).

**Očekivani rezultat:**
- Funkcionalnost "Odgovor na recenziju (1x dozvoljen)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Reputation Score izračun (ponderirane komponente)

**Opis:** Algoritam reputacije koristi ponderirane komponente: rating_quality (40%), rating_reliability (30%), rating_price_fairness (20%) i ResponseRate (10%). Rezultat utječe na dodjelu leadova.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Reputation Score izračun (ponderirane komponente)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Score = 0.4 ├Ś rating_quality + 0.3 ├Ś rating_reliability + 0.2 ├Ś rating_price_fairness + 0.1 ├Ś ResponseRate.
5. Rezultat upravlja queue prioritetom, listama ÔÇťNajbolje ocijenjeni izvođačiÔÇŁ i popustima/bonusima.
6. Pragovi: >4.7 donosi +20 % više leadova, <3.5 aktivira reviziju i smanjuje vidljivost; bez ocjena → samo testni leadovi.

**Očekivani rezultat:**
- Funkcionalnost "Reputation Score izračun (ponderirane komponente)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Utjecaj ocjena na dodjelu leadova

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Utjecaj ocjena na dodjelu leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Utjecaj ocjena na dodjelu leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 9: Moderacija ocjena (AI + ljudska)

**Opis:** Automatska AI provjera sadržaja recenzija i ljudska moderacija kroz admin panel. Sprječava spam, neprikladan sadržaj i osigurava kvalitetu recenzija.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Moderacija ocjena (AI + ljudska)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. AI automatski provjerava svaku recenziju pri kreiranju (provjera spam-a, zabranjenih riječi, linkova, email-ova, telefona).
5. Recenzije se kategoriziraju u tri kategorije: APPROVED (automatski odobreno), PENDING (zahtijeva ljudsku moderaciju), REJECTED (automatski odbijeno).
6. Admin može pregledati recenzije koje čekaju moderaciju i odobriti/odbijati ih.

**Očekivani rezultat:**
- Funkcionalnost "Moderacija ocjena (AI + ljudska)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 10: Prijava lažnih ocjena

**Opis:** Korisnici mogu prijaviti lažne ocjene koje su dobili. Admin pregledava prijave i može prihvatiti (ukloniti recenziju) ili odbiti (ostaviti recenziju).

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Prijava lažnih ocjena"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik koji je dobio recenziju (toUserId) može prijaviti recenziju kao lažnu s razlogom.
5. Prijava se automatski šalje adminima na pregled.
6. Admin može prihvatiti prijavu (recenzija se uklanja i označava kao lažna) ili odbiti prijavu (recenzija ostaje objavljena).

**Očekivani rezultat:**
- Funkcionalnost "Prijava lažnih ocjena" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 32: Verifikacija Identiteta

#### Test 1: OIB / IBAN verifikacija (API)

**Opis:** Automatska provjera OIB-a i IBAN-a putem API-ja (Sudski registar, CompanyWall). Obavezna za aktivaciju leadova.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "OIB / IBAN verifikacija (API)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Tvrtka unosi OIB i IBAN u registraciji; sustav šalje upit službenim registrima (Sudski registar, CompanyWall).
5. Odgovor se uspoređuje s unesenim podacima (naziv, adresa, status); uspješna provjera dodjeljuje ÔÇťVerified PartnerÔÇŁ oznaku.
6. Neuspješna provjera blokira aktivaciju leadova dok se podaci ne isprave ili admin ne odobri ručno.

**Očekivani rezultat:**
- Funkcionalnost "OIB / IBAN verifikacija (API)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Dokaz o licenciji / obrtu (upload)

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Dokaz o licenciji / obrtu (upload)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Dokaz o licenciji / obrtu (upload)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Email i telefonska potvrda (SMS)

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Email i telefonska potvrda (SMS)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Email i telefonska potvrda (SMS)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Korisnički ugovor / ToS (e-potpis)

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Korisnički ugovor / ToS (e-potpis)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Korisnički ugovor / ToS (e-potpis)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: GDPR revizija i transparentnost

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "GDPR revizija i transparentnost"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "GDPR revizija i transparentnost" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Verified Partner oznaka

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Verified Partner oznaka"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Verified Partner oznaka" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 33: Onboarding i Automatizacija

#### Test 1: Wizard registracije (odabir kategorija i regija)

**Opis:** Interaktivni wizard koji vodi novu tvrtku kroz registraciju. Omogućava odabir kategorija i regija u kojima želi raditi.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Wizard registracije (odabir kategorija i regija)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnik prolazi kroz korake: osnovni podaci, odabir kategorija, odabir regija, tim, licence i potvrda.
5. Sustav validira svaki korak, sprema privremeni napredak i na kraju automatski aktivira TRIAL paket.
6. Nakon završetka wizard šalje onboarding upute i ističe ograničenja (npr. 5-10 leadova u trialu).

**Očekivani rezultat:**
- Funkcionalnost "Wizard registracije (odabir kategorija i regija)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Automatska aktivacija TRIAL-a

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatska aktivacija TRIAL-a"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti

**Očekivani rezultat:**
- Funkcionalnost "Automatska aktivacija TRIAL-a" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Chat-bot vodi za prvi lead

**Opis:** Interaktivni chat-bot koji vodi novog korisnika kroz prvi lead - od kupnje do završetka posla.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Chat-bot vodi za prvi lead"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Chat-bot se automatski pokreće kada korisnik kupi svoj prvi lead.
5. Vodi korisnika kroz 5 koraka: kupnja leada, kontaktiranje klijenta, slanje poruke, priprema ponude, slanje ponude.
6. Svaki korak ima svoju poruku i akciju koja vodi korisnika dalje.

**Očekivani rezultat:**
- Funkcionalnost "Chat-bot vodi za prvi lead" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Automatski email + popust link pri isteku TRIAL-a

**Opis:** Automatski email s popust linkom se šalje korisnicima čiji je TRIAL period istekao. Email uključuje 20% popust na prvu pretplatu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Automatski email + popust link pri isteku TRIAL-a"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Cron job provjerava svaki sat TRIAL pretplate koje su istekle danas (u zadnja 24h).
5. Korisnik dobiva HTML email s detaljnim informacijama o isteku TRIAL-a.
6. Email uključuje popust link koji automatski primjenjuje 20% popust pri checkout-u.

**Očekivani rezultat:**
- Funkcionalnost "Automatski email + popust link pri isteku TRIAL-a" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Podsjetnici za neaktivnost (>14 dana)

**Opis:** Automatski email podsjetnici se šalju korisnicima koji nisu bili aktivni više od 14 dana. Email uključuje poziv na povratak i link na dashboard.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Podsjetnici za neaktivnost (>14 dana)"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Cron job provjerava svaki dan u 8:00 korisnike koji nisu bili aktivni >14 dana.
5. Provjerava se kombinacija aktivnosti: login, lead purchase, chat poruke, ponude, i updatedAt iz User modela.
6. Korisnik dobiva HTML email s pozivom na povratak i linkom na dashboard.

**Očekivani rezultat:**
- Funkcionalnost "Podsjetnici za neaktivnost (>14 dana)" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Edukacijski materijali i vodiči

**Opis:** Edukacijski materijali i vodiči pomažu korisnicima da nauče kako koristiti Uslugar platformu. Uključuje vodiče za kupovinu leadova, slanje ponuda, komunikaciju s klijentima i optimizaciju profila.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Edukacijski materijali i vodiči"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Korisnici mogu pristupiti edukacijskim materijalima kroz API endpoint `/api/documentation/guides`.
5. Vodiči su organizirani u kategoriju "Edukacijski materijali i vodiči" u DocumentationCategory modelu.
6. Svaki vodič sadrži naslov, sažetak, detaljni sadržaj i redoslijed prikaza.

**Očekivani rezultat:**
- Funkcionalnost "Edukacijski materijali i vodiči" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

## Kategorija 34: Edukacijski materijali i vodiči

#### Test 1: Kako kupiti prvi lead

**Opis:** Vodič kroz proces kupovine prvog leada na Uslugar platformi. Objašnjava kako pronaći kvalitetne leadove, procijeniti AI score i kupiti lead.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kako kupiti prvi lead"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Pregledajte dostupne leadove u vašoj kategoriji i regiji.
5. Provjerite AI quality score (0-100) - viši score = kvalitetniji lead.
6. Pročitajte detalje posla (budžet, lokacija, opis).

**Očekivani rezultat:**
- Funkcionalnost "Kako kupiti prvi lead" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 2: Kako napraviti profesionalnu ponudu

**Opis:** Savjeti za kreiranje uspješnih ponuda koje privlače klijente. Uključuje strukturu ponude, cijene, rokovi i komunikaciju.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kako napraviti profesionalnu ponudu"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Detaljno opišite što ćete napraviti.
5. Postavite realnu cijenu koja odgovara tržištu.
6. Navedite rok izvršenja posla.

**Očekivani rezultat:**
- Funkcionalnost "Kako napraviti profesionalnu ponudu" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 3: Kako optimizirati profil

**Opis:** Vodič za optimizaciju provider profila kako bi privukli više klijenata. Uključuje bio, portfolio, kategorije, regije i verifikacije.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kako optimizirati profil"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Dodajte detaljan bio s iskustvom i kvalifikacijama.
5. Uključite portfolio slika prethodnih radova.
6. Odaberite relevantne kategorije i regije.

**Očekivani rezultat:**
- Funkcionalnost "Kako optimizirati profil" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 4: Kako komunicirati s klijentima

**Opis:** Best practices za chat komunikaciju s klijentima. Uključuje profesionalnu komunikaciju, odgovaranje na pitanja i upravljanje očekivanjima.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kako komunicirati s klijentima"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Odgovarajte brzo (unutar 24h).
5. Budite profesionalni i ljubazni.
6. Jasno komunicirajte o cijenama i rokovima.

**Očekivani rezultat:**
- Funkcionalnost "Kako komunicirati s klijentima" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 5: Kako pratiti ROI

**Opis:** Vodič za korištenje ROI dashboarda. Objašnjava kako pratiti profitabilnost, analizirati statistike i optimizirati performanse.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kako pratiti ROI"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Otvorite ROI dashboard u profilu.
5. Pregledajte statistike (leadovi kupljeni, konverzije, prihodi).
6. Analizirajte trendove kroz različite periode.

**Očekivani rezultat:**
- Funkcionalnost "Kako pratiti ROI" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 6: Kako koristiti TRIAL period

**Opis:** Vodič za TRIAL korisnike. Objašnjava što dobivate s TRIAL-om, kako koristiti kredite i kako nadograditi na plaćenu pretplatu.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Kako koristiti TRIAL period"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. TRIAL traje 14 dana i uključuje 8 besplatnih leadova.
5. Dobivate sve Premium funkcionalnosti (AI prioritet, SMS notifikacije, CSV export).
6. Automatski dobivate 2 kategorije i 1 regiju (add-on paketi).

**Očekivani rezultat:**
- Funkcionalnost "Kako koristiti TRIAL period" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 7: Vodič za refund proces

**Opis:** Objašnjava kako zatražiti refund za neaktivne leadove. Uključuje uvjete za refund, proces traženja i automatski refund.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Vodič za refund proces"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Ako klijent ne odgovori unutar 48h, možete zatražiti refund.
5. Automatski refund se aktivira ako niste kontaktirali klijenta unutar 48h.
6. Refund vraća kredite na vaš račun.

**Očekivani rezultat:**
- Funkcionalnost "Vodič za refund proces" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

#### Test 8: Best practices za konverziju leadova

**Opis:** Savjeti za povećanje stope konverzije leadova u uspješne poslove. Uključuje strategije za komunikaciju, ponude i follow-up.

**Koraci:**
1. Otvori stranicu sa funkcionalnošću "Best practices za konverziju leadova"
2. Provjeri da li je funkcionalnost dostupna i vidljiva
3. Testiraj osnovne akcije funkcionalnosti
4. Odgovarajte brzo na leadove (unutar 24h).
5. Kreirajte profesionalne i detaljne ponude.
6. Komunicirajte jasno o cijenama i rokovima.

**Očekivani rezultat:**
- Funkcionalnost "Best practices za konverziju leadova" je dostupna i radi ispravno
- UI elementi su prikazani ispravno
- Funkcionalnost je implementirana i funkcionalna

---

