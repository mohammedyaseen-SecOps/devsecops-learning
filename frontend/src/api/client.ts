import axios, { AxiosInstance, AxiosError } from 'axios';
import { store } from '@/store';
import { setTokens, logout } from '@/store/authSlice';
import { getTokens, setTokensToStorage, removeTokensFromStorage } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

/**
 * API Client for communicating with backend
 */
class APIClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add authentication token to requests
    this.client.interceptors.request.use(
      (config) => {
        const { accessToken } = getTokens();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle responses and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => this.handleResponseError(error)
    );
  }

  private async handleResponseError(error: AxiosError): Promise<any> {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (this.isRefreshing) {
        // Token refresh already in progress, queue this request
        return new Promise((resolve) => {
          this.failedQueue.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(this.client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      this.isRefreshing = true;

      try {
        const { refreshToken } = getTokens();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data.data;
        
        // Update tokens in Redux and storage
        store.dispatch(
          setTokens({
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn,
          })
        );
        setTokensToStorage(accessToken, newRefreshToken);

        // Process queued requests
        this.failedQueue.forEach((callback) => callback(accessToken));
        this.failedQueue = [];

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return this.client(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        store.dispatch(logout());
        removeTokensFromStorage();
        this.failedQueue = [];
        return Promise.reject(refreshError);
      } finally {
        this.isRefreshing = false;
      }
    }

    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      return Promise.reject(new Error('Insufficient permissions'));
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      return Promise.reject(new Error('Resource not found'));
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      return Promise.reject(new Error('Server error occurred'));
    }

    return Promise.reject(error);
  }

  // GET request
  get<T = any>(url: string, config?: any): Promise<T> {
    return this.client.get<T>(url, config).then((res) => res.data);
  }

  // POST request
  post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.post<T>(url, data, config).then((res) => res.data);
  }

  // PUT request
  put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.put<T>(url, data, config).then((res) => res.data);
  }

  // PATCH request
  patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.patch<T>(url, data, config).then((res) => res.data);
  }

  // DELETE request
  delete<T = any>(url: string, config?: any): Promise<T> {
    return this.client.delete<T>(url, config).then((res) => res.data);
  }
}

export const apiClient = new APIClient();
