import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '../frontend/src/lib/i18n/messages');

const SHARED_DASHBOARD = {
  en: { accept: 'Accept', decline: 'Decline' },
  de: { accept: 'Annehmen', decline: 'Ablehnen' },
  sl: { accept: 'Sprejmi', decline: 'Zavrni' },
  bs: { accept: 'Prihvati', decline: 'Odbij' },
  sr: { accept: 'Прихвати', decline: 'Одбиј' },
  it: { accept: 'Accetta', decline: 'Rifiuta' },
  hu: { accept: 'Elfogad', decline: 'Elutasít' },
  pl: { accept: 'Akceptuj', decline: 'Odrzuć' },
  cs: { accept: 'Přijmout', decline: 'Odmítnout' },
  fr: { accept: 'Accepter', decline: 'Refuser' },
  es: { accept: 'Aceptar', decline: 'Rechazar' },
  sk: { accept: 'Prijať', decline: 'Odmietnuť' }
};

const PATCHES = {
  en: {
    'footer.navLabel': 'Footer',
    'dashboard.reportReason': 'Inappropriate behaviour',
    'dashboard.reportNote': 'Report from the user interface.',
    'dashboard.blockReason': 'User preference',
    'dashboard.closeReason': 'User closed the contact',
    'profile.reportReason': 'Inappropriate behaviour',
    'profile.blockReason': 'User preference'
  },
  de: {
    'footer.navLabel': 'Fußzeile',
    'dashboard.reportReason': 'Unangemessenes Verhalten',
    'dashboard.reportNote': 'Meldung aus der Benutzeroberfläche.',
    'dashboard.blockReason': 'Benutzerpräferenz',
    'dashboard.closeReason': 'Nutzer hat den Kontakt beendet',
    'profile.reportReason': 'Unangemessenes Verhalten',
    'profile.blockReason': 'Benutzerpräferenz'
  },
  sl: {
    'footer.navLabel': 'Noga',
    'dashboard.reportReason': 'Neprimerno vedenje',
    'dashboard.reportNote': 'Prijava iz uporabniškega vmesnika.',
    'dashboard.blockReason': 'Uporabniška preferenca',
    'dashboard.closeReason': 'Uporabnik je zaprl stik',
    'profile.reportReason': 'Neprimerno vedenje',
    'profile.blockReason': 'Uporabniška preferenca'
  },
  bs: {
    'footer.navLabel': 'Podnožje',
    'dashboard.reportReason': 'Neprimjereno ponašanje',
    'dashboard.reportNote': 'Prijava iz korisničkog sučelja.',
    'dashboard.blockReason': 'Korisnička preferenca',
    'dashboard.closeReason': 'Korisnik je zatvorio kontakt',
    'profile.reportReason': 'Neprimjereno ponašanje',
    'profile.blockReason': 'Korisnička preferenca'
  },
  sr: {
    'footer.navLabel': 'Подножје',
    'dashboard.reportReason': 'Непримерено понашање',
    'dashboard.reportNote': 'Пријава из корисничког сучеља.',
    'dashboard.blockReason': 'Корисничка преференца',
    'dashboard.closeReason': 'Корисник је затворио контакт',
    'profile.reportReason': 'Непримерено понашање',
    'profile.blockReason': 'Корисничка преференца'
  },
  it: {
    'footer.navLabel': 'Piè di pagina',
    'dashboard.reportReason': 'Comportamento inappropriato',
    'dashboard.reportNote': 'Segnalazione dall’interfaccia utente.',
    'dashboard.blockReason': 'Preferenza dell’utente',
    'dashboard.closeReason': 'L’utente ha chiuso il contatto',
    'profile.reportReason': 'Comportamento inappropriato',
    'profile.blockReason': 'Preferenza dell’utente'
  },
  hu: {
    'footer.navLabel': 'Lábléc',
    'dashboard.reportReason': 'Nem megfelelő viselkedés',
    'dashboard.reportNote': 'Bejelentés a felhasználói felületről.',
    'dashboard.blockReason': 'Felhasználói preferencia',
    'dashboard.closeReason': 'A felhasználó lezárta a kapcsolatot',
    'profile.reportReason': 'Nem megfelelő viselkedés',
    'profile.blockReason': 'Felhasználói preferencia'
  },
  pl: {
    'footer.navLabel': 'Stopka',
    'dashboard.reportReason': 'Nieodpowiednie zachowanie',
    'dashboard.reportNote': 'Zgłoszenie z interfejsu użytkownika.',
    'dashboard.blockReason': 'Preferencja użytkownika',
    'dashboard.closeReason': 'Użytkownik zamknął kontakt',
    'profile.reportReason': 'Nieodpowiednie zachowanie',
    'profile.blockReason': 'Preferencja użytkownika'
  },
  cs: {
    'footer.navLabel': 'Patička',
    'dashboard.reportReason': 'Nevhodné chování',
    'dashboard.reportNote': 'Nahlášení z uživatelského rozhraní.',
    'dashboard.blockReason': 'Uživatelská preference',
    'dashboard.closeReason': 'Uživatel ukončil kontakt',
    'profile.reportReason': 'Nevhodné chování',
    'profile.blockReason': 'Uživatelská preference'
  },
  fr: {
    'footer.navLabel': 'Pied de page',
    'dashboard.reportReason': 'Comportement inapproprié',
    'dashboard.reportNote': 'Signalement depuis l’interface utilisateur.',
    'dashboard.blockReason': 'Préférence de l’utilisateur',
    'dashboard.closeReason': 'L’utilisateur a fermé le contact',
    'profile.reportReason': 'Comportement inapproprié',
    'profile.blockReason': 'Préférence de l’utilisateur'
  },
  es: {
    'footer.navLabel': 'Pie de página',
    'dashboard.reportReason': 'Comportamiento inapropiado',
    'dashboard.reportNote': 'Reporte desde la interfaz de usuario.',
    'dashboard.blockReason': 'Preferencia del usuario',
    'dashboard.closeReason': 'El usuario cerró el contacto',
    'profile.reportReason': 'Comportamiento inapropiado',
    'profile.blockReason': 'Preferencia del usuario'
  },
  sk: {
    'footer.navLabel': 'Pätička',
    'dashboard.reportReason': 'Nevhodné správanie',
    'dashboard.reportNote': 'Nahlásenie z používateľského rozhrania.',
    'dashboard.blockReason': 'Používateľská preferencia',
    'dashboard.closeReason': 'Používateľ ukončil kontakt',
    'profile.reportReason': 'Nevhodné správanie',
    'profile.blockReason': 'Používateľská preferencia'
  }
};

for (const [code, dash] of Object.entries(SHARED_DASHBOARD)) {
  PATCHES[code] = { ...PATCHES[code], 'dashboard.accept': dash.accept, 'dashboard.decline': dash.decline };
}

const PROFILE_REPORT_NOTE = {
  en: 'Report from profile page.',
  de: 'Meldung von der Profilseite.',
  sl: 'Prijava s profila.',
  bs: 'Prijava s profila.',
  sr: 'Пријава са профила.',
  it: 'Segnalazione dalla pagina profilo.',
  hu: 'Bejelentés a profiloldalról.',
  pl: 'Zgłoszenie ze strony profilu.',
  cs: 'Nahlášení ze stránky profilu.',
  fr: 'Signalement depuis la page profil.',
  es: 'Reporte desde la página de perfil.',
  sk: 'Nahlásenie zo stránky profilu.'
};

for (const [code, text] of Object.entries(PROFILE_REPORT_NOTE)) {
  PATCHES[code] = { ...PATCHES[code], 'profile.reportNote': text };
}

function setNested(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function serialize(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);
  if (typeof obj === 'string') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    if (obj.every((x) => typeof x === 'string')) {
      return `[\n${padIn}${obj.map((s) => JSON.stringify(s)).join(`,\n${padIn}`)}\n${pad}]`;
    }
    return `[\n${obj.map((item) => `${padIn}${serialize(item, indent + 1)}`).join(',\n')}\n${pad}]`;
  }
  const entries = Object.entries(obj);
  const lines = entries.map(([k, v]) => `${padIn}${k}: ${serialize(v, indent + 1)}`);
  return `{\n${lines.join(',\n')}\n${pad}}`;
}

for (const [code, patch] of Object.entries(PATCHES)) {
  const mod = await import(pathToFileURL(path.join(messagesDir, `${code}.js`)).href);
  const catalog = mod.default;
  for (const [pathKey, value] of Object.entries(patch)) {
    setNested(catalog, pathKey, value);
  }
  fs.writeFileSync(
    path.join(messagesDir, `${code}.js`),
    `export default ${serialize(catalog, 0)};\n`,
    'utf8'
  );
  console.log(`Patched ${code}.js`);
}
