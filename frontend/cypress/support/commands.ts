// Custom Cypress commands for GRC Platform

/**
 * Log in a user with email and password
 * @param email - User email
 * @param password - User password
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

/**
 * Log out the current user
 */
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-btn"]').click();
  cy.url().should('include', '/auth/login');
});

/**
 * Navigate to a dashboard module
 * @param module - Module name (risks, compliance, incidents, users, roles, tenants)
 */
Cypress.Commands.add('navigateToModule', (module: string) => {
  cy.get(`[data-testid="nav-${module}"]`).click();
  cy.url().should('include', `/dashboard/${module}`);
});

/**
 * Create a new item in a module
 * @param formData - Object with form field values
 */
Cypress.Commands.add('createItem', (formData: Record<string, string>) => {
  cy.get('[data-testid="create-btn"]').click();
  cy.get('[data-testid="modal"]').should('be.visible');
  
  Object.entries(formData).forEach(([key, value]) => {
    cy.get(`input[id="${key}"], textarea[id="${key}"], select[id="${key}"]`).type(value);
  });
  
  cy.get('[data-testid="modal-submit"]').click();
  cy.get('[data-testid="modal"]').should('not.exist');
});

/**
 * Check for accessibility violations with axe
 */
Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y();
});

/**
 * Wait for loading spinner to appear and disappear
 */
Cypress.Commands.add('waitForLoadingComplete', () => {
  cy.get('[data-testid="loading-spinner"]', { timeout: 5000 }).should('exist');
  cy.get('[data-testid="loading-spinner"]', { timeout: 10000 }).should('not.exist');
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      navigateToModule(module: string): Chainable<void>;
      createItem(formData: Record<string, string>): Chainable<void>;
      checkAccessibility(): Chainable<void>;
      waitForLoadingComplete(): Chainable<void>;
    }
  }
}

export {};
