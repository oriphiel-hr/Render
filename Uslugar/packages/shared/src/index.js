export const SHARED_APP_NAME = 'Uslugar';

export function normalizeApiBaseUrl(url) {
  if (!url) return '';
  return String(url).replace(/\/+$/, '');
}

export async function apiRequest({
  apiBaseUrl,
  path,
  method = 'GET',
  token,
  body,
  headers = {}
}) {
  const base = normalizeApiBaseUrl(apiBaseUrl);
  if (!base) {
    throw new Error('Missing API base URL');
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const response = await fetch(`${base}/api${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {})
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed: ${response.status}`);
  }

  return data;
}

export async function loginWithPassword({
  apiBaseUrl,
  email,
  password,
  role
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/auth/login',
    method: 'POST',
    body: {
      email,
      password,
      ...(role ? { role } : {})
    }
  });
}

export async function getCurrentUser({
  apiBaseUrl,
  token
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/users/me',
    token
  });
}

export async function getJobs({
  apiBaseUrl,
  token,
  myJobs = false
}) {
  const query = myJobs ? '?myJobs=true' : '';
  return apiRequest({
    apiBaseUrl,
    path: `/jobs${query}`,
    token
  });
}

export async function getOffersForJob({
  apiBaseUrl,
  token,
  jobId
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/offers/job/${jobId}`,
    token
  });
}

export async function createOffer({
  apiBaseUrl,
  token,
  jobId,
  amount,
  message,
  estimatedDays
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/offers',
    method: 'POST',
    token,
    body: {
      jobId,
      amount,
      message,
      estimatedDays
    }
  });
}

export async function getMyOffers({
  apiBaseUrl,
  token
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/offers/my-offers',
    token
  });
}

export function validateLoginInput({ email, password }) {
  if (!email || !String(email).includes('@')) {
    return 'Email nije valjan.';
  }
  if (!password || String(password).length < 6) {
    return 'Lozinka mora imati barem 6 znakova.';
  }
  return '';
}

export function validateOfferInput({ amount, message }) {
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return 'Iznos ponude mora biti veci od 0.';
  }
  if (!message || String(message).trim().length < 5) {
    return 'Poruka ponude mora imati barem 5 znakova.';
  }
  return '';
}

export async function getChatRooms({
  apiBaseUrl,
  token
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/chat/rooms',
    token
  });
}

export async function getChatRoom({
  apiBaseUrl,
  token,
  roomId
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/chat/rooms/${roomId}`,
    token
  });
}

export async function getChatMessages({
  apiBaseUrl,
  token,
  roomId,
  limit = 50,
  offset = 0
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`,
    token
  });
}

export async function sendChatMessage({
  apiBaseUrl,
  token,
  roomId,
  content,
  attachments = []
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/chat/rooms/${roomId}/messages`,
    method: 'POST',
    token,
    body: { content, attachments }
  });
}

export async function markAllMessagesRead({
  apiBaseUrl,
  token,
  roomId
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/chat/rooms/${roomId}/mark-all-read`,
    method: 'POST',
    token
  });
}

export async function uploadChatImage({
  apiBaseUrl,
  token,
  roomId,
  uri,
  name = 'chat-image.jpg',
  type = 'image/jpeg'
}) {
  const form = new FormData();
  form.append('image', { uri, name, type });
  return apiRequest({
    apiBaseUrl,
    path: `/chat/rooms/${roomId}/upload-image`,
    method: 'POST',
    token,
    body: form
  });
}

export async function subscribePushToken({
  apiBaseUrl,
  token,
  expoPushToken
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/push-notifications/subscribe',
    method: 'POST',
    token,
    body: { expoPushToken }
  });
}

export async function unsubscribePushToken({
  apiBaseUrl,
  token,
  expoPushToken
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/push-notifications/unsubscribe',
    method: 'POST',
    token,
    body: { endpoint: expoPushToken }
  });
}

export async function sendTestPushToSelf({
  apiBaseUrl,
  token,
  title,
  message
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/push-notifications/test-self',
    method: 'POST',
    token,
    body: {
      ...(title ? { title } : {}),
      ...(message ? { message } : {})
    }
  });
}

export async function getPushSubscriptions({
  apiBaseUrl,
  token
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/push-notifications/subscriptions',
    token
  });
}

export async function getCurrentSubscription({
  apiBaseUrl,
  token
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/subscriptions/me',
    token
  });
}

export async function getSubscriptionPlans({
  apiBaseUrl,
  token
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/subscriptions/plans',
    token
  });
}

export async function getInvoices({
  apiBaseUrl,
  token
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/invoices',
    token
  });
}

export async function createCheckoutSession({
  apiBaseUrl,
  token,
  plan,
  interval = 'month'
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/payments/create-checkout',
    method: 'POST',
    token,
    body: { plan, interval }
  });
}

export async function sendInvoiceByEmail({
  apiBaseUrl,
  token,
  invoiceId
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/invoices/${invoiceId}/send`,
    method: 'POST',
    token
  });
}

export async function getCreditHistory({
  apiBaseUrl,
  token,
  limit = 50,
  type
}) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (type && type !== 'all') {
    params.set('type', type);
  }
  return apiRequest({
    apiBaseUrl,
    path: `/exclusive-leads/credits/history?${params.toString()}`,
    token
  });
}

export async function getAdminPaymentWatch({
  apiBaseUrl,
  token
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/admin/mobile/payment-watch',
    token
  });
}

export async function sendAdminPaymentReminder({
  apiBaseUrl,
  token,
  invoiceId
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/admin/mobile/invoices/${invoiceId}/remind-payment`,
    method: 'POST',
    token
  });
}

export async function getAdminPendingProviders({
  apiBaseUrl,
  token
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/admin/providers/pending',
    token
  });
}

export async function setAdminProviderApproval({
  apiBaseUrl,
  token,
  providerId,
  status,
  notes
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/admin/providers/${providerId}/approval`,
    method: 'PATCH',
    token,
    body: { status, notes }
  });
}

export async function getAdminPendingRefunds({
  apiBaseUrl,
  token
}) {
  return apiRequest({
    apiBaseUrl,
    path: '/admin/refunds/pending',
    token
  });
}

export async function approveAdminLeadRefund({
  apiBaseUrl,
  token,
  purchaseId,
  adminNotes
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/admin/refunds/lead/${purchaseId}/approve`,
    method: 'POST',
    token,
    body: { adminNotes }
  });
}

export async function rejectAdminLeadRefund({
  apiBaseUrl,
  token,
  purchaseId,
  reason
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/admin/refunds/lead/${purchaseId}/reject`,
    method: 'POST',
    token,
    body: { reason }
  });
}

export async function getAdminBlockedUsers({
  apiBaseUrl,
  token,
  limit = 30
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/admin/mobile/blocked-users?limit=${limit}`,
    token
  });
}

export async function blockAdminUser({
  apiBaseUrl,
  token,
  userId,
  reason
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/admin/mobile/users/${userId}/block`,
    method: 'PATCH',
    token,
    body: { reason }
  });
}

export async function unblockAdminUser({
  apiBaseUrl,
  token,
  userId
}) {
  return apiRequest({
    apiBaseUrl,
    path: `/admin/mobile/users/${userId}/unblock`,
    method: 'PATCH',
    token
  });
}
