import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '@/utils/jwt';
import { AuthenticationError, AuthorizationError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { AuthContext, UserRole } from '@/types';

// Extend Express Request to include auth context
declare global {
  namespace Express {
    interface Request {
      user?: AuthContext;
      tenantId?: string;
    }
  }
}

/**
 * Authentication middleware - Verifies JWT token
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const user = JwtUtil.verifyAccessToken(token);

    // Attach user to request
    req.user = user;
    req.tenantId = user.tenantId;

    logger.debug('✓ User authenticated', {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else if (error instanceof Error && error.message === 'ACCESS_TOKEN_EXPIRED') {
      next(new AuthenticationError('Access token has expired. Please refresh your token.'));
    } else if (error instanceof Error) {
      next(new AuthenticationError(error.message));
    } else {
      next(new AuthenticationError('Authentication failed'));
    }
  }
};

/**
 * Authorization middleware - Checks user role
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      if (!allowedRoles.includes(req.user.role as UserRole)) {
        throw new AuthorizationError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        );
      }

      logger.debug('✓ User authorized', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: allowedRoles,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication middleware
 * Doesn't fail if no token, but attaches user if valid token provided
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const user = JwtUtil.verifyAccessToken(token);

    req.user = user;
    req.tenantId = user.tenantId;

    logger.debug('✓ Optional authentication attached user');
  } catch (error) {
    // Silently fail for optional auth
    logger.debug('Optional authentication failed, continuing without user');
  }

  next();
};

/**
 * Super admin only middleware
 */
export const superAdminOnly = (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    if (req.user.role !== UserRole.SUPER_ADMIN) {
      throw new AuthorizationError('Super admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Tenant isolation middleware
 * Ensures user can only access their own tenant's data
 */
export const tenantIsolation = (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    // Super admin can access all tenants
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    // Check if tenant ID matches
    const requestTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;

    if (requestTenantId && requestTenantId !== req.user.tenantId) {
      throw new AuthorizationError('Cannot access resources in other tenants');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
