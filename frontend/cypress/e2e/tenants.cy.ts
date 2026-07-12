describe('Tenants Management E2E Tests', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
      cy.navigateToModule('tenants');
    });
  });

  describe('Tenants List', () => {
    it('should display tenants page', () => {
      cy.url().should('include', '/dashboard/tenants');
      cy.get('[data-testid="tenants-header"]').should('be.visible');
    });

    it('should display tenants table', () => {
      cy.get('[data-testid="tenants-table"]').should('be.visible');
    });

    it('should display all tenant information', () => {
      cy.get('[data-testid="tenant-row"]').first().within(() => {
        cy.get('[data-testid="tenant-name"]').should('be.visible');
        cy.get('[data-testid="tenant-plan"]').should('be.visible');
        cy.get('[data-testid="tenant-status"]').should('be.visible');
        cy.get('[data-testid="tenant-users-count"]').should('be.visible');
      });
    });

    it('should display subscription plan badge', () => {
      cy.get('[data-testid="plan-badge"]').should('have.length.greaterThan', 0);
    });

    it('should display status badge', () => {
      cy.get('[data-testid="status-badge"]').each(($badge) => {
        cy.wrap($badge).should('have.class', 'badge-active').or('have.class', 'badge-trial').or('have.class', 'badge-suspended');
      });
    });
  });

  describe('Create Tenant', () => {
    it('should open create tenant modal', () => {
      cy.get('[data-testid="create-tenant-btn"]').click();
      cy.get('[data-testid="create-tenant-modal"]').should('be.visible');
    });

    it('should display form fields', () => {
      cy.get('[data-testid="create-tenant-btn"]').click();
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('input[id*="name"]').should('be.visible');
        cy.get('input[id*="email"]').should('be.visible');
        cy.get('select[id*="plan"]').should('be.visible');
      });
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="create-tenant-btn"]').click();
      cy.get('[data-testid="modal-submit"]').click();
      cy.contains('Tenant name is required', { timeout: 5000 }).should('be.visible');
    });

    it('should create tenant successfully', () => {
      cy.get('[data-testid="create-tenant-btn"]').click();
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('input[id*="name"]').type('New Tenant Inc');
        cy.get('input[id*="email"]').type('admin@newtenant.com');
        cy.get('select[id*="plan"]').select('Professional');
        cy.get('[data-testid="modal-submit"]').click();
      });
      
      cy.get('[data-testid="modal"]').should('not.exist');
      cy.contains('Tenant created successfully', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Edit Tenant', () => {
    it('should open edit tenant modal', () => {
      cy.get('[data-testid="tenant-row"]').first().within(() => {
        cy.get('[data-testid="edit-btn"]').click();
      });
      cy.get('[data-testid="edit-tenant-modal"]').should('be.visible');
    });

    it('should update tenant details', () => {
      cy.get('[data-testid="tenant-row"]').first().within(() => {
        cy.get('[data-testid="edit-btn"]').click();
      });
      
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('select[id*="plan"]').select('Enterprise');
        cy.get('[data-testid="modal-submit"]').click();
      });
      
      cy.contains('Tenant updated successfully', { timeout: 5000 }).should('be.visible');
    });

    it('should update tenant status', () => {
      cy.get('[data-testid="tenant-row"]').first().within(() => {
        cy.get('[data-testid="status-action"]').click();
      });
      
      cy.get('[data-testid="status-menu"]').within(() => {
        cy.contains('Suspend').click();
      });
      
      cy.get('[data-testid="confirmation-modal"]').should('be.visible');
      cy.get('[data-testid="confirmation-confirm"]').click();
      cy.contains('Tenant suspended', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Delete Tenant', () => {
    it('should delete tenant with confirmation', () => {
      cy.get('[data-testid="tenant-row"]').first().within(() => {
        cy.get('[data-testid="delete-btn"]').click();
      });
      
      cy.get('[data-testid="delete-confirmation"]').should('be.visible');
      cy.get('[data-testid="delete-confirmation-delete"]').click();
      cy.contains('Tenant deleted successfully', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Tenant Filtering', () => {
    it('should filter by subscription plan', () => {
      cy.get('[data-testid="plan-filter"]').select('Professional');
      cy.get('[data-testid="tenant-row"]').each(($row) => {
        cy.wrap($row).should('contain', 'Professional');
      });
    });

    it('should filter by status', () => {
      cy.get('[data-testid="status-filter"]').select('Active');
      cy.get('[data-testid="tenant-row"]').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-testid="status-badge"]').should('contain', 'Active');
        });
      });
    });

    it('should search tenants', () => {
      cy.get('[data-testid="search-input"]').type('Test Tenant');
      cy.get('[data-testid="tenant-row"]').should('contain', 'Test Tenant');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="tenant-card"]').should('have.length.greaterThan', 0);
    });

    it('should display correctly on tablet', () => {
      cy.viewport('ipad-2');
      cy.get('[data-testid="tenants-list"]').should('be.visible');
    });

    it('should display correctly on desktop', () => {
      cy.viewport('macbook-15');
      cy.get('[data-testid="tenants-table"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should pass accessibility checks', () => {
      cy.checkAccessibility();
    });
  });
});
