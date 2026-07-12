import { Router } from 'express';
import TenantController from '@/controllers/TenantController';
import { authenticate, authorize } from '@/middleware/authentication';
import { validate } from '@/utils/validation';
import { createTenantSchema, updateTenantSchema, paginationSchema } from '@/utils/validation';
import { UserRole } from '@/types';

const router = Router();

/**
 * GET /api/tenants
 * Get all tenants (super admin only)
 */
router.get('/', authenticate, authorize(UserRole.SUPER_ADMIN), TenantController.getTenants);

/**
 * POST /api/tenants
 * Create new tenant (super admin only)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  validate(createTenantSchema, 'body'),
  TenantController.createTenant
);

/**
 * GET /api/tenants/search
 * Search tenants by name/slug
 */
router.get(
  '/search',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  validate(paginationSchema, 'query'),
  TenantController.searchTenants
);

/**
 * GET /api/tenants/:tenantId
 * Get tenant by ID
 */
router.get('/:tenantId', authenticate, TenantController.getTenantById);

/**
 * GET /api/tenants/slug/:slug
 * Get tenant by slug
 */
router.get('/slug/:slug', authenticate, TenantController.getTenantBySlug);

/**
 * GET /api/tenants/:tenantId/stats
 * Get tenant statistics
 */
router.get('/:tenantId/stats', authenticate, TenantController.getTenantStats);

/**
 * PUT /api/tenants/:tenantId
 * Update tenant (admin only)
 */
router.put(
  '/:tenantId',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validate(updateTenantSchema, 'body'),
  TenantController.updateTenant
);

/**
 * DELETE /api/tenants/:tenantId
 * Delete tenant (super admin only)
 */
router.delete(
  '/:tenantId',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  TenantController.deleteTenant
);

/**
 * POST /api/tenants/:tenantId/modules/:moduleName/enable
 * Enable module for tenant
 */
router.post(
  '/:tenantId/modules/:moduleName/enable',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  TenantController.enableModule
);

/**
 * POST /api/tenants/:tenantId/modules/:moduleName/disable
 * Disable module for tenant
 */
router.post(
  '/:tenantId/modules/:moduleName/disable',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  TenantController.disableModule
);

/**
 * POST /api/tenants/:tenantId/subscription/upgrade
 * Upgrade tenant subscription
 */
router.post(
  '/:tenantId/subscription/upgrade',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  TenantController.upgradeSubscription
);

export default router;
