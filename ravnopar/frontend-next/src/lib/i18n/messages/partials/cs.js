export default {
  nav: {
    home: 'Domů', login: 'Přihlášení', plans: 'Plány', help: 'Nápověda', mySpace: 'Můj prostor',
    settings: 'Nastavení', admin: 'Admin', logout: 'Odhlásit', menu: 'Menu', close: 'Zavřít',
    greeting: 'Ahoj, {name}'
  },
  auth: {
    welcome: 'Vítejte v Ravnopar', welcomeLogin: 'Přihlášení',
    subtitleRegister: 'Tři jednoduché kroky k vašemu profilu.',
    subtitleLogin: 'Zadejte e-mail a heslo pro přístup k profilu.',
    stepAccount: 'Účet', stepVerify: 'Ověření', stepLogin: 'Přihlášení', stepReset: 'Reset', stepNewPassword: 'Nové heslo',
    createAccount: '1. Vytvořit účet',
    referralApplied: 'Pozvánka použita — děkujeme, že jste přišli přes přítele.',
    email: 'E-mail', password: 'Heslo', displayName: 'Zobrazované jméno', dateOfBirth: 'Datum narození',
    day: 'Den', month: 'Měsíc', year: 'Rok', city: 'Město', country: 'Země', language: 'Jazyk',
    identity: 'Vaše identita', profileType: 'Typ profilu', aboutOptional: 'O mně (volitelné)',
    aboutPlaceholder: 'Představte se stručně...', seekingWho: 'Koho hledáte', seekingType: 'Hledaný typ profilu',
    seekingIntent: 'Co hledáte', continueVerify: 'Pokračovat na ověření', saving: 'Ukládání...',
    hasAccount: 'Už máte účet?', signIn: 'Přihlásit se', verifyTitle: '2. Potvrďte e-mail',
    verifyHint: 'Zadejte 6místný kód, který jste obdrželi e-mailem.', verifyCode: 'Ověřovací kód',
    back: 'Zpět', confirmEmail: 'Potvrdit e-mail', checking: 'Kontrola...',
    loginTitle: '3. Přihlásit se', loginTitleOnly: 'Přihlášení', forgotPassword: 'Zapomenuté heslo?',
    loggingIn: 'Přihlašování...', enterApp: 'Vstoupit do Ravnopar', noAccount: 'Nemáte účet?', register: 'Registrovat se',
    resetTitle: 'Obnovení hesla', resetHint: 'Pošleme kód na e-mail, pokud účet existuje.',
    sendCode: 'Odeslat kód', sending: 'Odesílání...', newPasswordTitle: 'Nové heslo', newPassword: 'Nové heslo',
    savePassword: 'Uložit heslo', backHome: '← Zpět na domů', captchaRequired: 'Potvrďte captcha před registrací.',
    registerSuccess: 'Účet vytvořen. Zadejte ověřovací kód.', registerFailed: 'Registrace se nezdařila. Zkontrolujte údaje.',
    verifySuccess: 'E-mail potvrzen. Nyní se můžete přihlásit.', verifyFailed: 'Ověření se nezdařilo. Zkontrolujte kód.',
    loginFailed: 'Přihlášení se nezdařilo. Zkontrolujte e-mail a heslo.', resetSuccess: 'Heslo změněno. Přihlaste se.',
    resetFailed: 'Reset se nezdařil.', checkEmail: 'Zkontrolujte e-mail.', dobInvalid: 'Vyberte platné datum narození (18+).'
  },
  months: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'],
  countries: {
    HR: 'Chorvatsko', SI: 'Slovinsko', BA: 'Bosna a Hercegovina', RS: 'Srbsko', ME: 'Černá Hora', MK: 'Severní Makedonie',
    AT: 'Rakousko', DE: 'Německo', CH: 'Švýcarsko', IT: 'Itálie', HU: 'Maďarsko', SK: 'Slovensko', CZ: 'Česko', PL: 'Polsko',
    GB: 'Spojené království', IE: 'Irsko', US: 'USA', CA: 'Kanada', FR: 'Francie', ES: 'Španělsko', PT: 'Portugalsko',
    NL: 'Nizozemsko', BE: 'Belgie', LU: 'Lucembursko', SE: 'Švédsko', NO: 'Norsko', DK: 'Dansko', FI: 'Finsko',
    GR: 'Řecko', RO: 'Rumunsko', BG: 'Bulharsko', UA: 'Ukrajina', TR: 'Turecko', AU: 'Austrálie', NZ: 'Nový Zéland'
  },
  api: {
    ADULTS_ONLY: 'Registrace je povolena pouze plnoletým (18+).',
    EMAIL_EXISTS: 'E-mail je již registrován.', INVALID_PAYLOAD: 'Neplatná data. Zkontrolujte zadání.',
    INVALID_CODE: 'Kód je neplatný nebo vypršel.', INVALID_CREDENTIALS: 'Neplatný e-mail nebo heslo.',
    EMAIL_NOT_VERIFIED: 'E-mail ještě není ověřen.', ACCOUNT_SUSPENDED: 'Účet je pozastaven. Kontaktujte podporu.',
    PROFILE_NOT_FOUND: 'Profil nenalezen.', CAPTCHA_FAILED: 'Ověření captcha se nezdařilo.',
    CAPTCHA_REQUIRED: 'Potvrďte captcha.', INVALID_SUBMISSION: 'Neplatný požadavek.'
  },
  errors: { generic: 'Něco se pokazilo. Zkuste to znovu.' },
  identity: { MALE: 'Muž', FEMALE: 'Žena', NON_BINARY: 'Nebinární', OTHER: 'Jiné' },
  profileType: { INDIVIDUAL: 'Osoba', COUPLE: 'Pár' },
  intent: { CHAT: 'Chat', CASUAL: 'Na volno', RELATIONSHIP: 'Vztah', MARRIAGE: 'Manželství', ADVENTURE: 'Dobrodružství' }
};
