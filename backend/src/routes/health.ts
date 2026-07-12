import { Router, Request, Response } from 'express';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { HealthCheckResponse } from '@/types';

const router = Router();

/**
 * GET /health
 * Public health check endpoint
 * Does not require authentication
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const response: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: config.environment,
      uptime: process.uptime(),
      checks: [],
    };

    // Check database connection (will be implemented when DB layer is set up)
    try {
      // TODO: Implement database connectivity check
      response.checks?.push({
        name: 'database',
        status: 'ok',
        message: 'Database connection check pending',
      });
    } catch (error) {
      response.checks?.push({
        name: 'database',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      response.status = 'degraded';
    }

    // Check Redis connection (will be implemented when Redis client is set up)
    try {
      // TODO: Implement Redis connectivity check
      response.checks?.push({
        name: 'redis',
        status: 'ok',
        message: 'Redis connection check pending',
      });
    } catch (error) {
      response.checks?.push({
        name: 'redis',
        status: 'warning',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const duration = Date.now() - startTime;

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
      requestId: (req as any).id,
    });

    logger.debug('Health check passed', { duration });
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(503).json({
      success: false,
      error: {
        message: 'Service unavailable',
        statusCode: 503,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id,
      },
    });
  }
});

/**
 * GET /health/live
 * Liveness probe (for Kubernetes)
 */
router.get('/live', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/ready
 * Readiness probe (for Kubernetes)
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // TODO: Check critical dependencies (DB, Redis, etc.)
    res.json({
      success: true,
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        message: 'Not ready',
        statusCode: 503,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
