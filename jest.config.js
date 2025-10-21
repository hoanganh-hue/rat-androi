/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.env-boot.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  testMatch: [
    '**/server/tests/integration/**/*.test.ts',
    '**/server/tests/middleware/**/*.test.ts',
    '**/server/tests/models/**/*.test.ts',
  ],
  collectCoverageFrom: [
    'server/**/*.ts',
    '!server/tests/**',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // No hard thresholds: integration tests validate behavior against real data
};
