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
    puniOpis: `**Što prvo.** Odabereš "Registracija" ili "Prijava" u izborniku. Za registraciju unosiš email, lozinku i osnovne podatke; za prijavu samo email i lozinku. JWT autentifikacija i uloge (korisnik usluge, pružatelj, admin) sustav postavlja automatski.

**Zatim.** Nakon registracije sustav šalje email s linkom za potvrdu – provjeri poštu i klikni na link kako bi račun bio aktivan. Bez potvrde emaila neke opcije možda neće biti dostupne.

**Ako zaboraviš lozinku.** Na stranici za prijavu odabereš "Zaboravljena lozinka?", uneseš email i pošalješ zahtjev. Na email stiže siguran link (vrijedi 1 sat) koji vodi na stranicu za novu lozinku. Uneseš novu lozinku dvaput i automatski se prijaviš; sve stare sesije se odjavljuju. Link vrijedi samo jednom.

**Na kraju.** U izborniku vidiš "Moj račun", "Moji poslovi" i ostale opcije.`,
  },
  {
    step: 2,
    title: 'Objavi posao',
    userAction: 'U "Moji poslovi" klikneš "Objavi posao" (ili na početnoj "Objavi novi posao"). Ispuniš naslov, kategoriju (npr. Električar), grad, budžet i opis.',
    appResult: 'Posao se objavljuje i pojavljuje u listi. Samo jedan provjereni pružatelj dobiva tvoj upit – nema spam poziva.',
    image: PLACEHOLDER('Korak 2: Forma za objavu posla'),
    puniOpis: `**Što prvo.** U "Moji poslovi" klikneš "Objavi posao" ili na početnoj stranici "Objavi novi posao". Odabereš kategoriju usluge (npr. Električar) iz dinamičkog popisa kategorija iz baze – prikazuju se emoji ikone, opisi i NKD kodovi.

**Zatim.** Ispuniš naslov, detaljni opis posla, lokaciju (grad), budžet (min–max) i po želji geolokaciju. Možeš dodati i slike posla. Označiš status hitnosti: NORMALNA za standardni tempo ili HITNA ako ti treba brzo rješenje. Odabereš veličinu posla (MALA, SREDNJA, VELIKA) kako bi pružatelji znali obim rada, te rok izvršenja.

**Na kraju.** Posao se objavljuje i dobiva status OTVOREN. Pojavljuje se u listi; pretraga i filteri (kategorija, grad, budžet, status, datum) omogućuju drugima da ga pronađu. Samo jedan provjereni pružatelj dobiva tvoj upit – nema spam poziva.`,
  },
  {
    step: 3,
    title: 'Pregled ponuda',
    userAction: 'U "Moji poslovi" otvoriš svoj posao i vidiš ponudu (ili poruku) od pružatelja.',
    appResult: 'Aplikacija prikazuje detalje ponude. Možeš prihvatiti ponudu ili nastaviti razgovor u chatu.',
    image: PLACEHOLDER('Korak 3: Moji poslovi – ponude'),
    puniOpis: `**Što prvo.** U "Moji poslovi" otvoriš svoj posao. Za svaki posao vidiš status: OTVOREN (čekaš ponude), U TIJEKU (odabrao si pružatelja), ZAVRŠEN ili OTKAZAN.

**Zatim.** Kada pružatelj pošalje ponudu, prikazuje se iznos, poruka uz ponudu, procijenjeni broj dana i može li se pregovarati o cijeni. Status ponude može biti NA ČEKANJU, PRIHVAĆENA ili ODBIJENA. Možeš pregledati sve ponude za taj posao.

**Na kraju.** Odlučiš: prihvatiš jednu ponudu ili odbiješ. Ako prihvatiš, status posla prelazi u U TIJEKU i otvara se chat soba s tim pružateljem za dogovor o terminu i detaljima. Aplikacija te obavještava putem notifikacija o novim ponudama.`,
  },
  {
    step: 4,
    title: 'Chat i dogovor',
    userAction: 'U "Chat" odabereš razgovor s pružateljem i dopisuješ se za termin i detalje.',
    appResult: 'Sve ostaje u jednoj sobi. Kad se dogovorite, posao možeš označiti kao završen.',
    image: PLACEHOLDER('Korak 4: Chat s pružateljem'),
    puniOpis: `**Što prvo.** U izborniku odabereš "Chat". Vidiš listu razgovora – za svaki posao postoji jedna chat soba s pružateljem koji si prihvatio. Odabereš razgovor i vidiš povijest poruka.

**Zatim.** Dopisuješ se u realnom vremenu: pišeš poruke, možeš poslati i slike. Poruke imaju status (poslana, pročitana). Sve ostaje u jednoj sobi, bez miješanja s drugim poslovima. Notifikacije te obavještavaju o novim porukama (email, SMS, in-app ili push).

**Na kraju.** Kad se dogovorite o terminu i detaljima, možeš označiti posao kao završen. Status posla prelazi u ZAVRŠEN. Nakon toga možeš ocijeniti pružatelja (sljedeći korak).`,
  },
  {
    step: 5,
    title: 'Ocjenjivanje i recenzije',
    userAction: 'Nakon završenog posla možeš ocijeniti pružatelja (1–5 zvjezdica) i ostaviti komentar.',
    appResult: 'Recenzija se prikazuje na profilu pružatelja. I ti i pružatelj se međusobno možete ocijeniti.',
    image: PLACEHOLDER('Korak 5: Recenzije'),
    puniOpis: `**Što prvo.** Nakon što je posao označen kao ZAVRŠEN, sustav omogućuje obostrano ocjenjivanje – i ti i pružatelj možete jedan drugome dati ocjenu i komentar. Duplikati recenzija su spriječeni; postojeću recenziju možeš uređivati ili obrisati.

**Zatim.** Odabereš ocjenu od 1 do 5 zvjezdica i napišeš kratki komentar o iskustvu. Sustav automatski izračunava prosječnu ocjenu i broj recenzija na profilu pružatelja.

**Na kraju.** Recenzija se prikazuje na profilu pružatelja i pomaže drugima pri odluci. Tvoj profil također može imati recenzije od pružatelja s kojima si surađivao.`,
  },
  {
    step: 6,
    title: 'Refund i notifikacije',
    userAction: 'Ako pružatelj ne odgovori ili ne ispuni dogovor, možeš prijaviti problem u aplikaciji. Kao korisnik koristiš platformu besplatno – kredite plaćaju pružatelji kad kupuju tvoj upit. Sve važne događaje primaš putem emaila ili notifikacija.',
    appResult: 'Prijave se rješavaju prema pravilima platforme; notifikacije te obavještavaju o novim ponudama, porukama i statusu poslova.',
    image: PLACEHOLDER('Korak 6: Refund i notifikacije'),
    puniOpis: `**Što prvo.** Kao korisnik usluge koristiš platformu besplatno – ne plaćaš kredite. Kredite troše pružatelji kad kupuju tvoj upit (lead). Ako pružatelj ne odgovori na tvoj posao ili ne ispuni dogovor, u aplikaciji možeš prijaviti problem ili zatražiti rješavanje; platforma postupa prema pravilima (povrat kredita odnosi se na pružatelja, ne na tebe).

**Zatim.** Sve važne događaje primaš putem notifikacija: nove ponude, prihvaćene ili odbijene ponude, nove poruke u chatu, promjene statusa poslova. Notifikacije stižu putem emaila, SMS-a (Infobip), in-app i push obavijesti u pregledniku. Brojač nepročitanih pokazuje što još nisi pročitao.

**Na kraju.** Ako si spremio pretrage ili uključio job alertove, dobivaš i email obavijesti za nove poslove koji odgovaraju kriterijima (frekvencija: dnevno, tjedno ili odmah). Sve možeš upravljati u profilu.`,
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
    puniOpis: `**Što prvo.** Odabereš "Postani pružatelj" ili registraciju kao pružatelj. Uneseš podatke tvrtke ili obrta te pravni status; sustav podržava različite uloge (USER, PROVIDER, ADMIN) i JWT autentifikaciju.

**Zatim.** Prođeš wizard registracije: odabireš kategorije u kojima radiš (npr. Električar, Vodoinstalater) iz dinamičkog popisa s emoji ikonama i NKD kodovima, te regije u kojima primaš poslove. Kategorije mogu imati oznake za licencirane djelatnosti i tipove licenci (elektrotehnička, građevinska itd.).

**Na kraju.** Profil pružatelja je kreiran. Potvrdi email putem linka koji stiže na poštu. Nakon potvrde (i eventualne pretplate za kredite) u izborniku vidiš "Leadovi" i "Moj račun". Bez potvrde emaila neke opcije možda neće biti dostupne.`,
  },
  {
    step: 2,
    title: 'Pregled leadova',
    userAction: 'U izborniku odabereš "Leadovi" (ili "Dostupni leadovi"). Filtriraš po kategoriji, gradu ili budžetu ako želiš.',
    appResult: 'Vidiš listu poslova koji odgovaraju tvojim kategorijama. Jedan lead = samo ti dobivaš kontakt klijenta.',
    image: PLACEHOLDER('Korak 2: Lista leadova'),
    puniOpis: `**Što prvo.** U izborniku odabereš "Leadovi" ili "Dostupni leadovi". Lista se dinamički učitava iz baze – prikazuju se samo poslovi koji odgovaraju tvojim odabranim kategorijama i regijama. Ekskluzivni lead sustav znači: jedan lead = samo ti dobivaš kontakt klijenta, nema dijeljenja s konkurencijom.

**Zatim.** Koristiš filtere: kategorija, grad, budžet (min–max), status posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN), hitnost (NORMALNA, HITNA), veličina (MALA, SREDNJA, VELIKA), datum. Možeš sortirati po najnovijem, budžetu i slično. Tražilica s sticky search barom i naprednim filterima olakšava pronalazak.

**Na kraju.** Klikneš na posao koji te zanima da vidiš puni opis, lokaciju, budžet i slike. Odluka za slanje ponude donosi se u sljedećem koraku. Queue sustav za distribuciju leadova osigurava fer raspodjelu prema pravilima platforme.`,
  },
  {
    step: 3,
    title: 'Slanje ponude',
    userAction: 'Klikneš na posao koji te zanima i pošalješ ponudu (cijena, rok, kratki opis).',
    appResult: 'Naručitelj vidi tvoju ponudu u "Moji poslovi". Ako prihvati, otvara se chat soba za dogovor.',
    image: PLACEHOLDER('Korak 3: Slanje ponude'),
    puniOpis: `**Što prvo.** Otvoriš posao koji te zanima i odabereš slanje ponude. Unosiš iznos ponude, poruku uz ponudu i procijenjeni broj dana za izvršenje. Možeš označiti ponudu kao pregovornu ako je cijena mogla biti predmet dogovora.

**Zatim.** Sustav prikazuje status ponude: NA ČEKANJU dok naručitelj ne odluči, zatim PRIHVAĆENA ili ODBIJENA. Naručitelj vidi sve ponude za svoj posao i može pregovarati o cijeni ako si to označio.

**Na kraju.** Ako naručitelj prihvati tvoju ponudu, status posla prelazi u U TIJEKU i otvara se chat soba za dogovor o terminu i detaljima. Potrošit ćeš jedan kredit za taj ekskluzivni lead (krediti se nadopunjuju prema pretplati). Notifikacije te obavještavaju o prihvaćenoj ili odbijenoj ponudi.`,
  },
  {
    step: 4,
    title: 'Chat i krediti',
    userAction: 'U "Chat" dopisuješ se s klijentom. Jedan potrošeni kredit = jedan ekskluzivni lead.',
    appResult: 'Sve razgovore vodiš u jednoj sobi. Kredite vidiš u widgetu u headeru; dopuna preko "Cjenik" / pretplata.',
    image: PLACEHOLDER('Korak 4: Chat i krediti'),
    puniOpis: `**Što prvo.** U izborniku odabereš "Chat". Za svaki posao za koji si poslao ponudu i koja je prihvaćena imaš jednu chat sobu s naručiteljem. Povijest poruka je spremljena; možeš slati i slike. Status poruke (poslana, pročitana) vidljiv je oboma stranama.

**Zatim.** Real-time chat omogućuje brzu komunikaciju. Notifikacije za nove poruke stižu putem emaila, SMS-a, in-app ili push obavijesti. Brojač nepročitanih pokazuje koliko poruka još nisi pročitao. Sve ostaje u jednoj sobi – nema miješanja s drugim poslovima.

**Na kraju.** Jedan potrošeni kredit = jedan ekskluzivni lead. Kredite vidiš u widgetu u headeru; dopuna ide preko "Cjenik" ili pretplate (TRIAL, BASIC, PREMIUM, PRO). Kad se dogovorite s klijentom, on može označiti posao kao završen, nakon čega obostrano ocjenjivanje postaje dostupno.`,
  },
  {
    step: 5,
    title: 'Pretplata i cjenik',
    userAction: 'U "Cjenik" odabereš plan (TRIAL, BASIC, PREMIUM, PRO). Krediti se nadopunjuju prema planu; možeš kupiti dodatne kredite.',
    appResult: 'Pretplata se upravlja preko Stripe; status vidiš u "Moj račun" ili "Pretplata". Krediti se oduzimaju pri kupnji leada.',
    image: PLACEHOLDER('Korak 5: Pretplata i cjenik'),
    puniOpis: `**Što prvo.** U "Cjenik" odabereš pretplatni plan: TRIAL, BASIC, PREMIUM ili PRO. Svaki plan donosi određeni broj kredita (npr. mjesečno). Krediti se automatski nadopunjuju prema planu; možeš kupiti i dodatne kredite po potrebi.

**Zatim.** Naplata i pretplata upravljaju se preko Stripe integracije. Fakture i status pretplate vidiš u "Moj račun" ili "Pretplata". Krediti se oduzimaju kad kupiš lead (kad tvoja ponuda bude prihvaćena). Ako naručitelj zatraži refund prema pravilima, kredit se može vratiti – refund i povrat kredita vide se u istom odjeljku.

**Na kraju.** Preporučeno je održavati dovoljno kredita za leadove koje želiš primati. ROI dashboard (sljedeći korak) pomaže pratiti troškove, konverzije i povrat kredita.`,
  },
  {
    step: 6,
    title: 'Profil, verifikacija i ROI',
    userAction: 'U "Moj profil" ažuriraš podatke, kategorije i regije. Možeš potvrditi email, telefon, tvrtku (Identity Badge). U "ROI" ili "Leadovi" vidiš statistike i povijest.',
    appResult: 'Verificirani profil dobiva više povjerenja; ROI dashboard pokazuje troškove, konverzije i povrat kredita (refund).',
    image: PLACEHOLDER('Korak 6: Profil i ROI'),
    puniOpis: `**Što prvo.** U "Moj profil" ažuriraš podatke: biografija, specijalizacije, godine iskustva, web stranica, područje rada, status dostupnosti. Odabireš kategorije u kojima radiš i regije za primanje leadova; možeš upravljati team locations (geo-dinamičke lokacije) i radius checking za udaljenost. Portfolio, certifikati i licence dodaju vjerodostojnost.

**Zatim.** Identity Badge sustav i verifikacije: potvrdi email, telefon i tvrtku kako bi dobio oznaku verificiranog profila. Verificirani profil dobiva više povjerenja i bolju vidljivost. Pravni status i reputacijski sustav prate tvoju povijest i ocjene.

**Na kraju.** U "ROI" ili "Leadovi" vidiš statistike: troškovi (potrošeni krediti, pretplata), konverzije (prihvaćene ponude, završeni poslovi), povrat kredita (refund). Fakture i naplata pregledavaju se u "Moj račun". Sve te podatke možeš koristiti za planiranje i optimizaciju svog angažmana na platformi.`,
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
