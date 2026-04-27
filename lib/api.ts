import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Injecte automatiquement le Bearer token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirige vers /login si token expiré
api.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    if (
      error instanceof Object &&
      'response' in error &&
      (error as { response?: { status?: number } }).response?.status === 401 &&
      typeof window !== 'undefined'
    ) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
