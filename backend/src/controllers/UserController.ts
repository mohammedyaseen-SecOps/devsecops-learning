import { Request, Response, NextFunction } from 'express';
import UserService from '@/services/UserService';
import { ValidationError } from '@/middleware/errorHandler';

/**
 * User controller
 * HTTP request handlers for user management endpoints
 */
export class UserController {
  /**
   * GET /api/users - Get all users with pagination
   */
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new ValidationError('Tenant ID is required');
      }

      const result = await UserService.getUsers(tenantId, req.query);

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
   * GET /api/users/:userId - Get user by ID
   */
  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new ValidationError('Tenant ID is required');
      }

      const user = await UserService.getUserById(userId, tenantId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users - Create new user
   */
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const createdBy = req.user?.id;

      if (!tenantId || !createdBy) {
        throw new ValidationError('Tenant ID and user context are required');
      }

      // Add created by metadata
      const userData = {
        ...req.body,
        createdBy,
      };

      const user = await UserService.createUser(tenantId, userData);

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:userId - Update user
   */
  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const tenantId = req.user?.tenantId;
      const updatedBy = req.user?.id;

      if (!tenantId) {
        throw new ValidationError('Tenant ID is required');
      }

      const updates = {
        ...req.body,
        updatedBy,
      };

      const user = await UserService.updateUser(userId, tenantId, updates);

      res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:userId - Delete user
   */
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new ValidationError('Tenant ID is required');
      }

      await UserService.deleteUser(userId, tenantId);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/search - Search users
   */
  static async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const tenantId = req.user?.tenantId;

      if (!q) {
        throw new ValidationError('Search query is required');
      }

      if (!tenantId) {
        throw new ValidationError('Tenant ID is required');
      }

      const result = await UserService.searchUsers(tenantId, String(q), req.query);

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
   * PATCH /api/users/:userId/status - Change user status
   */
  static async changeUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new ValidationError('Tenant ID is required');
      }

      if (!status) {
        throw new ValidationError('Status is required');
      }

      const user = await UserService.changeUserStatus(userId, tenantId, status);

      res.status(200).json({
        success: true,
        data: user,
        message: `User status changed to ${status}`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/stats/by-role - Get user count by role
   */
  static async getUserCountByRole(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new ValidationError('Tenant ID is required');
      }

      const stats = await UserService.getUserCountByRole(tenantId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:userId/with-tenant - Get user with tenant info
   */
  static async getUserWithTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new ValidationError('Tenant ID is required');
      }

      const user = await UserService.getUserWithTenant(userId, tenantId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
