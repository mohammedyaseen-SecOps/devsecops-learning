import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { AuthContext } from '@/types';

/**
 * JWT Token utility for authentication
 */
export class JwtUtil {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: Partial<AuthContext>): string {
    try {
      const options: SignOptions = {
        expiresIn: config.jwt.expiresIn as any,
        algorithm: 'HS256',
      };

      const token = jwt.sign(payload, config.jwt.secret, options);
      logger.debug('✓ Access token generated');
      return token;
    } catch (error) {
      logger.error('Failed to generate access token', { error });
      throw error;
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Partial<AuthContext>): string {
    try {
      const options: SignOptions = {
        expiresIn: config.jwt.refreshExpiresIn as any,
        algorithm: 'HS256',
      };

      const token = jwt.sign(payload, config.jwt.refreshSecret, options);
      logger.debug('✓ Refresh token generated');
      return token;
    } catch (error) {
      logger.error('Failed to generate refresh token', { error });
      throw error;
    }
  }

  /**
   * Generate both tokens
   */
  static generateTokenPair(payload: Partial<AuthContext>): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Parse expiresIn to milliseconds
    const expiresIn = this.parseExpiresIn(config.jwt.expiresIn);

    return { accessToken, refreshToken, expiresIn };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): AuthContext {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        algorithms: ['HS256'],
      }) as AuthContext;

      logger.debug('✓ Access token verified');
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.debug('Token expired');
        throw new Error('ACCESS_TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        logger.debug('Invalid token');
        throw new Error('INVALID_TOKEN');
      }
      logger.error('Failed to verify access token', { error });
      throw error;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): AuthContext {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret, {
        algorithms: ['HS256'],
      }) as AuthContext;

      logger.debug('✓ Refresh token verified');
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.debug('Refresh token expired');
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        logger.debug('Invalid refresh token');
        throw new Error('INVALID_REFRESH_TOKEN');
      }
      logger.error('Failed to verify refresh token', { error });
      throw error;
    }
  }

  /**
   * Decode token without verification
   */
  static decodeToken(token: string): AuthContext | null {
    try {
      const decoded = jwt.decode(token) as AuthContext;
      return decoded;
    } catch (error) {
      logger.error('Failed to decode token', { error });
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  /**
   * Get time until token expiration
   */
  static getTimeUntilExpiration(token: string): number {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const secondsUntilExpiration = decoded.exp - currentTime;

    return Math.max(0, secondsUntilExpiration);
  }

  /**
   * Parse expiresIn string to milliseconds
   * Examples: "1h", "7d", "30m", "3600" (seconds)
   */
  private static parseExpiresIn(expiresIn: string | number): number {
    if (typeof expiresIn === 'number') {
      return expiresIn * 1000; // seconds to milliseconds
    }

    const matches = expiresIn.match(/^(\d+)([smhd])$/);
    if (!matches) {
      return 24 * 60 * 60 * 1000; // default 24 hours
    }

    const value = parseInt(matches[1], 10);
    const unit = matches[2];

    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (units[unit] || 1);
  }
}

export default JwtUtil;
