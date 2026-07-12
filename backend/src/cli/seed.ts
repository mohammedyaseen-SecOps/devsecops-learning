#!/usr/bin/env ts-node
import { Role, Permission, Tenant } from '@/models';
import { logger } from '@/utils/logger';

/**
 * Database seeding CLI utility
 * Seeds initial data like roles, permissions, and default tenants
 */

const seedDatabase = async () => {
  try {
    logger.info('→ Starting database seeding...');

    // Seed system permissions
    const permissionsData = [
      // User management
      { resource: 'users', action: 'create', description: 'Create new users' },
      { resource: 'users', action: 'read', description: 'View user information' },
      { resource: 'users', action: 'update', description: 'Update user information' },
      { resource: 'users', action: 'delete', description: 'Delete users' },

      // Role management
      { resource: 'roles', action: 'create', description: 'Create new roles' },
      { resource: 'roles', action: 'read', description: 'View role information' },
      { resource: 'roles', action: 'update', description: 'Update role information' },
      { resource: 'roles', action: 'delete', description: 'Delete roles' },

      // Tenant management
      { resource: 'tenants', action: 'create', description: 'Create new tenants' },
      { resource: 'tenants', action: 'read', description: 'View tenant information' },
      { resource: 'tenants', action: 'update', description: 'Update tenant configuration' },
      { resource: 'tenants', action: 'delete', description: 'Delete tenants' },

      // Module management
      { resource: 'modules', action: 'read', description: 'View module information' },
      { resource: 'modules', action: 'update', description: 'Update module configuration' },

      // Risk management
      { resource: 'risks', action: 'create', description: 'Create new risks' },
      { resource: 'risks', action: 'read', description: 'View risk information' },
      { resource: 'risks', action: 'update', description: 'Update risk information' },
      { resource: 'risks', action: 'delete', description: 'Delete risks' },

      // Compliance management
      { resource: 'compliance', action: 'create', description: 'Create compliance frameworks' },
      { resource: 'compliance', action: 'read', description: 'View compliance data' },
      { resource: 'compliance', action: 'update', description: 'Update compliance data' },
      { resource: 'compliance', action: 'delete', description: 'Delete compliance data' },

      // Audit logs
      { resource: 'audit', action: 'read', description: 'View audit logs' },
      { resource: 'audit', action: 'export', description: 'Export audit logs' },
    ];

    for (const permission of permissionsData) {
      await Permission.findOrCreate({
        where: { resource: permission.resource, action: permission.action },
        defaults: permission,
      });
    }
    logger.info(`✓ Seeded ${permissionsData.length} permissions`);

    // Seed system roles
    const rolesData = [
      {
        name: 'super_admin',
        description: 'Super Admin - Full platform access',
        isSystem: true,
        tenantId: null,
        permissions: [
          'users:create',
          'users:read',
          'users:update',
          'users:delete',
          'roles:create',
          'roles:read',
          'roles:update',
          'roles:delete',
          'tenants:create',
          'tenants:read',
          'tenants:update',
          'tenants:delete',
          'audit:read',
          'audit:export',
        ],
      },
      {
        name: 'admin',
        description: 'Administrator - Tenant admin access',
        isSystem: true,
        tenantId: null,
        permissions: [
          'users:create',
          'users:read',
          'users:update',
          'users:delete',
          'roles:read',
          'modules:read',
          'modules:update',
          'audit:read',
        ],
      },
      {
        name: 'manager',
        description: 'Manager - Department manager access',
        isSystem: true,
        tenantId: null,
        permissions: [
          'users:read',
          'risks:create',
          'risks:read',
          'risks:update',
          'compliance:read',
          'audit:read',
        ],
      },
      {
        name: 'analyst',
        description: 'Analyst - Data analyst access',
        isSystem: true,
        tenantId: null,
        permissions: [
          'users:read',
          'risks:read',
          'compliance:read',
          'audit:read',
        ],
      },
      {
        name: 'viewer',
        description: 'Viewer - Read-only access',
        isSystem: true,
        tenantId: null,
        permissions: [
          'risks:read',
          'compliance:read',
        ],
      },
      {
        name: 'guest',
        description: 'Guest - Limited view access',
        isSystem: true,
        tenantId: null,
        permissions: [
          'risks:read',
        ],
      },
    ];

    for (const role of rolesData) {
      await Role.findOrCreate({
        where: { name: role.name, tenantId: role.tenantId },
        defaults: role,
      });
    }
    logger.info(`✓ Seeded ${rolesData.length} system roles`);

    // Seed demo tenant (optional, for development)
    if (process.env.NODE_ENV === 'development') {
      const demoTenant = await Tenant.findOrCreate({
        where: { slug: 'demo-tenant' },
        defaults: {
          name: 'Demo Tenant',
          slug: 'demo-tenant',
          description: 'Demo tenant for testing and development',
          subscriptionPlan: 'enterprise',
          subscriptionStatus: 'active',
          isActive: true,
        },
      });

      if (demoTenant[1]) {
        logger.info('✓ Created demo tenant for development');
      } else {
        logger.info('✓ Demo tenant already exists');
      }
    }

    logger.info('✓ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed', { error });
    process.exit(1);
  }
};

// Run seeding only if models are defined
seedDatabase();
