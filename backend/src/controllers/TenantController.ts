import { Request, Response, NextFunction } from 'express';
import TenantService from '@/services/TenantService';
import { ValidationError } from '@/middleware/errorHandler';

/**
 * Tenant controller
 * HTTP request handlers for tenant management endpoints
 */
export class TenantController {
  /**
   * GET /api/tenants - Get all tenants (admin only)
   */
  static async getTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TenantService.getTenants(req.query);

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
   * GET /api/tenants/:tenantId - Get tenant by ID
   */
  static async getTenantById(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;

      const tenant = await TenantService.getTenantById(tenantId);

      res.status(200).json({
        success: true,
        data: tenant,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tenants/slug/:slug - Get tenant by slug
   */
  static async getTenantBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const tenant = await TenantService.getTenantBySlug(slug);

      res.status(200).json({
        success: true,
        data: tenant,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tenants - Create new tenant
   */
  static async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const createdBy = req.user?.id;

      if (!createdBy) {
        throw new ValidationError('User context is required');
      }

      const tenant = await TenantService.createTenant(req.body, createdBy);

      res.status(201).json({
        success: true,
        data: tenant,
        message: 'Tenant created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/tenants/:tenantId - Update tenant
   */
  static async updateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        throw new ValidationError('User context is required');
      }

      const tenant = await TenantService.updateTenant(tenantId, req.body, updatedBy);

      res.status(200).json({
        success: true,
        data: tenant,
        message: 'Tenant updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/tenants/:tenantId - Delete tenant
   */
  static async deleteTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;

      const result = await TenantService.deleteTenant(tenantId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tenants/:tenantId/stats - Get tenant statistics
   */
  static async getTenantStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;

      const stats = await TenantService.getTenantStats(tenantId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tenants/:tenantId/modules/:moduleName/enable - Enable module
   */
  static async enableModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, moduleName } = req.params;

      const tenant = await TenantService.enableModule(tenantId, moduleName);

      res.status(200).json({
        success: true,
        data: tenant,
        message: `Module ${moduleName} enabled`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tenants/:tenantId/modules/:moduleName/disable - Disable module
   */
  static async disableModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, moduleName } = req.params;

      const tenant = await TenantService.disableModule(tenantId, moduleName);

      res.status(200).json({
        success: true,
        data: tenant,
        message: `Module ${moduleName} disabled`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tenants/:tenantId/subscription/upgrade - Upgrade subscription
   */
  static async upgradeSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const { plan, expiresAt } = req.body;

      if (!plan || !expiresAt) {
        throw new ValidationError('Plan and expiresAt are required');
      }

      const tenant = await TenantService.upgradeSubscription(
        tenantId,
        plan,
        new Date(expiresAt)
      );

      res.status(200).json({
        success: true,
        data: tenant,
        message: `Subscription upgraded to ${plan}`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tenants/search - Search tenants
   */
  static async searchTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;

      if (!q) {
        throw new ValidationError('Search query is required');
      }

      const result = await TenantService.searchTenants(String(q), req.query);

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default TenantController;
