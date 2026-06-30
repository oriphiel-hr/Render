import { SUPPORTED_LOCALES } from './locales.js';

function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? locale : 'hr';
}

function pick(strings, locale) {
  return strings[locale] ?? strings.en ?? strings.hr;
}

function fill(template, vars = {}) {
  let text = template;
  for (const [key, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${key}}`, String(value));
  }
  return text;
}

function compose(template, locale, vars = {}) {
  const loc = normalizeLocale(locale);
  const subject = fill(pick(template.subject, loc), vars);
  const lines = pick(template.lines, loc);
  const text = lines.map((line) => fill(line, vars)).join('\n');
  return { subject, text };
}

const TEMPLATES = {
  verification: {
    subject: {
      hr: 'Ravnopar — verifikacijski kod',
      en: 'Ravnopar — verification code',
      it: 'Ravnopar — codice di verifica',
      de: 'Ravnopar — Bestätigungscode',
      sl: 'Ravnopar — potrditvena koda'
    },
    lines: {
      hr: [
        'Pozdrav!',
        '',
        'Tvoj verifikacijski kod za Ravnopar je: {code}',
        'Kod vrijedi 15 minuta.',
        '',
        'Aplikacija: {appUrl}'
      ],
      en: [
        'Hello!',
        '',
        'Your Ravnopar verification code is: {code}',
        'The code is valid for 15 minutes.',
        '',
        'App: {appUrl}'
      ],
      it: [
        'Ciao!',
        '',
        'Il tuo codice di verifica Ravnopar è: {code}',
        'Il codice è valido per 15 minuti.',
        '',
        'App: {appUrl}'
      ],
      de: [
        'Hallo!',
        '',
        'Dein Ravnopar-Bestätigungscode ist: {code}',
        'Der Code ist 15 Minuten gültig.',
        '',
        'App: {appUrl}'
      ],
      sl: [
        'Pozdravljeni!',
        '',
        'Vaša potrditvena koda za Ravnopar je: {code}',
        'Koda velja 15 minut.',
        '',
        'Aplikacija: {appUrl}'
      ]
    }
  },
  passwordReset: {
    subject: {
      hr: 'Ravnopar — reset lozinke',
      en: 'Ravnopar — password reset',
      it: 'Ravnopar — reimpostazione password',
      de: 'Ravnopar — Passwort zurücksetzen',
      sl: 'Ravnopar — ponastavitev gesla'
    },
    lines: {
      hr: [
        'Pozdrav!',
        '',
        'Kod za reset lozinke: {code}',
        'Kod vrijedi 15 minuta.',
        '',
        'Reset: {resetUrl}'
      ],
      en: [
        'Hello!',
        '',
        'Your password reset code: {code}',
        'The code is valid for 15 minutes.',
        '',
        'Reset: {resetUrl}'
      ],
      it: [
        'Ciao!',
        '',
        'Codice per reimpostare la password: {code}',
        'Il codice è valido per 15 minuti.',
        '',
        'Reimposta: {resetUrl}'
      ],
      de: [
        'Hallo!',
        '',
        'Code zum Zurücksetzen des Passworts: {code}',
        'Der Code ist 15 Minuten gültig.',
        '',
        'Zurücksetzen: {resetUrl}'
      ],
      sl: [
        'Pozdravljeni!',
        '',
        'Koda za ponastavitev gesla: {code}',
        'Koda velja 15 minut.',
        '',
        'Ponastavi: {resetUrl}'
      ]
    }
  },
  contactRequest: {
    subject: {
      hr: 'Ravnopar — novi zahtjev za kontakt',
      en: 'Ravnopar — new contact request',
      it: 'Ravnopar — nuova richiesta di contatto',
      de: 'Ravnopar — neue Kontaktanfrage',
      sl: 'Ravnopar — nova prošnja za stik'
    },
    lines: {
      hr: [
        'Pozdrav {name},',
        '',
        '{requester} ti je poslao/la zahtjev za kontakt na Ravnoparu.',
        '',
        'Pogledaj u aplikaciji: {appUrl}'
      ],
      en: [
        'Hello {name},',
        '',
        '{requester} sent you a contact request on Ravnopar.',
        '',
        'Open the app: {appUrl}'
      ],
      it: [
        'Ciao {name},',
        '',
        '{requester} ti ha inviato una richiesta di contatto su Ravnopar.',
        '',
        'Apri l\'app: {appUrl}'
      ],
      de: [
        'Hallo {name},',
        '',
        '{requester} hat dir eine Kontaktanfrage auf Ravnopar gesendet.',
        '',
        'App öffnen: {appUrl}'
      ],
      sl: [
        'Pozdravljeni {name},',
        '',
        '{requester} vam je poslal/a prošnjo za stik na Ravnopar.',
        '',
        'Odprite aplikacijo: {appUrl}'
      ]
    }
  },
  contactAccepted: {
    subject: {
      hr: 'Ravnopar — kontakt prihvaćen',
      en: 'Ravnopar — contact accepted',
      it: 'Ravnopar — contatto accettato',
      de: 'Ravnopar — Kontakt angenommen',
      sl: 'Ravnopar — stik sprejet'
    },
    lines: {
      hr: [
        'Pozdrav {name},',
        '',
        '{accepter} je prihvatio/la tvoj zahtjev za kontakt.',
        'Sada možete razgovarati u aplikaciji.',
        '',
        'Otvori chat: {appUrl}'
      ],
      en: [
        'Hello {name},',
        '',
        '{accepter} accepted your contact request.',
        'You can now chat in the app.',
        '',
        'Open chat: {appUrl}'
      ],
      it: [
        'Ciao {name},',
        '',
        '{accepter} ha accettato la tua richiesta di contatto.',
        'Ora potete chattare nell\'app.',
        '',
        'Apri chat: {appUrl}'
      ],
      de: [
        'Hallo {name},',
        '',
        '{accepter} hat deine Kontaktanfrage angenommen.',
        'Ihr könnt jetzt in der App chatten.',
        '',
        'Chat öffnen: {appUrl}'
      ],
      sl: [
        'Pozdravljeni {name},',
        '',
        '{accepter} je sprejel/a vašo prošnjo za stik.',
        'Zdaj lahko klepetate v aplikaciji.',
        '',
        'Odpri klepet: {appUrl}'
      ]
    }
  },
  newMessage: {
    subject: {
      hr: 'Ravnopar — nova poruka',
      en: 'Ravnopar — new message',
      it: 'Ravnopar — nuovo messaggio',
      de: 'Ravnopar — neue Nachricht',
      sl: 'Ravnopar — novo sporočilo'
    },
    lines: {
      hr: [
        'Pozdrav {name},',
        '',
        '{sender} ti je poslao/la novu poruku.',
        '',
        'Otvori aplikaciju: {appUrl}'
      ],
      en: [
        'Hello {name},',
        '',
        '{sender} sent you a new message.',
        '',
        'Open the app: {appUrl}'
      ],
      it: [
        'Ciao {name},',
        '',
        '{sender} ti ha inviato un nuovo messaggio.',
        '',
        'Apri l\'app: {appUrl}'
      ],
      de: [
        'Hallo {name},',
        '',
        '{sender} hat dir eine neue Nachricht gesendet.',
        '',
        'App öffnen: {appUrl}'
      ],
      sl: [
        'Pozdravljeni {name},',
        '',
        '{sender} vam je poslal/a novo sporočilo.',
        '',
        'Odprite aplikacijo: {appUrl}'
      ]
    }
  },
  donationThanks: {
    subject: { hr: 'Ravnopar — hvala na podršci', en: 'Ravnopar — thank you for your support' },
    lines: {
      hr: [
        'Hvala ti!',
        '',
        'Primili smo tvoju donaciju od {amountEur} €.',
        'Donacija ne daje prednost u feedu — ali pomaže održati Ravnopar online za sve.',
        '',
        'Aplikacija: {appUrl}'
      ],
      en: [
        'Thank you!',
        '',
        'We received your donation of {amountEur} €.',
        'Donations do not affect feed ranking — they help keep Ravnopar online for everyone.',
        '',
        'App: {appUrl}'
      ]
    }
  },
  pairInactivityWarning: {
    subject: { hr: 'Ravnopar — razgovor čeka odgovor', en: 'Ravnopar — conversation awaiting reply' },
    lines: {
      hr: [
        'Pozdrav {name},',
        '',
        'U jednom od tvojih razgovora dugo nema poruka (preko {hours} h).',
        'Odgovori ili zatvori kontakt — tako drugima ostaje prilika.',
        '',
        'App: {appUrl}'
      ],
      en: [
        'Hello {name},',
        '',
        'One of your conversations has been quiet for over {hours} hours.',
        'Reply or close the contact so others get a fair chance.',
        '',
        'App: {appUrl}'
      ]
    }
  },
  pairAutoClosed: {
    subject: { hr: 'Ravnopar — razgovor zatvoren', en: 'Ravnopar — conversation closed' },
    lines: {
      hr: [
        'Pozdrav {name},',
        '',
        'Razgovor je zatvoren zbog neaktivnosti (preko {hours} h).',
        'Ponovno si dostupan/na u feedu.',
        '',
        'App: {appUrl}'
      ],
      en: [
        'Hello {name},',
        '',
        'A conversation was closed due to inactivity (over {hours} hours).',
        'You are available in the feed again.',
        '',
        'App: {appUrl}'
      ]
    }
  },
  contactExpired: {
    subject: { hr: 'Ravnopar — zahtjev istekao', en: 'Ravnopar — request expired' },
    lines: {
      hr: [
        'Pozdrav {name},',
        '',
        'Tvoj zahtjev za kontakt nije prihvaćen na vrijeme i automatski je zatvoren.',
        'Možeš poslati novi zahtjev kasnije.',
        '',
        'App: {appUrl}'
      ],
      en: [
        'Hello {name},',
        '',
        'Your contact request was not accepted in time and was automatically closed.',
        'You can send a new request later.',
        '',
        'App: {appUrl}'
      ]
    }
  }
};

export function buildEmail(templateKey, locale, vars = {}) {
  const template = TEMPLATES[templateKey];
  if (!template) throw new Error(`Unknown email template: ${templateKey}`);
  return compose(template, locale, vars);
}
