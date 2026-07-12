import fs from 'fs';
import path from 'path';
import { logger } from '@/utils/logger';
import sequelize from '@/models';

interface Migration {
  name: string;
  up: (queryInterface: any) => Promise<void>;
  down: (queryInterface: any) => Promise<void>;
}

interface MigrationRecord {
  id?: string;
  name: string;
  batch: number;
  executedAt: Date;
}

/**
 * Migration runner for managing database schema versions
 */
export class MigrationRunner {
  private migrationsPath: string;
  private tableName: string = 'sequelize_meta';

  constructor(migrationsPath: string = path.join(process.cwd(), 'src/migrations')) {
    this.migrationsPath = migrationsPath;
  }

  /**
   * Initialize migrations table if it doesn't exist
   */
  private async initializeMigrationsTable(): Promise<void> {
    try {
      const queryInterface = sequelize.getQueryInterface();
      
      // Create migrations table if not exists
      await queryInterface.createTable(
        this.tableName,
        {
          id: {
            type: 'INTEGER',
            primaryKey: true,
            autoIncrement: true,
          },
          name: {
            type: 'VARCHAR(255)',
            allowNull: false,
            unique: true,
          },
          batch: {
            type: 'INTEGER',
            allowNull: false,
          },
          executed_at: {
            type: 'TIMESTAMP',
            defaultValue: 'CURRENT_TIMESTAMP',
          },
        }
      );

      logger.debug('✓ Migrations table initialized');
    } catch (error) {
      // Table might already exist, which is fine
      logger.debug('Migrations table already exists or initialization skipped');
    }
  }

  /**
   * Get currently executed migrations
   */
  private async getExecutedMigrations(): Promise<MigrationRecord[]> {
    try {
      const result = await sequelize.query(
        `SELECT * FROM "${this.tableName}" ORDER BY batch DESC, id DESC`
      );
      return result[0] as MigrationRecord[];
    } catch (error) {
      logger.warn('Could not retrieve executed migrations', { error });
      return [];
    }
  }

  /**
   * Get available migration files
   */
  private async getAvailableMigrations(): Promise<Migration[]> {
    try {
      if (!fs.existsSync(this.migrationsPath)) {
        logger.warn('Migrations directory does not exist', { path: this.migrationsPath });
        return [];
      }

      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
        .sort();

      const migrations: Migration[] = [];

      for (const file of files) {
        const filePath = path.join(this.migrationsPath, file);
        const migration = await import(filePath);
        
        migrations.push({
          name: file.replace(/\.(ts|js)$/, ''),
          up: migration.up,
          down: migration.down,
        });
      }

      return migrations;
    } catch (error) {
      logger.error('Failed to load migration files', { error });
      throw error;
    }
  }

  /**
   * Run pending migrations (up)
   */
  async runPending(): Promise<void> {
    try {
      await this.initializeMigrationsTable();

      const availableMigrations = await this.getAvailableMigrations();
      const executedMigrations = await this.getExecutedMigrations();
      const executedNames = executedMigrations.map(m => m.name);

      const pendingMigrations = availableMigrations.filter(
        m => !executedNames.includes(m.name)
      );

      if (pendingMigrations.length === 0) {
        logger.info('✓ No pending migrations');
        return;
      }

      const nextBatch = (executedMigrations[0]?.batch || 0) + 1;
      const queryInterface = sequelize.getQueryInterface();

      for (const migration of pendingMigrations) {
        try {
          logger.info(`→ Running migration: ${migration.name}`);
          await migration.up(queryInterface);

          await sequelize.query(
            `INSERT INTO "${this.tableName}" (name, batch, executed_at) VALUES (?, ?, NOW())`,
            {
              replacements: [migration.name, nextBatch],
              raw: true,
            }
          );

          logger.info(`✓ Migration completed: ${migration.name}`);
        } catch (error) {
          logger.error(`✗ Migration failed: ${migration.name}`, { error });
          throw error;
        }
      }

      logger.info(`✓ All ${pendingMigrations.length} pending migrations executed successfully`);
    } catch (error) {
      logger.error('Migration run failed', { error });
      throw error;
    }
  }

  /**
   * Rollback last migration batch (down)
   */
  async rollback(steps: number = 1): Promise<void> {
    try {
      await this.initializeMigrationsTable();

      const executedMigrations = await this.getExecutedMigrations();
      const availableMigrations = await this.getAvailableMigrations();
      const availableMap = new Map(availableMigrations.map(m => [m.name, m]));

      if (executedMigrations.length === 0) {
        logger.info('✓ No migrations to rollback');
        return;
      }

      // Group migrations by batch and get the last `steps` batches
      const batches = new Map<number, MigrationRecord[]>();
      for (const migration of executedMigrations) {
        if (!batches.has(migration.batch)) {
          batches.set(migration.batch, []);
        }
        batches.get(migration.batch)!.push(migration);
      }

      const sortedBatches = Array.from(batches.keys()).sort((a, b) => b - a).slice(0, steps);
      const migrationsToRollback: MigrationRecord[] = [];

      for (const batch of sortedBatches) {
        migrationsToRollback.push(...(batches.get(batch) || []));
      }

      const queryInterface = sequelize.getQueryInterface();

      for (const migration of migrationsToRollback.reverse()) {
        const migrationHandler = availableMap.get(migration.name);
        if (!migrationHandler) {
          logger.warn(`Migration not found: ${migration.name}`);
          continue;
        }

        try {
          logger.info(`→ Rolling back migration: ${migration.name}`);
          await migrationHandler.down(queryInterface);

          await sequelize.query(
            `DELETE FROM "${this.tableName}" WHERE name = ?`,
            {
              replacements: [migration.name],
              raw: true,
            }
          );

          logger.info(`✓ Migration rolled back: ${migration.name}`);
        } catch (error) {
          logger.error(`✗ Rollback failed: ${migration.name}`, { error });
          throw error;
        }
      }

      logger.info(`✓ Rolled back ${migrationsToRollback.length} migrations`);
    } catch (error) {
      logger.error('Migration rollback failed', { error });
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async status(): Promise<{ executed: MigrationRecord[]; pending: string[] }> {
    try {
      await this.initializeMigrationsTable();

      const executed = await this.getExecutedMigrations();
      const available = await this.getAvailableMigrations();
      const executedNames = executed.map(m => m.name);

      const pending = available
        .filter(m => !executedNames.includes(m.name))
        .map(m => m.name);

      return { executed, pending };
    } catch (error) {
      logger.error('Failed to get migration status', { error });
      throw error;
    }
  }

  /**
   * Reset database (rollback all migrations)
   */
  async reset(): Promise<void> {
    try {
      const executed = await this.getExecutedMigrations();
      const batches = new Set(executed.map(m => m.batch));
      const totalBatches = Math.max(...Array.from(batches), 0);

      logger.warn(`⚠ Resetting database - rolling back ${totalBatches} migration batches`);

      for (let i = 0; i < totalBatches; i++) {
        await this.rollback(1);
      }

      logger.info('✓ Database reset completed');
    } catch (error) {
      logger.error('Database reset failed', { error });
      throw error;
    }
  }

  /**
   * Fresh database (reset then run pending)
   */
  async fresh(): Promise<void> {
    try {
      logger.info('🔄 Refreshing database (reset and run pending migrations)');
      await this.reset();
      await this.runPending();
      logger.info('✓ Database refresh completed');
    } catch (error) {
      logger.error('Database refresh failed', { error });
      throw error;
    }
  }
}

export default MigrationRunner;
