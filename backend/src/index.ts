import { createApp } from './app';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { sequelize, defineAssociations, syncDatabase } from '@/models';

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('✓ Master database connection established');

    // Define model associations
    defineAssociations();
    logger.info('✓ Model associations defined');

    // Sync database (create tables if they don't exist - development only)
    if (config.environment !== 'production') {
      await syncDatabase(config.environment === 'development');
    }

    const app = createApp();
    const PORT = config.port || 3001;

    const server = app.listen(PORT, () => {
      logger.info(`✓ Server is running on port ${PORT}`);
      logger.info(`✓ Environment: ${config.environment}`);
      logger.info(`✓ API URL: http://localhost:${PORT}/api/v1`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await sequelize.close();
        logger.info('✓ Server and database connections closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(async () => {
        await sequelize.close();
        logger.info('✓ Server and database connections closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
