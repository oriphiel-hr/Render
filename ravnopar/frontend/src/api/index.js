const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4200/api';

export async function register(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function verifyEmail(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function login(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function getProfile(token) {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, { headers: authHeaders(token) });
  return res.json();
}

export async function getReferralInfo(token) {
  const res = await fetch(`${API_BASE_URL}/auth/referral`, { headers: authHeaders(token) });
  return res.json();
}

export async function updateProfile(token, payload) {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteAccount(token) {
  const res = await fetch(`${API_BASE_URL}/auth/account`, {
    method: 'DELETE',
    headers: authHeaders(token)
  });
  return res.json();
}

export async function getPublicStats() {
  const res = await fetch(`${API_BASE_URL}/matchmaking/public-stats`);
  return res.json();
}

export async function getMessages(token, pairId) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/pairs/${pairId}/messages`, {
    headers: authHeaders(token)
  });
  return res.json();
}

export async function sendMessage(token, pairId, body) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/pairs/${pairId}/messages`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ body })
  });
  return res.json();
}

export async function getPlansStatus() {
  const res = await fetch(`${API_BASE_URL}/payments/plans/status`);
  return res.json();
}

export async function createPlanCheckout(token, planId) {
  const res = await fetch(`${API_BASE_URL}/payments/checkout/plan`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ planId })
  });
  return res.json();
}

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    authorization: `Bearer ${token}`
  };
}

export async function getFeed(token) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/feed`, {
    headers: authHeaders(token)
  });
  return res.json();
}

export async function getMyState(token) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/my-state`, {
    headers: authHeaders(token)
  });
  return res.json();
}

export async function sendContactRequest(token, targetProfileId) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/contact-request`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ targetProfileId })
  });
  return res.json();
}

export async function policyCheck(token, preferences) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/policy-check`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(preferences)
  });
  return res.json();
}

export async function respondToContact(token, contactId, action) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/contacts/${contactId}/respond`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ action })
  });
  return res.json();
}

export async function closePair(token, pairId, reason) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/pairs/${pairId}/close`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reason })
  });
  return res.json();
}

export async function getFairnessState() {
  const res = await fetch(`${API_BASE_URL}/matchmaking/fairness-state`);
  return res.json();
}

export async function runTimeoutSweep(token, thresholdHours) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/pairs/timeout-sweep?thresholdHours=${thresholdHours}`, {
    method: 'POST',
    headers: authHeaders(token)
  });
  return res.json();
}

export async function getAdminRiskOverview(token) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/admin-risk-overview`, {
    headers: authHeaders(token)
  });
  return res.json();
}

export async function getFairnessAudit(token) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/admin/fairness-audit`, {
    headers: authHeaders(token)
  });
  return res.json();
}

export async function blockUser(token, targetProfileId, reason) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/block`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ targetProfileId, reason })
  });
  return res.json();
}

export async function reportUser(token, reportedId, reason, details) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/report`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reportedId, reason, details })
  });
  return res.json();
}

export async function rateUser(token, toUserId, score, comment) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/rate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ toUserId, score, comment })
  });
  return res.json();
}

export async function getModerationQueue(token) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/admin/moderation-queue`, {
    headers: authHeaders(token)
  });
  return res.json();
}

export async function updateReportStatus(token, reportId, status, priority) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/admin/reports/${reportId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status, priority })
  });
  return res.json();
}

export async function getFairnessConfig(token) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/admin/fairness-config`, {
    headers: authHeaders(token)
  });
  return res.json();
}

export async function updateFairnessConfig(token, newDailyLimit, reason) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/admin/fairness-config`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ newDailyLimit, reason })
  });
  return res.json();
}

export async function getDonateStatus() {
  const res = await fetch(`${API_BASE_URL}/payments/donate/status`);
  return res.json();
}

export async function createDonateCheckout(amountCents) {
  const res = await fetch(`${API_BASE_URL}/payments/donate/stripe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountCents })
  });
  return res.json();
}

export async function createStripeCheckout(token, amountCents, description) {
  const res = await fetch(`${API_BASE_URL}/payments/checkout/stripe`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ amountCents, description })
  });
  return res.json();
}

export async function createBankTransferOrder(token, amountCents, description) {
  const res = await fetch(`${API_BASE_URL}/payments/checkout/bank-transfer`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ amountCents, description })
  });
  return res.json();
}

export async function getMyOrders(token) {
  const res = await fetch(`${API_BASE_URL}/payments/my-orders`, {
    headers: authHeaders(token)
  });
  return res.json();
}

export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return res.json();
}

export async function resetPassword(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function exportMyData(token) {
  const res = await fetch(`${API_BASE_URL}/auth/export-data`, { headers: authHeaders(token) });
  return res.json();
}

export async function getInboxSummary(token) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/inbox-summary`, { headers: authHeaders(token) });
  return res.json();
}

export async function markPairRead(token, pairId) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/pairs/${pairId}/read`, {
    method: 'POST',
    headers: authHeaders(token)
  });
  return res.json();
}

export async function getPublicProfile(token, profileId) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/profiles/${profileId}`, {
    headers: authHeaders(token)
  });
  return res.json();
}

export async function getAdminOverview(token) {
  const res = await fetch(`${API_BASE_URL}/admin/overview`, { headers: authHeaders(token) });
  return res.json();
}

export async function getAdminUsers(token, q = '') {
  const query = q ? `?q=${encodeURIComponent(q)}` : '';
  const res = await fetch(`${API_BASE_URL}/admin/users${query}`, { headers: authHeaders(token) });
  return res.json();
}

export async function updateAdminUser(token, profileId, payload) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${profileId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteAdminUser(token, profileId) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${profileId}`, {
    method: 'DELETE',
    headers: authHeaders(token)
  });
  return res.json();
}

export async function getAdminPayments(token) {
  const res = await fetch(`${API_BASE_URL}/admin/payments`, { headers: authHeaders(token) });
  return res.json();
}

export async function getAdminVerificationQueue(token) {
  const res = await fetch(`${API_BASE_URL}/admin/verification-queue`, { headers: authHeaders(token) });
  return res.json();
}

export async function rejectAdminVerification(token, profileId) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${profileId}/verification/reject`, {
    method: 'POST',
    headers: authHeaders(token)
  });
  return res.json();
}

export async function getAdminAuditEvents(token, category, limit = 50) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  params.set('limit', String(limit));
  const res = await fetch(`${API_BASE_URL}/admin/audit/events?${params}`, { headers: authHeaders(token) });
  return res.json();
}

export async function getAdminModerationDecisions(token, limit = 30) {
  const res = await fetch(`${API_BASE_URL}/admin/audit/moderation-decisions?limit=${limit}`, {
    headers: authHeaders(token)
  });
  return res.json();
}

export async function getAdminFeedExplain(token, viewerId) {
  const res = await fetch(`${API_BASE_URL}/admin/audit/feed-explain?viewerId=${encodeURIComponent(viewerId)}`, {
    headers: authHeaders(token)
  });
  return res.json();
}

export async function getAdminRetentionPolicy(token) {
  const res = await fetch(`${API_BASE_URL}/admin/audit/retention-policy`, { headers: authHeaders(token) });
  return res.json();
}

export async function resolveAdminReport(token, payload) {
  const res = await fetch(`${API_BASE_URL}/admin/audit/resolve-report`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function sendTypingPulse(token, pairId) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/pairs/${pairId}/typing`, {
    method: 'POST',
    headers: authHeaders(token)
  });
  return res.json();
}

export async function reactToMessage(token, pairId, messageId, emoji) {
  const res = await fetch(`${API_BASE_URL}/matchmaking/pairs/${pairId}/messages/${messageId}/reaction`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ emoji })
  });
  return res.json();
}

export function messagesStreamUrl(token, pairId, since) {
  const params = new URLSearchParams();
  params.set('access_token', token);
  if (since) params.set('since', since);
  return `${API_BASE_URL}/matchmaking/pairs/${pairId}/messages/stream?${params}`;
}

export function authHeaderValue(token) {
  return authHeaders(token).authorization;
}
