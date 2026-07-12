import { Sequelize } from 'sequelize';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { initializeUserModel, BaseUser } from './User';
import { initializeRoleModel, Role } from './Role';
import { initializePermissionModel, Permission } from './Permission';
import { initializeTenantModel, Tenant } from './Tenant';

/**
 * Database connection instance
 * Using Sequelize ORM for PostgreSQL
 */
export const sequelize = new Sequelize(
  config.database.dbName,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    logging: config.database.logging ? (msg) => logger.debug(msg) : false,
    pool: config.database.pool,
    ssl: config.database.ssl,
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
    },
    dialectOptions: config.database.ssl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false, // For self-signed certificates
          },
        }
      : undefined,
  }
);

// Initialize models
initializeUserModel(sequelize);
initializeRoleModel(sequelize);
initializePermissionModel(sequelize);
initializeTenantModel(sequelize);

// Define associations
export const defineAssociations = () => {
  // Tenant has many Users
  Tenant.hasMany(BaseUser, {
    foreignKey: 'tenantId',
    as: 'users',
    onDelete: 'CASCADE',
  });

  // Tenant has many Roles
  Tenant.hasMany(Role, {
    foreignKey: 'tenantId',
    as: 'roles',
    onDelete: 'CASCADE',
  });

  // User belongs to Tenant
  BaseUser.belongsTo(Tenant, {
    foreignKey: 'tenantId',
    as: 'tenant',
  });

  // Role belongs to Tenant (optional, for tenant-specific roles)
  Role.belongsTo(Tenant, {
    foreignKey: 'tenantId',
    as: 'tenant',
  });

  logger.debug('✓ Database associations defined');
};

// Sync database (development only, use migrations in production)
export const syncDatabase = async (alter: boolean = false) => {
  try {
    await sequelize.sync({ alter });
    logger.info('✓ Database synchronized');
  } catch (error) {
    logger.error('✗ Database synchronization failed', { error });
    throw error;
  }
};

// Test connection
sequelize.authenticate()
  .then(() => {
    logger.info('✓ Database connection established successfully');
    defineAssociations();
  })
  .catch((error) => {
    logger.error('✗ Database connection failed', { error });
  });

// Graceful disconnect
process.on('SIGTERM', async () => {
  await sequelize.close();
  logger.info('Database connection closed');
});

// Export models
export {
  BaseUser as User,
  Role,
  Permission,
  Tenant,
};

export default sequelize;
