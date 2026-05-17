// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '__tests__/api/',
    '__tests__/integration/',
    '__tests__/lib/cors.test.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(zustand|react-day-picker|uuid)/)',
  ],
};

module.exports = createJestConfig(customJestConfig);
