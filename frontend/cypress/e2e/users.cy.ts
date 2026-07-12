describe('Users Management E2E Tests', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
      cy.navigateToModule('users');
    });
  });

  describe('Users List', () => {
    it('should display users list page', () => {
      cy.url().should('include', '/dashboard/users');
      cy.get('[data-testid="users-header"]').should('be.visible');
    });

    it('should display users table with all columns', () => {
      cy.get('[data-testid="users-table"]').should('be.visible');
      cy.get('[data-testid="table-header-name"]').should('be.visible');
      cy.get('[data-testid="table-header-email"]').should('be.visible');
      cy.get('[data-testid="table-header-role"]').should('be.visible');
      cy.get('[data-testid="table-header-status"]').should('be.visible');
      cy.get('[data-testid="table-header-created"]').should('be.visible');
      cy.get('[data-testid="table-header-actions"]').should('be.visible');
    });

    it('should display user rows', () => {
      cy.get('[data-testid="user-row"]').should('have.length.greaterThan', 0);
    });

    it('should display create user button', () => {
      cy.get('[data-testid="create-user-btn"]').should('be.visible');
    });

    it('should have pagination controls', () => {
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-prev"]').should('exist');
      cy.get('[data-testid="pagination-next"]').should('exist');
    });

    it('should display correct status badges', () => {
      cy.get('[data-testid="user-row"]').first().within(() => {
        cy.get('[data-testid="status-badge"]').should('exist');
      });
    });
  });

  describe('Create User', () => {
    it('should open create user modal', () => {
      cy.get('[data-testid="create-user-btn"]').click();
      cy.get('[data-testid="create-user-modal"]').should('be.visible');
    });

    it('should display all required form fields', () => {
      cy.get('[data-testid="create-user-btn"]').click();
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('input[id*="firstName"]').should('be.visible');
        cy.get('input[id*="lastName"]').should('be.visible');
        cy.get('input[type="email"]').should('be.visible');
        cy.get('select[id*="role"]').should('be.visible');
      });
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="create-user-btn"]').click();
      cy.get('[data-testid="modal-submit"]').click();
      cy.contains('First name is required', { timeout: 5000 }).should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('[data-testid="create-user-btn"]').click();
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('input[id*="firstName"]').type('John');
        cy.get('input[id*="lastName"]').type('Doe');
        cy.get('input[type="email"]').type('invalid-email');
        cy.get('[data-testid="modal-submit"]').click();
      });
      cy.contains('Invalid email format', { timeout: 5000 }).should('be.visible');
    });

    it('should successfully create a new user', () => {
      cy.fixture('test-data').then((data) => {
        cy.get('[data-testid="create-user-btn"]').click();
        cy.get('[data-testid="modal"]').within(() => {
          cy.get('input[id*="firstName"]').type('Jane');
          cy.get('input[id*="lastName"]').type('Smith');
          cy.get('input[type="email"]').type('jane.smith@example.com');
          cy.get('select[id*="role"]').select('Analyst');
          cy.get('[data-testid="modal-submit"]').click();
        });
        
        cy.get('[data-testid="modal"]').should('not.exist');
        cy.contains('User created successfully', { timeout: 5000 }).should('be.visible');
        cy.get('[data-testid="user-row"]').should('contain', 'jane.smith@example.com');
      });
    });

    it('should close modal on cancel', () => {
      cy.get('[data-testid="create-user-btn"]').click();
      cy.get('[data-testid="modal"]').should('be.visible');
      cy.get('[data-testid="modal-cancel"]').click();
      cy.get('[data-testid="modal"]').should('not.exist');
    });
  });

  describe('Edit User', () => {
    it('should open edit user modal', () => {
      cy.get('[data-testid="user-row"]').first().within(() => {
        cy.get('[data-testid="edit-btn"]').click();
      });
      cy.get('[data-testid="edit-user-modal"]').should('be.visible');
    });

    it('should populate form with user data', () => {
      cy.get('[data-testid="user-row"]').first().within(() => {
        cy.get('td').eq(0).invoke('text').then((userName) => {
          cy.get('[data-testid="edit-btn"]').click();
          cy.get('[data-testid="modal"]').within(() => {
            cy.get('input[id*="firstName"]').should('have.value', userName.split(' ')[0]);
          });
        });
      });
    });

    it('should update user successfully', () => {
      cy.get('[data-testid="user-row"]').first().within(() => {
        cy.get('[data-testid="edit-btn"]').click();
      });
      
      cy.get('[data-testid="modal"]').within(() => {
        cy.get('select[id*="role"]').select('Viewer');
        cy.get('[data-testid="modal-submit"]').click();
      });
      
      cy.get('[data-testid="modal"]').should('not.exist');
      cy.contains('User updated successfully', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Delete User', () => {
    it('should open delete confirmation', () => {
      cy.get('[data-testid="user-row"]').first().within(() => {
        cy.get('[data-testid="delete-btn"]').click();
      });
      cy.get('[data-testid="delete-confirmation"]').should('be.visible');
    });

    it('should display confirmation message', () => {
      cy.get('[data-testid="user-row"]').first().within(() => {
        cy.get('[data-testid="delete-btn"]').click();
      });
      cy.get('[data-testid="delete-confirmation"]').within(() => {
        cy.contains('Are you sure you want to delete this user?').should('be.visible');
      });
    });

    it('should cancel delete operation', () => {
      cy.get('[data-testid="user-row"]').first().within(() => {
        cy.get('[data-testid="delete-btn"]').click();
      });
      cy.get('[data-testid="delete-confirmation-cancel"]').click();
      cy.get('[data-testid="delete-confirmation"]').should('not.exist');
    });

    it('should delete user successfully', () => {
      const userEmail = 'test@example.com';
      cy.get('[data-testid="user-row"]').first().within(() => {
        cy.get('td').eq(1).invoke('text').then((email) => {
          cy.get('[data-testid="delete-btn"]').click();
        });
      });
      
      cy.get('[data-testid="delete-confirmation-delete"]').click();
      cy.contains('User deleted successfully', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('User Filtering & Search', () => {
    it('should filter users by role', () => {
      cy.get('[data-testid="role-filter"]').select('Admin');
      cy.get('[data-testid="user-row"]').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-testid="role-cell"]').should('contain', 'Admin');
        });
      });
    });

    it('should filter users by status', () => {
      cy.get('[data-testid="status-filter"]').select('Active');
      cy.get('[data-testid="user-row"]').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-testid="status-badge"]').should('contain', 'Active');
        });
      });
    });

    it('should search users by name', () => {
      cy.get('[data-testid="search-input"]').type('John');
      cy.get('[data-testid="user-row"]').each(($row) => {
        cy.wrap($row).should('contain', 'John');
      });
    });

    it('should search users by email', () => {
      cy.get('[data-testid="search-input"]').type('admin@example.com');
      cy.get('[data-testid="user-row"]').should('contain', 'admin@example.com');
    });

    it('should reset filters', () => {
      cy.get('[data-testid="role-filter"]').select('Admin');
      cy.get('[data-testid="reset-filters"]').click();
      cy.get('[data-testid="role-filter"]').should('have.value', '');
    });

    it('should show no results message', () => {
      cy.get('[data-testid="search-input"]').type('nonexistentuser123456xyz');
      cy.contains('No users found', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Bulk Actions', () => {
    it('should select multiple users', () => {
      cy.get('[data-testid="select-all-checkbox"]').click();
      cy.get('[data-testid="user-row-checkbox"]').should('all', 'be.checked');
    });

    it('should show bulk action toolbar', () => {
      cy.get('[data-testid="select-all-checkbox"]').click();
      cy.get('[data-testid="bulk-actions-toolbar"]').should('be.visible');
    });

    it('should perform bulk role assignment', () => {
      cy.get('[data-testid="user-row-checkbox"]').first().click();
      cy.get('[data-testid="bulk-actions-toolbar"]').within(() => {
        cy.get('[data-testid="bulk-assign-role"]').click();
      });
      cy.get('[data-testid="bulk-action-modal"]').within(() => {
        cy.get('select[id*="role"]').select('Viewer');
        cy.get('[data-testid="modal-submit"]').click();
      });
      cy.contains('Users updated successfully', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should display table on desktop', () => {
      cy.viewport('macbook-15');
      cy.get('[data-testid="users-table"]').should('be.visible');
    });

    it('should display cards on tablet', () => {
      cy.viewport('ipad-2');
      cy.get('[data-testid="user-card"]').should('have.length.greaterThan', 0);
    });

    it('should display cards on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="user-card"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Accessibility', () => {
    it('should pass accessibility checks', () => {
      cy.checkAccessibility();
    });

    it('should have proper table headers', () => {
      cy.get('[data-testid="users-table"]').within(() => {
        cy.get('thead th').should('have.length', 6);
      });
    });

    it('should have keyboard navigation', () => {
      cy.get('[data-testid="create-user-btn"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'create-user-btn');
    });
  });
});
