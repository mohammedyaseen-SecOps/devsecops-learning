/**
 * Jest setup file
 * Runs before all tests
 */

// Mock console methods to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock Sequelize globally
jest.mock('sequelize', () => {
  const actual = jest.requireActual('sequelize');
  return {
    ...actual,
    Sequelize: class {
      constructor() {}
    },
  };
});
