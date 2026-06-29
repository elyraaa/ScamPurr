import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token getter injected by AuthContext on login
let _authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  _authToken = token;
};

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
    if (!error.response) {
      return Promise.reject(
        new Error(
          'The ScamPurr API is not responding yet. The backend may be waking up, so please wait a few seconds and try again.'
        )
      );
    }

    if (error.response.status === 429) {
      return Promise.reject(new Error('Too many requests. Please wait a minute and try again.'));
    }

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
