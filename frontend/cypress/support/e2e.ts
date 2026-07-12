import 'cypress-axe';

// Disable uncaught exception handling for development
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  if (
    err.message.includes('ResizeObserver loop limit exceeded') ||
    err.message.includes('Non-Error promise rejection detected')
  ) {
    return false;
  }
  return true;
});

// Global test timeout
Cypress.config('defaultCommandTimeout', 10000);

// Configure chai assertions
chai.config.truncateThreshold = 0;
