import { Role, Permission } from '@/models';
import { ValidationError, NotFoundError, ConflictError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

/**
 * Role service layer
 * Business logic for role management
 */
export class RoleService {
  /**
   * Get all roles
   */
  static async getRoles(
    tenantId: string | null = null,
    options: any = {}
  ) {
    try {
      const { page = 1, pageSize = 10, includeSystem = true } = options;
      const offset = (page - 1) * pageSize;

      const where: any = {};
      if (tenantId) {
        where.tenantId = tenantId;
      } else if (!includeSystem) {
        where.isSystem = false;
      }

      const { count, rows } = await Role.findAndCountAll({
        where,
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
          hasNextPage: page < Math.ceil(count / pageSize),
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      logger.error('Failed to get roles', { error });
      throw error;
    }
  }

  /**
   * Get role by ID
   */
  static async getRoleById(roleId: string) {
    try {
      const role = await Role.findByPk(roleId);

      if (!role) {
        throw new NotFoundError('Role');
      }

      return role;
    } catch (error) {
      logger.error('Failed to get role', { error });
      throw error;
    }
  }

  /**
   * Create new role
   */
  static async createRole(
    tenantId: string | null,
    roleData: { name: string; description?: string; permissions?: string[] }
  ) {
    try {
      if (!roleData.name) {
        throw new ValidationError('Role name is required');
      }

      // Check if role already exists
      const existingRole = await Role.findOne({
        where: { name: roleData.name, tenantId },
      });

      if (existingRole) {
        throw new ConflictError('Role with this name already exists');
      }

      // Validate permissions if provided
      if (roleData.permissions && roleData.permissions.length > 0) {
        const invalidPermissions = await this.validatePermissions(roleData.permissions);
        if (invalidPermissions.length > 0) {
          throw new ValidationError('Invalid permissions', { invalid: invalidPermissions });
        }
      }

      // Create role
      const role = await Role.create({
        tenantId,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions || [],
        isSystem: false,
      });

      logger.info('✓ Role created successfully', { roleId: role.id, name: role.name });

      return role;
    } catch (error) {
      logger.error('Failed to create role', { error });
      throw error;
    }
  }

  /**
   * Update role
   */
  static async updateRole(
    roleId: string,
    updates: { name?: string; description?: string; permissions?: string[] }
  ) {
    try {
      const role = await Role.findByPk(roleId);

      if (!role) {
        throw new NotFoundError('Role');
      }

      // Prevent updating system roles
      if (role.isSystem) {
        throw new ValidationError('Cannot modify system roles');
      }

      // Check if new name already exists
      if (updates.name && updates.name !== role.name) {
        const existingRole = await Role.findOne({
          where: { name: updates.name, tenantId: role.tenantId },
        });

        if (existingRole) {
          throw new ConflictError('Role with this name already exists');
        }
      }

      // Validate permissions if provided
      if (updates.permissions && updates.permissions.length > 0) {
        const invalidPermissions = await this.validatePermissions(updates.permissions);
        if (invalidPermissions.length > 0) {
          throw new ValidationError('Invalid permissions', { invalid: invalidPermissions });
        }
      }

      // Update fields
      if (updates.name) role.name = updates.name;
      if (updates.description !== undefined) role.description = updates.description;
      if (updates.permissions) role.permissions = updates.permissions;

      await role.save();

      logger.info('✓ Role updated successfully', { roleId: role.id });

      return role;
    } catch (error) {
      logger.error('Failed to update role', { error });
      throw error;
    }
  }

  /**
   * Delete role
   */
  static async deleteRole(roleId: string) {
    try {
      const role = await Role.findByPk(roleId);

      if (!role) {
        throw new NotFoundError('Role');
      }

      // Prevent deleting system roles
      if (role.isSystem) {
        throw new ValidationError('Cannot delete system roles');
      }

      await role.destroy();

      logger.info('✓ Role deleted successfully', { roleId });

      return { message: 'Role deleted successfully' };
    } catch (error) {
      logger.error('Failed to delete role', { error });
      throw error;
    }
  }

  /**
   * Add permission to role
   */
  static async addPermissionToRole(roleId: string, permissionKey: string) {
    try {
      const role = await Role.findByPk(roleId);

      if (!role) {
        throw new NotFoundError('Role');
      }

      if (role.isSystem) {
        throw new ValidationError('Cannot modify system roles');
      }

      // Validate permission format
      const [resource, action] = permissionKey.split(':');
      if (!resource || !action) {
        throw new ValidationError('Invalid permission format. Use "resource:action"');
      }

      // Check if permission exists
      const permission = await Permission.findOne({
        where: { resource, action },
      });

      if (!permission) {
        throw new NotFoundError('Permission');
      }

      // Add permission if not already present
      const permissions = role.permissions || [];
      if (!permissions.includes(permissionKey)) {
        permissions.push(permissionKey);
        role.permissions = permissions;
        await role.save();
      }

      logger.info('✓ Permission added to role', { roleId, permission: permissionKey });

      return role;
    } catch (error) {
      logger.error('Failed to add permission to role', { error });
      throw error;
    }
  }

  /**
   * Remove permission from role
   */
  static async removePermissionFromRole(roleId: string, permissionKey: string) {
    try {
      const role = await Role.findByPk(roleId);

      if (!role) {
        throw new NotFoundError('Role');
      }

      if (role.isSystem) {
        throw new ValidationError('Cannot modify system roles');
      }

      const permissions = role.permissions || [];
      const updatedPermissions = permissions.filter(p => p !== permissionKey);

      if (updatedPermissions.length !== permissions.length) {
        role.permissions = updatedPermissions;
        await role.save();
      }

      logger.info('✓ Permission removed from role', { roleId, permission: permissionKey });

      return role;
    } catch (error) {
      logger.error('Failed to remove permission from role', { error });
      throw error;
    }
  }

  /**
   * Validate permissions exist
   */
  private static async validatePermissions(permissionKeys: string[]): Promise<string[]> {
    try {
      const invalid: string[] = [];

      for (const key of permissionKeys) {
        const [resource, action] = key.split(':');
        const permission = await Permission.findOne({
          where: { resource, action },
        });

        if (!permission) {
          invalid.push(key);
        }
      }

      return invalid;
    } catch (error) {
      logger.error('Failed to validate permissions', { error });
      return permissionKeys; // Return all as invalid on error
    }
  }

  /**
   * Get all available permissions
   */
  static async getAvailablePermissions() {
    try {
      const permissions = await Permission.findAll({
        order: [['resource', 'ASC'], ['action', 'ASC']],
      });

      const grouped: Record<string, string[]> = {};
      permissions.forEach(p => {
        if (!grouped[p.resource]) {
          grouped[p.resource] = [];
        }
        grouped[p.resource].push(p.action);
      });

      return grouped;
    } catch (error) {
      logger.error('Failed to get available permissions', { error });
      throw error;
    }
  }

  /**
   * Clone role with new name
   */
  static async cloneRole(roleId: string, newName: string, tenantId: string) {
    try {
      const role = await Role.findByPk(roleId);

      if (!role) {
        throw new NotFoundError('Role');
      }

      // Verify role belongs to tenant
      if (role.tenantId !== tenantId) {
        throw new ValidationError('Role does not belong to this tenant');
      }

      // Check if new name exists
      const existingRole = await Role.findOne({
        where: { name: newName, tenantId },
      });

      if (existingRole) {
        throw new ConflictError('Role with this name already exists');
      }

      // Create cloned role
      const cloned = await Role.create({
        tenantId,
        name: newName,
        description: `Clone of ${role.name}`,
        permissions: [...(role.permissions || [])],
        isSystem: false,
      });

      logger.info('✓ Role cloned successfully', {
        sourceRoleId: roleId,
        newRoleId: cloned.id,
      });

      return cloned;
    } catch (error) {
      logger.error('Failed to clone role', { error });
      throw error;
    }
  }
}

export default RoleService;
