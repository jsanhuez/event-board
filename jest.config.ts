import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // run each project separately so that packages remain independent
  projects: [
    '<rootDir>/packages/backend/eb-api-gateway/jest.config.ts',
    '<rootDir>/packages/backend/eb-api-events/jest.config.ts',
    '<rootDir>/packages/backend/eb-api-users/jest.config.ts',
    '<rootDir>/packages/frontend/eb-web-app/jest.config.ts',
    '<rootDir>/packages/frontend/eb-web-app-events/jest.config.ts',
    '<rootDir>/packages/frontend/eb-web-app-users/jest.config.ts',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};

export default config;
