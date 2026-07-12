import UserService from '@/services/UserService';
import { User, Tenant, Role } from '@/models';
import { ValidationError, NotFoundError, ConflictError } from '@/middleware/errorHandler';
import { PasswordUtil } from '@/utils/password';
import * as logger from '@/utils/logger';

// Mock dependencies
jest.mock('@/models');
jest.mock('@/utils/logger');
jest.mock('@/utils/password');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return paginated users for tenant', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@test.com',
          firstName: 'User',
          lastName: 'One',
        },
        {
          id: '2',
          email: 'user2@test.com',
          firstName: 'User',
          lastName: 'Two',
        },
      ];

      (User.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockUsers,
      });

      const result = await UserService.getUsers('tenant-1', {
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toEqual(mockUsers);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(User.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
          offset: 0,
          limit: 10,
        })
      );
    });

    it('should handle status filter', async () => {
      (User.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: [{ id: '1', status: 'active' }],
      });

      await UserService.getUsers('tenant-1', {
        page: 1,
        pageSize: 10,
        status: 'active',
      });

      expect(User.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
            tenantId: 'tenant-1',
          }),
        })
      );
    });

    it('should calculate total pages correctly', async () => {
      (User.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 25,
        rows: Array(10).fill({}),
      });

      const result = await UserService.getUsers('tenant-1', {
        page: 1,
        pageSize: 10,
      });

      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        tenantId: 'tenant-1',
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserService.getUserById('1', 'tenant-1');

      expect(result).toEqual(mockUser);
      expect(User.findByPk).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundError when user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(UserService.getUserById('999', 'tenant-1')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('createUser', () => {
    it('should create user successfully with hashed password', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'SecurePassword123!',
        firstName: 'New',
        lastName: 'User',
        role: 'user',
      };

      const hashedPassword = 'hashed_password';
      (PasswordUtil.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const mockCreatedUser = {
        id: '1',
        ...userData,
        passwordHash: hashedPassword,
      };
      (User.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await UserService.createUser('tenant-1', userData);

      expect(PasswordUtil.hash).toHaveBeenCalledWith(userData.password);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email,
          passwordHash: hashedPassword,
          tenantId: 'tenant-1',
        })
      );
      expect(result.id).toBe('1');
    });

    it('should throw ValidationError if email is missing', async () => {
      const userData = {
        password: 'SecurePassword123!',
        firstName: 'New',
        lastName: 'User',
      };

      await expect(UserService.createUser('tenant-1', userData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ConflictError if user email already exists', async () => {
      const userData = {
        email: 'existing@test.com',
        password: 'SecurePassword123!',
      };

      (User.findOne as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(UserService.createUser('tenant-1', userData)).rejects.toThrow(
        ConflictError
      );
    });
  });

  describe('updateUser', () => {
    it('should update user with provided fields', async () => {
      const user = {
        id: '1',
        email: 'user@test.com',
        firstName: 'User',
        lastName: 'One',
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findByPk as jest.Mock).mockResolvedValue(user);

      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      await UserService.updateUser('1', 'tenant-1', updates);

      expect(user.firstName).toBe('Updated');
      expect(user.lastName).toBe('Name');
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw NotFoundError if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        UserService.updateUser('999', 'tenant-1', { firstName: 'Test' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const user = {
        id: '1',
        email: 'user@test.com',
      };

      (User.findByPk as jest.Mock).mockResolvedValue(user);
      (User.count as jest.Mock).mockResolvedValue(2); // Other admins exist

      await UserService.deleteUser('1', 'tenant-1');

      expect(User.destroy).toHaveBeenCalledWith({
        where: { id: '1', tenantId: 'tenant-1' },
      });
    });

    it('should throw ValidationError if last admin would be deleted', async () => {
      // Assume role is admin and it's the last one
      const user = {
        id: '1',
        role: 'admin',
      };

      (User.findByPk as jest.Mock).mockResolvedValue(user);
      (User.count as jest.Mock).mockResolvedValue(1); // Only admin left

      await expect(UserService.deleteUser('1', 'tenant-1')).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw NotFoundError if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(UserService.deleteUser('999', 'tenant-1')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('searchUsers', () => {
    it('should search users by query', async () => {
      const mockUsers = [
        { id: '1', email: 'john@test.com', firstName: 'John' },
        { id: '2', email: 'jane@test.com', firstName: 'Jane' },
      ];

      (User.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockUsers,
      });

      const result = await UserService.searchUsers('tenant-1', 'john', {
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toEqual(mockUsers);
      expect(User.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
        })
      );
    });
  });

  describe('getUserCountByRole', () => {
    it('should return user count by role', async () => {
      const mockStats = [
        { role: 'admin', count: 2 },
        { role: 'user', count: 5 },
      ];

      (User.findAll as jest.Mock).mockResolvedValue(mockStats);

      const result = await UserService.getUserCountByRole('tenant-1');

      expect(result).toEqual(mockStats);
      expect(User.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        })
      );
    });
  });

  describe('changeUserStatus', () => {
    it('should change user status successfully', async () => {
      const user = {
        id: '1',
        status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findByPk as jest.Mock).mockResolvedValue(user);

      await UserService.changeUserStatus('1', 'tenant-1', 'suspended');

      expect(user.status).toBe('suspended');
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw NotFoundError if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        UserService.changeUserStatus('999', 'tenant-1', 'suspended')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
