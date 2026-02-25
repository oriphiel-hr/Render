/**
 * Sadržaj vodiča po ulozi. Korisnik vidi samo vodič za svoju ulogu.
 * Slike: trenutno placeholder URL-ovi. Za prave screenshotove spremi slike u
 * frontend/public/docs/ (npr. guide-korisnik-1.png ... guide-korisnik-6.png,
 * guide-pružatelj-1.png ... guide-pružatelj-6.png) i zamijeni PLACEHOLDER() s
 * putanjama npr. /docs/guide-korisnik-1.png.
 */

const PLACEHOLDER = (text) =>
  `https://placehold.co/800x420/fef3c7/92400e?text=${encodeURIComponent(text)}`;

/** Vodič za korisnike usluge (naručitelji koji traže majstora) */
export const GUIDE_KORISNIK = [
  {
    step: 1,
    title: 'Registracija i prijava',
    userAction: 'Odaberete "Registracija" ili "Prijava" u izborniku i unesete email, lozinku i osnovne podatke.',
    appResult: 'Dobivate pristup svom računu i glavnoj stranici. U izborniku vidite "Moj račun", "Moji poslovi" i ostale opcije.',
    image: PLACEHOLDER('Korak 1: Registracija / Prijava'),
    puniOpis: `**1.** Odaberete "Registracija" ili "Prijava" u izborniku. Za registraciju unesete email, lozinku i osnovne podatke; za prijavu samo email i lozinku. Sustav koristi JWT autentifikaciju i automatski postavlja ulogu (korisnik usluge, pružatelj, admin).

**2.** Nakon registracije stiže email s linkom za potvrdu – provjerite poštu i kliknite na link kako bi račun bio aktivan. Bez potvrde emaila neke opcije možda neće biti dostupne.

**3.** Ako zaboravite lozinku: na stranici za prijavu odaberete "Zaboravljena lozinka?", unesete email i pošaljete zahtjev. Na email stiže siguran link (vrijedi 1 sat) za postavljanje nove lozinke. Unesete novu lozinku dvaput i automatski se prijavite; sve stare sesije se odjavljuju. Link vrijedi samo jednom.

**4.** U izborniku vidite "Moj račun", "Moji poslovi" i ostale opcije.`,
  },
  {
    step: 2,
    title: 'Objavi posao',
    userAction: 'U "Moji poslovi" kliknete "Objavi posao" (ili na početnoj "Objavi novi posao"). Ispunite naslov, kategoriju (npr. Električar), grad, budžet i opis.',
    appResult: 'Posao se objavljuje i pojavljuje u listi. Samo jedan provjereni pružatelj dobiva vaš upit – nema spam poziva.',
    image: PLACEHOLDER('Korak 2: Forma za objavu posla'),
    puniOpis: `**1.** U "Moji poslovi" kliknete "Objavi posao" ili na početnoj stranici "Objavi novi posao". Odaberete kategoriju usluge (npr. Električar) iz dinamičkog popisa – prikazuju se emoji ikone, opisi i NKD kodovi.

**2.** Ispunite naslov, detaljni opis posla, lokaciju (grad), budžet (min–max) i po želji geolokaciju. Možete dodati slike posla. Označite hitnost: NORMALNA ili HITNA; veličinu posla (MALA, SREDNJA, VELIKA); rok izvršenja.

**3.** Posao se objavljuje s statusom OTVOREN. Pojavljuje se u listi; pretraga i filteri (kategorija, grad, budžet, status, datum) omogućuju pronalazak. Samo jedan provjereni pružatelj dobiva vaš upit – nema spam poziva. U "Moji poslovi" imate pregled svih poslova, statistiku (broj po statusu, ukupno primljenih ponuda), povijest suradnje s pružateljima i mogućnost preuzimanja liste u CSV.`,
  },
  {
    step: 3,
    title: 'Pregled ponuda',
    userAction: 'U "Moji poslovi" otvorite svoj posao i vidite ponudu (ili poruku) od pružatelja.',
    appResult: 'Aplikacija prikazuje detalje ponude. Možete prihvatiti ponudu ili nastaviti razgovor u chatu.',
    image: PLACEHOLDER('Korak 3: Moji poslovi – ponude'),
    puniOpis: `**1.** U "Moji poslovi" otvorite svoj posao. Za svaki posao vidite status: OTVOREN (čekate ponude), U TIJEKU (odabrali ste pružatelja), ZAVRŠEN ili OTKAZAN.

**2.** Kad pružatelj pošalje ponudu, prikazuje se iznos, poruka uz ponudu, procijenjeni broj dana i može li se pregovarati o cijeni. Status ponude: NA ČEKANJU, PRIHVAĆENA ili ODBIJENA. Možete pregledati sve ponude za taj posao.

**3.** Odlučite: prihvatite jednu ponudu ili odbijete. Ako prihvatite, status prelazi u U TIJEKU i otvara se chat soba s tim pružateljem. Aplikacija Vas obavještava putem notifikacija o novim ponudama. U "Moji poslovi" možete filtrirati poslove po statusu (otvoreni, u tijeku, završeni, otkazani), pregledati statistiku i povijest pružatelja s kojima ste surađivali te preuzeti listu poslova u CSV.`,
  },
  {
    step: 4,
    title: 'Chat i dogovor',
    userAction: 'U "Chat" odaberete razgovor s pružateljem i dopisujete se za termin i detalje.',
    appResult: 'Sve ostaje u jednoj sobi. Kad se dogovorite, posao možete označiti kao završen.',
    image: PLACEHOLDER('Korak 4: Chat s pružateljem'),
    puniOpis: `**1.** U izborniku odaberete "Chat". Vidite listu razgovora – za svaki posao jedna chat soba s pružateljem kojeg ste prihvatili. Odaberete razgovor i vidite povijest poruka.

**2.** Dopisujete se u realnom vremenu; možete poslati i slike. Poruke imaju status (poslana, pročitana). Sve ostaje u jednoj sobi. Notifikacije za nove poruke stižu putem emaila, SMS-a, in-app ili push obavijesti.

**3.** Kad se dogovorite o terminu i detaljima, možete označiti posao kao završen. Status prelazi u ZAVRŠEN. Nakon toga možete ocijeniti pružatelja (sljedeći korak).`,
  },
  {
    step: 5,
    title: 'Ocjenjivanje i recenzije',
    userAction: 'Nakon završenog posla možete ocijeniti pružatelja (1–5 zvjezdica) i ostaviti komentar.',
    appResult: 'Recenzija se prikazuje na profilu pružatelja. I Vi i pružatelj se međusobno možete ocijeniti.',
    image: PLACEHOLDER('Korak 5: Recenzije'),
    puniOpis: `**1.** Nakon što je posao označen kao ZAVRŠEN, sustav omogućuje obostrano ocjenjivanje – i Vi i pružatelj možete jedan drugome dati ocjenu i komentar. Duplikati recenzija su spriječeni; postojeću recenziju možete uređivati ili obrisati.

**2.** Odaberete ocjenu od 1 do 5 zvjezdica i napišete kratki komentar. Sustav automatski izračunava prosječnu ocjenu i broj recenzija na profilu pružatelja.

**3.** Recenzija se prikazuje na profilu pružatelja i pomaže drugima pri odluci. Vaš profil također može imati recenzije od pružatelja s kojima ste surađivali.`,
  },
  {
    step: 6,
    title: 'Refund i notifikacije',
    userAction: 'Ako pružatelj ne odgovori ili ne ispuni dogovor, možete prijaviti problem u aplikaciji. Kao korisnik koristite platformu besplatno – kredite plaćaju pružatelji kad kupuju vaš upit. Sve važne događaje primate putem emaila ili notifikacija.',
    appResult: 'Prijave se rješavaju prema pravilima platforme; notifikacije Vas obavještavaju o novim ponudama, porukama i statusu poslova.',
    image: PLACEHOLDER('Korak 6: Refund i notifikacije'),
    puniOpis: `**1.** Kao korisnik usluge koristite platformu besplatno – ne plaćate kredite. Kredite troše pružatelji kad kupuju vaš upit (lead). Ako pružatelj ne odgovori na vaš posao ili ne ispuni dogovor, u aplikaciji možete prijaviti problem ili zatražiti rješavanje; platforma postupa prema pravilima (povrat kredita odnosi se na pružatelja, ne na Vas).

**2.** Notifikacije: primate obavijesti za nove ponude, prihvaćene ili odbijene ponude, nove poruke u chatu i promjene statusa poslova. Kanali su email notifikacije, SMS (Infobip), in-app notifikacije i push obavijesti u pregledniku. Brojač nepročitanih notifikacija pokazuje što još niste pročitali.

**3.** Spremljene pretrage: u tražilici možete spremiti pretragu s filterima za brzo ponovno korištenje; spremljene pretrage upravljate u profilu. Job alertovi: email notifikacije za nove poslove koji odgovaraju vašim kriterijima; frekvencija može biti DAILY, WEEKLY ili INSTANT; job alertove također upravljate u profilu.`,
  },
];

/** Vodič za pružatelje usluga (majstori koji primaju leadove) */
export const GUIDE_PRUVATELJ = [
  {
    step: 1,
    title: 'Registracija kao pružatelj',
    userAction: 'Odaberete "Postani pružatelj" ili registraciju kao pružatelj. Unesete podatke tvrtke/obrta i odaberete kategorije u kojima radite (npr. Električar, Vodoinstalater).',
    appResult: 'Profil pružatelja je kreiran. Nakon potvrde (i eventualne pretplate) vidite "Leadovi" i "Moj račun".',
    image: PLACEHOLDER('Korak 1: Registracija pružatelja'),
    puniOpis: `**1.** Odaberete "Postani pružatelj" ili registraciju kao pružatelj. Unesete podatke tvrtke ili obrta te pravni status; sustav podržava različite uloge (USER, PROVIDER, ADMIN) i JWT autentifikaciju.

**2.** Prođete wizard registracije: odabirete kategorije u kojima radite (npr. Električar, Vodoinstalater) iz dinamičkog popisa s emoji ikonama i NKD kodovima, te regije u kojima primate poslove. Kategorije mogu imati oznake za licencirane djelatnosti i tipove licenci (elektrotehnička, građevinska itd.).

**3.** Profil pružatelja je kreiran. Potvrdite email putem linka koji stiže na poštu. Nakon potvrde (i eventualne pretplate za kredite) u izborniku vidite "Leadovi" i "Moj račun". Bez potvrde emaila neke opcije možda neće biti dostupne.`,
  },
  {
    step: 2,
    title: 'Pregled leadova',
    userAction: 'U izborniku odaberete "Leadovi" (ili "Dostupni leadovi"). Filtrirate po kategoriji, gradu ili budžetu ako želite.',
    appResult: 'Vidite listu poslova koji odgovaraju vašim kategorijama. Jedan lead = samo Vi dobivate kontakt klijenta.',
    image: PLACEHOLDER('Korak 2: Lista leadova'),
    puniOpis: `**1.** U izborniku odaberete "Leadovi" ili "Dostupni leadovi". Lista se dinamički učitava – prikazuju se samo poslovi koji odgovaraju vašim kategorijama i regijama. Ekskluzivni lead sustav: jedan lead = samo Vi dobivate kontakt klijenta.

**2.** Koristite filtere: kategorija, grad, budžet, status posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN), hitnost (NORMALNA, HITNA), veličina (MALA, SREDNJA, VELIKA), datum. Možete sortirati po najnovijem, budžetu i slično. Tražilica ima sticky search bar i napredne filtere.

**3.** Kliknete na posao koji Vas zanima da vidite puni opis, lokaciju, budžet i slike. Queue sustav za distribuciju leadova osigurava fer raspodjelu prema pravilima platforme.`,
  },
  {
    step: 3,
    title: 'Slanje ponude',
    userAction: 'Kliknete na posao koji Vas zanima i pošaljete ponudu (cijena, rok, kratki opis).',
    appResult: 'Naručitelj vidi vašu ponudu u "Moji poslovi". Ako prihvati, otvara se chat soba za dogovor.',
    image: PLACEHOLDER('Korak 3: Slanje ponude'),
    puniOpis: `**1.** Otvorite posao koji Vas zanima i odaberete slanje ponude. Unesete iznos ponude, poruku uz ponudu i procijenjeni broj dana za izvršenje. Možete označiti ponudu kao pregovornu ako je cijena predmet dogovora.

**2.** Sustav prikazuje status ponude: NA ČEKANJU dok naručitelj ne odluči, zatim PRIHVAĆENA ili ODBIJENA. Naručitelj vidi sve ponude i može pregovarati o cijeni ako ste to označili.

**3.** Ako naručitelj prihvati vašu ponudu, status posla prelazi u U TIJEKU i otvara se chat soba. Potrošit ćete jedan kredit za taj ekskluzivni lead (krediti se nadopunjuju prema pretplati). Notifikacije Vas obavještavaju o prihvaćenoj ili odbijenoj ponudi.`,
  },
  {
    step: 4,
    title: 'Chat i krediti',
    userAction: 'U "Chat" dopisujete se s klijentom. Jedan potrošeni kredit = jedan ekskluzivni lead.',
    appResult: 'Sve razgovore vodite u jednoj sobi. Kredite vidite u widgetu u headeru; dopuna preko "Cjenik" / pretplata.',
    image: PLACEHOLDER('Korak 4: Chat i krediti'),
    puniOpis: `**1.** U izborniku odaberete "Chat". Za svaki posao s prihvaćenom ponudom imate jednu chat sobu s naručiteljem. Povijest poruka je spremljena; možete slati i slike. Status poruke (poslana, pročitana) vidljiv je oboma stranama.

**2.** Real-time chat; notifikacije za nove poruke stižu putem emaila, SMS-a, in-app ili push obavijesti. Brojač nepročitanih pokazuje koliko poruka još niste pročitali. Sve ostaje u jednoj sobi.

**3.** Jedan potrošeni kredit = jedan ekskluzivni lead. Kredite vidite u widgetu u headeru; dopuna preko "Cjenik" ili pretplate (TRIAL, BASIC, PREMIUM, PRO). Kad se dogovorite, naručitelj može označiti posao kao završen; tada je dostupno obostrano ocjenjivanje.`,
  },
  {
    step: 5,
    title: 'Pretplata i cjenik',
    userAction: 'U "Cjenik" odaberete plan (TRIAL, BASIC, PREMIUM, PRO). Krediti se nadopunjuju prema planu; možete kupiti dodatne kredite.',
    appResult: 'Pretplata se upravlja preko Stripe; status vidite u "Moj račun" ili "Pretplata". Krediti se oduzimaju pri kupnji leada.',
    image: PLACEHOLDER('Korak 5: Pretplata i cjenik'),
    puniOpis: `**1.** U "Cjenik" odaberete pretplatni plan: TRIAL, BASIC, PREMIUM ili PRO. Svaki plan donosi određeni broj kredita (npr. mjesečno). Krediti se automatski nadopunjuju prema planu; možete kupiti i dodatne kredite.

**2.** Naplata i pretplata upravljaju se preko Stripe integracije. Fakture i status pretplate vidite u "Moj račun" ili "Pretplata". Krediti se oduzimaju kad kupite lead (kad vaša ponuda bude prihvaćena). Ako naručitelj zatraži refund prema pravilima, kredit se može vratiti – refund i povrat kredita vide se u istom odjeljku.

**3.** Preporučeno je održavati dovoljno kredita za leadove koje želite primati. ROI dashboard (sljedeći korak) pomaže pratiti troškove, konverzije i povrat kredita.`,
  },
  {
    step: 6,
    title: 'Profil, verifikacija i ROI',
    userAction: 'U "Moj profil" ažurirate podatke, kategorije i regije. Možete potvrditi email, telefon, tvrtku (Identity Badge). U "ROI" ili "Leadovi" vidite statistike i povijest.',
    appResult: 'Verificirani profil dobiva više povjerenja; ROI dashboard pokazuje troškove, konverzije i povrat kredita (refund).',
    image: PLACEHOLDER('Korak 6: Profil i ROI'),
    puniOpis: `**1.** U "Moj profil" ažurirate podatke: biografija, specijalizacije, godine iskustva, web stranica, područje rada, status dostupnosti. Odaberete kategorije i regije za primanje leadova; možete upravljati team locations (geo-dinamičke lokacije) i radius checking. Portfolio, certifikati i licence dodaju vjerodostojnost.

**2.** Identity Badge i verifikacije: potvrdite email, telefon i tvrtku za oznaku verificiranog profila. Verificirani profil dobiva više povjerenja i bolju vidljivost. Pravni status i reputacijski sustav prate vašu povijest i ocjene.

**3.** U "ROI" ili "Leadovi" vidite statistike: troškovi (potrošeni krediti, pretplata), konverzije (prihvaćene ponude, završeni poslovi), povrat kredita (refund). Fakture i naplata pregledavaju se u "Moj račun".`,
  },
];

/** Vodič za članove tima (izvođači koji rade za direktora tvrtke) */
export const GUIDE_TIM_CLAN = [
  {
    step: 1,
    title: 'Tko ste Vi – član tima',
    userAction: 'Direktor vas je dodao u tim tvrtke. Imate vlastiti račun (email, lozinka), ali leadove vam dodjeljuje direktor.',
    appResult: 'U "Moji leadovi" vidite sekciju "Leadovi dodijeljeni meni" – to su leadovi koje vam je direktor dodijelio.',
    image: PLACEHOLDER('Korak 1: Član tima'),
    puniOpis: `**1.** Kao član tima imate vlastiti User račun (PROVIDER) i povezani ste na tvrtku preko direktora. Direktor vas dodaje u tim u Director Dashboardu (samo on može dodavati ili uklanjati članove).

**2.** Leadove ne kupujete sami – direktor ih kupuje za tvrtku i zatim vam ih dodjeljuje ručno ili automatski (prema kategoriji i dostupnosti). Primat ćete notifikaciju "Novi lead dodijeljen" s linkom na Moje leadove.

**3.** U izborniku koristite "Moji leadovi" (Leadovi). Na toj stranici, ako ste član tima, prikazuje se posebna sekcija **Leadovi dodijeljeni meni** s listom leadova koje vam je direktor dodijelio.`,
  },
  {
    step: 2,
    title: 'Leadovi dodijeljeni meni',
    userAction: 'U "Moji leadovi" pregledavate listu dodijeljenih leadova. Za svaki lead vidite posao, klijenta, status (Dodijeljeno / U tijeku / Završeno).',
    appResult: 'Jedna jasna lista svih leadova koji su vam dodijeljeni; možete ih označiti kao "Započinjem rad" ili "Završeno".',
    image: PLACEHOLDER('Korak 2: Leadovi dodijeljeni meni'),
    puniOpis: `**1.** U "Moji leadovi" (npr. izbornik → Leadovi) otvorite stranicu. Na vrhu, ako ste član tima, vidite blok **Leadovi dodijeljeni meni**. U njemu su svi leadovi koje vam je direktor dodijelio iz internog queuea tvrtke.

**2.** Za svaki lead prikazuju se: naslov posla, kategorija, grad, ime klijenta, tvrtka (direktor), datum dodjele i status: DODIJELJENO (tek ste ga dobili), U TIJEKU (započeli ste rad), ZAVRŠENO (završeni posao).

**3.** Vaša akcija: gumb **Započni rad** postavlja status u "U tijeku" (bilježi se vrijeme početka); gumb **Završeno** postavlja status u "Završeno" (bilježi se vrijeme završetka). Direktor tako vidi napredak na leadovima koje vam je dodijelio.`,
  },
  {
    step: 3,
    title: 'Chat s klijentom',
    userAction: 'Kad vam je lead dodijeljen, za taj posao možete koristiti chat s klijentom. U chatu su i Vi i direktor (ako je lead dodijeljen vama).',
    appResult: 'Sva komunikacija s klijentom odvija se u jednoj sobi; direktor može pratiti razgovor.',
    image: PLACEHOLDER('Korak 3: Chat s klijentom'),
    puniOpis: `**1.** Nakon što vam je lead dodijeljen, za taj posao (job) automatski imate pristup **public chat** sobi s klijentom. U sobi su klijent, direktor i Vi (tim član kojem je lead dodijeljen).

**2.** U izborniku odaberete "Chat" i vidite listu razgovora. Odaberete razgovor za odgovarajući posao i dopisujete s klijentom u realnom vremenu. Možete slati poruke i slike. Notifikacije vas obavještavaju o novim porukama.

**3.** Sve ostaje u jednoj sobi; direktor vidi razgovor i može vas podržati ako treba. Kad završite posao, označite lead kao "Završeno" u sekciji Leadovi dodijeljeni meni.`,
  },
  {
    step: 4,
    title: 'Interni chat (Direktor ↔ tim)',
    userAction: 'Direktor može otvoriti interni chat s vama (1-na-1 ili grupa s više članova tima). Koristite ga za koordinaciju i pitanja unutar tvrtke.',
    appResult: 'Interni razgovori ostaju odvojeni od chata s klijentima; sve je u aplikaciji.',
    image: PLACEHOLDER('Korak 4: Interni chat'),
    puniOpis: `**1.** Osim chata s klijentom, direktor može kreirati **INTERNAL** chat sobe – između sebe i pojedinog člana tima ili grupu s više članova. Samo direktor može kreirati te sobe.

**2.** U chatu vidite listu soba; interne sobe (Direktor ↔ tim) koristite za dogovore, upite i koordinaciju unutar tvrtke. Razgovori s klijentima ostaju u posebnim soabama po poslu.

**3.** Notifikacije stižu i za interne poruke. Ako imate pitanja o dodijeljenom leadu, možete ih postaviti direktoru u internom chatu.`,
  },
  {
    step: 5,
    title: 'Što ne možete – samo direktor',
    userAction: 'Vi ne dodajete članove tima, ne dodjeljujete leadove i ne pristupate Director Dashboardu (tim, financije, odluke).',
    appResult: 'Jasna podjela: vi radite na dodijeljenim leadovima; direktor upravlja timom i queueom.',
    image: PLACEHOLDER('Korak 5: Uloge'),
    puniOpis: `**1.** **Director Dashboard** (Tim, Lead queue, Financije, Odluke) dostupan je samo direktoru. Kao član tima ne možete pristupiti tom izborniku – dobit ćete poruku da samo direktor može.

**2.** Dodavanje i uklanjanje članova tima, ručna ili automatska dodjela leadova i odbijanje leadova u queueu – sve to radi isključivo direktor. Vi primate leadove koje vam on dodijeli i ažurirate status (Započni rad / Završeno).

**3.** Ostale stvari kao pružatelj i dalje možete: Moj profil, kategorije, licence, Team locations, Chat (s klijentom i interni), te ako i sami kupite lead (kao solo), i dalje će vam se prikazivati u "Moji leadovi" u uobičajenoj listi kupljenih leadova.`,
  },
];

export default { GUIDE_KORISNIK, GUIDE_PRUVATELJ, GUIDE_TIM_CLAN };

/**
 * Kategorije iz dokumentacije (API) koje se prikazuju po ulozi.
 * Koristi se za sekciju "Sve funkcionalnosti za korisnike/pružatelje" da ništa ne nedostaje.
 */
export const DOC_CATEGORIES_FOR_KORISNIK = [
  'Registracija i Autentifikacija',
  'Upravljanje Kategorijama',
  'Upravljanje Poslovima',
  'Sustav Ponuda',
  'Sustav Bodovanja i Recenzija',
  'Profili Pružatelja',
  'Chat i Komunikacija',
  'Notifikacije',
  'Korisnici Usluge (Service Users)',
  'Korisničko Iskustvo',
  'Obostrano Ocjenjivanje (Detaljno)',
];

export const DOC_CATEGORIES_FOR_PRUVATELJ = [
  'Registracija i Autentifikacija',
  'Upravljanje Kategorijama',
  'Upravljanje Poslovima',
  'Sustav Ponuda',
  'Sustav Bodovanja i Recenzija',
  'Profili Pružatelja',
  'Chat i Komunikacija',
  'Notifikacije',
  'USLUGAR EXCLUSIVE Funkcionalnosti',
  'Queue Sustav za Distribuciju Leadova',
  'Refund i Povrat Kredita',
  'Upravljanje Pretplatama',
  'Pravni Status i Verifikacija',
  'Identity Badge Sustav i Verifikacije',
  'Reputacijski Sustav',
  'Fakture i Naplata',
  'Team Locations',
];
