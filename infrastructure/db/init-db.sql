-- GRC Platform - Database Initialization Script
-- Master Database Setup for Multi-tenant SaaS

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Create schemas
CREATE SCHEMA IF NOT EXISTS master;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS public;

-- Grant permissions
GRANT USAGE ON SCHEMA master TO postgres;
GRANT USAGE ON SCHEMA audit TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;

GRANT CREATE ON SCHEMA master TO postgres;
GRANT CREATE ON SCHEMA audit TO postgres;
GRANT CREATE ON SCHEMA public TO postgres;

-- Comment on schemas
COMMENT ON SCHEMA master IS 'Master database schema for multi-tenant SaaS platform';
COMMENT ON SCHEMA audit IS 'Schema for audit and compliance logging';

-- Create master.tenants table (core tenant management)
CREATE TABLE IF NOT EXISTS master.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url VARCHAR(500),
  subscription_plan VARCHAR(50) NOT NULL DEFAULT 'startup',
  subscription_status VARCHAR(50) NOT NULL DEFAULT 'trial',
  subscription_expires_at TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  enabled_modules TEXT[] DEFAULT ARRAY['ITAM', 'ITSM', 'THREAT_INTEL', 'USER_MANAGEMENT', 'TICKETING', 'RISK_REGISTRY', 'POLICY_ARCHIVE', 'INCIDENT_RESPONSE', 'SECURITY_OPS', 'VULNERABILITY', 'THIRD_PARTY_RISK', 'COMPLIANCE'],
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

CREATE INDEX idx_tenants_slug ON master.tenants(slug);
CREATE INDEX idx_tenants_status ON master.tenants(subscription_status, is_active);

-- Create master.databases table (for tenant database connections)
CREATE TABLE IF NOT EXISTS master.databases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES master.tenants(id) ON DELETE CASCADE,
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL DEFAULT 5432,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(512) NOT NULL, -- Should be encrypted in production
  database_name VARCHAR(255) NOT NULL,
  schema_name VARCHAR(255) NOT NULL DEFAULT 'tenant',
  is_active BOOLEAN DEFAULT true,
  connection_string VARCHAR(1024),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_id, schema_name)
);

CREATE INDEX idx_databases_tenant ON master.databases(tenant_id);

-- Create master.users table (platform users)
CREATE TABLE IF NOT EXISTS master.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES master.tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(255),
  password_hash VARCHAR(255),
  avatar_url VARCHAR(500),
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires_at TIMESTAMP,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_tenant_email ON master.users(tenant_id, email);
CREATE INDEX idx_users_status ON master.users(tenant_id, status);
CREATE INDEX idx_users_role ON master.users(tenant_id, role);

-- Create master.roles table (RBAC roles)
CREATE TABLE IF NOT EXISTS master.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_id, name)
);

CREATE INDEX idx_roles_tenant ON master.roles(tenant_id);
CREATE INDEX idx_roles_system ON master.roles(is_system);

-- Create master.permissions table
CREATE TABLE IF NOT EXISTS master.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (resource, action)
);

-- Create audit.audit_logs table
CREATE TABLE IF NOT EXISTS audit.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES master.tenants(id) ON DELETE SET NULL,
  user_id UUID,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  entity_name VARCHAR(255),
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_tenant ON audit.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit.audit_logs(action);

-- Create system roles
INSERT INTO master.roles (tenant_id, name, description, is_system) VALUES
  (NULL, 'super_admin', 'Super Admin - Full platform access', true),
  (NULL, 'admin', 'Administrator - Tenant admin access', true),
  (NULL, 'manager', 'Manager - Department manager access', true),
  (NULL, 'analyst', 'Analyst - Data analyst access', true),
  (NULL, 'viewer', 'Viewer - Read-only access', true),
  (NULL, 'guest', 'Guest - Limited view access', true)
ON CONFLICT DO NOTHING;

-- Create system permissions
INSERT INTO master.permissions (resource, action, description) VALUES
  -- User management
  ('users', 'create', 'Create new users'),
  ('users', 'read', 'View user information'),
  ('users', 'update', 'Update user information'),
  ('users', 'delete', 'Delete users'),
  
  -- Role management
  ('roles', 'create', 'Create new roles'),
  ('roles', 'read', 'View role information'),
  ('roles', 'update', 'Update role information'),
  ('roles', 'delete', 'Delete roles'),
  
  -- Tenant management
  ('tenants', 'create', 'Create new tenants'),
  ('tenants', 'read', 'View tenant information'),
  ('tenants', 'update', 'Update tenant configuration'),
  ('tenants', 'delete', 'Delete tenants'),
  
  -- Module management
  ('modules', 'read', 'View module information'),
  ('modules', 'update', 'Update module configuration'),
  
  -- Risk management
  ('risks', 'create', 'Create new risks'),
  ('risks', 'read', 'View risk information'),
  ('risks', 'update', 'Update risk information'),
  ('risks', 'delete', 'Delete risks'),
  
  -- Compliance management
  ('compliance', 'create', 'Create compliance frameworks'),
  ('compliance', 'read', 'View compliance data'),
  ('compliance', 'update', 'Update compliance data'),
  ('compliance', 'delete', 'Delete compliance data'),
  
  -- Audit logs
  ('audit', 'read', 'View audit logs'),
  ('audit', 'export', 'Export audit logs')
ON CONFLICT DO NOTHING;

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit.audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit.audit_logs (action, entity_type, entity_id, changes, status)
  VALUES (
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)),
    'success'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Set default search_path
ALTER DATABASE grc_master_dev SET search_path TO master, audit, public;

-- Print summary
SELECT 'GRC Platform database initialized successfully' AS status;
