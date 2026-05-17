// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/api/**/*.test.ts?(x)',
    '**/__tests__/integration/**/*.test.ts?(x)',
    '**/__tests__/lib/cors.test.ts?(x)',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(zustand|react-day-picker|uuid)/)',
  ],
};

module.exports = createJestConfig(customJestConfig);
