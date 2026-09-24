# Changelog

## 0.0.2 — 2026-09-24

### Fixed

- **`npm test` runs.** It never had: `jest.config.js` named
  `<rootDir>/src/__tests__/helpers/globalSetup.ts`, a file that has never existed
  here, and jest refuses to start over a missing global setup — so the command
  failed at config validation, before looking for a test. `passWithNoTests` comes
  with the removal, because `src/__tests__/` is empty and a green *no tests found*
  is the honest answer for a package with no implementation yet. The comment says
  to drop the flag together with the first test.

- **Three settings that belonged to a different repository are gone** —
  `maxWorkers: 1`, `maxConcurrency: 1`, `testTimeout: 15 * 60 * 1000`. They arrived
  with the missing global setup, from a repository whose tests share objects in one
  ABAP system, where a lock-and-activate round takes minutes and two workers
  collide. This package renders Markdown: serialising its suite would only make it
  slower, and a fifteen-minute ceiling turns a hung test into a fifteen-minute wait
  with no test named and no stack, where jest's five-second default says which test
  and where.

  `**/integration/**` stays in `testMatch`: it matches nothing yet, but it
  describes where such tests go.

### Licence

- **`GPL-3.0-only`, replacing MIT.** This package has never been published — npm
  knows no version of it — so no MIT grant was ever given to anyone, and the
  change needed no release number of its own; it travels with the fixes above.
  `calm-server` had to go from 0.7.0 to 0.8.0 for exactly the opposite reason: it
  had already shipped under MIT and that grant cannot be withdrawn.

  **Why the GPL and not the LGPL.** Linking is the distinction. `interfaces-*`,
  `adt-clients`, `calm-client`, `auth-*` and `header-validator` are libraries: you
  import them, and the LGPL exists so that importing puts no obligation on your
  program. This is a server you run — the same shape as `mcp-abap-adt-proxy`
  (`GPL-3.0-only` since its 3.0.0) and `mcp-calm-server` (since 0.8.0).

  `LICENSE` carries the full GPL-3.0 text and is already named in `files`. No
  separate `COPYING`: that pairing belongs to the LGPL packages.

  It was missed in the relicensing pass of 2026-09-03, which moved fifteen
  repositories off MIT.

## 0.0.1 — planning scaffold

- Project scaffolded: package.json, tsconfig, biome, jest, LICENSE, .gitignore.
- PLAN.md drafted: domain-neutral primitives + renderers, MCP tool
  surface (~15 tools), architecture, milestones, and open decisions.
- No implementation code yet.
