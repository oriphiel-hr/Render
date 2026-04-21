# Mobile Production Device Test Pass

## Scope
- Validate critical production flows on physical Android/iOS devices.
- Confirm parity-critical modules: auth, jobs/offers, chat, push, billing.

## Environment prep
- Use production API base URL.
- Use at least one `PROVIDER` and one `USER` test account.
- Ensure push credentials and backend push configuration are enabled.
- Ensure Stripe checkout is reachable from device browser.

## Device matrix
- Android (latest stable major) physical device.
- iOS (latest stable major) physical device.
- At least one lower-end Android for performance sanity.

## Mandatory scenarios
- **Auth/session**
  - Fresh login, relaunch auto-login, forced invalid token, logout.
- **Jobs/offers**
  - Browse jobs, open details, submit valid offer, validation failure.
- **Chat**
  - Open rooms, open thread, send text, send image, lock-state behavior.
- **Push**
  - Grant permission, token registration, test push receipt, unsubscribe, re-subscribe self-heal.
- **Billing**
  - Load subscription/plans/invoices, create checkout URL, open checkout, return to app.
  - Confirm billing refresh after returning foreground.
  - Open invoice details, send invoice email, download/share PDF.
  - Verify credit history filters.

## Edge-case checks
- Intermittent network during invoice PDF download.
- App background/foreground while checkout pending.
- Push token missing on backend (auto-heal should recover).
- Billing endpoints unavailable (error toast should appear, app must remain usable).

## Performance and UX checks
- No tab freeze > 2s on normal network.
- Loading indicators appear during long API calls.
- Toast messages auto-hide and do not overlap critical controls.
- No clipped text in Croatian labels on smaller screens.

## Sign-off checklist
- [ ] Android pass complete
- [ ] iOS pass complete
- [ ] Push verified end-to-end
- [ ] Billing verified end-to-end
- [ ] No blocker regressions found
