// src/api.js
import axios from 'axios'

// Production: https://api.uslugar.oriph.io/api (Render.com)
// Development: http://localhost:4000/api
// Relative (same domain): /api

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.uslugar.oriph.io';

// Remove trailing slash and ensure /api is present
let baseURL = API_BASE.replace(/\/$/, '');
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