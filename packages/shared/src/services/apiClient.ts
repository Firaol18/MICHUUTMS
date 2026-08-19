import type { ApiResponse } from '@tms/shared/types/common';

/**
 * Production-ready mock API client simulator with delay & standardized responses.
 * In a real production setup, this is replaced by Axios or Fetch instance with interceptors.
 */
export const apiClient = {
  async get<T>(data: T, delayMs: number = 300): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data,
          message: 'Data fetched successfully',
        });
      }, delayMs);
    });
  },

  async post<T>(data: T, delayMs: number = 400): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data,
          message: 'Resource created successfully',
        });
      }, delayMs);
    });
  },

  async update<T>(data: T, delayMs: number = 350): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data,
          message: 'Resource updated successfully',
        });
      }, delayMs);
    });
  },
};
