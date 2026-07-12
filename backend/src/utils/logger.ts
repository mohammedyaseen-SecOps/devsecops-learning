import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { config } from '@/config';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define custom colors for console output
const customColors = {
  trace: 'white',
  debug: 'cyan',
  info: 'green',
  warn: 'yellow',
  error: 'red',
  fatal: 'magenta',
};

winston.addColors(customColors);

// Define log levels
const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

// Email format for errors in production
const errorMailFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaStr}`;
});

// Create transports based on environment
const transports: winston.transport[] = [];

// Console transport (all environments)
transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
      })
    ),
  })
);

// File transport for errors
transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 7,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
  })
);

// File transport for combined logs
transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 10485760, // 10MB
    maxFiles: 14, // 2 weeks if daily rotation
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
  })
);

// Production-specific transport: log critical errors with more details
if (config.environment === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'critical.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 30, // 1 month
      format: errorMailFormat,
    })
  );
}

// Development-specific: more verbose console output
if (config.environment === 'development') {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'debug.log'),
      level: 'debug',
      maxsize: 10485760, // 10MB
      maxFiles: 3,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  levels,
  level: config.logging.level || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true })
  ),
  defaultMeta: {
    service: 'grc-platform-api',
    environment: config.environment,
    version: process.env.APP_VERSION || '1.0.0',
  },
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
      ),
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
      ),
    }),
  ],
});

// Add context helper methods
export interface LogContext {
  correlationId?: string;
  userId?: string;
  tenantId?: string;
  requestPath?: string;
  requestMethod?: string;
  [key: string]: any;
}

// Child logger with context
export const createChildLogger = (context: LogContext) => {
  return logger.child(context);
};

// Helper functions for different log levels with context
export const logWithContext = (context: LogContext) => ({
  info: (message: string, meta?: any) => logger.info(message, { ...context, ...meta }),
  warn: (message: string, meta?: any) => logger.warn(message, { ...context, ...meta }),
  error: (message: string, error?: Error | any, meta?: any) => {
    logger.error(message, {
      ...(error instanceof Error ? { stack: error.stack, errorMessage: error.message } : { error }),
      ...context,
      ...meta,
    });
  },
  debug: (message: string, meta?: any) => logger.debug(message, { ...context, ...meta }),
});

// Request/Response logging helper
export interface RequestLogData {
  method: string;
  url: string;
  status: number;
  duration: number;
  userId?: string;
  tenantId?: string;
  error?: string;
}

export const logRequest = (data: RequestLogData) => {
  const { method, url, status, duration, userId, tenantId, error } = data;
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
  
  const message = `${method} ${url} - ${status} (${duration}ms)`;
  const meta = { userId, tenantId };
  
  if (error) {
    logger.error(message, { ...meta, error });
  } else {
    logger[level as 'error' | 'warn' | 'info'](message, meta);
  }
};
