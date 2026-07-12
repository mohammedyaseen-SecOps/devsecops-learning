# API Specification - Enterprise GRC SaaS Platform

## API Overview

- **Version:** 1.0
- **Base URL:** `https://api.grc-platform.com/v1`  
- **Authentication:** OAuth2 (Authorization Code Flow) + JWT Bearer Tokens
- **Content-Type:** `application/json`
- **Response Format:** RESTful JSON
- **Rate Limiting:** 1000 requests/min per user

---

## 1. Authentication & Authorization APIs

### 1.1 OAuth2 Authorization Flow

```
POST /oauth/authorize
GET  /oauth/callback
POST /oauth/token
POST /oauth/refresh
POST /oauth/revoke
```

#### Request: Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "secure_password",
  "tenant_subdomain": "company-a"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "rt_xxxxxxxxxxxxxx",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@company.com",
    "first_name": "John",
    "last_name": "Doe",
    "roles": ["Risk Manager"],
    "permissions": ["risk:create", "risk:read", "risk:update"],
    "tenant_id": "uuid"
  }
}
```

#### Request: SSO Login with SAML/OAuth
```bash
POST /auth/sso/callback
Content-Type: application/json

{
  "provider": "okta",
  "code": "auth_code_from_provider",
  "state": "random_state_token"
}

Response: 200 OK
{
  "access_token": "...",
  "user": {...}
}
```

#### Request: Refresh Token
```bash
POST /auth/refresh
Content-Type: application/json
Authorization: Bearer {refresh_token}

{}

Response: 200 OK
{
  "access_token": "new_token",
  "expires_in": 3600
}
```

---

## 2. Core Platform APIs

### 2.1 Tenant Management (Super Admin Only)

#### Create Tenant
```bash
POST /admin/tenants
Authorization: Bearer {superadmin_token}
Content-Type: application/json

{
  "name": "Acme Corporation",
  "subdomain": "acme-corp",
  "primary_contact_email": "admin@acmecorp.com",
  "subscription_tier": "professional",
  "enabled_modules": ["itam", "itsm", "risk", "compliance"]
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Acme Corporation",
  "subdomain": "acme-corp",
  "status": "active",
  "database_host": "tenant-1234.rds.amazonaws.com",
  "database_name": "acme_corp_db",
  "created_at": "2024-03-26T10:00:00Z"
}
```

#### Get Tenant Details
```bash
GET /admin/tenants/{tenant_id}
Authorization: Bearer {superadmin_token}

Response: 200 OK
{
  "id": "uuid",
  "name": "Acme Corporation",
  "status": "active",
  "plan": "professional",
  "users_count": 45,
  "storage_used_gb": 125,
  "created_at": "2024-01-15T08:30:00Z"
}
```

#### List All Tenants
```bash
GET /admin/tenants?page=1&limit=20&status=active
Authorization: Bearer {superadmin_token}

Response: 200 OK
{
  "page": 1,
  "limit": 20,
  "total": 342,
  "data": [
    {
      "id": "uuid",
      "name": "...",
      "status": "...",
      ...
    }
  ]
}
```

### 2.2 Subscription Management

#### Get Subscription Plans
```bash
GET /subscriptions/plans

Response: 200 OK
{
  "data": [
    {
      "id": "plan_1",
      "name": "Starter",
      "price_monthly": 499,
      "price_annual": 4990,
      "max_users": 10,
      "enabled_modules": ["user-management", "policy-archive"],
      "features": {
        "sso": false,
        "api_access": false,
        "custom_fields": false,
        "integrations_limit": 0
      }
    },
    {
      "id": "plan_2",
      "name": "Professional",
      "price_monthly": 1999,
      "price_annual": 19990,
      "max_users": 100,
      "enabled_modules": [
        "itam", "itsm", "risk", "compliance", "user-management", 
        "policy-archive", "vulnerability", "ticket-system"
      ],
      "features": {
        "sso": true,
        "api_access": true,
        "custom_fields": true,
        "integrations_limit": 5
      }
    },
    {
      "id": "plan_3",
      "name": "Enterprise",
      "price_monthly": null,
      "price_annual": null,
      "max_users": null,
      "enabled_modules": ["all"],
      "features": {
        "sso": true,
        "api_access": true,
        "custom_fields": true,
        "integrations_limit": -1,
        "dedicated_support": true,
        "custom_sla": true
      }
    }
  ]
}
```

#### Get Current Subscription
```bash
GET /subscriptions/current
Authorization: Bearer {tenant_admin_token}

Response: 200 OK
{
  "id": "sub_12345",
  "tenant_id": "uuid",
  "plan": {
    "id": "plan_2",
    "name": "Professional",
    "price_monthly": 1999
  },
  "billing_cycle": "monthly",
  "status": "active",
  "start_date": "2024-01-01",
  "end_date": null,
  "auto_renew": true,
  "next_billing_date": "2024-04-01",
  "enabled_modules": [...]
}
```

---

## 3. User & RBAC APIs

### 3.1 User Management

#### Create User
```bash
POST /users
Authorization: Bearer {tenant_admin_token}
Content-Type: application/json

{
  "email": "newuser@acmecorp.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "department": "IT Security",
  "job_title": "Security Officer",
  "role_ids": ["uuid_of_risk_manager_role"]
}

Response: 201 Created
{
  "id": "user_uuid",
  "email": "newuser@acmecorp.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "roles": ["Risk Manager"],
  "status": "active",
  "created_at": "2024-03-26T11:30:00Z"
}
```

#### List Users
```bash
GET /users?page=1&limit=50&role=Risk%20Manager&status=active
Authorization: Bearer {tenant_admin_token}

Response: 200 OK
{
  "page": 1,
  "limit": 50,
  "total": 120,
  "data": [
    {
      "id": "uuid",
      "email": "...",
      "first_name": "...",
      "last_name": "...",
      "roles": [...],
      "status": "...",
      "last_login": "2024-03-25T15:45:00Z"
    }
  ]
}
```

#### Update User Roles
```bash
PATCH /users/{user_id}/roles
Authorization: Bearer {tenant_admin_token}
Content-Type: application/json

{
  "role_ids": ["uuid_risk_manager", "uuid_security_analyst"]
}

Response: 200 OK
{
  "id": "user_uuid",
  "email": "...",
  "roles": ["Risk Manager", "Security Analyst"],
  "updated_at": "2024-03-26T12:00:00Z"
}
```

### 3.2 RBAC APIs

#### Get All Roles
```bash
GET /roles
Authorization: Bearer {tenant_admin_token}

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "Tenant Admin",
      "description": "Full access to tenant configuration",
      "type": "system",
      "permissions": [
        "user:create", "user:read", "user:update", "user:delete",
        "role:read", "role:update",
        "module:configure",
        "subscription:read", "billing:read"
      ]
    },
    {
      "id": "uuid",
      "name": "Risk Manager",
      "description": "Risk assessment and management",
      "type": "system",
      "permissions": [
        "risk:create", "risk:read", "risk:update",
        "risk:approve", "risk:export"
      ]
    },
    {
      "id": "uuid",
      "name": "Custom Auditor",
      "description": "Custom role for compliance audits",
      "type": "custom",
      "permissions": [...]
    }
  ]
}
```

#### Create Custom Role
```bash
POST /roles
Authorization: Bearer {tenant_admin_token}
Content-Type: application/json

{
  "name": "Compliance Officer",
  "description": "Handles compliance assessments",
  "permission_ids": ["uuid_compliance_read", "uuid_assessment_write"]
}

Response: 201 Created
{
  "id": "new_role_uuid",
  "name": "Compliance Officer",
  "type": "custom",
  "permissions": [...]
}
```

---

## 4. Module-Specific APIs

### 4.1 IT Asset Management (ITAM) Module

#### Create Asset
```bash
POST /modules/itam/assets
Authorization: Bearer {token}
Content-Type: application/json

{
  "asset_type": "hardware",
  "asset_category": "server",
  "asset_name": "Production Web Server 01",
  "serial_number": "SN-12345",
  "manufacturer": "Dell",
  "model_number": "PowerEdge R750",
  "owner_id": "user_uuid",
  "location": "Data Center A",
  "purchase_date": "2023-01-15",
  "warranty_expiry": "2026-01-15",
  "tags": ["production", "critical", "web-tier"]
}

Response: 201 Created
{
  "id": "asset_uuid",
  "asset_name": "Production Web Server 01",
  "status": "active",
  "lifecycle_status": "operational",
  "created_at": "2024-03-26T14:20:00Z"
}
```

#### List Assets
```bash
GET /modules/itam/assets?asset_type=hardware&status=active&owner_id={uuid}&page=1&limit=50
Authorization: Bearer {token}

Response: 200 OK
{
  "page": 1,
  "limit": 50,
  "total": 324,
  "data": [
    {
      "id": "asset_uuid",
      "asset_name": "...",
      "asset_type": "...",
      "status": "...",
      "owner_name": "...",
      "tags": [...]
    }
  ]
}
```

#### Get Asset Details
```bash
GET /modules/itam/assets/{asset_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "asset_uuid",
  "asset_type": "hardware",
  "asset_name": "Production Web Server 01",
  "serial_number": "SN-12345",
  "manufacturer": "Dell",
  "model_number": "PowerEdge R750",
  "owner": {
    "id": "user_uuid",
    "name": "John Smith"
  },
  "custodian": {...},
  "lifecycle_events": [
    {
      "date": "2023-01-15",
      "event": "Purchase",
      "details": "Initial acquisition"
    },
    {
      "date": "2023-02-01",
      "event": "Deployment",
      "details": "Deployed to Data Center A"
    }
  ],
  "associated_risks": [
    {"id": "risk_uuid", "title": "Server OS Not Latest Patch"}
  ],
  "vulnerabilities": [
    {"cve_id": "CVE-2024-12345", "severity": "high"}
  ],
  "created_at": "2024-03-26T14:20:00Z"
}
```

### 4.2 Risk Registry Module

#### Create Risk
```bash
POST /modules/risk/risks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Unpatched Critical Vulnerability in Production",
  "description": "Remote code execution vulnerability in Apache Log4j",
  "risk_category": "technical",
  "identified_date": "2024-03-20",
  "likelihood": "likely",
  "impact": "critical",
  "affected_processes": ["payment-processing", "customer-portal"],
  "potential_loss_value": 5000000,
  "treatment_type": "mitigate",
  "treatment_plan": "Apply patches to all servers and enable WAF rules",
  "treatment_owner_id": "user_uuid"
}

Response: 201 Created
{
  "id": "risk_uuid",
  "risk_id": "RISK-2024-0342",
  "title": "Unpatched Critical Vulnerability in Production",
  "risk_score": 25,
  "risk_rating": "critical",
  "status": "identified",
  "approval_status": "pending",
  "created_at": "2024-03-26T15:10:00Z"
}
```

#### Approve Risk
```bash
PATCH /modules/risk/risks/{risk_id}/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "approval_status": "approved",
  "approval_notes": "Approved for treatment"
}

Response: 200 OK
{
  "id": "risk_uuid",
  "approval_status": "approved",
  "approved_by": "user_name",
  "approved_date": "2024-03-26T15:15:00Z"
}
```

#### Get Risk Heatmap Data
```bash
GET /modules/risk/heatmap?timerange=Q1_2024&group_by=department
Authorization: Bearer {token}

Response: 200 OK
{
  "heatmap": {
    "dimensions": ["likelihood", "impact"],
    "data": [
      {"likelihood": "rare", "impact": "negligible", "count": 5, "risks": []},
      {"likelihood": "unlikely", "impact": "negligible", "count": 3, "risks": []},
      {"likelihood": "likely", "impact": "critical", "count": 2, "risks": [{"id": "risk_uuid", "title": "..."}]},
      ...
    ]
  },
  "summary": {
    "total_risks": 87,
    "critical_risks": 2,
    "high_risks": 15,
    "medium_risks": 34,
    "low_risks": 36
  }
}
```

### 4.3 Compliance & Framework Module

#### Get Framework Controls
```bash
GET /modules/compliance/frameworks/{framework_id}/controls
Authorization: Bearer {token}

Response: 200 OK
{
  "framework": {
    "id": "uuid",
    "name": "ISO 27001",
    "version": "2022"
  },
  "controls": [
    {
      "id": "control_uuid",
      "control_id": "A.5.1.1",
      "name": "Information Security Policies",
      "description": "General policies addressing information security shall be defined...",
      "implementation_status": "implemented",
      "effectiveness_score": 0.95,
      "responsible_owner": "John Smith",
      "evidence_documents": [
        {
          "id": "doc_uuid",
          "name": "ISO27001_Policy_v2.pdf",
          "upload_date": "2024-03-20"
        }
      ]
    },
    ...
  ]
}
```

#### Submit Compliance Assessment
```bash
POST /modules/compliance/assessments
Authorization: Bearer {token}
Content-Type: application/json

{
  "framework_id": "uuid",
  "assessment_type": "self-assessment",
  "assessment_date": "2024-03-26",
  "control_results": {
    "control_uuid_1": {
      "status": "compliant",
      "score": 1.0,
      "evidence_ids": ["doc_uuid_1", "doc_uuid_2"]
    },
    "control_uuid_2": {
      "status": "non-compliant",
      "score": 0.3,
      "gap_description": "Not all systems have been updated"
    },
    ...
  }
}

Response: 201 Created
{
  "id": "assessment_uuid",
  "assessment_id": "ASSESS-2024-0156",
  "framework_id": "uuid",
  "score": 87.5,
  "total_controls": 114,
  "compliant_controls": 96,
  "non_compliant_controls": 18,
  "status": "completed",
  "created_at": "2024-03-26T16:30:00Z"
}
```

#### Control Mapping (Crosswalk)
```bash
GET /modules/compliance/frameworks/{source_framework_id}/map-to/{target_framework_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "source_framework": "ISO 27001",
  "target_framework": "NIST CSF",
  "mappings": [
    {
      "source_control": "A.5.1.1",
      "target_control": "GV.PO-01",
      "mapping_strength": "direct",
      "notes": "Direct mapping to NIST governance policy control"
    },
    {
      "source_control": "A.6.1.1",
      "target_control": "OE.PO-01",
      "mapping_strength": "partial",
      "notes": "Partial coverage; additional NIST controls recommended"
    }
  ]
}
```

### 4.4 Vulnerability Management Module

#### Ingest Vulnerabilities from Scanner
```bash
POST /modules/vulnerability/ingest
Authorization: Bearer {service_account_token}
Content-Type: application/json

{
  "scanner_name": "nessus",
  "scan_date": "2024-03-26T10:00:00Z",
  "vulnerabilities": [
    {
      "cve_id": "CVE-2024-31234",
      "title": "SQL Injection in Login Form",
      "severity": "high",
      "cvss_score": 8.6,
      "affected_systems": ["app-server-01", "app-server-02"],
      "description": "...",
      "remediation": "Update library to version 2.5.1"
    },
    ...
  ]
}

Response: 202 Accepted
{
  "import_id": "import_uuid",
  "status": "processing",
  "vulnerabilities_count": 45,
  "message": "Vulnerabilities queued for import"
}
```

#### Get Vulnerability Status
```bash
GET /modules/vulnerability/vulnerabilities/{vuln_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "vuln_uuid",
  "vulnerability_id": "VULN-2024-0523",
  "cve_id": "CVE-2024-31234",
  "title": "SQL Injection in Login Form",
  "severity": "high",
  "cvss_score": 8.6,
  "status": "in-progress",
  "remediation_owner": "DevOps Team",
  "target_remediation_date": "2024-04-15",
  "progress": 60,
  "activities": [
    {
      "date": "2024-03-20",
      "activity": "Patching scheduled",
      "actor": "DevOps Team"
    },
    {
      "date": "2024-03-24",
      "activity": "Patches applied to prod-01, prod-02",
      "actor": "DevOps Team"
    }
  ]
}
```

### 4.5 Security Incident Response Module

#### Create Incident
```bash
POST /modules/incidents/incidents
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Unauthorized Access Detected",
  "description": "Multiple failed login attempts detected with successful breach",
  "incident_type": "unauthorized-access",
  "severity": "critical",
  "detected_date": "2024-03-26T08:15:00Z",
  "reportedby_user_id": "user_uuid"
}

Response: 201 Created
{
  "id": "incident_uuid",
  "incident_id": "INC-2024-0034",
  "title": "Unauthorized Access Detected",
  "severity": "critical",
  "status": "detected",
  "stage": "detect",
  "incident_commander_assigned": false,
  "created_at": "2024-03-26T08:20:00Z"
}
```

#### Update Incident Status & Lifecycle
```bash
PATCH /modules/incidents/incidents/{incident_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "contained",
  "stage": "respond",
  "incident_commander_id": "user_uuid",
  "containment_start_date": "2024-03-26T08:30:00Z",
  "containment_end_date": "2024-03-26T12:00:00Z",
  "root_cause": "Compromised API key in GitHub repository",
  "resolution_actions": [
    "Rotated all API keys",
    "Revoked access from compromised account",
    "Enabled MFA on all admin accounts"
  ],
  "preventive_measures": [
    "Implemented secret scanning",
    "Enforced security code review"
  ]
}

Response: 200 OK
{
  "id": "incident_uuid",
  "status": "contained",
  "stage": "respond",
  "incident_commander": "John Smith",
  "updated_at": "2024-03-26T12:05:00Z"
}
```

---

## 5. Ticketing System APIs

#### Create Ticket
```bash
POST /modules/tickets/tickets
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Follow-up on Risk Remediation",
  "description": "Track remediation of identified SQL injection vulnerability",
  "ticket_type": "request",
  "priority": "high",
  "assigned_to_id": "user_uuid",
  "related_risk_ids": ["risk_uuid_1"],
  "related_incident_ids": ["incident_uuid_1"]
}

Response: 201 Created
{
  "id": "ticket_uuid",
  "ticket_number": "TKT-0052836",
  "title": "Follow-up on Risk Remediation",
  "status": "open",
  "priority": "high",
  "sla_response_due": "2024-03-27T08:00:00Z",
  "sla_resolution_due": "2024-04-01T17:00:00Z",
  "created_at": "2024-03-26T17:00:00Z"
}
```

---

## 6. Audit Logging APIs

#### Get Audit Logs
```bash
GET /audit/logs?resource_type=risk&resource_id={risk_id}&action=create&date_from=2024-03-01&date_to=2024-03-31&limit=100
Authorization: Bearer {token}

Response: 200 OK
{
  "total": 523,
  "page": 1,
  "limit": 100,
  "data": [
    {
      "id": "log_uuid",
      "user": {
        "id": "user_uuid",
        "name": "Jane Doe",
        "email": "jane@company.com"
      },
      "action_type": "create",
      "resource_type": "risk",
      "resource_id": "risk_uuid",
      "resource_name": "SQL Injection Vulnerability",
      "old_values": null,
      "new_values": {
        "title": "SQL Injection Vulnerability",
        "risk_score": 20,
        "status": "identified"
      },
      "module_id": "risk-registry",
      "timestamp": "2024-03-26T14:30:00Z",
      "status": "success"
    },
    ...
  ]
}
```

#### Export Audit Report
```bash
GET /audit/export?format=pdf&date_from=2024-03-01&date_to=2024-03-31&filters[action]=update
Authorization: Bearer {token}

Response: 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="audit_report_march_2024.pdf"

[PDF Content]
```

---

## 7. Dashboard & Reporting APIs

#### Get Dashboard Metrics
```bash
GET /dashboard/metrics?timerange=30days&modules=risk,compliance,vulnerability
Authorization: Bearer {token}

Response: 200 OK
{
  "timerange": "30days",
  "summary": {
    "total_risks": 87,
    "critical_risks": 2,
    "overdue_actions": 5,
    "compliance_score": 87.5,
    "vulnerabilities_open": 12,
    "incidents_this_month": 2
  },
  "risk_metrics": {
    "by_rating": {
      "critical": 2,
      "high": 15,
      "medium": 34,
      "low": 36
    },
    "by_treatment_type": {
      "mitigate": 45,
      "accept": 20,
      "avoid": 10,
      "transfer": 12
    },
    "trend": [
      {"date": "2024-02-26", "total": 82, "critical": 1},
      {"date": "2024-03-05", "total": 84, "critical": 1},
      {"date": "2024-03-15", "total": 85, "critical": 1},
      {"date": "2024-03-26", "total": 87, "critical": 2}
    ]
  },
  "compliance_metrics": {
    "frameworks": [
      {
        "name": "ISO 27001",
        "score": 87,
        "last_assessment": "2024-03-15"
      },
      {
        "name": "NIST CSF",
        "score": 82,
        "last_assessment": "2024-03-15"
      }
    ]
  }
}
```

#### Custom Report Generation
```bash
POST /reports/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "report_type": "compliance_scorecard",
  "title": "Q1 2024 Compliance Report",
  "frameworks": ["ISO 27001", "NIST CSF"],
  "date_range": {
    "start": "2024-01-01",
    "end": "2024-03-31"
  },
  "include_sections": [
    "executive_summary",
    "control_status",
    "gap_analysis",
    "recommendations",
    "audit_trail"
  ],
  "export_format": "pdf"
}

Response: 201 Created
{
  "report_id": "report_uuid",
  "status": "generating",
  "download_url": "/reports/report_uuid/download",
  "estimated_completion": "2024-03-26T18:30:00Z"
}
```

---

## 8. Integration APIs

### Integration Marketplace

#### List Available Integrations
```bash
GET /integrations/available
Authorization: Bearer {tenant_admin_token}

Response: 200 OK
{
  "data": [
    {
      "id": "siem_splunk",
      "name": "Splunk Enterprise",
      "category": "siem",
      "description": "Ingest alerts from Splunk SIEM",
      "requires_subscription_tier": "professional",
      "config_schema": {
        "api_endpoint": {"type": "string", "required": true},
        "api_token": {"type": "string", "required": true, "sensitive": true}
      }
    },
    {
      "id": "ticketing_jira",
      "name": "Jira",
      "category": "ticketing",
      "description": "Sync tickets between GRC and Jira",
      "requires_subscription_tier": "standard",
      "config_schema": {...}
    },
    ...
  ]
}
```

#### Configure Integration
```bash
POST /integrations/configure
Authorization: Bearer {tenant_admin_token}
Content-Type: application/json

{
  "integration_id": "siem_splunk",
  "config": {
    "api_endpoint": "https://splunk.company.com:8089",
    "api_token": "encrypted_token_here"
  }
}

Response: 201 Created
{
  "id": "integration_instance_uuid",
  "integration_id": "siem_splunk",
  "status": "testing",
  "created_at": "2024-03-26T18:00:00Z"
}
```

---

## 9. Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ],
    "request_id": "req_abc123",
    "timestamp": "2024-03-26T18:30:00Z"
  }
}
```

### Common Error Codes
| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Invalid or missing token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| CONFLICT | 409 | Duplicate resource |
| RATE_LIMIT_EXCEEDED | 429 | Rate limit exceeded |
| INTERNAL_ERROR | 500 | Server error |

---

## 10. Webhooks

### Configure Webhook
```bash
POST /webhooks
Authorization: Bearer {tenant_admin_token}
Content-Type: application/json

{
  "url": "https://webhook.company.com/grc-events",
  "events": ["risk.created", "risk.approved", "incident.updated", "vulnerability.remediated"],
  "secret": "webhook_secret_key"
}

Response: 201 Created
{
  "id": "webhook_uuid",
  "url": "https://webhook.company.com/grc-events",
  "events": [...],
  "created_at": "2024-03-26T19:00:00Z"
}
```

### Webhook Event Payload
```json
{
  "event": "risk.created",
  "timestamp": "2024-03-26T14:30:00Z",
  "webhook_id": "webhook_uuid",
  "data": {
    "id": "risk_uuid",
    "risk_id": "RISK-2024-0342",
    "title": "Unpatched Critical Vulnerability",
    "risk_rating": "critical",
    "created_by": "john.doe@company.com"
  }
}
```

---

## 11. API Rate Limiting

| User Type | Requests/Minute | Burst |
|-----------|-----------------|-------|
| Regular User | 1000 | 1500 |
| Tenant Admin | 5000 | 7500 |
| Service Account | 10000 | 15000 |
| Super Admin | Unlimited | Unlimited |

**Response Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1711459200
```

---

**API Version:** 1.0
**Last Updated:** March 2026
**Swagger URL:** `https://api.grc-platform.com/docs`
