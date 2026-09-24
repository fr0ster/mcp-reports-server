module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/unit/**/*.test.ts', '**/integration/**/*.test.ts'],
  // No `globalSetup`: this config named `src/__tests__/helpers/globalSetup.ts`,
  // which has never existed here, and jest refuses to start over a missing one —
  // so `npm test` failed before looking for a test. The setting was copied from a
  // repository whose global setup opens a SAP connection; nothing here needs one.
  //
  // `passWithNoTests` because `src/__tests__/` is empty: this package is a
  // planning scaffold, and a green "no tests" is the honest answer until the first
  // one lands. Remove the flag with that test, so an empty suite starts failing
  // again the moment there is something to run.
  passWithNoTests: true,
  maxWorkers: 1,
  maxConcurrency: 1,
  testTimeout: 15 * 60 * 1000,
};
