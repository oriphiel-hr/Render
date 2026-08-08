export default {
  nav: {
    home: 'Strona główna', login: 'Logowanie', plans: 'Plany', help: 'Pomoc', mySpace: 'Moja przestrzeń',
    settings: 'Ustawienia', admin: 'Admin', logout: 'Wyloguj', menu: 'Menu', close: 'Zamknij',
    greeting: 'Cześć, {name}'
  },
  auth: {
    welcome: 'Witaj w Ravnopar', welcomeLogin: 'Zaloguj się',
    subtitleRegister: 'Trzy proste kroki do Twojego profilu.',
    subtitleLogin: 'Wpisz email i hasło, aby uzyskać dostęp do profilu.',
    stepAccount: 'Konto', stepVerify: 'Weryfikacja', stepLogin: 'Logowanie', stepReset: 'Reset', stepNewPassword: 'Nowe hasło',
    createAccount: '1. Utwórz konto',
    referralApplied: 'Zaproszenie zastosowane — dzięki za dołączenie przez znajomego.',
    email: 'Email', password: 'Hasło', displayName: 'Nazwa wyświetlana', dateOfBirth: 'Data urodzenia',
    day: 'Dzień', month: 'Miesiąc', year: 'Rok', city: 'Miasto', country: 'Kraj', language: 'Język',
    identity: 'Twoja tożsamość', profileType: 'Typ profilu', aboutOptional: 'O mnie (opcjonalnie)',
    aboutPlaceholder: 'Przedstaw się krótko...', seekingWho: 'Kogo szukasz', seekingType: 'Szukany typ profilu',
    seekingIntent: 'Czego szukasz', continueVerify: 'Przejdź do weryfikacji', saving: 'Zapisywanie...',
    hasAccount: 'Masz już konto?', signIn: 'Zaloguj się', verifyTitle: '2. Potwierdź email',
    verifyHint: 'Wpisz 6-cyfrowy kod otrzymany na email.', verifyCode: 'Kod weryfikacyjny',
    back: 'Wstecz', confirmEmail: 'Potwierdź email', checking: 'Sprawdzanie...',
    loginTitle: '3. Zaloguj się', loginTitleOnly: 'Logowanie', forgotPassword: 'Zapomniałeś hasła?',
    loggingIn: 'Logowanie...', enterApp: 'Wejdź do Ravnopar', noAccount: 'Nie masz konta?', register: 'Zarejestruj się',
    resetTitle: 'Reset hasła', resetHint: 'Wyślemy kod na email, jeśli konto istnieje.',
    sendCode: 'Wyślij kod', sending: 'Wysyłanie...', newPasswordTitle: 'Nowe hasło', newPassword: 'Nowe hasło',
    savePassword: 'Zapisz hasło', backHome: '← Wróć na stronę główną', captchaRequired: 'Potwierdź captcha przed rejestracją.',
    registerSuccess: 'Konto utworzone. Wpisz kod weryfikacyjny.', registerFailed: 'Rejestracja nie powiodła się. Sprawdź dane.',
    verifySuccess: 'Email potwierdzony. Możesz się zalogować.', verifyFailed: 'Weryfikacja nie powiodła się. Sprawdź kod.',
    loginFailed: 'Logowanie nie powiodło się. Sprawdź email i hasło.', resetSuccess: 'Hasło zmienione. Zaloguj się.',
    resetFailed: 'Reset nie powiódł się.', checkEmail: 'Sprawdź email.', dobInvalid: 'Wybierz prawidłową datę urodzenia (18+).'
  },
  months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
  countries: {
    HR: 'Chorwacja', SI: 'Słowenia', BA: 'Bośnia i Hercegowina', RS: 'Serbia', ME: 'Czarnogóra', MK: 'Macedonia Północna',
    AT: 'Austria', DE: 'Niemcy', CH: 'Szwajcaria', IT: 'Włochy', HU: 'Węgry', SK: 'Słowacja', CZ: 'Czechy', PL: 'Polska',
    GB: 'Wielka Brytania', IE: 'Irlandia', US: 'USA', CA: 'Kanada', FR: 'Francja', ES: 'Hiszpania', PT: 'Portugalia',
    NL: 'Holandia', BE: 'Belgia', LU: 'Luksemburg', SE: 'Szwecja', NO: 'Norwegia', DK: 'Dania', FI: 'Finlandia',
    GR: 'Grecja', RO: 'Rumunia', BG: 'Bułgaria', UA: 'Ukraina', TR: 'Turcja', AU: 'Australia', NZ: 'Nowa Zelandia'
  },
  api: {
    ADULTS_ONLY: 'Rejestracja tylko dla pełnoletnich (18+).',
    EMAIL_EXISTS: 'Adres email jest już zarejestrowany.', INVALID_PAYLOAD: 'Nieprawidłowe dane. Sprawdź wpis.',
    INVALID_CODE: 'Kod jest nieprawidłowy lub wygasł.', INVALID_CREDENTIALS: 'Nieprawidłowy email lub hasło.',
    EMAIL_NOT_VERIFIED: 'Email nie został jeszcze potwierdzony.', ACCOUNT_SUSPENDED: 'Konto zawieszone. Skontaktuj się z pomocą.',
    PROFILE_NOT_FOUND: 'Nie znaleziono profilu.', CAPTCHA_FAILED: 'Weryfikacja captcha nie powiodła się.',
    CAPTCHA_REQUIRED: 'Potwierdź captcha.', INVALID_SUBMISSION: 'Nieprawidłowe żądanie.'
  },
  errors: { generic: 'Coś poszło nie tak. Spróbuj ponownie.' },
  identity: { MALE: 'Mężczyzna', FEMALE: 'Kobieta', NON_BINARY: 'Niebinarne', OTHER: 'Inne' },
  profileType: { INDIVIDUAL: 'Osoba', COUPLE: 'Para' },
  intent: { CHAT: 'Rozmowa', CASUAL: 'Na luzie', RELATIONSHIP: 'Związek', MARRIAGE: 'Małżeństwo', ADVENTURE: 'Przygoda' }
};
