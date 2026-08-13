# Ravnopar mobile (Capacitor)

Native iOS/Android shell koji učitava live web app (`https://ravnopar.com`).
Isti backend/VPS, isti PWA featurei (push, swipe, chat).

## Preduvjeti

- Node 20+
- Android Studio (Android) i/ili Xcode na macOS (iOS)
- Produkcijski frontend-next na HTTPS

## Setup

```bash
cd mobile
npm install
npm run build:www
npx cap add android
# na macOS:
npx cap add ios
npx cap sync
```

`android/` i `ios/` se generiraju lokalno (nisu u gitu). Nakon kloniranja ponovno pokreni `cap add` / `cap sync`.

Opcionalno lokalni/staging URL:

```bash
# PowerShell
$env:RAVNOPAR_APP_URL="https://ravnopar.com"; npx cap sync
```

## Build

```bash
npx cap open android
npx cap open ios
```

Zatim u Android Studio / Xcode: Run / Archive.

## Napomene

- `server.url` u `capacitor.config.ts` otvara live Next app u WebView — nije static export.
- Push na webu: VAPID ključevi u backend + `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
- Za store listing treba ikone, privacy policy URL, i potpisani release build.
