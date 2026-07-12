# Integration Guide - Enterprise GRC SaaS Platform

## 1. Integration Architecture Overview

```
GRC Platform Core
    │
    ├─► SIEM Integration (Splunk, ELK, Datadog)
    ├─► Cloud Providers (AWS, Azure, GCP)
    ├─► EDR/XDR (CrowdStrike, Microsoft Sentinel)
    ├─► Ticketing (Jira, Azure DevOps, Linear)
    ├─► Vulnerability Scanners (Nessus, OpenVAS, Qualys)
    ├─► Identity Providers (Okta, Azure AD, Ping)
    ├─► Communication (Slack, Teams, PagerDuty)
    ├─► Cloud Storage (Sharepoint, Google Drive, OneDrive)
    ├─► Communication Platforms (Slack, MS Teams)
    └─► Enterprise Platforms (ServiceNow, SAP)
```

---

## 2. SIEM Integration

### 2.1 Splunk Integration

#### API Configuration
```bash
# Splunk Connection Details
SPLUNK_HOST=splunk.company.com
SPLUNK_PORT=8089
SPLUNK_USERNAME=grc_api_user
SPLUNK_HEC_TOKEN=encrypted_hec_token
SPLUNK_INDEX=grc_events
SPLUNK_SOURCETYPE=_json
```

#### Implementation
```javascript
// backend/src/integrations/splunk.js
const SplunkConnector = require('@splunk/sdk').Client;

class SplunkIntegration {
  constructor(config) {
    this.client = new SplunkConnector({
      scheme: 'https',
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password
    });
  }

  async ingestAlert(alert) {
    // Send alert to Splunk for correlation
    const payload = {
      event: {
        risk_id: alert.risk_id,
        title: alert.title,
        severity: alert.severity,
        timestamp: new Date().toISOString()
      },
      source: 'grc-platform'
    };
    return await this.client.post('/data/hec', payload);
  }

  async queryIncidents(timeRange) {
    // Query Splunk for incidents
    const search = `
      index=${this.config.index}
      source=splunk_incidents
      earliest=${timeRange.start}
      latest=${timeRange.end}
    `;
    return await this.client.search(search);
  }
}

module.exports = SplunkIntegration;
```

#### Webhook Configuration (Splunk → GRC)
```
URL: https://api.grc-platform.com/integrations/splunk/webhook
Headers:
  Authorization: Bearer {integration_token}
  Content-Type: application/json

Event Mapping:
- Splunk Alert → GRC Incident
- Alert severity → Incident priority
- Alert tags → GRC tags
```

### 2.2 Elasticsearch Integration

```javascript
const { Client } = require('@elastic/elasticsearch');

class ElasticsearchIntegration {
  constructor(config) {
    this.client = new Client({
      node: config.host,
      auth: {
        username: config.username,
        password: config.password
      }
    });
  }

  async createIndex(indexName) {
    await this.client.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            risk_id: { type: 'keyword' },
            title: { type: 'text' },
            severity: { type: 'keyword' },
            timestamp: { type: 'date' },
            tenant_id: { type: 'keyword' }
          }
        }
      }
    });
  }

  async indexEvent(event) {
    await this.client.index({
      index: 'grc-events',
      body: event
    });
  }

  async search(query) {
    return await this.client.search({
      index: 'grc-events',
      body: query
    });
  }
}

module.exports = ElasticsearchIntegration;
```

---

## 3. Cloud Provider Integration

### 3.1 AWS Integration

#### Configuration
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=encrypted_key
AWS_SECRET_ACCESS_KEY=encrypted_secret
AWS_S3_BUCKET=grc-reports
AWS_LAMBDA_ARN=arn:aws:lambda:us-east-1:123456789:function:grc-processor
```

#### Implementation
```javascript
const AWS = require('aws-sdk');

class AWSIntegration {
  constructor(config) {
    AWS.config.update({
      region: config.region,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    });
    this.s3 = new AWS.S3();
    this.ec2 = new AWS.EC2();
    this.rds = new AWS.RDS();
  }

  async discoverAssets() {
    // Discover EC2 instances
    const ec2Data = await this.ec2.describeInstances().promise();
    const instances = ec2Data.Reservations.flatMap(r => r.Instances);

    // Discover RDS databases
    const rdsData = await this.rds.describeDBInstances().promise();
    const databases = rdsData.DBInstances;

    // Map to GRC assets
    const assets = [
      ...instances.map(i => this.mapEC2toAsset(i)),
      ...databases.map(d => this.mapRDStoAsset(d))
    ];

    return assets;
  }

  mapEC2toAsset(instance) {
    return {
      asset_type: 'cloud',
      asset_category: 'aws-ec2',
      asset_name: instance.Tags?.find(t => t.Key === 'Name')?.Value || instance.InstanceId,
      owner: 'AWS Account',
      status: 'active',
      external_id: instance.InstanceId,
      details: {
        instance_type: instance.InstanceType,
        availability_zone: instance.Placement.AvailabilityZone,
        subnet_id: instance.SubnetId,
        state: instance.State.Name
      }
    };
  }

  async uploadReport(report, fileName) {
    const params = {
      Bucket: 'grc-reports',
      Key: `${new Date().toISOString()}/${fileName}`,
      Body: JSON.stringify(report),
      ContentType: 'application/json'
    };
    return await this.s3.upload(params).promise();
  }
}

module.exports = AWSIntegration;
```

### 3.2 Azure Integration

```javascript
const { DefaultAzureCredential } = require('@azure/identity');
const { ComputeManagementClient } = require('@azure/arm-compute');

class AzureIntegration {
  constructor(config) {
    const credential = new DefaultAzureCredential();
    this.computeClient = new ComputeManagementClient(
      credential,
      config.subscriptionId
    );
  }

  async discoverVMs(resourceGroup) {
    const vms = await this.computeClient.virtualMachines.list(resourceGroup);
    return vms.map(vm => ({
      asset_type: 'cloud',
      asset_category: 'azure-vm',
      asset_name: vm.name,
      external_id: vm.id,
      status: 'active'
    }));
  }
}

module.exports = AzureIntegration;
```

---

## 4. Ticketing System Integration

### 4.1 Jira Integration

#### Configuration
```bash
JIRA_HOST=jira.company.com
JIRA_USERNAME=grc_integration
JIRA_API_TOKEN=encrypted_token
JIRA_PROJECT_KEY=SEC
```

#### Implementation
```javascript
const JiraClient = require('jira-client');

class JiraIntegration {
  constructor(config) {
    this.jira = new JiraClient({
      protocol: 'https',
      host: config.host,
      username: config.username,
      password: config.apiToken,
      apiVersion: '2',
      strictSSL: true
    });
  }

  async createTicket(incident) {
    const issue = await this.jira.addIssue({
      fields: {
        project: { key: 'SEC' },
        summary: incident.title,
        description: incident.description,
        issuetype: { name: 'Bug' },
        priority: { name: this.mapPriority(incident.severity) },
        labels: ['grc-incident', `severity-${incident.severity}`],
        customfield_10000: incident.incident_id
      }
    });
    return issue;
  }

  async updateTicket(jiraKey, grcData) {
    await this.jira.updateIssue(jiraKey, {
      fields: {
        description: grcData.description,
        status: { name: this.mapStatus(grcData.status) }
      }
    });
  }

  mapPriority(severity) {
    const map = {
      'critical': 'Blocker',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return map[severity] || 'Medium';
  }

  mapStatus(status) {
    const map = {
      'open': 'To Do',
      'in-progress': 'In Progress',
      'resolved': 'Done'
    };
    return map[status] || 'To Do';
  }

  // Bidirectional sync
  async webhookHandler(jiraEvent) {
    if (jiraEvent.webhookEvent === 'jira:issue_updated') {
      // Sync Jira ticket status back to GRC
      const { key, fields } = jiraEvent.issue;
      return await this.syncToGRC(key, fields);
    }
  }
}

module.exports = JiraIntegration;
```

### 4.2 Linear Integration

```javascript
const { LinearClient } = require('@linear/sdk');

class LinearIntegration {
  constructor(config) {
    this.client = new LinearClient({
      apiKey: config.apiKey
    });
  }

  async createIssue(incident) {
    const issue = await this.client.createIssue({
      teamId: this.config.teamId,
      title: incident.title,
      description: incident.description,
      priority: this.mapPriority(incident.severity),
      labels: ['grc-incident']
    });
    return issue;
  }

  async updateIssue(issueId, updates) {
    await this.client.updateIssue(issueId, updates);
  }
}

module.exports = LinearIntegration;
```

---

## 5. Vulnerability Scanner Integration

### 5.1 Nessus Integration

```javascript
const axios = require('axios');

class NessusIntegration {
  constructor(config) {
    this.apiUrl = `https://${config.host}:8834`;
    this.headers = {
      'X-ApiKeys': `accessKey=${config.accessKey};secretKey=${config.secretKey}`
    };
  }

  async scanAssets(assetIds) {
    // Create scan
    const scanTemplate = await this.getScanTemplate('basic');
    const scan = await this.createScan({
      uuid: scanTemplate.uuid,
      settings: {
        name: `GRC Scan - ${new Date().toISOString()}`,
        target_network: assetIds.join(',')
      }
    });

    // Launch scan
    await this.launchScan(scan.id);
    return scan.id;
  }

  async getVulnerabilities(scanId) {
    const response = await axios.get(
      `${this.apiUrl}/scans/${scanId}`,
      { headers: this.headers }
    );
    
    const vulns = response.data.vulnerabilities.map(v => ({
      vulnerability_id: `NESSUS-${scanId}-${v.plugin_id}`,
      cve_id: v.cve,
      title: v.plugin_name,
      severity: this.mapSeverity(v.severity),
      cvss_score: v.cvss_score,
      description: v.description,
      remediation: v.solution,
      affected_asset_id: v.host_id,
      scanner_name: 'nessus'
    }));

    return vulns;
  }

  mapSeverity(nessusSeverity) {
    const map = { 0: 'info', 1: 'low', 2: 'medium', 3: 'high', 4: 'critical' };
    return map[nessusSeverity];
  }

  async createScan(config) {
    const response = await axios.post(
      `${this.apiUrl}/scans`,
      config,
      { headers: this.headers }
    );
    return response.data.scan;
  }

  async launchScan(scanId) {
    await axios.post(
      `${this.apiUrl}/scans/${scanId}/launch`,
      {},
      { headers: this.headers }
    );
  }

  async getScanTemplate(name) {
    const response = await axios.get(
      `${this.apiUrl}/editor/template/scan`,
      { headers: this.headers, params: { filter: `name:eq:${name}` } }
    );
    return response.data.templates[0];
  }
}

module.exports = NessusIntegration;
```

### 5.2 OpenVAS Integration

```javascript
const { OpenVasConnector } = require('openvas-connector');

class OpenVASIntegration {
  constructor(config) {
    this.connector = new OpenVasConnector({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password
    });
  }

  async createAndRunScan(targetIds) {
    // Create target
    const target = await this.connector.createTarget({
      name: `GRC Target - ${new Date().toISOString()}`,
      hosts: targetIds
    });

    // Create task
    const task = await this.connector.createTask({
      name: `GRC Scan - ${target.id}`,
      target_id: target.id
    });

    // Start scan
    await this.connector.startTask(task.id);
    return task.id;
  }

  async getVulnerabilities(taskId) {
    const report = await this.connector.getReport(taskId);
    return report.results.map(result => ({
      vulnerability_id: result.id,
      cve_id: result.nvt.cve,
      title: result.nvt.name,
      severity: result.severity,
      cvss_score: result.cvss_score
    }));
  }
}

module.exports = OpenVASIntegration;
```

---

## 6. Identity Provider Integration

### 6.1 Okta Integration

```javascript
const OktaClient = require('@okta/okta-sdk-nodejs').Client;

class OktaIntegration {
  constructor(config) {
    this.client = new OktaClient({
      orgUrl: config.orgUrl,
      token: config.apiToken
    });
  }

  async getUser(email) {
    const users = await this.client.listUsers({ search: `profile.email eq "${email}"` });
    return users[0];
  }

  async createUser(userData) {
    const user = await this.client.createUser({
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        login: userData.email
      }
    }, { activate: true });
    return user;
  }

  async assignUserToGroup(userId, groupName) {
    const group = await this.getGroupByName(groupName);
    await this.client.addUserToGroup(group.id, userId);
  }

  async getGroupByName(name) {
    const groups = await this.client.listGroups({ q: name });
    return groups[0];
  }
}

module.exports = OktaIntegration;
```

---

## 7. Communication Integration

### 7.1 Slack Integration

```javascript
const { WebClient } = require('@slack/web-api');

class SlackIntegration {
  constructor(config) {
    this.slack = new WebClient(config.botToken);
    this.config = config;
  }

  async notifyIncident(incident) {
    await this.slack.chat.postMessage({
      channel: this.config.channelId,
      attachments: [
        {
          color: this.getSeverityColor(incident.severity),
          title: incident.title,
          text: incident.description,
          fields: [
            { title: 'Severity', value: incident.severity, short: true },
            { title: 'ID', value: incident.incident_id, short: true },
            { title: 'Status', value: incident.status, short: true }
          ],
          actions: [
            {
              type: 'button',
              text: 'View in GRC',
              url: `https://grc-platform.com/incidents/${incident.id}`
            }
          ]
        }
      ]
    });
  }

  async notifyRiskApproval(risk) {
    await this.slack.chat.postMessage({
      channel: this.config.channelId,
      text: `⚠️ Risk Approval Required: ${risk.title}`,
      attachments: [
        {
          title: risk.title,
          text: risk.description,
          fields: [
            { title: 'Risk Rating', value: risk.risk_rating },
            { title: 'Owner', value: risk.owner_name }
          ],
          actions: [
            {
              type: 'button',
              text: 'Approve',
              url: `https://grc-platform.com/risks/${risk.id}?action=approve`,
              style: 'primary'
            },
            {
              type: 'button',
              text: 'Reject',
              url: `https://grc-platform.com/risks/${risk.id}?action=reject`,
              style: 'danger'
            }
          ]
        }
      ]
    });
  }

  getSeverityColor(severity) {
    const colors = {
      'critical': 'danger',
      'high': 'warning',
      'medium': '#0099ff',
      'low': 'good'
    };
    return colors[severity] || '#999999';
  }
}

module.exports = SlackIntegration;
```

---

## 8. Integration Configuration Template

```bash
# .env.integrations (NEVER commit to git!)
# SIEM Integration
SPLUNK_HOST=splunk.company.com
SPLUNK_PORT=8089
SPLUNK_HEC_TOKEN=<encrypted>
ELASTICSEARCH_HOST=elasticsearch.company.com
ELASTICSEARCH_USERNAME=<username>
ELASTICSEARCH_PASSWORD=<encrypted>

# Cloud Providers
AWS_REGION=us-east-1
AWS_ACCESS_KEY=<encrypted>
AWS_SECRET_KEY=<encrypted>
AWS_S3_BUCKET=grc-reports
AZURE_SUBSCRIPTION_ID=<uuid>
AZURE_TENANT_ID=<uuid>
GCP_PROJECT_ID=<project-id>
GCP_SERVICE_ACCOUNT=<json-encrypted>

# Ticketing
JIRA_HOST=jira.company.com
JIRA_USERNAME=grc_integration
JIRA_API_TOKEN=<encrypted>
LINEAR_API_KEY=<encrypted>

# Vulnerability Scanners
NESSUS_HOST=nessus.company.com
NESSUS_ACCESS_KEY=<encrypted>
NESSUS_SECRET_KEY=<encrypted>
OPENVAS_HOST=openvas.company.com
OPENVAS_USERNAME=admin
OPENVAS_PASSWORD=<encrypted>

# Identity Providers
OKTA_ORG_URL=https://company.okta.com
OKTA_API_TOKEN=<encrypted>
AZURE_AD_TENANT_ID=<uuid>
AZURE_AD_CLIENT_ID=<uuid>
AZURE_AD_CLIENT_SECRET=<encrypted>

# Communication
SLACK_BOT_TOKEN=<encrypted>
SLACK_CHANNEL_ID=C1234567890
TEAMS_WEBHOOK_URL=<encrypted>
PAGERDUTY_API_KEY=<encrypted>

# Service Account Credentials
SERVICE_ACCOUNT_ID=<uuid>
SERVICE_ACCOUNT_SECRET=<encrypted>
```

---

## 9. Integration Testing

```javascript
// tests/integration/integrations.test.js
describe('Integrations', () => {
  describe('Splunk Integration', () => {
    it('should ingest alerts successfully', async () => {
      const alert = {
        risk_id: 'RISK-123',
        title: 'Test Alert',
        severity: 'high'
      };
      const result = await splunkClient.ingestAlert(alert);
      expect(result.success).toBe(true);
    });

    it('should query incidents', async () => {
      const incidents = await splunkClient.queryIncidents({
        start: '2024-01-01',
        end: '2024-03-31'
      });
      expect(Array.isArray(incidents)).toBe(true);
    });
  });

  describe('Jira Integration', () => {
    it('should create ticket from incident', async () => {
      const incident = {
        title: 'Test Incident',
        severity: 'critical'
      };
      const ticket = await jiraClient.createTicket(incident);
      expect(ticket.key).toMatch(/^SEC-\d+$/);
    });

    it('should sync status updates', async () => {
      const jiraEvent = {
        webhookEvent: 'jira:issue_updated',
        issue: {
          key: 'SEC-123',
          fields: { status: { name: 'Done' } }
        }
      };
      const result = await jiraClient.webhookHandler(jiraEvent);
      expect(result.success).toBe(true);
    });
  });
});
```

---

**Integration Guide Version:** 1.0
**Last Updated:** March 2026
