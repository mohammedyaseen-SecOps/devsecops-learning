import { Request, Response, NextFunction } from 'express';
import { AuthorizationError, AuthenticationError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { Role } from '@/models';

/**
 * RBAC (Role-Based Access Control) Permission Engine
 */

interface PermissionCheck {
  resource: string;
  action: string;
}

/**
 * Check if user has specific permission
 * Can be called as checkPermission('users:read') or checkPermission('users', 'read')
 */
export const checkPermission = (resourceOrFull: string, action?: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      // Parse permission key
      let permissionKey: string;
      if (action) {
        permissionKey = `${resourceOrFull}:${action}`;
      } else {
        permissionKey = resourceOrFull;
      }

      // Get user's role
      const role = await Role.findOne({
        where: {
          name: req.user.role,
        },
      });

      if (!role) {
        throw new AuthorizationError('User role not found');
      }

      // Check if role has permission
      const hasPermission = role.permissions && role.permissions.includes(permissionKey);

      if (!hasPermission) {
        throw new AuthorizationError(
          `Access denied. Required permission: ${permissionKey}`
        );
      }

      logger.debug('✓ Permission granted', {
        userId: req.user.id,
        role: req.user.role,
        permission: permissionKey,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has ANY of the specified permissions
 */
export const checkAnyPermission = (permissions: PermissionCheck[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      const role = await Role.findOne({
        where: {
          name: req.user.role,
        },
      });

      if (!role) {
        throw new AuthorizationError('User role not found');
      }

      const hasPermission = permissions.some(({ resource, action }) => {
        const permissionKey = `${resource}:${action}`;
        return role.permissions.includes(permissionKey);
      });

      if (!hasPermission) {
        const permissionKeys = permissions.map(p => `${p.resource}:${p.action}`).join(', ');
        throw new AuthorizationError(`Access denied. Required one of: ${permissionKeys}`);
      }

      logger.debug('✓ Permission granted (any of)', {
        userId: req.user.id,
        role: req.user.role,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has ALL of the specified permissions
 */
export const checkAllPermissions = (permissions: PermissionCheck[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      const role = await Role.findOne({
        where: {
          name: req.user.role,
        },
      });

      if (!role) {
        throw new AuthorizationError('User role not found');
      }

      const allHavePermission = permissions.every(({ resource, action }) => {
        const permissionKey = `${resource}:${action}`;
        return role.permissions.includes(permissionKey);
      });

      if (!allHavePermission) {
        const missingPermissions = permissions
          .filter(({ resource, action }) => {
            const permissionKey = `${resource}:${action}`;
            return !role.permissions.includes(permissionKey);
          })
          .map(p => `${p.resource}:${p.action}`)
          .join(', ');
        throw new AuthorizationError(`Access denied. Missing permissions: ${missingPermissions}`);
      }

      logger.debug('✓ Permission granted (all of)', {
        userId: req.user.id,
        role: req.user.role,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Add permission to role
 */
export async function addPermissionToRole(
  roleId: string,
  resource: string,
  action: string
): Promise<void> {
  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const permission = `${resource}:${action}`;
    const permissions = role.permissions || [];

    if (!permissions.includes(permission)) {
      permissions.push(permission);
      await role.update({ permissions });
      logger.info(`✓ Permission added to role: ${resource}:${action}`, { roleId });
    }
  } catch (error) {
    logger.error('Failed to add permission to role', { error });
    throw error;
  }
}

/**
 * Remove permission from role
 */
export async function removePermissionFromRole(
  roleId: string,
  resource: string,
  action: string
): Promise<void> {
  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const permission = `${resource}:${action}`;
    const permissions = role.permissions || [];

    const updatedPermissions = permissions.filter(p => p !== permission);
    await role.update({ permissions: updatedPermissions });

    logger.info(`✓ Permission removed from role: ${resource}:${action}`, { roleId });
  } catch (error) {
    logger.error('Failed to remove permission from role', { error });
    throw error;
  }
}

/**
 * Get all permissions for a role
 */
export async function getRolePermissions(roleId: string): Promise<PermissionCheck[]> {
  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    return (role.permissions || []).map(p => {
      const [resource, action] = p.split(':');
      return { resource, action };
    });
  } catch (error) {
    logger.error('Failed to get role permissions', { error });
    throw error;
  }
}

/**
 * Middleware to attach user permissions to request
 */
export const loadUserPermissions = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next();
    }

    const role = await Role.findOne({
      where: {
        name: req.user.role,
      },
    });

    if (role && role.permissions) {
      req.user.permissions = role.permissions;
    }

    next();
  } catch (error) {
    logger.error('Failed to load user permissions', { error });
    next(error);
  }
};

export default {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  addPermissionToRole,
  removePermissionFromRole,
  getRolePermissions,
  loadUserPermissions,
};
