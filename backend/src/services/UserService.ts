import { User } from '@/models';
import { PasswordUtil } from '@/utils/password';
import { ValidationError, NotFoundError, ConflictError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { CreateUserRequest, UpdateUserRequest, UserStatus } from '@/types';
import { Op } from 'sequelize';

/**
 * User service layer
 * Business logic for user management
 */
export class UserService {
  /**
   * Get all users (with pagination)
   */
  static async getUsers(tenantId: string, options: any = {}) {
    try {
      const { page = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = 'DESC' } = options;

      const offset = (page - 1) * pageSize;

      const { count, rows } = await User.findAndCountAll({
        where: { tenantId },
        offset,
        limit: pageSize,
        order: [[sortBy, sortDirection]],
        attributes: {
          exclude: ['password_hash', 'passwordResetToken'],
        },
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
      logger.error('Failed to get users', { error });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string, tenantId: string) {
    try {
      const user = await User.findOne({
        where: { id: userId, tenantId },
        attributes: {
          exclude: ['password_hash', 'passwordResetToken'],
        },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      return user;
    } catch (error) {
      logger.error('Failed to get user', { error });
      throw error;
    }
  }

  /**
   * Create new user
   */
  static async createUser(tenantId: string, userData: CreateUserRequest) {
    try {
      // Validate input
      if (!userData.email) {
        throw new ValidationError('Email is required');
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email: userData.email, tenantId },
      });

      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Generate password if not provided
      let passwordHash: string | null = null;
      if (userData.password) {
        const strength = PasswordUtil.validateStrength(userData.password);
        if (!strength.valid) {
          throw new ValidationError('Password does not meet requirements', {
            errors: strength.errors,
          });
        }
        passwordHash = await PasswordUtil.hash(userData.password);
      } else {
        // Generate temporary password
        const tempPassword = PasswordUtil.generateRandom();
        passwordHash = await PasswordUtil.hash(tempPassword);
        logger.info('Generated temporary password for user', { email: userData.email });
        // TODO: Send password via email
      }

      // Create user
      const user = await User.create({
        tenantId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.firstName || userData.lastName 
          ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
          : userData.email,
        password_hash: passwordHash,
        role: userData.role,
        status: UserStatus.ACTIVE,
      });

      logger.info('✓ User created successfully', { userId: user.id, email: user.email });

      return {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      };
    } catch (error) {
      logger.error('Failed to create user', { error });
      throw error;
    }
  }

  /**
   * Update user
   */
  static async updateUser(userId: string, tenantId: string, updates: UpdateUserRequest) {
    try {
      const user = await User.findOne({
        where: { id: userId, tenantId },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Update fields
      if (updates.firstName !== undefined) user.firstName = updates.firstName;
      if (updates.lastName !== undefined) user.lastName = updates.lastName;
      if (updates.role !== undefined) user.role = updates.role;
      if (updates.status !== undefined) user.status = updates.status;

      // Update display name if name changed
      if (updates.firstName !== undefined || updates.lastName !== undefined) {
        user.displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
      }

      await user.save();

      logger.info('✓ User updated successfully', { userId: user.id });

      return {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error('Failed to update user', { error });
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string, tenantId: string) {
    try {
      const user = await User.findOne({
        where: { id: userId, tenantId },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Prevent deleting last admin
      if (user.role === 'admin') {
        const adminCount = await User.count({
          where: { tenantId, role: 'admin' },
        });

        if (adminCount <= 1) {
          throw new ValidationError('Cannot delete the last admin user');
        }
      }

      await user.destroy();

      logger.info('✓ User deleted successfully', { userId });

      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Failed to delete user', { error });
      throw error;
    }
  }

  /**
   * Search users
   */
  static async searchUsers(tenantId: string, query: string, options: any = {}) {
    try {
      const { page = 1, pageSize = 10 } = options;
      const offset = (page - 1) * pageSize;

      const { count, rows } = await User.findAndCountAll({
        where: {
          tenantId,
          [Op.or]: [
            { email: { [Op.iLike]: `%${query}%` } },
            { firstName: { [Op.iLike]: `%${query}%` } },
            { lastName: { [Op.iLike]: `%${query}%` } },
            { displayName: { [Op.iLike]: `%${query}%` } },
          ],
        },
        offset,
        limit: pageSize,
        order: [['createdAt', 'DESC']],
        attributes: {
          exclude: ['password_hash', 'passwordResetToken'],
        },
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
      logger.error('Failed to search users', { error });
      throw error;
    }
  }

  /**
   * Get user with tenant info
   */
  static async getUserWithTenant(userId: string, tenantId: string) {
    try {
      const user = await User.findOne({
        where: { id: userId, tenantId },
        include: [
          {
            association: 'tenant',
            attributes: ['id', 'name', 'slug'],
          },
        ],
        attributes: {
          exclude: ['password_hash', 'passwordResetToken'],
        },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      return user;
    } catch (error) {
      logger.error('Failed to get user with tenant', { error });
      throw error;
    }
  }

  /**
   * Change user status
   */
  static async changeUserStatus(userId: string, tenantId: string, newStatus: UserStatus) {
    try {
      const user = await User.findOne({
        where: { id: userId, tenantId },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      user.status = newStatus;
      await user.save();

      logger.info('✓ User status changed', { userId, status: newStatus });

      return user;
    } catch (error) {
      logger.error('Failed to change user status', { error });
      throw error;
    }
  }

  /**
   * Get user count by role
   */
  static async getUserCountByRole(tenantId: string) {
    try {
      const counts = await User.findAll({
        where: { tenantId },
        attributes: ['role', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
        raw: true,
        group: ['role'],
      });

      return counts;
    } catch (error) {
      logger.error('Failed to get user count by role', { error });
      throw error;
    }
  }
}

export default UserService;
