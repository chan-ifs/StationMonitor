import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/api/login', credentials);
    return response.data;
  },
  register: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/register', data);
    return response.data;
  },
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getGoogleAuthUrl: async () => {
    const response = await api.get('/api/auth/google', {
      params: {
        redirect_url: `${window.location.origin}/auth/google/callback`
      }
    });
    return response.data.auth_url;
  },
  handleGoogleCallback: async (code: string, state: string) => {
    // Note: The backend callback endpoint expects query parameters
    // We need to pass the redirect_uri that was used in the initial OAuth request
    // This is the URL where Google redirected to (current page URL)
    const redirectUri = `${window.location.origin}${window.location.pathname}`;
    const response = await api.get(`/api/auth/google/callback?code=${code}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`);
    return response.data;
  },
};

export const dashboardService = {
  getData: async () => {
    const response = await api.get('/api/dashboard');
    return response.data;
  },
};

export const ganttService = {
  getTasks: async () => {
    const response = await api.get('/api/gantt/tasks');
    return response.data;
  },
};

export default api;

