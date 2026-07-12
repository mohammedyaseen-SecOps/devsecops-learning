describe('Security Incidents E2E Tests', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
      cy.navigateToModule('incidents');
    });
  });

  describe('Incidents List', () => {
    it('should display incidents page', () => {
      cy.url().should('include', '/dashboard/incidents');
      cy.get('[data-testid="incidents-header"]').should('be.visible');
    });

    it('should display incident statistics', () => {
      cy.get('[data-testid="stat-total-incidents"]').should('be.visible');
      cy.get('[data-testid="stat-active"]').should('be.visible');
      cy.get('[data-testid="stat-critical"]').should('be.visible');
      cy.get('[data-testid="stat-resolved"]').should('be.visible');
    });

    it('should display incidents table', () => {
      cy.get('[data-testid="incidents-table"]').should('be.visible');
    });

    it('should display incident status badges', () => {
      cy.get('[data-testid="status-badge"]').should('have.length.greaterThan', 0);
    });

    it('should display severity levels', () => {
      cy.get('[data-testid="severity-badge"]').should('have.length.greaterThan', 0);
    });

    it('should display incident timeline view', () => {
      cy.get('[data-testid="view-toggle-timeline"]').click();
      cy.get('[data-testid="incident-timeline"]').should('be.visible');
    });
  });

  describe('Create Incident', () => {
    it('should open create incident modal', () => {
      cy.get('[data-testid="create-incident-btn"]').click();
      cy.get('[data-testid="create-incident-modal"]').should('be.visible');
    });

    it('should display form fields', () => {
      cy.get('[data-testid="create-incident-btn"]').click();
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('input[id*="title"]').should('be.visible');
        cy.get('textarea[id*="description"]').should('be.visible');
        cy.get('select[id*="severity"]').should('be.visible');
        cy.get('input[id*="affectedSystems"]').should('be.visible');
      });
    });

    it('should create incident successfully', () => {
      cy.fixture('test-data').then((data) => {
        cy.get('[data-testid="create-incident-btn"]').click();
        cy.get('[data-testid="modal"]').within(() => {
          cy.get('input[id*="title"]').type(data.testIncident.title);
          cy.get('textarea[id*="description"]').type(data.testIncident.description);
          cy.get('select[id*="severity"]').select(data.testIncident.severity);
          cy.get('input[id*="affectedSystems"]').type(data.testIncident.affectedSystems);
          cy.get('[data-testid="modal-submit"]').click();
        });
        
        cy.contains('Incident created successfully', { timeout: 5000 }).should('be.visible');
      });
    });
  });

  describe('Incident Status Workflow', () => {
    it('should change incident status', () => {
      cy.get('[data-testid="incident-row"]').first().within(() => {
        cy.get('[data-testid="status-dropdown"]').click();
      });
      
      cy.get('[data-testid="status-menu"]').within(() => {
        cy.contains('Investigating').click();
      });
      
      cy.contains('Status updated', { timeout: 5000 }).should('be.visible');
    });

    it('should progress through workflow states', () => {
      const statuses = ['Acknowledged', 'Investigating', 'Resolved', 'Closed'];
      
      cy.get('[data-testid="incident-row"]').first().within(() => {
        statuses.forEach((status) => {
          cy.get('[data-testid="status-dropdown"]').click();
          cy.get('[data-testid="status-menu"]').contains(status).click();
          cy.get('[data-testid="status-badge"]').should('contain', status);
        });
      });
    });

    it('should not allow status downgrade', () => {
      cy.get('[data-testid="incident-row"]').first().within(() => {
        cy.get('[data-testid="status-dropdown"]').click();
      });
      
      cy.get('[data-testid="status-menu"]').within(() => {
        cy.contains('New').should('not.exist');
      });
    });
  });

  describe('Incident Details', () => {
    it('should open incident details', () => {
      cy.get('[data-testid="incident-row"]').first().click();
      cy.get('[data-testid="incident-details-modal"]').should('be.visible');
    });

    it('should display incident timeline', () => {
      cy.get('[data-testid="incident-row"]').first().click();
      cy.get('[data-testid="incident-timeline"]').should('be.visible');
    });

    it('should display affected systems', () => {
      cy.get('[data-testid="incident-row"]').first().click();
      cy.get('[data-testid="affected-systems"]').should('be.visible');
    });

    it('should add timeline event', () => {
      cy.get('[data-testid="incident-row"]').first().click();
      cy.get('[data-testid="add-timeline-event"]').click();
      cy.get('[data-testid="event-form"]').should('be.visible');
      cy.get('[data-testid="event-description"]').type('Investigation started');
      cy.get('[data-testid="event-submit"]').click();
      cy.contains('Event added', { timeout: 5000 }).should('be.visible');
    });

    it('should edit incident details', () => {
      cy.get('[data-testid="incident-row"]').first().click();
      cy.get('[data-testid="edit-incident-btn"]').click();
      cy.get('[data-testid="incident-form"]').should('be.visible');
      cy.get('select[id*="severity"]').select('Critical');
      cy.get('[data-testid="form-submit"]').click();
      cy.contains('Incident updated', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Incident Filtering', () => {
    it('should filter by severity', () => {
      cy.get('[data-testid="severity-filter"]').select('Critical');
      cy.get('[data-testid="incident-row"]').each(($row) => {
        cy.wrap($row).should('contain', 'Critical');
      });
    });

    it('should filter by status', () => {
      cy.get('[data-testid="status-filter"]').select('Investigating');
      cy.get('[data-testid="incident-row"]').each(($row) => {
        cy.wrap($row).should('contain', 'Investigating');
      });
    });

    it('should filter by date range', () => {
      cy.get('[data-testid="date-from"]').type('2026-03-01');
      cy.get('[data-testid="date-to"]').type('2026-03-31');
      cy.get('[data-testid="apply-filter"]').click();
      
      cy.get('[data-testid="incident-row"]').should('have.length.greaterThan', 0);
    });

    it('should search incidents', () => {
      cy.get('[data-testid="search-input"]').type('Login Attempts');
      cy.get('[data-testid="incident-row"]').should('contain', 'Login Attempts');
    });
  });

  describe('Incident Actions', () => {
    it('should escalate incident', () => {
      cy.get('[data-testid="incident-row"]').first().within(() => {
        cy.get('[data-testid="actions-menu"]').click();
      });
      
      cy.get('[data-testid="escalate-action"]').click();
      cy.contains('Incident escalated', { timeout: 5000 }).should('be.visible');
    });

    it('should assign incident', () => {
      cy.get('[data-testid="incident-row"]').first().within(() => {
        cy.get('[data-testid="actions-menu"]').click();
      });
      
      cy.get('[data-testid="assign-action"]').click();
      cy.get('[data-testid="assign-modal"]').should('be.visible');
      cy.get('select[id*="assignee"]').select('Security Team');
      cy.get('[data-testid="modal-submit"]').click();
      cy.contains('Incident assigned', { timeout: 5000 }).should('be.visible');
    });

    it('should archive incident', () => {
      cy.get('[data-testid="incident-row"]').first().within(() => {
        cy.get('[data-testid="actions-menu"]').click();
      });
      
      cy.get('[data-testid="archive-action"]').click();
      cy.get('[data-testid="confirmation"]').should('be.visible');
      cy.get('[data-testid="confirm-btn"]').click();
      cy.contains('Incident archived', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Incident Reporting', () => {
    it('should generate incident report', () => {
      cy.get('[data-testid="generate-report-btn"]').click();
      cy.get('[data-testid="report-modal"]').should('be.visible');
    });

    it('should export report to PDF', () => {
      cy.get('[data-testid="generate-report-btn"]').click();
      cy.get('[data-testid="export-pdf"]').click();
      cy.readFile('cypress/downloads/incidents-report.pdf').should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="incident-card"]').should('have.length.greaterThan', 0);
    });

    it('should display correctly on desktop', () => {
      cy.viewport('macbook-15');
      cy.get('[data-testid="incidents-table"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should pass accessibility checks', () => {
      cy.checkAccessibility();
    });
  });
});
