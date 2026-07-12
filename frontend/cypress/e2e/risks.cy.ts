describe('Risks Registry E2E Tests', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
      cy.navigateToModule('risks');
    });
  });

  describe('Risks List', () => {
    it('should display risks page', () => {
      cy.url().should('include', '/dashboard/risks');
      cy.get('[data-testid="risks-header"]').should('be.visible');
    });

    it('should display risk statistics', () => {
      cy.get('[data-testid="stat-card-total"]').should('be.visible');
      cy.get('[data-testid="stat-card-critical"]').should('be.visible');
      cy.get('[data-testid="stat-card-open"]').should('be.visible');
      cy.get('[data-testid="stat-card-resolved"]').should('be.visible');
    });

    it('should display risks table', () => {
      cy.get('[data-testid="risks-table"]').should('be.visible');
    });

    it('should display severity badges', () => {
      cy.get('[data-testid="severity-badge"]').should('have.length.greaterThan', 0);
    });

    it('should calculate and display risk scores', () => {
      cy.get('[data-testid="risk-score"]').should('have.length.greaterThan', 0);
      cy.get('[data-testid="risk-score"]').first().should('match', /^\d+$/);
    });
  });

  describe('Create Risk', () => {
    it('should open create risk modal', () => {
      cy.get('[data-testid="create-risk-btn"]').click();
      cy.get('[data-testid="create-risk-modal"]').should('be.visible');
    });

    it('should display all form fields', () => {
      cy.get('[data-testid="create-risk-btn"]').click();
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('input[id*="name"]').should('be.visible');
        cy.get('textarea[id*="description"]').should('be.visible');
        cy.get('select[id*="severity"]').should('be.visible');
        cy.get('select[id*="likelihood"]').should('be.visible');
        cy.get('select[id*="impact"]').should('be.visible');
      });
    });

    it('should calculate risk score on severity change', () => {
      cy.get('[data-testid="create-risk-btn"]').click();
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('select[id*="likelihood"]').select('Likely');
        cy.get('select[id*="impact"]').select('Catastrophic');
        cy.get('[data-testid="risk-score-display"]').should('contain', '16');
      });
    });

    it('should create risk successfully', () => {
      cy.fixture('test-data').then((data) => {
        cy.get('[data-testid="create-risk-btn"]').click();
        cy.get('[data-testid="modal"]').within(() => {
          cy.get('input[id*="name"]').type(data.testRisk.name);
          cy.get('textarea[id*="description"]').type(data.testRisk.description);
          cy.get('select[id*="severity"]').select(data.testRisk.severity);
          cy.get('select[id*="likelihood"]').select(data.testRisk.likelihood);
          cy.get('select[id*="impact"]').select(data.testRisk.impact);
          cy.get('[data-testid="modal-submit"]').click();
        });
        
        cy.contains('Risk created successfully', { timeout: 5000 }).should('be.visible');
      });
    });
  });

  describe('Edit Risk', () => {
    it('should open edit risk modal', () => {
      cy.get('[data-testid="risk-row"]').first().within(() => {
        cy.get('[data-testid="edit-btn"]').click();
      });
      cy.get('[data-testid="edit-risk-modal"]').should('be.visible');
    });

    it('should update risk severity', () => {
      cy.get('[data-testid="risk-row"]').first().within(() => {
        cy.get('[data-testid="edit-btn"]').click();
      });
      
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('select[id*="severity"]').select('Medium');
        cy.get('[data-testid="modal-submit"]').click();
      });
      
      cy.contains('Risk updated successfully', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Risk Filtering', () => {
    it('should filter by severity', () => {
      cy.get('[data-testid="severity-filter"]').select('Critical');
      cy.get('[data-testid="risk-row"]').each(($row) => {
        cy.wrap($row).should('contain', 'Critical');
      });
    });

    it('should filter by status', () => {
      cy.get('[data-testid="status-filter"]').select('Open');
      cy.get('[data-testid="risk-row"]').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-testid="status-cell"]').should('contain', 'Open');
        });
      });
    });

    it('should search risks', () => {
      cy.get('[data-testid="search-input"]').type('Access Control');
      cy.get('[data-testid="risk-row"]').should('contain', 'Access Control');
    });
  });

  describe('Risk Matrix View', () => {
    it('should display risk matrix heatmap', () => {
      cy.get('[data-testid="view-toggle-matrix"]').click();
      cy.get('[data-testid="risk-matrix"]').should('be.visible');
    });

    it('should color code matrix by risk level', () => {
      cy.get('[data-testid="view-toggle-matrix"]').click();
      cy.get('[data-testid="matrix-cell"]')
        .first()
        .should('have.css', 'background-color');
    });

    it('should switch back to table view', () => {
      cy.get('[data-testid="view-toggle-matrix"]').click();
      cy.get('[data-testid="view-toggle-table"]').click();
      cy.get('[data-testid="risks-table"]').should('be.visible');
    });
  });

  describe('Risk Export', () => {
    it('should export risks to CSV', () => {
      cy.get('[data-testid="export-btn"]').click();
      cy.get('[data-testid="export-menu"]').within(() => {
        cy.contains('CSV').click();
      });
      
      cy.readFile('cypress/downloads/risks.csv').should('exist');
    });

    it('should export risks to PDF', () => {
      cy.get('[data-testid="export-btn"]').click();
      cy.get('[data-testid="export-menu"]').within(() => {
        cy.contains('PDF').click();
      });
      
      cy.readFile('cypress/downloads/risks.pdf').should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="risk-card"]').should('have.length.greaterThan', 0);
    });

    it('should display correctly on desktop', () => {
      cy.viewport('macbook-15');
      cy.get('[data-testid="risks-table"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should pass accessibility checks', () => {
      cy.checkAccessibility();
    });
  });
});
