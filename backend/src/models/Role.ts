import { DataTypes, Model, Sequelize } from 'sequelize';

/**
 * Role model for RBAC system
 */
export class Role extends Model {
  declare id: string;
  declare tenantId: string;
  declare name: string;
  declare description: string;
  declare permissions: string[];
  declare isSystem: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initializeRoleModel(db: Sequelize) {
  Role.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tenantId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'tenant_id',
        comment: 'NULL for system roles, tenant_id for tenant-specific roles',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      permissions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      isSystem: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_system',
        comment: 'Cannot delete system roles',
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
      tableName: 'roles',
      schema: 'public',
      timestamps: true,
      underscored: true,
      paranoid: false,
      indexes: [
        { fields: ['tenant_id'] },
        { fields: ['is_system'] },
        { unique: true, fields: ['tenant_id', 'name'] },
      ],
    }
  );

  return Role;
}
