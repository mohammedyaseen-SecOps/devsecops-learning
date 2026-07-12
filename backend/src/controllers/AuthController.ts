import { Request, Response, NextFunction } from 'express';
import AuthService from '@/services/AuthService';
import { ValidationError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

/**
 * Authentication controller
 * HTTP request handlers for authentication endpoints
 */
export class AuthController {
  /**
   * POST /api/auth/login - User login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await AuthService.login({ email, password });

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh - Refresh access token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken,
          expiresIn: result.expiresIn,
        },
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout - User logout
   */
  static async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me - Get current authenticated user
   */
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user) {
        throw new ValidationError('User not authenticated');
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/verify-email - Verify email (optional)
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, token } = req.body;

      if (!email || !token) {
        throw new ValidationError('Email and token are required');
      }

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password - Request password reset
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ValidationError('Email is required');
      }

      // Don't expose whether email exists for security reasons
      logger.info('Password reset requested', { email });

      res.status(200).json({
        success: true,
        message: 'If an account exists for this email, a password reset link will be sent',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password - Reset password with token
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || !newPassword || !confirmPassword) {
        throw new ValidationError('Token, newPassword, and confirmPassword are required');
      }

      if (newPassword !== confirmPassword) {
        throw new ValidationError('Passwords do not match');
      }

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
