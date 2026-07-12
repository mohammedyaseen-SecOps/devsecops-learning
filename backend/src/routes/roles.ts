import { Router } from 'express';
import RoleController from '@/controllers/RoleController';
import { authenticate } from '@/middleware/authentication';
import { checkPermission } from '@/middleware/rbac';
import { validate } from '@/utils/validation';
import {
  createRoleSchema,
  updateRoleSchema,
} from '@/utils/validation';

const router = Router();

/**
 * GET /api/roles
 * Get all roles in tenant
 */
router.get('/', authenticate, checkPermission('roles:read'), RoleController.getRoles);

/**
 * POST /api/roles
 * Create new role
 */
router.post(
  '/',
  authenticate,
  checkPermission('roles:create'),
  validate(createRoleSchema, 'body'),
  RoleController.createRole
);

/**
 * GET /api/roles/available-permissions
 * Get all available permissions
 */
router.get(
  '/available-permissions',
  authenticate,
  checkPermission('roles:read'),
  RoleController.getAvailablePermissions
);

/**
 * GET /api/roles/:roleId
 * Get role by ID
 */
router.get('/:roleId', authenticate, checkPermission('roles:read'), RoleController.getRoleById);

/**
 * PUT /api/roles/:roleId
 * Update role
 */
router.put(
  '/:roleId',
  authenticate,
  checkPermission('roles:update'),
  validate(updateRoleSchema, 'body'),
  RoleController.updateRole
);

/**
 * DELETE /api/roles/:roleId
 * Delete role
 */
router.delete(
  '/:roleId',
  authenticate,
  checkPermission('roles:delete'),
  RoleController.deleteRole
);

/**
 * POST /api/roles/:roleId/permissions
 * Add permission to role
 */
router.post(
  '/:roleId/permissions',
  authenticate,
  checkPermission('roles:update'),
  RoleController.addPermissionToRole
);

/**
 * DELETE /api/roles/:roleId/permissions/:permissionKey
 * Remove permission from role
 */
router.delete(
  '/:roleId/permissions/:permissionKey',
  authenticate,
  checkPermission('roles:update'),
  RoleController.removePermissionFromRole
);

/**
 * POST /api/roles/:roleId/clone
 * Clone role with new name
 */
router.post(
  '/:roleId/clone',
  authenticate,
  checkPermission('roles:create'),
  RoleController.cloneRole
);

export default router;
