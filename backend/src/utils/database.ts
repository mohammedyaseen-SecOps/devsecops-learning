import { QueryTypes } from 'sequelize';
import { logger } from '@/utils/logger';
import sequelize from '@/models';

/**
 * Database utility functions for multi-tenant operations
 */

export class DatabaseUtil {
  /**
   * Execute raw SQL query
   */
  static async executeQuery<T = any>(
    sql: string,
    replacements?: Record<string, any>,
    options?: any
  ): Promise<T[]> {
    try {
      const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        replacements,
        ...options,
      });
      return ((result as unknown) || []) as T[];
    } catch (error) {
      logger.error('Database query failed', { sql, error });
      throw error;
    }
  }

  /**
   * Create tenant-specific schema
   */
  static async createTenantSchema(tenantId: string): Promise<void> {
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    try {
      const queryInterface = sequelize.getQueryInterface();
      
      // Create schema
      await queryInterface.createSchema(schemaName);
      
      // Initialize tenant tables (this would be done by migrations)
      logger.info(`✓ Created tenant schema: ${schemaName}`, { tenantId });
    } catch (error) {
      logger.error('Failed to create tenant schema', { tenantId, error });
      throw error;
    }
  }

  /**
   * Drop tenant-specific schema
   */
  static async dropTenantSchema(tenantId: string): Promise<void> {
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    try {
      const queryInterface = sequelize.getQueryInterface();
      
      // Drop schema (cascade = drop all objects in schema)
      await queryInterface.dropSchema(schemaName, { force: true } as any);
      
      logger.info(`✓ Dropped tenant schema: ${schemaName}`, { tenantId });
    } catch (error) {
      logger.error('Failed to drop tenant schema', { tenantId, error });
      throw error;
    }
  }

  /**
   * Check if schema exists
   */
  static async schemaExists(schemaName: string): Promise<boolean> {
    try {
      const result = await this.executeQuery<{ exists: boolean }>(
        `SELECT EXISTS (
          SELECT 1 FROM information_schema.schemata 
          WHERE schema_name = :schemaName
        ) as exists`,
        { schemaName }
      );
      return result[0]?.exists || false;
    } catch (error) {
      logger.error('Failed to check schema existence', { schemaName, error });
      return false;
    }
  }

  /**
   * Truncate table with cascade
   */
  static async truncateTable(
    tableName: string,
    schemaName: string = 'public'
  ): Promise<void> {
    try {
      await sequelize.query(
        `TRUNCATE TABLE "${schemaName}"."${tableName}" CASCADE`,
        { raw: true }
      );
      logger.debug(`✓ Truncated table: ${schemaName}.${tableName}`);
    } catch (error) {
      logger.error('Failed to truncate table', { tableName, schemaName, error });
      throw error;
    }
  }

  /**
   * Get row count for table
   */
  static async getRowCount(
    tableName: string,
    schemaName: string = 'public'
  ): Promise<number> {
    try {
      const result = await this.executeQuery<{ count: number }>(
        `SELECT COUNT(*) as count FROM "${schemaName}"."${tableName}"`
      );
      return parseInt(String(result[0]?.count || '0'), 10);
    } catch (error) {
      logger.error('Failed to get row count', { tableName, schemaName, error });
      return 0;
    }
  }

  /**
   * Enable or disable foreign key constraints
   */
  static async setForeignKeyConstraints(enabled: boolean): Promise<void> {
    try {
      await sequelize.query(
        enabled ? 'SET CONSTRAINTS ALL IMMEDIATE' : 'SET CONSTRAINTS ALL DEFERRED',
        { raw: true }
      );
      logger.debug(`✓ Foreign key constraints ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      logger.error('Failed to set foreign key constraints', { error });
    }
  }

  /**
   * Vacuum and analyze database
   */
  static async maintenanceDatabase(): Promise<void> {
    try {
      // Vacuum removes dead rows
      await sequelize.query('VACUUM ANALYZE', { raw: true });
      logger.info('✓ Database maintenance completed (VACUUM ANALYZE)');
    } catch (error) {
      logger.error('Failed to perform database maintenance', { error });
    }
  }

  /**
   * Get database size
   */
  static async getDatabaseSize(): Promise<string> {
    try {
      const result = await this.executeQuery<{ pg_size_pretty: string }>(
        `SELECT pg_size_pretty(pg_database_size(current_database())) as pg_size_pretty`
      );
      return result[0]?.pg_size_pretty || 'Unknown';
    } catch (error) {
      logger.error('Failed to get database size', { error });
      return 'Unknown';
    }
  }

  /**
   * Get table size
   */
  static async getTableSize(
    tableName: string,
    schemaName: string = 'public'
  ): Promise<string> {
    try {
      const result = await this.executeQuery<{ pg_size_pretty: string }>(
        `SELECT pg_size_pretty(pg_total_relation_size('"${schemaName}"."${tableName}"')) as pg_size_pretty`
      );
      return result[0]?.pg_size_pretty || 'Unknown';
    } catch (error) {
      logger.error('Failed to get table size', { tableName, schemaName, error });
      return 'Unknown';
    }
  }

  /**
   * Get slow queries from PostgreSQL logs
   */
  static async getSlowQueries(
    minDurationMs: number = 1000
  ): Promise<Array<{ query: string; duration: number }>> {
    try {
      // Note: This requires PostgreSQL logging to be configured
      const result = await this.executeQuery(
        `SELECT query, mean_exec_time as duration 
         FROM pg_stat_statements 
         WHERE mean_exec_time > :minDuration 
         ORDER BY mean_exec_time DESC 
         LIMIT 10`,
        { minDuration: minDurationMs }
      );
      return result as any[];
    } catch (error) {
      logger.warn('Failed to get slow queries (pg_stat_statements extension may not be enabled)', { error });
      return [];
    }
  }

  /**
   * Reset sequences (useful after bulk deletes)
   */
  static async resetSequences(): Promise<void> {
    try {
      const result = await this.executeQuery<{ sequence_name: string }>(
        `SELECT sequence_name FROM information_schema.sequences 
         WHERE sequence_schema = 'public'`
      );

      for (const row of result) {
        const sequenceName = row.sequence_name;
        const tableName = sequenceName.replace('_id_seq', '');
        
        await sequelize.query(
          `SELECT setval('${sequenceName}', COALESCE((SELECT MAX(id)+1 FROM ${tableName}), 1))`,
          { raw: true }
        );
      }

      logger.info('✓ Database sequences reset');
    } catch (error) {
      logger.error('Failed to reset sequences', { error });
    }
  }

  /**
   * Create backup of database
   */
  static async createBackup(backupPath: string): Promise<void> {
    try {
      // Note: This uses pg_dump which must be on system PATH
      const { execSync } = await import('child_process');
      const dbConfig = sequelize.config;
      
      const command = `pg_dump -h ${dbConfig.host} -U ${dbConfig.username} -d ${dbConfig.database} -F c -f ${backupPath}`;
      execSync(command, { stdio: 'inherit' });
      
      logger.info('✓ Database backup created', { backupPath });
    } catch (error) {
      logger.error('Failed to create database backup', { backupPath, error });
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  static async restoreBackup(backupPath: string): Promise<void> {
    try {
      // Note: This uses pg_restore which must be on system PATH
      const { execSync } = await import('child_process');
      const dbConfig = sequelize.config;
      
      const command = `pg_restore -h ${dbConfig.host} -U ${dbConfig.username} -d ${dbConfig.database} -c ${backupPath}`;
      execSync(command, { stdio: 'inherit' });
      
      logger.info('✓ Database restored from backup', { backupPath });
    } catch (error) {
      logger.error('Failed to restore database from backup', { backupPath, error });
      throw error;
    }
  }
}

export default DatabaseUtil;
