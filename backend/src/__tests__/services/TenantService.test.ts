import TenantService from '@/services/TenantService';
import { Tenant, User, Role } from '@/models';
import { ValidationError, NotFoundError, ConflictError } from '@/middleware/errorHandler';
import DatabaseUtil from '@/utils/database';
import * as logger from '@/utils/logger';

// Mock dependencies
jest.mock('@/models');
jest.mock('@/utils/database');
jest.mock('@/utils/logger');

describe('TenantService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTenants', () => {
    it('should return paginated tenants', async () => {
      const mockTenants = [
        {
          id: '1',
          name: 'Acme Corp',
          slug: 'acme-corp',
        },
        {
          id: '2',
          name: 'Tech Inc',
          slug: 'tech-inc',
        },
      ];

      (Tenant.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockTenants,
      });

      const result = await TenantService.getTenants({
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toEqual(mockTenants);
      expect(result.meta.total).toBe(2);
      expect(Tenant.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
    });

    it('should filter by subscription status', async () => {
      (Tenant.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: [{ subscriptionStatus: 'active' }],
      });

      await TenantService.getTenants({
        page: 1,
        pageSize: 10,
        status: 'active',
      });

      expect(Tenant.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            subscriptionStatus: 'active',
          }),
        })
      );
    });
  });

  describe('getTenantById', () => {
    it('should return tenant when found', async () => {
      const mockTenant = {
        id: '1',
        name: 'Acme Corp',
        slug: 'acme-corp',
      };

      (Tenant.findByPk as jest.Mock).mockResolvedValue(mockTenant);

      const result = await TenantService.getTenantById('1');

      expect(result).toEqual(mockTenant);
      expect(Tenant.findByPk).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundError when tenant not found', async () => {
      (Tenant.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(TenantService.getTenantById('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getTenantBySlug', () => {
    it('should return tenant when found by slug', async () => {
      const mockTenant = {
        id: '1',
        name: 'Acme Corp',
        slug: 'acme-corp',
      };

      (Tenant.findOne as jest.Mock).mockResolvedValue(mockTenant);

      const result = await TenantService.getTenantBySlug('acme-corp');

      expect(result).toEqual(mockTenant);
      expect(Tenant.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'acme-corp' },
        })
      );
    });

    it('should throw NotFoundError when slug not found', async () => {
      (Tenant.findOne as jest.Mock).mockResolvedValue(null);

      await expect(TenantService.getTenantBySlug('invalid-slug')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('createTenant', () => {
    it('should create tenant successfully', async () => {
      const tenantData = {
        name: 'New Company',
        slug: 'new-company',
        description: 'A new company',
      };

      (Tenant.findOne as jest.Mock).mockResolvedValue(null); // Slug doesn't exist
      (Tenant.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...tenantData,
        subscriptionStatus: 'trial',
      });

      (DatabaseUtil.createTenantSchema as jest.Mock).mockResolvedValue(true);

      const result = await TenantService.createTenant(tenantData, 'user-1');

      expect(Tenant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: tenantData.name,
          slug: tenantData.slug,
          subscriptionPlan: 'starter',
          subscriptionStatus: 'trial',
        })
      );
      expect(result.id).toBe('1');
    });

    it('should throw ValidationError if name or slug is missing', async () => {
      const tenantData = {
        name: 'New Company',
        // slug missing
      };

      await expect(TenantService.createTenant(tenantData, 'user-1')).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ConflictError if slug already exists', async () => {
      const tenantData = {
        name: 'New Company',
        slug: 'existing-slug',
      };

      (Tenant.findOne as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(TenantService.createTenant(tenantData, 'user-1')).rejects.toThrow(
        ConflictError
      );
    });

    it('should throw ValidationError if slug format is invalid', async () => {
      const tenantData = {
        name: 'New Company',
        slug: 'Invalid_Slug!', // Invalid format
      };

      (Tenant.findOne as jest.Mock).mockResolvedValue(null);

      await expect(TenantService.createTenant(tenantData, 'user-1')).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('updateTenant', () => {
    it('should update tenant successfully', async () => {
      const tenant = {
        id: '1',
        name: 'Old Name',
        slug: 'slug',
        description: '',
        save: jest.fn().mockResolvedValue(true),
      };

      (Tenant.findByPk as jest.Mock).mockResolvedValue(tenant);

      const updates = {
        name: 'New Name',
        description: 'New description',
      };

      await TenantService.updateTenant('1', updates, 'user-1');

      expect(tenant.name).toBe('New Name');
      expect(tenant.description).toBe('New description');
      expect(tenant.save).toHaveBeenCalled();
    });

    it('should prevent slug changes', async () => {
      const tenant = {
        id: '1',
        slug: 'original-slug',
      };

      (Tenant.findByPk as jest.Mock).mockResolvedValue(tenant);

      await expect(
        TenantService.updateTenant('1', { slug: 'new-slug' }, 'user-1')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if tenant not found', async () => {
      (Tenant.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        TenantService.updateTenant('999', { name: 'Test' }, 'user-1')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteTenant', () => {
    it('should deactivate tenant when no users exist', async () => {
      const tenant = {
        id: '1',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      };

      (Tenant.findByPk as jest.Mock).mockResolvedValue(tenant);
      (User.count as jest.Mock).mockResolvedValue(0);
      (DatabaseUtil.dropTenantSchema as jest.Mock).mockResolvedValue(true);

      const result = await TenantService.deleteTenant('1');

      expect(tenant.isActive).toBe(false);
      expect(tenant.save).toHaveBeenCalled();
      expect(result.message).toBe('Tenant deactivated successfully');
    });

    it('should throw ValidationError if tenant has active users', async () => {
      const tenant = {
        id: '1',
      };

      (Tenant.findByPk as jest.Mock).mockResolvedValue(tenant);
      (User.count as jest.Mock).mockResolvedValue(5); // Has users

      await expect(TenantService.deleteTenant('1')).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if tenant not found', async () => {
      (Tenant.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(TenantService.deleteTenant('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('enableModule', () => {
    it('should enable module for tenant', async () => {
      const tenant = {
        id: '1',
        enabledModules: ['itam'],
        save: jest.fn().mockResolvedValue(true),
      };

      (Tenant.findByPk as jest.Mock).mockResolvedValue(tenant);

      const result = await TenantService.enableModule('1', 'itsm');

      expect(tenant.enabledModules).toContain('itsm');
      expect(tenant.save).toHaveBeenCalled();
    });

    it('should not add duplicate module', async () => {
      const tenant = {
        id: '1',
        enabledModules: ['itam'],
        save: jest.fn().mockResolvedValue(true),
      };

      (Tenant.findByPk as jest.Mock).mockResolvedValue(tenant);

      await TenantService.enableModule('1', 'itam');

      expect(tenant.enabledModules.filter((m: string) => m === 'itam').length).toBe(1);
    });

    it('should throw NotFoundError if tenant not found', async () => {
      (Tenant.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(TenantService.enableModule('999', 'itam')).rejects.toThrow(NotFoundError);
    });
  });

  describe('disableModule', () => {
    it('should disable module for tenant', async () => {
      const tenant = {
        id: '1',
        enabledModules: ['itam', 'itsm'],
        save: jest.fn().mockResolvedValue(true),
      };

      (Tenant.findByPk as jest.Mock).mockResolvedValue(tenant);

      await TenantService.disableModule('1', 'itam');

      expect(tenant.enabledModules).not.toContain('itam');
      expect(tenant.enabledModules).toContain('itsm');
      expect(tenant.save).toHaveBeenCalled();
    });

    it('should throw NotFoundError if tenant not found', async () => {
      (Tenant.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(TenantService.disableModule('999', 'itam')).rejects.toThrow(NotFoundError);
    });
  });

  describe('upgradeSubscription', () => {
    it('should upgrade tenant subscription', async () => {
      const tenant = {
        id: '1',
        subscriptionPlan: 'starter',
        subscriptionStatus: 'trial',
        subscriptionExpiresAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      (Tenant.findByPk as jest.Mock).mockResolvedValue(tenant);

      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      await TenantService.upgradeSubscription('1', 'professional', expiresAt);

      expect(tenant.subscriptionPlan).toBe('professional');
      expect(tenant.subscriptionStatus).toBe('active');
      expect(tenant.save).toHaveBeenCalled();
    });

    it('should throw NotFoundError if tenant not found', async () => {
      (Tenant.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        TenantService.upgradeSubscription('999', 'professional', new Date())
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getTenantStats', () => {
    it('should return tenant statistics', async () => {
      const tenant = {
        id: '1',
        name: 'Test Tenant',
        subscriptionPlan: 'starter',
        subscriptionStatus: 'active',
        enabledModules: ['itam', 'itsm'],
        createdAt: new Date(),
      };

      (Tenant.findByPk as jest.Mock).mockResolvedValue(tenant);
      (User.count as jest.Mock).mockResolvedValue(10);
      (Role.count as jest.Mock).mockResolvedValue(3);
      (User.findAll as jest.Mock).mockResolvedValue([
        { role: 'admin', count: 2 },
        { role: 'user', count: 8 },
      ]);

      const result = await TenantService.getTenantStats('1');

      expect(result.tenantId).toBe('1');
      expect(result.userCount).toBe(10);
      expect(result.roleCount).toBe(3);
      expect(result.enabledModules).toEqual(['itam', 'itsm']);
    });

    it('should throw NotFoundError if tenant not found', async () => {
      (Tenant.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(TenantService.getTenantStats('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('searchTenants', () => {
    it('should search tenants by name or slug', async () => {
      const mockTenants = [
        { id: '1', name: 'Acme Corp', slug: 'acme-corp' },
      ];

      (Tenant.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockTenants,
      });

      const result = await TenantService.searchTenants('acme', {
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toEqual(mockTenants);
      expect(Tenant.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
        })
      );
    });
  });
});
