import { DataTypes, Model, Sequelize } from 'sequelize';

/**
 * Base User model
 * Inherits by User models in each tenant schema
 */
export class BaseUser extends Model {
  declare id: string;
  declare tenantId: string;
  declare email: string;
  declare firstName: string;
  declare lastName: string;
  declare displayName: string;
  declare password_hash: string;
  declare avatarUrl: string;
  declare role: string;
  declare status: string;
  declare lastLoginAt: Date;
  declare passwordResetToken: string;
  declare passwordResetExpiresAt: Date;
  declare emailVerified: boolean;
  declare emailVerifiedAt: Date;
  declare twoFactorEnabled: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initializeUserModel(db: Sequelize) {
  BaseUser.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'tenant_id',
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        field: 'first_name',
      },
      lastName: {
        type: DataTypes.STRING(100),
        field: 'last_name',
      },
      displayName: {
        type: DataTypes.STRING(255),
        field: 'display_name',
      },
      password_hash: {
        type: DataTypes.STRING(255),
        field: 'password_hash',
      },
      avatarUrl: {
        type: DataTypes.STRING(500),
        field: 'avatar_url',
      },
      role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'manager', 'analyst', 'viewer', 'guest'),
        defaultValue: 'viewer',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'deactivated'),
        defaultValue: 'active',
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        field: 'last_login_at',
      },
      passwordResetToken: {
        type: DataTypes.STRING(255),
        field: 'password_reset_token',
      },
      passwordResetExpiresAt: {
        type: DataTypes.DATE,
        field: 'password_reset_expires_at',
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'email_verified',
      },
      emailVerifiedAt: {
        type: DataTypes.DATE,
        field: 'email_verified_at',
      },
      twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'two_factor_enabled',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize: db,
      tableName: 'users',
      schema: 'public',
      timestamps: true,
      underscored: true,
      paranoid: false,
      indexes: [
        { fields: ['tenant_id', 'email'] },
        { fields: ['status'] },
        { fields: ['role'] },
      ],
    }
  );

  return BaseUser;
}
