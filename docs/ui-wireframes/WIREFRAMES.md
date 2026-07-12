# UI/UX Wireframes & Design Specifications - GRC SaaS Platform

## 1. Platform Layout Architecture

### Master Layout Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│                     HEADER BAR                                      │
│  Logo | Platform Name | [Search] | User Menu | Theme | Help | Gear │
├─────────────────┬───────────────────────────────────────────────────┤
│                 │                                                   │
│   SIDEBAR       │                    MAIN CONTENT AREA              │
│   (Collapsible) │                                                   │
│                 │                                                   │
│  • Dashboard    │    ┌─────────────────────────────────────┐        │
│  • Modules      │    │  [Breadcrumb Navigation]            │        │
│  • Reports      │    ├─────────────────────────────────────┤        │
│  • Settings     │    │                                     │        │
│  • Audit Logs   │    │  [Page Content]                     │        │
│                 │    │  [Widgets, Forms, Tables]           │        │
│                 │    │                                     │        │
│                 │    │                                     │        │
│                 │    └─────────────────────────────────────┘        │
│                 │                                                   │
├─────────────────┴───────────────────────────────────────────────────┤
│                   FOOTER (Status, Version, Support)                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dashboard Wireframes

### 2.1 Main Dashboard (Overview)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Dashboard > Overview                         [Last updated: 2mins ago]│
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌─ Quick Stats ─────────────────────────────────────────────────┐   │
│ │ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │   │
│ │ │ Risks    │  │Critical  │  │Compliance│  │Vulns Open│       │   │
│ │ │  87      │  │  2       │  │  87.5%   │  │  12      │       │   │
│ │ └──────────┘  └──────────┘  └──────────┘  └──────────┘       │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│ ┌─ Risk Heat Map ─────────────────┐  ┌─ Compliance Scorecard ────┐  │
│ │                                 │  │  ISO 27001:      87%   ▓▓▓│  │
│ │        IMPACT                   │  │  NIST CSF:       82%   ▓▓ │  │
│ │   5 │ █ █ █ █ █              │  │  HIPAA:          91%   ▓▓▓│  │
│ │   4 │ █ █   █ █              │  │  HITRUST:        78%   ▓▓ │  │
│ │   3 │ █ █ █ █ █              │  │                          │  │
│ │   2 │ █ █ █ █ █              │  │                          │  │
│ │   1 │ █ █ █ █ █              │  │                          │  │
│ │     └────────────────────     │  └─────────────────────────┘  │
│ │       1 2 3 4 5 (Likelihood) │                              │  │
│ └─────────────────────────────────┘                              │
│                                                                       │
│ ┌─ Recent Activities ──────────────────────────────────────────┐   │
│ │ • RISK-0342 Created: Unpatched Vulnerability    1 hour ago   │   │
│ │ • Assessment Submitted: ISO 27001 Q1            2 hours ago  │   │
│ │ • INC-0034 Escalated: Unauthorized Access       4 hours ago  │   │
│ │ • VUL-0523 Remediated: SQL Injection            1 day ago    │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Module Navigation Wireframes

### 3.1 Module Configuration Page (Tenant Admin)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Settings > Modules                                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ Subscription: Professional | Upgrade to Enterprise >                 │
│ Enabled Modules: 8 / 12 available                                    │
│                                                                       │
│ ┌─ ENABLED MODULES ─────────────────────────────────────────────┐  │
│ │ ✓  IT Asset Management (ITAM)          Last used: Today       │  │
│ │    [View Config] [Disable]                                     │  │
│ │                                                                 │  │
│ │ ✓  IT Service Management (ITSM)        Last used: Today       │  │
│ │    [View Config] [Disable]                                     │  │
│ │                                                                 │  │
│ │ ✓  Risk Registry                       Last used: 2 days ago  │  │
│ │    [View Config] [Disable]                                     │  │
│ │                                                                 │  │
│ │ ✓  Compliance & Framework               Last used: Today      │  │
│ │    [View Config] [Disable]                                     │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                       │
│ ┌─ AVAILABLE MODULES (Can Enable) ──────────────────────────────┐  │
│ │ ○  Threat Intelligence Security Center                        │  │
│ │    [View Details] [Enable]                                    │  │
│ │    Requires: Professional or higher tier                      │  │
│ │                                                                 │  │
│ │ ○  Third-Party Risk Management                                │  │
│ │    [View Details] [Enable]                                    │  │
│ │    ✓ Requires: Professional tier (you have Professional) >   │  │
│ │                                                                 │  │
│ │ ○  Security Incident Response    🔒 LOCKED                   │  │
│ │    [View Details]                                              │  │
│ │    Requires: Enterprise tier upgrade required                 │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                       │
│                                  [Cancel]  [Save Changes]            │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Risk Registry Module Wireframes

### 4.1 Risk List View

```
┌──────────────────────────────────────────────────────────────────────┐
│ Risk Registry > All Risks                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ [+ New Risk] [Import CSV] [Export PDF]      [Filters ▼] [Search ▌] │
│                                                                       │
│ View: List | Board | Heatmap | Timeline                             │
│                                                                       │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ Risk ID  │ Title                    │ Rating│Status│Owner   │   │
│ ├──────────────────────────────────────────────────────────────┤   │
│ │RISK-0342 │Unpatched Critical Vuln   │🔴 Crit│Assess│John Du │   │
│ │RISK-0341 │Insufficient IAM Controls │🔴 High│Treated│Jane Sm│   │
│ │RISK-0340 │Outdated TLS Certificate  │🟡 Med │Mitigat│Dev Tea│   │
│ │RISK-0339 │Cloud Credential Exposure │🔴 Crit│Accept│Security│   │
│ │RISK-0338 │Missing Data Backup Plan  │🟡 Med │Ident │IT Ops │   │
│ │...                                                          │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│ Showing 5-10 of 87 results                          Page 1 of 9 ❯   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Risk Detail View

```
┌──────────────────────────────────────────────────────────────────────┐
│ Risk Registry > RISK-0342: Unpatched Critical Vulnerability          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌─ RISK OVERVIEW ────────────┐  ┌─ ASSESSMENT ──────────────────┐  │
│ │ Status: ⚠ Identified       │  │ Likelihood: LIKELY (4/5)      │  │
│ │ Rating: 🔴 CRITICAL        │  │ Impact: CRITICAL (5/5)        │  │
│ │ Score: 20/25               │  │ Risk Score: 20/25             │  │
│ │ Identified: Mar 20, 2024   │  │ Residual: 8/25 (post-mitiga)  │  │
│ └────────────────────────────┘  └───────────────────────────────┘  │
│                                                                       │
│ ┌─ RISK DETAILS ───────────────────────────────────────────────┐   │
│ │ Title:        Unpatched Critical Vulnerability              │   │
│ │ Category:     Technical Risk                                │   │
│ │ Description:  Remote code execution vulnerability in...     │   │
│ │ CVE:          CVE-2024-31234                               │   │
│ │ Affected:     • Production Web Servers (5 assets)           │   │
│ │              • Payment Processing System                     │   │
│ │              • Customer Portal                              │   │
│ │ Potential Loss: $5,000,000                                 │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                       │
│ ┌─ TREATMENT ───────────────────────────────────────────────────┐  │
│ │ Treatment Type: MITIGATE                                      │  │
│ │ Owner: DevOps Team (assigned to: John Doe)                   │  │
│ │ Plan: Apply security patches + enable WAF rules              │  │
│ │ Start Date: Mar 22, 2024 | Target: Apr 5, 2024 ✓ On Track  │  │
│ │ Progress: ▓▓▓▓▓▓░░░░ 60%                                    │  │
│ │                                                               │  │
│ │ Recent Updates:                                               │  │
│ │ • [Mar 24] Patches applied to prod-01, prod-02 - J.Doe     │  │
│ │ • [Mar 22] Patching scheduled - DevOps Team                │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                       │
│ ┌─ APPROVAL ────────────────────────────────────────────────────┐  │
│ │ Approval Status: ⏳ Pending                                   │  │
│ │ [Approve] [Request Changes] [Reject]                        │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                       │
│ ┌─ AUDIT TRAIL ─────────────────────────────────────────────────┐  │
│ │ • Created: Mar 20, 14:30 - Jane Smith                        │  │
│ │ • Updated: Mar 22, 10:15 - John Doe                          │  │
│ │ • Updated: Mar 24, 16:45 - DevOps Team                       │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                       │
│                              [Close] [Edit] [Delete]                 │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 5. Compliance Module Wireframes

### 5.1 Framework Assessment View

```
┌──────────────────────────────────────────────────────────────────────┐
│ Compliance > ISO 27001:2022 Assessment                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ Last Assessment: Mar 15, 2024 | Score: 87.5% | Status: Completed   │
│                                                                       │
│ ┌─ COMPLIANCE SCORE TREND ─────────────────┐                        │
│ │ 100%├─────────────────────────────────── │                        │
│ │  90%├─────────┐                          │                        │
│ │  80%├─────────┼───┐                      │                        │
│ │  70%├─────────┼───┼────┐                 │                        │
│ │  60%├        │   │    │                  │                        │
│ │     └────────┴───┴────┴──────────────── │                        │
│ │     Q1    Q2   Q3   Q4   [Previous Year] │                        │
│ └──────────────────────────────────────────┘                        │
│                                                                       │
│ ┌─ CONTROL BREAKDOWN ────────────────────────────────────────────┐  │
│ │ Total: 114 Controls                                            │  │
│ │ ✓ Compliant:       96 (84% - Compliant)    ▓▓▓▓▓▓░░░░         │  │
│ │ ⚠ Partially:        12 (11% - Working On)  ▓░░░░░░░░░         │  │
│ │ ✗ Non-Compliant:     6 (5% - Gap)          ░░░░░░░░░░         │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│ ┌─ CONTROL DETAILS ──────────────────────────────────────────────┐  │
│ │ Filter: [Show All ▼] Status: [All ▼]      [Search Controls]   │  │
│ │                                                                  │  │
│ │ A.5 - ORGANIZATIONAL CONTROLS                                  │  │
│ │ ├─ A.5.1 Policies for information security                    │  │
│ │ │  Status: ✓ COMPLIANT | Score: 100% | Owner: John Smith     │  │
│ │ │  Evidence: [ISO27001_Policy_v2.pdf] [Assessment_Report.pdf]│  │
│ │ │  Last Tested: Mar 15, 2024                                  │  │
│ │ │  [View Details] [Upload Evidence] [Test Again]             │  │
│ │ │                                                              │  │
│ │ ├─ A.5.2 Information security responsibilities               │  │
│ │ │  Status: ⚠ PARTIALLY | Score: 60% | Owner: Sarah Jones    │  │
│ │ │  Gap: Missing formal CISO role definition                  │  │
│ │ │  Target Date: Apr 30, 2024                                │  │
│ │ │  [View Details] [Update] [Link Risk]                       │  │
│ │ │                                                              │  │
│ │ └─ A.5.3 Segregation of duties                              │  │
│ │    Status: ✗ NON-COMPLIANT | Score: 0% | Owner: IT Team    │  │
│ │    Gap: No formal segregation in finance system              │  │
│ │    Target Date: Jun 15, 2024                                 │  │
│ │    [View Details] [Create Action Plan]                       │  │
│ │                                                                  │  │
│ │ A.6 - ASSET MANAGEMENT                                        │  │
│ │ ├─ A.6.1 Assets inventory...                                 │  │
│ │ ...                                                            │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│                      [Run Assessment Again] [Export Report]          │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 Control Mapping (Crosswalk) View

```
┌──────────────────────────────────────────────────────────────────────┐
│ Compliance > Framework Mapping: ISO 27001 ↔ NIST CSF                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ Direction: ISO 27001 → NIST CSF | [Reverse Direction]              │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────┐    │
│ │ ISO Control │ NIST Control │ Mapping │ Alignment │ Action   │    │
│ ├─────────────────────────────────────────────────────────────┤    │
│ │ A.5.1.1     │ GV.PO-01     │ Direct  │ ✓ 100%   │ Linked  │    │
│ │ A.5.2.1     │ GV.RO-01     │ Direct  │ ✓ 100%   │ Linked  │    │
│ │ A.6.1.1     │ OM.PO-02     │ Partial │ ⚠ 70%    │ Review  │    │
│ │ A.7.1.1     │ OE.PO-04     │ Related │ ⚠ 50%    │ Assess  │    │
│ │ A.8.1.1     │ PR.AT-01     │ Direct  │ ✓ 100%   │ Linked  │    │
│ │ ...                                                         │    │
│ └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│ [Generate Gap Analysis] [Export Crosswalk] [View Statistics]        │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 6. Asset Management Module Wireframes

### 6.1 Asset Inventory View

```
┌──────────────────────────────────────────────────────────────────────┐
│ ITAM > Asset Inventory                                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ [+ New Asset] [Import CSV] [Export Excel]  [Kanban] [Map]           │
│                                                                       │
│ Filter: [Asset Type ▼] [Status ▼] [Owner ▼]         [Search Assets] │
│                                                                       │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ Asset Name           │Type    │Owner      │Status │ Risk    │   │
│ ├──────────────────────────────────────────────────────────────┤   │
│ │Production Web Srv-01 │Hardware│DevOps Team│Active │🔴 High │   │
│ │  └─ [Details]        │Server  │John Doe   │OP     │         │   │
│ │                      │        │           │       │         │   │
│ │Payment Portal VM     │Cloud   │Cloud Team │Active │🟡 Med  │   │
│ │  └─ [Details]        │AWS EC2 │Jane Smith │OP     │         │   │
│ │                      │        │           │       │         │   │
│ │MS Office License     │Software│IT Ops     │Active │🟢 Low  │   │
│ │  └─ [Details]        │License │Tom Wilson │OP     │         │   │
│ │                      │        │           │       │         │   │
│ │...                                                           │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│ Showing 1-20 of 324 results                      Page 1 of 17 ❯     │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.2 Asset Lifecycle View

```
┌──────────────────────────────────────────────────────────────────────┐
│ ITAM > Assets > Production Web Server-01 > Lifecycle                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ Asset: Production Web Server-01 (Server) | Owner: DevOps Team       │
│                                                                       │
│ Lifecycle Timeline:                                                   │
│                                                                       │
│ 2023-01-15 [PROCUREMENT]  Ordered from Dell              ───┐       │
│            └─ PO#: PO-2023-8834                           │       │
│                                                            │       │
│ 2023-02-01 [DEPLOYMENT]   Deployed to Data Center A     ├─○       │
│            └─ Configuration: RHEL 8.5, 32GB RAM           │       │
│                                                            │       │
│ 2023-02-15 [OPERATIONAL]  Put into production service   │       │
│            └─ SLA: 99.99% uptime                          │       │
│                                                            │       │
│ 2024-03-20 [MAINTENANCE]  Patching applied               │       │
│            └─ Kernel update + security patches            │       │
│                                                            │       │
│ === CURRENT STATUS: OPERATIONAL ===                       │       │
│                                                            │       │
│ ┌─ Asset Details ────────────────────────────────────────┐│      │
│ │ Serial: SN-12345              Model: PowerEdge R750   ││      │
│ │ Manufacturer: DELL            Cost: $8,500             ││      │
│ │ Purchase: Jan 15, 2023        Warranty: Jan 15, 2026  ││      │
│ │ Owner: John Doe (DevOps)      Custodian: IT Ops Team  ││      │
│ │ Department: Infrastructure     Location: DC-A-Rack-42  ││      │
│ └────────────────────────────────────────────────────────┘│      │
│                                                            │       │
│ ┌─ Associated Risks/Vulnerabilities ────────────────────┐│       │
│ │ • RISK-0342: Unpatched Vulnerability (Mitigating)    ││       │
│ │ • VULN-0523: SQL Injection (Remediated)              ││       │
│ │ • INC-0034: Unauthorized Access (Resolved)            ││       │
│ └────────────────────────────────────────────────────────┘│       │
│                                                            │       │
│                                                            ┌───    │
│                                                            │       │
│ Planned Events:                                           │       │
│ • 2026-01-15 [WARRANTY_EXPIRY] Warranty expires         │      │
│ • 2027-01-15 [POTENTIAL_DISPOSAL] Plan replacement      │      │
│                                                            └───    │
│                                                                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 7. Incident Response Wireframes

### 7.1 Incident Board View

```
┌──────────────────────────────────────────────────────────────────────┐
│ Security Incident Response > Incidents                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ View: [Timeline] [Board] [List] [Metrics]  [+ New Incident]         │
│                                                                       │
│ ┌─ DETECTED ─────────┐ ┌─ RESPONDING ───┐ ┌─ RECOVERING ──┐ ┌─ RESOLVED ┐
│ │                    │ │                │ │               │ │           │
│ │ INC-0035          │ │ INC-0034      │ │ INC-0031     │ │ INC-0030 │
│ │ Data Exfil Attempt│ │ Unauthorized  │ │ Malware      │ │ DDoS     │
│ │ 🔴 CRITICAL       │ │ Access        │ │ Incident     │ │ Attack   │
│ │ 2 hours old       │ │ 🔴 CRITICAL   │ │ 🟡 HIGH      │ │ 🟢 LOW   │
│ │                    │ │ 12 hours old  │ │ 1 day old    │ │ 2 days   │
│ │ [View] [Assign]   │ │               │ │              │ │ [Close]  │
│ │                    │ │ [View] [Escalate]           │ │          │
│ │ INC-0033          │ │                │ │              │ │          │
│ │ Phishing Campaign │ │ [View]        │ │ INC-0029   │ │          │
│ │ 🟡 HIGH           │ │                │ │ Ransomware │ │          │
│ │ 4 hours old       │ │                │ │ 🔴 CRITICAL│ │          │
│ │                    │ │                │ │ [View]     │ │          │
│ │ [View]            │ │                │ │            │ │          │
│ │                    │ │                │ │            │ │          │
│ └────────────────────┘ └────────────────┘ └────────────┘ └──────────┘
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.2 Incident Timeline View

```
┌────────────────────────────────────────────────────────────────────┐
│ Security Incident Response > INC-0034: Unauthorized Access         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ Status: 🔴 CRITICAL | Commander: Sarah Johnson | Opened: 12h ago│
│                                                                    │
│ Timeline View:                                                     │
│                                                                    │
│ Mar 26, 08:15  ┌─ DETECT Phase ──────────────────────────┐      │
│                │ Alert triggered by SIEM                 │      │
│                │ Multiple failed login attempts detected │      │
│                │ From IP: 192.168.1.100                  │      │
│                │ Successful breach at 08:32              │      │
│                │ Reported by: Security Team              │      │
│                │ [Evidence: Alert_Screenshot.pdf]        │      │
│                └────────────────────────────────────────┘      │
│                       ▲                                           │
│                       │ 17 minutes                                │
│                       ▼                                           │
│ Mar 26, 08:32  ┌─ RESPOND Phase ────────────────────────┐      │
│                │ Incident Commander assigned             │      │
│                │ Investigation team called               │      │
│                │ Forensics data collected                │      │
│                │ Attacker account disabled               │      │
│                │ [IP Blocked] [Account Suspended]       │      │
│                │ 12:00 - Root cause identified:          │      │
│                │ Compromised API key in GitHub           │      │
│                │ Containment completed at 15:32          │      │
│                └────────────────────────────────────────┘      │
│                       ▲                                           │
│                       │ 7 hours                                   │
│                       ▼                                           │
│ Mar 26, 15:32  ┌─ RECOVER Phase ─────────────────────────┐     │
│                │ Systems restored from backup            │      │
│                │ All API keys rotated                     │      │
│                │ MFA enabled on admin accounts            │      │
│                │ Recovery completed at 17:45             │      │
│                │ Systems back in operation (99.9%)       │      │
│                └────────────────────────────────────────┘      │
│                       ▲                                           │
│                       │ 2 hours 14 min                            │
│                       ▼                                           │
│ Mar 26, 17:45  [INCIDENT STATUS: RESOLVED]                      │
│                                                                    │
│ ┌─ Impacts & Damages ────────────────────────────────────────────┐│
│ │ • Duration: 7.5 hours                                          ││
│ │ • Systems Affected: 3 (Payment API, Customer Portal, Admin)  ││
│ │ • Data Exposed: Customer emails (245 records)                ││
│ │ • Financial Impact: $25,000 (estimated)                       ││
│ │ • Affected Customers: Internal only (no customer impact)      ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                    │
│ ┌─ Root Cause & Preventive Measures ─────────────────────────────┐│
│ │ Root Cause: Secrets stored in GitHub repository               ││
│ │ Resolution: Implemented secret scanning, code review policy   ││
│ │ Preventive: Enforce AWS Secrets Manager, security audit      ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                    │
│                      [Close Incident] [Print Report]             │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 8. Dark/Light Theme Toggle

```
┌──────────────────────────────────┐
│  Light Mode         │ Light Mode  │
│                     │ 🌙 Dark     │  ← Click to toggle
│                     │ 🔄 Auto     │
│  ┌────────────────┐ │             │
│  │░░░░░░░░░░░░░░ │ │             │
│  │░ White BG    ░ │ │             │
│  │░ Dark Text   ░ │ │             │
│  │░ Blue Accent ░ │ │             │
│  └────────────────┘ │             │
│                     │             │
│  Dark Mode          │             │
│  ┌────────────────┐ │             │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │             │
│  │▓ Dark BG     ▓ │ │             │
│  │▓ Light Text  ▓ │ │             │
│  │▓ Blue Accent ▓ │ │             │
│  └────────────────┘ │             │
│                     │             │
└──────────────────────────────────┘
```

---

## 9. Design System Colors

| Component | Light Mode | Dark Mode |
|-----------|-----------|----------|
| Background | #FFFFFF | #1A1A1A |
| Surface | #F5F5F5 | #2D2D2D |
| Text Primary | #1A1A1A | #FFFFFF |
| Text Secondary | #666666 | #AAAAAA |
| Border | #DDDDDD | #404040 |
| Accent | #0066CC | #4DB8FF |
| Success | #00AA00 | #44DD44 |
| Warning | #FF9900 | #FFBB44 |
| Error | #DD0000 | #FF6666 |
| Info | #0066CC | #4DB8FF |

---

## 10. Responsive Breakpoints

- **Mobile**: 0px - 599px (Single column, bottom nav)
- **Tablet**: 600px - 1023px (2-column layout)
- **Desktop**: 1024px - 1919px (Full sidebar + content)
- **Wide**: 1920px+ (Fixed-width container, optimized spacing)

---

## 11. Accessibility Requirements

✓ WCAG 2.1 AA compliance
✓ Keyboard navigation support
✓ Screen reader compatible
✓ Alt text for all images
✓ Focus indicators for interactive elements
✓ Color contrast ratio ≥ 4.5:1 for text

---

**Design System Version:** 1.0
**Last Updated:** March 2026
**Design Tools:** Figma, Adobe XD compatible
