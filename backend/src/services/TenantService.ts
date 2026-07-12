import { Tenant, User, Role } from '@/models';
import { ValidationError, NotFoundError, ConflictError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { Op } from 'sequelize';
import DatabaseUtil from '@/utils/database';

/**
 * Tenant service layer
 * Business logic for multi-tenant SaaS management
 */
export class TenantService {
  /**
   * Get all tenants (admin only)
   */
  static async getTenants(options: any = {}) {
    try {
      const { page = 1, pageSize = 10, status, sortBy = 'createdAt', sortDirection = 'DESC' } =
        options;

      const offset = (page - 1) * pageSize;
      const where: any = {};

      if (status) {
        where.subscriptionStatus = status;
      }

      const { count, rows } = await Tenant.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        order: [[sortBy, sortDirection]],
      });

      return {
        data: rows,
        meta: {
          page,
          pageSize,
          total: count,
          totalPages: Math.ceil(count / pageSize),
          hasNextPage: page < Math.ceil(count / pageSize),
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      logger.error('Failed to get tenants', { error });
      throw error;
    }
  }

  /**
   * Get tenant by ID
   */
  static async getTenantById(tenantId: string) {
    try {
      const tenant = await Tenant.findByPk(tenantId);

      if (!tenant) {
        throw new NotFoundError('Tenant');
      }

      return tenant;
    } catch (error) {
      logger.error('Failed to get tenant', { error });
      throw error;
    }
  }

  /**
   * Get tenant by slug
   */
  static async getTenantBySlug(slug: string) {
    try {
      const tenant = await Tenant.findOne({
        where: { slug },
      });

      if (!tenant) {
        throw new NotFoundError('Tenant');
      }

      return tenant;
    } catch (error) {
      logger.error('Failed to get tenant by slug', { error });
      throw error;
    }
  }

  /**
   * Create new tenant
   */
  static async createTenant(
    tenantData: {
      name: string;
      slug: string;
      description?: string;
      subscriptionPlan?: string;
    },
    createdBy: string
  ) {
    try {
      // Validate input
      if (!tenantData.name || !tenantData.slug) {
        throw new ValidationError('Name and slug are required');
      }

      // Check if slug already exists
      const existingTenant = await Tenant.findOne({
        where: { slug: tenantData.slug },
      });

      if (existingTenant) {
        throw new ConflictError('Tenant with this slug already exists');
      }

      // Validate slug format
      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(tenantData.slug)) {
        throw new ValidationError(
          'Slug must be lowercase alphanumeric with hyphens, starting and ending with alphanumeric'
        );
      }

      // Create tenant
      const tenant = await Tenant.create({
        name: tenantData.name,
        slug: tenantData.slug,
        description: tenantData.description,
        subscriptionPlan: tenantData.subscriptionPlan || 'starter',
        subscriptionStatus: 'trial',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        isActive: true,
        createdBy,
      });

      // Create tenant-specific schema
      try {
        await DatabaseUtil.createTenantSchema(tenant.id);
      } catch (error) {
        // Log error but don't fail tenant creation
        logger.warn('Failed to create tenant schema', { tenantId: tenant.id, error });
      }

      logger.info('✓ Tenant created successfully', { tenantId: tenant.id, slug: tenant.slug });

      return tenant;
    } catch (error) {
      logger.error('Failed to create tenant', { error });
      throw error;
    }
  }

  /**
   * Update tenant
   */
  static async updateTenant(tenantId: string, updates: any, updatedBy: string) {
    try {
      const tenant = await Tenant.findByPk(tenantId);

      if (!tenant) {
        throw new NotFoundError('Tenant');
      }

      // Prevent slug changes
      if (updates.slug && updates.slug !== tenant.slug) {
        throw new ValidationError('Cannot change tenant slug after creation');
      }

      // Update allowed fields
      if (updates.name) tenant.name = updates.name;
      if (updates.description !== undefined) tenant.description = updates.description;
      if (updates.subscriptionPlan) tenant.subscriptionPlan = updates.subscriptionPlan;
      if (updates.subscriptionStatus) tenant.subscriptionStatus = updates.subscriptionStatus;
      if (updates.subscriptionExpiresAt) tenant.subscriptionExpiresAt = updates.subscriptionExpiresAt;
      if (updates.enabledModules) tenant.enabledModules = updates.enabledModules;
      if (updates.config) tenant.config = updates.config;
      if (updates.isActive !== undefined) tenant.isActive = updates.isActive;

      tenant.updatedBy = updatedBy;

      await tenant.save();

      logger.info('✓ Tenant updated successfully', { tenantId });

      return tenant;
    } catch (error) {
      logger.error('Failed to update tenant', { error });
      throw error;
    }
  }

  /**
   * Delete tenant (soft delete recommended in production)
   */
  static async deleteTenant(tenantId: string) {
    try {
      const tenant = await Tenant.findByPk(tenantId);

      if (!tenant) {
        throw new NotFoundError('Tenant');
      }

      // Check if tenant has active users
      const userCount = await User.count({
        where: { tenantId },
      });

      if (userCount > 0) {
        throw new ValidationError('Cannot delete tenant with active users. Remove users first.');
      }

      // Delete tenant schema
      try {
        await DatabaseUtil.dropTenantSchema(tenantId);
      } catch (error) {
        logger.warn('Failed to drop tenant schema', { tenantId, error });
      }

      // Set to inactive instead of hard delete
      tenant.isActive = false;
      await tenant.save();

      logger.info('✓ Tenant deactivated successfully', { tenantId });

      return { message: 'Tenant deactivated successfully' };
    } catch (error) {
      logger.error('Failed to delete tenant', { error });
      throw error;
    }
  }

  /**
   * Get tenant statistics
   */
  static async getTenantStats(tenantId: string) {
    try {
      const tenant = await Tenant.findByPk(tenantId);

      if (!tenant) {
        throw new NotFoundError('Tenant');
      }

      const userCount = await User.count({
        where: { tenantId },
      });

      const roleCount = await Role.count({
        where: { tenantId },
      });

      const usersByRole = await User.findAll({
        where: { tenantId },
        attributes: ['role', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
        raw: true,
        group: ['role'],
      });

      return {
        tenantId,
        name: tenant.name,
        subscriptionPlan: tenant.subscriptionPlan,
        subscriptionStatus: tenant.subscriptionStatus,
        enabledModules: tenant.enabledModules,
        userCount,
        roleCount,
        usersByRole,
        createdAt: tenant.createdAt,
      };
    } catch (error) {
      logger.error('Failed to get tenant stats', { error });
      throw error;
    }
  }

  /**
   * Enable module for tenant
   */
  static async enableModule(tenantId: string, moduleName: string) {
    try {
      const tenant = await Tenant.findByPk(tenantId);

      if (!tenant) {
        throw new NotFoundError('Tenant');
      }

      const modules = tenant.enabledModules || [];

      if (!modules.includes(moduleName)) {
        modules.push(moduleName);
        tenant.enabledModules = modules;
        await tenant.save();
      }

      logger.info('✓ Module enabled for tenant', { tenantId, module: moduleName });

      return tenant;
    } catch (error) {
      logger.error('Failed to enable module', { error });
      throw error;
    }
  }

  /**
   * Disable module for tenant
   */
  static async disableModule(tenantId: string, moduleName: string) {
    try {
      const tenant = await Tenant.findByPk(tenantId);

      if (!tenant) {
        throw new NotFoundError('Tenant');
      }

      const modules = tenant.enabledModules || [];
      const updatedModules = modules.filter(m => m !== moduleName);

      if (updatedModules.length !== modules.length) {
        tenant.enabledModules = updatedModules;
        await tenant.save();
      }

      logger.info('✓ Module disabled for tenant', { tenantId, module: moduleName });

      return tenant;
    } catch (error) {
      logger.error('Failed to disable module', { error });
      throw error;
    }
  }

  /**
   * Upgrade subscription plan
   */
  static async upgradeSubscription(
    tenantId: string,
    newPlan: string,
    expiresAt: Date
  ) {
    try {
      const tenant = await Tenant.findByPk(tenantId);

      if (!tenant) {
        throw new NotFoundError('Tenant');
      }

      tenant.subscriptionPlan = newPlan;
      tenant.subscriptionStatus = 'active';
      tenant.subscriptionExpiresAt = expiresAt;

      await tenant.save();

      logger.info('✓ Subscription upgraded', { tenantId, plan: newPlan });

      return tenant;
    } catch (error) {
      logger.error('Failed to upgrade subscription', { error });
      throw error;
    }
  }

  /**
   * Search tenants
   */
  static async searchTenants(query: string, options: any = {}) {
    try {
      const { page = 1, pageSize = 10 } = options;
      const offset = (page - 1) * pageSize;

      const { count, rows } = await Tenant.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { slug: { [Op.iLike]: `%${query}%` } },
          ],
        },
        offset,
        limit: pageSize,
        order: [['createdAt', 'DESC']],
      });

      return {
        data: rows,
        meta: {
          page,
          pageSize,
          total: count,
          totalPages: Math.ceil(count / pageSize),
        },
      };
    } catch (error) {
      logger.error('Failed to search tenants', { error });
      throw error;
    }
  }
}

export default TenantService;
