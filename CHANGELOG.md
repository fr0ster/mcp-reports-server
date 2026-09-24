# Changelog

## Unreleased

### Licence

- **`GPL-3.0-only`, replacing MIT, and the version does not move.** This package
  has never been published — npm knows no version of it — so no MIT grant was ever
  given to anyone, and there is nothing that needs a new release number to correct.
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
