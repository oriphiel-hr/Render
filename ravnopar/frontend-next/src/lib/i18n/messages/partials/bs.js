export default {
  nav: {
    home: 'Početna', login: 'Prijava', plans: 'Planovi', help: 'Pomoć', mySpace: 'Moj prostor',
    settings: 'Postavke', admin: 'Admin', logout: 'Odjava', menu: 'Izbornik', close: 'Zatvori',
    greeting: 'Pozdrav, {name}'
  },
  auth: {
    welcome: 'Dobrodošao/la u Ravnopar', welcomeLogin: 'Prijavi se',
    subtitleRegister: 'Tri jednostavna koraka do tvog profila.',
    subtitleLogin: 'Unesi email i lozinku za pristup profilu.',
    stepAccount: 'Račun', stepVerify: 'Verifikacija', stepLogin: 'Prijava', stepReset: 'Reset', stepNewPassword: 'Nova lozinka',
    createAccount: '1. Kreiraj račun',
    referralApplied: 'Pozivnica primijenjena — hvala što si došao/la preko prijatelja.',
    email: 'Email', password: 'Lozinka', displayName: 'Ime za prikaz', dateOfBirth: 'Datum rođenja',
    day: 'Dan', month: 'Mjesec', year: 'Godina', city: 'Grad', country: 'Država', language: 'Jezik',
    identity: 'Tvoj identitet', profileType: 'Tip profila', aboutOptional: 'O meni (opcionalno)',
    aboutPlaceholder: 'Kratko se predstavi...', seekingWho: 'Koga tražiš', seekingType: 'Tip profila koji tražiš',
    seekingIntent: 'Šta tražiš', continueVerify: 'Nastavi na verifikaciju', saving: 'Spremanje...',
    hasAccount: 'Već imaš račun?', signIn: 'Prijavi se', verifyTitle: '2. Potvrdi email',
    verifyHint: 'Unesi 6-znamenkasti kod koji si primio/la na email.', verifyCode: 'Verifikacijski kod',
    back: 'Nazad', confirmEmail: 'Potvrdi email', checking: 'Provjera...',
    loginTitle: '3. Prijavi se', loginTitleOnly: 'Prijava', forgotPassword: 'Zaboravljena lozinka?',
    loggingIn: 'Prijava...', enterApp: 'Uđi u Ravnopar', noAccount: 'Nemaš račun?', register: 'Registruj se',
    resetTitle: 'Reset lozinke', resetHint: 'Poslat ćemo kod na email ako račun postoji.',
    sendCode: 'Pošalji kod', sending: 'Slanje...', newPasswordTitle: 'Nova lozinka', newPassword: 'Nova lozinka',
    savePassword: 'Spremi lozinku', backHome: '← Nazad na početnu', captchaRequired: 'Potvrdi captchu prije registracije.',
    registerSuccess: 'Račun je kreiran. Unesi verifikacijski kod.', registerFailed: 'Registracija nije uspjela. Provjeri podatke.',
    verifySuccess: 'Email je potvrđen. Sada se možeš prijaviti.', verifyFailed: 'Verifikacija nije uspjela. Provjeri kod.',
    loginFailed: 'Prijava nije uspjela. Provjeri email i lozinku.', resetSuccess: 'Lozinka promijenjena. Prijavi se.',
    resetFailed: 'Reset nije uspio.', checkEmail: 'Provjeri email.', dobInvalid: 'Odaberi valjan datum rođenja (18+).'
  },
  months: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'],
  countries: {
    HR: 'Hrvatska', SI: 'Slovenija', BA: 'Bosna i Hercegovina', RS: 'Srbija', ME: 'Crna Gora', MK: 'Sjeverna Makedonija',
    AT: 'Austrija', DE: 'Njemačka', CH: 'Švicarska', IT: 'Italija', HU: 'Mađarska', SK: 'Slovačka', CZ: 'Češka', PL: 'Poljska',
    GB: 'Ujedinjeno Kraljevstvo', IE: 'Irska', US: 'SAD', CA: 'Kanada', FR: 'Francuska', ES: 'Španija', PT: 'Portugal',
    NL: 'Holandija', BE: 'Belgija', LU: 'Luksemburg', SE: 'Švedska', NO: 'Norveška', DK: 'Danska', FI: 'Finska',
    GR: 'Grčka', RO: 'Rumunija', BG: 'Bugarska', UA: 'Ukrajina', TR: 'Turska', AU: 'Australija', NZ: 'Novi Zeland'
  },
  api: {
    ADULTS_ONLY: 'Registracija je dozvoljena samo punoljetnima (18+).',
    EMAIL_EXISTS: 'Email adresa je već registrirana.', INVALID_PAYLOAD: 'Neispravni podaci. Provjeri unos.',
    INVALID_CODE: 'Kod nije ispravan ili je istekao.', INVALID_CREDENTIALS: 'Email ili lozinka nisu ispravni.',
    EMAIL_NOT_VERIFIED: 'Email još nije potvrđen.', ACCOUNT_SUSPENDED: 'Račun je suspendiran. Kontaktiraj podršku.',
    PROFILE_NOT_FOUND: 'Profil nije pronađen.', CAPTCHA_FAILED: 'Captcha provjera nije uspjela.',
    CAPTCHA_REQUIRED: 'Potvrdi captchu.', INVALID_SUBMISSION: 'Neispravan zahtjev.'
  },
  errors: { generic: 'Nešto nije u redu. Pokušaj ponovo.' },
  identity: { MALE: 'Muško', FEMALE: 'Žensko', NON_BINARY: 'Nebinarno', OTHER: 'Drugo' },
  profileType: { INDIVIDUAL: 'Osoba', COUPLE: 'Par' },
  intent: { CHAT: 'Razgovor', CASUAL: 'Ležerno druženje', RELATIONSHIP: 'Veza', MARRIAGE: 'Brak', ADVENTURE: 'Avantura' }
};
