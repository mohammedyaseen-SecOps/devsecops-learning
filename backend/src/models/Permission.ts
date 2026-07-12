import { DataTypes, Model, Sequelize } from 'sequelize';

/**
 * Permission model for RBAC system
 */
export class Permission extends Model {
  declare id: string;
  declare resource: string;
  declare action: string;
  declare description: string;
  declare createdAt: Date;
}

export function initializePermissionModel(db: Sequelize) {
  Permission.init(
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
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    },
    {
      sequelize: db,
      tableName: 'permissions',
      schema: 'public',
      timestamps: false,
      underscored: true,
      paranoid: false,
      indexes: [
        { unique: true, fields: ['resource', 'action'] },
      ],
    }
  );

  return Permission;
}
