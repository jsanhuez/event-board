import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/*.integration-spec.ts'],
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  coverageDirectory: '<rootDir>/coverage',
};

export default config;
