describe('Roles Management E2E Tests', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
      cy.navigateToModule('roles');
    });
  });

  describe('Roles List', () => {
    it('should display roles page', () => {
      cy.url().should('include', '/dashboard/roles');
      cy.get('[data-testid="roles-header"]').should('be.visible');
    });

    it('should display role cards', () => {
      cy.get('[data-testid="role-card"]').should('have.length.greaterThan', 0);
    });

    it('should display system roles as read-only', () => {
      cy.get('[data-testid="role-card"]')
        .contains('Admin')
        .closest('[data-testid="role-card"]')
        .within(() => {
          cy.get('[data-testid="edit-btn"]').should('be.disabled');
          cy.get('[data-testid="delete-btn"]').should('be.disabled');
        });
    });

    it('should display role information', () => {
      cy.get('[data-testid="role-card"]').first().within(() => {
        cy.get('[data-testid="role-name"]').should('be.visible');
        cy.get('[data-testid="permissions-count"]').should('be.visible');
        cy.get('[data-testid="users-count"]').should('be.visible');
      });
    });
  });

  describe('Create Role', () => {
    it('should open create role modal', () => {
      cy.get('[data-testid="create-role-btn"]').click();
      cy.get('[data-testid="create-role-modal"]').should('be.visible');
    });

    it('should display role form fields', () => {
      cy.get('[data-testid="create-role-btn"]').click();
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('input[id*="name"]').should('be.visible');
        cy.get('textarea[id*="description"]').should('be.visible');
        cy.get('[data-testid="permissions-list"]').should('be.visible');
      });
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="create-role-btn"]').click();
      cy.get('[data-testid="modal-submit"]').click();
      cy.contains('Role name is required', { timeout: 5000 }).should('be.visible');
    });

    it('should select and deselect permissions', () => {
      cy.get('[data-testid="create-role-btn"]').click();
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('[data-testid="permission-checkbox"]').first().click();
        cy.get('[data-testid="permission-checkbox"]').first().should('be.checked');
        cy.get('[data-testid="permission-checkbox"]').first().click();
        cy.get('[data-testid="permission-checkbox"]').first().should('not.be.checked');
      });
    });

    it('should create custom role successfully', () => {
      cy.get('[data-testid="create-role-btn"]').click();
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('input[id*="name"]').type('Custom Auditor');
        cy.get('textarea[id*="description"]').type('Can audit all systems');
        cy.get('[data-testid="permission-checkbox"]').first().check();
        cy.get('[data-testid="modal-submit"]').click();
      });
      
      cy.get('[data-testid="modal"]').should('not.exist');
      cy.contains('Role created successfully', { timeout: 5000 }).should('be.visible');
      cy.get('[data-testid="role-card"]').contains('Custom Auditor').should('be.visible');
    });
  });

  describe('Edit Role', () => {
    it('should open edit role modal for custom role', () => {
      cy.get('[data-testid="role-card"]')
        .contains('Custom')
        .closest('[data-testid="role-card"]')
        .within(() => {
          cy.get('[data-testid="edit-btn"]').click();
        });
      cy.get('[data-testid="edit-role-modal"]').should('be.visible');
    });

    it('should update role permissions', () => {
      cy.get('[data-testid="role-card"]')
        .contains('Custom')
        .closest('[data-testid="role-card"]')
        .within(() => {
          cy.get('[data-testid="edit-btn"]').click();
        });
      
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('[data-testid="permission-checkbox"]').eq(0).check();
        cy.get('[data-testid="permission-checkbox"]').eq(1).uncheck();
        cy.get('[data-testid="modal-submit"]').click();
      });
      
      cy.contains('Role updated successfully', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Delete Role', () => {
    it('should delete custom role', () => {
      cy.get('[data-testid="role-card"]')
        .contains('Custom')
        .closest('[data-testid="role-card"]')
        .within(() => {
          cy.get('[data-testid="delete-btn"]').click();
        });
      
      cy.get('[data-testid="delete-confirmation"]').should('be.visible');
      cy.get('[data-testid="delete-confirmation-delete"]').click();
      cy.contains('Role deleted successfully', { timeout: 5000 }).should('be.visible');
    });

    it('should prevent deletion of system roles', () => {
      cy.get('[data-testid="role-card"]')
        .contains('Admin')
        .closest('[data-testid="role-card"]')
        .within(() => {
          cy.get('[data-testid="delete-btn"]').should('be.disabled');
        });
    });
  });

  describe('Role Details', () => {
    it('should view role details', () => {
      cy.get('[data-testid="role-card"]').first().click();
      cy.get('[data-testid="role-details-modal"]').should('be.visible');
    });

    it('should display role permissions', () => {
      cy.get('[data-testid="role-card"]').first().click();
      cy.get('[data-testid="permissions-list"]').should('be.visible');
      cy.get('[data-testid="permission-item"]').should('have.length.greaterThan', 0);
    });

    it('should display users with role', () => {
      cy.get('[data-testid="role-card"]').first().click();
      cy.get('[data-testid="users-assigned"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should pass accessibility checks', () => {
      cy.checkAccessibility();
    });
  });
});
