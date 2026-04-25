# Mobile Extended Handoff

## Implemented in chat-first milestone
- Shared chat API methods are available in `@uslugar/shared`.
- Mobile chat flow is integrated into shell tabs.
- Room list, room messages, send text, mark-read and lock-aware behavior are active.
- Image upload and attachment sending are integrated through `expo-image-picker`.

## Reuse points for next modules
- Session/auth state is centralized in `mobile/src/hooks/useAuthSession.js`.
- API error/session-expired handling is centralized via `handleApiError`.
- Chat state lifecycle lives in `mobile/src/hooks/useChatFlow.js`.
- Shared transport/helper layer is in `packages/shared/src/index.js`.

## Next module entry points
- Push notifications:
  - `mobile/src/hooks/usePushNotifications.js` implemented (permission + Expo token subscribe/unsubscribe flow).
  - `mobile/src/screens/ProtectedShell.jsx` exposes push status/token with enable + unsubscribe actions in Profile tab.
  - Backend `push-notification-service` now supports both WebPush subscriptions and Expo tokens.
- Billing:
  - Initial mobile billing shell implemented:
    - `mobile/src/hooks/useBillingFlow.js`
    - `mobile/src/screens/BillingScreen.jsx`
    - new `Naplata` tab in `mobile/src/screens/ProtectedShell.jsx`
  - Shared billing API methods added in `packages/shared/src/index.js`:
    - `getCurrentSubscription`, `getSubscriptionPlans`, `getInvoices`, `createCheckoutSession`
    - `sendInvoiceByEmail`, `getCreditHistory`
  - Added parity enhancements:
    - invoice filters + stats + detail card
    - invoice PDF download/share flow (mobile)
    - invoice send-email action from mobile
    - credit transaction history section with filters
    - checkout open/copy UX and local top-toast feedback
    - app foreground checkout-return refresh for payment status edge-case handling
- Production stabilization:
  - `mobile/PRODUCTION-DEVICE-TEST-PASS.md` added for real-device release validation.
- Upload outside chat:
  - Extract generic file-picker/upload helper from chat image flow.
  - Reuse in jobs/offers/profile upload screens.

## Gdje su globalni lideri jači (što još dodati)

Ako želiš stvarno preteći konkurenciju, ovo ima smisla dodati (poredjano po očekivanom utjecaju):

### 1) Trust layer za korisnika (must-have)
- "Verified provider" bedževi koje korisnik odmah razumije (ID, licenca, tvrtka)
- anti-fake review mehanika (dokaz izvršenog posla + signalizacija sumnjivih recenzija)
- jasno prikazano: što je provjereno, što nije

### 2) Instant booking / instant slot (za dio kategorija)
- za brze usluge (npr. montaže, sitni popravci) korisnik odmah rezervira termin
- pazi: na mobilu obično jako diže konverziju

### 3) Garancija platforme / buyer protection
- čak i mali "Uslugar Guarantee" (npr. do određenog iznosa) gradi povjerenje
- standardiziran dispute flow uz to

### 4) SLA i brzina odgovora kao ranking faktor
- prikaz: "odgovara u X min"
- boost u rankingu za brze i pouzdane izvođače
- korisniku: ETA tipa "prva ponuda za ~Y min"

### 5) Post-job retention za korisnika
- "ponovi uslugu", "omiljeni izvođač", sezonski podsjetnici (klima, servis bojlera, itd.)
- cilj: korisnik ne dođe samo jednom preko weba

### 6) Standardizirani paketi usluga
- "fiksna cijena od–do" za najčešće poslove (barem u top 10 kategorija)
- manje nesigurnosti = veća stopa rezervacije

### Plan za prva 90 dana (prijedlog)
- **Faza 1 (2–3 tjedna):** trust bedževi + jasni profil "provjereno / neprovjereno"
- **Faza 2 (3–4 tjedna):** instant booking za 2–3 jednostavne kategorije
- **Faza 3 (3–4 tjedna):** buyer protection + dispute centar + SLA badge / ranking
