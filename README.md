# @mcp-abap-adt/reports-server

[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://stand-with-ukraine.pp.ua)

**Domain-neutral** MCP server + reusable library of report-building
primitives: group-by, pivot, join, aggregate, and render (CSV / Markdown
/ HTML). Operates on generic tabular JSON — not coupled to Cloud ALM,
ADT, Jira, or any other data source.

An LLM orchestrator chains data-fetching tools (from
[`calm-server`](https://github.com/fr0ster/mcp-calm-server), ADT tools,
or anywhere else) with primitives and renderers from this package to
produce business reports on demand.

This package is **dual-purpose**:

- **Runnable stdio server** — `npx reports-mcp`.
- **Reusable library of primitives** — other MCP servers import
  `PRIMITIVES`, `RENDERERS`, or individual tool primitives.

## Status

**Planning phase** — see [PLAN.md](PLAN.md) for the full development
roadmap, tool surface, architecture, and open decisions. No code yet;
scaffold only.

## License

`GPL-3.0-only` — see [LICENSE](LICENSE).

This is a server you run, not a library you link, which is why it carries the GPL where the contract and client packages in this family carry the LGPL. The GPL asks something of whoever distributes a modified server, not of whoever talks to one over stdio.
