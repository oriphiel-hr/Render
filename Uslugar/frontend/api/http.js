// src/lib/http.js
const API_BASE = import.meta.env.VITE_API_URL || '/api'

// ---- plain fetch helper ----
export const apiFetch = (path, options = {}) =>
  fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })

// ---- ili Axios varijanta ----
import axios from 'axios'
export const http = axios.create({ baseURL: API_BASE })
