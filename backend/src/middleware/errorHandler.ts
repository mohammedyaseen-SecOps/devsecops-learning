import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { config } from '@/config';

// Custom error class for standardized error handling
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, true, context);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// Authentication error
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

// Authorization error
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

// Not found error
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// Conflict error (e.g., duplicate resource)
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

// Async error wrapper to catch errors in async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    requestId?: string;
    // In development/staging, include more details
    stack?: string;
    context?: any;
  };
}

// Global error handling middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Extract request ID from middleware or generate one
  const requestId = (req as any).id || generateRequestId();

  // Log the error
  const errorLog = {
    requestId,
    method: req.method,
    path: req.path,
    status: (error as AppError).statusCode || 500,
    message: error.message,
    userId: (req as any).user?.id,
    tenantId: (req as any).tenantId,
  };

  if (error instanceof AppError && error.isOperational) {
    logger.warn(`[${error.statusCode}] ${error.message}`, errorLog);
  } else {
    logger.error(error.message, errorLog);
  }

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';

  // Handle specific error types
  if (error instanceof ValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = error.message;
  } else if (error instanceof AuthenticationError) {
    statusCode = 401;
    code = 'AUTHENTICATION_ERROR';
    message = error.message;
  } else if (error instanceof AuthorizationError) {
    statusCode = 403;
    code = 'AUTHORIZATION_ERROR';
    message = error.message;
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = error.message;
  } else if (error instanceof ConflictError) {
    statusCode = 409;
    code = 'CONFLICT';
    message = error.message;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else {
    // Unknown error
    statusCode = 500;
    message = 'An unexpected error occurred';
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId,
    },
  };

  // Include additional details in non-production environments
  if (config.environment !== 'production') {
    errorResponse.error.stack = error.stack;
    if (error instanceof AppError) {
      errorResponse.error.context = error.context;
    }
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};

// 404 handler (place before error handler)
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  next(error);
};

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  (req as any).id = req.headers['x-request-id'] || generateRequestId();
  res.setHeader('x-request-id', (req as any).id);
  next();
};

// Helper to generate request ID
export const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default errorHandler;
