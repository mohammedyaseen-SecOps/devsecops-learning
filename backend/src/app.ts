import express, { Express, Request, Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { logger } from '@/utils/logger';
import { errorHandler, notFoundHandler, requestIdMiddleware } from '@/middleware/errorHandler';
import { requestLoggerMiddleware } from '@/middleware/requestLogger';
import healthRoutes from '@/routes/health';
import authRoutes from '@/routes/auth';
import usersRoutes from '@/routes/users';
import rolesRoutes from '@/routes/roles';
import tenantsRoutes from '@/routes/tenants';
import modulesRoutes from '@/routes/modules';
import { config } from '@/config';

export const createApp = (): Express => {
  const app = express();

  // Trust proxy
  app.set('trust proxy', 1);

  // Request ID middleware (set X-Request-ID header)
  app.use(requestIdMiddleware);

  // Security Middleware
  app.use(helmet());
  app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Correlation-ID'],
  }));

  // Compression
  app.use(compression());

  // Request logging with morgan
  app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

  // Custom request logger middleware
  app.use(requestLoggerMiddleware);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: config.rateLimiting.windowMs,
    max: config.rateLimiting.max,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => req.path === '/health' || req.path.startsWith('/health/'),
  });

  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 100,
    delayMs: 500,
  });

  app.use(limiter);
  app.use(speedLimiter);

  // Routes
  app.use('/health', healthRoutes);
  app.use(`${config.apiPrefix}/${config.apiVersion}/auth`, authRoutes);
  app.use(`${config.apiPrefix}/${config.apiVersion}/users`, usersRoutes);
  app.use(`${config.apiPrefix}/${config.apiVersion}/roles`, rolesRoutes);
  app.use(`${config.apiPrefix}/${config.apiVersion}/tenants`, tenantsRoutes);
  app.use(`${config.apiPrefix}/${config.apiVersion}/modules`, modulesRoutes);

  // API Documentation
  if (config.environment !== 'production') {
    app.get('/api/docs', (_req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'API Documentation (TODO: Implement Swagger/OpenAPI)',
        apiVersion: config.apiVersion,
        endpoints: {
          health: '/health',
          auth: `${config.apiPrefix}/${config.apiVersion}/auth`,
          users: `${config.apiPrefix}/${config.apiVersion}/users`,
          roles: `${config.apiPrefix}/${config.apiVersion}/roles`,
          tenants: `${config.apiPrefix}/${config.apiVersion}/tenants`,
          modules: `${config.apiPrefix}/${config.apiVersion}/modules`,
        },
      });
    });
  }

  // 404 Handler
  app.use(notFoundHandler);

  // Global Error Handler (must be last)
  app.use(errorHandler);

  return app;
};
