import { Router } from 'express';
import UserController from '@/controllers/UserController';
import { authenticate } from '@/middleware/authentication';
import { checkPermission } from '@/middleware/rbac';
import { validate } from '@/utils/validation';
import {
  paginationSchema,
  createUserSchema,
  updateUserSchema,
} from '@/utils/validation';

const router = Router();

/**
 * GET /api/users
 * Get all users in tenant with pagination
 */
router.get('/', authenticate, checkPermission('users:read'), UserController.getUsers);

/**
 * POST /api/users
 * Create new user in tenant
 */
router.post(
  '/',
  authenticate,
  checkPermission('users:create'),
  validate(createUserSchema, 'body'),
  UserController.createUser
);

/**
 * GET /api/users/search
 * Search users by name/email
 */
router.get(
  '/search',
  authenticate,
  checkPermission('users:read'),
  validate(paginationSchema, 'query'),
  UserController.searchUsers
);

/**
 * GET /api/users/stats/by-role
 * Get user count by role statistics
 */
router.get(
  '/stats/by-role',
  authenticate,
  checkPermission('users:read'),
  UserController.getUserCountByRole
);

/**
 * GET /api/users/:userId
 * Get user by ID
 */
router.get('/:userId', authenticate, checkPermission('users:read'), UserController.getUserById);

/**
 * GET /api/users/:userId/with-tenant
 * Get user with tenant information
 */
router.get(
  '/:userId/with-tenant',
  authenticate,
  checkPermission('users:read'),
  UserController.getUserWithTenant
);

/**
 * PUT /api/users/:userId
 * Update user
 */
router.put(
  '/:userId',
  authenticate,
  checkPermission('users:update'),
  validate(updateUserSchema, 'body'),
  UserController.updateUser
);

/**
 * PATCH /api/users/:userId/status
 * Change user status (active/inactive/suspended)
 */
router.patch(
  '/:userId/status',
  authenticate,
  checkPermission('users:update'),
  UserController.changeUserStatus
);

/**
 * DELETE /api/users/:userId
 * Delete user
 */
router.delete(
  '/:userId',
  authenticate,
  checkPermission('users:delete'),
  UserController.deleteUser
);

export default router;
