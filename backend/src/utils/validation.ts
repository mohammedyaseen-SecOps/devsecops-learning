import Joi from 'joi';
import { UserRole, UserStatus, SubscriptionPlan, SubscriptionStatus } from '@/types';

/**
 * Request validation schemas using Joi
 */

// ============================================
// Authentication Schemas
// ============================================

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  rememberMe: Joi.boolean().optional(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// ============================================
// User Schemas
// ============================================

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().max(100).optional(),
  lastName: Joi.string().max(100).optional(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .default(UserRole.VIEWER),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .optional()
    .messages({
      'string.pattern.base':
        'Password must contain at least one lowercase, uppercase, number, and special character',
    }),
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().max(100).optional(),
  lastName: Joi.string().max(100).optional(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  status: Joi.string().valid(...Object.values(UserStatus)).optional(),
});

export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one lowercase, uppercase, number, and special character',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

// ============================================
// Role Schemas
// ============================================

export const createRoleSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().optional(),
  permissions: Joi.array().items(Joi.string()).default([]),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  description: Joi.string().optional(),
  permissions: Joi.array().items(Joi.string()).optional(),
});

// ============================================
// Tenant Schemas
// ============================================

export const createTenantSchema = Joi.object({
  name: Joi.string().max(255).required(),
  slug: Joi.string().max(255).lowercase().alphanum().required(),
  description: Joi.string().optional(),
  subscriptionPlan: Joi.string()
    .valid(...Object.values(SubscriptionPlan))
    .default(SubscriptionPlan.STARTER),
});

export const updateTenantSchema = Joi.object({
  name: Joi.string().max(255).optional(),
  description: Joi.string().optional(),
  subscriptionPlan: Joi.string().valid(...Object.values(SubscriptionPlan)).optional(),
  subscriptionStatus: Joi.string()
    .valid(...Object.values(SubscriptionStatus))
    .optional(),
  enabledModules: Joi.array()
    .items(
      Joi.string().valid(
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
        'COMPLIANCE'
      )
    )
    .optional(),
});

// ============================================
// Pagination & Filter Schemas
// ============================================

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortDirection: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('ASC'),
});

// ============================================
// Validation Middleware
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@/middleware/errorHandler';

export const validate =
  (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dataSource = source === 'body' ? req.body : source === 'query' ? req.query : req.params;

      const { error, value } = schema.validate(dataSource, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));
        throw new ValidationError('Validation failed', { errors });
      }

      // Replace source with validated data
      if (source === 'body') {
        req.body = value;
      } else if (source === 'query') {
        req.query = value;
      } else {
        req.params = value;
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default {
  loginSchema,
  refreshTokenSchema,
  createUserSchema,
  updateUserSchema,
  updatePasswordSchema,
  createRoleSchema,
  updateRoleSchema,
  createTenantSchema,
  updateTenantSchema,
  paginationSchema,
  validate,
};
