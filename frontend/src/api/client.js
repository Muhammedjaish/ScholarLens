import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Request interceptor to attach authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error formatting
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let friendlyMessage = 'An unexpected network error occurred.';
    let details = null;

    if (error.response) {
      if (error.response.status === 401) {
        // Auto-clear invalid token on unauthorized
        localStorage.removeItem('auth_token');
      }

      if (error.response.data) {
        if (error.response.data.error?.message) {
          friendlyMessage = error.response.data.error.message;
          details = error.response.data.error.details;
        } else if (error.response.data.detail) {
          friendlyMessage = error.response.data.detail;
        } else if (typeof error.response.data === 'string') {
          friendlyMessage = error.response.data;
        }
      }
    } else if (error.request) {
      friendlyMessage = 'Could not connect to the backend server. Please verify the Django service is running.';
    }

    const normalizedError = new Error(friendlyMessage);
    normalizedError.status = error.response?.status;
    normalizedError.details = details;
    return Promise.reject(normalizedError);
  }
);

export default apiClient;

