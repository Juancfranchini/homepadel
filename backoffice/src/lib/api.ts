// Axios HTTP client configured for the Home Pádel backend API.
// Automatically attaches the JWT token from localStorage to every request
// and redirects to /login on 401 Unauthorized responses.

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bo_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login page on 401 Unauthorized responses
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('bo_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
