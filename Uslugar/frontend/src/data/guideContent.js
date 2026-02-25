/**
 * Sadržaj vodiča po ulozi. Korisnik vidi samo vodič za svoju ulogu.
 * image: URL placeholdera ili putanja do pravog screenshot-a (npr. /docs/guide-korisnik-1.png).
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
  },
  {
    step: 2,
    title: 'Objavi posao',
    userAction: 'U "Moji poslovi" klikneš "Objavi posao" (ili na početnoj "Objavi novi posao"). Ispuniš naslov, kategoriju (npr. Električar), grad, budžet i opis.',
    appResult: 'Posao se objavljuje i pojavljuje u listi. Samo jedan provjereni pružatelj dobiva tvoj upit – nema spam poziva.',
    image: PLACEHOLDER('Korak 2: Forma za objavu posla'),
  },
  {
    step: 3,
    title: 'Pregled ponuda',
    userAction: 'U "Moji poslovi" otvoriš svoj posao i vidiš ponudu (ili poruku) od pružatelja.',
    appResult: 'Aplikacija prikazuje detalje ponude. Možeš prihvatiti ponudu ili nastaviti razgovor u chatu.',
    image: PLACEHOLDER('Korak 3: Moji poslovi – ponude'),
  },
  {
    step: 4,
    title: 'Chat i dogovor',
    userAction: 'U "Chat" odabereš razgovor s pružateljem i dopisuješ se za termin i detalje.',
    appResult: 'Sve ostaje u jednoj sobi. Kad se dogovorite, posao možeš označiti kao završen.',
    image: PLACEHOLDER('Korak 4: Chat s pružateljem'),
  },
  {
    step: 5,
    title: 'Ocjenjivanje i recenzije',
    userAction: 'Nakon završenog posla možeš ocijeniti pružatelja (1–5 zvjezdica) i ostaviti komentar.',
    appResult: 'Recenzija se prikazuje na profilu pružatelja. I ti i pružatelj se međusobno možete ocijeniti.',
    image: PLACEHOLDER('Korak 5: Recenzije'),
  },
  {
    step: 6,
    title: 'Refund i notifikacije',
    userAction: 'Ako pružatelj ne odgovori ili želiš povrat kredita, možeš zatražiti refund. Sve važne događaje primaš putem emaila ili notifikacija u aplikaciji.',
    appResult: 'Refund se obrađuje prema pravilima; notifikacije te obavještavaju o novim ponudama, porukama i statusu poslova.',
    image: PLACEHOLDER('Korak 6: Refund i notifikacije'),
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
  },
  {
    step: 2,
    title: 'Pregled leadova',
    userAction: 'U izborniku odabereš "Leadovi" (ili "Dostupni leadovi"). Filtriraš po kategoriji, gradu ili budžetu ako želiš.',
    appResult: 'Vidiš listu poslova koji odgovaraju tvojim kategorijama. Jedan lead = samo ti dobivaš kontakt klijenta.',
    image: PLACEHOLDER('Korak 2: Lista leadova'),
  },
  {
    step: 3,
    title: 'Slanje ponude',
    userAction: 'Klikneš na posao koji te zanima i pošalješ ponudu (cijena, rok, kratki opis).',
    appResult: 'Naručitelj vidi tvoju ponudu u "Moji poslovi". Ako prihvati, otvara se chat soba za dogovor.',
    image: PLACEHOLDER('Korak 3: Slanje ponude'),
  },
  {
    step: 4,
    title: 'Chat i krediti',
    userAction: 'U "Chat" dopisuješ se s klijentom. Jedan potrošeni kredit = jedan ekskluzivni lead.',
    appResult: 'Sve razgovore vodiš u jednoj sobi. Kredite vidiš u widgetu u headeru; dopuna preko "Cjenik" / pretplata.',
    image: PLACEHOLDER('Korak 4: Chat i krediti'),
  },
  {
    step: 5,
    title: 'Pretplata i cjenik',
    userAction: 'U "Cjenik" odabereš plan (TRIAL, BASIC, PREMIUM, PRO). Krediti se nadopunjuju prema planu; možeš kupiti dodatne kredite.',
    appResult: 'Pretplata se upravlja preko Stripe; status vidiš u "Moj račun" ili "Pretplata". Krediti se oduzimaju pri kupnji leada.',
    image: PLACEHOLDER('Korak 5: Pretplata i cjenik'),
  },
  {
    step: 6,
    title: 'Profil, verifikacija i ROI',
    userAction: 'U "Moj profil" ažuriraš podatke, kategorije i regije. Možeš potvrditi email, telefon, tvrtku (Identity Badge). U "ROI" ili "Leadovi" vidiš statistike i povijest.',
    appResult: 'Verificirani profil dobiva više povjerenja; ROI dashboard pokazuje troškove, konverzije i povrat kredita (refund).',
    image: PLACEHOLDER('Korak 6: Profil i ROI'),
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
  'Refund i Povrat Kredita',
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
