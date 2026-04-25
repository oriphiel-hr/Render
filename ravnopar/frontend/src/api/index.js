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
