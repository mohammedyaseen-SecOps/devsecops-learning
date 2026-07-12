describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
  });

  describe('Dashboard Overview', () => {
    it('should load dashboard successfully', () => {
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="dashboard-header"]').should('be.visible');
    });

    it('should display all stat cards', () => {
      cy.get('[data-testid="stat-card"]').should('have.length', 4);
      cy.get('[data-testid="stat-card-risks"]').should('be.visible');
      cy.get('[data-testid="stat-card-compliance"]').should('be.visible');
      cy.get('[data-testid="stat-card-incidents"]').should('be.visible');
      cy.get('[data-testid="stat-card-audits"]').should('be.visible');
    });

    it('should display correct stat values', () => {
      cy.get('[data-testid="stat-card-risks"] [data-testid="stat-value"]').should('contain', '24');
      cy.get('[data-testid="stat-card-compliance"] [data-testid="stat-value"]').should('contain', '12');
      cy.get('[data-testid="stat-card-incidents"] [data-testid="stat-value"]').should('contain', '5');
      cy.get('[data-testid="stat-card-audits"] [data-testid="stat-value"]').should('contain', '18');
    });

    it('should display recent activity feed', () => {
      cy.get('[data-testid="activity-feed"]').should('be.visible');
      cy.get('[data-testid="activity-item"]').should('have.length.greaterThan', 0);
    });

    it('should display quick action buttons', () => {
      cy.get('[data-testid="quick-actions"]').should('be.visible');
      cy.get('[data-testid="quick-action-btn"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Sidebar Navigation', () => {
    it('should display all navigation items', () => {
      cy.get('[data-testid="sidebar"]').should('be.visible');
      cy.get('[data-testid="nav-risks"]').should('be.visible');
      cy.get('[data-testid="nav-compliance"]').should('be.visible');
      cy.get('[data-testid="nav-incidents"]').should('be.visible');
      cy.get('[data-testid="nav-users"]').should('be.visible');
      cy.get('[data-testid="nav-roles"]').should('be.visible');
      cy.get('[data-testid="nav-tenants"]').should('be.visible');
    });

    it('should highlight active navigation item', () => {
      cy.get('[data-testid="nav-dashboard"]').should('have.class', 'active');
      cy.get('[data-testid="nav-risks"]').click();
      cy.get('[data-testid="nav-risks"]').should('have.class', 'active');
    });

    it('should collapse and expand sidebar', () => {
      cy.get('[data-testid="sidebar-toggle"]').click();
      cy.get('[data-testid="sidebar"]').should('have.class', 'collapsed');
      cy.get('[data-testid="sidebar-toggle"]').click();
      cy.get('[data-testid="sidebar"]').should('not.have.class', 'collapsed');
    });
  });

  describe('Header Features', () => {
    it('should display search bar', () => {
      cy.get('[data-testid="header-search"]').should('be.visible');
    });

    it('should display notification bell', () => {
      cy.get('[data-testid="notifications-bell"]').should('be.visible');
    });

    it('should display theme toggle', () => {
      cy.get('[data-testid="theme-toggle"]').should('be.visible');
    });

    it('should display user profile menu', () => {
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('should show notification count badge', () => {
      cy.get('[data-testid="notifications-badge"]').should('contain', 0);
    });

    it('should open notifications panel', () => {
      cy.get('[data-testid="notifications-bell"]').click();
      cy.get('[data-testid="notifications-panel"]').should('be.visible');
    });

    it('should toggle theme', () => {
      const isDark = () =>
        cy.get('html').should((html) => {
          expect(html.attr('class')).to.include('dark');
        });

      cy.get('[data-testid="theme-toggle"]').click();
      isDark();
      cy.get('[data-testid="theme-toggle"]').click();
    });
  });

  describe('Module Navigation', () => {
    it('should navigate to risks module', () => {
      cy.navigateToModule('risks');
      cy.url().should('include', '/dashboard/risks');
      cy.get('[data-testid="risks-header"]').should('be.visible');
    });

    it('should navigate to compliance module', () => {
      cy.navigateToModule('compliance');
      cy.url().should('include', '/dashboard/compliance');
      cy.get('[data-testid="compliance-header"]').should('be.visible');
    });

    it('should navigate to incidents module', () => {
      cy.navigateToModule('incidents');
      cy.url().should('include', '/dashboard/incidents');
      cy.get('[data-testid="incidents-header"]').should('be.visible');
    });

    it('should navigate to users module', () => {
      cy.navigateToModule('users');
      cy.url().should('include', '/dashboard/users');
      cy.get('[data-testid="users-header"]').should('be.visible');
    });

    it('should navigate to roles module', () => {
      cy.navigateToModule('roles');
      cy.url().should('include', '/dashboard/roles');
      cy.get('[data-testid="roles-header"]').should('be.visible');
    });

    it('should navigate to tenants module', () => {
      cy.navigateToModule('tenants');
      cy.url().should('include', '/dashboard/tenants');
      cy.get('[data-testid="tenants-header"]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="sidebar"]').should('not.be.visible');
      cy.get('[data-testid="sidebar-toggle"]').should('be.visible');
      cy.get('[data-testid="stat-card"]').should('be.visible');
    });

    it('should be responsive on tablet', () => {
      cy.viewport('ipad-2');
      cy.get('[data-testid="dashboard-header"]').should('be.visible');
      cy.get('[data-testid="stat-card"]').should('be.visible');
    });

    it('should be responsive on desktop', () => {
      cy.viewport('macbook-15');
      cy.get('[data-testid="sidebar"]').should('be.visible');
      cy.get('[data-testid="dashboard-header"]').should('be.visible');
    });
  });

  describe('Performance', () => {
    it('should load dashboard within acceptable time', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="dashboard-header"]', { timeout: 5000 }).should('be.visible');
    });

    it('should not have console errors', () => {
      let consoleErrors = [];
      cy.window().then((win) => {
        cy.spy(win.console, 'error');
      });
      cy.get('[data-testid="stat-card"]').then(() => {
        cy.window().then((win) => {
          expect((win.console.error as any).callCount).to.equal(0);
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should pass accessibility checks', () => {
      cy.checkAccessibility();
    });

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1);
      cy.get('h2').should('have.length.greaterThan', 0);
    });

    it('should have proper color contrast', () => {
      cy.get('[data-testid="stat-card"]').each(($card) => {
        cy.wrap($card).should('have.css', 'color');
      });
    });
  });

  describe('User Profile Menu', () => {
    it('should display user profile menu options', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="profile-option"]').should('be.visible');
      cy.get('[data-testid="settings-option"]').should('be.visible');
      cy.get('[data-testid="logout-btn"]').should('be.visible');
    });

    it('should navigate to profile page', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="profile-option"]').click();
      cy.url().should('include', '/dashboard/profile');
    });

    it('should navigate to settings page', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="settings-option"]').click();
      cy.url().should('include', '/dashboard/settings');
    });

    it('should logout user', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-btn"]').click();
      cy.url({ timeout: 10000 }).should('include', '/auth/login');
    });
  });
});
