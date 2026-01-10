// Seed skripta za dokumentaciju funkcionalnosti 
// Automatski generirano iz Documentation.jsx

import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const prisma = new PrismaClient();

// Features struktura - ekstraktirano iz Documentation.jsx
const features = [
    {
      category: "Registracija i Autentifikacija",
      items: [
        { name: "Registracija korisnika usluge", implemented: true },
        { name: "Registracija pružatelja usluga", implemented: true },
        { name: "Prijava korisnika", implemented: true },
        { name: "Email verifikacija", implemented: true },
        { name: "Resetiranje lozinke", implemented: true },
        { name: "Zaboravljena lozinka", implemented: true },
        { name: "JWT token autentifikacija", implemented: true },
        { name: "Različite uloge korisnika (USER, PROVIDER, ADMIN)", implemented: true },
        { name: "Wizard registracije (odabir kategorija i regija)", implemented: true } // Implementirano: GET /api/wizard/categories, GET /api/wizard/regions, GET /api/wizard/status, POST /api/wizard/categories, POST /api/wizard/regions, POST /api/wizard/complete
      ]
    },
    {
      category: "Upravljanje Kategorijama",
      items: [
        { name: "51 kategorija usluga", implemented: true },
        { name: "Dinamičko učitavanje kategorija iz baze", implemented: true },
        { name: "Emoji ikone za kategorije", implemented: true },
        { name: "Opisi kategorija", implemented: true },
        { name: "NKD kodovi djelatnosti", implemented: true },
        { name: "Oznake za licencirane djelatnosti", implemented: true },
        { name: "Tipovi licenci (Elektrotehnička, Građevinska, itd.)", implemented: true },
        { name: "Tijela koja izdaju licence", implemented: true },
        { name: "Hijerarhijska struktura kategorija", implemented: true },
        { name: "Filtriranje poslova po kategorijama", implemented: true }
      ]
    },
    {
      category: "Upravljanje Poslovima",
      items: [
        { name: "Objavljivanje novih poslova", implemented: true },
        { name: "Detaljni opis posla", implemented: true },
        { name: "Postavljanje budžeta (min-max)", implemented: true },
        { name: "Lokacija posla (grad)", implemented: true },
        { name: "Geolokacija (latitude/longitude)", implemented: true },
        { name: "Slike posla", implemented: true },
        { name: "Status posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN)", implemented: true },
        { name: "Hitnost posla (NORMALNA, HITNA)", implemented: true },
        { name: "Veličina posla (MALA, SREDNJA, VELIKA)", implemented: true },
        { name: "Rok izvršenja", implemented: true },
        { name: "Pretraživanje poslova", implemented: true },
        { name: "Filtriranje po kategoriji, lokaciji, budžetu", implemented: true },
        { name: "Pregled detalja posla", implemented: true },
        { name: "Moderna tražilica poslova (sticky search bar)", implemented: true },
        { name: "Napredni filteri (kategorija, grad, budžet, status, datum)", implemented: true },
        { name: "Sortiranje poslova (najnoviji, najstariji, budžet visok→nizak, budžet nizak→visok)", implemented: true },
        { name: "View mode - Grid i List prikaz poslova", implemented: true },
        { name: "Spremljene pretrage (saved searches)", implemented: true },
        { name: "Job alerts - email notifikacije za nove poslove", implemented: true },
        { name: "Frekvencije job alertova (DAILY, WEEKLY, INSTANT)", implemented: true },
        { name: "Upravljanje spremljenim pretragama u profilu", implemented: true },
        { name: "Upravljanje job alertovima u profilu", implemented: true },
        { name: "Quick filters u tražilici", implemented: true },
        { name: "Prikaz broja pronađenih poslova", implemented: true },
        { name: "Očisti filtere funkcionalnost", implemented: true }
      ]
    },
    {
      category: "Sustav Ponuda",
      items: [
        { name: "Slanje ponuda za poslove", implemented: true },
        { name: "Iznos ponude", implemented: true },
        { name: "Poruka uz ponudu", implemented: true },
        { name: "Status ponude (NA ČEKANJU, PRIHVAĆENA, ODBIJENA)", implemented: true },
        { name: "Mogućnost pregovaranja o cijeni", implemented: true },
        { name: "Označavanje ponuda kao pregovorno", implemented: true },
        { name: "Procijenjeni broj dana za izvršenje", implemented: true },
        { name: "Pregled svih ponuda za posao", implemented: true },
        { name: "Prihvaćanje/odbijanje ponuda", implemented: true }
      ]
    },
    {
      category: "Sustav Bodovanja i Recenzija",
      items: [
        { name: "Ocjenjivanje pružatelja usluga (1-5 zvjezdica)", implemented: true },
        { name: "Komentiranje iskustva s pružateljem", implemented: true },
        { name: "Bilateralno ocjenjivanje (korisnik ↔ pružatelj)", implemented: true },
        { name: "Sprečavanje duplikata recenzija", implemented: true },
        { name: "Uređivanje postojećih recenzija", implemented: true },
        { name: "Brisanje recenzija", implemented: true },
        { name: "Automatsko izračunavanje prosječne ocjene", implemented: true },
        { name: "Brojanje ukupnog broja recenzija", implemented: true },
        { name: "Prikaz recenzija na profilu pružatelja", implemented: true },
      ]
    },
    {
      category: "Profili Pružatelja",
      items: [
        { name: "Detaljni profil pružatelja", implemented: true },
        { name: "Biografija pružatelja", implemented: true },
        { name: "Specijalizacije", implemented: true },
        { name: "Godine iskustva", implemented: true },
        { name: "Web stranica", implemented: true },
        { name: "Područje rada", implemented: true },
        { name: "Status dostupnosti", implemented: true },
        { name: "Kategorije u kojima radi", implemented: true },
        { name: "Odabir kategorija za primanje leadova", implemented: true },
        { name: "Filtriranje leadova po kategorijama", implemented: true },
        { name: "Portfolio radova", implemented: true },
        { name: "Certifikati i licence", implemented: true },
        { name: "Pregled svih pružatelja", implemented: true },
        { name: "Filtriranje pružatelja", implemented: true },
        { name: "Team Locations - geo-dinamičke lokacije", implemented: true },
        { name: "Upravljanje tim lokacijama", implemented: true },
        { name: "Radius checking za lokacije", implemented: true },
        { name: "Haversine formula za udaljenost", implemented: true }
      ]
    },
    {
      category: "Chat i Komunikacija",
      items: [
        { name: "Real-time chat između korisnika i pružatelja", implemented: true },
        { name: "Chat sobe za svaki posao", implemented: true },
        { name: "Povijest poruka", implemented: true },
        { name: "Slanje slika u chatu", implemented: true },
        { name: "Notifikacije za nove poruke", implemented: true },
        { name: "Status poruke (poslana, pročitana)", implemented: true }
      ]
    },
    {
      category: "Notifikacije",
      items: [
        { name: "Notifikacije za nove ponude", implemented: true },
        { name: "Notifikacije za prihvaćene ponude", implemented: true },
        { name: "Notifikacije za nove poruke", implemented: true },
        { name: "Notifikacije za nove poslove (providere)", implemented: true },
        { name: "Email notifikacije", implemented: true },
        { name: "SMS notifikacije (Twilio)", implemented: true },
        { name: "In-app notifikacije", implemented: true },
        { name: "Push notifikacije (browser notifications)", implemented: true },
        { name: "Brojač nepročitanih notifikacija", implemented: true }
      ]
    },
    {
      category: "USLUGAR EXCLUSIVE Funkcionalnosti",
      items: [
        { name: "Ekskluzivni lead sustav", implemented: true },
        { name: "Tržište leadova", implemented: true },
        { name: "Kreditni sustav", implemented: true },
        { name: "Cijene leadova (10-20 kredita)", implemented: true },
        { name: "Kupnja leadova", implemented: true },
        { name: "ROI dashboard", implemented: true },
        { name: "Moji leadovi", implemented: true },
        { name: "Red čekanja za leadove", implemented: true },
        { name: "AI score kvalitete leadova", implemented: true },
        { name: "Verifikacija klijenata", implemented: true },
        { name: "Pretplata na leadove", implemented: true },
        { name: "Statistike uspješnosti", implemented: true },
        { name: "VIP podrška 24/7 (Support tickets)", implemented: true }, // Implementirano: Support ticket sustav, live chat widget (PRO korisnici), 24/7 monitoring, automatski routing VIP ticketa, real-time chat podrška kroz Socket.io
        { name: "White-label opcija (PRO plan)", implemented: true }
      ]
    },
    {
      category: "Queue Sustav za Distribuciju Leadova",
      items: [
        { name: "Red čekanja za leadove (LeadQueue)", implemented: true },
        { name: "Pozicija u redu čekanja", implemented: true },
        { name: "Statusi u redu (WAITING, OFFERED, ACCEPTED, DECLINED, EXPIRED, SKIPPED)", implemented: true },
        { name: "Automatska distribucija leadova", implemented: true },
        { name: "Rok za odgovor (24h)", implemented: true },
        { name: "Odgovori providera (INTERESTED, NOT_INTERESTED, NO_RESPONSE)", implemented: true },
        { name: "Preskakanje neaktivnih providera", implemented: true },
        { name: "Queue scheduler (provjera svakih sat vremena)", implemented: true },
        { name: "Notifikacije za nove leadove u redu", implemented: true },
        { name: "Pregled mojih leadova u redu", implemented: true },
        { name: "Statistike queue sustava", implemented: true },
      ]
    },
    {
      category: "Refund i Povrat Kredita",
      items: [
        { name: "Refund kredita (vraćanje internih kredita)", implemented: true },
        { name: "Stripe Payment Intent refund API (PSD2 compliant)", implemented: true },
        { name: "Automatski odabir refund metode (Stripe API ili interni krediti)", implemented: true },
        { name: "Refund ako klijent ne odgovori u roku", implemented: true },
        { name: "Razlozi za refund (klijent ne odgovori, itd.)", implemented: true },
        { name: "Ručno zatraživanje refund-a", implemented: true },
        { name: "Povijest refund transakcija (CreditTransaction tip REFUND)", implemented: true },
        { name: "Status refund-a (REFUNDED)", implemented: true },
        { name: "Oslobađanje leada nakon refund-a (lead se vraća na tržište)", implemented: true },
        { name: "Stripe refund ID tracking (stripeRefundId)", implemented: true },
        { name: "Fallback na interne kredite ako Stripe refund ne uspije", implemented: true },
        { name: "Povrat novca za pretplate (refund subscription payment)", implemented: true },
        { name: "Automatski refund nakon 48h neaktivnosti", implemented: true }
      ]
    },
    {
      category: "Upravljanje Pretplatama",
      items: [
        { name: "Pregled trenutne pretplate", implemented: true },
        { name: "Dostupni planovi (BASIC, PREMIUM, PRO)", implemented: true },
        { name: "Nadogradnja pretplate", implemented: true }, // Implementirano: Prorated billing - proporcionalna naplata za upgrade/downgrade, izračun preostalih dana, automatska prilagodba cijene u Stripe checkout
        { name: "Otkazivanje pretplate", implemented: true },
        { name: "Status pretplate (ACTIVE, CANCELLED, EXPIRED)", implemented: true },
        { name: "Automatsko isteka pretplate", implemented: true },
        { name: "Notifikacije o isteku pretplate", implemented: true },
        { name: "Povijest pretplata", implemented: true },
        { name: "Trial period (7 dana)", implemented: true },
        { name: "Besplatni krediti za trial (5 leadova)", implemented: true },
        { name: "Automatsko vraćanje na BASIC plan", implemented: true }
      ]
    },
    {
      category: "Pravni Status i Verifikacija",
      items: [
        { name: "Različiti pravni statusi (Fizička osoba, Obrt, d.o.o., j.d.o.o., itd.)", implemented: true },
        { name: "OIB validacija", implemented: true },
        { name: "Naziv tvrtke/obrta", implemented: true },
        { name: "Auto-verifikacija naziva tvrtke (Sudski registar, Obrtni registar)", implemented: true }, // Implementirano: Prava integracija s Sudskim registrom API (OAuth), scraping Obrtnog registra, automatska provjera pri registraciji
        { name: "Porezni broj", implemented: true },
        { name: "Email verifikacija", implemented: true },
        { name: "SMS verifikacija telefonskog broja (Twilio)", implemented: true },
        { name: "DNS TXT record verifikacija domena", implemented: true },
        { name: "Email verifikacija na domeni tvrtke", implemented: true }, // Implementirano: Slanje verifikacijskog emaila na company email adresu, verifikacijski token, endpoint za verifikaciju i resend
        { name: "Identity Badge sustav (Email, Phone, DNS, Business značke)", implemented: true },
        { name: "Datum verifikacije za svaku značku", implemented: true },
        { name: "Prikaz znački na profilu pružatelja", implemented: true },
        { name: "Dokumenti za verifikaciju", implemented: true }
      ]
    },
    {
      category: "Identity Badge Sustav i Verifikacije",
      items: [
        { name: "Email Identity Badge (značka)", implemented: true },
        { name: "Phone Identity Badge (SMS verifikacija)", implemented: true },
        { name: "DNS Identity Badge (TXT record)", implemented: true },
        { name: "Business Badge (tvrtka/obrt verifikacija)", implemented: true },
        { name: "Prikaz datuma verifikacije", implemented: true },
        { name: "Status verifikacije na profilu", implemented: true },
        { name: "Identity Badge Verifikacija komponenta", implemented: true },
        { name: "Rate limiting za SMS verifikaciju", implemented: true },
        { name: "Verifikacijski kod expiration (10 minuta)", implemented: true }
      ]
    },
    {
      category: "Reputacijski Sustav",
      items: [
        { name: "Prosječno vrijeme odgovora (avgResponseTimeMinutes)", implemented: true },
        { name: "Stopa konverzije leadova (conversionRate)", implemented: true },
        { name: "Praćenje vremena odgovora na leadove", implemented: true },
        { name: "Automatsko izračunavanje reputacije", implemented: true },
        { name: "Prikaz reputacije na profilu", implemented: true },
        { name: "Integracija s lead matching algoritmom", implemented: true }
      ]
    },
    {
      category: "Korisnici Usluge (Service Users)",
      items: [
        { name: "Registracija kao korisnik usluge", implemented: true },
        { name: "Odabir tipa korisnika (Korisnik usluge / Pružatelj usluge)", implemented: true },
        { name: "Fizička osoba vs Pravna osoba za korisnike", implemented: true },
        { name: "Profil korisnika usluge (UserProfile)", implemented: true },
        { name: "Objavljivanje poslova od strane korisnika", implemented: true },
        { name: "Pregled vlastitih poslova (MyJobs)", implemented: true },
        { name: "Primanje ponuda za poslove", implemented: true },
        { name: "Prihvaćanje ponuda", implemented: true },
        { name: "Navigacija specifična za korisnike usluge", implemented: true },
        { name: "Sakrivanje provider-specifičnih linkova za korisnike", implemented: true }
      ]
    },
    {
      category: "Plaćanja i Stripe Integracija",
      items: [
        { name: "Stripe Checkout integracija", implemented: true },
        { name: "Plaćanje pretplata preko Stripe", implemented: true },
        { name: "Stripe Payment Intent za kupovinu leadova", implemented: true },
        { name: "Kreiranje Payment Intent-a za pojedinačnu kupovinu leada", implemented: true },
        { name: "Plaćanje leadova kroz Stripe (opcionalno, umjesto internih kredita)", implemented: true },
        { name: "Stripe webhook handling", implemented: true },
        { name: "Automatsko ažuriranje pretplate nakon plaćanja", implemented: true },
        { name: "Payment success/failure handling", implemented: true },
        { name: "Povrat na platformu nakon plaćanja", implemented: true },
        { name: "Sigurnosno skladištenje Stripe secret key u AWS Secrets Manager", implemented: true },
        { name: "Fakturiranje (PDF fakture za pretplate i kupovine)", implemented: true },
        { name: "Povrat novca za pretplate (refund subscription payment)", implemented: true }
      ]
    },
    {
      category: "Upravljanje Licencama",
      items: [
        { name: "Upload dokumenata licenci", implemented: true },
        { name: "Praćenje isteka licenci", implemented: true },
        { name: "Različiti tipovi licenci po kategorijama", implemented: true },
        { name: "Tijela koja izdaju licence", implemented: true },
        { name: "Broj licence i datum izdavanja", implemented: true },
        { name: "Notifikacije o isteku licenci", implemented: true },
        { name: "Automatska provjera valjanosti licenci", implemented: true },
        { name: "Skener dokumenata za licence", implemented: true }
      ]
    },
    {
      category: "Verifikacija Klijenata i Trust Score",
      items: [
        { name: "Trust score sustav (0-100)", implemented: true },
        { name: "Verificiranje telefona", implemented: true },
        { name: "Verificiranje emaila", implemented: true },
        { name: "Verificiranje OIB-a", implemented: true },
        { name: "Verificiranje firme (sudski registar)", implemented: true },
        { name: "Kvaliteta leadova na osnovu verifikacije", implemented: true },
        { name: "Automatska verifikacija", implemented: true },
        { name: "Dokument upload za verifikaciju", implemented: true },
        { name: "Notifikacije o verifikaciji", implemented: true }
      ]
    },
    {
      category: "ROI Analitika i Statistike",
      items: [
        { name: "ROI dashboard za providere", implemented: true },
        { name: "Konverzija leadova", implemented: true },
        { name: "Ukupan prihod od leadova", implemented: true },
        { name: "Prosječna vrijednost leada", implemented: true },
        { name: "Ukupno potrošenih kredita", implemented: true },
        { name: "Ukupno konvertiranih leadova", implemented: true },
        { name: "Napredne analitike", implemented: true },
        { name: "Mesečni/godišnji izvještaji", implemented: true },
        { name: "Grafički prikaz statistika", implemented: true },
        { name: "Usporedba s drugim providerima", implemented: true },
        { name: "Predviđanje budućih performansi", implemented: true }
      ]
    },
    {
      category: "Povijest Transakcija i Krediti",
      items: [
        { name: "Detaljno praćenje kredita", implemented: true },
        { name: "Različiti tipovi transakcija", implemented: true },
        { name: "Povezivanje s poslovima", implemented: true },
        { name: "Povezivanje s kupnjama leadova", implemented: true },
        { name: "Stanje nakon svake transakcije", implemented: true },
        { name: "Opisi transakcija", implemented: true },
        { name: "Filtriranje transakcija po tipu", implemented: true },
        { name: "Izvoz povijesti transakcija", implemented: true },
        { name: "Notifikacije o transakcijama", implemented: true }
      ]
    },
    {
      category: "Cjenik i Plaćanja",
      items: [
        { name: "Pregled cjenika", implemented: true },
        { name: "Različiti paketi pretplate (BASIC, PREMIUM, PRO)", implemented: true },
        { name: "Kreditni sustav", implemented: true },
        { name: "Povijest transakcija", implemented: true },
        { name: "Refund kredita (vraćanje internih kredita)", implemented: true },
        { name: "Stripe Payment Intent refund API (PSD2)", implemented: true },
        { name: "Automatski odabir refund metode ovisno o načinu plaćanja", implemented: true },
        { name: "Refund ako klijent ne odgovori u roku", implemented: true },
        { name: "Razlozi za refund (klijent ne odgovori, itd.)", implemented: true },
        { name: "Otkazivanje pretplate", implemented: true },
        { name: "Status pretplate (ACTIVE, CANCELLED, EXPIRED)", implemented: true },
        { name: "Automatsko isteka pretplate", implemented: true },
        { name: "Notifikacije o isteku pretplate", implemented: true },
        { name: "Online plaćanje (Stripe Checkout)", implemented: true },
        { name: "Fakturiranje (PDF fakture za pretplate i kupovine)", implemented: true },
        { name: "Povrat novca za pretplate (refund subscription payment)", implemented: true }
      ]
    },
    {
      category: "Korisničko Iskustvo",
      items: [
        { name: "Responsive dizajn (mobilni, tablet, desktop)", implemented: true },
        { name: "Intuitivno korisničko sučelje", implemented: true },
        { name: "Brzo učitavanje stranica", implemented: true },
        { name: "Pretraživanje u realnom vremenu", implemented: true },
        { name: "Filtriranje i sortiranje", implemented: true },
        { name: "Dark mode", implemented: true },
        { name: "Lokalizacija (hrvatski jezik)", implemented: true },
        { name: "Pristupačnost (accessibility)", implemented: true }
      ]
    },
    {
      category: "Upravljanje Tvrtkama i Timovima",
      items: [
        { name: "Tvrtka kao pravni entitet", implemented: true },
        { name: "Direktor kao administrator profila", implemented: true },
        { name: "Team članovi (operativci)", implemented: true },
        { name: "Dodavanje članova tima", implemented: true },
        { name: "Upravljanje pravima tima", implemented: true },
        { name: "Interna distribucija leadova unutar tvrtke", implemented: true },
        { name: "Tvrtka bez tima (solo firma)", implemented: true },
        { name: "Auto-assign leadova timu", implemented: true },
        { name: "Ručna dodjela leadova od strane direktora", implemented: true },
        { name: "Pregled aktivnosti tima", implemented: true },
        { name: "Direktor Dashboard - upravljanje timovima", implemented: true },
        { name: "Direktor Dashboard - pristup financijama", implemented: true },
        { name: "Direktor Dashboard - ključne odluke", implemented: true }
      ]
    },
    {
      category: "Chat Sustav (PUBLIC i INTERNAL)",
      items: [
        { name: "PUBLIC chat (Klijent ↔ Tvrtka)", implemented: true },
        { name: "INTERNAL chat (Direktor ↔ Team)", implemented: true },
        { name: "Maskirani kontakti do prihvata ponude", implemented: true },
        { name: "Chat thread vezan uz upit/ponudu", implemented: true },
        { name: "Privici u chatu (fotke, PDF ponude)", implemented: true },
        { name: "Verzioniranje poruka", implemented: true },
        { name: "Audit log svih poruka", implemented: true },
        { name: "Zaključavanje threada nakon završetka", implemented: true },
        { name: "SLA podsjetnici za odgovor", implemented: true },
        { name: "Moderacija chat poruka", implemented: true }
      ]
    },
    {
      category: "Weighted Queue i Partner Scoring",
      items: [
        { name: "Weighted Queue algoritam", implemented: true },
        { name: "Partner Score izračun", implemented: true },
        { name: "Reputation Score (0-100)", implemented: true },
        { name: "Response Rate mjerenje", implemented: true },
        { name: "Completion Rate tracking", implemented: true },
        { name: "Platform Compliance Score", implemented: true },
        { name: "Premium Partner tier (Score ≥ 80)", implemented: true },
        { name: "Verified Partner tier (Score 60-79)", implemented: true },
        { name: "Basic Partner tier (Score < 60)", implemented: true },
        { name: "Auto-assign prioritet za Premium partnere", implemented: true },
        { name: "Fairness algoritam (sprečava previše leadova istom partneru)", implemented: true }
      ]
    },
    {
      category: "Matchmaking Kategorija",
      items: [
        { name: "Usporedba kategorija korisnika i tvrtke", implemented: true },
        { name: "Usporedba kategorija korisnika i tima", implemented: true },
        { name: "Kombinirani match score (Tvrtka + Tim)", implemented: true },
        { name: "Eligibility filter po kategoriji", implemented: true },
        { name: "Eligibility filter po regiji", implemented: true },
        { name: "Prioritet timu s boljim matchom", implemented: true },
        { name: "Fallback na direktora ako nema tima", implemented: true }
      ]
    },
    {
      category: "Fer Billing Model",
      items: [
        { name: "Dinamički billing po volumenu leadova", implemented: true },
        { name: "Garancija minimalnog broja leadova", implemented: true },
        { name: "Automatsko snižavanje cijene ako nema leadova", implemented: true },
        { name: "Credit refund ako tržište miruje", implemented: true },
        { name: "Proporcionalna naplata (REAL_VALUE)", implemented: true },
        { name: "Mjesečni izvještaj o isporučenim leadovima", implemented: true },
        { name: "Carryover neiskorištenih leadova", implemented: true },
        { name: "Pauziranje kategorije bez naplate", implemented: true }
      ]
    },
    {
      category: "Paketi i Add-on Model",
      items: [
        { name: "Hijerarhijski model paketa (Basic → Pro → Premium)", implemented: true },
        { name: "Segmentni model paketa (po regiji/kategoriji)", implemented: true },
        { name: "Feature ownership (funkcionalnosti ne nestaju)", implemented: true },
        { name: "Add-on paketi (regija, kategorija, krediti)", implemented: true },
        { name: "Automatska provjera postojećih funkcionalnosti", implemented: true },
        { name: "Smanjena cijena za nove pakete (bez duplikata)", implemented: true }, // Implementirano: 20% popust za nove korisnike, provjera preko Subscription/CreditTransaction/Invoice, primjenjuje se u checkout-u
        { name: "Grace period za Add-on (7 dana)", implemented: true },
        { name: "Auto-renew opcija za Add-on", implemented: true },
        { name: "Upozorenja pri 80%, 50%, 20% iskorištenosti", implemented: true },
        { name: "Upsell mehanizam pri isteku Add-on", implemented: true }, // Implementirano: automatsko slanje upsell ponuda 7 dana prije, 3 dana prije, na dan isteka i u grace periodu, s popustima (5% na 3 dana, 10% u grace periodu), email + in-app notifikacije
      ]
    },
    {
      category: "TRIAL Paket",
      items: [
        { name: "TRIAL = maksimalni paket funkcionalnosti", implemented: true }, // Implementirano: 14 dana, 8 leadova, sve Premium features, automatski add-oni za 2 kategorije i 1 regiju
        { name: "14-dnevni probni period", implemented: true }, // Implementirano: expiresAt = 14 dana
        { name: "Ograničen broj leadova (5-10)", implemented: true }, // Implementirano: 8 leadova (srednja vrijednost)
        { name: "Ograničen broj kategorija/regija", implemented: true }, // Implementirano: automatski add-oni za 2 kategorije i 1 regiju
        { name: "Sve Premium funkcionalnosti otključane", implemented: true }, // Implementirano: TRIAL ima sve Premium features (AI_PRIORITY, SMS_NOTIFICATIONS, PRIORITY_SUPPORT, CSV_EXPORT, ADVANCED_ANALYTICS)
        { name: "Engagement tracking tijekom TRIAL-a", implemented: true }, // Implementirano: TrialEngagement model, tracking servis, integracija u lead purchase/offer/chat/login, API endpoint za dohvat podataka
        { name: "Podsjetnici 3 dana prije isteka", implemented: true }, // Implementirano: automatski podsjetnik 3 dana prije isteka TRIAL-a, email + in-app notifikacija, provjera duplikata
        { name: "Automatski downgrade na BASIC nakon isteka", implemented: true }, // Implementirano: automatski downgrade TRIAL-a na BASIC nakon isteka, 10 kredita, 1 mjesec trajanja, cron job provjera svaki sat
        { name: "Popust za upgrade iz TRIAL-a", implemented: true } // Implementirano: 20% popust za TRIAL korisnike koji upgrade-uju, prioritet nad new user popustom, prikaz na frontendu i u checkout procesu
      ]
    },
    {
      category: "Obostrano Ocjenjivanje (Detaljno)",
      items: [
        { name: "Korisnik ocjenjuje izvođača (kvaliteta, pouzdanost, cijena)", implemented: true },
        { name: "Izvođač ocjenjuje korisnika (komunikacija, pouzdanost)", implemented: true },
        { name: "Simultana objava ocjena (reciprocal delay)", implemented: true }, // Implementirano: ocjene se objavljuju tek kada obje strane ocijene ili istekne rok (10 dana), sprječava osvetničko ocjenjivanje
        { name: "Rok za ocjenjivanje (7-10 dana)", implemented: true }, // Implementirano: reviewDeadline postavljen na 10 dana od završetka posla ili od trenutka
        { name: "Ocjene vidljive tek nakon obje strane ocijene", implemented: true }, // Implementirano: isPublished flag, GET endpoint vraća samo objavljene review-e (osim admin/vlasnik)
        { name: "Odgovor na recenziju (1x dozvoljen)", implemented: true }, // Implementirano: POST /api/reviews/:id/reply endpoint, provjera hasReplied, samo toUserId može odgovoriti, samo na objavljene recenzije
        { name: "Reputation Score izračun (ponderirane komponente)", implemented: true },
        { name: "Utjecaj ocjena na dodjelu leadova", implemented: true },
        { name: "Moderacija ocjena (AI + ljudska)", implemented: true }, // Implementirano: AI automatska provjera sadržaja, ljudska moderacija kroz admin endpoint-e, provjera spam-a, zabranjenih riječi, linkova
        { name: "Prijava lažnih ocjena", implemented: true }, // Implementirano: POST /api/reviews/:id/report endpoint, GET /api/reviews/reports (admin), POST /api/reviews/:id/report/resolve (admin), notifikacije adminima i korisnicima
      ]
    },
    {
      category: "Verifikacija Identiteta",
      items: [
        { name: "OIB / IBAN verifikacija (API)", implemented: true },
        { name: "Dokaz o licenciji / obrtu (upload)", implemented: true },
        { name: "Email i telefonska potvrda (SMS)", implemented: true },
        { name: "Korisnički ugovor / ToS (e-potpis)", implemented: true },
        { name: "GDPR revizija i transparentnost", implemented: true },
        { name: "Verified Partner oznaka", implemented: true }
      ]
    },
    {
      category: "Onboarding i Automatizacija",
      items: [
        { name: "Wizard registracije (odabir kategorija i regija)", implemented: true }, // Implementirano: GET /api/wizard/categories, GET /api/wizard/regions, GET /api/wizard/status, POST /api/wizard/categories, POST /api/wizard/regions, POST /api/wizard/complete
        { name: "Automatska aktivacija TRIAL-a", implemented: true },
        { name: "Chat-bot vodi za prvi lead", implemented: true }, // Implementirano: ChatbotSession model, chatbot-service.js, GET /api/chatbot/session, POST /api/chatbot/advance, POST /api/chatbot/complete, automatski triggeri u lead purchase, chat i offers
        { name: "Automatski email + popust link pri isteku TRIAL-a", implemented: true }, // Implementirano: checkExpiredTrials() u subscription-reminder.js, automatski email s 20% popust linkom, cron job provjera svaki sat, frontend podrška za trial_expired query parametar
        { name: "Podsjetnici za neaktivnost (>14 dana)", implemented: true }, // Implementirano: checkInactiveUsers() u subscription-reminder.js, automatski email podsjetnik, cron job provjera svaki dan u 8:00, provjera kombinacije aktivnosti (login, lead purchase, chat, offers)
        { name: "Edukacijski materijali i vodiči", implemented: true } // Implementirano: GET /api/documentation/guides, GET /api/documentation/guides/:id, kategorija "Edukacijski materijali i vodiči" u DocumentationCategory, vodiči kao DocumentationFeature
      ]
    },
    {
      category: "Edukacijski materijali i vodiči",
      items: [
        { name: "Kako kupiti prvi lead", implemented: true },
        { name: "Kako napraviti profesionalnu ponudu", implemented: true },
        { name: "Kako optimizirati profil", implemented: true },
        { name: "Kako komunicirati s klijentima", implemented: true },
        { name: "Kako pratiti ROI", implemented: true },
        { name: "Kako koristiti TRIAL period", implemented: true },
        { name: "Vodič za refund proces", implemented: true },
        { name: "Best practices za konverziju leadova", implemented: true }
      ]
    }
  ];

// Feature descriptions - ekstraktirano iz fallbackFeatureDescriptions
const featureDescriptions = {
    "Grafički prikaz statistika": {
      implemented: true,
      summary: "Interaktivni grafički prikazi vaših poslovnih rezultata kroz različite period.",
      details: `**Kako funkcionira**
- Dashboard kombinira linijske, stupčaste i doughnut grafove za ROI, prihode, status leadova i konverzije.
- Filteri (period, kategorija, regija) automatski osvježavaju dataset i sinkroniziraju se s KPI karticama.
- Sparklines i mini kartice daju brzi pregled trenda bez otvaranja dodatnih tabova.

**Prednosti**
- U sekundi uočavate rast/pad i uspoređujete rezultate s ciljevima.
- Export u PNG/CSV olakšava dijeljenje vizuala na sastancima.

**Kada koristiti**
- Svakodnevno praćenje performansi, tjedni status sastanci i evaluacija kampanja.
`,
      technicalDetails: `**Frontend**
- Komponente u \`PartnerAnalytics\` i \`BillingDashboard\` koriste \`react-chartjs-2\`, \`react-sparklines\` i prilagođene KPI kartice.
- Hook \`useRoiDashboard\` dohvaća podatke via React Query i sinkronizira filtere s URL parametrima.
- Responsive grid podržava dark mode te export u PNG/JPEG.

**Backend**
- \`analyticsController.getDashboardStats\` orkestrira upite prema \`providerRoiService\` i \`leadStatsService\`.
- Cache sloj (Redis) sprema agregate za popularne periode (7/30/90 dana).
- Background job \`roiSnapshotJob\` osvježava metričke snapshotove jednom na sat.

**Baza**
- Tablice \`ProviderROI\`, \`LeadPurchase\`, \`LeadDeliveryStat\` i \`ConversionSnapshot\` drže sirove i agregirane vrijednosti.
- Pogled \`RoiTrendView\` optimizira vremenska očitanja.
- \`ReportingAudit\` verzionira sve rekalkulacije radi BI revizija.

**Integracije**
- Stripe webhook podaci o naplati sinkroniziraju prihod, a Kafka event \`lead.status.changed\` ažurira queue metrike.

**API**
- \`GET /api/director/analytics/dashboard?from=&to=&categoryId=\` vraća KPI-je i grafove.
- \`GET /api/director/analytics/export\` generira CSV/PNG exporte.
- \`POST /api/admin/analytics/recalculate-roi\` pokreće ručno osvježenje agregata.
`
    },
    "Hijerarhijska struktura kategorija": {
      implemented: true,
      summary: "Kategorije su organizirane u glavne kategorije i podkategorije za lakšu navigaciju.",
      details: `**Kako funkcionira**
- Glavne kategorije (npr. građevinarstvo, elektrotehnika) grupiraju srodne usluge.
- Ugniježđene podkategorije pružaju detaljnu razinu (keramičar, ugradnja bojlera) i prikazuju se u registraciji, objavi posla i filterima.
- Hijerarhija se koristi u matchmakingu kako bi lead dobio relevantne ponuditelje.

**Prednosti**
- Brže pronalaženje pravih usluga i precizno targetiranje marketinških kampanja.
- Manje šuma u queue sustavu jer se leadovi šalju samo kompatibilnim partnerima.

**Kada koristiti**
- Kod objave posla, podešavanja profila tvrtke/tima i analitike po kategorijama.
- Pri administrativnim promjenama (dodavanje nove kategorije ili reorganizacija postojeće).
`,
      technicalDetails: `**Frontend**
- Komponenta \`CategorySelect\` podržava asinkrono pretraživanje, breadcrumb prikaz i keyboard navigaciju.
- U filterima (jobs, marketplace) hijerarhija se prikazuje kroz uvučene grupe i tagove.
- Admin alat \`AdminCategories.jsx\` omogućuje drag-and-drop reorganizaciju stabla.

**Backend**
- \`adminCategoriesController\` i \`matchMakingService\` koriste isti cacheirani dataset kategorija.
- Event \`category.structure.changed\` invalidira cache i pokreće rebuild pretraživačkog indeksa.
- Middleware \`requireCategoryMatch\` provjerava kompatibilnost tijekom dodjele leada.

**Baza**
- Tablica \`Category\` s poljima \`parentId\`, \`depth\` i \`path\` čuva stablo.
- \`CategoryTranslation\` omogućuje lokalizirane nazive.
- Materijalizirani pogled \`CategoryUsageStats\` prati volumene leadova po razinama.

**Integracije**
- Algolia/Elastic indeks (opcionalno) koristi isti dataset za brzu javnu pretragu.

**API**
- \`GET /api/public/categories?query=\` vraća hijerarhiju s lazy-loadingom djece.
- \`POST /api/admin/categories/reorder\` sprema promjene redoslijeda i roditelja.
- \`GET /api/internal/categories/tree\` služi matchmaking servisu za validaciju.
`
    },
    "Portfolio radova": {
      implemented: true,
      summary: "Prikažite svoje najbolje radove kroz galeriju slika na vašem profilu.",
      details: `**Kako funkcionira**
- Direktor ili tim dodaje projekt s naslovom, opisom i više fotografija.
- Radovi se grupiraju po kategorijama i prikazuju na javnom profilu s pregledom u punoj veličini.
- Posjetitelji mogu filtrirati portfolio po uslugama ili regiji.

**Prednosti**
- Jača povjerenje i dokaz kvalitete prije nego što klijent pošalje upit.
- Pomaže AI preporukama i matchmakingu jer znamo stvarne reference tvrtke.

**Kada koristiti**
- Nakon završetka projekta ili prije marketinške kampanje za osvježavanje profila.
- U sales procesu kada korisnik želi vidjeti konkretne reference.
`,
      technicalDetails: `**Frontend**
- Komponenta \`PortfolioGallery\` koristi \`react-photo-gallery\` i lazy-load slike preko CloudFront CDN-a.
- Upload modul koristi \`uppy\` s drag-and-drop podrškom i optimističkim prikazom.
- Modal za detalje prikazuje EXIF podatke i tagove projekta.

**Backend**
- \`portfolioController\` validira ownership i sprema metapodatke, dok \`mediaService\` obrađuje slike (resize, watermark).
- Event \`portfolio.item.created\` pokreće notifikaciju timu prodaje i osvježava cache profila.
- Background job \`portfolioGenerateThumbnails\` priprema različite rezolucije.

**Baza**
- \`PortfolioProject\` (companyId, title, description, categoryId, regionId).
- \`PortfolioMedia\` čuva URL, dimenzije, checksum i redoslijed prikaza.
- \`PortfolioTag\` povezuje projekte s ključnim riječima za pretragu.

**Integracije**
- Pohrana na S3 s CloudFront CDN-om; ClamAV scan provjerava sigurnost datoteka.

**API**
- \`POST /api/director/portfolio\` kreira projekt i vraća ID.
- \`POST /api/director/portfolio/:projectId/media\` dodaje nove fotografije.
- \`GET /api/public/companies/:companyId/portfolio\` vraća grupirani prikaz za javni profil.
`
    },
    "Certifikati i licence": {
      implemented: true,
      summary: "Uploadajte i upravljajte svojim profesionalnim certifikatima i licencama koje su potrebne za određene kategorije.",
      details: `**Kako funkcionira**
- Pružatelj učitava PDF dokument, unosi tip, broj, izdavatelja i datum isteka.
- Sustav licencu povezuje s kategorijama/poslovima koji je zahtijevaju i šalje ju u admin verifikaciju.
- Automatske notifikacije (30/14/7/1 dan prije isteka) podsjećaju na obnovu, a status licence se osvježava na profilu.

**Prednosti**
- Transparentno prikazuje stručnost i smanjuje rizik rada s neovlaštenim izvođačima.
- Automatska upozorenja sprječavaju da licenca istekne bez reakcije.

**Kada koristiti**
- Pri onboarding-u novih partnera i kad god se licenca obnovi ili izmijeni.
- U javnom profilu i ponudama za dokazivanje kvalifikacija.
`,
      technicalDetails: `**Frontend**
- Stranica \`LicensesManager\` koristi React Hook Form, preview dokumenta i status badge (PENDING, VERIFIED, REJECTED).
- Upload ide kroz \`FileDropZone\` (uppy) s validacijom tipa i veličine.
- Notifikacijski banneri upozoravaju na licence koje istječu.

**Backend**
- \`licenseController\` sprema metapodatke i delegira obradu na \`licenseVerificationService\`.
- Worker \`licenseExpiryReminder\` šalje automatizirane e-mail/SMS podsjetnike.
- Event \`license.status.changed\` sinkronizira badge-eve na profilu i obavještava compliance tim.

**Baza**
- \`ProviderLicense\` (providerId, licenseType, number, issuingAuthority, issuedAt, expiresAt, status).
- \`LicenseCategoryRequirement\` mapira licence na kategorije.
- \`LicenseVerificationLog\` vodi audit trag (who/when/notes).

**Integracije**
- Dokumenti se pohranjuju na S3; ClamAV provodi antivirusni scan, a OCR servis (Textract/Vision) izvlači podatke.

**API**
- \`POST /api/director/licenses\` kreira licencu i pokreće verifikaciju.
- \`PUT /api/director/licenses/:licenseId\` ažurira podatke ili uploaduje novu verziju.
- \`GET /api/public/companies/:companyId/licenses\` prikazuje verificirane licence na profilu.
`
    },
    "Dark mode": {
      implemented: true,
      summary: "Prebacite se između svijetlog i tamnog načina rada prema vašoj preferenciji.",
      details: `**Kako funkcionira**
- Switch u zaglavlju aktivira tamnu temu i zapisuje preferenciju u profil korisnika.
- Ako korisnik ne odabere ručno, primjenjuje se OS \`prefers-color-scheme\` postavka.
- Sve komponente (grafovi, forme, kartice) koriste prilagođene boje i kontrast za ugodan prikaz.

**Prednosti**
- Smanjuje zamor očiju i troši manje baterije na OLED zaslonima.
- Omogućuje personalizirano iskustvo bez žrtvovanja čitljivosti podataka.

**Kada koristiti**
- Tijekom rada u uvjetima slabijeg osvjetljenja ili dugotrajne analize podataka.
- U kombinaciji s pristupačnim postavkama (povećani font, visok kontrast).
`,
      technicalDetails: `**Frontend**
- \`ThemeProvider\` (styled-components) i CSS varijable definiraju svijetlu/tamnu paletu.
- Hook \`useThemePreference\` čita OS postavke, lokalni storage i korisničke postavke iz API-ja.
- Grafovi koriste tematske konfiguracije u \`Chart.js\` i \`Recharts\` kako bi se pozadina i grid prilagodili.

**Backend**
- Endpoint \`PATCH /api/user/preferences\` sprema odabranu temu u \`UserPreference\` zapis.
- Middleware injektira korisničke preference u SSR render (ako je primjenjivo).

**Baza**
- Tablica \`UserPreference\` (userId, theme, locale, accessibilityFlags) čuva per-user postavke.
- Audit kolone (\`updatedBy\`, \`updatedAt\`) omogućuju rollback prema potrebi.

**Integracije**
- Nema vanjskih integracija; fallback radi isključivo na frontend logici.

**API**
- \`GET /api/user/preferences\` vraća spremljene postavke.
- \`PATCH /api/user/preferences\` ažurira temu i druge UI preferencije.
`
    },
    "Pristupačnost (accessibility)": {
      implemented: true,
      summary: "Platforma je prilagođena za sve korisnike, uključujući one s posebnim potrebama.",
      details: `**Kako funkcionira**
- Navigacija tipkovnicom (Tab/Shift+Tab) pokriva sve interaktivne elemente, uz skip-linkove za brzo preskakanje na sadržaj.
- ARIA atributi, alternativni opisi i semantički HTML omogućuju rad s čitačima ekrana.
- Tema održava WCAG kontrastne omjere i podržava povećanje fonta bez lomljenja layouta.

**Prednosti**
- Povećava inkluzivnost i zakonsku usklađenost (EU Web Accessibility Directive).
- Smanjuje bounce rate jer korisnici s poteškoćama mogu uspješno završiti procese.

**Kada koristiti**
- Stalno: sve nove komponente moraju proći accessibility review prije produkcije.
- Tijekom QA testiranja i prilikom uvođenja novih jezika ili tema.
`,
      technicalDetails: `**Frontend**
- Dizajn sustav koristi \`AccessibleButton\`, \`VisuallyHidden\` i WCAG provjerene kontraste.
- Lighthouse/axe provjere pokreću se kao dio CI pipeline-a.
- Komponente grafova dodaju \`aria-describedby\` i tekstualne rezimee.

**Backend**
- \`contentService\` osigurava da generirani PDF/CSV exporti imaju strukturirane headere za čitače.
- Validatori sprječavaju unos teksta bez lokalizacije ili alt opisa.

**Baza**
- \`UserPreference.accessibilityFlags\` bilježi odabir većeg fonta, high-contrast moda i preferirani jezik.
- Audit tablica prati promjene postavki radi personaliziranih preporuka.

**Integracije**
- Integracija s \`@axe-core/react\` u developmentu i BrowserStack profilima za screen reader testove.

**API**
- \`PATCH /api/user/preferences\` pohranjuje accessibility zastavice.
- \`GET /api/content/translations\` osigurava alternativne tekstove i lokalizacije.
`
    },
    "Ekskluzivni lead sustav": {
      implemented: true,
      summary: "Kupite ekskluzivni pristup leadu - samo vi kontaktirate klijenta, bez konkurencije.",
      details: `**Kako funkcionira**
- Marketplace prikazuje ekskluzivne leadove s oznakama kvalitete (VRHUNSKI, DOBAR, PROSJEČAN) i procjenom vrijednosti.
- Plaćanje kreditima ili Stripe Checkout odmah otkriva kontakt podatke i zaključava lead samo za vašu tvrtku.
- Nakon kupnje lead prelazi u “Moje leadove” sa statusima (Aktivno, Kontaktirano, Konvertirano, Refundirano, Isteklo).

**Prednosti**
- Prvi kontakt bez konkurencije diže konverziju i ROI.
- Jasna evidencija potrošnje kredita i refundacija olakšava financijsko planiranje.

**Kada koristiti**
- Kada želite garantirani pristup leadovima više vrijednosti i spremni ste reagirati odmah.
- U kampanjama gdje je važan brz odgovor i personalizirana ponuda.
`,
      technicalDetails: `**Frontend**
- Stranica \`ExclusiveMarketplace\` koristi React Query za dohvat leadova i prikazuje badgeve kvalitete.
- \`LeadPurchaseModal\` vodi korisnika kroz potvrdu kupnje, pregled dostupnih kredita i Stripe plaćanje.
- Dashboard “Moji leadovi” nudi inline ažuriranje statusa, filtere i vremenske oznake aktivnosti.

**Backend**
- \`exclusiveLeadService.purchase(leadId, companyId)\` provjerava dostupnost, zaključava lead i emitira \`lead.exclusive.assigned\`.
- Endpoint \`POST /api/leads/exclusive/:leadId/purchase\` orkestrira naplatu (Stripe/krediti) i kreira \`LeadPurchase\` zapis.
- Refund workflow koristi queue \`leadRefundQueue\` za automatsku evaluaciju i povrat kredita.

**Baza**
- \`LeadPurchase\` čuva cijenu, metodu plaćanja i status (ACTIVE, REFUNDED, EXPIRED).
- \`LeadStatusHistory\` prati promjene statusa i korisnika koji je ažurirao lead.
- \`ExclusiveLeadSnapshot\` bilježi vrijeme uklanjanja s marketplacea i razloge refundiranja.

**Integracije**
- Stripe Checkout za kartična plaćanja, Redis lock sprečava paralelne kupnje.
- Twilio/Email servis šalje obavijesti o novim leadovima i potvrdi kupnje.

**API**
- \`GET /api/leads/exclusive\` vraća filtriranu listu dostupnih leadova.
- \`GET /api/leads/exclusive/:leadId\` daje detalje i AI score prije kupnje.
- \`POST /api/leads/exclusive/:leadId/refund\` otvara zahtjev za povrat kredita.
`
    },
    "ROI dashboard": {
      implemented: true,
      summary: "Vidite detaljne statistike vašeg poslovanja - koliko zaradujete, koliko trošite i koliki je vaš ROI.",
      details: `**Kako funkcionira**
- Jedinstvena ploča prikazuje konverziju, ROI, prosječnu vrijednost leada, prihod i potrošene kredite u realnom vremenu.
- Grafovi (mjesečni trendovi, usporedbe perioda, top leadovi) pomažu uočiti padove i prilike za ulaganje.
- AI preporuke ističu kategorije, budžete i rokove koji najbolje konvertiraju te predlažu sljedeće korake.

**Prednosti**
- Donosite odluke na temelju podataka, ne pretpostavki.
- Brzo identificirate profitabilne kanale i uočavate kada je vrijeme za nadogradnju paketa.

**Kada koristiti**
- Dnevni pregled performansi, tjedni sastanci s timom i priprema financijskih izvještaja.
- Analiza prije uvođenja novih kampanja ili promjene cijena.
`,
      technicalDetails: `**Frontend**
- Komponenta \`RoiDashboard\` koristi kombinaciju \`react-chartjs-2\`, \`Recharts\` i custom KPI kartica.
- React Query dohvaća agregate i sinkronizira filtere (period, kategorija, regija) preko URL parametara.
- Sekcija “AI insights” renderira preporuke s tooltips objašnjenjem faktora.

**Backend**
- \`roiController.getDashboard\` agregira podatke iz \`providerRoiService\`, \`leadStatsService\` i \`billingService\`.
- Cron \`roiSnapshotJob\` generira dnevne i mjesečne snapshotove za brži dohvat.
- Event \`roi.metrics.updated\` obavještava partner scoring i billing module.

**Baza**
- \`ProviderROI\`, \`LeadPurchase\`, \`LeadDeliveryStat\` i \`ConversionSnapshot\` drže sirove i agregirane metrike.
- Materijalizirani pogled \`RoiTrendView\` optimizira vremenske upite.
- \`DashboardWidgetConfig\` čuva prilagođene postavke korisnika (npr. skriveni grafovi).

**Integracije**
- Stripe webhooki sinkroniziraju podatke o prihodima, Redis cache drži najčešće upite.
- Kafka event \`lead.status.changed\` ažurira statistiku konverzija.

**API**
- \`GET /api/director/roi?from=&to=&categoryId=\` vraća KPI-je i grafove.
- \`GET /api/director/roi/top-leads\` isporučuje listu najprofitabilnijih leadova.
- \`POST /api/director/roi/export\` generira CSV/PDF za financijski tim.
`
    },
    "Kreditni sustav": {
      implemented: true,
      summary: "Koristite kredite kao valutu za kupovinu leadova - fleksibilno i jednostavno.",
      details: `**Kako funkcionira**
- Krediti su interna valuta koja se automatski skida pri kupnji leadova ili add-on paketa.
- Saldo se puni pretplatama, TRIAL bonusom, manualnim top-upom ili refundom neuspješnih leadova.
- Povijest transakcija bilježi sve kretnje (kupnja, refund, bonus, korekcija) i prikazuje opis i vrijeme.

**Prednosti**
- Lakše planiranje budžeta jer nema pojedinačnih kartičnih transakcija za svaki lead.
- Refund je trenutan – krediti se odmah vraćaju i spremni su za novu kupnju.

**Kada koristiti**
- Standardni način plaćanja leadova i add-on paketa.
- U paketima s dinamičnim billingom gdje se krediti prilagođavaju ostvarenim rezultatima.
`,
      technicalDetails: `**Frontend**
- Kreditni saldo je prikazan u headeru i osvježava se preko SSE kanala \`credits/{companyId}\`.
- Stranica \`BillingDashboard\` i \`CreditHistoryTable\` koriste React Query za dohvat povijesti i filtara.
- Modali za kupnju (leads/add-on) prikazuju dostupne kredite i upozorenja kad je saldo nizak.

**Backend**
- \`creditService.changeBalance\` centralizira sve promjene salda (purchase, refund, bonus, manual adjustment).
- Event \`credits.balance.updated\` obavještava notifikacije i ROI module.
- Cron \`creditLowBalanceJob\` šalje upozorenja kada saldo padne ispod definiranog praga.

**Baza**
- \`CreditTransaction\` (companyId, amount, type, referenceId, balanceAfter, metadata) vodi audit trag.
- \`Subscription\` i \`BillingPlan\` definiraju mjesečnu alokaciju i rollover pravila.
- \`CreditBalanceSnapshot\` čuva dnevne stanje salda za analitiku.

**Integracije**
- Stripe fakture sinkroniziraju top-up transakcije, dok internal webhook \`lead.refunded\` vraća kredite.
- Redis se koristi za atomicne decrement operacije pri kupnji leadova.

**API**
- \`GET /api/director/credits/balance\` vraća trenutni saldo.
- \`GET /api/director/credits/history?from=&to=&type=\` lista transakcije s filtrima.
- \`POST /api/admin/credits/adjust\` omogućava ručnu korekciju (uz audit razlog).
`
    },
    "AI score kvalitete leadova": {
      implemented: true,
      summary: "Svaki lead dobiva automatsku ocjenu kvalitete od 0-100 koja pokazuje koliko je lead vrijedan. (Rule-based scoring algoritam)",
      details: `**Kako funkcionira**
- Rule-based scoring algoritam procjenjuje leadove (0-100) prema verifikaciji klijenta, budžetu, kvaliteti opisa, prilozima, roku i povijesti korisnika.
- **Napomena**: Ovo je rule-based algoritam (ne pravi AI), ali se može nadograditi s pravim AI-om u budućnosti.
- Score se grupira u razrede: VRHUNSKI (80-100), DOBAR (60-79), PROSJEČAN (40-59), SLAB (0-39).
- Filteri i sortiranje omogućuju odabir strategije (konzervativna vs. agresivna kupnja) ovisno o pragu prihvatljivog rizika.

**Prednosti**
- Smanjuje rizik kupnje leadova i fokusira budžet na najisplativije prilike.
- Lakše planiranje pipelinea jer unaprijed znate koliko vrijedi svaki lead.

**Kada koristiti**
- Prije svake kupnje ili auto-assigna kako biste odlučili isplativost.
- U mjesečnim analizama performansi po kategorijama i regijama.
`,
      technicalDetails: `**Frontend**
- Marketplace i queue prikazuju badgeve scorea i tooltip s breakdownom faktora.
- Filter “Minimalni AI score” dostupni je u PRO/PREMIUM planovima.
- Graf “Score vs Conversion” u \`PartnerAnalytics\` pokazuje povezanost kvalitete i uspješnosti.

**Backend**
- \`ai-lead-scoring.js\`: \`calculateLeadQualityScore()\` izračunava score na osnovu 10 faktora (rule-based algoritam).
- \`evaluateAndUpdateJobScore()\` automatski ažurira score pri kreiranju leada.
- **Napomena**: Ovo je rule-based scoring algoritam, ne pravi AI. Može se nadograditi s pravim AI-om (npr. OpenAI, Google Cloud ML) u budućnosti.

**Baza**
- \`LeadScore\` (leadId, value, breakdown, tier, calculatedAt) čuva rezultat i komponente.
- \`LeadScoreHistory\` prati promjene kroz vrijeme radi audita.
- Feature store tablice (npr. \`LeadFeatureSnapshot\`) sadrže normalizirane ulazne podatke.

**Integracije**
- Trenutno nema integracije s pravim AI servisom (rule-based algoritam).
- Može se nadograditi s pravim AI-om (npr. OpenAI, Google Cloud ML, AWS Comprehend) u budućnosti.

**API**
- \`GET /api/leads/:leadId/score\` vraća aktualni score i breakdown.
- \`GET /api/leads/scores?minScore=&categoryId=\` služi filterima na marketplaceu.
- \`POST /api/internal/leads/:leadId/rescore\` pokreće ručni re-score za QA ili dispute.
`
    },
    "SMS notifikacije (Twilio)": {
      implemented: true,
      summary: "Sustav šalje transakcijske SMS poruke preko Twilio API-ja (verifikacija, novi leadovi, kupnje, refundacije, urgentne obavijesti) i sve ih logira u bazu.",
      details: `**Kako funkcionira**
- Centralni \`sms-service\` definira generičku funkciju \`sendSMS\` i specifične helper funkcije (\`sendVerificationCode\`, \`notifyNewLeadAvailable\`, \`notifyLeadPurchased\`, \`notifyRefund\`, \`sendUrgentNotification\`).
- Ako su Twilio kredencijali podešeni, poruke se šalju preko Twilio Messaging API-ja; u suprotnom se koristi "simulation" način za development/test okruženja.
- Svaki pokušaj slanja (uspješan ili neuspješan) zapisuje se u tablicu \`SmsLog\` s metapodacima (tip, status, Twilio SID, error, userId, metadata).

**Prednosti**
- Pouzdane SMS obavijesti za kritične događaje (novi lead, kupnja, refund, verifikacija, VIP podrška).
- Transparentno praćenje i debugiranje kroz detaljne logove u bazi i fallback na simulation mode ako Twilio nije konfiguriran ili je u trial režimu.

**Kada koristiti**
- Kad želite obavijestiti providera o novom ekskluzivnom leadu ili uspješnoj kupnji leada.
- Kod refundacija kredita, verifikacije telefona ili urgentnih poruka VIP podrške.
`,
      technicalDetails: `**Frontend**
- Ne poziva Twilio direktno; koristi postojeće API endpointe (npr. \`/api/sms-verification/send\`, akcije oko leadova i refundacija) koji triggere SMS servis.
- UI reagira na \`smsMode\` i \`smsSuccess\` u response-u (prikaz poruka, fallback na prikaz koda u dev okruženju).

**Backend**
- \`sms-service.js\`:
  - \`sendSMS(phone, message, type, userId, metadata)\` bira Twilio ili simulation ovisno o env varijablama i vraća strukturirani rezultat (\`success\`, \`sid\`, \`mode\`, \`error\`).
  - \`sendVerificationCode\`, \`notifyNewLeadAvailable\`, \`notifyLeadPurchased\`, \`notifyRefund\`, \`sendUrgentNotification\` grade sadržaj poruke za različite use-caseove.
- \`routes/sms-verification.js\` koristi \`sendVerificationCode\` za slanje OTP koda uz rate limiting, ponovnu upotrebu aktivnog koda i detaljan error handling (trial brojevi, blokirani brojevi).

**Baza**
- Model \`SmsLog\` (phone, message, type, status, mode, twilioSid, error, userId, metadata, timestamps) služi kao audit trail za sve SMS-ove.

**Integracije**
- Twilio Messaging API (uz podršku za trial ograničenja i "verified numbers").
- Notifikacijski i billing servisi okidaju odgovarajuće SMS helper funkcije ovisno o događaju (lead, refund, verifikacija, VIP ticket).`
    },
    "SMS verifikacija telefonskog broja (Twilio)": {
      implemented: true,
      summary: "Telefonski broj se potvrđuje jednokratnim kodom poslanim preko Twilio SMS-a.",
      details: `**Kako funkcionira**
- Korisnik unosi broj; backend generira OTP kod i šalje ga putem Twilio SMS-a.
- Kod vrijedi ograničeno vrijeme; unos ispravnog koda potvrđuje broj i aktivira Phone badge.
- Rate limiting štiti od zloupotreba i ponovnih pokušaja.

**Prednosti**
- Povećava povjerenje korisnika i kvalitetu lead komunikacije.
- Smanjuje broj nevažećih kontakata u sustavu.

**Kada koristiti**
- Tijekom registracije ili promjene telefonskog broja.
- Prije sudjelovanja u kampanjama koje zahtijevaju potvrđeni kontakt.
`,
      technicalDetails: `**Frontend**
- Komponenta za unos broja i OTP modal s timerom.
- Prikazuje poruke o ograničenju pokušaja i uspjehu verifikacije.

**Backend**
- \`verificationService.sendSmsCode\` generira i šalje kod (Twilio Verify / Messaging API).
- \`verificationService.verifySmsCode\` validira OTP, postavlja \`phoneVerifiedAt\`.

**Baza**
- \`PhoneVerification\` (userId, phone, codeHash, expiresAt, attempts).
- \`ProviderProfile.phoneVerifiedAt\`, \`User.phoneBadgeIssuedAt\`.

**Integracije**
- Twilio SMS/Verify API, rate-limit servis (Redis) za kontrolu pokušaja.

**API**
- \`POST /api/verification/phone/send\` – slanje koda.
- \`POST /api/verification/phone/confirm\` – potvrda OTP-a.
`
    },
    "Prosječno vrijeme odgovora (avgResponseTimeMinutes)": {
      implemented: true,
      summary: "Mjerimo prosjek vremena koji je providerima potreban da odgovore na leadove i koristimo ga u reputaciji.",
      details: `**Kako funkcionira**
- Timer starta kada lead dođe u queue, a zaustavlja se kad provider pošalje odgovor (INTERESTED / NOT_INTERESTED) ili istekne SLA.
- Prosječno vrijeme računa se na temelju zadnjih N leadova i prikazuje u dashboardu.
- Spori odgovori snižavaju reputaciju i prioritet u distribuciji.

**Prednosti**
- Poticanje brzog odgovaranja i bolje korisničko iskustvo za klijente.
- Pruža objektivan KPI za praćenje performansi tima.

**Kada koristiti**
- U ROI dashboardu i queue-u za optimizaciju operacija.
- Kao kriterij pri dodjeli leadova i eskalacijama.
`,
      technicalDetails: `**Frontend**
- Queue ekran prikazuje countdown i badge s prosjekom.
- Dashboard graf prikazuje trend prosječnog vremena.

**Backend**
- \`leadResponseTimeService.track\` bilježi evente i izračunava prosjek.
- Scheduler periodično recalculira agregate i invalidira cache.

**Baza**
- \`LeadResponseMetric\` (providerId, leadId, responseTimeSeconds, recordedAt).
- Agregacijska tablica \`ProviderResponseSummary\`.

**Integracije**
- Notification servis šalje reminder ako SLA istječe.
- Analytics koristi metrik u korelaciji s konverzijama.

**API**
- \`GET /api/analytics/providers/response-time\` – vraća prosjek i trend.
`
    },
    "VIP podrška 24/7 (Support tickets)": {
      implemented: true,
      summary: "PRO i PREMIUM partneri dobivaju prioritetnu 24/7 podršku kroz support ticket sustav i live chat widget. Uključuje automatski routing, 24/7 monitoring i real-time chat podršku.",
      details: `**✅ POTPUNO IMPLEMENTIRANO**: Support ticket sustav s automatskim prioritetom, live chat widget za PRO korisnike, 24/7 monitoring, automatski routing VIP ticketa na prioritetne agente i real-time chat podrška kroz Socket.io.

**Kako funkcionira**
- **Support Tickets**: Korisnik kreira ticket s temom i opisom; backend ga sprema u \`SupportTicket\` s početnim statusom OPEN. Ovisno o pretplatničkom planu, prioritet se automatski diže (PRO → URGENT, PREMIUM → HIGH), dok BASIC ostaje NORMAL. VIP ticket-e (URGENT) automatski se dodjeljuju agentu s najmanje aktivnih ticket-a.
- **Live Chat Widget**: PRO korisnici mogu pokrenuti live chat putem \`POST /api/support/chat/start\`. Automatski se kreira support chat soba s dostupnim agentom. Real-time komunikacija kroz Socket.io.
- **24/7 Monitoring**: \`GET /api/support/availability\` provjerava dostupnost support tima, broj aktivnih agenata, aktivne support chat sobe i URGENT ticket-e. Prikazuje prosječno vrijeme odgovora.
- **Automatski Routing**: VIP ticket-e (URGENT) automatski se dodjeljuju agentu s najmanje aktivnih ticket-a i chat-ova. Support chat sobe se također automatski dodjeljuju agentu s najmanje aktivnih support chat-ova.

**Prednosti**
- PRO i PREMIUM partneri dobivaju garantiran brži odgovor i eskalaciju na kritične probleme (billing, leadovi, tehnički problemi).
- Jedno centralno mjesto za svu komunikaciju s podrškom, umjesto raštrkanih emailova i poziva.

**Kada koristiti**
- Kod blokirajućih problema (npr. nemogućnost kupnje leadova, greške u billing-u, sumnja na bug).
- Za VIP/PRO korisnike koji očekuju SLA razinu podrške i brzu reakciju 24/7.`,
      technicalDetails: `**Frontend**
- Ekran "Podrška" prikazuje listu mojih ticket-a s filterima po statusu i prioritetu.
- Forma za kreiranje ticket-a (subject, category, opis) prilagođena je za mobilne korisnike i PRO/PREMIUM badgeve.
- Live chat widget za PRO korisnike (poziva \`POST /api/support/chat/start\`).

**Backend**
- \`routes/support.js\`:
  - \`POST /api/support/tickets\` - Kreira support ticket s automatskim prioritetom.
  - \`GET /api/support/tickets\` - Dohvati sve ticket-e korisnika.
  - \`GET /api/support/tickets/:id\` - Dohvati pojedinačni ticket.
  - \`POST /api/support/tickets/:id/resolve\` - Označi ticket kao resolved.
  - \`POST /api/support/chat/start\` - Pokreni live chat (samo PRO korisnici).
  - \`GET /api/support/chat/room\` - Dohvati support chat sobu.
  - \`GET /api/support/availability\` - Provjeri dostupnost 24/7 support tima.
- \`services/support-service.js\`:
  - \`createSupportTicket(userId, subject, message, priority, category)\` automatski postavlja prioritet prema \`subscription.plan\` (PRO → URGENT, PREMIUM → HIGH).
  - \`getMySupportTickets(userId)\` vraća listu ticket-a sortiranu po \`createdAt desc\`.
  - \`getSupportTicket(ticketId, userId)\` osigurava da korisnik vidi samo vlastite ticket-e.
  - \`resolveTicket(ticketId, userId)\` mijenja status u RESOLVED i postavlja \`resolvedAt\`.
  - \`addTicketNote(ticketId, notes)\` za internu komunikaciju i audit trag.
  - \`getOrCreateSupportChatRoom(userId)\` kreira ili dohvaća support chat sobu (samo PRO korisnici).
  - \`checkSupportAvailability()\` provjerava dostupnost support tima, broj aktivnih agenata i prosječno vrijeme odgovora.
  - \`assignTicketToAgent(ticketId)\` automatski dodjeljuje VIP ticket-e (URGENT) agentu s najmanje aktivnih ticket-a.

**Baza**
- Model \`SupportTicket\` (id, userId, subject, message, priority, category, status, assignedTo, notes, createdAt, resolvedAt).
- Model \`ChatRoom\` s \`isSupportRoom\` flagom za support chat sobe.
- Povezanost s \`User\` modelom omogućuje segmentaciju po planu (BASIC/PREMIUM/PRO) i povijest komunikacije po partneru.

**Socket.io**
- Real-time chat podrška kroz postojeći Socket.io sustav.
- Support chat sobe koriste isti mehanizam kao obične chat sobe, ali s \`isSupportRoom: true\` flagom.

**Integracije**
- Notifikacijski sustav može slati email/SMS obavijesti kod novih ticket-a ili promjene statusa za VIP korisnike.
- Automatski routing VIP ticketa na prioritetne agente.
- 24/7 monitoring dostupnosti support tima.`
    },
    "White-label opcija (PRO plan)": {
      implemented: true,
      summary: "PRO partneri mogu brendirati Uslugar portal svojim logotipom, bojama i domenom kako bi platforma izgledala kao njihov vlastiti lead portal.",
      details: `**Kako funkcionira**
- Direktoru PRO plana se u postavkama prikazuje “White-label” modul gdje može dodati logotip, primarnu/sekundarnu boju i vlastitu domenu (CNAME).
- Frontend koristi te postavke za brandiranje navigacije, headera, email predložaka i javnih stranica (npr. pozivi klijentima, onboarding tima).
- Backend učitava \`WhiteLabel\` konfiguraciju po \`userId\`/tvrtki i dinamički vraća odgovarajuće brand parametre (theme, logo URL, naziv brenda).

**Prednosti**
- PRO partneri dobivaju dojam vlastite platforme bez potrebe da sami razvijaju sustav za leadove.
- Smanjuje churn jer je Uslugar “ugrađen” u njihov brand i procese (sve komunikacije nose njihov logotip i ime).

**Kada koristiti**
- Za veće agencije i franšize koje žele centralno upravljati leadovima pod svojim brandom.
- Kada je cilj ponuditi “powered by Uslugar” rješenje partnerima koji traže white-label lead platformu.`,
      technicalDetails: `**Frontend**
- Tema (boje, logo, naziv) se dohvaća preko API-ja i sprema u globalni store; layout i email predlošci čitaju te vrijednosti umjesto hardcodanog “Uslugar”.
- Komponente headera, footera i ključnih stranica imaju propse za brand (logo, naziv, boje) i prilagođavaju se White-label konfiguraciji.

**Backend**
- Model \`WhiteLabel\` povezan s \`User\`/tvrtkom sprem-a konfiguraciju (logoUrl, primaryColor, secondaryColor, customDomain, settings).
- Middleware na osnovu domene/tenant-a učitava White-label konfiguraciju i izlaže je kroz context (npr. \`req.whiteLabel\`).
- API endpoint npr. \`GET /api/whitelabel/config\` vraća aktivnu konfiguraciju za prijavljenog direktora/tenant-a.

**Baza**
- \`WhiteLabel\` (id, userId/companyId, logoUrl, primaryColor, secondaryColor, customDomain, isActive, createdAt, updatedAt).

**Integracije**
- DNS/CNAME konfiguracija za custom domene (npr. \`portal.partner.hr\` → Uslugar).
- Email servis koristi brand parametre za From ime, logotip i boje u templatu.`
    },
    "Online plaćanje (Stripe Checkout)": {
      implemented: true,
      summary: "Pretplate i jednokratne kupnje leadova procesiraju se kroz Stripe Checkout radi sigurnog plaćanja.",
      details: `**Kako funkcionira**
- Odabirom plana ili kupnje leada backend kreira Stripe Checkout session s iznosom i metapodacima.
- Korisnik unosi podatke na Stripe hosted stranici, a nakon uspješnog plaćanja vraća se na platformu.
- Webhook potvrđuje naplatu, aktivira pretplatu ili bilježi kupnju leada.

**Prednosti**
- PCI-DSS compliant proces bez pohrane kartica na našoj strani.
- Podržava više načina plaćanja i automatske obnove.

**Kada koristiti**
- Kupnja pretplate, nadogradnja, jednokratna kupnja leadova.
- Plaćanje dodatnih usluga ili paketa kredita.
`,
      technicalDetails: `**Frontend**
- CTA pokreće API poziv i redirect na \`session.url\`.
- Success/cancel stranice prikazuju status i CTA za nastavak rada.

**Backend**
- \`paymentController.createCheckoutSession\` kreira session i sprema reference.
- Webhook \`checkout.session.completed\` aktivira pretplatu, dodaje kredite i šalje potvrdu.

**Baza**
- \`PaymentLog\` (sessionId, amount, currency, status, metadata).
- \`Subscription\` i \`LeadPayment\` povezuju naplatu s korisnikom.

**Integracije**
- Stripe Checkout/Customer Portal, notification servis za potvrde.
- Analytics bilježi conversion rate checkouta.

**API**
- \`POST /api/payments/checkout-session\` – kreira session.
- Webhook \`POST /api/stripe/webhook\` – potvrđuje naplatu.
`
    },
    "Automatski refund nakon 48h neaktivnosti": {
      implemented: true,
      summary: "Ako ne kontaktirate klijenta unutar 48 sati nakon kupovine leada, krediti vam se automatski vraćaju.",
      details: `**Kako funkcionira**
- Nakon kupnje leada počinje countdown od 48 sati; ako status ostane “Aktivno”, sustav automatski vraća kredite i lead vraća na tržište.
- Direktor dobiva obavijest o auto-refundu, a lead se označava kao “Refundiran” i ponovno ulazi u distributivni red.
- Bilo koja interakcija (status “Kontaktirano” ili bilješka) zaustavlja countdown i sprječava refund.

**Prednosti**
- Klijenti dobivaju pravovremene odgovore jer neaktivni leadovi brzo postaju ponovno dostupni.
- Pružatelji ne gube kredite kad objektivno ne stignu reagirati.

**Kada koristiti**
- Pasivna zaštita koja radi uvijek; potrebno je samo redovito ažurirati statuse leadova.
- Ručno produljenje vremena koristi se u iznimnim situacijama (npr. vikend, praznik).
`,
      technicalDetails: `**Frontend**
- Dashboard prikazuje countdown i status “Auto-refund pending”; upozorenja stižu 12 h i 2 h prije isteka.
- Notifikacije (email/SMS/push) podsjećaju direktora/tim da kontaktira lead.
- Povijest transakcija označava automatske refunde tagom “Auto-refund 48h”.

**Backend**
- \`refundScheduler\` svakih 30 minuta provjerava leadove u statusu “ACTIVE” starije od 48 h bez interakcije.
- \`leadRefundService.autoRefund(leadId)\` vraća kredite, ažurira lead i emitira event \`lead.auto.refunded\`.
- Queue engine ponovno objavljuje lead i resetira mu dostupnost.

**Baza**
- \`Lead\` bilježi polja \`autoRefundAt\` i \`lastContactedAt\`.
- \`CreditTransaction\` koristi tip AUTO_REFUND s referencom na lead.
- \`LeadRefundAudit\` čuva detalje izvođenja (timestamp, razlog, triggeredBy: SYSTEM).

**Integracije**
- Notifikacijski servis šalje potvrde i logira u aktivnosti tima.
- Analytics modul ažurira SLA/response metrike nakon refunda.

**API**
- \`GET /api/director/leads/auto-refund\` vraća leadove blizu isteka.
- \`POST /api/director/leads/:leadId/extend-auto-refund\` produljuje rok uz obavezno obrazloženje.
- \`POST /api/admin/leads/:leadId/review-refund\` otvara ticket ako partner osporava automatizam.
`
    },
    "Registracija korisnika usluge": {
      implemented: true,
      summary: "Stvorite račun kao korisnik usluge da biste mogli objavljivati poslove i tražiti pružatelje usluga.",
      details: `**Kako funkcionira**
- Korisnik unosi ime, prezime, e-mail i lozinku, odabire ulogu “Korisnik usluge” te po potrebi navodi podatke tvrtke.
- Nakon registracije dobiva verifikacijski email; klikom na link aktivira račun i može objavljivati poslove te pratiti ponude.
- Jedan e-mail može imati i korisnički i pružateljski profil, uz brzo prebacivanje u profilu.

**Prednosti**
- Besplatno i brzo otvaranje računa daje pristup objavi poslova, pregledu ponuda i chatu.
- Centraliziran pregled projekata, komunikacije i ocjena pružatelja.

**Kada koristiti**
- Kada prvi put tražite izvođača i želite objaviti posao.
- Ako već imate pružateljski račun, ali trebate zaseban profil za naručivanje usluga.
`,
      technicalDetails: `**Frontend**
- \`Register.jsx\` (\`/register\`) koristi React Hook Form i Yup validaciju (email, lozinka, pravni status).
- UI dinamički prikazuje dodatna polja za pravne osobe (OIB, naziv tvrtke).
- Nakon uspješne registracije prikazuje modal s uputama za email verifikaciju.

**Backend**
- \`POST /api/auth/register\` stvara korisnika s rolom USER, generira verification token i šalje email.
- Validacija se provodi kroz \`authValidationSchema\` (Joi) i jedinstvenu kombinaciju email+role.
- Event \`user.registered\` pokreće onboarding workflow i zapisuje aktivnost u audit log.

**Baza**
- \`User\` (email, passwordHash, fullName, role, verificationToken, verifiedAt).
- \`LegalStatus\` povezano preko \`legalStatusId\`, \`UserProfile\` čuva dodatne podatke (phone, companyName).
- Indeks \`@@unique([email, role])\` sprječava duplikate po ulozi.

**Integracije**
- Email servis (SES/Postmark) šalje verifikacijski mail i welcome poruku.
- Marketing automatizacija dodaje korisnika u “consumer onboarding” segment.

**API**
- \`POST /api/auth/register\` vraća korisnika i poruku o slanju emaila.
- \`POST /api/auth/resend-verification\` omogućuje ponovno slanje linka.
- \`GET /api/auth/me\` vraća profil i dostupne module nakon prijave.
      `
    },
    "Registracija pružatelja usluga": {
      implemented: true,
      summary: "Registrirajte se kao pružatelj usluga i počnite primati ekskluzivne leadove.",
      details: `**Kako funkcionira**
- Pružatelj unosi osobne i poslovne podatke (telefon, pravni status, OIB); sustav validira podatke i kreira TRIAL (7 dana, 5 kredita).
- Nakon email verifikacije dobiva pristup leadovima, ROI dashboardu, chatovima i licencnim modulima.
- Wizard vodi kroz odabir kategorija/regija, postavljanje portfelja i timskih članova prije kupnje prvog leada.

**Prednosti**
- Odmah dobivate puni pristup ključnim funkcionalnostima i inicijalni kreditni paket.
- Strukturirani onboarding osigurava da profil ima sve podatke za auto-match i marketplace.

**Kada koristiti**
- Za nove tvrtke koje ulaze na platformu ili postojeće partnere koji se šire u nove regije.
- Nakon pauze, reaktivacija profila prolazi kroz isti flow radi osvježavanja podataka.
`,
      technicalDetails: `**Frontend**
- \`ProviderRegister.jsx\` (\`/register-provider\`) implementira stepper (osobno, tvrtka, kontakt, pravni status, pregled).
- Validacija uključuje OIB algoritam, format telefona i minimalne zahtjeve za lozinku.
- Nakon registracije pokreće se onboarding wizard za kategorije, regije i licencne dokumente.

**Backend**
- \`POST /api/auth/register\` (role: PROVIDER) kreira User, ProviderProfile i Subscription (trial).
- \`trialService.activate(companyId)\` dodaje kredite i aktivira Premium module na 7 dana.
- Event \`provider.registered\` obavještava sales/CS tim i zapisuje onboarding taskove.

**Baza**
- \`User\` (role PROVIDER) povezan s \`ProviderProfile\` (companyName, taxId, phone, address).
- \`Subscription\` čuva trial status, \`CreditTransaction\` bilježi početne kredite.
- \`ProviderOnboardingTask\` prati napredak (portfolio, licence, kategorije).

**Integracije**
- Email/SMS servis šalje potvrde i onboarding korake; CRM sinkronizira novog partnera.
- OIB provjera koristi vanjski servis (CompanyWall/FINA) s fallback manual queue.

**API**
- \`POST /api/auth/register\` (role=PROVIDER) pokreće flow; response sadrži onboarding checklistu.
- \`POST /api/provider/onboarding/complete\` označava završetak wizarda.
- \`GET /api/provider/onboarding/status\` vraća preostale zadatke (kategorije, licence, team).
      `
    },
    "Email verifikacija": {
      implemented: true,
      summary: "Potvrdite svoju email adresu klikom na link koji primite u email poruci.",
      details: `**Kako funkcionira**
- Nakon registracije platforma šalje email s jednokratnim linkom koji vrijedi 24 sata.
- Klikom na link adresa se potvrđuje, korisnik se preusmjerava na prijavu i aktiviraju se sve funkcionalnosti.
- Ako poruka ne stigne, korisnik može zatražiti novo slanje – stari link postaje nevažeći.

**Prednosti**
- Osigurava siguran račun, reset lozinke i pouzdanu komunikaciju.
- Smanjuje spam i lažne registracije.

**Kada koristiti**
- Obavezno nakon registracije ili promjene email adrese.
- Kada korisnik treba novi link jer prethodni nije iskorišten na vrijeme.
`,
      technicalDetails: `**Frontend**
- \`VerifyEmail.jsx\` (\`/verify-email/:token\`) prikazuje rezultat verifikacije i CTA za prijavu.
- Komponenta za ponovno slanje linka dostupna je u postavkama profila i onboarding toasteru.
- Globalni toast obavještava o uspjehu ili pogrešci.

**Backend**
- \`GET /api/auth/verify-email/:token\` validira token, postavlja \`isVerified\` i poništava token.
- \`POST /api/auth/resend-verification\` generira novi token, primjenjuje rate limiting i šalje email.
- \`emailVerificationService\` upravlja generiranjem, hashiranjem i istekom tokena.

**Baza**
- \`User\` s poljima \`verificationToken\`, \`tokenExpiresAt\`, \`isVerified\`.
- \`VerificationLog\` bilježi pokušaje (timestamp, ipAddress, success).

**Integracije**
- Email provider (SES/Postmark) šalje HTML predložak s CTA gumbom.
- Redis se koristi za cache status tokena i rate limitiranje.

**API**
- \`GET /api/auth/verify-email/:token\` – potvrđuje email i vraća redirect URL.
- \`POST /api/auth/resend-verification\` – ponovno šalje link (body: email).
- \`GET /api/auth/status\` – vraća flag \`isEmailVerified\` za prikaz upozorenja.
      `
    },
    "Objavljivanje novih poslova": {
      implemented: true,
      summary: "Objavite posao koji tražite i primite ponude od pružatelja usluga.",
      details: `**Kako funkcionira**
- Korisnik klikne “Objavi posao”, unosi naslov, opis, kategoriju/podkategoriju, lokaciju te opcionalno budžet, rok i priloge.
- Nakon objave posao se prikazuje pružateljima koji pokrivaju odabrane kategorije/regije; oni šalju ponude i poruke kroz chat.
- Korisnik uspoređuje ponude, komunicira i ažurira status posla (aktivno, u tijeku, završeno, otkazano).

**Prednosti**
- Jednostavan wizard omogućuje precizne zahtjeve i privlači relevantne izvođače.
- Sve komunikacije, ponude i dokumenti nalaze se na jednome mjestu.

**Kada koristiti**
- Kod prvog angažmana ili kada trebate specijalizirane timove u novoj regiji.
- Za praćenje napretka i dokumentiranje dogovora tijekom cijelog ciklusa posla.
`,
      technicalDetails: `**Frontend**
- \`CreateJob.jsx\` (\`/jobs/new\`) koristi React Hook Form, autosave draftove i upload priloga preko Uppy/S3.
- Validacija obaveznih polja, ograničenje veličine datoteka i map picker za lokaciju.
- Nakon objave redirect na job detalje s onboardingom za slanje dodatnih informacija.

**Backend**
- \`POST /api/jobs\` zahtijeva autentifikaciju (middleware \`auth(true)\`), validira payload i kreira job.
- \`jobService.publish\` indeksira posao u pretraživač i emitira event \`job.created\`.
- Notification engine šalje push/email pružateljima koji zadovoljavaju filtere.

**Baza**
- \`Job\` (title, description, budgetMin/Max, location, status, categoryId, urgency, deadline).
- \`JobAttachment\` čuva metapodatke i URL-eve datoteka, \`JobCategory\` povezuje s više podkategorija.
- Indeksi na \`categoryId\`, \`status\`, \`city\` optimiziraju pretraživanje i matchmaking.

**Integracije**
- S3 za pohranu priloga, geokodiranje (Mapbox) za latitude/longitude.
- Search indeks (Algolia/Elastic) osvježava se nakon kreiranja posla.

**API**
- \`POST /api/jobs\` (body: title, description, categoryId, location, budget, attachments…).
- \`GET /api/jobs/:jobId\` vraća detalje i timeline aktivnosti.
- \`PATCH /api/jobs/:jobId/status\` omogućava promjenu statusa (ACTIVE, IN_PROGRESS, COMPLETED, CANCELLED).
      `
    },
    "Slanje ponuda za poslove": {
      implemented: true,
      summary: "Kao pružatelj, pošaljite ponudu korisniku s cijenom i porukom u kojoj objašnjavate svoj pristup.",
      details: `**Kako funkcionira**
- U detaljima posla odaberete “Pošalji ponudu”, unesete iznos, procijenjeno trajanje, poruku i po želji označite “Pregovorno”.
- Klijent prima obavijest, uspoređuje ponude i može ih prihvatiti, odbiti ili zatražiti izmjene kroz chat.
- Status ponude (Na čekanju, Prihvaćena, Odbijena) vidljiv je u “Moje ponude” i automatski se ažurira.

**Prednosti**
- Strukturirani obrazac pomaže istaknuti iskustvo i jasne uvjete suradnje.
- Sva komunikacija i pregovori ostaju u istoj niti, bez gubitka konteksta.

**Kada koristiti**
- Kada ste procijenili posao i želite formalno predstaviti ponudu s jasno definiranim uvjetima.
- Za ponovnu ponudu nakon odbijanja, uz napomenu o novim cijenama ili rokovima.
`,
      technicalDetails: `**Frontend**
- \`JobDetails.jsx\` prikazuje \`OfferForm\` modal; koristi React Hook Form, React Query i rich-text editor za poruku.
- Badge “Pregovorno” i timeline komponenta \`OfferStatusTimeline\` prikazuju status i promjene u realnom vremenu.
- Notifikacije i toasts informiraju o promjenama statusa i zahtjevima za reviziju.

**Backend**
- \`POST /api/offers\` validira budžet, provjerava da je pružatelj kvalificiran te kreira \`Offer\`.
- \`offerService.submit\` emitira \`offer.submitted\`, kreira chat thread i ažurira SLA metrike.
- \`offerService.updateStatus\` obrađuje prihvat/odbijanje i pokreće escrow/billing procese ako je potrebno.

**Baza**
- \`Offer\` (jobId, providerId, amount, currency, estimatedDays, isNegotiable, status, message).
- \`OfferHistory\` bilježi sve promjene statusa i komentare; \`OfferAttachment\` čuva dodatne dokumente.
- \`JobOfferMetric\` agregira broj ponuda, vrijeme odgovora i konverziju.

**Integracije**
- Notification servis (email/push/SMS) za klijenta i pružatelja.
- Billing modul rezervira kredite pri prihvaćanju ponude ako job ima escrow.

**API**
- \`POST /api/offers\` – kreira ponudu; \`GET /api/offers/:id\` vraća detalje i povijest.
- \`PATCH /api/offers/:id\` omogućuje revizije (novi iznos, poruka).
- \`POST /api/offers/:id/accept\` i \`/reject\` mijenjaju status i pokreću daljnje procese.
      `
    },
    "Ocjenjivanje pružatelja usluga (1-5 zvjezdica)": {
      implemented: true,
      summary: "Ocijenite pružatelja nakon završenog posla i pomozite drugim korisnicima odabrati kvalitetnog pružatelja.",
      details: `**Kako funkcionira**
- Kada je posao označen dovršenim, otključava se forma za ocjenu (1-5 zvjezdica) i kratku recenziju.
- Recenzija se prikazuje na profilu pružatelja, a prosječna ocjena i reputacijski bodovi automatski se ažuriraju.
- Pružatelj može uzvratno ocijeniti klijenta; obje strane vide svoje povratne informacije.

**Prednosti**
- Transparentne ocjene i komentari pomažu drugim korisnicima odabrati provjerene profesionalce.
- Pružatelji s dobrim ocjenama dobivaju bolji ranking u matchmakingu i više leadova.

**Kada koristiti**
- Odmah nakon završetka posla, dok su detalji iskustva svježi.
- Kad želite ažurirati recenziju (npr. nakon dodatnih radova) ili prijaviti problem timu podrške.
`,
      technicalDetails: `**Frontend**
- \`ReviewForm.jsx\` integriran u \`JobDetails\` i \`ProviderProfile\`; koristi React Hook Form i komponentu \`StarRating\`.
- Sekcija \`ReviewList\` prikazuje recenzije s filtrima (ocjena, datum) i indikatorom verifikacije posla.
- Inline edit modal omogućuje ažuriranje komentara uz badge “Ažurirano”.

**Backend**
- \`POST /api/reviews\` validira da je posao završen i da recenzent pripada tom poslu.
- \`reviewService.create\` ažurira \`ProviderProfile.averageRating\`, recalculates reputacijske bodove i emitira event \`review.created\`.
- \`reviewService.update\` čuva povijest izmjena i pokreće moderacijski pipeline ako je komentar prijavljen.

**Baza**
- \`Review\` (jobId, reviewerId, reviewedUserId, rating, comment, editedAt).
- \`ReviewHistory\` spremna za audit trail, \`ProviderProfile\` polja \`averageRating\`, \`ratingCount\`.
- Unique indeks \`@@unique([jobId, reviewerId])\` sprječava duplikate.

**Integracije**
- Trust & safety modul (NLP) moderira sadržaj i označava sumnjive recenzije.
- Notifikacijski servis šalje email/push pružatelju, klijentu i account manageru ako rating < 3.

**API**
- \`POST /api/reviews\` – kreira recenziju; \`PATCH /api/reviews/:id\` – ažurira rating/komentar.
- \`DELETE /api/reviews/:id\` – uklanja recenziju uz audit zapis.
- \`GET /api/providers/:id/reviews\` – vraća recenzije s filter parametrima (rating, sort, page).
      `
    },
    "Real-time chat između korisnika i pružatelja": {
      implemented: true,
      summary: "Komunicirajte s korisnicima ili pružateljima u realnom vremenu preko chata na platformi.",
      details: `**Kako funkcionira**
- Svaki posao otvara dedikiranu chat sobu u kojoj sudjeluju klijent i odabrani pružatelji.
- Poruke se isporučuju u realnom vremenu (typing indicator, delivered/read status), uz mogućnost dijeljenja slika i dokumenata.
- Povijest razgovora ostaje dostupna i služi kao audit trail u slučaju nesporazuma.

**Prednosti**
- Centralizirana komunikacija vezana uz posao – nema potrebe za vanjskim aplikacijama.
- Statusi poruka i notifikacije osiguravaju da ništa ne promakne ni klijentu ni timu.

**Kada koristiti**
- Tijekom pregovora i izvedbe posla za razmjenu detalja, fotografija i dokumentacije.
- Za interni timski chat (pružatelj ↔ tim) ili privatni chat s account managerom.
`,
      technicalDetails: `**Frontend**
- Komponenta \`ChatWindow\` koristi React Query za sinkronizaciju, WebSocket hook za real-time i virtualizirani prikaz poruka.
- Uppy/React Dropzone omogućuju upload slika i dokumenata s prikazom pregleda.
- Toast notifikacije i badge brojač nepročitanih poruka u top baru.

**Backend**
- \`chatGateway\` (WebSocket) upravlja sobama, typing eventovima i ack statusima.
- REST endpointi: \`GET /api/chat/rooms/:jobId\`, \`POST /api/chat/messages\`, \`GET /api/chat/messages/:roomId\`.
- \`chatService\` čuva poruke, ažurira read stanje i pokreće moderacijske provjere.

**Baza**
- \`ChatRoom\` (jobId, participants, type), \`ChatMessage\` (roomId, senderId, content, status, attachments).
- \`ChatAttachment\` čuva metapodatke o datotekama; \`ChatReadReceipt\` evidentira pročitane poruke po korisniku.
- Indeksi na \`roomId\`, \`createdAt\` i \`senderId\` za brzo dohvaćanje povijesti.

**Integracije**
- WebSocket infrastruktura (Redis pub/sub) za horizontalno skaliranje.
- Notification servis (email/push/SMS) kada korisnik offline primi novu poruku.
- Moderacijski servis (AI) označava sumnjiv sadržaj i maskira kontakte do prihvaćanja ponude.

**API**
- \`GET /api/chat/rooms/:jobId\` – otvara sobu; \`GET /api/chat/messages/:roomId\` – paginirana povijest.
- \`POST /api/chat/messages\` – slanje poruke (body: roomId, content, attachments?).
- WebSocket eventi: \`message:new\`, \`message:read\`, \`typing\`, \`room:archived\`.
      `
    },
    "Prijava korisnika": {
      implemented: true,
      summary: "Prijavite se na svoj račun koristeći email i lozinku.",
      details: `**Kako funkcionira**
- Unesite e-mail i lozinku; sustav provjerava vjerodajnice, izdaje token i preusmjerava na dashboard uloge.
- Opcija “Zapamti me” aktivira produljenu sesiju (refresh token), dok “Odjava na svim uređajima” gasi druge sesije.
- Aktivnosti prijave (device, lokacija) prate se radi sigurnosti i prikazuju u profilu.

**Prednosti**
- Siguran pristup uz rate limiting i obavijesti o neobičnim prijavama.
- Podrška za multiple role (korisnik/pružatelj/admin) bez zasebnih računa.

**Kada koristiti**
- Svaki put kada pristupate platformi ili nakon isteka sesije.
- Kod prelaska na novi uređaj kako biste sinkronizirali pristup i notifikacije.
`,
      technicalDetails: `**Frontend**
- \`Login.jsx\` koristi React Hook Form i Yup validaciju, komponentu \`PasswordInput\` i toggle “Zapamti me”.
- Nakon uspješne prijave, refresh token se sprema u httpOnly cookie, access token u memory store.
- Header prikazuje \`RoleSwitcher\` koji koristi isti token za promjenu konteksta bez reautentikacije.

**Backend**
- \`POST /api/auth/login\` provjerava korisnika (bcrypt), primjenjuje rate limit (Redis) i izdaje JWT + refresh token.
- \`sessionService.create\` zapisuje sesiju (device, ip) i postavlja \`lastLoginAt\`.
- \`sessionService.terminateOthers\` omogućuje korisniku da zatvori druge aktivne sesije.

**Baza**
- \`User\` (email, passwordHash, role, lastLoginAt, failedLoginAttempts, isVerified).
- \`Session\` (userId, refreshTokenHash, deviceInfo, ipAddress, validUntil, revokedAt).
- \`LoginAudit\` čuva povijest pokušaja (success/fail) i koristi se za security analytics.

**Integracije**
- Email servis šalje upozorenje kod prijave s novog uređaja/lokacije.
- Security analytics (SIEM) ingestira login događaje kroz Kafka topic \`auth.logins\`.

**API**
- \`POST /api/auth/login\` – vraća access token i postavlja refresh cookie.
- \`POST /api/auth/logout\` – opoziva trenutnu sesiju.
- \`GET /api/auth/sessions\` – dohvaća aktivne sesije i podržava endpoint \`DELETE /api/auth/sessions/:sessionId\`.
      `
    },
    "Resetiranje lozinke": {
      implemented: true,
      summary: "Resetirajte svoju lozinku ako je zaboravite ili želite promijeniti.",
      details: `**Kako funkcionira**
- Klikom na “Zaboravljena lozinka?” unosite e-mail; sustav šalje jednokratni link s rokom trajanja (1 h).
- Otvaranjem linka dolazite na stranicu gdje unosite novu lozinku (dvostruka potvrda) i automatski se prijavljujete.
- Link vrijedi jednom; ako istekne ili je iskorišten, treba zatražiti novi.

**Prednosti**
- Samostalno vraćate pristup bez podrške, uz strogu kontrolu vremena i broja pokušaja.
- Novi hash odmah poništava sve aktivne sesije radi sigurnosti.

**Kada koristiti**
- Kada zaboravite lozinku ili sumnjate da je kompromitirana.
- Periodično, kao dio sigurnosne politike tvrtke.
`,
      technicalDetails: `**Frontend**
- Stranice \`ForgotPassword.jsx\` i \`ResetPassword.jsx\` koriste React Hook Form i Yup (email format, password strength).
- Password polja imaju indikator sigurnosti i potvrdu lozinke.
- Nakon uspjeha prikazuje se toast i redirect na login s auto-fillom emaila.

**Backend**
- \`POST /api/auth/forgot-password\` generira kriptirani token, sprema hash i šalje email.
- \`POST /api/auth/reset-password/:token\` validira token, postavlja novi bcrypt hash i revocira sesije.
- Rate limiter sprječava brute force i prevelik broj zahtjeva.

**Baza**
- \`User\` polja \`resetTokenHash\`, \`resetTokenExpiresAt\`, \`passwordHash\`.
- \`PasswordResetAudit\` čuva IP, device i status (initiated/success/expired).
- Token hash je unique indeksiran radi brze provjere.

**Integracije**
- Email servis šalje reset link s dinamičkim predloškom i fallback plain-text verzijom.
- Security modul (SIEM) prima event \`auth.password_reset\` za praćenje.

**API**
- \`POST /api/auth/forgot-password\` – body: { email }.
- \`POST /api/auth/reset-password/:token\` – body: { password }.
- \`POST /api/auth/reset-password/validate\` – opcionalni endpoint za provjeru tokena prije forme.
      `
    },
    "Zaboravljena lozinka": {
      implemented: true,
      summary: "Vratite pristup svom računu ako ste zaboravili lozinku.",
      details: `**Kako funkcionira**
- Na login stranici odaberete “Zaboravljena lozinka?”, unesete e-mail i pošaljete zahtjev.
- Na e-mail stiže siguran link (vrijedi 1 sat) koji vodi na stranicu za postavljanje nove lozinke.
- Nakon potvrde nove lozinke sve stare sesije se automatski odjavljuju i možete se prijaviti s novim podacima.

**Prednosti**
- Samostalno i brzo vraćate pristup bez podrške, uz jasne sigurnosne kontrole.
- Link je jednokratan i vremenski ograničen kako bi se spriječila zloupotreba.

**Kada koristiti**
- Kad zaboravite lozinku ili kada želite prisilno resetirati račun zbog sumnjive aktivnosti.
- Kao dio periodične promjene lozinke prema internim pravilima.
`,
      technicalDetails: `**Frontend**
- \`ForgotPassword.jsx\` koristi React Hook Form i prikazuje potvrdu s uputama (provjeri spam, rok linka).
- \`ResetPassword.jsx\` validira jačinu lozinke i dvostruki unos; prikazuje indikator kompleksnosti.
- Nakon uspjeha prikazuje se toast i redirect na login s automatskim popunjavanjem emaila.

**Backend**
- \`POST /api/auth/forgot-password\` validira korisnika, generira hashirani reset token i šalje email (rate limited).
- \`POST /api/auth/reset-password/:token\` provjerava token, postavlja novu lozinku i gasi aktivne sesije.
- Event \`password.reset.requested\` i \`password.reset.completed\` odlaze u security pipeline.

**Baza**
- \`User\` polja \`resetTokenHash\`, \`resetTokenExpiresAt\`, \`passwordHash\`.
- \`PasswordResetAudit\` čuva IP adresu, device i status (initiated, completed, expired).
- Indeks \`@@index([resetTokenExpiresAt])\` olakšava čišćenje istečenih tokena.

**Integracije**
- Email provider s transactional template; opcionalno SMS za premium partnere.
- Background job \`cleanupExpiredResetTokens\` (cron) uklanja neiskorištene zapise.

**API**
- \`POST /api/auth/forgot-password\` – body: { email }.
- \`POST /api/auth/forgot-password/resend\` – ponovno slanje linka (rate limited).
- \`POST /api/auth/reset-password/:token\` – spremanje nove lozinke i invalidacija tokena.
      `
    },
    "51 kategorija usluga": {
      implemented: true,
      summary: "Platforma nudi 51 različitu kategoriju usluga iz raznih područja.",
      details: `**Kako funkcionira**
- Kategorije pokrivaju građevinu, instalacije, održavanje, čišćenje, IT i specijalizirane usluge.
- Korisnik pri objavi posla bira glavnu kategoriju i opcionalne podkategorije; pružatelj označava u kojim kategorijama želi primati leadove.
- Svaka kategorija ima opis, ikonu i pravila licenciranja koji pomažu filtrirati prave partnere.

**Prednosti**
- Precizno targetiranje poslova i leadova smanjuje nepotrebne ponude i povećava konverziju.
- Hijerarhija i emojiji olakšavaju navigaciju i onboarding novih korisnika.

**Kada koristiti**
- Pri objavi posla za odabir odgovarajuće kategorije i boljeg matchinga.
- Kod konfiguracije pružateljskog profila i upravljanja pretplatama po kategorijama.
`,
      technicalDetails: `**Frontend**
- \`CategorySelect\`, \`CategoryList\` i \`CategoryFilter\` komponente koriste React Query za lazy loading i pretraživanje.
- Hierarchical tree prikaz omogućuje collapse/expand podkategorija i prikaz badgeva (npr. licence obavezne).
- Admin UI (\`CategoryManager.jsx\`) podržava dodavanje/uređivanje kategorija s inline validacijom.

**Backend**
- \`GET /api/categories\` vraća aktivne kategorije s podrškom za hijerarhiju i lokalizaciju.
- \`categoryService.sync\` upravlja kreiranjem, reorderingom i deaktivacijom kategorija (audit trail).
- \`categoryCache\` (Redis) osigurava brzi dohvat za feedove i matchmaking.

**Baza**
- \`Category\` (id, name, slug, description, emoji, order, isActive, parentId, requiresLicense).
- \`CategoryTranslation\` za višestruke jezike; \`CategoryLicenseRequirement\` mapira obavezne dokumente.
- Materializirani view \`CategoryHierarchyView\` optimizira dohvat za front-end tree.

**Integracije**
- Search indeks (Algolia/Elastic) sinkronizira kategorije za autocomplete.
- Admin webhook \`category.updated\` obavještava marketing/CRM sustave.

**API**
- \`GET /api/categories\` – lista s opcionalnim query parametrima (parentId, includeInactive).
- \`POST /api/admin/categories\` – kreira/uređuje kategoriju.
- \`GET /api/categories/:id\` – detalji zajedno s potrebnim licencama i statistikama.
      `
    },
    "ROI dashboard": {
      implemented: true,
      summary: "Vidite detaljne statistike vašeg poslovanja - koliko zaradujete, koliko trošite i koliki je vaš ROI.",
      details: `**Kako funkcionira**
- Dashboard prikuplja KPI-je (ROI, stopu konverzije, prosječnu vrijednost leada, potrošene kredite i prihod) iz lead događaja, plaćanja i konverzija.
- Grafovi i tablice prikazuju trendove po mjesecima, kategorijama i regijama te usporedbu s prosjekom tržišta.
- AI modul generira preporuke (npr. fokusirajte se na leadove s budžetom 5-10k EUR, produljite SLA u kategoriji Elektro).

**Prednosti**
- Jasno vidite profitabilnost i donosite odluke temeljene na podacima.
- U realnom vremenu pratite utjecaj kampanja, refundova i timskih SLA performansi.

**Kada koristiti**
- Tjedni ili mjesečni pregled performansi i planiranje budžeta.
- Izvještavanje prema upravi ili partnerima uz izvoz PDF/CSV izvještaja.
`,
      technicalDetails: `**Frontend**
- \`RoiDashboard.tsx\` koristi React Query za dohvat snapshotova i Recharts/Chart.js za vizualizacije (trendovi, heatmap).
- \`RoiTable\` prikazuje lead-by-lead performanse uz filtre (period, kategorija, tim).
- Komponenta \`AiRecommendationCard\` renderira savjete s CTA linkovima (npr. otvori marketplace filter).

**Backend**
- \`roiController\` agregira podatke iz \`LeadPurchase\`, \`LeadPerformance\`, \`CreditTransaction\`.
- \`roiSnapshotJob\` kreira dnevne/mjesečne snapshotove i zapisuje ih u \`ProviderROI\`.
- Event handleri (lead.purchase, lead.converted, refund.processed) osvježavaju cache i emitiraju \`roi.metric.updated\`.

**Baza**
- \`ProviderROI\` (providerId, periodStart, periodEnd, revenue, cost, roiPercent).
- \`LeadPerformance\` i \`LeadPurchase\` bilježe detalje; materializirani view \`RoiTrendView\` ubrzava grafove.
- \`RoiRecommendation\` sprema AI sugestije s ocjenom povjerenja.

**Integracije**
- Stripe i kreditni servis za financijske podatke; Kafka streamovi za lead evente; Redis cache za brza očitanja.
- Reporting servis generira PDF/CSV i šalje webhooks account managerima.

**API**
- \`GET /api/director/roi-dashboard\` – agregirani KPI-jevi i trendovi (query: range, groupBy).
- \`GET /api/director/roi-dashboard/leads\` – paginirana lista s filtrima (status, kategorija, score).
- \`POST /api/director/roi-dashboard/export\` – kreira export job i vraća download link.
`
    },
    "Kreditni sustav": {
      implemented: true,
      summary: "Koristite kredite kao valutu za kupovinu leadova - fleksibilno i jednostavno.",
      details: `**Kako funkcionira**
- Krediti su virtualna valuta platforme; kupnjom leada umanjuje se saldo, refund vraća kredite na račun.
- Pretplata, add-on paketi i TRIAL dodjeljuju kredite automatski, a dodatni se mogu kupiti jednokratno.
- Povijest transakcija prati svako dodavanje i trošenje s oznakama (purchase, refund, bonus, adjustment).

**Prednosti**
- Jednostavno planiranje budžeta: vidite trenutačni saldo, potrošnju i nadolazeće obnovljivosti.
- Automatizirana naplata i refund smanjuju ručni rad i sprječavaju gubitke.

**Kada koristiti**
- Svakodnevno praćenje salda prije kupnje leadova.
- Kod dodjele kredita timu (auto-assignment) i pri planiranju nadogradnje pretplate.
`,
      technicalDetails: `**Frontend**
- Header prikazuje \`CreditBalanceWidget\` s real-time saldom i upozorenjem pri low balance.
- \`BillingDashboard\` i \`CreditHistoryTable\` nude filtriranje po tipu transakcije i export CSV.
- Modal za kupnju kredita koristi Stripe Checkout i prikazuje preview salda nakon kupnje.

**Backend**
- \`creditService\` upravlja transakcijama (purchase, refund, adjustment) i emitira evente.
- \`creditBalanceJob\` (cron) provjerava low balance i šalje notifikacije.
- Event handleri (\`lead.purchased\`, \`lead.refunded\`, \`subscription.renewed\`) automatiziraju promjene salda.

**Baza**
- \`CreditTransaction\` (type, amount, balanceAfter, metadata).
- \`CreditBalanceSnapshot\` čuva dnevne snapshotove radi izvještavanja.
- \`Subscription\` i \`BillingPlan\` definiraju mjesečne kvote i rollover pravila.

**Integracije**
- Stripe za naplatu dodatnih paketa; Redis cache za brzo očitanje salda.
- Webhook \`lead.refunded\` sinkronizira povrate s ROI i billing modulom.

**API**
- \`GET /api/director/credits/balance\` – trenutni saldo i limit.
- \`GET /api/director/credits/history\` – paginirana povijest (query: type, dateRange).
- \`POST /api/director/credits/purchase\` – pokreće kupnju dodatnih kredita.
`
    },
    "AI score kvalitete leadova": {
      implemented: true,
      summary: "Svaki lead dobiva automatsku ocjenu kvalitete od 0-100 koja pokazuje koliko je lead vrijedan. (Rule-based scoring algoritam)",
      details: `**Kako funkcionira**
- Rule-based scoring algoritam ocjenjuje leadove prema verifikaciji klijenta, detaljnosti opisa, budžetu, prilozima, hitnosti, roku i lokaciji.
- **Napomena**: Ovo je rule-based algoritam (ne pravi AI), ali se može nadograditi s pravim AI-om u budućnosti.
- Rezultat (0-100) mapira se na razrede kvalitete (Slab, Prosječan, Dobar, Vrhunski) i determinira cijenu leada.
- Score se osvježava pri svakoj promjeni podataka i dostupno je filtriranje prema rasponu.

**Prednosti**
- Prije kupnje znate vjerojatnost konverzije i možete optimizirati potrošnju kredita.
- Strategije kupnje (premium leadovi vs. miks) postaju transparentne i lakše za A/B testiranje.

**Kada koristiti**
- Kod pregleda marketplacea za odabir leadova i pri planiranju budžeta po kategoriji.
- Pri retroaktivnoj analizi performansi kako biste usporedili score s realnim konverzijama.
`,
      technicalDetails: `**Frontend**
- Marketplace prikazuje badge s bojom i score vrijednošću; tooltips objašnjavaju faktore.
- Filter “AI score” omogućuje raspon (slider) i predefinirane segmente (80+, 60-79...).
- \`PartnerAnalytics\` graf uspoređuje kupljene leadove i uspješnost prema score bucketu.

**Backend**
- \`ai-lead-scoring.js\`: \`calculateLeadQualityScore()\` izračunava score na osnovu 10 faktora (rule-based algoritam).
- \`evaluateAndUpdateJobScore()\` automatski ažurira score pri kreiranju leada.
- **Napomena**: Ovo je rule-based scoring algoritam, ne pravi AI. Može se nadograditi s pravim AI-om (npr. OpenAI, Google Cloud ML) u budućnosti.

**Baza**
- \`LeadScore\` (leadId, scoreValue, tier, sourceModel, updatedAt).
- \`LeadScoreHistory\` prati promjene kroz vrijeme radi analitike.
- \`LeadFeatureSnapshot\` čuva ulazne feature setove (budget, verification, urgency).

**Integracije**
- ML servis (Python/Vertex/ SageMaker) za inferenciju; Redis cache za brzi dohvat.
- Kafka topic \`lead.scored\` sinkronizira druge module (notifications, analytics).

**API**
- \`GET /api/provider/leads\` – uključuje score i tier u payloadu.
- \`GET /api/provider/leads/score-stats\` – agregirani pregled po kategoriji/regiji.
- \`POST /api/internal/leads/:id/rescore\` – admin endpoint za ručno ponavljanje scoringa.
`
    },
    "SMS verifikacija telefonskog broja (Twilio)": {
      implemented: true,
      summary: "Potvrdite svoj telefon putem SMS poruke s verifikacijskim kodom.",
      details: `**Kako funkcionira**
- Korisnik unosi broj u E.164 formatu; sustav šalje 6-znamenkasti kod putem Twilio Verify usluge.
- Kod vrijedi 10 minuta i može se unijeti do 5 puta; nakon isteka generira se novi.
- Uspješna verifikacija dodaje badge na profil i omogućuje dvofaktorsku autentifikaciju.

**Prednosti**
- Veći trust score i veća vidljivost profila jer je kontaktnost potvrđena.
- Smanjena zloupotreba anonimnih brojeva, brže povezivanje s klijentima (click-to-call).

**Kada koristiti**
- Tijekom registracije pružatelja i kod promjene broja.
- Kada želite aktivirati dodatne sigurnosne značajke (2FA, SLA podsjetnici na SMS).
`,
      technicalDetails: `**Frontend**
- \`PhoneVerificationModal\` koristi React Hook Form, countdown timer i resend gumb s rate limitom.
- Validacija formata (libphonenumber) i maskirani prikaz broja nakon verifikacije.
- Badge komponenta na profilu prikazuje status (Verificiran, U tijeku, Potrebna akcija).

**Backend**
- \`smsVerificationService.start(phone)\` kreira Twilio Verify session i sprema requestId.
- \`smsVerificationService.confirm(code)\` validira kod, bilježi status i emitira event \`phone.verified\`.
- Rate limiter (Redis) kontrolira koliko puta isti broj može tražiti kod u kratkom periodu.

**Baza**
- \`PhoneVerification\` (userId, phone, status, attempts, lastRequestedAt, verifiedAt).
- \`User\`, \`ProviderProfile\` ažuriraju polja \`isPhoneVerified\` i \`phone\`.
- Audit tablica \`VerificationLog\` čuva pokušaje radi sigurnosti.

**Integracije**
- Twilio Verify API za slanje kodova; Redis za rate limit i token cache.
- Notification servis šalje follow-up email ako verifikacija nije dovršena.

**API**
- \`POST /api/auth/phone/send-code\` – inicira verifikaciju.
- \`POST /api/auth/phone/verify\` – potvrđuje kod.
- \`GET /api/auth/phone/status\` – vraća trenutni status verifikacije.
`
    },
    "Prosječno vrijeme odgovora (avgResponseTimeMinutes)": {
      implemented: true,
      summary: "Platforma prati koliko brzo odgovarate na leadove - brži odgovori znače bolju reputaciju.",
      details: `**Kako funkcionira**
- Nakon kupnje leada starta timer; zaustavlja se kad lead označite “Kontaktirano” ili “Konvertirano”.
- Sustav izračunava prosjek po danu/tjednu i prikazuje ga na dashboardu te u SLA badgeu.
- Prekoračenja SLA-a šalju upozorenja i utječu na matchmaking prioritet.

**Prednosti**
- Brzi odgovori povećavaju konverziju, reputaciju i prioritet u dodjeli novih leadova.
- Tim ima jasne metrike performansi i može identificirati uska grla.

**Kada koristiti**
- Svakodnevni nadzor tima (direktor, team lead) kako bi održali SLA ciljeve.
- Kod pripreme izvještaja i planiranja resursa (dodjela leadova, zapošljavanje).
`,
      technicalDetails: `**Frontend**
- \`ResponseTimeWidget\` na dashboardu prikazuje trenutni prosjek i trend (React Query).
- SLA badge na marketplace karticama upozorava kada partner prelazi ciljani prag.
- \`ResponseAnalyticsChart\` vizualizira trend po kategorijama i članovima tima.

**Backend**
- \`responseTimeService.recordEvent\` bilježi vrijeme kupnje i vrijeme kontakta.
- \`slaScheduler\` provjerava leadove bez odgovora i šalje podsjetnike (email/SMS/push).
- Event \`lead.response.updated\` ažurira scoring i matchmaking.

**Baza**
- \`ResponseMetric\` (leadId, purchasedAt, firstResponseAt, responseMinutes).
- \`ResponseAggregation\` čuva dnevne agregate po partneru/timu.
- \`SLAStatus\` prati pragove (on track, at risk, breached).

**Integracije**
- Notification servis za podsjetnike i eskalacije; Redis za cache aktivnih leadova.
- Analytics modul koristi podatke za ROI i reputacijske izračune.

**API**
- \`GET /api/director/response-time\` – KPI i trendovi.
- \`GET /api/team/response-time\` – granularni prikaz po članovima tima.
- \`POST /api/integrations/lead/:id/mark-contacted\` – webhooks za CRM sinkronizaciju.
`
    },
    "Online plaćanje (Stripe Checkout)": {
      implemented: true,
      summary: "Sigurno i jednostavno plaćanje pretplata i leadova preko kreditne kartice.",
      details: `**Kako funkcionira**
- Odabir pretplate ili kupnje kredita otvara Stripe Checkout s vašim podacima i iznosom.
- Nakon uspješne autorizacije aktivira se plan, krediti se dodaju, a račun stiže emailom.
- Webhookovi obrađuju status plaćanja (success, failure, refund) i sinkroniziraju se s billing modulom.

**Prednosti**
- PCI-DSS kompatibilna naplata bez čuvanja kartica na našoj strani.
- Transparentni računi i automatizirani refundi kad se lead vrati.

**Kada koristiti**
- Pri upgradeu pretplate, kupnji add-on paketa ili punjenju kredita izravno karticom.
- Za jednokratno plaćanje leadova kad nema dovoljno kredita.
`,
      technicalDetails: `**Frontend**
- \`BillingCheckoutButton\` poziva backend endpoint i preusmjerava na Stripe Checkout.
- \`PaymentResult.jsx\` prikazuje status (success/cancel) i CTA-ove (natrag na dashboard, ponovno pokušaj).
- Billing dashboard dohvaća povijest plaćanja i preuzimanje PDF faktura.

**Backend**
- \`billingController.createCheckoutSession\` kreira Stripe session na temelju plana/add-ona/leadId.
- \`stripeWebhookHandler\` obrađuje evente (checkout.session.completed, invoice.payment_failed, charge.refunded).
- \`subscriptionService.activatePlan\` i \`creditService.addCredits\` sinkroniziraju rezultat plaćanja.

**Baza**
- \`Payment\` i \`Invoice\` tablice čuvaju Stripe ID-eve, status, amount, currency.
- \`Subscription\` bilježi aktivni plan, datum isteka i zadnje uspješno plaćanje.
- \`CreditTransaction\` povezuje plaćanja s dodijeljenim kreditima.

**Integracije**
- Stripe Checkout i Customer portal; webhook endpoint za evente.
- Email/SMS servis šalje potvrde plaćanja i podsjetnike o isteku kartice.

**API**
- \`POST /api/billing/checkout-session\` – kreira sesiju (body: planId/addonId/leadId).
- \`POST /api/billing/stripe/webhook\` – prima Stripe događaje.
- \`GET /api/director/billing/invoices\` – vraća povijest plaćanja i linkove na fakture.
`
    },
    "Automatski refund nakon 48h neaktivnosti": {
      implemented: true,
      summary: "Ako ne kontaktirate klijenta unutar 48 sati nakon kupovine leada, krediti vam se automatski vraćaju.",
      details: `**Kako funkcionira**
- Nakon kupnje leada starta countdown od 48 sati; ako status ostane “Aktivno”, sustav automatski vraća kredite i lead vraća na tržište.
- Direktor dobiva obavijest o auto-refundu, a lead se označava kao “Refundiran” i ponovno ulazi u distributivni red.
- Bilo koja interakcija (status “Kontaktirano” ili bilješka) zaustavlja countdown i sprječava refund.

**Prednosti**
- Klijenti dobivaju pravovremene odgovore jer neaktivni leadovi brzo postaju ponovno dostupni.
- Pružatelji ne gube kredite kad objektivno ne stignu reagirati.

**Kada koristiti**
- Pasivna zaštita koja radi uvijek; potrebno je samo redovito ažurirati statuse leadova.
- Ručno produljenje vremena koristi se u iznimnim situacijama (npr. vikend, praznik).
`,
      technicalDetails: `**Frontend**
- Dashboard prikazuje countdown i status “Auto-refund pending”; upozorenja stižu 12 h i 2 h prije isteka.
- Notifikacije (email/SMS/push) podsjećaju direktora/tim da kontaktira lead.
- Povijest transakcija označava automatske refunde tagom “Auto-refund 48h”.

**Backend**
- \`refundScheduler\` svakih 30 minuta provjerava leadove u statusu “ACTIVE” starije od 48 h bez interakcije.
- \`leadRefundService.autoRefund(leadId)\` vraća kredite, ažurira lead i emitira event \`lead.auto.refunded\`.
- Queue engine ponovno objavljuje lead i resetira mu dostupnost.

**Baza**
- \`Lead\` bilježi polja \`autoRefundAt\` i \`lastContactedAt\`.
- \`CreditTransaction\` koristi tip AUTO_REFUND s referencom na lead.
- \`LeadRefundAudit\` čuva detalje izvođenja (timestamp, razlog, triggeredBy: SYSTEM).

**Integracije**
- Notifikacijski servis šalje potvrde i logira u aktivnosti tima.
- Analytics modul ažurira SLA/response metrike nakon refunda.

**API**
- \`GET /api/director/leads/auto-refund\` vraća leadove blizu isteka.
- \`POST /api/director/leads/:leadId/extend-auto-refund\` produljuje rok uz obavezno obrazloženje.
- \`POST /api/admin/leads/:leadId/review-refund\` otvara ticket ako partner osporava automatizam.
`
    },
    "JWT token autentifikacija": {
      implemented: true,
      summary: "Sigurna autentifikacija koja vam omogućava pristup platformi bez stalnog ponovnog prijavljivanja.",
      details: `**Kako funkcionira**
- Nakon uspješne prijave backend generira access token (kratak rok) i refresh token (dulji rok) vezan uz sesiju.
- Access token se šalje u Authorization headeru; refresh token obnavlja sesiju kada access token istekne.
- Odjava ili promjena lozinke opoziva refresh token i zatvara sve povezane sesije.

**Prednosti**
- Moderni stateless pristup bez potrebe za server-side session storage u API-ju.
- Lakša integracija s mobilnim/3rd-party aplikacijama uz granularne dozvole.

**Kada koristiti**
- Na svakom API pozivu koji zahtijeva autentifikaciju.
- Kod višestrukih uređaja (desktop/mobilno) gdje je potreban glatki prijelaz bez ponovne prijave.
`,
      technicalDetails: `**Frontend**
- Access token se pohranjuje u memory store (npr. Zustand/Redux), refresh token u httpOnly cookie.
- Interceptors automatski dodaju Authorization header i odrađuju refresh kada dobiju 401.
- UI prikazuje listu aktivnih sesija (device, IP) i omogućuje remote sign-out.

**Backend**
- \`authController.login\` generira JWT (HS256) s claimovima (sub, role, permissions, exp).
- \`authMiddleware\` validira token, učitava korisnika i role-permissions matrice.
- \`sessionService\` pohranjuje refresh token hash i omogućuje revokaciju po sesiji.

**Baza**
- \`Session\` (userId, refreshTokenHash, deviceInfo, ipAddress, revokedAt, expiresAt).
- \`User\` čuva zadnji login, failed attempts i role.
- Audit tablica \`LoginAudit\` bilježi izdavanje/obnavljanje tokena.

**Integracije**
- Redis cache za blacklistu opozvanih tokena (short TTL).
- SIEM logiranje (Kafka topic \`auth.logins\`) radi praćenja sigurnosnih incidenata.

**API**
- \`POST /api/auth/login\` – izdaje access i refresh token.
- \`POST /api/auth/refresh\` – vraća novi access token.
- \`POST /api/auth/logout\` – opoziva refresh token i čisti aktivnu sesiju.
`
    },
    "Različite uloge korisnika (USER, PROVIDER, ADMIN)": {
      implemented: true,
      summary: "Platforma podržava tri različite uloge korisnika s različitim dozvolama i funkcionalnostima.",
      details: `**Kako funkcionira**
- Svaki korisnik ima jednu ili više uloga (USER, PROVIDER, ADMIN) koje definiraju dostupne module i API dozvole.
- Prebacivanje između uloga radi se kroz role switcher bez ponovnog login-a.
- RBAC middleware provjerava ulogu prije svake osjetljive akcije (npr. kupnja leada, moderacija).

**Prednosti**
- Uloge su jasno razdvojene: korisnici vide samo relevantne opcije, administratori imaju kompletan nadzor.
- Jedan račun može pokrivati više potreba (npr. vlasnik tvrtke može i naručivati i prodavati usluge).

**Kada koristiti**
- Tijekom onboardinga kako bi se odabrao ispravan set funkcionalnosti.
- Kasnije, kada korisnik proširi poslovanje i treba dodatnu ulogu (npr. USER → + PROVIDER).
`,
      technicalDetails: `**Frontend**
- Role-based routing (React Router) i feature flags skrivaju module (npr. 'LeadMarketplace' samo za PROVIDER).
- \`RoleSwitcher\` u headeru poziva endpoint koji vraća dostupne uloge i aktivira novu.
- Guards na komponentama provjeravaju kontekst (npr. withRole('ADMIN')).

**Backend**
- \`authMiddleware\` čita token i postavlja \`req.user.roles\`.
- \`permissionGuard(requiredRoles)\` štiti rute (npr. admin panel, lead purchase).
- \`roleService.assignRole\` omogućuje adminima dodjelu/uklanjanje uloga i logira akciju.

**Baza**
- \`UserRole\` tablica mapira korisnike na role.
- \`PermissionAudit\` bilježi dodjele i revoke događaje.
- \`RoleFeatureToggle\` definira koje module dobiva svaka uloga.

**Integracije**
- Admin panel i CRM sinkroniziraju role (npr. account manager vidi listu PROVIDER-a).
- Analytics modul segmentira metrike po ulozi (User vs Provider behaviour).

**API**
- \`GET /api/auth/me\` – vraća dostupne uloge i aktivnu ulogu.
- \`POST /api/auth/switch-role\` – postavlja novu aktivnu ulogu (body: role).
- \`POST /api/admin/users/:id/roles\` – dodjeljuje ili uklanja role (requires ADMIN).
`
    },
    "Filtriranje pružatelja": {
      implemented: true,
      summary: "Pronađite pružatelje koji odgovaraju vašim kriterijima filtriranjem po kategoriji, lokaciji, ocjeni i dostupnosti.",
      details: `**Kako funkcionira**
- Filter panel omogućuje kombinaciju kategorija, gradova, raspona ocjena, dostupnosti i cijene.
- Rezultati se ažuriraju u realnom vremenu; filteri se pamte u URL-u i mogu se spremiti.
- Algoritam podržava geo-sorting (udaljenost) i dostupnost status.

**Prednosti**
- Brže pronalaženje relevantnih partnera.
- Osigurava da kontaktirate pružatelje koji rade u traženoj kategoriji i lokaciji.

**Kada koristiti**
- Kod selekcije pružatelja za određeni projekt.
- Za administrativne provjere (npr. pronaći sve pružatelje s ocjenom >4 u Zagrebu).
`,
      technicalDetails: `**Frontend**
- \`ProviderFilterPanel\` s facet filterima i range sliderom za ocjenu.
- React Query + URL sync za shareable filtere.

**Backend**
- \`providerController.list\` obrađuje filter parametre i sort (rating, distance).
- Geo filter koristi Haversine i PostGIS funkcije.

**Baza**
- Pogled \`ProviderSearchView\` s geometrijom, kategorijama i ocjenama.
- Indeksi za city, rating, availability.

**Integracije**
- Search API (Algolia/Elastic) za napredno tekstualno filtriranje.
- Analytics bilježi najkorištenije filtere i konverzije.

**API**
- \`GET /api/providers?categoryId=&city=&minRating=&availability=\`.
- \`GET /api/providers/facets\` – broj pružatelja po filteru.
- \`POST /api/providers/saved-filters\` – memoriranje kombinacija.
`
    },
    "Slanje slika u chatu": {
      implemented: true,
      summary: "Dijelite slike direktno u chat razgovoru s korisnicima ili pružateljima.",
      details: `**Kako funkcionira**
- U chatu odaberete opciju za prilog, odaberete fotografiju i aplikacija je automatski uploada, provjerava i prikazuje u razgovoru.
- Poruka s prilogom prikazuje thumbnail, opciju preuzimanja i informacije o veličini/datum uploada.
- Sustav validira tip i veličinu datoteke te obavještava ako je potrebno ponovno slanje.

**Prednosti**
- Brže pojašnjavate zahtjeve i stanje radova jer vizualno prikazujete situaciju.
- Smanjujete nesporazume i ubrzavate dogovore bez slanja mailova ili vanjskih aplikacija.

**Kada koristiti**
- Kod prvog kontakta s klijentom kako biste procijenili posao.
- Tijekom izvođenja radova za transparentno izvještavanje ili potvrdu završetka.
`,
      technicalDetails: `**Frontend**
- \`ChatWindow\` koristi \`AttachmentButton\` s react-dropzone/uppy za odabir i preview.
- Komponenta \`ImageMessage\` prikazuje thumbnail, modal za zumiranje i status upload-a.
- Progress indikator i retry gumb omogućuju kontrolu kod sporih mreža.

**Backend**
- \`chatAttachmentService.upload\` validira tip/veličinu, sprema na objektno skladište i vraća URL.
- \`chatMessageController.send\` povezuje poruku s attachmentom i emitira event preko WebSocket-a.
- Antivirus/scan job (ClamAV) označava priloge kao sigurni prije prikaza.

**Baza**
- \`ChatMessage\` referencira \`ChatAttachment\` (id, messageId, fileName, mediaType, size, storageKey).
- Audit polja (uploadedBy, uploadedAt) omogućuju praćenje i reviziju.
- Verzije poruka čuvaju informaciju je li attachment obrisan ili zamijenjen.

**Integracije**
- S3 kompatibilno spremište + CloudFront za CDN, opcionalno ImgProxy/Thumbor za generiranje thumbnaila.
- Event queue za antivirus skeniranje i resize pipeline.

**API**
- \`POST /api/chat/messages\` s multipart payloadom kombinira tekst i prilog.
- \`GET /api/chat/messages/:id/attachments/:attachmentId\` – secure download s potpisanim URL-om.
- \`DELETE /api/chat/attachments/:attachmentId\` – uklanja prilog uz audit zapis.
`
    },
    "Status poruke (poslana, pročitana)": {
      implemented: true,
      summary: "Vidite status svake poruke koju pošaljete - je li poslana, dostavljena ili pročitana.",
      details: `**Kako funkcionira**
- Svaka poslata poruka dobiva status: Poslana (✓), Dostavljena (✓✓) ili Pročitana (✓✓ s označenjem).
- Status se ažurira u realnom vremenu preko WebSocket događaja kad primatelj primi ili otvori poruku.
- Ako poruka ostane bez dostave, korisnik dobiva upozorenje i mogućnost ponovnog slanja.

**Prednosti**
- Jasno znate je li komunikacija stigla do klijenta/tima.
- Brže reagirate na neodgovorene poruke i izbjegavate propuštene prilike.

**Kada koristiti**
- Tijekom pregovora ili kritičnih rokova kako biste potvrdili da je poruka pročitana.
- Za interne timske koordinacije gdje je važno znati tko je vidio zadnje upute.
`,
      technicalDetails: `**Frontend**
- \`MessageBubble\` prikazuje status ikone; hook \`useMessageStatus\` sluša WebSocket evente.
- Tooltip ili tekstualna oznaka objašnjava značenje ikona; fallback badge upozorava na offline primatelja.
- Retry gumb je dostupan dok poruka nije potvrđena kao dostavljena.

**Backend**
- \`chatGateway\` šalje evente \`message.sent\`, \`message.delivered\`, \`message.read\`.
- \`messageService.markDelivered\` i \`markRead\` bilježe promjene i broadcastaju status svim sudionicima.
- Rate limit sprečava spam read potvrda kako bi se očuvala mrežna optimizacija.

**Baza**
- \`ChatMessage\` polja \`deliveredAt\`, \`readAt\`.
- \`ChatReadReceipt\` čuva pojedinačne statuse kada razgovor ima više članova (grupni chat).
- Auditing logira kada je status ručno resetiran (npr. moderator).

**Integracije**
- Push/e-mail obavijesti šalju se kada poruka nije pročitana nakon SLA vremena.
- Analytics modul koristi statuse za metrike angažmana (response time, seen rate).

**API**
- \`POST /api/chat/messages/:id/read\` – klijent potvrđuje da je poruku pročitao.
- \`GET /api/chat/messages/:id/status\` – vraća detaljan status za audit/analytics.
- WebSocket channel \`chat:message:status\` emitira promjene u realnom vremenu.
`
    },
    "Tržište leadova": {
      implemented: true,
      summary: "Pregledajte sve dostupne ekskluzivne leadove na jednom mjestu i odaberite najbolje za vas.",
      details: `**Kako funkcionira**
- Marketplace prikazuje sve aktivne ekskluzivne leadove s ključnim informacijama (opis, budžet, AI score, cijena).
- Filtri omogućuju odabir po kategoriji, lokaciji, budžetu, AI scoreu i statusu hitnosti; sortiranje po datumu, cijeni ili kvaliteti.
- Klik na lead otvara detalje, a kupnja se potvrđuje kreditima ili karticom; kontakt podaci postaju dostupni samo kupcu.

**Prednosti**
- Centraliziran pregled prilika uz transparentne cijene i kvalitativne oznake.
- Brza identifikacija leadova koji odgovaraju vašem profilu i strateškim ciljevima.

**Kada koristiti**
- Svakodnevni pregled novih leadova i proaktivna kupnja prije konkurencije.
- Planiranje širenja u nove kategorije/regije kroz analizu dostupne ponude.
`,
      technicalDetails: `**Frontend**
- \`LeadMarketplace.tsx\` koristi React Query i infinite scroll; \`LeadCard\` prikazuje score, cijenu i badgeve.
- Filter sidebar sinkronizira stanje preko URL parametara i local storage (last used filters).
- Modal \`LeadDetail\` prikazuje opis, SLA info i CTA za kupnju s real-time validacijom salda kredita.

**Backend**
- \`leadMarketplaceController.list\` dohvaća leadove prema filterima, osigurava da nisu već kupljeni.
- \`leadPurchaseService.purchase\` provjerava salda kredita, zaključava lead i pokreće billing workflow.
- Event \`lead.published\` automatski stavlja lead u marketplace i obavještava kvalificirane partnere.

**Baza**
- \`Lead\` (status, priceCredits, expiresAt, location, budgetMin/Max, urgency).
- \`LeadMarketplaceView\` materializirani pogled za brzu pretragu (score, categoryPath, region).
- \`LeadLock\` sprečava istovremenu kupnju istog leada.

**Integracije**
- Stripe za kartičnu kupnju kada nema kredita; Kafka za emitiranje događaja (lead.purchased, lead.viewed).
- Notification servis šalje push/email obavijesti partnerima prema preferencijama.

**API**
- \`GET /api/provider/marketplace\` – parametri: categories[], regions[], scoreMin, priceRange, urgency, sort.
- \`GET /api/provider/marketplace/:leadId\` – detalji leada.
- \`POST /api/provider/marketplace/:leadId/purchase\` – kupnja leada (body: paymentMethod).
`
    },
    "Moji leadovi": {
      implemented: true,
      summary: "Upravljajte svim leadovima koje ste kupili - pratite status, kontaktirajte klijente i označite rezultate.",
      details: `**Kako funkcionira**
- Sekcija prikazuje sve kupljene leadove s ključnim podacima (status, AI score, cijena, vrijeme od kupnje).
- Status se ažurira kroz akcije (Kontaktirano, Konvertirano, Refundirano, Isteklo) i sinkronizira s refund/SLA pravilima.
- Klik na lead otvara detalje s kontaktima, bilješkama, timelineom aktivnosti i gumbima za refund ili bilješku.

**Prednosti**
- Centraliziran pregled svih prilika s jasnim statusima i podsjetnicima.
- Tim brzo vidi što je u tijeku, što treba akciju i koje su konverzije postignute.

**Kada koristiti**
- Svakodnevni radni board za direktore i timove koji obrađuju leadove.
- Praćenje rezultata kampanja, identificiranje leadova za follow-up ili refund.
`,
      technicalDetails: `**Frontend**
- \`MyLeadsDashboard\` koristi kanban/tablični prikaz s filterima (status, kategorija, tim).
- \`LeadTimeline\` prikazuje log događaja (kupnja, kontakt, bilješke, refund).
- SLA indikator i countdown badge upozoravaju na auto-refund rok.

**Backend**
- \`leadController.listOwned\` vraća leadove za partnera s agregiranim statistikama.
- \`leadStatusService.update\` validira tranzicije (npr. Aktivno → Kontaktirano) i emitira evente.
- \`refundService.request\` provjerava uvjete i otvara ticket za manual review ako je potrebno.

**Baza**
- \`Lead\` (ownerId, status, purchasedAt, lastContactedAt, convertedAt).
- \`LeadStatusHistory\` bilježi sve promjene s korisnikom i razlogom.
- \`LeadNote\` čuva interne bilješke i follow-up zadatke.

**Integracije**
- Notification servis šalje reminder za follow-up; analytics modul ažurira ROI i responsetime metrike.
- CRM integracija (webhook) može sinkronizirati promjene statusa.

**API**
- \`GET /api/provider/leads\` – lista s filtrima (status, dateRange, category).
- \`POST /api/provider/leads/:leadId/status\` – ažuriranje statusa (body: status, note?).
- \`POST /api/provider/leads/:leadId/refund\` – iniciranje refund zahtjeva.
`
    },
    "Fakturiranje (PDF fakture za pretplate i kupovine)": {
      implemented: true,
      summary: "Za sve naplate generiramo PDF fakture spremne za računovodstvo i porezne potrebe. PDF fakture se automatski spremaju u AWS S3 za trajno čuvanje.",
      details: `**✅ POTPUNO IMPLEMENTIRANO**: Kompletan sustav za generiranje i čuvanje PDF faktura s AWS S3 storage integracijom. PDF fakture se automatski generiraju, uploadaju u S3 i spremaju URL u bazu podataka.

**Kako funkcionira**
- Svaka naplata (pretplata, kartična kupnja leadova) generira fakturu s pravnim podacima i PDV tretmanom.
- PDF faktura se automatski generira i uploada u AWS S3 bucket.
- S3 URL se sprema u bazu podataka (\`Invoice.pdfUrl\`).
- Fakture su dostupne u povijesti transakcija i šalju se emailom korisniku.
- Korisnik može ponovno preuzeti fakturu u svakom trenutku (iz S3 ili regeneracijom).
- Ako je faktura fiskalizirana (ZKI/JIR), PDF se regenerira i re-uploada u S3 s ažuriranim podacima.

**Prednosti**
- Pojednostavljuje računovodstvo i porezne obveze.
- Garantira da su svi podaci konzistentni i usklađeni s propisima.
- Trajno čuvanje faktura u AWS S3 (scalable, reliable storage).
- Brzo preuzimanje faktura iz S3 (bez regeneracije).
- Automatska integracija s fiskalizacijom (ZKI/JIR).

**Kada koristiti**
- Mjesečno knjigovodstvo, revizije i porezne prijave.
- Interna evidencija i transparentnost prema klijentima.
- Pravne i porezne obveze.
`,
      technicalDetails: `**Backend**
- \`invoice-service.js\`:
  - \`generateInvoicePDF(invoice)\`: Generira PDF fakturu s Uslugar brandingom, korisničkim podacima, PDV-om i fiskalizacijskim podacima (ZKI/JIR).
  - \`saveInvoicePDF(invoice, pdfBuffer)\`: Uploada PDF u S3 i ažurira \`Invoice.pdfUrl\`.
  - \`generateAndSendInvoice(invoiceId)\`: Generira PDF, uploada u S3, fiskalizira (ako je potrebno), regenerira PDF s ZKI/JIR i šalje emailom.
- \`s3-storage.js\`:
  - \`uploadInvoicePDF(pdfBuffer, invoiceNumber)\`: Uploada PDF u S3 bucket (\`invoices/{invoiceNumber}.pdf\`).
  - \`downloadInvoicePDF(invoiceNumber)\`: Downloada PDF iz S3.
  - \`getInvoicePDFPresignedUrl(invoiceNumber, expiresIn)\`: Generira presigned URL za private bucket (1 sat default).
  - \`deleteInvoicePDF(invoiceNumber)\`: Briše PDF iz S3.
  - \`isS3Configured()\`: Provjerava da li je S3 konfiguriran.

**Baza**
- \`Invoice\` model:
  - \`pdfUrl\`: S3 URL fakture (npr. \`https://bucket.s3.region.amazonaws.com/invoices/2025-0001.pdf\`).
  - \`pdfGeneratedAt\`: Datum generiranja PDF-a.
  - \`invoiceNumber\`: Format YYYY-XXXX (npr. 2025-0001).

**S3 Konfiguracija**
- Environment varijable:
  - \`AWS_S3_BUCKET_NAME\`: Ime S3 bucket-a (npr. \`uslugar-invoices\`).
  - \`AWS_REGION\`: AWS regija (default: \`eu-north-1\`).
  - \`AWS_ACCESS_KEY_ID\` i \`AWS_SECRET_ACCESS_KEY\`: Za lokalni development (opcionalno, ECS koristi IAM role).
- S3 bucket struktura:
  - \`invoices/{invoiceNumber}.pdf\`: PDF fakture.
- Ako S3 nije konfiguriran, PDF se generira na zahtjev (fallback).

**Integracije**
- AWS S3: Trajno čuvanje PDF faktura.
- Stripe: Povezanost s payment intents i invoices.
- Fiskalizacija: Automatska integracija s ZKI/JIR kodovima.
- Email: Slanje faktura u privitku.

**API**
- \`GET /api/invoices\`: Lista faktura korisnika.
- \`GET /api/invoices/:invoiceId\`: Dohvat pojedinačne fakture.
- \`GET /api/invoices/:invoiceId/pdf\`: Preuzimanje PDF-a (iz S3 ili regeneracija).
- \`POST /api/invoices/:invoiceId/send\`: Slanje fakture emailom.
- \`POST /api/invoices/:invoiceId/fiscalize\`: Ručna fiskalizacija.
- \`POST /api/invoices/:invoiceId/storno\`: Storniranje fakture (admin).

**Dependencies**
- \`@aws-sdk/client-s3\`: AWS S3 client.
- \`@aws-sdk/s3-request-presigner\`: Presigned URLs za private bucket.
- \`pdfkit\`: Generiranje PDF dokumenata.
`
    },
    "Povrat novca za pretplate (refund subscription payment)": {
      implemented: true,
      summary: "Pretplatnici mogu zatražiti refund pretplate; sredstva se vraćaju karticom ili kreditima ovisno o izvoru plaćanja.",
      details: `**Kako funkcionira**
- Korisnik pokreće zahtjev preko podrške ili self-service forme.
- Billing tim/automatika provjerava uvjete (vrijeme od naplate, iskorištenost kredita) i odobrava/refuzira refund.
- Odobreni refund vraća sredstva preko Stripe-a ili kreditnog leđera te ažurira status pretplate.

**Prednosti**
- Zaštita korisnika i transparentan proces reklamacije.
- Evidencija i auditable trag svih odluka.

**Kada koristiti**
- U prvih X dana nakon naplate (policy), kod tehničkih problema ili dvostrukih naplata.
- Kod downgrade scenarija gdje je opravdan djelomični refund.
`,
      technicalDetails: `**Frontend**
- Support/contact forma s predefiniranim razlozima i uploadom dokazne dokumentacije.
- Status zahtjeva prikazan u profilu (pending, approved, rejected).

**Backend**
- \`subscriptionRefundService.request\` kreira zahtjev i delegira Stripe/kreditni refund.
- Pretplata se prema potrebi cancel-a ili prorata.

**Baza**
- \`SubscriptionRefundRequest\` (subscriptionId, reason, amount, status, resolvedAt).
- Povezani \`CreditTransaction\` ili \`PaymentLog\` zapisi.

**Integracije**
- Stripe Billing, accounting export, support ticketing (Zendesk/Jira).

**API**
- \`POST /api/subscriptions/:id/refund\` – kreira zahtjev.
- \`GET /api/subscriptions/refunds\` – lista zahtjeva i statusa.
`
    },
    "Detaljni opis posla": {
      implemented: true,
      summary: "Dajte što detaljniji opis posla kako bi pružatelji znali točno što trebate.",
      details: `**Kako funkcionira**
- Formular za objavu posla traži detalje: što treba napraviti, trenutno stanje, dimenzije, specifične zahtjeve i materijale.
- Preporučuje upload fotografija i odabir kategorije/podne kategorije kako bi algoritam bolje spojio pružatelje.
- Preview prikazuje kako će posao izgledati pružateljima prije objave.

**Prednosti**
- Bolje definirani poslovi privlače relevantne ponude i manje pitanja.
- Pružatelji mogu preciznije procijeniti cijenu i vrijeme bez dodatnih konzultacija.

**Kada koristiti**
- Uvijek pri objavi novog posla; detaljni opisi posebno su važni za kompleksne projekte ili specijalizirane radove.
- Kod osvježavanja postojećeg posla (edit) kako bi se dodali novi detalji ili fotografije.
`,
      technicalDetails: `**Frontend**
- \`CreateJobForm\` koristi React Hook Form i Yup validaciju (description min length, required polja).
- Rich-text editor s hintovima (predlošci) i onboarding tooltipovima za savjete.
- Image uploader (uppy) komprimira fotografije prije slanja i prikazuje preview.

**Backend**
- \`jobController.create\` validira payload (opis, kategorije, budžet) i sanitizira HTML.
- \`jobService.enrichDescription\` generira search tagove i šalje event za AI score prema opisu.
- Editing endpoint \`jobController.update\` bilježi izmjene u audit logu.

**Baza**
- \`Job\` polja \`description\`, \`requirements\`, \`materialsProvided\`, \`images\`.
- \`JobImage\` tablica čuva metapodatke o slikama (URL, altText).
- Audit tablica \`JobChangeLog\` bilježi promjene opisa.

**Integracije**
- AI modul (NLP) može sugerirati poboljšanja opisa ili dodavanje kategorija.
- Search indeks (Algolia/Elastic) koristi analizirani opis za relevantne rezultate.

**API**
- \`POST /api/jobs\` – kreira posao (body uključuje opis, kategorije, budžet, slike).
- \`PATCH /api/jobs/:jobId\` – ažurira opis i fotografije.
- \`POST /api/jobs/:jobId/images\` – upload dodatnih slika (multipart).
`
    },
    "Pretraživanje poslova": {
      implemented: true,
      summary: "Pronađite poslove koji vas zanimaju pomoću moderne tražilice s naprednim filterima, sortiranjem i spremljenim pretragama.",
      details: `**Kako funkcionira**
- Sticky search bar na vrhu stranice omogućava brzu pretragu po naslovu, opisu ili kategoriji.
- Quick filters (kategorija, grad, sortiranje) su dostupni odmah ispod search bara.
- Napredni filteri (budžet, status, datum) se otvaraju klikom na gumb "Filteri".
- Sortiranje: najnoviji, najstariji, budžet visok→nizak, budžet nizak→visok.
- View mode: prebacivanje između grid i list prikaza poslova.
- Spremljene pretrage: spremite svoje pretrage za brzo ponovno korištenje.
- Job alerts: primajte email notifikacije za nove poslove koji odgovaraju vašim kriterijima.

**Prednosti**
- Brzo pronalazite relevantne poslove bez ručnog listanja cijele ponude.
- Personalizirana upozorenja pomažu da prvi reagirate na nove prilike.
- Moderni, intuitivan dizajn poboljšava korisničko iskustvo.
- Fleksibilnost u načinu prikaza i filtriranja rezultata.

**Kada koristiti**
- Svakodnevno pretraživanje novih poslova u vašim kategorijama i regijama.
- Postavljanje dugoročnih pretraga za specijalizirane usluge ili veće projekte.
- Kada želite biti prvi koji reagira na nove poslove u određenim kategorijama.
`,
      technicalDetails: `**Frontend**
- Komponenta u \`App.jsx\` koristi sticky positioning za search bar.
- React state upravlja filterima, search query-em, view mode-om i spremljenim pretragama.
- \`useEffect\` hook automatski dohvaća poslove kada se filteri promijene.
- \`SavedSearchesSection\` u \`UserProfile.jsx\` upravlja spremljenim pretragama i job alertovima.

**Backend**
- Endpoint \`GET /api/jobs\` podržava sve filtere i sort opcije kroz query parametre.
- Endpointi u \`routes/saved-searches.js\` za upravljanje spremljenim pretragama.
- Endpointi u \`routes/job-alerts.js\` za upravljanje job alertovima.
- Background job (cron) provjerava nove poslove i šalje email notifikacije za job alerts.

**Baza**
- Tablica \`SavedSearch\` (id, userId, name, searchQuery, filters, isActive, createdAt, updatedAt, lastUsedAt).
- Tablica \`JobAlert\` (id, userId, name, searchQuery, filters, frequency, isActive, lastSentAt, createdAt, updatedAt).
- Indeksi na relevantnim poljima za brzu pretragu i sortiranje.

**Integracije**
- Email servis (nodemailer/SMTP) za slanje job alert notifikacija.
- Cron job za automatsku provjeru novih poslova i slanje email notifikacija.

**API**
- \`GET /api/jobs\` – query parametri: q, categoryId, city, budgetMin, budgetMax, status, sortBy, dateFrom, dateTo.
- \`GET /api/saved-searches\` – dohvat spremljenih pretraga.
- \`POST /api/saved-searches\` – spremanje pretrage.
- \`PUT /api/saved-searches/:id\` – ažuriranje pretrage.
- \`DELETE /api/saved-searches/:id\` – brisanje pretrage.
- \`POST /api/saved-searches/:id/use\` – označavanje pretrage kao korištene.
- \`GET /api/job-alerts\` – dohvat job alertova.
- \`POST /api/job-alerts\` – kreiranje job alerta.
- \`PUT /api/job-alerts/:id\` – ažuriranje job alerta.
- \`DELETE /api/job-alerts/:id\` – brisanje job alerta.
`
    },
    "Moderna tražilica poslova (sticky search bar)": {
      implemented: true,
      summary: "Sticky search bar na vrhu stranice omogućava brzu i jednostavnu pretragu poslova bez skrolanja.",
      details: `**Kako funkcionira**
- Tražilica je uvijek vidljiva na vrhu stranice (sticky positioning) čak i kada korisnik skrola.
- Veliki search input s ikonom omogućava brzu pretragu po naslovu, opisu ili kategoriji.
- Quick filters (kategorija, grad, sortiranje) su dostupni odmah ispod search bara.
- Gumb za napredne filtere otvara dodatne opcije (budžet, status, datum).

**Prednosti**
- Tražilica je uvijek dostupna bez obzira na poziciju na stranici.
- Moderni, čist dizajn poboljšava korisničko iskustvo.
- Brz pristup svim filterima i opcijama pretrage.

**Kada koristiti**
- Svakodnevno pretraživanje novih poslova.
- Brzo pronalaženje specifičnih poslova pomoću filtera.
`,
      technicalDetails: `**Frontend**
- Komponenta u \`App.jsx\` koristi \`sticky top-0\` CSS klasu za pozicioniranje.
- React state upravlja filterima i search query-em.
- \`useEffect\` hook automatski dohvaća poslove kada se filteri promijene.

**Backend**
- Endpoint \`GET /api/jobs\` podržava sve filtere i sort opcije.
- Query parametri se parsiraju i primjenjuju na Prisma upite.

**Baza**
- Tablica \`Job\` s indeksima na \`categoryId\`, \`city\`, \`budget\`, \`status\`, \`createdAt\`.

**API**
- \`GET /api/jobs?q=&categoryId=&city=&budgetMin=&budgetMax=&status=&sortBy=&dateFrom=&dateTo=\`
`
    },
    "Napredni filteri (kategorija, grad, budžet, status, datum)": {
      implemented: true,
      summary: "Napredni filteri omogućavaju precizno sužavanje rezultata pretrage poslova.",
      details: `**Kako funkcionira**
- Kategorija: Odabir specifične kategorije usluge.
- Grad: Filtriranje po lokaciji posla.
- Budžet: Min i max budžet u eurima.
- Status: Filtriranje po statusu posla (Otvoren, U tijeku, Završen).
- Datum: Filtriranje po datumu objave (od određenog datuma).

**Prednosti**
- Precizno pronalaženje poslova koji odgovaraju vašim kriterijima.
- Ušteda vremena eliminacijom nebitnih rezultata.
- Kombinacija više filtera za još preciznije rezultate.

**Kada koristiti**
- Kada tražite specifične poslove u određenoj kategoriji i lokaciji.
- Kada želite filtrirati poslove po budžetu ili statusu.
`,
      technicalDetails: `**Frontend**
- Napredni filteri se prikazuju u expandabilnom panelu ispod glavne tražilice.
- React state upravlja svim filterima i automatski dohvaća rezultate.

**Backend**
- Endpoint \`GET /api/jobs\` podržava sve filtere kroz query parametre.
- Prisma upiti se dinamički grade ovisno o dostupnim filterima.

**Baza**
- Indeksi na relevantnim poljima za brzu pretragu.
`
    },
    "Sortiranje poslova (najnoviji, najstariji, budžet visok→nizak, budžet nizak→visok)": {
      implemented: true,
      summary: "Sortiranje rezultata pretrage omogućava prikaz poslova prema vašim preferencama.",
      details: `**Kako funkcionira**
- Najnoviji: Poslovi sortirani po datumu objave (najnoviji prvo).
- Najstariji: Poslovi sortirani po datumu objave (najstariji prvo).
- Budžet visok→nizak: Poslovi sortirani po budžetu (najveći prvo).
- Budžet nizak→visok: Poslovi sortirani po budžetu (najmanji prvo).

**Prednosti**
- Brzo pronalaženje najrelevantnijih poslova prema vašim prioritetima.
- Fleksibilnost u načinu prikaza rezultata.

**Kada koristiti**
- Kada želite vidjeti najnovije poslove prvo.
- Kada tražite poslove s određenim budžetom.
`,
      technicalDetails: `**Frontend**
- Dropdown za odabir načina sortiranja u quick filters sekciji.
- React state upravlja sort opcijom.

**Backend**
- Endpoint \`GET /api/jobs\` podržava \`sortBy\` query parametar.
- Prisma \`orderBy\` se dinamički postavlja ovisno o odabranoj opciji.

**Baza**
- Indeksi na \`createdAt\` i \`budget\` poljima za brzo sortiranje.
`
    },
    "View mode - Grid i List prikaz poslova": {
      implemented: true,
      summary: "Prebacivanje između grid i list prikaza omogućava personalizaciju načina prikaza poslova.",
      details: `**Kako funkcionira**
- Grid prikaz: Poslovi prikazani u kartičnom formatu (3 kolone na desktopu).
- List prikaz: Poslovi prikazani u listi s detaljnijim informacijama.
- Gumb za prebacivanje između prikaza nalazi se u headeru tražilice.

**Prednosti**
- Grid prikaz omogućava brz pregled više poslova odjednom.
- List prikaz pruža više detalja o svakom poslu.
- Korisnik bira format koji mu najviše odgovara.

**Kada koristiti**
- Grid prikaz za brzi pregled više poslova.
- List prikaz kada želite vidjeti više detalja o svakom poslu.
`,
      technicalDetails: `**Frontend**
- React state \`viewMode\` upravlja načinom prikaza ('grid' ili 'list').
- Komponente \`JobCard\` (grid) i custom list item (list) se renderiraju uvjetno.
- Gumb za prebacivanje ažurira state.

**Backend**
- Nema promjena na backendu, samo frontend renderiranje.

**Baza**
- Nema promjena.
`
    },
    "Spremljene pretrage (saved searches)": {
      implemented: true,
      summary: "Spremite svoje pretrage za brzo ponovno korištenje bez ponovnog postavljanja filtera.",
      details: `**Kako funkcionira**
- Nakon postavljanja filtera, kliknite "Spremi pretragu" i unesite naziv.
- Spremljene pretrage se prikazuju u dropdownu u tražilici.
- Odabirom spremljene pretrage automatski se učitavaju filteri i query.
- Spremljene pretrage možete upravljati u profilu (dodaj, obriši).

**Prednosti**
- Ušteda vremena ponovnim korištenjem čestih pretraga.
- Brz pristup vašim omiljenim filterima.
- Praćenje zadnjeg korištenja pretrage.

**Kada koristiti**
- Kada često tražite iste tipove poslova.
- Kada želite brzo prebaciti između različitih pretraga.
`,
      technicalDetails: `**Frontend**
- Komponenta \`SavedSearchesSection\` u \`UserProfile.jsx\` upravlja spremljenim pretragama.
- Dropdown u tražilici prikazuje spremljene pretrage i omogućava brzo učitavanje.
- React state upravlja listom spremljenih pretraga.

**Backend**
- Endpointi u \`routes/saved-searches.js\`:
  - \`GET /api/saved-searches\` – dohvat svih spremljenih pretraga korisnika.
  - \`POST /api/saved-searches\` – kreiranje nove spremljene pretrage.
  - \`PUT /api/saved-searches/:id\` – ažuriranje pretrage.
  - \`DELETE /api/saved-searches/:id\` – brisanje pretrage.
  - \`POST /api/saved-searches/:id/use\` – označavanje pretrage kao korištene.

**Baza**
- Tablica \`SavedSearch\` (id, userId, name, searchQuery, filters, isActive, createdAt, updatedAt, lastUsedAt).
- Indeksi na \`userId\` i \`isActive\` za brzu pretragu.

**API**
- Sve operacije zahtijevaju autentifikaciju.
`
    },
    "Job alerts - email notifikacije za nove poslove": {
      implemented: true,
      summary: "Primajte email notifikacije za nove poslove koji odgovaraju vašim kriterijima pretrage.",
      details: `**Kako funkcionira**
- Kreirajte job alert s nazivom, filterima i frekvencijom (DAILY, WEEKLY, INSTANT).
- Sustav automatski provjerava nove poslove i šalje email notifikacije.
- Email sadrži linkove na nove poslove koji odgovaraju kriterijima.
- Job alerts možete aktivirati, pauzirati ili obrisati u profilu.

**Prednosti**
- Ne propuštate nove prilike koje odgovaraju vašim kriterijima.
- Automatsko praćenje novih poslova bez ručnog pretraživanja.
- Prilagodljive frekvencije notifikacija prema vašim preferencama.

**Kada koristiti**
- Kada tražite specifične tipove poslova u određenim kategorijama.
- Kada želite biti prvi koji reagira na nove poslove.
`,
      technicalDetails: `**Frontend**
- Komponenta \`SavedSearchesSection\` u \`UserProfile.jsx\` upravlja job alertovima.
- Forma za kreiranje alerta omogućava odabir naziva, filtera i frekvencije.

**Backend**
- Endpointi u \`routes/job-alerts.js\`:
  - \`GET /api/job-alerts\` – dohvat svih job alertova korisnika.
  - \`POST /api/job-alerts\` – kreiranje novog job alerta.
  - \`PUT /api/job-alerts/:id\` – ažuriranje alerta (uključujući aktivaciju/pauziranje).
  - \`DELETE /api/job-alerts/:id\` – brisanje alerta.
- Background job (cron) provjerava nove poslove i šalje email notifikacije.

**Baza**
- Tablica \`JobAlert\` (id, userId, name, searchQuery, filters, frequency, isActive, lastSentAt, createdAt, updatedAt).
- Indeksi na \`userId\`, \`isActive\`, \`frequency\` i \`lastSentAt\`.

**Integracije**
- Email servis (nodemailer/SMTP) za slanje notifikacija.
- Cron job za automatsku provjeru novih poslova.

**API**
- Sve operacije zahtijevaju autentifikaciju.
`
    },
    "Notifikacije za nove ponude": {
      implemented: true,
      summary: "Primajte obavijesti kada vam pružatelj pošalje ponudu za vaš posao.",
      details: `**Kako funkcionira**
- Kad pružatelj pošalje ponudu, sustav u realnom vremenu šalje in-app notifikaciju, e-mail i opciono push/SMS.
- Notifikacija prikazuje ključne informacije (pružatelj, iznos, poruka) i link na pregled ponude.
- Klikom otvarate ponudu, možete prihvatiti/odbijati ili odgovoriti kroz chat.

**Prednosti**
- Ne propuštate nove ponude ni kad niste aktivni na platformi.
- Brže reagirate i održavate komunikaciju s pružateljima u jednom koraku.

**Kada koristiti**
- Tijekom aktivne faze prikupljanja ponuda kako biste odmah pregledali i odabrali izvođača.
- Za nadzor timskih računa: direktor može dobivati kopije obavijesti i pratiti status.
`,
      technicalDetails: `**Frontend**
- Notification center koristi WebSocket kanal za real-time badge i listu.
- E-mail templati sadrže CTA gumb koji vodi na detalje ponude.
- Mobile push integracija (Firebase) omogućuje instant alert na uređajima.

**Backend**
- \`offerService.submit\` emitira event \`offer.submitted\` koji pokreće notification pipeline.
- \`notificationService.dispatch\` šalje in-app, email i push obavijesti, bilježi status isporuke.
- \`notificationPreferenceService\` poštuje korisničke preferencije (mute, digest).

**Baza**
- \`Notification\` (userId, type, payload, readAt).
- \`NotificationPreference\` čuva preferirane kanale i vremena tihog rada.
- \`Offer\` povezan s notification payloadom radi deep-linka.

**Integracije**
- Email (SES/Postmark), push servis (Firebase/OneSignal), SMS (Twilio) za kritične obavijesti.
- Analytics modul prati open rate i vrijeme reakcije.

**API**
- \`GET /api/notifications\` – lista i status (read/unread).
- \`POST /api/notifications/:id/read\` – označava notifikaciju pročitanom.
- \`PATCH /api/notifications/preferences\` – ažurira kanale i frekvenciju.
`
    },
    "Dinamičko učitavanje kategorija iz baze": {
      implemented: true,
      summary: "Kategorije se automatski učitavaju i ažuriraju s platforme bez potrebe za restartom.",
      details: `**Kako funkcionira**
- Frontend dohvaća kategorije preko API-ja i kešira ih, a promjene se invalidiraju čim admin nešto izmijeni.
- Backend služi kategorije iz baze uz podršku za hijerarhiju, prijevode i licence.
- Webhook/event invalidacija osigurava da su svi servisi sinkronizirani bez redeploya.

**Prednosti**
- Uvijek aktualna lista kategorija za korisnike i pružatelje.
- Nema ručnog updatea aplikacije; admin promjene su vidljive odmah.

**Kada koristiti**
- Pri objavi posla, odabiru kategorija na onboardingu ili uređivanju profila pružatelja.
- U admin panelu kada se dodaju nove kategorije ili mijenjaju opisi/licence.
`,
      technicalDetails: `**Frontend**
- \`useCategories\` hook koristi React Query za dohvat i cache invalidaciju.
- Komponente (dropdown, tree view) prikazuju kategorije uz lazy load podkategorija.
- Prefetch mehanizam sprema kategorije u local storage za brže učitavanje.

**Backend**
- \`categoryController.list\` vraća hijerarhijsku strukturu uz opcionalne filtere (activeOnly, includeStats).
- \`categoryService.invalidateCache\` emituje event nakon admin promjena.
- Support za ETag/Last-Modified zaglavlja kako bi frontend znao kada refetchati.

**Baza**
- \`Category\` tablica (id, name, slug, parentId, isActive, order, emoji).
- \`CategoryTranslation\` i \`CategoryLicenseRequirement\` dodatno obogaćuju podatke.
- Materijalizirani view \`CategoryTreeView\` optimizira dohvat hijerarhije.

**Integracije**
- Cache sloj (Redis) za često korištene upite; Algolia/Elastic reindeksira se nakon promjena.
- Admin webhook \`category.updated\` obavještava marketing/CRM sustave.

**API**
- \`GET /api/categories\` – opcionalni parametri: parentId, includeInactive.
- \`GET /api/categories/tree\` – vraća cijelu hijerarhiju.
- \`POST /api/admin/categories/:id/invalidate\` – ručno invalidira cache ako je potrebno.
`
    },
    "Emoji ikone za kategorije": {
      implemented: true,
      summary: "Svaka kategorija ima emoji ikonu koja olakšava prepoznavanje i navigaciju.",
      details: `**Kako funkcionira**
- Svakoj kategoriji dodijeljen je emoji koji vizualno predstavlja vrstu usluge.
- Emoji se prikazuju u listama, dropdownovima i na karticama poslova kako bi korisnici brže uočili relevantne kategorije.
- Admin panel omogućuje promjenu emojija bez redeploya.

**Prednosti**
- Brža vizualna identifikacija kategorija i ugodnije korisničko iskustvo.
- Universalan jezik (emoji) uklanja barijere za korisnike koji slabije poznaju terminologiju.

**Kada koristiti**
- Pri pregledavanju kategorija i poslova, posebno na mobilnim uređajima gdje je prostor ograničen.
- Kod marketing materijala ili integracija koje preuzimaju kategorije s ikonama.
`,
      technicalDetails: `**Frontend**
- \`CategoryBadge\` prikazuje emoji + naziv uz pristupačne oznake (aria-label).
- U listama se koristi monospaced fallback kako bi emoji bili poravnati.
- Admin sučelje koristi emoji picker (twemoji) s pretraživanjem.

**Backend**
- \`categoryController.updateEmoji\` omogućuje adminima promjenu emojija i validira Unicode kod.
- \`categoryService\` sprema emoji, invalidira cache i pokreće reindeks searcha.

**Baza**
- \`Category\` polje \`emoji\` (UTF-8 kod).
- \`CategoryChangeLog\` bilježi promjene emojija i korisnika koji ih je izvršio.

**Integracije**
- Search indeks i mobilna aplikacija sinkroniziraju emoji putem API odgovora.
- Design sustav (storybook) preuzima listu kategorija s emojijima radi konzistentnih prikaza.

**API**
- \`GET /api/categories\` – vraća \`emoji\` uz svaku kategoriju.
- \`PATCH /api/admin/categories/:id/emoji\` – postavlja novi emoji (body: emoji).
- \`GET /api/categories/:id\` – detalji kategorije s emojijem.
`
    },
    "Opisi kategorija": {
      implemented: true,
      summary: "Svaka kategorija ima detaljan opis koji objašnjava koje usluge spadaju u tu kategoriju.",
      details: `**Kako funkcionira**
- Svaka kategorija ima opis s primjerima usluga, ograničenjima i zahtjevima (npr. licence).
- Opisi se prikazuju u dropdownovima, tooltipovima i admin sučelju za uređivanje.
- Verzije opisa su lokalizirane (HR/EN) i automatski se povlače prema jeziku korisnika.

**Prednosti**
- Korisnici lakše odabiru ispravnu kategoriju i smanjuju pogrešne objave.
- Pružatelji jasno znaju koje usluge se očekuju prije preuzimanja kategorije.

**Kada koristiti**
- Tijekom objave posla i podešavanja profila pružatelja.
- Kod edukacije tima ili dokumentacije za nove kategorije.
`,
      technicalDetails: `**Frontend**
- \`CategorySelect\` prikazuje opis u tooltipu/popoveru pri hoveru ili klikom na info ikonu.
- Admin editor \`CategoryDescriptionEditor\` koristi Markdown/Rich text sa spremanjem u više jezika.
- Onboarding wizard prikazuje highlightable kartice s opisima kao upute.

**Backend**
- \`categoryService.updateDescription\` sprema izmjene, vodi audit i invalidira cache.
- \`categoryController.getDescriptions\` vraća lokalizirane opise uz licence/emoji podatke.
- Background job sinkronizira opise s search indeksom nakon promjena.

**Baza**
- \`Category\` (defaultDescription) i \`CategoryTranslation\` (language, description).
- \`CategoryChangeLog\` bilježi stare i nove opise radi revizija.

**Integracije**
- Search indeks i onboarding emailovi preuzimaju kratke opise za preporuke kategorija.
- Dokumentacija/help center referencira iste podatke putem API-ja.

**API**
- \`GET /api/categories/:id\` – vraća opis i meta podatke.
- \`GET /api/categories\` – opcionalni parametar \`lang\` za lokalizirani opis.
- \`PATCH /api/admin/categories/:id/description\` – uređivanje (body: description, language?).
`
    },
    "NKD kodovi djelatnosti": {
      implemented: true,
      summary: "Svaka kategorija ima pridruženi NKD (Nacionalna klasifikacija djelatnosti) kod za točnu klasifikaciju.",
      details: `**Kako funkcionira**
- Svaka kategorija ima pripadajući NKD kod (npr. F43.33) koji preuzimamo iz službene baze.
- Kodovi se prikazuju u detaljima kategorije, prilikom onboardinga i na fakturama.
- Admin panel omogućuje mapiranje ili ažuriranje NKD kodova bez redeploya.

**Prednosti**
- Točna klasifikacija usluga u skladu s lokalnim propisima.
- Lakše knjigovodstvo, izvještavanje i integracija s vanjskim poslovnim sustavima.

**Kada koristiti**
- Pri registraciji pružatelja i odabiru kategorija koje se prijavljuju državnim tijelima.
- Za izvoz podataka (CSV/BI) gdje je potrebna službena djelatnost.
`,
      technicalDetails: `**Frontend**
- \`CategoryDetailDrawer\` prikazuje NKD kod u badgeu s tooltipom.
- Onboarding wizard naglašava kategorije i pripadajuće NKD kodove radi edukacije korisnika.
- Export komponenta dodaje stupac NKD kod u CSV izvještaj.

**Backend**
- \`categoryService.setNkdCode\` omogućuje adminima mapiranje kodova.
- Valida se protiv reference tablice kako bi se izbjegli nepostojeći kodovi.
- Reporting servis koristi NKD kodove u agregacijama.

**Baza**
- \`Category\` polje \`nkdCode\` (VARCHAR) s indeksom.
- Referentna tablica \`NkdCode\` (code, description) za validaciju i prikaz.

**Integracije**
- Export u računovodstvene sustave (npr. e-račun) uključuje NKD kod.
- BI/analytics alati koriste kodove za segmentaciju tržišta.

**API**
- \`GET /api/categories/:id\` – vraća \`nkdCode\` i opis.
- \`PATCH /api/admin/categories/:id/nkd-code\` – ažurira mapiranje.
- \`GET /api/admin/nkd-codes\` – lista dostupnih kodova za izbor.
`
    },
    "Oznake za licencirane djelatnosti": {
      implemented: true,
      summary: "Kategorije koje zahtijevaju licence imaju posebnu oznaku koja to jasno označava.",
      details: `**Kako funkcionira**
- Kategorije vezane uz regulirane djelatnosti imaju badge (npr. 🏛) i tooltip koji navodi potrebne licence.
- Badge se prikazuje u listama kategorija, marketplaceu i profilima pružatelja.
- Ako pružatelj nema validnu licencu, sustav onemogućava aktivaciju te kategorije.

**Prednosti**
- Korisnici odmah vide koje kategorije traže licencirane stručnjake.
- Pružatelji znaju koje dokumente moraju dostaviti prije rada u kategoriji.

**Kada koristiti**
- Tijekom onboardinga pružatelja i pri uređivanju profila.
- Kod provjere transparentnosti prilikom kupnje leadova ili izbora pružatelja.
`,
      technicalDetails: `**Frontend**
- \`CategoryBadge\` dodaje licencu badge i tooltip s popisom potrebnih dokumenata.
- U marketplaceu lead kartice prikazuju oznaku ako posao zahtijeva licencu.
- Profil pružatelja prikazuje badge samo ako je licenca verificirana.

**Backend**
- \`categoryLicenseService\` održava mapu kategorija i obaveznih licenci.
- Guard middleware provjerava licencu prije aktivacije kategorije za pružatelja.
- Event \`license.status.changed\` invalidira badge cache.

**Baza**
- \`CategoryLicenseRequirement\` (categoryId, licenseTypeId, isMandatory).
- \`ProviderLicense\` povezuje pružatelja s licencom i statusom verifikacije.

**Integracije**
- Licencni modul (upravljanje dokumentima) emitira događaje nakon verifikacije.
- BI izvještaji koriste podatke za analizu pokrivenosti licencama.

**API**
- \`GET /api/categories/:id/licenses\` – vraća potrebne licence.
- \`POST /api/admin/categories/:id/licenses\` – postavlja/uklanja zahtjeve.
- \`GET /api/provider/profile/licenses\` – provjerava koje kategorije su aktivne na temelju licenci.
`
    },
    "Tipovi licenci (Elektrotehnička, Građevinska, itd.)": {
      implemented: true,
      summary: "Sustav podržava različite tipove profesionalnih licenci potrebnih za određene djelatnosti.",
      details: `**Kako funkcionira**
- Administratori definiraju tipove licenci (npr. Elektrotehnička, Građevinska) s opisom i nadležnim tijelom.
- Pružatelji uploadaju dokumente i povezuju ih s tipovima; status verifikacije vidljiv je u profilu.
- Tipovi licenci se mapiraju na kategorije i badgeve u marketplaceu.

**Prednosti**
- Centralizirano upravljanje svim vrstama licenci uz jasne zahtjeve.
- Korisnici mogu filtrirati pružatelje prema licencama i imati veće povjerenje.

**Kada koristiti**
- Kod onboardinga pružatelja i održavanja compliancea.
- Kada korisnici traže licencirane stručnjake u osjetljivim kategorijama.
`,
      technicalDetails: `**Frontend**
- \`LicenseManager\` omogućuje upload, pregled i status svake licence.
- Filteri u marketplaceu i grafikonima omogućuju filtriranje po tipu licence.
- Badge komponenta prikazuje vrste licenci uz profil i lead kartice.

**Backend**
- \`licenseService.createType\` i \`licenseService.updateType\` upravljaju tipovima (naziv, opis, regulator).
- \`providerLicenseService.verify\` ažurira status i emitira događaje.
- Mapiranje kategorija i licenci održava \`categoryLicenseService\`.

**Baza**
- \`LicenseType\` (code, name, description, issuer).
- \`ProviderLicense\` (providerId, licenseTypeId, status, documentUrl, expiresAt).
- Junction tablica \`CategoryLicenseRequirement\` povezuje kategorije i tipove.

**Integracije**
- Document management (S3/ClamAV) pohranjuje i provjerava dokumente.
- CRM/Compliance tim dobiva webhookove kad se status promijeni.

**API**
- \`GET /api/admin/license-types\` – lista i pretraga tipova licenci.
- \`POST /api/admin/license-types\` – kreira novi tip.
- \`GET /api/provider/licenses\` – vraća licencne statuse pružatelja.
`
    },
    "Tijela koja izdaju licence": {
      implemented: true,
      summary: "Evidentirajte izdavatelja licence (komora, ministarstvo...) radi transparentnosti i verifikacije.",
      details: `**Kako funkcionira**
- Kod unosa licence odabire se tijelo izdavanja (popis) ili unosi custom izdavatelj.
- Podaci se prikazuju korisnicima i koriste za admin verifikaciju.
- Audit trail bilježi promjene izdavatelja.

**Prednosti**
- Korisnici vide tko stoji iza licence, što podiže povjerenje.
- Admini lakše potvrđuju valjanost kroz kontakt s izdavateljem.

**Kada koristiti**
- Prilikom unosa/uređivanja licence.
- Kod compliance provjera (admin) i dokumentacije.
`,
      technicalDetails: `**Frontend**
- Autocomplete dropdown s poznatim izdavateljima + opcija “Other”.
- Tooltip na profilu prikazuje naziv i kontakt izdavatelja.

**Backend**
- \`licenseIssuerService\` održava listu izdavatelja i validira unos.
- Event \`license.issuer.updated\` obavještava analytics i notifikacije.

**Baza**
- \`LicenseIssuer\` (name, country, contactInfo).
- \`ProviderLicense\` referencira issuerId.

**Integracije**
- CSV import službenih registara.
- Notification servis obavještava admina o novom custom izdavatelju.

**API**
- \`GET /api/license-issuers\` – popis izdavatelja.
- \`POST /api/license-issuers\` – dodavanje novog (admin).
- \`PATCH /api/providers/licenses/:id\` – ažuriranje izdavatelja.
`
    },
    "Filtriranje poslova po kategorijama": {
      implemented: true,
      summary: "Filtrirate poslove prema kategorijama kako biste vidjeli samo relevantne poslove.",
      details: `**Kako funkcionira**
- Na listi poslova dostupni su filteri po glavnim i podkategorijama; odabir ažurira rezultate u realnom vremenu.
- Kombinacija više kategorija omogućuje fokus na specijalizirane poslove uz spremanje memoriranih filtera.
- UI prikazuje broj rezultata po kategoriji kako bi se lakše odabrao fokus.

**Prednosti**
- Pružatelji vide samo poslove koji odgovaraju njihovim kompetencijama.
- Manje vremena na ručno pregledavanje i bolja konverzija ponuda.

**Kada koristiti**
- Svakodnevno pretraživanje novih poslova u odabranim kategorijama.
- Analiza tržišta pri odlučivanju o širenju na nove usluge.
`,
      technicalDetails: `**Frontend**
- \`JobListPage\` koristi React Query i faceted filter komponentu \`CategoryFilter\`.
- Filter state se serijalizira u URL (query params) radi dijeljenja i spremanja.
- Saved filter modal sprema kombinacije kategorija i prikazuje badge s brojem rezultata.

**Backend**
- \`jobSearchController.filterByCategories\` prima listu categoryId i vraća paginirane poslove.
- Query koristi materializirani pogled s joinom na kategorije radi performansi.
- Event \`job.categoryUpdated\` invalidira cache i search indeks.

**Baza**
- \`JobCategory\` povezuje poslove i više kategorija.
- Indeksi na (categoryId, status) optimiziraju filtere.

**Integracije**
- Search indeks (Algolia/Elastic) koristi category facets za brze odgovore.
- Analytics modul bilježi najčešće korištene filtere po partneru.

**API**
- \`GET /api/provider/jobs?categoryIds=...\` – filtriranje poslova.
- \`POST /api/provider/jobs/saved-filters\` – spremanje kombinacija kategorija.
- \`GET /api/provider/jobs/facets\` – vraća broj rezultata po kategoriji.
`
    },
    "Postavljanje budžeta (min-max)": {
      implemented: true,
      summary: "Navedite minimalni i maksimalni budžet za vaš posao kako bi pružatelji znali vaše cjenovne očekivanja.",
      details: `**Kako funkcionira**
- Formular za objavu posla uključuje polja za minimalni i maksimalni budžet (obavezna za neke kategorije).
- Vrijednosti se prikazuju na kartici posla i u marketplace filtrima.
- Sustav validira da je min ≤ max i nudi preporuke prema tržišnim prosjecima.

**Prednosti**
- Pružatelji znaju okvirni raspon i daju preciznije ponude.
- Manje neprikladnih ponuda i brži dogovor.

**Kada koristiti**
- Pri objavi ili uređivanju posla kada želite definirati očekivanja o cijeni.
- Kod analize statistike (prosječne cijene po kategoriji).
`,
      technicalDetails: `**Frontend**
- \`JobBudgetFields\` koristi currency input i slider s dinamičkim savjetima.
- Badge s budžetom prikazuje se na listi poslova i u detaljima.
- Filter panel omogućuje raspon po min/max vrijednosti.

**Backend**
- Validacija (min <= max, gornja/lower bound po kategoriji) kroz \`jobValidationSchema\`.
- \`jobService.updateBudget\` emitira event za analitiku.
- Budžeti se konvertiraju u standardnu valutu za agregacije.

**Baza**
- Polja \`budgetMin\`, \`budgetMax\`, \`budgetCurrency\` u tablici \`Job\`.
- Indeksi omogućuju filtriranje po rasponu.

**Integracije**
- Analytics modul izračunava prosječne budžete po kategoriji/regionu.
- Notification servis može poslati savjet ako je budžet netipičan.

**API**
- \`POST /api/jobs\` – prima budžet (min/max, currency).
- \`PATCH /api/jobs/:id/budget\` – ažurira budžet.
- \`GET /api/provider/jobs?budgetMin=&budgetMax=\` – filtriranje.
`
    },
    "Lokacija posla (grad)": {
      implemented: true,
      summary: "Navedite grad ili područje gdje se posao obavlja kako bi pružatelji znali lokaciju.",
      details: `**Kako funkcionira**
- Poslovi zahtijevaju unos grada/općine i opcionalno adrese (auto-complete + geokodiranje).
- Lokacija se koristi za filtriranje, prikaz na karti i izračun udaljenosti.
- Pružatelji vide lokaciju prije slanja ponude.

**Prednosti**
- Brže spajanje s lokalnim pružateljima i preciznija logistika.
- Manje nepotrebnih ponuda iz udaljenih regija.

**Kada koristiti**
- Uvijek pri objavi posla; ažuriranje kad se promijeni lokacija radova.
- Pružatelji koriste filter lokacije za planiranje ruta.
`,
      technicalDetails: `**Frontend**
- \`LocationAutocomplete\` koristi Mapbox/Geocoding API; prikazuje sugestije.
- Karta u detaljima posla prikazuje pin i omogućuje pregled okoline.
- Filteri po gradu/županiji u job listi.

**Backend**
- \`locationService.geocode\` pretvara adresu u koordinatu.
- \`jobController.create\` sprema grad, regiju i normaliziranu adresu.
- Ratelimit na geocoding upite.

**Baza**
- \`Job\` polja \`city\`, \`region\`, \`postalCode\`, \`latitude\`, \`longitude\`.
- Tablica \`Region\` za standardizirane nazive.

**Integracije**
- Geokodiranje (Mapbox/Google), karte u UI-u, SLA kalkulacije po zonama.
- Analytics segmentira poslove po regiji.

**API**
- \`GET /api/jobs?city=\` – filtriranje po gradu.
- \`POST /api/jobs\` – prima lokacijske podatke.
- \`GET /api/geo/cities\` – autocomplete gradova.
`
    },
    "Geolokacija (latitude/longitude)": {
      implemented: true,
      summary: "Precizna geolokacija posla omogućava točno određivanje pozicije i proračun udaljenosti.",
      details: `**Kako funkcionira**
- Platforma sprema latitude/longitude prilikom geokodiranja adrese ili ručnog odabira na karti.
- Koordinate se koriste za prikaz posla na karti, rutu i izračun udaljenosti između klijenta i pružatelja.
- ML modeli i matchmaking uzimaju u obzir udaljenost.

**Prednosti**
- Precizno filtriranje i sortiranje (najbliži poslovi).
- Bolje planiranje troškova prijevoza i SLA-a.

**Kada koristiti**
- Pri objavi posla kad je adresa poznata; moguće je i ručno prilagoditi pin.
- Pružatelji koriste podatke za navigaciju (export u Maps/Waze).
`,
      technicalDetails: `**Frontend**
- Map komponenta (Mapbox GL) omogućuje postavljanje i pregled pina.
- \`JobMapPreview\` prikazuje više poslova s clusteringom.
- Export gumb generira link za navigaciju u vanjske aplikacije.

**Backend**
- \`geolocationService.persist\` sprema koordinate i validira raspon.
- Distance utility (Haversine) koristi se u filtriranju i SLA metrikama.
- Event \`job.location.updated\` obavještava marketplace/cache.

**Baza**
- \`Job\` čuva koordinatu (decimal(9,6)).
- Spatial indeks/extension (PostGIS) za geoupite.

**Integracije**
- Geokodiranje provider, routing API za procjenu vremena puta.
- Matchmaking i analytics koriste udaljenost kao feature.

**API**
- \`GET /api/provider/jobs/map\` – vraća poslove s koordinatama.
- \`POST /api/jobs/:id/location\` – ažurira poziciju.
- \`GET /api/geo/distance\` – helper endpoint za udaljenost.
`
    },
    "Slike posla": {
      implemented: true,
      summary: "Uploadajte slike situacije koju treba riješiti kako bi pružatelji bolje razumjeli vaš posao.",
      details: `**Kako funkcionira**
- Tijekom objave posla možete dodati do 10 slika (drag&drop ili odabirom datoteka).
- Slike se komprimiraju, provjeravaju veličinu/tip i spremaju uz posao.
- Pružatelji ih pregledavaju u galeriji prije slanja ponude.

**Prednosti**
- Vizualni kontekst znači preciznije ponude i manje dodatnih pitanja.
- Povećava povjerenje i profesionalnost objave.

**Kada koristiti**
- Kod svih poslova gdje je stanje terena važno (renovacije, kvarovi, reference).
- Pri ažuriranju posla nakon promjena (npr. nova fotografija napretka).
`,
      technicalDetails: `**Frontend**
- \`JobImageUploader\` koristi react-dropzone/uppy s previewima i validacijom (tip, veličina).
- Galerija na detaljima posla koristi lightbox i lazy loading.
- Mobilni view optimizira upload i prikaz (compress) preko browser API-ja.

**Backend**
- \`uploadController.uploadJobImage\` sprema datoteku (multipart) i vraća URL.
- \`jobService.attachImages\` povezuje slike uz posao i postavlja redoslijed.
- Background job (ClamAV) provjerava sigurnost uploadanih datoteka.

**Baza**
- \`JobImage\` (jobId, url, order, altText, uploadedById).
- Indeksi po jobId i order za brzi prikaz.

**Integracije**
- S3/CloudFront ili Cloudinary za pohranu i CDN.
- Notifikacijski servis može upozoriti admina ako upload ne uspije.

**API**
- \`POST /api/jobs/:id/images\` – dodavanje slika (multipart/form-data).
- \`DELETE /api/jobs/:id/images/:imageId\` – uklanjanje.
- \`GET /api/jobs/:id\` – vraća polje \`images\`.
`
    },
    "Status posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN)": {
      implemented: true,
      summary: "Svaki posao ima status koji pokazuje u kojoj je fazi - otvoren, u tijeku, završen ili otkazan.",
      details: `**Kako funkcionira**
- Posao započinje kao OTVOREN dok korisnik prikuplja ponude.
- Odabirom pružatelja status prelazi u U TIJEKU; završetkom radova prelazi u ZAVRŠEN.
- Korisnik ili sustav mogu označiti OTKAZAN (npr. prekinut posao).
- Statusi se automatski ažuriraju kroz workflow (npr. prihvat ponude, završetak, otkaz).

**Prednosti**
- Jasno praćenje napretka i komunikacija između korisnika i pružatelja.
- Analitika može pratiti SLA i stopu dovršetka poslova.

**Kada koristiti**
- Korisnik prati napredak svojih poslova; pružatelj izvještava o završetku.
- Admin nadzire poslove koji stagniraju ili su često otkazani.
`,
      technicalDetails: `**Frontend**
- \`JobDetailStatus\` komponenta prikazuje status badge i timeline.
- CTA gumbi (Započni, Označi završeno, Otkaži) dostupni prema ulozi.
- Notifikacije i bannere upozoravaju kad status zahtijeva akciju.

**Backend**
- \`jobStatusService.transition\` validira allowed tranzicije (state machine).
- Events: \`job.started\`, \`job.completed\`, \`job.cancelled\` za SLA/analytics.
- Automatizacija (cron) označava posao kao OTKAZAN ako nema aktivnosti dulje vrijeme.

**Baza**
- Polje \`status\` u \`Job\` (enum) + \`statusUpdatedAt\`.
- \`JobStatusHistory\` bilježi promjene (oldStatus, newStatus, changedBy).

**Integracije**
- Notification servis šalje obavijesti o promjenama statusa.
- Analytics modul koristi statusne događaje za mjerenje uspješnosti.

**API**
- \`POST /api/jobs/:id/status\` – promjena statusa (body: status, reason?).
- \`GET /api/jobs/:id\` – vraća status i timeline.
- \`POST /api/jobs/:id/cancel\` – otkaz posla s razlogom.
`
    },
    "Hitnost posla (NORMALNA, HITNA)": {
      implemented: true,
      summary: "Označite posao kao hitan ako vam treba brzo rješenje, ili normalan za standardni tempo.",
      details: `**Kako funkcionira**
- Prilikom objave posla odabirete status hitnosti (NORMALNA/HITNA).
- Hitni poslovi dobivaju badge i viši prioritet u marketplaceu i notifikacijama.
- SLA podsjetnici naglašavaju rokove i pomažu koordinirati očekivanja.

**Prednosti**
- Pružatelji mogu planirati resurse prema hitnosti.
- Klijent jasno komunicira očekivanja i dobiva brži odgovor.

**Kada koristiti**
- Kod kvarova ili kratkih rokova, odaberite HITNA.
- Standardni projekti ostaju NORMALNA, pa prikupljaju ponude bez pritiska.
`,
      technicalDetails: `**Frontend**
- \`JobUrgencySelector\` (radio/dropdown) na obrascu i badge u listi poslova.
- Filter u marketplaceu omogućuje prikaz samo hitnih poslova.
- Notifikacijski banner podsjeća klijenta na hitne rokove.

**Backend**
- \`jobValidationSchema\` osigurava vrijednost enum-a (NORMALNA/HITNA).
- Events \`job.urgency.updated\` informiraju matchmaking i SLA servise.
- SLA podsjetnik šalje obavijesti o bliskim rokovima.

**Baza**
- \`Job\` polje \`urgency\` (enum) s defaultom NORMALNA.
- Indeks \`@@index([urgency])\` za filtriranje.

**Integracije**
- Notification servis prilagođava ton poruka ovisno o hitnosti.
- Analytics prati konverziju hitnih poslova.

**API**
- \`POST /api/jobs\` – prima polje \`urgency\`.
- \`GET /api/jobs?urgency=HITNA\` – filtriranje hitnih.
- \`PATCH /api/jobs/:id/urgency\` – ažuriranje hitnosti.
`
    },
    "Veličina posla (MALA, SREDNJA, VELIKA)": {
      implemented: true,
      summary: "Kategorizirajte posao prema veličini kako bi pružatelji znali obim rada.",
      details: `**Kako funkcionira**
- Pri objavi posla birate veličinu (MALA, SREDNJA, VELIKA) na temelju obujma i trajanja.
- Informacija se prikazuje na kartici posla i utječe na preporučene tipove pružatelja.
- Marketplace i analitika koriste veličinu za segmentaciju.

**Prednosti**
- Pružatelji odmah znaju kakav angažman se očekuje.
- Lakše planiranje rasporeda i resursa.

**Kada koristiti**
- Svaki posao treba procijeniti obim kako bi se privukli pravi izvođači.
`,
      technicalDetails: `**Frontend**
- \`JobSizeSelector\` (badge/radio) i prikaz u listama i detaljima.
- Filter i grafički prikazi u analitici koriste veličine.

**Backend**
- Enum \`JobSize\` validira vrijednosti.
- Events \`job.size.updated\` informiraju matchmaking/analytics.

**Baza**
- Polje \`size\` u tablici \`Job\` (enum).
- Indeks za filtere i agregacije.

**Integracije**
- Analytics modul koristi veličine za KPI (prosječna cijena po obimu).
- Notification servis daje savjete temeljene na veličini.

**API**
- \`POST /api/jobs\` – prima polje \`size\`.
- \`GET /api/jobs?size=SREDNJA\` – filtrira.
- \`PATCH /api/jobs/:id/size\` – ažurira.
`
    },
    "Rok izvršenja": {
      implemented: true,
      summary: "Navedite željeni rok za završetak posla kako bi pružatelji znali vaše vremenske zahtjeve.",
      details: `**Kako funkcionira**
- Pri objavi posla možete unijeti konkretan datum ili okvir (npr. sljedećih 7 dana).
- Rok se prikazuje pružateljima i utječe na prioritet u pretragama.
- Pružatelj može predložiti alternativni rok u ponudi.

**Prednosti**
- Jasna očekivanja o završetku posla.
- Olakšava planiranje resursa pružateljima.

**Kada koristiti**
- Uvijek kad imate specifičan deadline ili želite naglasiti vremenski okvir.
- Pri ažuriranju posla kada se rok promijeni.
`,
      technicalDetails: `**Frontend**
- \`JobDeadlinePicker\` pruža date picker + relativne opcije (npr. +3 dana).
- Timeline u detaljima posla prikazuje deadline i progres.
- Notifikacije podsjećaju klijenta i pružatelja na predstojeći rok.

**Backend**
- Polje \`deadline\` validira se na budući datum.
- Cron job podsjeća pružatelja kad se rok bliži.
- Event \`job.deadline.updated\` obavještava korisnike o promjeni.

**Baza**
- \`Job\` polje \`deadline\` (DateTime, nullable) i \`deadlineFlexible\` flag.
- Indeks na \`deadline\` za sortiranje.

**Integracije**
- Calendar export (iCal/Google Calendar) za zakazane rokove.
- Analytics prati koliko poslova se završava na vrijeme.

**API**
- \`POST /api/jobs\` – prima \`deadline\` i \`deadlineFlexible\`.
- \`PATCH /api/jobs/:id/deadline\` – ažurira rok.
- \`GET /api/jobs?deadlineBefore=2025-05-01\` – filtriranje.
`
    },
    "Filtriranje po kategoriji, lokaciji, budžetu": {
      implemented: true,
      summary: "Kombinirajte više filtera kako biste pronašli točno ono što tražite - po kategoriji, lokaciji i budžetu.",
      details: `**Kako funkcionira**
- Filter panel omogućuje kombinaciju kategorija, gradova i budžet raspona.
- Rezultati se ažuriraju u realnom vremenu, a odabrani filteri spremaju se u URL.
- Saved filters omogućuju spremanje i re-use najčešćih kombinacija.

**Prednosti**
- Precizno pronađete poslove ili pružatelje koji zadovoljavaju sve kriterije.
- Ušteda vremena i fokus na relevantne rezultate.

**Kada koristiti**
- Svakodnevno pretraživanje tržišta ili kod analize novih niša.
- Pri selekciji pružatelja za specifičan projekt.
`,
      technicalDetails: `**Frontend**
- \`AdvancedFilterPanel\` komponenta sinkronizira state s URL param.
- Debounced search sprječava previše API poziva.
- Sačuvani filteri (local storage + backend saved searches).

**Backend**
- \`jobSearchController\` i \`providerSearchController\` grade dinamički query (category, city, budget).
- Kombinacija filtera primjenjuje se AND logikom.

**Baza**
- Indeksi po kategoriji, lokaciji i budžetu omogućuju brze upite.

**Integracije**
- Analytics prati najčešće kombinacije.
- Notification servis može slati alert kad se pojavi rezultat za spremljeni filter.

**API**
- \`GET /api/jobs?categoryId=&city=&minBudget=&maxBudget=\`.
- \`GET /api/providers?categoryId=&city=&budgetRange=\`.
- \`POST /api/saved-filters\` – čuva kombinacije filtera.
`
    },
    "Pregled detalja posla": {
      implemented: true,
      summary: "Pregledajte sve ključne informacije o poslu na jednom mjestu.",
      details: `**Kako funkcionira**
- Stranica detalja okuplja opis, budžet, rok, status, kategoriju, lokaciju, slike i povijest aktivnosti.
- Ponude, chat i status tijeka prikazuju se u kontekstu istog posla.
- Uloge odlučuju koje akcije se prikazuju (uređivanje, prihvat ponude, ocjene).

**Prednosti**
- Klijent i pružatelj imaju zajednički izvor istine.
- Brže donošenje odluka uz manje prebacivanja po aplikaciji.

**Kada koristiti**
- Svaki put kada želite provjeriti napredak posla ili odgovoriti na ponude.
- Administratori tijekom moderacije i podrške korisnicima.
`,
      technicalDetails: `**Frontend**
- \`JobDetailsPage\` koristi React Query za dohvat i caching te kartice (tabs) za sekcije.
- Komponente: opis, galerija, timeline statusa, lista ponuda i chat (lazy load).
- Responsivan layout (grid) za desktop/mobitel.

**Backend**
- \`jobController.getById\` agregira posao, ponuditelje, recenzije i statistiku u jednom queryju.
- Authorization middleware provjerava pristup (vlasnik posla, pozvani pružatelj, admin).
- Event sourcing (job.timeline) koristi se za prikaz aktivnosti.

**Baza**
- Relacije \`Job\` ↔ \`Offer\` ↔ \`ProviderProfile\`, \`JobImage\`, \`Notification\`.
- Materialized view \`JobSnapshot\` za brza čitanja.

**Integracije**
- Search indeks omogućuje dubinsko pretraživanje detalja.
- Notification servis sinkronizira badgeve (nepročitane poruke/ponude).

**API**
- \`GET /api/jobs/:id\` – puni detalji.
- \`GET /api/jobs/:id/activity\` – timeline.
- \`GET /api/jobs/:id/offers\` – paginirane ponude.
`
    },
    "Iznos ponude": {
      implemented: true,
      summary: "Unesite iznos vaše ponude - cijenu koju tražite za obavljanje posla.",
      details: `**Kako funkcionira**
- U obrascu ponude upisujete iznos (fiksni ili pregovarački) i valutu.
- Sustav validira minimalni iznos, uspoređuje s budžetom posla i prikazuje upozorenja.
- Iznos se prikazuje korisniku uz opcionalne popuste/dodatke.

**Prednosti**
- Jasna usporedba ponuda.
- Transparentna komunikacija o očekivanoj cijeni.

**Kada koristiti**
- Svaki put kad šaljete novu ponudu ili ažurirate postojeću.
- Kod generiranja predložaka ponuda kroz CRM integracije.
`,
      technicalDetails: `**Frontend**
- \`OfferAmountField\` koristi currency input s formatiranjem i tooltip savjetima.
- Upozorenja (badge) ako je iznos izvan budžeta.

**Backend**
- \`offerService.create\` validira iznos, provodi business rule (minimalni pragovi po kategoriji).
- Konverzija valute putem FX servisa ako posao koristi drugu valutu.

**Baza**
- \`Offer\` kolone \`amount\` (Decimal), \`currency\`, \`isNegotiable\`.
- Audit log bilježi promjene iznosa.

**Integracije**
- Stripe/računovodstvo koristi iznose za generiranje računa.
- Analytics mjeri prosječne ponude po kategoriji.

**API**
- \`POST /api/offers\` – kreira ponudu (amount, currency, negotiable).
- \`PATCH /api/offers/:id/amount\` – ažurira.
- \`GET /api/jobs/:id/offers\` – vraća iznose i metapodatke.
`
    },
    "Poruka uz ponudu": {
      implemented: true,
      summary: "Napišite poruku u kojoj objašnjavate svoj pristup poslu i zašto ste pravi izbor.",
      details: `**Kako funkcionira**
- Uz iznos ponude dodajte poruku s uvodom, planom rada i referencama.
- Editor podržava formatiranje (Markdown) i predloške.
- Poruka se prikazuje korisniku uz iznos i vidljiva je u chatu.

**Prednosti**
- Povećava povjerenje i diferencira vas od konkurencije.
- Pruža prostor za clarifikacije i CTA.

**Kada koristiti**
- Kod svake nove ponude ili revizije stare ponude.
- Posebno za kompleksne poslove gdje treba obrazložiti pristup.
`,
      technicalDetails: `**Frontend**
- \`OfferMessageField\` (textarea/markdown editor) s brojačem znakova i predlošcima.
- Preview prikazuje kako korisnik vidi poruku.

**Backend**
- Sanitizacija sadržaja (DOMPurify) i spremanje u plain + rendered formatu.
- NLP analiza identificira spam/kršenje pravila.

**Baza**
- \`Offer\` polje \`message\` (Text) + \`messageRendered\`.
- Indeks za full-text search (tsvector) nad porukama.

**Integracije**
- Moderation servis i AI scoring (kvaliteta poruke).
- CRM export uključuje originalni tekst ponude.

**API**
- \`POST /api/offers\` – prima \`message\`.
- \`PATCH /api/offers/:id/message\` – uređivanje.
- \`GET /api/jobs/:id/offers\` – vraća poruke uz iznose.
`
    },
    "Status ponude (NA ČEKANJU, PRIHVAĆENA, ODBIJENA)": {
      implemented: true,
      summary: "Pratite status svoje ponude - je li na čekanju, prihvaćena ili odbijena.",
      details: `**Kako funkcionira**
- Nova ponuda kreće kao NA ČEKANJU dok korisnik ne reagira.
- Prihvaćanjem ponude posao prelazi u U TIJEKU; odbijanjem se zaključava daljnje izmjene.
- Status se sinkronizira s notifikacijama i prikazuje se na dashboardu.

**Prednosti**
- U svakom trenutku znate status i sljedeći korak.
- Podaci o konverziji pomažu u optimizaciji prodajnog lijevka.

**Kada koristiti**
- Pružatelj prati sve svoje ponude (aktivne i povijesne).
- Admin i korisnici tijekom evaluacije i QA procesa.
`,
      technicalDetails: `**Frontend**
- \`OfferStatusBadge\` i timeline prikazuju promjene statusa.
- Notification toast obavještava o promjeni u realnom vremenu.

**Backend**
- State machine u \`offerService.transitionStatus\` (validacija allowed tranzicija).
- Eventi \`offer.accepted\`, \`offer.rejected\`, \`offer.expired\`.
- Automatska expiracija ponuda (cron) nakon isteka roka.

**Baza**
- \`Offer\` polja \`status\`, \`statusChangedAt\`.
- \`OfferStatusHistory\` čuva audit trail.

**Integracije**
- Notification/email servis šalje različite poruke po statusu.
- Analytics modul mjeri win-rate po partneru.

**API**
- \`POST /api/offers/:id/status\` – promjena (body: status, reason?).
- \`GET /api/offers?status=NA_CEKANJU\` – filter.
- \`POST /api/offers/:id/cancel\` – poništavanje ponude od strane pružatelja.
`
    },
    "Mogućnost pregovaranja o cijeni": {
      implemented: true,
      summary: "Pregovarajte o cijeni s korisnikom ili pružateljem kako biste postigli dogovor.",
      details: `**Kako funkcionira**
- Ponudu možete označiti kao pregovornu i putem chata dogovarati alternativne iznose ili uvjete.
- Svaka promjena iznosa bilježi se uz referencu na poruku/korisnika.
- Završni dogovor potvrđujete ažuriranjem ponude ili slanjem nove verzije.

**Prednosti**
- Fleksibilnost u postizanju dogovora koji odgovara objema stranama.
- Evidencija pregovora smanjuje nesporazume i daje transparentnost.

**Kada koristiti**
- Kada je budžet okviran ili želite prilagoditi cijenu prema dodatnim informacijama.
- Kod kompleksnih poslova koji zahtijevaju kombinaciju rada i materijala.
`,
      technicalDetails: `**Frontend**
- \`NegotiationToggle\` u obrascu ponude i workflow u chatu (kontraponude, suggested price).
- UI označava pregovorne ponude badgeom i prikazuje povijest promjena.

**Backend**
- \`offerService.negotiate\` kreira novu verziju iznosa ili bilježi pregovore.
- Chat događaji (socket) sinkroniziraju promjene iznosa u realnom vremenu.
- Rules engine provjerava minimalne/maksimalne vrijednosti i bilježi audit.

**Baza**
- \`OfferNegotiation\` tablica (offerId, previousAmount, newAmount, messageId, changedById).
- \`Offer\` polja \`isNegotiable\`, \`negotiationStatus\`.

**Integracije**
- Notification servis (push/email) informira o kontraponudama.
- Analytics modul mjeri stopu uspješnosti pregovora.

**API**
- \`POST /api/offers/:id/negotiate\` – predlaže novi iznos.
- \`GET /api/offers/:id/negotiations\` – povijest pregovora.
- \`PATCH /api/offers/:id\` – potvrđuje konačan iznos.
`
    },
    "Označavanje ponuda kao pregovorno": {
      implemented: true,
      summary: "Označite svoju ponudu kao pregovornu ako ste spremni na fleksibilnost u cijeni.",
      details: `**Kako funkcionira**
- U obrascu ponude uključite opciju "pregovorno" kako bi korisnik znao da je cijena otvorena za dogovor.
- Badge "Pregovorno" pojavljuje se uz ponudu i u listi.
- Sustav potiče korisnika da predloži kontraponudu.

**Prednosti**
- Povećava šansu za odgovor korisnika i potiče komunikaciju.
- Jasno označava fleksibilnost bez promjene početnog iznosa.

**Kada koristiti**
- Kada želite ostaviti prostor za dogovor ili dodatne usluge.
- U ranim fazama razgovora kada još nemate sve informacije.
`,
      technicalDetails: `**Frontend**
- Checkbox \`isNegotiable\` u \`OfferForm\`; badge i tooltip u listi ponuda.
- Filter "Pregovorne" ponude na korisničkom dashboardu.

**Backend**
- Polje \`isNegotiable\` se sprema pri kreiranju ponude; validacija dopušta samo boolean.
- Event \`offer.negotiable.enabled\` aktivira onboarding savjete korisniku.

**Baza**
- \`Offer\` boolean \`isNegotiable\` (default false) + indeks za filtriranje.

**Integracije**
- Notification servis ton poruke prilagođava fleksibilnosti.
- Analytics prati koliko pregovornih ponuda završava dogovorom.

**API**
- \`POST /api/offers\` – prima \`isNegotiable\`.
- \`GET /api/jobs/:id/offers?negotiable=true\` – filtrira.
- \`PATCH /api/offers/:id/negotiable\` – uključuje/isključuje oznaku.
`
    },
    "Procijenjeni broj dana za izvršenje": {
      implemented: true,
      summary: "Navedite koliko dana vam je potrebno da završite posao - to pomaže korisnicima planirati.",
      details: `**Kako funkcionira**
- Pri slanju ponude unosite broj dana potrebnih za završetak posla.
- Podatak se prikazuje uz ponudu i koristi za usporedbu.
- Ažuriranje je moguće kroz edit ponude ili nakon dogovora.

**Prednosti**
- Klijent dobiva realna očekivanja o vremenskom okviru.
- Olakšava planiranje resursa i koordinaciju drugih aktivnosti.

**Kada koristiti**
- Za svaki posao gdje je trajanje bitan kriterij (renovacije, instalacije, servisi).
- Kod SLA dogovora i fakturiranja prema vremenu rada.
`,
      technicalDetails: `**Frontend**
- \`OfferTimelineField\` (number input + helper tekstovi) i badge u listi ponuda.
- Sortiranje ponuda po trajanju i vizualni grafikon (min/max range).

**Backend**
- Validacija broja dana (1-365) i automatsko prilagođavanje kod promjena opsega.
- Event \`offer.eta.updated\` obavještava korisnika i ažurira timeline posla.

**Baza**
- \`Offer\` polje \`estimatedDays\` (INTEGER) + audit povijest.

**Integracije**
- Calendar/Reminder servis kreira podsjetnike i milestone zadatke.
- Analytics uspoređuje procjene i stvarno trajanje (post-job review).

**API**
- \`POST /api/offers\` – prima \`estimatedDays\`.
- \`PATCH /api/offers/:id/estimated-days\` – ažurira vrijednost.
- \`GET /api/jobs/:id/offers?estimatedDaysMax=7\` – filtrira po trajanju.
`
    },
    "Pregled svih ponuda za posao": {
      implemented: true,
      summary: "Kao korisnik, vidite sve ponude koje su pružatelji poslali za vaš posao na jednom mjestu.",
      details: `**Kako funkcionira**
- Dashboard posla prikazuje tablicu svih pristiglih ponuda s ključnim metrikama.
- Omogućen je pregled detalja, usporedba i sortiranje po cijeni, ETA-i i ocjeni pružatelja.
- Iz istog pogleda korisnik može prihvatiti, odbiti ili otvoriti chat.

**Prednosti**
- Ušteda vremena uz strukturiranu usporedbu.
- Donosite odluku na temelju transparentnih kriterija.

**Kada koristiti**
- Odmah nakon što stignu prve ponude i tijekom finalne selekcije.
- Pri reviziji povijesti ponuda za analitiku ili reklamacije.
`,
      technicalDetails: `**Frontend**
- \`OfferComparisonTable\` (React Table) s faceted filterima i exportom u CSV.
- Modal za detalje pružatelja i integrirani chat shortcut.

**Backend**
- \`offerController.listByJob\` vraća paginirane ponude s agregiranim metrikama (npr. prosječna cijena).
- Authorization provjerava je li korisnik vlasnik posla ili admin.
- Background job označava ponude koje su istekle.

**Baza**
- Pogled \`OfferSummaryView\` (jobId, providerRating, amount, eta, negotiable).
- Indeksi po jobId, status, amount.

**Integracije**
- Analytics modul generira heatmapu cijena po kategoriji.
- Notification servis može poslati remindere da pregledate nove ponude.

**API**
- \`GET /api/jobs/:id/offers\` – lista ponuda.
- \`GET /api/jobs/:id/offers/export\` – CSV/PDF export.
- \`POST /api/jobs/:id/offers/:offerId/accept\` – prihvat iz tablice.
`
    },
    "Prihvaćanje/odbijanje ponuda": {
      implemented: true,
      summary: "Prihvatite ponudu koja vam odgovara ili odbijte one koje ne odgovaraju.",
      details: `**Kako funkcionira**
- U tablici ponuda dostupni su gumbi za prihvat i odbijanje.
- Prihvaćena ponuda zaključava posao i pokreće status "U TIJEKU".
- Odbijanjem se može navesti razlog koji se dijeli s pružateljem.

**Prednosti**
- Potpuna kontrola nad izborom pružatelja i jasna komunikacija.
- Platforma automatski obavještava sve uključene strane i ažurira status.

**Kada koristiti**
- Nakon što usporedite sve ponude i želite formalizirati suradnju.
- Kada ponuda nije odgovarajuća i želite obavijestiti pružatelja.
`,
      technicalDetails: `**Frontend**
- \`OfferCard\` / \`OfferActions\` renderiraju CTA gumbe (accept/reject) i modal s razlogom.
- Optimistic update i toast potvrde daju povratnu informaciju korisniku.

**Backend**
- \`offerService.accept\` i \`offerService.reject\` rade kroz transakciju (ažuriranje offer + job status).
- Automatski odbija sve ostale aktivne ponude za isti posao.
- Audit log bilježi tko je izvršio akciju.

**Baza**
- \`Offer\` polja \`status\`, \`statusChangedAt\`, \`rejectionReason\`.
- \`Job\` polje \`status\` postavlja se na \`IN_PROGRESS\` nakon prihvata.

**Integracije**
- Notification servis šalje push/email pružatelju i drugim ponuditeljima.
- Analytics prati vrijeme od objave do prihvata.

**API**
- \`POST /api/offers/:id/accept\` – prihvat ponude.
- \`POST /api/offers/:id/reject\` – odbijanje (body: reason?).
- \`POST /api/jobs/:jobId/close\` – helper za zaključavanje nakon prihvata.
`
    },
    "Komentiranje iskustva s pružateljem": {
      implemented: true,
      summary: "Napišite komentar o svom iskustvu s pružateljem - što vam se svidjelo i što bi se moglo poboljšati.",
      details: `**Kako funkcionira**
- Nakon dovršetka posla forma traži ocjenu i komentar.
- Komentar se objavljuje uz ocjenu na profilu pružatelja i u povijesti posla.
- Pružatelj može odgovoriti na komentar radi konteksta.

**Prednosti**
- Gradite reputaciju i pomažete drugima pri odabiru pružatelja.
- Pružatelj dobiva konkretnu povratnu informaciju za poboljšanje usluge.

**Kada koristiti**
- Neposredno nakon završetka posla dok su detalji svježi.
- Kada želite pohvaliti rad ili istaknuti područja za napredak.
`,
      technicalDetails: `**Frontend**
- \`ReviewForm\` (markdown/textarea) s validatorom duljine i indikatorom preostalih znakova.
- \`ProviderReviews\` prikazuje komentar, ocjenu i odgovor pružatelja.

**Backend**
- \`reviewService.create\` validira da posao pripada korisniku i da je status \`COMPLETED\`.
- Sanitizacija teksta te event \`review.created\` za notifikacije.

**Baza**
- \`Review\` polja \`comment\`, \`rating\`, \`jobId\`, \`providerId\`, \`authorId\`.
- \`ReviewResponse\` opcionalno čuva odgovor pružatelja.

**Integracije**
- Notification servis informira pružatelja o novom komentaru.
- Analytics mjeri prosječnu ocjenu po kategoriji i sentiment komentara.

**API**
- \`POST /api/reviews\` – kreira komentar i ocjenu.
- \`PATCH /api/reviews/:id\` – uređivanje (body: rating?, comment?).
- \`POST /api/reviews/:id/reply\` – odgovor pružatelja.
`
    },
    "Bilateralno ocjenjivanje (korisnik ↔ pružatelj)": {
      implemented: true,
      summary: "I vi možete ocijeniti pružatelja, i pružatelj može ocijeniti vas - fer i objektivno ocjenjivanje.",
      details: `**Kako funkcionira**
- Nakon što posao prijeđe u status ZAVRŠEN, i klijent i pružatelj dobivaju zadatak za ocjenu.
- Svaka strana daje ocjenu i komentar neovisno o drugoj.
- Ocjene postaju vidljive nakon što obje strane ocijene ili nakon isteka roka.

**Prednosti**
- Poticanje profesionalnosti s obje strane.
- Kreiranje transparentne reputacije klijenata i pružatelja.

**Kada koristiti**
- Nakon svih završenih poslova radi održavanja reputacije.
- Kod sporova – ocjene služe kao dio povijesti suradnje.
`,
      technicalDetails: `**Frontend**
- Modal \`ReviewPrompt\` prikazuje se obema stranama s rokovima i podsjetnicima.
- Profil stranica prikazuje zbirne metrike (prosjek, broj recenzija, recentne ocjene).

**Backend**
- \`reviewService.requestPair\` kreira zadatke za obje strane i prati jesu li završili ocjenjivanje.
- Ocjene se otkrivaju nakon obostrane predaje (double-blind) ili nakon roka (cron).

**Baza**
- \`Review\` s poljima \`reviewType\` (CLIENT_TO_PROVIDER / PROVIDER_TO_CLIENT) i unique constraint po poslu i revieweru.
- \`ReviewReminder\` prati slanje podsjetnika.

**Integracije**
- Notification servis šalje podsjetnike dok obje strane ne ispune ocjenu.
- Trust/score modul ažurira rejting korisnika i pružatelja.

**API**
- \`POST /api/reviews\` – jedna ruta za obje strane (na temelju auth konteksta).
- \`GET /api/users/:id/reviews\` – vraća primljene i poslane ocjene.
- \`POST /api/reviews/:id/remind\` – admin/automatika šalje podsjetnik.
`
    },
    "Sprečavanje duplikata recenzija": {
      implemented: true,
      summary: "Sustav osigurava da možete ocijeniti svaki posao samo jednom - sprečava zloupotrebe.",
      details: `**Kako funkcionira**
- Nakon što ostavite recenziju za posao, forma se zaključava i prikazuje obavijest da recenzija već postoji.
- Unique guard na poslu i recenzentu sprječava kreiranje novog zapisa.
- Umjesto nove recenzije nudimo uređivanje postojeće.

**Prednosti**
- Štiti od spam recenzija i manipulacije ocjenama.
- Zadržava povijest ocjena urednom i vjerodostojnom.

**Kada koristiti**
- Svaki put kad korisnik pokuša ostaviti drugi komentar za isti posao.
- Kod moderacije spornih recenzija (admin vidi pokušaje duplikata).
`,
      technicalDetails: `**Frontend**
- \`ReviewForm\` provjerava status prije prikaza i skriva submit ako postoji recenzija.
- Toast poruka usmjerava korisnika na uređivanje postojeće recenzije.

**Backend**
- \`reviewService.validateUnique\` provjerava kombinaciju (jobId, reviewerId) prije inserta.
- Greška 409 se vraća s porukom za klijenta; event log zabilježi pokušaj.

**Baza**
- Unique constraint \`@@unique([jobId, reviewerId])\` na tablici \`Review\`.
- Audit tablica \`ReviewDuplicateAttempt\` (opcionalno) bilježi pokušaje.

**Integracije**
- Moderation dashboard prikazuje pokušaje duplikata za pregled.
- Analytics prati broj blokiranih duplikata.

**API**
- \`POST /api/reviews\` – vraća 409 s porukom ako postoji recenzija.
- \`GET /api/reviews?jobId=&reviewerId=\` – provjera prije prikaza forme.
- \`POST /api/reviews/:id/edit-link\` – helper endpoint koji vodi na uređivanje.
`
    },
    "Uređivanje postojećih recenzija": {
      implemented: true,
      summary: "Možete urediti svoju recenziju ako se vaša mišljenja promijene ili želite ažurirati komentar.",
      details: `**Kako funkcionira**
- Korisnik pronalazi svoju recenziju i otvara modal za uređivanje ocjene i komentara.
- Promjene se spremaju uz oznaku da je recenzija uređena te se recalculira prosjek.
- Povijest uređivanja ostaje dostupna adminu radi transparentnosti.

**Prednosti**
- Omogućuje ažuriranje nakon dugoročnih projekata ili dodatnog rada.
- Održava recenzije relevantnima bez gubitka kontinuiteta.

**Kada koristiti**
- Nakon što se iskustvo promijeni (npr. dodatni radovi, riješen spor).
- Kada želite dopuniti recenziju dodatnim informacijama.
`,
      technicalDetails: `**Frontend**
- \`ReviewCard\` prikazuje gumb "Uredi" za autora; modal koristi postojeće vrijednosti.
- U vizualu recenzije prikazuje se oznaka "Ažurirano" s datumom.

**Backend**
- \`reviewService.update\` validira vlasništvo i zapisuje \`editedAt\`.
- Event \`review.updated\` pokreće recalculaciju prosjeka i obavijesti.

**Baza**
- \`Review\` polja \`rating\`, \`comment\`, \`editedAt\`, \`editCount\`.
- Opcionalna tablica \`ReviewEditHistory\` čuva diffove.

**Integracije**
- Notification servis obavještava pružatelja o izmjeni.
- Analytics omogućuje praćenje promjena sentimenta kroz vrijeme.

**API**
- \`PATCH /api/reviews/:id\` – ažurira ocjenu/komentar.
- \`GET /api/reviews/:id/history\` – vraća povijest uređivanja (admin).
- \`POST /api/reviews/:id/recalculate\` – ručni trigger recalculacije (fallback).
`
    },
    "Brisanje recenzija": {
      implemented: true,
      summary: "Možete obrisati svoju recenziju ako smatrate da više nije relevantna ili želite je ukloniti.",
      details: `**Kako funkcionira**
- Autor recenzije ili admin može pokrenuti brisanje iz liste recenzija.
- Potvrdom se recenzija soft-delete-a (oznaka \`deletedAt\`) ili trajno uklanja.
- Prosječna ocjena i broj recenzija se odmah ažuriraju.

**Prednosti**
- Kontrola nad sadržajem koji ste objavili.
- Brza reakcija na pogreškom ostavljene ili zastarjele komentare.

**Kada koristiti**
- Kada je spor riješen i želite ukloniti negativnu recenziju.
- Ako ste recenziju objavili greškom ili dvaput.
`,
      technicalDetails: `**Frontend**
- \`ReviewCard\` prikazuje "Obriši" gumb s potvrdom i upozorenjem o nepovratnosti.
- Lista se optimistično ažurira, a fallback error vraća recenziju u prikaz.

**Backend**
- \`reviewService.delete\` provjerava vlasništvo ili adminsko pravo i označava zapis kao obrisan.
- Recalculates prosjek (sve recenzije bez \`deletedAt\`).
- Audit log bilježi tko je obrisao recenziju i razlog (ako se navodi).

**Baza**
- \`Review\` polja \`deletedAt\`, \`deletedById\`, \`deleteReason\`.
- Materialized view za prosjek filtrira obrisane recenzije.

**Integracije**
- Notification šalje potvrdu autoru i pružatelju (ako je bitno za SLA/sukobe).
- Analytics bilježi trendove brisanja.

**API**
- \`DELETE /api/reviews/:id\` – soft ili hard delete (ovisno o flagu).
- \`POST /api/reviews/:id/restore\` – admin može vratiti recenziju.
- \`POST /api/reviews/:id/delete-reason\` – upis razloga (opcionalno).
`
    },
    "Automatsko izračunavanje prosječne ocjene": {
      implemented: true,
      summary: "Platforma automatski izračunava prosječnu ocjenu pružatelja na temelju svih recenzija.",
      details: `**Kako funkcionira**
- Svaki put kad se doda, uredi ili obriše recenzija pokreće se recalculacija prosjeka.
- Prosjek se prikazuje na profilu pružatelja, karticama i u filterima.
- Za nove profile koristimo fallback (npr. "N/A" ili minimalni broj recenzija).

**Prednosti**
- Uvijek aktualan prikaz reputacije.
- Uklanja ručni rad i rizik od netočnih podataka.

**Kada koristiti**
- Na svim prikazima pružatelja gdje je potreban agregat ocjena.
- Pri generiranju izvještaja ili ranking listi.
`,
      technicalDetails: `**Frontend**
- \`RatingBadge\` i \`ProviderCard\` čitaju prosjek iz API-ja i prikazuju broj recenzija.
- Tooltip objašnjava metodologiju (npr. minimalan broj recenzija).

**Backend**
- \`ratingService.recalculate\` koristi tranzakciju ili background job (bull/cron).
- Kada se dogodi event \`review.created|updated|deleted\`, scheduler osvježava prosjek.
- Podržava ponderiranje (npr. novije recenzije imaju veći utjecaj) ako je omogućeno.

**Baza**
- \`ProviderProfile\` polja \`averageRating\`, \`reviewCount\`, \`ratingUpdatedAt\`.
- Materijalizirani view \`ProviderRatingStats\` za brze agregacije.

**Integracije**
- Search indeks (Algolia/Elastic) sinkronizira prosjek za sortiranje.
- BI/analytics izvještaji koriste prosjek i broj recenzija.

**API**
- \`GET /api/providers/:id\` – vraća \`averageRating\` i \`reviewCount\`.
- \`POST /api/admin/providers/:id/recalculate-rating\` – ručni trigger.
- \`GET /api/providers?sort=rating\` – koristi agregirani prosjek.
`
    },
    "Brojanje ukupnog broja recenzija": {
      implemented: true,
      summary: "Vidite koliko ukupno recenzija pružatelj ima - više recenzija znači više iskustva.",
      details: `**Kako funkcionira**
- Nakon svake promjene recenzije (create/update/delete) ponovno izračunamo ukupan broj.
- Broj se prikazuje uz prosjek (npr. "4.8 ⭐ (23 recenzije)") i dostupno je za sortiranje.
- Novi profili s malo recenzija dobivaju badge "Novi" ili "Uskoro ocjene".

**Prednosti**
- Korisnici brže procjenjuju iskustvo pružatelja.
- Pružatelji prate rast svoje reputacije i motivirani su skupljati preporuke.

**Kada koristiti**
- Na javnom profilu, listama rezultata i u admin izvještajima.
- Kod algoritama rangiranja koji kombiniraju kvalitetu (prosjek) i količinu recenzija.
`,
      technicalDetails: `**Frontend**
- \`RatingBadge\` i \`ProviderCard\` prikazuju kombinaciju prosjeka i broja recenzija s tooltipom.
- Filteri omogućuju sortiranje po broju recenzija (descending/ascending).

**Backend**
- \`ratingService.recalculate\` vraća \`reviewCount\` uz prosjek; event \`review.changed\` invalidira cache.
- Snapshot servis spušta broj recenzija u materializirani pogled radi brzog dohvaćanja.

**Baza**
- \`ProviderProfile\` kolone \`reviewCount\`, \`ratingUpdatedAt\`.
- View \`ProviderRatingStats\` agregira prosjek i broj po kategorijama.

**Integracije**
- Search indeks koristi \`reviewCount\` za sortiranje i filtriranje.
- Analytics izvještaji prate rast recenzija po partneru i korelaciju s konverzijom.

**API**
- \`GET /api/providers/:id\` – vraća \`reviewCount\`.
- \`GET /api/providers?sort=reviewCount\` – sortiranje po volumenu.
- \`POST /api/admin/providers/:id/recalculate-rating\` – ručno osvježavanje prosjeka i broja.
`
    },
    "Prikaz recenzija na profilu pružatelja": {
      implemented: true,
      summary: "Sve recenzije koje je pružatelj primio prikazuju se na njegovom profilu za javni pregled.",
      details: `**Kako funkcionira**
- Sekcija recenzija prikazuje ocjene, komentare, datum i autora.
- Sort i filteri (npr. samo 5⭐) pomažu korisnicima pronaći relevantne primjere.
- Pružatelj može odgovoriti na recenziju; odgovor se prikazuje ispod originala.

**Prednosti**
- Transparentnost gradi povjerenje i utječe na odluke korisnika.
- Pružatelj dobiva strukturirani feedback i može reagirati.

**Kada koristiti**
- Prije nego korisnik prihvati ponudu ili kontaktira pružatelja.
- Tijekom internog QA-a kada tim podrške pregledava povijest interakcija.
`,
      technicalDetails: `**Frontend**
- \`ProviderReviewsSection\` (React Query + infinite scroll/paginacija) s filter komponentama.
- Lazy load avatara i skeleton prikazi za bolji UX; podrška za odgovore pružatelja.

**Backend**
- \`reviewController.listForProvider\` vraća paginirane recenzije uz reviewera i odgovore.
- Sort opcije: \`createdAt\`, \`rating\`; filter: \`rating\`, \`hasReply\`.

**Baza**
- Indeks \`@@index([reviewedUserId, createdAt])\` za kronološki prikaz.
- Tablica \`ReviewReply\` veže odgovor (providerId, message, repliedAt).

**Integracije**
- Moderation pipeline skenira recenzije i odgovore na neprikladan sadržaj.
- Analytics modul bilježi sentiment i agregate (npr. % 5⭐ recenzija).

**API**
- \`GET /api/providers/:id/reviews\` – paginiran popis s filterima.
- \`POST /api/reviews/:id/reply\` – dodaje odgovor pružatelja.
- \`GET /api/providers/:id/review-stats\` – histogram ocjena i prosjeci.
`
    },
    "Detaljni profil pružatelja": {
      implemented: true,
      summary: "Sveobuhvatan profil pružatelja s informacijama o iskustvu, licencama, portfoliju i recenzijama.",
      details: `**Kako funkcionira**
- Profil je podijeljen u sekcije: biografija, usluge, portfolio, recenzije, verifikacije i kontakt.
- Podaci se dohvaćaju kroz jedan API poziv i keširaju za brze prikaze.
- Verifikacijski badgevi prikazuju status (email, telefon, licenca, kućni testovi).

**Prednosti**
- Korisnici imaju sve ključne informacije na jednom mjestu.
- Pružatelji se diferenciraju profesionalnim profilom i dokazima kvalitete.

**Kada koristiti**
- Prije prihvaćanja ponude ili kontaktiranja pružatelja.
- Tijekom onboardinga kada se profil popunjava do 100%.
`,
      technicalDetails: `**Frontend**
- \`ProviderProfilePage\` orkestrira tabove/sekcije (React Router nested routes ili tab komponenta).
- Lazy loading za teže sekcije (portfolio, recenzije) + skeleton placeholders.

**Backend**
- \`providerController.getProfile\` vraća normalizirane podatke (profile, licenses, portfolio, stats).
- Access control: javni podaci vs. privatne informacije (npr. interni dokumenti samo adminu).

**Baza**
- \`ProviderProfile\`, \`ProviderLicense\`, \`PortfolioItem\`, \`ProviderServiceArea\`, \`Review\`, \`Verification\`.
- Materijalizirani view \`ProviderSnapshot\` za analitiku i ranking.

**Integracije**
- Search indeks (Algolia/Elastic) koristi profilne podatke za scoring.
- Email/onboarding automation podsjeća na dovršavanje sekcija (progress bar).

**API**
- \`GET /api/providers/:id\` – puni profil.
- \`PATCH /api/providers/:id\` – ažuriranje sekcija (bio, experience, services).
- \`POST /api/admin/providers/:id/verify\` – postavljanje verifikacijskih badgeva.
`
    },
    "Biografija pružatelja": {
      implemented: true,
      summary: "Napišite kratku biografiju koja predstavlja vas, vaše iskustvo i pristup poslu.",
      details: `**Kako funkcionira**
- Pružatelj unosi biografiju u dashboardu; polje podržava osnovni markdown.
- Biografija se prikazuje na vrhu profila (skraćena verzija u listama rezultata).
- Validacija sprječava unos zabranjenih podataka (kontakt, URL-ovi izvan dozvoljenih polja).

**Prednosti**
- Jak prvi dojam i diferencijacija u marketplaceu.
- Potiče korisnike da otvore profil i pošalju upit.

**Kada koristiti**
- Tijekom onboardinga i periodičnog osvježavanja profila.
- Kod promocija (newsletter, featured partner) gdje preuzimamo bio snippet.
`,
      technicalDetails: `**Frontend**
- \`ProviderBioForm\` (rich text/markdown editor) s previewom i brojačem znakova.
- Public komponenta \`ProviderBio\` prikazuje skraćeni tekst i "Pročitaj više".

**Backend**
- \`providerProfileService.updateBio\` sanitizira HTML/markdown i sprema renderiranu verziju.
- Audit log i event \`provider.bio.updated\` invalidira cache te reindeksira search.

**Baza**
- \`ProviderProfile\` columna \`bio\`, \`bioRendered\`, \`bioUpdatedAt\`.
- \`ProviderProfileChangeLog\` čuva prethodne verzije za audit.

**Integracije**
- Search indeks i email kampanje koriste kratku verziju bio teksta.
- Moderation servis provjerava usklađenost (riječi, kontakt podaci).

**API**
- \`PATCH /api/providers/:id/bio\` – ažurira biografiju.
- \`GET /api/providers/:id\` – vraća bio + meta podatke.
- \`GET /api/providers\` – filtriranje \`hasBio=true\` za kvalitetne profile.
`
    },
    "Specijalizacije": {
      implemented: true,
      summary: "Navedite svoja specijalizirana područja - gdje ste najbolji i što najviše volite raditi.",
      details: `**Kako funkcionira**
- Pružatelj odabire specijalizacije iz predefiniranog popisa ili dodaje prilagođene tagove (uz odobrenje admina).
- Specijalizacije se prikazuju na profilu, u karticama i koriste u filtriranju pretrage.
- Admini mogu upravljati popisom i mapirati specijalizacije na kategorije.

**Prednosti**
- Korisnici brzo razumiju u čemu je pružatelj najjači.
- Matchmaking envi algoritmi lakše dodjeljuju relevantne poslove.

**Kada koristiti**
- Tijekom onboardinga i redovitog ažuriranja profila.
- Kod marketinških kampanja (npr. "Top klima stručnjaci") koje selektiraju po specijalizaciji.
`,
      technicalDetails: `**Frontend**
- \`SpecializationSelect\` (multi-select/tag input) s autocompleteom i validacijom.
- Prikaz specijalizacija kao badgevi na profilima i karticama u listi.

**Backend**
- \`providerProfileService.updateSpecializations\` validira izbor i sinkronizira s kategorizacijom.
- Event \`provider.specialization.updated\` ažurira search indeks i matchmaking cache.

**Baza**
- Junction tablica \`ProviderSpecialization\` (providerId, specializationId, status).
- Referentna tablica \`Specialization\` s opisom i pripadajućim kategorijama.

**Integracije**
- Search indeks koristi specijalizacije za facet filtere.
- Analytics prati popularnost specijalizacija i konverzije po tagu.

**API**
- \`PATCH /api/providers/:id/specializations\` – postavlja specijalizacije.
- \`GET /api/providers?specializationId=...\` – filtriranje.
- \`GET /api/admin/specializations\` – upravljanje popisom.
`
    },
    "Godine iskustva": {
      implemented: true,
      summary: "Navedite koliko godina radite u svojoj djelatnosti - to pokazuje vaše iskustvo.",
      details: `**Kako funkcionira**
- Pružatelj unosi broj godina iskustva (ukupno ili po kategoriji) kroz profil.
- Vrijednost se prikazuje na profilu i može utjecati na sortiranje/preporuke.
- Admin može zatražiti dokaz (certifikat, referenca) kada su vrijednosti neuobičajeno visoke.

**Prednosti**
- Korisnici dobivaju kontekst o senioritetu pružatelja.
- Marketplaces i analitika mogu segmentirati ponude prema iskustvu.

**Kada koristiti**
- Kod poslova koji zahtijevaju visoko iskustvo (npr. specijalistički radovi).
- U pitching materijalima i promocijama (npr. "10+ godina iskustva").
`,
      technicalDetails: `**Frontend**
- Number input \`YearsOfExperienceField\` s helper tekstom i min/max validacijom.
- Badge na profilu/ponudi prikazuje "10+ godina" ili sličan format.

**Backend**
- \`providerProfileService.updateExperience\` validira raspon (0-50) i pohranjuje vrijednost.
- Event \`provider.experience.updated\` ažurira scoring u matchmakingu.

**Baza**
- \`ProviderProfile\` polje \`yearsOfExperience\` (INT) + opcionalno \`experienceByCategory\` (JSONB).

**Integracije**
- Analytics modul koristi podatke za segmentaciju i korelaciju s konverzijom.
- Search indeks omogućuje filter "minExperience".

**API**
- \`PATCH /api/providers/:id/experience\` – ažurira godine iskustva.
- \`GET /api/providers?minExperience=5\` – filtrira iskusne partnere.
- \`POST /api/admin/providers/:id/experience-proof\` – upload dokaza (ako je potrebno).
`
    },
    "Web stranica": {
      implemented: true,
      summary: "Dodajte link na svoju web stranicu kako bi korisnici mogli vidjeti više o vašim uslugama.",
      details: `**Kako funkcionira**
- Pružatelj unosi URL web stranice; sustav validira format i dostupnost.
- Link se prikazuje na profilu i u karticama kao CTA (otvara se u novom tabu).
- Admini mogu označiti link kao verificiran (npr. DNS provjera).

**Prednosti**
- Korisnici dobivaju dodatne informacije i reference.
- Povećava povjerenje i profesionalan dojam.

**Kada koristiti**
- Kada imate portfolio ili dodatne informacije izvan platforme.
- Kod ponuda za veće projekte gdje želite pokazati reference.
`,
      technicalDetails: `**Frontend**
- \`WebsiteUrlField\` s inline validacijom i previewom (favicon, meta title).
- CTA gumb "Posjeti web stranicu" na profilu.

**Backend**
- \`providerProfileService.updateWebsite\` validira URL, po želji radi HTTP HEAD provjeru.
- Cron job provjerava nedostupne linkove i deaktivira ih.

**Baza**
- \`ProviderProfile\` polje \`websiteUrl\`, \`websiteVerifiedAt\`.
- \`WebsiteVerification\` tablica (providerId, token, status) za DNS/email verifikaciju.

**Integracije**
- Analytics prati klikove na web link.
- SEO/sitemap generator može uključiti verificirane URL-ove.

**API**
- \`PATCH /api/providers/:id/website\` – ažurira url.
- \`POST /api/providers/:id/website/verify\` – pokreće verifikaciju.
- \`GET /api/providers/:id\` – vraća \`websiteUrl\` i status verifikacije.
`
    },
    "Područje rada": {
      implemented: true,
      summary: "Navedite gradove ili područja u kojima radite - to pomaže korisnicima vidjeti pokrivate li njihovo područje.",
      details: `**Kako funkcionira**
- Pružatelj odabire regije/gradove (autocomplete + karta) i opcionalno definira radijus.
- Područja se prikazuju na profilu, a korisnici i sustav koriste ih za filtriranje.
- Moguće je označiti primarne i sekundarne zone te postaviti nadoplate za udaljene lokacije.

**Prednosti**
- Točna geografija omogućuje bolji matchmaking i smanjuje neodgovarajuće upite.
- Pružatelji planiraju logistiku, a korisnici vide dostupnost.

**Kada koristiti**
- Tijekom onboardinga i kada proširujete poslovanje na nova područja.
- Kod poslova koji zahtijevaju brzi odgovor u određenom radijusu.
`,
      technicalDetails: `**Frontend**
- \`ServiceAreaSelector\` (Mapbox + chips) za izbor gradova/općina i radijusa.
- UI prikazuje pokriveno područje na karti u profilu.

**Backend**
- \`serviceAreaService.update\` sprema geometrije (poligoni/radijusi) i sinkronizira s geosearchom.
- Event \`provider.serviceArea.updated\` invalidira relevantne cacheve.

**Baza**
- \`ProviderServiceArea\` (providerId, type, geojson, baseCityId, surchargePolicy).
- PostGIS ekstenzije i indeksi za geoupite.

**Integracije**
- Geosearch (Elasticsearch/Algolia) koristi servisno područje za geo-filtriranje.
- Logistics modul izračunava udaljenost i dodatne troškove.

**API**
- \`PATCH /api/providers/:id/service-areas\` – ažurira područja rada.
- \`GET /api/providers?lat=&lng=&radius=\` – filtrira pružatelje u radijusu.
- \`GET /api/providers/:id/service-areas\` – vraća detalje područja.
`
    },
    "Status dostupnosti": {
      implemented: true,
      summary: "Označite jesite li trenutno dostupni za nove poslove ili ste zauzeti.",
      details: `**Kako funkcionira**
- Pružatelj odabire status (DOSTUPAN, ZAUZET, NEAKTIVAN) u profilu ili mobilnoj aplikaciji.
- Status se prikazuje na profilu, karticama i u filtrima pretrage; može imati auto-expire.
- Admin ili automatika može prebaciti status na ZAUZET ako postoje aktivni poslovi iznad definiranog praga.

**Prednosti**
- Korisnici odmah vide koga mogu kontaktirati i dobivaju realno vrijeme odgovora.
- Pružatelji kontroliraju opterećenost i izbjegavaju neželjene upite.

**Kada koristiti**
- Prije odmora, velikih projekata ili kampanja kada želite obustaviti nove upite.
- Kada završite posao i želite ponovno prihvaćati leadove.
`,
      technicalDetails: `**Frontend**
- \`AvailabilityToggle\` (radio ili dropdown) s quick actions (npr. "Pauziraj na 7 dana").
- Status badge na karticama i filter "Samo dostupni" u listi.

**Backend**
- \`availabilityService.updateStatus\` validira tranzicije i bilježi \`statusExpiresAt\` ako je privremeni status.
- Cron job vraća status na DOSTUPAN kada istekne pauza.

**Baza**
- \`ProviderProfile\` polja \`availabilityStatus\`, \`statusUpdatedAt\`, \`statusExpiresAt\`.
- \`AvailabilityHistory\` čuva promjene statusa i razlog.

**Integracije**
- Notification servis šalje podsjetnike da se status automatski vrati na "Dostupan".
- Matchmaking i lead distribucija uzimaju u obzir status pri dodjeli poslova.

**API**
- \`PATCH /api/providers/:id/availability\` – ažurira status.
- \`GET /api/providers?availability=AVAILABLE\` – filtrira dostupne.
- \`POST /api/providers/:id/availability/pause\` – temp pauza s trajanjem.
`
    },
    "Kategorije u kojima radi": {
      implemented: true,
      summary: "Odaberite kategorije usluga u kojima radite - to određuje koje poslove vidite.",
      details: `**Kako funkcionira**
- Pružatelj bira kategorije iz hijerarhije (glavne i podkategorije) i povezuje ih sa svojim profilom.
- Odabrane kategorije prikazuju se na profilu i filtriraju poslove, leadove i pretrage.
- Admin može odobriti ili odbiti zahtjev za novom kategorijom (compliance/licence check).

**Prednosti**
- Fokus na relevantne poslove i manje šuma u marketplaceu.
- Korisnici jasno vide u kojim područjima pružatelj radi.

**Kada koristiti**
- Tijekom onboardinga i kad proširujete poslovanje na nove usluge.
- Kod analiza performansi po kategorijama.
`,
      technicalDetails: `**Frontend**
- \`ProviderCategorySelector\` (tree select) s pretraživanjem i badgevima za licence.
- Prikaz kategorija kao badgevi na profilu i karticama ponuda.

**Backend**
- \`providerCategoryService.assign\` dodaje/uklanja kategorije i validira preduvjete (licence, status).
- Event \`provider.category.updated\` invalidira cache i pokreće reindeksiranje.

**Baza**
- Junction tablica \`ProviderCategory\` (providerId, categoryId, status, receiveLeads).
- Constraint \`@@unique([providerId, categoryId])\`.

**Integracije**
- Search indeks koristi kategorije kao facet.
- Lead distribucija i matchmaking filtriraju prema kategorijama.

**API**
- \`PATCH /api/providers/:id/categories\` – postavlja kategorije.
- \`GET /api/providers/:id/categories\` – vraća aktivne kategorije.
- \`POST /api/providers/:id/categories/request\` – zahtjev za novom kategorijom.
`
    },
    "Odabir kategorija za primanje leadova": {
      implemented: true,
      summary: "Odaberite u kojim kategorijama želite primati ekskluzivne leadove - to određuje koje leadove vidite.",
      details: `**Kako funkcionira**
- Pružatelj označi kategorije iz kojih želi primati leadove (može biti subset radnih kategorija).
- Lead distribucija koristi listu za formiranje reda čekanja i obavijesti.
- Promjene stupaju na snagu odmah; sustav može provjeriti minimalne kriterije (npr. licence).

**Prednosti**
- Fokus na najprofitabilnije kategorije i bolji ROI.
- Bolji kvalitet leadova jer se isključuju nebitne kategorije.

**Kada koristiti**
- Kod optimizacije budžeta za leadove ili širenja na nove vertikale.
- Periodično, prema rezultatima konverzije.
`,
      technicalDetails: `**Frontend**
- \`LeadCategorySelector\` s previewom potencijalnog volumena i cijene po kategoriji.
- Badge "aktivno" / "pauzirano" uz svaku kategoriju.

**Backend**
- \`leadPreferenceService.updateCategories\` sprema odabir i obavještava distribucijski engine.
- Rate limiter sprječava prečeste promjene (anti-abuse).

**Baza**
- \`ProviderLeadCategory\` (providerId, categoryId, status, priority, pausedUntil).
- Indeksi po providerId i status.

**Integracije**
- Lead queue i scoring engine koriste podatke za raspodjelu.
- Analytics modul mjeri konverziju i trošak po kategoriji.

**API**
- \`PATCH /api/providers/:id/lead-categories\` – ažurira postavke.
- \`GET /api/providers/:id/lead-categories\` – vraća aktivne/pauzirane kategorije.
- \`POST /api/providers/:id/lead-categories/pause\` – pauzira kategoriju na određeno vrijeme.
`
    },
    "Filtriranje leadova po kategorijama": {
      implemented: true,
      summary: "Filtrirate leadove prema kategorijama kako biste vidjeli samo relevantne leadove.",
      details: `**Kako funkcionira**
- Lead marketplace nudi filter po kategorijama (višestruki odabir, podkategorije).
- Rezultati se ažuriraju u realnom vremenu i pamte kroz URL/saved filtere.
- Filtriranje se kombinira s ostalim kriterijima (lokacija, cijena, status).

**Prednosti**
- Ušteda vremena jer pregledavate samo relevantne leadove.
- Veća stopa konverzije jer fokusirate budžet na svoje vertikale.

**Kada koristiti**
- Svakodnevno pretraživanje lead marketplacea.
- Analiza performansi po kategorijama (saved filters + analytics).
`,
      technicalDetails: `**Frontend**
- \`LeadFilterPanel\` (React Query) s facet checkovima i zbrojem rezultata.
- Saved filter modal omogućuje spremanje kombinacija (local storage + backend).

**Backend**
- \`leadController.list\` prihvaća \`categoryIds[]\` i kombinira ih AND logikom.
- Query koristi materializirani view \`LeadSearchView\` za brze odgovore.

**Baza**
- \`LeadCategory\` junction tablica (leadId, categoryId) + indeksi.
- View s predagregiranim facet countovima.

**Integracije**
- Search indeks (Algolia/Elastic) koristi category facets za instant filtriranje.
- Notification servis šalje alert kada se pojave leadovi za spremljene filtere.

**API**
- \`GET /api/leads?categoryIds=...\` – filtrira leadove.
- \`POST /api/leads/saved-filters\` – spremanje kombinacija.
- \`GET /api/leads/facets\` – vraća broj leadova po kategoriji.
`
    },
    "Pregled svih pružatelja": {
      implemented: true,
      summary: "Pregledajte sve pružatelje na platformi i pronađite onog koji najbolje odgovara vašim potrebama.",
      details: `**Kako funkcionira**
- Stranica "Svi pružatelji" prikazuje grid/listu sa ključnim informacijama (ocjena, recenzije, lokacije, verifikacije).
- Filteri (kategorija, lokacija, ocjena, dostupnost) i sortiranja (rating, broj recenzija, udaljenost) pomažu suziti rezultate.
- Klik na karticu vodi na detaljni profil pružatelja.

**Prednosti**
- Jednostavno uspoređujete pružatelje na temelju mjerljivih kriterija.
- Brži put do odluke zahvaljujući jasnim filterima i podacima.

**Kada koristiti**
- Kada korisnik traži novog pružatelja i treba pregled svih opcija.
- Kod internog QA-a ili administracije prilikom provjere profila.
`,
      technicalDetails: `**Frontend**
- \`ProviderDirectoryPage\` s React Query paginacijom i responsive gridom.
- Komponente: \`ProviderCard\`, \`ProviderFilters\`, \`SortDropdown\`.

**Backend**
- \`providerController.list\` prihvaća filtere i sortiranja (categoryId, city, rating, availability).
- Podaci se keširaju i invalidiraju kada se profil ažurira.

**Baza**
- Pogled \`ProviderSearchView\` (providerId, rating, reviewCount, city, categories).
- Indeksi na (role, rating, city).

**Integracije**
- Search indeks (Algolia/Elastic) vraća rezultate s facetima.
- Analytics prati korištenje filtera i CTR na profile.

**API**
- \`GET /api/providers\` – lista s query parametrima.
- \`GET /api/providers/search\` – full-text pretraga.
- \`GET /api/providers/export\` – CSV/Excel izvoz (admin).
`
    },
    "Chat sobe za svaki posao": {
      implemented: true,
      summary: "Svaki posao ima svoju chat sobu gdje možete komunicirati s korisnikom ili pružateljem oko tog posla.",
      details: `**Kako funkcionira**
- Kreira se jedna chat soba po poslu (jobId) čim se pojavi interakcija (ponuda, pitanje, prihvat).
- Sudionici (korisnik, pružatelji, admin) komuniciraju u realnom vremenu s tipkanje/pročitano indikatorima.
- Povijest ostaje pohranjena i dostupna u bilo kojem trenutku.

**Prednosti**
- Centralizirana komunikacija za svaki posao.
- Lakše praćenje dogovora i smanjenje nesporazuma.

**Kada koristiti**
- Tijekom pregovora i izvođenja posla.
- Kod podrške/eskalacija kao referenca na dogovore.
`,
      technicalDetails: `**Frontend**
- \`JobChatPanel\` s socket konekcijom, uploadom priloga i status indikatorima.
- Prilagođen prikaz za desktop i mobilne uređaje.

**Backend**
- \`chatService.getOrCreateRoom(jobId)\` osigurava jedinstvenu sobu.
- Socket gateway emitira poruke; REST endpoint za arhivu.

**Baza**
- \`ChatRoom\` (jobId, createdAt) + \`ChatParticipant\` (roomId, userId, role).

**Integracije**
- Notification servis za push/email obavijesti o novim porukama.
- Moderation pipeline (AI + ručni) provjerava sadržaj.

**API**
- \`GET /api/jobs/:id/chat\` – dohvat sobe i poruka.
- \`POST /api/jobs/:id/chat/messages\` – slanje poruke.
- WebSocket kanal \`chat:jobId\` za real-time.
`
    },
    "Povijest poruka": {
      implemented: true,
      summary: "Sve poruke koje pošaljete i primite su spremljene tako da možete vidjeti cijelu povijest razgovora.",
      details: `**Kako funkcionira**
- Poruke se pohranjuju kronološki i mogu se dohvatiti paginirano.
- Status (poslano, dostavljeno, pročitano) prati lifecycle svake poruke.
- Prilozi i reference (ponude, dokumenti) povezani su s porukama.

**Prednosti**
- Uvijek imate dokaz dogovorenih uvjeta.
- Jednostavno pretraživanje ranijih informacija.

**Kada koristiti**
- Kod sporova ili provjere detalja (cijena, termin, uvjeti).
- Kada trebate brzo pronaći staru poruku/prilog.
`,
      technicalDetails: `**Frontend**
- \`ChatHistory\` komponenta s infinite scrollom i grupiranjem po datumu.
- Search unutar chata (klijent prikazuje rezultate highlightano).

**Backend**
- \`chatMessageService.list\` vraća paginirane poruke (before/after cursors).
- Eventi \`message.read\` i \`message.delivered\` ažuriraju statuse.

**Baza**
- \`ChatMessage\` (roomId, senderId, content, attachmentId, status, createdAt).
- Indeksi po roomId+createdAt i senderId.

**Integracije**
- Storage servis (S3) za priloge; antivirus skeniranje.
- Analytics mjeri vrijeme odgovora i sentiment.

**API**
- \`GET /api/chat/messages\` – paginirani povijesni dohvat (query: roomId, before, limit).
- \`POST /api/chat/messages/:id/read\` – označava pročitano.
- \`GET /api/chat/messages/search\` – pretraživanje unutar poruka.
`
    },
    "Notifikacije za nove poruke": {
      implemented: true,
      summary: "Primajte obavijesti kada vam netko pošalje poruku u chatu - ne propustite važne poruke.",
      details: `**Kako funkcionira**
- Nakon svake nove poruke u sobi u kojoj sudjelujete, kreira se notifikacija (toast + badge).
- Push/email obavijesti šalju se ako ste offline ili imate omogućene browser notifikacije.
- Klik na notifikaciju vodi izravno u odgovarajući chat i označava poruke pročitanima.

**Prednosti**
- Brzo reagirate na upite i ne propuštate dogovorene rokove.
- Jedinstveno mjesto (notifikacijski panel) za sve novosti iz chatova.

**Kada koristiti**
- Tijekom pregovora i izvedbe posla kada trebate biti u tijeku s komunikacijom.
- Kada radite na više poslova paralelno i trebate centralizirani pregled.
`,
      technicalDetails: `**Frontend**
- \`NotificationBell\` prikazuje broj nepročitanih i dropdown s najnovijim porukama.
- Web push (service worker) i browser badge integracija za offline korisnike.

**Backend**
- \`notificationService.createMessageNotification\` se poziva nakon \`chatService.sendMessage\`.
- WebSocket event \`notification:new\` emitira podatke u realnom vremenu.

**Baza**
- \`Notification\` zapis s poljima (userId, type='MESSAGE', payload, readAt).
- Indeks \`@@index([userId, readAt])\` omogućuje brzi dohvat nepročitanih.

**Integracije**
- Email/SMS servis za fallback obavijesti.
- Analytics prati vrijeme odgovora na nove poruke.

**API**
- \`GET /api/notifications\` – lista + mogućnost filtriranja po tipu (MESSAGE).
- \`PATCH /api/notifications/:id/read\` – označava kao pročitano.
- WebSocket kanal \`notifications\` za push.
`
    },
    "Notifikacije za prihvaćene ponude": {
      implemented: true,
      summary: "Primajte obavijest kada korisnik prihvati vašu ponudu - možete započeti rad na poslu.",
      details: `**Kako funkcionira**
- Kada klijent prihvati ponudu, sustav kreira notifikaciju za pružatelja i označi posao kao U TIJEKU.
- Push/email informacija uključuje ključne podatke (posao, iznos, klijent) i link na detalje.
- Notifikacija se uklanja nakon što otvorite posao ili ručno označite kao pročitanu.

**Prednosti**
- Odmah znate da je vrijeme za organizaciju izvedbe.
- Transparentan trag svih prihvaćenih ponuda za tim i administratore.

**Kada koristiti**
- Nakon slanja ponuda kako biste brzo reagirali kada klijent potvrdi suradnju.
- Kod praćenja pipelinea prodaje (dashboard kombinira notifikacije i status posla).
`,
      technicalDetails: `**Frontend**
- Badge i toast obavijest s CTA gumbom "Otvori posao".
- Email template i mobile push koriste isti payload (jobId, amount, clientName).

**Backend**
- \`offerService.accept\` poziva \`notificationService.createOfferAccepted\`.
- WebSocket event \`offer.accepted\` push-a real-time notifikaciju.

**Baza**
- \`Notification\` zapis type='OFFER_ACCEPTED' s povezanim \`offerId\`.
- Audit log prati vrijeme slanja i čitanja.

**Integracije**
- Email servis (SendGrid/SES) i push gateway (Firebase/APNs).
- CRM sinkronizacija označava deal kao "Won".

**API**
- \`GET /api/notifications?type=OFFER_ACCEPTED\` – filtriranje.
- \`PATCH /api/notifications/:id/read\` – označi kao pročitano.
- WebSocket kanal \`notifications\` emitira event s detaljima.
`
    },
    "Notifikacije za nove poslove (providere)": {
      implemented: true,
      summary: "Kao pružatelj, primajte obavijesti kada se objavi novi posao u vašim kategorijama - ne propustite priliku.",
      details: `**Kako funkcionira**
- Job publish event provjerava koje tvrtke imaju odabrane kategorije/lokacije i kreira im notifikaciju.
- Obavijest prikazuje naslov, budžet, lokaciju i link na detalje – dostupna kao push/email/SMS.
- Saved filteri i preferencije omogućuju odabir frekvencije (real-time, digest) i kanala.

**Prednosti**
- Reagirate prvi na poslove koji odgovaraju vašem profilu.
- Povećava stopu preuzimanja leadova i iskorištenost pretplate.

**Kada koristiti**
- Aktivirajte kada želite pokriti sve prilike u svojim kategorijama.
- Pauzirajte tijekom godišnjeg odmora ili kada je tim preopterećen.
`,
      technicalDetails: `**Frontend**
- Notification feed s filterom "Novi poslovi" i quick akcijom "Pogledaj posao".
- Email template uključuje CTA "Pogledaj posao" i sekundarne informacije (rok, status).

**Backend**
- \`jobNotificationService.dispatchNewJob\` generira listu primatelja i kreira batch notifikacije.
- WebSocket event \`job.new\` za real-time bannere.

**Baza**
- \`Notification\` type='NEW_JOB' + payload (jobId, categoryId, city, budget).
- \`NotificationPreference\` definira kanale i učestalost.

**Integracije**
- Email/SMS gateway za offline korisnike.
- Analytics prati otvaranja i konverziju (klik → ponuda/kupnja leada).

**API**
- \`GET /api/notifications?type=NEW_JOB\` – lista novih poslova.
- \`PATCH /api/notifications/:id/read\` – označavanje kao pročitano.
- \`PATCH /api/notification-preferences\` – konfiguracija kanala/frekvencije.
`
    },
    "Email notifikacije": {
      implemented: true,
      summary: "Primajte važne obavijesti na email kako biste bili informirani čak i ako niste na platformi.",
      details: `**Kako funkcionira**
- Nakon važnih događaja (nova poruka, novi posao, promjena statusa ponude) generira se email prema korisnikovim preferencama.
- Svaki email sadrži sažetak, ključne CTA linkove i mogućnost upravljanja postavkama.
- Digest opcija šalje objedinjene obavijesti (dnevno/tjedno) kako bi se smanjio broj poruka.

**Prednosti**
- Ostajete informirani i izvan platforme.
- Arhiva u inboxu omogućuje naknadno praćenje dogovora i aktivnosti.

**Kada koristiti**
- Aktivirajte kada niste stalno prijavljeni ili želite backup komunikacije.
- Onemogućite/digest kada imate visok volumen i želite manje emailova.
`,
      technicalDetails: `**Frontend**
- Stranica \`NotificationSettings\` (toggles + odabir frekvencije) sinkronizira se s API-jem.
- Email template preview prikazuje kako izgledaju poruke prije spremanja.

**Backend**
- \`notificationPreferenceService\` određuje treba li poslati email.
- Background worker (Bull/Kafka consumer) šalje email asinkrono putem \`emailService.send\`.

**Baza**
- \`NotificationPreference\` (userId, channel='email', types, frequency).
- \`Notification\` polje \`emailSentAt\` služi za auditing.

**Integracije**
- SendGrid/SES za isporuku emailova.
- Analytics (open/click tracking) integriran kroz email provider.

**API**
- \`GET /api/notification-preferences\` – dohvat postavki.
- \`PATCH /api/notification-preferences\` – ažuriranje kanala/tipova.
- \`POST /api/notifications/send-test-email\` – test poruka korisniku.
`
    },
    "In-app notifikacije": {
      implemented: true,
      summary: "Primajte obavijesti direktno na platformi - vidite ih u realnom vremenu dok koristite platformu.",
      details: `**Kako funkcionira**
- U realnom vremenu renderiramo toast i unos u panel čim se dogodi relevantan event (ponuda, poruka, status).
- Ikonica zvona prikazuje broj nepročitanih; klik otvara listu s quick akcijama.
- Korisnik može označiti pojedinačne ili sve notifikacije kao pročitane.

**Prednosti**
- Bez odgode vidite kritične događaje tijekom rada na platformi.
- Centralizira sve akcije (otvaranje posla, chata, ponude) u par klikova.

**Kada koristiti**
- Standardno za sve korisnike; omogućite persistenciju badgeva za dnevni pregled aktivnosti.
- Tijekom support rada (admin) za praćenje prijava u stvarnom vremenu.
`,
      technicalDetails: `**Frontend**
- \`NotificationBell\` + \`NotificationDropdown\` koriste WebSocket/SSE feed i lokalni cache.
- Toast sistem (react-hot-toast) s akcijskim gumbima (npr. "Otvori chat").

**Backend**
- \`notificationService.list\` i \`markRead\` endpointi.
- WebSocket kanal \`notifications\` emitira nove zapise.

**Baza**
- \`Notification\` (id, userId, type, payload, readAt, createdAt).
- Indeksi \`@@index([userId, readAt, createdAt])\` optimiziraju dohvat.

**Integracije**
- Redis pub/sub za broadcast notifikacija između instanci.
- Analytics prati klik-through na pojedine tipove.

**API**
- \`GET /api/notifications\` – lista i filteri.
- \`PATCH /api/notifications/:id/read\` i \`POST /api/notifications/read-all\` – označavanje kao pročitano.
- WebSocket event \`notification:new\` s payloadom (type, title, link).
`
    },
    "Push notifikacije (browser notifications)": {
      implemented: true,
      summary: "Primajte browser push notifikacije direktno na vašem uređaju čak i kada niste na platformi - ne propustite važne obavijesti.",
      details: `**Kako funkcionira**
- Korisnik klikne gumb "Uključi push notifikacije" i dozvoljava browseru da prikazuje notifikacije.
- Sustav registrira service worker i pohranjuje push subscription u bazu podataka.
- Kada se dogodi važan događaj (novi posao, ponuda, poruka), backend šalje push notifikaciju kroz web-push protokol.
- Browser prikazuje notifikaciju čak i kada korisnik nije na stranici; klik na notifikaciju otvara relevantnu stranicu.

**Prednosti**
- Ne propustite važne obavijesti čak i kada niste aktivno na platformi.
- Brza reakcija na nove poslove i ponude povećava šanse za uspješan posao.
- Notifikacije rade u pozadini bez potrebe za otvorenom karticom.

**Kada koristiti**
- Aktivirajte ako želite biti obaviješteni o novim poslovima u stvarnom vremenu.
- Korisno za providere koji žele brzo reagirati na nove prilike.
- Onemogućite ako preferirate samo email ili in-app notifikacije.
`,
      technicalDetails: `**Frontend**
- Hook \`usePushNotifications\` upravlja subscription statusom i komunikacijom s backendom.
- Komponenta \`PushNotificationButton\` omogućava korisnicima da uključe/isključe push notifikacije.
- Service worker (\`sw.js\`) prima push evente i prikazuje notifikacije s akcijskim gumbovima.
- Notifikacije podržavaju klik akcije koje otvaraju relevantnu stranicu na platformi.

**Backend**
- Servis \`push-notification-service.js\` koristi \`web-push\` biblioteku za slanje notifikacija.
- VAPID ključevi (public/private) konfigurirani su kroz environment varijable.
- Endpointi \`/api/push-notifications/subscribe\` i \`/unsubscribe\` upravljaju subscriptionima.
- Funkcija \`sendPushNotification\` šalje notifikacije svim aktivnim uređajima korisnika.
- Automatski cleanup neaktivnih subscriptiona (410 Gone status).

**Baza**
- Tablica \`PushSubscription\` čuva endpoint, p256dh i auth ključeve za svaki uređaj.
- Polja \`isActive\`, \`lastUsedAt\` i \`userAgent\` omogućavaju praćenje i cleanup.
- Unique constraint na \`userId_endpoint\` sprječava duplikate.

**Integracije**
- Web Push API (standardni browser API za push notifikacije).
- VAPID protokol za autentifikaciju push servisa.
- Service Worker API za prihvat notifikacija u pozadini.

**API**
- \`GET /api/push-notifications/vapid-public-key\` – javni ključ za frontend subscription.
- \`POST /api/push-notifications/subscribe\` – registracija novog subscriptiona (zahtijeva auth).
- \`POST /api/push-notifications/unsubscribe\` – uklanjanje subscriptiona (zahtijeva auth).
- \`GET /api/push-notifications/subscriptions\` – lista aktivnih subscriptiona korisnika (zahtijeva auth).

**Konfiguracija**
- VAPID ključevi se generiraju naredbom: \`npx web-push generate-vapid-keys\`
- Postavite \`VAPID_PUBLIC_KEY\`, \`VAPID_PRIVATE_KEY\` i \`VAPID_SUBJECT\` u environment varijablama.
- VAPID_SUBJECT mora biti email adresa (npr. \`mailto:admin@uslugar.oriph.io\`).
`
    },
    "Brojač nepročitanih notifikacija": {
      implemented: true,
      summary: "Vidite broj nepročitanih notifikacija na ikonici zvona - znate koliko novih obavijesti imate.",
      details: `**Kako funkcionira**
- Svaka nova nepročitana notifikacija povećava badge brojača; čitanjem se broj smanjuje ili resetira.
- Brojač se sinkronizira u realnom vremenu preko WebSocket eventa i resetira nakon \`markRead\` akcija.
- Fallback polling osigurava točnost i nakon reconnecta.

**Prednosti**
- Na prvi pogled znate imate li nove obavijesti.
- Potiče pravovremeno čitanje poruka i ponuda.

**Kada koristiti**
- Standardno za sve korisnike – aktivno pokazuje backlog aktivnosti.
- Korisno za account managere koji upravljaju većim brojem poslova.
`,
      technicalDetails: `**Frontend**
- Badge komponenta u headeru koristi globalni notification store (Zustand/Context).
- Hook \`useUnreadCount\` spaja se na WebSocket event \`notification:unread-count\` i fallback polling.

**Backend**
- \`notificationService.getUnreadCount\` agregira broj nepročitanih.
- Event \`notification.read\` emitira novu vrijednost svima u sessionu.

**Baza**
- Indeks \`@@index([userId, readAt])\` omogućuje brzu COUNT(*) operaciju.

**Integracije**
- Redis cache drži broj po korisniku radi bržeg dohvaćanja.
- Analytics prati trend broja nepročitanih (uvođenje SLA na odgovor).

**API**
- \`GET /api/notifications/unread-count\` – vraća trenutni broj.
- WebSocket event \`notification:unread-count\` – push ažuriranja.
- \`PATCH /api/notifications/:id/read\` i \`POST /api/notifications/read-all\` – utječu na brojač.
`
    },
    "Cijene leadova (10-20 kredita)": {
      implemented: true,
      summary: "Leadovi imaju transparentan raspon cijena (10-20 kredita) ovisno o kategoriji i kvaliteti.",
      details: `**Kako funkcionira**
- Marketplace prikazuje cijenu svakog leada u kreditima prije kupnje.
- Raspon se određuje prema kategoriji, AI scoreu, trust scoreu klijenta i kompleksnosti posla.
- Filtri i badgevi pomažu usporediti cijene i planirati budžet.

**Prednosti**
- Jasna očekivanja i nema skrivenih troškova.
- Omogućuje planiranje troškova i usporedbu leadova.

**Kada koristiti**
- Pri odabiru leadova za kupnju i procjeni ROI-ja.
- Analiza kategorija koje donose najbolji omjer cijene i vrijednosti.
`,
      technicalDetails: `**Frontend**
- Marketplace kartice prikazuju cijenu, raspon i tooltip s objašnjenjem.
- Filter po cijeni i slider omogućuju sužavanje prikaza.

**Backend**
- \`leadPricingService.calculate\` određuje cijenu prema parametrima (kategorija, AI score, trust score).
- Event \`lead.price.updated\` sinkronizira promjene u cacheu.

**Baza**
- \`Lead\` polje \`priceInCredits\` i \`pricingTier\`.
- \`LeadPricingRule\` čuva raspon po kategoriji i planu.

**Integracije**
- Analytics prati cijene i konverziju po tieru.
- Billing servis koristi cijenu za transakcije i refund iznose.

**API**
- \`GET /api/leads\` – vraća cijenu i tier u listi.
- \`POST /api/admin/lead-pricing\` – upravljanje pravilima cijena.
`
    },
    "Kupnja leadova": {
      implemented: true,
      summary: "Kupite ekskluzivni lead klikom na gumb - krediti se troše automatski ili plaćate direktno karticom.",
      details: `**Kako funkcionira**
- Klik na "Kupi lead" pokreće provjeru raspoloživih kredita i zaključavanje leada.
- Ako krediti nisu dovoljni, nudimo Stripe plaćanje ili top-up prije dovršetka kupnje.
- Nakon uspješne transakcije, lead prelazi u "Moji leadovi" i kontakt podaci se otkrivaju samo vama.

**Prednosti**
- Jednostavan, siguran proces kupnje s atomskim transakcijama.
- Ekskluzivnost – lead se uklanja s marketplacea čim ga kupite.

**Kada koristiti**
- Kada identificirate lead s visokim scoreom i želite reagirati odmah.
- Kod automatiziranih strategija (auto-buy) uz definirane uvjete budžeta i scorea.
`,
      technicalDetails: `**Frontend**
- \`LeadPurchaseModal\` vodi korisnika kroz kreditni saldo, Stripe checkout i potvrdu.
- Inline statusi (npr. "Zaključavanje leada...") prikazuju napredak.

**Backend**
- \`leadPurchaseService.purchase\` provodi provjere, zaključava lead (optimistic lock) i emitira event \`lead.purchased\`.
- Integracija sa Stripe Payment Intentom ili internim kreditnim saldom.

**Baza**
- \`LeadPurchase\` (leadId, companyId, amount, creditsSpent, paymentMethod, status).
- \`Lead\` polje \`exclusiveOwnerId\` označava tko posjeduje lead nakon kupnje.

**Integracije**
- Stripe za kartična plaćanja, Redis lock za sprječavanje dvostruke kupnje.
- Notification servis šalje potvrdu kupnje i podsjetnik da kontaktirate klijenta.

**API**
- \`POST /api/leads/:leadId/purchase\` – inicira kupnju.
- \`POST /api/leads/:leadId/release\` – vraća lead (admin/refund scenarij).
- \`GET /api/director/leads\` – lista kupljenih leadova s metrikama.
`
    },
    "Red čekanja za leadove": {
      implemented: true,
      summary: "Uredite se u red čekanja za leadove - leadovi se automatski dijele redom providerima u redu.",
      details: `**Kako funkcionira**
- Pružatelj se prijavljuje u queue za odabrane kategorije/lokacije uz definirane limite troška.
- Novi lead automatski se ponudi prvom slobodnom u redu; ako odbije/istekne SLA, prelazi na sljedećeg.
- Queue algoritam bilježi redoslijed, vrijeme reakcije i pravednu distribuciju.

**Prednosti**
- Automatski priljev leadova bez ručnog praćenja marketplacea.
- Pravedna raspodjela i manje propuštenih prilika.

**Kada koristiti**
- Za timove koji žele stabilan pipeline bez ručnog kupovanja.
- U kampanjama s velikim volumenom leadova kada ručni odabir nije učinkovit.
`,
      technicalDetails: `**Frontend**
- \`LeadQueueSettings\` omogućuje prijavu, definiciju budžeta i pauziranje.
- Dashboard prikazuje poziciju u redu i statistiku (dodijeljeno, prihvaćeno, propušteno).

**Backend**
- \`leadQueueService.enqueue\` dodaje kompaniju u red; \`dispatchLead\` obrađuje novi lead.
- SLA timer i retry mehanizam (Bull queue) za obilazak reda.

**Baza**
- \`LeadQueueEntry\` (companyId, categoryId, priority, status, pausedUntil).
- \`LeadQueueAssignment\` bilježi ponude/odbijanja s timestampima.

**Integracije**
- Notification servis upozorava kada lead čeka odgovor.
- Analytics izračunava uspješnost po queueu i predlaže optimizacije.

**API**
- \`PATCH /api/providers/lead-queue\` – upravljanje postavkama.
- \`GET /api/providers/lead-queue/assignments\` – povijest dodijeljenih leadova.
- \`POST /api/providers/lead-queue/pause\` – privremeno pauziranje.
`
    },
    "Verifikacija klijenata": {
      implemented: true,
      summary: "Provjeravamo email, telefon, OIB i poslovne podatke klijenata kako bismo osigurali kvalitetu leadova.",
      details: `**Kako funkcionira**
- Klijent prolazi kroz više provjera: email link, SMS kod, OIB provjeru i provjeru poslovnog registra.
- Status verifikacije prikazuje se badgevima na lead kartici i utječe na AI score.
- Eventualne promjene (npr. istek licence tvrtke) automatski obaraju badge i šalju upozorenje.

**Prednosti**
- Više povjerenje u leadove i manji rizik gubitka vremena na neozbiljne upite.
- AI score uvažava verifikacije pa su rangiranja preciznija.

**Kada koristiti**
- Pri odlučivanju koje leadove kupiti – filtrirajte samo one s potpunim verifikacijama.
- Kod refund procesa kao dokaz da je lead bio valjan.
`,
      technicalDetails: `**Frontend**
- Badgeovi (email ✓, phone ✓, business ✓) na karticama i detaljima leada.
- Filter "Samo verificirani klijenti" u marketplaceu.

**Backend**
- \`verificationService\` sinkronizira podatke iz više izvora (email, SMS, poslovni registar).
- Event \`client.verification.updated\` recalculira lead score i obavještava marketplace.

**Baza**
- \`Verification\` (userId, channel, status, verifiedAt, expiresAt).
- \`Lead\` s cache-anim poljem \`verificationSummary\` (email, phone, company, oib).

**Integracije**
- Twilio Verify, FINA API (poslovni registar), interni OIB validator.
- Analytics mjeri konverziju verificiranih vs. neverificiranih leadova.

**API**
- \`GET /api/leads?verified=true\` – filtriranje.
- \`GET /api/leads/:id\` – vraća \`verificationStatus\` objekt.
- \`POST /api/internal/verification/refresh\` – ručni trigger osvježavanja.
`
    },
    "Pretplata na leadove": {
      implemented: true,
      summary: "Pretplatite se na plan (BASIC, PREMIUM, PRO) kako biste dobili kredite i pristup ekskluzivnim leadovima.",
      details: `**Kako funkcionira**
- Korisnik odabire plan; Stripe kreira pretplatu i mjesečno dodaje kredite na račun.
- Plan definira kvote, dostupne značajke (AI filteri, auto-buy, analitika) i SLA podršku.
- Upgrade/downgrade i otkazivanje obrađuju se prorata logikom; preostali krediti ostaju.

**Prednosti**
- Predvidljiv budžet i automatska alokacija kredita.
- Premium značajke (npr. AI filter, napredna analitika) dostupne su višim planovima.

**Kada koristiti**
- Kada redovito kupujete leadove i želite bolju cijenu/kredite.
- Kod skaliranja tima – PRO plan donosi više kredita i prioritetnu podršku.
`,
      technicalDetails: `**Frontend**
- \`SubscriptionPlans\` prikazuje usporedbu planova; checkout koristi Stripe modal.
- Dashboard prikazuje trenutni plan, preostale kredite i gumb za promjenu.

**Backend**
- \`subscriptionService\` kreira/obnavlja Stripe pretplate i emitira \`subscription.renewed\`.
- Cron job dodaje kredite na početku svakog ciklusa i generira invoice evidenciju.

**Baza**
- \`Subscription\` (companyId, plan, status, stripeSubscriptionId, currentPeriodEnd).
- \`CreditAllocation\` zapisuje alocirane kredite po ciklusu.

**Integracije**
- Stripe Billing (webhookovi za renewal, cancel, payment failure).
- Analytics mjeri ARPU i churn po planu.

**API**
- \`POST /api/subscriptions\` – aktivira plan.
- \`PATCH /api/subscriptions/:id\` – upgrade/downgrade.
- \`DELETE /api/subscriptions/:id\` – cancel at period end.
`
    },
    "Statistike uspješnosti": {
      implemented: true,
      summary: "Vidite sve svoje statistike uspješnosti - konverziju, ROI, prihod i druge metrike.",
      details: `**Kako funkcionira**
- Dashboard agregira konverziju, ROI, prihod, potrošene kredite i performanse po kategorijama/regionima.
- Period filteri (danas, mjesec, custom) i usporedba s prethodnim razdobljem pomažu pratiti trend.
- AI modul predlaže akcije (npr. povećaj budžet u kategoriji gdje ROI raste).

**Prednosti**
- Donosite odluke temeljene na podacima i brzo uočavate padove.
- Identificirate najprofitabilnije kategorije i optimizirate budžet.

**Kada koristiti**
- Dnevni/tjedni pregledi performansi i priprema izvještaja za upravu.
- Prije lansiranja novih kampanja ili promjene cijena.
`,
      technicalDetails: `**Frontend**
- \`StatisticsDashboard\` kombinira KPI kartice, Chart.js/Recharts grafove i tablice po kategorijama.
- React Query caching + shareable URL parametri (period, kategorija, regija).

**Backend**
- \`statisticsService.getPerformance\` agregira podatke iz \`LeadPurchase\`, \`Conversion\`, \`Billing\`.
- Cron \`statisticsSnapshotJob\` kreira dnevne/mjesečne snapshotove za brzi dohvat.

**Baza**
- \`PerformanceSnapshot\`, \`LeadPurchase\`, \`RevenueTransaction\`, \`ConversionStat\`.
- Materijalizirani view \`PerformanceTrendView\` za grafove.

**Integracije**
- Stripe webhookovi i CRM integracije dopunjuju podatke o ostvarenom prihodu.
- Analytics modul koristi iste metrike za benchmark partnera.

**API**
- \`GET /api/director/statistics?from=&to=&categoryId=\`.
- \`GET /api/director/statistics/top-categories\` – najprofitabilnije kategorije.
- \`POST /api/director/statistics/export\` – CSV/PDF export.
`
    },
    "Pozicija u redu čekanja": {
      implemented: true,
      summary: "Vidite svoju poziciju u redu čekanja za svaku kategoriju - znate koliko vas još čeka prije vas.",
      details: `**Kako funkcionira**
- Dashboard reda prikazuje trenutnu poziciju i ukupan broj partnera u svakoj kategoriji.
- Pozicija se automatski ažurira kada netko ispred prihvati/odbije lead ili pauzira red.
- Možete pregledati povijest pozicija i procijenjeno vrijeme do sljedećeg leada.

**Prednosti**
- Transparentan pregled koliko ste blizu novim leadovima.
- Lakše planiranje resursa i budžeta.

**Kada koristiti**
- Prilikom procjene napretka queue strategije.
- Kad odlučujete pauzirati ili proširiti kategorije radi više leadova.
`,
      technicalDetails: `**Frontend**
- \`LeadQueueDashboard\` prikazuje poziciju (npr. "3/15"), trend i procijenjeno vrijeme.
- Real-time update putem WebSocket eventa \`queue.position.updated\`.

**Backend**
- \`leadQueueService.getPositions\` računa poziciju koristeći window funkcije/COUNT.
- Event \`lead.queue.updated\` emitira promjene pozicije svim sudionicima.

**Baza**
- \`LeadQueueEntry\` polja \`position\`, \`joinedAt\`, \`pausedUntil\`.
- View \`LeadQueuePositionView\` koristi \`ROW_NUMBER() OVER (PARTITION BY categoryId ORDER BY joinedAt)\`.

**Integracije**
- Analytics modul mjeri prosječno vrijeme čekanja i daje preporuke.
- Notification servis šalje upozorenja kada ste blizu vrha reda.

**API**
- \`GET /api/leads/queue/positions\` – vraća pozicije (categoryId, position, total, etaMinutes).
- WebSocket kanal \`queue\` za push ažuriranja.
- \`POST /api/leads/queue/refresh\` – ručni recompute (admin).
`
    },
    "Statusi u redu (WAITING, OFFERED, ACCEPTED, DECLINED, EXPIRED, SKIPPED)": {
      implemented: true,
      summary: "Leadovi prolaze kroz statusne faze koje prikazuju napredak dodjele i reakciju providera.",
      details: `**Kako funkcionira**
- WAITING: lead čeka na prvog kandidata.
- OFFERED: lead je ponuđen provideru i čeka odgovor unutar SLA.
- ACCEPTED: provider je prihvatio lead i dobio kontakt.
- DECLINED: provider ga je odbio i lead prelazi na sljedećeg.
- EXPIRED: provider nije reagirao u roku pa se lead vraća u queue.
- SKIPPED: provider je preskočen (npr. zbog neaktivnosti ili deaktivacije).

**Prednosti**
- Transparentan lifecycle koji svi akteri mogu pratiti.
- Automatski mehanizmi vraćaju leadove u promet bez ručnog nadzora.

**Kada koristiti**
- Monitoring operacija i SLA.
- Analiza performansi (koliko leadova prelazi u EXPIRED/DECLINED).
`,
      technicalDetails: `**Frontend**
- Status badge i timeline u listi leadova.
- Filteri po statusu za brzu analizu.

**Backend**
- \`leadQueueService.updateStatus\` i eventovi \`lead.status.changed\`.
- SLA job provjerava isteke i označava EXPIRED.

**Baza**
- \`LeadQueue\` i \`LeadStatusHistory\` tablice.
- Indeksi po statusu i vremenu za brza izvješća.

**Integracije**
- Notification servis za OFFERED i EXPIRED status.
- Analytics izvještava postotke po statusima.

**API**
- \`GET /api/leads/:id/status\` – vraća aktualni status i povijest.
`
    },
    "Automatska distribucija leadova": {
      implemented: true,
      summary: "Leadovi se automatski dijele providerima u redu čekanja - nema potrebe za ručnom intervencijom.",
      details: `**Kako funkcionira**
- Kad se lead objavi, engine pronalazi relevantni red i nudi lead prvom aktivnom članu.
- SLA timer prati reakciju i po isteku automatski dodjeljuje sljedećem u redu.
- Distribucija je transakcijska – lead se zaključava čim ga provider prihvati.

**Prednosti**
- Ravnopravna i brza raspodjela bez ručnog rada.
- Leadovi ne stoje neiskorišteni, što poboljšava konverziju.

**Kada koristiti**
- Standardni način rada za partnere u queue programu.
- Aktivirajte/paudirajte prema raspoloživosti tima.
`,
      technicalDetails: `**Frontend**
- Informativni banneri i notifications kada lead stigne u queue.
- Nema dodatnog UI-ja osim statusa i pozicije.

**Backend**
- \`leadQueueDispatcher\` worker (Bull/Redis) obrađuje nove leadove.
- SLA cron job prati OFFERED statuse i pokreće retry loop.

**Baza**
- \`LeadQueueAssignment\` čuva svaku ponudu s timestamps i odgovorom.
- Indeksi po statusu i expiresAt za brzu obradu cron joba.

**Integracije**
- Notification servis (email/push/SMS) obavještava providere.
- Analytics izračunava responzivnost i uspješnost automatizacije.

**API**
- \`POST /api/leads/:leadId/distribute\` – ručni trigger (admin).
- Event webhook \`lead.created\` pokreće dispatcher.
- \`POST /api/leads/:leadId/queue/skip\` – ručno preskakanje (support).
`
    },
    "Rok za odgovor (24h)": {
      implemented: true,
      summary: "Provideri imaju 24 sata da reagiraju na ponuđeni lead prije nego što se vrati u queue.",
      details: `**Kako funkcionira**
- Kad lead prijeđe u OFFERED status, pokreće se timer od 24 sata.
- Provider može kliknuti INTERESTED ili NOT_INTERESTED; sustav bilježi vrijeme.
- Ako odgovora nema, lead se označi EXPIRED i vraća na sljedećeg kandidata (mogući refund).

**Prednosti**
- Održava queue živim i sprječava blokadu leadova.
- Potiče providere na brzu reakciju i bolju reputaciju.

**Kada koristiti**
- Standardni queue tok; SLA se može skratiti/produžiti po kategoriji.
- Eskalacije kad provider kasni s odgovorima.
`,
      technicalDetails: `**Frontend**
- Countdown indikator i push notifikacije.
- Reminder email/SMS prije isteka roka.

**Backend**
- \`leadQueueService.startSlaTimer\` i scheduler koji označava EXPIRED.
- Refund servis se poziva ako lead istekne bez odgovora.

**Baza**
- \`LeadQueue\` polje \`expiresAt\`.
- \`LeadResponseMetric\` pohranjuje stvarno vrijeme odgovora.

**Integracije**
- Notification servis (email/push/SMS) za remindere.
- Analytics korelira brzinu odgovora s konverzijom.

**API**
- \`GET /api/leads/:id/queue\` – prikazuje preostalo vrijeme.
`
    },
    "Odgovori providera (INTERESTED, NOT_INTERESTED, NO_RESPONSE)": {
      implemented: true,
      summary: "Provideri mogu prihvatiti, odbiti ili ne odgovoriti na lead; svaki izbor ima posljedice.",
      details: `**Kako funkcionira**
- INTERESTED: provider prihvaća lead, dobiva kontakt i lead izlazi iz queuea.
- NOT_INTERESTED: lead se vraća u queue bez penalizacije reputacije.
- NO_RESPONSE: SLA ističe, lead se označi EXPIRED i reputacija može pasti.
- Sustav bilježi svaki odgovor radi analitike i reputacijskog scoringa.

**Prednosti**
- Jednostavan i transparentan mehanizam upravljanja leadovima.
- Podaci o odgovorima pomažu optimizaciji distribucije i reputacije.

**Kada koristiti**
- Svaki puta kada provider dobije lead u queue-u.
- Analiza razloga odbijanja i optimizacija kategorija.
`,
      technicalDetails: `**Frontend**
- CTA gumbi za INTERESTED/NOT_INTERESTED i komentar (opcijski razlog).
- Badge prikazuje posljednji odgovor i omogućuje filtriranje.

**Backend**
- \`leadResponseService.record\` sprema odgovor, emitira event i pokreće SLA logiku.
- Reputacijski modul ažurira metrike prema odgovoru.

**Baza**
- \`LeadResponseEvent\` (leadId, providerId, response, respondedAt, reason).
- \`ProviderReputation\` se ažurira na temelju response statistike.

**Integracije**
- Notification servis obavještava klijenta kada je lead prihvaćen.
- Analytics izvještaji (response rate, reason codes).

**API**
- \`POST /api/leads/:id/respond\` – prima response.
- \`GET /api/leads/responses\` – lista odgovora po filterima.
`
    },
    "Preskakanje neaktivnih providera": {
      implemented: true,
      summary: "Provideri koji ne reagiraju u roku automatski se preskaču kako red ne bi stajao.",
      details: `**Kako funkcionira**
- Nakon isteka roka (zadano 24 h) lead prelazi u status SKIPPED i nudi se sljedećem u redu.
- Neaktivni provider dobiva obavijest i može naknadno prilagoditi postavke (pauza, filteri).
- Ponavljana neaktivnost utječe na prioritet i reputaciju u queueu.

**Prednosti**
- Red ostaje fluidan i leadovi brzo nalaze aktivne partnere.
- Automatski se identificiraju partneri kojima je potrebna podrška ili pauza.

**Kada koristiti**
- Standardno u queue modu; nema ručne intervencije.
- Admini koriste izvještaj o preskočenim leadovima za coaching partnera.
`,
      technicalDetails: `**Frontend**
- Banner obavještava pružatelja da je preskočen i nudi link na postavke.
- Statistika prikazuje broj preskakanja unutar perioda.

**Backend**
- Scheduler označava SKIPPED i pomiče providerovu poziciju (npr. na kraj reda).
- Event \`lead.queue.skipped\` obavještava analytics i notifikacijski servis.

**Baza**
- \`LeadQueueAssignment\` polja \`skipped\`, \`skipReason\`.
- \`ProviderQueueStats\` agregira skip-count po periodu.

**Integracije**
- Notification servis šalje email/push s preporukama (pauziranje, ažuriranje kategorija).
- Analytics modul mjeri udio preskočenih leadova po partneru.

**API**
- \`POST /api/leads/:leadId/queue/skip\` – ručni skip (support).
- \`GET /api/providers/queue-stats\` – vraća broj preskočenih leadova.
- WebSocket event \`lead.queue.skipped\` – real-time informacija.
`
    },
    "Queue scheduler (provjera svakih sat vremena)": {
      implemented: true,
      summary: "Scheduler svakih sat vremena rekalibrira queue, dodjeljuje leadove i rješava istekle statuse.",
      details: `**Kako funkcionira**
- Cron job se pokreće na satnoj bazi i iz reda uzima leadove koji čekaju dodjelu.
- Leadovi se nude kandidatima prema rankingu, a statusi koji su istekli (SLA) ažuriraju se na EXPIRED.
- Neaktivni kandidati se preskaču, a eventualni refund okida se automatski.

**Prednosti**
- Distribucija leadova radi neovisno o ručnoj intervenciji.
- Queue ostaje čist bez zastalih leadova.

**Kada koristiti**
- Neprekidno u pozadini kao dio standardnog lead distribucijskog procesa.
- Kod povećane potražnje (burst mod) scheduler se može pokretati češće.
`,
      technicalDetails: `**Frontend**
- Provider vidi real-time osvježavanje queue pozicija nakon svake iteracije.

**Backend**
- \`leadQueueScheduler.run\` dohvaća leadove, poziva \`leadQueueService.dispatch\` i obrađuje SLA expiracije.
- Podržava distributed lock (Redis) radi jedinstvene egzekucije.

**Baza**
- \`LeadQueue\` i \`LeadStatusHistory\` se ažuriraju batch operacijama.

**Integracije**
- Notification servis šalje obavijesti providerima kad lead stigne na red.
- Refund servis okida povrate za neodgovorene leadove.

**API**
- Interni endpoint/cron trigger (npr. \`POST /api/internal/queue/run\`).
`
    },
    "Notifikacije za nove leadove u redu": {
      implemented: true,
      summary: "Primajte obavijest svaki put kada vam sustav ponudi novi lead u redu čekanja.",
      details: `**Kako funkcionira**
- Kada lead dođe na vaš red, sustav šalje in-app, email i (opcionalno) SMS obavijest.
- Notifikacija sadrži ključne podatke (naslov, budžet, lokacija) i countdown do isteka.
- Klik vas vodi na detalje leada gdje birate odgovor.

**Prednosti**
- Ne propuštate prilike čak ni kada niste na platformi.
- Podsjetnici osiguravaju pravovremenu reakciju unutar SLA-a.

**Kada koristiti**
- Defaultno za sve članove reda; možete prilagoditi kanale ili digest frekvenciju.
- Aktivirajte SMS za kritične kampanje kada želite garantiranu reakciju.
`,
      technicalDetails: `**Frontend**
- Notification feed i push toast s CTA "Pogledaj lead".
- Email/SMS predlošci s linkom i countdownom.

**Backend**
- \`leadQueueNotificationService.sendOffer\` kreira notifikacije i planira podsjetnike.
- WebSocket event \`lead.queue.offered\` obavještava aktivne sesije.

**Baza**
- \`Notification\` zapisi type='LEAD_QUEUE_OFFERED'.
- \`NotificationPreference\` definira kanale (in-app/email/SMS) i frekvenciju.

**Integracije**
- Email (SendGrid/SES) i SMS (Twilio) kanali.
- Analytics prati response time nakon obavijesti.

**API**
- \`GET /api/notifications?type=LEAD_QUEUE_OFFERED\` – pregled.
- \`PATCH /api/notification-preferences\` – upravljanje kanalima.
- WebSocket \`lead.queue.offered\` – real-time alert.
`
    },
    "Pregled mojih leadova u redu": {
      implemented: true,
      summary: "Centralizirani prikaz svih leadova koji su vam ponuđeni kroz red čekanja.",
      details: `**Kako funkcionira**
- Tablica prikazuje sve leadove koji su vam ikad ponuđeni uz status, rok i odgovor.
- Filtri po statusu, kategoriji i datumu pomažu fokusirati se na aktivne prilike.
- Moguće je otvoriti lead, odgovoriti ili pregledati povijest komunikacije.

**Prednosti**
- Potpun nadzor nad pipelineom leadova iz queuea.
- Lako prepoznajete leadove koji traže hitan odgovor.

**Kada koristiti**
- Svakodnevno za optimizaciju reakcije i praćenje rezultata queue strategije.
- Kod internog izvještavanja (npr. koliko leadova je prihvaćeno/odbijeno).
`,
      technicalDetails: `**Frontend**
- \`LeadQueueOverview\` (DataGrid) s filterima i quick akcijama (odgovori, otvori detalje).
- Badge i countdown za leadove koji uskoro istječu.

**Backend**
- \`leadQueueService.listAssignments\` vraća paginiranu povijest uz agregate.
- Export endpoint generira CSV za offline analizu.

**Baza**
- \`LeadQueueAssignment\` čuva status, vremena i odgovore.
- Indeksi po providerId, status, offeredAt.

**Integracije**
- Analytics generira funnel (offered → accepted) i preporuke.
- Notification servis omogućuje bulk podsjetnike za istaknute leadove.

**API**
- \`GET /api/providers/lead-queue/assignments\` – lista s filtrima.
- \`GET /api/providers/lead-queue/export\` – CSV export.
- \`POST /api/providers/lead-queue/mark-viewed\` – označi lead kao pregledan.
`
    },
    "Statistike queue sustava": {
      implemented: true,
      summary: "Pratite metrike reda čekanja – protok leadova, vrijeme odgovora i konverziju.",
      details: `**Kako funkcionira**
- Sustav kontinuirano bilježi leadove kroz queue (offered, accepted, skipped) i vrijeme reakcije.
- Dashboardi prikazuju KPI-je (lead throughput, win-rate, prosječno vrijeme odgovora, % preskočenih).
- Segmentacija po kategoriji/regionu pomaže otkriti uska grla.

**Prednosti**
- Transparentan uvid u učinkovitost automatizirane distribucije.
- Olakšava optimizaciju SLA-ova, queue pravila i coaching partnera.

**Kada koristiti**
- Tjedni/ mjesečni pregledi performansi queue sustava.
- Kod dijagnostike (npr. pad konverzije u određenoj kategoriji).
`,
      technicalDetails: `**Frontend**
- \`QueueAnalyticsDashboard\` prikazuje grafikone (throughput, response time, acceptance rate) te tablice po kategorijama.
- React Query + shareable filter parametri (period, kategorija, regija).

**Backend**
- \`queueStatisticsService\` agregira podatke iz \`LeadQueueAssignment\`, \`LeadPurchase\`, \`Notification\`.
- Snapshot job kreira dnevne/mjesečne agregate radi brzog dohvaćanja.

**Baza**
- \`QueuePerformanceSnapshot\`, \`LeadQueueAssignment\`, \`LeadPurchase\`.
- Materijalizirani view \`QueueKpiView\` za grafove.

**Integracije**
- BI alat (Looker/Metabase) koristi iste agregate za enterprise izvještaje.
- Alerting (PagerDuty/Slack) kad KPI padne ispod definiranih pragova.

**API**
- \`GET /api/director/queue-statistics?from=&to=&categoryId=\`.
- \`GET /api/director/queue-statistics/top-categories\`.
- \`POST /api/director/queue-statistics/export\` – CSV/PDF.
`
    },
    "Red čekanja za leadove (LeadQueue)": {
      implemented: true,
      summary: "LeadQueue distribucijski engine dodjeljuje leadove prema reputaciji, prioritetima i redoslijedu u redu.",
      details: `**Kako funkcionira**
- Novi lead ulazi u queue i dobiva listu kandidata prema lokaciji, planu i reputaciji.
- Kandidati se pozivaju redom; svaki ima ograničen SLA za odgovor (npr. 24 h).
- Nakon odgovora (INTERESTED/NOT_INTERESTED) lead prelazi na sljedeći korak ili sljedećeg kandidata.

**Prednosti**
- Fer distribucija uz nagrađivanje aktivnih i kvalitetnih providera.
- Automatski proces smanjuje ručni rad i ubrzava dodjelu.

**Kada koristiti**
- Standardna distribucija leadova za providere.
- Kampanje gdje se leadovi nude kroz queue umjesto aukcije.
`,
      technicalDetails: `**Frontend**
- Queue UI prikazuje poziciju, preostalo vrijeme i status svakog leada.
- Notifikacije i countdown pomažu providerima reagirati na vrijeme.

**Backend**
- \`leadQueueService.enqueue/dequeue\` upravlja kandidatom.
- Scoring engine kombinira reputaciju, plan, lokaciju i dostupnost.

**Baza**
- \`LeadQueue\` (leadId, providerId, position, status, expiresAt).
- \`LeadCandidateScore\` čuva rangiranje kandidata.

**Integracije**
- Notification servis šalje push/email kad lead dođe na red.
- Analytics mjeri uspješnost queue distribucije.

**API**
- \`GET /api/leads/queue\` – prikaz trenutačne pozicije.
- \`POST /api/leads/:id/queue/recalculate\` – admin reranking.
`
    },
    "Refund kredita (vraćanje internih kredita)": {
      implemented: true,
      summary: "Refund leadova ili pretplata vraća potrošene kredite natrag na saldo bez čekanja bankovnih transfera.",
      details: `**Kako funkcionira**
- Kad se lead ili usluga označi za refund, sustav stvara transakciju tipa REFUND i povećava kreditni saldo.
- Refund je odmah vidljiv u povijesti i korisnik može ponovno koristiti kredite.
- Proces je automatiziran za pravila (neodgovoreni lead, spor, ručni zahtjev).

**Prednosti**
- Nema čekanja na povrat sredstava.
- Potrošeni krediti ponovno su dostupni za nove leadove.

**Kada koristiti**
- Nakon odobrenog refund zahtjeva ili automatskog SLA refund-a.
- Kod administrativnih podešavanja salda.
`,
      technicalDetails: `**Frontend**
- Povijest transakcija označava refund stavke i saldo nakon povrata.
- Dashboard prikazuje banner kad je refund izvršen.

**Backend**
- \`refundService.creditRefund\` kreira kreditnu transakciju i emituje \`refund.completed\`.
- Pravila (rule engine) odlučuju pokreće li se refund automatski.

**Baza**
- \`CreditTransaction\` (type=REFUND, referenceId, amount, balanceAfter).
- Audit tablica bilježi razlog refund-a.

**Integracije**
- Notification servis šalje potvrdu o refundu.
- Analytics prati učestalost refundova po kategoriji.

**API**
- \`POST /api/refunds/credit\` – ručno pokretanje (admin).
- \`GET /api/credits/history?type=REFUND\` – pregled povrata.
`
    },
    "Stripe Payment Intent refund API (PSD2 compliant)": {
      implemented: true,
      summary: "Kartične uplate refundiramo kroz Stripe Payment Intent API u skladu s PSD2 regulativom.",
      details: `**Kako funkcionira**
- Ako je lead/pretplata plaćena karticom, refund se pokreće pozivom Stripe Refund API-ja nad originalnim Payment Intentom.
- Stripe vraća sredstva na istu karticu, a status se sinkronizira s našim sustavom.
- Korisnik dobiva potvrdu i može pratiti stanje kroz povijest transakcija.

**Prednosti**
- Regulirano i sigurno vraćanje sredstava.
- Minimalan ručni rad – proces je potpuno automatiziran.

**Kada koristiti**
- Kad je izvor plaćanja kartica (pretplate, jednokratna kupnja leadova).
- Kod chargeback-a ili sporova rješavanih u korist korisnika.
`,
      technicalDetails: `**Frontend**
- Status refund-a prikazan je uz kartične transakcije i označen “Refunded to card”.

**Backend**
- \`stripeRefundService.refundPaymentIntent\` poziva Stripe API s iznosom i metapodacima.
- Webhook \`charge.refunded\`/\`payment_intent.canceled\` potvrđuje završetak.

**Baza**
- \`PaymentLog\` zapisuje refund event (amount, stripeRefundId, status).
- \`CreditTransaction\` se ažurira za konzistentnost povijesti.

**Integracije**
- Stripe Payment Intents API, webhook handler.
- Accounting sinkronizira refund u financijske izvještaje.

**API**
- \`POST /api/refunds/stripe\` (internal) – pokreće refund.
- Webhook endpoint \`/api/stripe/webhook\` – potvrđuje rezultat.
`
    },
    "Automatski odabir refund metode (Stripe API ili interni krediti)": {
      implemented: true,
      summary: "Engine bira refund kanal prema originalnom načinu plaćanja (kartica vs interni krediti).",
      details: `**Kako funkcionira**
- Sustav provjerava je li transakcija nastala kartičnim plaćanjem ili potrošnjom kredita.
- Za kartične uplate pokreće Stripe refund; za kreditne kupnje vraća kredite.
- Rezultat i način povrata prikazuju se korisniku i u povijesti transakcija.

**Prednosti**
- Eliminira ručni odabir metode refund-a.
- Osigurava da korisnik dobije povrat na najprikladniji način.

**Kada koristiti**
- Svaki put kad se trigira refund (automatski ili ručno odobren).
- Kod kombiniranih plaćanja (djelomično kartica, djelomično krediti) – logika podržava split refund.
`,
      technicalDetails: `**Frontend**
- Detalj refund-a prikazuje metodu (“Refund na karticu” ili “Krediti vraćeni”).

**Backend**
- \`refundService.process\` analizira originalnu transakciju i delegira na Stripe ili kreditni refund.
- Podržava parti-refund i rounding logiku.

**Baza**
- \`RefundRequest\` čuva referencu na izvor plaćanja i ishod.
- \`CreditTransaction\`/\`PaymentLog\` ažurirani su ovisno o metodi.

**Integracije**
- Stripe API, kreditni ledger, notification servis.
- Analytics segmentira refundove po metodi.

**API**
- \`POST /api/refunds\` – generički endpoint koji poziva procesornu logiku.
`
    },
    "Refund ako klijent ne odgovori u roku": {
      implemented: true,
      summary: "Ako klijent ne reagira u definiranom vremenu, lead se automatski refundira.",
      details: `**Kako funkcionira**
- Nakon kupnje lead ulazi u monitoring (npr. 48 h). Ako nema potvrde kontakta, pokreće se automatski refund.
- Sustav provjerava komunikacijske događaje (poziv, SMS, email) i bilježi pokušaje.
- Refund vraća kredite ili kartičnu uplatu, a lead dobiva status REFUNDED (NO_RESPONSE).

**Prednosti**
- Sigurnosna mreža za partnere kod neodgovorenih leadova.
- Minimalan ručni rad – proces je automatiziran i auditiran.

**Kada koristiti**
- Aktivno za sve ekskluzivne leadove; parametri (rok, dokaz kontakta) podešavaju se po planu.
- Kod manualne eskalacije – podrška može vidjeti je li automatski refund odrađen.
`,
      technicalDetails: `**Frontend**
- Lead detalji prikazuju countdown do automatskog refunda.
- Notifikacije obavještavaju partnera prije isteka i nakon refunda.

**Backend**
- \`leadFollowupService\` bilježi pokušaje kontakta.
- Cron job \`leadAutoRefundJob\` detektira neaktivnost i poziva \`refundService\`.

**Baza**
- \`LeadEngagement\` (leadId, contactAttemptAt, channel, success).
- \`LeadPurchase\` polja \`autoRefundAt\`, \`autoRefundReason\`.

**Integracije**
- Telephony/SMS provider dostavlja logove kontakata.
- Notification servis javlja rezultat i razlog refunda.

**API**
- \`POST /api/leads/:leadId/contact-attempt\` – logira kontakt (za ručne evidencije).
- \`GET /api/leads/:leadId/refund-status\` – prikazuje je li auto-refund zakazan/izvršen.
- \`POST /api/leads/:leadId/refund/cancel\` – otkaz automatskog refunda (admin).*`
    },
    "Razlozi za refund (klijent ne odgovori, itd.)": {
      implemented: true,
      summary: "Refund se automatski ili ručno odobrava prema pravilima (neodgovor, neaktivnost, ručni zahtjev).",
      details: `**Kako funkcionira**
- Pravila definiraju okidače: npr. klijent ne odgovori u definiranom roku, lead ostane neaktivan 48 h, ili korisnik podnese prigovor.
- Sustav evaluira stanje i odobrava/refuzira refund, uz mogućnost ručnog override-a od strane admina.
- Svaki refund bilježi razlog i referencu na lead ili pretplatu.

**Prednosti**
- Pravedan i transparentan sustav povrata.
- Smanjuje potrebu za podrškom jer se većina slučajeva rješava automatski.

**Kada koristiti**
- Kod SLA propusta s klijentske strane.
- Kad provider prijavi problem (npr. lažni lead, neispravan kontakt).
`,
      technicalDetails: `**Frontend**
- Formular za ručni refund nudi izbor razloga i upload dokaza.
- Status refund zahtjeva prikazuje se u profilu.

**Backend**
- \`refundRuleEngine.evaluate\` provodi automatska pravila.
- \`refundService.requestManual\` kreira zahtjev za admin review ako je potrebno.

**Baza**
- \`RefundRequest\` (leadId, reason, status, resolvedBy).
- \`RefundRuleExecution\` logira evaluacije pravila.

**Integracije**
- Notification servis obavještava korisnika o odluci.
- Analytics izvještava učestalost i razloge refundova.

**API**
- \`POST /api/refunds/request\` – ručni zahtjev.
- \`GET /api/refunds\` – pregled zahtjeva i statusa.
`
    },
    "Ručno zatraživanje refund-a": {
      implemented: true,
      summary: "Zatražite refund za lead preko formulara s odabirom razloga i dodatnim napomenama.",
      details: `**Kako funkcionira**
- U detaljima leada kliknete "Zatraži refund", odaberete razlog i po želji dodate napomenu/dokaz.
- Zahtjev se šalje podršci ili automatskom motoru koji donosi odluku.
- Odluka i povrat prikazuju se u povijesti leadova/kredita.

**Prednosti**
- Jednostavan proces za rješavanje spornih leadova.
- Standardizirani razlozi olakšavaju brzo odobrenje.

**Kada koristiti**
- Kada lead ne ispunjava uvjete, a auto-refund nije pokrenut.
- Nakon komunikacije s klijentom koja potvrđuje problem (npr. pogrešan broj).
`,
      technicalDetails: `**Frontend**
- \`RefundRequestModal\` s dropdownom razloga, textarea napomenom i uploadom dokaza.
- Status zahtjeva (PENDING/APPROVED/REJECTED) prikazan u \`LeadDetail\` i kreditnoj povijesti.

**Backend**
- \`refundRequestService.create\` validira input i stvara ticket za podršku.
- Workflow engine određuje auto-odobrenje ili ručni review.

**Baza**
- \`LeadRefundRequest\` (reason, note, attachments, status, createdBy, reviewedBy).
- \`LeadPurchase\` povezuje refund sa statusom REFUNDED.

**Integracije**
- Notification servis šalje potvrdu o zaprimljenom zahtjevu i konačnoj odluci.
- Helpdesk (Jira/Zendesk) može primiti ticket putem webhooka.

**API**
- \`POST /api/leads/:leadId/refund-requests\` – slanje zahtjeva.
- \`GET /api/leads/:leadId/refund-requests\` – pregled.
- \`POST /api/leads/:leadId/refund-requests/:id/decision\` – odluka (admin).
`
    },
    "Povijest refund transakcija (CreditTransaction tip REFUND)": {
      implemented: true,
      summary: "Sve refund transakcije evidentirane su u kreditnom leđeru s detaljima i povezanim referencama.",
      details: `**Kako funkcionira**
- Svaki refund generira zapis u \`CreditTransaction\` s tipom REFUND i metapodacima (lead, razlog, metoda).
- Povijest se može filtrirati, izvesti i koristiti za računovodstvo.
- Statusi (pending, completed) prikazuju napredak procesa.

**Prednosti**
- Potpuna revizijska evidencija za interne i regulatorne potrebe.
- Jednostavno filtriranje i izvoz za financijske timove.

**Kada koristiti**
- Pregled prethodnih refundova i priprema izvještaja.
- Verifikacija pojedinih refund slučajeva.
`,
      technicalDetails: `**Frontend**
- Povijest transakcija ima filter “Refund” i detaljni modal s razlogom i referencama.
- Export opcije (CSV/PDF) uključuju refund zapise.

**Backend**
- \`transactionService.list\` podržava filtriranje po tipu i razlozima.
- Audit log bilježi promjene ako se refund ručno korigira.

**Baza**
- \`CreditTransaction\` (type ENUM uključuje REFUND, metadata JSON).
- \`RefundRequest\` povezana s transakcijom za dodatne podatke.

**Integracije**
- Accounting/ERP export koristi iste podatke.
- Notification servis šalje potvrdu o dovršenom refundu.

**API**
- \`GET /api/credits/history?type=REFUND\` – filtrirani prikaz.
- \`GET /api/credits/export\` – uključuje refund transakcije.
`
    },
    "Status refund-a (REFUNDED)": {
      implemented: true,
      summary: "Status REFUNDED označava da je povrat sredstava dovršen i reflektiran u saldu ili na kartici.",
      details: `**Kako funkcionira**
- Nakon uspješnog završetka refund procesa (krediti ili Stripe), transakcija i pripadajući lead dobivaju status REFUNDED.
- Korisnik dobiva obavijest, a lead se oslobađa ili ostaje u evidenciji kao zatvoren slučaj.
- Status je vidljiv u povijesti transakcija, detalju leada i admin panelu.

**Prednosti**
- Jasna potvrda da je proces završen.
- Pomaže u transparentnosti prema korisniku i internim timovima.

**Kada koristiti**
- Praćenje završenih refundova.
- Usklađivanje financija i korisničke podrške.
`,
      technicalDetails: `**Frontend**
- Badge/refund indikator uz transakciju i lead detalj.
- Timeline događaja uključuje "Refunded" korak.

**Backend**
- \`refundService.markCompleted\` postavlja status i emitira \`refund.completed\` event.
- Sync s reputacijom i trust scoreom ako je refund promijenio bodove.

**Baza**
- \`RefundRequest.status\` = REFUNDED, povezano s \`CreditTransaction\`.
- Audit log bilježi vrijeme i korisnika koji je potvrdio.

**Integracije**
- Notification/email servis potvrđuje završetak korisniku.
- Analytics bilježi vrijeme od zahtjeva do izvršenja.

**API**
- \`GET /api/refunds/:id\` – prikazuje status i detalje.
- \`POST /api/refunds/:id/complete\` – admin/manual potvrda ako je potrebno.
`
    },
    "Oslobađanje leada nakon refund-a (lead se vraća na tržište)": {
      implemented: true,
      summary: "Nakon odobrenog refund-a lead se automatski vraća u marketplace kako bi ga mogli preuzeti drugi provideri.",
      details: `**Kako funkcionira**
- Kada refund završi, lead gubi vezu s prethodnim providerom i prelazi u status AVAILABLE.
- Lead se reindeksira u marketplaceu i ponovno ulazi u queue ili aukciju.
- Klijent dobiva informaciju da je lead ponovno aktivan (ako je i dalje relevantan).

**Prednosti**
- Leadovi ne ostaju blokirani i zadržavaju vrijednost.
- Povećava ukupnu stopu konverzije jer više providera ima priliku reagirati.

**Kada koristiti**
- Automatski za sve refundirane leadove.
- Ručno (admin) kada se lead želi ponovno aktivirati nakon specifične intervencije.
`,
      technicalDetails: `**Frontend**
- Marketplace lista označava da je lead ponovno dostupan uz napomenu o prethodnom refundu.
- Provider koji je dobio refund vidi lead u povijesti s oznakom "Released".

**Backend**
- \`leadReleaseService.releaseAfterRefund\` uklanja providerId i emitira \`lead.released\` event.
- Queue/Maching servis ponovno dodaje lead u distribuciju.

**Baza**
- \`Lead\` polja \`status\`, \`releasedAt\`, \`releasedReason\`.
- Audit tablica \`LeadReleaseHistory\` bilježi datum i uzrok.

**Integracije**
- Notification servis obavještava relevantne providere o novoj prilici.
- Analytics prati koliko je refundiranih leadova kasnije konvertirano.

**API**
- \`POST /api/leads/:id/release\` – manuelni release (admin).
- \`GET /api/leads/:id/history\` – prikazuje događaj release/refund.
`
    },
    "Stripe refund ID tracking (stripeRefundId)": {
      implemented: true,
      summary: "Svaki kartični refund pohranjuje Stripe refund ID radi lakšeg praćenja i supporta.",
      details: `**Kako funkcionira**
- Pri pokretanju Stripe refund-a vraćeni \`stripeRefundId\` spremamo uz transakciju.
- ID je vidljiv u admin panelu i povijesti plaćanja, što olakšava komunikaciju sa Stripe supportom.
- Status refund-a periodično se sinkronizira putem Stripe webhookova.

**Prednosti**
- Transparentno praćenje kartičnih refundova.
- Brže rješavanje sporova i support upita.

**Kada koristiti**
- Provjera napretka refund-a.
- Eskalacija prema Stripe-u ili financijskim timovima.
`,
      technicalDetails: `**Frontend**
- Detalj transakcije prikazuje Stripe refund ID i link na Stripe dashboard (samo admin).

**Backend**
- \`stripeRefundService.storeRefundId\` sprema ID i status.
- Webhook \`charge.refunded\` ažurira status (pending/succeeded/failed).

**Baza**
- \`PaymentLog\` polja \`stripeRefundId\`, \`stripeRefundStatus\`.
- Audit tablica bilježi promjene statusa.

**Integracije**
- Stripe webhook handler, accounting sinkronizacija.

**API**
- \`GET /api/payments/:id\` – vraća refund ID i status.
- \`POST /api/payments/:id/sync-refund\` – forsira ponovnu sinkronizaciju (admin).
`
    },
    "Fallback na interne kredite ako Stripe refund ne uspije": {
      implemented: true,
      summary: "Ako Stripe refund ne uspije, sustav automatski vraća iznos kao interne kredite.",
      details: `**Kako funkcionira**
- Nakon pokušaja kartičnog refunda provjerava se odgovor Stripe-a.
- U slučaju greške (npr. bank/processor), refundService automatski vraća kredite na saldo.
- Korisnik dobiva obavijest s objašnjenjem i može pratiti fallback u povijesti transakcija.

**Prednosti**
- Jamči povrat sredstava bez obzira na vanjske greške.
- Smanjuje potrebu za ručnim intervencijama podrške.

**Kada koristiti**
- Automatski za sve kartične refunde; korisnik ne mora ništa dodatno poduzeti.
- Admini prate fallback slučajeve kod istrage problema sa Stripe-om.
`,
      technicalDetails: `**Frontend**
- Notifikacija i kreditna povijest pokazuju da je korišten fallback (card refund failed → credits returned).
- Status kartične transakcije prikazuje “fallback executed”.

**Backend**
- \`refundService.handleStripeFailure\` poziva \`creditService.addCredits\` i bilježi fallback reason.
- Event \`refund.fallback\` šalje informacije analyticsu i podršci.

**Baza**
- \`TransactionRefund\` status set na FAILED, \`CreditTransaction\` (type='REFUND_FALLBACK').
- Audit tablica bilježi originalni pokušaj i fallback.

**Integracije**
- Slack/Email alert za financijski tim kada se dogodi fallback.
- Analytics prati učestalost fallbackova radi koordinacije sa Stripe supportom.

**API**
- \`GET /api/director/transactions/:id\` – prikazuje fallback detalje.
- \`POST /api/admin/refunds/:id/retry\` – ručni retry card refunda (opcionalno).
- Webhook \`refund.fallback\` za notifikacije.
`
    },
    "Pregled trenutne pretplate": {
      implemented: true,
      summary: "Pregledajte aktivni plan, stanje kredita i datume obnove na jednoj stranici.",
      details: `**Kako funkcionira**
- Stranica pretplate prikazuje plan (BASIC/PREMIUM/PRO), status, period, dostupne kredite i povijest.
- Vizualni indikator upozorava kada se približava datum obnove ili nizak saldo.
- Kartica nudi quick akcije (nadogradnja, otkazivanje, promjena metode plaćanja).

**Prednosti**
- Potpuna transparentnost o planu i kreditima.
- Lakše planiranje budžeta i pravovremeno upravljanje pretplatom.

**Kada koristiti**
- Periodično provjeravati saldo kredita i status pretplate.
- Prije nadogradnje, otkazivanja ili revizije troškova.
`,
      technicalDetails: `**Frontend**
- \`SubscriptionOverview\` prikazuje KPI kartice i timeline obnove.
- React Query dohvaća podatke i osvježava nakon promjena.

**Backend**
- \`subscriptionService.getCurrent\` agregira Subscription, CreditBalance i plan benefite.
- Webhookovi (Stripe) osvježavaju podatke nakon naplate ili otkazivanja.

**Baza**
- \`Subscription\`, \`CreditBalanceSnapshot\`, \`PlanFeature\`.
- Materijalizirani view \`SubscriptionOverviewView\` za brzi dohvat.

**Integracije**
- Stripe subscription API, email podsjetnici za obnovu.
- Analytics prati ARPU i status pretplata.

**API**
- \`GET /api/subscriptions/me\` – trenutna pretplata.
- \`GET /api/subscriptions/history\` – povijest promjena.
- \`POST /api/subscriptions/refresh\` – ručni refresh iz Stripe-a (admin).
`
    },
    "Dostupni planovi (BASIC, PREMIUM, PRO)": {
      implemented: true,
      summary: "Tri plana pretplate s različnim kreditima i funkcionalnostima – odaberite onaj koji vam odgovara.",
      details: `**Kako funkcionira**
- Plan kartice uspoređuju broj kredita, cijenu i uključene značajke (npr. AI filter, ROI dashboard, auto-buy).
- Klikom na "Pretplati se" otvara se Stripe checkout s odabranim planom.
- Plan se može kasnije nadograditi/downgradati prema potrebama.

**Prednosti**
- Fleksibilnost – različiti planovi za različite veličine timova.
- Jasan pregled benefita i cijena.

**Kada koristiti**
- Kod onboardinga i procjene potrebnog volumena leadova.
- Pri reviziji kada treba više kredita ili naprednih značajki.
`,
      technicalDetails: `**Frontend**
- \`PlanComparison\` komponenta prikazuje planove i CTA gumbe.
- Tooltipovi objašnjavaju razlike u funkcionalnostima.

**Backend**
- \`planService.list\` vraća konfiguraciju planova iz baze/konfiguracije.
- Stripe produkti/cijene sinkronizirani s internim planovima.

**Baza**
- \`SubscriptionPlan\` (code, price, credits, features).
- \`PlanFeature\` mapira plan na dostupne funkcije.

**Integracije**
- Stripe Price/Plan ID-evi povezani s internim kodovima.
- Onboarding emailovi preporučuju plan na temelju profila korisnika.

**API**
- \`GET /api/subscriptions/plans\` – lista planova i benefita.
- \`POST /api/subscriptions\` – aktivacija plana.
- \`GET /api/subscriptions/plans/:code\` – detalji pojedinog plana.
`
    },
    "Nadogradnja pretplate": {
      implemented: true,
      summary: "Nadogradite na viši plan u bilo kojem trenutku uz proporcionalnu naplatu (prorated billing). Sustav automatski izračunava preostale dane i naplaćuje samo razliku.",
      details: `**✅ POTPUNO IMPLEMENTIRANO**: Prorated billing je potpuno implementiran. Sustav automatski izračunava preostale dane u trenutnom ciklusu i naplaćuje samo proporcionalnu razliku između trenutnog i novog plana.

**Kako funkcionira**
- **Upgrade**: Ako korisnik ima aktivnu plaćenu pretplatu i želi upgrade na viši plan, sustav izračunava:
  - Preostale dane u trenutnom ciklusu
  - Dnevnu cijenu trenutnog i novog plana
  - Proporcionalnu razliku = (novaCijena - trenutnaCijena) × (preostaliDani / 30)
  - Naplaćuje se samo razlika, ne puna cijena novog plana
- **Downgrade**: Ako korisnik želi downgrade na niži plan, cijena je 0€ (ne naplaćuje se), ali se zadržava postojeći expiresAt
- Novi plan i dodatni krediti aktiviraju se odmah; status pretplate se ažurira.
- Postojeći expiresAt se zadržava za prorated billing (ne resetira se na novi mjesec).

**Prednosti**
- Fleksibilnost rasta bez čekanja do kraja ciklusa.
- Pravedna naplata - korisnik plaća samo za preostale dane.
- Dodatni krediti i funkcionalnosti odmah dostupni.
- Transparentan izračun - korisnik vidi točno koliko će platiti.

**Kada koristiti**
- Kada trošite kredite brže od plana ili trebate napredne značajke.
- Sezonski rast potražnje ili novi članovi tima.
- Kada želite optimizirati troškove (downgrade na niži plan).
`,
      technicalDetails: `**Frontend**
- \`SubscriptionPlans.jsx\` poziva \`POST /api/payments/create-checkout\` s plan parametrom.
- Stripe checkout prikazuje prorated cijenu ako je upgrade/downgrade.

**Backend**
- \`routes/payments.js\`: \`POST /api/payments/create-checkout\` endpoint:
  - Provjerava da li korisnik ima aktivnu plaćenu pretplatu (ne TRIAL, ne BASIC).
  - Izračunava preostale dane: \`(expiresAt - now) / (1000 * 60 * 60 * 24)\`.
  - Izračunava dnevnu cijenu: \`planPrice / 30\` (mjesečna pretplata).
  - Izračunava prorated cijenu: \`(newDailyPrice - currentDailyPrice) × daysRemaining\`.
  - Ako je upgrade (cijena > 0), koristi \`subscription\` mode u Stripe checkout.
  - Ako je downgrade (cijena < 0), postavlja cijenu na 0€ i koristi \`payment\` mode.
  - Dodaje \`proratedInfo\` u metadata za praćenje.
- \`activateSubscription\` funkcija:
  - Zadržava postojeći \`expiresAt\` ako korisnik već ima aktivnu plaćenu pretplatu (prorated billing).
  - Inače postavlja novi \`expiresAt\` (1 mjesec od sada).

**Baza**
- \`Subscription\` model: \`plan\`, \`status\`, \`expiresAt\` - sve potrebno za prorated billing.
- \`SubscriptionPlan\` model: \`price\` - za izračun dnevne cijene.

**Stripe**
- Checkout session koristi \`subscription\` mode za upgrade (s prorated cijenom).
- Checkout session koristi \`payment\` mode za downgrade (0€).
- Metadata sadrži \`proratedInfo\` JSON s detaljima izračuna.

**API**
- \`POST /api/payments/create-checkout\` – tijelo { plan }.
- Automatski izračunava prorated billing ako korisnik ima aktivnu plaćenu pretplatu.
- Vraća Stripe checkout URL s prorated cijenom.

**Primjer izračuna**
- Korisnik ima PREMIUM plan (89€) s 15 preostalih dana.
- Želi upgrade na PRO plan (149€).
- Dnevna cijena PREMIUM: 89€ / 30 = 2.97€/dan
- Dnevna cijena PRO: 149€ / 30 = 4.97€/dan
- Razlika: 4.97€ - 2.97€ = 2.00€/dan
- Prorated cijena: 2.00€ × 15 dana = 30.00€
- Korisnik plaća 30€ umjesto 149€.
`
    },
    "Otkazivanje pretplate": {
      implemented: true,
      summary: "Otkažite plan u bilo kojem trenutku; koristite benefite do kraja razdoblja, a krediti ostaju.",
      details: `**Kako funkcionira**
- U postavkama kliknete "Otkaži pretplatu"; sustav postavlja cancel_at_period_end u Stripe-u.
- Plan ostaje aktivan do isteka trenutnog ciklusa, potom prelazi u EXPIRED/BASIC.
- Krediti zarađeni u ciklusu ostaju dostupni.

**Prednosti**
- Potpuna kontrola bez dugoročnih ugovora.
- Transparentno kada će pretplata završiti i što se događa nakon isteka.

**Kada koristiti**
- Kada pauzirate suradnju ili prelazite na drugi plan kasnije.
- Kod testiranja platforme bez dugoročne obveze.
`,
      technicalDetails: `**Frontend**
- \`CancelSubscriptionModal\` prikazuje datum isteka i učinke otkazivanja.
- UI badge “Cancel at period end” nakon potvrde.

**Backend**
- \`subscriptionService.cancel\` poziva Stripe API (cancel_at_period_end=true) i emitira \`subscription.cancelled\`.
- Scheduler provjerava istek i ažurira status.

**Baza**
- \`Subscription\` polja \`cancelAtPeriodEnd\`, \`canceledAt\`.
- Audit log bilježi korisnika koji je otkazao.

**Integracije**
- Stripe webhooks potvrđuju otkazivanje.
- Notification servis šalje potvrdu i podsjetnik pred istek.

**API**
- \`POST /api/subscriptions/cancel\` – pokreće otkazivanje.
- \`GET /api/subscriptions/me\` – pokazuje flag cancelAtPeriodEnd.
- Webhook \`customer.subscription.deleted\` završava pretplatu.
`
    },
    "Status pretplate (ACTIVE, CANCELLED, EXPIRED)": {
      implemented: true,
      summary: "Status pretplate (ACTIVE, CANCELLED, EXPIRED) prikazuje trenutno stanje i određuje dostupne funkcionalnosti.",
      details: `**Kako funkcionira**
- Pretplate imaju status ACTIVE, CANCELLED ili EXPIRED ovisno o naplati i radnjama korisnika.
- Aktivna pretplata omogućuje korištenje svih benefita, otkazana traje do kraja plaćenog perioda, a istekla zaustavlja premium funkcije.
- Sustav automatski ažurira status kroz Stripe webhookove i interne cron jobove.

**Prednosti**
- Jasna informacija o dostupnosti funkcionalnosti.
- Pravovremeni podsjetnici sprječavaju neočekidane prekide usluga.

**Kada koristiti**
- Praćenje naplate i odlučivanje o obnovi.
- Support scenariji (provjera zašto korisnik nema pristup određenim funkcijama).
`,
      technicalDetails: `**Frontend**
- Dashboard i postavke prikazuju badge sa statusom i datum isteka.
- Banner upozorava na nadolazeći istek i nudi CTA za obnovu.

**Backend**
- \`subscriptionService.syncStatus\` obrađuje webhook evente (invoice.paid, invoice.payment_failed, customer.subscription.deleted).
- Scheduled job provjerava pretplate bez webhook potvrde.

**Baza**
- \`Subscription\` polja \`status\`, \`currentPeriodEnd\`, \`cancelAtPeriodEnd\`.
- Audit log čuva promjene statusa s razlogom.

**Integracije**
- Stripe Billing za status naplate.
- Notification servis šalje email/SMS podsjetnike za isteke.

**API**
- \`GET /api/subscriptions/me\` – vraća detalje uključujući status.
- \`POST /api/subscriptions/cancel\` – označava pretplatu za otkazivanje.
`
    },
    "Automatsko isteka pretplate": {
      implemented: true,
      summary: "Neuspjela naplata ili istekao ciklus automatski označava pretplatu kao EXPIRED i vraća korisnika na BASIC.",
      details: `**Kako funkcionira**
- Stripe pokušava naplatu; nakon konačnog neuspjeha webhook šalje signal.
- Sistem postavlja status EXPIRED, deaktivira premium značajke i, po potrebi, prebacuje na BASIC.
- Korisnik zadržava postojeće kredite ali više ne prima nove.

**Prednosti**
- Automatizirano upravljanje – nema ručnih intervencija.
- Transparentno što se događa nakon neuspjele naplate.

**Kada koristiti**
- Kod bank/karte problema ili privremenog pauziranja plaćanja.
- Admin nadzor nad expiring računima.
`,
      technicalDetails: `**Frontend**
- Banner upozorava korisnika da je pretplata istekla i nudi gumb "Obnovi".

**Backend**
- Stripe webhook \`invoice.payment_failed\` i \`customer.subscription.deleted\` pokreću \`subscriptionService.expire\`.
- Cleanup disable-a premium značajke i update-a feature flagove.

**Baza**
- \`Subscription\` polja \`status\`, \`expiredAt\`.

**Integracije**
- Notification servis šalje email “pretplata je istekla”.
- Feature flag servis i analytics dobiju event \`subscription.expired\`.

**API**
- \`POST /api/subscriptions/expire\` – admin ručno može označiti expired.
- Webhook endpoint \`/api/webhooks/stripe\` obrađuje događaje.
- \`GET /api/subscriptions/me\` – prikazuje da je plan EXPIRED.
`
    },
    "Notifikacije o isteku pretplate": {
      implemented: true,
      summary: "Podsjetnici 7/3/1 dan prije isteka osiguravaju da ne propustite obnovu.",
      details: `**Kako funkcionira**
- Scheduler provjerava \`currentPeriodEnd\` i šalje notifikacije 7, 3 i 1 dan prije isteka.
- Uključuje email, in-app i opcionalno SMS kanal s linkom za obnovu ili ažuriranje kartice.
- Ako naplata padne, šalje se dodatna obavijest “Payment failed”.

**Prednosti**
- Pravovremeni podsjetnici sprječavaju prekid usluge.
- Omogućuje korisniku da ažurira karticu prije isteka.

**Kada koristiti**
- Aktivni pretplatnici automatski dobivaju podsjetnike.
- Admini pregledavaju log podsjetnika kod pritužbi.
`,
      technicalDetails: `**Frontend**
- Notification bell i email template s datumom isteka i CTA “Obnovi pretplatu”.

**Backend**
- \`subscriptionNotificationJob\` generira podsjetnike i upućuje na \`notificationService.send\`.
- Payment failure webhook dodaje dodatnu poruku.

**Baza**
- \`Notification\` zapisi type='SUBSCRIPTION_EXPIRING'.
- \`NotificationPreference\` čuva odabrane kanale.

**Integracije**
- Email (SendGrid) i SMS (Twilio) kanali.
- Analytics mjeri open/click rate podsjetnika.

**API**
- \`GET /api/notifications?type=SUBSCRIPTION_EXPIRING\` – pregled podsjetnika.
- \`PATCH /api/notification-preferences\` – upravljanje kanalima.
- Webhook \`invoice.payment_failed\` šalje dodatni alert.
`
    },
    "Povijest pretplata": {
      implemented: true,
      summary: "Pregledajte sve promjene planova, nadogradnje i otkazivanja kroz vrijeme.",
      details: `**Implementirano**: Kompletan sustav za praćenje povijesti pretplata s eksplicitnom SubscriptionHistory tablicom koja bilježi sve promjene plana, nadogradnje, otkazivanja i obnove.

**Kako funkcionira**
- Tablica povijesti prikazuje svaki plan, datum početka/završetka, razlog promjene i korištene kredite.
- Filtri (plan, status, datum, akcija) pomažu analizirati kako se pretplata razvijala.
- Automatsko logiranje svih promjena: CREATED, UPGRADED, DOWNGRADED, RENEWED, CANCELLED, EXPIRED, REACTIVATED, PRORATED.
- Praćenje financijskih podataka: cijena, prorated iznosi, popusti, krediti prije/nakon promjene.

**Prednosti**
- Transparentan audit trail pretplatničkih aktivnosti.
- Korisno za analizu ARPU, churn i planiranje rasta.
- Potpuna povijest svih promjena pretplate s razlozima i metapodacima.

**Kada koristiti**
- Tijekom financijskih revizija ili support upita.
- Kod migracije planova i povijesti kupaca.
- Analiza ponašanja korisnika i optimizacija pretplatničkih planova.
`,
      technicalDetails: `**Backend**
- \`GET /api/subscriptions/history\`: Endpoint za dohvat povijesti pretplata s filterima (action, plan, startDate, endDate, limit, offset).
- \`subscription-history-service.js\`: Servis za logiranje i dohvat povijesti pretplata.
  - \`logSubscriptionChange()\`: Logira promjene pretplate (CREATED, UPGRADED, DOWNGRADED, RENEWED, CANCELLED, EXPIRED, REACTIVATED, PRORATED).
  - \`getSubscriptionHistory()\`: Dohvaća povijest pretplata za korisnika s filterima.
  - \`getSubscriptionHistoryBySubscription()\`: Dohvaća povijest za specifičnu pretplatu.

**Integracija**
- \`activateSubscription()\` u \`routes/payments.js\`: Automatski logira CREATED, UPGRADED, DOWNGRADED ili RENEWED akcije.
- \`downgradeToBasic()\` u \`routes/subscriptions.js\`: Logira DOWNGRADED ili EXPIRED akcije.
- \`POST /api/subscriptions/cancel\`: Logira CANCELLED akciju.
- \`POST /api/payments/cancel-subscription\`: Logira CANCELLED akciju.

**Baza**
- \`SubscriptionHistory\` model:
  - \`action\`: SubscriptionHistoryAction enum (CREATED, UPGRADED, DOWNGRADED, RENEWED, CANCELLED, EXPIRED, REACTIVATED, PRORATED).
  - \`previousPlan\`, \`newPlan\`: Prethodni i novi plan.
  - \`previousStatus\`, \`newStatus\`: Prethodni i novi status.
  - \`price\`, \`proratedAmount\`, \`discountAmount\`, \`discountType\`: Financijski podaci.
  - \`creditsAdded\`, \`creditsBefore\`, \`creditsAfter\`: Promjene kredita.
  - \`validFrom\`, \`validUntil\`, \`previousExpiresAt\`: Vremenski periodi.
  - \`reason\`, \`notes\`, \`metadata\`: Razlog i dodatni podaci.
  - \`changedBy\`, \`ipAddress\`: Audit informacije.
- Indeksi: \`subscriptionId + createdAt\`, \`userId + createdAt\`, \`action + createdAt\`, \`createdAt\`.

**Migracija**
- \`20251121000000_add_subscription_history/migration.sql\`: Kreira SubscriptionHistory tablicu i SubscriptionHistoryAction enum.
- Export u CSV/PDF za financijski tim.

**API**
- \`GET /api/subscriptions/history\` – lista.
- \`GET /api/subscriptions/history/export\` – export.
- \`GET /api/subscriptions/history/:id\` – detalj.
`
    },
    "Trial period (7 dana)": {
      implemented: true,
      summary: "Novi provideri dobivaju 7 dana triala s besplatnim kreditima kako bi isprobali platformu.",
      details: `**Kako funkcionira**
- Po registraciji se aktivira trial koji traje 7 dana bez unosa kartice.
- Provider dobiva ograničenu količinu kredita i pristup svim ključnim funkcijama.
- Nakon isteka može odabrati pretplatu ili nastaviti na BASIC plan.

**Prednosti**
- Isprobavanje platforme bez financijskog rizika.
- Omogućuje realan test leadova, queue-a i komunikacije.

**Kada koristiti**
- Onboarding novih providera.
- Marketinške kampanje za privlačenje novih partnera.
`,
      technicalDetails: `**Frontend**
- Banner prikazuje preostale dane i kredite.
- CTA vodi na cjenik za konverziju u plaćeni plan.

**Backend**
- \`trialService.start\` kreira trial zapis, dodjeljuje kredite i postavlja expiry.
- Scheduler označava trial kao završen i uklanja besplatne pogodnosti.

**Baza**
- \`Trial\` tablica (providerId, startedAt, endsAt, creditsGranted, status).
- \`CreditTransaction\` zapis za besplatne kredite.

**Integracije**
- Notification servis šalje reminder 2 dana prije isteka.
- Analytics prati konverziju trial → pretplata.

**API**
- \`GET /api/trial/status\` – vraća stanje triala.
- \`POST /api/trial/convert\` – pokreće kupnju plana.
`
    },
    "Besplatni krediti za trial (5 leadova)": {
      implemented: true,
      summary: "Trial uključuje kredite dovoljne za kupnju ~5 leadova kako bi provider testirao proces.",
      details: `**Kako funkcionira**
- Aktivacijom triala dodjeljujemo određeni broj kredita (ekvivalent 5 leadova prosječne cijene).
- Krediti se koriste identično kao kupljeni; transakcije imaju oznaku TRIAL.
- Nakon potrošnje kredita korisnik može nadoplatiti ili prijeći na pretplatu.

**Prednosti**
- Omogućuje realistično testiranje lead sustava.
- Bez troška provjeravate kvalitetu leadova i ROI.

**Kada koristiti**
- Tijekom trial perioda.
- Edukacija novih članova tima kako kupovati leadove.
`,
      technicalDetails: `**Frontend**
- Indicator prikazuje preostale trial kredite i povezuje na povijest transakcija.
- Marketplace badge označava da se lead kupuje trial kreditima.

**Backend**
- \`creditLedgerService.grantTrialCredits\` dodjeljuje kredite i kreira transakcije.
- Event \`trial.credits.used\` prati potrošnju i triggera reminder kad ostane malo kredita.

**Baza**
- \`CreditTransaction\` sa \`source=TRIAL\` i povezanim leadId.
- \`Trial\` tablica prati potrošnju i limit.

**Integracije**
- Notification servis šalje upozorenje kad je ostalo <20% kredita.
- Analytics mjeri konverziju trial kredita u plaćene kupnje.

**API**
- \`GET /api/credits/trial\` – preostali trial krediti.
- \`POST /api/credits/topup\` – prelazak na plaćene kredite.
`
    },
    "Automatsko vraćanje na BASIC plan": {
      implemented: true,
      summary: "Nakon isteka pretplate račun se automatski vraća na BASIC plan s osnovnim funkcionalnostima. Premium značajke se deaktiviraju, ali krediti i povijest leadova ostaju.",
      details: `**Kako funkcionira**
- Kada status pretplate postane EXPIRED/CANCELLED, sustav aktivira BASIC plan.
- Premium značajke se deaktiviraju, ali krediti i povijest leadova ostaju.
- Korisnik može ponovno aktivirati viši plan u bilo kojem trenutku.

**Prednosti**
- Kontinuitet – korisnik ne gubi pristup osnovnim alatima.
- Jednostavan povratak na plaćeni plan kad je potrebno.

**Kada koristiti**
- Automatski nakon isteka ili otkazivanja.
- Admin može ručno prebaciti korisnika na BASIC radi compliancea.
`,
      technicalDetails: `**Frontend**
- Banner prikazuje da je račun na BASIC-u i CTA "Aktiviraj plan".

**Backend**
- \`downgradeToBasic(userId, previousPlan)\` funkcija u \`subscriptions.js\` automatski vraća korisnika na BASIC plan.
- Funkcija zadržava postojeće kredite (\`creditsBalance\`) i povijest leadova.
- Premium značajke se automatski deaktiviraju jer je plan postavljen na BASIC (provjera kroz \`requirePlan\` middleware).
- \`checkAndDowngradeExpiredSubscriptions()\` funkcija provjerava istekle pretplate i automatski vraća na BASIC (može se pozivati periodično kroz cron job).

**Automatsko vraćanje:**
- U \`GET /api/subscriptions/me\` endpointu se automatski provjerava je li pretplata istekla i poziva se \`downgradeToBasic\`.
- U \`POST /api/subscriptions/cancel\` endpointu se također automatski vraća na BASIC (osim za TRIAL).
- TRIAL plan se ne vraća na BASIC - ostaje EXPIRED dok korisnik ne plati.

**Baza**
- \`Subscription\` polje \`plan\` se postavlja na \`BASIC\`, \`status\` se postavlja na \`ACTIVE\`.
- \`creditsBalance\` ostaje isti (zadržavaju se postojeći krediti).
- Premium značajke se automatski deaktiviraju jer je plan BASIC (provjera kroz \`subscription-auth.js\`).

**Notifikacije**
- Automatska notifikacija korisniku: "Pretplata vraćena na BASIC plan" s objašnjenjem da su krediti i povijest leadova zadržani.

**API**
- \`GET /api/subscriptions/me\` – automatski provjerava istekle pretplate i vraća na BASIC.
- \`POST /api/subscriptions/cancel\` – automatski vraća na BASIC (osim za TRIAL).
- \`checkAndDowngradeExpiredSubscriptions()\` – može se pozivati periodično kroz cron job za batch processing isteklih pretplata.
`
    },
    "Upload dokumenata licenci": {
      implemented: true,
      summary: "Prenesite dokumente licenci kako bi admini mogli verificirati i prikazati ih na profilu.",
      details: `**Kako funkcionira**
- Pružatelj odabire tip licence, unosi broj, datum i tijelo izdavanja te uploada dokument (PDF/JPG/PNG).
- Sustav validira format/veličinu, maskira osjetljive podatke i šalje adminu na verifikaciju.
- Nakon odobrenja licenca se prikazuje na profilu s badgeom.

**Prednosti**
- Dokazuje profesionalnost i povećava povjerenje korisnika.
- Admin ima centraliziran audit i proces verifikacije.

**Kada koristiti**
- Tijekom onboardinga i kad dodajete nove licence.
- Kod nadogradnje planova koji traže verificirane licence.
`,
      technicalDetails: `**Frontend**
- \`LicenseUploadForm\` (React Hook Form + file dropzone) s previewom i validacijom.
- Status badge (PENDING, VERIFIED, REJECTED) na profilu.

**Backend**
- \`licenseController.create\` sprema metapodatke i delegira datoteku \`mediaService\`-u.
- Worker skenira dokument (ClamAV), sprema u S3 i emitira \`license.uploaded\`.

**Baza**
- \`ProviderLicense\` (type, issuer, number, issuedAt, expiresAt, documentUrl, status).
- \`LicenseAudit\` bilježi promjene statusa.

**Integracije**
- S3/CloudFront za pohranu, ClamAV/OCR za sigurnost i ekstrakciju podataka.
- Notification servis obavještava admina o novim licencama.

**API**
- \`POST /api/director/licenses\` – kreira licencu s dokumentom.
- \`GET /api/director/licenses\` – lista licenci i statusa.
- \`POST /api/admin/licenses/:id/verify\` – odobrenje/odbijanje.
`
    },
    "Praćenje isteka licenci": {
      implemented: true,
      summary: "Automatske obavijesti podsjećaju vas na obnovu licence prije isteka.",
      details: `**Kako funkcionira**
- Sustav prati \`expiresAt\` na licenci i šalje podsjetnike 30/14/7/1 dan prije isteka.
- Nakon isteka licenca prelazi u status EXPIRED i badge se uklanja dok se ne obnovi.
- Moguće je unijeti novu licencu ili ažurirati datum.

**Prednosti**
- Sprječava gubitak statusa licenciranog pružatelja.
- Admin može nadzirati licence koje uskoro istječu.

**Kada koristiti**
- Kontinuirano – sve aktivne licence imaju scheduler podsjetnike.
- Kod compliance revizija za provjeru ažurnosti dokumentacije.
`,
      technicalDetails: `**Frontend**
- Notification banner i email s datumom isteka i linkom “Obnovi licencu”.

**Backend**
- \`licenseExpiryJob\` provodi dnevne provjere i kreira notifikacije.
- Event \`license.expired\` ažurira profil i queue eligibility.

**Baza**
- \`ProviderLicense\` polje \`expiresAt\`; \`LicenseReminder\` tablica za log podsjetnika.

**Integracije**
- Notification servis (email/push/SMS) za podsjetnike.
- Analytics izvješća o licencama koje su istekle/neobnovljene.

**API**
- \`GET /api/director/licenses/expiring?days=30\` – popis nadolazećih isteka.
- \`POST /api/director/licenses/:id/renew\` – ažurira datum i dokument.
`
    },
    "Različiti tipovi licenci po kategorijama": {
      implemented: true,
      summary: "Svaka kategorija može zahtijevati specifične licence (elektrotehnička, građevinska, itd.).",
      details: `**Kako funkcionira**
- Svaka kategorija definira obavezne/dopunske licence (npr. Elektrotehnička za električare).
- Pružatelj odabire licencu i povezuje je s kategorijama kojima zadovoljava uvjet.
- Marketplace filter može prikazivati samo licencirane pružatelje po kategoriji.

**Prednosti**
- Precizno mapiranje kompetencija i regulativnih zahtjeva.
- Korisnici lako vide licencirane stručnjake za specifične usluge.

**Kada koristiti**
- Tijekom konfiguracije kategorija i onboarding-a pružatelja.
- Kod filtriranja i matchmakinga (samo licencirani).`,
      technicalDetails: `**Frontend**
- \`CategoryLicenseSelector\` prikazuje zahtjevane licence i status.
- Badge “Requires license” u marketplaceu.

**Backend**
- \`categoryLicenseService\` mapira kategorije ↔ licence i provjerava ispunjenost.
- Event \`provider.license.updated\` invalidira filtere i queue eligibility.

**Baza**
- \`CategoryLicenseRequirement\` (categoryId, licenseTypeId, mandatory).
- \`ProviderLicenseCategory\` veže licencu na kategoriju.

**Integracije**
- Analytics prati pokrivenost licencama po kategoriji.
- Notification servis upozorava pružatelja ako licenca istekne za aktivnu kategoriju.

**API**
- \`GET /api/categories/:id/licenses-required\` – zahtjevi.
- \`POST /api/providers/licenses/:id/link-category\` – povezuje licencu.
- \`GET /api/providers?licensed=true&categoryId=...\` – filtriranje.
`
    },
    "Tijela koja izdaju licence": {
      implemented: true,
      summary: "Navedite tijelo koje je izdalo vašu licencu - npr. Ministarstvo graditeljstva, Hrvatska komora inženjera, itd.",
      details: `## Kako funkcionira:

Prilikom unosa licence, navedite tijelo koje je izdalo vašu licencu - to pomaže korisnicima razumjeti važnost i valjanost licence.

**Primjeri tijela koja izdaju licence:**
- Ministarstvo graditeljstva i prostornog uređenja
- Hrvatska komora inženjera
- Hrvatski zavod za norme
- Gradska/tvrtke koje izdaju licence
- Ostala tijela ovisno o tipu licence

**Kako funkcionira:**
- Odaberete tijelo koje je izdalo licencu iz padajućeg popisa
- Ili unesete vlastito tijelo ako ga nema na popisu
- Tijelo se prikazuje uz licencu na vašem profilu
- Admini mogu verificirati licencu preko tijela

**Zašto je važno:**
- Korisnici vidje tko je izdao licencu
- Gradite povjerenje u valjanost licence
- Privlačite korisnike koji traže licencirane pružatelje
- Razlikujete se od nelicenciranih pružatelja

**Prednosti:**
- Transparentnost u izvoru licence
- Gradite povjerenje
- Privlačite ozbiljnije klijente
- Razlikovanje od konkurencije

Tijela koja izdaju licence omogućavaju vam dokaz valjanosti vaše licence i privlačenje ozbiljnih klijenata!
`
    },
    "Broj licence i datum izdavanja": {
      implemented: true,
      summary: "Unesite broj i datum izdavanja licence kako bi admini mogli verificirati podatke i prikazati ih klijentima.",
      details: `**Kako funkcionira**
- Pri unosu licence korisnik upisuje broj i datum izdavanja iz službenog dokumenta.
- Podaci se prikazuju na profilu i koriste u admin verifikaciji.
- Ažuriranje je dostupno kada se licenca obnovi.

**Prednosti**
- Transparentnost i lakša verifikacija.
- Klijenti vide svježe podatke o licenci.

**Kada koristiti**
- Kod unosa nove licence ili obnove postojeće.
- Tijekom compliance provjera.
`,
      technicalDetails: `**Frontend**
- Form polja s maskom/validatorom za broj licence i date picker.
- Tooltip objašnjava gdje pronaći podatke u dokumentu.

**Backend**
- \`licenseController.updateDetails\` sprema broj i datume te emitira \`license.updated\`.

**Baza**
- \`ProviderLicense\` polja \`licenseNumber\`, \`issuedAt\`.

**Integracije**
- Admin panel prikazuje broj/datum radi usporedbe s vanjskim registrima.

**API**
- \`PATCH /api/director/licenses/:id\` – ažurira podatke.
- \`GET /api/director/licenses\` – vraća detalje uključujući broj i datum.
`
    },
    "Trust score sustav (0-100)": {
      implemented: true,
      summary: "Ocjena pouzdanosti (0-100) temelji se na verifikacijama i ponašanju klijenata te utječe na distribuciju leadova.",
      details: `**Kako funkcionira**
- Svaka verifikacija (email, telefon, OIB, tvrtka, domena) i povijesni signal (plaćanja, sporovi) dodaje bodove do maksimuma 100.
- Score se segmentira u razrede (0-30, 31-60, 61-80, 81-100) i prikazuje na leadovima, profilima i dashboardu.
- Algoritam se recalculira kod svake nove verifikacije ili promjene aktivnosti.

**Prednosti**
- Pruža transparentan indikator kvalitete leadova providerima.
- Motivira klijente na verifikaciju i odgovorno ponašanje.

**Kada koristiti**
- Filtriranje i prioritet kupnje leadova.
- Analiza performansi na ROI dashboardu i automatizirani pricing.
`,
      technicalDetails: `**Frontend**
- Badge s bojom/tierom na lead karticama i tooltip s breakdownom.
- Filter "Minimalni trust score" u marketplaceu i graf trust score distribucije.

**Backend**
- \`trustScoreService.calculate\` agregira verifikacije, plaćanja i historiju.
- Event \`lead.trust-score.updated\` sinkronizira score kroz cache i analytics.

**Baza**
- \`TrustScore\` tablica (clientId, value, tier, breakdownJson, calculatedAt).
- Historijski zapisi za audit i modeliranje.

**Integracije**
- Analytics koristi score u prediktivnim modelima.
- Notification servis obavještava klijenta kad trust score poraste/padne.

**API**
- \`GET /api/leads/:id/trust-score\` – vraća aktualni score i breakdown.
- \`GET /api/leads?minTrustScore=...\` – filtrira leadove.
`
    },
    "Verificiranje telefona": {
      implemented: true,
      summary: "Klijent potvrđuje telefon SMS kodom i time povećava trust score.",
      details: `**Kako funkcionira**
- Klijent upisuje broj u profilu; sustav šalje OTP kod (npr. 6 znamenki).
- Klijent unosi kod i broj dobiva status VERIFIED.
- Trust score i lead badge reflektiraju verifikaciju.

**Prednosti**
- Veća pouzdanost kontakt podataka.
- Povećava kvalitetu leadova.

**Kada koristiti**
- Tijekom registracije i kod promjene broja.
- Preduvjet za određene planove ili queue.
`,
      technicalDetails: `**Frontend**
- Formular s maskom broja, countdownom i ponovnim slanjem koda.
- UX prikazuje status i opciju promjene broja.

**Backend**
- \`smsVerificationService.requestCode\` i \`verifyCode\` (Twilio Verify/OTP).
- Rate limit i pokušaji po korisniku.

**Baza**
- \`PhoneVerification\` (userId, phone, codeHash, expiresAt, attempts, verifiedAt).
- Flags u \`User\` i \`ClientProfile\`.

**Integracije**
- Twilio/OTP provider, Redis za rate limit.
- Notification servis potvrđuje verifikaciju.

**API**
- \`POST /api/contact-phone/verify-request\` – traži kod.
- \`POST /api/contact-phone/verify\` – potvrđuje.
- \`GET /api/users/me\` – prikazuje status.
`
    },
    "Verificiranje emaila": {
      implemented: true,
      summary: "Klijent potvrđuje email klikom na verifikacijski link i time povećava trust score.",
      details: `**Kako funkcionira**
- Nakon unosa emaila sustav šalje verifikacijski link.
- Klik potvrđuje email i povećava trust score.
- Status se prikazuje u profilu i lead karticama.

**Prednosti**
- Valjani kontakt podaci i minimalni spam.
- Direkno utječe na kvalitetu leadova.

**Kada koristiti**
- Tijekom registracije ili promjene emaila.
- Preduvjet za slanje email notifikacija.
`,
      technicalDetails: `**Frontend**
- Banner u postavkama dok email nije verificiran.
- Link za ponovno slanje verifikacijskog emaila.

**Backend**
- \`emailVerificationService.send\` generira token (JWT/UUID) i šalje email.
- \`emailVerificationService.verify\` potvrđuje token i ažurira status.

**Baza**
- \`EmailVerification\` (userId, tokenHash, expiresAt, verifiedAt).
- Flags u \`User\` profilu.

**Integracije**
- Email provider (SendGrid/SES).
- Analytics za praćenje verifikacijskih stopa.

**API**
- \`POST /api/contact-email/verify-request\` – šalje link.
- \`GET /api/contact-email/verify?token=...\` – potvrđuje.
`
    },
    "Verificiranje OIB-a": {
      implemented: true,
      summary: "Klijenti potvrđuju OIB kroz provjeru s državnim registrom, čime se povećava trust score.",
      details: `**Kako funkcionira**
- Klijent unosi OIB; servis provjerava broj u vanjskoj bazi (npr. Fina).
- Uspješan rezultat označava OIB kao verified i podiže trust score.
- OIB verifikacija čuva se u profilu i lead karticama.

**Prednosti**
- Manji rizik lažnih podataka.
- Regulativna usklađenost i kvaliteta leadova.

**Kada koristiti**
- Tijekom onboardinga klijenata.
- Kod kupovine leadova višeg razreda gdje je potrebna verifikacija.
`,
      technicalDetails: `**Frontend**
- Formular s validacijom formata (11 znamenki).
- Status “Verified” vidljiv na profilu.

**Backend**
- \`oibVerificationService.verify\` poziva eksterni API (Fina/Ministarstvo) i zapisuje rezultat.

**Baza**
- \`ClientVerification\` polje \`oibVerifiedAt\`, \`oibStatus\`.

**Integracije**
- FINA/Ministarstvo API za provjeru OIB-a.
- Analytics prati broj verificiranih OIB-ova.

**API**
- \`POST /api/client-verifications/oib\` – pokreće verifikaciju.
- \`GET /api/client-verifications\` – vraća status.
`
    },
    "Verificiranje firme (sudski registar)": {
      implemented: true,
      summary: "Klijent potvrđuje podatke o firmi provjerom u sudskom registru čime se značajno podiže trust score.",
      details: `**Kako funkcionira**
- Korisnik upisuje naziv i OIB firme, a servis šalje upit prema sudskom registru.
- Nakon pozitivnog odgovora firma dobiva status VERIFIED i trust score raste.
- Rezultat verifikacije prikazuje se u profilu klijenta i lead karticama.

**Prednosti**
- Smanjuje rizik od lažnih tvrtki i neplaćanja.
- Pruža dodatni signal kvalitete za AI scoring.

**Kada koristiti**
- Tijekom onboardinga B2B klijenata.
- Kao preduvjet za kupnju premium leadova ili pretplata.
`,
      technicalDetails: `**Frontend**
- Formular s automatskim popunjavanjem podataka iz registra i status banner.
- CTA “Ponovno verificiraj” kada se promijene podaci tvrtke.

**Backend**
- \`companyVerificationService.verify\` šalje REST/SOAP upit sudskom registru.
- Webhook/batch sync provjerava postojeće verifikacije periodično.

**Baza**
- \`CompanyVerification\` (clientId, companyName, oib, status, verifiedAt, sourceRef).
- Audit tablica za historiju provjera.

**Integracije**
- Sudski registar/fininfo API, queue za retry ako servis nije dostupan.
- Notification servis obavještava korisnika o rezultatu.

**API**
- \`POST /api/client-verifications/company\` – pokreće provjeru.
- \`GET /api/client-verifications\` – vraća sve statuse verifikacija.
`
    },
    "Kvaliteta leadova na osnovu verifikacije": {
      implemented: true,
      summary: "AI model ponderira trust score i verifikacije klijenta za procjenu kvalitete leada.",
      details: `**Kako funkcionira**
- AI engine prikuplja signale (verifikacije, historiju, engagement) i računa quality score.
- Viši score povisuje cijenu leada i ističe ga u marketplaceu.
- Provider može filtrirati i sortirati leadove po kvaliteti.

**Prednosti**
- Fokus na leadove s najvećom šansom konverzije.
- Omogućava precizniji ROI izračun i planiranje budžeta.

**Kada koristiti**
- Pri kupovini leadova i optimizaciji kampanja.
- U analitici za usporedbu performansi različitih segmenata.
`,
      technicalDetails: `**Frontend**
- Badge “High quality” i graf breakdowna u detalju leada.
- Filter/sort po quality scoreu u listama.

**Backend**
- \`leadQualityService.evaluate\` kombinira trust score, AI model i ručne signale.
- Scheduler rekalibrira score kad stignu novi podaci ili refund.

**Baza**
- \`LeadQuality\` (leadId, value, tier, breakdownJson, calculatedAt).
- Denormalizirani stupci u \`Lead\` za brze upite.

**Integracije**
- Analytics pipeline za treniranje modela.
- Notification servis šalje provideru obavijest o leadovima visoke kvalitete.

**API**
- \`GET /api/leads/:id/quality\` – vraća detalje scorea.
- \`GET /api/leads?qualityTier=...\` – filtriranje u listama.
`
    },
    "Detaljno praćenje kredita": {
      implemented: true,
      summary: "Svaka promjena stanja kredita zapisuje se s metapodacima i povezanim entitetima radi potpune transparentnosti.",
      details: `**Kako funkcionira**
- Svaka akcija (kupnja, trošak, refund, bonus) generira transakciju s vremenom, tipom i referencom.
- Povijest je dostupna kroz dashboard uz filtriranje i izvoz.
- Admin i provider mogu auditirati pojedine transakcije.

**Prednosti**
- Jasno razumijevanje gdje su potrošeni krediti.
- Dokazni trag za financije i reklamacije.

**Kada koristiti**
- Redoviti pregled potrošnje i planiranje budžeta.
- Rješavanje disputea oko leadova ili refundova.
`,
      technicalDetails: `**Frontend**
- Krediti dashboard s tablicom, filterima i CSV exportom.
- Detaljni modal s povezanim leadom/pretplatom.

**Backend**
- \`creditLedgerService.record\` encapulira logiku transakcija i recalculates balance.
- Event sourcing (\`credit.transaction.created\`) sinkronizira analytics.

**Baza**
- \`CreditTransaction\` (id, userId, type, amount, balanceAfter, referenceType, referenceId, meta, createdAt).
- Indeksi za filtriranje po tipu i datumu.

**Integracije**
- Accounting/reporting servisi koriste export ili webhook.
- Notification servis može slati mjesečne izvještaje.

**API**
- \`GET /api/credits/history\` – paginirana povijest.
- \`GET /api/credits/export\` – generira CSV.
`
    },
    "Različiti tipovi transakcija": {
      implemented: true,
      summary: "Transakcije kredita imaju klasificirane tipove (PURCHASE, LEAD_PURCHASE, REFUND...) radi lakšeg praćenja.",
      details: `**Kako funkcionira**
- Svaka transakcija dobije tip prema događaju (kupnja, lead, bonus, pretplata...).
- Tipovi se prikazuju u povijesti i omogućuju filtriranje/analizu.
- Novi tipovi se definiraju centralno kako bi se održala konzistentnost.

**Prednosti**
- Brzo razumijevanje razloga svake promjene stanja.
- Precizna segmentacija troškova i prihoda.

**Kada koristiti**
- Analiza potrošnje po kategorijama.
- Priprema financijskih izvještaja ili reklamacija.
`,
      technicalDetails: `**Frontend**
- Color badge uz svaki tip, filter dropdown i legenda.
- Tooltipi objašnjavaju značenje tipova.

**Backend**
- Enum \`CreditTransactionType\` u domenskom sloju.
- Servisi validiraju dopuštene prijelaze i kreiraju transakcije.

**Baza**
- Stupac \`type\` (ENUM/VARCHAR) u \`CreditTransaction\` s check constraintom.
- Materijalizirani view za agregacije po tipu.

**Integracije**
- Analytics koristi tip transakcije u BI izvještajima.
- Billing servis može triggerirati dodatne akcije (npr. invoice).

**API**
- \`GET /api/credits/history?type=...\` – filtrira po tipu.
- Admin endpoint za mapiranje tipova na izvještajne kategorije.
`
    },
    "Povezivanje s poslovima": {
      implemented: true,
      summary: "Transakcije kredita linkamo na poslove kako bi ROI bio vidljiv na razini pojedinog posla.",
      details: `**Kako funkcionira**
- Kod kupnje leada transakcija se veže na posao i lead ID.
- Dashboard prikazuje potrošene kredite i prihod po poslu.
- ROI se računa prema statusu konverzije i unesenom prihodu.

**Prednosti**
- Jasna veza između ulaganja i rezultata.
- Olakšava odluke o nastavku rada na sličnim poslovima.

**Kada koristiti**
- Evaluacija uspješnosti pojedinih poslova.
- Planiranje budžeta po kategorijama i lokacijama.
`,
      technicalDetails: `**Frontend**
- Sekcija “Financije” na detalju posla s listom transakcija i ROI grafom.
- Linkovi prema povijesti kredita i lead detalju.

**Backend**
- \`jobFinanceService.linkTransaction\` i \`calculateRoi\` održavaju relacije i metrike.
- Event \`lead.status.changed\` trigira recalculaciju ROI-ja.

**Baza**
- \`JobFinance\` (jobId, leadId, transactionId, revenue, roi, updatedAt).
- FK prema \`CreditTransaction\` i \`Job\`.

**Integracije**
- CRM/export servisi preuzimaju ROI podatke.
- Analytics prati performanse po kategorijama.

**API**
- \`GET /api/jobs/:id/finance\` – detalji i transakcije.
- \`POST /api/jobs/:id/revenue\` – unosi ostvareni prihod radi ROI-ja.
`
    },
    "Povezivanje s kupnjama leadova": {
      implemented: true,
      summary: "Svaka kupnja leada kreira kreditnu transakciju povezanu s lead ID-jem i statusom.",
      details: `**Kako funkcionira**
- Kada provider kupi lead, bilježi se transakcija tipa LEAD_PURCHASE.
- Transakcija sadrži referencu na lead, status i ključne atribute (kategorija, lokacija).
- Refund automatski stvara povezanu REFUND transakciju.

**Prednosti**
- Potpuna sljedivost troškova po leadu.
- Olakšava analizu performansi i disputea.

**Kada koristiti**
- Pregled kupnji i povrata leadova.
- Procjena uspješnosti određenih izvora/paketa leadova.
`,
      technicalDetails: `**Frontend**
- Povijest kredita prikazuje lead karticu, status i CTA za dispute/refund.
- Marketplace badge “Purchased” sinkroniziran preko transakcije.

**Backend**
- \`leadPurchaseService.buy\` kreira transakciju i emitira event.
- Refund servis revverzira transakciju i ažurira saldo.

**Baza**
- \`LeadPurchase\` (leadId, buyerId, transactionId, price, status, purchasedAt).
- Relacije prema \`CreditTransaction\` i \`Lead\`.

**Integracije**
- Notifications za potvrdu kupnje i status refundova.
- Analytics kombinira podatke za funnel izvještaje.

**API**
- \`POST /api/leads/:id/purchase\` – kupnja leada.
- \`GET /api/leads/purchases\` – lista kupovina.
- \`POST /api/leads/:id/refund\` – inicira refund.
`
    },
    "Stanje nakon svake transakcije": {
      implemented: true,
      summary: "Sustav prikazuje ažurirano stanje kredita nakon svake transakcije radi jasnog uvida u saldo.",
      details: `**Kako funkcionira**
- Nakon evidentiranja transakcije izračunava se novo stanje i sprema uz zapis.
- Trenutni saldo se prikazuje u headeru dashboarda i u svakoj transakciji.
- Admin može rekonstruirati stanje na bilo koji datum.

**Prednosti**
- Nema nejasnoća oko trenutnog stanja kredita.
- Jednostavno usklađivanje s fakturama i izvještajima.

**Kada koristiti**
- Svakodnevno praćenje salda.
- Revizija i provjera reklamacija korisnika.
`,
      technicalDetails: `**Frontend**
- Badge “Saldo” na dashboardu i indikator promjene (green/red) u listi transakcija.
- Graf stanja kroz vrijeme.

**Backend**
- \`creditBalanceService.recalculate\` provodi atomic update salda.
- Locking/optimistic concurrency sprječava duple upise.

**Baza**
- \`CreditBalanceSnapshot\` (userId, balance, capturedAt) za historiju.
- Stupac \`balanceAfter\` u \`CreditTransaction\`.

**Integracije**
- Reporting servis koristi snapshot za mjesečne izvještaje.
- Notification servis šalje upozorenja kad saldo padne ispod praga.

**API**
- \`GET /api/credits/balance\` – trenutni saldo.
- \`GET /api/credits/balance-history\` – vremenski niz stanja.
`
    },
    "Opisi transakcija": {
      implemented: true,
      summary: "Svaka kreditna transakcija dobiva razumljiv opis kako bi korisnik odmah znao što se dogodilo.",
      details: `**Kako funkcionira**
- Prilikom kreiranja transakcije generiramo opis na temelju tipa, povezanog leada/posla i dodatnih meta podataka.
- Opis se prikazuje u povijesti kredita, exportu i admin panelu.
- Pretraga i filtriranje omogućuju brzo pronalaženje transakcija po tekstu.

**Prednosti**
- Povećava razumijevanje financijskih kretanja bez dodatnog klikanja.
- Olakšava podršci i računovodstvu identifikaciju događaja.

**Kada koristiti**
- Kod interne revizije ili reklamacija.
- Pri ručnom dodavanju/uređivanju transakcija od strane admina.
`,
      technicalDetails: `**Frontend**
- Povijest kredita prikazuje opis i istaknute ključne riječi (lead, posao, iznos).
- Search input filtrira rezultate po sadržaju opisa.

**Backend**
- \`creditDescriptionFactory.build\` sastavlja opis iz šablona i meta podataka.
- Servis osigurava lokalizirane stringove i fallback za custom unose.

**Baza**
- \`CreditTransaction\` polje \`description\` (TEXT) indeksirano za full-text pretragu.

**Integracije**
- CSV/Excel export uključuje opis radi knjigovodstva.
- Notification servis koristi opis u emailovima o transakcijama.

**API**
- \`GET /api/credits/history\` – vraća opis uz svaku stavku.
- \`POST /api/admin/credits/manual-adjust\` – prima opcionalni custom opis.
`
    },
    "Stripe Checkout integracija": {
      implemented: true,
      summary: "Pretplate naplaćujemo kroz Stripe Checkout za siguran i jednostavan korisnički tok.",
      details: `**Kako funkcionira**
- Korisnik odabire plan, a backend kreira Stripe Checkout session.
- Redirect vodi na Stripe hosted stranicu gdje se unose podaci o plaćanju.
- Nakon uspješnog plaćanja korisnik se vraća na platformu i pretplata se aktivira.

**Prednosti**
- Stripe preuzima PCI odgovornosti i antifraud zaštitu.
- Podržan širok spektar načina plaćanja (kartice, Apple/Google Pay, SEPA...).

**Kada koristiti**
- Kod inicijalne kupnje pretplate.
- Kod nadogradnje plana koja zahtijeva novu naplatu.
`,
      technicalDetails: `**Frontend**
- CTA “Pretplati se” zove endpoint i nakon odgovora radi redirect na \`session.url\`.
- Success/failure stranice obrađuju query parametre iz Stripea.

**Backend**
- \`subscriptionController.createCheckoutSession\` instancira Stripe SDK i kreira session.
- Webhook \`checkout.session.completed\` pokreće aktivaciju pretplate.

**Baza**
- \`Subscription\` čuva \`stripeCheckoutSessionId\`, \`status\`, \`planId\`.
- \`PaymentLog\` bilježi evente iz webhooks.

**Integracije**
- Stripe Checkout hosted page, Webhook handler (Queue/retry).
- Notification servis šalje potvrdu plaćanja korisniku.

**API**
- \`POST /api/subscriptions/checkout\` – kreira session.
- Webhook endpoint \`/api/stripe/webhook\` – potvrđuje plaćanje.
`
    },
    "Plaćanje pretplata preko Stripe": {
      implemented: true,
      summary: "Mjesečne pretplate naplaćujemo preko Stripe Billinga s automatskim obnavljanjem i naplatom kartice.",
      details: `**Kako funkcionira**
- Nakon Checkouta kreira se Stripe subscription s odabranim planom.
- Stripe automatski naplaćuje karticu na renewal datum i obavještava naš backend webhook.
- Krediti/benefiti se dodaju korisniku nakon uspješne naplate.

**Prednosti**
- Nema ručnih naplata; korisnici zadržavaju pristup bez prekida.
- Automatizirane email obavijesti o naplati, isteku kartice i neuspjelim pokušajima.

**Kada koristiti**
- Za sve recurring planove (BASIC/PRO/PREMIUM...).
- Kod promjene plana, pauziranja ili otkazivanja u Stripeu.
`,
      technicalDetails: `**Frontend**
- Sekcija pretplate prikazuje trenutni plan, sljedeću naplatu i link na Stripe customer portal.
- UX omogućuje promjenu nacina plaćanja preko portala.

**Backend**
- Webhook \`invoice.paid\` dodaje kredite i produžuje subscription.
- \`subscriptionService.syncFromStripe\` sinkronizira status (active, past_due, cancelled).

**Baza**
- \`Subscription\` polja \`stripeSubscriptionId\`, \`currentPeriodEnd\`, \`status\`.
- \`CreditTransaction\` zapis za mjesečni allotment kredita.

**Integracije**
- Stripe Billing, Customer Portal, dunning logika (automatizirani retry).
- Email servis šalje potvrde i podsjetnike.

**API**
- \`GET /api/subscriptions/me\` – detalji pretplate.
- \`POST /api/subscriptions/change-plan\` – promjena plana, integrirano sa Stripeom.
`
    },
    "Stripe Payment Intent za kupovinu leadova": {
      implemented: true,
      summary: "Jednokratnu kupovinu leada omogućavamo Stripe Payment Intentom kada nema dovoljno internih kredita.",
      details: `**Kako funkcionira**
- Pri pokušaju kupnje provjeravamo saldo kredita; ako je nedovoljan kreiramo Payment Intent s točnim iznosom leada.
- Korisnik unosi kartične podatke, plaćanje se potvrđuje i lead se označava kupljenim.
- Uspješna uplata dodaje transakciju tipa CARD_PURCHASE i osvježava saldo.

**Prednosti**
- Korisnik ne mora unaprijed kupovati pakete kredita.
- Brz fallback koji sprječava gubitak vrijednog leada.

**Kada koristiti**
- Ad-hoc kupnja leadova bez dostupnih kredita.
- Kod testiranja platforme ili novih korisnika.
`,
      technicalDetails: `**Frontend**
- Modal za unos kartice koristi Stripe Elements.
- Prati status Payment Intenta (requires_action, succeeded) i prikazuje odgovarajući UI.

**Backend**
- \`leadPurchaseController.createPaymentIntent\` kreira intent (amount, currency, metadata).
- Webhook \`payment_intent.succeeded\` finalizira kupnju i emitira event.

**Baza**
- \`LeadPayment\` (leadId, paymentIntentId, status, amount, currency).
- \`CreditTransaction\` zapis tipa CARD_PURCHASE za konsistentnu povijest.

**Integracije**
- Stripe Payment Intents API, 3DSecure support.
- Notification servis šalje potvrdu kupnje.

**API**
- \`POST /api/leads/:id/payment-intent\` – kreira/payment intent.
- Webhook endpoint obrađuje \`payment_intent.*\` događaje.
`
    },
    "Kreiranje Payment Intent-a za pojedinačnu kupovinu leada": {
      implemented: true,
      summary: "Za svaki lead bez pokrivenja kreditima kreiramo zaseban Payment Intent s dinamičkom cijenom.",
      details: `**Kako funkcionira**
- Backend izračuna točan iznos prema lead cjeniku i kreira Payment Intent u Stripeu.
- Metadata uključuje leadId i buyerId radi kasnijeg reconcilea.
- Nakon potvrde uplate lead se automatski označava kao kupljen i postavlja dostupnost u marketplaceu.

**Prednosti**
- Precizno naplaćujemo samo ono što je potrebno.
- Omogućava fleksibilno billing ponašanje (različite cijene po leadu).

**Kada koristiti**
- Kod leadova s custom cijenama ili promotivnim popustima.
- Kad korisnik kupuje jedan lead bez pretplate.
`,
      technicalDetails: `**Frontend**
- Checkout modal prikazuje sažetak leada i iznos iz Payment Intenta.
- Prati \`client_secret\` status sve do potvrde.

**Backend**
- \`paymentIntentService.createForLead\` generira intent i sprema referencu.
- Post-purchase job ažurira analytics i šalje follow-up notifikacije.

**Baza**
- \`PaymentIntentLog\` (intentId, leadId, buyerId, amount, status, createdAt, confirmedAt).
- Relacija prema \`LeadPurchase\`.

**Integracije**
- Stripe Radna okruženja (test/live) s odvojenim ključevima.
- Monitoring/alerting na neuspjele intente.

**API**
- \`POST /api/leads/:id/create-payment-intent\` – vraća \`client_secret\`.
- \`POST /api/leads/:id/confirm-payment\` – opcionalni endpoint za manual capture.
`
    },
    "Plaćanje leadova kroz Stripe (opcionalno, umjesto internih kredita)": {
      implemented: true,
      summary: "Provider može birati između internih kredita i kartičnog plaćanja preko Stripe-a za svaki lead.",
      details: `**Kako funkcionira**
- Kada provider nema dovoljno kredita (ili želi platiti karticom) sustav nudi Stripe Checkout/Payment Intent opciju.
- Plaćanje karticom odmah potvrđuje kupnju leada i kreira kartičnu transakciju.
- Lead je dostupan istog trena, a povijest bilježi metodu plaćanja.

**Prednosti**
- Fleksibilnost plaćanja bez potrebe za održavanjem salda kredita.
- Omogućuje ad-hoc kupnje i testiranje platforme.

**Kada koristiti**
- Novi provideri bez kredita.
- Hitne situacije kada lead treba kupiti odmah, a saldo je nizak.
`,
      technicalDetails: `**Frontend**
- Plaćanje modal s togglom "Koristi kredite" / "Plati karticom".
- Integracija sa Stripe Elements/Checkout za unos kartice.

**Backend**
- \`leadPurchaseService.handleHybridPayment\` odlučuje o metodi i kreira Payment Intent.
- Webhook \`payment_intent.succeeded\` potvrđuje kupnju i bilježi transakciju.

**Baza**
- \`LeadPurchase\` polja \`paymentMethod\`, \`cardPaymentIntentId\`.
- \`CreditTransaction\` i \`PaymentLog\` sinkronizirani za jedinstvenu povijest.

**Integracije**
- Stripe Payment Intents API, notification servis za potvrde.

**API**
- \`POST /api/leads/:id/purchase\` – parametar \`paymentMethod\` određuje rutu.
`
    },
    "Stripe webhook handling": {
      implemented: true,
      summary: "Stripe webhookovi održavaju pretplate i plaćanja usklađenima u realnom vremenu bez ručnih intervencija.",
      details: `**Kako funkcionira**
- Stripe šalje webhook za ključne evente (checkout.session.completed, invoice.payment_succeeded/failed...).
- Backend validira potpis, učitava payload i ažurira pretplate, kredite i status plaćanja.
- Idempotency ključ osigurava da ponovljeni webhook ne duplira radnje.

**Prednosti**
- Automatska sinkronizacija bez cronova ili ručnog praćenja.
- Trenutna vidljivost promjena statusa pretplata i uplata.

**Kada koristiti**
- Za sve Stripe događaje koji mijenjaju stanje pretplate ili kreiraju kredite.
- Kod proširenja na nove planove ili načine plaćanja – dodaje se novi handler.
`,
      technicalDetails: `**Frontend**
- Prikazuje svježe stanje pretplate dobiveno preko API-ja nakon webhook obrade.

**Backend**
- \`stripeWebhookController.handle\` validira \`Stripe-Signature\` i delegira event servisima.
- Idempotency datastore sprema \`eventId\` radi deduplikacije.

**Baza**
- \`WebhookEvent\` tablica bilježi obrađene evente i rezultat.
- Pretplate/krediti se ažuriraju kroz postojeće tablice (\`Subscription\`, \`CreditTransaction\`).

**Integracije**
- Stripe webhook endpoint, queue za retry (npr. SQS) ako obrada zakaže.
- Monitoring/alerting za neuspješne obrade.

**API**
- Webhook endpoint \`POST /api/stripe/webhook\`.
- Klijentski endpointi (npr. \`GET /api/subscriptions/me\`) reflektiraju promjene nakon obrade.
`
    },
    "Automatsko ažuriranje pretplate nakon plaćanja": {
      implemented: true,
      summary: "Potvrda Stripe plaćanja automatski aktivira pretplatu i dodaje kredite bez čekanja admina.",
      details: `**Kako funkcionira**
- Nakon uspješnog Checkouta ili invoice plaćanja, webhook pokreće aktivaciju pretplate.
- Sustav postavlja status na ACTIVE, izračunava period i alocira kredite.
- Korisnik dobiva potvrdu i odmah vidi novo stanje.

**Prednosti**
- Nema ručnih koraka; pretplata je operativna u sekundi.
- Smanjuje broj tiketa podrške oko aktivacije.

**Kada koristiti**
- Kod svake inicijalne kupnje ili obnove pretplate.
- Pri testiranju novih planova kako bi se potvrdio end-to-end tok.
`,
      technicalDetails: `**Frontend**
- Dashboard pretplate oslanja se na API i automatski prikazuje novi status i kredite.

**Backend**
- \`subscriptionService.activate\` ažurira status, period i kreira kreditnu transakciju.
- Event \`subscription.activated\` obavještava ostale servise (analytics, notifications).

**Baza**
- \`Subscription\` polja \`status\`, \`currentPeriodStart\`, \`currentPeriodEnd\`.
- \`CreditTransaction\` zapis za dodijeljene mjesečne kredite.

**Integracije**
- Stripe webhookovi kao okidač, notification servis za potvrde korisniku.
- Analytics sinkronizira nove aktivacije.

**API**
- \`GET /api/subscriptions/me\` i \`GET /api/credits/balance\` odmah reflektiraju novu pretplatu.
`
    },
    "Payment success/failure handling": {
      implemented: true,
      summary: "Sustav razlikuje uspješne i neuspjele naplate, automatski aktivira pretplatu ili šalje upozorenje korisniku.",
      details: `**Kako funkcionira**
- Stripe webhook signalizira \`invoice.payment_succeeded\` ili \`invoice.payment_failed\`.
- Uspjeh aktivira pretplatu, dodaje kredite i šalje potvrdu.
- Neuspjeh postavlja status na PAST_DUE/EXPIRED, šalje email i nudi promjenu kartice.

**Prednosti**
- Transparentno stanje naplate bez ručnog praćenja.
- Brza reakcija korisnika na neuspjele pokušaje smanjuje churn.

**Kada koristiti**
- Praćenje mjesečnih naplata i dunning procesa.
- Analitika naplate (stopa neuspjelih naplata).
`,
      technicalDetails: `**Frontend**
- Banner upozorava na neuspjelo plaćanje i nudi link za ažuriranje kartice.
- Timeline plaćanja prikazuje datum uspjeha/neuspjeha.

**Backend**
- \`billingEventHandler\` razlikuje tip eventa i poziva \`subscriptionService.activate\` ili \`markPastDue\`.
- Queue za ponavljanje obrade ako webhook dođe izvan reda.

**Baza**
- \`Subscription\` čuva \`status\`, \`lastPaymentStatus\`, \`lastPaymentAt\`.
- \`PaymentLog\` evidentira detalje pokušaja naplate.

**Integracije**
- Email/sms obavijesti, Stripe Customer Portal link za ažuriranje kartice.
- Analytics modul prati stopu uspješnosti.

**API**
- \`GET /api/subscriptions/me\` prikazuje status naplate.
- \`POST /api/subscriptions/update-payment-method\` vodi korisnika na Stripe portal.
`
    },
    "Povrat na platformu nakon plaćanja": {
      implemented: true,
      summary: "Nakon Stripe Checkouta korisnik se vraća na potvrđenu stranicu s jasnim statusom pretplate i kredita.",
      details: `**Kako funkcionira**
- Checkout session ima definirane success/cancel URL-ove prema našoj aplikaciji.
- Nakon plaćanja Stripe redirecta korisnika na success stranicu s query parametrima.
- Frontend dohvaća svježe podatke i prikazuje potvrdu.

**Prednosti**
- Kontinuirani UX bez ručnog navigiranja natrag.
- Korisnik odmah vidi rezultat plaćanja i dostupne akcije.

**Kada koristiti**
- Nakon svake kupnje pretplate ili jednokratnog plaćanja.
- Kod custom tokova (upgrade/downgrade) s različitim redirect URL-ovima.
`,
      technicalDetails: `**Frontend**
- Success stranica poziva \`GET /api/subscriptions/me\` i \`GET /api/credits/balance\` te prikazuje potvrdu.
- Cancel stranica nudi retry ili odabir drugog plana.

**Backend**
- Checkout session sadrži \`success_url\` i \`cancel_url\` generirane na serveru.
- Opcionalno se sprema \`sessionId\` radi provjere stanja nakon povratka.

**Baza**
- Nema dodatnih tablica; status se oslanja na postojeće zapise pretplate/kredita.

**Integracije**
- Stripe Checkout redirect logika, analytics event “SubscriptionPurchaseSuccess”.

**API**
- \`GET /api/subscriptions/last-session\` može validirati posljednje plaćanje (opcionalno).
`
    },
    "Sigurnosno skladištenje Stripe secret key u AWS Secrets Manager": {
      implemented: true,
      summary: "Stripe tajni ključevi pohranjuju se u AWS Secrets Manager radi sigurnog i centraliziranog upravljanja.",
      details: `**Kako funkcionira**
- Ključevi se čuvaju u AWS Secrets Manageru, ne u repo-u ni u konfiguracijskim datotekama.
- Aplikacija ih dohvaća pri pokretanju i cacheira kratko u memoriji.
- Rotacija se provodi kroz AWS rotator ili ručno uz minimalni downtime.

**Prednosti**
- Smanjuje rizik curenja ključeva i zadovoljava sigurnosne standarde.
- Centralizirano upravljanje i audit pristupa.

**Kada koristiti**
- Za sve osjetljive Stripe ključeve (secret, webhook, publishable gdje je potrebno).
- Kod rotacije ključeva ili dodavanja novih okruženja.
`,
      technicalDetails: `**Frontend**
- Nema izravne interakcije; publishable key se serve-a iz backend konfiguracije.

**Backend**
- \`configService.getStripeSecret\` dohvaća tajnu iz Secrets Managera s fallback cacheom.
- IAM policy ograničava pristup samo servisima koji ga trebaju.

**Baza**
- Nije primjenjivo; tajne se ne spremaju u bazu.

**Integracije**
- AWS Secrets Manager, optionalno AWS Parameter Store za cache.
- CloudWatch auditi logiraju pristupe tajnama.

**API**
- Nema javnih endpointa; tajne se koriste interno za Stripe SDK inicializaciju.
`
    },
    "Konverzija leadova": {
      implemented: true,
      summary: "Stopa konverzije pokazuje udio kupljenih leadova koji su postali ostvareni poslovi.",
      details: `**Kako funkcionira**
- Svaki lead prolazi kroz funnel (kupnja → kontakt → prihvaćena ponuda → posao) i označava se statusom.
- Konverzija se računa kao omjer konvertiranih leadova i ukupno kupljenih u odabranom periodu.
- Grafikon u dashboardu prikazuje trendove i usporedbe po kategorijama ili lokaciji.

**Prednosti**
- Jasno mjeri učinkovitost prodajnog procesa.
- Pomaže identificirati gdje se leadovi gube u funnelu.

**Kada koristiti**
- Redovito, za procjenu učinka kampanja i budžeta.
- Kod testiranja novih skripti kontaktiranja ili timova.
`,
      technicalDetails: `**Frontend**
- KPI karta i line chart u ROI dashboardu s filtrima (period, kategorija, lokacija).
- Tooltipi prikazuju broj konvertiranih leadova i ukupno kupljenih.

**Backend**
- \`leadAnalyticsService.calculateConversionRate\` agregira podatke po filterima.
- Batch job osvježava agregate (daily) i podržava realtime query.

**Baza**
- Materialized view \`LeadConversionStats\` (providerId, period, purchased, converted, rate).
- Denormalizirani stupci u \`Lead\` za status i timestamps.

**Integracije**
- Analytics pipeline (BigQuery/Redshift) za dublje izvještaje.
- Notification servis može slati sažetak konverzije tjedno.

**API**
- \`GET /api/analytics/leads/conversion-rate\` – vraća metriku po filterima.
- \`GET /api/leads?status=CONVERTED\` – lista svih konvertiranih leadova.
`
    },
    "Ukupan prihod od leadova": {
      implemented: true,
      summary: "Sumarni prihod iz svih konvertiranih leadova daje uvid u ostvarenu vrijednost.",
      details: `**Kako funkcionira**
- Nakon što se posao zatvori, provider unosi ostvareni prihod ili ga sinkroniziramo iz CRM-a.
- Sustav zbraja prihode po periodu, kategoriji ili timu.
- Dashboard prikazuje ukupnu vrijednost, trend liniju i top izvore.

**Prednosti**
- Pruža jasan pokazatelj stvarnog povrata na investiciju.
- Olakšava planiranje budžeta i usporedbu s troškovima.

**Kada koristiti**
- Mjesečni i kvartalni pregled performansi.
- Usporedba učinkovitosti različitih tržišta ili kategorija.
`,
      technicalDetails: `**Frontend**
- Bar chart i KPI widget prikazuju ukupan prihod i promjenu u odnosu na prethodni period.
- Export CSV gumb omogućuje preuzimanje detalja po poslima.

**Backend**
- \`revenueAggregationService.sumLeadRevenue\` koristi lead/job veze i prihode.
- Triggeri ažuriraju agregate kad se promijeni status posla ili prihod.

**Baza**
- \`LeadRevenue\` (leadId, jobId, amount, currency, recordedAt).
- Agregacijska tablica \`LeadRevenueSummary\` (providerId, period, totalAmount, averageAmount).

**Integracije**
- CRM integracije (HubSpot/Pipedrive) syncaju zatvorene poslove i iznose.
- Accounting export koristi iste podatke za fakturiranje.

**API**
- \`GET /api/analytics/leads/revenue\` – vraća ukupan prihod po filterima.
- \`POST /api/jobs/:id/revenue\` – unosi/azurira ostvareni prihod.
`
    },
    "Prosječna vrijednost leada": {
      implemented: true,
      summary: "Prosječna vrijednost prikazuje koliko u prosjeku donosi jedan konvertirani lead.",
      details: `**Kako funkcionira**
- Sustav dijeli ukupan prihod s brojem konvertiranih leadova u zadanim filtrima.
- Prikazuje se KPI i usporedba s ciljanom vrijednošću.
- Može se segmentirati po kategorijama, lokacijama ili kanalima.

**Prednosti**
- Pomaže razumjeti profitabilnost pojedinog leada.
- Otkriva koje kampanje ili kategorije donose najvišu vrijednost.

**Kada koristiti**
- Kod određivanja cijene leadova i planiranja ponuda.
- Analiza nakon marketinških kampanja.
`,
      technicalDetails: `**Frontend**
- KPI kartica s indikatorom promjene (↑/↓) i sparklinom.
- Segmentirani prikaz (tablica) za drill-down.

**Backend**
- \`leadAnalyticsService.calculateAverageValue\` koristi agregirane prihode i broj konverzija.
- Podržava multi-currency konverziju prije računanja prosjeka.

**Baza**
- \`LeadRevenueSummary\` koristi stupce totalAmount i convertedCount.
- Currency conversion tablice za standardizaciju.

**Integracije**
- Analytics engine za A/B testiranje vrijednosti po kanalima.
- Notification servis može slati alert kad prosjek padne ispod praga.

**API**
- \`GET /api/analytics/leads/average-value\` – vraća prosjek i breakdown.
`
    },
    "Ukupno potrošenih kredita": {
      implemented: true,
      summary: "Zbroj svih potrošenih kredita pokazuje koliko je uloženo u kupnju leadova.",
      details: `**Kako funkcionira**
- Svaka kupnja leada zapisuje potrošeni iznos kredita.
- Agregacija sumira potrošnju po periodu, kategoriji ili timu.
- Dashboard prikazuje ukupni trošak, trend i usporedbu s prihodima.

**Prednosti**
- Potpuna transparentnost ulaganja u leadove.
- Omogućuje precizan izračun ROI-ja kada se usporedi s prihodom.

**Kada koristiti**
- Praćenje budžeta i planiranje budućih kupnji.
- Identificiranje prevelike potrošnje u segmentima s lošom konverzijom.
`,
      technicalDetails: `**Frontend**
- KPI widget i stacked bar graf (potrošnja po kategorijama).
- Toggle za prikaz u kreditima ili valuti (konverzija).

**Backend**
- \`creditSpendService.calculateTotal\` sumira transakcije tipa LEAD_PURCHASE.
- Sync s refund servisom umanjuje neto potrošnju.

**Baza**
- \`CreditTransaction\` (type=LEAD_PURCHASE, amount).
- \`CreditSpendSummary\` tablica (providerId, period, totalCredits, netCredits).

**Integracije**
- Analytics dashboard koristi podatke za ROI grafove.
- Export u accounting sustav za evidenciju troškova.

**API**
- \`GET /api/analytics/credits/spent\` – vraća ukupnu potrošnju.
`
    },
    "Ukupno konvertiranih leadova": {
      implemented: true,
      summary: "Broj konvertiranih leadova mjeri koliko je prilika pretvoreno u poslove.",
      details: `**Kako funkcionira**
- Lead se smatra konvertiranim kada korisnik označi posao završenim ili sinkronizirani CRM zatvori deal.
- Sustav broji konverzije u odabranom periodu i segmentira po kategorijama/timu.
- KPI prikazuje apsolutni broj i rast u odnosu na prethodni period.

**Prednosti**
- Brz pregled volumena realiziranih poslova.
- Pomaže procijeniti učinkovitost prodajnog tima.

**Kada koristiti**
- Tjedni i mjesečni izvještaji performansi.
- Praćenje ciljeva (OKR/KPI) za timove.
`,
      technicalDetails: `**Frontend**
- KPI kartica uz mogućnost detaljnog popisa konvertiranih leadova.
- Graf s kumulativnim brojem tijekom perioda.

**Backend**
- \`leadAnalyticsService.countConverted\` broji leadove sa statusom CONVERTED u periodu.
- Cache layer (Redis) drži najtraženije agregate.

**Baza**
- \`Lead\` status CONVERTED i \`convertedAt\` timestamp.
- \`LeadConversionStats\` agregat s poljem convertedCount.

**Integracije**
- CRM sinkronizacija ažurira status i triggera event.
- Notification servis šalje milestone (npr. 100. konverzija) korisniku.

**API**
- \`GET /api/analytics/leads/converted-count\` – broj konverzija po filterima.
- \`GET /api/leads?status=CONVERTED\` – detaljna lista.
`
    },
    "Napredne analitike": {
      implemented: true,
      summary: "Napredni analitički modul daje detaljne metrike, trendove i prediktivne uvide za donošenje odluka.",
      details: `**Kako funkcionira**
- ROI dashboard kombinira podatke o leadovima, prihodima, kreditima i interakcijama te nudi drill-down po kategoriji/kanalu.
- Korisnik može primijeniti filtre (vrijeme, lokacija, kategorija, plan) i generirati usporedne grafove ili tablice.
- Export i schedule report opcije šalju analize na email ili u BI alate.

**Prednosti**
- Dubinski uvid u performanse i trendove platforme.
- Podrška za strateške odluke (budžetiranje, fokus na profitabilne segmente).

**Kada koristiti**
- Periodični review rezultata (tjedno/mjesečno/kvartalno).
- Prije lansiranja novih kampanja ili promjene cjenika.
`,
      technicalDetails: `**Frontend**
- React dashboards s kombinacijom chart komponenti (line/bar/pie) i pivot tablica.
- Lazy-loaded widgets i client-side caching za brže prebacivanje filtera.

**Backend**
- \`analyticsService.getAdvancedMetrics\` orkestrira upite prema agregacijskim tablicama/warehouseu.
- Scheduled job osvježava cache i pokreće prediktivne modele (npr. ARIMA/Prophet) za forecast.

**Baza**
- Data warehouse (BigQuery/Redshift) s denormaliziranim tablicama \`AnalyticsFact\`, \`LeadFact\`, \`RevenueFact\`.
- Materialized views za najčešće upite.

**Integracije**
- ETL pipeline (Airflow/dbt) puni warehouse iz proizvodne baze.
- Slack/Email integracija za scheduled izvještaje.

**API**
- \`GET /api/analytics/advanced\` – vraća metrike po filterima.
- \`POST /api/analytics/reports/schedule\` – kreira automatizirani izvještaj.
`
    },
    "Registracija kao korisnik usluge": {
      implemented: true,
      summary: "Korisnik usluge otvara račun kako bi objavljivao poslove i upravljao ponudama.",
      details: `**Kako funkcionira**
- Registracijski wizard traži osnovne podatke (ime, email, lozinka) i potvrdu emaila.
- Nakon aktivacije, korisnik dobiva pristup dashboardu s vodičem za objavu prvog posla.
- Dodatne informacije (telefon, adresa) mogu se dodati kasnije radi verifikacije.

**Prednosti**
- Brz onboarding uz minimalan broj koraka.
- Odmah omogućuje objavu posla i komunikaciju s pružateljima.

**Kada koristiti**
- Svaki novi klijent koji traži uslugu na platformi.
- Tijekom kampanja kada se korisnike poziva da objave prve poslove.
`,
      technicalDetails: `**Frontend**
- React multi-step forma s validacijom (Formik/Yup) i reCAPTCHA zaštitom.
- Success ekran nudi CTA za objavu posla i postavljanje profila.

**Backend**
- \`authController.registerClient\` kreira korisnika, šalje email verifikaciju i inicijalne preference.
- Audit log bilježi IP/device podatke u skladu s GDPR-om.

**Baza**
- Tablice \`User\`, \`ClientProfile\` (name, contact, preferences).
- \`EmailVerification\` povezana s korisnikom.

**Integracije**
- Email servis (SES/SendGrid) za verifikaciju.
- Analytics event "client_registered" za praćenje akvizicije.

**API**
- \`POST /api/auth/register-client\` – kreira korisnika usluge.
- \`POST /api/auth/verify-email\` – potvrđuje registraciju.
`
    },
    "Odabir tipa korisnika (Korisnik usluge / Pružatelj usluge)": {
      implemented: true,
      summary: "Tijekom registracije korisnik odabire želi li koristiti platformu kao klijent, provider ili oboje.",
      details: `**Kako funkcionira**
- Prvi korak registracije nudi izbor role; UI prikazuje razlike i benefite za svaku rolu.
- Odabrana rola aktivira relevantne onboarding checkliste (objavi posao vs. postavi profil).
- Kasnije se u postavkama može dodati/ukloniti dodatna rola uz brzi onboarding.

**Prednosti**
- Jedinstven račun koji može obavljati obje funkcije.
- Fokusirani onboarding i navigacija prilagođena ulozi.

**Kada koristiti**
- Pri inicijalnoj registraciji.
- Kada postojeći korisnik proširuje poslovanje i želi preći u drugu ulogu.
`,
      technicalDetails: `**Frontend**
- Toggle/role card selector s animacijama i listom funkcionalnosti po ulozi.
- Conditional routing nakon registracije na odgovarajući dashboard.

**Backend**
- \`userRoleService.assignRoles\` dodaje rolu i pokreće pripadajuće onboarding taskove.
- Event \`user.role.changed\` sinkronizira navigaciju, permissions i notifikacije.

**Baza**
- \`UserRole\` povezuje korisnika s rolama (CLIENT, PROVIDER).
- Onboarding tablice (\`OnboardingTask\`) označavaju dovršene korake po ulozi.

**Integracije**
- Notification servis šalje upute za novu rolu.
- Analytics prati konverzije role-switch scenarija.

**API**
- \`POST /api/users/roles\` – dodavanje dodatne role.
- \`GET /api/users/me\` – vraća aktivne role i onboarding status.
`
    },
    "Fizička osoba vs Pravna osoba za korisnike": {
      implemented: true,
      summary: "Korisnici označavaju jesu li fizička ili pravna osoba kako bi dobili prilagođene opcije i dokumentaciju.",
      details: `**Kako funkcionira**
- Tijekom registracije ili u profilu korisnik bira tip (fizička/pravno lice) te ispunjava relevantne podatke.
- Pravne osobe unose dodatne podatke za fakturiranje (tvrtka, OIB, adresa, kontakt osoba).
- Sustav koristi tip za prilagođavanje pravila, ugovora i faktura.

**Prednosti**
- Omogućuje pravilan billing i pravnu usklađenost.
- Personalizirani UX (npr. B2B savjeti, dodatna polja za dokumente).

**Kada koristiti**
- Pri prvom unosu podataka o korisniku.
- Kada korisnik mijenja pravni status (npr. prelazak na firmu).
`,
      technicalDetails: `**Frontend**
- Dynamic forma koja prikazuje različita polja ovisno o odabranom tipu.
- Validacija specifična za pravne osobe (OIB format, naziv tvrtke).

**Backend**
- \`clientProfileService.updateEntityType\` sprema tip i validira obavezna polja.
- Generira različite predloške ugovora za e-signature.

**Baza**
- \`ClientProfile\` polja \`entityType\`, \`companyName\`, \`oib\`, \`billingAddress\`.
- Povijest promjena entiteta radi audita.

**Integracije**
- Invoice/billing servis koristi podatke za izdavanje računa.
- KYC servis provodi dodatne provjere za pravne osobe.

**API**
- \`PATCH /api/client-profile\` – ažurira tip i podatke.
- \`GET /api/client-profile\` – vraća konfigurirane podatke.
`
    },
    "Profil korisnika usluge (UserProfile)": {
      implemented: true,
      summary: "Dashboard korisnika usluge prikazuje poslove, ponude i komunikaciju na jednom mjestu.",
      details: `**Kako funkcionira**
- Nakon prijave korisnik ulazi na profil/dashboard gdje vidi aktivne, zatvorene i arhivirane poslove.
- Kartice prikazuju ponude, status, dogovorene termine i povezana chatroom-a.
- Dostupne su akcije: uređivanje detalja posla, prihvat/odbijanje ponuda, ocjenjivanje pružatelja.

**Prednosti**
- Centralizirano upravljanje svim poslovima i komunikacijom.
- Bolja transparentnost i praćenje napretka.

**Kada koristiti**
- Svaki put kada korisnik želi pregledati ili upravljati poslom.
- Nakon završetka posla za ocjenjivanje i arhiviranje.
`,
      technicalDetails: `**Frontend**
- React dashboard s tabovima (Aktivni, U tijeku, Završeni) i real-time badgevima.
- Integracija s chat widgetom i notifikacijama.

**Backend**
- \`jobQueryService.listForClient\` vraća poslove s agregiranim ponudama i chat statusom.
- \`reviewService\` i \`jobStatusService\` obrađuju akcije s profila.

**Baza**
- Tablice \`Job\`, \`Offer\`, \`JobChatRoom\`, \`JobReview\` vezane FK-ovima.
- Denormalizirani view \`ClientJobSummary\` za brze upite.

**Integracije**
- Notification servis šalje update kada stigne nova ponuda ili poruka.
- Analytics prati engagement (broj prijava, odziv).

**API**
- \`GET /api/client/jobs\` – lista poslova i ponuda.
- \`POST /api/client/jobs/:id/actions\` – akcije (zatvori, arhiviraj, ocijeni).
`
    },
    "Objavljivanje poslova od strane korisnika": {
      implemented: true,
      summary: "Korisnik objavljuje posao s opisom, lokacijom i budžetom te automatski informira relevantne pružatelje.",
      details: `**Kako funkcionira**
- Formular vodi kroz unos naslova, opisa, kategorije, lokacije, budžeta, roka i priloga.
- Nakon pohrane posao dobiva status OPEN i prikazuje se providerima koji zadovoljavaju kriterije.
- Korisnik može kasnije urediti detalje ili promijeniti status (U TIJEKU, ZAVRŠEN, OTKAZAN).

**Prednosti**
- Transparentan brief povećava kvalitetu pristiglih ponuda.
- Automatizirano obavještavanje štedi vrijeme i ubrzava pronalazak pružatelja.

**Kada koristiti**
- Kada korisnik treba novu uslugu ili projekt.
- Kod ponovnog aktiviranja starog posla uz ažurirane uvjete.
`,
      technicalDetails: `**Frontend**
- React multi-step forma s validacijom (opis ≥ X znakova, foto upload, geolokacija).
- Draft autosave i prikaz previewa prije objave.

**Backend**
- \`jobController.create\` validira payload, generira slug i emitira \`job.created\` event.
- Workflow servis određuje eligibility providerima i otvara chat kanal.

**Baza**
- Tablica \`Job\` (title, description, categoryId, location, budgetMin/Max, status, ownerId).
- \`JobAttachment\` i \`JobStatusHistory\` prate dodatke i izmjene.

**Integracije**
- Notification servis šalje push/email providerima u odgovarajućim kategorijama.
- Geocoding servis normalizira adresu i spremi koordinatu za matchmaking.

**API**
- \`POST /api/client/jobs\` – kreira posao.
- \`PATCH /api/client/jobs/:id\` – uređuje detalje ili status.
`
    },
    "Pregled vlastitih poslova (MyJobs)": {
      implemented: true,
      summary: "Dashboard klijenta prikazuje poslove, statuse i pristigle ponude na jednom mjestu.",
      details: `**Kako funkcionira**
- Lista grupira poslove po statusu i prikazuje ključne metrike (broj ponuda, zadnja aktivnost, rok).
- Korisnik može filtrirati po kategoriji, lokaciji ili vremenskom rasponu te otvoriti detalj posla.
- Iz istog sučelja moguće je mijenjati status, uređivati sadržaj i arhivirati završene poslove.

**Prednosti**
- Centraliziran pregled olakšava upravljanje većim brojem projekata.
- Brze akcije smanjuju potrebu za navigacijom kroz više zaslona.

**Kada koristiti**
- Svakodnevno praćenje aktivnih poslova.
- Nakon završetka posla radi ocjenjivanja i arhiviranja.
`,
      technicalDetails: `**Frontend**
- Tabbed layout s lazy-loadingom i badgevima podsjetnika (npr. nova ponuda).
- Inline akcije (status dropdown, quick reply) i integrirani chat sidebar.

**Backend**
- \`jobQueryService.listForClient\` vraća agregirane podatke (offersCount, lastMessageAt, unreadCount).
- \`jobActionService\` obavlja tranzicije statusa uz audit log.

**Baza**
- View \`ClientJobSummary\` spaja \`Job\`, \`Offer\`, \`JobChatRoom\`, \`JobReview\`.
- Indeksi na \`status\` i \`ownerId\` radi brzog listanja.

**Integracije**
- Notification servis sinkronizira broj novih ponuda/poruka.
- Analytics prati engagement i prosječno vrijeme odgovora klijenata.

**API**
- \`GET /api/client/jobs\` – lista.
- \`GET /api/client/jobs/:id\` – detalj s ponudama i porukama.
`
    },
    "Primanje ponuda za poslove": {
      implemented: true,
      summary: "Korisnik prima ponude s cijenom, porukom i procijenjenim rokom od relevantnih pružatelja.",
      details: `**Kako funkcionira**
- Kada provider pošalje ponudu, klijent dobiva notifikaciju i badge u MyJobs.
- Ponuda prikazuje iznos, opis, procijenjeni rok, profil providera i njegove recenzije.
- Klijent može odgovoriti u chatu, postaviti pitanja, odbiti ili prihvatiti ponudu.

**Prednosti**
- Više opcija omogućuje usporedbu cijene i kvalitete.
- Sve komunikacije i dokumenti ostaju vezani uz posao.

**Kada koristiti**
- Nakon objave posla dok se ponude prikupljaju.
- Kod pregovora oko detalja posla prije prihvaćanja.
`,
      technicalDetails: `**Frontend**
- Offer list komponenta s tagovima (novo, ažurirano) i quick actions (reply, accept, reject).
- Chat panel se otvara inline uz ponudu radi kontinuiteta razgovora.

**Backend**
- \`offerService.create\` validira dopuštene statuse i sprema ponudu.
- Event \`offer.submitted\` pokreće notifikacije i update brojača.

**Baza**
- \`Offer\` tablica (jobId, providerId, amount, message, etaDays, status, createdAt).
- \`OfferRevision\` čuva izmjene ponude.

**Integracije**
- Notification servis (email/push/SMS) obavještava klijenta o novim ponudama.
- Analytics modul prati stopu prihvaćanja po provideru.

**API**
- \`GET /api/client/jobs/:id/offers\` – lista ponuda.
- \`POST /api/client/offers/:id/reply\` – poruka/protupredlog.
`
    },
    "Prihvaćanje ponuda": {
      implemented: true,
      summary: "Klijent odabire ponudu, posao prelazi u status U TIJEKU, a chat i zadaci se aktiviraju.",
      details: `**Kako funkcionira**
- Klikom na "Prihvati" sustav potvrđuje dostupnost ponude i zaključava druge ponude.
- Posao prelazi u status IN_PROGRESS, generira se ugovor/task lista i otvara escrow (ako postoji).
- Provider i klijent dobivaju notifikacije te mogu nastaviti komunikaciju u dedikiranom kanalu.

**Prednosti**
- Automatizira prijelaz iz pregovora u realizaciju.
- Osigurava da su svi uključeni obaviješteni i da postoji audit trag.

**Kada koristiti**
- Kada je klijent zadovoljan ponudom i spreman započeti rad.
- Kod promjene odabira (ponovni izbor druge ponude nakon otkazivanja).
`,
      technicalDetails: `**Frontend**
- Confirm modal s rezimeom ponude i uvjetima.
- Status badge i timeline na kartici posla ažuriraju se u realnom vremenu.

**Backend**
- \`offerService.accept\` provodi tranzakciju: ažurira job status, zaključava ponudu, emitira \`job.started\`.
- Integracijski hook aktivira eventualne escrow/invoice procese.

**Baza**
- \`Offer\` status ACCEPTED, \`Job\` status IN_PROGRESS.
- \`JobTimelineEvent\` zapisuje akciju s korisnikom i vremenom.

**Integracije**
- Notification servis šalje potvrde oboma.
- Task/escrow/billing servisi kreću planirane radnje.

**API**
- \`POST /api/client/offers/:id/accept\` – prihvat ponude.
- \`POST /api/client/offers/:id/reject\` – odbij alternativa.
`
    },
    "Navigacija specifična za korisnike": {
      implemented: true,
      summary: "UI prikazuje navigacijske stavke relevantne klijentima (poslovi, ponude, chat, profil).",
      details: `**Kako funkcionira**
- Nakon logina s rolom CLIENT generira se navigacijska shema prilagođena korisniku usluge.
- Linkovi vode na objavu posla, listu poslova, ponude, chat i postavke profila.
- Navigacija se dinamički osvježava kada korisnik doda dodatnu rolu ili promijeni status.

**Prednosti**
- Uklanja distrakcije i ubrzava pronalazak ključnih funkcija.
- Pruža konzistentan UX između weba i mobilnih aplikacija.

**Kada koristiti**
- Svaki put kad se korisnik prijavi kao klijent.
- Nakon promjene role (dodavanje providera) radi ažuriranja menija.
`,
      technicalDetails: `**Frontend**
- Role-aware navigation konfiguracija (React context) s guardovima.
- Highlight/notification badges prikazuju broj novih ponuda ili poruka.

**Backend**
- \`navigationService.getClientMenu\` vraća konfiguraciju na temelju uloga i feature flagova.
- Feature toggle sustav skriva/otkriva stavke prema planu pretplate.

**Baza**
- Nema zasebne tablice; oslanja se na \`UserRole\` i \`FeatureToggle\` zapise.

**Integracije**
- Notification count servis puni badgeve (offers, chat messages).
- A/B testing platforma može servirati različite varijacije menija.

**API**
- \`GET /api/navigation\` – vraća konfiguraciju menija za prijavljenog korisnika.
`
    },
    "Sakrivanje provider-specifičnih linkova za korisnike": {
      implemented: true,
      summary: "Klijentska navigacija skriva provider funkcionalnosti (leadovi, ROI dashboard, pretplate).",
      details: `**Kako funkcionira**
- Role guard provjerava korisnikove uloge i uklanja stavke koje pripadaju provider iskustvu.
- UI i API sloj provode autorizaciju kako linkovi ne bi bili dostupni ni direktnim URL-om.
- Kada korisnik dobije i provider rolu, meni se proširuje uz onboardingske upute.

**Prednosti**
- Čist i fokusiran korisnički doživljaj.
- Smanjuje mogućnost grešaka i zbunjenosti oko nedostupnih funkcija.

**Kada koristiti**
- Za sve korisnike koji imaju samo CLIENT rolu.
- Nakon uklanjanja provider role radi čišćenja menija.
`,
      technicalDetails: `**Frontend**
- Conditional rendering na navigacijskim komponentama prema \`userRoles\`.
- Route guards vraćaju korisnika na početnu ako pokušaju pristupiti provider ruti.

**Backend**
- Middleware \`requireProviderRole\` štiti provider API rute.
- Navigation config endpoint filtrira stavke prije slanja frontendu.

**Baza**
- Oslanja se na \`UserRole\`; nema dodatnih tablica.

**Integracije**
- Feature flag sustav omogućuje npr. beta pristup odabranim klijentima.
- Analytics prati koliko korisnika prelazi na dual-role scenarij.

**API**
- \`GET /api/navigation\` – vraća filtriranu listu.
- Provider specifični API endpointi vraćaju 403 kada rola nedostaje.
`
    },
    "Različiti pravni statusi (Fizička osoba, Obrt, d.o.o., j.d.o.o., itd.)": {
      implemented: true,
      summary: "Registracija podržava različite pravne oblike i automatski traži relevantne podatke i verifikacije.",
      details: `**Kako funkcionira**
- Tijekom onboardinga korisnik odabire pravni status (fizička osoba, obrt, d.o.o., j.d.o.o., ostalo).
- Aplikacija prema odabiru prikazuje potrebne podatke (OIB, matični broj, naziv pravne osobe...).
- Backend pokreće odgovarajuće verifikacijske workflowe (sudski/obrtni registar, dodatni dokumenti).

**Prednosti**
- Usklađenost sa zakonodavstvom i pravilno prikupljanje metapodataka.
- Personalizirano iskustvo – korisnik vidi samo obvezne korake za svoj status.

**Kada koristiti**
- Prilikom registracije ili kasnijeg uređivanja profila.
- Kod promjene pravnog oblika (npr. prelazak s obrta na d.o.o.).
`,
      technicalDetails: `**Frontend**
- Onboarding wizard prikazuje dinamičke forme prema izabranom statusu.
- Badge/label na profilu označava deklarirani status.

**Backend**
- \`legalEntityService.upsertStatus\` sprema odabir i validira podatke.
- Workflow triggera verificiranje (sudski registar, ručni review) ovisno o statusu.

**Baza**
- \`ProviderProfile.legalStatus\`, \`BusinessVerification\` (registryId, status, reviewedAt).
- Audit tablice prate promjene pravnog statusa.

**Integracije**
- Sudski/obrtni registri (API/scraper), dokument management za upload dokaza.

**API**
- \`POST /api/providers/legal-status\` – spremanje/izmjena statusa.
- \`GET /api/providers/:id/verification\` – status verifikacije pravnog oblika.
`
    },
    "OIB validacija": {
      implemented: true,
      summary: "Sustav provjerava format i postojanje OIB-a prije nego ga spremi u profil ili dokumentaciju.",
      details: `**Kako funkcionira**
- Klijent ili provider unosi OIB kroz formu; frontend radi osnovnu check-sum provjeru.
- Backend dodatno validira kroz algoritam kontrole te opcionalno poziva vanjski registar (npr. FINA) za potvrdu.
- Rezultat verifikacije sprema se u profil i podiže trust score / status verifikacije.

**Prednosti**
- Smanjuje rizik unosa netočnih ili lažnih podataka.
- Automatski ispunjava zahtjeve za fiskalizaciju i izdavanje računa.

**Kada koristiti**
- Tijekom onboardinga korisnika i providera.
- Kod dodavanja pravnih dokumenata ili promjene podataka tvrtke.
`,
      technicalDetails: `**Frontend**
- Input s maskom, check-sum validacijom i instant feedbackom.
- Tooltip objašnjava gdje pronaći OIB i zašto je potreban.

**Backend**
- \`oibValidator.validate\` implementira algoritam kontrole i poziva FINA API po potrebi.
- Rezultat čuva status (PENDING, VERIFIED, REJECTED) i razlog odbijanja.

**Baza**
- \`ClientVerification\` / \`ProviderVerification\` polja \`oib\`, \`oibStatus\`, \`oibVerifiedAt\`.
- Log tablica za pokušaje verifikacije.

**Integracije**
- FINA/ministarstvo API za provjeru.
- Notification servis šalje obavijest o uspjehu/neuspjehu.

**API**
- \`POST /api/verifications/oib\` – pokreće verifikaciju.
- \`GET /api/verifications/oib-status\` – vraća rezultat.
`
    },
    "Naziv tvrtke/obrta": {
      implemented: true,
      summary: "Provider dodaje službeni naziv tvrtke/obrta koji se prikazuje klijentima na profilu, ponudama i računima.",
      details: `**Kako funkcionira**
- Tijekom onboardinga ili kasnije u postavkama unosite naziv tvrtke/obrta.
- Naziv se prikazuje u karticama ponuda, chatu i dokumentima (fakture, ugovori).
- Promjene prolaze kroz kratku validaciju kako bi se izbjegla zloupotreba brandova.

**Prednosti**
- Pruža profesionalni identitet i prepoznatljivost klijentima.
- Usklađuje podatke na svim touchpointima (profil, emailovi, PDF-ovi).

**Kada koristiti**
- Obavezno pri registraciji providera.
- Kad se tvrtka rebrendira ili promijeni pravni oblik.
`,
      technicalDetails: `**Frontend**
- Profil forma s instant previewom profila i validacijom duljine/znakova.
- Tooltip savjetuje korištenje službenog naziva koji je u registrima.

**Backend**
- \`providerProfileService.updateCompanyName\` validira unikatan prikaz i auditira promjene.
- Event \`provider.company-name.updated\` sinkronizira CRM i marketing liste.

**Baza**
- \`ProviderProfile\` polje \`companyName\` + \`companySlug\` za URL prikaz.
- Audit tablica \`ProviderProfileChange\` bilježi staru/novu vrijednost.

**Integracije**
- Billing/fakturiranje preuzima naziv u zaglavlja računa.
- Marketing email predlošci koriste naziv u personalizaciji.

**API**
- \`PATCH /api/provider/profile/company-name\` – ažurira naziv.
- \`GET /api/provider/profile\` – vraća aktualne podatke za profil.
`
    },
    "Auto-verifikacija naziva tvrtke (Sudski registar, Obrtni registar)": {
      implemented: true,
      summary: "Naziv i OIB tvrtke automatski se provjeravaju u službenim registrima odmah nakon unosa. Prava integracija s Sudskim registrom API i scraping Obrtnog registra.",
      details: `**✅ POTPUNO IMPLEMENTIRANO**: Prava integracija s Sudskim registrom API (OAuth autentifikacija) i scraping Obrtnog registra. Automatska provjera se izvršava pri registraciji i ažuriranju profila.

**Kako funkcionira**
- **Sudski registar (d.o.o., j.d.o.o.)**: 
  - Koristi službeni API na https://sudreg-data.gov.hr/api/
  - OAuth 2.0 autentifikacija s Client ID i Client Secret
  - Provjera aktivnosti tvrtke (status = 1 = aktivna)
  - Automatski izvlači službeni naziv tvrtke iz registra
- **Obrtni registar (Obrt, Paušalni obrt)**:
  - Scraping sa https://pretrazivac-obrta.gov.hr/pretraga
  - Provjera postojanja obrta preko OIB-a vlasnika
  - Detekcija WAF zaštite i fallback na dokument upload
- Ako se naziv i OIB podudaraju, status verifikacije prelazi u VERIFIED i dodjeljuje se business badge.
- Neslaganja generiraju upozorenje i zahtjev za ručnu provjeru ili dokumentaciju.

**Prednosti**
- Eliminira ručne provjere i ubrzava onboarding.
- Smanjuje rizik od lažnih profila i čuva reputaciju marketplacea.
- Automatska provjera pri registraciji - korisnik ne mora čekati.

**Kada koristiti**
- Tijekom inicijalnog unosa poslovnih podataka ili kasnije promjene naziva.
- Kod periodične revizije pravnog statusa.
- Automatski se poziva pri registraciji PROVIDER-a s OIB-om i nazivom tvrtke.
`,
      technicalDetails: `**Frontend**
- Forma prikazuje realtime status (Provjera u tijeku, Verificirano, Upozorenje) i CTA za upload dokumenata ako provjera padne.
- Tooltip objašnjava iz kojih registara dolaze podaci.
- \`ProviderRegister.jsx\` poziva \`POST /api/kyc/verify-company-name\` za realtime provjeru.

**Backend**
- \`lib/kyc-verification.js\`:
  - \`checkSudskiRegistar(oib, companyName)\`: Prava integracija s Sudskim registrom API
    - OAuth 2.0 token request: \`POST https://sudreg-data.gov.hr/api/oauth/token\`
    - Company lookup: \`GET https://sudreg-data.gov.hr/api/javni/detalji_subjekta?tip_identifikatora=oib&identifikator={oib}\`
    - Retry logika za 503 greške (3 pokušaja)
    - Vraća \`verified: true\`, \`active: true/false\`, službeni naziv, adresu, status
  - \`checkObrtniRegistar(oib, companyName)\`: Scraping Obrtnog registra
    - GET forma sa https://pretrazivac-obrta.gov.hr/pretraga
    - POST pretraga s OIB-om vlasnika
    - Parsiranje HTML rezultata s Cheerio
    - Detekcija WAF zaštite (F5 Big-IP)
    - Vraća \`verified: true\` ako je OIB pronađen u rezultatima
- \`routes/kyc.js\`:
  - \`POST /api/kyc/verify-company-name\`: Provjera naziva tvrtke (realtime)
  - \`POST /api/kyc/auto-verify\`: Automatska provjera pri registraciji
- \`routes/auth.js\`: Automatska provjera pri registraciji PROVIDER-a (linija 120-195)
  - Poziva \`checkSudskiRegistar\` ili \`checkObrtniRegistar\` ovisno o pravnom statusu
  - Automatski dodjeljuje business badge ako je verificiran

**Baza**
- \`ProviderProfile\` polja \`kycObrtnRegChecked\`, \`kycKamaraChecked\` za praćenje provjera.
- \`badgeData\` JSON polje za spremanje badge informacija (BUSINESS badge s source: SUDSKI_REGISTAR ili OBRTNI_REGISTAR).

**Environment Variables**
- \`SUDREG_CLIENT_ID\`: Client ID za Sudski registar API
- \`SUDREG_CLIENT_SECRET\`: Client Secret za Sudski registar API
- Ako nisu postavljeni, Sudski registar provjera vraća \`verified: false\` s porukom da treba postaviti credentials

**Integracije**
- Sudski/Obrtni registar (REST/SOAP scraping), cache sloj (Redis) za throttling.

**API**
- \`POST /api/verification/business/auto\` – pokreće automatsku provjeru.
- \`GET /api/verification/business/:id\` – vraća status i povijest provjera.
`
    },
    "Porezni broj": {
      implemented: true,
      summary: "Pružatelj unosi porezni broj radi ispravnog fakturiranja i porezne usklađenosti.",
      details: `**Kako funkcionira**
- Pri registraciji ili u postavkama provider upisuje porezni broj (npr. PDV ID, VAT broj).
- Sustav provodi osnovnu validaciju formata i čuva podatak šifriran.
- Porezni broj koristi se u fakturama, ponudama i ugovorima.

**Prednosti**
- Osigurava usklađenost s poreznim propisima i ispravne dokumente.
- Smanjuje potrebu za ručnim unosom kod svakog izdavanja računa.

**Kada koristiti**
- Obavezno prije izdavanja prvog računa ili prijema naplate.
- Kod promjene poreznog statusa (npr. ulazak/izlazak iz PDV sustava).
`,
      technicalDetails: `**Frontend**
- Input s maskom i helper tekstom (primjeri formata po zemlji).
- Validation badge obavještava ako format nije ispravan.

**Backend**
- \`taxInfoService.updateTaxNumber\` validira format i pohranjuje podatak.
- Event \`provider.tax-number.updated\` sinkronizira billing i accounting servise.

**Baza**
- \`ProviderTaxInfo\` (providerId, taxNumber, country, isVatPayer).
- Audit log čuva povijest promjena i korisnika koji je ažurirao podatak.

**Integracije**
- VIES/EU VAT check (po potrebi) za međunarodne providere.
- Accounting modul preuzima broj u PDF fakture.

**API**
- \`PATCH /api/provider/tax-info\` – ažurira porezni broj i status.
- \`GET /api/provider/tax-info\` – dohvaća spremljene podatke.
`
    },
    "Team Locations - geo-dinamičke lokacije": {
      implemented: true,
      summary: "Timovi definiraju dinamičke lokacije rada koje se osvježavaju u realnom vremenu radi preciznog matchinga.",
      details: `**Kako funkcionira**
- Pružatelj dodaje više lokacija (uredi, vozila, zone) i definira radijus pokrivenosti.
- Lokacije se ažuriraju ručno, putem mobilne aplikacije ili telemetrijskih integracija.
- Matcher koristi najbližu aktivnu lokaciju za dodjelu poslova i prikaz korisnicima.

**Prednosti**
- Odražava stvarnu dostupnost mobilnih timova.
- Poboljšava točnost preporuka i smanjuje vrijeme putovanja.

**Kada koristiti**
- Kod službi koje imaju terenske ekipe ili više poslovnica.
- Kada lokacije često mijenjaju status (sezonski rad, dežurstva).
`,
      technicalDetails: `**Frontend**
- Karta s markerima i radijusima; mobilna aplikacija prikazuje vlastitu lokaciju i status.
- Update forma omogućuje masovno uređivanje i aktivaciju/deaktivaciju.

**Backend**
- \`teamLocationService.upsert\` pohranjuje lokacije i emitira \`team.location.changed\`.
- Cron job deaktivira lokacije bez heartbeat-a u zadanom roku.

**Baza**
- \`TeamLocation\` (teamId, label, geoJson, radiusKm, status, updatedAt).
- PostGIS omogućuje geo upite i indeksiranje.

**Integracije**
- Telemetry/IoT feed (GPS uređaji) i logistički sustavi.
- Notification servis šalje upozorenja ako lokacija nije osvježena.

**API**
- \`POST /api/team/locations\` – kreira/azurira lokacije.
- \`GET /api/team/locations\` – vraća aktivne lokacije i metapodatke.
`
    },
    "Upravljanje tim lokacijama": {
      implemented: true,
      summary: "Adminsko sučelje omogućuje dodavanje, uređivanje i deaktivaciju geo lokacija tima.",
      details: `**Kako funkcionira**
- Role-based UI omogućuje vlasnicima/menadžerima da kreiraju lokacije, postave radijus i radno vrijeme.
- Lokacije se mogu grupirati (npr. vozni park) i privremeno deaktivirati.
- Svaka promjena odmah utječe na matchmaking i prikaze korisnicima.

**Prednosti**
- Drži podatke o pokrivenosti točnima bez intervencije developera.
- Pruža audit trag za compliance i planiranje.

**Kada koristiti**
- Kada se otvara nova podružnica ili se mijenja operativna zona.
- Kod privremenog gašenja lokacije (renovacija, sezonska pauza).
`,
      technicalDetails: `**Frontend**
- 'TeamLocationManager' s CRUD tablicom, map komponentom i role guardovima.
- Bulk akcije (aktiviraj/deaktiviraj, promijeni radijus) i prikaz audit loga.

**Backend**
- \`teamLocationService\` osigurava transakcijski update i audit (tko, kada, što).
- Event \`team.location.updated\` invalidira cache i reindeksira geo pretrage.

**Baza**
- \`TeamLocation\` dodatna polja \`isActive\`, \`coverageType\`, \`workingHoursJson\`.
- Audit tablica \`TeamLocationChange\` (userId, action, payload).

**Integracije**
- Logistics modul koristi lokacije za ETA kalkulacije.
- Analytics mjeri performanse i potražnju po lokaciji.

**API**
- \`PATCH /api/team/locations/:id\` – uređivanje.
- \`DELETE /api/team/locations/:id\` – deaktivacija ili uklanjanje.
- \`GET /api/team/locations/history\` – audit trail.
`
    },
    "Radius checking za lokacije": {
      implemented: true,
      summary: "Poslovi se dodjeljuju lokacijama koje pokrivaju određeni radijus ili poligon, uz opcionalne nadoplate za udaljene zone.",
      details: `**Kako funkcionira**
- Svaka lokacija definira radijus ili poligon pokrivenosti te pravila cijena.
- Kod pojave novog posla geo servis izračuna udaljenost i provjeri poklapa li se s pokrivenošću.
- Ako je izvan zone, sustav nudi alternativne timove ili naplatu dodatka.

**Prednosti**
- Sprječava dodjelu poslova timovima izvan realnog dosega.
- Omogućuje fleksibilnu politiku cijena za udaljene klijente.

**Kada koristiti**
- On-demand servisi i hitne intervencije gdje je brzina ključna.
- Kada se želi diferencirati cijena po zonama (grad, prigrad, ruralno).
`,
      technicalDetails: `**Frontend**
- Map overlay prikazuje zone pokrivenosti i označava je li adresa unutar/izvan radijusa.
- Upozorenja objašnjavaju dodatne troškove za udaljene zone.

**Backend**
- \`coverageService.check\` koristi PostGIS ST_Within/ST_Distance i Haversine gdje PostGIS nije dostupan.
- Engine vraća listu kompatibilnih timova i eventualni surcharge.

**Baza**
- \`CoverageRule\` (locationId, geometry, radiusKm, surchargeType, surchargeAmount).
- Cache sloj (Redis) čuva precomputed zone radi performansi.

**Integracije**
- Dispatch/logistics sustav preuzima rezultat pri alokaciji zadataka.
- Analytics izvještaji mjere postotak odbijenih poslova zbog udaljenosti.

**API**
- \`POST /api/coverage/check\` – provjera pokrivenosti za zadani posao.
- \`GET /api/team/locations/:id/coverage\` – vraća konfigurirane zone.
`
    },
    "Haversine formula za udaljenost": {
      implemented: true,
      summary: "Za precizne geo izračune koristimo Haversine formulu (udaljenost dvije točke na Zemlji).",
      details: `**Kako funkcionira**
- Latitude/longitude koordinati pretvaramo u udaljenost u kilometrima koristeći Haversine formulu.
- Rezultat se koristi u filtrima, sortiranju i provjerama pokrivenosti.
- Optimizacije u bazi (PostGIS) smanjuju potrošnju CPU-a kod velikih upita.

**Prednosti**
- Precizniji izračun udaljenosti nego linearni modeli.
- Omogućuje točne SLA kalkulacije i geografske preporuke.

**Kada koristiti**
- Matchmaking između klijenta i providera po udaljenosti.
- Logistika, planiranje ruta i analiza pokrivenosti.
`,
      technicalDetails: `**Frontend**
- Prikazuje udaljenost (km) u rezultatima pretrage i detalju posla.
- Karta vizualizira radijus i rute na temelju udaljenosti.

**Backend**
- \`geoService.calculateDistance\` implementira Haversine (fallback ako PostGIS nije dostupan).
- PostGIS funkcije \`ST_DistanceSphere\`/\`ST_DistanceSpheroid\` koriste se za masovne izračune.

**Baza**
- Geo kolone indeksirane (GiST/SP-GiST) radi brzih upita.
- Denormalizirane kolone s posljednje izračunatom udaljenosti za caching.

**Integracije**
- Logistics/pricing modeli i SLA kalkulatori.
- Analytics prati prosječnu udaljenost realiziranih poslova.

**API**
- \`GET /api/geo/distance\` – helper endpoint za udaljenost.
- Svi geo filter parametri (lat/lng/radius) u pretragama koriste ovaj servis.
`
    },
    "Trust score sustav (0-100)": {
      implemented: true,
      summary: "Sustav ocjene pouzdanosti korisnika (0-100) koji određuje kvalitetu leadova i povjerenje u korisnika.",
      details: `## Kako funkcionira:

**Bodovanje**
- Korisnik starta s 0 bodova; svaka verifikacija (e-mail, telefon, OIB, tvrtka, domena) dodaje određeni broj bodova do maksimuma 100.
- Rasponi (0-30, 31-60, 61-80, 81-100) jasno označavaju razinu pouzdanosti.

**Primjena**
- Trust score je vidljiv pružateljima prije prihvata leada, utječe na prioritet distribucije i ulazi u AI ocjene kvalitete.

**Kako rasti**
- Završite sve verifikacije (kontakt, identitet, tvrtka, domena) i score automatski raste.

Sustav motivira korisnike na provjeru identiteta i olakšava selekciju kvalitetnih leadova.
`
    },
    "Prosječno vrijeme odgovora (avgResponseTimeMinutes)": {
      implemented: true,
      summary: "Automatsko praćenje koliko brzo odgovarate na leadove - bitno za vašu reputaciju i prioritet u distribuciji leadova.",
      details: `## Kako funkcionira:

**Praćenje vremena**
- Kad lead stigne, sustav mjeri koliko brzo odgovorite (INTERESTED / NOT_INTERESTED).
- Ako nema odgovora unutar 24 sata, zapisuje se maksimalno vrijeme i lead prelazi na sljedećeg.

**Izračun**
- Zbrajaju se sva vremena odgovora i dijele s brojem obrađenih leadova.
- Rezultat utječe na reputaciju i prioritet u distribuciji.

**Kako poboljšati**
- Provjeravajte queue redovito, aktivirajte notifikacije i odgovorite odmah (čak i ako odbijate).
- Brze reakcije održavaju reputaciju visokom i osiguravaju više leadova.

Pokazatelj brzine odgovora pomaže zadržati red čekanja učinkovit i pravedan.
`
    },
    "Stopa konverzije leadova (conversionRate)": {
      implemented: true,
      summary: "Automatski izračun postotka kupljenih leadova koji su završili kao ostvareni poslovi.",
      details: `**Kako funkcionira**
- Konverzija = broj leadova sa statusom CONVERTED podijeljen s ukupno kupljenim leadovima u periodu.
- KPI karta i graf prikazuju trend te usporedbu s ciljem.
- Utječe na reputaciju i prioritet distribucije leadova.

**Prednosti**
- Jasno mjeri uspješnost prodajnog procesa.
- Pomaže u odlučivanju gdje ulagati budžet.

**Kada koristiti**
- Redoviti ROI pregled i optimizacija strategije kupnje.
- Analiza performansi timova ili lokacija.
`,
      technicalDetails: `**Frontend**
- Dashboard widget s grafom i breakdownom po kategorijama.
- Tooltip prikazuje broj kupljenih i konvertiranih leadova.

**Backend**
- \`leadAnalyticsService.calculateConversionRate\` agregira podatke po filterima.
- Batch job osvježava agregate i sprema u cache.

**Baza**
- \`LeadConversionStats\` (providerId, period, purchased, converted, rate).
- Denormalizirani stupci u \`Lead\` za brzo filtriranje.

**Integracije**
- Analytics/BI koristi metriku za izvještaje.
- Notification servis može slati upozorenja kada stopa padne.

**API**
- \`GET /api/analytics/leads/conversion-rate\` – vraća podatke po filterima.
`
    },
    "Skener dokumenata za licence": {
      implemented: true,
      summary: "OCR skener čita podatke s licenci i automatski popunjava formu za brže dodavanje dokumenata.",
      details: `**Kako funkcionira**
- Provider učitava fotografiju ili PDF licence putem web ili mobilne aplikacije.
- OCR modul prepoznaje ključne podatke (broj, izdavatelj, datum) i predlaže ih u formi.
- Korisnik potvrđuje ili ispravlja podatke prije spremanja.

**Prednosti**
- Smanjuje ručni unos i rizik od tipfelera.
- Ubrzava onboardanje i verifikaciju licenci.

**Kada koristiti**
- Dodavanje novih licenci ili obnova postojećih dokumenata.
- Bulk import licenci kod većih partnera.
`,
      technicalDetails: `**Frontend**
- File upload komponenta s previewom i inline validacijom.
- Mobile SDK podržava kameru s auto-capture značajkama.

**Backend**
- \`licenseOcrService.extract\` koristi vanjski OCR (Tesseract/AWS Textract).
- Rezultat se validira i spaja s katalogom izdavatelja.

**Baza**
- \`ProviderLicense\` polja \`number\`, \`issuerId\`, \`issuedAt\`, \`expiresAt\`, \`documentUrl\`.
- \`LicenseOcrResult\` čuva raw JSON i status.

**Integracije**
- S3/CloudFront za pohranu dokumenata.
- Compliance alat dobiva podatke za manualnu provjeru ako OCR ne uspije.

**API**
- \`POST /api/provider/licenses/ocr\` – upload i OCR.
- \`POST /api/provider/licenses\` – spremanje potvrđenih podataka.
`
    },
    "Predviđanje budućih performansi": {
      implemented: true,
      summary: "AI model predviđa buduće konverzije, prihode i ROI na temelju povijesnih podataka i trenda.",
      details: `**Kako funkcionira**
- Servis koristi vremenske serije (konverzije, prihodi, broj leadova), sezonalnost i reputacijske metrike.
- Generira projekcije po mjesecima i scenarijima (optimistično, bazno, konzervativno).
- Dashboard prikazuje graf prognoze i preporuke za budžet/kapacitete.

**Prednosti**
- Omogućuje planiranje resursa i budžeta unaprijed.
- Upozorava na pad performansi prije nego što se dogodi.

**Kada koristiti**
- Mjesečni/kvartalni poslovni plan.
- Procjena utjecaja novih kampanja ili promjena cijena.
`,
      technicalDetails: `**Frontend**
- Chart s prognozom i intervalima pouzdanosti.
- Scenario switcher (optimistic/base/pessimistic).

**Backend**
- \`performanceForecastService.generate\` koristi ML pipeline (Prophet/xgboost) i retrenira modele.
- Forecast se cacheira i invalidira kod novih podataka.

**Baza**
- \`PerformanceForecast\` (providerId, period, metric, baseValue, optimistic, pessimistic).
- Feature store za agregirane metrike.

**Integracije**
- Analytics data warehouse kao izvor povijesnih podataka.
- Notification servis šalje upozorenja ako projekcija padne ispod cilja.

**API**
- \`GET /api/analytics/performance-forecast\` – vraća predikcije.
`
    },
    "Usporedba s drugim providerima": {
      implemented: true,
      summary: "Benchmark modul anonimno uspoređuje vaše metrike s prosjekom industrije i top performerima.",
      details: `**Kako funkcionira**
- Sustav agregira anonimizirane podatke (konverzija, prihod po leadu, vrijeme odgovora) po kategoriji i regiji.
- Dashboard prikazuje gdje ste iznad ili ispod prosjeka te nudi preporuke.
- Podaci se osvježavaju periodično kako bi reflektirali aktualno stanje tržišta.

**Prednosti**
- Jasno pokazuje gdje treba unaprijediti performanse.
- Validira uspjeh u odnosu na konkurenciju bez otkrivanja tuđih identiteta.

**Kada koristiti**
- Postavljanje ciljeva (OKR/KPI) i motiviranje tima.
- Procjena učinka novih procesa u odnosu na tržište.
`,
      technicalDetails: `**Frontend**
- Benchmark grafovi (percentile, spider chart) i preporuke.
- Tooltip objašnjava metodologiju i sample size.

**Backend**
- \`benchmarkService.calculate\` grupira podatke i čuva anonimnost.
- De-identifikacija i bucketiranje prema volumenima.

**Baza**
- \`BenchmarkMetric\` (segmentKey, metric, percentile25/50/75, updatedAt).
- Segment key kombinira kategoriju, lokaciju i plan.

**Integracije**
- Data warehouse za agregaciju i ETL.
- Notification servis može nuditi savjete (npr. “iznad prosjeka u konverziji”).

**API**
- \`GET /api/analytics/benchmark\` – vraća usporedbe po segmentu.
`
    },
    "Rate limiting za SMS verifikaciju": {
      implemented: true,
      summary: "Ograničavamo broj SMS verifikacija po korisniku kako bismo spriječili zloupotrebu i troškove.",
      details: `**Kako funkcionira**
- Na korisnika primjenjujemo limit (npr. 3 koda na sat, 10 dnevno) i pratimo pokušaje u Redis cacheu.
- Ako je limit dosegnut, prikazujemo vrijeme resetiranja i alternative (email verifikacija, podrška).
- Limiti se resetiraju cron jobom ili TTL-om u cacheu.

**Prednosti**
- Štiti SMS infrastrukturu i smanjuje trošak spama.
- Povećava sigurnost verifikacijskog procesa.

**Kada koristiti**
- Tijekom registracije i promjena broja telefona.
- Kod sumnjivih aktivnosti (brzi uzastopni pokušaji).
`,
      technicalDetails: `**Frontend**
- Prikazuje countdown do sljedećeg pokušaja i CTA za alternativne metode.
- Error stanja lokalizirana i jasna korisniku.

**Backend**
- \`smsVerificationService.requestCode\` provjerava limiti i zapisuje pokušaje.
- Redis/lambda throttling implementira atomicne brojače i TTL.

**Baza**
- \`PhoneVerification\` čuva verifikacije i broj pokušaja.
- Log tablica za inspekciju sumnjivih aktivnosti.

**Integracije**
- SMS provider (Twilio/Infobip) i monitoring troška.
- Fraud detection servis može prilagoditi limite.

**API**
- \`POST /api/contact-phone/verify-request\` – vraća status (allowed/limited).
`
    },
    "Verifikacijski kod expiration (10 minuta)": {
      implemented: true,
      summary: "SMS OTP kod vrijedi 10 minuta, nakon čega korisnik mora zatražiti novi radi sigurnosti.",
      details: `**Kako funkcionira**
- Kod se generira s timestampom i pohranjuje s TTL=10 minuta.
- UI prikazuje odbrojavanje i onemogućuje unos nakon isteka.
- Nakon isteka korisnik može zatražiti novi kod unutar rate limit pravila.

**Prednosti**
- Sprječava korištenje starih kodova i brute force pokušaje.
- Potiče korisnika da brzo dovrši verifikaciju.

**Kada koristiti**
- Vermifikacija telefona i dvofaktorska autentifikacija.
- Reset lozinke putem SMS-a.
`,
      technicalDetails: `**Frontend**
- Countdown timer i automatsko fokusiranje polja za unos koda.
- Status poruke (valid, expired) u realnom vremenu.

**Backend**
- \`smsVerificationService.verify\` provjerava hash + expiry timestamp.
- Expired kod se označava i arhivira radi audita.

**Baza**
- \`PhoneVerification\` polja \`codeHash\`, \`expiresAt\`, \`verifiedAt\`.
- Background job čisti istekle zapise.

**Integracije**
- SMS provider, monitoring za rate expiry.
- Notification servis obavještava korisnika ako je kod istekao.

**API**
- \`POST /api/contact-phone/verify\` – provjerava kod i vraća status.
`
    },
    "Praćenje vremena odgovora na leadove": {
      implemented: true,
      summary: "Bilježimo vrijeme između primitka leada i odgovora providera radi optimizacije queue sustava.",
      details: `**Kako funkcionira**
- Svaki lead event (assign, respond, expire) zapisuje se s timestampom.
- Izračun po leadu pohranjuje se i ulazi u prosjeke, reputaciju i SLA izvještaje.
- Dashboard prikazuje distribuciju vremena i identifikaciju outliera.

**Prednosti**
- Pruža precizan uvid u brzinu reakcije pojedinaca i timova.
- Omogućuje automatsko alarmiranje kod sporih odgovora.

**Kada koristiti**
- U operativnom nadzoru tima (daily standup, SLA compliance).
- Kod spornih slučajeva i reklamacija klijenata.
`,
      technicalDetails: `**Frontend**
- SLA widget u queue-u i graf raspodjele u analyticsu.
- Filteri (status, plan, kategorija) za drill-down.

**Backend**
- \`leadResponseTracker.record\` zapisuje događaje i izračunava trajanje.
- Event-driven arhitektura (Kafka/SQS) za obradu u realnom vremenu.

**Baza**
- \`LeadResponseEvent\` i \`LeadResponseMetric\` tablice.
- Indeksi po providerId i leadId za brza preslikavanja.

**Integracije**
- Notification servis (Slack/email) za SLA breach.
- Analytics/BI izvještaji.

**API**
- \`GET /api/analytics/leads/response-metrics\` – vraća metrike i distribuciju.
`
    },
    "Automatsko izračunavanje reputacije": {
      implemented: true,
      summary: "Reputacijski score se automatski ažurira na temelju ključnih performansi providera.",
      details: `**Kako funkcionira**
- Algoritam kombinira vrijeme odgovora, stopu konverzije, recenzije, povijest disputea i aktivnost.
- Svaki signal ima ponder; rezultat se normalizira na skalu 0-100.
- Reputacija se recalculira nakon relevantnog događaja ili batch jobom.

**Prednosti**
- Pruža transparentan i fer prikaz kvalitete bez ručnog održavanja.
- Motivira providere na dosljedne performanse.

**Kada koristiti**
- Distribucija leadova, marketplace rangiranje i preporuke.
- Upozoravanje kada reputacija padne ispod praga.
`,
      technicalDetails: `**Frontend**
- Reputacijski widget na dashboardu i profilu s breakdownom signala.
- Historijski graf prikazuje trend.

**Backend**
- \`reputationService.calculate\` kombinira metrike i sprema rezultat.
- Event \`reputation.updated\` informira ostale servise i invalidira cache.

**Baza**
- \`ProviderReputation\` (providerId, score, breakdownJson, updatedAt).
- Audit log čuva promjene i izvore podataka.

**Integracije**
- Analytics i AI modeli koriste reputaciju u scoringu.
- Notification servis šalje upozorenja i savjete.

**API**
- \`GET /api/providers/:id/reputation\` – vraća score i breakdown.
`
    },
    "Prikaz reputacije na profilu": {
      implemented: true,
      summary: "Korisnici na profilu providera vide reputacijski score, rang i zvjezdice prije odabira usluge.",
      details: `**Kako funkcionira**
- Na javnom profilu prikazuju se numerički score, badge (npr. Gold, Silver) i vizual (zvjezdice/trodimenzionalni indikator).
- Reputacija se prikazuje i u listama rezultata, karticama leadova i ponuda.
- Hover/tooltip objašnjava glavne faktore koji doprinose rezultatu.

**Prednosti**
- Klijentima daje povjerenje i olakšava usporedbu providera.
- Provider dobiva marketing alat koji reflektira njegov rad.

**Kada koristiti**
- Pri pregledavanju profila i ponuda.
- U marketing materijalima i email kampanjama.
`,
      technicalDetails: `**Frontend**
- UI komponenta \`ReputationBadge\` s različitim stanjima.
- SSR/CSR kombinacija osigurava da je reputacija vidljiva i tražilicama.

**Backend**
- API vraća reputaciju u profil payloadu i listama.
- Cache layer (CDN/Redis) sprema rezultat radi bržeg učitavanja.

**Baza**
- Oslanja se na \`ProviderReputation\` i \`ProviderReview\` tablice.

**Integracije**
- Email/template servis koristi badge u komunikaciji.
- Analytics prati CTR i konverzije ovisno o reputaciji.

**API**
- \`GET /api/providers/:id\` – uključuje reputaciju.
- \`GET /api/providers?sort=reputation\` – sortiranje po scoreu.
`
    },
    "Integracija s lead matching algoritmom": {
      implemented: true,
      summary: "Reputacija, konverzije i SLA integrirani su u algoritam koji određuje prioritet dodjele leadova.",
      details: `**Kako funkcionira**
- Matching engine prikuplja signale (reputacija, trust score, lokacija, dostupnost) i izračunava ranking kandidata.
- Lead se nudi providerima prema rankingu, uz transparentan queue koji pokazuje poredak.
- Algoritam se prilagođava segmentu (hitni, premium leadovi) i planu pretplate.

**Prednosti**
- Najbolje performere nagrađuje prioritetom i osigurava kvalitetu za klijente.
- Smanjuje ručne intervencije i osigurava fer distribuciju.

**Kada koristiti**
- Svaka dodjela leada (instant, queue, aukcija).
- Optimizacija strategije distribucije na novim tržištima.
`,
      technicalDetails: `**Frontend**
- Queue UI prikazuje poziciju i razloge rankiranja (tooltip breakdown).
- Notificationi informiraju kada lead stigne na red.

**Backend**
- \`leadMatchingService.rankProviders\` koristi scoring funkciju i constraints.
- Event-driven pipeline ažurira ranking kod promjene signala (reputacija, lokacija, saldo).

**Baza**
- \`LeadQueue\` i \`LeadCandidateScore\` tablice bilježe rezultate.
- Audit log za transparentnost distribucije.

**Integracije**
- Analytics prati učinkovitost matchinga.
- Notification/dispatch servis obavještava kandidate.

**API**
- \`GET /api/leads/:id/queue\` – prikazuje ranking (autorizirani korisnici).
- \`POST /api/internal/leads/:id/recalculate\` – ručni trigger (admin).
`
    },
    "Responsive dizajn (mobilni, tablet, desktop)": {
      implemented: true,
      summary: "UI se prilagođava svim uređajima (mobilni, tablet, desktop) radi konzistentnog iskustva.",
      details: `**Kako funkcionira**
- Layout koristi fleksibilnu grid i breakpoint sustav (mobile-first) za automatsko prilagođavanje.
- Kontrole i navigacija optimizirani su za touch geste na mobilnim uređajima i produktivnost na desktopu.
- Sve ključne funkcije dostupne su na svakom form factoru bez dodatnih instalacija.

**Prednosti**
- Korisnici rade s platformom gdje god se nalazili.
- Smanjuje potrebu za odvojenim mobilnim aplikacijama.

**Kada koristiti**
- Terenski rad (mobilni), menadžment u pokretu (tablet), uredski rad (desktop).
- Demonstracije i onboarding novih korisnika.
`,
      technicalDetails: `**Frontend**
- Tailwind/Styled Components s custom breakpointima.
- SSR + hydration osigurava performanse i SEO.

**Backend**
- Neovisno o uređaju; backend servira iste API-je.
- Device context u sessionu za analitiku.

**Baza**
- Nema specifičnih promjena; koristi standardne tablice.

**Integracije**
- Analytics prati korištenje po uređajima.
- Error monitoring (Sentry) radi diferencijaciju po platformi.

**API**
- Univerzalni; UI bira odgovarajuće endpointe bez posebnih verzija.
`
    },
    "Intuitivno korisničko sučelje": {
      implemented: true,
      summary: "Dizajn sučelja prati jasne uzorke i vodi korisnika kroz procese bez potrebe za tutorijalima.",
      details: `**Kako funkcionira**
- Navigacija je organizirana po ulogama, a ključne akcije dostupne su u 1-2 klika.
- Kontekstualni tooltips, validacije i error poruke nude objašnjenja u trenutku potrebe.
- UX pisani vodiči (empty states, checklist) pomažu novim korisnicima.

**Prednosti**
- Smanjuje vrijeme učenja i broj korisničkih upita.
- Povećava stopu dovršavanja procesa (objava posla, kupnja leada).

**Kada koristiti**
- Onboarding novih korisnika i timova.
- Testiranje novih značajki kroz feature flagove i feedback petlje.
`,
      technicalDetails: `**Frontend**
- Dizajn sustav (Design tokens, komponentna biblioteka) za konzistentan UI.
- Accessibility standardi (WCAG 2.1 AA) implementirani u komponentama.

**Backend**
- API vraća metapodatke za UX (tooltip sadržaj, statusi) gdje je potrebno.

**Baza**
- Nema promjena; UI se oslanja na postojeće podatke.

**Integracije**
- Product analytics (Hotjar/Heap) prati interakcije i friction pointove.
- Feedback widget šalje prijedloge timu.

**API**
- UI koristi standardne endpoint-e; telemetrija se šalje preko \`/api/events/ui\`.
`
    },
    "Brzo učitavanje stranica": {
      implemented: true,
      summary: "Performanse frontenda optimizirane su kako bi stranice i liste učitavale u milisekundama.",
      details: `**Kako funkcionira**
- Lazy loading, code splitting i CDN cache minimiziraju payload.
- Pre-fetch najčešćih podataka i offline caching (Service Worker) za kritične viewove.
- Monitoring prati stvarno vrijeme učitavanja i automatski alarmira na degradacije.

**Prednosti**
- Povećava produktivnost korisnika i smanjuje bounce rate.
- Ključno za terenski rad na sporijim vezama.

**Kada koristiti**
- Cjelokupna platforma (dashboard, marketplace, admin panel).
- Posebno važno kod velikih listi (transakcije, leadovi).
`,
      technicalDetails: `**Frontend**
- React Suspense/dynamic import, compressirani asseti, HTTP/2 push.
- Lighthouse i Web Vitals monitoring integriran u CI/CD.

**Backend**
- GraphQL/REST endpointi optimizirani za minimalne roundtripove.
- Cache slojevi (Redis) i pagination.

**Baza**
- Indeksi i read replica za teške upite.
- Query optimization i prepared statementi.

**Integracije**
- CDN (CloudFront) i APM (Datadog/New Relic).
- Error monitoring i tracing.

**API**
- Standardni; performance headere (TTFB, cache-control) konfigurirani.
`
    },
    "Pretraživanje u realnom vremenu": {
      implemented: true,
      summary: "Rezultati se ažuriraju dok korisnik tipka, omogućujući trenutno pronalaženje poslova, leadova ili providera.",
      details: `**Kako funkcionira**
- Svaki unos znaka šalje throttled upit prema search servisu.
- Rezultati se prikazuju bez reload-a, s isticanjem ključnih pojmova.
- Pametni algoritmi toleriraju tipfelere i nude sugestije.

**Prednosti**
- Smanjuje vrijeme do pronalaska relevantnih rezultata.
- Održava korisnike fokusiranima bez dodatnih koraka.

**Kada koristiti**
- Pretraga poslova, leadova, providera, licenci.
- Admin alati za brzo pronalaženje zapisa.
`,
      technicalDetails: `**Frontend**
- Debounce/throttle logika i highlight match komponenta.
- Keyboard navigation za brzi odabir rezultata.

**Backend**
- \`searchService.query\` koristi Elasticsearch/Algolia s fuzziness i synonym mapama.
- Rate limit i scoring prilagođeni po segmentu.

**Baza**
- Search index (Elastic) sinkroniziran s primarnom bazom.
- CDC/queue za update indeksa u realnom vremenu.

**Integracije**
- Analytics prati najčešće upite i neuspješne pretrage.
- Recommendation engine može nuditi sugestije.

**API**
- \`GET /api/search\` – unified search endpoint.
`
    },
    "Filtriranje i sortiranje": {
      implemented: true,
      summary: "Dinamični filteri i sortiranja omogućuju brzo sužavanje rezultata prema kriterijima korisnika.",
      details: `**Kako funkcionira**
- UI nudi kombiniranje filtera (kategorija, lokacija, budžet, status, reputacija) i odmah osvježava rezultate.
- Sort opcije (najnovije, cijena, ROI, udaljenost) prilagođene su kontekstu (poslovi, leadovi, provideri).
- Korisnici mogu spremiti favorite i ponovno koristiti konfiguracije.

**Prednosti**
- Smanjuje vrijeme pretraživanja i povećava relevantnost rezultata.
- Omogućuje analitičke usporedbe i napredne upite.

**Kada koristiti**
- Marketplace leadova, lista poslova, admin pregled korisnika.
- Analitički dashboardi s pivot filtrima.
`,
      technicalDetails: `**Frontend**
- Controlled filter komponenta s state managementom (Redux/Zustand) i URL sync.
- Sort toggles i chips za brisanje pojedinih filtera.

**Backend**
- Query builder optimizira upite ovisno o filterima.
- Pre-computed agregacije za brzi prikaz broja rezultata po filteru.

**Baza**
- Indeksi i materialized view-i za najčešće kombinacije.
- Elastic/SQL hibrid ovisno o tipu podataka.

**Integracije**
- Analytics mjeri korištenje filtera i pomaže dizajnu.
- Recommendation servis može predložiti filtere na temelju ponašanja.

**API**
- \`GET /api/leads\`, \`/api/jobs\`, \`/api/providers\` – svi podržavaju filter/sort parametre.
`
    },
    "Izvoz povijesti transakcija": {
      implemented: true,
      summary: "Korisnici mogu izvesti kreditne transakcije u CSV, Excel, PDF ili JSON radi analize i računovodstva.",
      details: `**Kako funkcionira**
- UI nudi izbor formata i perioda za izvoz transakcija.
- Backend generira datoteku asinhrono i šalje link za preuzimanje (email ili in-app notifikacija).
- Izvoz uključuje sve ključne atribute (datum, tip, iznos, saldo, reference).

**Prednosti**
- Olakšava računovodstvo, revizije i interne analize.
- Podržava prilagođene izvještaje bez ručnog prepisivanja.

**Kada koristiti**
- Mjesečno knjigovodstvo i poreske prijave.
- Analiza potrošnje kredita i ROI po periodu.
`,
      technicalDetails: `**Frontend**
- Export modal s odabirom formata, perioda i emaila za dostavu.
- Status prikaz (u tijeku, spremno) i povijest ranijih exporta.

**Backend**
- \`transactionExportService.generate\` kreira datoteku i pohranjuje u S3.
- Background worker (BullMQ/Celery) procesuira zahtjeve i obavještava korisnika.

**Baza**
- \`CreditTransaction\` kao izvor podataka.
- \`ExportRequest\` tablica prati zahtjeve (userId, format, status, storageUrl).

**Integracije**
- S3/CloudFront za preuzimanje, email servis za obavijest.
- Accounting softver može povući JSON preko API-ja.

**API**
- \`POST /api/credits/export\` – kreira zahtjev.
- \`GET /api/credits/export/:id\` – status i download link.
`
    },
    "Mesečni/godišnji izvještaji": {
      implemented: true,
      summary: "Periodični izvještaji (mjesec/kvartal/godina) daju objedinjene KPI-je, trendove i usporedbe za lakše planiranje.",
      details: `**Kako funkcionira**
- ROI modul agregira metrike (leadovi, prihodi, troškovi, ROI, reputacija) po odabranom periodu.
- Korisnik bira mjesec, kvartal, godinu ili custom raspon i dobiva grafove, tablice i komentare.
- Izvještaj se može spremiti ili zakazati za automatsko slanje emailom.

**Prednosti**
- Jedan dokument pokriva ključne brojke i trendove bez ručnog izračuna.
- Usporedba s prethodnim periodima otkriva rast ili pad performansi.

**Kada koristiti**
- Mjesečni/kvartalni review s timom ili klijentom.
- Priprema za porezne prijave, budžetiranje i board sastanke.
`,
      technicalDetails: `**Frontend**
- ROI dashboard s period pickerom i export CTA (PDF/XLSX).
- Widgeti (KPI kartice, grafovi, tablice) prilagođavaju se odabranom periodu.

**Backend**
- \`reportingService.generatePeriodicReport\` dohvaća agregate i sprema snapshot.
- Scheduler (cron) može automatski generirati i slati izvještaje.

**Baza**
- \`AnalyticsPeriodSummary\` (providerId, periodType, periodStart, metricsJson).
- \`ScheduledReport\` čuva postavke za automatsko slanje.

**Integracije**
- Email servis šalje PDF/XLSX.
- Data warehouse/BI koristi iste agregate za naprednu analitiku.

**API**
- \`GET /api/analytics/reports/periodic\` – dohvat izvještaja.
- \`POST /api/analytics/reports/schedule\` – zakazivanje automatiziranog slanja.
`
    },
    "Filtriranje transakcija po tipu": {
      implemented: true,
      summary: "Transakcije kredita možete filtrirati po tipu (kupnja, refund, pretplata, bonus...) radi brze analize.",
      details: `**Kako funkcionira**
- Povijest transakcija nudi filter za tip (LEAD_PURCHASE, REFUND, SUBSCRIPTION, BONUS, ADMIN_ADJUST...).
- Filter se može kombinirati s datumom, iznosom i stanjem kako biste suzili rezultate.
- Spremanje filter preseta omogućuje brzi pristup čestim upitima.

**Prednosti**
- Brzo pronalazite transakcije koje vas zanimaju (npr. samo refundovi).
- Pomaže u analizi troškova i pripremi izvještaja.

**Kada koristiti**
- Kod revizije ili reklamacija specifičnog tipa transakcija.
- Prilikom praćenja potrošnje ili prihoda po segmentu.
`,
      technicalDetails: `**Frontend**
- Filter komponenta s multi-select dropdownom i badgevima za aktivne filtere.
- Rezultati se osvježavaju u realnom vremenu, a export poštuje odabrane filtre.

**Backend**
- \`creditTransactionService.list\` prihvaća filter parametre i vraća paginirane rezultate.
- Query builder optimizira upite ovisno o kombinacijama filtera.

**Baza**
- \`CreditTransaction\` indeksiran po \`type\`, \`createdAt\`, \`userId\`.
- Materijalizirani view za agregate po tipu.

**Integracije**
- Analytics izvještaji preuzimaju iste filtere.
- Export servis generira CSV/PDF prema filtriranom setu.

**API**
- \`GET /api/credits/history?type=...\` – vraća filtrirane transakcije.
`
    },
    "Notifikacije o transakcijama": {
      implemented: true,
      summary: "Sustav šalje obavijesti za ključne transakcije (kupnja, refund, pretplata) kako biste bili odmah informirani.",
      details: `**Kako funkcionira**
- Kod svake značajne transakcije kreira se notifikacijski događaj (in-app i/ili email).
- Obavijest sadrži tip transakcije, iznos, saldo nakon transakcije i link na detalje.
- Korisnik u postavkama bira koje tipove želi primati.

**Prednosti**
- Brzo detektirate neočekivane naplate ili refundove.
- Imate evidenciju transakcija bez stalnog provjeravanja povijesti.

**Kada koristiti**
- Aktivno praćenje troškova i priljeva kredita.
- Security monitoring (brzo reagiranje na neautorizirane aktivnosti).
`,
      technicalDetails: `**Frontend**
- Notification center s listom i filterom po tipu.
- Email templati prilagođeni brandingu; deep link vodi na detalje transakcije.

**Backend**
- \`transactionEventHandler\` emitira \`transaction.notification.created\`.
- Preference servis filtrira primatelje, a notification worker šalje poruke.

**Baza**
- \`NotificationPreference\` i \`Notification\` tablice (userId, payload, readAt).
- Audit log za poslanu komunikaciju.

**Integracije**
- Email/SMS provider (SendGrid/Twilio) za dostavu.
- Slack/webhook integracije za veće partnere.

**API**
- \`GET /api/notifications\` – lista obavijesti.
- \`PATCH /api/notifications/preferences\` – upravljanje tipovima koji se šalju.
`
    },
    "Dokument upload za verifikaciju": {
      implemented: true,
      summary: "Korisnici mogu sigurno učitati identifikacijske i poslovne dokumente potrebne za verifikaciju.",
      details: `**Kako funkcionira**
- Wizard traži vrstu dokumenta (osobni identifikacijski, registracija tvrtke, potvrda OIB-a...).
- Dokument (PDF/PNG/JPG) se učitava, validira format i šalje na siguran storage.
- Admin dobiva zadatak za pregled ili se pokreće automatizirana provjera.

**Prednosti**
- Ubrzava verifikacijski proces i smanjuje ručnu komunikaciju.
- Pruža audit trag i centralno spremište dokumenata.

**Kada koristiti**
- Onboarding novih providera/klijenata.
- Kod zahtjeva za dodatnom verifikacijom ili obnovom dokumenata.
`,
      technicalDetails: `**Frontend**
- Drag&drop uploader s previewom, statusom i listom potrebnih dokumenata.
- State machine pokazuje korake (upload, pending review, approved).

**Backend**
- \`verificationDocumentService.upload\` validira, pohranjuje i kreira verifikacijski ticket.
- Antivirus/OCR pipeline (async) provjerava datoteku i ekstraktira metapodatke.

**Baza**
- \`VerificationDocument\` (userId, type, status, storageUrl, metadataJson).
- Audit tablica bilježi tko je pregledao dokument.

**Integracije**
- S3/Blob storage + KMS enkripcija.
- Compliance alat za ručni review (npr. GRC sustavi).

**API**
- \`POST /api/verifications/documents\` – upload.
- \`GET /api/verifications/documents\` – status i povijest.
`
    },
    "Notifikacije o verifikaciji": {
      implemented: true,
      summary: "Automatske obavijesti informiraju korisnike o statusu verifikacije i potrebnim akcijama.",
      details: `**Kako funkcionira**
- Kad se promijeni status verifikacije (initiated, pending docs, approved, rejected) kreira se notifikacija.
- Korisnik dobiva in-app i/ili email s razlogom i sljedećim koracima.
- Sustav nudi direktne linkove za upload dodatnih dokumenata ili kontakt podrške.

**Prednosti**
- Transparentan proces s pravovremenim obavijestima.
- Smanjuje broj upita prema podršci.

**Kada koristiti**
- Onboarding providera i klijenata.
- Periodične revizije i re-verifikacije.
`,
      technicalDetails: `**Frontend**
- Notification banner u profilu + timeline verifikacijskih događaja.
- Email templati s CTA-om “Dovrši verifikaciju”.

**Backend**
- \`verificationWorkflowService.updateStatus\` emitira event koji pokreće notifikacije.
- Preference servis poštuje korisničke postavke komunikacije.

**Baza**
- \`VerificationStatusHistory\` čuva promjene (status, timestamp, actor).
- \`Notification\` tablica povezana s verifikacijskim ticketom.

**Integracije**
- Email/SMS provider, helpdesk za eskalacije.
- Webhook prema CRM-u ako je potrebno obavijestiti account managera.

**API**
- \`GET /api/verifications/status\` – pregled stanja i povijesti.
- \`PATCH /api/notifications/preferences\` – upravljanje kanalima.
`
    },
    "Verificiranje firme (sudski registar)": {
      implemented: true,
      summary: "Automatska verifikacija vaše tvrtke u sudskom registru - provjera da je tvrtka registrirana i da su podaci ispravni.",
      details: `## Kako funkcionira:

Sustav automatski provjerava vašu tvrtku u sudskom registru kako bi verificirao da je tvrtka registrirana i da su podaci ispravni.

**Kako se verificira:**
- Unesete naziv tvrtke i OIB
- Sustav automatski provjerava u sudskom registru
- Provjerava se registracija tvrtke
- Provjeravaju se podaci (naziv, OIB, adresa)
- Verificira se legitimnost tvrtke

**Što se provjerava:**
- Je li tvrtka registrirana u sudskom registru
- Odgovaraju li podaci (naziv, OIB)
- Status tvrtke (aktivna, u stečaju, itd.)
- Legitimnost tvrtke

**Zašto je važno:**
- Dokaz legitimnosti tvrtke
- Osigurava ispravnost podataka
- Povećava povjerenje korisnika
- Veći trust score za verificirane tvrtke

**Prednosti:**
- Automatska verifikacija - nema ručnog rada
- Osigurava ispravnost podataka
- Povećava povjerenje korisnika
- Veći trust score znači kvalitetnije leadove

**Kako se koristi:**
- Tijekom registracije kao pružatelj
- Prilikom ažuriranja podataka o tvrtki
- Automatski u pozadini za provjeru legitimnosti
- Pri prikazivanju profila korisnicima

**Rezultat:**
- Business Badge se dodaje na profil ako je verifikacija uspješna
- Trust score se povećava
- Korisnici vide da je tvrtka verificirana
- Veća vjerojatnost dobivanja kvalitetnih leadova

Verificiranje firme u sudskom registru osigurava legitimnost tvrtke i povećava povjerenje korisnika!
`
    },
    "Automatska verifikacija": {
      implemented: true,
      summary: "Sustav automatski provjerava ključne podatke (email, telefon, OIB, tvrtka) putem vanjskih servisa i pravila.",
      details: `**Kako funkcionira**
- Nakon unosa podataka pokreću se automatizirani checkovi (format, checksum, vanjski registri).
- Rezultat (VERIFIED, REJECTED, MANUAL_REVIEW) ažurira profil i trust score.
- Neuspješni pokušaji generiraju zadatak za ručnu provjeru ili traže dodatni dokument.

**Prednosti**
- Brza validacija bez čekanja admina.
- Konzistentni kriteriji provjere za sve korisnike.

**Kada koristiti**
- Onboarding korisnika/providera.
- Periodične compliance provjere i promjene podataka.
`,
      technicalDetails: `**Frontend**
- Status badge i timeline prikazuju faze automatizirane provjere.
- Inline poruke objašnjavaju neuspjehe i tražene akcije.

**Backend**
- \`autoVerificationService.runChecks\` orkestrira email/SMS/OIB/company verification.
- Rule engine konfigurira pragove i fallback na ručni review.

**Baza**
- \`VerificationStatusHistory\`, \`ClientVerification\`, \`ProviderVerification\`.
- Čuva razlog (reasonCode) i podatke o izvoru.

**Integracije**
- Email ping, SMS OTP, OIB API, company registry, DNS check servis.
- Notification servis za follow-up.

**API**
- \`POST /api/verifications/auto\` – pokreće provjere.
- \`GET /api/verifications\` – pregled statusa i logova.
`
    },
    "Pregled vlastitih poslova (MyJobs)": {
      implemented: true,
      summary: "Jednostavno pregledajte sve svoje objavljene poslove na jednom mjestu - praćenje statusa i upravljanje poslovima.",
      details: `## Kako funkcionira:

Kao korisnik usluge možete pregledati sve svoje objavljene poslove na jednom mjestu - jednostavno i efikasno upravljanje poslovima.

**Što vidite:**
- Svi vaši objavljeni poslovi
- Status svakog posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN)
- Broj primljenih ponuda za svaki posao
- Datum objavljivanja i status
- Lokacija i budžet svakog posla

**Funkcionalnosti:**
- Pregled svih vaših poslova
- Filtriranje poslova po statusu
- Sortiranje poslova po datumu ili statusu
- Brzi pristup detaljima svakog posla
- Uređivanje statusa posla

**Upravljanje poslovima:**
- Promijenite status posla kada je potrebno
- Otvorite detalje posla za pregled ponuda
- Uređujte informacije o poslu ako je potrebno
- Otkažite posao ako više nije potreban

**Prednosti:**
- Centralizirano upravljanje poslovima
- Brz pregled svih vaših aktivnih poslova
- Lako praćenje statusa poslova
- Efikasno upravljanje komunikacijom s pružateljima

**Kada koristiti:**
- Pregled svih svojih poslova
- Provjera statusa poslova
- Upravljanje ponudama za poslove
- Provjera aktivnih poslova

**Integracija:**
- Pregled ponuda za svaki posao
- Pristup chatu s pružateljima
- Pregled recenzija nakon završetka posla
- Praćenje cijelog procesa od objave do završetka

Pregled vlastitih poslova osigurava jednostavno i efikasno upravljanje svim vašim poslovima na jednom mjestu!
`
    },
    "Navigacija specifična za korisnike usluge": {
      implemented: true,
      summary: "UI prikazuje samo stavke relevantne korisnicima usluge (objava posla, ponude, chat, profil).",
      details: `**Kako funkcionira**
- Nakon logina s CLIENT rolom generira se konfiguracija menija prilagođena toj ulozi.
- Linkovi prema provider funkcijama (leadovi, pretplate, ROI) skrivaju se dok korisnik ne doda drugu ulogu.
- Navigacija se dinamički osvježava kad se promijeni rola ili aktiviraju novi feature flagovi.

**Prednosti**
- Jednostavnije korisničko iskustvo bez nepotrebnih opcija.
- Brži pristup funkcijama koje klijenti najčešće koriste.

**Kada koristiti**
- Svaki put kada se korisnik prijavi kao klijent.
- Nakon prebacivanja uloga (dodavanje/uklanjanje PROVIDER role).
`,
      technicalDetails: `**Frontend**
- Role-aware navigation konfiguracija (React context) i guardovi na rutama.
- Badgevi prikazuju broj novih ponuda ili poruka.

**Backend**
- \`navigationService.getClientMenu\` vraća konfiguraciju menija prema ulogama i planu.
- Feature toggle sustav aktivira/skriva sekcije.

**Baza**
- Oslanja se na \`UserRole\` i \`FeatureToggle\`; nema dodatnih tablica.

**Integracije**
- Notification count servis puni broj oznaka.
- Analytics prati korištenje menija po ulogama.

**API**
- \`GET /api/navigation\` – vraća konfiguraciju menija za prijavljenog korisnika.
`
    },
    "Pregled cjenika": {
      implemented: true,
      summary: "Stranica cjenika prikazuje cijene leadova i pretplatničkih planova uz uključene pogodnosti.",
      details: `**Kako funkcionira**
- Cjenik povlači aktualne podatke o cijenama leadova po kategoriji i planovima pretplate.
- Korisnik može usporediti pakete, vidjeti što je uključeno i pokrenuti kupnju/upgrade.
- Popusti, trial i jednokratne kupnje prikazuju se kroz istu komponentu.

**Prednosti**
- Transparentan pregled troškova i benefita.
- Olakšava donošenje odluke o planu ili jednokratnoj kupnji leadova.

**Kada koristiti**
- Prilikom planiranja budžeta ili odabira paketa.
- Pred nadogradnju/dogradnju postojećeg plana.
`,
      technicalDetails: `**Frontend**
- Pricing tabela s karticama, toggle (mjesečno/godišnje) i CTA-ovima.
- Komponenta prikazuje usporedbu planova i kalkulator kredita.

**Backend**
- \`pricingService.listPlans\` vraća planove, kredite i pogodnosti.
- Feature flagovi omogućuju prikaz regionalnih cijena ili popusta.

**Baza**
- \`SubscriptionPlan\` (code, price, credits, featuresJson).
- \`LeadPricing\` (categoryId, priceInCredits, min/max range).

**Integracije**
- Stripe Billing za izračun cijena i promo kodove.
- CMS za marketinški sadržaj na stranici cjenika.

**API**
- \`GET /api/pricing/plans\` – vraća pretplatne pakete.
- \`GET /api/pricing/leads\` – cijene leadova po kategorijama.
`
    },
    "Različiti paketi pretplate (BASIC, PREMIUM, PRO)": {
      implemented: true,
      summary: "Tri pretplatni plana nude različite količine kredita i funkcionalnosti (BASIC, PREMIUM, PRO).",
      details: `**Kako funkcionira**
- Planovi definiraju mjesečni broj kredita, cijenu i dodatne pogodnosti (prioritet leadova, support, analitiku).
- Korisnik može nadograditi/degradirati plan; promjena se primjenjuje na sljedeći billing ciklus.
- Dashboard prikazuje trenutno korištenje kredita i benefite plana.

**Prednosti**
- Fleksibilnost – odaberite plan prema volumenu i potrebnim funkcijama.
- Jednostavno skaliranje kako posao raste.

**Kada koristiti**
- Prilikom onboardinga (odabir startnog plana).
- Kada poslovanje naraste i treba više leadova ili napredne funkcije.
`,
      technicalDetails: `**Frontend**
- Plan picker komponenta s usporedbom benefita i CTA-om za upgrade/downgrade.
- Banner upozorava na iskorištenost kredita i predlaže prelazak na viši plan.

**Backend**
- \`subscriptionService.changePlan\` upravlja Stripe subscriptionom i internim kvotama.
- Billing job dodaje kredite prema planu na početku perioda.

**Baza**
- \`Subscription\` (userId, planCode, currentPeriodStart, currentPeriodEnd, status).
- \`SubscriptionPlanFeature\` enumerira pogodnosti po planu.

**Integracije**
- Stripe Billing, customer portal za upravljanje karticama i planom.
- Analytics prati migracije između planova.

**API**
- \`POST /api/subscriptions/change-plan\` – promjena plana.
- \`GET /api/subscriptions/me\` – detalji trenutnog plana i benefita.
`
    },
    "Online plaćanje (Stripe Checkout)": {
      implemented: true,
      summary: "Sigurno online plaćanje za pretplate i kupovinu leadova preko Stripe Checkout-a - brzo i sigurno plaćanje karticom.",
      details: `## Kako funkcionira:

Platforma koristi Stripe Checkout za sigurno online plaćanje pretplata i kupovinu leadova.

**Kako funkcionira:**
- Odaberete paket pretplate ili lead koji želite kupiti
- Kliknete na "Plaćanje" ili "Kupnja"
- Preusmjereni ste na Stripe Checkout stranicu
- Unesete podatke o kartici
- Plaćanje se procesuira sigurno

**Sigurnost:**
- Stripe je PCI DSS certificiran
- Vaši podaci o kartici se ne pohranjuju na platformi
- Enkriptirana komunikacija
- Sigurno procesiranje plaćanja

**Podržane metode plaćanja:**
- Kreditne kartice (Visa, Mastercard, American Express)
- Debitne kartice
- Lokalne kartice (ovisno o regiji)
- Automatske pretplate za mjesečne plaćanja

**Prednosti:**
- Sigurno plaćanje
- Brzo i jednostavno
- Podrška za različite kartice
- Automatsko ažuriranje pretplata

**Kada koristiti:**
- Prilikom kupovine pretplate
- Prilikom jednokratne kupovine leadova
- Prilikom nadogradnje pretplate
- Prilikom obnavljanja pretplate

**Povratak na platformu:**
- Nakon uspješnog plaćanja vraćate se na platformu
- Pretplata se automatski aktivira
- Krediti se dodaju na račun
- Možete odmah koristiti kupljene usluge

**Povrat novca:**
- Mogućnost refund-a ako je potrebno
- Automatski refund u određenim situacijama
- Kontaktirajte podršku za refund zahtjeve

Online plaćanje preko Stripe Checkout-a osigurava sigurno i brzo plaćanje vaših pretplata i leadova!
`
    },
    "Automatska provjera valjanosti licenci": {
      implemented: true,
      summary: "Sustav automatski provjerava valjanost vaših licenci - proverava datume isteka i status licenci.",
      details: `## Kako funkcionira:

Sustav automatski provjerava valjanost vaših licenci u pozadini - provjerava datume isteka i status licenci.

**Kako se provjerava:**
- Sustav automatski provjerava datume isteka licenci
- Provjerava se status licence (aktívna, istekla, itd.)
- Provjeravaju se podaci o licenci
- Automatsko ažuriranje statusa licenci

**Što se provjerava:**
- Datum isteka - je li licenca istekla
- Status licence - je li licenca aktívna
- Valjanost podataka - odgovaraju li podaci
- Potreba za obnavljanjem - treba li obnoviti licencu

**Automatske provjere:**
- Provjera svakodnevno u pozadini
- Provjera pri pristupu određenim funkcionalnostima
- Provjera pri prikazivanju profila
- Kontinuirano praćenje valjanosti

**Notifikacije:**
- Upozorenja kada se licence približavaju isteku
- Upozorenja kada licence ističu
- Podsjetnici za obnavljanje
- Informacije o statusu licenci

**Prednosti:**
- Automatska provjera - nema ručnog rada
- Brzo otkrivanje problema s licencama
- Pravovremene podsjetnike za obnavljanje
- Osigurava aktualnost licenci

**Kada se koristi:**
- Kontinuirano u pozadini
- Prilikom pristupa funkcionalnostima koje zahtijevaju licence
- Prilikom prikazivanja profila korisnicima
- Prilikom provjere kvalifikacija pružatelja

**Rezultati:**
- Status licence se automatski ažurira
- Profil prikazuje valjanost licenci
- Korisnici vide da imate valjane licence
- Ako licence ističu, primite podsjetnike

Automatska provjera valjanosti licenci osigurava da vaše licence ostaju aktualne i valjane!
`
    },
    "Kreditni sustav": {
      implemented: true,
      summary: "Interni sustav kredita za kupovinu leadova - umjesto direktnog plaćanja, koristite kredite koje kupujete ili dobivate s pretplatom.",
      details: `## Kako funkcionira:

Platforma koristi kreditni sustav gdje umjesto direktnog plaćanja za svaki lead, kupujete kredite koje zatim koristite za kupovinu leadova.

**Kako dobiti kredite:**
- Kupnja pretplate - svaki paket uključuje određeni broj kredita
- Jednokratna kupovina - možete kupiti dodatne kredite
- Besplatni trial - dobivate besplatne kredite za probno razdoblje
- Refund - ako dobijete refund, vraća vam se kredit

**Kako koristiti kredite:**
- Kupnja leadova - svaki lead košta određeni broj kredita (npr. 10-20 kredita)
- Automatsko oduzimanje - kada kupite lead, krediti se automatski oduzimaju
- Praćenje stanja - vidite koliko kredita imate na računu
- Povijest - sve transakcije se bilježe

**Prednosti:**
- Jednostavnije plaćanje - ne trebate plaćati za svaki lead odvojeno
- Fleksibilnost - kupujete kredite kada vam trebaju
- Praćenje - lako vidite koliko ste potrošili
- Refund - lako vraćanje kredita ako je potrebno

**Kada koristiti:**
- Pri kupovini leadova - koristite kredite umjesto direktnog plaćanja
- Pri planiranju budžeta - kupujete kredite unaprijed
- Pri upravljanju troškovima - pratite koliko kredita trošite

Kreditni sustav osigurava jednostavnije i fleksibilnije plaćanje leadova!
`
    },
    "Povijest transakcija": {
      implemented: true,
      summary: "Kompletan zapis svih vaših transakcija s kreditima - kupnje, refundovi, pretplate i ostale transakcije.",
      details: `## Kako funkcionira:

Sustav automatski bilježi sve vaše transakcije s kreditima - kompletna povijest svih vaših financijskih aktivnosti na platformi.

**Što se bilježi:**
- Kupnja leadova - kada kupite lead, transakcija se bilježi
- Refund - kada dobijete refund, transakcija se bilježi
- Pretplata - aktivacija pretplate se bilježi
- Kredit dodan - kada se dodaju krediti, transakcija se bilježi
- Kredit oduzet - kada se oduzimaju krediti, transakcija se bilježi

**Informacije o transakciji:**
- Datum i vrijeme transakcije
- Tip transakcije
- Iznos transakcije
- Stanje nakon transakcije
- Opis transakcije
- Status transakcije

**Kako pregledati:**
- Pristupite povijesti transakcija u postavkama
- Filtrirate transakcije po tipu
- Sortirate transakcije po datumu
- Izvezite povijest ako je potrebno

**Prednosti:**
- Kompletan zapis svih transakcija
- Lako praćenje troškova i prihoda
- Dokumentacija za računovodstvo
- Transparentnost svih transakcija

**Kada koristiti:**
- Praćenje troškova - vidite koliko ste potrošili
- Praćenje prihoda - vidite koliko ste dobili od refundova
- Računovodstvo - izvezite podatke za knjigovodstvo
- Analiza - analizirajte svoje troškove i prihode

Povijest transakcija osigurava kompletan zapis svih vaših financijskih aktivnosti na platformi!
`
    },
    "Odabir tipa korisnika (Korisnik usluge / Pružatelj usluge)": {
      implemented: true,
      summary: "Tijekom registracije odaberite jesmo li korisnik usluge (tražite usluge) ili pružatelj usluga (nudite usluge).",
      details: `## Kako funkcionira:

Prilikom registracije na platformu odaberete tip korisnika - želite li biti korisnik usluge ili pružatelj usluga.

**Tipovi korisnika:**
- Korisnik usluge - tražite usluge, objavljujete poslove, primate ponude
- Pružatelj usluga - nudite usluge, šaljete ponude, primate leadove
- Možete imati obje uloge - odaberite obje opcije

**Što određuje odabir:**
- Funkcionalnosti koje ćete vidjeti na platformi
- Navigacija - različita navigacija za različite tipove korisnika
- Funkcije - pristup različitim funkcijama ovisno o tipu
- Profil - različiti tipovi profila za različite tipove korisnika

**Kako odabrati:**
- Tijekom registracije odaberete tip korisnika
- Možete odabrati samo jedan tip ili oba
- Možete promijeniti tip korisnika kasnije u postavkama
- Različiti tipovi imaju različite funkcionalnosti

**Prednosti:**
- Prilagođeno iskustvo za vašu ulogu
- Relevantne funkcije za vašu potrebu
- Jednostavnija navigacija
- Fokus na ono što vam je potrebno

**Za korisnike usluge:**
- Vidite funkcije za objavljivanje poslova
- Pristup upravljanju poslovima
- Komunikacija s pružateljima
- Prihvaćanje ponuda

**Za pružatelje usluga:**
- Vidite funkcije za upravljanje leadovima
- Pristup ROI dashboardu
- Komunikacija s korisnicima
- Slanje ponuda

Odabir tipa korisnika osigurava da vidite funkcije relevantne za vašu ulogu na platformi!
`
    },
    "Profil korisnika usluge (UserProfile)": {
      implemented: true,
      summary: "Vaš osobni profil kao korisnik usluge - upravljajte svojim podacima, postavkama i pregledom aktivnosti.",
      details: `## Kako funkcionira:

Kao korisnik usluge imate svoj osobni profil gdje možete upravljati podacima, postavkama i pregledati svoje aktivnosti.

**Što možete upravljati:**
- Osobni podaci - ime, prezime, email, telefon
- Lokacija - grad, adresa gdje tražite usluge
- Postavke - preferencije i postavke profila
- Notifikacije - upravljanje obavijestima
- Sigurnost - lozinka i sigurnosne postavke

**Što vidite:**
- Svi vaši objavljeni poslovi
- Primljene ponude
- Komunikacija s pružateljima
- Recenzije koje ste ostavili
- Povijest aktivnosti

**Prednosti:**
- Centralizirano upravljanje podacima
- Jednostavno ažuriranje informacija
- Pregled svih aktivnosti
- Kontrola nad profilom i postavkama

**Kada koristiti:**
- Ažuriranje osobnih podataka
- Promjena postavki
- Pregled vlastitih aktivnosti
- Upravljanje notifikacijama

**Integracija:**
- Povezano s vašim poslovima
- Povezano s ponudama
- Povezano s komunikacijom
- Povezano s recenzijama

Profil korisnika usluge osigurava jednostavno upravljanje vašim podacima i aktivnostima na platformi!
`
    },
    "Status pretplate (ACTIVE, CANCELLED, EXPIRED)": {
      implemented: true,
      summary: "Praćenje statusa vaše pretplate - vidite je li pretplata aktivna, otkazana ili istekla.",
      details: `## Kako funkcionira:

Svaka pretplata ima status koji pokazuje njezino trenutno stanje - aktivna, otkazana ili istekla.

**Statusi pretplate:**
- ACTIVE (Aktivna) - pretplata je aktivna i možete koristiti sve funkcionalnosti
- CANCELLED (Otkazana) - pretplata je otkazana ali još vrijedi do kraja perioda
- EXPIRED (Istekla) - pretplata je istekla i više ne možete koristiti funkcionalnosti

**ACTIVE status:**
- Pretplata je aktivna i funkcionalna
- Možete koristiti sve kredite i funkcionalnosti
- Automatsko obnavljanje na kraju perioda (ako je omogućeno)
- Pristup svim funkcionalnostima

**CANCELLED status:**
- Pretplata je otkazana
- Možete koristiti kredite i funkcionalnosti do kraja plaćenog perioda
- Ne obnavlja se automatski na kraju perioda
- Prelazi na EXPIRED nakon isteka perioda

**EXPIRED status:**
- Pretplata je istekla
- Ne možete koristiti funkcionalnosti koje zahtijevaju pretplatu
- Možete se vratiti na BASIC plan ili aktivirati novu pretplatu
- Krediti ostaju ako su ostali

**Kako vidjeti status:**
- U postavkama pretplate
- Na dashboardu
- U obavijestima
- Automatski ažuriranje statusa

**Prednosti:**
- Jasna slika statusa pretplate
- Lako praćenje aktivnosti pretplate
- Transparentnost statusa
- Upozorenja prije isteka

Status pretplate osigurava da uvijek znate u kojem je stanju vaša pretplata!
`
    },
    "Trial period (7 dana)": {
      implemented: true,
      summary: "Probno razdoblje od 7 dana - isprobajte platformu besplatno prije nego što kupite pretplatu.",
      details: `## Kako funkcionira:

Novi pružatelji dobivaju besplatno probno razdoblje od 7 dana da isprobaju platformu prije nego što kupe pretplatu.

**Što dobivate:**
- Besplatno probno razdoblje od 7 dana
- Besplatni krediti za kupovinu leadova
- Pristup svim funkcionalnostima
- Mogućnost isprobavanja platforme bez obveze

**Kako funkcionira:**
- Automatski se aktivira pri registraciji kao pružatelj
- Traje 7 dana od trenutka registracije
- Ne morate unijeti podatke o kartici
- Možete koristiti sve funkcionalnosti

**Prednosti:**
- Isprobajte platformu bez rizika
- Vidite je li platforma za vas
- Bez obveze - možete odustati bilo kada
- Besplatno testiranje funkcionalnosti

**Kada se koristi:**
- Prilikom prve registracije kao pružatelj
- Prije kupovine pretplate
- Za testiranje platforme
- Za upoznavanje s funkcionalnostima

**Nakon trial perioda:**
- Možete kupiti pretplatu ako želite nastaviti
- Možete odustati bez obveze
- Prelazite na BASIC plan ako ne kupite pretplatu
- Nema automatske naplate

Trial period vam omogućava da besplatno isprobate platformu prije kupovine pretplate!
`
    },
    "Besplatni krediti za trial (5 leadova)": {
      implemented: true,
      summary: "Dobivate besplatne kredite za kupovinu 5 leadova tijekom probnog razdoblja - dovoljno da isprobate funkcionalnosti.",
      details: `## Kako funkcionira:

Tijekom probnog razdoblja od 7 dana dobivate besplatne kredite dovoljne za kupovinu 5 leadova.

**Koliko kredita dobivate:**
- Dovoljno kredita za kupovinu 5 leadova
- Možete isprobati kupovinu leadova
- Možete testirati queue sustav
- Možete vidjeti kako funkcioniraju leadovi

**Kako koristiti:**
- Kupite leadove kao što biste inače
- Krediti se automatski oduzimaju
- Možete vidjeti koliko kredita imate
- Sve funkcionalnosti su dostupne

**Prednosti:**
- Pravi test funkcionalnosti
- Vidite kako funkcionira kupnja leadova
- Isprobajte queue sustav
- Bez troškova za testiranje

**Kada koristiti:**
- Tijekom trial perioda
- Za testiranje kupovine leadova
- Za upoznavanje s funkcionalnostima
- Za procjenu kvalitete leadova

**Nakon potrošnje kredita:**
- Možete kupiti pretplatu za više kredita
- Možete testirati ostale funkcionalnosti
- Trial period i dalje traje 7 dana
- Nema automatske naplate

Besplatni krediti za trial omogućavaju vam da isprobate kupovinu leadova bez troškova!
`
    },
    "Notifikacije o isteku licenci": {
      implemented: true,
      summary: "Sustav šalje više niveliranih podsjetnika (30/14/7/1 dan) prije isteka licence radi pravovremene obnove.",
      details: `**Kako funkcionira**
- Scheduler svakodnevno provjerava datume isteka licenci i generira podsjetnike.
- Notifikacije se šalju kroz preferirane kanale (in-app/email/SMS).
- Ako licenca istekne, status se automatski mijenja i badge pada dok se ne obnovi.

**Prednosti**
- Sprječava gubitak statusa verificiranog providera.
- Održava compliance i povjerenje korisnika.

**Kada koristiti**
- Kontinuirano – sve aktivne licence ulaze u scheduler.
- Kod planiranja godišnjih revizija i audit pregleda.
`,
      technicalDetails: `**Frontend**
- Banner na profilu i email template s instrukcijama za obnovu.
- Lista licenci označava one koje uskoro istječu.

**Backend**
- \`licenseExpiryJob\` agregira licence i emitira \`license.expiring\` event.
- \`notificationService.sendLicenseReminder\` odrađuje slanje.

**Baza**
- \`ProviderLicense\` polje \`expiresAt\`, \`status\`.
- \`LicenseReminderLog\` bilježi poslane podsjetnike.

**Integracije**
- Notification provider (email/SMS/push).
- Analytics mjeri koliko licenci je obnovljeno prije isteka.

**API**
- \`GET /api/provider/licenses/expiring?days=...\` – vraća licence blizu isteka.
- \`POST /api/provider/licenses/:id/renew\` – ažurira licencu.
`
    },
    "ROI dashboard za providere": {
      implemented: true,
      summary: "ROI dashboard centralizira ključne metrike (prihod, ROI, konverzija, troškovi, reputacija) za providere.",
      details: `**Kako funkcionira**
- Dashboard povlači agregirane podatke o leadovima, prihodima, troškovima i SLA-ovima.
- Vizualizacije prikazuju trendove, breakdown po kategorijama i usporedbe s ciljevima.
- Filtri (period, kategorija, plan) omogućuju dubinsku analizu.

**Prednosti**
- Provider na jednom mjestu vidi učinkovitost ulaganja.
- Olakšava donošenje odluka o budžetu i fokusiranju na profitabilne segmente.

**Kada koristiti**
- Dnevni/tjedni pregled performansi.
- Strategijski sastanci, planiranje kampanja i revizija.
`,
      technicalDetails: `**Frontend**
- React vizualizacije (line, bar, pie, KPI kartice) s mogućnošću exporta.
- Lazy loading i caching radi performansi na velikim datasetima.

**Backend**
- \`analyticsService.getProviderDashboard\` agregira podatke iz warehousea i OLTP baze.
- Scheduled ETL job osvježava agregate (hourly/daily).

**Baza**
- Data warehouse tablice \`LeadFact\`, \`RevenueFact\`, \`CreditFact\`.
- Materialized views za najčešće upite.

**Integracije**
- BI/analytics pipeline, notification servis (weekly summary), CRM export.

**API**
- \`GET /api/analytics/provider-dashboard\` – vraća KPI-je i grafove.
- \`GET /api/analytics/provider-dashboard/export\` – download izvještaja.
`
    },
    "Cijene leadova (10-20 kredita)": {
      implemented: true,
      summary: "Transparentne cijene leadova - svaki lead košta između 10 i 20 kredita, ovisno o kategoriji i kvaliteti leada.",
      details: `## Kako funkcionira:

Svaki lead na tržištu ima svoju cijenu koja se izražava u kreditima - obično između 10 i 20 kredita po leadu.

**Raspon cijena:**
- Minimum: 10 kredita - za osnovne leadove
- Maksimum: 20 kredita - za visokokvalitetne leadove
- Prosjek: 15 kredita - za većinu leadova
- Cijena ovisi o kategoriji i kvaliteti leada

**Što utječe na cijenu:**
- Kategorija usluge - neke kategorije koštaju više
- Kvaliteta leada - viši AI score = viša cijena
- Trust score korisnika - verificirani korisnici = viša cijena
- Kompleksnost posla - veći poslovi = viša cijena

**Transparentnost:**
- Vidite cijenu prije kupovine
- Nema skrivenih troškova
- Cijena je jasno prikazana
- Lako planiranje budžeta

**Kako vidjeti cijenu:**
- Na tržištu leadova vidite cijenu svakog leada
- Cijena je prikazana u kreditima
- Možete filtrirati po cijeni
- Vidite raspon cijena za kategoriju

**Prednosti:**
- Transparentne cijene
- Lako planiranje budžeta
- Jasno vidite što plaćate
- Fer cijene za sve pružatelje

**Kada koristiti:**
- Pri odabiru leadova za kupovinu
- Pri planiranju budžeta
- Pri usporedbi leadova
- Pri optimizaciji troškova

**Fleksibilnost:**
- Možete kupiti leadove različitih cijena
- Mogućnost odabira prema budžetu
- Kombiniranje leadova različitih cijena
- Optimizacija ulaganja

Cijene leadova osiguravaju transparentnost i lako planiranje budžeta za kupovinu leadova!
`
    },
    "Red čekanja za leadove (LeadQueue)": {
      implemented: true,
      summary: "Automatski red čekanja koji distribuira leadove pružateljima prema njihovoj poziciji i reputaciji - pravedna i efikasna distribucija.",
      details: `## Kako funkcionira:

LeadQueue je automatski sustav koji distribuira leadove pružateljima prema njihovoj poziciji u redu i reputaciji.

**Kako radi:**
- Kada se pojavi novi lead, dodaje se u red čekanja
- Pružatelji se dodjeljuju prema poziciji u redu
- Pružatelji s boljom reputacijom dobivaju prioritet
- Automatska distribucija svakog sata

**Pozicija u redu:**
- Svaki pružatelj ima poziciju u redu
- Pozicija se određuje na osnovu reputacije i performansi
- Pružatelji s boljom reputacijom su više u redu
- Aktivni pružatelji mogu poboljšati poziciju

**Statusi leadova:**
- WAITING - čeka na dodjelu pružatelju
- OFFERED - ponuđen pružatelju
- ACCEPTED - prihvaćen od strane pružatelja
- DECLINED - odbijen od strane pružatelja
- EXPIRED - istekao rok za odgovor
- SKIPPED - preskočen zbog neaktivnosti

**Prednosti:**
- Pravedna distribucija leadova
- Aktivni pružatelji dobivaju prioritet
- Automatska distribucija bez ručnog rada
- Optimizirana distribucija za maksimalnu konverziju

Red čekanja za leadove osigurava pravednu i efikasnu distribuciju leadova svim pružateljima!
`
    },
    "Statusi u redu (WAITING, OFFERED, ACCEPTED, DECLINED, EXPIRED, SKIPPED)": {
      implemented: true,
      summary: "Različiti statusi leadova u redu čekanja - vidite gdje se svaki lead nalazi u procesu distribucije.",
      details: `## Kako funkcionira:

Svaki lead u redu čekanja ima status koji pokazuje gdje se nalazi u procesu distribucije.

**Statusi leadova:**

**WAITING (Čeka):**
- Lead čeka na dodjelu pružatelju
- Još nije ponuđen nikome
- U redu čekanja za distribuciju

**OFFERED (Ponuđen):**
- Lead je ponuđen pružatelju
- Čeka odgovor pružatelja
- Rok za odgovor: 24 sata

**ACCEPTED (Prihvaćen):**
- Pružatelj je prihvatio lead
- Lead je sada aktivan za pružatelja
- Pružatelj može kontaktirati korisnika

**DECLINED (Odbijen):**
- Pružatelj je odbio lead
- Lead se vraća u red za druge pružatelje
- Automatski se ponudi sljedećem pružatelju

**EXPIRED (Istekao):**
- Rok za odgovor je istekao (24h)
- Pružatelj nije odgovorio na vrijeme
- Lead se vraća u red ili se refundira

**SKIPPED (Preskočen):**
- Pružatelj je preskočen zbog neaktivnosti
- Lead se automatski pomiče sljedećem
- Aktivni pružatelji dobivaju prioritet

**Kako vidjeti status:**
- U sekciji "Pregled mojih leadova u redu"
- Svaki lead prikazuje svoj status
- Filtriranje leadova po statusu
- Pregled svih leadova s njihovim statusima

**Prednosti:**
- Jasna slika statusa svakog leada
- Lako praćenje leadova
- Transparentnost procesa distribucije
- Brže reagiranje na promjene statusa

Statusi u redu osiguravaju da uvijek znate gdje se vaši leadovi nalaze u procesu distribucije!
`
    },
    "Rok za odgovor (24h)": {
      implemented: true,
      summary: "Imate 24 sata da odgovorite na lead koji vam je ponuđen - nakon toga se automatski vraća u red ili se refundira.",
      details: `## Kako funkcionira:

Kada vam se ponudi lead u redu čekanja, imate 24 sata da odgovorite - prihvatite li ili odbijete lead.

**Kako funkcionira:**
- Lead vam se ponudi u queue sustavu
- Od trenutka ponude imate 24 sata za odgovor
- Možete prihvatiti (INTERESTED) ili odbiti (NOT_INTERESTED)
- Ako ne odgovorite, lead se automatski vraća u red

**Što se događa ako ne odgovorite:**
- Nakon 24 sata lead se označi kao EXPIRED
- Lead se vraća u red za druge pružatelje
- Moguć je automatski refund ako nema odgovora
- Vaša reputacija može biti utječena

**Zašto je važno brzo odgovoriti:**
- Brži odgovori donose bolju reputaciju
- Aktivni pružatelji dobivaju prioritet u distribuciji
- Veća šansa da prihvatite lead prije nego što ističe
- Manje rizika od isteka roka

**Kako pratiti:**
- Vidite koliko vremena preostaje za svaki lead
- Notifikacije za nove leadove u redu
- Podsjetnici prije isteka roka
- Jasni indikatori vremena

**Prednosti:**
- Potiče brze odgovore
- Pravedna distribucija leadova
- Automatsko upravljanje neaktivnim pružateljima
- Efikasniji proces distribucije

Rok za odgovor osigurava da leadovi ne ostaju neodgovoreni i da aktivni pružatelji dobivaju prioritet!
`
    },
    "Odgovori providera (INTERESTED, NOT_INTERESTED, NO_RESPONSE)": {
      implemented: true,
      summary: "Tri moguća odgovora kada vam se ponudi lead - prihvatite, odbijte ili ne odgovorite u roku.",
      details: `## Kako funkcionira:

Kada vam se ponudi lead u redu čekanja, imate tri moguća odgovora.

**Mogući odgovori:**

**INTERESTED (Zainteresiran):**
- Prihvaćate lead i želite kontaktirati korisnika
- Lead postaje aktivan za vas
- Možete odmah kontaktirati korisnika
- Lead se uklanja iz queue sustava

**NOT_INTERESTED (Niste zainteresirani):**
- Odbijate lead jer vam ne odgovara
- Lead se automatski vraća u red
- Ponudi se sljedećem pružatelju
- Vaša reputacija nije negativno utječena

**NO_RESPONSE (Nema odgovora):**
- Ne odgovorite u roku od 24 sata
- Lead se automatski označi kao EXPIRED
- Može se vratiti u red ili refundirati
- Vaša reputacija može biti negativno utječena

**Kako odgovoriti:**
- Kliknite na lead u queue sustavu
- Odaberite INTERESTED ili NOT_INTERESTED
- Možete dodati komentar ako želite
- Odgovor se automatski zapisuje

**Prednosti:**
- Jednostavno odgovaranje - jedan klik
- Brzo prihvaćanje ili odbijanje
- Automatsko upravljanje leadovima
- Transparentan proces

**Zašto je važno odgovoriti:**
- Brži odgovori donose bolju reputaciju
- Aktivni pružatelji dobivaju prioritet
- Leadovi se brže distribuiraju
- Bolja konverzija leadova

Odgovori providera osiguravaju jednostavno i brzo odgovaranje na leadove u queue sustavu!
`
    },
    "Queue scheduler (provjera svakih sat vremena)": {
      implemented: true,
      summary: "Automatska provjera queue sustava svakih sat vremena - distribuira nove leadove i ažurira status postojećih.",
      details: `## Kako funkcionira:

Queue scheduler automatski provjerava queue sustav svakih sat vremena kako bi distribuirao nove leadove i ažurirao status postojećih.

**Kako radi:**
- Automatski pokretanje svakih sat vremena
- Provjerava nove leadove koji čekaju distribuciju
- Distribuira leadove pružateljima prema poziciji u redu
- Ažurira status leadova koji su istekli ili trebaju ažuriranje

**Što scheduler radi:**
- Distribuira nove leadove pružateljima
- Provjerava istekle leadove (nakon 24h)
- Ažurira status EXPIRED leadova
- Preskače neaktivne pružatelje
- Refundira leadove ako je potrebno

**Prednosti:**
- Automatska distribucija - nema ručnog rada
- Efikasna distribucija leadova
- Brzo ažuriranje statusa
- Optimizirana distribucija

**Kada se koristi:**
- Kontinuirano u pozadini
- Svakih sat vremena
- Automatski bez intervencije
- Ne zahtijeva ručno pokretanje

**Za korisnike:**
- Brže dobivanje leadova
- Automatska distribucija
- Pravedna distribucija
- Efikasniji proces

Queue scheduler osigurava automatsku i efikasnu distribuciju leadova svakih sat vremena!
`
    },
    "Refund kredita (vraćanje internih kredita)": {
      implemented: true,
      summary: "Vraćanje internih kredita na vaš račun kada je potreban refund - jednostavno i brzo vraćanje kredita.",
      details: `## Kako funkcionira:

Kada je potreban refund za lead ili pretplatu, krediti se automatski vraćaju na vaš račun kao interni krediti.

**Kada se vraćaju krediti:**
- Refund ako klijent ne odgovori u roku
- Automatski refund nakon 48h neaktivnosti
- Ručno zatraživanje refund-a
- Refund za pretplate

**Kako funkcionira:**
- Krediti se automatski vraćaju na vaš račun
- Vidite refund u povijesti transakcija
- Krediti su odmah dostupni za upotrebu
- Nema čekanja na bankovni transfer

**Prednosti:**
- Brzo vraćanje kredita
- Odmah dostupni za upotrebu
- Jednostavno praćenje
- Transparentan proces

**Kada koristiti:**
- Kada dobijete refund za lead
- Kada dobijete refund za pretplatu
- Provjera povijesti refundova
- Praćenje vraćenih kredita

Refund kredita osigurava brzo i jednostavno vraćanje vaših kredita kada je potreban refund!
`
    },
    "Stripe Payment Intent refund API (PSD2 compliant)": {
      implemented: true,
      summary: "Ako ste platili lead putem Stripe kartice, refund se vraća direktno na vašu karticu prema PSD2 propisima.",
      details: `## Kako funkcionira:

Ako ste kupili lead ili pretplatu putem Stripe kartice, refund se automatski vraća direktno na vašu karticu.

**Kako funkcionira:**
- Ako ste platili Stripe karticom, refund ide na karticu
- Automatski proces refund-a
- PSD2 compliant - u skladu s europskim propisima
- Brzo vraćanje novca na karticu

**Prednosti:**
- Direktno vraćanje na karticu
- Brzo vraćanje novca
- Compliance s propisima
- Automatski proces

**Kada koristiti:**
- Kada dobijete refund za lead plaćen karticom
- Kada dobijete refund za pretplatu plaćenu karticom
- Provjera refund statusa
- Praćenje vraćenih sredstava

Stripe Payment Intent refund API osigurava sigurno i brzo vraćanje novca na vašu karticu!
`
    },
    "Automatski odabir refund metode (Stripe API ili interni krediti)": {
      implemented: true,
      summary: "Sustav automatski odabire najbolju metodu refund-a - vraćanje na karticu ako ste platili karticom, inače vraćanje kredita.",
      details: `## Kako funkcionira:

Sustav automatski odlučuje kako će vratiti refund - vraćanje na karticu ako ste platili Stripe karticom, ili vraćanje internih kredita ako ste koristili kredite.

**Kako radi:**
- Sustav provjerava kako ste platili
- Ako ste platili Stripe karticom, refund ide na karticu
- Ako ste platili kreditima, refund ide kao krediti
- Automatski odabir najbolje metode

**Prednosti:**
- Automatski proces - nema ručnog rada
- Najbolja metoda za svaki slučaj
- Brzo vraćanje sredstava
- Transparentan proces

**Kada koristiti:**
- Automatski prilikom refund-a
- Nema potrebe za ručnim odabirom
- Sustav automatski odlučuje
- Jednostavno i efikasno

Automatski odabir refund metode osigurava da uvijek dobijete refund na najbolji mogući način!
`
    },
    "Razlozi za refund (klijent ne odgovori, itd.)": {
      implemented: true,
      summary: "Različiti razlozi za refund - klijent ne odgovori, automatska neaktivnost ili ručno zatraživanje.",
      details: `## Kako funkcionira:

Postoje različiti razlozi za refund koji određuju kada i zašto ćete dobiti refund.

**Razlozi za refund:**

**Klijent ne odgovori:**
- Klijent ne odgovori na vaš kontakt u određenom roku
- Automatski refund nakon određenog vremena
- Lead se oslobađa i vraća na tržište

**Automatska neaktivnost:**
- Automatski refund nakon 48h neaktivnosti
- Ako lead ostane neaktivan preko 48h
- Lead se automatski oslobađa

**Ručno zatraživanje:**
- Vi ručno zatražite refund za lead
- Možete navesti razlog za refund
- Refund se procesuira brzo

**Prednosti:**
- Zaštita od neaktivnih leadova
- Pravedan refund sustav
- Automatsko upravljanje
- Transparentnost razloga

**Kada koristiti:**
- Automatski kada klijent ne odgovori
- Kada lead ostane neaktivan
- Kada ručno zatražite refund
- Provjera razloga za refundove

Razlozi za refund osiguravaju pravedan i transparentan proces refund-a za sve slučajeve!
`
    },
    "Povijest refund transakcija (CreditTransaction tip REFUND)": {
      implemented: true,
      summary: "Kompletan zapis svih refund transakcija - vidite sve refundove, razloge i iznose u povijesti transakcija.",
      details: `## Kako funkcionira:

Sve refund transakcije se automatski bilježe u povijesti transakcija s tipom REFUND.

**Što se bilježi:**
- Datum i vrijeme refund-a
- Iznos refund-a
- Razlog refund-a
- Način refund-a (Stripe ili krediti)
- Lead ili pretplata za koju je refund
- Status refund-a

**Kako pregledati:**
- U povijesti transakcija
- Filtrirate po tipu REFUND
- Sortirate po datumu
- Pregledate detalje svakog refund-a

**Prednosti:**
- Kompletan zapis svih refundova
- Lako praćenje refundova
- Dokumentacija za računovodstvo
- Transparentnost procesa

**Kada koristiti:**
- Praćenje refundova
- Provjera povijesti refundova
- Dokumentacija za računovodstvo
- Analiza refundova

Povijest refund transakcija osigurava kompletan zapis svih vaših refundova!
`
    },
    "Status refund-a (REFUNDED)": {
      implemented: true,
      summary: "Status REFUNDED označava da je refund uspješno procesuiran i da su sredstva vraćena.",
      details: `## Kako funkcionira:

Status REFUNDED označava da je refund uspješno procesuiran i da su sredstva vraćena na vaš račun ili karticu.

**Što znači REFUNDED:**
- Refund je uspješno procesuiran
- Sredstva su vraćena
- Lead je oslobođen
- Transakcija je završena

**Kako vidjeti status:**
- U povijesti transakcija
- Na detaljima refund transakcije
- U statusu leada
- U obavijestima

**Prednosti:**
- Jasna slika statusa refund-a
- Lako praćenje refundova
- Transparentnost procesa
- Potvrda vraćenih sredstava

**Kada koristiti:**
- Provjera statusa refund-a
- Potvrda vraćenih sredstava
- Praćenje refundova
- Dokumentacija transakcija

Status refund-a osigurava da uvijek znate status vašeg refund-a!
`
    },
    "Oslobađanje leada nakon refund-a (lead se vraća na tržište)": {
      implemented: true,
      summary: "Nakon refund-a, lead se automatski oslobađa i vraća na tržište kako bi ga drugi pružatelji mogli kupiti.",
      details: `## Kako funkcionira:

Kada dobijete refund za lead, lead se automatski oslobađa iz vašeg vlasništva i vraća na tržište kako bi ga drugi pružatelji mogli kupiti.

**Kako funkcionira:**
- Nakon refund-a, lead se automatski oslobađa
- Lead se vraća na tržište leadova
- Drugi pružatelji mogu kupiti lead
- Lead ostaje aktivan na tržištu

**Zašto je važno:**
- Lead ne propada
- Drugi pružatelji mogu koristiti lead
- Efikasnije korištenje leadova
- Veća stopa konverzije

**Kada se događa:**
- Automatski nakon refund-a
- Nakon automatskog refund-a (48h neaktivnosti)
- Nakon ručnog refund-a
- Nakon refund-a zbog neaktivnosti klijenta

**Prednosti:**
- Lead ne propada
- Drugi pružatelji mogu koristiti lead
- Efikasnije korištenje leadova
- Veća šansa za konverziju

Oslobađanje leada nakon refund-a osigurava da leadovi ne propadaju i da drugi pružatelji mogu koristiti leadove!
`
    },
    "Stripe refund ID tracking (stripeRefundId)": {
      implemented: true,
      summary: "Praćenje Stripe refund ID-a za svaki refund - lako praćenje refund transakcija i podrška.",
      details: `## Kako funkcionira:

Za svaki refund koji se procesuira preko Stripe-a, sustav automatski bilježi Stripe refund ID kako biste mogli lako pratiti refund transakciju.

**Što se bilježi:**
- Stripe refund ID za svaki refund
- Povezivanje s refund transakcijom
- Praćenje statusa refund-a u Stripe-u
- Dokumentacija refund transakcije

**Zašto je važno:**
- Lako praćenje refund transakcija
- Pomoć pri kontaktiranju podrške
- Dokumentacija refund transakcija
- Provjera statusa refund-a

**Kada koristiti:**
- Pri provjeri statusa refund-a
- Pri kontaktiranju podrške
- Pri praćenju refund transakcija
- Za dokumentaciju

**Prednosti:**
- Lako praćenje refund transakcija
- Dokumentacija refund transakcija
- Pomoć pri podršci
- Transparentnost procesa

Stripe refund ID tracking osigurava lako praćenje i dokumentaciju svih refund transakcija!
`
    },
    "Povrat novca za pretplate (refund subscription payment)": {
      implemented: true,
      summary: "Mogućnost refund-a za pretplate - vraćanje novca za pretplatu ako je potrebno.",
      details: `## Kako funkcionira:

Možete zatražiti refund za pretplatu - vraćanje novca za pretplatu ako je potrebno.

**Kada možete zatražiti refund:**
- Ako ste platili pretplatu a ne zadovoljni ste
- Ako imate problem s pretplatom
- Ako je došlo do greške
- Kontaktirajte podršku za refund

**Kako funkcionira:**
- Kontaktirate podršku za refund zahtjev
- Podrška procesuira refund zahtjev
- Novac se vraća na vašu karticu ili kao krediti
- Pretplata se otkazuje ako je potrebno

**Prednosti:**
- Mogućnost refund-a ako je potrebno
- Zaštita vaših sredstava
- Pravedan refund sustav
- Podrška vam pomaže

**Kada koristiti:**
- Ako ste nezadovoljni pretplatom
- Ako je došlo do greške
- Ako imate problem s pretplatom
- Kontaktiranje podrške za refund

Povrat novca za pretplate osigurava zaštitu vaših sredstava i pravedan refund sustav!
`
    },
    "Plaćanje leadova kroz Stripe (opcionalno, umjesto internih kredita)": {
      implemented: true,
      summary: "Umjesto korištenja internih kredita, možete direktno platiti lead karticom preko Stripe-a - fleksibilno plaćanje.",
      details: `## Kako funkcionira:

Kada kupujete lead, možete odabrati hoćete li platiti internim kreditima ili direktno karticom preko Stripe-a.

**Dvije opcije plaćanja:**

**Interni krediti:**
- Koristite kredite koje imate na računu
- Brzo i jednostavno plaćanje
- Nema potrebe za unosom kartice
- Idealno za redovite korisnike

**Stripe plaćanje karticom:**
- Plaćate direktno karticom
- Nema potrebe za kreditima
- Jednokratno plaćanje
- Idealno za povremene kupnje

**Kako odabrati:**
- Pri kupovini leada vidite obje opcije
- Odaberete interni kredit ili Stripe plaćanje
- Ako odaberete Stripe, preusmjereni ste na Stripe Checkout
- Nakon plaćanja lead je odmah vaš

**Prednosti:**
- Fleksibilnost u načinu plaćanja
- Možete odabrati što vam više odgovara
- Jednokratne kupnje bez potrebe za kreditima
- Redovite kupnje s kreditima

**Kada koristiti:**
- Jednokratne kupnje - koristite Stripe plaćanje
- Redovite kupnje - koristite interne kredite
- Ako nemate dovoljno kredita - koristite Stripe plaćanje
- Prema vašim preferencama

Plaćanje leadova kroz Stripe osigurava fleksibilnost u načinu plaćanja leadova!
`
    },
    "Fakturiranje (PDF fakture za pretplate i kupovine)": {
      implemented: true,
      summary: "Automatski generirane PDF fakture za sve vaše pretplate i kupovine - profesionalne fakture za računovodstvo. PDF fakture se automatski spremaju u AWS S3 za trajno čuvanje.",
      details: `**✅ POTPUNO IMPLEMENTIRANO**: Kompletan sustav za generiranje i čuvanje PDF faktura s AWS S3 storage integracijom. PDF fakture se automatski generiraju, uploadaju u S3 i spremaju URL u bazu podataka.

## Kako funkcionira:

Platforma automatski generira PDF fakture za sve vaše pretplate i kupovine leadova.

**Kada se generiraju fakture:**
- Automatski prilikom aktivacije pretplate
- Automatski prilikom kupovine leadova (ako platite karticom)
- Možete preuzeti fakturu bilo kada
- Fakture su dostupne u povijesti transakcija

**Što sadrži faktura:**
- Vaši podaci (ime, adresa, OIB)
- Podaci platforme
- Datum izdavanja fakture
- Broj fakture
- Opis usluge (pretplata ili kupovina leadova)
- Iznos (s PDV-om ako je primjenjivo)
- Način plaćanja

**Kako preuzeti fakturu:**
- U povijesti transakcija
- Kliknite na "Preuzmi fakturu" za transakciju
- PDF se preuzima na vaš računalo
- Možete spremiti ili ispisati fakturu

**Prednosti:**
- Automatsko generiranje faktura
- Profesionalne PDF fakture
- Lako preuzimanje
- Dokumentacija za računovodstvo

**Kada koristiti:**
- Za računovodstvo
- Za dokumentaciju
- Za porezne svrhe
- Za knjigovodstvo

**Zaštita:**
- Fakture se čuvaju sigurno
- Dostupne su bilo kada
- Ne mogu se izmijeniti
- Legalni dokumenti

Fakturiranje osigurava automatsko generiranje profesionalnih PDF faktura za sve vaše transakcije!
`
    },
    "Sigurnosno skladištenje Stripe secret key u AWS Secrets Manager": {
      implemented: true,
      summary: "Sigurno čuvanje vaših podataka o plaćanju - svi podaci o kartici se čuvaju sigurno u AWS Secrets Manager, ne na platformi.",
      details: `## Kako funkcionira:

Vaši podaci o plaćanju i sigurnosni ključevi se čuvaju sigurno u AWS Secrets Manager, najsigurnijem načinu čuvanja osjetljivih podataka.

**Sigurnost podataka:**
- Podaci o kartici se ne čuvaju na platformi
- Stripe obrađuje sve podatke o kartici
- Sigurnosni ključevi su u AWS Secrets Manager
- Najviši standardi sigurnosti

**Zašto je važno:**
- Zaštita vaših financijskih podataka
- Compliance s propisima o zaštiti podataka
- Najsigurniji način čuvanja podataka
- Zaštita od curenja podataka

**Prednosti:**
- Najviši standardi sigurnosti
- Zaštita vaših podataka
- Compliance s propisima
- Pouzdanost

**Za korisnike:**
- Vaši podaci su sigurni
- Nema rizika od zloupotrebe
- Najviši standardi sigurnosti
- Možete se osloniti na platformu

**Kako to funkcionira:**
- Automatski u pozadini
- Nema potrebe za ručnom intervencijom
- Kontinuirana zaštita podataka
- Najsigurniji mogući način

Sigurnosno skladištenje osigurava da su vaši financijski podaci sigurni i zaštićeni!
`
    },
    "Različiti pravni statusi (Fizička osoba, Obrt, d.o.o., j.d.o.o., itd.)": {
      implemented: true,
      summary: "Odaberite svoj pravni status pri registraciji - fizička osoba, obrt, d.o.o., j.d.o.o. ili drugi pravni oblik.",
      details: `## Kako funkcionira:

Prilikom registracije odaberete svoj pravni status - na osnovu toga će se odrediti koji podaci su potrebni i kako će se procesuirati verifikacije.

**Dostupni pravni statusi:**

**Fizička osoba:**
- Za privatne osobe koje nude usluge
- Osnovni podaci - ime, prezime, OIB
- Idealno za freelance radnike

**Obrt:**
- Za registrirane obrte
- Potrebni podaci - naziv obrta, OIB, obrtni broj
- Verifikacija u obrtnom registru

**d.o.o. (društvo s ograničenom odgovornošću):**
- Za d.o.o. tvrtke
- Potrebni podaci - naziv tvrtke, OIB, matični broj
- Verifikacija u sudskom registru

**j.d.o.o. (jednostavno društvo s ograničenom odgovornošću):**
- Za j.d.o.o. tvrtke
- Potrebni podaci - naziv tvrtke, OIB, matični broj
- Verifikacija u sudskom registru

**Ostali pravni oblici:**
- d.d. (dioničko društvo)
- Zadruga
- Udruga
- Ostali legalni oblici

**Kako odabrati:**
- Tijekom registracije odaberete pravni status
- Platforma će tražiti odgovarajuće podatke
- Različiti statusi imaju različite verifikacije
- Možete ažurirati pravni status kasnije

**Prednosti:**
- Prilagođeno vašem pravnom statusu
- Relevantne verifikacije
- Compliance s propisima
- Točan prikaz vašeg poslovnog oblika

**Zašto je važno:**
- Određuje potrebne verifikacije
- Utječe na prikaz profila
- Compliance s propisima
- Pravno točan prikaz

Različiti pravni statusi osiguravaju da vaš profil odražava vaš pravni oblik i da su sve verifikacije relevantne!
`
    },
    "SMS verifikacija telefonskog broja (Twilio)": {
      implemented: true,
      summary: "Verifikacija vašeg telefonskog broja putem SMS poruke - potvrda da telefon stvarno pripada vama.",
      details: `## Kako funkcionira:

Sustav šalje SMS poruku s verifikacijskim kodom na vaš telefon kako bi potvrdio da telefon stvarno pripada vama.

**Kako funkcionira:**
- Unesete svoj telefonski broj
- Sustav šalje SMS poruku s verifikacijskim kodom
- Unesete kod koji ste primili
- Telefon se verificira i dobivate Phone Badge

**Što dobivate:**
- Phone Identity Badge na vašem profilu
- Povećanje trust score-a
- Veće povjerenje korisnika
- Dokaz da telefon pripada vama

**Sigurnost:**
- Kod vrijedi 10 minuta
- Svaki kod se može koristiti samo jednom
- Rate limiting - maksimalno 3 SMS-a u 1 satu
- Zaštita od zloupotrebe

**Prednosti:**
- Brza verifikacija telefona
- Dokaz valjanosti telefona
- Povećanje trust score-a
- Veće povjerenje korisnika

**Kada koristiti:**
- Tijekom registracije
- Pri ažuriranju telefonskog broja
- Za dobivanje Phone Badge-a
- Za povećanje trust score-a

SMS verifikacija osigurava da vaš telefonski broj pripada vama i povećava povjerenje korisnika!
`
    },
    "DNS TXT record verifikacija domena": {
      implemented: true,
      summary: "Vlasništvo nad domenom potvrđuje se dodavanjem DNS TXT zapisa koji platforma provjerava.",
      details: `**Kako funkcionira**
- Sustav generira jedinstveni TXT token i prikazuje u profilu.
- Korisnik ga dodaje u DNS postavke svoje domene; periodični job provjerava DNS i potvrđuje vlasništvo.
- Nakon potvrde, profil dobiva DNS badge i veći trust score.

**Prednosti**
- Dokazuje profesionalno vlasništvo nad web stranicom.
- Povećava vjerodostojnost i pomaže SEO-u/brandingu.

**Kada koristiti**
- Kad provider ima vlastitu domenu koju želi prikazati na profilu.
- Prije aktivacije naprednijih značajki koje traže verificiranu domenu.
`,
      technicalDetails: `**Frontend**
- Upute za dodavanje DNS zapisa + status provjere (Pending/Verified/Failed).
- CTA za ponovno pokretanje provjere.

**Backend**
- \`domainVerificationService.issueToken\` generira TXT vrijednost.
- \`domainVerificationService.verify\` koristi DNS lookup (AWS Route53, Google DNS) i ažurira status.

**Baza**
- \`DomainVerification\` (domain, token, status, verifiedAt, attempts).
- Povezana s \`ProviderProfile\` i badge zapisom.

**Integracije**
- DNS resolveri (Route53 SDK, public DNS API), notification servis.

**API**
- \`POST /api/verifications/domain\` – izdavanje tokena.
- \`POST /api/verifications/domain/refresh\` – ručna ponovna provjera.
`
    },
    "Email verifikacija na domeni tvrtke": {
      implemented: true,
      summary: "Email adrese na vlastitoj domeni potvrđuju se verifikacijskim linkom kako bi se dokazalo vlasništvo. Sustav automatski šalje verifikacijski email s linkom koji vrijedi 24 sata.",
      details: `**✅ POTPUNO IMPLEMENTIRANO**: Slanje verifikacijskog emaila na company email adresu, verifikacijski token, endpoint za verifikaciju i resend funkcionalnost.

**Kako funkcionira**
- Korisnik unosi email na poslovnoj domeni preko \`POST /api/kyc/verify-identity\` endpointa (type: 'email').
- Sustav provjerava da li se domena email adrese podudara s domenom korisnika.
- Generira se verifikacijski token (32-byte hex, unique) koji vrijedi 24 sata.
- Verifikacijski email se šalje na company email adresu s linkom za verifikaciju.
- Klikom na link u emailu (\`GET /api/kyc/verify-company-email?token=...\`), email se označava kao verificiran i postavlja se \`identityEmailVerified: true\`.
- Moguće je zatražiti ponovno slanje verifikacijskog emaila preko \`POST /api/kyc/resend-company-email-verification\`.

**Prednosti**
- Povećava kredibilitet i profesionalnost profila.
- Smanjuje rizik od phishinga i lažnih predstavljanja.
- Dokazuje vlasništvo nad domenom tvrtke.

**Kada koristiti**
- Kad provider koristi poslovnu domenu (npr. @firma.hr).
- Kod onboardinga većih timova ili dodavanja dodatnih kontakata.
- Za dobivanje Business Email Badge-a.
`,
      technicalDetails: `**Frontend**
- Forma za dodavanje emaila + status (Pending/Verified/Failed).
- Informativni banner o prednostima poslovnih emailova.
- Stranica za verifikaciju: \`/#verify-company-email?token=...\` (može koristiti istu komponentu kao \`VerifyEmail.jsx\`).

**Backend**
- \`routes/kyc.js\`:
  - \`POST /api/kyc/verify-identity\` (type: 'email'): 
    - Provjerava podudaranje domene
    - Generira verifikacijski token (32-byte hex)
    - Sprema token u \`ProviderProfile.identityEmailToken\`
    - Šalje verifikacijski email preko \`sendCompanyEmailVerification\`
  - \`GET /api/kyc/verify-company-email?token=...\`: 
    - Validira token i expiration
    - Provjerava podudaranje domene
    - Postavlja \`identityEmailVerified: true\`
    - Briše token nakon verifikacije
  - \`POST /api/kyc/resend-company-email-verification\`: 
    - Generira novi token
    - Šalje ponovno verifikacijski email
- \`lib/email.js\`:
  - \`sendCompanyEmailVerification(toEmail, fullName, verificationToken, companyName)\`: 
    - Šalje profesionalni HTML email s verifikacijskim linkom
    - Link: \`\${FRONTEND_URL}/#verify-company-email?token={token}\` (FRONTEND_URL se uzima iz environment varijable)
    - Token vrijedi 24 sata

**Baza**
- \`ProviderProfile\` polja:
  - \`identityEmailAddress\`: Email adresa na domeni tvrtke za verifikaciju
  - \`identityEmailToken\`: Verifikacijski token (unique)
  - \`identityEmailTokenExpiresAt\`: Istek tokena (24 sata)
  - \`identityEmailVerified\`: Status verifikacije (true/false)
  - \`identityEmailVerifiedAt\`: Datum verifikacije

**Integracije**
- Email sending servis (SES/Mailgun), audit log za compliance.

**API**
- \`POST /api/verification/email\` – kreiranje zahtjeva.
- \`GET /api/verification/email/:token\` – potvrda verifikacije.
`
    },
    "Identity Badge sustav (Email, Phone, DNS, Business značke)": {
      implemented: true,
      summary: "Verifikacije identiteta prikazuju se kroz skup znački (Email, Phone, DNS, Business) na profilu providera.",
      details: `**Kako funkcionira**
- Svaka uspješno dovršena verifikacija automatski dodjeljuje odgovarajuću badge oznaku.
- Badge prikazuje datum verifikacije i stanje (aktivno, isteka, u reviziji).
- Sustav kombinira badgeve u Trust score komponentu vidljivu klijentima.

**Prednosti**
- Jednostavan vizualni prikaz vjerodostojnosti providera.
- Klijenti brže razlikuju verificirane partnere i povećava se konverzija.

**Kada koristiti**
- Prilikom pregleda profila providera.
- Interno (moderacija) za provjeru koje verifikacije su aktivne.
`,
      technicalDetails: `**Frontend**
- Komponenta \`IdentityBadges\` renderira set znački s tooltipom i datumom.
- Dashboard upozorava korisnika kada značka istječe ili je potrebno obnoviti.

**Backend**
- \`badgeService.sync\` sluša evente (email.verified, phone.verified, domain.verified, business.verified) i ažurira badge status.
- Trust score kalkulator koristi broj i težinu znački u formuli.

**Baza**
- \`IdentityBadge\` (userId, type, status, issuedAt, expiresAt).
- \`TrustScoreHistory\` bilježi promjene nakon dodjele/uklanjanja badgeva.

**Integracije**
- Notification servis šalje podsjetnike za obnovu verifikacija.
- Analytics prati utjecaj badgeva na lead konverziju.

**API**
- \`GET /api/providers/:id/badges\` – izlist badgeva.
- \`POST /api/providers/:id/badges/resync\` – admin resync (ako badge nije pravilno ažuriran).
`
    },
    "Datum verifikacije za svaku značku": {
      implemented: true,
      summary: "Svaki badge prikazuje datum/verziju verifikacije kako bi kupci vidjeli svježinu potvrde.",
      details: `**Kako funkcionira**
- Kada je verifikacija uspješna, sustav spremi \`issuedAt\` i prikazuje ga uz badge.
- Ako badge zahtijeva obnovu, pojavljuje se i \`expiresAt\` ili datum posljednje revizije.
- UI formatira datume u lokalni oblik (dd.MM.yyyy) radi jasnoće.

**Prednosti**
- Transparentno pokazuje koliko je verifikacija “svježa”.
- Pomaže klijentima razlikovati aktivne od zastarjelih verifikacija.

**Kada koristiti**
- Pregled javnog profila providera.
- Interni review/moderacija badgeva i trust score evaluacija.
`,
      technicalDetails: `**Frontend**
- Badge tooltip i label renderiraju formatirani datum (Intl.DateTimeFormat).
- Prikazuje upozorenje kad je datum blizu isteka.

**Backend**
- Event listeneri postavljaju \`issuedAt\` i kalkuliraju \`expiresAt\` (ovisno o tipu badgea).
- Scheduled job provjerava badgeve kojima treba obnova i šalje notifikacije.

**Baza**
- \`IdentityBadge.issuedAt\`, \`renewalDueAt\`/\`expiresAt\`.
- Audit tablica \`BadgeStatusHistory\` čuva promjene datuma.

**Integracije**
- Notification servis šalje podsjetnike (email/in-app) za obnovu.

**API**
- \`GET /api/providers/:id/badges\` – vraća i datume verifikacija.
- \`POST /api/badges/:id/refresh\` – ručna obnova uz novi datum.
`
    },
    "Prikaz znački na profilu pružatelja": {
      implemented: true,
      summary: "Sve relevantne verifikacijske značke renderiraju se na javnom profilu i listing karticama providera.",
      details: `**Kako funkcionira**
- Komponenta profila dohvaća badgeve i prikazuje ikonice/titl uz osnovne informacije.
- Listing kartice (directory/search) renderiraju sažetu verziju badgeva radi brze usporedbe.
- Responsive layout osigurava uredan prikaz na mobilnim uređajima.

**Prednosti**
- Povećava konverziju jer klijenti odmah vide vjerodostojnost.
- Daje motivaciju providerima da dovrše verifikacije.

**Kada koristiti**
- Javni profil providera, pretragom i shortlist prikazima.
- Interni admin pogled prilikom ručne provjere profila.
`,
      technicalDetails: `**Frontend**
- \`ProviderProfileBadges\` i \`ProviderCard\` komponente dohvaćaju badge podatke preko GraphQL/REST.
- Tooltipovi s opisima znački i stanjem (verified, pending, expired).

**Backend**
- \`providerService.getPublicProfile\` agregira badgeve, trust score i osnovne podatke.
- Cache layer (Redis) sprema rezultat radi bržeg renderiranja direktorija.

**Baza**
- View ili materialized view za \`ProviderPublicProfile\` olakšava dohvat badgeva.

**Integracije**
- CDN/Images za ikone znački, analytics event za interakcije (badge hover/tap).

**API**
- \`GET /api/providers/:slug\` – vraća profil s badgevima.
- \`GET /api/providers/search\` – uključuje agregirane badge metapodatke.
`
    },
    "Dokumenti za verifikaciju": {
      implemented: true,
      summary: "Platforma omogućuje upload i moderaciju dokumenata potrebnih za regulatorne verifikacije.",
      details: `**Kako funkcionira**
- Korisnik odabire tip dokumenta (osobna, izvadak iz registra, licenca) i učitava PDF/scan.
- Dokument prolazi antivirus/quality check te je vidljiv samo ovlaštenim administratorima.
- Nakon reviewa dokument se odobrava/odbijа uz feedback korisniku.

**Prednosti**
- Brži verifikacijski proces i manje ručne komunikacije.
- Centralizirano spremište sa sigurnim pristupom i audit trailom.

**Kada koristiti**
- Pri inicijalnoj verifikaciji identiteta ili tvrtke.
- Kod periodičnih revizija (istek licenci, promjena vlasništva).
`,
      technicalDetails: `**Frontend**
- Uploader s drag&drop podrškom, validacijom tipa/veličine i status trackerom.
- Panel za pregled statusa (Pending, Approved, Rejected) i komentara admina.

**Backend**
- \`documentService.uploadVerification\` sprema metapodatke i šalje fajl u storage.
- Review workflow (admin portal) ažurira status i šalje notifikacije korisniku.

**Baza**
- \`VerificationDocument\` (userId, type, storageKey, status, reviewedBy, reviewedAt).
- \`DocumentReviewLog\` čuva komentare i radnje moderatora.

**Integracije**
- Objektni storage (S3) s server-side enkripcijom, antivirus skener, notification servis.

**API**
- \`POST /api/verification/documents\` – upload.
- \`PATCH /api/verification/documents/:id\` – admin review/feedback.
`
    },
    "Email Identity Badge (značka)": {
      implemented: true,
      summary: "Badge potvrđuje da je primarni email-verifikacijski proces završen i javno označava pouzdan kontakt.",
      details: `**Kako funkcionira**
- Nakon uspješne email verifikacije (link token), sustav emitira event \`email.verified\`.
- Badge se automatski dodaje profilu i prikazuje u listama i profilu.
- Ako korisnik promijeni primarni email, badge ulazi u pending dok nova adresa ne bude potvrđena.

**Prednosti**
- Osigurava da je komunikacija s klijentom moguća i pouzdana.
- Temeljni korak za stjecanje povjerenja i otključavanje drugih značajki.

**Kada koristiti**
- Uvijek nakon email verifikacije tijekom registracije.
- Kod dodavanja novih kontakt emailova koji će biti javno prikazani.
`,
      technicalDetails: `**Frontend**
- Badge indikator uz email u profilu i settings sekciji.
- UI prikazuje status (verified/pending) i CTA za ponovno slanje verifikacijskog emaila.

**Backend**
- \`badgeService.assign('EMAIL')\` na \`email.verified\` event.
- Listener za promjenu emaila automatski uklanja/stavlja badge u pending.

**Baza**
- \`IdentityBadge\` zapis s tipom EMAIL, datumom izdavanja i referencom na emailId.
- \`ProviderEmail\` označava primarni/verificirani kontakt.

**Integracije**
- Transactional email servis za re-send; notification servis za potvrde.

**API**
- \`POST /api/verification/email/resend\` – ponovno slanje linka.
- \`GET /api/providers/:id/badges\` – prikazuje status email badgea.
`
    },
    "Phone Identity Badge (SMS verifikacija)": {
      implemented: true,
      summary: "Badge signalizira da je telefonski broj prošao OTP potvrdu i može se koristiti za lead komunikaciju.",
      details: `**Kako funkcionira**
- Nakon validacije OTP-a, sustav podiže event \`phone.verified\` i badge se aktivira.
- Promjena broja automatski deaktivira badge do nove verifikacije.
- Status badgea prikazuje se klijentima kako bi znali da je broj provjeren.

**Prednosti**
- Smanjuje rizik od neaktivnih ili lažnih brojeva.
- Podiže trust score i prioritet u lead distribuciji.

**Kada koristiti**
- Po završetku SMS verifikacije tijekom onboardinga.
- Prije aktiviranja kampanja koje zahtijevaju kontakt telefonom.
`,
      technicalDetails: `**Frontend**
- Badge uz telefonski broj u profilu i lead detaljima.
- Notifikacije korisniku ako badge postane neaktivan (npr. promjena broja).

**Backend**
- \`badgeService.assign('PHONE')\` reagira na \`phone.verified\` event.
- Hook na promjenu broja postavlja badge status na pending dok se ne potvrdi novi broj.

**Baza**
- \`IdentityBadge\` tip PHONE sa \`status\` (VERIFIED/PENDING/EXPIRED).
- \`PhoneVerification\` čuva povijest provjera.

**Integracije**
- Twilio za SMS, notification servis za update badge statusa.

**API**
- \`GET /api/providers/:id/badges\` – vraća badge status.
- \`POST /api/verification/phone/resend\` – ponovno slanje OTP-a.
`
    },
    "DNS Identity Badge (TXT record)": {
      implemented: true,
      summary: "Badge potvrđuje vlasništvo nad domenom nakon uspješne DNS TXT verifikacije.",
      details: `**Kako funkcionira**
- Provider preuzima jedinstveni TXT token i dodaje ga u DNS konfiguraciju svoje domene.
- Periodični check (ili ručno pokretanje) validira prisutnost zapisa; uspješna provjera aktivira badge.
- Promjena domene automatski deaktivira badge dok se novi token ne potvrdi.

**Prednosti**
- Dokazuje profesionalno vlasništvo nad domenom i povećava vjerodostojnost.
- Pomaže u diferencijaciji ozbiljnih providera u direktoriju.

**Kada koristiti**
- Kada provider ima vlastiti web domen i želi naglasiti profesionalnost.
- Prije aktivacije funkcionalnosti koje zahtijevaju dokazani domen (npr. custom email, white-label landing stranice).
`,
      technicalDetails: `**Frontend**
- Wizard prikazuje TXT vrijednost, status provjere i CTA za ponovno pokretanje provjere.
- Badge komponenta pokazuje datum verificiranja i eventualno upozorenje ako provjera nije uspješna.

**Backend**
- \`domainVerificationService.verifyBadge\` spaja DNS provjeru s badge servisom.
- Eventovi \`domain.verified\` i \`domain.changed\` aktiviraju/deaktiviraju badge.

**Baza**
- \`DomainVerification\` povezano s \`IdentityBadge\` zaporom tipa DNS.
- Čuva \`verifiedAt\`, \`lastCheckedAt\`, broj pokušaja.

**Integracije**
- DNS resolver servisi (Route53, Google DNS API), notification servis za statusne obavijesti.

**API**
- \`POST /api/verifications/domain/check\` – forsira provjeru.
- \`GET /api/providers/:id/badges\` – vraća status DNS badgea.
`
    },
    "Business Badge (tvrtka/obrt verifikacija)": {
      implemented: true,
      summary: "Badge potvrđuje da je tvrtka/obrt verificiran kroz službene registre (Sudski/Obrtni).",
      details: `**Kako funkcionira**
- Provider unosi poslovne podatke; sustav ih validira kroz API/scrape službenih registara.
- Po uspješnoj provjeri badge se dodaje i vidljiv je klijentima s datumom verifikacije.
- Redoviti job provjerava je li tvrtka i dalje aktivna; u suprotnom badge prelazi u pending/expired.

**Prednosti**
- Jača povjerenje klijenata potvrdom da je subjekt legalan i aktivan.
- Otključava napredne mogućnosti (veći limiti leadova, prikaz u premium listama).

**Kada koristiti**
- Nakon unosa ili promjene poslovnih podataka u profilu.
- Kod periodične revizije (npr. godišnja provjera registracijskog statusa).
`,
      technicalDetails: `**Frontend**
- Business profile sekcija prikazuje badge status i korake za dovršetak verifikacije.
- Admin UI ima detaljan pregled izvješća s registarskim podacima.

**Backend**
- \`businessVerificationService.verify\` uspoređuje podatke i emitira \`business.verified\` event.
- Reverification job koristi webhookove/registar API-je za praćenje promjena.

**Baza**
- \`BusinessVerification\` (legalName, oib, registryId, status, verifiedAt, revokedAt).
- \`IdentityBadge\` tip BUSINESS povezan s verifikacijskim zapisom.

**Integracije**
- Sudski/Obrtni registar (REST/SOAP), dokument storage za dodatne potvrde, notification servis.

**API**
- \`POST /api/verification/business\` – pokretanje verifikacije.
- \`GET /api/providers/:id/badges\` – prikazuje status business badgea.
`
    },
    "Prikaz datuma verifikacije": {
      implemented: true,
      summary: "Sve badge oznake prikazuju datum izdavanja/obnove kako bi status bio transparentan.",
      details: `**Kako funkcionira**
- Kada se badge dodijeli ili obnovi, sustav pohranjuje \`issuedAt\` i opcionalni \`expiresAt\`.
- UI formatira datume (dd.MM.yyyy) i prikazuje ih uz naziv badgea.
- Ističe se i badge kojem se bliži isteći kako bi korisnik znao da treba obnovu.

**Prednosti**
- Korisnici i administratori odmah vide svježinu verifikacije.
- Potiče redovito održavanje verifikacija.

**Kada koristiti**
- Pregled javnog profila i admin revizije.
- Kod usporedbe providera u direktoriju.
`,
      technicalDetails: `**Frontend**
- Datum prikazan u tooltipu i kao sekundarna labela.
- Komponenta upozorava badgeove starije od definiranog praga (npr. 12 mjeseci).

**Backend**
- Event listener \`badgeService.onAssign\` zapisuje \`issuedAt\` i eventualni \`expiresAt\`.
- Scheduler provjerava badgeove kojima istječe valjanost i šalje obavijesti.

**Baza**
- \`IdentityBadge.issuedAt\`, \`expiresAt\`, \`lastRenewedAt\`.
- \`BadgeStatusHistory\` pohranjuje sve promjene datuma/statusa.

**Integracije**
- Notification servis (email/in-app) za podsjetnike na obnovu.

**API**
- \`GET /api/providers/:id/badges\` – vraća datume.
- \`POST /api/badges/:id/renew\` – ručna obnova ažurira datum.
`
    },
    "Status verifikacije na profilu": {
      implemented: true,
      summary: "Profil prikazuje agregirani status (broj i postotak dovršenih verifikacija).",
      details: `**Kako funkcionira**
- Backend prebrojava verificirane badgeve i izračunava postotak dovršenosti.
- UI prikazuje indikator (npr. 3/4, 75%) i označava koje značke nedostaju.
- Status se sinkronizira u stvarnom vremenu nakon svake nove verifikacije.

**Prednosti**
- Jedan pogled daje cjelovitu sliku pouzdanosti providera.
- Motivira korisnike da dovrše sve verifikacije radi punog statusa.

**Kada koristiti**
- Javni profil, kartice u direktoriju, onboarding dashboard.
- Interni admin pregled prilikom moderacije.
`,
      technicalDetails: `**Frontend**
- Progress bar + badge checklist komponenta.
- Tooltipovi objašnjavaju što još treba napraviti.

**Backend**
- \`verificationStatusService.calculate\` vraća agregatne metrike.
- Event \`badge.updated\` invalidira cache.

**Baza**
- Materijalizirani view ili denormalizirano polje \`ProviderProfile.verificationScore\`.

**Integracije**
- Analytics prati korelaciju između statusa i konverzija leadova.

**API**
- \`GET /api/providers/:id/verification-status\` – detaljan status i checklist.
`
    },
    "Identity Badge Verifikacija komponenta": {
      implemented: true,
      summary: "Centralizirana komponenta vodi korisnika kroz sve verifikacije (email, telefon, domen, tvrtka).",
      details: `**Kako funkcionira**
- Unutar settings/onboarding sekcije korisnik vidi kartice za svaku verifikaciju.
- Svaka kartica sadrži CTA, status, očekivano trajanje i link na detaljne upute.
- Komponenta reagira na real-time evente (websocket/sse) i ažurira status bez reloada.

**Prednosti**
- Jedinstveno mjesto za upravljanje svim verifikacijama.
- Smanjuje broj support tiketa jer su koraci jasni i vođeni.

**Kada koristiti**
- Novi korisnici koji dovršavaju profil.
- Postojeći provideri koji žele podići trust score.
`,
      technicalDetails: `**Frontend**
- React komponenta \`IdentityVerificationHub\` s tabovima i progress indikatorom.
- Integracija sa real-time kanalima (Pusher/Websocket) za update statusa.

**Backend**
- GraphQL/REST endpoint vraća sve verifikacije i njihove statuse.
- Event streaming servis emitira promjene kako bi UI bio sinkroniziran.

**Baza**
- View \`VerificationDashboard\` agregira badge, dokumente i pending zahtjeve.

**Integracije**
- Notification servis šalje reminder-e preko emaila/SMS-a/push-a.

**API**
- \`GET /api/verification/dashboard\` – podatci za komponentu.
- \`POST /api/verification/:type/start\` – inicira pojedinačnu verifikaciju.
`
    },
    "Stripe Payment Intent refund API (PSD2)": {
      implemented: true,
      summary: "Refundi kartičnih uplata izvršavaju se preko Stripe Payment Intenta u skladu s PSD2 regulativom.",
      details: `**Kako funkcionira**
- Kada se odobri refund transakcije plaćene karticom, backend poziva Stripe Refund API nad izvornim Payment Intentom.
- Stripe vraća sredstva korisniku na istu karticu; status refund-a sinkronizira se putem webhooka.
- Korisnik u povijesti transakcija vidi da je refund obraden karticom.

**Prednosti**
- Potpuno usklađeno s PSD2 propisima i sigurnosnim standardima.
- Minimalan ručni rad – proces je automatiziran i auditan.

**Kada koristiti**
- Kod refundiranja pretplata ili leadova plaćenih karticom.
- U situacijama chargeback-a ili reklamacija.
`,
      technicalDetails: `**Frontend**
- Timeline transakcije prikazuje status "Refunded to card" i Stripe reference.

**Backend**
- \`stripeRefundService.refundPaymentIntent\` obavlja poziv Stripe API-ju.
- Webhook handler \`payment_intent.canceled\`/\`charge.refunded\` potvrđuje status i ažurira bazu.

**Baza**
- \`PaymentLog\` (paymentIntentId, refundId, refundStatus, metadata).
- \`CreditTransaction\` sinkroniziran radi jedinstvene povijesti.

**Integracije**
- Stripe API, Stripe webhook endpoint, accounting/export servis.

**API**
- \`POST /api/refunds/stripe\` – pokretanje refund-a (interno/admin).
- \`POST /api/stripe/webhook\` – obrada webhook događaja.
`
    },
    "Automatski odabir refund metode ovisno o načinu plaćanja": {
      implemented: true,
      summary: "Refund engine bira između kartičnog povrata i vraćanja kredita prema izvornom načinu plaćanja.",
      details: `**Kako funkcionira**
- Sustav dohvaća originalnu transakciju i provjerava je li plaćena karticom ili internim kreditima.
- Kartične naplate refundiraju se preko Stripe API-ja; kreditne naplate vraćaju saldo u kreditnom leđeru.
- Kod split transakcija (dio kartica, dio krediti) radi se proporcionalni refund po metodi.

**Prednosti**
- Nema ručnog odabira – korisnik automatski dobiva povrat na isti način na koji je platio.
- Brži i konzistentan proces bez mogućnosti pogreške.

**Kada koristiti**
- Svaki put kada se odobri refund leadova ili pretplata.
- Kod administrativnih korekcija salda koje trebaju pratiti izvor plaćanja.
`,
      technicalDetails: `**Frontend**
- Detalj refund-a prikazuje metodu (“Kartica” / “Krediti”) i referencu na izvornu uplatu.
- Alert informira korisnika ako je refund djelomično izvršen različitim metodama.

**Backend**
- \`refundService.process\` određuje metodu, delegira na \`stripeRefundService\` ili \`creditRefundService\`.
- Podržava webhooks i idempotency kako bi se spriječilo dvostruko izvršavanje.

**Baza**
- \`RefundRequest\` spremna s poljem \`method\` (CARD/CREDITS/MIXED).
- \`CreditTransaction\` i \`PaymentLog\` sinkronizirani kroz zajednički \`referenceId\`.

**Integracije**
- Stripe API za kartične povrate, internal ledger servis za kredite, notification servis.

**API**
- \`POST /api/refunds\` – generički endpoint koji pokreće automatski izbor metode.
- \`GET /api/refunds/:id\` – vraća detalje, uključujući metodu.
`
    },
    "Lokalizacija (hrvatski jezik)": {
      implemented: true,
      summary: "Sučelje, sadržaj i notifikacije lokalizirani su na hrvatski jezik s prilagođenim formatima datuma i valuta.",
      details: `**Kako funkcionira**
- i18n sloj koristi hrvatski kao zadani jezik (hr-HR locale) na webu i u emailovima.
- Lexikon poruka i copy održava se centralno; dinamički sadržaj (npr. nazivi kategorija) također ima prijevode.
- Formatiranje datuma, valuta i pluralizacije usklađeno je s hrvatskim standardom.

**Prednosti**
- Uklanja jezične barijere i smanjuje korisničke greške.
- Osigurava konzistentnu terminologiju između produkta, podrške i pravnih dokumenata.

**Kada koristiti**
- Za sve korisničke i administratorske značajke u hrvatskom tržištu.
- Kod generiranja PDF faktura, emaila i push notifikacija.
`,
      technicalDetails: `**Frontend**
- React i18next konfiguriran s defaultLocale=hr-HR i fallback eng.
- Komponenta \`LocaleProvider\` brine za formatiranje datuma/brojeva putem Intl API-ja.

**Backend**
- Nest/Express middleware postavlja \`Accept-Language\` na hr-HR ako nije specificirano.
- Template engine (MJML/Handlebars) koristi hrvatske stringove i pravila pluralizacije.

**Baza**
- Tablice s lokaliziranim podacima (npr. \`CategoryTranslation\`, \`FaqTranslation\`).
- Migracije osiguravaju default vrijednosti za hrvatski prijevod.

**Integracije**
- Notification servis šalje lokalizirane poruke (email/SMS/push) koristeći isti i18n repozitorij.
- PDF generator koristi hrvatske fontove i decimalne znakove.

**API**
- \`GET /api/translations/:namespace\` – omogućuje klijentu preuzimanje prijevoda.
- \`POST /api/admin/translations\` – admin upload/izmjene prijevoda.
`
    },
    "Auto-verifikacija naziva tvrtke (Sudski registar, Obrtni registar)": {
      implemented: true,
      summary: "Platforma automatski provjerava naziv vaše tvrtke ili obrta u službenim registrima - potvrđuje legitimnost vaše tvrtke.",
      details: `## Kako funkcionira:

**Automatska provjera**
- Nakon unosa naziva i OIB-a pozivamo sudski/obrtni registar, uspoređujemo podatke i vraćamo status u realnom vremenu.

**Rezultat**
- Uspješno podudaranje odmah dodaje badge i povećava povjerenje; neslaganja vraćaju upozorenje da ispravite podatke.

**Prednost**
- Bez ručne papirologije dokazujete legitimnost tvrtke i štitite marketplace od lažnih profila.
`
    },
    "Tvrtka kao pravni entitet": {
      implemented: true,
      summary: "Tvrtka je nositelj profila, ugovora i financija; direktor i tim djeluju u njezino ime.",
      details: `**Kako funkcionira**
- Svaki provider profil povezan je s entitetom \`Company\` koji predstavlja pravnu osobu (d.o.o., obrt, j.d.o.o.).
- Direktor upravlja postavkama, timovima i financijama; tim članovi izvršavaju operativne zadatke u ime tvrtke.
- Sve ponude, fakture i recenzije vežu se uz tvrtku, čuvajući konzistentan pravni trag.

**Prednosti**
- Jasna pravna odgovornost i kontinuitet poslovanja.
- Omogućuje više korisnika/timova da rade koordinirano pod jednim brendom.

**Kada koristiti**
- Onboarding novih pružatelja koji posluju kao pravne osobe.
- Interno praćenje performansi i pravna usklađenost (npr. evidencija licenci).
`,
      technicalDetails: `**Frontend**
- Modul \`CompanyManagement\` prikazuje hijerarhiju (tvrtka, direktor, timovi) i omogućuje administraciju.
- Guardovi provjeravaju korisničku rolu prije prikaza administrativnih komponenti.

**Backend**
- \`companyService.getHierarchy\` agregira tvrtku, direktora, timove i preferencije leadova.
- Middleware osigurava da osjetljivi endpointi zahtijevaju direktor/admin privilegije.

**Baza**
- \`Company\` (legalName, taxId, status, subscriptionPlan) povezana s \`User\` (role DIRECTOR/TEAM_MEMBER) i \`Team\` tablicama.
- \`CompanyAuditLog\` bilježi promjene statusa i vlasništva.

**Integracije**
- Billing/pretplate, licenciranje, notifikacije – sve operacije koriste companyId kao ključ.

**API**
- \`GET /api/company/:id\` – javni prikaz tvrtke.
- \`GET /api/admin/companies/:id\` & \`PATCH /api/admin/companies/:id\` – administrativni pregled i uređivanje.
`
    },
    "Direktor kao administrator profila": {
      implemented: true,
      summary: "Direktor je primarni administrator koji upravlja timovima, financijama i ključnim odlukama tvrtke.",
      details: `**Kako funkcionira**
- Direktor ima puni pristup profilu tvrtke, leadovima, ponudama i financijskim izvještajima kroz Direktor Dashboard.
- Potvrđuje kritične akcije (npr. slanje ponude, dodjela leadova, upravljanje licencama).
- Administrira timove: dodaje članove preko email adrese, uklanja članove i nadzire njihov rad.
- Pristupa financijskim podacima: pregled pretplata, faktura direktora i tim članova, lead purchases.
- Pregledava ključne odluke: ponude koje čekaju na odobrenje, leadove koje tim članovi trebaju odobriti.

**Prednosti**
- Jasna kontrola nad poslovanjem i pravnom odgovornošću.
- Osigurava da komunikacija prema klijentima ide kroz ovlaštenu osobu.
- Centralizirano upravljanje timovima i financijama na jednom mjestu.

**Kada koristiti**
- Svakodnevno upravljanje operacijama tvrtke.
- Kod eskalacija (npr. refund zahtjevi, sporovi) gdje je potreban ovlašteni potpisnik.
- Planiranje budžeta i analiza troškova tvrtke.
`,
      technicalDetails: `**Frontend**
- \`DirectorDashboard\` komponenta prikazuje tri taba: Tim, Financije i Odluke.
- Tab "Tim" omogućava dodavanje/uklanjanje članova tima preko email adrese.
- Tab "Financije" prikazuje pretplate, fakture i lead purchases direktora i tim članova.
- Tab "Odluke" prikazuje ponude i leadove koji čekaju na odobrenje.
- Automatska provjera da li je korisnik direktor; ako nije, prikazuje se opcija "Postani Direktor".

**Backend**
- \`directorService\` validira da postoji jedna aktivna direktorska rola i da je identitet verificiran.
- Helper funkcije \`isDirector\` i \`getDirectorWithTeam\` provjeravaju i dohvaćaju direktora s timom.
- Audit događaji (npr. \`director.offerApproved\`) pohranjuju se radi traga.

**Baza**
- \`ProviderProfile\` polja \`isDirector\` (Boolean) i \`companyId\` (String?) za povezivanje tim članova s direktorom.
- Self-referencing relation: \`company\` (direktor) i \`teamMembers\` (članovi tima).
- Tim članovi imaju \`companyId\` koji pokazuje na direktora.

**Integracije**
- Notification servis šalje direktorima ključne alertove (novi lead, istek licence, financijski događaji).

**API**
- \`POST /api/director/become-director\` – postavlja korisnika kao direktora (zahtijeva companyName).
- \`GET /api/director/team\` – dohvaća tim i članove.
- \`POST /api/director/team/add\` – dodaje člana tima (zahtijeva userId).
- \`DELETE /api/director/team/:memberId\` – uklanja člana iz tima.
- \`GET /api/director/finances\` – financijski pregled (pretplate, fakture, leadovi).
- \`GET /api/director/decisions\` – odluke koje čekaju (ponude, leadovi).
`
    },
    "Team članovi (operativci)": {
      implemented: true,
      summary: "Operativci vode komunikaciju i ponude za dodijeljene leadove, ali bez administratorskih ovlasti.",
      details: `**Kako funkcionira**
- Direktor dodaje tim članove preko email adrese PROVIDER korisnika; član se automatski povezuje s tvrtkom.
- Tim članovi rade u ime tvrtke, ali nemaju pristup financijama ni postavkama tvrtke.
- Direktor vidi sve aktivnosti tim članova kroz Direktor Dashboard.
- Tim članovi mogu raditi na leadovima i pripremati ponude koje direktor može pregledati.

**Prednosti**
- Omogućuje paralelan rad više operativaca uz centralni nadzor.
- Jasno razdvajanje odgovornosti između strategije (direktor) i operativnog rada (tim).
- Jednostavno dodavanje/uklanjanje članova tima.

**Kada koristiti**
- Svakodnevno praćenje i obrada leadova.
- Kod većih tvrtki koje žele specijalizirati timove po kategorijama/uslugama.
- Kada direktor želi delegirati operativne zadatke tim članovima.
`,
      technicalDetails: `**Frontend**
- Direktor Dashboard tab "Tim" prikazuje sve članove tima s njihovim informacijama (ime, email, telefon, kategorije).
- Direktor može dodati novog člana unoseći email adresu PROVIDER korisnika.
- Direktor može ukloniti člana iz tima jednim klikom.

**Backend**
- \`POST /api/director/team/add\` provjerava da korisnik postoji i ima PROVIDER profil, zatim ga povezuje s direktorom.
- \`DELETE /api/director/team/:memberId\` uklanja vezu između tim člana i direktora (postavlja companyId na null).
- Helper funkcija \`getDirectorWithTeam\` dohvaća direktora s njegovim tim članovima.

**Baza**
- \`ProviderProfile\` polje \`companyId\` povezuje tim člana s direktorom (self-referencing relation).
- Direktor ima \`isDirector: true\` i \`companyId: null\`.
- Tim članovi imaju \`isDirector: false\` i \`companyId\` koji pokazuje na direktora.

**Integracije**
- Notification servis (email/push) obavještava članove o novim zadacima.
- Analytics prati performanse po timu (response time, conversion rate).

**API**
- \`GET /api/director/team\` – dohvaća direktora i sve članove tima.
- \`POST /api/director/team/add\` – dodaje člana tima (zahtijeva userId).
- \`DELETE /api/director/team/:memberId\` – uklanja člana iz tima.
`
    },
    "Dodavanje članova tima": {
      implemented: true,
      summary: "Direktor dodaje nove članove tima preko email adrese PROVIDER korisnika kroz Direktor Dashboard.",
      details: `**Kako funkcionira**
- Direktor u Direktor Dashboard tabu "Tim" unosi email adresu PROVIDER korisnika.
- Sustav provjerava da korisnik postoji i ima PROVIDER profil.
- Ako korisnik već postoji u timu, prikazuje se greška.
- Nakon dodavanja, član se automatski povezuje s tvrtkom i pojavljuje se u listi tima.

**Prednosti**
- Brzo širenje tima bez napuštanja platforme.
- Jednostavno dodavanje novih članova preko email adrese.
- Automatsko povezivanje člana s tvrtkom.

**Kada koristiti**
- Formiranje novog tima ili dodavanje novih članova.
- Zamjena članova koji su napustili tvrtku.
`,
      technicalDetails: `**Frontend**
- Direktor Dashboard tab "Tim" s formom za dodavanje člana (email input).
- Lista članova tima s informacijama i gumbom za uklanjanje.

**Backend**
- \`POST /api/director/team/add\` provjerava da korisnik postoji i ima PROVIDER profil, zatim ga povezuje s direktorom.
- Validacija da korisnik već nije u timu.

**Baza**
- \`ProviderProfile\` polje \`companyId\` povezuje tim člana s direktorom.

**Integracije**
- Notification servis obavještava člana o dodavanju u tim.

**API**
- \`POST /api/director/team/add\` – dodaje člana tima (zahtijeva userId).
- \`GET /api/director/team\` – dohvaća tim i članove.
- \`DELETE /api/director/team/:memberId\` – uklanja člana iz tima.
`
    },
    "Upravljanje pravima tima": {
      implemented: true,
      summary: "Direktor upravlja tim članovima kroz Direktor Dashboard - dodavanje i uklanjanje članova.",
      details: `**Kako funkcionira**
- Direktor Dashboard tab "Tim" prikazuje sve članove tima s njihovim informacijama.
- Direktor može dodati novog člana unoseći email adresu PROVIDER korisnika.
- Direktor može ukloniti člana iz tima jednim klikom.
- Tim članovi nemaju pristup financijama ni postavkama tvrtke - samo direktor ima puni pristup.

**Prednosti**
- Jasna kontrola pristupa smanjuje sigurnosne rizike.
- Jednostavno upravljanje timom kroz Direktor Dashboard.

**Kada koristiti**
- Kada trebate dodati novog člana tima.
- Kada član tima više ne radi za tvrtku.
- Za pregled svih aktivnih članova tima.
`,
      technicalDetails: `**Frontend**
- Direktor Dashboard tab "Tim" prikazuje sve članove tima s njihovim informacijama.
- Direktor može dodati novog člana unoseći email adresu PROVIDER korisnika.
- Direktor može ukloniti člana iz tima jednim klikom.

**Backend**
- \`GET /api/director/team\` dohvaća direktora i sve članove tima.
- \`POST /api/director/team/add\` dodaje člana tima.
- \`DELETE /api/director/team/:memberId\` uklanja člana iz tima.

**Baza**
- \`ProviderProfile\` polje \`companyId\` povezuje tim člana s direktorom.

**Integracije**
- Notification servis obavještava člana o promijenjenim ovlastima.
- Analytics prati korelaciju između prava i performansi (npr. tko šalje ponude).

**API**
- \`GET /api/team/members/:memberId/permissions\` – dohvat trenutnih prava.
- \`PATCH /api/team/members/:memberId/permissions\` – ažuriranje matrice.
`
    },
    "Interna distribucija leadova unutar tvrtke": {
      implemented: true,
      summary: "Leadovi pristigli tvrtki idu u interni queue; direktor ih može ručno dodijeliti ili prepustiti auto-engineu.",
      details: `**Kako funkcionira**
- Kada lead stigne tvrtki (direktoru), automatski se dodaje u interni queue tvrtke (CompanyLeadQueue).
- Direktor vidi sve leadove u queueu kroz Direktor Dashboard tab "Interni Lead Queue".
- Direktor može ručno dodijeliti lead odabranom tim članu ili koristiti auto-assign za automatsku dodjelu najboljem tim članu.
- Auto-assign algoritam procjenjuje kategoriju, dostupnost, lokaciju i KPI-jeve (rating, response time, conversion rate).
- Tim član dobiva notifikaciju kada mu je lead dodijeljen.
- Direktor može odbiti lead ako tvrtka ne može obraditi zahtjev.

**Prednosti**
- Brza reakcija najspremnijeg tima i manje leadova koji stoje neobrađeni.
- Transparentan audit trail dodjela (ručna vs. automatska).
- Centralizirano upravljanje leadovima unutar tvrtke.

**Kada koristiti**
- Tvrtke s više tim članova koje trebaju orkestrirati leadove.
- Situacije kad je potrebno ručno intervenirati (npr. VIP leadovi).
- Kada direktor želi optimizirati distribuciju leadova na temelju performansi tim članova.
`,
      technicalDetails: `**Frontend**
- Direktor Dashboard tab "Interni Lead Queue" prikazuje sve leadove u queueu s statusima (PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, DECLINED).
- Statistike: broj leadova koji čekaju dodjelu, dodijeljenih, u tijeku i završenih.
- Za svaki PENDING lead, direktor može:
  - Kliknuti "Auto-assign" za automatsku dodjelu najboljem tim članu
  - Odabrati tim člana iz dropdowna za ručnu dodjelu
  - Odbijati lead s razlogom

**Backend**
- \`company-lead-distribution.js\` servis upravlja internom distribucijom:
  - \`addLeadToCompanyQueue\` - dodaje lead u interni queue
  - \`assignLeadToTeamMember\` - ručna dodjela tim članu
  - \`autoAssignLead\` - automatska dodjela najboljem tim članu
  - \`getCompanyLeadQueue\` - dohvaća sve leadove u queueu
  - \`declineCompanyLead\` - odbija lead
- Auto-assign algoritam koristi:
  - Match po kategoriji (tim član mora imati kategoriju leada)
  - Dostupnost (isAvailable)
  - Reputation score (rating, response time, conversion rate)

**Baza**
- \`CompanyLeadQueue\` model čuva:
  - \`directorId\` - direktor koji je primio lead
  - \`assignedToId\` - tim član kojem je dodijeljen (null = čeka dodjelu)
  - \`status\` - PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, DECLINED
  - \`assignmentType\` - MANUAL (ručna) ili AUTO (automatska)
  - \`position\` - pozicija u queueu
- Indeksi za brzo pretraživanje po direktoru, tim članu i statusu.

**Integracije**
- Notification servis šalje obavijesti tim članu kada mu je lead dodijeljen.
- Analytics može pratiti brzinu interne dodjele i konverziju po tim članu.

**API**
- \`GET /api/director/lead-queue\` - dohvaća sve leadove u queueu s statistikama
- \`POST /api/director/lead-queue/:queueId/assign\` - ručna dodjela tim članu
- \`POST /api/director/lead-queue/:queueId/auto-assign\` - automatska dodjela
- \`POST /api/director/lead-queue/:queueId/decline\` - odbijanje leada
- \`POST /api/director/lead-queue/add\` - dodavanje leada u interni queue
`
    },
    "Tvrtka bez tima (solo firma)": {
      implemented: true,
      summary: "Solo izvođači rade u modu gdje je direktor i operativac; leadovi se automatski dodjeljuju njemu dok ne formira tim.",
      details: `**Kako funkcionira**
- Prilikom registracije bez tima platforma kreira virtualni “default team” i sve leadove dodjeljuje direktoru.
- UI skriva sekcije za timove i pojednostavljuje procese (nema internal chata, manji limiti aktivnih leadova).
- Dodavanjem prvog člana tvrtka prelazi u multi-team mod, a povijest leadova ostaje direktorova.

**Prednosti**
- Freelanceri mogu koristiti sve ključne funkcije bez dodatne administracije.
- Platforma potiče rast – daje savjete kada je vrijeme za formiranje tima.

**Kada koristiti**
- Male tvrtke ili obrti s jednim operativcem.
- Početna faza poslovanja prije zapošljavanja tima.
`,
      technicalDetails: `**Frontend**
- Dashboard prepoznaje \`companyMode = "SOLO"\` i skriva timske module.
- Informativni banner objašnjava korake za prelazak na multi-team mod.

**Backend**
- \`companyService.ensureDefaultSoloMode\` kreira virtualni tim i postavlja fallback dodjelu leadova direktoru.
- Validacija sprječava da solo direktor ukloni vlastite ključne ovlasti.

**Baza**
- \`Team\` (isVirtual) i \`CompanySettings.hasTeams\` označavaju mod rada.
- \`LeadAssignment\` sprema \`assignedUserId = directorId\` kad nema timova.

**Integracije**
- Notification servis šalje savjete o limitu leadova i poziv za dodavanje tima.

**API**
- \`GET /api/company/:companyId/teams\` – vraća meta informaciju o solo modu.
- \`POST /api/company/:companyId/enable-teams\` – migrira na multi-team.
`
    },
    "Auto-assign leadova timu": {
      implemented: true,
      summary: "Direktor može koristiti auto-assign za automatsku dodjelu leada najboljem tim članu na temelju kategorije, dostupnosti i KPI-jeva.",
      details: `**Kako funkcionira**
- Direktor klikne "Auto-assign" na PENDING leadu u Direktor Dashboard tabu "Interni Lead Queue".
- Algoritam procjenjuje sve dostupne tim članove i odabire najboljeg na temelju:
  - Match po kategoriji (tim član mora imati kategoriju leada)
  - Dostupnost (isAvailable)
  - Reputation score (rating 40%, response time 30%, conversion rate 30%)
- Najbolji tim član automatski dobiva lead i notifikaciju.
- Tip dodjele se označava kao AUTO za audit trail.

**Prednosti**
- Najspremniji tim član reagira instantno bez ručne koordinacije.
- Optimizirana distribucija na temelju performansi tim članova.
- Transparentan audit trail (assignmentType: AUTO).

**Kada koristiti**
- Kada direktor želi brzo dodijeliti lead bez ručnog odabira.
- Peak periodi kada ručna dodjela ne prati tempo.
- Kada direktor želi optimizirati distribuciju na temelju performansi.
`,
      technicalDetails: `**Frontend**
- Direktor Dashboard tab "Interni Lead Queue" prikazuje gumb "🤖 Auto-assign" za svaki PENDING lead.
- Klik na gumb automatski dodjeljuje lead najboljem tim članu.

**Backend**
- \`autoAssignLead\` funkcija u \`company-lead-distribution.js\`:
  - Dohvaća sve dostupne tim članove direktora
  - Filtrira po kategoriji leada
  - Sortira po reputation scoreu
  - Dodjeljuje najboljem tim članu
- Algoritam koristi \`findBestTeamMemberForLead\` i \`calculateMemberScore\` funkcije.

**Baza**
- \`CompanyLeadQueue\` model čuva \`assignmentType: AUTO\` za audit trail.
- \`assignedAt\` timestamp bilježi kada je lead dodijeljen.

**Integracije**
- Notification servis šalje obavijest tim članu o auto-dodjeli.
- Analytics može pratiti učinkovitost auto-assign algoritma.

**API**
- \`POST /api/director/lead-queue/:queueId/auto-assign\` - automatska dodjela najboljem tim članu
`
    },
    "Ručna dodjela leadova od strane direktora": {
      implemented: true,
      summary: "Direktor ručno odabire tim člana koji preuzima lead iz dropdowna u Direktor Dashboard tabu.",
      details: `**Kako funkcionira**
- Direktor vidi sve PENDING leadove u Direktor Dashboard tabu "Interni Lead Queue".
- Za svaki PENDING lead, direktor može odabrati tim člana iz dropdowna.
- Odabrani tim član automatski dobiva lead i notifikaciju.
- Tip dodjele se označava kao MANUAL za audit trail.

**Prednosti**
- Omogućuje ljudsku procjenu za VIP klijente i specijalne slučajeve.
- Direktor ima potpunu kontrolu nad distribucijom leadova.
- Održava audit trail dodjela (assignmentType: MANUAL).

**Kada koristiti**
- Za strateški važne ili osjetljive upite gdje direktor želi osobno odlučiti.
- Kada direktor želi dodijeliti lead specifičnom tim članu na temelju ekspertize.
- Kod eskalacija kada auto-assign ne daje zadovoljavajući rezultat.
`,
      technicalDetails: `**Frontend**
- Direktor Dashboard tab "Interni Lead Queue" prikazuje dropdown "Odaberi tim člana..." za svaki PENDING lead.
- Dropdown prikazuje sve tim članove s njihovim imenima i email adresama.
- Odabir tim člana automatski dodjeljuje lead.

**Backend**
- \`assignLeadToTeamMember\` funkcija u \`company-lead-distribution.js\`:
  - Provjerava da je korisnik direktor
  - Provjerava da tim član pripada direktoru
  - Provjerava da lead još nije dodijeljen
  - Dodjeljuje lead tim članu
  - Postavlja assignmentType na MANUAL

**Baza**
- \`CompanyLeadQueue\` model čuva \`assignmentType: MANUAL\` za audit trail.
- \`assignedAt\` timestamp bilježi kada je lead dodijeljen.

**Integracije**
- Notification servis šalje obavijest tim članu o ručnoj dodjeli.
- Analytics može pratiti učinkovitost ručnih dodjela.

**API**
- \`POST /api/director/lead-queue/:queueId/assign\` - ručna dodjela tim članu (zahtijeva teamMemberId u body-ju)
`
    },
    "Pregled aktivnosti tima": {
      implemented: true,
      summary: "Direktor prati aktivnosti tima kroz Direktor Dashboard - pregled ponuda i leadova koji čekaju na odobrenje.",
      details: `**Kako funkcionira**
- Direktor Dashboard tab "Odluke" prikazuje ponude koje čekaju na odobrenje (od tim članova).
- Prikazuju se leadovi koje tim članovi trebaju odobriti.
- Direktor vidi sve relevantne informacije za donošenje odluke (naslov posla, iznos ponude, kontakt informacije).

**Prednosti**
- Centralizirani pregled svih odluka koje čekaju na odobrenje.
- Brzo donošenje odluka na jednom mjestu.
- Pregled aktivnosti tim članova.

**Kada koristiti**
- Za pregled ponuda koje čekaju na odobrenje.
- Za pregled leadova koje tim članovi trebaju odobriti.
- Za donošenje ključnih odluka tvrtke.
`,
      technicalDetails: `**Frontend**
- Direktor Dashboard tab "Odluke" prikazuje dvije sekcije: "Ponude koje čekaju" i "Leadovi koje čekaju".
- Prikaz relevantnih informacija za svaku odluku (naslov posla, iznos, kontakt informacije).

**Backend**
- \`GET /api/director/decisions\` dohvaća odluke koje čekaju.
- Filtrira ponude i leadove tim članova koji čekaju na odobrenje.

**Baza**
- \`Offer\` – ponude tim članova sa statusom PENDING.
- \`LeadPurchase\` – leadovi tim članova sa statusom ACTIVE.

**Integracije**
- Notification servis generira alert-e (npr. lead bez odgovora > SLA).
- Analytics koristi iste evente za BI izvještaje.

**API**
- \`GET /api/director/team-activity\` – feed s filtrima.
- \`GET /api/director/team-activity/kpi\` – sažetak metrika.
- \`GET /api/director/team-activity/export\` – izvoz izvještaja.
`
    },
    "PUBLIC chat (Klijent ↔ Tvrtka)": {
      implemented: true,
      summary: "Javni chat između klijenta i tvrtke automatski se otvara nakon otključavanja lead-a i prati cijeli posao.",
      details: `**Kako funkcionira**
- Chat se automatski kreira kada provider kupi lead (otključa kontakt informacije).
- Sudionici chata su: klijent (vlasnik posla), provider koji je kupio lead, direktor (ako je provider tim član), i tim član kojem je lead dodijeljen (ako je lead dodijeljen u internom queueu).
- Chat prati cijeli životni ciklus posla - od otključavanja leada do završetka posla.
- Sve poruke su vezane uz posao i ostaju dostupne tijekom cijelog procesa.

**Prednosti**
- Centralizirana komunikacija između klijenta i tvrtke na jednom mjestu.
- Automatsko otvaranje chata nakon otključavanja leada - nema potrebe za ručnim kreiranjem.
- Tim članovi mogu sudjelovati u chatu ako je lead dodijeljen njima.
- Chat prati cijeli posao - sve komunikacije su na jednom mjestu.

**Kada koristiti**
- Svaka interakcija s klijentom nakon otključavanja leada.
- Komunikacija o detaljima posla, ponudama, i statusu izvršenja.
- Praćenje otvorenih razgovora i statusa poslova.
`,
      technicalDetails: `**Frontend**
- Chat komponenta prikazuje sve PUBLIC chat roomove korisnika.
- Socket kanal za real-time poruke (ako je implementiran).
- Chat thread vezan uz posao - sve poruke su povezane s jobId.

**Backend**
- \`public-chat-service.js\` upravlja PUBLIC chat funkcionalnostima:
  - \`createPublicChatRoom\` - automatski kreira chat room nakon otključavanja leada
  - \`checkPublicChatAccess\` - provjerava pristup korisnika chatu
  - \`getPublicChatRooms\` - dohvaća sve PUBLIC chat roomove korisnika
- Chat se automatski kreira u \`lead-service.js\` kada se lead kupi (\`purchaseLead\`).
- Chat rute podržavaju i PUBLIC chat (lead purchase) i OFFER_BASED chat (accepted offer).

**Baza**
- \`ChatRoom\` model povezan s \`Job\` preko \`jobId\`.
- \`ChatMessage\` model čuva poruke s \`senderId\`, \`roomId\`, \`content\`, \`attachments\`.
- Sudionici chata su povezani preko \`participants\` relacije u \`ChatRoom\`.

**Integracije**
- Notification servis šalje obavijesti o novim porukama.
- Chat se automatski kreira kada se lead otključi.

**API**
- \`GET /api/chat/rooms\` - dohvaća sve chat roomove korisnika (PUBLIC i OFFER_BASED)
- \`GET /api/chat/check/:jobId\` - provjerava pristup chatu za posao
- \`GET /api/chat/rooms/:roomId/messages\` - dohvaća poruke iz chat rooma
- \`POST /api/chat/rooms/:roomId/messages\` - šalje novu poruku
- \`POST /api/chat/rooms/:roomId/upload-image\` - upload slike za chat poruku
`
    },
    "Maskirani kontakti do prihvata ponude": {
      implemented: true,
      summary: "Email i telefon klijenta ostaju skriveni dok ponuda nije prihvaćena, čime se štiti privatnost i marketplace ekonomija.",
      details: `**Kako funkcionira**
- Email i telefon klijenta se maskiraju dok ponuda nije prihvaćena (status ≠ ACCEPTED).
- Email se maskira kao "j***@example.com" (prvo slovo, maskirani dio, zadnje slovo, domena).
- Telefon se maskira kao "+385 *** *** 123" (maskirani dio, zadnje 3-4 znamenke).
- Vlasnik posla uvijek vidi svoje kontakte.
- Provider s prihvaćenom ponudom automatski vidi kontakte klijenta.
- Kada se ponuda prihvati (ACCEPTED), kontakti se automatski otključavaju za providera koji je poslao ponudu.

**Prednosti**
- Štiti privatnost klijenata dok ponuda nije prihvaćena.
- Sprječava off-platform dogovore prije formalnog prihvaćanja ponude.
- Automatsko otključavanje kontakata kada se ponuda prihvati.

**Kada koristiti**
- Standardni tok rada dok se ponuda ne prihvati.
- Svi API endpointovi koji vraćaju job podatke automatski maskiraju kontakte.
`,
      technicalDetails: `**Frontend**
- Helper funkcije \`maskEmail\` i \`maskPhone\` formatiraju maskirane kontakte.
- UI prikazuje maskirane kontakte s indikatorom da su maskirani.
- Kada se ponuda prihvati, kontakti se automatski prikazuju u punom obliku.

**Backend**
- \`contact-masking.js\` utility modul sadrži funkcije za maskiranje kontakata:
  - \`maskEmail\` - maskira email adresu
  - \`maskPhone\` - maskira telefonski broj
  - \`maskUserContacts\` - maskira kontakte korisnika ako ponuda nije prihvaćena
  - \`hasAcceptedOffer\` - provjerava da li postoji prihvaćena ponuda
  - \`isJobOwner\` - provjerava da li je korisnik vlasnik posla
  - \`isAcceptedProvider\` - provjerava da li je korisnik provider s prihvaćenom ponudom
- API endpointovi automatski maskiraju kontakte u responseima:
  - \`GET /api/jobs\` - lista poslova
  - \`GET /api/jobs/for-provider\` - poslovi za providere
- Kada se ponuda prihvati (\`POST /api/offers/:offerId/accept\`), kontakti se automatski otključavaju.

**Baza**
- Nema dodatnih modela - maskiranje se radi na aplikacijskoj razini.
- \`Offer\` model s \`status\` poljem (PENDING, ACCEPTED, REJECTED).
- Provjera pristupa: vlasnik posla i provider s prihvaćenom ponudom vide kontakte.

**Integracije**
- Nema dodatnih integracija - maskiranje je čisto aplikacijska logika.
`
    },
    "Chat thread vezan uz upit/ponudu": {
      implemented: true,
      summary: "Svaki lead i pripadajuća ponuda imaju svoj thread kako bi komunikacija i privici bili u jednoj vremenskoj liniji.",
      details: `**Kako funkcionira**
- Lead automatski kreira PUBLIC thread \`chat:{leadId}\`; interne dodjele otvaraju INTERNAL thread.
- Ponude i promjene statusa ažuriraju metapodatke threada (npr. aktivna verzija ponude, zadnja aktivnost).
- CRM linkovi i breadcrumbs vode korisnika iz leada u odgovarajući thread bez traženja.

**Prednosti**
- Cijeli kontekst (poruke, privici, ponude) dostupan je na jednom mjestu.
- Moderator i direktor brzo rekonstruiraju tijek dogovora.

**Kada koristiti**
- Pregled aktivnih leadova i ponuda.
- Rješavanje prigovora ili provjera komunikacije pri sporu.
`,
      technicalDetails: `**Frontend**
- Route \`/chat/:leadId\` i \`/chat/:leadId/internal\` učitava odgovarajući thread s breadcrumbom (naziv posla, status leada).
- Komponenta dohvaća metapodatke (lead status, offerState, lastMessageAt) jednim GraphQL/REST pozivom.

**Backend**
- \`chatService.ensureThread\` kreira thread ako ne postoji i sinkronizira ga s CRM modulom.
- Event \`chat.thread.updated\` emitira se pri promjeni statusa ponude ili lead-a.

**Baza**
- \`ChatThread\` (leadId, type, currentOfferId, lastMessageAt).
- \`ChatThreadMetadata\` (JSONB) čuva oznake poput offerVersion ili hasPendingQuestions.

**Integracije**
- CRM modul koristi iste metapodatke za prikaz konteksta.
- Analytics prati vrijeme od otključavanja do zadnje poruke.

**API**
- \`GET /api/chat/threads?leadId=\` – dohvat threada i metapodataka.
- \`GET /api/chat/threads/:threadId/messages\` – poruke povezane s leadom.
- \`POST /api/chat/threads\` – interno kreiranje threada (sistemski poziv).
`
    },
    "Privici u chatu (fotke, PDF ponude)": {
      implemented: true,
      summary: "Chat podržava upload slika, PDF-ova i dokumenata uz verzioniranje i sigurno pohranjivanje.",
      details: `**Kako funkcionira**
- Korisnici drag-and-dropom ili izborom datoteke prilažu privitke uz poruke; PDF ponude se automatski prilažu pri slanju.
- Sustav validira tip i veličinu datoteke, pohranjuje je u siguran storage i povezuje s porukom.
- Privici su dostupni u kontekstu threada, a nakon zatvaranja posla ostaju read-only radi arhive.

**Prednosti**
- Klijenti i provideri razmjenjuju dokumente bez napuštanja platforme.
- Sve verzije ponuda i dokumenata ostaju auditabilne.

**Kada koristiti**
- Slanje fotografija projekta, troškovnika, ponuda, certifikata.
- Dokumentiranje izmjena tijekom pregovora.
`,
      technicalDetails: `**Frontend**
- \`FileDropZone\` komponenta prikazuje napredak uploada i preview podržanih tipova.
- Privici su prikazani u poruci s akcijama "preuzmi" i "otvori" (PDF viewer, image lightbox).

**Backend**
- \`attachmentService.upload\` provodi antivirus skeniranje i sprema datoteku u storage (S3) s presigned URL-om.
- Verzijski sustav označava nadjačane privitke (npr. nova verzija ponude).

**Baza**
- \`ChatAttachment\` (messageId, fileName, mimeType, size, storageKey, version).
- Audit log \`AttachmentHistory\` čuva verzije i korisnika koji je priložio datoteku.

**Integracije**
- Antivirus/Content scanning servis, CDN/CloudFront za distribuciju, analytics za praćenje tipova privitaka.

**API**
- \`POST /api/chat/:threadId/attachments\` – upload privitka.
- \`GET /api/chat/:threadId/attachments\` – listing i metapodaci.
- \`GET /api/chat/attachments/:id/download\` – secure preuzimanje.
`
    },
    "Verzioniranje poruka": {
      implemented: true,
      summary: "Poruke i privici imaju verzije – svaka izmjena čuva staru verziju radi audita i transparentnosti.",
      details: `**Kako funkcionira**
- Korisnik može urediti svoju poruku; sustav čuva original i označava poruku kao uređenu.
- Svaka izmjena kreira novu verziju poruke - stara verzija se čuva u MessageVersion modelu.
- Sudionici chata imaju uvid u povijest verzija (tekst + privici) s informacijom tko je i kada mijenjao sadržaj.
- Zamjena privitka ne briše staru verziju; obje su dostupne za pregled i audit.

**Prednosti**
- Transparentnost komunikacije i dokazni trag kod sporova.
- Mogućnost ispravaka bez gubitka originalnog konteksta.
- Potpuna povijest izmjena poruka za audit i compliance.

**Kada koristiti**
- Korekcije tipfelera ili dopuna informacija nakon slanja.
- Ispravci grešaka u porukama.
- Moderatorski pregled spornih razgovora.
`,
      technicalDetails: `**Frontend**
- Chat komponenta prikazuje badge "Uređeno" za poruke koje su bile uređene.
- UI omogućuje pregled povijesti verzija poruke.
- Modal "Povijest verzija" prikazuje sve verzije s informacijom o korisniku i vremenu uređivanja.

**Backend**
- \`message-versioning.js\` servis upravlja verzioniranjem poruka:
  - \`editMessage\` - uređuje poruku i kreira novu verziju
  - \`getMessageVersions\` - dohvaća sve verzije poruke
  - \`getMessageVersion\` - dohvaća specifičnu verziju poruke
- API endpointovi:
  - \`PATCH /api/chat/rooms/:roomId/messages/:messageId\` - uređuje poruku (kreira novu verziju)
  - \`GET /api/chat/rooms/:roomId/messages/:messageId/versions\` - dohvaća sve verzije poruke
  - \`GET /api/chat/rooms/:roomId/messages/:messageId/versions/:version\` - dohvaća specifičnu verziju

**Baza**
- \`MessageVersion\` model čuva verzije poruka:
  - \`messageId\` - ID originalne poruke
  - \`content\` - sadržaj verzije
  - \`attachments\` - privici verzije
  - \`version\` - broj verzije (1, 2, 3...)
  - \`editedById\` - ID korisnika koji je uredio poruku
  - \`editedAt\` - kada je verzija kreirana
  - \`reason\` - razlog uređivanja (opcionalno)
- \`ChatMessage\` model ima:
  - \`isEdited\` - flag da li je poruka ikad uređena
  - \`editedAt\` - kada je poruka zadnji put uređena
  - \`updatedAt\` - ažurirano kada se poruka uredi
  - \`versions\` - relacija na MessageVersion

**Integracije**
- Audit servis koristi verzije za pravne zahtjeve.
- Povijest verzija je dostupna svim sudionicima chata za transparentnost.
`
    },
    "Audit log svih poruka": {
      implemented: true,
      summary: "Svaka poruka, uređivanje, privitak i otkrivanje kontakta bilježi se u audit log s vremenom i korisnikom.",
      details: `**Kako funkcionira**
- Kreiranje, uređivanje, brisanje poruka i otkrivanje kontakata zapisuje se s korisnikom, vremenom i metapodacima.
- Svaka akcija se bilježi s IP adresom i user agentom za potpunu sljedivost.
- Direktor/moderator ima pristup audit logovima kroz API endpointove s filtriranjem po tipu akcije, korisniku i datumu.
- Podaci se čuvaju dugoročno radi usklađenosti i pravne zaštite.

**Prednosti**
- Potpuna sljedivost komunikacije.
- Jednostavan odgovor na regulatorne ili pravne zahtjeve.
- Transparentnost svih akcija u sustavu.

**Kada koristiti**
- Moderiranje, rješavanje prigovora, interni compliance review.
- Pregled povijesti izmjena poruka i otkrivanja kontakata.
- Analiza ponašanja korisnika i sigurnosni audit.
`,
      technicalDetails: `**Frontend**
- "Audit" tab prikazuje listu događaja i omogućuje filtriranje.
- Export koristi CSV/Excel generiranje na klijentu (budući feature).

**Backend**
- \`audit-log-service.js\` zapisuje događaj pri svakoj relevantnoj akciji:
  - \`logMessageCreated\` - kreiranje poruke
  - \`logMessageEdited\` - uređivanje poruke
  - \`logMessageDeleted\` - brisanje poruke
  - \`logAttachmentUploaded\` - upload privitka
  - \`logAttachmentDeleted\` - brisanje privitka
  - \`logContactRevealed\` - otkrivanje kontakta
  - \`logContactMasked\` - maskiranje kontakta
  - \`logRoomCreated\` - kreiranje chat rooma
  - \`logRoomDeleted\` - brisanje chat rooma
- API endpointovi za dohvaćanje audit logova:
  - \`GET /api/chat/rooms/:roomId/audit-logs\` - audit logovi za chat room
  - \`GET /api/chat/messages/:messageId/audit-logs\` - audit logovi za poruku
  - \`GET /api/jobs/:jobId/audit-logs\` - audit logovi za otkrivanje kontakata

**Baza**
- \`AuditLog\` model čuva sve audit zapise:
  - \`action\` - tip akcije (MESSAGE_CREATED, MESSAGE_EDITED, CONTACT_REVEALED, itd.)
  - \`actorId\` - ID korisnika koji je izvršio akciju
  - \`messageId\` - ID poruke (ako je akcija vezana uz poruku)
  - \`roomId\` - ID chat rooma (ako je akcija vezana uz room)
  - \`jobId\` - ID posla (za otkrivanje kontakata)
  - \`metadata\` - JSON s dodatnim podacima (stara/nova verzija, razlog, itd.)
  - \`ipAddress\` - IP adresa korisnika
  - \`userAgent\` - User agent korisnika
  - \`createdAt\` - vrijeme izvršavanja akcije
- Indexi po \`actorId\`, \`messageId\`, \`roomId\`, \`jobId\`, \`action\` i \`createdAt\` ubrzavaju upite.

**Integracije**
- Audit logovi se automatski kreiraju pri svakoj relevantnoj akciji.
- Analytics/BI i compliance alati mogu konzumirati audit podatke kroz API.

`
    },
    "Zaključavanje threada nakon završetka": {
      implemented: true,
      summary: "Nakon završetka posla ili dulje neaktivnosti thread prelazi u read-only uz opciju privremenog otključavanja.",
      details: `**Kako funkcionira**
- Kada posao dobije status COMPLETED, svi threadovi za taj posao se automatski zaključavaju.
- Threadovi bez aktivnosti dulje od 90 dana se automatski zaključavaju (cron job).
- Sudionici mogu pregledavati povijest, ali ne mogu slati nove poruke ili uređivati postojeće.
- Sudionici mogu privremeno otključati thread (npr. radi garancije) na određeno vrijeme (1-1440 minuta).
- Sudionici mogu trajno otključati thread ako imaju pristup.

**Prednosti**
- Štiti od kasnih izmjena dogovora i čuva arhivu urednom.
- Jasno označava završene poslove i smanjuje šum u aktivnim chatovima.
- Automatsko upravljanje neaktivnim threadovima.

**Kada koristiti**
- Nakon završetka projekta - automatski se zaključavaju svi threadovi.
- Nakon dulje neaktivnosti (90+ dana) - automatski zaključavanje.
- Kod reklamacija gdje je potrebno privremeno ponovno otvoriti komunikaciju.
`,
      technicalDetails: `**Frontend**
- Banner "Thread je zaključan" i skriven input za poruke.
- Timer prikazuje koliko dugo će privremeno otključan thread ostati otvoren.
- UI za zaključavanje/otključavanje threadova.

**Backend**
- \`thread-locking-service.js\` upravlja zaključavanjem:
  - \`lockThread\` - zaključava thread
  - \`unlockThread\` - trajno otključava thread
  - \`temporarilyUnlockThread\` - privremeno otključava thread
  - \`lockThreadsForCompletedJob\` - automatski zaključava threadove za završeni posao
  - \`lockInactiveThreads\` - zaključava neaktivne threadove
  - \`reLockExpiredTemporaryUnlocks\` - ponovno zaključava threadove čije je privremeno otključavanje isteklo
  - \`updateThreadActivity\` - ažurira zadnju aktivnost u threadu
- Cron job u \`queueScheduler.js\` provjerava neaktivne threadove svaki dan u 2:00.
- API endpointovi:
  - \`POST /api/chat/rooms/:roomId/lock\` - zaključaj thread
  - \`POST /api/chat/rooms/:roomId/unlock\` - otključaj thread
  - \`POST /api/chat/rooms/:roomId/temporarily-unlock\` - privremeno otključaj thread
- Chat endpointovi provjeravaju je li thread zaključan prije slanja/uređivanja poruka.

**Baza**
- \`ChatRoom\` model ima polja za zaključavanje:
  - \`isLocked\` - da li je thread zaključan
  - \`lockedAt\` - kada je thread zaključan
  - \`lockedReason\` - razlog zaključavanja (JOB_COMPLETED, INACTIVITY, MANUAL)
  - \`unlockedUntil\` - privremeno otključan do (null = trajno zaključan)
  - \`lastActivityAt\` - zadnja aktivnost u threadu
  - \`lockedById\` - ID korisnika koji je zaključao thread (null = automatski)

**Integracije**
- Automatsko zaključavanje kada se posao označi kao COMPLETED.
- Cron job za automatsko zaključavanje neaktivnih threadova (svaki dan u 2:00).
`
    },
    "SLA podsjetnici za odgovor": {
      implemented: true,
      summary: "Platforma podsjeća timove na obvezu odgovora unutar SLA-a i bilježi kršenja koja utječu na reputaciju.",
      details: `**Kako funkcionira**
- Kada korisnik (USER) pošalje poruku, automatski se kreira SLA tracking s ciljem odgovora unutar 4 sata (240 minuta).
- Platforma šalje podsjetnike:
  - 1 sat prije isteka SLA-a (50% vremena)
  - 30 minuta prije isteka SLA-a (87.5% vremena)
  - Nakon prekoračenja SLA-a (svakih 2 sata)
- Kada provider odgovori, SLA se označava kao ispunjen (MET) ili prekoračen (BREACHED).
- Prekoračenja SLA-a utječu na reputaciju providera.

**Prednosti**
- Osigurava brze odgovore i bolje korisničko iskustvo.
- Automatski podsjeća providere na obvezu odgovora.
- Bilježi kršenja koja utječu na reputaciju.

**Kada koristiti**
- Za sve poruke od korisnika (USER) koje zahtijevaju odgovor od providera.
- Za praćenje performansi providera u odgovaranju na poruke.
`,
      technicalDetails: `**Frontend**
- UI za prikaz SLA statusa u chat roomu.
- Indikatori vremena do isteka SLA-a.
- Notifikacije o podsjetnicima.

**Backend**
- \`sla-reminder-service.js\` upravlja SLA trackingom:
  - \`createSLATracking\` - kreira SLA tracking za poruku
  - \`markMessageAsResponded\` - označava poruku kao odgovorenu
  - \`checkAndSendSLAReminders\` - provjerava i šalje podsjetnike
  - \`getSLAStatusForRoom\` - dohvaća SLA status za room
  - \`getSLAStatusForProvider\` - dohvaća SLA status za providera
- Cron job u \`queueScheduler.js\` provjerava SLA svaki sat.
- Automatsko kreiranje SLA trackinga kada korisnik pošalje poruku.
- Automatsko označavanje poruke kao odgovorene kada provider odgovori.

**Baza**
- \`MessageSLA\` model za tracking:
  - \`expectedResponseMinutes\` - očekivano vrijeme odgovora (default: 240 minuta)
  - \`respondedAt\` - kada je odgovoreno
  - \`responseTimeMinutes\` - vrijeme odgovora u minutama
  - \`slaStatus\` - status (PENDING, MET, BREACHED)
  - \`breachedAt\` - kada je SLA prekoračen
  - \`reminderSentAt\` - kada je poslana podsjetnica
  - \`reminderCount\` - broj poslanih podsjetnica

**Integracije**
- Automatsko kreiranje SLA trackinga kada korisnik pošalje poruku.
- Cron job za provjeru i slanje podsjetnica (svaki sat).
- Notifikacije i push notifikacije za podsjetnike.

**API**
- \`GET /api/chat/rooms/:roomId/sla-status\` - dohvaća SLA status za room
- \`GET /api/chat/providers/:providerId/sla-status\` - dohvaća SLA status za providera
`
    },
    "Moderacija chat poruka": {
      implemented: true,
      summary: "Automatska i ručna moderacija filtrira neprikladan sadržaj, dijeljenje kontakata i omogućuje prijave.",
      details: `**Kako funkcionira**
- Svaka poruka prolazi automatsku heurističku provjeru; sumnjive se označavaju "pending review".
- Korisnici mogu prijaviti poruku moderatorima koji odlučuju (odobri, odbij).
- Politike zabranjuju dijeljenje osobnih podataka (email, telefon) prije prihvata ponude i uvredljiv sadržaj.
- Odbijene poruke se automatski sakrivaju od korisnika (osim admina).

**Prednosti**
- Održava profesionalnu komunikaciju i štiti marketplace.
- Brzo reagira na zloupotrebe uz audit trag.
- Sprječava off-platform komunikaciju prije formalnog prihvaćanja ponude.

**Kada koristiti**
- Za sve poruke u chat sistemu.
- Za automatsku provjeru neprikladnog sadržaja.
- Za ručnu moderaciju prijavljenih poruka.
`,
      technicalDetails: `**Frontend**
- UI za prijavu poruka (gumb "Prijavi" na svakoj poruci).
- Admin dashboard za pregled i moderaciju prijavljenih poruka.
- Indikatori statusa moderacije (pending, approved, rejected).

**Backend**
- \`message-moderation-service.js\` upravlja moderacijom:
  - \`autoModerateMessage\` - automatska provjera poruke
  - \`reportMessage\` - prijava poruke za moderaciju
  - \`approveMessage\` - odobravanje poruke (admin)
  - \`rejectMessage\` - odbijanje poruke (admin)
  - \`getPendingModerationMessages\` - dohvaćanje poruka koje čekaju moderaciju
  - \`getModerationStats\` - statistika moderacije
- Automatska provjera pri kreiranju poruke (REST i WebSocket).
- Filtracija odbijenih poruka u chat endpointovima.

**Baza**
- \`ChatMessage\` model već ima polja za moderaciju:
  - \`moderationStatus\` - status moderacije (PENDING, APPROVED, REJECTED)
  - \`moderationReportedBy\` - ID korisnika koji je prijavio
  - \`moderationReportedAt\` - kada je prijavljeno
  - \`moderationReviewedBy\` - ID admina koji je pregledao
  - \`moderationReviewedAt\` - kada je pregledano
  - \`moderationRejectionReason\` - razlog odbijanja
  - \`moderationNotes\` - bilješke moderatora

**Integracije**
- Automatska provjera pri kreiranju poruke.
- Notifikacije adminima o novim prijavama.
- Notifikacije korisnicima o odbijanju poruka.

**API**
- \`POST /api/chat/messages/:messageId/report\` - prijavi poruku
- \`GET /api/chat/moderation/pending\` - dohvaća poruke koje čekaju moderaciju (admin)
- \`GET /api/chat/moderation/stats\` - statistika moderacije (admin)
- \`POST /api/chat/messages/:messageId/approve\` - odobri poruku (admin)
- \`POST /api/chat/messages/:messageId/reject\` - odbij poruku (admin)
`
    },
    "INTERNAL chat (Direktor ↔ Team)": {
      implemented: true,
      summary: "Privatni interni chat između direktora i timova za operativnu koordinaciju, nevidljiv klijentu.",
      details: `**Kako funkcionira**
- INTERNAL chat je privatni chat između direktora i tim članova za operativnu koordinaciju.
- Chat nije vezan uz posao (jobId = null) - razlikuje se od PUBLIC chata koji je vezan uz posao.
- Direktor može kreirati 1-on-1 chat s tim članom ili grupni chat s više tim članova.
- Chat je nevidljiv klijentima - samo direktor i tim članovi iste tvrtke imaju pristup.

**Prednosti**
- Omogućuje strukturiranu internu komunikaciju bez korištenja vanjskih kanala.
- Čuva povijest odluka i dogovora unutar platforme.
- Potpuno odvojen od PUBLIC chata s klijentom - nema rizika od slučajnog dijeljenja internih informacija.

**Kada koristiti**
- Operativna koordinacija između direktora i tim članova.
- Interni dogovori o poslovima, troškovima, i odobrenjima.
- Komunikacija koja ne treba biti vidljiva klijentu.

**Sigurnost**
- Samo direktor može kreirati INTERNAL chat roomove.
- Pristup imaju samo direktor i tim članovi iste tvrtke.
- Klijenti nemaju pristup INTERNAL chat roomovima.
`,
      technicalDetails: `**Frontend**
- Chat komponenta prikazuje INTERNAL chat roomove odvojeno od PUBLIC chat roomova.
- UI jasno označava INTERNAL chat roomove kako bi se izbjegle greške.
- Direktor može kreirati novi INTERNAL chat room s tim članom ili grupni chat.

**Backend**
- \`internal-chat-service.js\` upravlja INTERNAL chat funkcionalnostima:
  - \`createOrGetInternalChatRoom\` - kreira ili dohvaća 1-on-1 chat između direktora i tim člana
  - \`createGroupInternalChatRoom\` - kreira grupni chat za direktor i više tim članova
  - \`checkInternalChatAccess\` - provjerava pristup INTERNAL chatu
  - \`getInternalChatRooms\` - dohvaća sve INTERNAL chat roomove korisnika
- INTERNAL chat roomovi imaju \`jobId = null\` (razlika od PUBLIC chata koji ima jobId).

**Baza**
- \`ChatRoom\` model s \`jobId = null\` za INTERNAL chat roomove.
- \`ChatMessage\` model čuva poruke s \`senderId\`, \`roomId\`, \`content\`, \`attachments\`.
- Sudionici chata su povezani preko \`participants\` relacije u \`ChatRoom\`.
- Provjera pristupa: svi sudionici moraju biti direktor ili tim članovi iste tvrtke.

**Integracije**
- Notification servis šalje obavijesti o novim INTERNAL porukama.
- Chat rute provjeravaju pristup prije dohvaćanja poruka.

**API**
- \`GET /api/chat/internal/rooms\` - dohvaća sve INTERNAL chat roomove korisnika
- \`POST /api/chat/internal/rooms\` - kreira novi INTERNAL chat room između direktora i tim člana
- \`POST /api/chat/internal/rooms/group\` - kreira grupni INTERNAL chat room
- \`GET /api/chat/internal/rooms/:roomId/check\` - provjerava pristup INTERNAL chatu
- \`GET /api/chat/rooms\` - dohvaća sve chat roomove (uključuje INTERNAL za PROVIDER role)
- \`GET /api/chat/rooms/:roomId/messages\` - dohvaća poruke (podržava INTERNAL chat)
- \`POST /api/chat/rooms/:roomId/messages\` - šalje poruku (podržava INTERNAL chat)
`
    },
    "Weighted Queue algoritam": {
      implemented: true,
      summary: "Algoritam rangira providere prema reputaciji, odzivu, lokaciji i kapacitetu kako bi leadove dobili najkvalitetniji izvođači.",
      details: `**Kako funkcionira**
- Lead ne ide prvom koji klikne, nego partneru s najvećim SCORE-om (reputacija, brzina odgovora, paket, udaljenost, vrijeme od zadnje dodjele).
- Filtriraju se kandidati koji pokrivaju kategoriju/leadu i imaju raspoloživ kapacitet, zatim se izračuna SCORE i lead dodjeljuje najboljem.
- Premium partneri mogu primiti lead auto-assignom; ostali dobivaju claim obavijest. Nakon isteka time-outa lead prelazi na sljedećeg kandidata.

**Prednosti**
- Nagrađuje kvalitetne i aktivne partnere te održava fer distribuciju.
- Klijenti dobivaju bržu i kvalitetniju uslugu jer lead ide onima s najboljim performansama.

**Kada koristiti**
- Standardni način dodjele leadova u marketplaceu.
- Situacije kada je bitno uravnotežiti kvalitetu i fer raspodjelu.
`,
      technicalDetails: `**Frontend**
- Dashboard \`LeadQueue\` prikazuje poredak partnera i razloge prioriteta (tooltip breakdown score faktora).
- Admin simulacija \/ debug alat poziva \`POST /api/admin/lead-queue/simulate\` i vizualizira rezultat.

**Backend**
- \`leadQueueEngine.calculateScore\` kombinira metričke podatke iz cache sloja i vraća ranking.
- Cron \`queueRebalanceJob\` periodično recalculira score i sprema snapshot za audit.

**Baza**
- \`LeadQueueSnapshot\` čuva povijesne rezultate (companyId, score, faktori, timestamp).
- Metričke tablice (ResponseMetric, CompletionMetric) pune se asinkronim workerima.

**Integracije**
- Redis sorted setovi za aktivni red (\`lead-queue:{categoryId}\`).
- Analytics modul koristi snapshotove za BI izvještaje.

**API**
- \`POST /api/internal/lead-queue/assign\` – vraća odabranu tvrtku i razloge odabira.
- \`GET /api/internal/lead-queue/snapshot\` – trenutni ranking za debug.
- \`POST /api/admin/lead-queue/rebalance\` – ručno pokretanje recalculationa (admin).
`
    },
    "Partner Score izračun": {
      implemented: true,
      summary: "Kompozitni PARTNER_SCORE (0-100) kombinira ResponseRate, CompletionRate, Rating, ConversionRate, Compliance i Freshness za tieriranje partnera.",
      details: `**Kako funkcionira**
- Dnevni/tjedni job računa PARTNER_SCORE na temelju ključnih metrika i dodjeljuje tier (Premium ≥80, Verified 60-79, Basic <60).
- Promjene scorea utječu na vidljivost i prioritet u lead distribuciji; top partneri prolaze ručni QA review.
- Partner vidi breakdown komponenti i događaje koji su utjecali na score (npr. nova recenzija, SLA kršenje).

**Prednosti**
- Transparentno nagrađuje kvalitetne i pouzdane partnere.
- Pomaže internim timovima identificirati partnere kojima treba podrška ili edukacija.

**Kada koristiti**
- Periodična evaluacija partnera (npr. tjedno).
- Prilikom odlučivanja o promociji na Premium tier ili smanjenju privilegija.
`,
      technicalDetails: `**Frontend**
- \`PartnerAnalytics\` prikazuje radar graf score komponenti i real-time badge (Premium/Verified/Basic).
- SSE kanal \`partner-score/{companyId}\` ažurira prikaz odmah nakon recalculacije.

**Backend**
- \`partnerScoreCalculator.run\` (Bull queue) računa score i sprema u \`PartnerScore\` i \`PartnerScoreHistory\`.
- Event \`partner.score.updated\` emitira se za notifikacije i vanjske webhookove.

**Baza**
- \`PartnerScore\` (score, tier, breakdown JSONB).
- \`PartnerScoreHistory\` i \`PartnerTierChange\` čuvaju povijest i razloge.

**Integracije**
- Notification servis šalje promjene tierova; analytics koristi povijest za trend analize.

**API**
- \`GET /api/partners/:companyId/score\` – aktualni score i breakdown.
- \`GET /api/partners/:companyId/score/history\` – trend.
- \`POST /api/admin/partners/:companyId/recalculate-score\` – ručna recalculacija.
`
    },
    "Usporedba kategorija korisnika i tvrtke": {
      implemented: true,
      summary: "Lead se prvo filtrira prema kategorijama koje tvrtka pokriva kako bi relevantni provideri dobili priliku.",
      details: `**Kako funkcionira**
- Pri dolasku leada validira se poklapanje s kategorijama koje tvrtka nudi (npr. "Vodoinstalacije").
- Samo kompatibilne tvrtke s dostupnim kapacitetom ulaze u daljnje rangiranje (Weighted Queue).
- Admin alati i dashboard prikazuju badge “Category Match” za jasnu sliku kompatibilnosti.

**Prednosti**
- Eliminira šum – lead ide samo relevantnim izvođačima.
- Štedi kredite i podiže konverziju jer se javljaju stručnjaci za zadani posao.

**Kada koristiti**
- Tijekom onboardinga i održavanja profila (ispravno definiranje kategorija).
- Svaki put prije automatizirane ili ručne dodjele lead-a.
`,
      technicalDetails: `**Frontend**
- \`CategorySelect\` komponenta u registraciji i postavkama nudi asinkrono pretraživanje i validaciju.
- Lead kartice prikazuju badge “Category match” i listu kompatibilnih tvrtki.

**Backend**
- \`matchMakingService.filterCompaniesByCategory\` vraća tvrtke koje pokrivaju lead.
- Cache sloj (Redis) drži mapiranje tvrtka→kategorije radi brzih upita.

**Baza**
- \`CompanyCategory\` (companyId, categoryId) join tablica.
- \`LeadCategory\` povezuje lead sa zadanim kategorijama iz forme.

**Integracije**
- Admin alati, analytics izvještaji o pokrivenosti kategorija.

**API**
- \`GET /api/internal/matchmaking/lead/:leadId/company-matches\` – kompatibilni provideri.
- \`POST /api/admin/matchmaking/rebuild-company-index\` – regenerira cache.
`
    },
    "Usporedba kategorija korisnika i tima": {
      implemented: true,
      summary: "Nakon filtera po tvrtki, lead se uspoređuje s vještinama timova kako bi ga preuzeo najrelevantniji specijalist.",
      details: `**Kako funkcionira**
- Nakon što lead prođe filter po tvrtki, engine uspoređuje kategoriju posla s kategorijama tim članova.
- Match score se izračunava na osnovu točnog poklapanja kategorija (1.0 = savršen match, 0 = nema matcha).
- Lead se automatski dodjeljuje tim članu s najvišim match score-om.
- Ako nema matchanih tim članova, lead ostaje u queueu za ručnu dodjelu.

**Prednosti**
- Povećava kvalitetu izvršenja i zadovoljstvo klijenta.
- Omogućava automatsku dodjelu leadova najrelevantnijim specijalistima.
- Direktor može vidjeti match score pri ručnoj dodjeli.

**Kada koristiti**
- Kod automatizirane dodjele leadova unutar tvrtke.
- U ručnoj dodjeli kao pomoć pri izboru tima.
`,
      technicalDetails: `**Frontend**
- UI za prikaz match score-a pri dodjeli leadova.
- Dashboard prikazuje statistiku automatskih dodjela.

**Backend**
- \`team-category-matching.js\` upravlja usporedbom kategorija:
  - \`calculateCategoryMatchScore\` - izračunava match score (0-1)
  - \`findBestTeamMatches\` - pronalazi najbolje matchane tim članove
  - \`assignLeadToBestTeamMember\` - automatski dodjeljuje lead najboljem tim članu
  - \`calculateCombinedMatchScore\` - kombinirani score (tvrtka + tim)
- Integrirano u \`company-lead-distribution.js\` - automatska dodjela pri dodavanju leada u queue
- Integrirano u \`leadQueueManager.js\` - kombinirani match score u rangiranju providera

**Baza**
- \`ProviderProfile.categories\` - kategorije tim članova
- \`CompanyLeadQueue\` - čuva dodjelu leada tim članu
- \`ProviderProfile.companyId\` - povezuje tim člana s direktorom

**Integracije**
- Automatska dodjela pri dodavanju leada u interni queue tvrtke.
- Notifikacije tim članovima o dodijeljenim leadovima.
- Match score se prikazuje u notifikacijama.

**API**
- Automatski se koristi u \`addLeadToCompanyQueue\` i \`autoAssignLead\` funkcijama.
- Match score se koristi u \`findTopProviders\` za rangiranje providera s timovima.
`
    },
    "Kombinirani match score (Tvrtka + Tim)": {
      implemented: true,
      summary: "Kombinirani score spaja reputaciju tvrtke i specijalizaciju tima kako bi lead dodjela bila fer i transparentna.",
      details: `**Kako funkcionira**
- Company Score (reputacija, odziv, compliance) + Team Skill Score (vještine, workload) + Context Score (hitnost, paket, povijest) čine ukupni rezultat.
- Nakon što tvrtka prođe kategorijski filter, engine računa score za svaku kombinaciju tvrtka+tim i rangira ih.
- Lead dobiva kandidat s najvišim scoreom; direktor može vidjeti breakdown i eventualno ručno override-ati.

**Prednosti**
- Sprječava da slab tim naruši reputaciju tvrtke jer se timska komponenta posebno mjeri.
- Daje jasna objašnjenja zašto je lead dodijeljen određenom timu.

**Kada koristiti**
- Kod automatizirane dodjele leadova (standardni proces).
- U admin/direktorskim simulacijama i auditima odlučivanja.
`,
      technicalDetails: `**Frontend**
- Lead assignment sidebar prikazuje stacked progress bar s breakdownom (company/team/context).
- Tooltip objašnjava ponder i zadnje događaje koji su utjecali na score.

**Backend**
- \`matchScoreService.calculateCombinedScore\` vraća totalScore i JSON breakdown.
- \`leadDistributor.assign\` zapisuje odluku u \`LeadDistributionLog\` i emitira event.

**Baza**
- \`CombinedMatchSnapshot\` (companyScore, teamScore, contextScore, totalScore).
- \`TeamSkillMetric\` i \`LeadContextFactor\` služe kao izvori podataka.

**Integracije**
- Analytics/BI za praćenje kako se score mijenja kroz vrijeme.

**API**
- \`GET /api/internal/matchmaking/lead/:leadId/combined-score\` – sortirani kandidati.
- \`POST /api/admin/matchmaking/lead/:leadId/recalculate-score\` – ručna recalculacija.
`
    },
    "Dinamički billing po volumenu leadova": {
      implemented: true,
      summary: "Naplata paketa prilagođava se stvarnom volumenu leadova po kategoriji/regiji – višak se naplaćuje, manjak kompenzira.",
      details: `**Kako funkcionira**
- Sustav uspoređuje očekivani i isporučeni volumen leadova za paket i automatski obračunava razliku.
- Ako je isporuka manja od garantirane, generira se korekcija (kredit, produženje perioda, popust).
- Ako je volumen premašen, može se aktivirati surcharge ili preporuka za viši paket.

**Prednosti**
- Partneri plaćaju realnu vrijednost i imaju povjerenje u fairness model.
- Platforma transparentno pokazuje kako je iznos naplate nastao.

**Kada koristiti**
- Na kraju svakog obračunskog razdoblja (mjesečno/kvartalno) prije fakturiranja.
- Kod simulacija novih planova i pregleda isporuke po regiji.
`,
      technicalDetails: `**Frontend**
- Billing dashboard prikazuje delivered vs expected (line chart) i badge “Adjustment”.
- Tablica transakcija ima kolonu s detaljem korekcije.

**Backend**
- \`billingAdjustmentService.calculate\` generira korekcije; cron \`calculateMonthlyAdjustments\` pokreće obračun.
- \`invoiceService.generateProratedInvoice\` uključuje korekcije i šalje notifikacije.

**Baza**
- \`BillingPlan\` (expectedVolume), \`LeadDeliveryStat\` (deliveredVolume), \`BillingAdjustment\` (korekcije).

**Integracije**
- Accounting export, notification servis, BI dashboard.

**API**
- \`GET /api/admin/billing/plans/:id/volume\` – statistika volumena.
- \`POST /api/admin/billing/plans/:id/recalculate\` – ručna korekcija.
- \`GET /api/director/billing/summary\` – pregled za direktore.
`
    },
    "Garancija minimalnog broja leadova": {
      implemented: true,
      summary: "Paket garantira minimalan broj leadova; ako tržište ne isporuči kvotu, sustav automatski odobrava kompenzaciju.",
      details: `**Kako funkcionira**
- Svaki plan definira minimalni broj leadova po kategoriji/regiji.
- Na kraju perioda mjeri se isporuka; manjak pokreće kompenzaciju (krediti, produženje, popust) i šalje izvještaj direktoru.
- Rezultati su vidljivi na billing dashboardu i u fakturama.

**Prednosti**
- Partneri znaju da neće plaćati za “prazan” period.
- Smanjuje churn u sporijim sezonama i gradi povjerenje.

**Kada koristiti**
- Periodični obračun (mjesečni/kvartalni) prije slanja faktura.
- Na zahtjev direktora koji želi provjeru isporuke.
`,
      technicalDetails: `**Frontend**
- Kartica “Garancija” prikazuje planirano vs isporučeno i status kompenzacije.
- Banner upozorava kada je isporuka ispod praga i prikazuje automatsku akciju.

**Backend**
- \`guaranteeService.evaluate\` uspoređuje KPI-je i kreira \`BillingAdjustment\` ako je potrebno.
- Notifikacije informiraju direktora o odobrenoj kompenzaciji.

**Baza**
- \`LeadGuarantee\` (planId, period, expected, delivered, adjustmentId).
- \`BillingAdjustment\` povezana s fakturom/planom.

**Integracije**
- Notification servis, accounting, BI.

**API**
- \`GET /api/admin/guarantees/:id\` – detalji perioda.
- \`POST /api/admin/guarantees/:id/recalculate\` – ručna provjera.
- \`GET /api/director/billing/guarantee\` – pregled za direktore.
`
    },
    "Proporcionalna naplata (REAL_VALUE)": {
      implemented: true,
      summary: "REAL_VALUE faktor prilagođava cijenu paketa stvarnom volumenu leadova (plaća se proporcionalno isporuci).",
      details: `**Kako funkcionira**
- Izračunava se faktor = min(isporučeni leadovi / očekivani leadovi, 1.0).
- Konačna cijena = osnovna cijena × faktor; npr. očekivano 10, isporučeno 6 → factor 0.6 → naplata 60% cijene.
- Faktor i sirovi podaci prikazuju se na fakturi i dashboardu radi transparentnosti.

**Prednosti**
- Partneri plaćaju realnu vrijednost, bez preplate u sporijim periodima.
- Transparentno objašnjava korekcije i gradi povjerenje u billing model.

**Kada koristiti**
- Pri generiranju faktura i ručnim recalculacijama nakon korekcija.
- U analitičkim izvještajima za praćenje isporučene vrijednosti po razdoblju.
`,
      technicalDetails: `**Frontend**
- Fakture prikazuju graf očekivano vs isporučeno i badge REAL_VALUE.
- Tooltip uz stavku objašnjava formulu i prikazuje sirove brojke.

**Backend**
- \`realValueCalculator.collectUsage\` agregira leadove i vraća faktor.
- \`invoiceService.injectRealValueLineItem\` dodaje/korigira stavku na fakturi.
- Event \`billing.realValueCalculated\` bilježi se u audit log i pokreće notifikacije.

**Baza**
- \`RealValueSnapshot\` (expected, delivered, factor, invoiceId).
- \`InvoiceLineItem\` čuva usageExpected, usageDelivered i realValueFactor.

**Integracije**
- BI izvještaji i accounting export koriste iste podatke.

**API**
- \`GET /api/director/billing/real-value\` – pregled faktora po razdoblju.
- \`GET /api/admin/billing/plans/:id/real-value-history\` – trendovi.
- \`POST /api/admin/billing/recalculate-real-value\` – ponovno računanje nakon korekcija.
`
    },
    "Feature ownership (funkcionalnosti ne nestaju)": {
      implemented: true,
      summary: "Jednom otključane funkcionalnosti (CRM, Chat, Statistika…) ostaju trajno u vlasništvu tvrtke i ne naplaćuju se ponovno, što osigurava da tvrtke ne plaćaju duplo za iste funkcionalnosti.",
      details: `**Kako funkcionira**
- Plaćanjem funkcionalnosti tvrtka dobiva trajno pravo korištenja bez ponovne naplate u budućim paketima.
- Pri novoj kupnji uspoređujemo tražene feature s već otkupljenima i naplaćujemo samo razliku.
- Primjer: Premium paket (Chat, CRM, Statistika) → kasnije Basic paket za novu kategoriju naplaćuje samo kategoriju.
- Sustav automatski prati vlasništvo funkcionalnosti kroz \`CompanyFeatureOwnership\` tablicu.
- Feature ownership se ne gubi pri promjeni paketa ili downgrade-u, osiguravajući kontinuitet korištenja.
- Pri checkout procesu sustav automatski izračunava doplatu samo za nove funkcionalnosti koje tvrtka još nema.

**Prednosti**
- Nema duplog plaćanja istih modula, što potiče širenje na nove regije/kategorije.
- Direktor i finance tim imaju jasan uvid što je u vlasništvu tvrtke.
- Poboljšava iskustvo korisnika osiguravajući da ne gube pristup funkcionalnostima koje su već platili.
- Transparentan sustav koji gradi povjerenje između platforme i korisnika.
- Potiče korisnike da nadograđuju pakete bez straha od gubitka već plaćenih funkcionalnosti.

**Kada koristiti**
- Svaka kupnja paketa/add-ona gdje treba izračunati doplatu za nove funkcionalnosti.
- Analitika i billing izvještaji koji pokazuju vlasništvo funkcionalnosti.
- Pri promjeni paketa ili nadogradnji kada treba osigurati da se ne naplaćuju već otkupljene funkcionalnosti.
- Za praćenje vlasništva funkcionalnosti kroz različite pakete i add-one.
- Za optimizaciju troškova kroz izbjegavanje duplog plaćanja istih modula.
`,
      technicalDetails: `**Frontend**
- Stranica "Planovi" prikazuje matricu feature × paket s oznakom Owned za funkcionalnosti koje tvrtka već posjeduje.
- Checkout poziva \`GET /api/director/features/owned\` i označava featuree koji se ne naplaćuju.
- Dashboard prikazuje listu svih funkcionalnosti u vlasništvu tvrtke s datumom otključavanja.
- Pri odabiru novog paketa, sustav automatski prikazuje koje funkcionalnosti su već u vlasništvu i koje se dodatno naplaćuju.

**Backend**
- \`featureOwnershipService.determineDelta\` uspoređuje tražene feature s \`CompanyFeatureOwnership\` zapisima i izračunava doplatu.
- \`featureOwnershipService.grantFeature\` dodjeljuje novu funkcionalnost tvrtki nakon uspješnog plaćanja.
- \`featureOwnershipService.getOwnedFeatures\` vraća listu svih funkcionalnosti u vlasništvu tvrtke.
- Event \`feature.granted\` pokreće provisioning modula (chat, CRM, analytics) i obavještava korisnike.
- Event \`feature.ownership.checked\` informira ostale servise o provjeri vlasništva funkcionalnosti.

**Baza**
- \`CompanyFeatureOwnership\` tablica čuva vlasništvo funkcionalnosti (companyId, featureKey, grantedAt, grantedBy).
- \`FeatureCatalog\` tablica definira sve dostupne module (featureKey, name, description, category, price).
- \`FeatureOwnershipHistory\` tablica bilježi povijest dodjele funkcionalnosti (companyId, featureKey, action, occurredAt, actor).
- Vlasništvo funkcionalnosti se cacheira radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/director/features/owned\` – vraća listu svih funkcionalnosti u vlasništvu tvrtke.
- \`GET /api/director/features/available\` – vraća katalog svih dostupnih funkcionalnosti s owned statusom.
- \`POST /api/director/plans/quote\` – izračunava doplatu za novi paket uzimajući u obzir već otkupljene funkcionalnosti.
- \`POST /api/director/features/grant\` – dodjeljuje funkcionalnost tvrtki nakon uspješnog plaćanja (admin only).
- \`GET /api/admin/features/ownership-stats\` – vraća statistike o vlasništvu funkcionalnosti (admin only).
`
    },
    "Add-on paketi (regija, kategorija, krediti)": {
      implemented: true,
      summary: "Add-oni proširuju osnovni plan novim regijama, kategorijama ili kreditima uz lifecycle (active → low balance → expired), omogućavajući fleksibilno širenje poslovanja bez mijenjanja osnovnog paketa.",
      details: `**Kako funkcionira**
- Direktor može kupiti dodatne regije, kategorije, kredite ili promo boost bez mijenjanja osnovnog plana.
- Add-on prati status: ACTIVE → LOW_BALANCE (<20%) → EXPIRED/DEPLETED → GRACE_MODE (7 dana) → RENEWED.
- Podsjetnici stižu na 80/50/20% potrošnje; nakon isteka pristup se pauzira dok se addon ne obnovi.
- Add-oni se mogu aktivirati i deaktivirati neovisno o osnovnom paketu, omogućavajući fleksibilno upravljanje.
- Sustav automatski prati potrošnju add-ona i šalje upozorenja pri kritičnim razinama.
- Grace period od 7 dana omogućava korisnicima da obnove add-on prije potpunog isteka.

**Prednosti**
- Fleksibilno širenje poslovanja po geografiji ili djelatnosti bez potrebe za promjenom osnovnog paketa.
- Auto-renew osigurava kontinuitet, a Premium funkcionalnosti ostaju aktivne i kad add-on istekne.
- Poboljšava iskustvo korisnika omogućavajući im da prilagode paket svojim trenutnim potrebama.
- Transparentan sustav lifecycle-a i upozorenja gradi povjerenje između platforme i korisnika.
- Potiče korisnike da eksperimentiraju s novim regijama i kategorijama bez dugotrajnih obveza.

**Kada koristiti**
- Brzo otvaranje nove regije/kategorije ili povećanje lead budžeta.
- Promotivne kampanje s privremenim pojačanim dosegom.
- Za testiranje novih tržišta ili kategorija bez potrebe za promjenom osnovnog paketa.
- Za privremeno povećanje kapaciteta tijekom sezonskih promjena ili posebnih projekata.
- Za optimizaciju troškova kroz fleksibilno upravljanje add-onima prema trenutnim potrebama.
`,
      technicalDetails: `**Frontend**
- Add-on konfigurator s ROI previewem i status badgevima (ACTIVE, LOW_BALANCE, EXPIRED, GRACE_MODE).
- Reminder banner tri dana prije isteka.
- Dashboard prikazuje sve aktivne add-one s detaljima o potrošnji i statusu.
- Prikaz upozorenja na 80%, 50% i 20% potrošnje s preporukama za obnovu.
- Mogućnost aktivacije, deaktivacije i obnove add-ona direktno iz dashboarda.

**Backend**
- \`addon-service.js\` - Servis za upravljanje add-onima:
  - \`purchaseAddon\` - Kupnja novog add-ona
  - \`getAddons\` - Dohvat svih add-ona korisnika
  - \`getAddon\` - Dohvat jednog add-ona
  - \`renewAddon\` - Obnova add-ona
  - \`cancelAddon\` - Otkazivanje add-ona
  - \`checkAddonStatus\` - Provjera i ažuriranje statusa
  - \`updateAddonUsage\` - Ažuriranje potrošnje
- \`addon-lifecycle-service.js\` - Lifecycle management:
  - \`checkAddonLifecycles\` - Provjera statusa svih add-ona
  - \`processAutoRenewals\` - Automatska obnova add-ona s autoRenew=true
- Cron job u \`queueScheduler.js\` pokreće se svaki sat i provjerava lifecycle add-ona
- Automatske notifikacije na 80%, 50%, 20% potrošnje i 3 dana prije isteka

**Baza**
- \`AddonSubscription\` model čuva add-one (userId, type: REGION/CATEGORY/CREDITS, scope, status, validUntil, autoRenew, graceUntil).
- \`AddonUsage\` model prati potrošnju add-ona (addonId, consumed, remaining, percentageUsed, notifiedAt80/50/20/expiring).
- \`AddonEventLog\` model bilježi promjene statusa (addonId, eventType, oldStatus, newStatus, metadata JSONB).
- Enum \`AddonType\`: REGION, CATEGORY, CREDITS
- Enum \`AddonStatus\`: ACTIVE, LOW_BALANCE, EXPIRED, DEPLETED, GRACE_MODE, CANCELLED
- Migracija: \`20251118150000_add_addon_packages/migration.sql\`

**API**
- \`GET /api/director/addons\` – vraća aktivne/povijesne add-one s potrošnjom i statusom (query: ?status=ACTIVE&type=REGION).
- \`GET /api/director/addons/available\` – vraća listu dostupnih add-ona s cijenama i opcijama.
- \`GET /api/director/addons/:id\` – vraća detalje određenog add-ona s potrošnjom i statusom.
- \`POST /api/director/addons/purchase\` – kupnja novog add-ona (body: type, scope, displayName, categoryId?, creditsAmount?, price, validUntil, autoRenew?).
- \`POST /api/director/addons/:id/renew\` – ručna obnova add-ona (body: validUntil, autoRenew?).
- \`POST /api/director/addons/:id/cancel\` – otkazivanje add-ona (body: reason?).
- \`POST /api/director/addons/quote\` – izračunava doplatu za novi add-on uzimajući u obzir već otkupljene funkcionalnosti.
      `
    },
    "Automatska provjera postojećih funkcionalnosti": {
      implemented: true,
      summary: "Automatska provjera postojećih funkcionalnosti osigurava da se pri kupnji novog paketa ili add-ona automatski provjerava koje funkcionalnosti tvrtka već posjeduje, što omogućava izračun točne doplate bez duplog plaćanja.",
      details: `**Kako funkcionira**
- Pri kupnji novog paketa ili add-ona sustav automatski provjerava koje funkcionalnosti tvrtka već posjeduje kroz \`CompanyFeatureOwnership\` tablicu.
- Sustav uspoređuje tražene funkcionalnosti s već otkupljenima i izračunava samo doplatu za nove funkcionalnosti.
- Automatska provjera se izvršava u realnom vremenu pri checkout procesu, osiguravajući točan izračun cijene.
- Sustav prikazuje korisniku koje funkcionalnosti već posjeduje i koje se dodatno naplaćuju.
- Provjera uključuje sve tipove funkcionalnosti: regije, kategorije, kredite, CRM, Chat, Statistiku i druge module.

**Prednosti**
- Osigurava točan izračun doplate bez duplog plaćanja istih funkcionalnosti.
- Poboljšava iskustvo korisnika omogućavajući im da vide što već posjeduju prije kupnje.
- Automatska provjera štedi vrijeme i osigurava dosljednost u izračunu cijena.
- Transparentan sustav koji gradi povjerenje između platforme i korisnika.
- Potiče korisnike da nadograđuju pakete bez straha od duplog plaćanja.

**Kada koristiti**
- Pri kupnji novog paketa kada treba provjeriti koje funkcionalnosti tvrtka već posjeduje.
- Pri dodavanju add-ona kada treba izračunati doplatu za nove funkcionalnosti.
- Pri checkout procesu kada treba osigurati točan izračun cijene.
- Za praćenje vlasništva funkcionalnosti kroz različite pakete i add-one.
- Za optimizaciju troškova kroz izbjegavanje duplog plaćanja istih modula.
`,
      technicalDetails: `**Frontend**
- Checkout proces automatski poziva \`GET /api/director/features/owned\` prije prikazivanja cijene.
- Dashboard prikazuje listu svih funkcionalnosti u vlasništvu tvrtke s datumom otključavanja.
- Pri odabiru novog paketa, sustav automatski prikazuje koje funkcionalnosti su već u vlasništvu i koje se dodatno naplaćuju.
- Matrica feature × paket prikazuje oznaku "Owned" za funkcionalnosti koje tvrtka već posjeduje.

**Backend**
- \`featureOwnershipService.checkOwnership\` provjerava vlasništvo funkcionalnosti za određenu tvrtku.
- \`featureOwnershipService.determineDelta\` uspoređuje tražene funkcionalnosti s već otkupljenima i izračunava doplatu.
- \`featureOwnershipService.getOwnedFeatures\` vraća listu svih funkcionalnosti u vlasništvu tvrtke.
- Automatska provjera se izvršava prije svake kupnje paketa ili add-ona kako bi se osigurao točan izračun.
- Event \`feature.ownership.checked\` informira ostale servise o provjeri vlasništva funkcionalnosti.

**Baza**
- \`CompanyFeatureOwnership\` tablica čuva vlasništvo funkcionalnosti (companyId, featureKey, grantedAt, grantedBy).
- \`FeatureCatalog\` tablica definira sve dostupne module (featureKey, name, description, category, price).
- \`FeatureOwnershipHistory\` tablica bilježi povijest dodjele funkcionalnosti (companyId, featureKey, action, occurredAt, actor).
- Vlasništvo funkcionalnosti se cacheira radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/director/features/owned\` – vraća listu svih funkcionalnosti u vlasništvu tvrtke.
- \`GET /api/director/features/check\` – provjerava vlasništvo određenih funkcionalnosti (zahtijeva featureKeys array).
- \`POST /api/director/plans/quote\` – izračunava doplatu za novi paket uzimajući u obzir već otkupljene funkcionalnosti.
- \`GET /api/director/features/available\` – vraća katalog svih dostupnih funkcionalnosti s owned statusom.
- \`POST /api/director/addons/quote\` – izračunava doplatu za novi add-on uzimajući u obzir već otkupljene funkcionalnosti.
`
    },
    "TRIAL = maksimalni paket funkcionalnosti": {
      implemented: true,
      summary: "Trial od 14 dana aktivira sve Premium module (8 leadova, 2 kategorije, 1 regija) kako bi partner vidio punu vrijednost.",
      details: `**Kako funkcionira**
- Nakon registracije automatski se aktivira trial s limitima: 14 dana, 8 leadova (srednja vrijednost između 5-10), 2 kategorije, 1 regija.
- Automatski se kreiraju add-on subscriptions za 2 aktivne kategorije i 1 regiju (Zagreb).
- TRIAL ima sve Premium funkcionalnosti: AI_PRIORITY, SMS_NOTIFICATIONS, PRIORITY_SUPPORT, CSV_EXPORT, ADVANCED_ANALYTICS.
- Po isteku trial se označava kao EXPIRED, korisnik mora platiti da nastavi.

**Prednosti**
- Partner dobiva puni pregled mogućnosti bez troška.
- Sve Premium features su dostupne tijekom trial perioda.
- Automatski add-oni omogućavaju testiranje kategorija i regija.

**Kada koristiti**
- Automatski onboarding novih partnera pri registraciji.
- Aktivira se u \`subscriptions.js\` i \`credit-service.js\` kada se kreira nova subscription.
`,
      technicalDetails: `**Backend Implementacija**
- \`routes/subscriptions.js\`: Kreira TRIAL subscription s 14 dana, 8 leadova, automatski kreira add-on subscriptions za 2 kategorije i 1 regiju.
- \`services/credit-service.js\`: Kreira TRIAL subscription s 14 dana i 8 leadova.
- \`lib/subscription-auth.js\`: TRIAL ima sve Premium features - \`hasFeatureAccess\` vraća true za sve Premium features, \`requirePlan\` tretira TRIAL kao PREMIUM za feature access.

**Baza**
- \`Subscription\` model: plan='TRIAL', creditsBalance=8, expiresAt=14 dana.
- \`AddonSubscription\` model: automatski se kreiraju 2 CATEGORY add-oni i 1 REGION add-on s status='ACTIVE', price=0 (besplatno).
- \`AddonUsage\` i \`AddonEventLog\` se kreiraju za svaki add-on.

**Features**
- TRIAL ima pristup svim Premium features: AI_PRIORITY, SMS_NOTIFICATIONS, PRIORITY_SUPPORT, CSV_EXPORT, ADVANCED_ANALYTICS.
- TRIAL nema PRO-only features: VIP_SUPPORT, PREMIUM_QUALITY_LEADS, FEATURED_PROFILE.

**API**
- \`GET /api/subscriptions/me\` – vraća TRIAL subscription s add-onima.
- Automatski se kreira pri prvom pristupu \`/api/subscriptions/me\` endpointu.
`
    },
    "Simultana objava ocjena (reciprocal delay)": {
      implemented: true,
      summary: "Ocjene se objavljuju kad obje strane ocijene ili istekne rok, čime se sprječava osvetničko ocjenjivanje.",
      details: `**Kako funkcionira**
- Nakon završetka posla obje strane daju ocjenu; obje ocjene ostaju skrivene dok i druga strana ne ocijeni.
- Ako jedna strana ne ocijeni u roku (10 dana), pristigla ocjena se objavljuje po isteku roka.
- Review se automatski objavljuje ako postoji recipročni review (druga strana je već ocijenila).
- Rok za ocjenjivanje je 10 dana od završetka posla (deadline) ili od trenutka kreiranja review-a.

**Prednosti**
- Potiče objektivnost i sprječava odmazdu.
- Održava povjerenje u reputacijski sustav.
- Sprječava osvetničko ocjenjivanje jer ocjene nisu vidljive dok obje strane ne ocijene.

**Kada koristiti**
- Nakon svake završene transakcije.
- Kod sporova ili žalbi koje zahtijevaju provjeru vremena objave ocjena.
`,
      technicalDetails: `**Backend Implementacija**
- \`routes/reviews.js\`: POST endpoint provjerava recipročni review i objavljuje oba ako postoje.
- \`services/review-publish-service.js\`: Cron job provjerava istekle review-e i automatski ih objavljuje.
- \`lib/queueScheduler.js\`: Pokreće \`publishExpiredReviews()\` svaki sat.

**Baza**
- \`Review\` model polja: \`isPublished\` (Boolean, default: false), \`publishedAt\` (DateTime?), \`reviewDeadline\` (DateTime?).
- Indexi: \`@@index([isPublished])\`, \`@@index([reviewDeadline])\`.

**Logika**
- Kada se kreira review, provjerava se da li postoji recipročni review (druga strana).
- Ako postoji, oba review-a se objavljuju odmah (\`isPublished = true\`, \`publishedAt = now\`).
- Ako ne postoji, review se ne objavljuje (\`isPublished = false\`) i postavlja se \`reviewDeadline\` na 10 dana.
- Cron job provjerava review-e gdje je \`isPublished = false\` i \`reviewDeadline <= now\`, te ih automatski objavljuje.

**API**
- \`POST /api/reviews\` – kreiranje ocjene (automatski provjerava recipročni review).
- \`GET /api/reviews/user/:userId\` – vraća samo objavljene review-e (osim ako je admin ili vlasnik).
- Aggregate logika koristi samo objavljene review-e (\`isPublished = true\`).

**Cron Job**
- Pokreće se svaki sat u 0 minuta.
- Provjerava i objavljuje review-e čiji je rok istekao.
- Ažurira provider profile aggregate samo za objavljene review-e.
`
    },
    "Odgovor na recenziju (1x dozvoljen)": {
      implemented: true,
      summary: "Korisnik koji je dobio recenziju može odgovoriti na nju, ali samo jednom. Odgovor je vidljiv javno uz originalnu recenziju.",
      details: `**Kako funkcionira**
- Korisnik koji je dobio recenziju (toUserId) može odgovoriti na objavljenu recenziju.
- Odgovor je dozvoljen samo jednom po recenziji (hasReplied flag sprječava višestruke odgovore).
- Odgovor se može poslati samo na objavljene recenzije (isPublished = true).
- Odgovor je vidljiv javno uz originalnu recenziju.

**Prednosti**
- Omogućava konstruktivnu komunikaciju između strana.
- Sprječava spam i višestruke odgovore.
- Poboljšava transparentnost i povjerenje u sustav.

**Kada koristiti**
- Kada korisnik želi odgovoriti na recenziju koja je dobivena.
- Za objasniti situaciju ili zahvaliti se na pozitivnoj recenziji.
`,
      technicalDetails: `**Backend Implementacija**
- \`routes/reviews.js\`: POST /api/reviews/:id/reply endpoint za dodavanje odgovora.
- Provjera autorizacije: samo toUserId (korisnik koji je dobio recenziju) može odgovoriti.
- Provjera hasReplied: sprječava višestruke odgovore.
- Provjera isPublished: odgovor se može poslati samo na objavljene recenzije.

**Baza**
- \`Review\` model polja: \`replyText\` (String?), \`repliedAt\` (DateTime?), \`hasReplied\` (Boolean, default: false).

**Logika**
- Kada se kreira odgovor, provjerava se da li je korisnik toUserId (autorizacija).
- Provjerava se da li je review objavljen (isPublished = true).
- Provjerava se da li je već odgovoreno (hasReplied = false).
- Ako sve provjere prođu, ažurira se review s replyText, repliedAt i hasReplied = true.

**API**
- \`POST /api/reviews/:id/reply\` – dodavanje odgovora na recenziju (body: { replyText: string }).
- \`GET /api/reviews/user/:userId\` – vraća review-e s odgovorima (replyText, repliedAt, hasReplied).
- \`GET /api/reviews/:id\` – vraća pojedinačni review s odgovorom ako postoji.

**Validacija**
- replyText ne može biti prazan.
- Samo toUserId može odgovoriti.
- Odgovor je dozvoljen samo jednom (hasReplied provjera).
- Odgovor se može poslati samo na objavljene recenzije.
`
    },
    "Moderacija ocjena (AI + ljudska)": {
      implemented: true,
      summary: "Automatska AI provjera sadržaja recenzija i ljudska moderacija kroz admin panel. Sprječava spam, neprikladan sadržaj i osigurava kvalitetu recenzija.",
      details: `**Kako funkcionira**
- AI automatski provjerava svaku recenziju pri kreiranju (provjera spam-a, zabranjenih riječi, linkova, email-ova, telefona).
- Recenzije se kategoriziraju u tri kategorije: APPROVED (automatski odobreno), PENDING (zahtijeva ljudsku moderaciju), REJECTED (automatski odbijeno).
- Admin može pregledati recenzije koje čekaju moderaciju i odobriti/odbijati ih.
- Samo odobrene recenzije (moderationStatus = 'APPROVED') se prikazuju javno i utječu na aggregate rating.

**Prednosti**
- Sprječava spam i neprikladan sadržaj.
- Osigurava kvalitetu recenzija na platformi.
- Omogućava brzu automatsku provjeru većine recenzija.
- Ljudska moderacija za slučajeve gdje AI nije siguran.

**Kada koristiti**
- Automatski pri kreiranju svake recenzije.
- Admin panel za pregled i moderaciju recenzija koje čekaju provjeru.
- Za sprječavanje spam-a i neprikladnog sadržaja.
`,
      technicalDetails: `**Backend Implementacija**
- \`services/review-moderation-service.js\`: AI automatska provjera sadržaja (\`autoModerateReview\`).
- \`routes/reviews.js\`: Integracija AI moderacije u POST /api/reviews endpoint.
- \`routes/reviews.js\`: Admin endpoint-i za ljudsku moderaciju (GET /api/reviews/pending, POST /api/reviews/:id/approve, POST /api/reviews/:id/reject).

**AI Provjera (OpenAI Moderation API)**
- **Pravi AI**: Koristi OpenAI Moderation API za provjeru sadržaja (hate, harassment, self-harm, sexual, violence, itd.).
- **Kategorije koje automatski odbijaju**: hate, hate/threatening, self-harm, sexual/minors, violence/graphic.
- **Kategorije koje zahtijevaju ljudsku provjeru**: harassment, harassment/threatening, violence.
- **Fallback provjere** (ako OpenAI nije dostupan):
  - Provjera zabranjenih riječi (uvredljive riječi, spam fraze).
  - Detekcija linkova, email-ova, telefona (potencijalni spam).
  - Provjera ekstremnih ocjena s kratkim komentarima (potencijalni spam).
  - Provjera dupliciranih riječi (potencijalni spam).
  - Provjera minimalne/maksimalne duljine komentara.
- **Confidence score** (0-1): >= 0.7 = APPROVED, 0.5-0.7 = PENDING, < 0.5 = REJECTED.
- **Environment varijabla**: \`OPENAI_API_KEY\` (opcionalno, ako nije postavljena, koristi se fallback).

**Baza**
- \`Review\` model polja: \`moderationStatus\` (PENDING, APPROVED, REJECTED), \`moderationReviewedBy\`, \`moderationReviewedAt\`, \`moderationRejectionReason\`, \`moderationNotes\`.
- Index: \`@@index([moderationStatus])\`.

**Logika**
- Pri kreiranju review-a, AI automatski provjerava sadržaj.
- Ako je confidence >= 0.7, review se automatski odobrava (APPROVED).
- Ako je confidence 0.5-0.7, review se stavlja na čekanje (PENDING) za ljudsku moderaciju.
- Ako je confidence < 0.5, review se automatski odbija (REJECTED).
- Samo odobrene recenzije (APPROVED) se prikazuju javno i utječu na aggregate rating.

**API**
- \`POST /api/reviews\` – automatska AI moderacija pri kreiranju (poziva \`autoModerateReview\`).
- \`GET /api/reviews/pending\` – lista recenzija koje čekaju moderaciju (admin, paginacija).
- \`POST /api/reviews/:id/approve\` – odobri recenziju (admin, body: { notes?: string }).
- \`POST /api/reviews/:id/reject\` – odbij recenziju (admin, body: { rejectionReason: string, notes?: string }).
- \`GET /api/reviews/user/:userId\` – vraća samo odobrene recenzije (moderationStatus = 'APPROVED').

**Notifikacije**
- Korisnik dobiva notifikaciju ako je recenzija stavljena na čekanje (PENDING).
- Korisnik dobiva notifikaciju ako je recenzija automatski odbijena (REJECTED).
- Korisnik dobiva notifikaciju ako admin odbije recenziju.

**Aggregate Rating**
- Samo odobrene recenzije (moderationStatus = 'APPROVED') utječu na provider profile ratingAvg i ratingCount.
- Kada se recenzija odobri ili odbije, aggregate se automatski ažurira.
- Ako recenzija nije odobrena, ne utječe na provider profile rating.
`
    },
    "Prijava lažnih ocjena": {
      implemented: true,
      summary: "Korisnici mogu prijaviti lažne ocjene koje su dobili. Admin pregledava prijave i može prihvatiti (ukloniti recenziju) ili odbiti (ostaviti recenziju).",
      details: `**Kako funkcionira**
- Korisnik koji je dobio recenziju (toUserId) može prijaviti recenziju kao lažnu s razlogom.
- Prijava se automatski šalje adminima na pregled.
- Admin može prihvatiti prijavu (recenzija se uklanja i označava kao lažna) ili odbiti prijavu (recenzija ostaje objavljena).
- Ako je prijava prihvaćena, recenzija se automatski odbija (moderationStatus = REJECTED) i skriva (isPublished = false).
- Aggregate rating se automatski ažurira kada se recenzija ukloni.

**Prednosti**
- Omogućava korisnicima da se zaštite od lažnih ocjena.
- Sprječava osvetničko ocjenjivanje i lažne recenzije.
- Poboljšava kvalitetu i pouzdanost sustava ocjenjivanja.

**Kada koristiti**
- Kada korisnik dobije ocjenu koja je očito lažna ili osvetnička.
- Kada ocjena ne odgovara stvarnom iskustvu s poslom.
- Za održavanje kvalitete i integriteta sustava ocjenjivanja.
`,
      technicalDetails: `**Backend Implementacija**
- \`routes/reviews.js\`: POST /api/reviews/:id/report endpoint za prijavu lažne ocjene.
- \`routes/reviews.js\`: GET /api/reviews/reports endpoint za admin pregled prijava.
- \`routes/reviews.js\`: POST /api/reviews/:id/report/resolve endpoint za rješavanje prijave (admin).

**Baza**
- \`Review\` model polja: \`isReported\` (Boolean), \`reportedBy\` (String?), \`reportedAt\` (DateTime?), \`reportReason\` (String?), \`reportStatus\` (ReportStatus?), \`reportReviewedBy\` (String?), \`reportReviewedAt\` (DateTime?), \`reportReviewNotes\` (String?).
- \`ReportStatus\` enum: PENDING, REVIEWED, DISMISSED, ACCEPTED.
- Indexi: \`@@index([isReported])\`, \`@@index([reportStatus])\`.

**Logika**
- Kada se kreira prijava, provjerava se da li je korisnik toUserId (autorizacija).
- Provjerava se da li je već prijavljena (sprječava duplikate).
- Ako je prijava prihvaćena, recenzija se automatski odbija i skriva.
- Ako je prijava odbijena, recenzija ostaje objavljena.
- Aggregate rating se automatski ažurira kada se recenzija ukloni.

**API**
- \`POST /api/reviews/:id/report\` – prijava lažne ocjene (body: { reason: string }).
- \`GET /api/reviews/reports\` – lista prijava lažnih ocjena (admin, query: status?, page?, limit?).
- \`POST /api/reviews/:id/report/resolve\` – rješavanje prijave (admin, body: { action: 'dismiss' | 'accept', notes?: string }).

**Notifikacije**
- Admini dobivaju notifikaciju kada se prijavi nova lažna ocjena.
- Korisnik koji je dao recenziju dobiva notifikaciju ako je prijava prihvaćena (recenzija uklonjena).
- Korisnik koji je prijavio dobiva notifikaciju ako je prijava odbijena (recenzija ostaje objavljena).
`,
      technicalDetails: `**Backend Implementacija**
- \`lib/subscription-reminder.js\`: \`sendTrialExpiredEmail()\` funkcija za slanje email-a s popust linkom.
- \`lib/subscription-reminder.js\`: \`checkExpiredTrials()\` funkcija za provjeru isteklih TRIAL pretplata.
- \`routes/subscriptions.js\`: \`checkAndDowngradeExpiredSubscriptions()\` poziva \`checkExpiredTrials()\` prije downgrade-a.
- \`lib/queueScheduler.js\`: Cron job svaki sat poziva \`checkAndDowngradeExpiredSubscriptions()\`.
- \`routes/payments.js\`: Provjera EXPIRED TRIAL pretplata (u zadnja 7 dana) za automatski popust pri checkout-u.

**Email Template**
- HTML email s detaljnim informacijama o isteku TRIAL-a.
- Popust link: \`${process.env.FRONTEND_URL}/#subscription?trial_expired=true&user_id={userId}\`.
- Prikazuje 20% popust na PREMIUM (89€ → 71.20€) i PRO (149€ → 119.20€) planove.
- Uključuje in-app notifikaciju za korisnika.

**Cron Job**
- Provjera se izvršava svaki sat (0 * * * *) kroz \`checkAndDowngradeExpiredSubscriptions()\`.
- Pronalazi TRIAL pretplate koje su istekle danas (u zadnja 24h).
- Sprječava duplikate provjerom notifikacija u zadnja 24h.

**Frontend Podrška**
- \`pages/SubscriptionPlans.jsx\`: Provjera \`trial_expired\` query parametra u URL-u.
- Automatski prikazuje toast poruku s informacijom o popustu.
- Backend automatski primjenjuje 20% popust za EXPIRED TRIAL pretplate (u zadnja 7 dana).

**Popust Logika**
- 20% popust za upgrade iz TRIAL-a (ACTIVE ili EXPIRED u zadnja 7 dana).
- Prioritet: TRIAL upgrade popust ima prednost nad new user popustom.
- Popust se automatski primjenjuje pri checkout-u ako je korisnik na EXPIRED TRIAL planu.

**API**
- Automatski poziv kroz cron job (nema direktnog API endpointa).
- Email se šalje putem SMTP (nodemailer).
- In-app notifikacija se kreira u bazi (\`Notification\` model).

**Validacija**
- reason ne može biti prazan.
- Samo toUserId može prijaviti recenziju.
- Prijava je dozvoljena samo jednom po recenziji (sprječava duplikate).
- Admin može prihvatiti (accept) ili odbiti (dismiss) prijavu.
`
    },
    "Automatski email + popust link pri isteku TRIAL-a": {
      implemented: true,
      summary: "Automatski email s popust linkom se šalje korisnicima čiji je TRIAL period istekao. Email uključuje 20% popust na prvu pretplatu.",
      details: `**Kako funkcionira**
- Cron job provjerava svaki sat TRIAL pretplate koje su istekle danas (u zadnja 24h).
- Korisnik dobiva HTML email s detaljnim informacijama o isteku TRIAL-a.
- Email uključuje popust link koji automatski primjenjuje 20% popust pri checkout-u.
- Popust link: \`/#subscription?trial_expired=true&user_id={userId}\`.
- Frontend automatski detektira \`trial_expired\` parametar i prikazuje toast poruku.
- Backend automatski primjenjuje 20% popust za EXPIRED TRIAL pretplate (u zadnja 7 dana).

**Prednosti**
- Povećava konverziju isteklih TRIAL korisnika u plaćene pretplate.
- Olakšava upgrade proces s automatskim popustom.
- Poboljšava korisničko iskustvo s jasnom komunikacijom o isteku.

**Kada koristiti**
- Automatski se izvršava svaki sat kroz cron job.
- Email se šalje samo jednom po korisniku (sprječava duplikate).
- Popust vrijedi 7 dana nakon isteka TRIAL-a.
`,
      technicalDetails: `**Backend Implementacija**
- \`lib/subscription-reminder.js\`: \`sendTrialExpiredEmail()\` funkcija za slanje email-a s popust linkom.
- \`lib/subscription-reminder.js\`: \`checkExpiredTrials()\` funkcija za provjeru isteklih TRIAL pretplata.
- \`routes/subscriptions.js\`: \`checkAndDowngradeExpiredSubscriptions()\` poziva \`checkExpiredTrials()\` prije downgrade-a.
- \`lib/queueScheduler.js\`: Cron job svaki sat poziva \`checkAndDowngradeExpiredSubscriptions()\`.
- \`routes/payments.js\`: Provjera EXPIRED TRIAL pretplata (u zadnja 7 dana) za automatski popust pri checkout-u.

**Email Template**
- HTML email s detaljnim informacijama o isteku TRIAL-a.
- Popust link: \`${process.env.FRONTEND_URL}/#subscription?trial_expired=true&user_id={userId}\`.
- Prikazuje 20% popust na PREMIUM (89€ → 71.20€) i PRO (149€ → 119.20€) planove.
- Uključuje in-app notifikaciju za korisnika.

**Cron Job**
- Provjera se izvršava svaki sat (0 * * * *) kroz \`checkAndDowngradeExpiredSubscriptions()\`.
- Pronalazi TRIAL pretplate koje su istekle danas (u zadnja 24h).
- Sprječava duplikate provjerom notifikacija u zadnja 24h.

**Frontend Podrška**
- \`pages/SubscriptionPlans.jsx\`: Provjera \`trial_expired\` query parametra u URL-u.
- Automatski prikazuje toast poruku s informacijom o popustu.
- Backend automatski primjenjuje 20% popust za EXPIRED TRIAL pretplate (u zadnja 7 dana).

**Popust Logika**
- 20% popust za upgrade iz TRIAL-a (ACTIVE ili EXPIRED u zadnja 7 dana).
- Prioritet: TRIAL upgrade popust ima prednost nad new user popustom.
- Popust se automatski primjenjuje pri checkout-u ako je korisnik na EXPIRED TRIAL planu.

**API**
- Automatski poziv kroz cron job (nema direktnog API endpointa).
- Email se šalje putem SMTP (nodemailer).
- In-app notifikacija se kreira u bazi (\`Notification\` model).
`
    },
    "Podsjetnici za neaktivnost (>14 dana)": {
      implemented: true,
      summary: "Automatski email podsjetnici se šalju korisnicima koji nisu bili aktivni više od 14 dana. Email uključuje poziv na povratak i link na dashboard.",
      details: `**Kako funkcionira**
- Cron job provjerava svaki dan u 8:00 korisnike koji nisu bili aktivni >14 dana.
- Provjerava se kombinacija aktivnosti: login, lead purchase, chat poruke, ponude, i updatedAt iz User modela.
- Korisnik dobiva HTML email s pozivom na povratak i linkom na dashboard.
- Email se šalje samo jednom po korisniku (sprječava duplikate - provjera u zadnja 7 dana).
- Uključuje in-app notifikaciju za korisnika.

**Prednosti**
- Povećava re-engagement neaktivnih korisnika.
- Poboljšava retention rate.
- Pomaže korisnicima da se vrate na platformu i pronađu nove prilike.

**Kada koristiti**
- Automatski se izvršava svaki dan u 8:00 kroz cron job.
- Email se šalje samo providere (role: PROVIDER).
- Ne uključuje nove korisnike (registrirane u zadnja 14 dana).
`,
      technicalDetails: `**Backend Implementacija**
- \`lib/subscription-reminder.js\`: \`sendInactivityReminderEmail()\` funkcija za slanje email-a.
- \`lib/subscription-reminder.js\`: \`checkInactiveUsers()\` funkcija za provjeru neaktivnih korisnika.
- \`lib/queueScheduler.js\`: Cron job svaki dan u 8:00 poziva \`checkInactiveUsers()\`.

**Email Template**
- HTML email s detaljnim informacijama o neaktivnosti.
- Link na dashboard: \`${process.env.FRONTEND_URL}/#dashboard\`.
- Uključuje popis mogućnosti na platformi (leadovi, chat, ROI statistika, itd.).
- Uključuje in-app notifikaciju za korisnika.

**Cron Job**
- Provjera se izvršava svaki dan u 8:00 (0 8 * * *).
- Pronalazi providere koji nisu bili aktivni >14 dana.
- Sprječava duplikate provjerom notifikacija u zadnja 7 dana.

**Provjera Aktivnosti**
- Kombinacija različitih izvora aktivnosti:
  - \`User.updatedAt\` - zadnje ažuriranje korisnika
  - \`TrialEngagement.lastActivityAt\` - zadnja aktivnost za TRIAL korisnike
  - \`TrialEngagement.lastLoginAt\` - zadnji login za TRIAL korisnike
  - \`LeadPurchase.createdAt\` - zadnja kupovina leada
  - \`ChatMessage.createdAt\` - zadnja chat poruka
  - \`Offer.createdAt\` - zadnja ponuda
- Koristi se najnovija aktivnost iz svih izvora.

**Filtri**
- Samo providere (role: PROVIDER).
- Ne uključuje nove korisnike (registrirane u zadnja 14 dana).
- Ne uključuje korisnike koji su dobili podsjetnik u zadnja 7 dana.

**API**
- Automatski poziv kroz cron job (nema direktnog API endpointa).
- Email se šalje putem SMTP (nodemailer).
- In-app notifikacija se kreira u bazi (\`Notification\` model).
`
    },
    "Edukacijski materijali i vodiči": {
      implemented: true,
      summary: "Edukacijski materijali i vodiči pomažu korisnicima da nauče kako koristiti Uslugar platformu. Uključuje vodiče za kupovinu leadova, slanje ponuda, komunikaciju s klijentima i optimizaciju profila.",
      details: `**Kako funkcionira**
- Korisnici mogu pristupiti edukacijskim materijalima kroz API endpoint \`/api/documentation/guides\`.
- Vodiči su organizirani u kategoriju "Edukacijski materijali i vodiči" u DocumentationCategory modelu.
- Svaki vodič sadrži naslov, sažetak, detaljni sadržaj i redoslijed prikaza.
- Vodiči se prikazuju na frontendu u posebnoj sekciji ili stranici.

**Prednosti**
- Pomaže novim korisnicima da brzo nauče kako koristiti platformu.
- Smanjuje broj pitanja za podršku.
- Poboljšava korisničko iskustvo s jasnim uputama.
- Povećava engagement i konverziju.

**Kada koristiti**
- Novi korisnici prilikom registracije.
- Korisnici koji imaju pitanja o funkcionalnostima.
- Kroz onboarding proces.
- Kao referenca za napredne korisnike.
`,
      technicalDetails: `**Backend Implementacija**
- \`routes/documentation.js\`: GET /api/documentation/guides endpoint za dohvat svih vodiča.
- \`routes/documentation.js\`: GET /api/documentation/guides/:id endpoint za dohvat pojedinačnog vodiča.
- Koristi postojeći \`DocumentationCategory\` i \`DocumentationFeature\` model.

**Baza**
- \`DocumentationCategory\` model: kategorija "Edukacijski materijali i vodiči".
- \`DocumentationFeature\` model: svaki vodič je feature u toj kategoriji.
- Polja: \`name\` (naslov vodiča), \`summary\` (sažetak), \`details\` (detaljni sadržaj), \`order\` (redoslijed).

**API**
- \`GET /api/documentation/guides\` – lista svih edukacijskih vodiča.
- \`GET /api/documentation/guides/:id\` – pojedinačni vodič po ID-u.

**Frontend**
- Frontend može prikazati vodiče na posebnoj stranici ili sekciji.
- Vodiči se mogu prikazati kao expandable kartice ili kao lista s linkovima.
- Mogu se filtrirati po kategorijama ili pretraživati.

**Primjeri Vodiča**
- "Kako kupiti prvi lead" – vodič kroz proces kupovine leada.
- "Kako napraviti profesionalnu ponudu" – savjeti za kreiranje uspješnih ponuda.
- "Kako optimizirati profil" – kako privući više klijenata.
- "Kako komunicirati s klijentima" – best practices za chat komunikaciju.
- "Kako pratiti ROI" – kako koristiti ROI dashboard.
- "Kako koristiti TRIAL period" – vodič za TRIAL korisnike.
`
    },
    "Kako kupiti prvi lead": {
      implemented: true,
      summary: "Vodič kroz proces kupovine prvog leada na Uslugar platformi. Objašnjava kako pronaći kvalitetne leadove, procijeniti AI score i kupiti lead.",
      details: `**Kako funkcionira**
- Pregledajte dostupne leadove u vašoj kategoriji i regiji.
- Provjerite AI quality score (0-100) - viši score = kvalitetniji lead.
- Pročitajte detalje posla (budžet, lokacija, opis).
- Kupite lead klikom na "Kupiti Lead" gumb.
- Kontaktirajte klijenta putem chat-a unutar 48h.

**Prednosti**
- Ekskluzivni leadovi (1:1, bez konkurencije).
- Refund garancija ako klijent ne odgovori.
- AI scoring pomaže odabrati kvalitetne leadove.
- ROI tracking prati profitabilnost.

**Kada koristiti**
- Prilikom prve kupovine leada.
- Kada želite naučiti kako funkcionira proces.
- Kada trebate podsjetnik na korake.
`
    },
    "Kako napraviti profesionalnu ponudu": {
      implemented: true,
      summary: "Savjeti za kreiranje uspješnih ponuda koje privlače klijente. Uključuje strukturu ponude, cijene, rokovi i komunikaciju.",
      details: `**Kako funkcionira**
- Detaljno opišite što ćete napraviti.
- Postavite realnu cijenu koja odgovara tržištu.
- Navedite rok izvršenja posla.
- Uključite relevantne informacije o iskustvu.
- Budite profesionalni i odgovorni.

**Prednosti**
- Povećava šanse da klijent prihvati ponudu.
- Gradi povjerenje s klijentima.
- Poboljšava reputaciju na platformi.
- Vodi do više konverzija.

**Kada koristiti**
- Prilikom slanja ponude za posao.
- Kada želite poboljšati stopu prihvaćanja ponuda.
- Kada trebate savjete za profesionalnu komunikaciju.
`
    },
    "Kako optimizirati profil": {
      implemented: true,
      summary: "Vodič za optimizaciju provider profila kako bi privukli više klijenata. Uključuje bio, portfolio, kategorije, regije i verifikacije.",
      details: `**Kako funkcionira**
- Dodajte detaljan bio s iskustvom i kvalifikacijama.
- Uključite portfolio slika prethodnih radova.
- Odaberite relevantne kategorije i regije.
- Verificirajte OIB i IBAN za "Verified Partner" oznaku.
- Ažurirajte dostupnost i kontakt informacije.

**Prednosti**
- Privlači više klijenata.
- Povećava povjerenje klijenata.
- Poboljšava pozicioniranje u pretraživanju.
- Vodi do više leadova i konverzija.

**Kada koristiti**
- Prilikom registracije.
- Kada želite poboljšati vidljivost profila.
- Kada trebate savjete za profesionalni profil.
`
    },
    "Kako komunicirati s klijentima": {
      implemented: true,
      summary: "Best practices za chat komunikaciju s klijentima. Uključuje profesionalnu komunikaciju, odgovaranje na pitanja i upravljanje očekivanjima.",
      details: `**Kako funkcionira**
- Odgovarajte brzo (unutar 24h).
- Budite profesionalni i ljubazni.
- Jasno komunicirajte o cijenama i rokovima.
- Postavljajte realna očekivanja.
- Pratite komunikaciju kroz chat sustav.

**Prednosti**
- Gradi povjerenje s klijentima.
- Povećava šanse za prihvaćanje ponude.
- Poboljšava korisničko iskustvo.
- Vodi do više pozitivnih recenzija.

**Kada koristiti**
- Prilikom prve komunikacije s klijentom.
- Kada trebate savjete za profesionalnu komunikaciju.
- Kada želite poboljšati stopu konverzije.
`
    },
    "Kako pratiti ROI": {
      implemented: true,
      summary: "Vodič za korištenje ROI dashboarda. Objašnjava kako pratiti profitabilnost, analizirati statistike i optimizirati performanse.",
      details: `**Kako funkcionira**
- Otvorite ROI dashboard u profilu.
- Pregledajte statistike (leadovi kupljeni, konverzije, prihodi).
- Analizirajte trendove kroz različite periode.
- Filtrirajte po kategorijama i regijama.
- Exportujte podatke u CSV za detaljnu analizu.

**Prednosti**
- Pomaže razumjeti profitabilnost.
- Identificira najbolje performirajuće kategorije.
- Optimizira strategiju kupovine leadova.
- Poboljšava poslovne odluke.

**Kada koristiti**
- Redovito za praćenje performansi.
- Kada želite optimizirati strategiju.
- Kada trebate analizirati trendove.
`
    },
    "Kako koristiti TRIAL period": {
      implemented: true,
      summary: "Vodič za TRIAL korisnike. Objašnjava što dobivate s TRIAL-om, kako koristiti kredite i kako nadograditi na plaćenu pretplatu.",
      details: `**Kako funkcionira**
- TRIAL traje 14 dana i uključuje 8 besplatnih leadova.
- Dobivate sve Premium funkcionalnosti (AI prioritet, SMS notifikacije, CSV export).
- Automatski dobivate 2 kategorije i 1 regiju (add-on paketi).
- Nakon isteka, možete nadograditi na PREMIUM ili PRO s 20% popustom.

**Prednosti**
- Besplatno isprobavanje platforme.
- Pristup svim Premium funkcionalnostima.
- Ekskluzivni leadovi (1:1, bez konkurencije).
- 20% popust na upgrade.

**Kada koristiti**
- Prilikom registracije kao novi provider.
- Kada želite isprobati platformu prije plaćanja.
- Kada trebate razumjeti TRIAL benefite.
`
    },
    "Vodič za refund proces": {
      implemented: true,
      summary: "Objašnjava kako zatražiti refund za neaktivne leadove. Uključuje uvjete za refund, proces traženja i automatski refund.",
      details: `**Kako funkcionira**
- Ako klijent ne odgovori unutar 48h, možete zatražiti refund.
- Automatski refund se aktivira ako niste kontaktirali klijenta unutar 48h.
- Refund vraća kredite na vaš račun.
- Možete ponovno koristiti kredite za druge leadove.

**Prednosti**
- Zaštita od neaktivnih klijenata.
- Povrat kredita za neuspješne leadove.
- Smanjuje rizik za providere.
- Poboljšava ROI.

**Kada koristiti**
- Kada klijent ne odgovori unutar 48h.
- Kada lead nije kvalitetan.
- Kada trebate razumjeti refund proces.
`
    },
    "Best practices za konverziju leadova": {
      implemented: true,
      summary: "Savjeti za povećanje stope konverzije leadova u uspješne poslove. Uključuje strategije za komunikaciju, ponude i follow-up.",
      details: `**Kako funkcionira**
- Odgovarajte brzo na leadove (unutar 24h).
- Kreirajte profesionalne i detaljne ponude.
- Komunicirajte jasno o cijenama i rokovima.
- Pratite up komunikaciju s klijentima.
- Tražite feedback i recenzije nakon završetka posla.

**Prednosti**
- Povećava stopu konverzije.
- Poboljšava ROI.
- Gradi reputaciju na platformi.
- Vodi do više pozitivnih recenzija.

**Kada koristiti**
- Kada želite poboljšati performanse.
- Kada trebate savjete za konverziju.
- Kada želite optimizirati strategiju.
`
    },
    "Reputation Score izračun (ponderirane komponente)": {
      implemented: true,
      summary: "Algoritam reputacije koristi ponderirane komponente: rating_quality (40%), rating_reliability (30%), rating_price_fairness (20%) i ResponseRate (10%). Rezultat utječe na dodjelu leadova.",
      details: `**Kako funkcionira**
- Score = 0.4 × rating_quality + 0.3 × rating_reliability + 0.2 × rating_price_fairness + 0.1 × ResponseRate.
- Rezultat upravlja queue prioritetom, listama “Najbolje ocijenjeni izvođači” i popustima/bonusima.
- Pragovi: >4.7 donosi +20 % više leadova, <3.5 aktivira reviziju i smanjuje vidljivost; bez ocjena → samo testni leadovi.

**Prednosti**
- Nagrađuje kvalitetne izvođače većom vidljivošću i boljim leadovima.
- Platforma ima mjerljiv, transparentan kriterij za dodjele i nagrade.

**Kada koristiti**
- U automatiziranoj dodjeli leadova, CRM dashboardima i analitičkim izvještajima.
- Kod ručnog recalca nakon ispravki recenzija ili pritužbi.
`,
      technicalDetails: `**Frontend**
- Modul \`ReputationBreakdown\` prikazuje ponderirane komponente i trend grafikon.
- Tooltip objašnjava doprinos svake komponente i prikazuje broj ocjena.
- Badge “Reputation Risk” upozorava ako score padne ispod 3.5 i linka na preporučene akcije.

**Backend**
- \`reputationService.calculateForCompany(companyId)\` agregira podatke iz recenzija, response logova i compliance evidencija.
- Noćni ETL job \`aggregateReputationMetrics\` zapisuje metričke vrijednosti u cache sloj.
- \`reputationPenaltyService\` primjenjuje negativne korekcije za kršenja pravila.

**Baza**
- \`ReputationMetric\` (companyId, metricKey, value, weight) služi kao izvor za kalkulacije.
- \`ReputationScoreHistory\` prati promjene kroz vrijeme s referencama na događaje.
- \`ComplianceIncident\` povezuje incidente s penalizacijom scorea.

**API**
- \`GET /api/partners/:companyId/reputation\` vraća aktualni score i breakdown.
- \`GET /api/partners/:companyId/reputation/history\` služi za grafikone trendova.
- \`POST /api/admin/reputation/:companyId/recalculate\` ručno pokreće kalkulaciju nakon ispravki.
`
    },
    "OIB / IBAN verifikacija (API)": {
      implemented: true,
      summary: "Automatska provjera OIB-a i IBAN-a putem API-ja (Sudski registar, CompanyWall). Obavezna za aktivaciju leadova.",
      details: `**Kako funkcionira**
- Tvrtka unosi OIB i IBAN u registraciji; sustav šalje upit službenim registrima (Sudski registar, CompanyWall).
- Odgovor se uspoređuje s unesenim podacima (naziv, adresa, status); uspješna provjera dodjeljuje “Verified Partner” oznaku.
- Neuspješna provjera blokira aktivaciju leadova dok se podaci ne isprave ili admin ne odobri ručno.

**Prednosti**
- Sprječava lažne registracije i štiti klijente od prijevara.
- Zadovoljava compliance zahtjeve i ubrzava onboarding s minimalnim ručnim radom.

**Kada koristiti**
- U registraciji i pri svakoj promjeni bankovnih podataka tvrtke.
- U audit workflowu prije odobravanja novih partnera ili reaktivacije starih računa.
`,
      technicalDetails: `**Frontend**
- Maskirani inputi za OIB i IBAN prikazuju status provjere u realnom vremenu.
- Loader i fallback poruke upućuju korisnika ako sustav prelazi na ručnu provjeru.
- Inline validacije prikazuju greške (format, neuspjela provjera) i predlažu sljedeće korake.

**Backend**
- \`verificationService.verifyTaxAndIban\` šalje zahtjev integracijama (CompanyWall, FINA API) uz retry i timeout logiku.
- Rezulati se cacheiraju u Redis ključu \`verification:company:{taxId}\` na 24 h radi smanjenja latencije.
- Fallback workflow \`manualVerificationQueue\` otvara zadatak administratoru za ručno odobrenje.

**Baza**
- \`CompanyVerification\` čuva status, payload odgovora i izvor provjere.
- \`VerificationAttempt\` bilježi svaki pokušaj (timestamp, rezultat, errorCode) za audit trail.
- \`Company.isVerified\` postaje true tek nakon uspješnog prolaska provjere.

**API**
- \`POST /api/verification/company\` prima taxId i iban, vraća status provjere.
- \`GET /api/verification/company/:taxId\` vraća povijest pokušaja i trenutni status.
- \`POST /api/admin/verification/company/:taxId/approve\` omogućava ručnu validaciju u iznimnim slučajevima.
`
    },
    "Wizard registracije (odabir kategorija i regija)": {
      implemented: true,
      summary: "Interaktivni wizard koji vodi novu tvrtku kroz registraciju. Omogućava odabir kategorija i regija u kojima želi raditi.",
      details: `**Kako funkcionira**
- Korisnik prolazi kroz korake: osnovni podaci, odabir kategorija, odabir regija, tim, licence i potvrda.
- Sustav validira svaki korak, sprema privremeni napredak i na kraju automatski aktivira TRIAL paket.
- Nakon završetka wizard šalje onboarding upute i ističe ograničenja (npr. 5-10 leadova u trialu).

**Prednosti**
- Brz start bez ručnog kontaktiranja podrške; vodi korisnika korak po korak.
- Minimalizira greške u unosu i povećava konverziju registracije.

**Kada koristiti**
- Za onboarding novih tvrtki i reaktivaciju postojećih koje ponovno prolaze setup.
- U marketing kampanjama kada želimo osigurati dosljedno prikupljanje podataka.
`,
      technicalDetails: `**Backend Implementacija**
- \`routes/wizard.js\`: Wizard endpoint-i za odabir kategorija i regija.
- \`GET /api/wizard/categories\`: Dohvat dostupnih kategorija (hijerarhijska struktura s glavnim i podkategorijama).
- \`GET /api/wizard/regions\`: Dohvat dostupnih regija (lista hrvatskih županija i regija).
- \`GET /api/wizard/status\`: Provjera statusa wizarda (da li je korisnik već prošao wizard).
- \`POST /api/wizard/categories\`: Spremanje odabira kategorija (veže kategorije na ProviderProfile).
- \`POST /api/wizard/regions\`: Spremanje odabira regija (sprema kao serviceArea u ProviderProfile).
- \`POST /api/wizard/complete\`: Kompletiranje wizarda (opcionalno, za tracking).

**Baza**
- \`ProviderProfile\` model: \`categories\` (many-to-many relacija s Category), \`serviceArea\` (String za regije).
- Kategorije se vežu preko \`categories: { connect: categoryIds.map(id => ({ id })) }\`.
- Regije se spremaju kao string u \`serviceArea\` polje (više regija odvojeno zarezom).

**Logika**
- Wizard je dostupan samo za PROVIDER role.
- Validacija: minimalno 1 kategorija i 1 regija su obavezni.
- Provjera da li kategorije postoje i da su aktivne (\`isActive: true\`).
- Provjera da li regije su u listi dostupnih regija.
- Wizard status se određuje na temelju toga da li korisnik ima odabrane kategorije i regije.

**API**
- \`GET /api/wizard/categories\` – dohvat kategorija (javni endpoint, auth optional).
- \`GET /api/wizard/regions\` – dohvat regija (javni endpoint, auth optional).
- \`GET /api/wizard/status\` – provjera statusa wizarda (auth required, PROVIDER only).
- \`POST /api/wizard/categories\` – spremanje kategorija (auth required, PROVIDER only, body: { categoryIds: string[] }).
- \`POST /api/wizard/regions\` – spremanje regija (auth required, PROVIDER only, body: { regions: string[] }).
- \`POST /api/wizard/complete\` – kompletiranje wizarda (auth required, PROVIDER only).

**Validacija**
- categoryIds mora biti array s minimalno 1 elementom.
- regions mora biti array s minimalno 1 elementom.
- Sve kategorije moraju postojati i biti aktivne.
- Sve regije moraju biti u listi dostupnih regija.
- Provider profil se automatski kreira ako ne postoji pri spremanju kategorija.
`
    },
    "Direktor Dashboard - upravljanje timovima": {
      implemented: true,
      summary: "Direktor Dashboard omogućava upravljanje timovima - dodavanje i uklanjanje članova tima.",
      details: `**Kako funkcionira**
- Direktor Dashboard ima tab "Tim" koji prikazuje sve članove tima.
- Direktor može dodati novog člana unoseći email adresu PROVIDER korisnika.
- Direktor može ukloniti člana iz tima jednim klikom.
- Prikazuje se status dostupnosti, kategorije i kontakt informacije svakog člana.

**Prednosti**
- Jednostavno upravljanje timom na jednom mjestu.
- Brzo dodavanje novih članova i uklanjanje onih koji više ne rade za tvrtku.
- Pregled svih aktivnih članova tima s njihovim informacijama.

**Kada koristiti**
- Kada trebate dodati novog člana tima.
- Kada član tima više ne radi za tvrtku.
- Za pregled svih aktivnih članova tima.
`,
      technicalDetails: `**Frontend**
- Komponenta \`DirectorDashboard\` s tabom "Tim".
- Forma za dodavanje člana tima (email input).
- Lista članova tima s informacijama i gumbom za uklanjanje.

**Backend**
- \`GET /api/director/team\` – dohvaća direktora i sve članove tima.
- \`POST /api/director/team/add\` – dodaje člana tima (zahtijeva userId).
- \`DELETE /api/director/team/:memberId\` – uklanja člana iz tima.

**Baza**
- \`ProviderProfile\` polje \`companyId\` povezuje tim člana s direktorom.

**API**
- \`GET /api/director/team\` – dohvaća tim i članove.
- \`POST /api/director/team/add\` – dodaje člana.
- \`DELETE /api/director/team/:memberId\` – uklanja člana.
      `
    },
    "Direktor Dashboard - pristup financijama": {
      implemented: true,
      summary: "Direktor Dashboard omogućava pristup financijskim podacima tvrtke - pretplate, fakture i leadovi.",
      details: `**Kako funkcionira**
- Direktor Dashboard ima tab "Financije" koji prikazuje sve financijske podatke tvrtke.
- Prikazuje se pretplata direktora (plan, status, krediti, datum isteka, cijena).
- Prikazuju se fakture direktora i svih tim članova s detaljima (ukupno potrošeno, status, datum).
- Prikazuju se lead purchases direktora i tim članova s informacijama o cijeni i statusu.
- KPI kartice prikazuju: ukupno potrošeno, ukupno leadova kupljeno, veličina tima.
- Sažetak financijskih podataka omogućava brz pregled stanja tvrtke.

**Prednosti**
- Centralizirani pregled svih financijskih podataka tvrtke na jednom mjestu.
- Lako praćenje troškova i ROI-ja kroz različite periode.
- Pregled pretplata i faktura direktora i tim članova.
- Brza identifikacija najvećih troškova i trendova potrošnje.
- Mogućnost analize učinkovitosti leadova i ROI-ja po članovima tima.

**Kada koristiti**
- Za planiranje budžeta i analizu troškova tvrtke.
- Za pregled pretplata i faktura direktora i tim članova.
- Za analizu ROI-ja i učinkovitosti leadova.
- Za praćenje financijskog stanja tvrtke u realnom vremenu.
- Za donošenje odluka o proširenju tima ili promjeni paketa.
`,
      technicalDetails: `**Frontend**
- Komponenta \`DirectorDashboard\` s tabom "Financije".
- KPI kartice: ukupno potrošeno, ukupno leadova, veličina tima.
- Sekcija pretplate s detaljima (plan, status, krediti, datum isteka).
- Lista nedavnih faktura direktora i tim članova s filtriranjem i sortiranjem.
- Lista lead purchases s detaljima o cijeni i statusu.

**Backend**
- \`GET /api/director/finances\` – dohvaća financijske podatke direktora i tim članova.
- Agregira podatke direktora i svih tim članova (fakture, lead purchases, pretplate).
- Računa ukupne troškove i statistike za KPI kartice.

**Baza**
- \`Subscription\` – pretplate direktora (plan, status, krediti, datum isteka).
- \`Invoice\` – fakture direktora i tim članova (ukupno potrošeno, status, datum).
- \`LeadPurchase\` – lead purchases direktora i tim članova (cijena, status, datum).
- \`ProviderProfile\` polje \`companyId\` povezuje tim članove s direktorom.

**API**
- \`GET /api/director/finances\` – dohvaća financijske podatke direktora i tim članova.
- Vraća agregirane podatke: ukupno potrošeno, ukupno leadova, veličina tima.
- Vraća listu faktura i lead purchases s detaljima.
      `
    },
    "Direktor Dashboard - ključne odluke": {
      implemented: true,
      summary: "Direktor Dashboard omogućava pregled ključnih odluka koje čekaju na odobrenje - ponude i leadovi.",
      details: `**Kako funkcionira**
- Direktor Dashboard ima tab "Odluke" koji prikazuje sve odluke koje čekaju na odobrenje direktora.
- Prikazuju se ponude koje čekaju na odobrenje (od tim članova) s detaljima o poslu, iznosu i statusu.
- Prikazuju se leadovi koje tim članovi trebaju odobriti s informacijama o klijentu, kategoriji i cijeni.
- Direktor vidi sve relevantne informacije za donošenje odluke: detalji posla/leadova, iznosi, statusi, datumi.
- Mogućnost filtriranja i sortiranja odluka po različitim kriterijima (datum, iznos, status, tim član).
- Direktor može odobriti ili odbiti odluke direktno iz dashboarda.

**Prednosti**
- Centralizirani pregled svih odluka koje čekaju na odobrenje na jednom mjestu.
- Brzo donošenje odluka bez potrebe za navigacijom kroz različite sekcije.
- Pregled aktivnosti tim članova i njihovih zahtjeva za odobrenje.
- Poboljšana kontrola nad financijskim odlukama tvrtke.
- Smanjenje vremena čekanja na odobrenje i ubrzanje poslovnih procesa.

**Kada koristiti**
- Za pregled ponuda koje čekaju na odobrenje od strane tim članova.
- Za pregled leadova koje tim članovi trebaju odobriti prije kupnje.
- Za donošenje ključnih odluka tvrtke koje zahtijevaju direktorsko odobrenje.
- Za praćenje aktivnosti tim članova i njihovih zahtjeva.
- Za kontrolu financijskih odluka i budžeta tvrtke.
`,
      technicalDetails: `**Frontend**
- Komponenta \`DirectorDashboard\` s tabom "Odluke".
- Dvije sekcije: "Ponude koje čekaju" i "Leadovi koje čekaju".
- Prikaz relevantnih informacija za svaku odluku (detalji posla/leadova, iznosi, statusi, datumi).
- Gumbi za odobravanje/odbijanje odluka s potvrdom.
- Filtriranje i sortiranje odluka po različitim kriterijima.

**Backend**
- \`GET /api/director/decisions\` – dohvaća sve odluke koje čekaju na odobrenje.
- Filtrira ponude tim članova sa statusom PENDING koji zahtijevaju odobrenje.
- Filtrira leadove tim članova koji zahtijevaju odobrenje prije kupnje.
- Agregira podatke iz različitih izvora (ponude, leadovi) u jedinstveni prikaz.

**Baza**
- \`Offer\` – ponude tim članova sa statusom PENDING koji zahtijevaju odobrenje.
- \`LeadPurchase\` – leadovi tim članova koji zahtijevaju odobrenje prije kupnje.
- \`ProviderProfile\` polje \`companyId\` povezuje tim članove s direktorom.

**API**
- \`GET /api/director/decisions\` – dohvaća sve odluke koje čekaju na odobrenje.
- Vraća listu ponuda i leadova s detaljima i statusima.
- \`POST /api/director/decisions/approve\` – odobrava odluku (ponudu ili lead).
- \`POST /api/director/decisions/reject\` – odbija odluku s razlogom.
      `
    },
    "Reputation Score (0-100)": {
      implemented: true,
      summary: "Reputation Score je numerička ocjena pružatelja usluga od 0 do 100 koja odražava njihovu kvalitetu, pouzdanost i profesionalnost.",
      details: `**Kako funkcionira**
- Reputation Score se izračunava na temelju više faktora: prosječna ocjena korisnika, brzina odgovora na ponude, stopa konverzije, broj završenih poslova i povijest recenzija.
- Score se automatski ažurira nakon svake nove recenzije, završenog posla ili promjene u performansama pružatelja.
- Prikazuje se na profilu pružatelja kao numerička vrijednost od 0 do 100, gdje 100 predstavlja najbolju moguću ocjenu.
- Score se također prikazuje vizualno kroz badge ili indikator koji omogućava brzu identifikaciju kvalitete pružatelja.
- Klijenti mogu filtrirati i sortirati pružatelje prema Reputation Score-u kako bi pronašli najkvalitetnije pružatelje.

**Prednosti**
- Jednostavna i razumljiva numerička ocjena koja omogućava brzu procjenu kvalitete pružatelja.
- Automatsko ažuriranje osigurava da score uvijek odražava trenutno stanje performansi.
- Poboljšava iskustvo korisnika omogućavajući im da pronađu najbolje pružatelje usluga.
- Potiče pružatelje da održavaju visoku kvalitetu usluga kako bi zadržali ili poboljšali svoj score.
- Transparentan sustav ocjenjivanja koji gradi povjerenje između korisnika i pružatelja.

**Kada koristiti**
- Za pronalaženje najkvalitetnijih pružatelja usluga u određenoj kategoriji.
- Za filtriranje i sortiranje pružatelja prema kvaliteti.
- Za praćenje vlastitog Reputation Score-a i identifikaciju područja za poboljšanje.
- Za donošenje odluka o odabiru pružatelja za važne projekte.
- Za analizu trendova performansi pružatelja kroz vrijeme.
`,
      technicalDetails: `**Frontend**
- Komponenta \`ReputationBadge\` prikazuje Reputation Score s različitim bojama ovisno o vrijednosti (zelena za visoke, žuta za srednje, crvena za niske).
- Score se prikazuje na profilu pružatelja, u listi rezultata pretrage i u detaljima ponuda.
- Mogućnost filtriranja i sortiranja pružatelja prema Reputation Score-u u pretrazi.

**Backend**
- \`reputationService.calculate\` izračunava Reputation Score na temelju ponderiranih komponenti.
- Score se automatski ažurira nakon svake nove recenzije, završenog posla ili promjene u performansama.
- Event \`reputation.updated\` informira ostale servise o promjeni score-a i invalidira cache.

**Baza**
- \`ProviderReputation\` tablica čuva Reputation Score za svakog pružatelja (providerId, score, breakdownJson, updatedAt).
- \`ProviderReview\` tablica sadrži recenzije koje utječu na izračun score-a.
- Score se cacheira radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/providers/:id/reputation\` – vraća Reputation Score i breakdown komponenti za određenog pružatelja.
- \`GET /api/providers?sort=reputation\` – sortira pružatelje prema Reputation Score-u.
- \`GET /api/providers?minReputation=80\` – filtrira pružatelje s minimalnim Reputation Score-om.
      `
    },
    "Response Rate mjerenje": {
      implemented: true,
      summary: "Response Rate mjerenje prati postotak odgovora pružatelja usluga na primljene ponude i leadove, što je ključni pokazatelj angažmana i profesionalnosti.",
      details: `**Kako funkcionira**
- Response Rate se izračunava kao postotak odgovora pružatelja na primljene ponude i leadove u određenom vremenskom periodu.
- Sustav automatski bilježi svaki odgovor (prihvaćanje, odbijanje, pregovaranje) i ažurira Response Rate u realnom vremenu.
- Response Rate se prikazuje kao postotak (npr. 85%) i može se filtrirati po različitim periodima (dnevno, tjedno, mjesečno).
- Sustav prati i prosječno vrijeme odgovora (response time) koje pokazuje koliko brzo pružatelj reagira na nove prilike.
- Response Rate utječe na Reputation Score i PARTNER_SCORE, što znači da pružatelji s višim Response Rate-om imaju bolje pozicije u sustavu.

**Prednosti**
- Omogućava klijentima da identificiraju aktivne i odgovorne pružatelje usluga.
- Potiče pružatelje da brzo odgovaraju na ponude i leadove kako bi zadržali visok Response Rate.
- Poboljšava iskustvo korisnika jer dobivaju brže odgovore na svoje zahtjeve.
- Transparentan sustav mjerenja koji gradi povjerenje i profesionalnost.
- Automatsko praćenje osigurava objektivnu procjenu angažmana pružatelja.

**Kada koristiti**
- Za procjenu angažmana i profesionalnosti pružatelja usluga.
- Za filtriranje i sortiranje pružatelja prema brzini i učestalosti odgovora.
- Za praćenje vlastitog Response Rate-a i identifikaciju područja za poboljšanje.
- Za donošenje odluka o dodjeli leadova i prioritizaciji pružatelja.
- Za analizu trendova odgovora i optimizaciju komunikacije s pružateljima.
`,
      technicalDetails: `**Frontend**
- Response Rate se prikazuje na profilu pružatelja kao postotak s vizualnim indikatorom (zelena za visoke, žuta za srednje, crvena za niske).
- Analytics dashboard prikazuje grafikone Response Rate-a kroz različite periode.
- Mogućnost filtriranja i sortiranja pružatelja prema Response Rate-u u pretrazi.

**Backend**
- \`responseRateService.calculate\` izračunava Response Rate na temelju broja odgovora i primljenih ponuda/leadova.
- Sustav automatski bilježi svaki odgovor i ažurira Response Rate u realnom vremenu.
- Response Rate se koristi kao komponenta u izračunu Reputation Score-a (10% ponder) i PARTNER_SCORE-a.
- Event \`response.recorded\` informira ostale servise o novom odgovoru i pokreće ažuriranje metrika.

**Baza**
- \`ProviderResponse\` tablica bilježi sve odgovore pružatelja (providerId, offerId/leadId, responseType, responseTime, timestamp).
- \`ProviderAnalytics\` tablica čuva agregirane Response Rate metrike (providerId, responseRate, averageResponseTime, period).
- Response Rate se cacheira radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/providers/:id/response-rate\` – vraća Response Rate i prosječno vrijeme odgovora za određenog pružatelja.
- \`GET /api/providers?sort=responseRate\` – sortira pružatelje prema Response Rate-u.
- \`GET /api/providers?minResponseRate=80\` – filtrira pružatelje s minimalnim Response Rate-om.
- \`GET /api/analytics/response-rate?period=monthly\` – vraća Response Rate statistike za određeni period.
      `
    },
    "Completion Rate tracking": {
      implemented: true,
      summary: "Completion Rate tracking prati postotak uspješno završenih poslova u odnosu na prihvaćene ponude, što je ključni pokazatelj pouzdanosti i profesionalnosti pružatelja.",
      details: `**Kako funkcionira**
- Completion Rate se izračunava kao postotak uspješno završenih poslova u odnosu na sve prihvaćene ponude u određenom vremenskom periodu.
- Sustav automatski bilježi status svakog posla (ZAVRŠEN, OTKAZAN, U TIJEKU) i ažurira Completion Rate u realnom vremenu.
- Completion Rate se prikazuje kao postotak (npr. 92%) i može se filtrirati po različitim periodima (dnevno, tjedno, mjesečno).
- Sustav prati i razloge otkazivanja poslova kako bi se identificirali obrasci i područja za poboljšanje.
- Completion Rate utječe na Reputation Score i PARTNER_SCORE, što znači da pružatelji s višim Completion Rate-om imaju bolje pozicije u sustavu.

**Prednosti**
- Omogućava klijentima da identificiraju pouzdane pružatelje usluga koji dovršavaju poslove do kraja.
- Potiče pružatelje da održavaju visoku stopu završetka poslova kako bi zadržali visok Completion Rate.
- Poboljšava iskustvo korisnika jer mogu računati na završetak poslova koje su prihvatili.
- Transparentan sustav praćenja koji gradi povjerenje i profesionalnost.
- Automatsko praćenje osigurava objektivnu procjenu pouzdanosti pružatelja.

**Kada koristiti**
- Za procjenu pouzdanosti i profesionalnosti pružatelja usluga.
- Za filtriranje i sortiranje pružatelja prema stopi završetka poslova.
- Za praćenje vlastitog Completion Rate-a i identifikaciju područja za poboljšanje.
- Za donošenje odluka o dodjeli leadova i prioritizaciji pružatelja.
- Za analizu trendova završetka poslova i optimizaciju procesa.
`,
      technicalDetails: `**Frontend**
- Completion Rate se prikazuje na profilu pružatelja kao postotak s vizualnim indikatorom (zelena za visoke, žuta za srednje, crvena za niske).
- Analytics dashboard prikazuje grafikone Completion Rate-a kroz različite periode.
- Mogućnost filtriranja i sortiranja pružatelja prema Completion Rate-u u pretrazi.
- Prikaz razloga otkazivanja poslova za analizu i poboljšanje.

**Backend**
- \`completionRateService.calculate\` izračunava Completion Rate na temelju broja završenih poslova i prihvaćenih ponuda.
- Sustav automatski bilježi status svakog posla i ažurira Completion Rate u realnom vremenu.
- Completion Rate se koristi kao komponenta u izračunu Reputation Score-a i PARTNER_SCORE-a.
- Event \`job.status.updated\` informira ostale servise o promjeni statusa posla i pokreće ažuriranje metrika.

**Baza**
- \`Job\` tablica sadrži status svakog posla (status: OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN).
- \`ProviderAnalytics\` tablica čuva agregirane Completion Rate metrike (providerId, completionRate, cancelledJobs, period).
- \`JobCancellation\` tablica bilježi razloge otkazivanja poslova za analizu.
- Completion Rate se cacheira radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/providers/:id/completion-rate\` – vraća Completion Rate i statistike završetka poslova za određenog pružatelja.
- \`GET /api/providers?sort=completionRate\` – sortira pružatelje prema Completion Rate-u.
- \`GET /api/providers?minCompletionRate=90\` – filtrira pružatelje s minimalnim Completion Rate-om.
- \`GET /api/analytics/completion-rate?period=monthly\` – vraća Completion Rate statistike za određeni period.
      `
    },
    "Platform Compliance Score": {
      implemented: true,
      summary: "Platform Compliance Score mjeri usklađenost pružatelja usluga s pravilima i standardima platforme, uključujući licence, verifikacije, dokumentaciju i etičke standarde.",
      details: `**Kako funkcionira**
- Platform Compliance Score se izračunava na temelju više faktora: valjanost licenci, verifikacije identiteta, ažurnost dokumentacije, povijest kršenja pravila i usklađenost s etičkim standardima.
- Sustav automatski provjerava compliance faktore i ažurira score u realnom vremenu kada se promijene relevantni podaci.
- Compliance Score se prikazuje kao numerička vrijednost (npr. 0-100) gdje viša vrijednost označava bolju usklađenost s pravilima platforme.
- Sustav prati i bilježi sve compliance incidente (kršenja pravila, istekle licence, neuspjele verifikacije) koji utječu na score.
- Compliance Score utječe na PARTNER_SCORE i može utjecati na prioritet dodjele leadova i dostupnost određenih funkcionalnosti.

**Prednosti**
- Osigurava da pružatelji usluga poštuju pravila i standarde platforme.
- Poboljšava kvalitetu usluga i povjerenje korisnika u platformu.
- Automatsko praćenje compliance faktora smanjuje potrebu za ručnim provjerama.
- Transparentan sustav ocjenjivanja koji potiče pružatelje da održavaju visoku razinu compliance-a.
- Zaštita korisnika i platforme od neusklađenih pružatelja usluga.

**Kada koristiti**
- Za procjenu usklađenosti pružatelja s pravilima i standardima platforme.
- Za filtriranje i sortiranje pružatelja prema compliance score-u.
- Za praćenje vlastitog compliance score-a i identifikaciju područja za poboljšanje.
- Za donošenje odluka o dodjeli leadova i prioritizaciji pružatelja.
- Za provođenje compliance provjera i audit procesa.
`,
      technicalDetails: `**Frontend**
- Compliance Score se prikazuje na profilu pružatelja kao numerička vrijednost s vizualnim indikatorom (zelena za visoke, žuta za srednje, crvena za niske).
- Compliance dashboard prikazuje detaljne informacije o compliance faktorima i incidentima.
- Mogućnost filtriranja i sortiranja pružatelja prema Compliance Score-u u pretrazi.
- Prikaz upozorenja i obavijesti o isteku licenci ili potrebi za ažuriranje dokumentacije.

**Backend**
- \`complianceService.calculate\` izračunava Compliance Score na temelju različitih compliance faktora.
- Sustav automatski provjerava valjanost licenci, verifikacije i dokumentacije i ažurira score u realnom vremenu.
- Compliance Score se koristi kao komponenta u izračunu PARTNER_SCORE-a.
- Event \`compliance.updated\` informira ostale servise o promjeni compliance statusa i pokreće ažuriranje metrika.
- \`complianceAuditService\` provodi periodične provjere compliance faktora.

**Baza**
- \`ProviderCompliance\` tablica čuva Compliance Score za svakog pružatelja (providerId, score, factors, updatedAt).
- \`License\` tablica sadrži licence pružatelja koje utječu na compliance score.
- \`ComplianceIncident\` tablica bilježi sve compliance incidente (kršenja pravila, istekle licence, neuspjele verifikacije).
- \`Verification\` tablica sadrži verifikacije identiteta koje utječu na compliance score.

**API**
- \`GET /api/providers/:id/compliance\` – vraća Compliance Score i detalje o compliance faktorima za određenog pružatelja.
- \`GET /api/providers?sort=complianceScore\` – sortira pružatelje prema Compliance Score-u.
- \`GET /api/providers?minComplianceScore=80\` – filtrira pružatelje s minimalnim Compliance Score-om.
- \`GET /api/compliance/incidents\` – vraća listu compliance incidenta za određenog pružatelja.
- \`POST /api/compliance/audit\` – pokreće compliance audit za određenog pružatelja.
      `
    },
    "Premium Partner tier (Score ≥ 80)": {
      implemented: true,
      summary: "Premium Partner tier je najviša razina partnera na platformi, dodjeljuje se pružateljima usluga s PARTNER_SCORE-om od 80 ili više, što osigurava prioritetnu dodjelu leadova i ekskluzivne privilegije.",
      details: `**Kako funkcionira**
- Premium Partner tier se automatski dodjeljuje pružateljima usluga koji postignu PARTNER_SCORE od 80 ili više.
- PARTNER_SCORE se izračunava na temelju više faktora: Response Rate, Completion Rate, Rating, Conversion Rate, Compliance Score i Freshness.
- Dnevni/tjedni job automatski računa PARTNER_SCORE i dodjeljuje odgovarajući tier (Premium ≥80, Verified 60-79, Basic <60).
- Premium Partneri dobivaju prioritetnu dodjelu leadova u queue sustavu, što znači da se njima prvo nude nove prilike.
- Premium Partneri imaju pristup ekskluzivnim funkcionalnostima, poput naprednih analitika, prioritetne podrške i ekskluzivnih leadova.

**Prednosti**
- Prioritetna dodjela leadova osigurava veći broj prilika za posao.
- Ekskluzivni pristup funkcionalnostima i resursima platforme.
- Poboljšana vidljivost i pozicioniranje u pretrazi pružatelja.
- Pristup naprednim analitičkim alatima za optimizaciju poslovanja.
- Prioritetna podrška od tima platforme za brže rješavanje problema.

**Kada koristiti**
- Za identifikaciju najkvalitetnijih pružatelja usluga na platformi.
- Za prioritizaciju dodjele leadova i resursa platforme.
- Za praćenje vlastitog PARTNER_SCORE-a i ciljanje Premium tier statusa.
- Za donošenje odluka o promociji pružatelja na Premium tier.
- Za analizu performansi i trendova Premium Partnera.
`,
      technicalDetails: `**Frontend**
- Premium Partner badge se prikazuje na profilu pružatelja s posebnom bojom i ikonom.
- Premium Partneri imaju pristup ekskluzivnom dashboardu s naprednim analitičkim alatima.
- Prikaz PARTNER_SCORE-a i breakdown komponenti na profilu pružatelja.
- Mogućnost filtriranja i sortiranja pružatelja prema tier statusu u pretrazi.

**Backend**
- \`partnerScoreService.calculate\` izračunava PARTNER_SCORE na temelju ključnih metrika (ResponseRate, CompletionRate, Rating, ConversionRate, Compliance, Freshness).
- Dnevni/tjedni job automatski računa PARTNER_SCORE i dodjeljuje tier (Premium ≥80, Verified 60-79, Basic <60).
- Premium Partneri dobivaju prioritet u queue sustavu za dodjelu leadova.
- Event \`partner.tier.updated\` informira ostale servise o promjeni tier statusa i pokreće ažuriranje privilegija.

**Baza**
- \`PartnerScore\` tablica čuva PARTNER_SCORE za svakog pružatelja (providerId, score, tier, breakdown JSONB, updatedAt).
- \`PartnerScoreHistory\` tablica čuva povijest PARTNER_SCORE-a za analizu trendova.
- \`PartnerTierChange\` tablica bilježi sve promjene tier statusa s razlozima i timestampom.
- Tier se cacheira radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/providers/:id/partner-score\` – vraća PARTNER_SCORE i tier status za određenog pružatelja.
- \`GET /api/providers?tier=premium\` – filtrira pružatelje s Premium tier statusom.
- \`GET /api/providers?sort=partnerScore\` – sortira pružatelje prema PARTNER_SCORE-u.
- \`GET /api/analytics/partner-tiers\` – vraća statistike o distribuciji tier statusa.
- \`POST /api/admin/partners/:id/promote\` – ručna promocija pružatelja na Premium tier (admin only).
      `
    },
    "Verified Partner tier (Score 60-79)": {
      implemented: true,
      summary: "Verified Partner tier je srednja razina partnera na platformi, dodjeljuje se pružateljima usluga s PARTNER_SCORE-om između 60 i 79, što osigurava standardnu dodjelu leadova i osnovne privilegije.",
      details: `**Kako funkcionira**
- Verified Partner tier se automatski dodjeljuje pružateljima usluga koji postignu PARTNER_SCORE između 60 i 79.
- PARTNER_SCORE se izračunava na temelju više faktora: Response Rate, Completion Rate, Rating, Conversion Rate, Compliance Score i Freshness.
- Dnevni/tjedni job automatski računa PARTNER_SCORE i dodjeljuje odgovarajući tier (Premium ≥80, Verified 60-79, Basic <60).
- Verified Partneri dobivaju standardnu dodjelu leadova u queue sustavu, nakon Premium Partnera ali prije Basic Partnera.
- Verified Partneri imaju pristup osnovnim funkcionalnostima platforme i standardnoj podršci.

**Prednosti**
- Standardna dodjela leadova osigurava redovite prilike za posao.
- Pristup osnovnim funkcionalnostima i resursima platforme.
- Mogućnost napredovanja na Premium tier kroz poboljšanje performansi.
- Poboljšana vidljivost u odnosu na Basic Partner tier.
- Standardna podrška od tima platforme.

**Kada koristiti**
- Za identifikaciju pouzdanih pružatelja usluga s dobrim performansama.
- Za standardnu dodjelu leadova i resursa platforme.
- Za praćenje vlastitog PARTNER_SCORE-a i ciljanje Premium tier statusa.
- Za donošenje odluka o promociji pružatelja na Premium tier ili degradaciji na Basic tier.
- Za analizu performansi i trendova Verified Partnera.
`,
      technicalDetails: `**Frontend**
- Verified Partner badge se prikazuje na profilu pružatelja s posebnom bojom i ikonom.
- Verified Partneri imaju pristup standardnom dashboardu s osnovnim analitičkim alatima.
- Prikaz PARTNER_SCORE-a i breakdown komponenti na profilu pružatelja.
- Mogućnost filtriranja i sortiranja pružatelja prema tier statusu u pretrazi.

**Backend**
- \`partnerScoreService.calculate\` izračunava PARTNER_SCORE na temelju ključnih metrika (ResponseRate, CompletionRate, Rating, ConversionRate, Compliance, Freshness).
- Dnevni/tjedni job automatski računa PARTNER_SCORE i dodjeljuje tier (Premium ≥80, Verified 60-79, Basic <60).
- Verified Partneri dobivaju standardni prioritet u queue sustavu za dodjelu leadova (nakon Premium, prije Basic).
- Event \`partner.tier.updated\` informira ostale servise o promjeni tier statusa i pokreće ažuriranje privilegija.

**Baza**
- \`PartnerScore\` tablica čuva PARTNER_SCORE za svakog pružatelja (providerId, score, tier, breakdown JSONB, updatedAt).
- \`PartnerScoreHistory\` tablica čuva povijest PARTNER_SCORE-a za analizu trendova.
- \`PartnerTierChange\` tablica bilježi sve promjene tier statusa s razlozima i timestampom.
- Tier se cacheira radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/providers/:id/partner-score\` – vraća PARTNER_SCORE i tier status za određenog pružatelja.
- \`GET /api/providers?tier=verified\` – filtrira pružatelje s Verified tier statusom.
- \`GET /api/providers?sort=partnerScore\` – sortira pružatelje prema PARTNER_SCORE-u.
- \`GET /api/analytics/partner-tiers\` – vraća statistike o distribuciji tier statusa.
- \`POST /api/admin/partners/:id/promote\` – ručna promocija pružatelja na Premium tier (admin only).
      `
    },
    "Basic Partner tier (Score < 60)": {
      implemented: true,
      summary: "Basic Partner tier je osnovna razina partnera na platformi, dodjeljuje se pružateljima usluga s PARTNER_SCORE-om ispod 60, što osigurava ograničenu dodjelu leadova i osnovne funkcionalnosti.",
      details: `**Kako funkcionira**
- Basic Partner tier se automatski dodjeljuje pružateljima usluga koji postignu PARTNER_SCORE ispod 60.
- PARTNER_SCORE se izračunava na temelju više faktora: Response Rate, Completion Rate, Rating, Conversion Rate, Compliance Score i Freshness.
- Dnevni/tjedni job automatski računa PARTNER_SCORE i dodjeljuje odgovarajući tier (Premium ≥80, Verified 60-79, Basic <60).
- Basic Partneri dobivaju ograničenu dodjelu leadova u queue sustavu, nakon Premium i Verified Partnera.
- Basic Partneri imaju pristup osnovnim funkcionalnostima platforme, ali s ograničenjima u odnosu na više tierove.

**Prednosti**
- Osnovna dodjela leadova osigurava prilike za posao, iako s nižim prioritetom.
- Pristup osnovnim funkcionalnostima platforme za početak rada.
- Mogućnost napredovanja na Verified ili Premium tier kroz poboljšanje performansi.
- Prilika za učenje i razvoj kroz korištenje platforme.
- Osnovna podrška od tima platforme.

**Kada koristiti**
- Za identifikaciju novih ili pružatelja s nižim performansama koji trebaju podršku.
- Za ograničenu dodjelu leadova i resursa platforme.
- Za praćenje vlastitog PARTNER_SCORE-a i ciljanje napredovanja na viši tier.
- Za donošenje odluka o podršci i mentorstvu Basic Partnera.
- Za analizu performansi i trendova Basic Partnera kako bi se identificirala područja za poboljšanje.
`,
      technicalDetails: `**Frontend**
- Basic Partner badge se prikazuje na profilu pružatelja s posebnom bojom i ikonom.
- Basic Partneri imaju pristup osnovnom dashboardu s minimalnim analitičkim alatima.
- Prikaz PARTNER_SCORE-a i breakdown komponenti na profilu pružatelja.
- Mogućnost filtriranja i sortiranja pružatelja prema tier statusu u pretrazi.
- Prikaz preporuka za poboljšanje performansi i napredovanje na viši tier.

**Backend**
- \`partnerScoreService.calculate\` izračunava PARTNER_SCORE na temelju ključnih metrika (ResponseRate, CompletionRate, Rating, ConversionRate, Compliance, Freshness).
- Dnevni/tjedni job automatski računa PARTNER_SCORE i dodjeljuje tier (Premium ≥80, Verified 60-79, Basic <60).
- Basic Partneri dobivaju najniži prioritet u queue sustavu za dodjelu leadova (nakon Premium i Verified).
- Event \`partner.tier.updated\` informira ostale servise o promjeni tier statusa i pokreće ažuriranje privilegija.

**Baza**
- \`PartnerScore\` tablica čuva PARTNER_SCORE za svakog pružatelja (providerId, score, tier, breakdown JSONB, updatedAt).
- \`PartnerScoreHistory\` tablica čuva povijest PARTNER_SCORE-a za analizu trendova.
- \`PartnerTierChange\` tablica bilježi sve promjene tier statusa s razlozima i timestampom.
- Tier se cacheira radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/providers/:id/partner-score\` – vraća PARTNER_SCORE i tier status za određenog pružatelja.
- \`GET /api/providers?tier=basic\` – filtrira pružatelje s Basic tier statusom.
- \`GET /api/providers?sort=partnerScore\` – sortira pružatelje prema PARTNER_SCORE-u.
- \`GET /api/analytics/partner-tiers\` – vraća statistike o distribuciji tier statusa.
- \`POST /api/admin/partners/:id/promote\` – ručna promocija pružatelja na Verified ili Premium tier (admin only).
      `
    },
    "Fairness algoritam (sprečava previše leadova istom partneru)": {
      implemented: true,
      summary: "Fairness algoritam osigurava pravednu distribuciju leadova između partnera sprječavajući da jedan partner dobije previše leadova u kratkom vremenskom periodu.",
      details: `**Kako funkcionira**
- Fairness algoritam prati broj leadova dodijeljenih svakom partneru u određenom vremenskom periodu (npr. dnevno, tjedno).
- Algoritam postavlja maksimalni limit leadova po partneru u određenom periodu kako bi osigurao pravednu distribuciju.
- Kada partner dosegne limit, algoritam ga privremeno isključuje iz dodjele leadova dok se limit ne resetira.
- Algoritam uzima u obzir tier status partnera (Premium, Verified, Basic) i prilagođava limite prema tieru.
- Fairness algoritam radi u kombinaciji s drugim faktorima (PARTNER_SCORE, dostupnost, lokacija) kako bi osigurao optimalnu distribuciju.

**Prednosti**
- Osigurava pravednu distribuciju leadova između svih partnera na platformi.
- Sprječava monopolizaciju leadova od strane jednog ili nekoliko partnera.
- Omogućava svim partnerima priliku za rast i razvoj kroz pristup leadovima.
- Poboljšava iskustvo korisnika osiguravajući da različiti partneri dobivaju prilike.
- Potiče zdravu konkurenciju i raznolikost na platformi.

**Kada koristiti**
- Za osiguravanje pravedne distribucije leadova između partnera.
- Za sprječavanje monopolizacije leadova od strane dominantnih partnera.
- Za omogućavanje prilika za rast svim partnerima na platformi.
- Za poboljšanje iskustva korisnika kroz raznolikost partnera.
- Za održavanje zdravog ekosustava na platformi.
`,
      technicalDetails: `**Frontend**
- Fairness algoritam radi u pozadini i nije direktno vidljiv korisnicima.
- Admin dashboard može prikazivati statistike o distribuciji leadova po partnerima.
- Mogućnost pregleda fairness metrika i limita za svakog partnera.

**Backend**
- \`fairnessService.calculate\` izračunava fairness score za svakog partnera na temelju broja dodijeljenih leadova.
- Algoritam prati broj leadova po partneru u različitim vremenskim periodima (dnevno, tjedno, mjesečno).
- Fairness algoritam se primjenjuje u queue sustavu prije dodjele leadova partneru.
- Algoritam uzima u obzir tier status partnera i prilagođava limite (Premium partneri mogu imati viši limit).
- Event \`lead.assigned\` pokreće ažuriranje fairness metrika za određenog partnera.

**Baza**
- \`LeadAssignment\` tablica bilježi sve dodjele leadova partnerima (leadId, providerId, assignedAt, tier).
- \`FairnessMetrics\` tablica čuva agregirane fairness metrike po partneru (providerId, period, leadCount, limit, resetAt).
- \`FairnessLimit\` tablica definira limite leadova po tieru i periodu (tier, period, maxLeads).
- Fairness metrike se cacheiraju radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/admin/fairness/metrics\` – vraća fairness metrike za sve partnere (admin only).
- \`GET /api/admin/fairness/limits\` – vraća definirane limite leadova po tieru (admin only).
- \`POST /api/admin/fairness/limits\` – ažurira limite leadova po tieru (admin only).
- \`GET /api/providers/:id/fairness\` – vraća fairness metrike za određenog partnera.
      `
    },
    "Auto-assign prioritet za Premium partnere": {
      implemented: true,
      summary: "Auto-assign prioritet za Premium partnere osigurava da Premium Partneri (PARTNER_SCORE ≥ 80) dobivaju prioritetnu automatsku dodjelu leadova u queue sustavu.",
      details: `**Kako funkcionira**
- Auto-assign prioritet automatski dodjeljuje leadove Premium Partnerima prije ostalih partnera u queue sustavu.
- Premium Partneri (PARTNER_SCORE ≥ 80) dobivaju najviši prioritet u automatskoj distribuciji leadova.
- Algoritam prvo provjerava dostupne Premium Partnere prije nego što proslijedi leadove Verified ili Basic Partnerima.
- Premium Partneri dobivaju leadove automatski bez potrebe za ručnom kupnjom, osim ako eksplicitno odbiju.
- Prioritet se kombinuje s drugim faktorima (lokacija, kategorija, dostupnost) kako bi se osigurala optimalna dodjela.

**Prednosti**
- Premium Partneri dobivaju brži pristup novim leadovima bez čekanja.
- Automatska dodjela smanjuje vrijeme između stvaranja leada i dodjele partneru.
- Poboljšava iskustvo Premium Partnera osiguravajući im prioritetnu poziciju.
- Povećava konverziju leadova jer Premium Partneri imaju bolje performanse.
- Potiče partnere da teže Premium tier statusu kako bi dobili prioritetnu dodjelu.

**Kada koristiti**
- Za osiguravanje prioritetne dodjele leadova Premium Partnerima.
- Za poboljšanje iskustva Premium Partnera kroz brži pristup leadovima.
- Za povećanje konverzije leadova kroz dodjelu najkvalitetnijim partnerima.
- Za poticanje partnera da teže Premium tier statusu.
- Za optimizaciju distribucije leadova u queue sustavu.
`,
      technicalDetails: `**Frontend**
- Premium Partneri vide automatski dodijeljene leadove u svojoj lead listi s oznakom "Auto-assigned".
- Dashboard prikazuje statistike o automatski dodijeljenim leadovima.
- Mogućnost konfiguracije auto-assign postavki (ako je omogućeno).

**Backend**
- \`queueService.autoAssign\` provjerava dostupne Premium Partnere prije dodjele leadova.
- Algoritam sortira partnere prema tier statusu (Premium → Verified → Basic) prije dodjele.
- Auto-assign prioritet se primjenjuje u queue sustavu prije ručne kupnje leadova.
- Premium Partneri dobivaju notifikacije o automatski dodijeljenim leadovima.
- Event \`lead.autoAssigned\` informira ostale servise o automatskoj dodjeli leada Premium Partneru.

**Baza**
- \`LeadAssignment\` tablica bilježi automatske dodjele leadova (leadId, providerId, assignedAt, assignmentType: AUTO, tier).
- \`QueuePriority\` tablica definira prioritete dodjele po tieru (tier, priority, autoAssignEnabled).
- \`AutoAssignLog\` tablica bilježi sve automatske dodjele za analizu (leadId, providerId, assignedAt, reason).
- Auto-assign metrike se cacheiraju radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/providers/:id/auto-assigned-leads\` – vraća listu automatski dodijeljenih leadova za određenog partnera.
- \`GET /api/admin/auto-assign/stats\` – vraća statistike o automatskim dodjelama po tieru (admin only).
- \`POST /api/admin/auto-assign/config\` – konfigurira auto-assign postavke (admin only).
- \`GET /api/queue/priority\` – vraća prioritete dodjele leadova po tieru.
      `
    },
    "Eligibility filter po kategoriji": {
      implemented: true,
      summary: "Eligibility filter po kategoriji osigurava da se leadovi dodjeljuju samo partnerima koji su kvalificirani za određene kategorije usluga, na temelju njihovih odabranih kategorija i licenci.",
      details: `**Kako funkcionira**
- Eligibility filter po kategoriji provjerava da li je partner kvalificiran za kategoriju leada prije dodjele.
- Partner mora imati odabranu kategoriju u svom profilu i, ako je potrebno, valjanu licencu za tu kategoriju.
- Algoritam filtrira partnere na temelju njihovih odabranih kategorija i licenci prije dodjele leadova.
- Filter uzima u obzir i podkategorije, tako da partner s odabranom glavnom kategorijom može primati leadove iz podkategorija.
- Eligibility filter se primjenjuje u queue sustavu prije dodjele leadova, osiguravajući da se leadovi dodjeljuju samo relevantnim partnerima.

**Prednosti**
- Osigurava da se leadovi dodjeljuju samo partnerima koji su kvalificirani za određene kategorije.
- Smanjuje broj nepotrebnih leadova i poboljšava konverziju.
- Poboljšava iskustvo partnera osiguravajući da dobivaju samo relevantne leadove.
- Povećava kvalitetu dodjele leadova i smanjuje odbijanja.
- Osigurava compliance s licencnim zahtjevima za određene kategorije.

**Kada koristiti**
- Za osiguravanje da se leadovi dodjeljuju samo kvalificiranim partnerima.
- Za poboljšanje konverzije leadova kroz dodjelu relevantnim partnerima.
- Za osiguravanje compliance s licencnim zahtjevima za određene kategorije.
- Za optimizaciju distribucije leadova u queue sustavu.
- Za poboljšanje iskustva partnera kroz relevantne leadove.
`,
      technicalDetails: `**Frontend**
- Partneri vide svoje odabrane kategorije u profilu i mogu ih ažurirati.
- Lead marketplace prikazuje samo leadove iz kategorija za koje je partner kvalificiran.
- Filter panel omogućava filtriranje leadova po kategorijama.
- Prikaz upozorenja ako partner pokuša kupiti lead iz kategorije za koju nije kvalificiran.

**Backend**
- \`eligibilityService.checkCategory\` provjerava da li je partner kvalificiran za određenu kategoriju.
- Algoritam provjerava odabrane kategorije partnera i valjanost licenci prije dodjele leadova.
- Eligibility filter se primjenjuje u queue sustavu prije dodjele leadova partneru.
- Filter uzima u obzir i podkategorije, tako da partner s glavnom kategorijom može primati leadove iz podkategorija.
- Event \`provider.category.updated\` invalidira eligibility cache i ažurira queue prioritete.

**Baza**
- \`ProviderCategory\` tablica povezuje partnere s kategorijama (providerId, categoryId, isActive).
- \`License\` tablica sadrži licence partnera koje utječu na eligibility za određene kategorije.
- \`CategoryLicenseRequirement\` tablica definira koje kategorije zahtijevaju licence (categoryId, requiresLicense).
- Eligibility metrike se cacheiraju radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/providers/:id/categories\` – vraća odabrane kategorije za određenog partnera.
- \`POST /api/providers/:id/categories\` – ažurira odabrane kategorije partnera.
- \`GET /api/queue/eligibility/:categoryId\` – vraća listu partnera kvalificiranih za određenu kategoriju.
- \`GET /api/leads?categoryId=:id\` – vraća leadove iz određene kategorije (filtrirano po eligibility).
      `
    },
    "Eligibility filter po regiji": {
      implemented: true,
      summary: "Eligibility filter po regiji osigurava da se leadovi dodjeljuju samo partnerima koji rade u određenim regijama, na temelju njihovih odabranih regija i lokacije.",
      details: `**Kako funkcionira**
- Eligibility filter po regiji provjerava da li je partner kvalificiran za regiju leada prije dodjele.
- Partner mora imati odabranu regiju u svom profilu koja odgovara regiji leada.
- Algoritam filtrira partnere na temelju njihovih odabranih regija prije dodjele leadova.
- Filter uzima u obzir i geografsku blizinu, tako da partneri u susjednim regijama mogu primati leadove ako je to omogućeno.
- Eligibility filter se primjenjuje u queue sustavu prije dodjele leadova, osiguravajući da se leadovi dodjeljuju samo partnerima u relevantnim regijama.

**Prednosti**
- Osigurava da se leadovi dodjeljuju samo partnerima koji rade u relevantnim regijama.
- Smanjuje broj nepotrebnih leadova i poboljšava konverziju.
- Poboljšava iskustvo partnera osiguravajući da dobivaju samo leadove iz regija u kojima rade.
- Povećava kvalitetu dodjele leadova i smanjuje odbijanja zbog lokacije.
- Osigurava da klijenti dobivaju partnere koji mogu pružiti usluge u njihovoj regiji.

**Kada koristiti**
- Za osiguravanje da se leadovi dodjeljuju samo partnerima u relevantnim regijama.
- Za poboljšanje konverzije leadova kroz dodjelu partnerima koji mogu pružiti usluge u određenoj regiji.
- Za optimizaciju distribucije leadova u queue sustavu na temelju geografskih faktora.
- Za poboljšanje iskustva partnera kroz relevantne leadove iz njihovih regija.
- Za osiguravanje da klijenti dobivaju partnere koji mogu pružiti usluge u njihovoj regiji.
`,
      technicalDetails: `**Frontend**
- Partneri vide svoje odabrane regije u profilu i mogu ih ažurirati.
- Lead marketplace prikazuje samo leadove iz regija za koje je partner kvalificiran.
- Filter panel omogućava filtriranje leadova po regijama.
- Prikaz upozorenja ako partner pokuša kupiti lead iz regije za koju nije kvalificiran.
- Geografska mapa prikazuje dostupne regije i leadove po regijama.

**Backend**
- \`eligibilityService.checkRegion\` provjerava da li je partner kvalificiran za određenu regiju.
- Algoritam provjerava odabrane regije partnera i geografsku blizinu prije dodjele leadova.
- Eligibility filter se primjenjuje u queue sustavu prije dodjele leadova partneru.
- Filter uzima u obzir i susjedne regije, tako da partneri u blizini mogu primati leadove ako je to omogućeno.
- Event \`provider.region.updated\` invalidira eligibility cache i ažurira queue prioritete.

**Baza**
- \`ProviderRegion\` tablica povezuje partnere s regijama (providerId, regionId, isActive).
- \`Lead\` tablica sadrži regiju leada (region, city, coordinates) koja se koristi za filtriranje.
- \`RegionProximity\` tablica definira susjedne regije za geografsku blizinu (regionId, nearbyRegionId, distance).
- Eligibility metrike se cacheiraju radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/providers/:id/regions\` – vraća odabrane regije za određenog partnera.
- \`POST /api/providers/:id/regions\` – ažurira odabrane regije partnera.
- \`GET /api/queue/eligibility/region/:regionId\` – vraća listu partnera kvalificiranih za određenu regiju.
- \`GET /api/leads?regionId=:id\` – vraća leadove iz određene regije (filtrirano po eligibility).
      `
    },
    "Prioritet timu s boljim matchom": {
      implemented: true,
      summary: "Prioritet timu s boljim matchom osigurava da se leadovi dodjeljuju timovima s najboljim match score-om, koji kombinira faktore tvrtke i tim članova za optimalnu dodjelu.",
      details: `**Kako funkcionira**
- Prioritet timu s boljim matchom koristi kombinirani match score koji uzima u obzir faktore tvrtke (PARTNER_SCORE, tier, compliance) i tim članova (kategorije, licence, dostupnost).
- Algoritam izračunava match score za svaki tim na temelju relevantnosti tim članova za određeni lead (kategorija, regija, licence).
- Timovi s višim match score-om dobivaju prioritet u queue sustavu i prvo im se nude leadovi.
- Match score se izračunava u realnom vremenu prije dodjele leadova, uzimajući u obzir trenutnu dostupnost tim članova.
- Algoritam kombinira match score tvrtke i tim članova kako bi osigurao optimalnu dodjelu leadova najkvalitetnijim timovima.

**Prednosti**
- Osigurava da se leadovi dodjeljuju timovima s najboljim match score-om.
- Povećava konverziju leadova kroz dodjelu najrelevantnijim timovima.
- Poboljšava iskustvo klijenata osiguravajući da dobivaju najkvalitetnije timove.
- Potiče timove da održavaju visoku kvalitetu i relevantnost kako bi dobili prioritet.
- Optimizira distribuciju leadova u queue sustavu na temelju match score-a.

**Kada koristiti**
- Za osiguravanje prioritetne dodjele leadova timovima s najboljim match score-om.
- Za poboljšanje konverzije leadova kroz dodjelu najrelevantnijim timovima.
- Za optimizaciju distribucije leadova u queue sustavu na temelju match score-a.
- Za poticanje timova da održavaju visoku kvalitetu i relevantnost.
- Za poboljšanje iskustva klijenata kroz dodjelu najkvalitetnijih timova.
`,
      technicalDetails: `**Frontend**
- Timovi vide svoj match score u dashboardu i mogu pratiti kako se mijenja.
- Lead marketplace prikazuje match score za svaki lead u odnosu na tim.
- Dashboard prikazuje statistike o match score-u i prioritetima dodjele.
- Mogućnost pregleda breakdown match score-a (tvrtka + tim članovi).

**Backend**
- \`matchService.calculateTeamMatchScore\` izračunava kombinirani match score za tim.
- Algoritam kombinira match score tvrtke (PARTNER_SCORE, tier, compliance) i tim članova (kategorije, licence, dostupnost).
- \`findBestTeamMatches\` pronalazi najbolje matchane tim članove za određeni lead.
- \`calculateCombinedMatchScore\` kombinira score tvrtke i tim članova u jedinstveni match score.
- Match score se koristi u queue sustavu za prioritizaciju dodjele leadova timovima.

**Baza**
- \`TeamMatchScore\` tablica čuva match score za svaki tim (teamId, leadId, matchScore, breakdown JSONB, calculatedAt).
- \`TeamMemberMatch\` tablica bilježi match score pojedinih tim članova (memberId, leadId, matchScore, factors).
- \`MatchScoreHistory\` tablica čuva povijest match score-a za analizu trendova.
- Match score se cacheira radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/teams/:id/match-score\` – vraća match score za određeni tim.
- \`GET /api/teams/:id/match-score/:leadId\` – vraća match score tima za određeni lead.
- \`GET /api/queue/team-matches/:leadId\` – vraća listu timova sortiranih po match score-u za određeni lead.
- \`GET /api/analytics/team-match-scores\` – vraća statistike o match score-ovima timova.
      `
    },
    "Fallback na direktora ako nema tima": {
      implemented: true,
      summary: "Fallback na direktora ako nema tima osigurava da se leadovi dodjeljuju direktoru tvrtke kada tim nema dostupnih članova ili kada tim ne može primiti lead.",
      details: `**Kako funkcionira**
- Fallback na direktora se aktivira kada tim nema dostupnih članova koji mogu primiti lead (npr. svi članovi su zauzeti, nedostaju licence, ili tim nije aktivan).
- Algoritam prvo pokušava dodijeliti lead timu, ali ako tim ne može primiti lead, automatski se prebacuje na direktora tvrtke.
- Direktor dobiva lead kao fallback opciju, osiguravajući da lead ne ostane nedodijeljen.
- Fallback se primjenjuje u queue sustavu nakon neuspješnog pokušaja dodjele timu.
- Direktor može primiti lead iako tim nije dostupan, osiguravajući kontinuitet usluge.

**Prednosti**
- Osigurava da leadovi ne ostaju nedodijeljeni kada tim nije dostupan.
- Omogućava direktoru da preuzme leadove kada tim ne može raditi.
- Poboljšava iskustvo klijenata osiguravajući da uvijek dobivaju odgovor.
- Osigurava kontinuitet usluge čak i kada tim nije dostupan.
- Omogućava direktoru da kontrolira kvalitetu usluge kroz direktno preuzimanje leadova.

**Kada koristiti**
- Za osiguravanje da leadovi ne ostaju nedodijeljeni kada tim nije dostupan.
- Za omogućavanje direktoru da preuzme leadove kada tim ne može raditi.
- Za poboljšanje iskustva klijenata osiguravajući da uvijek dobivaju odgovor.
- Za osiguravanje kontinuiteta usluge čak i kada tim nije dostupan.
- Za omogućavanje direktoru da kontrolira kvalitetu usluge kroz direktno preuzimanje leadova.
`,
      technicalDetails: `**Frontend**
- Direktor vidi fallback leadove u svojoj lead listi s oznakom "Fallback".
- Dashboard prikazuje statistike o fallback leadovima i razloge zašto su dodijeljeni direktoru.
- Mogućnost konfiguracije fallback postavki (ako je omogućeno).
- Prikaz upozorenja kada tim nije dostupan i lead se dodjeljuje direktoru.

**Backend**
- \`queueService.fallbackToDirector\` provjerava da li tim može primiti lead i, ako ne, prebacuje na direktora.
- Algoritam provjerava dostupnost tim članova, licence i aktivnost tima prije fallback-a.
- Fallback se primjenjuje u queue sustavu nakon neuspješnog pokušaja dodjele timu.
- Direktor dobiva notifikacije o fallback leadovima s razlogom zašto su dodijeljeni.
- Event \`lead.fallbackToDirector\` informira ostale servise o fallback dodjeli leada direktoru.

**Baza**
- \`LeadAssignment\` tablica bilježi fallback dodjele leadova (leadId, directorId, assignedAt, assignmentType: FALLBACK, reason).
- \`TeamAvailability\` tablica prati dostupnost tim članova (teamId, availableMembers, unavailableReason).
- \`FallbackLog\` tablica bilježi sve fallback dodjele za analizu (leadId, directorId, teamId, reason, timestamp).
- Fallback metrike se cacheiraju radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/director/fallback-leads\` – vraća listu fallback leadova za određenog direktora.
- \`GET /api/admin/fallback/stats\` – vraća statistike o fallback dodjelama (admin only).
- \`POST /api/admin/fallback/config\` – konfigurira fallback postavke (admin only).
- \`GET /api/queue/fallback/:leadId\` – provjerava da li lead treba fallback na direktora.
      `
    },
    "Automatsko snižavanje cijene ako nema leadova": {
      implemented: true,
      summary: "Automatsko snižavanje cijene ako nema leadova osigurava da se klijentima automatski odobrava credit refund kada u obračunskom periodu nema isporučenih leadova, što predstavlja automatsko snižavanje cijene.",
      details: `**Kako funkcionira**
- Automatsko snižavanje cijene se aktivira kada u obračunskom periodu nema isporučenih leadova (deliveredLeads = 0).
- Sustav automatski kreira BillingAdjustment s tipom CREDIT i odobrava puni credit za cijelu kvotu (adjustmentCredits = expectedLeads).
- Credit se automatski dodaje na subscription balance klijenta, što predstavlja snižavanje cijene za sljedeći period.
- Sustav šalje notifikaciju klijentu o credit refund-u s objašnjenjem da je tržište mirno.
- Automatsko snižavanje cijene se primjenjuje u kombinaciji s "Credit refund ako tržište miruje" funkcionalnošću.

**Prednosti**
- Osigurava fer naplatu kada tržište miruje i nema leadova.
- Automatski odobrava credit refund bez potrebe za ručnom intervencijom.
- Poboljšava iskustvo klijenata osiguravajući da ne plaćaju za usluge koje nisu dobili.
- Transparentan sustav koji gradi povjerenje između platforme i klijenata.
- Potiče klijente da ostanu na platformi čak i kada tržište miruje.

**Kada koristiti**
- Za osiguravanje fer naplate kada tržište miruje i nema leadova.
- Za automatsko odobravanje credit refund-a bez potrebe za ručnom intervencijom.
- Za poboljšanje iskustva klijenata osiguravajući da ne plaćaju za usluge koje nisu dobili.
- Za izgradnju povjerenja između platforme i klijenata kroz transparentan sustav.
- Za poticanje klijenata da ostanu na platformi čak i kada tržište miruje.
`,
      technicalDetails: `**Frontend**
- Klijenti vide automatski odobrene credit refund-ove u billing dashboardu.
- Dashboard prikazuje BillingAdjustment s tipom CREDIT i razlogom "Automatsko snižavanje cijene".
- Prikaz notifikacije o credit refund-u s objašnjenjem da je tržište miruje.
- Mogućnost pregleda povijesti automatskih credit refund-ova.

**Backend**
- \`billingAdjustmentService.calculateAdjustmentForPlan\` izračunava adjustment i detektira kada nema leadova (deliveredLeads = 0).
- Algoritam automatski kreira BillingAdjustment s tipom CREDIT i punim creditom za cijelu kvotu.
- \`applyQuietMarketCreditRefunds\` primjenjuje credit refund-ove za sve klijente koji nemaju leadova u periodu.
- Credit se automatski dodaje na subscription balance klijenta.
- Event \`billing.adjustment.applied\` informira ostale servise o primijenjenom credit refund-u.

**Baza**
- \`BillingAdjustment\` tablica bilježi automatske credit refund-ove (billingPlanId, adjustmentType: CREDIT, adjustmentCredits, deliveredLeads: 0, notes).
- \`CreditTransaction\` tablica bilježi credit refund transakcije (userId, type: REFUND, amount, balance, description).
- \`Subscription\` tablica čuva creditsBalance koji se ažurira automatskim credit refund-om.
- \`Notification\` tablica bilježi notifikacije o credit refund-u klijentima.

**API**
- \`GET /api/director/billing/adjustments\` – vraća listu BillingAdjustment-a uključujući automatske credit refund-ove.
- \`GET /api/director/billing/credits\` – vraća trenutno stanje kredita i povijest transakcija.
- \`POST /api/admin/billing/apply-quiet-market-refunds\` – ručno pokretanje automatskih credit refund-ova (admin only).
- \`GET /api/admin/billing/quiet-market-stats\` – vraća statistike o automatskim credit refund-ovima (admin only).
      `
    },
    "Credit refund ako tržište miruje": {
      implemented: true,
      summary: "Credit refund ako tržište miruje automatski vraća kredite klijentima kada u obračunskom periodu nema isporučenih leadova (0 leadova), što predstavlja kompenzaciju za mirno tržište.",
      details: `**Kako funkcionira**
- Credit refund se aktivira kada u obračunskom periodu nema isporučenih leadova (deliveredLeads = 0).
- Sustav automatski pronalazi sve BillingAdjustment-e s tipom CREDIT i deliveredLeads = 0 koji su u statusu PENDING.
- Za svaki takav adjustment, sustav automatski dodaje credit na subscription balance klijenta.
- Credit refund se bilježi kao CreditTransaction s tipom REFUND i opisom da je tržište mirno.
- Sustav šalje notifikaciju klijentu o credit refund-u s objašnjenjem da je tržište miruje i da mu je vraćeno određeno količina kredita.

**Prednosti**
- Osigurava fer naplatu kada tržište miruje i nema leadova.
- Automatski vraća kredite klijentima bez potrebe za ručnom intervencijom.
- Poboljšava iskustvo klijenata osiguravajući da ne plaćaju za usluge koje nisu dobili.
- Transparentan sustav koji gradi povjerenje između platforme i klijenata.
- Potiče klijente da ostanu na platformi čak i kada tržište miruje.

**Kada koristiti**
- Za osiguravanje fer naplate kada tržište miruje i nema leadova.
- Za automatsko vraćanje kredita klijentima bez potrebe za ručnom intervencijom.
- Za poboljšanje iskustva klijenata osiguravajući da ne plaćaju za usluge koje nisu dobili.
- Za izgradnju povjerenja između platforme i klijenata kroz transparentan sustav.
- Za poticanje klijenata da ostanu na platformi čak i kada tržište miruje.
`,
      technicalDetails: `**Frontend**
- Klijenti vide automatski odobrene credit refund-ove u billing dashboardu.
- Dashboard prikazuje CreditTransaction s tipom REFUND i opisom "Credit refund jer je tržište miruje".
- Prikaz notifikacije o credit refund-u s objašnjenjem da je tržište miruje i da mu je vraćeno određeno količina kredita.
- Mogućnost pregleda povijesti credit refund-ova povezanih s mirnim tržištem.

**Backend**
- \`applyQuietMarketCreditRefunds\` pronalazi sve BillingAdjustment-e s tipom CREDIT i deliveredLeads = 0 koji su u statusu PENDING.
- Algoritam automatski dodaje credit na subscription balance klijenta za svaki takav adjustment.
- Credit refund se bilježi kao CreditTransaction s tipom REFUND i opisom da je tržište miruje.
- Sustav šalje notifikaciju klijentu o credit refund-u s detaljima o vraćenom kreditu.
- Event \`credit.refund.applied\` informira ostale servise o primijenjenom credit refund-u.

**Baza**
- \`BillingAdjustment\` tablica bilježi adjustment-e s tipom CREDIT i deliveredLeads = 0 (billingPlanId, adjustmentType: CREDIT, deliveredLeads: 0, status: PENDING/APPLIED).
- \`CreditTransaction\` tablica bilježi credit refund transakcije (userId, type: REFUND, amount, balance, description: "Credit refund jer je tržište miruje").
- \`Subscription\` tablica čuva creditsBalance koji se ažurira credit refund-om.
- \`Notification\` tablica bilježi notifikacije o credit refund-u klijentima.

**API**
- \`GET /api/director/billing/credits\` – vraća trenutno stanje kredita i povijest transakcija uključujući credit refund-ove.
- \`GET /api/director/billing/adjustments\` – vraća listu BillingAdjustment-a uključujući one s deliveredLeads = 0.
- \`POST /api/admin/billing/apply-quiet-market-refunds\` – ručno pokretanje credit refund-ova za mirno tržište (admin only).
- \`GET /api/admin/billing/quiet-market-stats\` – vraća statistike o credit refund-ovima za mirno tržište (admin only).
      `
    },
    "Mjesečni izvještaj o isporučenim leadovima": {
      implemented: true,
      summary: "Mjesečni izvještaj o isporučenim leadovima automatski generira i šalje klijentima detaljne izvještaje o isporučenim leadovima u obračunskom periodu, uključujući statistike, trendove i billing informacije.",
      details: `**✅ POTPUNO IMPLEMENTIRANO**: Mjesečni izvještaji se automatski generiraju i šalju emailom svim aktivnim korisnicima na početku svakog mjeseca. Izvještaji uključuju statistike, trendove i billing informacije.

**Kako funkcionira**
- Mjesečni izvještaj se automatski generira na kraju svakog obračunskog perioda (obično mjesec dana).
- Izvještaj uključuje detaljne informacije o isporučenim leadovima: ukupan broj, po kategorijama, po regijama, konverzija, ROI.
- Izvještaj prikazuje usporedbu očekivanog i isporučenog volumena leadova s grafikonskim prikazom.
- Izvještaj uključuje billing informacije: fakture, kredite, adjustment-e, i ukupne troškove.
- Izvještaj se automatski šalje klijentima putem emaila i dostupan je u billing dashboardu.

**Prednosti**
- Omogućava klijentima detaljan pregled performansi i isporučenih leadova.
- Poboljšava transparentnost između platforme i klijenata kroz detaljne izvještaje.
- Pomaže klijentima u analizi ROI-ja i optimizaciji budžeta.
- Automatski generirani izvještaji štede vrijeme i osiguravaju dosljednost.
- Pruža klijentima podatke potrebne za donošenje informiranih odluka.

**Kada koristiti**
- Za praćenje performansi i isporučenih leadova u obračunskom periodu.
- Za analizu ROI-ja i optimizaciju budžeta.
- Za pregled billing informacija i troškova.
- Za donošenje informiranih odluka o budućim investicijama.
- Za komunikaciju s timom o performansama i rezultatima.
`,
      technicalDetails: `**Frontend**
- Klijenti vide mjesečne izvještaje u billing dashboardu s detaljnim grafikonskim prikazom.
- Dashboard prikazuje statistike o isporučenim leadovima: ukupan broj, po kategorijama, po regijama, konverzija, ROI.
- Mogućnost preuzimanja izvještaja u PDF ili Excel formatu.
- Prikaz usporedbe očekivanog i isporučenog volumena leadova s grafikonskim prikazom.
- Email notifikacija s linkom na izvještaj u dashboardu.

**Backend**
- \`report-generator.js\` - \`generateMonthlyReport\` generira mjesečni izvještaj za svakog klijenta s detaljnim statistikama, trendovima i billing informacijama.
- \`monthly-report-service.js\` - Servis za slanje mjesečnih izvještaja emailom:
  - \`sendMonthlyReport\` - Šalje izvještaj određenom korisniku
  - \`sendMonthlyReportsToAllUsers\` - Šalje izvještaje svim aktivnim korisnicima
- Cron job u \`queueScheduler.js\` pokreće se 1. dana u mjesecu u 9:00 i automatski šalje izvještaje za prošli mjesec.
- Algoritam agregira podatke o isporučenim leadovima iz LeadPurchase, CreditTransaction i BillingAdjustment tablica.
- Email template uključuje HTML formatirani izvještaj s statistikama, trendovima i billing informacijama.

**Baza**
- \`LeadPurchase\` tablica sadrži sve kupljene leadove koje se koriste za izračun statistika.
- \`CreditTransaction\` tablica bilježi sve transakcije kredita za period.
- \`BillingPlan\` tablica definira očekivani volumen leadova po planu.
- \`BillingAdjustment\` tablica sadrži podatke o isporučenim leadovima (deliveredLeads, expectedLeads, periodStart, periodEnd, adjustmentType, adjustmentCredits).
- Podaci se agregiraju u realnom vremenu pri generiranju izvještaja (nema cache tablice).

**API**
- \`GET /api/roi/monthly-stats\` – vraća mjesečni izvještaj za određeni period (query: year, month, format: json|pdf|csv).
- \`POST /api/roi/send-monthly-report\` – ručno pošalji mjesečni izvještaj emailom (body: year?, month?).
- \`POST /api/admin/reports/send-monthly-reports\` – pošalji mjesečne izvještaje svim aktivnim korisnicima (admin only, body: year?, month?).
- \`POST /api/admin/reports/send-monthly-report/:userId\` – pošalji mjesečni izvještaj određenom korisniku (admin only, body: year?, month?).
      `
    },
    "Carryover neiskorištenih leadova": {
      implemented: true,
      summary: "Carryover neiskorištenih leadova omogućava da se neiskorišteni leadovi iz jednog obračunskog perioda prenesu u sljedeći period, što osigurava da klijenti ne gube leadove koje nisu iskoristili.",
      details: `**Kako funkcionira**
- Carryover se aktivira kada u obračunskom periodu nije isporučeno dovoljno leadova u odnosu na očekivani volumen (deliveredLeads < expectedLeads).
- Neiskorišteni leadovi se automatski prenose u sljedeći obračunski period kao carryoverLeads.
- U sljedećem periodu, efektivni očekivani volumen = baza (expectedLeads) + carryoverLeads iz prethodnog perioda.
- Carryover se izračunava na temelju razlike između očekivanog i isporučenog volumena leadova.
- Carryover se primjenjuje samo ako je omogućen na BillingPlan-u (carryoverEnabled = true).

**Prednosti**
- Osigurava da klijenti ne gube leadove koje nisu iskoristili u jednom periodu.
- Omogućava fleksibilnost u korištenju leadova kroz različite periode.
- Poboljšava iskustvo klijenata osiguravajući da dobivaju punu vrijednost svojih paketa.
- Transparentan sustav koji gradi povjerenje između platforme i klijenata.
- Potiče klijente da ostanu na platformi čak i kada ne iskoriste sve leadove u jednom periodu.

**Kada koristiti**
- Za osiguravanje da klijenti ne gube leadove koje nisu iskoristili.
- Za omogućavanje fleksibilnosti u korištenju leadova kroz različite periode.
- Za poboljšanje iskustva klijenata osiguravajući da dobivaju punu vrijednost svojih paketa.
- Za izgradnju povjerenja između platforme i klijenata kroz transparentan sustav.
- Za poticanje klijenata da ostanu na platformi čak i kada ne iskoriste sve leadove u jednom periodu.
`,
      technicalDetails: `**Frontend**
- Klijenti vide carryover leadove u billing dashboardu s oznakom "Carryover".
- Dashboard prikazuje efektivni očekivani volumen (baza + carryover) za trenutni period.
- Prikaz povijesti carryover leadova i kako su se prenosili kroz periode.
- Mogućnost pregleda carryover leadova i njihovog korištenja u sljedećem periodu.

**Backend**
- \`billingAdjustmentService.calculateAdjustmentForPlan\` izračunava carryover na temelju razlike između očekivanog i isporučenog volumena.
- Algoritam automatski prenosi neiskorištene leadove u sljedeći period (nextCarryoverLeads = max(0, expectedLeads - deliveredLeads)).
- Carryover se ažurira u BillingPlan tablici (carryoverLeads) na kraju svakog obračunskog perioda.
- Carryover se primjenjuje samo ako je omogućen na BillingPlan-u (carryoverEnabled = true).
- Event \`billing.carryover.updated\` informira ostale servise o ažuriranom carryover-u.

**Baza**
- \`BillingPlan\` tablica čuva carryover leadove (carryoverLeads, carryoverEnabled) za svaki plan.
- \`BillingAdjustment\` tablica bilježi adjustment-e s informacijama o carryover-u (expectedLeads, deliveredLeads, realValueFactor).
- \`CarryoverHistory\` tablica bilježi povijest carryover leadova (billingPlanId, periodStart, periodEnd, carryoverLeads, usedLeads).
- Carryover metrike se cacheiraju radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/director/billing/carryover\` – vraća trenutne carryover leadove za određeni plan.
- \`GET /api/director/billing/carryover-history\` – vraća povijest carryover leadova.
- \`POST /api/admin/billing/plans/:id/carryover\` – omogućava/onemogućava carryover za određeni plan (admin only).
- \`GET /api/admin/billing/carryover-stats\` – vraća statistike o carryover leadovima (admin only).
      `
    },
    "Pauziranje kategorije bez naplate": {
      implemented: true,
      summary: "Pauziranje kategorije bez naplate omogućava klijentima da privremeno pauziraju primanje leadova iz određene kategorije bez naplate za tu kategoriju u obračunskom periodu.",
      details: `**Kako funkcionira**
- Pauziranje kategorije se aktivira postavljanjem BillingPlan.isPaused = true za određenu kategoriju.
- Kada je kategorija pauzirana, klijent ne prima leadove iz te kategorije u obračunskom periodu.
- Pauzirana kategorija se ne naplaćuje u obračunskom periodu, što znači da se ne računaju expectedLeads za tu kategoriju.
- Klijent može ponovno aktivirati kategoriju postavljanjem isPaused = false, nakon čega se kategorija ponovno uključuje u obračun.
- Pauziranje kategorije ne utječe na druge kategorije koje nisu pauzirane.

**Prednosti**
- Omogućava klijentima da privremeno pauziraju primanje leadova iz određene kategorije bez gubitka novca.
- Osigurava da klijenti ne plaćaju za kategorije koje trenutno ne koriste.
- Poboljšava iskustvo klijenata omogućavajući im fleksibilnost u upravljanju kategorijama.
- Transparentan sustav koji gradi povjerenje između platforme i klijenata.
- Potiče klijente da ostanu na platformi čak i kada privremeno ne koriste određene kategorije.

**Kada koristiti**
- Za privremeno pauziranje primanja leadova iz određene kategorije.
- Za izbjegavanje naplate za kategorije koje trenutno ne koristite.
- Za optimizaciju budžeta pauziranjem kategorija koje trenutno nisu prioritetne.
- Za testiranje novih kategorija bez obveze dugotrajne naplate.
- Za privremeno smanjenje troškova tijekom sezonskih promjena ili reorganizacije poslovanja.
`,
      technicalDetails: `**Frontend**
- Klijenti vide opciju za pauziranje kategorije u billing dashboardu.
- Dashboard prikazuje status svake kategorije (aktivna/pauzirana) s mogućnošću promjene.
- Prikaz upozorenja kada je kategorija pauzirana i ne prima leadove.
- Mogućnost ponovnog aktiviranja pauzirane kategorije jednim klikom.

**Backend**
- \`billingAdjustmentService.calculateBillingAdjustmentsForPeriod\` filtrira pauzirane planove (isPaused = false).
- Pauzirani planovi se ne obračunavaju u obračunskom periodu, što znači da se ne računaju expectedLeads za tu kategoriju.
- \`billingPlanService.pauseCategory\` postavlja isPaused = true za određenu kategoriju.
- \`billingPlanService.resumeCategory\` postavlja isPaused = false za određenu kategoriju.
- Event \`billing.category.paused\` i \`billing.category.resumed\` informiraju ostale servise o promjeni statusa.

**Baza**
- \`BillingPlan\` tablica čuva status pauziranja (isPaused) za svaki plan po kategoriji.
- \`BillingAdjustment\` tablica ne bilježi adjustment-e za pauzirane planove jer se ne obračunavaju.
- \`CategoryPauseHistory\` tablica bilježi povijest pauziranja kategorija (billingPlanId, categoryId, pausedAt, resumedAt, reason).
- Pauzirani status se cacheira radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`POST /api/director/billing/plans/:id/pause\` – pauzira kategoriju za određeni plan.
- \`POST /api/director/billing/plans/:id/resume\` – ponovno aktivira pauziranu kategoriju.
- \`GET /api/director/billing/plans/:id/status\` – vraća status svih kategorija (aktivne/pauzirane).
- \`GET /api/admin/billing/paused-categories\` – vraća listu svih pauziranih kategorija (admin only).
      `
    },
    "Hijerarhijski model paketa (Basic → Pro → Premium)": {
      implemented: true,
      summary: "Hijerarhijski model paketa omogućava korisnicima da odaberu i napreduju kroz tri razine paketa (Basic → Pro → Premium), svaki s različitim cijenama, kreditima i funkcionalnostima.",
      details: `**Kako funkcionira**
- Hijerarhijski model paketa sastoji se od tri razine: Basic, Pro i Premium, svaki s različitim cijenama i beneficijama.
- Korisnici mogu odabrati bilo koji paket pri registraciji ili nadograditi postojeći paket na višu razinu.
- Svaki paket ima određenu mjesečnu cijenu, alokaciju kredita i pristup različitim funkcionalnostima.
- Basic paket nudi osnovne funkcionalnosti i najmanju alokaciju kredita.
- Pro paket nudi napredne funkcionalnosti, veću alokaciju kredita i prioritetnu podršku.
- Premium paket nudi sve funkcionalnosti, najveću alokaciju kredita, ekskluzivne benefite i VIP podršku.
- Korisnici mogu nadograditi paket u bilo kojem trenutku, a razlika u cijeni se naplaćuje proporcionalno.

**Prednosti**
- Omogućava korisnicima da odaberu paket koji najbolje odgovara njihovim potrebama i budžetu.
- Fleksibilnost u nadogradnji paketa kako rastu potrebe korisnika.
- Jasna hijerarhija paketa olakšava razumijevanje opcija i donošenje odluka.
- Poboljšava iskustvo korisnika omogućavajući im da počnu s osnovnim paketom i napreduju prema višim razinama.
- Transparentan sustav cijena i benefita gradi povjerenje između platforme i korisnika.

**Kada koristiti**
- Za odabir paketa koji najbolje odgovara vašim potrebama i budžetu.
- Za početak s osnovnim paketom i napredovanje prema višim razinama kako rastu potrebe.
- Za pristup naprednim funkcionalnostima i većoj alokaciji kredita.
- Za dobivanje prioritetne ili VIP podrške za važne projekte.
- Za optimizaciju troškova kroz odabir paketa koji najbolje odgovara vašim potrebama.
`,
      technicalDetails: `**Frontend**
- Komponenta \`SubscriptionPlans\` prikazuje usporedbu sva tri paketa (Basic, Pro, Premium) s cijenama i beneficijama.
- Dashboard prikazuje trenutni paket korisnika s mogućnošću nadogradnje.
- Checkout proces koristi Stripe modal za plaćanje odabranog paketa.
- Prikaz razlika između paketa i preporuka za nadogradnju na temelju korištenja.

**Backend**
- \`subscriptionService.getPlans\` vraća listu svih dostupnih paketa s cijenama i beneficijama.
- \`subscriptionService.activatePlan\` aktivira odabrani paket i sinkronizira rezultat plaćanja.
- \`subscriptionService.upgradePlan\` omogućava nadogradnju paketa s proporcionalnom naplatom razlike.
- \`creditService.addCredits\` dodaje kredite prema alokaciji odabranog paketa.
- Event \`subscription.plan.activated\` i \`subscription.plan.upgraded\` informiraju ostale servise o promjeni paketa.

**Baza**
- \`SubscriptionPlan\` tablica definira pakete (code: BASIC/PRO/PREMIUM, price, credits, features JSONB).
- \`Subscription\` tablica čuva aktivni paket korisnika (userId, plan, status, stripeSubscriptionId, currentPeriodEnd).
- \`SubscriptionHistory\` tablica bilježi povijest promjena paketa (userId, plan, action, occurredAt, actor).
- \`PlanFeature\` tablica definira funkcionalnosti po paketu (planCode, featureCode, enabled, limit).
- Paketi se cacheiraju radi bržeg pristupa i smanjenja opterećenja baze.

**API**
- \`GET /api/subscriptions/plans\` – vraća listu svih dostupnih paketa s cijenama i beneficijama.
- \`POST /api/subscriptions\` – aktivira odabrani paket (zahtijeva planCode i Stripe payment).
- \`GET /api/subscriptions/plans/:code\` – vraća detalje određenog paketa (Basic, Pro ili Premium).
- \`POST /api/subscriptions/upgrade\` – nadograđuje paket na višu razinu (zahtijeva planCode).
- \`GET /api/subscriptions/me\` – vraća trenutni paket korisnika s detaljima i datumom isteka.
      `
    },
    "Segmentni model paketa (po regiji/kategoriji)": {
      implemented: true,
      summary: "Segmentni model paketa omogućava definiranje različitih paketa prema regijama ili kategorijama, što omogućava fleksibilniju strukturu paketa prilagođenu specifičnim tržišnim potrebama.",
      details: `**Kako funkcionira**
- Segmentni model paketa omogućava definiranje različitih paketa za različite regije ili kategorije usluga.
- Svaki segment (regija ili kategorija) može imati svoj set paketa s različitim cijenama i beneficijama.
- Korisnici mogu odabrati paket specifičan za njihovu regiju ili kategoriju interesa.
- Segmentni paketi mogu imati različite cijene za istu razinu funkcionalnosti ovisno o regiji ili kategoriji.
- Model omogućava lokalizaciju cijena i benefita prema specifičnim tržišnim uvjetima.
- Korisnici mogu kombinirati pakete iz različitih segmenata za kompletnu pokrivenost.

**Prednosti**
- Omogućava prilagođavanje paketa specifičnim tržišnim potrebama po regijama ili kategorijama.
- Fleksibilnost u definiranju cijena i benefita prema lokalnim tržišnim uvjetima.
- Poboljšava iskustvo korisnika omogućavajući im da odaberu pakete relevantne za njihovu regiju ili kategoriju.
- Omogućava optimizaciju cijena i benefita za različite segmente tržišta.
- Transparentan sustav koji gradi povjerenje kroz lokalizirane opcije paketa.

**Kada koristiti**
- Za prilagođavanje paketa specifičnim tržišnim potrebama po regijama.
- Za definiranje različitih paketa za različite kategorije usluga.
- Za optimizaciju cijena i benefita prema lokalnim tržišnim uvjetima.
- Za pružanje relevantnijih opcija paketa korisnicima u različitim regijama.
- Za fleksibilniju strukturu paketa koja odgovara specifičnim potrebama tržišta.
`,
      technicalDetails: `**Frontend**
- Komponenta \`SubscriptionPlans\` može prikazati pakete filtrirane po regiji ili kategoriji koristeći query parametre.
- Filter panel može omogućiti filtriranje paketa po regijama ili kategorijama.
- Prikaz usporedbe paketa unutar istog segmenta s cijenama i beneficijama.

**Backend**
- \`GET /api/subscriptions/plans\` podržava query parametre \`?categoryId=xxx&region=Zagreb\` za filtriranje segmentiranih paketa.
- Funkcija \`getPlansFromDB(filters)\` u \`subscriptions.js\` vraća pakete filtrirane po kategoriji i/ili regiji.
- API automatski uključuje informacije o kategoriji u odgovoru.

**Baza**
- \`SubscriptionPlan\` model proširen s poljima \`categoryId\` (String?) i \`region\` (String?).
- Unique constraint na kombinaciji \`(name, categoryId, region)\` omogućava više paketa s istim imenom ali različitim segmentacijama.
- Foreign key na \`Category\` tablicu osigurava referencijalnu integritet.
- Indeksi na \`categoryId\`, \`region\` i kompozitni \`(categoryId, region)\` za brže pretraživanje.
- Migracija: \`20251118123434_add_segmented_package_model/migration.sql\`

**API**
- \`GET /api/subscriptions/plans\` – vraća sve pakete (osnovni + segmentirani).
- \`GET /api/subscriptions/plans?categoryId=xxx\` – vraća pakete za određenu kategoriju.
- \`GET /api/subscriptions/plans?region=Zagreb\` – vraća pakete za određenu regiju.
- \`GET /api/subscriptions/plans?categoryId=xxx&region=Zagreb\` – kombinirano filtriranje.
- Odgovor uključuje \`category\` objekt s informacijama o kategoriji ako je paket segmentiran po kategoriji.

**Seed Podaci**
- Osnovni paketi (BASIC, PREMIUM, PRO) s \`categoryId: null\` i \`region: null\`.
- Primjeri segmentiranih paketa:
  - PREMIUM - Građevina Zagreb
  - PRO - IT Dalmacija
  - BASIC - Arhitekti Istra
      `
    },
    "Chat-bot vodi za prvi lead": {
      implemented: true,
      summary: "Interaktivni chat-bot koji vodi novog korisnika kroz prvi lead - od kupnje do završetka posla.",
      details: `**Kako funkcionira**
- Chat-bot se automatski pokreće kada korisnik kupi svoj prvi lead.
- Vodi korisnika kroz 5 koraka: kupnja leada, kontaktiranje klijenta, slanje poruke, priprema ponude, slanje ponude.
- Svaki korak ima svoju poruku i akciju koja vodi korisnika dalje.
- Chat-bot se automatski napreduje na temelju korisnikovih akcija (kupnja leada, slanje poruke, slanje ponude).

**Prednosti**
- Poboljšava iskustvo novih korisnika vodeći ih kroz prvi lead korak po korak.
- Smanjuje konfuziju i pomaže korisnicima da brzo počnu raditi s leadovima.
- Povećava konverziju prvog leada i zadržavanje korisnika.

**Kada koristiti**
- Automatski se pokreće za sve nove korisnike koji kupuju prvi lead.
- Korisnik može ručno završiti chat-bot sesiju ako želi.
`,
      technicalDetails: `**Backend Implementacija**
- \`services/chatbot-service.js\`: Servis za upravljanje chat-bot sesijama.
- \`routes/chatbot.js\`: API endpoint-i za chat-bot interakciju.
- \`ChatbotSession\` model: Čuva sesiju chat-bota (providerId, jobId, currentStep, status).

**Baza**
- \`ChatbotSession\` model: \`providerId\`, \`jobId\`, \`currentStep\` (1-5), \`status\` (ACTIVE, COMPLETED, CANCELLED), \`lastTrigger\`, \`lastTriggeredAt\`.
- \`ChatRoom\` model: \`isBotRoom\` (Boolean) - označava chat-bot sobu.
- \`ChatMessage\` model: \`isBotMessage\` (Boolean), \`botAction\` (String?) - akcija bot poruke.

**Logika**
- Chat-bot se pokreće automatski u \`lead-service.js\` kada se kupi prvi lead.
- Provjerava se da li je ovo prvi lead korisnika (\`isFirstLead\`).
- Chat-bot se napreduje automatski na temelju triggera:
  - \`LEAD_PURCHASED\` - kada se kupi lead
  - \`CONTACT_CLIENT\` - kada se kontaktira klijent
  - \`SEND_MESSAGE\` - kada se pošalje chat poruka
  - \`SEND_OFFER\` - kada se pošalje ponuda

**API**
- \`GET /api/chatbot/session\` – dohvat trenutne chat-bot sesije (auth required, PROVIDER only).
- \`POST /api/chatbot/advance\` – napredak na sljedeći korak (auth required, PROVIDER only, body: { trigger: string }).
- \`POST /api/chatbot/complete\` – završetak chat-bot sesije (auth required, PROVIDER only).

**Integracija**
- \`lead-service.js\`: Pokreće chat-bot nakon kupnje prvog leada.
- \`socket.js\`: Napreduje chat-bot kada se pošalje chat poruka.
- \`offers.js\`: Napreduje chat-bot kada se pošalje ponuda.
- \`lead-service.js\`: Napreduje chat-bot kada se kontaktira klijent.

**Chat-bot koraci**
1. **LEAD_PURCHASED**: "🎉 Čestitamo! Kupili ste svoj prvi lead..."
2. **CONTACT_CLIENT**: "💬 Kontaktirajte klijenta putem chat-a..."
3. **SEND_MESSAGE**: "✅ Odlično! Poslali ste poruku klijentu..."
4. **PREPARE_OFFER**: "📋 Pripremite detaljnu ponudu..."
5. **SEND_OFFER**: "🚀 Poslali ste ponudu!..."

**Validacija**
- Chat-bot se pokreće samo za prvi lead korisnika.
- Chat-bot se ne pokreće ako već postoji aktivna sesija.
- Chat-bot se automatski završava nakon 5. koraka.
      `
    }
  };

async function seedDocumentation() {
  console.log(`🌱 Počinje seed dokumentacije... Ukupno kategorija: ${features.length}`);

  // Provjeri da li tablice postoje
  try {
    await prisma.$queryRaw`SELECT 1 FROM "DocumentationCategory" LIMIT 1`;
    await prisma.$queryRaw`SELECT 1 FROM "DocumentationFeature" LIMIT 1`;
    console.log('✅ Tablice DocumentationCategory i DocumentationFeature postoje');
  } catch (error) {
    console.error('❌ Tablice ne postoje! Prvo primijeni migraciju:');
    console.error('   npx prisma migrate dev --name add_documentation_models');
    throw new Error('Tablice ne postoje - primijeni migraciju prvo');
  }

  let categoriesCreated = 0;
  let categoriesUpdated = 0;
  let featuresCreated = 0;
  let featuresUpdated = 0;
  let totalFeatures = 0;
  let implementedFeatures = 0;

  try {
    for (let catIndex = 0; catIndex < features.length; catIndex++) {
      const categoryData = features[catIndex];
      
      const category = await prisma.documentationCategory.upsert({
        where: { name: categoryData.category },
        update: { order: catIndex, isActive: true },
        create: { name: categoryData.category, order: catIndex, isActive: true }
      });

      const wasJustCreated = category.createdAt.getTime() === category.updatedAt.getTime();
      if (wasJustCreated) categoriesCreated++; else categoriesUpdated++;

      console.log(`✅ Kategorija: ${categoryData.category}`);

      if (categoryData.items && Array.isArray(categoryData.items)) {
        for (let itemIndex = 0; itemIndex < categoryData.items.length; itemIndex++) {
          const item = categoryData.items[itemIndex];
          const description = featureDescriptions[item.name];

          // Ako je djelomično implementirano, dodaj komentar u summary
          let summary = description?.summary || null;
          if (item.partiallyImplemented && summary) {
            summary = `⚠️ DJELOMIČNO IMPLEMENTIRANO: ${summary}`;
          } else if (item.partiallyImplemented && !summary) {
            summary = '⚠️ DJELOMIČNO IMPLEMENTIRANO';
          }

          const featureData = {
            categoryId: category.id,
            name: item.name,
            implemented: item.implemented !== undefined ? item.implemented : true,
            deprecated: item.deprecated || false,
            isAdminOnly: item.isAdminOnly || false, // Admin-only flag
            order: itemIndex,
            summary: summary,
            details: description?.details || null,
            technicalDetails: description?.technicalDetails || null // Tehnički opis (samo admin)
          };

          const existing = await prisma.documentationFeature.findFirst({
            where: { categoryId: category.id, name: item.name }
          });

          if (existing) {
            await prisma.documentationFeature.update({
              where: { id: existing.id },
              data: featureData
            });
            featuresUpdated++;
          } else {
            await prisma.documentationFeature.create({ data: featureData });
            featuresCreated++;
          }
          
          totalFeatures++;
          if (item.implemented) implementedFeatures++;
        }
      }
    }

    // Eksplicitno osiguraj da "Direktor Dashboard - upravljanje timovima" u bazi
    // ima ažuriran summary/details iz featureDescriptions, čak i ako je prethodno
    // kreiran bez opisa ili u drugoj kategoriji.
    const direktorTeamDesc = featureDescriptions['Direktor Dashboard - upravljanje timovima'];
    if (direktorTeamDesc) {
      const updatedCount = await prisma.documentationFeature.updateMany({
        where: { name: 'Direktor Dashboard - upravljanje timovima' },
        data: {
          summary: direktorTeamDesc.summary || null,
          details: direktorTeamDesc.details || null,
          implemented: direktorTeamDesc.implemented ?? true,
          isAdminOnly: false
        }
      });
      console.log(`🔄 Sync "Direktor Dashboard - upravljanje timovima" opis u bazi (updateMany count = ${updatedCount}).`);
    } else {
      console.warn('⚠️ featureDescriptions nema ključ "Direktor Dashboard - upravljanje timovima" – provjeri seed-documentation.js.');
    }

    // === ADMIN-ONLY FUNKCIONALNOSTI ===
    console.log('');
    console.log('🔐 Seeding admin-only funkcionalnosti...');
    
    const adminFeatures = [
      {
        category: "Upravljanje Korisnicima i Pružateljima",
        items: [
          { name: "Upravljanje korisnicima", implemented: true, isAdminOnly: true },
          { name: "Upravljanje pružateljima", implemented: true, isAdminOnly: true },
          { name: "Upravljanje kategorijama", implemented: true, isAdminOnly: true },
          { name: "Upravljanje pravnim statusima", implemented: true, isAdminOnly: true }
        ]
      },
      {
        category: "Upravljanje Sadržajem",
        items: [
          { name: "Upravljanje poslovima", implemented: true, isAdminOnly: true },
          { name: "Upravljanje ponudama", implemented: true, isAdminOnly: true },
          { name: "Admin upravljanje recenzijama", implemented: true, isAdminOnly: true },
          { name: "Upravljanje notifikacijama", implemented: true, isAdminOnly: true },
          { name: "Upravljanje chat sobama", implemented: true, isAdminOnly: true },
          { name: "Moderacija sadržaja", implemented: true, isAdminOnly: true },
          { name: "Pregled SMS logova", implemented: true, isAdminOnly: true }
        ]
      },
      {
        category: "Upravljanje Pretplatama i Transakcijama",
        items: [
          { name: "Upravljanje pretplatama", implemented: true, isAdminOnly: true },
          { name: "Upravljanje transakcijama kredita", implemented: true, isAdminOnly: true },
          { name: "Admin odobravanje refund-a", implemented: true, isAdminOnly: true },
          { name: "Admin upravljanje queue sustavom", implemented: true, isAdminOnly: true },
          { name: "Upravljanje ROI statistikama", implemented: true, isAdminOnly: true },
          { name: "Upravljanje PDF faktura i S3 storage", implemented: true, isAdminOnly: true },
          { name: "Database Editor - Vizualni pristup bazi podataka", implemented: true, isAdminOnly: true },
          { name: "API Reference - Popis svih API endpointa", implemented: true, isAdminOnly: true }
        ]
      },
      {
        category: "Verifikacije i Licence",
        items: [
          { name: "Upravljanje licencama", implemented: true, isAdminOnly: true },
          { name: "Verificiranje licenci od strane admina", implemented: true, isAdminOnly: true },
          { name: "Upravljanje verifikacijama klijenata", implemented: true, isAdminOnly: true },
          { name: "Dokumenti za verifikaciju", implemented: true, isAdminOnly: true },
          { name: "Admin reset SMS pokušaja", implemented: true, isAdminOnly: true }
        ]
      },
      {
        category: "Statistike i Analitika",
        items: [
          { name: "Statistike platforme", implemented: true, isAdminOnly: true },
          { name: "Grafički prikaz statistika", implemented: true, isAdminOnly: true },
          { name: "KYC Metrike", implemented: true, isAdminOnly: true },
          { name: "Provider Approvals", implemented: true, isAdminOnly: true },
          { name: "Audit Logs", implemented: true, isAdminOnly: true },
          { name: "API Request Logs", implemented: true, isAdminOnly: true },
          { name: "Error Logs", implemented: true, isAdminOnly: true },
          { name: "Addon Event Logs", implemented: true, isAdminOnly: true },
          { name: "SMS Logs", implemented: true, isAdminOnly: true }
        ]
      }
    ];

    const adminFeatureDescriptions = {
      "Upravljanje korisnicima": {
        summary: "Admin panel za upravljanje svim korisnicima platforme",
        details: `## Kako funkcionira:

**Pregled korisnika**
- Filtriranje i pretraživanje po emailu, imenu, statusu i ulozi
- Kartica s detaljima (kontakt podaci, verifikacije, pravni status, aktivnosti)
- Evidencija povijesti prijava, transakcija i aktivnosti

**Upravljanje statusima**
- Aktivacija i deaktivacija korisničkih računa
- Promjena uloga (USER, PROVIDER, ADMIN)
- Reset lozinke od strane administratora
- Blokiranje i odblokiranje korisnika

**Verifikacije**
- Pregled svih verifikacijskih statusa (email, telefon, identitet, tvrtka)
- Ručno odobravanje verifikacija i reset pokušaja (npr. SMS kodovi)
- Pregled i preuzimanje priloženih dokumenata

**Statistike korisnika**
- Broj kreiranih poslova i aktivnih pretplata
- Trenutna kreditna bilanca i povijest transakcija
- Trust score, reputacija i razina aktivnosti
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminUsers.jsx'
- Ruta: '/admin/users'
- Biblioteke: React, React Router, Axios
- Upravljanje stanjem: useState, useEffect
- Tablični prikaz s paginacijom, sortiranjem i izvozom CSV-a

### Backend:
- Ruta: 'uslugar/backend/src/routes/admin.js'
- Middleware: auth(true, ['ADMIN']) provjerava administratorsku rolu
- Servis koristi Prisma upite nad modelom 'User' s eager loadingom relacija
- Validacija ulaza preko Joi/express-validator sloja

### Baza:
- Tablice: 'User', 'ProviderProfile', 'ClientVerification', 'CreditTransaction'
- Indeksi: @@index([email, role]), @@index([role])
- Relacije: User → ProviderProfile, User → ClientVerification

### API poziv:
- GET /api/admin/users (parametri: page, limit, search, role)
- GET /api/admin/users/:id (vraća korisnika s relacijama)
- PUT /api/admin/users/:id (ažurira osnovne podatke i ulogu)
- POST /api/admin/users/:id/reset-password (generira novi reset token)
`
        },
      "Upravljanje pružateljima": {
        summary: "Kompletan admin panel za upravljanje pružateljima usluga",
        details: `## Kako funkcionira:

**Pregled pružatelja**
- Napredno filtriranje po nazivu, kategoriji, regiji i statusu odobrenja
- Uvid u profil: opis, pokrivene kategorije, lokacije, ocjene i status verifikacija
- Pregled svih licenci, certifikata i KYC dokumenata na jednom mjestu

**Odobravanje profila**
- Upravljanje statusima (WAITING_FOR_APPROVAL, APPROVED, REJECTED)
- Aktivacija i deaktivacija profila
- Isticanje (featured) pružatelja za marketing kampanje
- Pregled novih registracija uz mogućnost odobrenja ili odbijanja

**Praćenje performansi**
- ROI metrike po pružatelju (konverzija, prihod, profitabilnost)
- Benchmarking prema drugim pružateljima u istoj kategoriji
- Mjesečni i godišnji izvještaji s trend analizom

**Upravljanje licencama i KYC-om**
- Verifikacija uploadanih licenci i certifikata
- Praćenje isteka licenci uz automatske notifikacije
- Provjera OIB-a, bankovnih podataka i ostalih KYC dokumenata
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminProviders.jsx'
- Ruta: '/admin/providers'
- Upravljanje stanjem: useState i useEffect
- Napredno filtriranje i tablični prikaz s paginacijom

### Backend:
- Ruta: 'uslugar/backend/src/routes/admin.js'
- Middleware: auth(true, ['ADMIN'])
- Servis koristi Prisma nad modelima 'ProviderProfile' i povezanim licencama

### Baza:
- Tablice: 'ProviderProfile', 'User', 'ProviderLicense', 'ProviderROI'
- Ključni indeksi: @@index([userId]), @@index([approvalStatus])
- Relacije: ProviderProfile → User, ProviderProfile → ProviderLicense

### API poziv:
- GET /api/admin/providers (parametri: search, categoryId, approvalStatus)
- PUT /api/admin/providers/:id/approval (payload: { approvalStatus, notes })
- GET /api/admin/providers/:id/roi vraća ROI i trend grafove
`
      },
      "Statistike platforme": {
        summary: "Sveobuhvatne statistike i analitika za cijelu platformu",
        details: `## Kako funkcionira:

**Opće metrike**
- Ukupan broj korisnika i pružatelja s podjelom po ulogama
- Ukupni poslovi, leadovi i aktivne pretplate po planovima
- Prihod platforme (MRR, ARR) te prosječna vrijednost transakcije

**Trend izvještaji**
- Mjesečni trendovi (novi korisnici, prihod, aktivnost)
- Forecast i usporedbe po mjesecima
- Churn i retention metrike za praćenje zdravlja platforme

**Analiza po kategorijama**
- Najpopularnije kategorije usluga
- Prihod i konverzije po kategoriji
- Prosječne cijene i ROI za svaku kategoriju

**Engagement metrike**
- Aktivni korisnici (DAU, WAU, MAU)
- Broj recenzija i prosječne ocjene
- Aktivnost u chatu i konverzijski lijevak

**Dashboard komponente**
- Kombinacija linijskih, stupčastih i kružnih grafova (Chart.js)
- Interaktivni tooltips, filtriranje i preuzimanje izvještaja
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminPlatformStats.jsx'
- Ruta: '/admin/stats'
- Biblioteka grafova: Chart.js (react-chartjs-2 wrapper)
- Upravljanje stanjem: useState i useEffect, dodatno memoriranje kroz SWR/React Query

### Backend:
- Servis: 'uslugar/backend/src/services/platform-stats-service.js'
- Ruta: '/api/admin/platform-stats'
- Middleware: auth(true, ['ADMIN'])
- Rezultati se cacheiraju 5 minuta radi performansi

### Baza:
- Izvori podataka: 'User', 'Job', 'Subscription', 'CreditTransaction', 'LeadPurchase'
- Agregacije koriste SUM/COUNT/AVG s indeksima na ključnim poljima
- Materializirani pogledi za mjesečne i kategorijske presjeke

### API poziv:
- GET /api/admin/platform-stats (sve metrike u jednom odgovoru)
- GET /api/admin/platform-stats?type=monthly (mjesečni presjek)
- GET /api/admin/platform-stats?type=category (statistike po kategorijama)
`
      },
      "Grafički prikaz statistika": {
        summary: "Interaktivni grafički prikaz svih statistika platforme",
        details: `## Kako funkcionira:

**Biblioteke i podržani grafovi**
- Chart.js kao osnovna biblioteka
- react-chartjs-2 kao React wrapper
- Podrška za linijske, stupčaste, kružne i kombinirane grafove

**Komponente ROI dashboarda**
- Status Breakdown (doughnut graf) za prikaz konvertiranih, kontaktiranih, aktivnih i refundiranih leadova
- Monthly Revenue & ROI (line graf) s dvostrukom Y-osy i projekcijama
- Monthly Leads (grouped bar graf) s usporedbom kupljenih, kontaktiranih i konvertiranih leadova
- Conversion Rate (line graf) s benchmark linijama
- Category Revenue (stacked bar graf) za top kategorije po prihodu

**Dodatne funkcionalnosti**
- Godišnji selektor za pregled različitih perioda uz automatsko osvježavanje grafova
- Dark mode podrška i responzivan dizajn
- Interaktivni tooltips, eksport grafova (PNG/JPEG) i hover detalji
- Loading i empty state prikazi za svaku komponentu
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponente: 'StatusBreakdownChart', 'MonthlyRevenueChart', 'MonthlyLeadsChart', 'ConversionRateChart', 'CategoryRevenueChart'
- Biblioteke: Chart.js, react-chartjs-2, react-sparklines
- Upravljanje stanjem: useState/useEffect, React Query za dohvat podataka
- Dinamičko mijenjanje palete boja ovisno o light/dark modu

### Backend:
- Servis: 'uslugar/backend/src/services/provider-roi-service.js'
- Ruta: '/api/exclusive/roi/yearly-report'
- Query param 'year' omogućuje dohvat željenog razdoblja
- Cache sloj (Redis 10 min) za najčešće upite

### Baza:
- Tablice: 'ProviderROI', 'LeadPurchase', 'Job', 'CreditTransaction'
- Agregacije: GROUP BY mjesec/kategorija, izračun prosjeka i % promjene
- Indeksi na 'purchasedAt' i 'categoryId' za brže upite

### API poziv:
- GET /api/exclusive/roi/yearly-report?year=2024 vraća { revenue, roi, leads, conversions, byMonth, byCategory }
- Webhook /api/webhooks/analytics-refresh pokreće ručno osvježavanje datasetova
`
      },
      "Upravljanje kategorijama": {
        summary: "CRUD operacije za upravljanje kategorijama usluga",
        details: `## Kako funkcionira:

**CRUD operacije**
- Kreiranje novih kategorija s punim metapodacima (naziv, opis, ikona, NKD kod).
- Uređivanje i soft delete postojećih kategorija uz pregled i filtriranje.

**Hijerarhija i organizacija**
- Podrška za parent/child strukturu, prikaz podkategorija i drag & drop promjenu redoslijeda.
- Pregled se prikazuje rekurzivno kako bi se sagledala čitava struktura.

**Dodatna polja i validacija**
- NKD kodovi, licencne oznake i tijela izdavanja vode se na razini kategorije.
- Validacija jedinstvenosti naziva i referenci (parent mora postojati) osigurava konzistentnost.

**Upravljanje i export**
- Aktivacija/deaktivacija pojedinačnih ili grupnih kategorija te export u CSV.
- Pretrage i filteri omogućuju brzo pronalaženje kategorija prema nazivu, statusu ili licenci.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminCategories.jsx'
- Ruta: '/admin/categories'
- Drag & drop reorganizacija (react-beautiful-dnd) i forme s React Hook Form + yup validacijom
- Pretraga i filteri (status, parent, requiresLicense) + CSV export

### Backend:
- Ruta: '/api/admin/categories'
- Middleware: auth(true, ['ADMIN'])
- Servis 'categoryService' izvršava Prisma transakcije za CRUD i promjene poretka
- Bulk operacije (activate/deactivate) i audit log za administratorske akcije

### Baza:
- Tablica 'Category' (name, description, parentId, nkdCode, requiresLicense, icon, displayOrder)
- Indeksi: @@index([parentId, displayOrder]), @@index([name])
- Constrainti provjeravaju postojanje parent kategorije i jedinstvenost naziva

### Integracije:
- Event 'category.updated' osvježava cache i pretraživački indeks
- NKD kod validacija preko lokalnog registryja (JSON dataset)
- Export servis koristi isti endpoint s query parametrom format=csv

### API poziv:
- GET /api/admin/categories?parentId=&status=
- POST /api/admin/categories (payload: { name, description, icon, parentId?, nkdCode?, requiresLicense?, displayOrder? })
- PUT /api/admin/categories/:id (ažurira metapodatke i displayOrder)
- DELETE /api/admin/categories/:id (soft delete + audit log)
      `
      },
      "Upravljanje pravnim statusima": {
        summary: "Upravljanje pravnim oblicima za registraciju korisnika",
        details: `## Kako funkcionira:

**Definicija statusa**
- Sustav sadrži unaprijed definirane pravne oblike (fizička osoba, obrt, paušalni obrt, d.o.o., j.d.o.o., samostalni djelatnik).
- Administratori mogu proširiti popis i prilagoditi ga lokalnim propisima.

**CRUD operacije**
- Dodavanje novih statusa s opisom i oznakom aktivno/neaktivno.
- Uređivanje naziva, opisa i pripadajućih oznaka.
- Privremena deaktivacija statusa bez gubitka povijesnih podataka.

**Integracija s registracijom**
- Pravni status je obavezno polje pri registraciji pružatelja.
- Povezan je s validacijom OIB-a i KYC procesom.
- Promjena statusa automatski ažurira prikaz u korisničkom profilu i billing modulu.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminLegalStatuses.jsx'
- Ruta: '/admin/legal-statuses'
- Upravljanje stanjem: useState/useEffect, potvrda promjena kroz modal
- Formulari s React Hook Form validacijom (obavezna polja, jedinstven naziv)

### Backend:
- Ruta: '/api/admin/legal-statuses'
- Middleware: auth(true, ['ADMIN'])
- Servis koristi Prisma nad modelom 'LegalStatus' s provjerom referenci prije brisanja

### Baza:
- Tablice: 'LegalStatus', 'User'
- Relacije: User → LegalStatus (legalStatusId), ProviderProfile → LegalStatus
- Indeks: @@index([name]) radi brže validacije jedinstvenosti

### API poziv:
- GET /api/admin/legal-statuses vraća listu s filtrima po statusu
- POST /api/admin/legal-statuses (payload: { name, description, isActive })
- PUT /api/admin/legal-statuses/:id ažurira status i opis
- DELETE /api/admin/legal-statuses/:id deaktivira status ako nije u upotrebi
      `
      },
      "Upravljanje poslovima": {
        summary: "Admin panel za moderaciju i upravljanje poslovima",
        details: `## Kako funkcionira:

**Pregled poslova**
- Centralna lista svih objavljenih poslova s filtrima (status, kategorija, regija, korisnik).
- Kartica s detaljima: opis, budžet, lokacija, priložene slike, povezani korisnici i dodijeljeni pružatelji.

**Moderacija**
- Odobravanje ili odbijanje novih poslova prije objave.
- Uklanjanje neprikladnih ili spam sadržaja te blokiranje korisnika po potrebi.
- Uređivanje osnovnih informacija (naslov, opis, status) u hitnim situacijama.

**Analitika**
- Broj poslova po statusu, kategoriji i regiji.
- Prosječna vrijednost poslova i trend aktivnosti po mjesecima.
- Identificiranje najpopularnijih kategorija i žarišta potražnje.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminJobs.jsx'
- Ruta: '/admin/jobs'
- Filtri i tablični prikaz s paginacijom, uključujući export CSV
- Modal za pregled i uređivanje detalja posla

### Backend:
- Ruta: '/api/admin/jobs'
- Middleware: auth(true, ['ADMIN'])
- Prisma upiti s eager loadingom 'Category', 'User', 'Offer'
- Servis za moderaciju bilježi audit događaje (odobrio, razlog odbijanja)

### Baza:
- Tablice: 'Job', 'User', 'Category', 'Offer'
- Indeksi: @@index([status]), @@index([categoryId]), @@index([createdAt])
- Soft delete implementiran kroz polje 'deletedAt'

### API poziv:
- GET /api/admin/jobs (parametri: status, categoryId, userId, from, to)
- PUT /api/admin/jobs/:id (payload: { status?, title?, description?, moderationNote? })
- DELETE /api/admin/jobs/:id (postavlja deletedAt i bilježi moderatora)
      `
      },
      "Upravljanje ponudama": {
        summary: "Pregled i moderacija ponuda za poslove",
        details: `## Kako funkcionira:

**Pregled ponuda**
- Administratorska lista svih ponuda s filtrima (status, posao, pružatelj, raspon cijene).
- Detaljan prikaz iznosa, poruke, planiranog roka i povijesti pregovora.

**Moderacija i intervencije**
- Ručno odobravanje ili uklanjanje neprikladnih ponuda.
- Ručna promjena statusa (vraćanje na čekanje, odbijanje uz razlog).
- Bilježenje moderatorovih napomena i automatizirano obavještavanje korisnika.

**Analitika**
- Prosječne vrijednosti i stope prihvaćanja po kategorijama i regijama.
- Najaktivniji pružatelji i ponude s ekstremnim vrijednostima za dodatnu provjeru.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminOffers.jsx'
- Ruta: '/admin/offers'
- Filtri po statusu, poslu, pružatelju i rasponu cijene
- Modal prikazuje tijek pregovora i admin bilješke

### Backend:
- Ruta: '/api/admin/offers'
- Middleware: auth(true, ['ADMIN'])
- Servis koristi Prisma s eager loadingom 'Job' i 'ProviderProfile'
- Moderation log bilježi svaku promjenu statusa i napomene

### Baza:
- Tablice: 'Offer', 'Job', 'User'
- Indeksi: @@index([status]), @@index([jobId]), @@index([providerId])
- Soft delete implementiran preko polja 'deletedAt'

### API poziv:
- GET /api/admin/offers (parametri: status, jobId, providerId, priceFrom, priceTo)
- PUT /api/admin/offers/:id (payload: { status?, adminNote?, amount? })
- DELETE /api/admin/offers/:id (postavlja deletedAt i zapisuje moderatora)
      `
      },
      "Admin upravljanje recenzijama": {
        summary: "Moderacija recenzija i upravljanje ocjenama",
        details: `## Kako funkcionira:

**Pregled recenzija**
- Administratorska lista s filtrima (status, ocjena, korisnik, pružatelj, datum)
- Detaljan prikaz komentara, ocjene i pripadajućeg posla

**Moderacija**
- Ručno uklanjanje ili vraćanje recenzija uz obaveznu napomenu
- Blokiranje korisnika u slučaju spama ili zlostavljanja
- Verifikacija autentičnosti usporedbom s dovršenim poslom i ponudom

**Automatika**
- Detekcija duplikata i generiranje notifikacija za nove recenzije
- Automatsko osvježavanje prosječne ocjene i breakdowna po kategorijama
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminReviews.jsx'
- Ruta: '/admin/reviews'
- Filtri po statusu, korisniku, pružatelju i ocjeni
- Modal prikazuje puni komentar, audit trail i admin napomene

### Backend:
- Ruta: '/api/admin/reviews'
- Middleware: auth(true, ['ADMIN'])
- Servis spaja 'Review', 'Job' i 'User' te provjerava autentičnost prije objave
- Moderation log bilježi sve akcije (tko je uklonio recenziju i razlog)

### Baza:
- Tablice: 'Review', 'User', 'Job'
- Relacije: Review → User (authorId), Review → User (reviewedUserId), Review → Job
- Indeksi: @@index([rating]), @@index([reviewedUserId])

### API poziv:
- GET /api/admin/reviews (parametri: status, rating, userId, providerId)
- PUT /api/admin/reviews/:id (payload: { status?, adminNote? })
- DELETE /api/admin/reviews/:id (soft delete + audit zapis)
      `
      },
      "Upravljanje notifikacijama": {
        summary: "Upravljanje push, email i SMS notifikacijama",
        details: `## Kako funkcionira:

**Pregled i filtriranje**
- Administratorska lista svih poslanih notifikacija (push, email, SMS).
- Prikaz statusa dostave (poslano, pročitano, greška) i povezane akcije/korisnika.

**Slanje i upravljanje**
- Masovno ili ciljano slanje poruka, uključujući testne šaltere.
- Uređivanje i verzioniranje templata za svaki kanal.
- Praćenje open/click statistika i uspješnosti kampanja.

**Automatske notifikacije**
- Sustavne poruke za nove poslove, ponude, naplate, verifikacije i SLA podsjetnike.
- Integracija s event busom (lead.created, payment.failed, review.submitted).
- On/off toggle po scenariju radi brzih prilagodbi.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminNotifications.jsx'
- Ruta: '/admin/notifications'
- Filtri po tipu, statusu dostave i korisniku
- UI za uređivanje templata s live previewom

### Backend:
- Ruta: '/api/admin/notifications'
- Middleware: auth(true, ['ADMIN'])
- Servis 'notificationService' orkestrira slanje kroz push/email/SMS providere
- Queue (Bull/Redis) za asinkrono slanje i retry logiku

### Baza:
- Tablice: 'Notification', 'NotificationTemplate', 'User'
- Indeksi: @@index([userId]), @@index([type]), @@index([status])
- Audit tablica 'NotificationEvent' bilježi isporuke i greške

### API poziv:
- GET /api/admin/notifications?type=&status=&userId=
- POST /api/admin/notifications/send (payload: { userIds, channel, templateId, variables })
- PUT /api/admin/notifications/:id/read (markira kao pročitano i osvježava audit)
      `
      },
      "Upravljanje chat sobama": {
        summary: "Moderacija chat razgovora između korisnika i pružatelja",
        details: `## Kako funkcionira:

**Pregled soba**
- Administratorska lista aktivnih i arhiviranih chatova s povezanim poslom i sudionicima.
- Prikaz broja poruka, posljednje aktivnosti i statusa (aktivan, zaključan, arhiviran).

**Moderacija**
- Uvid u cijeli razgovor, mogućnost uklanjanja poruka ili blokiranja sudionika.
- Zaključavanje ili arhiviranje threadova nakon završetka posla.
- Automatsko maskiranje kontakata zadržava se i u admin prikazu uz mogućnost otkrivanja uz razlog.

**Statistike**
- Prosječan broj poruka, vrijeme odgovora i distribucija aktivnosti po kategorijama.
- Identifikacija sumnjivih razgovora (kontakt podaci, uvredljiv sadržaj) kroz AI flagging.
`,
        technicalDetails: `## Tehnički detalji:

-### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminChatRooms.jsx'
- Ruta: '/admin/chat'
- WebSocket pretplata za live nadzor poruka, s alertom kod flagiranog sadržaja
- Moderation panel s akcijama (delete, block, lock thread)

### Backend:
- Ruta: '/api/admin/chat-rooms'
- Middleware: auth(true, ['ADMIN'])
- Servis koristi Prisma + Elasticsearch za pretraživanje poruka
- Integracija s AI moderation servisom (mask detection, toxicity scoring)

### Baza:
- Tablice: 'ChatRoom', 'ChatMessage', 'User', 'Job'
- Indeksi: @@index([jobId]), @@index([createdAt]), @@index([status])
- Audit tablica 'ChatModerationEvent' bilježi intervencije

### API poziv:
- GET /api/admin/chat-rooms?jobId=&userId=
- GET /api/admin/chat-rooms/:id/messages (stream + pagination)
- POST /api/admin/chat-rooms/:id/lock i /archive za zaključavanje/archiviranje
- DELETE /api/admin/messages/:id uklanja poruku i generira audit zapis
      `
      },
      "Pregled SMS logova": {
        summary: "Pregled svih poslanih SMS-ova kroz platformu s detaljnim informacijama",
        details: `## Kako funkcionira:

**Automatsko logiranje**
- Svaki odlazni SMS zapisuje se s ključnim metapodacima (broj telefona, tip, status, način slanja, Twilio SID).
- Metadata (leadId, transactionId, actor) povezuje poruku s poslovnim događajima i audit tragom.

**Administratorski pregled**
- Tablični prikaz s filtriranjem po broju, tipu (VERIFICATION, LEAD_NOTIFICATION, REFUND, URGENT, OTHER), statusu i datumu.
- Paginacija i sortiranje olakšavaju rad s velikim količinama zapisa.

**Detaljan uvid**
- Modal prikazuje puni sadržaj, povezanog korisnika i eventualnu grešku dobavljača.
- Twilio SID i status dostave olakšavaju debugiranje i eskalacije prema provideru.

**Statistike i monitoring**
- Agregirane metrike po statusu, tipu i modu (twilio, simulation, twilio_error).
- Pregled recentne aktivnosti pomaže detektirati spike-ove ili probleme s dostavom.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminSmsLogs.jsx'
- Ruta: '/admin/sms-logs'
- Filtri implementirani kroz React Hook Form + debounced search
- Modal otvara detaljan prikaz s JSON viewerom za metadata polje

### Backend:
- Ruta: '/api/admin/sms-logs'
- Middleware: auth(true, ['ADMIN'])
- Query parametri: phone, type, status, mode, limit, offset, startDate, endDate
- Servis koristi Prisma paginaciju i sortiranje po createdAt DESC

### Baza:
- Tablica 'SmsLog' (phone, message, type, status, mode, twilioSid, error, userId, metadata)
- Indeksi na phone, status, type, createdAt radi performansi
- Relacija prema 'User' omogućuje prikaz povezanog korisnika

### Integracije:
- Servis 'smsService.logSMS' zapisuje log unutar transakcije nakon slanja
- Twilio provider s retry logikom; simulation mode za ne-produkcijska okruženja
- Statistički endpoint koristi Redis cache za agregate po statusu i tipu

### API poziv:
- GET /api/admin/sms-logs (list + filteri)
- GET /api/admin/sms-logs/stats (primarni KPI-i)
- POST /api/admin/sms-logs/resend/:id za ručno ponovno slanje (opcionalno)
      `
      },
      "Audit Logs": {
        summary: "Pregled svih audit logova za chat akcije, otkrivanje kontakata i druge akcije",
        details: `## Kako funkcionira:

**Pregled audit logova**
- Administratorska lista svih audit logova s filtrima (akcija, korisnik, poruka, soba, posao, datum)
- Detaljan prikaz svih akcija vezanih uz chat (kreiranje, uređivanje, brisanje poruka)
- Praćenje otkrivanja i maskiranja kontakata
- Povijest kreiranja i brisanja chat soba

**Tipovi akcija**
- MESSAGE_CREATED, MESSAGE_EDITED, MESSAGE_DELETED
- ATTACHMENT_UPLOADED, ATTACHMENT_DELETED
- CONTACT_REVEALED, CONTACT_MASKED
- ROOM_CREATED, ROOM_DELETED

**Statistike**
- Broj akcija po tipu
- Najaktivniji korisnici
- Vremenski trendovi aktivnosti
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminAuditLogs.jsx'
- Ruta: '/admin/audit-logs'
- Filtri po akciji, korisniku, poruci, sobi, poslu i datumu
- Tablični prikaz s paginacijom i detaljnim prikazom metadata

### Backend:
- Ruta: '/api/admin/audit-logs'
- Middleware: auth(true, ['ADMIN'])
- Query parametri: action, actorId, messageId, roomId, jobId, limit, offset, startDate, endDate
- Servis koristi Prisma s eager loadingom relacija (actor, message, room, job)

### Baza:
- Tablica 'AuditLog' (action, actorId, messageId, roomId, jobId, metadata, ipAddress, userAgent, createdAt)
- Indeksi na actorId, messageId, roomId, jobId, action, createdAt
- Relacije: AuditLog → User (actor), AuditLog → ChatMessage, AuditLog → ChatRoom, AuditLog → Job

### API poziv:
- GET /api/admin/audit-logs (list + filteri + statistike)
      `
      },
      "API Request Logs": {
        summary: "Automatsko logiranje svih API zahtjeva za monitoring i debugging",
        details: `## Kako funkcionira:

**Automatsko logiranje**
- Middleware automatski logira sve API zahtjeve (metoda, path, status kod, response time)
- Snimanje IP adrese, user agent-a i korisnika (ako je autentificiran)
- Request body se logira za POST/PUT/PATCH (osjetljivi podaci se maskiraju)
- Error poruke se logiraju za zahtjeve s status kodom >= 400

**Filtriranje i pretraga**
- Filtriranje po metodi (GET, POST, PUT, DELETE, PATCH)
- Pretraga po path-u (npr. /api/jobs)
- Filtriranje po status kodovima (200, 404, 500, itd.)
- Filtriranje po korisniku i datumu

**Statistike i metrike**
- Statistike po status kodovima (broj zahtjeva, prosječno vrijeme odgovora)
- Statistike po metodama
- Top 10 najčešćih path-ova s prosječnim response time-om
- Identifikacija sporih endpointa (>1000ms)
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminApiRequestLogs.jsx'
- Ruta: '/admin/api-request-logs'
- Filtri po metodi, path-u, status kodu, korisniku i datumu
- Tablični prikaz s bojama za status kodove i response time
- Statistike s grafovima

### Backend:
- Middleware: 'uslugar/backend/src/lib/api-request-logger.js'
- Integracija u 'uslugar/backend/src/server.js' prije svih ruta
- Ruta: '/api/admin/api-request-logs'
- Middleware: auth(true, ['ADMIN'])
- Query parametri: method, path, statusCode, userId, limit, offset, startDate, endDate

### Baza:
- Tablica 'ApiRequestLog' (method, path, statusCode, userId, ipAddress, userAgent, requestBody, responseTime, errorMessage, createdAt)
- Indeksi na method+path, statusCode, userId+createdAt, createdAt, path+createdAt
- Relacija: ApiRequestLog → User (userId)

### API poziv:
- GET /api/admin/api-request-logs (list + filteri + statistike)
      `
      },
      "Error Logs": {
        summary: "Centralizirano logiranje grešaka s mogućnošću praćenja i rješavanja",
        details: `## Kako funkcionira:

**Automatsko logiranje grešaka**
- Error handler middleware automatski logira sve greške (ERROR, WARN, CRITICAL)
- Snimanje error poruke, stack trace-a i konteksta (endpoint, metoda, korisnik)
- IP adresa i user agent se logiraju za debugging
- Request body i query parametri se logiraju (osjetljivi podaci se maskiraju)

**Upravljanje greškama**
- Statusi: NEW, IN_PROGRESS, RESOLVED, IGNORED
- Admin može ažurirati status i dodati napomene
- Automatsko praćenje kada je greška riješena i tko ju je riješio
- Mogućnost ignoriranja poznatih grešaka

**Filtriranje i pretraga**
- Filtriranje po levelu (ERROR, WARN, CRITICAL)
- Filtriranje po statusu
- Pretraga po endpointu
- Filtriranje po korisniku i datumu

**Statistike**
- Statistike po levelima
- Statistike po statusima
- Top 10 endpointa s najviše grešaka
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminErrorLogs.jsx'
- Ruta: '/admin/error-logs'
- Filtri po levelu, statusu, endpointu, korisniku i datumu
- Modal za detalje s prikazom stack trace-a i konteksta
- Mogućnost ažuriranja statusa i dodavanja napomena

### Backend:
- Logger: 'uslugar/backend/src/lib/error-logger.js'
- Error handler middleware integriran u 'uslugar/backend/src/server.js'
- Ruta: '/api/admin/error-logs'
- Middleware: auth(true, ['ADMIN'])
- Query parametri: level, status, endpoint, userId, limit, offset, startDate, endDate
- PATCH /api/admin/error-logs/:id za ažuriranje statusa

### Baza:
- Tablica 'ErrorLog' (level, message, stack, endpoint, method, userId, ipAddress, userAgent, context, status, resolvedAt, resolvedBy, notes, createdAt, updatedAt)
- Indeksi na level, status, userId+createdAt, endpoint+createdAt, createdAt
- Relacija: ErrorLog → User (userId)

### API poziv:
- GET /api/admin/error-logs (list + filteri + statistike)
- PATCH /api/admin/error-logs/:id (ažuriranje statusa i napomena)
      `
      },
      "Addon Event Logs": {
        summary: "Pregled svih event logova za addon pretplate (kupnja, obnova, isteci, itd.)",
        details: `## Kako funkcionira:

**Pregled event logova**
- Administratorska lista svih addon event logova s filtrima (addon, event type, datum)
- Detaljan prikaz svih događaja vezanih uz addon pretplate
- Praćenje promjena statusa (oldStatus → newStatus)
- Metadata s dodatnim informacijama o eventu

**Tipovi eventa**
- PURCHASED (kupljeno)
- RENEWED (obnovljeno)
- EXPIRED (isteklo)
- DEPLETED (iscrpljeno)
- LOW_BALANCE (niska bilanca)
- GRACE_STARTED (grace period započeo)
- CANCELLED (otkazano)

**Statistike**
- Broj eventa po tipu
- Najaktivniji addon-i
- Vremenski trendovi
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminAddonEventLogs.jsx'
- Ruta: '/admin/addon-event-logs'
- Filtri po addon ID-u, event tipu i datumu
- Tablični prikaz s prikazom korisnika i metadata

### Backend:
- Ruta: '/api/admin/addon-event-logs'
- Middleware: auth(true, ['ADMIN'])
- Query parametri: addonId, eventType, limit, offset, startDate, endDate
- Servis koristi Prisma s eager loadingom relacija (addon → user)

### Baza:
- Tablica 'AddonEventLog' (addonId, eventType, oldStatus, newStatus, metadata, occurredAt)
- Indeksi na addonId, eventType, occurredAt
- Relacija: AddonEventLog → AddonSubscription → User

### API poziv:
- GET /api/admin/addon-event-logs (list + filteri + statistike)
      `
      },
      "Moderacija sadržaja": {
        summary: "Sveobuhvatna moderacija sadržaja na platformi",
        details: `## Kako funkcionira:

**Moderacija profila**
- Administratori pregledavaju profile korisnika i pružatelja, provjeravaju dokumente i uklanjaju neprikladne elemente (slike, opisi).
- Mogu blokirati ili ograničiti račun uz bilježenje razloga.

**Moderacija sadržaja**
- Centraliziran pregled poslova, ponuda, recenzija i chat poruka označenih od sustava ili korisnika.
- Workflow za odobravanje/odbacivanje postavki licenci i priloženih dokumenata.

**Automatska detekcija**
- AI modeli detektiraju spam, razmjenu kontakata i sumnjive obrasce.
- Flagging sustav prikuplja prijave korisnika i dodjeljuje prioritet moderatorima.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminModeration.jsx'
- Ruta: '/admin/moderation'
- Tab-based prikaz po tipu sadržaja (Job, Offer, Review, Message, Profile)
- Moderation modal s quick actions (approve, reject, escalate) i audit prikazom

### Backend:
- Ruta: '/api/admin/moderation'
- Middleware: auth(true, ['ADMIN'])
- Servis 'moderationService' dohvaća sadržaj + kontekst i upravlja statusima
- Integracija s event busom (content.flagged, content.unflagged)

### Baza:
- Tablice: 'Moderation', 'Job', 'Review', 'Offer', 'ChatMessage', 'User'
- Polja: contentType, contentId, status (PENDING, APPROVED, REJECTED), reason, moderatorId
- Indeksi: @@index([status]), @@index([contentType]), @@index([createdAt])

### Automatizacija:
- AI pipeline (Azure Content Moderator / OpenAI) označava rizičan sadržaj
- Cron jobovi prate SLA i automatski eskaliraju zastarjele zahtjeve
- Audit log (ModerationEvent) pohranjuje sve akcije za compliance

### API poziv:
- GET /api/admin/moderation/pending?type=&limit=&offset=
- POST /api/admin/moderation/:type/:id (payload: { action: 'APPROVE'|'REJECT', reason? })
- GET /api/admin/moderation/stats (aggregate po tipu/statusu)
      `
      },
      "Upravljanje pretplatama": {
        summary: "Upravljanje subscription planovima i aktivnim pretplatama",
        details: `## Kako funkcionira:

**Planovi i cjenik**
- Administratori održavaju katalog planova (BASIC, PREMIUM, PRO, custom) s cijenama, kreditima i uključenim funkcionalnostima.
- Planovi se mogu aktivirati/deaktivirati, klonirati i verzionirati.

**Aktivne pretplate**
- Lista svih pretplata s filterima po statusu (aktivna, istekla, otkazana), korisniku i planu.
- Detalji uključuju posljednju uplatu, fakture i datum isteka.

**Operativne radnje**
- Ručno produženje, promjena plana, otkazivanje ili refundiranje uz audit trag.
- Dashboard statistike (MRR, ARR, churn, conversion) za brzi pregled performansi.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminSubscriptions.jsx'
- Ruta: '/admin/subscriptions'
- Tablični prikaz s filtrima, inline radnje i modalom za promjenu plana
- Grafički widgeti (MRR, churn) koriste Chart.js mini komponente

### Backend:
- Ruta: '/api/admin/subscriptions'
- Middleware: auth(true, ['ADMIN'])
- Servis koordinira promjene plana, kreira invoice draft i sinkronizira s billing providerom (Stripe/CorvusPay)
- Sva ručna ažuriranja bilježe se u 'SubscriptionEvent' log

### Baza:
- Tablice: 'Subscription', 'SubscriptionPlan', 'Invoice', 'User'
- Indeksi: @@index([userId]), @@index([status]), @@index([planId])
- Polja: currentPeriodEnd, renewalType, autoRenew, cancelledAt, cancellationReason

### Automatizacija:
- Cron job 'subscriptionRenewalJob' provjerava isteke i triggera naplate
- Webhook handleri (stripe.invoice.paid, stripe.subscription.deleted) ažuriraju status
- BI sloj koristi materialized view 'subscription_metrics_mv' za agregate

### API poziv:
- GET /api/admin/subscriptions?status=&plan=&userId=
- PUT /api/admin/subscriptions/:id (payload: { planId?, status?, currentPeriodEnd?, autoRenew? })
- POST /api/admin/subscriptions/:id/cancel (razlog, refund flag opcionalan)
      `
      },
      "Upravljanje transakcijama kredita": {
        summary: "Upravljanje kreditnim transakcijama i balansama",
        details: `## Kako funkcionira:

**Pregled transakcija**
- Tablični pregled svih kreditnih transakcija s filtrima po korisniku, datumu, tipu i statusu.
- Tipovi uključuju PURCHASE, REFUND, SUBSCRIPTION, ADMIN_ADJUST, COMPENSATION.

**Admin operacije**
- Ručno dodavanje ili oduzimanje kredita uz obavezno navođenje razloga i evidenciju u auditu.
- Automatizirano kreiranje transakcija pri kupnji leadova, refundima i naplatama pretplata.
- Export u CSV/Excel za financijski i revizijski tim.

**Analitika**
- Dashboards za ukupan iznos po periodu, prosječnu vrijednost, distribuciju po tipu i prihod po mjesecima.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminCreditTransactions.jsx'
- Ruta: '/admin/credit-transactions'
- Filtri po korisniku, tipu, datumu i statusu uz eksport u CSV/Excel
- Modal za ručno knjiženje (ADMIN_ADJUST) i pregled audit zapisa

### Backend:
- Ruta: '/api/admin/credit-transactions'
- Middleware: auth(true, ['ADMIN'])
- Servis 'creditTransactionService' validira saldo, kreira evidenciju i sinkronizira s billing modulom
- Podržava batch upload (CSV) za masovne korekcije

### Baza:
- Tablice: 'CreditTransaction', 'User', 'CreditBalance'
- Polja: amount, balanceAfter, type, status (SUCCESS, FAILED, PENDING), sourceId
- Indeksi: @@index([userId]), @@index([type]), @@index([createdAt]), @@index([status])

### Integracije:
- Event 'credit.transaction.created' šalje se analitici i notifikacijama
- Refund pipeline automatski kreira REFUND transakcije nakon odobrenja
- Ledger snapshot job radi dnevnu verifikaciju balansa

### API poziv:
- GET /api/admin/credit-transactions?userId=&type=&status=&startDate=&endDate=
- POST /api/admin/credit-transactions (payload: { userId, amount, type: 'ADMIN_ADJUST', description })
- GET /api/admin/credit-transactions/export generira CSV link
      `
      },
      "Admin odobravanje refund-a": {
        summary: "Odobravanje povrata novca za neuspjele leadove",
        details: `## Kako funkcionira:

**Pregled zahtjeva**
- Administratorski panel prikazuje sve refund zahtjeve s filtrima po statusu, pružatelju, kategoriji i datumu.
- Svaki zahtjev uključuje razlog, dokumentaciju i link na originalni lead purchase.

**Proces odobravanja**
- Moderator pregledava zapis, unosi odluku (APPROVED/REJECTED) i opcionalnu napomenu.
- Odobrenje automatski vraća kredite/iznos na račun pružatelja i šalje notifikaciju.

**Kontrola i praćenje**
- Pravila validacije provjeravaju zadovoljava li lead uvjete (npr. klijent nije kontaktirao, spam).
- Dashboard prati refund rate po pružatelju i detektira potencijalne zloupotrebe.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminRefunds.jsx'
- Ruta: '/admin/refunds'
- Filtri po statusu, pružatelju, kategoriji i datumu
- Modal prikazuje timeline (lead → kontakt → refund zahtjev) i dokaze

### Backend:
- Route prefix: '/api/admin/refunds'
- Middleware: auth(true, ['ADMIN'])
- Servis validira uvjete refundiranja, kreira REFUND transakciju i ažurira lead status
- Audit log bilježi odluku, moderatora i vrijeme

### Baza:
- Tablice: 'LeadPurchase', 'CreditTransaction', 'RefundRequest', 'User'
- Indeksi: @@index([status]), @@index([providerId]), @@index([createdAt])
- Polja: refundReason, refundStatus, refundEvidenceUrl, resolvedAt

### Integracije:
- Event 'refund.approved' obavještava notifikacijski sustav i analitiku
- SLA checker šalje podsjetnike ako zahtjev stoji >48h
- Compliance izvještaj prikuplja podatke za regulatorne potrebe

### API poziv:
- GET /api/admin/refunds?status=&providerId=&categoryId=
- POST /api/admin/refunds/:id/approve (payload: { note? })
- POST /api/admin/refunds/:id/reject (payload: { reason })
      `
      },
      "Admin upravljanje queue sustavom": {
        summary: "Upravljanje queue sustavom za ekskluzivne leadove",
        details: `## Kako funkcionira:

**Pregled queue-a**
- Lista leadova po stanju (WAITING, ASSIGNED, PURCHASED, EXPIRED) uz filtre po kategoriji, regiji i prioritetu.
- Vizualni prikaz gdje se lead nalazi u procesu i koji partneri su u razmatranju.

**Operativne akcije**
- Ručna dodjela, zamjena ili uklanjanje leadova iz reda čekanja.
- Bulk radnje (npr. oslobađanje leadova nakon SLA isteka) i priprema leadova za sljedeći ciklus.

**AI prioritet i statistike**
- Pregled AI prioriteta, featured rangiranja i razloga za scoring.
- Dashboard s performansama queue-a (vrijeme dodjele, konverzija, reakcije partnera).
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- **Komponenta:** \`uslugar/frontend/src/pages/AdminQueue.jsx\`
- **Route:** \`/admin/queue\`
- **State management:** useState, useEffect hooks
- **Filtriranje:** Status, kategorija, lokacija

### Backend:
- **Route:** \`uslugar/backend/src/routes/admin.js\`
- **Middleware:** \`auth(true, ['ADMIN'])\`
- **Servis:** \`leadQueueManager.js\`
- **Prisma:** Query za LeadQueue model

### Baza podataka:
- **Tablice:** \`LeadQueue\`, \`Job\`, \`User\`, \`Category\`
- **Relacije:** LeadQueue → Job, LeadQueue → User (pružatelj)
- **Statusi:** WAITING, OFFERED, ACCEPTED, DECLINED, EXPIRED, SKIPPED
- **Indeksi:** \`@@index([status])\`, \`@@index([jobId])\`, \`@@index([position])\`

### API pozivi:
- \`GET /api/admin/queue\` - Query params: \`status\`, \`categoryId\`, \`jobId\`
- \`POST /api/admin/queue/:id/assign\` - Body: \`{ providerId: string }\`
- \`PUT /api/admin/queue/:id\` - Ažuriranje pozicije ili statusa
      `
      },
      "Upravljanje PDF faktura i S3 storage": {
        summary: "Kompletan sustav za upravljanje PDF faktura s AWS S3 storage integracijom, filtriranjem, masovnim operacijama i automatskim uploadom",
        details: `## Kako funkcionira:

**Pregled funkcionalnosti**
- Filtriranje faktura po S3 statusu (Na S3 / Nije na S3)
- Masovno uploadanje PDF faktura na S3
- Masovno brisanje PDF faktura s S3
- Automatsko uploadanje svih nedostajućih faktura na S3
- Automatsko brisanje svih faktura s S3
- Pregled S3 statusa za svaku fakturu
- Ručno uploadanje/brisanje pojedinačnih faktura

**Admin panel - Fakture**
- Tablica faktura s S3 status kolonom (☁️ Na S3 / ⚡ Generira se)
- Checkbox za odabir faktura
- "Odaberi sve" funkcionalnost
- Masovne operacije gumbovi:
  - ⬆️ Upload odabrane na S3
  - 🗑️ Obriši odabrane s S3
  - ⬆️ Upload sve nedostajuće na S3
  - 🗑️ Obriši sve s S3

**Filteri**
- S3 Status filter: Svi / Na S3 / Nije na S3
- Kombinacija s postojećim filterima (status, tip, korisnik, datum)

**Masovne operacije**
- Bulk upload: Uploada sve odabrane fakture koje nisu na S3
- Bulk delete: Briše sve odabrane fakture s S3
- Upload all missing: Pronalazi sve fakture bez pdfUrl i uploada ih na S3
- Delete all: Briše sve fakture s S3 (s dvostrukom potvrdom)

**Sigurnost**
- Sve operacije zahtijevaju ADMIN role
- "Obriši sve s S3" ima dvostruku potvrdu
- Bulk operacije vraćaju detaljne rezultate (uspješno/neuspješno)
`,
        technicalDetails: `## Backend API

**Filter endpoint**
- \`GET /api/admin/invoices?hasS3=true|false\`
  - \`hasS3=true\`: Fakture s pdfUrl (na S3)
  - \`hasS3=false\`: Fakture bez pdfUrl (nije na S3)

**Masovne operacije**
- \`POST /api/invoices/bulk/upload-to-s3\`
  - Body: \`{ invoiceIds: string[] }\`
  - Uploada sve odabrane fakture koje nisu na S3
  - Vraća: \`{ uploaded: number, total: number, errors?: [] }\`

- \`POST /api/invoices/bulk/delete-from-s3\`
  - Body: \`{ invoiceIds: string[] }\`
  - Briše sve odabrane fakture s S3
  - Vraća: \`{ deleted: number, total: number, errors?: [] }\`

- \`POST /api/invoices/bulk/upload-all-missing-to-s3\`
  - Uploada sve fakture koje nemaju pdfUrl
  - Vraća: \`{ uploaded: number, total: number, errors?: [] }\`

- \`POST /api/invoices/bulk/delete-all-from-s3\`
  - Briše sve fakture s S3
  - Vraća: \`{ deleted: number, total: number, errors?: [] }\`

**Pojedinačne operacije**
- \`POST /api/invoices/:invoiceId/upload-to-s3\`
  - Generira PDF, uploada na S3, ažurira pdfUrl

- \`DELETE /api/invoices/:invoiceId/pdf-s3\`
  - Briše PDF s S3, uklanja pdfUrl iz baze

**S3 Storage**
- \`s3-storage.js\`:
  - \`uploadInvoicePDF(pdfBuffer, invoiceNumber)\`: Uploada PDF u S3
  - \`deleteInvoicePDF(invoiceNumber)\`: Briše PDF iz S3
  - \`isS3Configured()\`: Provjerava S3 konfiguraciju

**Invoice Service**
- \`invoice-service.js\`:
  - \`generateInvoicePDF(invoice)\`: Generira PDF fakturu
  - \`saveInvoicePDF(invoice, pdfBuffer)\`: Uploada PDF u S3 i ažurira pdfUrl

## Frontend

**AdminInvoices.jsx**
- State management:
  - \`filters.hasS3\`: Filter po S3 statusu
  - \`selectedInvoices\`: Set odabranih faktura
  - \`bulkLoading\`: Loading state za masovne operacije

- Funkcije:
  - \`bulkUploadToS3()\`: Upload odabranih faktura
  - \`bulkDeleteFromS3()\`: Brisanje odabranih faktura
  - \`uploadAllMissingToS3()\`: Upload svih nedostajućih
  - \`deleteAllFromS3()\`: Brisanje svih s S3

- UI komponente:
  - Checkbox u headeru tablice ("Odaberi sve")
  - Checkbox u svakom redu (odabir pojedinačne fakture)
  - S3 status badge (☁️ Na S3 / ⚡ Generira se)
  - Masovne operacije toolbar
  - S3 Status filter dropdown

**Baza podataka**
- \`Invoice.pdfUrl\`: S3 URL fakture (null ako nije na S3)
- Automatsko ažuriranje pdfUrl pri uploadu/brisanju

**S3 Bucket struktura**
- \`invoices/{invoiceNumber}.pdf\`: PDF fakture
- Automatsko brisanje pri delete operacijama

## Pristup bazi podataka

**🗄️ Database Editor - Admin Panel (PREPORUČENO)**
- **Link:** https://uslugar.oriph.io/admin/database
- **Dostupno:** Samo za ADMIN korisnike
- **Omogućava:**
  - ✅ Pregled svih tablica u bazi podataka
  - ✅ Pregled podataka iz bilo koje tablice s paginacijom
  - ✅ **Direktan edit ćelija** (double-click na ćeliju → edit → Enter za save)
  - ✅ Pregled strukture tablice (kolone, tipovi, nullable, default vrijednosti)
  - ✅ Pregled indeksa i foreign keys
  - ✅ SQL Query Editor (SELECT queries)
  - ✅ Filtriranje i pretraživanje podataka
  - ✅ Tablični prikaz s paginacijom (50 redaka po stranici)
- **Kako koristiti:**
  1. Prijavi se kao ADMIN na https://uslugar.oriph.io/admin
  2. Klikni na **🗄️ Database Editor** u sidebaru
  3. Odaberi tablicu za pregled (npr. \`Invoice\`, \`User\`, \`ProviderProfile\`)
  4. **Pregled podataka:** Automatski se učitavaju podaci s paginacijom
  5. **Edit ćelije:** Double-click na ćeliju → unesi novu vrijednost → Enter za save, Escape za cancel
  6. **Struktura tablice:** Klikni na "🏗️ Struktura" tab za pregled kolona, tipova, indeksa i foreign keys
  7. **SQL Query:** Klikni na "🔍 SQL Query" tab za izvršavanje SELECT queries

**Prisma Studio - Lokalni vizualni database editor**
- Pokreni lokalno: \`npx prisma studio\`
- Otvara se na: \`http://localhost:5555\`
- Omogućava sve funkcionalnosti kao Database Editor, ali lokalno

**AWS RDS Query Editor (Alternativa)**
- Link: https://eu-north-1.console.aws.amazon.com/rds/
- Navigacija: RDS → Databases → \`uslugar-db\` → Query Editor
- **Napomena:** Zahtijeva IAM autentifikaciju (može ne raditi za obični RDS PostgreSQL)
- Omogućava SQL query execution, ali ne vizualni edit ćelija

**Preporuka:** Koristi **Database Editor u admin panelu** (\`/admin/database\`) za najbolje iskustvo - dostupno direktno iz browsera, bez lokalne instalacije!
`
      },
      "Database Editor - Vizualni pristup bazi podataka": {
        summary: "Vizualni database editor u admin panelu za direktan pristup bazi podataka, CRUD operacije, SQL queries i edit ćelija",
        details: `## Kako funkcionira:

**Pristup**
- **Link:** https://uslugar.oriph.io/admin/database
- **Dostupno:** Samo za ADMIN korisnike
- **Lokacija:** Admin panel → 🗄️ Database Editor (u sidebaru)

**Funkcionalnosti**
- 📊 **Pregled podataka:** Lista svih tablica u bazi, pregled podataka s paginacijom (50 redaka po stranici)
- ✏️ **Direktan edit ćelija:** Double-click na ćeliju → edit → Enter za save, Escape za cancel
- 🏗️ **Struktura tablice:** Pregled kolona, tipova podataka, nullable, default vrijednosti, indeksa i foreign keys
- 🔍 **SQL Query Editor:** Izvršavanje SELECT queries s prikazom rezultata u tabličnom formatu
- 🔄 **Paginacija:** Navigacija kroz velike tablice (prethodna/sljedeća stranica)

**Kako koristiti**
1. Prijavi se kao ADMIN na https://uslugar.oriph.io/admin
2. Klikni na **🗄️ Database Editor** u sidebaru
3. Odaberi tablicu za pregled (npr. \`Invoice\`, \`User\`, \`ProviderProfile\`)
4. **Pregled podataka:** Automatski se učitavaju podaci s paginacijom
5. **Edit ćelije:** Double-click na ćeliju → unesi novu vrijednost → Enter za save
6. **Struktura:** Klikni na "🏗️ Struktura" tab za detalje o tablici
7. **SQL Query:** Klikni na "🔍 SQL Query" tab za SELECT queries

**Sigurnost**
- Sve operacije zahtijevaju ADMIN role
- SQL Query Editor dozvoljava samo SELECT queries (za sigurnost)
- Update operacije se logiraju
`,
        technicalDetails: `## Backend API

**Lista tablica**
- \`GET /api/admin/database/tables\`
  - Vraća listu svih tablica u bazi (bez Prisma internih tablica)

**Pregled podataka**
- \`GET /api/admin/database/table/:tableName?page=1&limit=50&orderBy=id&order=asc\`
  - Dohvati podatke iz tablice s paginacijom
  - Vraća: \`{ tableName, columns, data, pagination: { page, limit, total, totalPages } }\`

**Struktura tablice**
- \`GET /api/admin/database/table/:tableName/structure\`
  - Dohvati strukturu tablice (kolone, indeksi, foreign keys)
  - Vraća: \`{ tableName, columns, indexes, foreignKeys }\`

**SQL Query**
- \`POST /api/admin/database/query\`
  - Body: \`{ query: "SELECT * FROM ..." }\`
  - Izvršava samo SELECT queries (za sigurnost)
  - Vraća: \`{ success: true, result: [], rowCount: number }\`

**Update ćelije**
- \`PATCH /api/admin/database/table/:tableName/cell\`
  - Body: \`{ id, idColumn, column, value }\`
  - Update pojedinačne ćelije u tablici
  - Vraća: \`{ success: true, updated: {...} }\`

## Frontend

**AdminDatabaseEditor.jsx**
- **Route:** \`/admin/database\`
- **Komponente:**
  - Sidebar s listom tablica
  - Tablični prikaz podataka s paginacijom
  - Edit modal za ćelije (inline editing)
  - Struktura tablice (kolone, indeksi, foreign keys)
  - SQL Query Editor s rezultatima

- **State management:**
  - \`tables\`: Lista svih tablica
  - \`selectedTable\`: Odabrana tablica
  - \`tableData\`: Podaci iz tablice s paginacijom
  - \`tableStructure\`: Struktura tablice
  - \`editingCell\`: Trenutno editirana ćelija
  - \`sqlQuery\`: SQL query za izvršavanje
  - \`queryResult\`: Rezultati SQL query-ja

- **Funkcionalnosti:**
  - \`loadTables()\`: Učitaj listu tablica
  - \`loadTableData()\`: Učitaj podatke iz tablice
  - \`loadTableStructure()\`: Učitaj strukturu tablice
  - \`executeQuery()\`: Izvrši SQL query
  - \`startEditCell()\`: Počni edit ćelije
  - \`saveCell()\`: Spremi promjene u ćeliju

**Baza podataka**
- Koristi \`information_schema\` za dohvat metapodataka
- Koristi \`pg_indexes\` i \`pg_class\` za indekse
- Koristi \`information_schema.table_constraints\` za foreign keys

**Sigurnost**
- Sve endpointi zahtijevaju \`auth(true, ['ADMIN'])\`
- SQL Query Editor provjerava da query počinje s \`SELECT\`
- Update operacije validiraju da kolona postoji prije update-a
`
      },
      "API Reference - Popis svih API endpointa": {
        summary: "Kompletan popis svih API endpointa s detaljima o metodama, parametrima i handler funkcijama",
        details: `## Kako funkcionira:

**Pregled funkcionalnosti**
- Dinamički dohvat svih Express ruta iz aplikacije
- Grupiranje ruta po modulima (auth, admin, invoices, itd.)
- Prikaz HTTP metoda (GET, POST, PUT, DELETE, PATCH)
- Detekcija parametara u path-u (npr. \`:id\`, \`:invoiceId\`)
- Prikaz handler funkcija i middleware-a
- Pretraga po path-u, metodi ili handler-u
- Filtriranje po grupi (modulu)

**Admin panel - API Reference**
- **Link:** https://uslugar.oriph.io/admin/api-reference
- **Dostupno:** Samo za ADMIN korisnike
- **Lokacija:** Admin panel → 📚 API Reference (u sidebaru)

**Funkcionalnosti**
- 📊 **Grupirani prikaz:** Rute grupirane po modulima (auth, admin, invoices, itd.)
- 🔍 **Pretraga:** Pretraživanje po path-u, HTTP metodi ili handler funkciji
- 🎯 **Filteri:** Filtriranje po grupi (modulu)
- 📝 **Detalji:** Proširivanje/sažimanje detalja za svaki endpoint
- 🎨 **Bojno označavanje:** HTTP metode imaju različite boje (GET=plava, POST=zelena, DELETE=crvena, itd.)
- 📋 **Parametri:** Prikaz parametara u path-u (npr. \`:id\`, \`:invoiceId\`)

**Kako koristiti**
1. Prijavi se kao ADMIN na https://uslugar.oriph.io/admin
2. Klikni na **📚 API Reference** u sidebaru
3. Pregledaj sve API endpointe grupirane po modulima
4. Koristi pretragu za brzo pronalaženje specifičnog endpointa
5. Klikni na endpoint za proširenje detalja (metoda, path, parametri, handler)
6. Koristi filter za prikaz samo određene grupe endpointa

**Sigurnost**
- Sve operacije zahtijevaju ADMIN role
- Endpoint dinamički dohvaća rute iz Express aplikacije
- Nema mogućnosti izmjene ruta, samo pregled
`,
        technicalDetails: `## Backend API

**API Reference endpoint**
- \`GET /api/admin/api-reference\`
  - Dinamički dohvaća sve Express rute iz aplikacije
  - Koristi \`req.app._router.stack\` za dohvat registriranih ruta
  - Rekurzivno parsira nested routere
  - Izvlači HTTP metode, path-ove, parametre i handler funkcije
  - Vraća: \`{ success: true, totalRoutes: number, routes: {...}, allRoutes: [...] }\`

**Parsiranje ruta**
- Funkcija \`getRoutes(stack, basePath)\` rekurzivno prolazi kroz Express router stack
- Detektira direktne rute (\`layer.route\`) i nested routere (\`layer.name === 'router'\`)
- Izvlači HTTP metode iz \`layer.route.methods\`
- Ekstrahira parametre iz path-a koristeći regex (\`:paramName\`)
- Grupira rute po base path-u (prvi segment nakon \`/api\`)

**Struktura odgovora**
\`\`\`json
{
  "success": true,
  "totalRoutes": 150,
  "routes": {
    "auth": [
      {
        "method": "POST",
        "path": "/login",
        "fullPath": "/api/auth/login",
        "handler": "loginHandler",
        "params": null
      }
    ],
    "admin": [
      {
        "method": "GET",
        "path": "/users",
        "fullPath": "/api/admin/users",
        "handler": "getUsers",
        "params": null
      },
      {
        "method": "GET",
        "path": "/users/:id",
        "fullPath": "/api/admin/users/:id",
        "handler": "getUser",
        "params": ["id"]
      }
    ]
  },
  "allRoutes": [...]
}
\`\`\`

## Frontend

**AdminApiReference.jsx**
- **Route:** \`/admin/api-reference\`
- **Komponente:**
  - Header s ukupnim brojem endpointa
  - Search bar za pretragu
  - Filter dropdown za grupe
  - Grupirani prikaz ruta po modulima
  - Expandable/collapsible detalji za svaki endpoint
  - Flat view za rezultate pretrage

- **State management:**
  - \`apiData\`: Podaci o rutama (grupe i sve rute)
  - \`searchTerm\`: Tekst za pretragu
  - \`selectedGroup\`: Odabrana grupa za filtriranje
  - \`expandedRoutes\`: Set proširenih endpointa

- **Funkcionalnosti:**
  - \`loadApiReference()\`: Učitaj sve API endpointe
  - \`toggleRoute()\`: Proširi/sažmi detalje endpointa
  - \`getMethodColor()\`: Vrati boju za HTTP metodu
  - \`filteredRoutes\`: Filtrirane rute po grupi i pretrazi
  - \`filteredAllRoutes\`: Svi filtrirani rezultati pretrage

- **UI komponente:**
  - Method badge (GET, POST, PUT, DELETE, PATCH) s bojama
  - Path prikaz (code format)
  - Parametri badge (purple) za path parametre
  - Handler prikaz (ako nije anonymous)
  - Expand/collapse ikone

**Baza podataka**
- Nema baze podataka - sve se dinamički dohvaća iz Express aplikacije
- Podaci se generiraju na zahtjev iz runtime Express router stack-a

**Sigurnost**
- Endpoint zahtijeva \`auth(true, ['ADMIN'])\`
- Samo pregled ruta, nema mogućnosti izmjene
- Dinamički dohvat osigurava da se prikazuju samo aktualne rute
`
      },
      "Upravljanje ROI statistikama": {
        summary: "Pregled i upravljanje ROI metrikama za pružatelje",
        details: `## Kako funkcionira:

**ROI statistike**
- Pregled ključnih metrika (revenue, cost, profit, conversion rate) za svakog pružatelja uz usporedbu s prosjekom platforme.
- Trend analiza kroz odabrane periode s fokusom na rast ili pad performansi.

**Godišnji i mjesečni izvještaji**
- Godišnji i mjesečni breakdown prihoda, troškova i konverzija po kanalu leadova.
- Export u PDF/CSV za financijske timove i interne review sastanke.

**Analitika i benchmarking**
- Rang lista top pružatelja, profitabilnih kategorija i regija.
- Usporedba ROI-ja s target vrijednostima te highlight rizičnih odstupanja.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- **Komponenta:** \`uslugar/frontend/src/pages/AdminROI.jsx\`
- **Route:** \`/admin/roi\`
- **State management:** useState, useEffect hooks
- **Grafovi:** Chart.js za vizualizaciju

### Backend:
- **Route:** \`uslugar/backend/src/routes/admin.js\`
- **Middleware:** \`auth(true, ['ADMIN'])\`
- **Servis:** \`provider-roi-service.js\`
- **Prisma:** Query za ProviderROI model

### Baza podataka:
- **Tablice:** \`ProviderROI\`, \`ProviderProfile\`, \`LeadPurchase\`, \`Job\`
- **Relacije:** ProviderROI → ProviderProfile, ProviderROI → LeadPurchase
- **Polja:** \`revenue\`, \`cost\`, \`profit\`, \`conversionRate\`
- **Indeksi:** \`@@index([providerId])\`, \`@@index([year])\`

### API pozivi:
- \`GET /api/admin/roi/stats\` - Svi ROI statistički podaci
- \`GET /api/admin/roi/provider/:id\` - ROI za određenog pružatelja
- \`GET /api/admin/roi/yearly-report?year=2024\` - Godišnji izvještaj
      `
      },
      "Upravljanje licencama": {
        summary: "Verificiranje i upravljanje licencama pružatelja",
        details: `## Kako funkcionira:

**Pregled licenci**
- Centralizirana lista svih licenčnih dokumenata s filterima po statusu, tipu i pružatelju.
- Istaknute informacije o izdavatelju, datumu isteka i napomenama.

**Verifikacija**
- Ručni workflow za provjeru autentičnosti (broj licence, izdavatelj, valjanost datuma).
- OCR i dodatni dokumenti ubrzavaju potvrdu i smanjuju rizik pogreške.

**Upravljanje životnim ciklusom**
- Praćenje isteka i automatske notifikacije pružatelju i administratoru.
- Aktivacija/deaktivacija licenci te povijest svih verifikacijskih akcija.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminLicenses.jsx'
- Ruta: '/admin/licenses'
- Filtri po statusu, tipu licence, pružatelju uz modal za pregled dokumenta i audit traga
- OCR preview i anotacije radi brže validacije

### Backend:
- Ruta: '/api/admin/licenses'
- Middleware: auth(true, ['ADMIN'])
- Servis 'licenseVerificationService' vodi verifikaciju i bilježi audit
- Cron job 'licenseExpiryReminder' šalje podsjetnike prije isteka

### Baza:
- Tablice: 'ProviderLicense', 'ProviderProfile', 'LicenseVerificationLog'
- Polja: licenseType, licenseNumber, issuingAuthority, expiresAt, status (PENDING, VERIFIED, REJECTED)
- Indeksi: @@index([status]), @@index([expiresAt]), @@index([providerId])

### Integracije:
- Event 'license.status.changed' obavještava notifikacijski i compliance modul
- Upload ide u S3 (scan s antivirusom), opcionalno povezano s vanjskim registrima
- Audit log čuva svaku promjenu statusa i napomenu

### API poziv:
- GET /api/admin/licenses?status=&providerId=&licenseType=
- POST /api/admin/licenses/:licenseId/verify (payload: { status, notes })
- GET /api/admin/licenses/expiring?days=30 za licence koje uskoro istječu
      `
      },
      "Verificiranje licenci od strane admina": {
        summary: "Ručna verifikacija licenci i certifikata",
        details: `## Kako funkcionira:

**Verifikacijski proces**
- Admin otvara uploadani dokument, provjerava broj licence u relevantnom registru i potvrđuje datume važenja.
- Sustav validira da odabrana licenca pokriva prijavljene kategorije/poslove.

**Admin akcije**
- Odobravanje, odbijanje ili traženje dodatne dokumentacije uz obaveznu napomenu.
- Automatska notifikacija pružatelju o donesenoj odluci i eventualnim koracima.

**Evidencija**
- Svaki pregled bilježi admina, datum i napomene.
- Povijest verifikacijskih pokušaja dostupna je radi revizije i compliance zahtjeva.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminLicenseVerification.jsx'
- Ruta: '/admin/licenses/verify'
- Modal prikazuje dokument, OCR rezultat i prihvaćene/odbijene oznake
- Workflow gumbima (approve/reject/request-more) ažurira status

### Backend:
- Ruta: '/api/admin/licenses/:licenseId'
- Middleware: auth(true, ['ADMIN'])
- Servis 'licenseValidator' poziva vanjske registre (ako postoje) i upisuje rezultat
- Audit log čuva verifiedBy, verifiedAt i napomenu

### Baza:
- Tablice: 'ProviderLicense', 'ProviderProfile', 'LicenseVerificationLog'
- Polja: verifiedAt, verifiedBy, status, notes, documentUrl, ocrData JSONB
- Indeksi: @@index([status]), @@index([verifiedBy]), @@index([providerId])

### Integracije:
- Event 'license.verified' ili 'license.rejected' obavještava pružatelja (email/SMS)
- OCR servis (AWS Textract/Google Vision) pohranjuje ekstrahirane podatke
- Compliance izvještaj skuplja sve ručne odluke

### API poziv:
- GET /api/admin/licenses/:licenseId (detalji + dokument)
- POST /api/admin/licenses/:licenseId/verify (payload: { status, notes, requestMoreInfo? })
- POST /api/admin/licenses/:licenseId/validate automatski pokreće provjeru u registru
      `
      },
      "Upravljanje verifikacijama klijenata": {
        summary: "Upravljanje KYC i drugim verifikacijama korisnika",
        details: `## Kako funkcionira:

**KYC verifikacija**
- Admin pregledava uploadane dokumente (Rješenje Porezne uprave, obrtnica), provjerava OCR rezultat i validira OIB.
- Vanjske provjere (obrtni registri, komore) potvrđuju status poslovnog subjekta.

**Kontakt verifikacija**
- Dashboard prikazuje email/SMS status, omogućuje reset pokušaja ili ručno označavanje kao verified.
- Sustav generira nove kodove i prati limit pokušaja kako bi spriječio zlouporabu.

**Dokumentacija i badge-evi**
- Povijest svih provjera i admin bilješki pohranjena je za audit potrebe.
- Status badge-evi (BUSINESS, IDENTITY, SAFETY) automatski se ažuriraju prema rezultatu verifikacije.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminKYC.jsx'
- Ruta: '/admin/kyc'
- Tab switch između dokumenta, kontakata i badge-ova, s pregledom OCR rezultata
- Akcije za reset SMS/email pokušaja i ručnu verifikaciju

### Backend:
- Ruta: '/api/admin/kyc'
- Middleware: auth(true, ['ADMIN'])
- Servis 'kycService' orkestrira OCR, OIB validaciju i sinkronizaciju s vanjskim registrima
- Audit log pohranjuje sve admin odluke

### Baza:
- Tablice: 'ProviderProfile', 'User', 'KycVerificationLog'
- Polja: kycVerified, kycDocumentUrl, kycDocumentType, kycOcrData JSONB, kycOibValidated, badgeData
- Indeksi: @@index([kycVerified]), @@index([kycOibValidated]), @@index([userId])

### Integracije:
- OCR servis (AWS Textract/Google Vision) i OIB API
- Notifikacijski servis obavještava korisnika o statusu provjere
- Compliance izvještaji prate vrijeme rješavanja KYC zahtjeva

### API poziv:
- GET /api/admin/kyc?verified=&userId=
- POST /api/admin/kyc/:userId/verify (payload: { status, notes, badgeChanges })
- POST /api/admin/kyc/:userId/reset-contact (reset email/SMS pokušaja)
      `
      },
      "Dokumenti za verifikaciju": {
        summary: "Upravljanje dokumentima za KYC i verifikaciju",
        details: `## Kako funkcionira:

**Tipovi dokumenata**
- Podržani obrasci (RPO, obrtni registar, licence, osobni dokumenti) mapirani su na standardizirane kodove.

**Upload i procesiranje**
- Korisnik prenosi dokument preko portala; sustav pokreće OCR, ekstrakciju OIB-a, imena i datuma izdavanja.
- Dokument se pohranjuje u sigurno skladište uz enkripciju i detekciju virusa.

**Admin pregled**
- Moderator pregledava izvučene podatke, uspoređuje s originalom i ručno korigira ako OCR nije točan.
- Akcija odobravanja ili odbijanja dokumenta automatski generira notifikaciju korisniku.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminVerificationDocuments.jsx'
- Ruta: '/admin/verification-documents'
- Galerijski prikaz dokumenata s OCR previewom i status badge-ovima
- Akcije approve/reject/request-more-info s obaveznim komentarom

### Backend:
- Ruta: '/api/admin/verification-documents'
- Middleware: auth(true, ['ADMIN'])
- Servis 'kycDocumentService' orkestrira upload, OCR i verifikaciju
- Integracija s antivirus skenerom prije spremanja u S3

### Baza:
- Tablice: 'VerificationDocument', 'ProviderProfile', 'User'
- Polja: documentType, documentUrl, extractedData JSONB, status, reviewerId, reviewedAt
- Indeksi: @@index([documentType]), @@index([status]), @@index([userId])

### Integracije:
- OCR servis (Textract/Vision) i hash provjera za otkrivanje duplikata
- Event 'verification.document.statusChanged' obavještava korisnika i compliance
- GDPR maskiranje osjetljivih podataka pri prikazu adminima bez punih privilegija

### API poziv:
- GET /api/admin/verification-documents?type=&userId=&status=
- GET /api/admin/verification-documents/:id (download i metadata)
- POST /api/admin/verification-documents/:id/decision (payload: { status, notes })
      `
      },
      "Admin reset SMS pokušaja": {
        summary: "Reset pokušaja SMS verifikacije za korisnike",
        details: `## Kako funkcionira:

**SMS verifikacija**
- End-user dobiva jednokratni 6-znamenkasti kod; sustav prati maksimalan broj pokušaja i vrijeme isteka.
- Nakon prekoračenja pokušaja korisnik je privremeno blokiran radi sigurnosti.

**Admin reset**
- Admin može resetirati broj pokušaja, generirati novi kod i produžiti vrijeme isteka.
- Reset automatski odblokira korisnika i šalje novi SMS.

**Kada intervenirati**
- Kod nije dostavljen, korisnik je potrošio sve pokušaje ili se dogodio tehnički problem kod SMS providera.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminUsers.jsx' (detalji korisnika)
- Ruta: '/admin/users/:id'
- Gumb “Resetiraj SMS verifikaciju” dostupna samo adminima s odgovarajućom rolnom
- UI prikazuje trenutni broj pokušaja i vrijeme isteka

### Backend:
- Ruta: '/api/admin/users/:id/reset-sms'
- Middleware: auth(true, ['ADMIN'])
- Servis 'smsVerificationService.resetAttempts' postavlja pokušaje na nulu i poziva SMS provider
- Audit log sprema admina, razlog i timestamp

### Baza:
- Tablica: 'User'
- Polja: phoneVerificationAttempts, phoneVerificationCode, phoneVerificationExpires, phoneBlockedUntil
- Reset setira attempts=0, generira novi kod i novi expiry, uklanja block flag

### Integracije:
- SMS provider (Twilio/Infobip) dobiva request za slanje novog koda
- Rate limiter sprečava prečeste resete s iste IP adrese
- Notifikacijski servis šalje email backup code ako SMS zakaže

### API poziv:
- POST /api/admin/users/:id/reset-sms (payload: { reason? })
- Response vraća novi expiry i status slanja, a audit event se emitira
      `
      },
      "KYC Metrike": {
        summary: "Statistike i analitika KYC verifikacija",
        details: `## Kako funkcionira:

**KYC statistike**
- Dashboard prikazuje broj verificiranih korisnika, stopu uspješnosti i prosječno vrijeme obrade.
- Razlozi odbijanja se agregiraju kako bi tim uočio obrasce.

**Breakdown po tipovima provjera**
- Posebni widgeti prate uspješnost OCR-a, OIB provjera, obrtnih registara i VIES validacija.
- Administratori mogu filtrirati po kategoriji usluge ili regiji.

**Trendovi**
- Vremenski grafovi (dnevno/mjesečno) prate rast ili pad volumena i uspjeha.
- Otkrivaju kategorije/usluge s najvećim brojem neuspjelih provjera.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminKYCMetrics.jsx'
- Ruta: '/admin/kyc-metrics'
- Grafovi (Chart.js) za trendove i widgeti za KPI-jeve (uspješnost, prosječno vrijeme)
- Tablica s razlozima odbijanja i quick-filterima

### Backend:
- Ruta: '/api/admin/kyc-metrics'
- Middleware: auth(true, ['ADMIN'])
- Servis 'kycMetricsService' radi agregacije (COUNT/AVG) i čuva cache
- Cron job regenerira agregate jednom dnevno i po potrebi na zahtjev

### Baza:
- Tablice: 'ProviderProfile', 'User', 'KycVerificationLog'
- Polja: kycVerified, kycVerifiedAt, kycRejectedReason, kycOcrVerified, kycOibValidated
- Indeksi: @@index([kycVerified]), @@index([kycVerifiedAt]), @@index([kycRejectedReason])

### Integracije:
- Event 'kyc.status.updated' puni event store koji služi kao izvor metrika
- BI pipeline (Looker/Snowflake) koristi iste agregate za napredne izvještaje
- Alert sustav (PagerDuty/Slack) reagira ako stopa neuspjeha naglo poraste

### API poziv:
- GET /api/admin/kyc-metrics?period=monthly|weekly&breakdown=category|region
- GET /api/admin/kyc-metrics/reasons?top=5
- POST /api/admin/kyc-metrics/recalculate (ručno osvježavanje cachea)
      `
      },
      "Provider Approvals": {
        summary: "Statistike odobravanja novih pružatelja",
        details: `## Kako funkcionira:

**Approval statistike**
- Dashboard prikazuje broj novih registracija, status odobrenja (WAITING, APPROVED, REJECTED) i prosječno vrijeme obrade.
- Stopu odobrenja/odbijanja moguće je segmentirati po kategoriji ili regiji.

**Razlozi odbijanja**
- Sustav agregira najčešće razloge (dokumentacija, nekompletni podaci, KYC neuspjeh) kako bi tim poboljšao onboarding procese.

**Trendovi**
- Linijski grafovi prate priljev novih pružatelja po mjesecima te koliko brzo se zahtjevi rješavaju.
- Pregled pending zahtjeva naglašava kritične točke i SLA rizike.
`,
        technicalDetails: `## Tehnički detalji:

### Frontend:
- Komponenta: 'uslugar/frontend/src/pages/AdminProviderApprovals.jsx'
- Ruta: '/admin/provider-approvals'
- Grafovi (Chart.js) za trendove, tablica pending zahtjeva s quick actions
- Drill-down otvara detalje registracije i povezanih verifikacija

### Backend:
- Ruta: '/api/admin/provider-approvals'
- Middleware: auth(true, ['ADMIN'])
- Servis 'providerApprovalService' radi agregacije i priprema SLA upozorenja
- Podržana export funkcionalnost u CSV za compliance izvješća

### Baza:
- Tablice: 'ProviderProfile', 'User', 'ProviderApprovalLog'
- Polja: approvalStatus, approvalRequestedAt, approvedAt, rejectionReason
- Indeksi: @@index([approvalStatus]), @@index([approvalRequestedAt]), @@index([categoryId])

### Integracije:
- Event 'provider.approval.updated' ažurira queue i billing module
- SLA reminder job šalje alert ako zahtjev čeka duže od definiranog praga
- BI pipeline koristi agregate za usporedbu performansi onboarding tima

### API poziv:
- GET /api/admin/provider-approvals?status=&categoryId=&period=monthly
- GET /api/admin/provider-approvals/stats (agregati + trendovi)
- PUT /api/admin/providers/:id/approval (payload: { approvalStatus, notes })
      `
      }
    };

    // Seed admin funkcionalnosti
    for (let catIndex = 0; catIndex < adminFeatures.length; catIndex++) {
      const categoryData = adminFeatures[catIndex];
      
      const category = await prisma.documentationCategory.upsert({
        where: { name: categoryData.category },
        update: { order: 1000 + catIndex, isActive: true },
        create: { name: categoryData.category, order: 1000 + catIndex, isActive: true }
      });

      console.log(`✅ Admin kategorija: ${categoryData.category}`);

      if (categoryData.items && Array.isArray(categoryData.items)) {
        for (let itemIndex = 0; itemIndex < categoryData.items.length; itemIndex++) {
          const item = categoryData.items[itemIndex];
          const description = adminFeatureDescriptions[item.name];

          const featureData = {
            categoryId: category.id,
            name: item.name,
            implemented: item.implemented !== undefined ? item.implemented : true,
            deprecated: item.deprecated || false,
            isAdminOnly: true, // Vazno: admin-only flag
            order: itemIndex,
            summary: description?.summary || null,
            details: description?.details || null,
            technicalDetails: description?.technicalDetails || null // Tehnički opis
          };

          const existing = await prisma.documentationFeature.findFirst({
            where: { categoryId: category.id, name: item.name }
          });

          if (existing) {
            await prisma.documentationFeature.update({
              where: { id: existing.id },
              data: featureData
            });
            featuresUpdated++;
            console.log(`   📝 Ažuriran: ${item.name}`);
          } else {
            await prisma.documentationFeature.create({ data: featureData });
            featuresCreated++;
            console.log(`   ➕ Kreiran: ${item.name}`);
          }
          
          totalFeatures++;
          if (item.implemented) implementedFeatures++;
        }
      }
    }

    console.log('✅ Admin funkcionalnosti seedane!');

    // Dodaj statistiku
    console.log('');
    console.log('📊 Dodavanje statistike...');
    const statsCategory = await prisma.documentationCategory.upsert({
      where: { name: 'Statistike Implementacije' },
      update: { order: 999, isActive: true },
      create: { name: 'Statistike Implementacije', order: 999, isActive: true }
    });

    const statsFeature = await prisma.documentationFeature.upsert({
      where: {
        categoryId_name: {
          categoryId: statsCategory.id,
          name: `${implementedFeatures} Implementirane funkcionalnosti`
        }
      },
      update: {
        summary: `Ukupno ${implementedFeatures} od ${totalFeatures} funkcionalnosti je implementirano.`,
        details: `## Statistika Implementacije:\n\n- **Ukupno funkcionalnosti:** ${totalFeatures}\n- **Implementirane:** ${implementedFeatures}\n- **Postotak:** ${Math.round((implementedFeatures / totalFeatures) * 100)}%\n\nOva statistika se automatski ažurira pri svakom seed-u dokumentacije.`,
        implemented: true,
        order: 0
      },
      create: {
        categoryId: statsCategory.id,
        name: `${implementedFeatures} Implementirane funkcionalnosti`,
        summary: `Ukupno ${implementedFeatures} od ${totalFeatures} funkcionalnosti je implementirano.`,
        details: `## Statistika Implementacije:\n\n- **Ukupno funkcionalnosti:** ${totalFeatures}\n- **Implementirane:** ${implementedFeatures}\n- **Postotak:** ${Math.round((implementedFeatures / totalFeatures) * 100)}%\n\nOva statistika se automatski ažurira pri svakom seed-u dokumentacije.`,
        implemented: true,
        order: 0
      }
    });

    console.log(`✅ Statistika dodana: ${implementedFeatures} Implementirane funkcionalnosti`);

    console.log('');
    console.log('📊 REZULTAT SEED-a:');
    console.log(`   Kategorije kreirane: ${categoriesCreated}`);
    console.log(`   Kategorije ažurirane: ${categoriesUpdated}`);
    console.log(`   Features kreirani: ${featuresCreated}`);
    console.log(`   Features ažurirani: ${featuresUpdated}`);
    console.log(`   Ukupno funkcionalnosti: ${totalFeatures}`);
    console.log(`   Implementirane: ${implementedFeatures} (${Math.round((implementedFeatures / totalFeatures) * 100)}%)`);
    console.log('✅ Seed dokumentacije završen!');

  } catch (error) {
    console.error('❌ Greška pri seed-u dokumentacije:', error);
    throw error;
  }
}

// Pokreni seed ako se pozove direktno
seedDocumentation()
  .then(async () => {
    console.log('✅ Seed dokumentacije uspješno završen!');
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('❌ Seed neuspješan:', error);
    console.error(error.stack);
    await prisma.$disconnect();
    process.exit(1);
  });

export default seedDocumentation;

