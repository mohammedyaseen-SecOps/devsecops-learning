#!/usr/bin/env ts-node
import { MigrationRunner } from '@/utils/migration';
import { logger } from '@/utils/logger';

/**
 * Migration CLI utility
 * Usage:
 *   npm run db:migrate        # Run pending migrations
 *   npm run db:migrate:status # Show migration status
 *   npm run db:migrate:rollback # Rollback last batch
 *   npm run db:migrate:reset  # Rollback all migrations
 *   npm run db:migrate:fresh  # Reset and run migrations
 */

const args = process.argv.slice(2);
const command = args[0] || 'run';

const runner = new MigrationRunner();

const run = async () => {
  try {
    switch (command) {
      case 'run':
        await runner.runPending();
        break;

      case 'status':
        const status = await runner.status();
        console.log('\n📊 Migration Status:\n');
        console.log('Executed Migrations:');
        if (status.executed.length > 0) {
          status.executed.forEach(m => {
            console.log(`  ✓ ${m.name} (batch: ${m.batch})`);
          });
        } else {
          console.log('  (none)');
        }
        console.log('\nPending Migrations:');
        if (status.pending.length > 0) {
          status.pending.forEach(m => {
            console.log(`  ⏳ ${m}`);
          });
        } else {
          console.log('  (none)');
        }
        console.log();
        break;

      case 'rollback':
        const steps = parseInt(args[1] || '1', 10);
        await runner.rollback(steps);
        break;

      case 'reset':
        const confirm = args[1];
        if (confirm !== '--force') {
          logger.warn('⚠️  This will rollback ALL migrations. Use --force to confirm');
          process.exit(1);
        }
        await runner.reset();
        break;

      case 'fresh':
        const freshConfirm = args[1];
        if (freshConfirm !== '--force') {
          logger.warn('⚠️  This will reset the database and rebuild schema. Use --force to confirm');
          process.exit(1);
        }
        await runner.fresh();
        break;

      default:
        console.log(`
Migration CLI Utility

Usage:
  ts-node migrate.ts run              Run pending migrations
  ts-node migrate.ts status           Show migration status
  ts-node migrate.ts rollback [steps] Rollback last migration batch (default: 1)
  ts-node migrate.ts reset --force    Rollback all migrations (requires --force)
  ts-node migrate.ts fresh --force    Reset DB and run all migrations (requires --force)
        `);
        process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    logger.error('Migration command failed', { error });
    process.exit(1);
  }
};

run();
