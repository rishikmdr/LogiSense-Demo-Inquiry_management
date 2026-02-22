import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const stored = localStorage.getItem('logisense-auth');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('logisense-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
