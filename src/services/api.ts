import axios from 'axios';
import type { AxiosInstance } from 'axios';
import qs from 'qs';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  withCredentials: true, // Enable sending cookies with requests
  paramsSerializer: (params) =>
    qs.stringify(params, {
      allowDots: true,
      encode: false,
      arrayFormat: 'comma',
    }),
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message || 'Request error',
      statusCode: error.response?.status || 500,
      error: error.response?.data,
    };
  }
  return {
    message: 'Unknown error',
    statusCode: 500,
    error,
  };
};