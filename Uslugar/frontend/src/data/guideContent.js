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
    userAction: 'Odabereš "Registracija" ili "Prijava" u izborniku i uneseš email, lozinku i osnovne podatke.',
    appResult: 'Dobivaš pristup svom računu i glavnoj stranici. U izborniku vidiš "Moj račun", "Moji poslovi" i ostale opcije.',
    image: PLACEHOLDER('Korak 1: Registracija / Prijava'),
    puniOpis: `**1.** Odabereš "Registracija" ili "Prijava" u izborniku. Za registraciju unosiš email, lozinku i osnovne podatke; za prijavu samo email i lozinku. Sustav koristi JWT autentifikaciju i automatski postavlja ulogu (korisnik usluge, pružatelj, admin).

**2.** Nakon registracije stiže email s linkom za potvrdu – provjeri poštu i klikni na link kako bi račun bio aktivan. Bez potvrde emaila neke opcije možda neće biti dostupne.

**3.** Ako zaboraviš lozinku: na stranici za prijavu odabereš "Zaboravljena lozinka?", uneseš email i pošalješ zahtjev. Na email stiže siguran link (vrijedi 1 sat) za postavljanje nove lozinke. Uneseš novu lozinku dvaput i automatski se prijaviš; sve stare sesije se odjavljuju. Link vrijedi samo jednom.

**4.** U izborniku vidiš "Moj račun", "Moji poslovi" i ostale opcije.`,
  },
  {
    step: 2,
    title: 'Objavi posao',
    userAction: 'U "Moji poslovi" klikneš "Objavi posao" (ili na početnoj "Objavi novi posao"). Ispuniš naslov, kategoriju (npr. Električar), grad, budžet i opis.',
    appResult: 'Posao se objavljuje i pojavljuje u listi. Samo jedan provjereni pružatelj dobiva tvoj upit – nema spam poziva.',
    image: PLACEHOLDER('Korak 2: Forma za objavu posla'),
    puniOpis: `**1.** U "Moji poslovi" klikneš "Objavi posao" ili na početnoj stranici "Objavi novi posao". Odabereš kategoriju usluge (npr. Električar) iz dinamičkog popisa – prikazuju se emoji ikone, opisi i NKD kodovi.

**2.** Ispuniš naslov, detaljni opis posla, lokaciju (grad), budžet (min–max) i po želji geolokaciju. Možeš dodati slike posla. Označiš hitnost: NORMALNA ili HITNA; veličinu posla (MALA, SREDNJA, VELIKA); rok izvršenja.

**3.** Posao se objavljuje s statusom OTVOREN. Pojavljuje se u listi; pretraga i filteri (kategorija, grad, budžet, status, datum) omogućuju pronalazak. Samo jedan provjereni pružatelj dobiva tvoj upit – nema spam poziva.`,
  },
  {
    step: 3,
    title: 'Pregled ponuda',
    userAction: 'U "Moji poslovi" otvoriš svoj posao i vidiš ponudu (ili poruku) od pružatelja.',
    appResult: 'Aplikacija prikazuje detalje ponude. Možeš prihvatiti ponudu ili nastaviti razgovor u chatu.',
    image: PLACEHOLDER('Korak 3: Moji poslovi – ponude'),
    puniOpis: `**1.** U "Moji poslovi" otvoriš svoj posao. Za svaki posao vidiš status: OTVOREN (čekaš ponude), U TIJEKU (odabrao si pružatelja), ZAVRŠEN ili OTKAZAN.

**2.** Kad pružatelj pošalje ponudu, prikazuje se iznos, poruka uz ponudu, procijenjeni broj dana i može li se pregovarati o cijeni. Status ponude: NA ČEKANJU, PRIHVAĆENA ili ODBIJENA. Možeš pregledati sve ponude za taj posao.

**3.** Odlučiš: prihvatiš jednu ponudu ili odbiješ. Ako prihvatiš, status prelazi u U TIJEKU i otvara se chat soba s tim pružateljem. Aplikacija te obavještava putem notifikacija o novim ponudama.`,
  },
  {
    step: 4,
    title: 'Chat i dogovor',
    userAction: 'U "Chat" odabereš razgovor s pružateljem i dopisuješ se za termin i detalje.',
    appResult: 'Sve ostaje u jednoj sobi. Kad se dogovorite, posao možeš označiti kao završen.',
    image: PLACEHOLDER('Korak 4: Chat s pružateljem'),
    puniOpis: `**1.** U izborniku odabereš "Chat". Vidiš listu razgovora – za svaki posao jedna chat soba s pružateljem koji si prihvatio. Odabereš razgovor i vidiš povijest poruka.

**2.** Dopisuješ se u realnom vremenu; možeš poslati i slike. Poruke imaju status (poslana, pročitana). Sve ostaje u jednoj sobi. Notifikacije za nove poruke stižu putem emaila, SMS-a, in-app ili push obavijesti.

**3.** Kad se dogovorite o terminu i detaljima, možeš označiti posao kao završen. Status prelazi u ZAVRŠEN. Nakon toga možeš ocijeniti pružatelja (sljedeći korak).`,
  },
  {
    step: 5,
    title: 'Ocjenjivanje i recenzije',
    userAction: 'Nakon završenog posla možeš ocijeniti pružatelja (1–5 zvjezdica) i ostaviti komentar.',
    appResult: 'Recenzija se prikazuje na profilu pružatelja. I ti i pružatelj se međusobno možete ocijeniti.',
    image: PLACEHOLDER('Korak 5: Recenzije'),
    puniOpis: `**1.** Nakon što je posao označen kao ZAVRŠEN, sustav omogućuje obostrano ocjenjivanje – i ti i pružatelj možete jedan drugome dati ocjenu i komentar. Duplikati recenzija su spriječeni; postojeću recenziju možeš uređivati ili obrisati.

**2.** Odabereš ocjenu od 1 do 5 zvjezdica i napišeš kratki komentar. Sustav automatski izračunava prosječnu ocjenu i broj recenzija na profilu pružatelja.

**3.** Recenzija se prikazuje na profilu pružatelja i pomaže drugima pri odluci. Tvoj profil također može imati recenzije od pružatelja s kojima si surađivao.`,
  },
  {
    step: 6,
    title: 'Refund i notifikacije',
    userAction: 'Ako pružatelj ne odgovori ili ne ispuni dogovor, možeš prijaviti problem u aplikaciji. Kao korisnik koristiš platformu besplatno – kredite plaćaju pružatelji kad kupuju tvoj upit. Sve važne događaje primaš putem emaila ili notifikacija.',
    appResult: 'Prijave se rješavaju prema pravilima platforme; notifikacije te obavještavaju o novim ponudama, porukama i statusu poslova.',
    image: PLACEHOLDER('Korak 6: Refund i notifikacije'),
    puniOpis: `**1.** Kao korisnik usluge koristiš platformu besplatno – ne plaćaš kredite. Kredite troše pružatelji kad kupuju tvoj upit (lead). Ako pružatelj ne odgovori na tvoj posao ili ne ispuni dogovor, u aplikaciji možeš prijaviti problem ili zatražiti rješavanje; platforma postupa prema pravilima (povrat kredita odnosi se na pružatelja, ne na tebe).

**2.** Notifikacije: primaš obavijesti za nove ponude, prihvaćene ili odbijene ponude, nove poruke u chatu i promjene statusa poslova. Kanali su email notifikacije, SMS (Infobip), in-app notifikacije i push obavijesti u pregledniku. Brojač nepročitanih notifikacija pokazuje što još nisi pročitao.

**3.** Spremljene pretrage: u tražilici možeš spremiti pretragu s filterima za brzo ponovno korištenje; spremljene pretrage upravljaš u profilu. Job alertovi: email notifikacije za nove poslove koji odgovaraju tvojim kriterijima; frekvencija može biti DAILY, WEEKLY ili INSTANT; job alertove također upravljaš u profilu.`,
  },
];

/** Vodič za pružatelje usluga (majstori koji primaju leadove) */
export const GUIDE_PRUVATELJ = [
  {
    step: 1,
    title: 'Registracija kao pružatelj',
    userAction: 'Odabereš "Postani pružatelj" ili registraciju kao pružatelj. Uneseš podatke tvrtke/obrta i odabereš kategorije u kojima radiš (npr. Električar, Vodoinstalater).',
    appResult: 'Profil pružatelja je kreiran. Nakon potvrde (i eventualne pretplate) vidiš "Leadovi" i "Moj račun".',
    image: PLACEHOLDER('Korak 1: Registracija pružatelja'),
    puniOpis: `**1.** Odabereš "Postani pružatelj" ili registraciju kao pružatelj. Uneseš podatke tvrtke ili obrta te pravni status; sustav podržava različite uloge (USER, PROVIDER, ADMIN) i JWT autentifikaciju.

**2.** Prođeš wizard registracije: odabireš kategorije u kojima radiš (npr. Električar, Vodoinstalater) iz dinamičkog popisa s emoji ikonama i NKD kodovima, te regije u kojima primaš poslove. Kategorije mogu imati oznake za licencirane djelatnosti i tipove licenci (elektrotehnička, građevinska itd.).

**3.** Profil pružatelja je kreiran. Potvrdi email putem linka koji stiže na poštu. Nakon potvrde (i eventualne pretplate za kredite) u izborniku vidiš "Leadovi" i "Moj račun". Bez potvrde emaila neke opcije možda neće biti dostupne.`,
  },
  {
    step: 2,
    title: 'Pregled leadova',
    userAction: 'U izborniku odabereš "Leadovi" (ili "Dostupni leadovi"). Filtriraš po kategoriji, gradu ili budžetu ako želiš.',
    appResult: 'Vidiš listu poslova koji odgovaraju tvojim kategorijama. Jedan lead = samo ti dobivaš kontakt klijenta.',
    image: PLACEHOLDER('Korak 2: Lista leadova'),
    puniOpis: `**1.** U izborniku odabereš "Leadovi" ili "Dostupni leadovi". Lista se dinamički učitava – prikazuju se samo poslovi koji odgovaraju tvojim kategorijama i regijama. Ekskluzivni lead sustav: jedan lead = samo ti dobivaš kontakt klijenta.

**2.** Koristiš filtere: kategorija, grad, budžet, status posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN), hitnost (NORMALNA, HITNA), veličina (MALA, SREDNJA, VELIKA), datum. Možeš sortirati po najnovijem, budžetu i slično. Tražilica ima sticky search bar i napredne filtere.

**3.** Klikneš na posao koji te zanima da vidiš puni opis, lokaciju, budžet i slike. Queue sustav za distribuciju leadova osigurava fer raspodjelu prema pravilima platforme.`,
  },
  {
    step: 3,
    title: 'Slanje ponude',
    userAction: 'Klikneš na posao koji te zanima i pošalješ ponudu (cijena, rok, kratki opis).',
    appResult: 'Naručitelj vidi tvoju ponudu u "Moji poslovi". Ako prihvati, otvara se chat soba za dogovor.',
    image: PLACEHOLDER('Korak 3: Slanje ponude'),
    puniOpis: `**1.** Otvoriš posao koji te zanima i odabereš slanje ponude. Unosiš iznos ponude, poruku uz ponudu i procijenjeni broj dana za izvršenje. Možeš označiti ponudu kao pregovornu ako je cijena predmet dogovora.

**2.** Sustav prikazuje status ponude: NA ČEKANJU dok naručitelj ne odluči, zatim PRIHVAĆENA ili ODBIJENA. Naručitelj vidi sve ponude i može pregovarati o cijeni ako si to označio.

**3.** Ako naručitelj prihvati tvoju ponudu, status posla prelazi u U TIJEKU i otvara se chat soba. Potrošit ćeš jedan kredit za taj ekskluzivni lead (krediti se nadopunjuju prema pretplati). Notifikacije te obavještavaju o prihvaćenoj ili odbijenoj ponudi.`,
  },
  {
    step: 4,
    title: 'Chat i krediti',
    userAction: 'U "Chat" dopisuješ se s klijentom. Jedan potrošeni kredit = jedan ekskluzivni lead.',
    appResult: 'Sve razgovore vodiš u jednoj sobi. Kredite vidiš u widgetu u headeru; dopuna preko "Cjenik" / pretplata.',
    image: PLACEHOLDER('Korak 4: Chat i krediti'),
    puniOpis: `**1.** U izborniku odabereš "Chat". Za svaki posao s prihvaćenom ponudom imaš jednu chat sobu s naručiteljem. Povijest poruka je spremljena; možeš slati i slike. Status poruke (poslana, pročitana) vidljiv je oboma stranama.

**2.** Real-time chat; notifikacije za nove poruke stižu putem emaila, SMS-a, in-app ili push obavijesti. Brojač nepročitanih pokazuje koliko poruka još nisi pročitao. Sve ostaje u jednoj sobi.

**3.** Jedan potrošeni kredit = jedan ekskluzivni lead. Kredite vidiš u widgetu u headeru; dopuna preko "Cjenik" ili pretplate (TRIAL, BASIC, PREMIUM, PRO). Kad se dogovorite, naručitelj može označiti posao kao završen; tada je dostupno obostrano ocjenjivanje.`,
  },
  {
    step: 5,
    title: 'Pretplata i cjenik',
    userAction: 'U "Cjenik" odabereš plan (TRIAL, BASIC, PREMIUM, PRO). Krediti se nadopunjuju prema planu; možeš kupiti dodatne kredite.',
    appResult: 'Pretplata se upravlja preko Stripe; status vidiš u "Moj račun" ili "Pretplata". Krediti se oduzimaju pri kupnji leada.',
    image: PLACEHOLDER('Korak 5: Pretplata i cjenik'),
    puniOpis: `**1.** U "Cjenik" odabereš pretplatni plan: TRIAL, BASIC, PREMIUM ili PRO. Svaki plan donosi određeni broj kredita (npr. mjesečno). Krediti se automatski nadopunjuju prema planu; možeš kupiti i dodatne kredite.

**2.** Naplata i pretplata upravljaju se preko Stripe integracije. Fakture i status pretplate vidiš u "Moj račun" ili "Pretplata". Krediti se oduzimaju kad kupiš lead (kad tvoja ponuda bude prihvaćena). Ako naručitelj zatraži refund prema pravilima, kredit se može vratiti – refund i povrat kredita vide se u istom odjeljku.

**3.** Preporučeno je održavati dovoljno kredita za leadove koje želiš primati. ROI dashboard (sljedeći korak) pomaže pratiti troškove, konverzije i povrat kredita.`,
  },
  {
    step: 6,
    title: 'Profil, verifikacija i ROI',
    userAction: 'U "Moj profil" ažuriraš podatke, kategorije i regije. Možeš potvrditi email, telefon, tvrtku (Identity Badge). U "ROI" ili "Leadovi" vidiš statistike i povijest.',
    appResult: 'Verificirani profil dobiva više povjerenja; ROI dashboard pokazuje troškove, konverzije i povrat kredita (refund).',
    image: PLACEHOLDER('Korak 6: Profil i ROI'),
    puniOpis: `**1.** U "Moj profil" ažuriraš podatke: biografija, specijalizacije, godine iskustva, web stranica, područje rada, status dostupnosti. Odabireš kategorije i regije za primanje leadova; možeš upravljati team locations (geo-dinamičke lokacije) i radius checking. Portfolio, certifikati i licence dodaju vjerodostojnost.

**2.** Identity Badge i verifikacije: potvrdi email, telefon i tvrtku za oznaku verificiranog profila. Verificirani profil dobiva više povjerenja i bolju vidljivost. Pravni status i reputacijski sustav prate tvoju povijest i ocjene.

**3.** U "ROI" ili "Leadovi" vidiš statistike: troškovi (potrošeni krediti, pretplata), konverzije (prihvaćene ponude, završeni poslovi), povrat kredita (refund). Fakture i naplata pregledavaju se u "Moj račun".`,
  },
];

export default { GUIDE_KORISNIK, GUIDE_PRUVATELJ };

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
