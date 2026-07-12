describe('Compliance Frameworks E2E Tests', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
      cy.navigateToModule('compliance');
    });
  });

  describe('Compliance List', () => {
    it('should display compliance page', () => {
      cy.url().should('include', '/dashboard/compliance');
      cy.get('[data-testid="compliance-header"]').should('be.visible');
    });

    it('should display compliance statistics', () => {
      cy.get('[data-testid="stat-total-frameworks"]').should('be.visible');
      cy.get('[data-testid="stat-completed"]').should('be.visible');
      cy.get('[data-testid="stat-in-progress"]').should('be.visible');
      cy.get('[data-testid="stat-avg-score"]').should('be.visible');
    });

    it('should display framework cards', () => {
      cy.get('[data-testid="framework-card"]').should('have.length.greaterThan', 0);
    });

    it('should display progress bars', () => {
      cy.get('[data-testid="progress-bar"]').should('have.length.greaterThan', 0);
    });

    it('should display compliance score', () => {
      cy.get('[data-testid="compliance-score"]').should('have.length.greaterThan', 0);
      cy.get('[data-testid="compliance-score"]').first().should('match', /^\d+%$/);
    });

    it('should display framework status', () => {
      cy.get('[data-testid="framework-status"]').should('contain', 'Not Started').or('contain', 'In Progress').or('contain', 'Completed');
    });
  });

  describe('Framework Details', () => {
    it('should open framework details', () => {
      cy.get('[data-testid="framework-card"]').first().click();
      cy.get('[data-testid="framework-details-modal"]').should('be.visible');
    });

    it('should display framework controls', () => {
      cy.get('[data-testid="framework-card"]').first().click();
      cy.get('[data-testid="controls-list"]').should('be.visible');
      cy.get('[data-testid="control-item"]').should('have.length.greaterThan', 0);
    });

    it('should show control status', () => {
      cy.get('[data-testid="framework-card"]').first().click();
      cy.get('[data-testid="control-checkbox"]').should('have.length.greaterThan', 0);
    });

    it('should update control status', () => {
      cy.get('[data-testid="framework-card"]').first().click();
      cy.get('[data-testid="control-checkbox"]').first().click();
      cy.contains('Control updated', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Create Framework', () => {
    it('should open create framework modal', () => {
      cy.get('[data-testid="create-framework-btn"]').click();
      cy.get('[data-testid="create-framework-modal"]').should('be.visible');
    });

    it('should display framework form fields', () => {
      cy.get('[data-testid="create-framework-btn"]').click();
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('select[id*="framework"]').should('be.visible');
        cy.get('textarea[id*="description"]').should('be.visible');
        cy.get('input[id*="dueDate"]').should('be.visible');
      });
    });

    it('should create framework successfully', () => {
      cy.get('[data-testid="create-framework-btn"]').click();
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('select[id*="framework"]').select('ISO 27001');
        cy.get('textarea[id*="description"]').type('Test framework implementation');
        cy.get('input[id*="dueDate"]').type('2026-12-31');
        cy.get('[data-testid="modal-submit"]').click();
      });
      
      cy.contains('Framework created successfully', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Control Mapping', () => {
    it('should display control mapping interface', () => {
      cy.get('[data-testid="framework-card"]').first().click();
      cy.get('[data-testid="control-mapping"]').should('be.visible');
    });

    it('should map controls to requirements', () => {
      cy.get('[data-testid="framework-card"]').first().click();
      cy.get('[data-testid="map-control-btn"]').first().click();
      cy.get('[data-testid="mapping-modal"]').should('be.visible');
    });

    it('should display mapped requirements', () => {
      cy.get('[data-testid="framework-card"]').first().click();
      cy.get('[data-testid="control-requirement"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Compliance Filtering', () => {
    it('should filter by framework type', () => {
      cy.get('[data-testid="framework-type-filter"]').select('ISO 27001');
      cy.get('[data-testid="framework-card"]').should('contain', 'ISO 27001');
    });

    it('should filter by status', () => {
      cy.get('[data-testid="framework-status-filter"]').select('Completed');
      cy.get('[data-testid="framework-card"]').each(($card) => {
        cy.wrap($card).should('contain', 'Completed');
      });
    });

    it('should search frameworks', () => {
      cy.get('[data-testid="search-input"]').type('ISO');
      cy.get('[data-testid="framework-card"]').should('contain', 'ISO');
    });
  });

  describe('Compliance Reporting', () => {
    it('should generate compliance report', () => {
      cy.get('[data-testid="generate-report-btn"]').click();
      cy.get('[data-testid="report-options"]').should('be.visible');
    });

    it('should export report to PDF', () => {
      cy.get('[data-testid="generate-report-btn"]').click();
      cy.get('[data-testid="export-pdf"]').click();
      cy.readFile('cypress/downloads/compliance-report.pdf').should('exist');
    });

    it('should export report to Excel', () => {
      cy.get('[data-testid="generate-report-btn"]').click();
      cy.get('[data-testid="export-excel"]').click();
      cy.readFile('cypress/downloads/compliance-report.xlsx').should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="framework-card"]').should('have.length.greaterThan', 0);
    });

    it('should display correctly on desktop', () => {
      cy.viewport('macbook-15');
      cy.get('[data-testid="frameworks-list"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should pass accessibility checks', () => {
      cy.checkAccessibility();
    });
  });
});
