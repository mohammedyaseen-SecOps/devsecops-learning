import RoleService from '@/services/RoleService';
import { Role, Permission } from '@/models';
import { ValidationError, NotFoundError, ConflictError } from '@/middleware/errorHandler';
import * as logger from '@/utils/logger';

// Mock dependencies
jest.mock('@/models');
jest.mock('@/utils/logger');

describe('RoleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRoles', () => {
    it('should return paginated roles for tenant', async () => {
      const mockRoles = [
        {
          id: '1',
          name: 'admin',
          tenantId: 'tenant-1',
          isSystem: false,
        },
        {
          id: '2',
          name: 'user',
          tenantId: 'tenant-1',
          isSystem: false,
        },
      ];

      (Role.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockRoles,
      });

      const result = await RoleService.getRoles('tenant-1', {
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toEqual(mockRoles);
      expect(result.meta.total).toBe(2);
      expect(Role.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        })
      );
    });

    it('should filter system roles when requested', async () => {
      const mockRoles = [];

      (Role.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 0,
        rows: mockRoles,
      });

      await RoleService.getRoles('tenant-1', {
        page: 1,
        pageSize: 10,
        isSystem: false,
      });

      expect(Role.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            isSystem: false,
          }),
        })
      );
    });
  });

  describe('getRoleById', () => {
    it('should return role when found', async () => {
      const mockRole = {
        id: '1',
        name: 'admin',
        permissions: ['users:read', 'users:create'],
      };

      (Role.findByPk as jest.Mock).mockResolvedValue(mockRole);

      const result = await RoleService.getRoleById('1');

      expect(result).toEqual(mockRole);
      expect(Role.findByPk).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundError when role not found', async () => {
      (Role.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(RoleService.getRoleById('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createRole', () => {
    it('should create role successfully with valid permissions', async () => {
      const roleData = {
        name: 'editor',
        description: 'Can edit content',
        permissions: ['users:read', 'users:update'],
      };

      const mockPermissions = [
        { id: '1', key: 'users:read' },
        { id: '2', key: 'users:update' },
      ];

      (Permission.findAll as jest.Mock).mockResolvedValue(mockPermissions);
      (Role.findOne as jest.Mock).mockResolvedValue(null); // No duplicate

      const mockCreatedRole = {
        id: '1',
        tenantId: 'tenant-1',
        ...roleData,
        isSystem: false,
      };

      (Role.create as jest.Mock).mockResolvedValue(mockCreatedRole);

      const result = await RoleService.createRole('tenant-1', roleData);

      expect(Role.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-1',
          name: roleData.name,
          permissions: roleData.permissions,
        })
      );
      expect(result.id).toBe('1');
    });

    it('should throw ValidationError if name is missing', async () => {
      const roleData = {
        description: 'Test role',
        permissions: [],
      };

      await expect(RoleService.createRole('tenant-1', roleData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ConflictError if role name already exists', async () => {
      const roleData = {
        name: 'existing_role',
        permissions: [],
      };

      (Role.findOne as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(RoleService.createRole('tenant-1', roleData)).rejects.toThrow(
        ConflictError
      );
    });
  });

  describe('updateRole', () => {
    it('should update role with provided fields', async () => {
      const role = {
        id: '1',
        name: 'editor',
        description: 'Old description',
        isSystem: false,
        save: jest.fn().mockResolvedValue(true),
      };

      (Role.findByPk as jest.Mock).mockResolvedValue(role);

      const updates = {
        description: 'New description',
      };

      await RoleService.updateRole('1', updates);

      expect(role.description).toBe('New description');
      expect(role.save).toHaveBeenCalled();
    });

    it('should throw ValidationError if trying to update system role', async () => {
      const role = {
        id: '1',
        name: 'admin',
        isSystem: true,
      };

      (Role.findByPk as jest.Mock).mockResolvedValue(role);

      await expect(RoleService.updateRole('1', { name: 'new_admin' })).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw NotFoundError if role not found', async () => {
      (Role.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(RoleService.updateRole('999', { name: 'test' })).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('deleteRole', () => {
    it('should delete custom role successfully', async () => {
      const role = {
        id: '1',
        name: 'custom_role',
        isSystem: false,
      };

      (Role.findByPk as jest.Mock).mockResolvedValue(role);

      await RoleService.deleteRole('1');

      expect(Role.destroy).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw ValidationError if trying to delete system role', async () => {
      const role = {
        id: '1',
        name: 'admin',
        isSystem: true,
      };

      (Role.findByPk as jest.Mock).mockResolvedValue(role);

      await expect(RoleService.deleteRole('1')).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if role not found', async () => {
      (Role.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(RoleService.deleteRole('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('addPermissionToRole', () => {
    it('should add permission to role successfully', async () => {
      const role = {
        id: '1',
        permissions: ['users:read'],
        save: jest.fn().mockResolvedValue(true),
      };

      (Role.findByPk as jest.Mock).mockResolvedValue(role);
      (Permission.findOne as jest.Mock).mockResolvedValue({ id: '2', key: 'users:create' });

      await RoleService.addPermissionToRole('1', 'users:create');

      expect(role.permissions).toContain('users:create');
      expect(role.save).toHaveBeenCalled();
    });

    it('should throw ValidationError if permission does not exist', async () => {
      const role = {
        id: '1',
        permissions: [],
      };

      (Role.findByPk as jest.Mock).mockResolvedValue(role);
      (Permission.findOne as jest.Mock).mockResolvedValue(null);

      await expect(RoleService.addPermissionToRole('1', 'invalid:permission')).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw NotFoundError if role not found', async () => {
      (Role.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(RoleService.addPermissionToRole('999', 'users:read')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('removePermissionFromRole', () => {
    it('should remove permission from role successfully', async () => {
      const role = {
        id: '1',
        permissions: ['users:read', 'users:create'],
        save: jest.fn().mockResolvedValue(true),
      };

      (Role.findByPk as jest.Mock).mockResolvedValue(role);

      await RoleService.removePermissionFromRole('1', 'users:read');

      expect(role.permissions).not.toContain('users:read');
      expect(role.permissions).toContain('users:create');
      expect(role.save).toHaveBeenCalled();
    });

    it('should throw NotFoundError if role not found', async () => {
      (Role.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(RoleService.removePermissionFromRole('999', 'users:read')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getAvailablePermissions', () => {
    it('should return all permissions grouped by resource', async () => {
      const mockPermissions = [
        { id: '1', key: 'users:read', resource: 'users' },
        { id: '2', key: 'users:create', resource: 'users' },
        { id: '3', key: 'roles:read', resource: 'roles' },
      ];

      (Permission.findAll as jest.Mock).mockResolvedValue(mockPermissions);

      const result = await RoleService.getAvailablePermissions();

      expect(result.users).toBeDefined();
      expect(result.roles).toBeDefined();
      expect(result.users).toContain('users:read');
      expect(result.users).toContain('users:create');
    });
  });

  describe('cloneRole', () => {
    it('should clone role with new name successfully', async () => {
      const role = {
        id: '1',
        name: 'original_role',
        tenantId: 'tenant-1',
        permissions: ['users:read', 'users:create'],
      };

      (Role.findByPk as jest.Mock).mockResolvedValue(role);
      (Role.findOne as jest.Mock).mockResolvedValue(null); // New name doesn't exist

      const mockClonedRole = {
        id: '2',
        name: 'cloned_role',
        tenantId: 'tenant-1',
        permissions: ['users:read', 'users:create'],
      };

      (Role.create as jest.Mock).mockResolvedValue(mockClonedRole);

      const result = await RoleService.cloneRole('1', 'cloned_role', 'tenant-1');

      expect(Role.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-1',
          name: 'cloned_role',
          permissions: role.permissions,
        })
      );
      expect(result.id).toBe('2');
    });

    it('should throw ValidationError if role does not belong to tenant', async () => {
      const role = {
        id: '1',
        name: 'role',
        tenantId: 'other-tenant',
      };

      (Role.findByPk as jest.Mock).mockResolvedValue(role);

      await expect(RoleService.cloneRole('1', 'clone', 'tenant-1')).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ConflictError if new name already exists', async () => {
      const role = {
        id: '1',
        name: 'original',
        tenantId: 'tenant-1',
      };

      (Role.findByPk as jest.Mock).mockResolvedValue(role);
      (Role.findOne as jest.Mock).mockResolvedValue({ id: '2', name: 'clone' }); // Name exists

      await expect(RoleService.cloneRole('1', 'clone', 'tenant-1')).rejects.toThrow(
        ConflictError
      );
    });

    it('should throw NotFoundError if role not found', async () => {
      (Role.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(RoleService.cloneRole('999', 'clone', 'tenant-1')).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
