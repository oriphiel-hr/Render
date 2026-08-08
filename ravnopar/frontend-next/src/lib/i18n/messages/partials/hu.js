export default {
  nav: {
    home: 'Kezdőlap', login: 'Bejelentkezés', plans: 'Csomagok', help: 'Súgó', mySpace: 'Saját tér',
    settings: 'Beállítások', admin: 'Admin', logout: 'Kijelentkezés', menu: 'Menü', close: 'Bezárás',
    greeting: 'Szia, {name}'
  },
  auth: {
    welcome: 'Üdvözöl a Ravnopar', welcomeLogin: 'Bejelentkezés',
    subtitleRegister: 'Három egyszerű lépés a profilodhoz.',
    subtitleLogin: 'Add meg az e-mailt és a jelszót a profil eléréséhez.',
    stepAccount: 'Fiók', stepVerify: 'Ellenőrzés', stepLogin: 'Bejelentkezés', stepReset: 'Visszaállítás', stepNewPassword: 'Új jelszó',
    createAccount: '1. Fiók létrehozása',
    referralApplied: 'Meghívó alkalmazva — köszönjük, hogy barátodon keresztül csatlakoztál.',
    email: 'E-mail', password: 'Jelszó', displayName: 'Megjelenített név', dateOfBirth: 'Születési dátum',
    day: 'Nap', month: 'Hónap', year: 'Év', city: 'Város', country: 'Ország', language: 'Nyelv',
    identity: 'Identitásod', profileType: 'Profiltípus', aboutOptional: 'Rólam (opcionális)',
    aboutPlaceholder: 'Mutatkozz be röviden...', seekingWho: 'Kit keresel', seekingType: 'Keresett profiltípus',
    seekingIntent: 'Mit keresel', continueVerify: 'Tovább az ellenőrzéshez', saving: 'Mentés...',
    hasAccount: 'Már van fiókod?', signIn: 'Bejelentkezés', verifyTitle: '2. E-mail megerősítése',
    verifyHint: 'Add meg a 6 számjegyű kódot, amit e-mailben kaptál.', verifyCode: 'Ellenőrző kód',
    back: 'Vissza', confirmEmail: 'E-mail megerősítése', checking: 'Ellenőrzés...',
    loginTitle: '3. Bejelentkezés', loginTitleOnly: 'Bejelentkezés', forgotPassword: 'Elfelejtett jelszó?',
    loggingIn: 'Bejelentkezés...', enterApp: 'Belépés a Ravnoparba', noAccount: 'Nincs fiókod?', register: 'Regisztráció',
    resetTitle: 'Jelszó visszaállítása', resetHint: 'Kódot küldünk e-mailben, ha létezik a fiók.',
    sendCode: 'Kód küldése', sending: 'Küldés...', newPasswordTitle: 'Új jelszó', newPassword: 'Új jelszó',
    savePassword: 'Jelszó mentése', backHome: '← Vissza a kezdőlapra', captchaRequired: 'Erősítsd meg a captchát regisztráció előtt.',
    registerSuccess: 'Fiók létrehozva. Add meg az ellenőrző kódot.', registerFailed: 'Regisztráció sikertelen. Ellenőrizd az adatokat.',
    verifySuccess: 'E-mail megerősítve. Most bejelentkezhetsz.', verifyFailed: 'Ellenőrzés sikertelen. Ellenőrizd a kódot.',
    loginFailed: 'Bejelentkezés sikertelen. Ellenőrizd az e-mailt és jelszót.', resetSuccess: 'Jelszó megváltoztatva. Jelentkezz be.',
    resetFailed: 'Visszaállítás sikertelen.', checkEmail: 'Ellenőrizd az e-mailt.', dobInvalid: 'Válassz érvényes születési dátumot (18+).'
  },
  months: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'],
  countries: {
    HR: 'Horvátország', SI: 'Szlovénia', BA: 'Bosznia-Hercegovina', RS: 'Szerbia', ME: 'Montenegró', MK: 'Észak-Macedónia',
    AT: 'Ausztria', DE: 'Németország', CH: 'Svájc', IT: 'Olaszország', HU: 'Magyarország', SK: 'Szlovákia', CZ: 'Csehország', PL: 'Lengyelország',
    GB: 'Egyesült Királyság', IE: 'Írország', US: 'USA', CA: 'Kanada', FR: 'Franciaország', ES: 'Spanyolország', PT: 'Portugália',
    NL: 'Hollandia', BE: 'Belgium', LU: 'Luxemburg', SE: 'Svédország', NO: 'Norvégia', DK: 'Dánia', FI: 'Finnország',
    GR: 'Görögország', RO: 'Románia', BG: 'Bulgária', UA: 'Ukrajna', TR: 'Törökország', AU: 'Ausztrália', NZ: 'Új-Zéland'
  },
  api: {
    ADULTS_ONLY: 'Regisztráció csak nagykorúaknak (18+).',
    EMAIL_EXISTS: 'Az e-mail cím már regisztrálva van.', INVALID_PAYLOAD: 'Érvénytelen adatok. Ellenőrizd a bevitelt.',
    INVALID_CODE: 'A kód érvénytelen vagy lejárt.', INVALID_CREDENTIALS: 'Hibás e-mail vagy jelszó.',
    EMAIL_NOT_VERIFIED: 'Az e-mail még nincs megerősítve.', ACCOUNT_SUSPENDED: 'A fiók felfüggesztve. Lépj kapcsolatba a támogatással.',
    PROFILE_NOT_FOUND: 'A profil nem található.', CAPTCHA_FAILED: 'Captcha ellenőrzés sikertelen.',
    CAPTCHA_REQUIRED: 'Erősítsd meg a captchát.', INVALID_SUBMISSION: 'Érvénytelen kérés.'
  },
  errors: { generic: 'Valami hiba történt. Próbáld újra.' },
  identity: { MALE: 'Férfi', FEMALE: 'Nő', NON_BINARY: 'Nem bináris', OTHER: 'Egyéb' },
  profileType: { INDIVIDUAL: 'Személy', COUPLE: 'Pár' },
  intent: { CHAT: 'Csevegés', CASUAL: 'Laza', RELATIONSHIP: 'Kapcsolat', MARRIAGE: 'Házasság', ADVENTURE: 'Kaland' }
};
