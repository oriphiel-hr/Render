# Mobile MVP Smoke Checklist

## Session and auth
- Launch app with no token: login screen appears.
- Login with valid credentials: profile loads and role tabs appear.
- Relaunch app with saved token: auto-login bootstrap succeeds.
- Force invalid token in storage: app clears session and returns to login.
- Logout: session is removed and login screen appears.

## USER flow
- Open `Poslovi` tab: jobs list loads.
- Open a job: details screen opens.
- Refresh list: pull-to-refresh updates data.
- Open `Moji poslovi`: user-owned jobs are shown.

## PROVIDER flow
- Open `Poslovi` tab and open job details.
- Submit valid offer: request succeeds and confirmation message appears.
- Submit invalid offer (empty message or amount <= 0): validation blocks submit.
- Open `Moje ponude`: sent offers list appears.

## Error handling
- Simulate API offline/wrong URL: friendly error message is shown.
- Simulate 401 response: app auto-clears session and redirects to login.

## Chat flow (extended chat-first)
- Open `Chat` tab: room list loads for current user.
- Open one room: messages load and lock status is visible.
- Pull-to-refresh in room list and room messages works.
- Send text message in unlocked room: message appears after refresh.
- Trigger `threadLocked` room: input and send actions are blocked with warning.
- Use `Pošalji sliku`: pick image from gallery, upload succeeds, attachment message appears.
- Simulate image permission denied: user sees permission warning.
- Open chat after relogin/bootstrap: previous room list still loads correctly.

## Push flow (mobile + backend sync)
- Open `Profil`: push status dot (`sivo/narančasto/zeleno`) and legend are visible.
- Tap `Omogući push` on physical device: permission granted, Expo token appears, backend registration shows `da`.
- Tap `Pošalji test push`: notification arrives and success toast appears.
- Tap `Odjavi push token`: token is removed from backend and status updates after refresh.
- Enter `Profil` again after relogin: bootstrap sync restores permission/token state.
- Simulate backend token missing: auto-heal re-subscribe runs and status recovers (cooldown behavior respected).

## Billing parity flow
- Open `Naplata`: current subscription card loads with localized status label.
- Verify plan list: discounts (TRIAL/new user) and credits are visible when applicable.
- Tap `Kreni na checkout`: checkout URL is created, open/copy actions work.
- Tap `Otvori checkout`: external browser opens Stripe URL.
- Tap `Kopiraj checkout URL`: clipboard confirmation appears and auto-hides.
- Verify auto-refresh after checkout creation updates billing data shortly after.
- In `Fakture`, test filters (type + status) and check statistics block (`Ukupno/Plaćeno/Na čekanju`).
- Open `Detalji` for invoice: full detail card shows amounts/dates/plan/lead context.
- Tap `Preuzmi PDF`: PDF downloads and share/open flow works.
- For `DRAFT`/`SENT` invoice, tap `Pošalji fakturu emailom`: success toast appears and list refreshes.
- In `Povijest kredita`, test filter buttons and confirm transaction list changes accordingly.
