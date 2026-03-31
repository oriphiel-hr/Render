const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100/api';

export async function createPartnerInquiry(payload) {
  const res = await fetch(`${API_BASE_URL}/partner-inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return res.json();
}

export async function createDemoConfiguration(payload) {
  const res = await fetch(`${API_BASE_URL}/demo-configurations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchDemoInsights(adminApiKey) {
  const res = await fetch(`${API_BASE_URL}/admin/partner-inquiries/demo-insights`, {
    headers: {
      'x-admin-api-key': adminApiKey || ''
    }
  });
  return res.json();
}

export async function fetchTechnologyCatalog() {
  const res = await fetch(`${API_BASE_URL}/technology-catalog`);
  return res.json();
}

export async function refreshTechnologyCatalog(adminApiKey) {
  const res = await fetch(`${API_BASE_URL}/admin/technology-catalog/refresh`, {
    method: 'POST',
    headers: {
      'x-admin-api-key': adminApiKey || ''
    }
  });
  return res.json();
}

export async function fetchTechnologyCatalogStatus(adminApiKey) {
  const res = await fetch(`${API_BASE_URL}/admin/technology-catalog/status`, {
    headers: {
      'x-admin-api-key': adminApiKey || ''
    }
  });
  return res.json();
}

export async function createClient(adminApiKey, payload) {
  const res = await fetch(`${API_BASE_URL}/admin/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-api-key': adminApiKey || ''
    },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function listClients(adminApiKey, query) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  const url = `${API_BASE_URL}/admin/clients${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, {
    headers: { 'x-admin-api-key': adminApiKey || '' }
  });
  return res.json();
}

export async function listClientConfigurations(adminApiKey, clientId) {
  const res = await fetch(`${API_BASE_URL}/admin/clients/${clientId}/configurations`, {
    headers: { 'x-admin-api-key': adminApiKey || '' }
  });
  return res.json();
}

export async function createClientConfiguration(adminApiKey, clientId, payload) {
  const res = await fetch(`${API_BASE_URL}/admin/clients/${clientId}/configurations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-api-key': adminApiKey || ''
    },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function updateClientConfiguration(adminApiKey, configId, payload) {
  const res = await fetch(`${API_BASE_URL}/admin/client-configurations/${configId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-api-key': adminApiKey || ''
    },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function duplicateClientConfiguration(adminApiKey, configId) {
  const res = await fetch(`${API_BASE_URL}/admin/client-configurations/${configId}/duplicate`, {
    method: 'POST',
    headers: { 'x-admin-api-key': adminApiKey || '' }
  });
  return res.json();
}

export async function convertDemoToClientConfiguration(adminApiKey, inquiryId) {
  const res = await fetch(`${API_BASE_URL}/admin/demo-configurations/${inquiryId}/convert-to-client-config`, {
    method: 'POST',
    headers: { 'x-admin-api-key': adminApiKey || '' }
  });
  return res.json();
}
