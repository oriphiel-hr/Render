export default {
  nav: {
    home: 'Home', login: 'Accedi', plans: 'Piani', help: 'Aiuto', mySpace: 'Il mio spazio',
    settings: 'Impostazioni', admin: 'Admin', logout: 'Esci', menu: 'Menu', close: 'Chiudi',
    greeting: 'Ciao, {name}'
  },
  auth: {
    welcome: 'Benvenuto/a su Ravnopar', welcomeLogin: 'Accedi',
    subtitleRegister: 'Tre semplici passi per il tuo profilo.',
    subtitleLogin: 'Inserisci email e password per accedere al profilo.',
    stepAccount: 'Account', stepVerify: 'Verifica', stepLogin: 'Accesso', stepReset: 'Reset', stepNewPassword: 'Nuova password',
    createAccount: '1. Crea account',
    referralApplied: 'Invito applicato — grazie per esserti unito/a tramite un amico.',
    email: 'Email', password: 'Password', displayName: 'Nome visualizzato', dateOfBirth: 'Data di nascita',
    day: 'Giorno', month: 'Mese', year: 'Anno', city: 'Città', country: 'Paese', language: 'Lingua',
    identity: 'La tua identità', profileType: 'Tipo di profilo', aboutOptional: 'Su di me (opzionale)',
    aboutPlaceholder: 'Presentati brevemente...', seekingWho: 'Chi cerchi', seekingType: 'Tipo di profilo cercato',
    seekingIntent: 'Cosa cerchi', continueVerify: 'Continua alla verifica', saving: 'Salvataggio...',
    hasAccount: 'Hai già un account?', signIn: 'Accedi', verifyTitle: '2. Conferma email',
    verifyHint: 'Inserisci il codice a 6 cifre ricevuto via email.', verifyCode: 'Codice di verifica',
    back: 'Indietro', confirmEmail: 'Conferma email', checking: 'Verifica...',
    loginTitle: '3. Accedi', loginTitleOnly: 'Accesso', forgotPassword: 'Password dimenticata?',
    loggingIn: 'Accesso...', enterApp: 'Entra in Ravnopar', noAccount: 'Non hai un account?', register: 'Registrati',
    resetTitle: 'Reimposta password', resetHint: 'Invieremo un codice via email se l\'account esiste.',
    sendCode: 'Invia codice', sending: 'Invio...', newPasswordTitle: 'Nuova password', newPassword: 'Nuova password',
    savePassword: 'Salva password', backHome: '← Torna alla home', captchaRequired: 'Completa il captcha prima di registrarti.',
    registerSuccess: 'Account creato. Inserisci il codice di verifica.', registerFailed: 'Registrazione fallita. Controlla i dati.',
    verifySuccess: 'Email confermata. Ora puoi accedere.', verifyFailed: 'Verifica fallita. Controlla il codice.',
    loginFailed: 'Accesso fallito. Controlla email e password.', resetSuccess: 'Password cambiata. Accedi.',
    resetFailed: 'Reset fallito.', checkEmail: 'Controlla la email.', dobInvalid: 'Scegli una data di nascita valida (18+).'
  },
  months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  countries: {
    HR: 'Croazia', SI: 'Slovenia', BA: 'Bosnia ed Erzegovina', RS: 'Serbia', ME: 'Montenegro', MK: 'Macedonia del Nord',
    AT: 'Austria', DE: 'Germania', CH: 'Svizzera', IT: 'Italia', HU: 'Ungheria', SK: 'Slovacchia', CZ: 'Rep. Ceca', PL: 'Polonia',
    GB: 'Regno Unito', IE: 'Irlanda', US: 'Stati Uniti', CA: 'Canada', FR: 'Francia', ES: 'Spagna', PT: 'Portogallo',
    NL: 'Paesi Bassi', BE: 'Belgio', LU: 'Lussemburgo', SE: 'Svezia', NO: 'Norvegia', DK: 'Danimarca', FI: 'Finlandia',
    GR: 'Grecia', RO: 'Romania', BG: 'Bulgaria', UA: 'Ucraina', TR: 'Turchia', AU: 'Australia', NZ: 'Nuova Zelanda'
  },
  api: {
    ADULTS_ONLY: 'La registrazione è consentita solo ai maggiorenni (18+).',
    EMAIL_EXISTS: 'Email già registrata.', INVALID_PAYLOAD: 'Dati non validi. Controlla l\'inserimento.',
    INVALID_CODE: 'Codice non valido o scaduto.', INVALID_CREDENTIALS: 'Email o password non corretti.',
    EMAIL_NOT_VERIFIED: 'Email non ancora verificata.', ACCOUNT_SUSPENDED: 'Account sospeso. Contatta il supporto.',
    PROFILE_NOT_FOUND: 'Profilo non trovato.', CAPTCHA_FAILED: 'Verifica captcha fallita.',
    CAPTCHA_REQUIRED: 'Completa il captcha.', INVALID_SUBMISSION: 'Richiesta non valida.'
  },
  errors: { generic: 'Qualcosa è andato storto. Riprova.' },
  identity: { MALE: 'Uomo', FEMALE: 'Donna', NON_BINARY: 'Non binario', OTHER: 'Altro' },
  profileType: { INDIVIDUAL: 'Persona', COUPLE: 'Coppia' },
  intent: { CHAT: 'Chat', CASUAL: 'Informale', RELATIONSHIP: 'Relazione', MARRIAGE: 'Matrimonio', ADVENTURE: 'Avventura' }
};
