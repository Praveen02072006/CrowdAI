import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'))
    ? 'http://localhost:3001'
    : 'https://crowdai-pdki.onrender.com');
console.log('api.ts: API_URL detected =', API_URL);

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});
console.log('api.ts: axios instance created with baseURL =', `${API_URL}/api`);

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  console.log('api.interceptors.request: config baseURL =', config.baseURL, 'url =', config.url);
  const token = localStorage.getItem('cs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('api.interceptors.request: Token attached');
  }
  return config;
}, (error) => {
  console.error('api.interceptors.request error:', error);
  return Promise.reject(error);
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => {
    console.log('api.interceptors.response: Success res.status =', res.status);
    return res;
  },
  (err) => {
    console.error('api.interceptors.response: Error caught =', err);
    if (err.response?.status === 401) {
      console.warn('api.interceptors.response: 401 Unauthorized - clearing credentials');
      localStorage.removeItem('cs_token');
      localStorage.removeItem('cs_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
