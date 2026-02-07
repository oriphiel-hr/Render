/**
 * Blokovski manifest - mapiranje testId → blocks + assert (prema docs/blocks/tests.yaml i specu)
 * Koristi se za prozirnost testova: prikaz blokova za svaki test, povezivanje runnera s manifestom.
 */
export const BLOCKS_BY_TEST = {
  '1.1': { blocks: ['register-user'], assert: ['user-created', 'email-sent'] },
  '1.2': { blocks: ['register-provider'], assert: ['provider-created', 'email-sent'] },
  '1.3': { blocks: ['login'], assert: ['token-received'] },
  '1.4': { blocks: ['register-user', 'email-verify'], assert: ['user-verified'] },
  '1.5': { blocks: ['forgot-password', 'email-reset-link'], assert: ['reset-link-sent', 'link-clickable'] },
  '1.6': { blocks: ['login', 'jwt-auth'], assert: ['token-valid', 'api-access'] },

  '2.1': { blocks: ['fetch-categories'], assert: ['categories-loaded'] },
  '2.2': { blocks: ['fetch-categories'], assert: ['hierarchy-correct'] },
  '2.3': { blocks: ['login', 'fetch-categories', 'filter-jobs-by-category'], assert: ['filtered-results'] },

  '3.1': { blocks: ['login', 'create-job'], assert: ['job-in-list'] },
  '3.2': { blocks: ['login', 'create-job', 'view-job-detail'], assert: ['details-visible'] },
  '3.3': { blocks: ['login', 'create-job-with-budget', 'view-job-detail'], assert: ['budget-visible'] },
  '3.4': { blocks: ['login', 'create-job', 'map-picker', 'address-autocomplete'], assert: ['location-saved'] },
  '3.5': { blocks: ['login', 'create-job', 'job-status-flow'], assert: ['status-transitions'] },
  '3.6': { blocks: ['login', 'job-search'], assert: ['search-results'] },
  '3.7': { blocks: ['login', 'fetch-categories', 'job-advanced-filters'], assert: ['filtered-results'] },
  '3.8': { blocks: ['login', 'job-sorting'], assert: ['sorted-results'] },

  '4.1': { blocks: ['login', 'create-job', 'send-offer'], assert: ['offer-visible'] },
  '4.2': { blocks: ['login', 'create-job', 'send-offer', 'offer-status'], assert: ['status-correct'] },
  '4.3': { blocks: ['login', 'create-job', 'send-offer', 'accept-reject-offer'], assert: ['offer-accepted'] },

  '6.1': { blocks: ['login', 'provider-profile'], assert: ['profile-visible'] },
  '6.2': { blocks: ['login', 'provider-bio-update'], assert: ['bio-saved'] },
  '6.3': { blocks: ['login', 'provider-categories'], assert: ['categories-linked'] },
  '6.4': { blocks: ['login', 'team-locations', 'map-picker'], assert: ['locations-saved'] },

  '12.1': { blocks: ['matchmaking'], assert: ['providers-matched'] },
  '14.1': { blocks: ['verify-registar'], assert: ['legal-status-verified'] },

  '18.1': { blocks: ['login', 'stripe-checkout'], assert: ['checkout-redirect'] },
  '18.2': { blocks: ['login', 'stripe-payment-intent'], assert: ['payment-completed'] },
  '18.3': { blocks: ['stripe-webhook'], assert: ['webhook-handled'] },
  '18.4': { blocks: ['login', 'stripe-refund'], assert: ['refund-processed'] },

  '19.1': { blocks: ['login', 'director-dashboard'], assert: ['dashboard-visible'] },
  '19.2': { blocks: ['login', 'lead-distribution'], assert: ['lead-assigned'] },

  '20.1': { blocks: ['login', 'chat-public'], assert: ['message-sent'] },
  '20.2': { blocks: ['login', 'chat-internal'], assert: ['internal-message-sent'] },

  '21.1': { blocks: ['login', 'sms-verify'], assert: ['phone-verified'] },
  '21.2': { blocks: ['login', 'create-job', 'sms-offer'], assert: ['sms-sent'] },
  '21.3': { blocks: ['login', 'create-job', 'sms-job'], assert: ['sms-sent'] },
  '21.4': { blocks: ['sms-error-handling'], assert: ['error-handled'] },

  '22.1': { blocks: ['login', 'kyc-upload'], assert: ['document-uploaded'] },
  '22.2': { blocks: ['kyc-verify-oib'], assert: ['oib-verified'] },
  '22.3': { blocks: ['login', 'kyc-status'], assert: ['status-visible'] },
  '22.4': { blocks: ['login', 'kyc-reject'], assert: ['rejection-processed'] },

  '23.1': { blocks: ['login', 'portfolio-upload'], assert: ['images-uploaded'] },
  '23.2': { blocks: ['login', 'license-upload'], assert: ['license-uploaded'] },
  '23.3': { blocks: ['login', 'portfolio-display'], assert: ['portfolio-visible'] },
  '23.4': { blocks: ['login', 'gallery-preview'], assert: ['gallery-works'] },

  '24.1': { blocks: ['login', 'create-job', 'send-offer', 'email-offer'], assert: ['email-sent'] },
  '24.2': { blocks: ['login', 'create-job', 'email-job'], assert: ['email-sent'] },
  '24.3': { blocks: ['email-trial-expiry'], assert: ['email-sent'] },
  '24.4': { blocks: ['email-inactivity'], assert: ['email-sent'] },

  '25.1': { blocks: ['login', 'saved-search'], assert: ['search-saved'] },
  '25.2': { blocks: ['login', 'job-alert-create'], assert: ['alert-created'] },
  '25.3': { blocks: ['login', 'job-alert-freq'], assert: ['freq-options'] },
  '25.4': { blocks: ['login', 'job-alert-notify'], assert: ['notification-sent'] },

  '26.1': { blocks: ['login', 'admin-approve-provider'], assert: ['provider-approved'] },
  '26.2': { blocks: ['login', 'admin-reject-provider'], assert: ['provider-rejected'] },
  '26.3': { blocks: ['login', 'admin-ban'], assert: ['user-banned'] },
  '26.4': { blocks: ['login', 'admin-kyc-metrics'], assert: ['metrics-visible'] },

  '27.1': { blocks: ['wizard-categories'], assert: ['categories-selected'] },
  '27.2': { blocks: ['wizard-regions'], assert: ['regions-selected'] },
  '27.3': { blocks: ['wizard-status'], assert: ['progress-visible'] },
  '27.4': { blocks: ['wizard-complete'], assert: ['wizard-finished'] },

  '28.1': { blocks: ['login', 'subscription-upgrade'], assert: ['upgraded'] },
  '28.2': { blocks: ['login', 'subscription-downgrade'], assert: ['downgraded'] },
  '28.3': { blocks: ['login', 'subscription-cancel'], assert: ['cancelled'] },
  '28.4': { blocks: ['login', 'trial-activate'], assert: ['trial-active'] },

  '29.1': { blocks: ['login', 'roi-dashboard'], assert: ['dashboard-visible'] },
  '29.2': { blocks: ['login', 'roi-charts'], assert: ['charts-rendered'] },
  '29.3': { blocks: ['login', 'roi-conversion'], assert: ['conversion-visible'] },
  '29.4': { blocks: ['login', 'roi-reports'], assert: ['reports-available'] },

  '30.1': { blocks: ['login', 'credit-buy'], assert: ['credits-added'] },
  '30.2': { blocks: ['login', 'credit-spend'], assert: ['credits-deducted'] },
  '30.3': { blocks: ['login', 'credit-history'], assert: ['history-visible'] },
  '30.4': { blocks: ['login', 'credit-refund'], assert: ['refund-processed'] },

  '31.1': { blocks: ['cors-check'], assert: ['cors-headers'] },
  '31.2': { blocks: ['csrf-check'], assert: ['csrf-valid'] },
  '31.3': { blocks: ['rate-limiting'], assert: ['limit-enforced'] },
  '31.4': { blocks: ['sql-injection'], assert: ['injection-blocked'] }
}

export const CONTAINER_NAMES = {
  '1.1': 'Registracija korisnika usluge',
  '1.2': 'Registracija pružatelja usluga',
  '1.3': 'Prijava korisnika',
  '1.4': 'Email verifikacija',
  '1.5': 'Resetiranje lozinke',
  '1.6': 'JWT token autentifikacija',
  '2.1': 'Dinamičko učitavanje kategorija',
  '2.2': 'Hijerarhijska struktura kategorija',
  '2.3': 'Filtriranje poslova po kategorijama',
  '3.1': 'Objavljivanje novih poslova',
  '3.2': 'Detaljni opis posla',
  '3.3': 'Postavljanje budžeta',
  '3.4': 'Lokacija i Geolokacija',
  '3.5': 'Status posla',
  '3.6': 'Pretraživanje poslova',
  '3.7': 'Napredni filteri',
  '3.8': 'Sortiranje poslova',
  '4.1': 'Slanje ponuda za poslove',
  '4.2': 'Status ponude',
  '4.3': 'Prihvaćanje/odbijanje ponuda'
}

/** Dohvati blokove za testId (ili prazan objekt ako ne postoji) */
export function getBlocksForTest(testId) {
  const base = BLOCKS_BY_TEST[testId] || { blocks: [], assert: [] }
  return { ...base, name: CONTAINER_NAMES[testId] || base.name }
}
