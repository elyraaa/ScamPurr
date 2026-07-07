import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token getter injected by AuthContext on login.
let _authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  _authToken = token;
};

function formatApiErrorDetail(detail: unknown): string | null {
  if (!detail) return null;
  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg: unknown }).msg);
        }
        return null;
      })
      .filter(Boolean)
      .join(' ');
  }

  if (typeof detail === 'object' && 'msg' in detail) {
    return String((detail as { msg: unknown }).msg);
  }

  return null;
}

// Request interceptor: attach Bearer token to every request
api.interceptors.request.use(
  (config) => {
    if (_authToken) {
      config.headers.Authorization = `Bearer ${_authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      formatApiErrorDetail(error.response?.data?.detail) ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
