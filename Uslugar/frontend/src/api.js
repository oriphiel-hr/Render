// src/api.js
import axios from 'axios'

// Production: https://api.uslugar.oriph.io/api (Render.com)
// Development: http://localhost:4000/api
// Runtime (run-single): Playwright injektira window.__USLUGAR_API_URL__; inače ?apiUrl= u URL-u ili hash.
function getApiBase() {
  if (typeof window === 'undefined') return import.meta.env.VITE_API_URL || 'https://api.uslugar.oriph.io';
  const injected = window.__USLUGAR_API_URL__;
  if (injected && typeof injected === 'string') {
    try { sessionStorage.setItem('uslugar_test_api_url', injected); } catch (_) {}
    return injected;
  }
  let fromQuery = new URLSearchParams(window.location.search).get('apiUrl');
  if (!fromQuery && window.location.hash) {
    const hashPart = window.location.hash.indexOf('?') >= 0 ? window.location.hash.substring(window.location.hash.indexOf('?') + 1) : '';
    fromQuery = new URLSearchParams(hashPart).get('apiUrl');
  }
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

/** Trenutni API base (origin bez /api) – koristi za run-single apiBaseUrl da test koristi isti backend kao Admin. */
export function getApiBaseUrlForTest() {
  const base = getApiBase().replace(/\/$/, '').replace(/\/api\/?$/, '');
  return base || (typeof window !== 'undefined' && window.location.origin);
}

let baseURL = getApiBase().replace(/\/$/, '');
if (!baseURL.endsWith('/api')) {
  baseURL += '/api';
}

const api = axios.create({ 
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Svaki zahtjev koristi aktualni API base (runtime ?apiUrl ili sessionStorage) – važno za run-single
api.interceptors.request.use((config) => {
  let base = getApiBase().replace(/\/$/, '');
  if (!base.endsWith('/api')) base += '/api';
  config.baseURL = base;
  try { window.__USLUGAR_ACTUAL_API_BASE__ = base; } catch (_) {}
  const isAdminRequest = config.url && String(config.url).startsWith('/admin');
  const token = isAdminRequest ? localStorage.getItem('adminToken') : localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;