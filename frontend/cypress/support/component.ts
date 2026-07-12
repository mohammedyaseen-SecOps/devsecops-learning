import 'cypress-axe';

// Support file for component testing
Cypress.on('uncaught:exception', (err, runnable) => {
  if (
    err.message.includes('ResizeObserver loop limit exceeded') ||
    err.message.includes('Non-Error promise rejection detected')
  ) {
    return false;
  }
  return true;
});
