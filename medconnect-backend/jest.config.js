// medconnect-backend/jest.config.js
module.exports = {
  testEnvironment: 'node',

  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // Redirige cualquier require de prismaClient al mock
  moduleNameMapper: {
    '.*prismaClient.*': '<rootDir>/src/__mocks__/prismaClient.js'
  },

  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/services/**/*.js',
    'src/middleware/**/*.js',
    '!src/**/*.test.js'
  ],

  coverageThreshold: {
    global: {
      lines: 60,
      functions: 60,
      branches: 60,
      statements: 60
    }
  },

  coverageReporters: ['text-summary', 'lcov', 'html'],
  coverageDirectory: 'coverage/',

  testEnvironmentOptions: {
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret-medconnect-2026',
      JWT_EXPIRES_IN: '24h'
    }
  },

  testTimeout: 10000
};
