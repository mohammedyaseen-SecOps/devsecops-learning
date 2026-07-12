import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development';
dotenv.config({ path: path.join(process.cwd(), envFile) });
dotenv.config({ path: path.join(process.cwd(), '.env') });

export interface IConfig {
  // Environment
  environment: 'development' | 'staging' | 'production';
  port: number;
  nodeEnv: string;

  // API
  apiUrl: string;
  apiPrefix: string;
  apiVersion: string;

  // Frontend
  frontendUrl: string;
  corsOrigins: string[];

  // Database - Master
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    dbName: string;
    dialect: 'postgres';
    pool: {
      max: number;
      min: number;
      acquire: number;
      idle: number;
    };
    logging: boolean;
    ssl: boolean;
  };

  // Redis
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    ttl: number;
  };

  // JWT/Auth
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };

  // Encryption
  encryption: {
    key: string;
    algorithm: string;
  };

  // Email (for notifications, password reset)
  email: {
    from: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
  };

  // AWS/Cloud
  aws?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3Bucket: string;
  };

  // Logging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    maxFileSize: string;
    maxFiles: number;
  };

  // Security
  rateLimiting: {
    windowMs: number; // 15 minutes
    max: number; // requests per windowMs
  };

  // Feature Flags
  features: {
    multiTenant: boolean;
    modulesEnabled: string[];
    auditLogging: boolean;
    encryption: boolean;
    webhooks: boolean;
  };
}

const getConfig = (): IConfig => {
  const environment = (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production';

  // Get rate limiting based on environment
  const getRateLimiting = () => {
    if (environment === 'production') {
      return { windowMs: 15 * 60 * 1000, max: 1000 }; // 1000 requests per 15 minutes
    }
    return { windowMs: 15 * 60 * 1000, max: 10000 }; // 10000 requests per 15 minutes (dev/staging)
  };

  // Get CORS origins based on environment
  const getCorsOrigins = () => {
    if (process.env.CORS_ORIGINS) {
      return process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
    }
    if (environment === 'production') {
      return ['https://app.grc-platform.com', 'https://www.grc-platform.com'];
    }
    return ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
  };

  // Get modules enabled based on environment
  const getEnabledModules = () => {
    if (process.env.ENABLED_MODULES) {
      return process.env.ENABLED_MODULES.split(',').map(m => m.trim());
    }
    // All 12 modules by default
    return [
      'ITAM',
      'ITSM',
      'THREAT_INTEL',
      'USER_MANAGEMENT',
      'TICKETING',
      'RISK_REGISTRY',
      'POLICY_ARCHIVE',
      'INCIDENT_RESPONSE',
      'SECURITY_OPS',
      'VULNERABILITY',
      'THIRD_PARTY_RISK',
      'COMPLIANCE',
    ];
  };

  const config: IConfig = {
    // Environment
    environment,
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // API
    apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`,
    apiPrefix: process.env.API_PREFIX || '/api',
    apiVersion: process.env.API_VERSION || 'v1',

    // Frontend
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    corsOrigins: getCorsOrigins(),

    // Database - Master
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      dbName: process.env.DB_NAME || 'grc_master',
      dialect: 'postgres',
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '10', 10),
        min: parseInt(process.env.DB_POOL_MIN || '2', 10),
        acquire: 30000,
        idle: 10000,
      },
      logging: environment === 'development',
      ssl: process.env.DB_SSL === 'true',
    },

    // Redis
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      ttl: parseInt(process.env.REDIS_TTL || '3600', 10), // 1 hour default
    },

    // JWT/Auth
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    // Encryption
    encryption: {
      key: process.env.ENCRYPTION_KEY || '0'.repeat(32), // 256-bit key (32 bytes hex)
      algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
    },

    // Email
    email: {
      from: process.env.EMAIL_FROM || 'noreply@grc-platform.com',
      smtpHost: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
      smtpUser: process.env.SMTP_USER || 'apikey',
      smtpPassword: process.env.SMTP_PASSWORD || 'your-sendgrid-api-key',
      smtpSecure: process.env.SMTP_SECURE === 'true',
    },

    // AWS
    ...(process.env.AWS_REGION && {
      aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        s3Bucket: process.env.AWS_S3_BUCKET || 'grc-platform-data',
      },
    }),

    // Logging
    logging: {
      level: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
      format: (process.env.LOG_FORMAT || (environment === 'production' ? 'json' : 'text')) as 'json' | 'text',
      maxFileSize: process.env.LOG_MAX_FILE_SIZE || '20m',
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '14', 10), // 2 weeks if daily
    },

    // Security - Rate Limiting
    rateLimiting: getRateLimiting(),

    // Feature Flags
    features: {
      multiTenant: process.env.FEATURE_MULTI_TENANT !== 'false', // enabled by default
      modulesEnabled: getEnabledModules(),
      auditLogging: process.env.FEATURE_AUDIT_LOGGING !== 'false', // enabled by default
      encryption: process.env.FEATURE_ENCRYPTION !== 'false', // enabled by default
      webhooks: process.env.FEATURE_WEBHOOKS !== 'false', // enabled by default
    },
  };

  return config;
};

export const config = getConfig();

// Validate critical configuration
export const validateConfig = (cfg: IConfig): void => {
  const required = [
    'JWT_SECRET',
    'DB_PASSWORD',
    'ENCRYPTION_KEY',
  ];

  if (cfg.environment === 'production') {
    const missingSecrets = required.filter(key => !process.env[key] || process.env[key] === `your-super-secret-${key.toLowerCase()}-key-change-in-production`);
    if (missingSecrets.length > 0) {
      throw new Error(`Missing or default production secrets: ${missingSecrets.join(', ')}`);
    }
  }
};

// Validate on config load
validateConfig(config);
