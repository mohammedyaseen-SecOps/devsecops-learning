import { DataTypes, Model, Sequelize } from 'sequelize';

/**
 * Tenant model for multi-tenant SaaS
 */
export class Tenant extends Model {
  declare id: string;
  declare name: string;
  declare slug: string;
  declare description: string;
  declare logoUrl: string;
  declare subscriptionPlan: string;
  declare subscriptionStatus: string;
  declare subscriptionExpiresAt: Date;
  declare autoRenew: boolean;
  declare enabledModules: string[];
  declare config: any;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare createdBy: string;
  declare updatedBy: string;
}

export function initializeTenantModel(db: Sequelize) {
  Tenant.init(
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
      },
      logoUrl: {
        type: DataTypes.STRING(500),
        field: 'logo_url',
      },
      subscriptionPlan: {
        type: DataTypes.ENUM('free', 'starter', 'professional', 'enterprise'),
        defaultValue: 'starter',
        field: 'subscription_plan',
      },
      subscriptionStatus: {
        type: DataTypes.ENUM('active', 'trial', 'suspended', 'cancelled', 'expired'),
        defaultValue: 'trial',
        field: 'subscription_status',
      },
      subscriptionExpiresAt: {
        type: DataTypes.DATE,
        field: 'subscription_expires_at',
      },
      autoRenew: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'auto_renew',
      },
      enabledModules: {
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
        field: 'enabled_modules',
      },
      config: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
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
      createdBy: {
        type: DataTypes.UUID,
        field: 'created_by',
      },
      updatedBy: {
        type: DataTypes.UUID,
        field: 'updated_by',
      },
    },
    {
      sequelize: db,
      tableName: 'tenants',
      schema: 'public',
      timestamps: true,
      underscored: true,
      paranoid: false,
      indexes: [
        { fields: ['slug'] },
        { fields: ['subscription_status', 'is_active'] },
      ],
    }
  );

  return Tenant;
}
