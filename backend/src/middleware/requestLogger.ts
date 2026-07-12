import { Request, Response, NextFunction } from 'express';
import { logRequest, createChildLogger } from '@/utils/logger';

// Request context interface
export interface RequestContext {
  correlationId: string;
  userId?: string;
  tenantId?: string;
  userEmail?: string;
  userRole?: string;
}

// Extend Express Request to include context
declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
      startTime?: number;
    }
  }
}

/**
 * Request logging middleware
 * - Captures request start time
 * - Logs request details with correlationId
 * - Logs response details including duration
 */
export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Record start time
  req.startTime = Date.now();

  // Initialize request context
  req.context = {
    correlationId: req.headers['x-correlation-id'] as string || generateCorrelationId(),
    userId: (req as any).user?.id,
    tenantId: (req as any).tenantId,
    userEmail: (req as any).user?.email,
    userRole: (req as any).user?.role,
  };

  // Set correlation ID header in response
  res.setHeader('x-correlation-id', req.context.correlationId);

  // Log incoming request
  const logger = createChildLogger({
    correlationId: req.context.correlationId,
    userId: req.context.userId,
    tenantId: req.context.tenantId,
  });

  logger.info(`→ Incoming Request`, {
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture the original send function
  const originalSend = res.send;

  res.send = function (data) {
    return originalSend.call(this, data);
  };

  // Capture response to log details
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || Date.now());
    const statusCode = res.statusCode;

    logRequest({
      method: req.method,
      url: req.path,
      status: statusCode,
      duration,
      userId: req.context?.userId,
      tenantId: req.context?.tenantId,
    });

    // Log response details
    logger.debug(`← Response Complete`, {
      method: req.method,
      path: req.path,
      statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
    });
  });

  // Handle errors during response
  res.on('error', (error) => {
    const duration = Date.now() - (req.startTime || Date.now());
    
    logger.error(`✗ Response Error`, {
      method: req.method,
      path: req.path,
      error: error.message,
      duration: `${duration}ms`,
    });
  });

  next();
};

/**
 * Generate correlation ID for request tracing
 */
const generateCorrelationId = (): string => {
  return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get logger for current request/route
 */
export const getRequestLogger = (req: Request) => {
  return createChildLogger({
    correlationId: req.context?.correlationId,
    userId: req.context?.userId,
    tenantId: req.context?.tenantId,
  });
};

export default requestLoggerMiddleware;
