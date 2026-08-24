import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/common';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:3000';

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: automatically attach JWT token if available
http.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('tms_token');
      if (token && typeof token === 'string' && token.split('.').length === 3 && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore in environments without localStorage
    }
    return config;
  },
  (error) => Promise.reject(error)
);

import { toast } from '@/store/useToastStore';

// Response interceptor: standard error handling & backend-driven toast feedback
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
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('tms_token');
        localStorage.removeItem('auth_user');
      } catch {}
    }

    const errMsg =
      (Array.isArray(error.response?.data?.message)
        ? error.response?.data?.message.join('. ')
        : error.response?.data?.message) ||
      error.response?.data?.error ||
      error.message;

    if (errMsg && !error.config?.headers?.['X-Skip-Toast']) {
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

