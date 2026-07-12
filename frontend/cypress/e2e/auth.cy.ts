describe('Authentication Flow E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  describe('Login Tests', () => {
    it('should display login page with all required fields', () => {
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      cy.contains('Forgot password?').should('be.visible');
      cy.contains('Create account').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[type="email"]').type(users.invalidCredentials.email);
        cy.get('input[type="password"]').type(users.invalidCredentials.password);
        cy.get('button[type="submit"]').click();
        cy.contains('Invalid credentials', { timeout: 5000 }).should('be.visible');
      });
    });

    it('should display validation error for empty email', () => {
      cy.get('input[type="password"]').type('Password123');
      cy.get('button[type="submit"]').click();
      cy.contains('Email is required', { timeout: 5000 }).should('be.visible');
    });

    it('should display validation error for empty password', () => {
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('button[type="submit"]').click();
      cy.contains('Password is required', { timeout: 5000 }).should('be.visible');
    });

    it('should successfully login with valid credentials', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[type="email"]').type(users.validUser.email);
        cy.get('input[type="password"]').type(users.validUser.password);
        cy.get('button[type="submit"]').click();
        
        // Should redirect to dashboard
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
        cy.get('[data-testid="dashboard-header"]', { timeout: 5000 }).should('be.visible');
      });
    });

    it('should show loading state while logging in', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[type="email"]').type(users.validUser.email);
        cy.get('input[type="password"]').type(users.validUser.password);
        cy.get('button[type="submit"]').click();
        
        // Button should show loading state
        cy.get('button[type="submit"]').should('have.attr', 'disabled');
      });
    });

    it('should persist authentication token in localStorage', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[type="email"]').type(users.validUser.email);
        cy.get('input[type="password"]').type(users.validUser.password);
        cy.get('button[type="submit"]').click();
        
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
        cy.window().then((win) => {
          expect(win.localStorage.getItem('accessToken')).to.exist;
          expect(win.localStorage.getItem('user')).to.exist;
        });
      });
    });
  });

  describe('Signup Tests', () => {
    beforeEach(() => {
      cy.visit('/auth/signup');
    });

    it('should display signup form with all fields', () => {
      cy.get('input[id*="firstName"]').should('be.visible');
      cy.get('input[id*="lastName"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[id*="password"]:not([id*="confirm"])').should('be.visible');
      cy.get('input[id*="confirmPassword"]').should('be.visible');
      cy.get('input[type="checkbox"]').should('be.visible');
    });

    it('should show validation error for weak password', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[id*="firstName"]').type(users.newUser.firstName);
        cy.get('input[id*="lastName"]').type(users.newUser.lastName);
        cy.get('input[type="email"]').type(users.newUser.email);
        
        // Type weak password
        cy.get('input[id*="password"]:not([id*="confirm"])').type('weak');
        cy.get('button[type="submit"]').click();
        
        cy.contains('Password must be at least 8 characters', { timeout: 5000 }).should('be.visible');
      });
    });

    it('should show error when passwords do not match', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[id*="firstName"]').type(users.newUser.firstName);
        cy.get('input[id*="lastName"]').type(users.newUser.lastName);
        cy.get('input[type="email"]').type(users.newUser.email);
        cy.get('input[id*="password"]:not([id*="confirm"])').type(users.newUser.password);
        cy.get('input[id*="confirmPassword"]').type('DifferentPass@123');
        
        cy.get('button[type="submit"]').click();
        cy.contains('Passwords do not match', { timeout: 5000 }).should('be.visible');
      });
    });

    it('should navigate to email verification after signup', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[id*="firstName"]').type(users.newUser.firstName);
        cy.get('input[id*="lastName"]').type(users.newUser.lastName);
        cy.get('input[type="email"]').type(users.newUser.email);
        cy.get('input[id*="password"]:not([id*="confirm"])').type(users.newUser.password);
        cy.get('input[id*="confirmPassword"]').type(users.newUser.password);
        cy.get('input[type="checkbox"]').check();
        
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should('include', '/auth/email-verification');
      });
    });

    it('should have link to login page', () => {
      cy.contains('Already have an account?').should('be.visible');
      cy.contains('a', 'Sign in').click();
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Forgot Password Tests', () => {
    beforeEach(() => {
      cy.visit('/auth/forgot-password');
    });

    it('should display forgot password form', () => {
      cy.get('input[type="email"]').should('be.visible');
      cy.contains('button', 'Send Reset Link').should('be.visible');
    });

    it('should send reset link and show confirmation', () => {
      cy.fixture('users').then((users) => {
        cy.get('input[type="email"]').type(users.validUser.email);
        cy.get('button[type="submit"]').click();
        
        cy.contains('Check your email', { timeout: 5000 }).should('be.visible');
        cy.contains('We have sent a password reset link').should('be.visible');
      });
    });

    it('should have link back to login', () => {
      cy.contains('a', 'Back to Login').click();
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Email Verification Tests', () => {
    beforeEach(() => {
      cy.visit('/auth/email-verification');
    });

    it('should display 6-digit code input', () => {
      cy.get('input[placeholder*="Enter code"]').should('be.visible');
      cy.contains('Resend code').should('be.visible');
    });

    it('should verify email with valid code', () => {
      cy.get('input[placeholder*="Enter code"]').type('123456');
      cy.get('button[type="submit"]').click();
      
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });

    it('should show error for invalid code', () => {
      cy.get('input[placeholder*="Enter code"]').type('000000');
      cy.get('button[type="submit"]').click();
      
      cy.contains('Invalid verification code', { timeout: 5000 }).should('be.visible');
    });

    it('should allow resending verification code', () => {
      cy.contains('button', 'Resend code').click();
      cy.contains('Code sent to your email', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Session Management Tests', () => {
    it('should redirect to login when accessing protected route without token', () => {
      cy.visit('/dashboard');
      cy.url({ timeout: 10000 }).should('include', '/auth/login');
    });

    it('should maintain session after page reload', () => {
      cy.fixture('users').then((users) => {
        cy.visit('/auth/login');
        cy.get('input[type="email"]').type(users.validUser.email);
        cy.get('input[type="password"]').type(users.validUser.password);
        cy.get('button[type="submit"]').click();
        
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
        cy.reload();
        
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
        cy.get('[data-testid="dashboard-header"]', { timeout: 5000 }).should('be.visible');
      });
    });

    it('should logout successfully', () => {
      cy.fixture('users').then((users) => {
        cy.login(users.validUser.email, users.validUser.password);
        
        cy.get('[data-testid="user-menu"]').click();
        cy.get('[data-testid="logout-btn"]').click();
        
        cy.url({ timeout: 10000 }).should('include', '/auth/login');
        cy.window().then((win) => {
          expect(win.localStorage.getItem('accessToken')).to.be.null;
        });
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('should pass accessibility checks on login page', () => {
      cy.checkAccessibility();
    });

    it('should be keyboard navigable', () => {
      cy.get('input[type="email"]').focus();
      cy.focused().should('have.attr', 'type', 'email');
      
      cy.tab();
      cy.focused().should('have.attr', 'type', 'password');
      
      cy.tab();
      cy.focused().should('have.attr', 'type', 'submit');
    });

    it('should have proper ARIA labels', () => {
      cy.get('input[type="email"]').should('have.attr', 'aria-label').or('have.attr', 'id');
      cy.get('input[type="password"]').should('have.attr', 'aria-label').or('have.attr', 'id');
    });
  });
});
