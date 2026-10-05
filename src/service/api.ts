// services/api.ts
import axios, { type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const refreshToken = localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_URL}/admin/refresh-token`, {
          refresh_token: refreshToken,
        }, {
          headers: { Accept: 'application/json' },
        });
        const accessToken = response.data?.data?.access_token;

        if (!accessToken) {
          throw new Error('Le serveur n’a pas retourné de nouveau token admin.');
        }

        localStorage.setItem('token', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Ne pas rediriger automatiquement, laisser le composant gérer
      // window.location.href = '/login?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export const setAdminRefreshToken = (token: string) => {
  localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, token);
};

export const clearAdminRefreshToken = () => {
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
};

export default api;