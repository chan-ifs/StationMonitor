import axios from 'axios';

// Use environment variable if set, otherwise use backend URL for local development
// In Docker, nginx proxy handles routing, so empty string works there
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username?: string;
    email?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
  message: string;
}

export interface DashboardResponse {
  message: string;
  user: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/login', credentials);
    return response.data;
  },
  register: async (credentials: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/api/register', credentials);
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
  getData: async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>('/api/dashboard');
    return response.data;
  },
};

// Gantt Chart Task and Link interfaces
export interface GanttTask {
  id: string | number;
  text: string;
  start: Date | string;
  end: Date | string;
  duration?: number;
  progress?: number;
  type?: 'task' | 'summary' | 'milestone';
  parent?: string | number;
  open?: boolean;
  [key: string]: any; // Allow additional properties like workPackage
}

export interface GanttLink {
  id?: string | number;
  type: 's2s' | 's2e' | 'e2s' | 'e2e'; // start-to-start, start-to-end, end-to-start, end-to-end
  source: string | number;
  target: string | number;
}

export interface GanttDataResponse {
  tasks: GanttTask[];
  links?: GanttLink[];
}

export const ganttService = {
  getTasks: async (): Promise<GanttDataResponse> => {
    const response = await api.get<GanttDataResponse>('/api/gantt/tasks');
    return response.data;
  },
};

export default api;

