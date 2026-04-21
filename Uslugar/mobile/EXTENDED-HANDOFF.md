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
- Upload outside chat:
  - Extract generic file-picker/upload helper from chat image flow.
  - Reuse in jobs/offers/profile upload screens.
