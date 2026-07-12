import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'grc_access_token';
const REFRESH_TOKEN_KEY = 'grc_refresh_token';

export interface DecodedToken {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
  exp: number;
  iat: number;
}

/**
 * Store tokens in localStorage
 */
export const setTokensToStorage = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

/**
 * Get tokens from localStorage
 */
export const getTokens = (): { accessToken: string | null; refreshToken: string | null } => {
  if (typeof window !== 'undefined') {
    return {
      accessToken: localStorage.getItem(TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    };
  }
  return { accessToken: null, refreshToken: null };
};

/**
 * Get access token
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

/**
 * Remove tokens from localStorage
 */
export const removeTokensFromStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

/**
 * Decode JWT token
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  // Add 60 second buffer
  const expiryTime = decoded.exp * 1000 - 60000;
  return Date.now() >= expiryTime;
};

/**
 * Get time until token expiry in milliseconds
 */
export const getTimeUntilExpiry = (token: string): number => {
  const decoded = decodeToken(token);
  if (!decoded) return 0;

  const expiryTime = decoded.exp * 1000;
  const timeUntilExpiry = expiryTime - Date.now();
  return timeUntilExpiry > 0 ? timeUntilExpiry : 0;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const { accessToken } = getTokens();
  if (!accessToken) return false;

  return !isTokenExpired(accessToken);
};

/**
 * Get user from token
 */
export const getUserFromToken = (token: string | null) => {
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded || isTokenExpired(token)) return null;

  return {
    userId: decoded.userId,
    email: decoded.email,
    tenantId: decoded.tenantId,
    role: decoded.role,
  };
};

/**
 * Set up token refresh interval
 */
export const setupTokenRefreshInterval = (
  onRefresh: () => void,
  intervalMs: number = 600000 // 10 minutes
): (() => void) => {
  const interval = setInterval(() => {
    const { accessToken } = getTokens();
    if (accessToken && isTokenExpired(accessToken)) {
      onRefresh();
    }
  }, intervalMs);

  return () => clearInterval(interval);
};
