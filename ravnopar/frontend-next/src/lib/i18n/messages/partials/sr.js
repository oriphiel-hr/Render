export default {
  nav: {
    home: 'Početna', login: 'Prijava', plans: 'Planovi', help: 'Pomoć', mySpace: 'Moj prostor',
    settings: 'Podešavanja', admin: 'Admin', logout: 'Odjava', menu: 'Meni', close: 'Zatvori',
    greeting: 'Zdravo, {name}'
  },
  auth: {
    welcome: 'Dobrodošao/la u Ravnopar', welcomeLogin: 'Prijavi se',
    subtitleRegister: 'Tri jednostavna koraka do tvog profila.',
    subtitleLogin: 'Unesi email i lozinku za pristup profilu.',
    stepAccount: 'Nalog', stepVerify: 'Verifikacija', stepLogin: 'Prijava', stepReset: 'Reset', stepNewPassword: 'Nova lozinka',
    createAccount: '1. Kreiraj nalog',
    referralApplied: 'Pozivnica primenjena — hvala što si došao/la preko prijatelja.',
    email: 'Email', password: 'Lozinka', displayName: 'Ime za prikaz', dateOfBirth: 'Datum rođenja',
    day: 'Dan', month: 'Mesec', year: 'Godina', city: 'Grad', country: 'Država', language: 'Jezik',
    identity: 'Tvoj identitet', profileType: 'Tip profila', aboutOptional: 'O meni (opciono)',
    aboutPlaceholder: 'Kratko se predstavi...', seekingWho: 'Koga tražiš', seekingType: 'Tip profila koji tražiš',
    seekingIntent: 'Šta tražiš', continueVerify: 'Nastavi na verifikaciju', saving: 'Čuvanje...',
    hasAccount: 'Već imaš nalog?', signIn: 'Prijavi se', verifyTitle: '2. Potvrdi email',
    verifyHint: 'Unesi 6-cifreni kod koji si primio/la na email.', verifyCode: 'Verifikacioni kod',
    back: 'Nazad', confirmEmail: 'Potvrdi email', checking: 'Provera...',
    loginTitle: '3. Prijavi se', loginTitleOnly: 'Prijava', forgotPassword: 'Zaboravljena lozinka?',
    loggingIn: 'Prijava...', enterApp: 'Uđi u Ravnopar', noAccount: 'Nemaš nalog?', register: 'Registruj se',
    resetTitle: 'Reset lozinke', resetHint: 'Poslaćemo kod na email ako nalog postoji.',
    sendCode: 'Pošalji kod', sending: 'Slanje...', newPasswordTitle: 'Nova lozinka', newPassword: 'Nova lozinka',
    savePassword: 'Sačuvaj lozinku', backHome: '← Nazad na početnu', captchaRequired: 'Potvrdi captchu pre registracije.',
    registerSuccess: 'Nalog je kreiran. Unesi verifikacioni kod.', registerFailed: 'Registracija nije uspela. Proveri podatke.',
    verifySuccess: 'Email je potvrđen. Sada se možeš prijaviti.', verifyFailed: 'Verifikacija nije uspela. Proveri kod.',
    loginFailed: 'Prijava nije uspela. Proveri email i lozinku.', resetSuccess: 'Lozinka promenjena. Prijavi se.',
    resetFailed: 'Reset nije uspeo.', checkEmail: 'Proveri email.', dobInvalid: 'Izaberi validan datum rođenja (18+).'
  },
  months: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'],
  countries: {
    HR: 'Hrvatska', SI: 'Slovenija', BA: 'Bosna i Hercegovina', RS: 'Srbija', ME: 'Crna Gora', MK: 'Severna Makedonija',
    AT: 'Austrija', DE: 'Nemačka', CH: 'Švajcarska', IT: 'Italija', HU: 'Mađarska', SK: 'Slovačka', CZ: 'Češka', PL: 'Poljska',
    GB: 'Ujedinjeno Kraljevstvo', IE: 'Irska', US: 'SAD', CA: 'Kanada', FR: 'Francuska', ES: 'Španija', PT: 'Portugal',
    NL: 'Holandija', BE: 'Belgija', LU: 'Luksemburg', SE: 'Švedska', NO: 'Norveška', DK: 'Danska', FI: 'Finska',
    GR: 'Grčka', RO: 'Rumunija', BG: 'Bugarska', UA: 'Ukrajina', TR: 'Turska', AU: 'Australija', NZ: 'Novi Zeland'
  },
  api: {
    ADULTS_ONLY: 'Registracija je dozvoljena samo punoletnim (18+).',
    EMAIL_EXISTS: 'Email adresa je već registrovana.', INVALID_PAYLOAD: 'Neispravni podaci. Proveri unos.',
    INVALID_CODE: 'Kod nije ispravan ili je istekao.', INVALID_CREDENTIALS: 'Email ili lozinka nisu ispravni.',
    EMAIL_NOT_VERIFIED: 'Email još nije potvrđen.', ACCOUNT_SUSPENDED: 'Nalog je suspendovan. Kontaktiraj podršku.',
    PROFILE_NOT_FOUND: 'Profil nije pronađen.', CAPTCHA_FAILED: 'Captcha provera nije uspela.',
    CAPTCHA_REQUIRED: 'Potvrdi captchu.', INVALID_SUBMISSION: 'Neispravan zahtev.'
  },
  errors: { generic: 'Nešto nije u redu. Pokušaj ponovo.' },
  identity: { MALE: 'Muško', FEMALE: 'Žensko', NON_BINARY: 'Nebinarno', OTHER: 'Drugo' },
  profileType: { INDIVIDUAL: 'Osoba', COUPLE: 'Par' },
  intent: { CHAT: 'Razgovor', CASUAL: 'Ležerno druženje', RELATIONSHIP: 'Veza', MARRIAGE: 'Brak', ADVENTURE: 'Avantura' }
};
