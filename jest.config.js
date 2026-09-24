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
  // Nothing else is set on purpose. `maxWorkers: 1`, `maxConcurrency: 1` and a
  // fifteen-minute `testTimeout` came from the same SAP repository as the missing
  // global setup: there, tests share objects in one ABAP system and a single
  // lock-and-activate round can genuinely take minutes, so they must not run in
  // parallel. This package renders Markdown. Serialising it would only make its
  // suite slower, and a fifteen-minute ceiling would turn a hung test into a
  // fifteen-minute wait with no name and no stack — jest's 5s default reports it
  // as an ordinary timeout instead.
};
