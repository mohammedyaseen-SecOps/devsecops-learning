import { Request, Response, NextFunction } from 'express';
import RoleService from '@/services/RoleService';
import { ValidationError } from '@/middleware/errorHandler';

/**
 * Role controller
 * HTTP request handlers for role and permission management endpoints
 */
export class RoleController {
  /**
   * GET /api/roles - Get all roles with pagination
   */
  static async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new ValidationError('Tenant ID is required');
      }

      const result = await RoleService.getRoles(tenantId, req.query);

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/roles/:roleId - Get role by ID
   */
  static async getRoleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;

      const role = await RoleService.getRoleById(roleId);

      res.status(200).json({
        success: true,
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/roles - Create new role
   */
  static async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const createdBy = req.user?.id;

      if (!tenantId || !createdBy) {
        throw new ValidationError('Tenant ID and user context are required');
      }

      const roleData = {
        ...req.body,
        createdBy,
      };

      const role = await RoleService.createRole(tenantId, roleData);

      res.status(201).json({
        success: true,
        data: role,
        message: 'Role created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/roles/:roleId - Update role
   */
  static async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      const updatedBy = req.user?.id;

      const updates = {
        ...req.body,
        updatedBy,
      };

      const role = await RoleService.updateRole(roleId, updates);

      res.status(200).json({
        success: true,
        data: role,
        message: 'Role updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/roles/:roleId - Delete role
   */
  static async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;

      await RoleService.deleteRole(roleId);

      res.status(200).json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/roles/:roleId/permissions - Add permission to role
   */
  static async addPermissionToRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      const { permissionKey } = req.body;

      if (!permissionKey) {
        throw new ValidationError('Permission key is required');
      }

      const role = await RoleService.addPermissionToRole(roleId, permissionKey);

      res.status(200).json({
        success: true,
        data: role,
        message: 'Permission added to role',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/roles/:roleId/permissions/:permissionKey - Remove permission from role
   */
  static async removePermissionFromRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId, permissionKey } = req.params;

      const role = await RoleService.removePermissionFromRole(roleId, permissionKey);

      res.status(200).json({
        success: true,
        data: role,
        message: 'Permission removed from role',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/roles/available-permissions - Get all available permissions
   */
  static async getAvailablePermissions(_req: Request, res: Response, next: NextFunction) {
    try {
      const permissions = await RoleService.getAvailablePermissions();

      res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/roles/:roleId/clone - Clone role with new name
   */
  static async cloneRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      const { newName } = req.body;
      const tenantId = req.user?.tenantId;

      if (!newName) {
        throw new ValidationError('New role name is required');
      }

      if (!tenantId) {
        throw new ValidationError('Tenant ID is required');
      }

      const role = await RoleService.cloneRole(roleId, newName, tenantId);

      res.status(201).json({
        success: true,
        data: role,
        message: 'Role cloned successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RoleController;
