export default {
  nav: {
    home: 'Domov', login: 'Prijava', plans: 'Paketi', help: 'Pomoč', mySpace: 'Moj prostor',
    settings: 'Nastavitve', admin: 'Admin', logout: 'Odjava', menu: 'Meni', close: 'Zapri',
    greeting: 'Pozdravljen/a, {name}'
  },
  auth: {
    welcome: 'Dobrodošel/a v Ravnopar', welcomeLogin: 'Prijava',
    subtitleRegister: 'Tri preprosti koraki do tvojega profila.',
    subtitleLogin: 'Vnesi e-pošto in geslo za dostop do profila.',
    stepAccount: 'Račun', stepVerify: 'Preverjanje', stepLogin: 'Prijava', stepReset: 'Ponastavitev', stepNewPassword: 'Novo geslo',
    createAccount: '1. Ustvari račun',
    referralApplied: 'Vabilo uporabljeno — hvala, da si prišel/a preko prijatelja.',
    email: 'E-pošta', password: 'Geslo', displayName: 'Prikazno ime', dateOfBirth: 'Datum rojstva',
    day: 'Dan', month: 'Mesec', year: 'Leto', city: 'Mesto', country: 'Država', language: 'Jezik',
    identity: 'Tvoja identiteta', profileType: 'Tip profila', aboutOptional: 'O meni (neobvezno)',
    aboutPlaceholder: 'Predstavi se na kratko...', seekingWho: 'Koga iščeš', seekingType: 'Tip profila, ki ga iščeš',
    seekingIntent: 'Kaj iščeš', continueVerify: 'Nadaljuj na preverjanje', saving: 'Shranjevanje...',
    hasAccount: 'Že imaš račun?', signIn: 'Prijavi se', verifyTitle: '2. Potrdi e-pošto',
    verifyHint: 'Vnesi 6-mestno kodo, ki si jo prejel/a po e-pošti.', verifyCode: 'Koda za preverjanje',
    back: 'Nazaj', confirmEmail: 'Potrdi e-pošto', checking: 'Preverjanje...',
    loginTitle: '3. Prijavi se', loginTitleOnly: 'Prijava', forgotPassword: 'Pozabljeno geslo?',
    loggingIn: 'Prijava...', enterApp: 'Vstopi v Ravnopar', noAccount: 'Nimaš računa?', register: 'Registracija',
    resetTitle: 'Ponastavitev gesla', resetHint: 'Poslali bomo kodo na e-pošto, če račun obstaja.',
    sendCode: 'Pošlji kodo', sending: 'Pošiljanje...', newPasswordTitle: 'Novo geslo', newPassword: 'Novo geslo',
    savePassword: 'Shrani geslo', backHome: '← Nazaj na domov', captchaRequired: 'Potrdi captcho pred registracijo.',
    registerSuccess: 'Račun ustvarjen. Vnesi kodo za preverjanje.', registerFailed: 'Registracija ni uspela. Preveri podatke.',
    verifySuccess: 'E-pošta potrjena. Zdaj se lahko prijaviš.', verifyFailed: 'Preverjanje ni uspelo. Preveri kodo.',
    loginFailed: 'Prijava ni uspela. Preveri e-pošto in geslo.', resetSuccess: 'Geslo spremenjeno. Prijavi se.',
    resetFailed: 'Ponastavitev ni uspela.', checkEmail: 'Preveri e-pošto.', dobInvalid: 'Izberi veljaven datum rojstva (18+).'
  },
  months: ['Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij', 'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December'],
  countries: {
    HR: 'Hrvaška', SI: 'Slovenija', BA: 'Bosna in Hercegovina', RS: 'Srbija', ME: 'Črna gora', MK: 'Severna Makedonija',
    AT: 'Avstrija', DE: 'Nemčija', CH: 'Švica', IT: 'Italija', HU: 'Madžarska', SK: 'Slovaška', CZ: 'Češka', PL: 'Poljska',
    GB: 'Združeno kraljestvo', IE: 'Irska', US: 'ZDA', CA: 'Kanada', FR: 'Francija', ES: 'Španija', PT: 'Portugalska',
    NL: 'Nizozemska', BE: 'Belgija', LU: 'Luksemburg', SE: 'Švedska', NO: 'Norveška', DK: 'Danska', FI: 'Finska',
    GR: 'Grčija', RO: 'Romunija', BG: 'Bolgarija', UA: 'Ukrajina', TR: 'Turčija', AU: 'Avstralija', NZ: 'Nova Zelandija'
  },
  api: {
    ADULTS_ONLY: 'Registracija je dovoljena samo polnoletnim (18+).',
    EMAIL_EXISTS: 'E-poštni naslov je že registriran.', INVALID_PAYLOAD: 'Neveljavni podatki. Preveri vnos.',
    INVALID_CODE: 'Koda ni veljavna ali je potekla.', INVALID_CREDENTIALS: 'E-pošta ali geslo ni pravilno.',
    EMAIL_NOT_VERIFIED: 'E-pošta še ni potrjena.', ACCOUNT_SUSPENDED: 'Račun je suspendiran. Kontaktiraj podporo.',
    PROFILE_NOT_FOUND: 'Profil ni najden.', CAPTCHA_FAILED: 'Captcha preverjanje ni uspelo.',
    CAPTCHA_REQUIRED: 'Potrdi captcho.', INVALID_SUBMISSION: 'Neveljavna zahteva.'
  },
  errors: { generic: 'Nekaj je šlo narobe. Poskusi znova.' },
  identity: { MALE: 'Moški', FEMALE: 'Ženska', NON_BINARY: 'Nebinarno', OTHER: 'Drugo' },
  profileType: { INDIVIDUAL: 'Oseba', COUPLE: 'Par' },
  intent: { CHAT: 'Pogovor', CASUAL: 'Sproščeno druženje', RELATIONSHIP: 'Zveza', MARRIAGE: 'Poroka', ADVENTURE: 'Pustolovščina' }
};
