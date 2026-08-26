import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@tms/shared/types/common';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:3000';

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  // Send credentials (HttpOnly cookies) with every request
  withCredentials: true,
});

// ── In-memory access token (never stored in localStorage) ─────────────────────
// Exported so useAuthStore can set it after login/register/refresh
export let _inMemoryAccessToken: string | null = null;
export const setInMemoryToken = (t: string | null) => { _inMemoryAccessToken = t; };

// ── Request interceptor: attach in-memory access token ────────────────────────
http.interceptors.request.use(
  (config) => {
    if (_inMemoryAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${_inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

import { toast } from '@tms/shared/store/useToastStore';

// ── Response interceptor: auto-refresh on 401 ─────────────────────────────────
let _refreshing = false;
let _refreshQueue: Array<(token: string | null) => void> = [];

http.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (response.data?.message && typeof response.data.message === 'string') {
        toast.success(response.data.message);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const method = error.config?.method?.toUpperCase();
    const isMutation = method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isNetworkError = error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !error.response;

    // Auto-refresh access token on 401 (skip for auth routes to avoid loops)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/') 
    ) {
      originalRequest._retry = true;

      if (_refreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          _refreshQueue.push((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(http(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      _refreshing = true;
      try {
        const res = await http.post('/auth/refresh', {});
        const newToken: string = res.data.accessToken;
        setInMemoryToken(newToken);
        _refreshQueue.forEach((cb) => cb(newToken));
        _refreshQueue = [];
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return http(originalRequest);
      } catch {
        // Refresh failed — clear auth state
        setInMemoryToken(null);
        _refreshQueue.forEach((cb) => cb(null));
        _refreshQueue = [];
        // Dynamically import to avoid circular dep
        try {
          const { useAuthStore } = await import('@tms/shared/store/useAuthStore');
          useAuthStore.getState().logout();
        } catch {}
      } finally {
        _refreshing = false;
      }
    }

    const errMsg =
      (Array.isArray(error.response?.data?.message)
        ? error.response?.data?.message.join('. ')
        : error.response?.data?.message) ||
      error.response?.data?.error ||
      (isMutation ? error.message : null);

    if (errMsg && !error.config?.headers?.['X-Skip-Toast'] && (isMutation || !isNetworkError)) {
      toast.error(String(errMsg));
    }

    return Promise.reject(error);
  }
);

/**
 * Standard API Client with typed helper methods
 */
export const apiClient = {
  async get<T>(urlOrData: string | T, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    if (typeof urlOrData === 'string') {
      try {
        const response = await http.get<T>(urlOrData, config);
        return {
          success: true,
          data: response.data,
          message: 'Data fetched successfully',
        };
      } catch (err: any) {
        throw new Error(err.response?.data?.message || err.message || 'API request failed');
      }
    } else {
      return {
        success: true,
        data: urlOrData,
        message: 'Data fetched successfully',
      };
    }
  },

  async post<T, D = any>(url: string, data: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await http.post<T>(url, data, config);
      return {
        success: true,
        data: response.data,
        message: 'Resource created successfully',
      };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'API post failed');
    }
  },

  async patch<T, D = any>(url: string, data: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await http.patch<T>(url, data, config);
      return {
        success: true,
        data: response.data,
        message: 'Resource updated successfully',
      };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'API patch failed');
    }
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await http.delete<T>(url, config);
      return {
        success: true,
        data: response.data,
        message: 'Resource deleted successfully',
      };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'API delete failed');
    }
  },
};
