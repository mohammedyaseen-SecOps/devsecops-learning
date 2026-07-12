import { apiClient } from './client';
import { User } from '@/store/authSlice';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Demo user data
const DEMO_USER: User = {
  id: 'demo-user-1',
  email: 'demo@grc-platform.local',
  firstName: 'Demo',
  lastName: 'User',
  role: 'admin',
  tenantId: 'demo-tenant-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Demo credentials
const DEMO_CREDENTIALS = {
  email: 'demo@grc-platform.local',
  password: 'demo',
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// Login endpoint
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Demo mode: accept any credentials
    if (DEMO_MODE) {
      return {
        success: true,
        data: {
          user: DEMO_USER,
          accessToken: 'demo-token-' + Math.random().toString(36).substr(2, 9),
          refreshToken: 'demo-refresh-' + Math.random().toString(36).substr(2, 9),
          expiresIn: 86400, // 24 hours
        },
      };
    }
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  refresh: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    if (DEMO_MODE) {
      return {
        success: true,
        data: {
          accessToken: 'demo-token-' + Math.random().toString(36).substr(2, 9),
          refreshToken: 'demo-refresh-' + Math.random().toString(36).substr(2, 9),
          expiresIn: 86400,
        },
      };
    }
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
  },

  logout: async (): Promise<void> => {
    if (DEMO_MODE) {
      return Promise.resolve();
    }
    return apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    if (DEMO_MODE) {
      return DEMO_USER;
    }
    const response = await apiClient.get<{ success: boolean; data: User }>(
      '/auth/me'
    );
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<void> => {
    return apiClient.post('/auth/reset-password', {
      token,
      newPassword,
      confirmPassword: newPassword,
    });
  },

  verifyEmail: async (email: string, token: string): Promise<void> => {
    return apiClient.post('/auth/verify-email', { email, token });
  },
};
