import { DataTypes, QueryInterface } from 'sequelize';

/**
 * Migration: 001-Initial-Schema
 * Description: Create initial database schema with master tables
 * Date: 2024-03-26
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // Create Tenants table
    await queryInterface.createTable(
      'tenants',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        slug: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        logo_url: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        subscription_plan: {
          type: DataTypes.ENUM('free', 'starter', 'professional', 'enterprise'),
          defaultValue: 'starter',
        },
        subscription_status: {
          type: DataTypes.ENUM('active', 'trial', 'suspended', 'cancelled', 'expired'),
          defaultValue: 'trial',
        },
        subscription_expires_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        auto_renew: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        enabled_modules: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: [
            'ITAM',
            'ITSM',
            'THREAT_INTEL',
            'USER_MANAGEMENT',
            'TICKETING',
            'RISK_REGISTRY',
            'POLICY_ARCHIVE',
            'INCIDENT_RESPONSE',
            'SECURITY_OPS',
            'VULNERABILITY',
            'THIRD_PARTY_RISK',
            'COMPLIANCE',
          ],
        },
        config: {
          type: DataTypes.JSONB,
          defaultValue: {},
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
        created_by: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        updated_by: {
          type: DataTypes.UUID,
          allowNull: true,
        },
      },
      { transaction }
    );

    // Create indexes for Tenants
    await queryInterface.addIndex('tenants', ['slug'], { transaction });
    await queryInterface.addIndex('tenants', ['subscription_status', 'is_active'], { transaction });

    // Create Permissions table
    await queryInterface.createTable(
      'permissions',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        resource: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        action: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
      },
      {
        transaction,
      }
    );

    // Create unique index on resource+action
    await queryInterface.addIndex('permissions', ['resource', 'action'], {
      unique: true,
      transaction
    });

    // Create Roles table
    await queryInterface.createTable(
      'roles',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        tenant_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        permissions: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: [],
        },
        is_system: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
      },
      { transaction }
    );

    // Create indexes for Roles
    await queryInterface.addIndex('roles', ['tenant_id'], { transaction });
    await queryInterface.addIndex('roles', ['is_system'], { transaction });
    await queryInterface.addIndex('roles', ['tenant_id', 'name'], { unique: true, transaction });

    // Create Users table
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        tenant_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        first_name: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        last_name: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        display_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        password_hash: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        avatar_url: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        role: {
          type: DataTypes.ENUM('super_admin', 'admin', 'manager', 'analyst', 'viewer', 'guest'),
          defaultValue: 'viewer',
        },
        status: {
          type: DataTypes.ENUM('active', 'inactive', 'suspended', 'deactivated'),
          defaultValue: 'active',
        },
        last_login_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        password_reset_token: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        password_reset_expires_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        email_verified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        email_verified_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        two_factor_enabled: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
      },
      { transaction }
    );

    // Create indexes for Users
    await queryInterface.addIndex('users', ['tenant_id', 'email'], { transaction });
    await queryInterface.addIndex('users', ['status'], { transaction });
    await queryInterface.addIndex('users', ['role'], { transaction });
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('users', { transaction });
    await queryInterface.dropTable('roles', { transaction });
    await queryInterface.dropTable('permissions', { transaction });
    await queryInterface.dropTable('tenants', { transaction });
  });
}
