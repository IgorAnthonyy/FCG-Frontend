import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Always use relative URLs so Nginx proxies /api/ requests to the Kubernetes internal services
export const apiClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const usersClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const catalogClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

const attachToken = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('fcg_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const handleResponseError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
      localStorage.removeItem('fcg_token');
      localStorage.removeItem('fcg_user');
      window.dispatchEvent(new Event('fcg_auth_logout'));
    }
  }
  return Promise.reject(error);
};

// Add interceptors to all clients
[apiClient, usersClient, catalogClient].forEach(client => {
  client.interceptors.request.use(attachToken, (err) => Promise.reject(err));
  client.interceptors.response.use((res) => res, handleResponseError);
});
