import { Router } from 'express';
import AuthController from '@/controllers/AuthController';
import { authenticate } from '@/middleware/authentication';
import { validate } from '@/utils/validation';
import { loginSchema, refreshTokenSchema } from '@/utils/validation';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
router.post(
  '/login',
  validate(loginSchema, 'body'),
  AuthController.login
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema, 'body'),
  AuthController.refreshToken
);

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post(
  '/logout',
  authenticate,
  AuthController.logout
);

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
router.get(
  '/me',
  authenticate,
  AuthController.getCurrentUser
);

/**
 * POST /api/auth/verify-email
 * Verify user email with token
 */
router.post(
  '/verify-email',
  AuthController.verifyEmail
);

/**
 * POST /api/auth/forgot-password
 * Request password reset for email
 */
router.post(
  '/forgot-password',
  AuthController.forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Reset password with reset token
 */
router.post(
  '/reset-password',
  AuthController.resetPassword
);

export default router;
