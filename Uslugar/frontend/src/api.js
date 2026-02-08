// src/api.js
import axios from 'axios'

// Production: https://api.uslugar.oriph.io/api (Render.com)
// Development: http://localhost:4000/api
// Runtime (run-single): ?apiUrl=... u URL-u – zahtjevi idu na backend koji servira test
function getApiBase() {
  if (typeof window === 'undefined') return import.meta.env.VITE_API_URL || 'https://api.uslugar.oriph.io';
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('apiUrl');
  if (fromQuery) {
    try {
      sessionStorage.setItem('uslugar_test_api_url', fromQuery);
      return fromQuery;
    } catch (_) {}
  }
  try {
    const fromStorage = sessionStorage.getItem('uslugar_test_api_url');
    if (fromStorage) return fromStorage;
  } catch (_) {}
  return import.meta.env.VITE_API_URL || 'https://api.uslugar.oriph.io';
}

let baseURL = getApiBase().replace(/\/$/, '');
if (!baseURL.endsWith('/api')) {
  baseURL += '/api';
}

const api = axios.create({ 
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const isAdminRequest = config.url && String(config.url).startsWith('/admin');
  const token = isAdminRequest ? localStorage.getItem('adminToken') : localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;