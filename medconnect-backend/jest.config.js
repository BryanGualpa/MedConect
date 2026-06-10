// medconnect-backend/jest.config.js
// Ref: Laboratorio de Pruebas Unitarias — Sección 4.2
module.exports = {
  // Entorno Node.js para pruebas de backend (no requiere DOM)
  testEnvironment: 'node',

  // Patrón de búsqueda de archivos de prueba
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // Cobertura de código (jest --coverage)
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/services/**/*.js',
    'src/middleware/**/*.js',
    '!src/**/*.test.js'
  ],

  // Umbrales mínimos — rompe el CI si no se cumplen (SRS RNF-06: 60%)
  coverageThreshold: {
    global: {
      lines: 60,
      functions: 60,
      branches: 60,
      statements: 60
    }
  },

  // Formato del reporte de cobertura
  coverageReporters: ['text-summary', 'lcov', 'html'],
  coverageDirectory: 'coverage/',

  // Variables de entorno para pruebas
  testEnvironmentOptions: {
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret-medconnect-2026',
      JWT_EXPIRES_IN: '24h'
    }
  },

  // Tiempo máximo por prueba (ms)
  testTimeout: 10000
};
