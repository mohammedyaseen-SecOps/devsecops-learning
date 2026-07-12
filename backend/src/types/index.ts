/**
 * Common TypeScript types and interfaces
 */

// User roles (RBAC)
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  ANALYST = 'analyst',
  VIEWER = 'viewer',
  GUEST = 'guest',
}

// User status
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
}

// Subscription status
export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

// Subscription plan
export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

// Audit action types
export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ROLE_CHANGE = 'ROLE_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

// Entity types for auditing
export enum EntityType {
  USER = 'USER',
  TENANT = 'TENANT',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',
  MODULE = 'MODULE',
  RISK = 'RISK',
  COMPLIANCE = 'COMPLIANCE',
  VULNERABILITY = 'VULNERABILITY',
  INCIDENT = 'INCIDENT',
  TICKET = 'TICKET',
  ASSET = 'ASSET',
  POLICY = 'POLICY',
}

// Risk severity levels
export enum RiskSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational',
}

// Risk status
export enum RiskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  MITIGATED = 'mitigated',
  CLOSED = 'closed',
  ACCEPTED = 'accepted',
}

// Compliance status
export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  NOT_APPLICABLE = 'not_applicable',
  UNKNOWN = 'unknown',
}

// Module identifiers (12 GRC modules)
export enum ModuleId {
  ITAM = 'ITAM',
  ITSM = 'ITSM',
  THREAT_INTEL = 'THREAT_INTEL',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  TICKETING = 'TICKETING',
  RISK_REGISTRY = 'RISK_REGISTRY',
  POLICY_ARCHIVE = 'POLICY_ARCHIVE',
  INCIDENT_RESPONSE = 'INCIDENT_RESPONSE',
  SECURITY_OPS = 'SECURITY_OPS',
  VULNERABILITY = 'VULNERABILITY',
  THIRD_PARTY_RISK = 'THIRD_PARTY_RISK',
  COMPLIANCE = 'COMPLIANCE',
}

// API Response Success
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

// API Response Error (handled by error middleware)
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    requestId?: string;
  };
}

// Pagination
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Paginated response
export interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  meta: PaginationMeta;
}

// Sort direction
export type SortDirection = 'ASC' | 'DESC' | 'asc' | 'desc';

// Sorting
export interface SortQuery {
  sortBy?: string;
  sortDirection?: SortDirection;
}

// Filter operators
export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  LIKE = 'like',
  IN = 'in',
  NOT_IN = 'nin',
  BETWEEN = 'between',
  EXISTS = 'exists',
}

// Filter criteria
export interface FilterCriteria {
  field: string;
  operator: FilterOperator;
  value: any;
}

// Permission
export interface Permission {
  id: string;
  resource: string; // e.g., 'users', 'risks', 'compliance'
  action: string; // e.g., 'create', 'read', 'update', 'delete'
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Role with permissions
export interface Role {
  id: string;
  tenantId?: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean; // System roles cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

// User (minimal for API responses)
export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Authenticated user context from JWT
export interface AuthContext {
  id: string;
  email: string;
  tenantId: string;
  role: UserRole;
  permissions: string[];
  iat?: number;
  exp?: number;
}

// Tenant
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    expiresAt?: Date;
    autoRenew: boolean;
  };
  enabledModules: ModuleId[];
  config?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Audit log entry
export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  createdAt: Date;
}

// Request body for creating a user
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password?: string; // Optional, will be generated and sent via email
}

// Request body for updating a user
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
}

// Request body for updating password
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Login response
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Token refresh request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Module configuration
export interface ModuleConfig {
  id: string;
  name: string;
  enabled: boolean;
  allowedRoles: UserRole[];
  config?: Record<string, any>;
  version?: string;
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version?: string;
  environment?: string;
  uptime?: number;
  database?: {
    connected: boolean;
    latency?: number;
  };
  redis?: {
    connected: boolean;
    latency?: number;
  };
  checks?: {
    name: string;
    status: 'ok' | 'failed' | 'warning';
    message?: string;
  }[];
}
