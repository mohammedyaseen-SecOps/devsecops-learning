import { User, Tenant } from '@/models';
import { JwtUtil } from '@/utils/jwt';
import { PasswordUtil } from '@/utils/password';
import { logger } from '@/utils/logger';
import { AuthenticationError, ValidationError, NotFoundError } from '@/middleware/errorHandler';
import { AuthContext, LoginRequest, LoginResponse } from '@/types';

/**
 * Authentication service
 * Handles user login, token management, etc.
 */
export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    try {
      // Validate input
      if (!loginRequest.email || !loginRequest.password) {
        throw new ValidationError('Email and password are required');
      }

      // Find user by email
      const user = await User.findOne({
        where: { email: loginRequest.email },
        attributes: [
          'id',
          'tenantId',
          'email',
          'firstName',
          'lastName',
          'displayName',
          'role',
          'status',
          'password_hash',
        ],
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check user status
      if (user.status !== 'active') {
        throw new AuthenticationError(
          `Account is ${user.status}. Please contact support.`
        );
      }

      // Verify password
      if (!user.password_hash) {
        throw new AuthenticationError('Invalid email or password');
      }

      const isPasswordValid = await PasswordUtil.compare(
        loginRequest.password,
        user.password_hash
      );

      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Find tenant
      const tenant = await Tenant.findByPk(user.tenantId);
      if (!tenant) {
        throw new NotFoundError('Tenant');
      }

      // Check tenant subscription status
      if (!['active', 'trial'].includes(tenant.subscriptionStatus)) {
        throw new AuthenticationError(
          `Tenant subscription is ${tenant.subscriptionStatus}`
        );
      }

      // Create auth context
      const authContext: Partial<AuthContext> = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role as any,
        permissions: [], // TODO: Load from role-permission mapping
      };

      // Generate tokens
      const { accessToken, refreshToken, expiresIn } =
        JwtUtil.generateTokenPair(authContext);

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      logger.info('✓ User logged in successfully', {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
      });

      return {
        user: {
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          role: user.role as any,
          status: user.status as any,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
        expiresIn,
      };
    } catch (error) {
      logger.error('Login failed', { error });
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      // Verify refresh token
      const decoded = JwtUtil.verifyRefreshToken(refreshToken);

      // Find user to ensure they still exist and are active
      const user = await User.findByPk(decoded.id);
      if (!user || user.status !== 'active') {
        throw new AuthenticationError('User not found or inactive');
      }

      // Create new auth context
      const authContext: Partial<AuthContext> = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role as any,
        permissions: [],
      };

      // Generate new access token only (keep refresh token)
      const accessToken = JwtUtil.generateAccessToken(authContext);

      // Calculate expiry time (default 1 hour in milliseconds)
      const expiresIn = typeof config.jwt.expiresIn === 'string' ? 3600000 : config.jwt.expiresIn * 1000;

      logger.info('✓ Access token refreshed', { userId: user.id });

      return { accessToken, expiresIn };
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw error;
    }
  }

  /**
   * Validate access token
   */
  static validateAccessToken(token: string): boolean {
    try {
      JwtUtil.verifyAccessToken(token);
      return true;
    } catch (error) {
      logger.debug('Token validation failed', { error });
      return false;
    }
  }

  /**
   * Get user from token
   */
  static getUserFromToken(token: string): AuthContext | null {
    try {
      return JwtUtil.verifyAccessToken(token);
    } catch (error) {
      logger.debug('Failed to extract user from token', { error });
      return null;
    }
  }

  /**
   * Validate credentials
   * Used for internal authentication
   */
  static async validateCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: { email },
        attributes: [
          'id',
          'tenantId',
          'email',
          'role',
          'status',
          'password_hash',
        ],
      });

      if (!user || !user.password_hash) {
        return null;
      }

      const isValid = await PasswordUtil.compare(password, user.password_hash);
      return isValid ? user : null;
    } catch (error) {
      logger.error('Credential validation failed', { error });
      return null;
    }
  }
}

// Import config for parsing expiry
import { config } from '@/config';

export default AuthService;
