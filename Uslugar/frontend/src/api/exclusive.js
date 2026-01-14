// USLUGAR EXCLUSIVE - API Client
import api from '../api';

// ============================================================
// LEADS
// ============================================================

export const getAvailableLeads = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.city) params.append('city', filters.city);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.minBudget) params.append('minBudget', filters.minBudget);
  if (filters.maxBudget) params.append('maxBudget', filters.maxBudget);
  
  return api.get(`/exclusive/leads/available?${params.toString()}`);
};

export const purchaseLead = (jobId) => {
  return api.post(`/exclusive/leads/${jobId}/purchase`);
};

export const unlockContact = (jobId) => {
  return api.post(`/exclusive/leads/${jobId}/unlock-contact`);
};

export const getMyLeads = (status = null) => {
  const params = status ? `?status=${status}` : '';
  return api.get(`/exclusive/leads/my-leads${params}`);
};

export const markLeadContacted = (purchaseId) => {
  return api.post(`/exclusive/leads/purchases/${purchaseId}/contacted`);
};

export const markLeadConverted = (purchaseId, revenue) => {
  return api.post(`/exclusive/leads/purchases/${purchaseId}/converted`, { revenue });
};

export const requestRefund = (purchaseId, reason) => {
  return api.post(`/exclusive/leads/purchases/${purchaseId}/refund`, { reason });
};

// ============================================================
// CREDITS
// ============================================================

export const getCreditsBalance = () => {
  return api.get('/exclusive/leads/credits/balance');
};

export const getCreditHistory = (limit = 50, type = null) => {
  const params = new URLSearchParams();
  params.append('limit', limit);
  if (type) {
    params.append('type', type);
  }
  return api.get(`/exclusive/leads/credits/history?${params.toString()}`);
};

export const purchaseCredits = (amount, paymentIntentId) => {
  return api.post('/exclusive/leads/credits/purchase', { amount, paymentIntentId });
};

// ============================================================
// ROI
// ============================================================

export const getROIDashboard = () => {
  return api.get('/exclusive/roi/dashboard');
};

export const getMonthlyStats = (year, month) => {
  return api.get(`/exclusive/roi/monthly-stats?year=${year}&month=${month}`);
};

export const getYearlyReport = (year) => {
  return api.get(`/exclusive/roi/yearly-report?year=${year}`);
};

export const getTopLeads = (limit = 10) => {
  return api.get(`/exclusive/roi/top-leads?limit=${limit}`);
};

export const getBenchmark = () => {
  return api.get('/exclusive/roi/benchmark');
};

export const getBenchmarkStats = () => {
  return api.get('/exclusive/roi/benchmark/stats');
};

export const getForecast = (months = 3) => {
  return api.get(`/exclusive/roi/forecast?months=${months}`);
};

// ============================================================
// VERIFICATION
// ============================================================

export const getVerificationStatus = () => {
  return api.get('/verification/status');
};

export const sendPhoneVerificationCode = (phone) => {
  return api.post('/verification/phone/send-code', { phone });
};

export const verifyPhoneCode = (code) => {
  return api.post('/verification/phone/verify-code', { code });
};

export const uploadIDVerification = (idImageFront, idImageBack) => {
  return api.post('/verification/id/upload', { idImageFront, idImageBack });
};

export const verifyCompany = () => {
  return api.post('/verification/company/verify');
};

// ============================================================
// SUBSCRIPTIONS
// ============================================================

export const getSubscriptionPlans = () => {
  return api.get('/subscriptions/plans');
};

export const getMySubscription = () => {
  return api.get('/subscriptions/me');
};

export const subscribeToPlan = (plan) => {
  return api.post('/payments/create-checkout', { plan });
};

export const cancelSubscription = () => {
  return api.post('/subscriptions/cancel');
};

// ============================================================
// EXPORT
// ============================================================

export const exportMyLeadsCSV = () => {
  return api.get('/exclusive/leads/export/my-leads', {
    responseType: 'blob'
  });
};

export const exportCreditsHistoryCSV = (type = null) => {
  const params = new URLSearchParams();
  if (type) {
    params.append('type', type);
  }
  const url = params.toString() 
    ? `/exclusive/leads/export/credits-history?${params.toString()}`
    : '/exclusive/leads/export/credits-history';
  return api.get(url, {
    responseType: 'blob'
  });
};

// ============================================================
// TEAM LOCATIONS (GEO-DYNAMIC)
// ============================================================

export const getTeamLocations = () => {
  return api.get('/providers/me/team-locations');
};

export const createTeamLocation = (data) => {
  return api.post('/providers/me/team-locations', data);
};

export const updateTeamLocation = (locationId, data) => {
  return api.put(`/providers/me/team-locations/${locationId}`, data);
};

export const deleteTeamLocation = (locationId) => {
  return api.delete(`/providers/me/team-locations/${locationId}`);
};

export const toggleTeamLocationActive = (locationId) => {
  return api.patch(`/providers/me/team-locations/${locationId}/toggle-active`);
};
