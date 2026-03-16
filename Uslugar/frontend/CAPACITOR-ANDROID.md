## Uslugar – Android aplikacija (Capacitor)

Ovo je kratki vodič kako iz postojećeg frontenda napraviti Android aplikaciju za Google Play koristeći Capacitor.

### 1. Instaliraj dependency-je

U mapi `frontend`:

```bash
cd frontend
npm install
```

`package.json` već sadrži:
- `@capacitor/core`
- `@capacitor/cli`
- `@capacitor/android`

### 2. Inicijaliziraj Capacitor (prvi put)

Ako još nisi pokretao Capacitor u ovom projektu:

```bash
npx cap init Uslugar eu.uslugar.app --web-dir=dist
```

> Napomena: konfiguracija je već u datoteci `capacitor.config.ts` (`appId: eu.uslugar.app`, `appName: Uslugar`).

### 3. Dodaj Android platformu

```bash
npm run build            # builda Vite u ./dist
npx cap add android      # kreira android/ projekt (samo prvi put)
npm run cap:copy         # kopira novi web build u android/
```

Ako si već dodao Android ranije, dovoljno je:

```bash
npm run build
npm run cap:sync
```

### 4. Otvori u Android Studiu

```bash
npm run cap:open:android
```

U Android Studiu:
- postavi ikonu i naziv appa ako želiš,
- provjeri `minSdkVersion` i `targetSdkVersion`,
- pokreni na emulatoru ili fizičkom uređaju (Run → Run 'app').

### 5. Build za Google Play

U Android Studiu:

1. `Build → Generate Signed Bundle / APK…`
2. Odaberi **Android App Bundle (.aab)**.
3. Kreiraj ili odaberi postojeći keystore.
4. Generiraj `.aab` i upload-aj ga u Google Play Console (Internal testing ili Production).

### Napomene

- Aplikacija koristi isti frontend kao i web (`vite build` → `dist`).
- Backend URL treba pokazivati na produkciju (`https://www.uslugar.eu`), ne na `localhost`.
- Za dodatne native funkcije (push, kamera, itd.) mogu se dodati Capacitor pluginovi kasnije.

