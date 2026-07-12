# Database Schema Design - Enterprise GRC SaaS Platform

## 1. Master Database Schema (Shared Across All Tenants)

### Core Tables

#### 1.1 Tenants Table
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    primary_contact_email VARCHAR(255),
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'standard', -- 'free', 'standard', 'professional', 'enterprise'
    database_host VARCHAR(255) NOT NULL,
    database_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'trial', 'cancelled'
    trial_end_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    FOREIGN KEY (created_by) REFERENCES super_admin_users(id)
);

CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_status ON tenants(status);
```

#### 1.2 Subscription & Billing
```sql
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2),
    price_annual DECIMAL(10, 2),
    max_users INT,
    enabled_modules JSONB, -- array of module IDs
    features JSONB, -- JSON with feature flags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'monthly', 'annual'
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

CREATE TABLE billing_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    subscription_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_method VARCHAR(50),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (subscription_id) REFERENCES tenant_subscriptions(id)
);
```

#### 1.3 Feature Flags (Module Configuration)
```sql
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    module_id VARCHAR(100) NOT NULL, -- 'itam', 'itsm', 'risk', 'compliance', etc.
    module_name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    config JSONB, -- per-tenant module configuration
    activated_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(tenant_id, module_id)
);

CREATE INDEX idx_feature_flags_tenant_enabled ON feature_flags(tenant_id, enabled);
```

#### 1.4 Super Admin Users
```sql
CREATE TABLE super_admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'admin', -- 'admin', 'support', 'billing', 'audit'
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.5 Audit Logs (Platform Level)
```sql
CREATE TABLE platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID,
    tenant_id UUID,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(50), -- 'success', 'failure'
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES super_admin_users(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX idx_platform_audit_logs_tenant ON platform_audit_logs(tenant_id);
CREATE INDEX idx_platform_audit_logs_created ON platform_audit_logs(created_at);
CREATE INDEX idx_platform_audit_logs_resource ON platform_audit_logs(resource_type, resource_id);
```

---

## 2. Per-Tenant Database Schema

Each tenant has an isolated database with the following comprehensive schema:

### 2.1 User Management & RBAC

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    job_title VARCHAR(100),
    avatar_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    email_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    last_login TIMESTAMP,
    last_login_ip INET,
    sso_provider VARCHAR(50), -- 'okta', 'azuread', 'google', null for local
    sso_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

#### Roles
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'custom', -- 'system', 'custom'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (id, name, description, type) VALUES
('00000000-0000-0000-0000-000000000001', 'Super Admin', 'Platform administrator with full access', 'system'),
('00000000-0000-0000-0000-000000000002', 'Tenant Admin', 'Tenant customer administrator', 'system'),
('00000000-0000-0000-0000-000000000003', 'Risk Manager', 'Risk assessment and management', 'system'),
('00000000-0000-0000-0000-000000000004', 'Security Analyst', 'Security and threat analysis', 'system'),
('00000000-0000-0000-0000-000000000005', 'Auditor', 'Compliance and audit review', 'system'),
('00000000-0000-0000-0000-000000000006', 'End User', 'Regular platform user', 'system');
```

#### Permissions
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    module_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource, action)
);

-- Example permissions
INSERT INTO permissions (resource, action, module_id) VALUES
('user', 'create', 'user-management'),
('user', 'read', 'user-management'),
('user', 'update', 'user-management'),
('user', 'delete', 'user-management'),
('risk', 'create', 'risk-registry'),
('risk', 'read', 'risk-registry'),
('risk', 'approve', 'risk-registry'),
('audit', 'read', 'audit-module');
```

#### Role-Permission Mapping
```sql
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);
```

#### User-Role Mapping
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
```

#### Row-Level Security Policies
```sql
CREATE TABLE rls_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    filter_column VARCHAR(100),
    filter_value VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

### 2.2 Audit Logging

#### Audit Logs (Tenant Level)
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action_type VARCHAR(100) NOT NULL, -- 'create', 'read', 'update', 'delete', 'approve', 'reject'
    resource_type VARCHAR(100) NOT NULL, -- 'risk', 'user', 'asset', 'compliance', etc.
    resource_id UUID,
    resource_name VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    module_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(50), -- 'success', 'failure'
    error_message TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
```

### 2.3 IT Asset Management (ITAM) Module

```sql
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type VARCHAR(50) NOT NULL, -- 'hardware', 'software', 'cloud', 'network'
    asset_category VARCHAR(100), -- 'server', 'workstation', 'license', 'vm', 's3bucket'
    asset_name VARCHAR(255) NOT NULL,
    description TEXT,
    serial_number VARCHAR(255),
    model_number VARCHAR(255),
    manufacturer VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'retired', 'deprecated'
    owner_id UUID,
    custodian_id UUID,
    location VARCHAR(255),
    department VARCHAR(100),
    cost DECIMAL(12, 2),
    purchase_date DATE,
    warranty_expiry DATE,
    lifecycle_status VARCHAR(50), -- 'procurement', 'deployment', 'operational', 'maintenance', 'disposal'
    tags JSONB, -- array of tags for categorization
    custom_fields JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (custodian_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_owner ON assets(owner_id);
```

### 2.4 Risk Registry Module

```sql
CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id VARCHAR(50) NOT NULL UNIQUE, -- e.g., RISK-2024-001
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_category VARCHAR(100), -- 'operational', 'financial', 'compliance', 'strategic', 'technical'
    identified_date DATE NOT NULL,
    identified_by UUID,
    
    -- Risk Assessment
    likelihood VARCHAR(50), -- 'rare', 'unlikely', 'possible', 'likely', 'almost_certain'
    likelihood_score INT, -- 1-5
    impact VARCHAR(50), -- 'negligible', 'minor', 'moderate', 'major', 'critical'
    impact_score INT, -- 1-5
    risk_score INT, -- likelihood_score * impact_score
    risk_rating VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
    
    -- Business Context
    affected_processes TEXT[], -- array of process names
    affected_assets UUID[], -- array of asset IDs
    potential_loss_value DECIMAL(12, 2),
    
    -- Treatment
    treatment_type VARCHAR(50), -- 'mitigate', 'avoid', 'transfer', 'accept'
    treatment_owner_id UUID,
    treatment_plan TEXT,
    treatment_start_date DATE,
    treatment_end_date DATE,
    residual_risk_score INT,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'identified', -- 'identified', 'assessed', 'treated', 'mitigated', 'accepted', 'closed'
    approval_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by UUID,
    approved_date TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    FOREIGN KEY (identified_by) REFERENCES users(id),
    FOREIGN KEY (treatment_owner_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_rating ON risks(risk_rating);
CREATE INDEX idx_risks_identified ON risks(identified_date);
```

### 2.5 Compliance & Framework Management

```sql
CREATE TABLE frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- 'ISO 27001', 'HIPAA', 'NIST', 'HITRUST', etc.
    description TEXT,
    version VARCHAR(50),
    source_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO frameworks (name, version) VALUES
('ISO 27001', '2022'),
('HIPAA', '2024'),
('HITRUST', 'v9.2'),
('CMMC 2.0', '2.0'),
('CIS Controls v8', '8.0'),
('NIST CSF', '2.0');

CREATE TABLE controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id UUID NOT NULL,
    control_id VARCHAR(50) NOT NULL, -- e.g., 'A.5.1.1'
    control_name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_control_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (framework_id) REFERENCES frameworks(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_control_id) REFERENCES controls(id),
    UNIQUE(framework_id, control_id)
);

CREATE TABLE framework_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_framework_id UUID NOT NULL,
    source_control_id UUID NOT NULL,
    target_framework_id UUID NOT NULL,
    target_control_id UUID NOT NULL,
    mapping_strength VARCHAR(50), -- 'direct', 'partial', 'related'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_framework_id) REFERENCES frameworks(id),
    FOREIGN KEY (source_control_id) REFERENCES controls(id),
    FOREIGN KEY (target_framework_id) REFERENCES frameworks(id),
    FOREIGN KEY (target_control_id) REFERENCES controls(id)
);

CREATE TABLE compliance_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id VARCHAR(50) NOT NULL UNIQUE,
    framework_id UUID NOT NULL,
    assessment_date DATE NOT NULL,
    assessment_type VARCHAR(50), -- 'self-assessment', 'third-party', 'internal-audit'
    assessor_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'in-progress', -- 'in-progress', 'completed', 'approved'
    score DECIMAL(5, 2),
    total_controls INT,
    compliant_controls INT,
    non_compliant_controls INT,
    findings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (framework_id) REFERENCES frameworks(id),
    FOREIGN KEY (assessor_id) REFERENCES users(id)
);

CREATE TABLE control_implementations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    control_id UUID NOT NULL,
    implementation_status VARCHAR(50), -- 'not-started', 'in-progress', 'implemented', 'optimized'
    responsible_owner_id UUID,
    start_date DATE,
    target_date DATE,
    actual_completion_date DATE,
    evidence_documents JSONB[], -- array of document references
    testing_results JSONB,
    effectiveness_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (control_id) REFERENCES controls(id),
    FOREIGN KEY (responsible_owner_id) REFERENCES users(id)
);
```

### 2.6 Vulnerability Response Module

```sql
CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vulnerability_id VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'VULN-2024-001'
    cve_id VARCHAR(50), -- e.g., 'CVE-2024-12345'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) NOT NULL, -- 'critical', 'high', 'medium', 'low', 'info'
    cvss_score DECIMAL(4, 1),
    cvss_vector TEXT,
    cvss_severity VARCHAR(50),
    
    -- Source
    scanner_name VARCHAR(100), -- 'nessus', 'openvas', 'qualys'
    scan_date TIMESTAMP,
    discovered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Affected Resources
    affected_asset_ids UUID[],
    affected_system_names VARCHAR(255)[],
    
    -- Remediation
    remediation_status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open', 'in-progress', 'remediated', 'accepted', 'false-positive'
    remediation_plan TEXT,
    remediation_owner_id UUID,
    target_remediation_date DATE,
    actual_remediation_date DATE,
    
    -- Risk
    business_impact TEXT,
    exploitability_score INT,
    exploitability_description VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remediation_owner_id) REFERENCES users(id)
);

CREATE INDEX idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX idx_vulnerabilities_status ON vulnerabilities(remediation_status);
```

### 2.7 Security Incident Response Module

```sql
CREATE TABLE security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    incident_type VARCHAR(100), -- 'data-breach', 'malware', 'unauthorized-access', 'ddos', 'phishing'
    severity VARCHAR(50) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    
    -- Timeline
    detected_date TIMESTAMP NOT NULL,
    reported_date TIMESTAMP,
    containment_start_date TIMESTAMP,
    containment_end_date TIMESTAMP,
    recovery_start_date TIMESTAMP,
    recovery_end_date TIMESTAMP,
    resolved_date TIMESTAMP,
    
    -- Lifecycle
    status VARCHAR(50) NOT NULL DEFAULT 'detected', -- 'detected', 'contained', 'recovered', 'resolved'
    stage VARCHAR(50), -- 'detect', 'respond', 'recover'
    
    -- Assignment
    incident_commander_id UUID,
    investigation_owner_id UUID,
    
    -- Evidence
    root_cause TEXT,
    impact_assessment TEXT,
    evidence_items JSONB[],
    
    -- Resolution
    resolution_actions TEXT[],
    preventive_measures TEXT[],
    lessons_learned TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_commander_id) REFERENCES users(id),
    FOREIGN KEY (investigation_owner_id) REFERENCES users(id)
);

CREATE INDEX idx_incidents_status ON security_incidents(status);
CREATE INDEX idx_incidents_severity ON security_incidents(severity);
```

### 2.8 Ticketing System Module

```sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    ticket_type VARCHAR(50) NOT NULL, -- 'incident', 'request', 'change', 'problem'
    priority VARCHAR(50) NOT NULL DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open', 'in-progress', 'waiting', 'resolved', 'closed'
    
    -- Assignment
    assigned_to_id UUID,
    created_by_id UUID,
    
    -- SLA
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sla_response_due TIMESTAMP,
    sla_resolution_due TIMESTAMP,
    responded_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    
    -- Relationships
    related_risk_ids UUID[],
    related_incident_ids UUID[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to_id) REFERENCES users(id),
    FOREIGN KEY (created_by_id) REFERENCES users(id)
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
```

### 2.9 Custom Fields & Forms

```sql
CREATE TABLE custom_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id VARCHAR(100) NOT NULL UNIQUE,
    form_name VARCHAR(255) NOT NULL,
    description TEXT,
    form_json JSONB NOT NULL, -- Form builder structure
    module_id VARCHAR(100),
    version INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active', -- 'draft', 'active', 'archived'
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    resource_type VARCHAR(100), -- 'risk', 'assessment', 'incident'
    resource_id UUID,
    response_data JSONB NOT NULL,
    submitted_by UUID,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES custom_forms(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id)
);
```

### 2.10 Session Management

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

---

## 3. Indexing Strategy for Performance

```sql
-- Critical indexes for frequent queries
CREATE INDEX idx_users_email_status ON users(email, status);
CREATE INDEX idx_assets_owner_status ON assets(owner_id, status);
CREATE INDEX idx_risks_score_status ON risks(risk_score, status);
CREATE INDEX idx_audit_logs_date_range ON audit_logs(timestamp DESC) WHERE timestamp > CURRENT_TIMESTAMP - INTERVAL '90 days';
CREATE INDEX idx_vulnerabilities_asset_status ON vulnerabilities(affected_asset_ids, remediation_status);
CREATE INDEX idx_controls_framework_status ON controls(framework_id) WHERE status = 'active';

-- Full-text search indexes
CREATE INDEX idx_assets_fts ON assets USING GIN (to_tsvector('english', asset_name || ' ' || description));
CREATE INDEX idx_risks_fts ON risks USING GIN (to_tsvector('english', title || ' ' || description));
```

---

## 4. Row-Level Security (RLS) Policies

```sql
-- Example RLS policy: Users can only see risks assigned to their department
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY risks_department_isolation ON risks
    FOR SELECT
    USING (
        affected_processes && ARRAY(
            SELECT department FROM users WHERE id = current_user_id()
        )
    );

-- Auditors can see all risks
CREATE POLICY risks_auditor_access ON risks
    FOR SELECT
    USING (
        EXISTS(
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = current_user_id() AND r.name = 'Auditor'
        )
    );
```

---

## 5. Data Retention & Archival Policies

```sql
-- Archive old audit logs (older than 7 years for compliance)
CREATE TABLE audit_logs_archive AS SELECT * FROM audit_logs WHERE created_at < CURRENT_DATE - INTERVAL '84 months' AND created_at > CURRENT_DATE - INTERVAL '85 months' WITH NO DATA;

-- Policy: Retention rules per data type
-- Audit Logs: 7 years (compliance)
-- Session Data: 90 days
-- Deleted Records: Soft delete with tombstone table
-- Incident Data: 3 years active, then archive
```

---

## 6. Encryption Configuration

```sql
-- Sensitive column encryption (pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypt SSO ID
ALTER TABLE users ADD COLUMN sso_id_encrypted BYTEA;

-- Migration to use encrypted column
UPDATE users SET sso_id_encrypted = pgp_sym_encrypt(sso_id, current_setting('app.encryption_key'))
WHERE sso_id IS NOT NULL;

-- Enforce encryption in application layer for:
-- - API keys and secrets
-- - Personal identifiable information (PII)
-- - Financial data
-- - Medical data (HIPAA compliance)
```

---

**Schema Version:** 1.0
**Last Updated:** March 2026
**Compliance:** GDPR, HIPAA, SOC 2 Type II
